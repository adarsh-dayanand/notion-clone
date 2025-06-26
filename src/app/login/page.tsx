
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrainCircuit } from "lucide-react";
import {
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSignInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        title: "Authentication failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
            <Button className="w-full" size="lg" onClick={handleSignInWithGoogle}>
              <GoogleIcon className="mr-2 h-5 w-5" />
              Sign in with Google
            </Button>
          </div>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          <Link
            href="/"
            className="underline underline-offset-4 hover:text-primary"
          >
            Continue without an account
          </Link>
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
