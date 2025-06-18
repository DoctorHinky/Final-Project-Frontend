// src/types/BaseArticle.types.ts
import type { Article, Chapter, Quiz } from "./dtos";

/**
 * Minimale gemeinsame Interface für ArticleReader
 * Kompatibel mit sowohl MyArticles als auch Library
 */
export interface BaseArticleItem extends Article {
  status?: "reading" | "completed";
}

export interface FullArticleData extends BaseArticleItem {
  author?: {
    username: string;
    profilePicture?: string | null;
    id?: string | null;
  };
  chapters: Chapter[];
  quiz: Quiz | null;
}
