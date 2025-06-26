import type { Timestamp } from "firebase/firestore";

export type Note = {
  id: string;
  title: string;
  content: string; // Can be encrypted
  tags: string[];
  isPrivate: boolean;
  ownerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
