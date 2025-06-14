export type DirectMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  content?: string;
  attachmentUrl?: string;
  isRead: boolean;
  isDeletedForSender: boolean;
  isDeletedForReceiver: boolean;
  createdAt: Date;
  updatedAt: Date;
  messageType: MessageType;
};

export type MessageType = "TEXT" | "FILE" | "COMBINED" | "SYSTEM";
