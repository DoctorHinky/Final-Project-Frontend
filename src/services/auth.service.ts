// import axios from "axios";
import { jwtDecode } from "jwt-decode";
import api from "./axiosInstance"; // Importiere die konfigurierte axios Instanz
import axios from "axios";

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
  private rememberMe = false;
  private isRefreshing = false;

  async login({
    username,
    email,
    password,
    rememberMe = false,
  }: {
    username?: string;
    email?: string;
    password: string;
    rememberMe?: boolean;
  }): Promise<{ success: boolean; role?: string }> {
    try {
      if (!email && !username) throw new Error("Either email or username must be provided");
      const payload: { username?: string; email?: string; password: string } = {
        password,
      };

 if (email) payload.email = email;
if (username) payload.username = username;

const response = await api.post("/auth/local/login", payload, {
  headers: { "Content-Type": "application/json" },
});
console.log("📍 login() Methode aufgerufen");
console.log("Antwort vom Server:", response.data);

const { access_token, refresh_token } = response.data;
console.log("🔐 Access:", access_token);
console.log("🔁 Refresh:", refresh_token);

this.rememberMe = rememberMe;
const storage = this.getStorage();
storage.setItem(this.accessTokenKey, access_token);
storage.setItem(this.refreshTokenKey, refresh_token);

const decoded = jwtDecode<DecodedToken>(access_token);

this.scheduleTokenRefresh();
this.startTokenCountdown();
return { success: true, role: decoded.role };
  }
}

  logout(): void {
    // ⏹️ Timer stoppen
    if (this.refreshTimeoutId !== null) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }

  // 🗂️ Aktives Storage anhand von rememberMe
  const storage = this.getStorage();
  storage.removeItem(this.accessTokenKey);
  storage.removeItem(this.refreshTokenKey);

  // 🔁 Sicherheitshalber auch im anderen Storage entfernen (falls sich rememberMe geändert hat)
  const otherStorage = storage === localStorage ? sessionStorage : localStorage;
  otherStorage.removeItem(this.accessTokenKey);
  otherStorage.removeItem(this.refreshTokenKey);

  // 🚫 Refresh-Status zurücksetzen
  this.isRefreshing = false;
}

  adminLogout(): void {
    // Admin-Tokens entfernen
    localStorage.removeItem("admin_access_token");
    localStorage.removeItem("admin_refresh_token");
    sessionStorage.removeItem("admin_access_token");
    sessionStorage.removeItem("admin_refresh_token");
  }

  getAccessToken(): string | null {
    // Zuerst in localStorage suchen, dann in sessionStorage
    return localStorage.getItem(this.accessTokenKey) || sessionStorage.getItem(this.accessTokenKey);
  }

  getUserData(): DecodedToken | null {
    const token = this.getAccessToken();
    if (!token) return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null; // Ungültiges JWT

    try {
      const payload = parts[1];
      const decodedJson = atob(this.base64UrlToBase64(payload)); // Base64URL → Base64 → JSON
      const decoded = JSON.parse(decodedJson);
      return decoded as DecodedToken;
    } catch (error) {
      console.error("Fehler beim Dekodieren des Tokens:", error);
      return null;
    }
  }

  // ✅ Konvertiert Base64URL zu regulärem Base64
  private base64UrlToBase64(input: string): string {
    return input
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(input.length / 4) * 4, "=");
  }

  getRefreshToken(): string | null {
    // Zuerst in localStorage suchen, dann in sessionStorage
    return localStorage.getItem(this.refreshTokenKey) || sessionStorage.getItem(this.refreshTokenKey);
  }

  // Separate Token-Verwaltung für Admin
  getAdminAccessToken(): string | null {
    // FALLBACK: Prüfe auch die normalen Token-Keys für Rückwärtskompatibilität
    const adminToken = localStorage.getItem("admin_access_token") || sessionStorage.getItem("admin_access_token");
    if (adminToken) return adminToken;

    // Fallback auf normale Tokens falls Admin sich über normalen Login angemeldet hat
    const normalToken = this.getAccessToken();
    if (normalToken) {
      try {
        const decoded = jwtDecode<DecodedToken>(normalToken);
        if (decoded.role === "ADMIN" || decoded.role === "MODERATOR") {
          return normalToken;
        }
      } catch (e) {
        // Token ungültig
      }
    }

    return null;
  }

  setAdminTokens(accessToken: string, refreshToken: string, rememberMe: boolean = false): void {
    if (rememberMe) {
      localStorage.setItem("admin_access_token", accessToken);
      localStorage.setItem("admin_refresh_token", refreshToken);
    } else {
      sessionStorage.setItem("admin_access_token", accessToken);
      sessionStorage.setItem("admin_refresh_token", refreshToken);
    }
  }

  // Admin Login - verwendet die gleiche Logik wie normaler Login
  async adminLogin(
    emailOrUsername: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<{ success: boolean; role?: string }> {
    try {
      // Verwende die normale login Methode, aber prüfe danach Admin-Rechte
      const loginData: any = { password };
      const trimmedInput = emailOrUsername.trim();
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedInput);

      if (isEmail) {
        loginData.email = trimmedInput;
      } else {
        loginData.username = trimmedInput;
      }

      const response = await api.post("/auth/local/login", loginData, {
        headers: { "Content-Type": "application/json" },
      });

      const { access_token, refresh_token } = response.data;

      if (!access_token) {
        return { success: false };
      }

      const decoded = jwtDecode<DecodedToken>(access_token);

      // Prüfe ob User Admin/Moderator ist
      if (decoded.role !== "ADMIN" && decoded.role !== "MODERATOR") {
        return { success: false };
      }

      // Speichere Admin-Tokens in separaten Keys
      if (rememberMe) {
        localStorage.setItem("admin_access_token", access_token);
        localStorage.setItem("admin_refresh_token", refresh_token);
        // Auch normale Keys setzen für Kompatibilität
        localStorage.setItem(this.accessTokenKey, access_token);
        localStorage.setItem(this.refreshTokenKey, refresh_token);
      } else {
        sessionStorage.setItem("admin_access_token", access_token);
        sessionStorage.setItem("admin_refresh_token", refresh_token);
        // Auch normale Keys setzen für Kompatibilität
        sessionStorage.setItem(this.accessTokenKey, access_token);
        sessionStorage.setItem(this.refreshTokenKey, refresh_token);
      }

      return { success: true, role: decoded.role };
    } catch (error: any) {
      console.error("Admin login error:", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });
      return { success: false };
    }
  }

  private getStorage(): Storage {
    // Prüfe, ob Token im localStorage vorhanden ist
    if (localStorage.getItem(this.accessTokenKey)) {
      this.rememberMe = true;
      return localStorage;
    }
    this.rememberMe = false;
    return sessionStorage;
  }

  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const now = Date.now() / 1000;

      // Token ist noch gültig
      if (decoded.exp && decoded.exp > now) {
        return true;
      }

      // Token ist abgelaufen - KEIN automatischer Refresh hier!
      // Dies verhindert Infinity-Loops bei Protected Routes
      return false;
    } catch {
      return false;
    }
  }

  isAdminLoggedIn(): boolean {
    const token = this.getAdminAccessToken(); // Verwende separaten Admin-Token
    if (!token) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const now = Date.now() / 1000;

      // Prüfe ob Token noch gültig ist UND ob User Admin/Moderator ist
      if (decoded.exp && decoded.exp > now) {
        return decoded.role === "ADMIN" || decoded.role === "MODERATOR";
      }

      return false;
    } catch {
      return false;
    }
  }

  scheduleTokenRefresh(): void {
    // Vorherigen Timer löschen
    if (this.refreshTimeoutId !== null) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }

    const token = this.getAccessToken();
    if (!token) return;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      if (!decoded.exp) return;

      const now = Date.now() / 1000;
      const timeUntilExpiry = decoded.exp - now;

      // Token bereits abgelaufen oder weniger als 2 Minuten gültig
      if (timeUntilExpiry <= 120) {
        // Sofortiger Refresh, aber nur wenn nicht bereits läuft
        if (!this.isRefreshing) {
          this.refreshAccessToken();
        }
        return;
      }

      // Refresh 2 Minuten vor Ablauf planen
      const refreshTime = (timeUntilExpiry - 120) * 1000;

      this.refreshTimeoutId = setTimeout(() => {
        this.refreshAccessToken();
      }, refreshTime);
    } catch (e) {
      console.error("Fehler beim Planen des Token-Refresh:", e);
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    // Verhindere mehrfache gleichzeitige Refreshs
    if (this.isRefreshing) {
      return false;
    }
    console.log("⚙️ refreshAccessToken() wurde aufgerufen");
    const refreshToken = this.getRefreshToken();

    /*  if (!refreshToken) {
      this.logout();
      // Keine automatische Weiterleitung hier - lass die App entscheiden
      return false;
    } */

    this.isRefreshing = true;

    try {
      console.group("bestehende token");
      console.log("🔐 Access (alt):", this.getAccessToken());
      console.log("🔁 Refresh (alt):", refreshToken);
      console.groupEnd();

      const response = await axios.post(
          "auth/refresh",
        {},
        {
          headers: { Authorization: `Bearer ${refreshToken}` },
        }
      );
      console.log("Refresh-Response", response.data);
      const { access_token, refresh_token } = response.data;
      console.log("🔐 Access (neu):", access_token);
      console.log("🔁 Refresh (neu):", refresh_token);
      const storage = this.getStorage();
      storage.setItem(this.accessTokenKey, access_token);

      if (refresh_token) {
        storage.setItem(this.refreshTokenKey, refresh_token);
      }
      // Neuen Refresh planen
      this.scheduleTokenRefresh();

      this.isRefreshing = false;
      return true;
    } catch (e) {
      console.error("Token konnte nicht erneuert werden:", e);
      this.isRefreshing = false;

      // Bei Fehler ausloggen, aber keine automatische Weiterleitung
      this.logout();
      return false;
    }
  }
  startTokenCountdown(): void {
    const token = this.getAccessToken();
    if (!token) {
      console.warn("❗ Kein Access Token gefunden.");
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      if (!decoded.exp) {
        console.warn("❗ Access Token hat kein Ablaufdatum (exp).");
        return;
      }

      const interval = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const remaining = decoded.exp! - now;

        if (remaining <= 0) {
          console.log("⛔ Token abgelaufen");
          clearInterval(interval);
        } else {
          console.log(`⏳ Token gültig für noch ${remaining} Sekunden`);
        }
      }, 5000); // Alle 5 Sekunden aktualisieren
    } catch (e) {
      console.error("❌ Fehler beim Dekodieren des Tokens:", e);
    }
  }
  isRememberMeActive(): boolean {
    return !!localStorage.getItem(this.accessTokenKey);
  }

  // Neue Methode für manuellen Token-Check mit Refresh
  async checkAndRefreshToken(): Promise<boolean> {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const now = Date.now() / 1000;

      if (decoded.exp && decoded.exp > now) {
        // Token noch gültig
        return true;
      }

      // Token abgelaufen - versuche zu refreshen
      return await this.refreshAccessToken();
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();
function logout() {
  throw new Error("Function not implemented.");
}

