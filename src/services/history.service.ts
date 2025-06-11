// src/services/history.service.ts
import axiosInstance from './axiosInstance';

export interface HistoryItem {
  id: string;
  postId: string;
  readAt: string;
  solvedAt: string | null;
  postTitle: string;
  postQuickDescription: string;
  postAuthor: string | null;
  // ✅ ERWEITERT für Bild-Support:
  postImage?: string | null;              // Bild-URL vom Backend
  postPublicIdImage?: string | null;      // Cloudinary Public ID
  postCategory?: string;                  // Kategorie  
  postTags?: string[];                    // Tags
  postIsCertifiedAuthor?: boolean;        // Zertifizierter Autor
  postCreatedAt?: string;                 // Original-Erstellungsdatum
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

export interface MarkAsReadResponse {
  message: string;
  data: {
    id: string;
    userId: string;
    postId: string;
    readAt: string;
  };
}

// Neue Interfaces für erweiterte Funktionen
export interface ReadingProgress {
  postId: string;
  currentChapter?: number;
  readingProgress: number; // 0-100
  lastReadAt: string;
  timeSpent: number; // in Sekunden
}

export interface ReadingStats {
  totalArticlesRead: number;
  totalReadingTime: number; // in Sekunden
  articlesThisWeek: number;
  articlesThisMonth: number;
  averageReadingTime: number;
  readingStreak: number; // Tage in Folge
}

// ✅ NEU: Converter für MyArticles
export const convertHistoryToMyArticle = (historyItem: HistoryItem): any => {
  return {
    // History-Daten
    historyId: historyItem.id,
    readAt: historyItem.readAt,
    solvedAt: historyItem.solvedAt,
    
    // Post-Daten (von den neuen Backend-Feldern)
    id: historyItem.postId,
    title: historyItem.postTitle,
    quickDescription: historyItem.postQuickDescription,
    image: historyItem.postImage || null,              // ← JETZT VERFÜGBAR!
    author: historyItem.postAuthor || 'Unbekannt',
    category: historyItem.postCategory || 'OTHER',
    tags: historyItem.postTags || [],
    createdAt: historyItem.postCreatedAt || historyItem.readAt,
    isCertifiedAuthor: historyItem.postIsCertifiedAuthor || false,
    
    // Computed Felder
    lastRead: formatDateForMyArticles(historyItem.readAt),
    status: historyItem.solvedAt ? 'completed' : 'reading',
    
    // Zusätzliche Felder
    publicIdImage: historyItem.postPublicIdImage
  };
};

// ✅ NEU: Helper für Datum-Formatierung für MyArticles
const formatDateForMyArticles = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Gerade eben';
  } else if (diffInHours < 24) {
    return `vor ${diffInHours} Stunde${diffInHours > 1 ? 'n' : ''}`;
  } else if (diffInHours < 168) { // 7 Tage
    const days = Math.floor(diffInHours / 24);
    return `vor ${days} Tag${days > 1 ? 'en' : ''}`;
  } else {
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
};

class HistoryService {
  private readonly baseUrl = '/history';

  /**
   * Benutzer-Lesehistorie abrufen (paginiert)
   */
  async getHistory(page: number = 1, limit: number = 10): Promise<HistoryResponse> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching history:', error);
      throw new Error('Fehler beim Laden der Lesehistorie');
    }
  }

  /**
   * ✅ NEU: Geschichte für MyArticles abrufen (mit Converter)
   */
  async getHistoryForMyArticles(page: number = 1, limit: number = 10): Promise<{
    articles: any[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const historyResponse = await this.getHistory(page, limit);
      
      // Konvertiere History-Items zu MyArticle-Format
      const articles = historyResponse.data.map(convertHistoryToMyArticle);
      
      return {
        articles,
        meta: historyResponse.meta
      };
    } catch (error) {
      console.error('Error fetching history for MyArticles:', error);
      throw new Error('Fehler beim Laden der Artikel-Historie');
    }
  }

  /**
   * Artikel als gelesen markieren
   */
  async markAsRead(postId: string): Promise<MarkAsReadResponse> {
    try {
      const response = await axiosInstance.post(`${this.baseUrl}/add/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Error marking post as read:', error);
      throw new Error('Fehler beim Markieren als gelesen');
    }
  }

  /**
   * Artikel aus Historie entfernen
   */
  async removeFromHistory(historyId: string): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.patch(`${this.baseUrl}/remove/${historyId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing from history:', error);
      throw new Error('Fehler beim Entfernen aus der Historie');
    }
  }

  /**
   * Komplette Historie löschen
   */
  async clearHistory(): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.delete(`${this.baseUrl}/clearHistory`);
      return response.data;
    } catch (error) {
      console.error('Error clearing history:', error);
      throw new Error('Fehler beim Löschen der Historie');
    }
  }

  // ========== NEUE FUNKTIONEN FÜR ERWEITERTEN ARTICLEREADER ==========

  /**
   * Lesefortschritt für einen Artikel abrufen
   */
  async getReadingProgress(postId: string): Promise<ReadingProgress | null> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/progress/${postId}`);
      return response.data.progress || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // Noch nicht gelesen
      }
      console.error('Error fetching reading progress:', error);
      return null;
    }
  }

  /**
   * Lesefortschritt aktualisieren (für Kapitel-Navigation)
   */
  async updateReadingProgress(
    postId: string,
    currentChapter?: number,
    readingProgress: number = 0,
    timeSpent: number = 0
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axiosInstance.put(`${this.baseUrl}/progress/${postId}`, {
        currentChapter,
        readingProgress,
        timeSpent
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating reading progress:', error);
      // Nicht kritisch - sollte den Reader nicht blockieren
      return { success: false, message: 'Fortschritt konnte nicht gespeichert werden' };
    }
  }

  /**
   * Prüfen ob Artikel bereits gelesen wurde
   */
  async hasReadArticle(postId: string): Promise<boolean> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/hasRead/${postId}`);
      return response.data.hasRead || false;
    } catch (error: any) {
      console.error('Error checking if article was read:', error);
      return false;
    }
  }

  /**
   * Quiz als gelöst markieren
   */
  async markQuizSolved(postId: string, score?: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axiosInstance.post(`${this.baseUrl}/quizSolved/${postId}`, {
        score
      });
      return response.data;
    } catch (error: any) {
      console.error('Error marking quiz as solved:', error);
      throw new Error(error.response?.data?.message || 'Fehler beim Speichern des Quiz-Ergebnisses');
    }
  }

  /**
   * ✅ FIX: Kürzlich gelesene Artikel über normales History-Endpoint abrufen
   */
  async getRecentlyRead(limit: number = 5): Promise<HistoryItem[]> {
    try {
      // ✅ Nutze bestehendes getHistory statt nicht-existierenden /recent Endpunkt
      const response = await this.getHistory(1, limit);
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching recently read:', error);
      return [];
    }
  }

  /**
   * Lese-Statistiken abrufen
   */
  async getReadingStats(): Promise<ReadingStats> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/stats`);
      return response.data.stats;
    } catch (error: any) {
      console.error('Error fetching reading stats:', error);
      return {
        totalArticlesRead: 0,
        totalReadingTime: 0,
        articlesThisWeek: 0,
        articlesThisMonth: 0,
        averageReadingTime: 0,
        readingStreak: 0
      };
    }
  }

  /**
   * Lesezeit für heute abrufen
   */
  async getTodayReadingTime(): Promise<number> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/todayTime`);
      return response.data.readingTime || 0;
    } catch (error: any) {
      console.error('Error fetching today reading time:', error);
      return 0;
    }
  }

  /**
   * Historie nach Kategorie filtern
   */
  async getHistoryByCategory(
    category: string,
    page: number = 1,
    limit: number = 10
  ): Promise<HistoryResponse> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/category/${category}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching history by category:', error);
      throw new Error('Fehler beim Laden der gefilterten Historie');
    }
  }

  /**
   * Historie durchsuchen
   */
  async searchHistory(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<HistoryResponse> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/search`, {
        params: { query, page, limit }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error searching history:', error);
      throw new Error('Fehler bei der Suche in der Historie');
    }
  }

  /**
   * Wöchentliche Aktivität abrufen (für Statistiken)
   */
  async getWeeklyActivity(): Promise<Array<{
    date: string;
    articlesRead: number;
    readingTime: number;
  }>> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/weeklyActivity`);
      return response.data.activity || [];
    } catch (error: any) {
      console.error('Error fetching weekly activity:', error);
      return [];
    }
  }

  /**
   * Export der Lesehistorie
   */
  async exportHistory(): Promise<HistoryItem[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/export`);
      return response.data.history || [];
    } catch (error: any) {
      console.error('Error exporting history:', error);
      throw new Error('Fehler beim Exportieren der Historie');
    }
  }

  // ========== HILFSFUNKTIONEN ==========

  /**
   * HistoryItem zu BaseArticleItem für ArticleReader konvertieren
   */
  convertHistoryToArticleItem(historyItem: HistoryItem): any {
    return {
      id: historyItem.postId,
      title: historyItem.postTitle,
      quickDescription: historyItem.postQuickDescription,
      image: historyItem.postImage, // ✅ Jetzt mit Bild-Support
      author: {
        username: historyItem.postAuthor || 'Unbekannt'
      },
      hasRead: true,
      readAt: historyItem.readAt,
      quizSolved: !!historyItem.solvedAt
    };
  }

  /**
   * ✅ NEU: Bulk-Konvertierung für MyArticles
   */
  convertHistoryListToMyArticles(historyItems: HistoryItem[]): any[] {
    return historyItems.map(convertHistoryToMyArticle);
  }

  /**
   * Lesezeit in menschenlesbares Format konvertieren
   */
  formatReadingTime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds} Sekunden`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} Minute${minutes !== 1 ? 'n' : ''}`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours} Stunde${hours !== 1 ? 'n' : ''} ${minutes > 0 ? `${minutes} Min` : ''}`;
    }
  }
}

export const historyService = new HistoryService();