
"use client"

import * as React from "react"
import { useParams, usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import {
  FileText,
  Home,
  BrainCircuit,
  PlusCircle,
  Settings,
  Users,
  Lock,
} from "lucide-react"
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where, addDoc, serverTimestamp, type Timestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarProvider,
  SidebarFooter,
  SidebarMenuSkeleton 
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button";
import { auth, db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import type { Note } from '@/lib/types';


export default function NoteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const params = useParams();
  const router = useRouter();
  const [user] = useAuthState(auth);

  const [notesSnapshot, loadingNotes] = useCollection(
    user ? query(collection(db, 'notes'), where('ownerId', '==', user.uid)) : null
  );

  const notes = React.useMemo(() => {
    if (!notesSnapshot) return [];
    const docs = notesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
    docs.sort((a, b) => {
      const dateA = (a.updatedAt as Timestamp)?.toDate?.();
      const dateB = (b.updatedAt as Timestamp)?.toDate?.();
      if (!dateA || !dateB) return 0;
      return dateB.getTime() - dateA.getTime();
    });
    return docs;
  }, [notesSnapshot]);

  const handleNewNote = async () => {
    if (!user) return;
    const newDoc = await addDoc(collection(db, 'notes'), {
      title: "Untitled Note",
      content: JSON.stringify({
        time: Date.now(),
        blocks: [{ id: "1", type: "paragraph", data: { text: "Start writing your new note here!" } }],
        version: "2.29.1"
      }),
      tags: [],
      isPrivate: false,
      ownerId: user.uid,
      permissions: {
        [user.uid]: 'owner',
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    router.push(`/note/${newDoc.id}`);
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="shrink-0">
              <BrainCircuit className="size-5 text-primary" />
            </Button>
            <h1 className="text-lg font-semibold font-headline">Memo</h1>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith("/home")}>
                <Link href="/home">
                  <Home />
                  Home
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith("/shared")}>
                <Link href="/shared">
                  <Users />
                  Shared with me
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith("/settings")}>
                <Link href="/settings">
                  <Settings />
                  Settings
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarSeparator />
          <div className="px-2 py-1 text-sm font-medium text-muted-foreground">Notes</div>
          <SidebarMenu>
            {loadingNotes ? (
              <>
                <SidebarMenuSkeleton showIcon />
                <SidebarMenuSkeleton showIcon />
                <SidebarMenuSkeleton showIcon />
              </>
            ) : (
              notes.map((note) => (
                <SidebarMenuItem key={note.id}>
                  <SidebarMenuButton asChild isActive={params.noteId === note.id}>
                    <Link href={`/note/${note.id}`}>
                      {note.isPrivate ? <Lock className="h-4 w-4" /> : <FileText />}
                      <span className="truncate">{note.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2">
           <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleNewNote}>
                <PlusCircle />
                New Note
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
