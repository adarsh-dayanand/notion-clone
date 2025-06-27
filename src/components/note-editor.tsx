
"use client"

import { useState, type KeyboardEvent, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { X, Tag } from "lucide-react"
import type { OutputData } from "@editorjs/editorjs"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import type { Note } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

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
    readOnly?: boolean;
}

export function NoteEditor({ note, onUpdate, readOnly = false }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [tags, setTags] = useState(note.tags);
  const [content, setContent] = useState<OutputData | undefined>(() => {
    try {
      if (note.content) {
        const parsed = JSON.parse(note.content);
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
            text: note.content || "",
          },
        },
      ],
      version: "2.29.1",
    };
  });
  
  const [tagInput, setTagInput] = useState("")
  const { toast } = useToast()
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced auto-save effect
  useEffect(() => {
    if (readOnly) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const contentString = content ? JSON.stringify(content) : "{}";
      const updatedFields: Partial<Note> = {};
      
      if (title !== note.title) {
        updatedFields.title = title;
      }
      if (contentString !== note.content) {
        updatedFields.content = contentString;
      }
      if (JSON.stringify(tags) !== JSON.stringify(note.tags)) {
        updatedFields.tags = tags;
      }

      if (Object.keys(updatedFields).length > 0) {
        onUpdate(updatedFields);
      }
    }, 1000); // 1-second debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, content, tags, note, onUpdate, readOnly]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  
  const handleContentChange = (newData: OutputData) => {
    setContent(newData);
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value)
  }

  const handleTagInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault()
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
        setTagInput("")
        toast({
          title: "Tag added",
          description: `The tag "${newTag}" has been added to the note.`,
        })
      }
    }
    if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      const newTags = tags.slice(0, -1)
      setTags(newTags);
    }
  }

  const removeTag = (tagToRemove: string) => {
    if (readOnly) return;
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
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
        holder={`editor-instance-${note.id}`}
        onChange={handleContentChange}
        data={content}
        readOnly={readOnly}
      />
    </div>
  )
}
