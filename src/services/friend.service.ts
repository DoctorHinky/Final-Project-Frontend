// src/services/friend.service.ts
import api from "./axiosInstance";
import chatService from "./chat.service";

// Backend Response Types
export interface FriendResponse {
  message: string;
  data: {
    id: string;
    friendId: string;
    username: string;
    profileImage: string | null;
  }[];
}

export interface PendingRequestResponse {
  message: string;
  data: {
    id: string;
    senderId: string;
    username: string;
    profileImage: string | null;
  }[];
  count: number;
}

export interface SentRequestResponse {
  id: string;
  receiverId: string;
  status: string;
  receiver: {
    id: string;
    username: string;
    profilePicture: string | null;
  };
}

export interface SearchUser {
  id: string;
  username: string;
  profilePicture: string | null;
}

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
}

class FriendService {
  /**
   * Holt alle Freunde des aktuellen Benutzers
   * GET /friends/friendsOfMe
   */
  async getAllFriendsOfUser(): Promise<FriendResponse> {
    try {
      const response = await api.get("/friends/friendsOfMe");
      return response.data;
    } catch (error) {
      console.error("Fehler beim Laden der Freunde:", error);
      throw error;
    }
  }

  /**
   * Holt alle ausstehenden Freundschaftsanfragen
   * GET /friends/pendingRequestsOfMe
   */
  async getAllPendingRequests(): Promise<PendingRequestResponse> {
    try {
      const response = await api.get("/friends/pendingRequestsOfMe");
      return response.data;
    } catch (error) {
      console.error("Fehler beim Laden der ausstehenden Anfragen:", error);
      throw error;
    }
  }

  /**
   * Holt alle gesendeten Freundschaftsanfragen des aktuellen Users
   * Hinweis: Endpoint müsste im Backend implementiert werden
   * Verwende die requestsOfUser Logik für eigene Anfragen
   */
  async getMySentRequests(): Promise<SentRequestResponse[]> {
    try {
      // Verwende den User-Service um eigene ID zu bekommen
      const userResponse = await api.get("/user/getMe");
      const userId = userResponse.data.id;
      
      // Hole alle Anfragen des Users
      const response = await api.get(`/friends/requestsOfUser/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Fehler beim Laden gesendeter Anfragen:", error);
      return [];
    }
  }

  /**
   * Sendet eine Freundschaftsanfrage an einen Benutzer
   * POST /friends/sendFriendRequest/:targetId
   */
  async sendFriendRequest(targetId: string): Promise<ApiResponse> {
    try {
      const response = await api.post(`/friends/sendFriendRequest/${targetId}`);
      return response.data;
    } catch (error) {
      console.error("Fehler beim Senden der Freundschaftsanfrage:", error);
      throw error;
    }
  }

  /**
   * Nimmt eine Freundschaftsanfrage an
   * POST /friends/acceptFriendRequest/:requestId
   */
  async acceptFriendRequest(requestId: string): Promise<ApiResponse> {
    try {
      const response = await api.post(`/friends/acceptFriendRequest/${requestId}`);
      return response.data;
    } catch (error) {
      console.error("Fehler beim Annehmen der Freundschaftsanfrage:", error);
      throw error;
    }
  }

  /**
   * Lehnt eine Freundschaftsanfrage ab
   * PATCH /friends/rejectFriendRequest/:requestId
   */
  async rejectFriendRequest(requestId: string): Promise<ApiResponse> {
    try {
      const response = await api.patch(`/friends/rejectFriendRequest/${requestId}`);
      return response.data;
    } catch (error) {
      console.error("Fehler beim Ablehnen der Freundschaftsanfrage:", error);
      throw error;
    }
  }

  /**
   * Zieht eine gesendete Freundschaftsanfrage zurück
   * PATCH /friends/cancelFriendRequest/:requestId
   */
  async cancelFriendRequest(requestId: string): Promise<ApiResponse> {
    try {
      const response = await api.patch(`/friends/cancelFriendRequest/${requestId}`);
      return response.data;
    } catch (error) {
      console.error("Fehler beim Zurückziehen der Freundschaftsanfrage:", error);
      throw error;
    }
  }

  /**
   * Entfernt eine Freundschaft
   * PATCH /friends/removeFriend/:friendshipId
   */
  async removeFriend(friendshipId: string): Promise<ApiResponse> {
    try {
      const response = await api.patch(`/friends/removeFriend/${friendshipId}`);
      return response.data;
    } catch (error) {
      console.error("Fehler beim Entfernen der Freundschaft:", error);
      throw error;
    }
  }

  /**
   * Prüft ob der aktuelle User mit einem anderen User befreundet ist
   * GET /friends/isFriend/:targetId
   */
  async isFriendWith(targetId: string): Promise<boolean> {
    try {
      const response = await api.get(`/friends/isFriend/${targetId}`);
      return response.data;
    } catch (error) {
      console.error("Fehler beim Prüfen der Freundschaft:", error);
      return false;
    }
  }

  /**
   * Prüft ob zwei beliebige User befreundet sind (Admin/Moderator)
   * GET /friends/isFriendWith/:user1Id/:user2Id
   */
  async isFriendWithUsers(user1Id: string, user2Id: string): Promise<boolean> {
    try {
      const response = await api.get(`/friends/isFriendWith/${user1Id}/${user2Id}`);
      return response.data;
    } catch (error) {
      console.error("Fehler beim Prüfen der Freundschaft zwischen Usern:", error);
      return false;
    }
  }

  /**
   * Holt alle Freunde eines anderen Users (Admin/Moderator)
   * GET /friends/ofUser/:userId
   */
  async getFriendsOfUser(userId: string): Promise<FriendResponse> {
    try {
      const response = await api.get(`/friends/ofUser/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Fehler beim Laden der Freunde des Users:", error);
      throw error;
    }
  }

  /**
   * Holt alle gesendeten Anfragen eines Users (Admin/Moderator)
   * GET /friends/requestsOfUser/:targetId
   */
  async getRequestsOfUser(targetId: string): Promise<SentRequestResponse[]> {
    try {
      const response = await api.get(`/friends/requestsOfUser/${targetId}`);
      return response.data;
    } catch (error) {
      console.error("Fehler beim Laden der Anfragen des Users:", error);
      throw error;
    }
  }

  /**
   * Sucht Benutzer nach Username
   * GET /user/getUserByUserName?userName=:username
   */
  async searchUsers(searchQuery: string): Promise<SearchUser | null> {
    try {
      const username = searchQuery.replace(/^@/, '').trim();
      
      if (!username || username.length < 3) {
        return null;
      }

      const response = await api.get(`/user/getUserByUserName?userName=${encodeURIComponent(username)}`);
      
      if (response.status === 200 && response.data) {
        return {
          id: response.data.id,
          username: response.data.username,
          profilePicture: response.data.profilePicture || null
        };
      }
      
      return null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        // User nicht gefunden - kein Fehler
        return null;
      }
      console.error("Fehler beim Suchen von Benutzern:", error);
      throw error;
    }
  }

  /**
   * Sendet eine E-Mail-Einladung (Mock - bis Backend-Endpunkt implementiert ist)
   */
  async sendEmailInvite(email: string, message?: string): Promise<ApiResponse> {
    // TODO: Implementieren wenn Backend-Endpunkt vorhanden
    // const response = await api.post('/friends/invite', { email, message });
    // return response.data;
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: `Einladung an ${email} wurde erfolgreich gesendet!`
        });
      }, 1000);
    });
  }

  // ===========================
  // CHAT-FUNKTIONEN (echte API-Calls)
  // ===========================

  /**
   * Sendet eine Nachricht an einen Freund
   * Erstellt automatisch eine Conversation falls noch nicht vorhanden
   */
  async sendMessage(friendId: string, message: string): Promise<ApiResponse> {
    try {
      // Erstelle oder lade Conversation
      const conversation = await chatService.createOrGetConversation(friendId);
      
      // Sende Nachricht
      const result = await chatService.sendMessage(conversation.id, message);
      
      return {
        message: "Nachricht erfolgreich gesendet",
        data: result.message
      };
    } catch (error) {
      console.error("Fehler beim Senden der Nachricht:", error);
      throw error;
    }
  }

  /**
   * Holt Chat-Verlauf mit einem Freund
   */
  async getChatHistory(friendId: string): Promise<ApiResponse> {
    try {
      // Erstelle oder lade Conversation
      const conversation = await chatService.createOrGetConversation(friendId);
      
      return {
        message: "Chat-Verlauf geladen",
        data: conversation.messages
      };
    } catch (error) {
      console.error("Fehler beim Laden des Chat-Verlaufs:", error);
      throw error;
    }
  }

  /**
   * Markiert Nachrichten als gelesen
   */
  async markMessagesAsRead(friendId: string): Promise<ApiResponse> {
    try {
      // Erstelle oder lade Conversation
      const conversation = await chatService.createOrGetConversation(friendId);
      
      // Nachrichten werden automatisch als gelesen markiert beim Laden der Conversation
      // (siehe ConversationService.getConversation im Backend)
      
      return {
        message: "Nachrichten als gelesen markiert"
      };
    } catch (error) {
      console.error("Fehler beim Markieren der Nachrichten:", error);
      throw error;
    }
  }

  /**
   * Öffnet einen Chat mit einem Freund (lädt Conversation)
   */
  async openChatWithFriend(friendId: string): Promise<{ conversationId: string; messages: any[] }> {
    try {
      const conversation = await chatService.createOrGetConversation(friendId);
      
      return {
        conversationId: conversation.id,
        messages: conversation.messages || []
      };
    } catch (error) {
      console.error("Fehler beim Öffnen des Chats:", error);
      throw error;
    }
  }
}

export default new FriendService();