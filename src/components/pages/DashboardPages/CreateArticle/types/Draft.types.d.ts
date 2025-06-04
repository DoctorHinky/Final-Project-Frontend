import { Chapter } from "./Chapter.types";
import type { QuizCreation as Quiz } from "./Create.Quiz.types";
export type Draft = {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  chapters: Chapter[];
  quiz?: Quiz;
  status: "draft" | "published" | "archived";
  updated_at: string;
  publishedAt?: string;
};
