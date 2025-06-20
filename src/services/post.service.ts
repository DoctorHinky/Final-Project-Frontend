// src/services/post.service.ts
import type { Chapter } from "@/types/dtos";
import axiosInstance from "./axiosInstance";
import type { Article as FullPost, Article } from "@/types/dtos/Article.types";

// Response-Typen für Backend
export interface PostPreviewItem {
  id: string;
  title: string;
  quickDescription: string;
  image: string | null;
  author: {
    id?: string;
    username: string;
    profilePicture?: string | null;
  };
  category: string;
  publishedAt: string;
  createdAt: string;
  tags: string[];
  isCertifiedAuthor: boolean;
}

export interface PostPreviewsResponse {
  meta: {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
  };
  data: PostPreviewItem[];
}
export interface PostResponse {
  message: string;
  data: FullPost;
}

// Neue Typen für erweiterte Funktionen
export interface PostStats {
  views: number;
  likes: number;
  bookmarks: number;
  shares: number;
  comments: number;
  averageRating: number;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  tags?: string[];
  author?: string;
  difficulty?: string;
  hasQuiz?: boolean;
}

class PostService {
  private readonly baseUrl = "/article";

  /**
   * Post-Previews für Startseite/Library abrufen (paginiert)
   */
  async getPostPreviews(page: number = 1, limit: number = 10): Promise<PostPreviewsResponse> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/getPreviews`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching post previews:", error);
      throw new Error("Fehler beim Laden der Artikel-Vorschauen");
    }
  }

  /**
   * Vollständigen Artikel nach ID laden
   */
  async getPostById(postId: string): Promise<PostResponse> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/getPostById/${postId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching post by ID:", error);
      throw new Error("Fehler beim Laden des Artikels");
    }
  }

  /**
   * Artikel für aktuellen Benutzer abrufen (berücksichtigt Altersfreigaben)
   */
  async getPostsForUser(): Promise<{ message: string; data: FullPost[] }> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/getPostForUser`);
      return response.data;
    } catch (error) {
      console.error("Error fetching posts for user:", error);
      throw new Error("Fehler beim Laden der Benutzer-Artikel");
    }
  }

  /**
   * Artikel eines bestimmten Autors abrufen
   */
  async getPostsByAuthor(authorId: string, published?: boolean): Promise<{ posts: FullPost[] }> {
    try {
      const params: Record<string, any> = {};
      if (typeof published === "boolean") {
        params.published = published.toString();
      }

      const response = await axiosInstance.get(`${this.baseUrl}/getPostByAuthor/${authorId}`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching posts by author:", error);
      throw new Error("Fehler beim Laden der Autor-Artikel");
    }
  }

  // ========== NEUE FUNKTIONEN FÜR ERWEITERTEN ARTICLEREADER ==========

  /**
   * Artikel-Ansicht registrieren (für Statistiken)
   */
  async recordView(articleId: string): Promise<void> {
    try {
      await axiosInstance.post(`${this.baseUrl}/recordView/${articleId}`);
    } catch (error) {
      console.warn("Could not record article view:", error);
      // Fehler beim Registrieren der Ansicht sollte nicht kritisch sein
    }
  }

  /**
   * Artikel liken/unliken
   */
  async toggleLike(articleId: string): Promise<{
    success: boolean;
    isLiked: boolean;
    likesCount: number;
    message?: string;
  }> {
    try {
      const response = await axiosInstance.post(`${this.baseUrl}/toggleLike/${articleId}`);
      return response.data;
    } catch (error: any) {
      console.error("Error toggling like:", error);
      throw new Error(error.response?.data?.message || "Fehler beim Liken des Artikels");
    }
  }

  /**
   * Artikel teilen (Share-Count erhöhen)
   */
  async recordShare(articleId: string, platform?: string): Promise<void> {
    try {
      await axiosInstance.post(`${this.baseUrl}/recordShare/${articleId}`, { platform });
    } catch (error) {
      console.warn("Could not record article share:", error);
      // Fehler beim Registrieren des Teilens sollte nicht kritisch sein
    }
  }

  /**
   * Artikel-Statistiken abrufen
   */
  async getPostStats(articleId: string): Promise<PostStats> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/getStats/${articleId}`);
      return response.data.stats;
    } catch (error: any) {
      console.error("Error fetching post stats:", error);
      return {
        views: 0,
        likes: 0,
        bookmarks: 0,
        shares: 0,
        comments: 0,
        averageRating: 0,
      };
    }
  }

  /**
   * Ähnliche Artikel abrufen
   */
  async getSimilarPosts(articleId: string, limit: number = 5): Promise<PostPreviewItem[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/getSimilar/${articleId}`, {
        params: { limit },
      });
      return response.data.articles || [];
    } catch (error: any) {
      console.error("Error fetching similar posts:", error);
      return [];
    }
  }

  /**
   * Artikel nach Kategorie abrufen
   */
  async getPostsByCategory(category: string, page: number = 1, limit: number = 10): Promise<PostPreviewsResponse> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/getByCategory/${category}`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error: any) {
      console.error("Error fetching posts by category:", error);
      throw new Error("Fehler beim Laden der Artikel nach Kategorie");
    }
  }

  /**
   * Artikel durchsuchen
   */
  async searchPosts(filters: SearchFilters, page: number = 1, limit: number = 10): Promise<PostPreviewsResponse> {
    try {
      const params = {
        page,
        limit,
        ...filters,
      };

      const response = await axiosInstance.get(`${this.baseUrl}/search`, { params });
      return response.data;
    } catch (error: any) {
      console.error("Error searching posts:", error);
      throw new Error("Fehler bei der Artikelsuche");
    }
  }

  /**
   * Beliebte Artikel abrufen
   */
  async getPopularPosts(
    timeframe: "today" | "week" | "month" | "all" = "week",
    limit: number = 10
  ): Promise<PostPreviewItem[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/getPopular`, {
        params: { timeframe, limit },
      });
      return response.data.articles || [];
    } catch (error: any) {
      console.error("Error fetching popular posts:", error);
      return [];
    }
  }

  /**
   * Neueste Artikel abrufen
   */
  async getLatestPosts(limit: number = 10): Promise<PostPreviewItem[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/getLatest`, {
        params: { limit },
      });
      return response.data.articles || [];
    } catch (error: any) {
      console.error("Error fetching latest posts:", error);
      return [];
    }
  }

  /**
   * Empfohlene Artikel für den Benutzer abrufen
   */
  async getRecommendedPosts(limit: number = 10): Promise<PostPreviewItem[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/getRecommended`, {
        params: { limit },
      });
      return response.data.articles || [];
    } catch (error: any) {
      console.error("Error fetching recommended posts:", error);
      return [];
    }
  }

  /**
   * Verfügbare Kategorien abrufen
   */
  async getCategories(): Promise<Array<{ id: string; name: string; count: number }>> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/getCategories`);
      return response.data.categories || [];
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }

  /**
   * Trending Tags abrufen
   */
  async getTrendingTags(limit: number = 20): Promise<Array<{ tag: string; count: number }>> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/getTrendingTags`, {
        params: { limit },
      });
      return response.data.tags || [];
    } catch (error: any) {
      console.error("Error fetching trending tags:", error);
      return [];
    }
  }

  /**
   * Artikel melden
   */
  async reportPost(
    articleId: string,
    reason: string,
    description?: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axiosInstance.post(`${this.baseUrl}/report/${articleId}`, {
        reason,
        description,
      });
      return response.data;
    } catch (error: any) {
      console.error("Error reporting post:", error);
      throw new Error(error.response?.data?.message || "Fehler beim Melden des Artikels");
    }
  }

  /**
   * Prüfen ob Artikel bereits vom User geliked wurde
   */
  async getLikeStatus(articleId: string): Promise<boolean> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/getLikeStatus/${articleId}`);
      return response.data.isLiked || false;
    } catch (error: any) {
      console.error("Error getting like status:", error);
      return false;
    }
  }

  // ========== BESTEHENDE KONVERTIERUNGSFUNKTIONEN ==========

  /**
   * Artikel-Vorschau in vereinfachtes Format konvertieren
   */
  convertPreviewToArticle(preview: PostPreviewItem): Partial<Article> {
    return {
      id: preview.id,
      title: preview.title,
      quickDescription: preview.quickDescription,
      image: preview.image || "",
      tags: preview.tags,
      category: preview.category as any,
      isCertifiedAuthor: preview.isCertifiedAuthor,
      createdAt: preview.createdAt,
      // Dummy-Werte für nicht verfügbare Felder
      forKids: false,
      ageRestriction: 0,
      authorId: null,
      moderatorId: null,
      published: true,
      publishedAt: preview.createdAt,
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      deleteReason: null,
      updatedAt: preview.createdAt,
      popularityScore: 0,
    };
  }

  /**
   * Vollständigen Post in Article-Format konvertieren
   */
  convertFullPostToArticle(post: FullPost): Article {
    return {
      id: post.id,
      title: post.title,
      quickDescription: post.quickDescription,
      image: post.image || "",
      tags: post.tags,
      forKids: post.forKids,
      ageRestriction: post.ageRestriction,
      category: post.category as any,
      isCertifiedAuthor: post.isCertifiedAuthor,
      authorId: post.authorId,
      moderatorId: post.moderatorId,
      published: post.published,
      publishedAt: post.publishedAt,
      isDeleted: post.isDeleted,
      deletedAt: post.deletedAt,
      deletedBy: post.deletedBy,
      deleteReason: post.deleteReason,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      popularityScore: post.popularityScore,
      quiz: post.quiz,
      chapters: post.chapters,
    };
  }

  /**
   * FullPost zu BaseArticleItem für ArticleReader konvertieren
   */
  convertToBaseArticleItem(post: FullPost): any {
    return {
      id: post.id,
      title: post.title,
      quickDescription: post.quickDescription,
      image: post.image,
      category: post.category,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: {
        id: post.authorId || "",
        username: post.author?.username || "Unbekannt",
        avatar: null,
      },
      readingTime: this.estimateReadingTime(post.chapters),
    };
  }

  /**
   * Lesezeit basierend auf Kapiteln schätzen
   */
  private estimateReadingTime(chapters: Chapter[]): number {
    const wordsPerMinute = 120; // Durchschnittliche Lesegeschwindigkeit
    let totalWords = 0;

    chapters.forEach((chapter) => {
      // Grobe Schätzung: HTML-Tags entfernen und Wörter zählen
      const textContent = chapter.content.replace(/<[^>]*>/g, "");
      totalWords += textContent.split(/\s+/).length;
    });

    return Math.max(1, Math.round(totalWords / wordsPerMinute));
  }
}

export const postService = new PostService();
