import type { Chapter } from "./Chapter.types";
import type { PostCategory } from "./Post.Category.types";
import type { Quiz } from "./Quiz.types";

export type Article = {
  id: string;
  title: string;
  quickDescription: string;
  image: string;
  publicId_image: string;
  tags: string[];
  forKids: boolean;
  ageRestriction: number;
  category: PostCategory;
  isCertifiedAuthor: false;
  authorId: string | null;
  moderatorId: string | null;
  published: boolean;
  publishedAt: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  deleteReason: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  popularityScore: number;

  // other

  chapters: Chapter[];
  readByUser?: string;
  comments?: [];
  ratings?: [];

  quiz: Quiz | null;
};
