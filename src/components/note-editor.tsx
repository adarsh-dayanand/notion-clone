"use client"

import { useState, useRef, useEffect, type KeyboardEvent } from "react"
import { X, Tag } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function NoteEditor() {
  const [tags, setTags] = useState(["ProjectX", "High-Priority"])
  const [tagInput, setTagInput] = useState("")
  const { toast } = useToast()

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value)
  }

  const handleTagInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
        setTagInput("")
        toast({
          title: "Tag added",
          description: `The tag "${tagInput.trim()}" has been added to the note.`,
        })
      }
    }
    if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      const newTags = tags.slice(0, -1)
      setTags(newTags)
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [])
  
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
        textareaRef.current.style.height = `${e.target.scrollHeight}px`
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Input
        defaultValue="Project Phoenix Kick-off Meeting"
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
            onChange={handleTextareaChange}
            placeholder="Start writing your note here..."
            className="w-full text-base border-none focus-visible:ring-0 shadow-none p-0 resize-none overflow-hidden min-h-[400px]"
            defaultValue={`Team,

This document outlines the agenda and goals for our Project Phoenix kick-off meeting. Please review it beforehand.

### Agenda

1.  **Introductions (5 mins)** - Brief intros from all team members.
2.  **Project Overview (15 mins)** - High-level goals, scope, and expected outcomes.
3.  **Roles & Responsibilities (10 mins)** - Clarifying who owns what.
4.  **Timeline & Milestones (15 mins)** - Key dates and deliverables for Q3.
5.  **Q&A (10 mins)** - Open floor for questions.

### Pre-reading
-   [Project Brief](https://example.com)
-   [Market Analysis](https://example.com)

Looking forward to a productive session!`}
        />
      </div>
    </div>
  )
}
