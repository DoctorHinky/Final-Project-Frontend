import api from "./axiosInstance";
import type { User } from "@/services/user.types";

class UserService {
  async getAllUsers(): Promise<User[]> {
    const response = await api.get("/user/getAllUsers");
    return response.data;
  }

  /**
   * Ändert den Deaktivierungsstatus eines Benutzers.
   * @param userId ID des Benutzers
   * @param deactivate true = Benutzer deaktivieren, false = reaktivieren
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
  async getUserById(userId: string): Promise<User> {
    const response = await api.get(`/user/getUserById/${userId}`);
    return response.data;
  }

  async getUserByUsername(username: string): Promise<User> {
    const response = await api.get("/user/getUserByUserName", {
      data: { userName: username },
    });
    return response.data;
  }
}

export default new UserService();
