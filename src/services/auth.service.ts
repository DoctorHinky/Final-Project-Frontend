// src/services/auth.service.ts
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

class AuthService {
  /**
   * Prüft ob ein Benutzer eingeloggt ist
   */
  isLoggedIn(): boolean {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      
      // Token ist noch gültig
      return decoded.exp > currentTime;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  /**
   * Prüft ob ein Admin eingeloggt ist
   */
  isAdminLoggedIn(): boolean {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      
      // Token muss gültig sein
      if (decoded.exp <= currentTime) {
        return false;
      }

      // Rolle extrahieren (verschiedene Möglichkeiten)
      let userRole = '';
      if (decoded.role) {
        userRole = decoded.role;
      } else if ((decoded as any).roles && Array.isArray((decoded as any).roles)) {
        userRole = (decoded as any).roles[0];
      } else if ((decoded as any).user && (decoded as any).user.role) {
        userRole = (decoded as any).user.role;
      }

      // Prüfen ob Admin oder Moderator (case-insensitive)
      const normalizedRole = userRole.toLowerCase();
      return normalizedRole === 'admin' || normalizedRole === 'moderator';
      
    } catch (error) {
      console.error('Admin token validation error:', error);
      return false;
    }
  }

  /**
   * Holt die aktuelle Benutzerrolle
   */
  getUserRole(): string | null {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      
      // Rolle extrahieren
      if (decoded.role) {
        return decoded.role;
      } else if ((decoded as any).roles && Array.isArray((decoded as any).roles)) {
        return (decoded as any).roles[0];
      } else if ((decoded as any).user && (decoded as any).user.role) {
        return (decoded as any).user.role;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }

  /**
   * Holt die Benutzerdaten aus dem Token
   */
  getUserData(): DecodedToken | null {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Logout - entfernt alle Token
   */
  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('adminRole');
  }

  /**
   * Admin Logout
   */
  adminLogout(): void {
    this.logout();
    // Weiterleitung zur Admin-Login-Seite
    window.location.href = '/admin';
  }

  /**
   * Prüft ob das Token bald abläuft (innerhalb der nächsten 5 Minuten)
   */
  isTokenExpiringSoon(): boolean {
    const token = localStorage.getItem('accessToken');
    if (!token) return true;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = decoded.exp - currentTime;
      
      // Token läuft in weniger als 5 Minuten ab
      return timeUntilExpiry < 300;
    } catch (error) {
      return true;
    }
  }

  /**
   * Erneuert das Access Token mit dem Refresh Token
   */
  async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const response = await fetch('https://final-project-backend-rsqk.onrender.com/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('refreshToken', data.refresh_token);
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }
}

export const authService = new AuthService();