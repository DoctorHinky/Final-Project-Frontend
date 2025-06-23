<!-- src/pages/admin/Login.vue -->
<template>
  <div class="admin-login-page">
    <!-- Animierter Learn To Grow Titel -->
    <div class="animated-title">
      <div class="word learn">
        <span
          class="letter"
          v-for="(letter, index) in 'Learn'"
          :key="'learn-' + index"
          :style="{ animationDelay: index * 0.1 + 's' }"
          >{{ letter }}</span
        >
      </div>
      <div class="word to">
        <span
          class="letter"
          v-for="(letter, index) in 'To'"
          :key="'to-' + index"
          :style="{ animationDelay: (5 + index) * 0.1 + 's' }"
          >{{ letter }}</span
        >
      </div>
      <div class="word grow">
        <span
          class="letter"
          v-for="(letter, index) in 'Grow'"
          :key="'grow-' + index"
          :style="{ animationDelay: (7 + index) * 0.1 + 's' }"
          >{{ letter }}</span
        >
      </div>
    </div>

    <div class="login-container">
      <span class="MovingPointBorderTop"></span>
      <span class="MovingPointBorderBottom"></span>
      <span class="MovingPointBorderLeft"></span>
      <span class="MovingPointBorderRight"></span>

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
import { authService } from "../../services/auth.service";
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
      if (authService.isAdminLoggedIn()) {
        router.push("/admin/dashboard");
      }
    });

    const handleLogin = async () => {
      try {
        isLoading.value = true;
        errorMessage.value = "";
        successMessage.value = "";

        // Direkt den eingegebenen Wert verwenden (Email oder Username)
        const trimmedInput = loginForm.username.trim();

        console.log("[Admin Login] Verwende adminLogin Methode mit:", trimmedInput);

        // Verwende die adminLogin Methode aus authService
        const result = await authService.adminLogin(
          trimmedInput, // Kann Email oder Username sein
          loginForm.password
        );

        if (result.success) {
          successMessage.value = "Anmeldung erfolgreich! Sie werden weitergeleitet...";

          // Weiterleitung zum Admin-Dashboard nach kurzer Verzögerung
          setTimeout(() => {
            const redirectTo = (route.query.redirect as string) || "/admin/dashboard";
            router.push(redirectTo).catch((err) => {
              console.error("[Admin Login] Router-Fehler:", err);
              window.location.href = redirectTo;
            });
          }, 1000);
        } else {
          errorMessage.value = "Zugriff verweigert. Sie benötigen Admin-Rechte.";
        }
      } catch (error: any) {
        console.error("Admin login error:", error);

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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: map.get(vars.$spacing, l);
  background: linear-gradient(135deg, #181c24 0%, #23243a 60%, #181c24 100%);
  // dezente, dunkle Glasmorphismus-Optik mit leichten Farbakzenten
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background: radial-gradient(ellipse at 20% 30%, rgba(93, 173, 226, 0.1) 0, transparent 60%),
      radial-gradient(ellipse at 80% 70%, rgba(255, 107, 157, 0.08) 0, transparent 70%),
      radial-gradient(ellipse at 50% 100%, rgba(255, 140, 66, 0.08) 0, transparent 80%);
    mix-blend-mode: lighten;
  }
  position: relative;
  overflow: hidden;

  // Mehr Platz für größeren Titel
  @media (min-width: 1200px) {
    padding-top: 2rem;
  }
}

// Animierter Learn To Grow Titel
.admin-login-page .animated-title {
  display: flex;
  gap: 2rem;
  margin-bottom: 4rem;
  font-size: 6rem !important; // !important für höhere Spezifität
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  z-index: 10; // Sicherstellen, dass es über allem liegt

  .word {
    display: flex;

    &.learn .letter {
      color: #5dade2; // Helleres Blau
      text-shadow: 0 0 30px rgba(93, 173, 226, 0.8), 0 0 60px rgba(93, 173, 226, 0.6), 0 0 90px rgba(93, 173, 226, 0.4);
      -webkit-text-stroke: 3px #2e86de; // Dickerer Stroke für größere Schrift
    }

    &.to .letter {
      color: #ff6b9d; // Pink
      text-shadow: 0 0 30px rgba(255, 107, 157, 0.8), 0 0 60px rgba(255, 107, 157, 0.6),
        0 0 90px rgba(255, 107, 157, 0.4);
      -webkit-text-stroke: 3px #c44569;
    }

    &.grow .letter {
      color: #ff8c42; // Sattes Orange
      text-shadow: 0 0 30px rgba(255, 140, 66, 0.8), 0 0 60px rgba(255, 140, 66, 0.6), 0 0 90px rgba(255, 140, 66, 0.4);
      -webkit-text-stroke: 3px #e55934;
    }
  }

  .letter {
    display: inline-block;
    position: relative;
    opacity: 0;
    transform: translateX(-50px) scale(0.8);
    animation: letterSlideIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;

    // Glasmorphismus-Effekt für jeden Buchstaben
    &::before {
      content: attr(data-letter);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: inherit;
      filter: blur(0);
      z-index: -1;
      opacity: 0;
      animation: glassEffect 2s ease-in-out infinite;
      animation-delay: inherit;
    }

    &:hover {
      animation: letterPulse 0.5s ease-in-out;
      cursor: default;
    }
  }
}

@keyframes letterSlideIn {
  0% {
    opacity: 0;
    transform: translateX(-50px) scale(0.8) rotateY(-90deg);
    filter: blur(10px);
  }

  50% {
    opacity: 0.5;
    transform: translateX(10px) scale(1.1) rotateY(-45deg);
    filter: blur(5px);
  }

  100% {
    opacity: 1;
    transform: translateX(0) scale(1) rotateY(0);
    filter: blur(0);
    // Glasmorphismus-Basis
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
}

@keyframes glassEffect {
  0%,
  100% {
    opacity: 0;
    transform: scale(1);
    filter: blur(0);
  }

  50% {
    opacity: 0.3;
    transform: scale(1.2);
    filter: blur(20px);
  }
}

@keyframes letterPulse {
  0%,
  100% {
    transform: scale(1) translateY(0);
  }

  50% {
    transform: scale(1.15) translateY(-5px);
  }
}

// Responsive Anpassungen für den Titel
@media (max-width: 768px) {
  .admin-login-page .animated-title {
    font-size: 4rem !important; // Größer als vorher
    gap: 1.5rem;
    margin-bottom: 3rem;

    .word.learn .letter {
      -webkit-text-stroke: 2px #2e86de;
    }

    .word.to .letter {
      -webkit-text-stroke: 2px #c44569;
    }

    .word.grow .letter {
      -webkit-text-stroke: 2px #e55934;
    }
  }
}

@media (max-width: 480px) {
  .admin-login-page .animated-title {
    font-size: 3rem !important; // Auch auf Mobile größer
    gap: 1rem;
    flex-direction: column;
    align-items: center;

    .word.learn .letter,
    .word.to .letter,
    .word.grow .letter {
      -webkit-text-stroke: 1.5px;
    }
  }
}

.login-container {
  max-width: 600px;
  width: 100%;
  padding: map.get(vars.$spacing, xl);
  // Schimmernder Glasmorphismus-Effekt wie beim Learn To Grow Titel
  box-shadow: 0 10px 25px 0 rgba(93, 173, 226, 0.25),
    // Blau wie "Learn"
    0 0 0 8px rgba(255, 107, 157, 0.1),
    // Pink wie "To"
    0 0 40px 0 rgba(255, 140, 66, 0.12),
    // Orange wie "Grow"
    0 0 80px 0 rgba(255, 255, 255, 0.08); // Weißer Schimmer
  backdrop-filter: blur(16px) saturate(120%);
  -webkit-backdrop-filter: blur(16px) saturate(120%);
  background: rgba(30, 30, 40, 0.55);
  border: 1px solid #333;
  position: relative;
  z-index: 1;
  overflow: hidden;
  transition: all 0.4s ease;
  border-radius: map.get(map.get(vars.$layout, border-radius), medium);

  .MovingPointBorderTop,
  .MovingPointBorderBottom,
  .MovingPointBorderLeft,
  .MovingPointBorderRight {
    position: absolute;
    background: linear-gradient(45deg, #5dade2, #ff6b9d, #ff8c42);
    z-index: 2;
    display: block;
    animation: none;
  }

  &:hover {
    transform: scale(1.02);
    transition: transform 0.3s ease, border-color 0.3s ease;
    .MovingPointBorderTop {
      animation: MovingPointBorderTop 1s linear forwards;
    }
    .MovingPointBorderRight {
      animation: MovingPointBorderRight 1s linear forwards;
    }
    .MovingPointBorderBottom {
      animation: MovingPointBorderBottom 1s linear forwards;
    }
    .MovingPointBorderLeft {
      animation: MovingPointBorderLeft 1s linear forwards;
    }
  }

  .MovingPointBorderTop {
    top: 0;
    left: -100%;
    height: 2px;
    width: 50%;
  }

  .MovingPointBorderBottom {
    bottom: 0;
    right: -100%;
    height: 2px;
    width: 50%;
  }

  .MovingPointBorderLeft {
    left: 0;
    top: -100%;
    width: 2px;
    height: 50%;
  }

  .MovingPointBorderRight {
    right: 0;
    bottom: -100%;
    width: 2px;
    height: 50%;
  }
}

@keyframes MovingPointBorderTop {
  0% {
    left: -100%;
  }
  50% {
    left: 0;
  }
  100% {
    left: 100%;
  }
}

@keyframes MovingPointBorderBottom {
  0% {
    right: -100%;
  }
  50% {
    right: 0;
  }
  100% {
    right: 100%;
  }
}

@keyframes MovingPointBorderLeft {
  0% {
    top: -100%;
  }
  50% {
    top: 0;
  }
  100% {
    top: 100%;
  }
}

@keyframes MovingPointBorderRight {
  0% {
    bottom: -100%;
  }
  50% {
    bottom: 0;
  }
  100% {
    bottom: 100%;
  }
}

.login-header {
  text-align: center;
  margin-bottom: map.get(vars.$spacing, xl);

  h1 {
    font-size: map.get(map.get(vars.$fonts, sizes), xxl);
    font-weight: map.get(map.get(vars.$fonts, weights), bold);
    background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: map.get(vars.$spacing, s);
  }

  p {
    color: rgba(255, 255, 255, 0.6);
    font-size: map.get(map.get(vars.$fonts, sizes), medium);
  }
}

.login-form {
  .form-group {
    margin-bottom: map.get(vars.$spacing, l);

    label {
      display: block;
      margin-bottom: map.get(vars.$spacing, xs);
      color: rgba(255, 255, 255, 0.8);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      font-size: 0.95rem;
    }

    .input-container {
      position: relative;
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      background-color: rgba(42, 42, 42, 0.7);
      border: 2px solid rgba(68, 68, 68, 0.5);
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);

      &:focus-within {
        border-color: transparent;
        background: linear-gradient(135deg, rgba(93, 173, 226, 0.1), rgba(255, 107, 157, 0.1));
        box-shadow: 0 0 0 2px #5dade2,
          // Blauer Glow
          0 0 20px rgba(93, 173, 226, 0.4),
          0 0 40px rgba(255, 107, 157, 0.2);
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
          color: rgba(255, 255, 255, 0.4);
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
  backdrop-filter: blur(10px);

  &.alert-error {
    background-color: rgba(231, 76, 60, 0.15);
    border-left: 4px solid #ff6b9d; // Pink aus dem Farbschema
    color: #ff8fab;
    box-shadow: 0 0 20px rgba(255, 107, 157, 0.2);
  }

  &.alert-success {
    background-color: rgba(46, 204, 113, 0.15);
    border-left: 4px solid #5dade2; // Blau aus dem Farbschema
    color: #6dd5ff;
    box-shadow: 0 0 20px rgba(93, 173, 226, 0.2);
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
    background: linear-gradient(135deg, #5dade2, #ff6b9d, #ff8c42);
    background-size: 200% 200%;
    animation: gradientShift 8s ease infinite;
    color: white;
    border: none;
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);
    font-weight: map.get(map.get(vars.$fonts, weights), bold);
    font-size: map.get(map.get(vars.$fonts, sizes), medium);
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    box-shadow: 0 4px 15px rgba(93, 173, 226, 0.3), 0 2px 8px rgba(255, 107, 157, 0.2);

    // Glanz-Overlay
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: left 0.5s ease;
    }

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(93, 173, 226, 0.4), 0 4px 12px rgba(255, 107, 157, 0.3),
        0 8px 25px rgba(255, 140, 66, 0.2);

      &::before {
        left: 100%;
      }
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      animation: none;
      background: linear-gradient(135deg, #666, #555);
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

// Gradient Animation für Button
@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.back-to-site {
  margin-top: map.get(vars.$spacing, xl);
  text-align: center;

  .back-link {
    color: rgba(255, 255, 255, 0.5);
    text-decoration: none;
    font-size: map.get(map.get(vars.$fonts, sizes), small);
    transition: all 0.3s ease;
    position: relative;

    &::after {
      content: "";
      position: absolute;
      bottom: -2px;
      left: 50%;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, #5dade2, #ff6b9d);
      transition: all 0.3s ease;
      transform: translateX(-50%);
    }

    &:hover {
      color: #5dade2;

      &::after {
        width: 100%;
      }
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

    // Dünnere Borders für Mobile
    .MovingPointBorderTop,
    .MovingPointBorderBottom {
      height: 2px;
    }

    .MovingPointBorderLeft,
    .MovingPointBorderRight {
      width: 2px;
    }
  }
}
</style>
