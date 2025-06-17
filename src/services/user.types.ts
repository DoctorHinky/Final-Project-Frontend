export type UserRole = "ADMIN" | "AUTHOR" | "USER" | "MODERATOR";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string;
  birthdate?: string;
  bio?: string;
  shortDescription?: string;
  profilePicture?: string;
  verified: boolean;
  role: UserRole;
  isDeleted: boolean;
  deleteReason?: string;
}
