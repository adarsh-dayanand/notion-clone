
"use client"

import { useState, type KeyboardEvent, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { X, Tag } from "lucide-react"
import type { OutputData } from "@editorjs/editorjs"
import { useAuthState } from "react-firebase-hooks/auth"
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import type { Note } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { auth, db } from "@/lib/firebase"


const Editor = dynamic(() => import("./editor"), {
  ssr: false,
  loading: () => (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  ),
});

interface NoteEditorProps {
    note: Note;
    onUpdate: (updatedFields: Partial<Note>) => void;
    onTagUpdate: (update: { add?: string, remove?: string }) => void;
    readOnly?: boolean;
}

function parseContent(content: string): OutputData {
  try {
    if (content) {
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn("Could not parse note content as Editor.js data.", error);
  }
  
  return {
    time: new Date().getTime(),
    blocks: [
      {
        id: 'initial-block',
        type: "paragraph",
        data: {
          text: content || "",
        },
      },
    ],
    version: "2.29.1",
  };
}

export function NoteEditor({ note, onUpdate, onTagUpdate, readOnly = false }: NoteEditorProps) {
  const [user] = useAuthState(auth);
  const [title, setTitle] = useState(note.title);
  const [tags, setTags] = useState(note.tags);
  const [tagInput, setTagInput] = useState("")
  const { toast } = useToast()
  
  const [editorData, setEditorData] = useState<OutputData>(() => parseContent(note.content));
  const [editorKey, setEditorKey] = useState(note.id);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let hasSynced = false;
    if (note.title !== title) {
      setTitle(note.title);
      hasSynced = true;
    }
    if (JSON.stringify(note.tags) !== JSON.stringify(tags)) {
      setTags(note.tags);
      hasSynced = true;
    }

    try {
      const localContentString = JSON.stringify(editorData);
      if (note.content && note.content !== localContentString) {
        setEditorData(parseContent(note.content));
        setEditorKey(`${note.id}-${new Date().getTime()}`);
        hasSynced = true;
      }
    } catch (e) {
      console.error("Error during note content sync:", e);
    }
    
    if (hasSynced) {
       toast({
        title: "Note updated",
        description: "Changes from a collaborator have been loaded.",
      });
    }

  }, [note]);

  useEffect(() => {
    if (readOnly) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const contentString = editorData ? JSON.stringify(editorData) : "{}";
      const updatedFields: Partial<Note> = {};
      
      if (title !== note.title) {
        updatedFields.title = title;
      }
      if (contentString !== note.content) {
        updatedFields.content = contentString;
      }

      if (Object.keys(updatedFields).length > 0) {
        onUpdate(updatedFields);

        if (user && note.permissions) {
          Object.keys(note.permissions).forEach(uid => {
              if (uid !== user.uid) {
                  addDoc(collection(db, 'notifications'), {
                      recipientId: uid,
                      senderId: user.uid,
                      senderProfile: {
                          displayName: user.displayName,
                          photoURL: user.photoURL,
                      },
                      noteId: note.id,
                      noteTitle: title,
                      type: 'update',
                      isRead: false,
                      createdAt: serverTimestamp(),
                  });
              }
          });
        }
      }
    }, 6000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, editorData, note, onUpdate, readOnly, user]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  
  const handleContentChange = (newData: OutputData) => {
    setEditorData(newData);
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value)
  }

  const handleTagInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault()
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        onTagUpdate({ add: newTag });
        setTagInput("")
        toast({
          title: "Tag added",
          description: `The tag "${newTag}" has been added to the note.`,
        })
      }
    }
    if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      const tagToRemove = tags[tags.length - 1];
      onTagUpdate({ remove: tagToRemove });
    }
  }

  const removeTag = (tagToRemove: string) => {
    if (readOnly) return;
    onTagUpdate({ remove: tagToRemove });
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-4">
        <Input
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title..."
          className="text-3xl md:text-4xl font-bold font-headline h-auto border-none focus-visible:ring-0 shadow-none p-0"
          disabled={readOnly}
        />
      </div>

      <div className="flex items-center gap-2 mt-4 mb-6">
        <Tag className="h-5 w-5 text-muted-foreground" />
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-sm">
              {tag}
              <button 
                onClick={() => removeTag(tag)} 
                className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5 disabled:cursor-not-allowed"
                disabled={readOnly}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Input
            value={tagInput}
            onChange={handleTagInputChange}
            onKeyDown={handleTagInputKeyDown}
            placeholder="Add a tag..."
            className="h-7 w-28 border-none focus-visible:ring-0 shadow-none p-0 bg-transparent"
            disabled={readOnly}
          />
        </div>
      </div>
      
      <Editor
        key={editorKey}
        holder={`editor-instance-${editorKey}`}
        onChange={handleContentChange}
        data={editorData}
        readOnly={readOnly}
      />
    </div>
  )
}
