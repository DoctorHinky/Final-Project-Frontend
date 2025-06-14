export type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type DeleteForm = {
  deleteReason?: string;
  password: string;
  confirmDeletion: boolean;
};

export type DeactivateForm = {
  password: string;
};

export type ReactivateForm = {
  password: string;
};
