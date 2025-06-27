
"use client"
import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp, collection, addDoc, arrayUnion, arrayRemove, type FieldValue, writeBatch, type Timestamp } from "firebase/firestore"
import { useDocument } from "react-firebase-hooks/firestore"
import { useAuthState } from 'react-firebase-hooks/auth'
import { Trash, Loader2, ShieldOff, BrainCircuit, History } from "lucide-react"
import { format } from "date-fns"

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
import { HeaderActions } from "@/components/header-actions"
import { NoteEditor } from "@/components/note-editor"
import { ShareDialog } from "@/components/share-dialog"
import { ManagePrivacyDialog } from "@/components/manage-privacy-dialog"
import { UnlockPrompt } from "@/components/unlock-prompt"
import { VersionHistory } from "@/components/version-history"
import { Button, buttonVariants } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { auth, db } from "@/lib/firebase"
import { encrypt, decrypt } from "@/lib/crypto"
import { SidebarTrigger } from "@/components/ui/sidebar"
import type { Note as NoteType, NotePermission, NoteVersion } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

export default function NotePage({ params }: { params: { noteId: string } }) {
  const { noteId } = params;
  const router = useRouter();
  const { toast } = useToast();

  const [user, loadingAuth] = useAuthState(auth);
  const noteRef = noteId ? doc(db, "notes", noteId) : null;
  const [noteSnapshot, loadingNote] = useDocument(noteRef);

  const [note, setNote] = useState<NoteType | null>(null);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotePermission | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [sessionPassword, setSessionPassword] = useState<string | null>(null);

  useEffect(() => {
    if (noteSnapshot?.exists() && user) {
      const data = { id: noteSnapshot.id, ...noteSnapshot.data() } as NoteType;
      
      const userPermission = data.permissions?.[user.uid] || null;
      
      if (!userPermission) {
        setNote(null);
        return;
      }
      
      setPermission(userPermission);
      setNote(data);
      if (!data.isPrivate) {
        setDecryptedContent(data.content);
        setSessionPassword(null);
      } else {
        setDecryptedContent(null);
        setSessionPassword(null);
      }
    } else if (!loadingNote) {
        setNote(null);
    }
  }, [noteSnapshot, user, loadingNote]);

  const sendUpdateNotification = async (noteTitle: string) => {
    if (!user || !note || !note.permissions) return;

    const batch = writeBatch(db);
    Object.keys(note.permissions)
      .filter(uid => uid !== user.uid)
      .forEach(uid => {
        const notificationRef = doc(collection(db, 'notifications'));
        batch.set(notificationRef, {
            recipientId: uid,
            senderId: user.uid,
            senderProfile: {
                displayName: user.displayName,
                photoURL: user.photoURL,
            },
            noteId: note.id,
            noteTitle: noteTitle,
            type: 'update',
            isRead: false,
            createdAt: serverTimestamp(),
        });
      });
      
    try {
        await batch.commit();
    } catch(error) {
        console.error("Failed to send update notifications", error);
    }
  };


  const handleUpdateNote = async (updatedFields: Partial<NoteType>) => {
    if (!noteRef || !note || !user || permission === 'viewer') return;

    if (updatedFields.content && note.isPrivate && !sessionPassword) {
      toast({ title: "Cannot save private note", description: "Session password not found. Please unlock the note again.", variant: "destructive" });
      return;
    }

    const oldContent = note.isPrivate ? decryptedContent : note.content;
    if (updatedFields.content && oldContent && updatedFields.content !== oldContent) {
        const versionsCol = collection(db, "notes", note.id, "versions");
        await addDoc(versionsCol, {
            title: note.title,
            content: oldContent,
            savedAt: note.updatedAt,
            savedBy: user.uid,
        });
    }

    setIsSaving(true);
    try {
        let finalUpdates = { ...updatedFields };

        if (finalUpdates.content && note.isPrivate && sessionPassword) {
           finalUpdates.content = encrypt(finalUpdates.content, sessionPassword);
        }
        
        await updateDoc(noteRef, {
            ...finalUpdates,
            updatedAt: serverTimestamp(),
        });
        
        await sendUpdateNotification(updatedFields.title || note.title);

    } catch (error: any) {
        console.error("Save failed:", error);
        toast({ title: "Error saving note", description: error.message, variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleTagUpdate = async ({ add, remove }: { add?: string, remove?: string }) => {
    if (!noteRef || !note || permission === 'viewer') return;

    try {
        const update: { tags: FieldValue; updatedAt: FieldValue } = {
            tags: add ? arrayUnion(add) : arrayRemove(remove!),
            updatedAt: serverTimestamp(),
        };
        await updateDoc(noteRef, update as any);
        await sendUpdateNotification(note.title);
    } catch (error: any) {
        console.error("Tag update failed:", error);
        toast({ title: "Error updating tags", description: error.message, variant: "destructive" });
    }
  };

  const handleSetPassword = async (password: string) => {
    if (!note || !noteRef || permission !== 'owner') return;
    try {
      const contentToEncrypt = decryptedContent || note.content;
      const encryptedContent = encrypt(contentToEncrypt, password);
      
      await updateDoc(noteRef, {
        content: encryptedContent,
        isPrivate: true,
        updatedAt: serverTimestamp(),
      });
      setDecryptedContent(null);
      setSessionPassword(password);
      toast({ title: "Note is now private", description: "The note has been secured with a password." });
    } catch (e) {
      toast({ title: "Encryption failed", description: "Could not secure the note.", variant: "destructive" });
    }
  };
  
  const handleRemovePassword = async () => {
    if (!note || !noteRef || !decryptedContent || permission !== 'owner') {
      toast({ title: "Action not allowed", description: "You must be the owner and unlock the note to remove the password.", variant: "destructive" });
      return;
    }
    await updateDoc(noteRef, {
      isPrivate: false,
      updatedAt: serverTimestamp(),
    });
    setSessionPassword(null);
    toast({ title: "Privacy removed", description: "The note is no longer password protected." });
  };

  const handleUnlockNote = (passwordAttempt: string) => {
    if (!note) return;
    try {
      const content = decrypt(note.content, passwordAttempt);
      setDecryptedContent(content);
      setSessionPassword(passwordAttempt);
      toast({ title: "Note unlocked" });
    } catch (error) {
      toast({ title: "Incorrect password", variant: "destructive" });
    }
  };

  const handleDeleteNote = async () => {
    if (!noteRef || permission !== 'owner') return;
    router.replace('/home'); 
    await deleteDoc(noteRef);
    toast({ title: "Note deleted" });
  };
  
  const handleRestoreVersion = async (version: NoteVersion) => {
    if (!noteRef || !note || permission === 'viewer') {
         toast({ title: "Permission Denied", description: "You do not have permission to restore versions.", variant: "destructive" });
         return;
    }

    setIsSaving(true);
    try {
        let newContent = version.content;
        if (note.isPrivate) {
             if (sessionPassword) {
                newContent = encrypt(newContent, sessionPassword);
            } else {
                toast({ title: "Cannot restore to private note", description: "Please unlock the note before restoring a version.", variant: "destructive" });
                setIsSaving(false);
                return;
            }
        }

        await updateDoc(noteRef, {
            title: version.title,
            content: newContent,
            updatedAt: serverTimestamp(),
        });
        toast({ title: "Note Restored", description: `Restored to version from ${format(version.savedAt.toDate(), 'PPp')}` });
    } catch(error: any) {
         toast({ title: "Failed to restore", description: error.message, variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  }

  if (loadingAuth || loadingNote) {
     return (
        <div className="h-full w-full">
            <header className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2 md:gap-4">
                    <Skeleton className="block md:hidden h-9 w-9" />
                    <Skeleton className="h-5 w-48" />
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </header>
            <main className="p-4 md:p-8 max-w-4xl mx-auto">
                <Skeleton className="h-12 w-3/4 mb-6" />
                <div className="flex items-center gap-2 mb-6">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                </div>
                <div className="space-y-4 prose prose-stone dark:prose-invert max-w-none">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </main>
        </div>
     )
  }

  if (!user) {
    router.replace('/login');
    return null;
  }
  
  if (!noteSnapshot?.exists()) {
    return <div className="p-4 md:p-8 text-center">Note not found.</div>;
  }
  
  if (!permission) {
     return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4 text-center">
            <ShieldOff className="h-16 w-16 text-destructive" />
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">You do not have permission to view this note.</p>
            <Button asChild>
                <a href="/home">Go to Home</a>
            </Button>
        </div>
     )
  }

  if (!note) return null;

  const isNoteUnlocked = !note.isPrivate || !!decryptedContent;
  const isReadOnly = permission === 'viewer';
  const noteForEditor = isNoteUnlocked && decryptedContent ? { ...note, content: decryptedContent } : null;

  return (
    <>
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2 md:gap-4">
          <SidebarTrigger className="md:hidden" />
          <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground truncate">Notes / {note.title}</p>
              {isSaving && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              )}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <VersionHistory noteId={note.id} onRestore={handleRestoreVersion} disabled={isReadOnly} />
          {permission === 'owner' && (
            <>
              <ManagePrivacyDialog
                note={note}
                isUnlocked={isNoteUnlocked}
                onSetPassword={handleSetPassword}
                onRemovePassword={handleRemovePassword}
              />
              <ShareDialog note={note} currentUser={user} />
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
                      This action cannot be undone. This will permanently delete your note and its version history.
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
            </>
          )}
          <HeaderActions />
        </div>
      </header>
      <main className="p-4 md:p-8">
        {isNoteUnlocked && noteForEditor ? (
          <NoteEditor
            key={note.id} 
            note={noteForEditor}
            onUpdate={handleUpdateNote}
            onTagUpdate={handleTagUpdate}
            readOnly={isReadOnly}
          />
        ) : (
          <UnlockPrompt onUnlock={handleUnlockNote} />
        )}
      </main>
    </>
  );
}
