export type Answer = {
  id?: string;
  answer: string;
  isCorrect: boolean;
};

export type Question = {
  id?: string;
  question: string;
  answers: Answer[];
  explanation?: string; // Optional field for additional explanation
};

export type Quiz = {
  id?: string;
  questions: Question[];
};
