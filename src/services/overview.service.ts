// src/services/overview.service.ts
import { historyService, type HistoryItem } from './history.service';
import { postService, type PostPreviewItem } from './post.service';
import friendService, { type FriendResponse } from './friend.service';

export interface DashboardStats {
  readArticles: number;
  favorites: number; // History count
  friends: number;
}

export interface RecentActivityArticle {
  id: number;
  title: string;
  preview?: string;
  category?: string;
  author?: string;
  date?: string;
  status?: string;
  currentChapter?: number;
  totalChapters?: number;
  lastRead?: string;
  readingTime?: string;
  difficulty?: 'Einfach' | 'Mittel' | 'Fortgeschritten';
}

export interface RecommendedArticle {
  id: number;
  title: string;
  preview?: string;
  category?: string;
  author?: string;
  date?: string;
  readingTime?: string;
  difficulty?: 'Einfach' | 'Mittel' | 'Fortgeschritten';
}

class OverviewService {
  /**
   * Lädt alle Dashboard-Statistiken
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [historyResponse, friendsResponse] = await Promise.allSettled([
        historyService.getHistory(1, 1), // Nur Meta-Daten für Count
        friendService.getAllFriendsOfUser()
      ]);

      // History Count für "Favoriten" und "Gelesene Artikel"
      const historyCount = historyResponse.status === 'fulfilled' 
        ? historyResponse.value.meta.total 
        : 0;

      // Friends Count
      const friendsCount = friendsResponse.status === 'fulfilled'
        ? friendsResponse.value.data.length
        : 0;

      return {
        readArticles: historyCount, // Gelesene Artikel = History-Einträge
        favorites: historyCount,    // Favoriten = History-Einträge (wie gewünscht)
        friends: friendsCount
      };
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      return {
        readArticles: 0,
        favorites: 0,
        friends: 0
      };
    }
  }

  /**
   * ✅ FIX: Lädt kürzlich gelesene Artikel über bestehendes History-Endpoint
   */
  async getRecentActivities(): Promise<RecentActivityArticle[]> {
    try {
      // ✅ Nutze bestehendes getHistory statt getRecentlyRead (existiert nicht im Backend)
      const historyResponse = await historyService.getHistory(1, 3); // Seite 1, 3 Artikel
      
      // ✅ FIX: Arrow-Funktion verwenden um this-Kontext zu behalten
      return historyResponse.data.map((item: any) => this.convertHistoryToRecentActivity(item));
    } catch (error) {
      console.error('Error loading recent activities:', error);
      return [];
    }
  }

  /**
   * Lädt empfohlene Artikel (neueste Posts über getPreviews)
   */
  async getRecommendedArticles(): Promise<RecommendedArticle[]> {
    try {
      // Nutze getPreviews mit kleinem Limit für "neueste" Posts
      const response = await postService.getPostPreviews(1, 3); // Seite 1, 3 Artikel
      
      // ✅ FIX: Arrow-Funktion verwenden um this-Kontext zu behalten
      return response.data.map((post: PostPreviewItem) => this.convertPostToRecommended(post));
    } catch (error) {
      console.error('Error loading recommended articles:', error);
      return [];
    }
  }

  /**
   * Lädt alle Dashboard-Daten gleichzeitig
   */
  async getAllDashboardData(): Promise<{
    stats: DashboardStats;
    recentActivities: RecentActivityArticle[];
    recommendedArticles: RecommendedArticle[];
  }> {
    try {
      const [stats, recentActivities, recommendedArticles] = await Promise.allSettled([
        this.getDashboardStats(),
        this.getRecentActivities(),
        this.getRecommendedArticles()
      ]);

      return {
        stats: stats.status === 'fulfilled' ? stats.value : { readArticles: 0, favorites: 0, friends: 0 },
        recentActivities: recentActivities.status === 'fulfilled' ? recentActivities.value : [],
        recommendedArticles: recommendedArticles.status === 'fulfilled' ? recommendedArticles.value : []
      };
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      return {
        stats: { readArticles: 0, favorites: 0, friends: 0 },
        recentActivities: [],
        recommendedArticles: []
      };
    }
  }

  /**
   * ✅ ANGEPASST: Konvertiert History-Item zu Recent Activity Format (für normales History-Response)
   */
  private convertHistoryToRecentActivity(historyItem: any): RecentActivityArticle {
    // Bestimme Status basierend auf solvedAt
    const status = historyItem.solvedAt ? 'almost-done' : 'in-progress';
    
    // Dummy-Werte für nicht verfügbare Felder
    const totalChapters = 6; // Default-Wert
    const currentChapter = status === 'almost-done' ? totalChapters - 1 : Math.floor(Math.random() * totalChapters) + 1;
    
    return {
      id: parseInt(historyItem.postId), // Convert string to number
      title: historyItem.postTitle,
      preview: historyItem.postQuickDescription,
      category: historyItem.postCategory || 'Allgemein',
      author: historyItem.postAuthor || 'Unbekannt',
      date: historyItem.readAt,
      status,
      currentChapter,
      totalChapters,
      lastRead: this.formatRelativeTime(historyItem.readAt),
      readingTime: this.estimateReadingTime(historyItem.postQuickDescription || ''),
      difficulty: this.mapCategoryToDifficulty(historyItem.postCategory || 'OTHER')
    };
  }

  /**
   * Konvertiert Post-Preview zu Recommended Article Format
   */
  private convertPostToRecommended(post: PostPreviewItem): RecommendedArticle {
    return {
      id: parseInt(post.id), // Convert string to number
      title: post.title,
      preview: post.quickDescription,
      category: post.category,
      author: post.author,
      date: this.formatGermanDate(post.createdAt),
      readingTime: this.estimateReadingTime(post.quickDescription),
      difficulty: this.mapCategoryToDifficulty(post.category)
    };
  }

  /**
   * Formatiert Datum relativ (z.B. "vor 2 Stunden")
   */
  private formatRelativeTime(dateString: string): string {
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
      return 'vor einer Woche';
    }
  }

  /**
   * Formatiert Datum im deutschen Format
   */
  private formatGermanDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Schätzt Lesezeit basierend auf Text-Länge
   */
  private estimateReadingTime(text: string): string {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    const minutes = Math.max(1, Math.round(wordCount / wordsPerMinute));
    
    if (minutes < 60) {
      return `${minutes} Min.`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  }

  /**
   * Mappt Kategorie zu Schwierigkeitsgrad
   */
  private mapCategoryToDifficulty(category: string): 'Einfach' | 'Mittel' | 'Fortgeschritten' {
    const difficultyMap: Record<string, 'Einfach' | 'Mittel' | 'Fortgeschritten'> = {
      'BASICS': 'Einfach',
      'EDUCATION': 'Mittel',
      'HEALTH': 'Mittel',
      'PSYCHOLOGY': 'Fortgeschritten',
      'ACTIVITIES': 'Einfach',
      'RELATIONSHIP': 'Mittel',
      'OTHER': 'Mittel'
    };
    
    return difficultyMap[category.toUpperCase()] || 'Mittel';
  }
}

export const overviewService = new OverviewService();