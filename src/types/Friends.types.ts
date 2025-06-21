// src/types/Friends.types.ts

import type { TabType } from "./Tab";

/**
 * Basis-Interface für einen Freund
 */
export interface Friend {
  id: string;
  friendId: string;
  username: string;
  profileImage?: string | null;
  bio?: string;
  friendSince: string;
  isOnline: boolean;
  sharedInterests: number;
}

/**
 * Interface für eine Freundschaftsanfrage
 */
export interface FriendRequest {
  id: string;
  senderId: string;
  name: string;
  username: string;
  avatar?: string | null;
  profileImage?: string | null;
  message: string;
  requestDate: string;
  mutualFriends: number;
}

/**
 * Interface für gesendete Freundschaftsanfragen
 */
export interface SentRequest {
  id: string;
  receiverId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELED";
  receiver: {
    id: string;
    username: string;
    profilePicture: string | null;
  };
  createdAt?: string;
  responsedAt?: string | null;
}

/**
 * Interface für Tab-Navigation
 */
export interface Tab {
  id: string;
  name: TabType | string;
}

/**
 * Interface für Toast-Benachrichtigungen
 */
export interface Toast {
  show: boolean;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

/**
 * Interface für Friend-Service API Responses
 */
export interface FriendResponse {
  message: string;
  data: {
    id: string;
    friendId: string;
    username: string;
    profileImage: string | null;
  }[];
}

export interface PendingRequestResponse {
  message: string;
  data: {
    id: string;
    senderId: string;
    username: string;
    profileImage: string | null;
  }[];
  count: number;
}

/**
 * Interface für Such-Benutzer
 */
export interface SearchUser {
  id: string;
  username: string;
  displayName?: string;
  profilePicture: string | null;
  verified?: boolean;
}

/**
 * Interface für API-Antworten
 */
export interface ApiResponse<T = any> {
  message: string;
  data?: T;
}

/**
 * Interface für Chat-Nachrichten
 */
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  messageType: "TEXT" | "FILE" | "COMBINED" | "SYSTEM";
  attachmentUrl?: string | null;
  isRead: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface für Conversation/Chat
 */
export interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  messages: ChatMessage[];
  _count?: {
    messages: number;
  };
}

/**
 * Interface für Conversation-Vorschau
 */
export interface ConversationPreview {
  id: string;
  otherUserId: string;
  otherUsername: string;
  otherProfilePicture: string | null;
  lastMessage: {
    id: string;
    content: string | null;
    createdAt: string;
  } | null;
  updatedAt: string;
}

/**
 * Interface für Friend-Request Events
 */
export interface FriendRequestEvent {
  userId: string;
  displayName: string;
}

/**
 * Interface für Chat-Message Events
 */
export interface ChatMessageEvent {
  friendId: string | number;
  message: string;
}

/**
 * Interface für Invite-Daten
 */
export interface InviteData {
  email: string;
  message?: string;
}

/**
 * Enum für Freundschaftsanfrage-Status
 */
export const FriendRequestStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  CANCELED: "CANCELED",
  BLOCKED: "BLOCKED",
} as const;

export type FriendRequestStatusType = (typeof FriendRequestStatus)[keyof typeof FriendRequestStatus];

/**
 * Enum für Message-Typen
 */
export const MessageType = {
  TEXT: "TEXT",
  FILE: "FILE",
  COMBINED: "COMBINED",
  SYSTEM: "SYSTEM",
} as const;

type MessageType = (typeof MessageType)[keyof typeof MessageType];

/**
 * Type Guards für Type-Safety
 */

export const isFriend = (obj: any): obj is Friend => {
  return (
    obj &&
    typeof obj.id === "string" &&
    typeof obj.friendId === "string" &&
    typeof obj.name === "string" &&
    typeof obj.username === "string"
  );
};

export const isFriendRequest = (obj: any): obj is FriendRequest => {
  return (
    obj &&
    typeof obj.id === "string" &&
    typeof obj.senderId === "string" &&
    typeof obj.name === "string" &&
    typeof obj.username === "string"
  );
};

export const isChatMessage = (obj: any): obj is ChatMessage => {
  return (
    obj && typeof obj.id === "string" && typeof obj.conversationId === "string" && typeof obj.senderId === "string"
  );
};

/**
 * Utility Types
 */

// Partieller Friend für Updates
export type PartialFriend = Partial<Friend> & { id: string };

// Friend ohne interne IDs (für API-Anfragen)
export type CreateFriendRequest = Omit<FriendRequest, "id" | "requestDate">;

// Chat-Message ohne Metadaten (für Senden)
export type SendChatMessage = Omit<ChatMessage, "id" | "createdAt" | "updatedAt" | "isRead">;

// Exportiere alle Types als Default für einfache Imports
export type {
  Friend as FriendType,
  FriendRequest as FriendRequestType,
  SentRequest as SentRequestType,
  Tab as TabType,
  Toast as ToastType,
  ChatMessage as ChatMessageType,
  Conversation as ConversationType,
};
