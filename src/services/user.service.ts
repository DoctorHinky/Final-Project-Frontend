import api from "./axiosInstance";
import type { User } from "@/services/user.types";

// Erweiterte Types für gelöschte User
export interface DeletedUser extends User {
  deletedAt: string;
  deletedBy: string;
  deleteReason: string;
  deletedByUser?: {
    username: string;
  };
}

class UserService {
  async getAllUsers(): Promise<User[]> {
    const response = await api.get("/user/getAllUsers");
    return response.data;
  }

  /**
   * Holt alle gelöschten Benutzer.
   */
  async getDeletedUsers(): Promise<DeletedUser[]> {
    const response = await api.get("/user/getDeletedUsers");
    return response.data;
  }

  /**
   * Ändert den Deaktivierungsstatus eines Benutzers.
   */
  async toggleUserDeactivation(userId: string, deactivate: boolean): Promise<void> {
    if (deactivate) {
      await api.patch("/user/deactivateMyAccount");
    } else {
      await api.patch("/user/reactivateMyAccount");
    }
  }

  /**
   * Holt einen Benutzer anhand der ID.
   */
  async getUserById(userId: string): Promise<User> {
    const response = await api.get(`/user/getUserById/${userId}`, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  }

  /**
   * Holt einen Benutzer anhand des Usernames.
   */
  async getUserByUsername(username: string): Promise<User> {
    const response = await api.get("/user/getUserByUserName", {
      params: { userName: username },
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  }

  /**
   * Aktualisiert Benutzerdaten (Admin/Moderator).
   */
  async updateUser(userId: string, data: Partial<User>): Promise<void> {
    await api.patch(`/user/updateUser/${userId}`, data, { 
      headers: { "Content-Type": "application/json" } 
    });
  }

  /**
   * Löscht (soft delete) einen Benutzer mit Löschgrund.
   */
  async deleteUser(userId: string, deleteReason: string): Promise<void> {
    await api.patch(
      `/user/deleteUser/${userId}`,
      { deleteReason },
      { headers: { "Content-Type": "application/json" } }
    );
  }

  /**
   * Stellt einen zuvor gelöschten Benutzer wieder her.
   */
  async restoreUser(userId: string): Promise<void> {
    await api.patch(
      `/user/restoreUser/${userId}`, 
      {}, 
      { headers: { "Content-Type": "application/json" } }
    );
  }

  /**
   * Löscht einen Benutzer endgültig (nur Admin).
   */
  async deleteUserForever(userId: string): Promise<void> {
    await api.delete(`/user/deleteUserForever/${userId}`, {
      headers: { "Content-Type": "application/json" }
    });
  }

  /**
   * Aktualisiert die Rolle eines Benutzers zu Moderator/Admin (nur Admin).
   */
  async createModsAndAdmins(userId: string): Promise<string> {
    const response = await api.patch(
      `/user/createModsAndAdmins/${userId}`,
      {},
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  }
}

export default new UserService();