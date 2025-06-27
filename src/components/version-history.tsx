
"use client"

import React, { useState, useEffect } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy, doc, getDoc, type Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { History, Loader2, Eye, Undo, GitCommitHorizontal } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { OutputData } from '@editorjs/editorjs';

import { db } from '@/lib/firebase';
import type { NoteVersion, UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from './ui/skeleton';

const EditorPreview = dynamic(() => import('@/components/editor'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-full p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
});


interface VersionHistoryProps {
  noteId: string;
  onRestore: (version: NoteVersion) => void;
  disabled?: boolean;
}

const VersionItemSkeleton = () => (
    <div className="flex items-center justify-between p-2 rounded-lg">
        <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
            </div>
        </div>
        <div className="flex items-center gap-1">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
        </div>
    </div>
);

export function VersionHistory({ noteId, onRestore, disabled = false }: VersionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const versionsRef = collection(db, 'notes', noteId, 'versions');
  const versionsQuery = query(versionsRef, orderBy('savedAt', 'desc'));
  const [versionsSnapshot, loading] = useCollection(versionsQuery);

  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  const versions = React.useMemo(() => {
    return versionsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as NoteVersion)) || [];
  }, [versionsSnapshot]);

  useEffect(() => {
    if (versions.length > 0) {
      const fetchProfiles = async () => {
        setLoadingProfiles(true);
        const newProfiles: Record<string, UserProfile> = {};
        const uidsToFetch = versions.map(v => v.savedBy).filter(uid => !userProfiles[uid]);
        const uniqueUids = [...new Set(uidsToFetch)];
        
        if (uniqueUids.length > 0) {
            const promises = uniqueUids.map(async (uid) => {
                const userDoc = await getDoc(doc(db, "users", uid));
                if (userDoc.exists()) {
                    newProfiles[uid] = userDoc.data() as UserProfile;
                }
            });
            await Promise.all(promises);
            setUserProfiles(prev => ({ ...prev, ...newProfiles }));
        }
        setLoadingProfiles(false);
      };
      fetchProfiles();
    }
  }, [versions, userProfiles]);

  const handleRestoreClick = (version: NoteVersion) => {
    onRestore(version);
    setIsOpen(false);
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">
          <History className="mr-2 h-4 w-4" />
          History
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Version History</SheetTitle>
          <SheetDescription>
            Review and restore previous versions of this note.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow my-4">
          <div className="space-y-2 pr-4">
            {loading || loadingProfiles ? (
                <>
                    <VersionItemSkeleton />
                    <VersionItemSkeleton />
                    <VersionItemSkeleton />
                </>
            ) : versions.length > 0 ? (
              versions.map((version) => {
                const user = userProfiles[version.savedBy];
                const savedAtDate = (version.savedAt as Timestamp)?.toDate();
                return (
                  <div key={version.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                    <div className="flex items-center gap-3 truncate">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.photoURL || undefined} data-ai-hint="user avatar" />
                        <AvatarFallback>{user?.displayName?.charAt(0) || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="truncate">
                        <p className="text-sm font-medium truncate">{version.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          Saved by {user?.displayName || 'Unknown User'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {savedAtDate ? format(savedAtDate, 'MMM d, yyyy, h:mm a') : '...'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" title="Preview"><Eye className="h-4 w-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-2xl">
                              <AlertDialogHeader>
                                  <AlertDialogTitle>Preview: {version.title}</AlertDialogTitle>
                                   <AlertDialogDescription>
                                    Read-only preview of version from {savedAtDate ? format(savedAtDate, 'PPp') : ''}.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <ScrollArea className="h-72 w-full rounded-md border">
                                  <EditorPreview
                                      holder={`version-preview-${version.id}`}
                                      data={JSON.parse(version.content) as OutputData}
                                      onChange={() => {}}
                                      readOnly={true}
                                  />
                              </ScrollArea>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Close</AlertDialogCancel>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" title="Restore" disabled={disabled}>
                            <Undo className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Restore this version?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will replace the current note content with the content from this version. This action will create a new version of the current content before restoring.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRestoreClick(version)}>
                              Restore
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })
            ) : (
                <div className="text-center py-10">
                    <GitCommitHorizontal className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold">No version history</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Changes to the note content will be saved here.
                    </p>
                </div>
            )}
          </div>
        </ScrollArea>
        <SheetFooter>
            <SheetClose asChild>
                <Button variant="outline">Close</Button>
            </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
