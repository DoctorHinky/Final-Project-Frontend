import { Chapter } from "./Chapter.types";
import type { QuizCreation as Quiz } from "./Create.Quiz.types";

export type Draft = {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  tags: string[];
  chapters: Chapter[];
  quiz?: Quiz;
  status: "draft" | "published" | "archived";
  updated_at: string;
  publishedAt?: string;
  // Neue Felder für Zielgruppe und Kategorien
  forKids: boolean;
  ageRestriction: number;
  categories: string[];
};