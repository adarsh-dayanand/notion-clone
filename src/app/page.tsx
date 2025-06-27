
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { BrainCircuit } from 'lucide-react';

export default function RootPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    // Wait until the auth state is loaded
    if (loading) return;

    if (user) {
      router.replace('/home');
    } else {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Show a loading indicator while we determine the user's auth state and redirect
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
      <BrainCircuit className="h-12 w-12 animate-pulse text-primary" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );
}
