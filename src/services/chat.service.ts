// src/services/chat.service.ts
import api from "./axiosInstance";

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  messageType: 'TEXT' | 'FILE' | 'COMBINED' | 'SYSTEM';
  attachmentUrl?: string | null;
  isRead: boolean;
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
    } catch (error) {
      console.error('Fehler beim Erstellen/Laden der Conversation:', error);
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
      console.log('Conversation geladen:', response.data);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Laden der Conversation:', error);
      throw error;
    }
  }

  /**
   * Lädt alle Conversations des aktuellen Users (Übersicht)
   * GET /conversation/loadPreview
   */
  async getAllConversations(): Promise<ConversationPreview[]> {
    try {
      const response = await api.get('/conversation/loadPreview');
      return response.data;
    } catch (error) {
      console.error('Fehler beim Laden der Conversations:', error);
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
      const unreadCount = conversation.messages.filter(msg => !msg.isRead).length;
      return unreadCount;
    } catch (error) {
      console.error('Fehler beim Zählen ungelesener Nachrichten:', error);
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
      console.error('Fehler beim Zählen aller ungelesenen Nachrichten:', error);
      return 0;
    }
  }

  /**
   * Sendet eine Textnachricht (unterstützt jetzt auch formatiertes HTML)
   * POST /chat/send/:chatId
   */
  async sendMessage(conversationId: string, message: string): Promise<SendMessageResponse> {
    try {
      const response = await api.post(`/chat/send/${conversationId}`, {
        message: message.trim()
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
      throw error;
    }
  }

  /**
   * Sendet eine Nachricht mit Datei-Anhang
   * POST /chat/send/:chatId (mit FormData)
   */
  async sendMessageWithFile(
    conversationId: string, 
    message: string, 
    file: File
  ): Promise<SendMessageResponse> {
    try {
      const formData = new FormData();
      if (message.trim()) {
        formData.append('message', message.trim());
      }
      formData.append('file', file);

      const response = await api.post(`/chat/send/${conversationId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht mit Datei:', error);
      throw error;
    }
  }

  /**
   * Bearbeitet eine bereits gesendete Nachricht
   * PATCH /chat/update/:messageId
   */
  async updateMessage(messageId: string, newContent: string): Promise<ChatMessage> {
    try {
      const response = await api.patch(`/chat/update/${messageId}`, {
        message: newContent.trim()
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Fehler beim Bearbeiten der Nachricht:', error);
      throw error;
    }
  }

  /**
   * Löscht eine Nachricht
   * DELETE /chat/:msgId
   */
  async deleteMessage(messageId: string): Promise<void> {
    try {
      await api.delete(`/chat/${messageId}`);
    } catch (error) {
      console.error('Fehler beim Löschen der Nachricht:', error);
      throw error;
    }
  }

  /**
   * Löscht eine gesamte Conversation
   * DELETE /conversation/:conversationId
   */
  async deleteConversation(conversationId: string): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/conversation/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Löschen der Conversation:', error);
      throw error;
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
      return 'Gerade eben';
    } else if (diffInMinutes < 60) {
      return `vor ${diffInMinutes} Min`;
    } else if (diffInMinutes < 1440) { // 24 Stunden
      const hours = Math.floor(diffInMinutes / 60);
      return `vor ${hours} Std`;
    } else {
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });
    }
  }

  /**
   * Hilfsfunktion: Formatiert die Zeit für Chat-Nachrichten
   */
  formatChatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
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
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  /**
   * Hilfsfunktion: Bereinigt HTML-Inhalt für sicheres Rendering
   */
  sanitizeHtml(html: string): string {
    // Erlaubte Tags für Rich-Text
    const allowedTags = ['b', 'u', 'i', 'strong', 'em'];
    
    // Einfache Bereinigung - in Produktion sollte eine Library wie DOMPurify verwendet werden
    let cleaned = html;
    
    // Entferne alle nicht erlaubten Tags
    cleaned = cleaned.replace(/<(?!\/?(?:b|u|i|strong|em)(?=>|\s.*>))\/?.*?>/gi, '');
    
    // Entferne gefährliche Attribute
    cleaned = cleaned.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    cleaned = cleaned.replace(/\s*style\s*=\s*["'][^"']*["']/gi, '');
    
    return cleaned;
  }

  /**
   * Hilfsfunktion: Konvertiert Text mit Emojis und Formatierung zu HTML
   */
  parseMessageContent(content: string): string {
    // Sanitize zuerst
    let parsed = this.sanitizeHtml(content);
    
    // Konvertiere Line Breaks zu <br>
    parsed = parsed.replace(/\n/g, '<br>');
    
    return parsed;
  }

  /**
   * Hilfsfunktion: Extrahiert reinen Text aus HTML (für Vorschau)
   */
  extractTextFromHtml(html: string): string {
    // Einfache Implementierung - in Produktion sollte eine DOM-Parser Library verwendet werden
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .trim();
  }
}

export default new ChatService();