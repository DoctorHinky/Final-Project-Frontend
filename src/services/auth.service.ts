// src/services/auth.service.ts
// Erweiterter Authentifizierungsservice mit Admin-Funktionen

class AuthService {
  private isAuthenticated: boolean = false;
  private isAdmin: boolean = false;
  private storageKey: string = 'user_auth';
  private adminStorageKey: string = 'admin_auth';

  constructor() {
    // Überprüfen, ob der Benutzer bereits eingeloggt ist (beim Neuladen)
    this.checkAuthStatus();
  }

  // Beim Start prüfen, ob es eine gespeicherte Authentifizierung gibt
  private checkAuthStatus(): void {
    const storedAuth = localStorage.getItem(this.storageKey);
    const adminAuth = localStorage.getItem(this.adminStorageKey);

    if (storedAuth) {
      try {
        JSON.parse(storedAuth);
        // Hier könnte ein Token-Check erfolgen
        this.isAuthenticated = true;
      } catch (e) {
        // Bei ungültigen Daten, Auth-Status zurücksetzen
        localStorage.removeItem(this.storageKey);
        this.isAuthenticated = false;
      }
    }

    if (adminAuth) {
      try {
        JSON.parse(adminAuth);
        this.isAdmin = true;
      } catch (e) {
        localStorage.removeItem(this.adminStorageKey);
        this.isAdmin = false;
      }
    }
  }

  // Einfacher Login mit Dummy-Werten
  login(email: string, password: string): Promise<{ success: boolean, message?: string }> {
    return new Promise((resolve) => {
      // Simuliere eine Netzwerkverzögerung
      setTimeout(() => {
        // DUMMY: Einfache Validierung für Test-Zwecke
        // Im echten System würde hier eine API-Anfrage erfolgen
        if (email === 'test@example.com' && password === 'password123') {
          const userData = {
            email: email,
            name: 'Test Benutzer',
            token: 'dummy-jwt-token',
            expires: new Date().getTime() + 24 * 60 * 60 * 1000 // 24 Stunden
          };

          // Speichern der Benutzerdaten im localStorage
          localStorage.setItem(this.storageKey, JSON.stringify(userData));
          this.isAuthenticated = true;

          resolve({ success: true });
        } else {
          resolve({
            success: false,
            message: 'Ungültige E-Mail oder Passwort. Hinweis: Verwende test@example.com und password123'
          });
        }
      }, 500); // 500ms Verzögerung für realistisches Gefühl
    });
  }

  // Admin-Login mit separaten Anmeldedaten
  adminLogin(username: string, password: string): Promise<{ success: boolean, message?: string }> {
    return new Promise((resolve) => {
      // Simuliere eine Netzwerkverzögerung
      setTimeout(() => {
        // DUMMY: Einfache Validierung für Admin-Zwecke
        if (username === 'admin' && password === 'admin123') {
          const adminData = {
            username: username,
            role: 'admin',
            token: 'admin-jwt-token',
            expires: new Date().getTime() + 8 * 60 * 60 * 1000 // 8 Stunden
          };
          
          localStorage.setItem(this.adminStorageKey, JSON.stringify(adminData));
          this.isAdmin = true;
          
          resolve({ success: true });
        } else {
          resolve({
            success: false,
            message: 'Ungültige Admin-Anmeldedaten. Hinweis: Verwende admin und admin123'
          });
        }
      }, 500);
    });
  }

  // Benutzer abmelden
  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.isAuthenticated = false;
    // In einer echten Anwendung würde hier eine Anfrage an das Backend gesendet werden
    // um z.B. den Token zu invalidieren
  }

  // Admin abmelden
  adminLogout(): void {
    localStorage.removeItem(this.adminStorageKey);
    this.isAdmin = false;
  }

  // Authentifizierungsstatus abrufen
  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  // Admin-Status prüfen
  isAdminLoggedIn(): boolean {
    const adminAuth = localStorage.getItem(this.adminStorageKey);
    return !!adminAuth;
  }

  // Alias für isLoggedIn (für Kompatibilität mit neueren Komponenten)
  // Diese Methode wurde hinzugefügt, um die Naming-Konvention anzugleichen
  getAuthStatus(): boolean {
    return this.isLoggedIn();
  }

  // Benutzerdaten abrufen (falls benötigt)
  getUserData(): any {
    const storedAuth = localStorage.getItem(this.storageKey);
    if (storedAuth) {
      try {
        return JSON.parse(storedAuth);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  // Admin-Daten abrufen
  getAdminData(): any {
    const adminAuth = localStorage.getItem(this.adminStorageKey);
    if (adminAuth) {
      try {
        return JSON.parse(adminAuth);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}

// Exportieren einer Singleton-Instanz
export const authService = new AuthService();