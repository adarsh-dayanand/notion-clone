"use client"

import { useState } from "react"
import { Lock, Unlock } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { Note } from "@/lib/types"

interface ManagePrivacyDialogProps {
  note: Note;
  isUnlocked: boolean;
  onSetPassword: (password: string) => void;
  onRemovePassword: () => void;
}

export function ManagePrivacyDialog({ note, isUnlocked, onSetPassword, onRemovePassword }: ManagePrivacyDialogProps) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const handleSetPasswordClick = () => {
    if (password.length < 4) {
      toast({ title: "Password too short", description: "Password must be at least 4 characters long.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    onSetPassword(password);
    setPassword("");
    setConfirmPassword("");
    setIsOpen(false);
  }

  const handleRemovePasswordClick = () => {
    if (!isUnlocked) {
      toast({ title: "Unlock note first", description: "You must unlock the note before removing the password.", variant: "destructive" });
      setIsOpen(false);
      return;
    }
    onRemovePassword();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          {note.isPrivate ? <Unlock className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
          Privacy
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Note Privacy</DialogTitle>
          <DialogDescription>
            {note.isPrivate
              ? "This note is currently password protected."
              : "Set a password to make this note private. Only those with the password can view it."}
          </DialogDescription>
        </DialogHeader>
        {note.isPrivate ? (
          <div className="py-4">
            <p>You can remove the password to make this note public again.</p>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="confirm-password" className="text-right">
                Confirm
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          {note.isPrivate ? (
            <Button variant="destructive" onClick={handleRemovePasswordClick}>
              Remove Password
            </Button>
          ) : (
            <Button type="submit" onClick={handleSetPasswordClick}>
              Set Password
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
