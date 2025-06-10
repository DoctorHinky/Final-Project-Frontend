export type QuizAnswer = {
  id?: string;
  answer: string;
  isCorrect: boolean;
};

export type QuizQuestion = {
  id?: string;
  question: string;
  answers: QuizAnswer[];
  explanation?: string; // Optional field for additional explanation
};

export type QuizCreation = {
  id?: string;
  questions: QuizQuestion[];
};
