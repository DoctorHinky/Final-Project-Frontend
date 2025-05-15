// src/services/auth.service.ts
// Vollständiger, angepasster Auth-Service

class AuthService {
  private isAuthenticated: boolean = false;
  private isAdmin: boolean = false;

  constructor() {
    // Überprüfen, ob der Benutzer bereits eingeloggt ist (beim Neuladen)
    this.checkAuthStatus();
  }

  // Beim Start prüfen, ob es eine gespeicherte Authentifizierung gibt
  private checkAuthStatus(): void {
    const accessToken = localStorage.getItem('accessToken');
    const adminAuth = localStorage.getItem('adminToken');

    this.isAuthenticated = !!accessToken;
    this.isAdmin = !!adminAuth;
  }

  // Authentifizierungsstatus abrufen
  isLoggedIn(): boolean {
    const accessToken = localStorage.getItem('accessToken');
    this.isAuthenticated = !!accessToken;
    return this.isAuthenticated;
  }

  // Admin-Status prüfen
  isAdminLoggedIn(): boolean {
    const adminAuth = localStorage.getItem('adminToken');
    this.isAdmin = !!adminAuth;
    return this.isAdmin;
  }

  // Benutzer abmelden
  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.isAuthenticated = false;
  }

  // Admin abmelden
  adminLogout(): void {
    localStorage.removeItem('adminToken');
    this.isAdmin = false;
  }

  // Alias für isLoggedIn (für Kompatibilität mit neueren Komponenten)
  getAuthStatus(): boolean {
    return this.isLoggedIn();
  }

  // Benutzerdaten abrufen (falls benötigt)
  getUserData(): any {
    // In einer echten Implementierung würden Sie hier den Token dekodieren
    // und die darin enthaltenen Benutzerdaten zurückgeben
    return null;
  }

  // Admin-Daten abrufen
  getAdminData(): any {
    // In einer echten Implementierung würden Sie hier den Admin-Token dekodieren
    return null;
  }
}

// Exportieren einer Singleton-Instanz
export const authService = new AuthService();