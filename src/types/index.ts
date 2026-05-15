export interface VocabularyItem {
  id: string;
  german: string;
  arabic: string;
  germanExample: string;
  arabicExample: string;
  category: VocabularyCategory;
  isFavorite?: boolean;
  pronunciation?: string;
}

export type VocabularyCategory =
  | "car-interior"
  | "driving-actions"
  | "traffic-instructions"
  | "parking"
  | "emergency"
  | "examiner-phrases";

export interface TrafficSign {
  id: string;
  germanName: string;
  arabicName: string;
  description: string;
  arabicDescription: string;
  rules: string[];
  arabicRules: string[];
  examples: string[];
  arabicExamples: string[];
  category: TrafficSignCategory;
  imageUrl?: string;
  svgIcon?: string;
  isFavorite?: boolean;
}

export type TrafficSignCategory =
  | "warning"
  | "regulatory"
  | "information"
  | "priority"
  | "prohibition"
  | "direction";

export interface TheoryQuestion {
  id: string;
  question: string;
  germanQuestion?: string;
  answers: string[];
  correctAnswer: number;
  explanation: string;
  germanExplanation?: string;
  category: TheoryCategory;
  difficulty: "easy" | "medium" | "hard";
  isFavorite?: boolean;
  tags?: string[];
}

export type TheoryCategory =
  | "traffic-rules"
  | "road-signs"
  | "vehicle-safety"
  | "first-aid"
  | "environment"
  | "driving-behavior";

export interface PersonalNote {
  id: string;
  title: string;
  content: string;
  category: string;
  isSolved: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface QuizState {
  questions: TheoryQuestion[];
  currentIndex: number;
  selectedAnswer: number | null;
  answers: Record<string, number>;
  isCompleted: boolean;
  score: number;
  startTime: Date | null;
  endTime: Date | null;
}

export interface AppStats {
  vocabularyLearned: number;
  signsLearned: number;
  quizzesCompleted: number;
  totalScore: number;
  streak: number;
  lastStudyDate: string | null;
}

export interface SearchResult {
  type: "vocabulary" | "sign" | "question" | "note";
  id: string;
  title: string;
  subtitle: string;
}
