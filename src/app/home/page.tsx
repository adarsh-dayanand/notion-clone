
"use client"

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, Lock, Loader2 } from 'lucide-react';
import type { Note } from '@/lib/types';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const [user, loadingAuth] = useAuthState(auth);
  const router = useRouter();

  const notesCollection = user ? collection(db, 'notes') : null;
  const q = notesCollection ? query(notesCollection, where('ownerId', '==', user?.uid), orderBy('updatedAt', 'desc')) : null;
  const [notesSnapshot, loadingNotes] = useCollection(q);
  const notes = notesSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note)) || [];

  const handleNewNote = async () => {
    if (!user) return;
    const newDoc = await addDoc(collection(db, 'notes'), {
      title: "Untitled Note",
      content: JSON.stringify({
        time: Date.now(),
        blocks: [{ id: "1", type: "paragraph", data: { text: "Start writing your new note here!" } }],
        version: "2.29.1"
      }),
      tags: [],
      isPrivate: false,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    router.push(`/note/${newDoc.id}`);
  };

  if (loadingAuth) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    router.replace('/login');
    return null;
  }
  
  return (
    <>
      <header className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold font-headline">My Notes</h1>
          <p className="text-muted-foreground">You have {notes.length} notes.</p>
        </div>
        <Button onClick={handleNewNote}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Note
        </Button>
      </header>
      <main className="p-4 md:p-8">
        {loadingNotes ? (
           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardFooter>
                        <Skeleton className="h-4 w-1/4" />
                    </CardFooter>
                </Card>
            ))}
           </div>
        ) : notes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {notes.map(note => (
              <Link href={`/note/${note.id}`} key={note.id}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
                  <CardHeader className="flex-grow">
                    <CardTitle className="flex items-center gap-2">
                      {note.isPrivate ? <Lock className="h-4 w-4 text-muted-foreground" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
                      <span className="truncate">{note.title}</span>
                    </CardTitle>
                    <CardDescription>
                      {note.updatedAt && `Updated ${format(note.updatedAt.toDate(), 'PPp')}`}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    {note.tags.length > 0 && <span className="text-xs text-muted-foreground">{note.tags.join(', ')}</span>}
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold">No notes yet</h2>
            <p className="text-muted-foreground mt-2">Click "Create Note" to get started.</p>
          </div>
        )}
      </main>
    </>
  )
}
