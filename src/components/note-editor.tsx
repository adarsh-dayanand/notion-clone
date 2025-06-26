"use client"

import { useState, type KeyboardEvent } from "react"
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
}

export function NoteEditor({ note, onUpdate }: NoteEditorProps) {
  const [tagInput, setTagInput] = useState("")
  const { toast } = useToast()
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ title: e.target.value });
  };
  
  const handleContentChange = (newData: OutputData) => {
    onUpdate({ content: JSON.stringify(newData) });
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value)
  }

  const handleTagInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault()
      if (!note.tags.includes(tagInput.trim())) {
        const newTags = [...note.tags, tagInput.trim()];
        onUpdate({ tags: newTags });
        setTagInput("")
        toast({
          title: "Tag added",
          description: `The tag "${tagInput.trim()}" has been added to the note.`,
        })
      }
    }
    if (e.key === "Backspace" && tagInput === "" && note.tags.length > 0) {
      const newTags = note.tags.slice(0, -1)
      onUpdate({ tags: newTags });
    }
  }

  const removeTag = (tagToRemove: string) => {
    const newTags = note.tags.filter((tag) => tag !== tagToRemove);
    onUpdate({ tags: newTags });
  }

  let parsedContent: OutputData | undefined = undefined;
  try {
    if (note.content) {
      const parsed = JSON.parse(note.content);
      // Basic validation for Editor.js data
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
        parsedContent = parsed;
      }
    }
  } catch (error) {
    console.warn("Could not parse note content as Editor.js data.", error);
  }
  
  // Fallback for old markdown or invalid content
  if (!parsedContent) {
    parsedContent = {
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
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-4">
        <Input
          value={note.title}
          onChange={handleTitleChange}
          onBlur={() => onUpdate({ title: note.title })}
          placeholder="Note title..."
          className="text-3xl md:text-4xl font-bold font-headline h-auto border-none focus-visible:ring-0 shadow-none p-0"
        />
      </div>

      <div className="flex items-center gap-2 mt-4 mb-6">
        <Tag className="h-5 w-5 text-muted-foreground" />
        <div className="flex flex-wrap items-center gap-2">
          {note.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-sm">
              {tag}
              <button onClick={() => removeTag(tag)} className="ml-1.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
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
          />
        </div>
      </div>
      
      <Editor
        holder={`editor-instance-${note.id}`}
        onChange={handleContentChange}
        data={parsedContent}
      />
    </div>
  )
}
