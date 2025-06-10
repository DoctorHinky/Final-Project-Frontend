// src/services/bookmark.service.ts
import axiosInstance from './axiosInstance'; // ← KORRIGIERT: default import

export interface BookmarkData {
  id: string;
  articleId: string;
  userId: string;
  createdAt: string;
  article?: {
    id: string;
    title: string;
    quickDescription: string;
    image?: string;
    category: string;
    author: {
      username: string;
    };
  };
}

export interface BookmarkResponse {
  success: boolean;
  data: BookmarkData;
  message?: string;
}

export interface BookmarksListResponse {
  success: boolean;
  data: {
    bookmarks: BookmarkData[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message?: string;
}

class BookmarkService {
  private readonly baseUrl = '/api/bookmarks';

  /**
   * Lesezeichen hinzufügen
   */
  async addBookmark(articleId: string): Promise<BookmarkResponse> {
    try {
      const response = await axiosInstance.post(this.baseUrl, {
        articleId
      });
      return response.data;
    } catch (error: any) {
      console.error('Error adding bookmark:', error);
      throw new Error(error.response?.data?.message || 'Fehler beim Hinzufügen des Lesezeichens');
    }
  }

  /**
   * Lesezeichen entfernen
   */
  async removeBookmark(articleId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axiosInstance.delete(`${this.baseUrl}/${articleId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error removing bookmark:', error);
      throw new Error(error.response?.data?.message || 'Fehler beim Entfernen des Lesezeichens');
    }
  }

  /**
   * Lesezeichen-Status für einen Artikel abrufen
   */
  async getBookmarkStatus(articleId: string): Promise<boolean> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/status/${articleId}`);
      return response.data.isBookmarked || false;
    } catch (error: any) {
      console.error('Error getting bookmark status:', error);
      return false; // Bei Fehler als nicht markiert behandeln
    }
  }

  /**
   * Alle Lesezeichen des Benutzers abrufen
   */
  async getUserBookmarks(page: number = 1, limit: number = 20): Promise<BookmarksListResponse> {
    try {
      const response = await axiosInstance.get(this.baseUrl, {
        params: {
          page,
          limit
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user bookmarks:', error);
      throw new Error(error.response?.data?.message || 'Fehler beim Laden der Lesezeichen');
    }
  }
}

export const bookmarkService = new BookmarkService();