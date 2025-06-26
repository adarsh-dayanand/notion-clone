"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { useDocument } from "react-firebase-hooks/firestore"
import { Bell, Trash } from "lucide-react"

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
import { db } from "@/lib/firebase"
import { encrypt, decrypt } from "@/lib/crypto"
import type { Note as NoteType } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

export default function NotePage({ params }: { params: { noteId: string } }) {
  const { noteId } = params;
  const router = useRouter();
  const { toast } = useToast();

  const noteRef = noteId ? doc(db, "notes", noteId) : null;
  const [noteSnapshot, loadingNote] = useDocument(noteRef);

  const [note, setNote] = useState<NoteType | null>(null);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  
  useEffect(() => {
    if (noteSnapshot?.exists()) {
      const data = { id: noteSnapshot.id, ...noteSnapshot.data() } as NoteType;
      setNote(data);
      if (!data.isPrivate) {
        setDecryptedContent(data.content);
      } else {
        setDecryptedContent(null); 
      }
    }
  }, [noteSnapshot]);

  const handleUpdateNote = async (updatedFields: Partial<NoteType>) => {
    if (!noteRef) return;
    await updateDoc(noteRef, {
      ...updatedFields,
      updatedAt: serverTimestamp(),
    });
  };

  const handleSetPassword = async (password: string) => {
    if (!note || !noteRef) return;
    try {
      const contentToEncrypt = decryptedContent || note.content;
      const encryptedContent = encrypt(contentToEncrypt, password);
      
      await updateDoc(noteRef, {
        content: encryptedContent,
        isPrivate: true,
        updatedAt: serverTimestamp(),
      });
      setDecryptedContent(null);
      toast({ title: "Note is now private", description: "The note has been secured with a password." });
    } catch (e) {
      toast({ title: "Encryption failed", description: "Could not secure the note.", variant: "destructive" });
    }
  };
  
  const handleRemovePassword = async () => {
    if (!note || !noteRef || !decryptedContent) {
      toast({ title: "Unlock note first", description: "You must unlock the note before removing the password.", variant: "destructive" });
      return;
    }
    await updateDoc(noteRef, {
      isPrivate: false,
      updatedAt: serverTimestamp(),
    });
    toast({ title: "Privacy removed", description: "The note is no longer password protected." });
  };

  const handleUnlockNote = (passwordAttempt: string) => {
    if (!note) return;
    try {
      const content = decrypt(note.content, passwordAttempt);
      setDecryptedContent(content);
      toast({ title: "Note unlocked" });
    } catch (error) {
      toast({ title: "Incorrect password", variant: "destructive" });
    }
  };

  const handleDeleteNote = async () => {
    if (!noteRef) return;
    router.replace('/'); 
    await deleteDoc(noteRef);
    toast({ title: "Note deleted" });
  };
  
  const isNoteUnlocked = note && (!note.isPrivate || !!decryptedContent);
  const noteForEditor = note && decryptedContent ? { ...note, content: decryptedContent } : null;

  if (loadingNote) {
     return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
            <Skeleton className="h-12 w-3/4" />
            <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-64 w-full" />
        </div>
     )
  }

  if (!note && !loadingNote) {
     return <div className="p-4 md:p-8">Note not found or you do not have permission to view it.</div>;
  }
  
  if (!note) return null;

  return (
    <>
      <header className="flex items-center justify-between p-4 border-b">
        <div>
          <p className="text-sm text-muted-foreground truncate">Notes / {note.title}</p>
        </div>
        <div className="flex items-center gap-4">
          <ManagePrivacyDialog
            note={note}
            isUnlocked={isNoteUnlocked}
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
                  onClick={handleDeleteNote}
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
                  </div>
                </div>
              </PopoverContent>
          </Popover>
          <UserNav />
        </div>
      </header>
      <main className="p-4 md:p-8">
        {isNoteUnlocked && noteForEditor ? (
          <NoteEditor
            key={note.id} 
            note={noteForEditor}
            onUpdate={handleUpdateNote}
          />
        ) : (
          <UnlockPrompt onUnlock={handleUnlockNote} />
        )}
      </main>
    </>
  );
}
