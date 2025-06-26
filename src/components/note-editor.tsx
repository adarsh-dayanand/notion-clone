"use client"

import { useState, useRef, useEffect, type KeyboardEvent } from "react"
import { X, Tag } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { Note } from "@/app/page"

interface NoteEditorProps {
    note: Note;
    onUpdate: (note: Note) => void;
}

export function NoteEditor({ note, onUpdate }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tags, setTags] = useState(note.tags)
  const [tagInput, setTagInput] = useState("")
  const { toast } = useToast()
  
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags);
  }, [note]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    onUpdate({ ...note, title: e.target.value });
  };
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onUpdate({ ...note, content: newContent });
    if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
        textareaRef.current.style.height = `${e.target.scrollHeight}px`
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value)
  }

  const handleTagInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        const newTags = [...tags, tagInput.trim()];
        setTags(newTags)
        onUpdate({ ...note, tags: newTags });
        setTagInput("")
        toast({
          title: "Tag added",
          description: `The tag "${tagInput.trim()}" has been added to the note.`,
        })
      }
    }
    if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      const newTags = tags.slice(0, -1)
      setTags(newTags);
      onUpdate({ ...note, tags: newTags });
    }
  }

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags)
    onUpdate({ ...note, tags: newTags });
  }

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [content])

  return (
    <div className="max-w-4xl mx-auto">
      <Input
        value={title}
        onChange={handleTitleChange}
        className="text-3xl md:text-4xl font-bold font-headline h-auto border-none focus-visible:ring-0 shadow-none p-0"
      />

      <div className="flex items-center gap-2 mt-4 mb-6">
        <Tag className="h-5 w-5 text-muted-foreground" />
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
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

      <div className="prose prose-stone dark:prose-invert max-w-none">
        <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            placeholder="Start writing your note here..."
            className="w-full text-base border-none focus-visible:ring-0 shadow-none p-0 resize-none overflow-hidden min-h-[400px]"
        />
      </div>
    </div>
  )
}
