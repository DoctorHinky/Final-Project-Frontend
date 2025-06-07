export type Chapter = {
  id?: string;
  postId?: string;
  title: string;
  content: string;
  chapterImage?: string;
  quiz?: any;
  isDragging?: boolean;
  isSaving?: boolean;
};
