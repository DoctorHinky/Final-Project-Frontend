// src/services/comment.service.ts
import axiosInstance from './axiosInstance'; // ← KORRIGIERT: default import

export interface CommentData {
  id: string;
  articleId: string;
  userId: string;
  rating: number; // 1-5 Sterne
  comment?: string;
  isAnonymous: boolean;
  quizScore?: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    username: string;
    avatar?: string;
  };
  isOwner?: boolean; // Ob der aktuelle User der Autor ist
}

export interface CommentSubmissionData {
  articleId: string;
  rating: number;
  comment?: string;
  isAnonymous: boolean;
  quizScore?: number;
}

export interface CommentResponse {
  success: boolean;
  data: CommentData;
  message?: string;
}

export interface CommentsListResponse {
  success: boolean;
  data: {
    comments: CommentData[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    stats: {
      totalComments: number;
      averageRating: number;
      ratingDistribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
      };
    };
  };
  message?: string;
}

class CommentService {
  private readonly baseUrl = '/api/comments';

  /**
   * Kommentar abgeben
   */
  async submitComment(commentData: CommentSubmissionData): Promise<CommentResponse> {
    try {
      const response = await axiosInstance.post(this.baseUrl, commentData);
      return response.data;
    } catch (error: any) {
      console.error('Error submitting comment:', error);
      throw new Error(error.response?.data?.message || 'Fehler beim Abgeben des Kommentars');
    }
  }

  /**
   * Kommentare für einen Artikel abrufen
   */
  async getArticleComments(
    articleId: string,
    page: number = 1,
    limit: number = 10,
    sortBy: 'newest' | 'oldest' | 'rating' = 'newest'
  ): Promise<CommentsListResponse> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/article/${articleId}`, {
        params: {
          page,
          limit,
          sortBy
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching article comments:', error);
      throw new Error(error.response?.data?.message || 'Fehler beim Laden der Kommentare');
    }
  }

  /**
   * Eigenen Kommentar für einen Artikel abrufen
   */
  async getUserCommentForArticle(articleId: string): Promise<CommentData | null> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/my-comment/${articleId}`);
      return response.data.comment || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // Kein Kommentar vorhanden
      }
      console.error('Error fetching user comment:', error);
      throw new Error(error.response?.data?.message || 'Fehler beim Laden des Kommentars');
    }
  }

  /**
   * Prüfen ob User bereits einen Kommentar für diesen Artikel abgegeben hat
   */
  async hasUserCommentedOnArticle(articleId: string): Promise<boolean> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/has-commented/${articleId}`);
      return response.data.hasCommented || false;
    } catch (error: any) {
      console.error('Error checking comment status:', error);
      return false;
    }
  }
}

export const commentService = new CommentService();