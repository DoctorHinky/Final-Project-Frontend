// src/types/BaseArticle.types.ts
import type { Article } from "./dtos";

/**
 * Minimale gemeinsame Interface für ArticleReader
 * Kompatibel mit sowohl MyArticles als auch Library
 */
export interface BaseArticleItem extends Article {
  // comments: UserComment[];
  author?: {
    id?: string;
    username: string;
    profilePicture?: string | null;
  };

  status?: "reading" | "completed";
}

/**
 * Backend-Typen für vollständigen Artikel
 */
export interface ArticleChapter {
  id: string;
  title: string;
  content: string;
  image?: string | null;
}

export interface ArticleQuizAnswer {
  id: string;
  answer: string;
  isCorrect: boolean;
}

export interface ArticleQuizQuestion {
  id: string;
  question: string;
  answers: ArticleQuizAnswer[];
}

export interface ArticleQuiz {
  id: string;
  questions: ArticleQuizQuestion[];
}

export interface FullArticleData {
  id: string;
  title: string;
  quickDescription: string;
  image?: string | null;
  category: string;
  createdAt: string;
  author?: {
    username: string;
  };
  chapters: ArticleChapter[];
  quiz?: ArticleQuiz;
}
