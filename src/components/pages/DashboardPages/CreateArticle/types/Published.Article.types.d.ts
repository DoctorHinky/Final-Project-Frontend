import type { QuizCreation as Quiz } from "./Create.Quiz.types";

export type PublishedArticleChapter = {
  title: string;
  content: string;
  chapterImage?: string;
};
export type PublishedArticle = {
  id: string;
  title: string;
  quickDescription: string;
  image: string;
  category: string;
  tags: string[];
  chapters: PublishedArticleChapter[];
  quiz?: Quiz;
  status: "published";
  updated_at: string;
  publishedAt?: string;
  // Neue Felder für Zielgruppe und Kategorien
  forKids: boolean;
  ageRestriction: number;
  categories: string[];
};
