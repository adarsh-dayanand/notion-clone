"use client"

import { useState } from "react";
import { Lock } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Note } from "@/app/page";


interface UnlockPromptProps {
  note: Note;
  onUnlock: (noteId: number, passwordAttempt: string) => void;
}

export function UnlockPrompt({ note, onUnlock }: UnlockPromptProps) {
  const [passwordAttempt, setPasswordAttempt] = useState("");

  const handleUnlockClick = () => {
    onUnlock(note.id, passwordAttempt);
  };

  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <div className="mx-auto bg-secondary rounded-full p-3 w-fit mb-4">
                    <Lock className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle>Note is Locked</CardTitle>
                <CardDescription>
                    Please enter the password to unlock this note.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                        id="password" 
                        type="password" 
                        value={passwordAttempt}
                        onChange={(e) => setPasswordAttempt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUnlockClick()}
                    />
                </div>
                <Button className="w-full" onClick={handleUnlockClick}>Unlock Note</Button>
            </CardContent>
        </Card>
    </div>
  );
}
