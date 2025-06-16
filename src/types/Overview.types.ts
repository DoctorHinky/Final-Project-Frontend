// src/types/Overview.types.ts

// Stats Card Interface
export interface StatCard {
  icon: string;
  label: string;
  value: string;
  color: string;
  animation?: 'pulse' | 'float' | 'bounce';
  trend?: number; // Positive/negative trend in %
}

// Overview Article Interface (basierend auf History + Post)
export interface OverviewArticle {
  id: string;
  title: string;
  quickDescription: string;
  category: string;
  author: string;
  date: string;
  image?: string;
  tags?: string[];
  
  // Reading Status
  status: 'reading' | 'completed' | 'just-started' | 'almost-done';
  currentChapter?: number;
  totalChapters?: number;
  lastRead: string;
  readingTime: string;
  difficulty: 'Einfach' | 'Mittel' | 'Fortgeschritten';
  
  // Quiz Info (falls vorhanden)
  hasQuiz?: boolean;
  quizCompleted?: boolean;
  quizScore?: number;
}

// Recommended Article Interface
export interface RecommendedArticle {
  id: string;
  title: string;
  preview: string;
  category: string;
  author: string;
  date: string;
  image?: string;
  tags?: string[];
  readingTime: string;
  difficulty: 'Einfach' | 'Mittel' | 'Fortgeschritten';
  coverImage?: string;
}

// Stats Dashboard Interface
export interface DashboardStats {
  readArticles: number;
  favorites: number;
  friends: number;
  completedQuizzes?: number;
  readingStreak?: number;
  totalReadingTime?: number;
}

// Backend History Response (erweitert)
export interface HistoryItem {
  id: string;
  postId: string;
  readAt: string;
  solvedAt: string | null;
  postTitle: string;
  postQuickDescription: string;
  postAuthor: string | null;
}

export interface HistoryResponse {
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: HistoryItem[];
}

// Post Response für Details
export interface PostDetails {
  id: string;
  title: string;
  quickDescription: string;
  category: string;
  image?: string;
  tags: string[];
  forKids: boolean;
  ageRestriction: number;
  author?: {
    id: string;
    username: string;
    profilePicture?: string;
  };
  chapters?: Array<{
    id: string;
    title?: string;
    content: string;
  }>;
  quiz?: {
    id: string;
    questions: Array<{
      id: string;
      question: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

// Overview Dashboard State
export interface OverviewDashboardState {
  stats: StatCard[];
  recentArticles: OverviewArticle[];
  recommendedArticles: RecommendedArticle[];
  isLoading: boolean;
  error: string | null;
}

// API Response Wrapper
export interface ApiResponse<T = any> {
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Friend Statistics
export interface FriendStats {
  totalFriends: number;
  onlineFriends: number;
  pendingRequests: number;
}

// Reading Statistics  
export interface ReadingStats {
  totalArticles: number;
  completedArticles: number;
  currentlyReading: number;
  totalReadingTime: number; // in minutes
  averageReadingTime: number;
  favoriteCategories: Array<{
    category: string;
    count: number;
  }>;
}