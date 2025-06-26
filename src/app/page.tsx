
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  FileText,
  Home,
  BrainCircuit,
  PlusCircle,
  Settings,
  Users,
  Bell,
  Lock,
  Trash,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarProvider,
  SidebarFooter
} from "@/components/ui/sidebar"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { UserNav } from "@/components/user-nav"
import { NoteEditor } from "@/components/note-editor"
import { ShareDialog } from "@/components/share-dialog"
import { ManagePrivacyDialog } from "@/components/manage-privacy-dialog"
import { UnlockPrompt } from "@/components/unlock-prompt"
import { Button, buttonVariants } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"

export type Note = {
  id: number;
  title: string;
  content: string;
  tags: string[];
  isPrivate: boolean;
  password?: string;
};

const initialNotes: Note[] = [
  { id: 1, title: "Project Phoenix Kick-off", content: JSON.stringify({
      time: 1672531200000,
      blocks: [
        { id: "1", type: "paragraph", data: { text: "Team," } },
        { id: "2", type: "paragraph", data: { text: "This document outlines the agenda and goals for our Project Phoenix kick-off meeting. Please review it beforehand." } },
        { id: "3", type: "header", data: { text: "Agenda", level: 3 } },
        { id: "4", type: "list", data: { style: "ordered", items: [
          "<b>Introductions (5 mins)</b> - Brief intros from all team members.",
          "<b>Project Overview (15 mins)</b> - High-level goals, scope, and expected outcomes.",
          "<b>Roles & Responsibilities (10 mins)</b> - Clarifying who owns what.",
          "<b>Timeline & Milestones (15 mins)</b> - Key dates and deliverables for Q3.",
          "<b>Q&A (10 mins)</b> - Open floor for questions."
        ] } },
        { id: "5", type: "header", data: { text: "Pre-reading", level: 3 } },
        { id: "6", type: "list", data: { style: "unordered", items: [
          "<a href=\"https://example.com\">Project Brief</a>",
          "<a href=\"https://example.com\">Market Analysis</a>"
        ] } },
        { id: "7", type: "paragraph", data: { text: "Looking forward to a productive session!" } }
      ],
      version: "2.29.1"
    }), tags: ["ProjectX", "High-Priority"], isPrivate: false },
  { id: 2, title: "Q3 Marketing Strategy", content: JSON.stringify({
      time: 1672531200000,
      blocks: [{ id: "1", type: "paragraph", data: { text: "Marketing strategy content here." } }],
      version: "2.29.1"
    }), tags: ["Marketing"], isPrivate: false },
  { id: 3, title: "Engineering All-Hands", content: JSON.stringify({
      time: 1672531200000,
      blocks: [{ id: "1", type: "paragraph", data: { text: "Engineering all-hands content here." } }],
      version: "2.29.1"
    }), tags: ["Engineering"], isPrivate: false },
  { id: 4, title: "Design System Updates", content: JSON.stringify({
      time: 1672531200000,
      blocks: [{ id: "1", type: "paragraph", data: { text: "Design system updates content here." } }],
      version: "2.29.1"
    }), tags: ["Design"], isPrivate: true, password: "password123" },
]

export default function DashboardPage() {
  const pathname = usePathname()
  const { toast } = useToast()
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [selectedNoteId, setSelectedNoteId] = useState<number>(1)
  const [unlockedNoteIds, setUnlockedNoteIds] = useState<number[]>([])
  
  const selectedNote = notes.find((note) => note.id === selectedNoteId)!;
  const isNoteUnlocked = !selectedNote.isPrivate || unlockedNoteIds.includes(selectedNote.id);

  const handleNoteSelect = (id: number) => {
    setSelectedNoteId(id);
  }

  const handleSetPassword = (noteId: number, password: string) => {
    setNotes(notes.map(note => note.id === noteId ? { ...note, isPrivate: true, password: password } : note));
    setUnlockedNoteIds(unlockedNoteIds.filter(id => id !== noteId));
    toast({ title: "Note is now private", description: "The note has been secured with a password." });
  }
  
  const handleRemovePassword = (noteId: number) => {
    setNotes(notes.map(note => note.id === noteId ? { ...note, isPrivate: false, password: undefined } : note));
    setUnlockedNoteIds(unlockedNoteIds.filter(id => id !== noteId));
    toast({ title: "Privacy removed", description: "The note is no longer password protected." });
  }

  const handleUnlockNote = (noteId: number, passwordAttempt: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note && note.password === passwordAttempt) {
      setUnlockedNoteIds([...unlockedNoteIds, noteId]);
      toast({ title: "Note unlocked" });
    } else {
      toast({ title: "Incorrect password", variant: "destructive" });
    }
  }

  const handleUpdateNote = (updatedNote: Note) => {
    setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note));
  }

  const handleDeleteNote = (noteId: number) => {
    if (notes.length <= 1) {
      toast({
        title: "Cannot delete last note",
        description: "You must have at least one note.",
        variant: "destructive",
      });
      return;
    }

    const noteToDeleteIndex = notes.findIndex((note) => note.id === noteId);
    const newNotes = notes.filter((note) => note.id !== noteId);
    
    setNotes(newNotes);

    if (selectedNoteId === noteId) {
      const newIndex = Math.max(0, noteToDeleteIndex - 1);
      setSelectedNoteId(newNotes[newIndex].id);
    }
    
    toast({ title: "Note deleted" });
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="shrink-0">
              <BrainCircuit className="size-5 text-primary" />
            </Button>
            <h1 className="text-lg font-semibold font-headline">Memo</h1>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/" isActive={pathname === "/"}>
                <Home />
                Home
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/shared" isActive={pathname === "/shared"}>
                <Users />
                Shared with me
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Settings />
                Settings
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarSeparator />
          <div className="px-2 py-1 text-sm font-medium text-muted-foreground">Notes</div>
          <SidebarMenu>
            {notes.map((note) => (
              <SidebarMenuItem key={note.id}>
                <SidebarMenuButton onClick={() => handleNoteSelect(note.id)} isActive={note.id === selectedNoteId}>
                  {note.isPrivate ? <Lock className="h-4 w-4" /> : <FileText />}
                  {note.title}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2">
           <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <PlusCircle />
                New Note
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b">
          <div>
            {selectedNote && <p className="text-sm text-muted-foreground">Notes / {selectedNote.title}</p>}
          </div>
          <div className="flex items-center gap-4">
            <ManagePrivacyDialog 
              note={selectedNote}
              onSetPassword={handleSetPassword}
              onRemovePassword={handleRemovePassword}
            />
            <ShareDialog />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Trash className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your note.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className={buttonVariants({ variant: "destructive" })}
                    onClick={() => handleDeleteNote(selectedNote.id)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-0 right-0 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span className="sr-only">Notifications</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      You have 3 unread messages.
                    </p>
                  </div>
                  <div className="grid gap-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="https://placehold.co/100x100.png" alt="Olivia Martin" data-ai-hint="female avatar" />
                        <AvatarFallback>OM</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-1">
                        <p className="text-sm font-medium">
                          <span className="font-semibold">Olivia Martin</span> shared a note with you.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          "Q4 Product Roadmap"
                        </p>
                        <p className="text-xs text-muted-foreground">
                          5 minutes ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                       <Avatar className="h-8 w-8">
                        <AvatarImage src="https://placehold.co/100x100.png" alt="Jackson Lee" data-ai-hint="male avatar" />
                        <AvatarFallback>JL</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-1">
                         <p className="text-sm font-medium">
                          <span className="font-semibold">Jackson Lee</span> shared a note with you.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          "Marketing Campaign Ideas"
                        </p>
                         <p className="text-xs text-muted-foreground">
                          1 hour ago
                        </p>
                      </div>
                    </div>
                     <div className="flex items-start gap-4">
                       <Avatar className="h-8 w-8">
                        <AvatarImage src="https://placehold.co/100x100.png" alt="William Kim" data-ai-hint="male avatar" />
                        <AvatarFallback>WK</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-1">
                         <p className="text-sm font-medium">
                          <span className="font-semibold">William Kim</span> commented on your note.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          "Project Phoenix Kick-off"
                        </p>
                         <p className="text-xs text-muted-foreground">
                          3 hours ago
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <UserNav />
          </div>
        </header>
        <main className="p-4 md:p-8">
          {selectedNote && isNoteUnlocked ? (
            <NoteEditor note={selectedNote} onUpdate={handleUpdateNote} />
          ) : selectedNote ? (
            <UnlockPrompt note={selectedNote} onUnlock={handleUnlockNote} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
              <p>No note selected.</p>
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

    