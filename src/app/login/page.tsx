
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrainCircuit, Loader2 } from "lucide-react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  type User,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, loading] = useAuthState(auth);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // This function redirects the user to their most recent note, or creates one if none exist.
  const redirectToNote = async (firebaseUser: User) => {
    const notesCollection = collection(db, 'notes');
    const q = query(
      notesCollection,
      where('ownerId', '==', firebaseUser.uid),
      orderBy('updatedAt', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      const newNote = await addDoc(notesCollection, {
        title: "Untitled Note",
        content: JSON.stringify({
          time: Date.now(),
          blocks: [{ id: "1", type: "paragraph", data: { text: "Start writing your new note here!" } }],
          version: "2.29.1"
        }),
        tags: [],
        isPrivate: false,
        ownerId: firebaseUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      router.replace(`/note/${newNote.id}`);
    } else {
      router.replace(`/note/${snapshot.docs[0].id}`);
    }
  };

  // When the auth state is resolved, redirect the user if they are logged in.
  useEffect(() => {
    if (!loading && user) {
      redirectToNote(user);
    }
  }, [user, loading, router]);

  const handleSignInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    setIsSigningIn(true);
    try {
      // signInWithPopup will trigger the onAuthStateChanged listener,
      // which is handled by the useAuthState hook and the useEffect above.
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        title: "Authentication failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  // While checking auth state or if user is logged in, show a loading screen.
  // This prevents the login form from flashing before redirection.
  if (loading || user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
        <BrainCircuit className="h-12 w-12 animate-pulse text-primary" />
        <p className="text-muted-foreground">Loading your notes...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold font-headline">Memo</h1>
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Sign in to organize your world.
          </p>
          <div className="space-y-2">
            <Button className="w-full" size="lg" onClick={handleSignInWithGoogle} disabled={isSigningIn}>
              {isSigningIn ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <GoogleIcon className="mr-2 h-5 w-5" />}
              Sign in with Google
            </Button>
          </div>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
