import type { User } from "./dtos";

export interface DeletedUser extends User {
  deletedByUser?: {
    username: string;
  };
  additionalInfo?: string;
}

export type DeletionReason = "VIOLATION" | "SELF_DELETION" | "ADMIN_DELETION" | "INACTIVITY" | "OTHER";

export interface SearchCriteria {
  name: string;
  email: string;
  id: string;
  deletedBy: string;
  reason: string;
  dateFrom: string;
  dateTo: string;
  hasNotes: string;
}
