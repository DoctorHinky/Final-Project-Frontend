import { Chapter } from "./Chapter.types";
import type { QuizCreation as Quiz } from "./Create.Quiz.types";
export type Draft = {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  chapters: Chapter[];
  quiz?: Quiz;
  status: "draft";
  updated_at: string;
};
