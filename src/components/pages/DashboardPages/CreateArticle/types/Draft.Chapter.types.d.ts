export type Chapter = {
  id?: string;
  postId?: string;
  title: string;
  content: string;
  image?: string;
  quiz?: any;
  isDragging?: boolean;
  isSaving?: boolean;
};
