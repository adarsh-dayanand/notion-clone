import Link from "next/link";
import { Notebook } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AppleIcon, GoogleIcon } from "@/components/icons";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-2">
            <Notebook className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold font-headline">NextNote</h1>
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Sign in to organize your world.
          </p>
          <div className="space-y-2">
            <Button className="w-full" size="lg">
              <GoogleIcon className="mr-2 h-5 w-5" />
              Sign in with Google
            </Button>
            <Button className="w-full" size="lg" variant="secondary">
              <AppleIcon className="mr-2 h-5 w-5" />
              Sign in with Apple
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
