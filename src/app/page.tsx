
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
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }

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
        router.replace(`/note/${snapshot.docs[0].id}`);
      }
    };

    fetchFirstNoteOrCreate();
  }, [user, loading, router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
      <BrainCircuit className="h-12 w-12 animate-pulse text-primary" />
      <p className="text-muted-foreground">Loading your notes...</p>
    </div>
  );
}
