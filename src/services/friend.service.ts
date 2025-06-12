// src/services/friend.service.ts
import api from "./axiosInstance";

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
}

export interface SentRequestResponse {
  message: string;
  data: {
    id: string;
    receiverId: string;
    status: string;
    receiver: {
      id: string;
      username: string;
      profilePicture: string | null;
    };
  }[];
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
    const response = await api.get("/friends/friendsOfMe");
    return response.data;
  }

  /**
   * Holt alle ausstehenden Freundschaftsanfragen
   * GET /friends/pendingRequestsOfMe
   */
  async getAllPendingRequests(): Promise<PendingRequestResponse> {
    const response = await api.get("/friends/pendingRequestsOfMe");
    return response.data;
  }

  /**
   * Holt alle gesendeten Freundschaftsanfragen des aktuellen Users
   * Hinweis: Dieser Endpunkt müsste im Backend implementiert werden
   * Für jetzt verwenden wir einen Mock
   */
  async getMySentRequests(): Promise<SentRequestResponse> {
    try {
      // TODO: Backend Endpunkt implementieren - z.B. GET /friends/mySentRequests
      // const response = await api.get("/friends/mySentRequests");
      // return response.data;
      
      // Mock für jetzt - gibt leeres Array zurück
      return {
        message: "Sent requests retrieved successfully",
        data: []
      };
    } catch (error) {
      console.error("Fehler beim Laden gesendeter Anfragen:", error);
      return {
        message: "Error loading sent requests",
        data: []
      };
    }
  }

  /**
   * Sendet eine Freundschaftsanfrage an einen Benutzer
   * POST /friends/sendFriendRequest/:targetId
   */
  async sendFriendRequest(targetId: string): Promise<ApiResponse> {
    const response = await api.post(`/friends/sendFriendRequest/${targetId}`);
    return response.data;
  }

  /**
   * Nimmt eine Freundschaftsanfrage an
   * POST /friends/acceptFriendRequest/:requestId
   */
  async acceptFriendRequest(requestId: string): Promise<ApiResponse> {
    const response = await api.post(`/friends/acceptFriendRequest/${requestId}`);
    return response.data;
  }

  /**
   * Lehnt eine Freundschaftsanfrage ab
   * PATCH /friends/rejectFriendRequest/:requestId
   */
  async rejectFriendRequest(requestId: string): Promise<ApiResponse> {
    const response = await api.patch(`/friends/rejectFriendRequest/${requestId}`);
    return response.data;
  }

  /**
   * Zieht eine gesendete Freundschaftsanfrage zurück
   * PATCH /friends/cancelFriendRequest/:requestId
   */
  async cancelFriendRequest(requestId: string): Promise<ApiResponse> {
    const response = await api.patch(`/friends/cancelFriendRequest/${requestId}`);
    return response.data;
  }

  /**
   * Entfernt eine Freundschaft
   * PATCH /friends/removeFriend/:friendshipId
   */
  async removeFriend(friendshipId: string): Promise<ApiResponse> {
    const response = await api.patch(`/friends/removeFriend/${friendshipId}`);
    return response.data;
  }

  /**
   * Prüft ob der aktuelle User mit einem anderen User befreundet ist
   * GET /friends/isFriend/:targetId
   */
  async isFriendWith(targetId: string): Promise<boolean> {
    const response = await api.get(`/friends/isFriend/${targetId}`);
    return response.data;
  }

  /**
   * Prüft ob zwei beliebige User befreundet sind (Admin/Moderator)
   * GET /friends/isFriendWith/:user1Id/:user2Id
   */
  async isFriendWithUsers(user1Id: string, user2Id: string): Promise<boolean> {
    const response = await api.get(`/friends/isFriendWith/${user1Id}/${user2Id}`);
    return response.data;
  }

  /**
   * Holt alle Freunde eines anderen Users (Admin/Moderator)
   * GET /friends/ofUser/:userId
   */
  async getFriendsOfUser(userId: string): Promise<FriendResponse> {
    const response = await api.get(`/friends/ofUser/${userId}`);
    return response.data;
  }

  /**
   * Holt alle gesendeten Anfragen eines Users (Admin/Moderator)
   * GET /friends/requestsOfUser/:targetId
   */
  async getRequestsOfUser(targetId: string): Promise<any> {
    const response = await api.get(`/friends/requestsOfUser/${targetId}`);
    return response.data;
  }

  /**
  User Type einfügen
  */

  async searchUsers(searchQuery: string): any {
    console.log("Searching for users with query:", searchQuery);
    try {
      const username = searchQuery.trim();

      if (!username) return;
      const response = await api.get(`user/getUserByUserName?userName=${username}`)
      console.log("Search response:", response.data);
      if (response.status < 210) return response.data;

      } catch (error) {
      console.error("Fehler beim Suchen von Benutzern:", error);
      throw error;
    }
  }

  /**
   * Sendet eine E-Mail-Einladung (Mock - falls Backend-Endpunkt existiert)
   */
  async sendEmailInvite(email: string, message?: string): Promise<ApiResponse> {
    // TODO: Implementieren wenn Backend-Endpunkt vorhanden
    // const response = await api.post('/friends/invite', { email, message });
    // return response.data;
    
    // Mock für jetzt:
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: `Einladung an ${email} wurde erfolgreich gesendet!`
        });
      }, 1000);
    });
  }

  /**
   * Sendet eine Nachricht an einen Freund (Mock)
   * TODO: Echten Chat-Service implementieren
   */
  async sendMessage(friendId: string, message: string): Promise<ApiResponse> {
    // Mock für jetzt:
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: "Nachricht erfolgreich gesendet",
          data: {
            id: Date.now().toString(),
            senderId: "current_user",
            recipientId: friendId,
            content: message,
            timestamp: new Date().toISOString()
          }
        });
      }, 500);
    });
  }

  /**
   * Holt Chat-Verlauf mit einem Freund (Mock)
   * TODO: Echten Chat-Service implementieren
   */
  async getChatHistory(friendId: string): Promise<ApiResponse> {
    // Mock für jetzt:
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: "Chat-Verlauf geladen",
          data: [] // Leerer Chat-Verlauf
        });
      }, 300);
    });
  }

  /**
   * Markiert Nachrichten als gelesen (Mock)
   * TODO: Echten Chat-Service implementieren
   */
  async markMessagesAsRead(friendId: string): Promise<ApiResponse> {
    // Mock für jetzt:
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: "Nachrichten als gelesen markiert"
        });
      }, 100);
    });
  }
}

export default new FriendService();