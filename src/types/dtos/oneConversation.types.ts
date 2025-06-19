import type { DirectMessage } from "./DirectMessage.types";

export type Conversation = {
  id: string;
  user1Id: string;
  user2Id: string;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    messages: number;
  };

  messages: DirectMessage[];
};
