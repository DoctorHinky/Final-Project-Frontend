import axios from "axios";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp?: number;
  role?: string;
  name?: string;
  email?: string;
  [key: string]: any;
}

class AuthService {
  private accessTokenKey = "access_token";
  private refreshTokenKey = "refresh_token";
  private refreshTimeoutId: ReturnType<typeof setTimeout> | null = null;

  async login(email: string, password: string): Promise<{ success: boolean; role?: string }> {
    try {
      const response = await axios.post("/auth/local/login", { email, password });
      const { access_token, refresh_token } = response.data;

      localStorage.setItem(this.accessTokenKey, access_token);
      localStorage.setItem(this.refreshTokenKey, refresh_token);

      const decoded = jwtDecode<DecodedToken>(access_token);

      this.scheduleTokenRefresh(); // automatischer Refresh aktivieren

      return { success: true, role: decoded.role };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false };
    }
  }

  logout(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    if (this.refreshTimeoutId !== null) {
      clearTimeout(this.refreshTimeoutId);
    }
  }

  adminLogout(): void {
    this.logout();
  }

  getAccessToken(): string | null {
    let token = localStorage.getItem(this.accessTokenKey);
    if (!token) token = sessionStorage.getItem(this.accessTokenKey);

    return token;
  }

  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    console.log("[auth] Token gefunden (isLoggedIn):", token);
    if (!token) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const now = Date.now() / 1000;
      return decoded.exp !== undefined && decoded.exp > now;
    } catch {
      return false;
    }
  }

  isAdminLoggedIn(): boolean {
    const token = this.getAccessToken();
    console.log("[auth] Token gefunden (isAdminLoggedIn):", token);
    if (!token) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.role === "ADMIN" || decoded.role === "MODERATOR";
    } catch {
      return false;
    }
  }

  getUserData(): DecodedToken | null {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      return jwtDecode<DecodedToken>(token);
    } catch {
      return null;
    }
  }

  // Automatischer Refresh vor Tokenablauf
  scheduleTokenRefresh(): void {
    const token = this.getAccessToken();
    if (!token) return;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      if (!decoded.exp) return;

      const now = Date.now() / 1000;
      const refreshTime = decoded.exp - now - 60; // 1 Minute vorher

      if (refreshTime <= 0) {
        this.refreshAccessToken(); // sofort erneuern
        return;
      }

      this.refreshTimeoutId = setTimeout(() => {
        this.refreshAccessToken();
      }, refreshTime * 1000);
    } catch (e) {
      console.error("Fehler beim Planen des Token-Refresh:", e);
    }
  }

  // 🔁 Token manuell erneuern
  async refreshAccessToken(): Promise<void> {
    let refreshToken = localStorage.getItem(this.refreshTokenKey);
    if (!refreshToken) refreshToken = sessionStorage.getItem(this.refreshTokenKey);
    if (!refreshToken) {
      this.logout();
      window.location.href = "/login-register";
      return;
    }

    try {
      const response = await axios.post(
        "/auth/refresh",
        {},
        {
          baseURL: import.meta.env.VITE_BASE_URL,
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );

      const newAccessToken = response.data.access_token;
      localStorage.setItem(this.accessTokenKey, newAccessToken);

      this.scheduleTokenRefresh(); // neuen Timer starten
    } catch (e) {
      console.error("Token konnte nicht erneuert werden:", e);
      this.logout();
      window.location.href = "/login-register";
    }
  }
}

export const authService = new AuthService();
