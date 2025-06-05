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
    await api.patch(
      "/user/update",
      {
        id: userId,
        deactivated: deactivate,
      },
      { headers: { "Content-Type": "application/json" } }
    );
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
      params: { username: username },
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  }

  /**
   * Aktualisiert Benutzerdaten.
   */
  async updateUser(userId: string, data: Partial<User>): Promise<void> {
    await api.patch(`/admin/updateUser/${userId}`, data, { headers: { "Content-Type": "application/json" } });
  }

  /**
   * Löscht (deaktiviert) einen Benutzer mit Löschgrund.
   */
  async deleteUser(userId: string, deleteReason: string): Promise<void> {
    await api.patch(
      `/admin/deleteUser/${userId}`,
      { deleteReason },
      { headers: { "Content-Type": "application/json" } }
    );
  }

  /**
   * Stellt einen zuvor gelöschten Benutzer wieder her.
   */
  async restoreUser(userId: string): Promise<void> {
    await api.patch(`/admin/restoreUser/${userId}`, {}, { headers: { "Content-Type": "application/json" } });
  }
}

export default new UserService();
