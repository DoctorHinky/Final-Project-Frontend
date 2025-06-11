// src/types/Friend.ts
export interface Friend {
  id: string;
  friendId: string;
  name: string;
  username: string;
  avatar?: string | null;
  bio?: string;
  friendSince?: string;
  isOnline?: boolean;
  sharedInterests?: number;
}

// src/types/FriendRequest.ts  
export interface FriendRequest {
  id: string;
  senderId: string;
  name: string;
  username: string;
  avatar?: string | null;
  message?: string;
  requestDate?: string;
  mutualFriends?: number;
}

// src/types/Tab.ts
export interface Tab {
  id: string;
  name: string;
}