// src/services/chat.service.ts - FUNKTIONIERT MIT BACKEND
import api from "./axiosInstance";

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  messageType: "TEXT" | "FILE" | "COMBINED" | "SYSTEM";
  attachmentUrl?: string | null;
  isRead: boolean;
  isEdited?: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  messages: ChatMessage[];
  _count?: {
    messages: number;
  };
}

export interface ConversationPreview {
  id: string;
  otherUserId: string;
  otherUsername: string;
  otherProfilePicture: string | null;
  lastMessage: {
    id: string;
    content: string | null;
    createdAt: string;
  } | null;
  updatedAt: string;
  unreadCount?: number;
}

export interface SendMessageResponse {
  message: {
    id: string;
    content: string | null;
    attachmentUrl: string | null;
    messageType: string;
    conversationId: string;
    senderId: string;
  };
}

class ChatService {
  /**
   * Erstellt oder lädt eine Conversation mit einem anderen User
   * POST /conversation/create/:targetId
   */
  async createOrGetConversation(targetUserId: string): Promise<Conversation> {
    try {
      const response = await api.post(`/conversation/create/${targetUserId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || "Bad Request";
        if (message.includes("friends")) {
          throw new Error("Du kannst nur mit Freunden chatten. Sende zuerst eine Freundschaftsanfrage.");
        }
      }
      throw error;
    }
  }

  /**
   * Lädt eine spezifische Conversation mit allen Nachrichten
   */
  async getConversation(conversationId: string): Promise<Conversation> {
    try {
      const response = await api.get(`/conversation/${conversationId}`);
      return response.data;
    } catch (error) {
      throw new Error("Fehler beim Laden der Conversation.");
    }
  }

  /**
   * Lädt alle Conversations des aktuellen Users
   */
  async getAllConversations(): Promise<ConversationPreview[]> {
    try {
      const response = await api.get("/conversation/loadPreview");
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("Nicht authentifiziert. Bitte neu anmelden.");
      }
      if (error.response?.status === 400) {
        throw new Error("Fehlerhafte Anfrage beim Laden der Chats.");
      }
      if (error.response?.status === 404) {
        return []; // keine Conversations
      }
      throw error;
    }
  }

  /**
   * Holt die Gesamtanzahl ungelesener Nachrichten
   * Optional: Nur für eine Conversation oder global
   */
  async getUnreadMessageCount(conversationId?: string): Promise<number> {
    try {
      if (conversationId) {
        const conversation = await this.getConversation(conversationId);
        return conversation.messages?.filter((msg) => !msg.isRead).length || 0;
      } else {
        const conversations = await this.getAllConversations();
        const previewsToCheck = conversations.slice(0, 5);

        let totalUnread = 0;
        for (const preview of previewsToCheck) {
          try {
            const fullConversation = await this.getConversation(preview.id);
            totalUnread += fullConversation.messages?.filter((msg) => !msg.isRead).length || 0;
          } catch {
            continue; // Wenn eine Conversation fehlschlägt, mach mit der nächsten weiter
          }
        }

        return totalUnread;
      }
    } catch {
      return 0;
    }
  }

  /**
   * Sendet eine Textnachricht
   */
  async sendMessage(conversationId: string, message: string): Promise<SendMessageResponse> {
    try {
      const formData = new FormData();
      formData.append("message", message.trim());

      const response = await api.post(`/chat/send/${conversationId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Conversation nicht gefunden.");
      }
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || "Nachricht konnte nicht gesendet werden.");
      }
      throw error;
    }
  }

  /**
   * Sendet eine Nachricht mit Datei-Anhang
   */
  async sendMessageWithFile(conversationId: string, message: string, file: File): Promise<SendMessageResponse> {
    try {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];
      const maxSize = 10 * 1024 * 1024;

      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Dateityp ${file.type} ist nicht erlaubt.`);
      }
      if (file.size > maxSize) {
        throw new Error(`Datei zu groß (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: 10MB.`);
      }

      const formData = new FormData();
      if (message.trim()) formData.append("message", message.trim());
      formData.append("file", file);

      const response = await api.post(`/chat/send/${conversationId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    } catch (error: any) {
      if (error.message.includes("Dateityp") || error.message.includes("zu groß")) {
        throw error;
      }
      if (error.response?.status === 413) {
        throw new Error("Datei zu groß. Maximal 10MB.");
      }
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || "Datei konnte nicht gesendet werden.");
      }
      throw error;
    }
  }

  /**
   * Bearbeitet eine Nachricht
   */
  async updateMessage(messageId: string, newContent: string): Promise<ChatMessage> {
    try {
      const formData = new FormData();
      formData.append("message", newContent.trim());

      const response = await api.patch(`/chat/update/${messageId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Nachricht nicht gefunden oder kein Zugriff.");
      }
      if (error.response?.status === 400) {
        const msg = error.response?.data?.message || "";
        if (msg.includes("5 minutes")) {
          throw new Error("Nachrichten können nur 5 Minuten lang bearbeitet werden.");
        }
        if (msg.includes("deleted")) {
          throw new Error("Gelöschte Nachrichten können nicht bearbeitet werden.");
        }
        throw new Error(msg);
      }
      throw error;
    }
  }

  /**
   * Löscht eine Nachricht
   */
  async deleteMessage(messageId: string): Promise<void> {
    try {
      await api.delete(`/chat/${messageId}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Nachricht nicht gefunden.");
      }
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || "Löschen fehlgeschlagen.");
      }
      throw error;
    }
  }

  /**
   * Löscht eine Conversation
   */
  async deleteConversation(conversationId: string): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/conversation/${conversationId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Conversation nicht gefunden.");
      }
      throw error;
    }
  }

  /**
   * Format: Zeit für die UI
   */
  formatMessageTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const minutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (minutes < 1) return "Gerade eben";
    if (minutes < 60) return `vor ${minutes} Min`;
    if (minutes < 1440) return `vor ${Math.floor(minutes / 60)} Std`;

    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  }

  formatChatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  isOwnMessage(message: ChatMessage, currentUserId: string): boolean {
    return message.senderId === currentUserId;
  }

  getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  sanitizeHtml(html: string): string {
    // const allowedTags = ["b", "u", "i", "strong", "em"];
    let cleaned = html.replace(/<(?!\/?(b|u|i|strong|em)\b)[^>]*>/gi, "");
    cleaned = cleaned.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
    cleaned = cleaned.replace(/\s*style\s*=\s*["'][^"']*["']/gi, "");
    return cleaned;
  }

  parseMessageContent(content: string): string {
    const parsed = this.sanitizeHtml(content).replace(/\n/g, "<br>");
    return parsed;
  }

  extractTextFromHtml(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .trim();
  }
}

export default new ChatService();
