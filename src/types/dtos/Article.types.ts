import type { Chapter } from "./Chapter.types";
import type { PostCategory } from "./Post.Category.types";
import type { Quiz } from "./Quiz.types";

export type Article = {
  id: string;
  title: string;
  quickDescription: string;
  image: string | null;
  tags: string[];
  forKids: boolean;
  ageRestriction: number;
  category: PostCategory;
  isCertifiedAuthor: boolean;
  authorId: string | null;
  author?: {
    username: string;
    profilePicture?: string | null;
    id?: string | null;
  };
  moderatorId: string | null;
  published: boolean;
  publishedAt: string | Date | null;
  isDeleted: boolean;
  deletedAt: string | Date | null;
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
export interface LibraryArticle {
  id: string;
  title: string;
  quickDescription: string;
  image: string | null;
  category: PostCategory | string;
  author: {
    id?: string;
    username: string;
    profilePicture?: string | null;
  };
  tags: string[];
  isCertifiedAuthor: boolean;
  createdAt: string;
  publishedAt?: string | Date;

  readTime?: string; // Geschätzte Lesezeit
}
