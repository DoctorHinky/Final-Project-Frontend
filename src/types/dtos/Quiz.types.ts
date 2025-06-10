import type { Question } from "./Quiz.Question.types";

export type Quiz = {
  id: string;
  postId: string;

  questions: Question[];
};
