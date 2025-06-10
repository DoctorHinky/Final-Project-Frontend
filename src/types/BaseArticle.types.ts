// src/types/BaseArticle.types.ts
import type { PostCategory } from './dtos/Post.Category.types';

/**
 * Minimale gemeinsame Interface für ArticleReader
 * Kompatibel mit sowohl MyArticles als auch Library
 */
export interface BaseArticleItem {
  // Core Post-Daten (required für beide)
  id: string;
  title: string;
  quickDescription: string;
  createdAt: string;
  
  // Optionale Post-Daten (können je nach Kontext vorhanden sein)
  image?: string | null;
  author?: string | null;
  category?: PostCategory | string;
  tags?: string[];
  isCertifiedAuthor?: boolean;
  
  // MyArticles-spezifische Felder (optional für Library)
  historyId?: string;
  readAt?: string;
  solvedAt?: string | null;
  lastRead?: string;
  status?: 'reading' | 'completed';
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