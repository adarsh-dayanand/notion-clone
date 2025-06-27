
"use client"

import { useEffect, useState } from "react";
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Loader2 } from "lucide-react";
import { format } from 'date-fns';

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton";
import type { Note, UserProfile, NotePermission } from "@/lib/types";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { HeaderActions } from "@/components/header-actions";

interface SharedNote extends Note {
  ownerProfile?: UserProfile;
  permission?: NotePermission;
}

const NoteCardSkeleton = () => (
    <Card>
        <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardFooter>
            <div className="flex items-center gap-2 w-full">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-1/3" />
            </div>
        </CardFooter>
    </Card>
)

export default function SharedPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const [sharedNotes, setSharedNotes] = useState<SharedNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);

  const notesCollectionRef = collection(db, 'notes');
  const sharedNotesQuery = user ? query(notesCollectionRef, where(`permissions.${user.uid}`, "in", ["viewer", "editor"])) : null;

  const [notesSnapshot, loadingSnapshot] = useCollection(sharedNotesQuery);

  useEffect(() => {
    if (loadingSnapshot || !notesSnapshot) return;

    const fetchNotesAndOwners = async () => {
        setLoadingNotes(true);
        const notesData = await Promise.all(notesSnapshot.docs.map(async (noteDoc) => {
            const note = { id: noteDoc.id, ...noteDoc.data() } as Note;
            let ownerProfile: UserProfile | undefined = undefined;

            if (note.ownerId) {
                const userDoc = await getDoc(doc(db, "users", note.ownerId));
                if (userDoc.exists()) {
                    ownerProfile = userDoc.data() as UserProfile;
                }
            }

            return { 
                ...note, 
                ownerProfile,
                permission: note.permissions[user?.uid || '']
            };
        }));
        setSharedNotes(notesData);
        setLoadingNotes(false);
    };

    fetchNotesAndOwners();
  }, [notesSnapshot, loadingSnapshot, user]);

  if (loadingAuth || loadingNotes) {
    return (
        <>
            <header className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-4">
                    <Skeleton className="block md:hidden h-9 w-9" />
                    <div>
                        <Skeleton className="h-7 w-48 mb-2" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                </div>
            </header>
            <main className="p-4 md:p-8">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => <NoteCardSkeleton key={i} />)}
                </div>
            </main>
        </>
    );
  }

  return (
    <>
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
            <SidebarTrigger className="md:hidden" />
            <div>
                <h1 className="text-2xl font-bold font-headline">Shared with Me</h1>
                <p className="text-muted-foreground">
                    {`You have ${sharedNotes.length} notes shared with you.`}
                </p>
            </div>
        </div>
        <HeaderActions />
      </header>
      <main className="p-4 md:p-8">
        {sharedNotes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sharedNotes.map((note) => (
              <Link href={`/note/${note.id}`} key={note.id}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                  <CardHeader className="flex-grow">
                    <CardTitle>{note.title}</CardTitle>
                    <CardDescription>
                      {note.updatedAt && typeof (note.updatedAt as any).toDate === 'function' 
                        ? `Updated ${format((note.updatedAt as any).toDate(), 'PPp')}`
                        : 'Updated recently'}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-between">
                      <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                              <AvatarImage src={note.ownerProfile?.photoURL || ''} alt={note.ownerProfile?.displayName || 'user'} data-ai-hint="user avatar" />
                              <AvatarFallback>{note.ownerProfile?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground truncate">
                              {note.ownerProfile?.displayName || 'A user'}
                          </span>
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">{note.permission}</div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
             <div className="text-center py-16">
                <h2 className="text-xl font-semibold">Nothing is shared with you</h2>
                <p className="text-muted-foreground mt-2">Notes shared with you will appear here.</p>
            </div>
        )}
      </main>
    </>
  )
}
