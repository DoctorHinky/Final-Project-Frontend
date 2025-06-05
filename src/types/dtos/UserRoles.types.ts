export const UserRoles = {
  ADMIN: "ADMIN",
  MODERATOR: "MODERATOR",
  AUTHOR: "AUTHOR",
  ADULT: "ADULT",
  CHILD: "CHILD",
} as const;

export type UserRoles = (typeof UserRoles)[keyof typeof UserRoles];
