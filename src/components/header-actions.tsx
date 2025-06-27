
"use client"

import * as React from "react"
import Link from "next/link";
import { useCollection } from 'react-firebase-hooks/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, where, orderBy, writeBatch, doc, type Timestamp } from 'firebase/firestore';
import { formatDistanceToNow } from "date-fns"
import { Bell, Zap } from "lucide-react";

import { UserNav } from "@/components/user-nav";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { auth, db } from "@/lib/firebase";
import type { Notification } from "@/lib/types"

export function HeaderActions() {
    const [user] = useAuthState(auth);

    const notificationsRef = user ? query(collection(db, 'notifications'), where('recipientId', '==', user.uid), orderBy('createdAt', 'desc')) : null;
    const [notificationsSnapshot] = useCollection(notificationsRef);

    const notifications = React.useMemo(() => {
        if (!notificationsSnapshot) return [];
        return notificationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Notification);
    }, [notificationsSnapshot]);

    const unreadNotifications = React.useMemo(() => {
        return notifications.filter(n => !n.isRead);
    }, [notifications]);

    const handleMarkNotificationsAsRead = async () => {
        if (!user || unreadNotifications.length === 0) return;
        const batch = writeBatch(db);
        unreadNotifications.forEach(n => {
            const notifRef = doc(db, 'notifications', n.id);
            batch.update(notifRef, { isRead: true });
        });
        try {
            await batch.commit();
        } catch (error) {
            console.error("Error marking notifications as read:", error);
        }
    };

    return (
        <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="outline" asChild>
                <Link href="/settings/billing">
                    <Zap className="mr-2 h-4 w-4 text-primary" />
                    Upgrade to Pro
                </Link>
            </Button>
            
            <Popover onOpenChange={(open) => { if (open) handleMarkNotificationsAsRead() }}>
                <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    {unreadNotifications.length > 0 && (
                    <span className="absolute top-0 right-0 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96">
                    <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Notifications</h4>
                        <p className="text-sm text-muted-foreground">
                        You have {unreadNotifications.length} unread messages.
                        </p>
                    </div>
                    <div className="grid gap-2 max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                        notifications.slice(0, 10).map(n => (
                            <div className="flex items-start gap-4" key={n.id}>
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={n.senderProfile.photoURL || 'https://placehold.co/100x100.png'} alt={n.senderProfile.displayName || 'User'} data-ai-hint="user avatar" />
                                <AvatarFallback>{n.senderProfile.displayName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="grid gap-1">
                                <p className="text-sm font-medium">
                                    <span className="font-semibold">{n.senderProfile.displayName}</span>
                                    {n.type === 'share' ? ' shared a note with you.' : ' updated a note.'}
                                </p>
                                <Link href={`/note/${n.noteId}`} className="text-sm text-muted-foreground hover:underline truncate">
                                    "{n.noteTitle}"
                                </Link>
                                <p className="text-xs text-muted-foreground">
                                    {(n.createdAt as Timestamp)?.toDate && formatDistanceToNow((n.createdAt as Timestamp).toDate(), { addSuffix: true })}
                                </p>
                            </div>
                            </div>
                        ))
                        ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No new notifications.</p>
                        )}
                    </div>
                    </div>
                </PopoverContent>
            </Popover>

            <UserNav />
        </div>
    )
}
