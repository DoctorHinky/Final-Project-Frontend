import type { Answer } from "./Quiz.Answers.types";

export type Question = {
  id: string;
  quizId: string;
  question: string;
  explanation: string | null;
  answers: Answer[];
};
