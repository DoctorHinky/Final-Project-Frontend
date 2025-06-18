export type Comment = {
  user: {
    username: string;
  };
  id: string;
  createdAt: Date;
  updatedAt: Date;
  content: string;
  parentId: string | null;
  replies?: Comment[];
};
