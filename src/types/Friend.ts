export interface Friend {
  id: number;
  name: string;
  avatar?: string;
  bio?: string;
  friendSince: string;
  status?: "online" | "offline";
}
