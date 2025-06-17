// src/services/admin.post.service.ts
import api from "./axiosInstance";
import type { Article as Post } from "@/types/dtos/Article.types";

interface PostsResponse {
  data: Post[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
  };
}

/* interface Report {
  reporterName: string;
  reportedAt: Date;
  reason: string;
  description: string;
} */

/* interface AdminPost extends Post {
  reportCount?: number;
  reports?: Report[];
  views: number;
} */

class AdminPostService {
  /**
   * Holt alle Posts mit Admin-Rechten (inkl. unveröffentlichte)
   */
  async getAllPosts(params?: { page?: number; limit?: number; search?: string }): Promise<PostsResponse> {
    try {
      const response = await api.get("/article/getPreviews", {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
        },
      });

      // Response-Struktur anpassen
      if (response.data?.data && response.data?.meta) {
        return response.data;
      }

      // Fallback für andere Response-Strukturen
      return {
        data: Array.isArray(response.data) ? response.data : [],
        meta: {
          currentPage: params?.page || 1,
          totalPages: 1,
          totalPosts: Array.isArray(response.data) ? response.data.length : 0,
        },
      };
    } catch (error) {
      console.error("Fehler beim Abrufen der Posts:", error);
      throw error;
    }
  }

  /**
   * Holt einen einzelnen Post mit Details
   */

  // von AdminPost zu Post geändert, subtypes sind haluziniert
  async getPostById(postId: string): Promise<Post> {
    try {
      const response = await api.get(`/article/getPostById/${postId}`);
      return response.data.data;
    } catch (error) {
      console.error("Fehler beim Abrufen des Posts:", error);
      throw error;
    }
  }

  /**
   * Veröffentlicht einen Post
   */
  async publishPost(postId: string): Promise<void> {
    try {
      await api.patch(`/article/publishPost/${postId}`);
    } catch (error) {
      console.error("Fehler beim Veröffentlichen:", error);
      throw error;
    }
  }

  /**
   * Nimmt einen Post vom Netz
   */
  async unpublishPost(postId: string): Promise<void> {
    try {
      await api.patch(`/article/unpublishPost/${postId}`);
    } catch (error) {
      console.error("Fehler beim Unpublish:", error);
      throw error;
    }
  }

  /**
   * Löscht einen Post (soft delete)
   */
  async deletePost(postId: string, reason: string): Promise<void> {
    try {
      await api.patch(`/article/deletePost/${postId}`, { reason });
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
      throw error;
    }
  }

  /**
   * Stellt einen gelöschten Post wieder her
   */
  async restorePost(postId: string): Promise<void> {
    try {
      await api.patch(`/article/restorePost/${postId}`);
    } catch (error) {
      console.error("Fehler beim Wiederherstellen:", error);
      throw error;
    }
  }
}

export default new AdminPostService();
