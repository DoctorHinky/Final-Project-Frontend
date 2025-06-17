export interface DeletedUser {
  id: string;
  username: string;
  firstname?: string;
  lastname?: string;
  email: string;
  role: string;
  isDeleted: boolean;
  deletedAt: Date | string;
  deletedBy: string;
  deleteReason?: DeletionReason | string;
  deletedByUser?: {
    username: string;
  };
  profilePicture?: string;
  createdAt?: Date | string;
  verified?: boolean;
  deactivated?: boolean;
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
