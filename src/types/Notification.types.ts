export type Notification = {
  id: string;
  title: string;
  message: string;
  type: "article" | "comment" | "friend" | "system";
  time: string;
  read: boolean;
  actionLink?: string;
  actionText?: string;
};

export type NotificationSetting = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
};

export type NotificationFilter = {
  id: string;
  name: string;
  count: number;
};
