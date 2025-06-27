
"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, storage } from '@/lib/firebase';
import { updateProfile, updateEmail, deleteUser } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();
    const { toast } = useToast();

    const [displayName, setDisplayName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || '');
            setNewEmail(user.email || '');
            setPreviewImage(user.photoURL || null);
        }
    }, [user]);
    
    if (loading) {
        return (
            <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
                <header className="flex items-start gap-4">
                    <Skeleton className="block md:hidden h-9 w-9 mt-1.5" />
                    <div>
                        <Skeleton className="h-9 w-32 mb-2" />
                        <Skeleton className="h-4 w-56" />
                    </div>
                </header>

                <Card>
                    <CardHeader>
                        <CardTitle><Skeleton className="h-6 w-24" /></CardTitle>
                        <CardDescription><Skeleton className="h-4 w-48" /></CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <Skeleton className="h-20 w-20 rounded-full" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                        <div className="space-y-2">
                            <Label><Skeleton className="h-4 w-24 mb-2" /></Label>
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-28" />
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle><Skeleton className="h-6 w-36" /></CardTitle>
                        <CardDescription><Skeleton className="h-4 w-40" /></CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Label><Skeleton className="h-4 w-16 mb-2" /></Label>
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-32" />
                    </CardFooter>
                </Card>
                
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle><Skeleton className="h-6 w-40" /></CardTitle>
                        <CardDescription><Skeleton className="h-4 w-64" /></CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Skeleton className="h-10 w-36" />
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (!user) {
        router.replace('/login');
        return null;
    }

    const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfileImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleProfileUpdate = async () => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            let photoURL = user.photoURL;
            if (profileImage) {
                const storageRef = ref(storage, `avatars/${user.uid}`);
                await uploadBytes(storageRef, profileImage);
                photoURL = await getDownloadURL(storageRef);
            }
            await updateProfile(user, {
                displayName,
                photoURL,
            });
            toast({ title: 'Success', description: 'Profile updated successfully.' });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEmailUpdate = async () => {
        if (!user) return;
        setIsSubmitting(true);
        if (newEmail === user.email) {
            toast({ title: 'Info', description: 'This is already your current email address.' });
            setIsSubmitting(false);
            return;
        }
        try {
            await updateEmail(user, newEmail);
            toast({ title: 'Success', description: 'Email updated successfully. Please verify your new email.' });
        } catch (error: any) {
             if (error.code === 'auth/requires-recent-login') {
                toast({
                    title: 'Action required',
                    description: 'This action is sensitive and requires recent authentication. Please log out and log in again to update your email.',
                    variant: 'destructive',
                });
            } else {
                toast({ title: 'Error', description: error.message, variant: 'destructive' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            const notesQuery = query(collection(db, 'notes'), where('ownerId', '==', user.uid));
            const notesSnapshot = await getDocs(notesQuery);
            const deletePromises = notesSnapshot.docs.map((doc) => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
            
            await deleteUser(user);
            toast({ title: 'Success', description: 'Your account and all associated data have been deleted.' });
            router.replace('/login');
        } catch (error: any) {
            if (error.code === 'auth/requires-recent-login') {
                 toast({
                    title: 'Action required',
                    description: 'This action is sensitive and requires recent authentication. Please log out and log in again to delete your account.',
                    variant: 'destructive',
                });
            } else {
                toast({ title: 'Error', description: error.message, variant: 'destructive' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
            <header className="flex items-start gap-4">
                <SidebarTrigger className="md:hidden mt-1.5" />
                <div>
                    <h1 className="text-3xl font-bold font-headline">Settings</h1>
                    <p className="text-muted-foreground">Manage your account settings.</p>
                </div>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Update your name and profile picture.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={previewImage || undefined} alt={displayName} data-ai-hint="user avatar" />
                            <AvatarFallback>{displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleProfileImageChange}
                            className="hidden"
                        />
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                            Change Picture
                        </Button>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                            id="displayName"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleProfileUpdate} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Email Address</CardTitle>
                    <CardDescription>Update your login email.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                    />
                </CardContent>
                <CardFooter>
                     <Button onClick={handleEmailUpdate} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Email
                    </Button>
                </CardFooter>
            </Card>
            
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle>Delete Account</CardTitle>
                    <CardDescription>Permanently delete your account and all of your content.</CardDescription>
                </CardHeader>
                <CardFooter>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isSubmitting}>Delete Account</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    className={buttonVariants({ variant: "destructive" })}
                                    onClick={handleDeleteAccount}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Yes, delete my account
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            </Card>
        </div>
    );
}
