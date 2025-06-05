import type { QuizCreation as Quiz } from "./Create.Quiz.types";

export type PublishedArticleChapter = {
  title: string;
  content: string;
  chapterImage?: string;
};

export type PublishedArticle = {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  chapters: PublishedArticleChapter[];
  quiz?: Quiz;
  status: "published";
  publishDate: string;
  // Neue Felder für Zielgruppe und Kategorien
  forKids: boolean;
  ageRestriction: number;
  categories: string[];
};