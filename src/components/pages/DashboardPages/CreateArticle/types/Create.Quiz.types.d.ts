export type QuizAnswer = {
  answer: string;
  isCorrect: boolean;
};

export type QuizQuestion = {
  question: string;
  answers: QuizAnswer[];
  explanation?: string; // Optional field for additional explanation
};

export type QuizCreation = {
  questions: QuizQuestion[];
};
