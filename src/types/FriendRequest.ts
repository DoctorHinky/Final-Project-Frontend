export interface FriendRequest {
  id: number;
  name: string;
  avatar?: string;
  message: string;
  requestDate: string;
  mutualFriends: number;
}
