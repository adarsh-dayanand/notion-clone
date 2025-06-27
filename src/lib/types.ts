import type { Timestamp, FieldValue } from "firebase/firestore";

export type NotePermission = 'owner' | 'editor' | 'viewer';

export type Note = {
  id: string;
  title: string;
  content: string; // Can be encrypted
  tags: string[];
  isPrivate: boolean;
  ownerId: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  // Map of user IDs to their permission level
  permissions: {
    [uid: string]: NotePermission;
  };
};

export type NoteVersion = {
  id: string;
  title: string;
  content: string; // Stored unencrypted
  savedAt: Timestamp;
  savedBy: string; // UID of user
};

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

export type Notification = {
    id: string;
    recipientId: string;
    senderId: string;
    senderProfile: {
      displayName: string | null;
      photoURL: string | null;
    };
    noteId: string;
    noteTitle: string;
    type: 'share' | 'update';
    isRead: boolean;
    createdAt: Timestamp | FieldValue;
}
