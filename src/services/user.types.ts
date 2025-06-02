export type UserRole = "ADMIN" | "AUTHOR" | "USER" | "MODERATOR";

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  deactivated: boolean;
}