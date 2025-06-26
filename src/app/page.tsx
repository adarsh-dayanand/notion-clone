
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { BrainCircuit } from 'lucide-react';

export default function HomePage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    // Wait until the auth state is loaded
    if (loading) return;

    // If there is no user, redirect to login page
    if (!user) {
      router.replace('/login');
      return;
    }

    // If there is a user, fetch their most recent note or create a new one
    const fetchFirstNoteOrCreate = async () => {
      const notesCollection = collection(db, 'notes');
      const q = query(
        notesCollection,
        where('ownerId', '==', user.uid),
        orderBy('updatedAt', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        // Create a new note if user has none
        const newNote = await addDoc(notesCollection, {
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
        router.replace(`/note/${newNote.id}`);
      } else {
        // Redirect to the most recently updated note
        router.replace(`/note/${snapshot.docs[0].id}`);
      }
    };

    fetchFirstNoteOrCreate();
  }, [user, loading, router]);

  // Show a loading indicator while we determine the user's auth state and redirect
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
      <BrainCircuit className="h-12 w-12 animate-pulse text-primary" />
      <p className="text-muted-foreground">Loading your notes...</p>
    </div>
  );
}
