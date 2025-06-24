import { jwtDecode } from "jwt-decode";
import api from "./axiosInstance";
import axios from "axios";

const url = import.meta.env.VITE_BASE_URL;

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
  private countdownIntervalId: ReturnType<typeof setInterval> | null = null;
  private rememberMe = false;
  private isRefreshing = false;

  constructor() {
    const flag = localStorage.getItem("remember_me_flag");
    this.rememberMe = flag === "true";
  }

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

      const { access_token, refresh_token } = response.data;

      this.rememberMe = rememberMe;
      localStorage.setItem("remember_me_flag", String(rememberMe));
      const storage = this.getStorage();
      storage.setItem(this.accessTokenKey, access_token);
      storage.setItem(this.refreshTokenKey, refresh_token);

      const decoded = jwtDecode<DecodedToken>(access_token);

      this.scheduleTokenRefresh();
      this.startTokenCountdown();
      return { success: true, role: decoded.role };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false };
    }
  }

  // Admin Login - verwendet die gleiche Logik wie normaler Login
  async adminLogin(
    emailOrUsername: string,
    password: string
  ): Promise<{ success: boolean; role?: string; message?: string }> {
    try {
      console.log("[AdminLogin] Start mit:", emailOrUsername);

      // Verwende die normale login Methode
      const loginData: any = { password };
      const trimmedInput = emailOrUsername.trim();
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedInput);

      if (isEmail) {
        loginData.email = trimmedInput;
      } else {
        loginData.username = trimmedInput;
      }

      console.log("[AdminLogin] Sende Request an Backend...");

      const response = await api.post("/auth/local/login", loginData, {
        headers: { "Content-Type": "application/json" },
      });

      const { access_token, refresh_token } = response.data;

      console.log("[AdminLogin] Response erhalten, Token vorhanden:", !!access_token);

      if (!access_token) {
        return { success: false, message: "Keine Tokens erhalten" };
      }

      const decoded = jwtDecode<DecodedToken>(access_token);
      console.log("[AdminLogin] Token dekodiert, Rolle:", decoded.role);

      // Prüfe ob User Admin/Moderator ist
      if (decoded.role !== "ADMIN" && decoded.role !== "MODERATOR") {
        console.log("[AdminLogin] Keine Admin-Berechtigung");
        return { success: false, message: "Keine Admin-Berechtigung" };
      }

      // Speichere Tokens in sessionStorage für Admin
      sessionStorage.setItem(this.accessTokenKey, access_token);
      sessionStorage.setItem(this.refreshTokenKey, refresh_token);

      // Admin-spezifische Token-Keys für bessere Trennung
      sessionStorage.setItem("admin_access_token", access_token);
      sessionStorage.setItem("admin_refresh_token", refresh_token);

      console.log("[AdminLogin] Tokens gespeichert in sessionStorage");

      // Starte Token-Refresh für Admin
      this.scheduleTokenRefresh();
      this.startTokenCountdown();

      console.log("[AdminLogin] Login erfolgreich, Rolle:", decoded.role);
      return { success: true, role: decoded.role };
    } catch (error: any) {
      console.error("[AdminLogin] Fehler:", error);
      console.error("[AdminLogin] Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });

      let message = "Ein Fehler ist aufgetreten";
      if (error.response?.status === 401) {
        message = "Ungültige Anmeldedaten";
      } else if (error.response?.status === 403) {
        message = "Zugriff verweigert";
      }

      return { success: false, message };
    }
  }

  logout(): void {
    // Timer stoppen
    if (this.refreshTimeoutId !== null) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }

    // Countdown stoppen
    if (this.countdownIntervalId !== null) {
      clearInterval(this.countdownIntervalId);
      this.countdownIntervalId = null;
    }

    // Tokens aus beiden Storages entfernen
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    sessionStorage.removeItem(this.accessTokenKey);
    sessionStorage.removeItem(this.refreshTokenKey);

    // Admin-spezifische Tokens entfernen
    sessionStorage.removeItem("admin_access_token");
    sessionStorage.removeItem("admin_refresh_token");

    // Flags zurücksetzen
    this.isRefreshing = false;
    localStorage.removeItem("remember_me_flag");
  }

  adminLogout(): void {
    this.logout(); // Verwende die normale logout Methode
  }

  getAccessToken(): string | null {
    // Zuerst in localStorage suchen, dann in sessionStorage
    return localStorage.getItem(this.accessTokenKey) || sessionStorage.getItem(this.accessTokenKey);
  }

  getUserData(): DecodedToken | null {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error("Fehler beim Dekodieren des Tokens:", error);
      return null;
    }
  }

  getRefreshToken(): string | null {
    // Zuerst in localStorage suchen, dann in sessionStorage
    return localStorage.getItem(this.refreshTokenKey) || sessionStorage.getItem(this.refreshTokenKey);
  }

  getAdminAccessToken(): string | null {
    // Prüfe zuerst Admin-spezifische Keys
    const adminToken = sessionStorage.getItem("admin_access_token");
    if (adminToken) return adminToken;

    // Fallback auf normale Tokens
    const normalToken = this.getAccessToken();
    if (normalToken) {
      try {
        const decoded = jwtDecode<DecodedToken>(normalToken);
        if (decoded.role === "ADMIN" || decoded.role === "MODERATOR") {
          return normalToken;
        }
      } catch (e) {
        console.error("Token decode error:", e);
      }
    }

    return null;
  }

  private getStorage(): Storage {
    return this.rememberMe ? localStorage : sessionStorage;
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

      // Token ist abgelaufen
      return false;
    } catch {
      return false;
    }
  }

  isAdminLoggedIn(): boolean {
    const token = this.getAdminAccessToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const now = Date.now() / 1000;

      // Prüfe ob Token noch gültig ist UND ob User Admin/Moderator ist
      if (decoded.exp && decoded.exp > now) {
        const isAdminOrMod = decoded.role === "ADMIN" || decoded.role === "MODERATOR";
        return isAdminOrMod;
      }

      return false;
    } catch (error) {
      console.error("[Auth] Fehler beim Prüfen des Admin-Status:", error);
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
        if (!this.isRefreshing) this.refreshAccessToken();
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

    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.logout();
      return false;
    }

    this.isRefreshing = true;

    try {
      const response = await axios.post(
        `${url}/auth/refresh`,
        {},
        {
          headers: { Authorization: `Bearer ${refreshToken}` },
        }
      );

      const { access_token, refresh_token } = response.data;

      if (!access_token) {
        throw new Error("Kein neuer Access Token erhalten");
      }

      // Bestimme wo Tokens gespeichert werden sollen
      const isAdmin = sessionStorage.getItem("admin_access_token") !== null;
      const storage = isAdmin ? sessionStorage : this.getStorage();

      // Beide Tokens speichern
      storage.setItem(this.accessTokenKey, access_token);
      if (refresh_token) {
        storage.setItem(this.refreshTokenKey, refresh_token);
      }

      // Admin-spezifische Tokens aktualisieren falls Admin
      if (isAdmin) {
        sessionStorage.setItem("admin_access_token", access_token);
        if (refresh_token) {
          sessionStorage.setItem("admin_refresh_token", refresh_token);
        }
      }

      // Neuen Refresh planen
      this.scheduleTokenRefresh();

      // Countdown für neuen Token starten
      this.startTokenCountdown();

      this.isRefreshing = false;
      return true;
    } catch (e) {
      console.error("❌ Token konnte nicht erneuert werden:", e);
      this.isRefreshing = false;

      // Bei Fehler ausloggen
      this.logout();
      return false;
    }
  }

  startTokenCountdown(): void {
    // Vorherigen Countdown stoppen
    if (this.countdownIntervalId !== null) {
      clearInterval(this.countdownIntervalId);
      this.countdownIntervalId = null;
    }

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

      this.countdownIntervalId = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const remaining = decoded.exp! - now;

        if (remaining <= 0) {
          if (this.countdownIntervalId) {
            clearInterval(this.countdownIntervalId);
            this.countdownIntervalId = null;
          }
        }
      }, 10000); // Alle 10 Sekunden aktualisieren
    } catch (e) {
      console.error("❌ Fehler beim Dekodieren des Tokens:", e);
    }
  }

  isRememberMeActive(): boolean {
    return localStorage.getItem("remember_me_flag") === "true";
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
