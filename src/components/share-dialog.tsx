"use client"

import { useState, useEffect } from "react"
import { Share2, X, Loader2, Copy } from "lucide-react"
import type { User as FirebaseUser } from 'firebase/auth'
import { collection, query, where, getDocs, updateDoc, doc, getDoc, FieldValue, deleteField, addDoc, serverTimestamp } from 'firebase/firestore'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { db } from '@/lib/firebase'
import type { Note, NotePermission, UserProfile } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Separator } from "./ui/separator"

interface ShareDialogProps {
  note: Note;
  currentUser: FirebaseUser;
}

export function ShareDialog({ note, currentUser }: ShareDialogProps) {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [permission, setPermission] = useState<"viewer" | "editor">("viewer")
  const [isSharing, setIsSharing] = useState(false)
  const [collaborators, setCollaborators] = useState<UserProfile[]>([])
  const [isLoadingCollaborators, setIsLoadingCollaborators] = useState(true);

  const noteLink = `${window.location.origin}/note/${note.id}`

  const fetchCollaborators = async () => {
    setIsLoadingCollaborators(true);
    const uids = Object.keys(note.permissions);
    const users: UserProfile[] = [];
    for (const uid of uids) {
        if (uid === currentUser.uid) continue; // Don't fetch current user
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            users.push(userDoc.data() as UserProfile);
        }
    }
    setCollaborators(users);
    setIsLoadingCollaborators(false);
  };
  
  useEffect(() => {
    fetchCollaborators();
  }, [note.permissions]);

  const handleShare = async () => {
    if (!email) {
      toast({ title: "Email is required", variant: "destructive" });
      return;
    }
    setIsSharing(true);

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({ title: "User not found", description: "No user found with that email address.", variant: "destructive" });
        return;
      }

      const userToShareWith = querySnapshot.docs[0].data() as UserProfile;
      
      if (userToShareWith.uid === currentUser.uid) {
        toast({ title: "You can't share a note with yourself", variant: "destructive" });
        return;
      }
      
      const noteRef = doc(db, 'notes', note.id);
      await updateDoc(noteRef, {
        [`permissions.${userToShareWith.uid}`]: permission
      });
      
      await addDoc(collection(db, 'notifications'), {
        recipientId: userToShareWith.uid,
        senderId: currentUser.uid,
        senderProfile: {
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
        },
        noteId: note.id,
        noteTitle: note.title,
        type: 'share',
        isRead: false,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Note Shared!",
        description: `Successfully shared with ${email}. They will be notified.`,
      })
      setEmail("");
      fetchCollaborators(); 
    } catch (error) {
      console.error("Error sharing note:", error);
      toast({ title: "Failed to share note", variant: "destructive" });
    } finally {
      setIsSharing(false);
    }
  }

  const handlePermissionChange = async (uid: string, newPermission: NotePermission) => {
    try {
      const noteRef = doc(db, 'notes', note.id);
      await updateDoc(noteRef, {
        [`permissions.${uid}`]: newPermission
      });
      toast({ title: "Permission updated" });
      fetchCollaborators();
    } catch (error) {
       toast({ title: "Failed to update permission", variant: "destructive" });
    }
  };

  const removeCollaborator = async (uid: string) => {
    try {
        const noteRef = doc(db, 'notes', note.id);
        await updateDoc(noteRef, {
            [`permissions.${uid}`]: deleteField()
        });
        toast({ title: "Collaborator removed" });
        fetchCollaborators();
    } catch (error) {
        toast({ title: "Failed to remove collaborator", variant: "destructive" });
    }
  };
  
  const copyLink = () => {
    navigator.clipboard.writeText(noteLink);
    toast({ title: "Link copied to clipboard!" });
  }

  return (
    <Dialog onOpenChange={(open) => open && fetchCollaborators()}>
      <DialogTrigger asChild>
        <Button>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Note</DialogTitle>
          <DialogDescription>
            Invite others to collaborate on this note.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">Link</Label>
                <Input id="link" defaultValue={noteLink} readOnly />
            </div>
            <Button type="submit" size="sm" className="px-3" onClick={copyLink}>
                <span className="sr-only">Copy</span>
                <Copy className="h-4 w-4" />
            </Button>
        </div>
        
        <Separator />

        <div className="space-y-4 py-2">
            <h4 className="text-sm font-medium">People with access</h4>
            {isLoadingCollaborators ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <div className="space-y-2">
                    {/* Owner */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={currentUser.photoURL || undefined} data-ai-hint="user avatar" />
                                <AvatarFallback>{currentUser.displayName?.charAt(0) || 'Me'}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium">{currentUser.displayName} (you)</p>
                                <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                            </div>
                        </div>
                        <span className="text-sm text-muted-foreground">Owner</span>
                    </div>

                    {/* Collaborators */}
                    {collaborators.map(c => (
                        <div key={c.uid} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={c.photoURL || undefined} data-ai-hint="user avatar" />
                                    <AvatarFallback>{c.displayName?.charAt(0) || 'U'}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium">{c.displayName}</p>
                                    <p className="text-xs text-muted-foreground">{c.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Select 
                                    defaultValue={note.permissions[c.uid]}
                                    onValueChange={(val: NotePermission) => handlePermissionChange(c.uid, val)}
                                >
                                    <SelectTrigger className="w-[110px] h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="editor">Editor</SelectItem>
                                        <SelectItem value="viewer">Viewer</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeCollaborator(c.uid)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <Separator />
        
        <div className="grid grid-cols-3 items-center gap-4">
            <Input
              id="email"
              type="email"
              placeholder="friend@example.com"
              className="col-span-3 sm:col-span-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Select value={permission} onValueChange={(v: "viewer" | "editor") => setPermission(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select permissions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="editor">Can edit</SelectItem>
                <SelectItem value="viewer">Can view</SelectItem>
              </SelectContent>
            </Select>
          </div>
        <DialogFooter className="sm:justify-end">
          <Button type="submit" onClick={handleShare} disabled={isSharing}>
            {isSharing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
