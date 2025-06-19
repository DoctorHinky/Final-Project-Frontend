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
      console.log("Creating/getting conversation with user:", targetUserId);
      const response = await api.post(`/conversation/create/${targetUserId}`);
      console.log("Conversation response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Fehler beim Erstellen/Laden der Conversation:", error);

      // Spezifische Fehlerbehandlung
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || "Bad Request";
        if (message.includes("friends")) {
          throw new Error("Du kannst nur mit Freunden chatten. Sendet zuerst eine Freundschaftsanfrage.");
        }
      }
      throw error;
    }
  }

  /**
   * Lädt eine spezifische Conversation mit allen Nachrichten
   * GET /conversation/:conversationId
   */
  async getConversation(conversationId: string): Promise<Conversation> {
    try {
      const response = await api.get(`/conversation/${conversationId}`);
      console.log("Conversation geladen:", response.data);
      return response.data;
    } catch (error) {
      console.error("Fehler beim Laden der Conversation:", error);
      throw error;
    }
  }

  /**
   * Lädt alle Conversations des aktuellen Users (Übersicht)
   * GET /conversation/loadPreview - KORRIGIERT!
   */
  async getAllConversations(): Promise<ConversationPreview[]> {
    try {
      console.log("Loading conversation previews...");

      // Der Backend-Endpoint ist korrekt: GET /conversation/loadPreview
      const response = await api.get("/conversation/loadPreview");

      console.log("Conversation previews loaded successfully:", response.data);

      // Backend gibt direkt das Array zurück
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error("Fehler beim Laden der Conversation-Previews:", error);

      // Detaillierte Fehlerbehandlung
      if (error.response?.status === 401) {
        throw new Error("Nicht authentifiziert. Bitte melde dich erneut an.");
      } else if (error.response?.status === 400) {
        console.error("400 Bad Request - Details:", error.response.data);
        throw new Error("Fehlerhafte Anfrage beim Laden der Chats.");
      } else if (error.response?.status === 404) {
        // Keine Conversations vorhanden
        return [];
      }

      throw error;
    }
  }

  /**
   * Holt die Anzahl ungelesener Nachrichten für eine Conversation
   */
  async getUnreadMessageCount(conversationId: string): Promise<number> {
    try {
      const conversation = await this.getConversation(conversationId);
      // Zähle ungelesene Nachrichten
      const unreadCount = conversation.messages.filter((msg) => !msg.isRead).length;
      return unreadCount;
    } catch (error) {
      console.error("Fehler beim Zählen ungelesener Nachrichten:", error);
      return 0;
    }
  }

  /**
   * Holt die Gesamtzahl ungelesener Nachrichten über alle Conversations
   */
  async getTotalUnreadCount(): Promise<number> {
    try {
      const conversations = await this.getAllConversations();
      return conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0);
    } catch (error) {
      console.error("Fehler beim Zählen aller ungelesenen Nachrichten:", error);
      return 0;
    }
  }

  /**
   * Sendet eine Textnachricht (unterstützt jetzt auch formatiertes HTML)
   * POST /chat/send/:chatId
   */
  async sendMessage(conversationId: string, message: string): Promise<SendMessageResponse> {
    try {
      console.log("Sending message to conversation:", conversationId);

      // Backend erwartet FormData
      const formData = new FormData();
      formData.append("message", message.trim());

      const response = await api.post(`/chat/send/${conversationId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Message sent successfully:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Fehler beim Senden der Nachricht:", error);

      if (error.response?.status === 404) {
        throw new Error("Conversation nicht gefunden.");
      } else if (error.response?.status === 400) {
        const message = error.response?.data?.message || "Nachricht konnte nicht gesendet werden";
        throw new Error(message);
      }

      throw error;
    }
  }

  /**
   * Sendet eine Nachricht mit Datei-Anhang (PDF, Bilder, etc.)
   * POST /chat/send/:conversationId (mit FormData + File)
   */
  async sendMessageWithFile(conversationId: string, message: string, file: File): Promise<SendMessageResponse> {
    try {
      console.log("Sending message with file:", file.name, "to conversation:", conversationId);

      // Validiere Dateityp
      const allowedTypes = [
        // Bilder
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        // PDFs
        "application/pdf",
        // Dokumente
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        // Weitere...
        "text/plain",
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          `Dateityp ${file.type} ist nicht erlaubt. Erlaubte Typen: Bilder (JPG, PNG, GIF, WebP), PDF, Word-Dokumente, Text-Dateien.`
        );
      }

      // Validiere Dateigröße (10MB Backend-Limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in Bytes
      if (file.size > maxSize) {
        throw new Error(`Datei ist zu groß (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum: 10MB.`);
      }

      const formData = new FormData();
      if (message.trim()) {
        formData.append("message", message.trim());
      }
      formData.append("file", file);

      console.log("FormData prepared:", {
        message: message || "(kein Text)",
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)}KB`,
        fileType: file.type,
      });

      const response = await api.post(`/chat/send/${conversationId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload progress: ${progress}%`);
          }
        },
      });

      console.log("Message with file sent successfully:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Fehler beim Senden der Nachricht mit Datei:", error);

      if (error.message.includes("Dateityp") || error.message.includes("zu groß")) {
        throw error; // Eigene Validierungsfehler weiterwerfen
      }

      if (error.response?.status === 413) {
        throw new Error("Datei ist zu groß. Maximum: 10MB.");
      } else if (error.response?.status === 400) {
        const message = error.response?.data?.message || "Datei konnte nicht hochgeladen werden";
        throw new Error(message);
      }

      throw error;
    }
  }

  /**
   * Bearbeitet eine bereits gesendete Nachricht
   * PATCH /chat/update/:messageId (mit FormData)
   */
  async updateMessage(messageId: string, newContent: string): Promise<ChatMessage> {
    try {
      console.log("Updating message:", messageId);

      // Backend erwartet FormData
      const formData = new FormData();
      formData.append("message", newContent.trim());

      const response = await api.patch(`/chat/update/${messageId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Message updated successfully:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Fehler beim Bearbeiten der Nachricht:", error);

      if (error.response?.status === 404) {
        throw new Error("Nachricht nicht gefunden oder du bist nicht der Absender.");
      } else if (error.response?.status === 400) {
        const message = error.response?.data?.message || "Nachricht konnte nicht bearbeitet werden";
        if (message.includes("5 minutes")) {
          throw new Error("Nachrichten können nur innerhalb von 5 Minuten nach dem Senden bearbeitet werden.");
        } else if (message.includes("deleted")) {
          throw new Error("Gelöschte Nachrichten können nicht bearbeitet werden.");
        }
        throw new Error(message);
      }

      throw error;
    }
  }

  /**
   * Löscht eine Nachricht
   * DELETE /chat/:messageId
   */
  async deleteMessage(messageId: string): Promise<void> {
    try {
      console.log("Deleting message:", messageId);
      await api.delete(`/chat/${messageId}`);
      console.log("Message deleted successfully");
    } catch (error: any) {
      console.error("Fehler beim Löschen der Nachricht:", error);

      if (error.response?.status === 404) {
        throw new Error("Nachricht nicht gefunden.");
      } else if (error.response?.status === 400) {
        const message = error.response?.data?.message || "Nachricht konnte nicht gelöscht werden";
        throw new Error(message);
      }

      throw error;
    }
  }

  /**
   * Löscht eine gesamte Conversation
   * DELETE /conversation/:conversationId
   */
  async deleteConversation(conversationId: string): Promise<{ message: string }> {
    try {
      console.log("Deleting conversation:", conversationId);
      const response = await api.delete(`/conversation/${conversationId}`);
      console.log("Conversation deleted successfully");
      return response.data;
    } catch (error: any) {
      console.error("Fehler beim Löschen der Conversation:", error);

      if (error.response?.status === 404) {
        throw new Error("Conversation nicht gefunden.");
      }

      throw error;
    }
  }

  /**
   * Zählt ungelesene Nachrichten (MANUELL IMPLEMENTIERT)
   * Da kein Backend-Endpoint existiert, zählen wir die ungelesenen Nachrichten aus den Conversations
   */
  async getUnreadMessageCount(conversationId?: string): Promise<number> {
    try {
      if (conversationId) {
        // Ungelesene Nachrichten für eine spezifische Conversation
        const conversation = await this.getConversation(conversationId);
        const unreadCount = conversation.messages?.filter((msg) => !msg.isRead).length || 0;
        return unreadCount;
      } else {
        // Gesamte ungelesene Nachrichten (für Badge-Counter)
        const conversations = await this.getAllConversations();

        // Da ConversationPreview keine isRead-Info hat, müssen wir jede Conversation laden
        // Für Performance nur die ersten 5 aktiven Conversations prüfen
        const activeConversations = conversations.slice(0, 5);
        let totalUnread = 0;

        for (const preview of activeConversations) {
          try {
            const conversation = await this.getConversation(preview.id);
            const unreadCount = conversation.messages?.filter((msg) => !msg.isRead).length || 0;
            totalUnread += unreadCount;
          } catch (error) {
            console.warn("Could not load conversation for unread count:", preview.id);
          }
        }

        return totalUnread;
      }
    } catch (error) {
      console.error("Fehler beim Laden der ungelesenen Nachrichten:", error);
      return 0;
    }
  }

  /**
   * Hilfsfunktion: Formatiert Zeitstempel für die UI
   */
  formatMessageTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return "Gerade eben";
    } else if (diffInMinutes < 60) {
      return `vor ${diffInMinutes} Min`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `vor ${hours} Std`;
    } else {
      return date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });
    }
  }

  /**
   * Hilfsfunktion: Formatiert die Zeit für Chat-Nachrichten
   */
  formatChatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Hilfsfunktion: Prüft ob eine Nachricht vom aktuellen User ist
   */
  isOwnMessage(message: ChatMessage, currentUserId: string): boolean {
    return message.senderId === currentUserId;
  }

  /**
   * Hilfsfunktion: Erstellt Initiale für Benutzer ohne Profilbild
   */
  getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  /**
   * Hilfsfunktion: Bereinigt HTML-Inhalt für sicheres Rendering
   */
  sanitizeHtml(html: string): string {
    // Erlaubte Tags für Rich-Text
    const allowedTags = ["b", "u", "i", "strong", "em"];

    // Einfache Bereinigung - in Produktion sollte eine Library wie DOMPurify verwendet werden
    let cleaned = html;

    // Entferne alle nicht erlaubten Tags
    cleaned = cleaned.replace(/<(?!\/?(?:b|u|i|strong|em)(?=>|\s.*>))\/?.*?>/gi, "");

    // Entferne gefährliche Attribute
    cleaned = cleaned.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
    cleaned = cleaned.replace(/\s*style\s*=\s*["'][^"']*["']/gi, "");

    return cleaned;
  }

  /**
   * Hilfsfunktion: Konvertiert Text mit Emojis und Formatierung zu HTML
   */
  parseMessageContent(content: string): string {
    // Sanitize zuerst
    let parsed = this.sanitizeHtml(content);

    // Konvertiere Line Breaks zu <br>
    parsed = parsed.replace(/\n/g, "<br>");

    return parsed;
  }

  /**
   * Hilfsfunktion: Extrahiert reinen Text aus HTML (für Vorschau)
   */
  extractTextFromHtml(html: string): string {
    // Einfache Implementierung - in Produktion sollte eine DOM-Parser Library verwendet werden
    return html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .trim();
  }
}

export default new ChatService();
