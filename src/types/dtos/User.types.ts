export type User = {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  birthdate: string;
  email: string;
  phone: string | null;
  role: UserRoles;
  isPedagogicalAuthor: boolean;
  profilePicture: string | null;
  publicid_picture: string | null;
  shortDescription: string | null;
  bio: string | null;
  userFileId: string | null;
  parent1Id: string | null;
  parent2Id: string | null;
  verified: boolean;
  isDeleted: boolean;
  deletedAt: Date | string | null;
  deletedBy: string | null;
  deleteReason: null | string;
  deactivated: boolean;
  authorizedBy: null | string;
  authorizedAt: null | Date | string;
  blockedForApplication: boolean;
  moderatedBy: null | string;
  moderatedAt: null | Date | string;

  createdAt: string | Date;
  updatedAt: string | Date;
};

export type UserRoles = "ADMIN" | "AUTHOR" | "CHILD" | "ADULT" | "MODERATOR";
