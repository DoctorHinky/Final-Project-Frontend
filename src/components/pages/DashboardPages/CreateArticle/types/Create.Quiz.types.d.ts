export type QuizAnswer = {
  answer: string;
  isCorrect: boolean;
};

export type QuizQuestion = {
  question: string;
  answers: QuizAnswer[];
};

export type QuizCreation = {
  questions: QuizQuestion[];
};
