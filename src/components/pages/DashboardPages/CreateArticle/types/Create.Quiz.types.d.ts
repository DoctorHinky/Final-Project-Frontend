export type QuizAnswer = {
  text: string;
  isCorrect: boolean;
};

export type QuizQuestion = {
  text: string;
  answers: QuizAnswer[];
};

export type QuizCreation = {
  questions: QuizQuestion[];
};
