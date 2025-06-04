import api from "./axiosInstance";
import type { User } from "@/services/user.types";

class UserService {
  async getAllUsers(): Promise<User[]> {
    const response = await api.get("/user/getAllUsers");
    return response.data;
  }

  /**
   * Ändert den Deaktivierungsstatus eines Benutzers.
   */
  async toggleUserDeactivation(userId: string, deactivate: boolean): Promise<void> {
    await api.patch("/user/update", {
      id: userId,
      deactivated: deactivate,
    });
  }

  /**
   * Holt einen Benutzer anhand der ID.
   */
  async getUserById(userId: string): Promise<User> {
    const response = await api.get(`/user/getUserById/${userId}`);
    return response.data;
  }

  /**
   * Holt einen Benutzer anhand des Usernames.
   */
  async getUserByUsername(username: string): Promise<User> {
    const response = await api.get("/user/getUserByUserName", {
      data: { userName: username },
    });
    return response.data;
  }

  /**
   * Aktualisiert Benutzerdaten.
   */
  async updateUser(userId: string, data: Partial<User>): Promise<void> {
    await api.patch(`/admin/updateUser/${userId}`, data);
  }

  /**
   * Löscht (deaktiviert) einen Benutzer mit Löschgrund.
   */
  async deleteUser(userId: string, deleteReason: string): Promise<void> {
    await api.patch(`/admin/deleteUser/${userId}`, { deleteReason });
  }

  /**
   * Stellt einen zuvor gelöschten Benutzer wieder her.
   */
  async restoreUser(userId: string): Promise<void> {
    await api.patch(`/admin/restoreUser/${userId}`);
  }
}

export default new UserService();
