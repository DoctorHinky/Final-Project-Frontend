<!-- src/pages/admin/Login.vue -->
<template>
  <div class="admin-login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>Admin-Dashboard</h1>
        <p>Sicherheitsbereich - Nur für autorisierte Mitarbeiter</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Benutzername oder E-Mail</label>
          <div class="input-container">
            <input
              type="text"
              id="username"
              v-model="loginForm.username"
              required
              placeholder="Admin-Benutzername oder E-Mail"
              :disabled="isLoading"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">Passwort</label>
          <div class="input-container">
            <input
              type="password"
              id="password"
              v-model="loginForm.password"
              required
              placeholder="Admin-Passwort"
              :disabled="isLoading"
            />
          </div>
        </div>

        <div v-if="errorMessage" class="alert alert-error">
          <span class="alert-icon">⚠️</span>
          <span>{{ errorMessage }}</span>
        </div>

        <div v-if="successMessage" class="alert alert-success">
          <span class="alert-icon">✓</span>
          <span>{{ successMessage }}</span>
        </div>

        <div class="login-actions">
          <button type="submit" class="login-button" :disabled="isLoading">
            <span v-if="isLoading" class="loading-spinner"></span>
            <span v-else>Anmelden</span>
          </button>
        </div>
      </form>

      <div class="back-to-site">
        <router-link to="/" class="back-link">Zurück zur Webseite</router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  sub: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

export default defineComponent({
  name: "AdminLogin",
  setup() {
    const router = useRouter();
    const route = useRoute();

    // Reactive states
    const loginForm = reactive({
      username: "",
      password: "",
    });

    const isLoading = ref(false);
    const errorMessage = ref("");
    const successMessage = ref("");

    // Überprüfung ob Benutzer bereits eingeloggt ist
    onMounted(() => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const decoded = jwtDecode<DecodedToken>(token);

          // Überprüfen ob Token noch gültig ist
          const currentTime = Date.now() / 1000;
          if (decoded.exp > currentTime) {
            // Rolle extrahieren (verschiedene Möglichkeiten)
            let userRole = "";
            if (decoded.role) {
              userRole = decoded.role;
            } else if ((decoded as any).roles && Array.isArray((decoded as any).roles)) {
              userRole = (decoded as any).roles[0];
            } else if ((decoded as any).user && (decoded as any).user.role) {
              userRole = (decoded as any).user.role;
            }

            // Überprüfen ob Benutzer Admin-Rolle hat
            const normalizedRole = userRole.toLowerCase();
            if (normalizedRole === "admin" || normalizedRole === "moderator") {
              router.push("/admin/dashboard");
            }
          } else {
            // Token abgelaufen - entfernen
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("userRole");
          }
        } catch (error) {
          console.error("Token validation error:", error);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userRole");
        }
      }
    });

    const handleLogin = async () => {
      try {
        isLoading.value = true;
        errorMessage.value = "";
        successMessage.value = "";

        // Login-Daten vorbereiten
        const loginData: Record<string, string> = {};
        const trimmedInput = loginForm.username.trim();

        // Überprüfen ob E-Mail oder Benutzername
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedInput);
        if (isEmail) {
          loginData.email = trimmedInput;
        } else {
          loginData.username = trimmedInput;
        }

        loginData.password = loginForm.password;

        // API-Anfrage OHNE withCredentials, da das Backend es nicht unterstützt
        const response = await axios.post(
          "https://final-project-backend-rsqk.onrender.com/auth/local/login",
          loginData,
          {
            headers: { "Content-Type": "application/json" },
            // withCredentials: true entfernt wegen CORS-Konflikt
          }
        );

        console.log("Login response:", response.data); // Debug-Ausgabe

        // Da das Backend Tokens im Response Body zurückgibt (wie im ersten Login-Code)
        const { access_token, refresh_token } = response.data;

        if (!access_token) {
          errorMessage.value = "Keine Authentifizierungsdaten erhalten.";
          return;
        }

        // Token dekodieren um Rolle zu überprüfen
        let decoded: DecodedToken;
        try {
          decoded = jwtDecode<DecodedToken>(access_token);
          console.log("Decoded token:", decoded); // Debug-Ausgabe
          console.log("Token content:", JSON.stringify(decoded, null, 2)); // Vollständige Token-Struktur
        } catch (e) {
          console.error("Token decode error:", e);
          errorMessage.value = "Fehler beim Verarbeiten der Anmeldedaten.";
          return;
        }

        // Verschiedene mögliche Strukturen für die Rolle prüfen
        let userRole = "";

        // Möglichkeit 1: role direkt im Token
        if (decoded.role) {
          userRole = decoded.role;
        }
        // Möglichkeit 2: roles als Array
        else if ((decoded as any).roles && Array.isArray((decoded as any).roles)) {
          userRole = (decoded as any).roles[0];
        }
        // Möglichkeit 3: user.role verschachtelt
        else if ((decoded as any).user && (decoded as any).user.role) {
          userRole = (decoded as any).user.role;
        }

        console.log("Extracted user role:", userRole);

        // Überprüfen ob Benutzer Admin-Berechtigung hat
        // Rolle in Kleinbuchstaben konvertieren für den Vergleich
        const normalizedRole = userRole.toLowerCase();

        if (normalizedRole !== "admin" && normalizedRole !== "moderator") {
          errorMessage.value = `Zugriff verweigert. Sie benötigen Admin-Rechte. Ihre Rolle: ${
            userRole || "nicht gefunden"
          }`;

          // Debug: Zeige komplette Token-Struktur
          console.error("Vollständiges Token-Objekt:", decoded);
          return;
        }

        // Token speichern (wie im normalen Login)
        localStorage.setItem("accessToken", access_token);
        localStorage.setItem("refreshToken", refresh_token);
        localStorage.setItem("userRole", userRole);

        successMessage.value = "Anmeldung erfolgreich! Sie werden weitergeleitet...";

        // Weiterleitung zum Admin-Dashboard nach kurzer Verzögerung
        setTimeout(() => {
          const redirectTo = (route.query.redirect as string) || "/admin/dashboard";
          router.push(redirectTo);
        }, 1000);
      } catch (error: any) {
        console.error("Login error:", error);

        if (error.response?.status === 401) {
          errorMessage.value = "Ungültige Anmeldedaten. Bitte überprüfen Sie Benutzername und Passwort.";
        } else if (error.response?.status === 403) {
          errorMessage.value = "Zugriff verweigert. Sie haben keine Admin-Berechtigung.";
        } else if (error.response?.data?.message) {
          errorMessage.value = error.response.data.message;
        } else if (error.request) {
          errorMessage.value = "Verbindung zum Server fehlgeschlagen. Bitte versuchen Sie es später erneut.";
        } else {
          errorMessage.value = "Ein unerwarteter Fehler ist aufgetreten.";
        }
      } finally {
        isLoading.value = false;
      }
    };

    // Formular zurücksetzen
    const resetForm = () => {
      loginForm.username = "";
      loginForm.password = "";
      errorMessage.value = "";
      successMessage.value = "";
    };

    return {
      loginForm,
      isLoading,
      errorMessage,
      successMessage,
      handleLogin,
      resetForm,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;
@use "@/style/base/animations" as animations;

.admin-login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: map.get(vars.$spacing, l);
  background: #0f0f0f; // Dunkler Hintergrund für Admin-Bereich
}

.login-container {
  max-width: 450px;
  width: 100%;
  padding: map.get(vars.$spacing, xl);
  border-radius: map.get(map.get(vars.$layout, border-radius), large);
  background-color: #1a1a1a;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  border: 1px solid #333;
}

.login-header {
  text-align: center;
  margin-bottom: map.get(vars.$spacing, xl);

  h1 {
    font-size: map.get(map.get(vars.$fonts, sizes), xxl);
    font-weight: map.get(map.get(vars.$fonts, weights), bold);
    color: #ffffff;
    margin-bottom: map.get(vars.$spacing, s);
  }

  p {
    color: #a0a0a0;
    font-size: map.get(map.get(vars.$fonts, sizes), medium);
  }
}

.login-form {
  .form-group {
    margin-bottom: map.get(vars.$spacing, l);

    label {
      display: block;
      margin-bottom: map.get(vars.$spacing, xs);
      color: #cccccc;
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
    }

    .input-container {
      position: relative;
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      background-color: #2a2a2a;
      border: 1px solid #444;
      transition: all 0.3s ease;

      &:focus-within {
        border-color: #666;
        box-shadow: 0 0 0 3px rgba(100, 100, 100, 0.2);
      }

      input {
        width: 100%;
        padding: map.get(vars.$spacing, m);
        background: transparent;
        border: none;
        color: #ffffff;
        font-size: map.get(map.get(vars.$fonts, sizes), medium);

        &:focus {
          outline: none;
        }

        &::placeholder {
          color: #666;
        }

        &:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      }
    }
  }
}

.alert {
  margin-bottom: map.get(vars.$spacing, l);
  padding: map.get(vars.$spacing, m);
  border-radius: map.get(map.get(vars.$layout, border-radius), medium);
  display: flex;
  align-items: center;
  animation: slideIn 0.3s ease-out;

  &.alert-error {
    background-color: rgba(231, 76, 60, 0.2);
    border-left: 4px solid #e74c3c;
    color: #ff6b6b;
  }

  &.alert-success {
    background-color: rgba(46, 204, 113, 0.2);
    border-left: 4px solid #2ecc71;
    color: #4ade80;
  }

  .alert-icon {
    margin-right: map.get(vars.$spacing, s);
    font-size: 1.2em;
  }
}

.login-actions {
  margin-top: map.get(vars.$spacing, xl);

  .login-button {
    width: 100%;
    padding: map.get(vars.$spacing, m);
    background: linear-gradient(135deg, #444, #333);
    color: white;
    border: none;
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);
    font-weight: map.get(map.get(vars.$fonts, weights), bold);
    font-size: map.get(map.get(vars.$fonts, sizes), medium);
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #555, #444);
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .loading-spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s linear infinite;
    }
  }
}

.back-to-site {
  margin-top: map.get(vars.$spacing, xl);
  text-align: center;

  .back-link {
    color: #888;
    text-decoration: none;
    font-size: map.get(map.get(vars.$fonts, sizes), small);
    transition: color 0.3s ease;

    &:hover {
      color: #ccc;
      text-decoration: underline;
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: map.get(map.get(vars.$layout, breakpoints), mobile)) {
  .login-container {
    padding: map.get(vars.$spacing, l);
  }
}
</style>
