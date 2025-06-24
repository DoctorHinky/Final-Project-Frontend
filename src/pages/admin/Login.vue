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
              :disabled="isLoading || isRedirecting"
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
              :disabled="isLoading || isRedirecting"
            />
          </div>
        </div>

        <div v-if="errorMessage" class="alert alert-error">
          <span class="alert-icon">⚠️</span>
          <span>{{ errorMessage }}</span>
        </div>

        <div v-if="successMessage && !isRedirecting" class="alert alert-success">
          <span class="alert-icon">✓</span>
          <span>{{ successMessage }}</span>
        </div>

        <!-- Weiterleitungs-Loader -->
        <div v-if="isRedirecting" class="redirect-loader">
          <div class="loader-container">
            <div class="orbital-loader">
              <!-- Zentrale pulsierende Kugel -->
              <div class="core">
                <div class="core-inner"></div>
                <div class="core-glow"></div>
              </div>
              
              <!-- Orbitale Ringe -->
              <div class="orbit orbit-1">
                <div class="orbit-particle"></div>
              </div>
              <div class="orbit orbit-2">
                <div class="orbit-particle"></div>
              </div>
              <div class="orbit orbit-3">
                <div class="orbit-particle"></div>
              </div>
              
              <!-- Morphende Formen -->
              <div class="morph-container">
                <div class="morph-shape shape-1"></div>
                <div class="morph-shape shape-2"></div>
                <div class="morph-shape shape-3"></div>
              </div>
              
              <!-- Energie-Wellen -->
              <div class="energy-wave wave-1"></div>
              <div class="energy-wave wave-2"></div>
              
              <!-- Glitch-Effekte -->
              <div class="glitch-container">
                <div class="glitch-line"></div>
                <div class="glitch-line"></div>
                <div class="glitch-line"></div>
              </div>
            </div>
            <p class="redirect-message">
              <span class="message-text">Initialisiere sicheren Zugang</span>
              <span class="loading-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </p>
          </div>
        </div>

        <div class="login-actions">
          <button 
            type="submit" 
            class="login-button" 
            :disabled="isLoading || isRedirecting"
          >
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
    const isRedirecting = ref(false);
    const errorMessage = ref("");
    const successMessage = ref("");

    // Überprüfung ob Benutzer bereits eingeloggt ist
    onMounted(() => {
      console.log("[AdminLogin] Component mounted, checking auth status...");
      
      if (authService.isAdminLoggedIn()) {
        console.log("[AdminLogin] User already logged in as admin, redirecting...");
        const redirectTo = (route.query.redirect as string) || "/admin/dashboard";
        router.push(redirectTo);
      }
    });

    const handleLogin = async () => {
      try {
        isLoading.value = true;
        errorMessage.value = "";
        successMessage.value = "";

        const trimmedInput = loginForm.username.trim();
        console.log("[AdminLogin] Attempting login with:", trimmedInput);

        // Verwende die adminLogin Methode aus authService
        const result = await authService.adminLogin(trimmedInput, loginForm.password);
        
        console.log("[AdminLogin] Login result:", result);

        if (result.success) {
          successMessage.value = "Anmeldung erfolgreich!";
          
          // Zeige Weiterleitungs-Loader nach kurzer Verzögerung
          setTimeout(() => {
            isRedirecting.value = true;
          }, 300);
          
          // Weiterleitung nach kurzer Verzögerung
          setTimeout(async () => {
            try {
              // Prüfe nochmal ob Admin eingeloggt
              const isAdminLoggedIn = authService.isAdminLoggedIn();
              console.log("[AdminLogin] Admin login check before redirect:", isAdminLoggedIn);
              
              const redirectTo = (route.query.redirect as string) || "/admin/dashboard";
              console.log("[AdminLogin] Redirecting to:", redirectTo);
              
              // Verwende router.replace statt router.push
              await router.replace(redirectTo);
              
              // Fallback falls Vue Router nicht funktioniert
              if (router.currentRoute.value.path !== redirectTo) {
                console.log("[AdminLogin] Vue Router redirect failed, using window.location");
                window.location.href = redirectTo;
              }
            } catch (err) {
              console.error("[AdminLogin] Redirect error:", err);
              // Hard redirect als letzter Ausweg
              window.location.href = "/admin/dashboard";
            }
          }, 800);
        } else {
          console.log("[AdminLogin] Login failed:", result.message);
          errorMessage.value = result.message || "Zugriff verweigert. Sie benötigen Admin-Rechte.";
        }
      } catch (error: any) {
        console.error("[AdminLogin] Exception during login:", error);
        
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
      isRedirecting.value = false;
    };

    return {
      loginForm,
      isLoading,
      isRedirecting,
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

  @media (min-width: 1200px) {
    padding-top: 2rem;
  }
}

// Animierter Learn To Grow Titel
.admin-login-page .animated-title {
  display: flex;
  gap: 2rem;
  margin-bottom: 4rem;
  font-size: 6rem !important;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  z-index: 10;

  .word {
    display: flex;

    &.learn .letter {
      color: #5dade2;
      text-shadow: 0 0 30px rgba(93, 173, 226, 0.8), 0 0 60px rgba(93, 173, 226, 0.6), 0 0 90px rgba(93, 173, 226, 0.4);
      -webkit-text-stroke: 3px #2e86de;
    }

    &.to .letter {
      color: #ff6b9d;
      text-shadow: 0 0 30px rgba(255, 107, 157, 0.8), 0 0 60px rgba(255, 107, 157, 0.6),
        0 0 90px rgba(255, 107, 157, 0.4);
      -webkit-text-stroke: 3px #c44569;
    }

    &.grow .letter {
      color: #ff8c42;
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
    font-size: 4rem !important;
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
    font-size: 3rem !important;
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
  box-shadow: 0 10px 25px 0 rgba(93, 173, 226, 0.25),
    0 0 0 8px rgba(255, 107, 157, 0.1),
    0 0 40px 0 rgba(255, 140, 66, 0.12),
    0 0 80px 0 rgba(255, 255, 255, 0.08);
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
    border-left: 4px solid #ff6b9d;
    color: #ff8fab;
    box-shadow: 0 0 20px rgba(255, 107, 157, 0.2);
  }

  &.alert-success {
    background-color: rgba(46, 204, 113, 0.15);
    border-left: 4px solid #5dade2;
    color: #6dd5ff;
    box-shadow: 0 0 20px rgba(93, 173, 226, 0.2);
  }

  .alert-icon {
    margin-right: map.get(vars.$spacing, s);
    font-size: 1.2em;
  }
}

// Weiterleitungs-Loader Styles
.redirect-loader {
  margin: map.get(vars.$spacing, l) 0;
  animation: fadeIn 0.4s ease-out;

  .loader-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: map.get(vars.$spacing, xl);
    padding: map.get(vars.$spacing, xl) map.get(vars.$spacing, xxl);
    background: radial-gradient(ellipse at center, rgba(93, 173, 226, 0.05) 0%, transparent 70%);
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);
    position: relative;
    min-height: 200px;
  }

  .orbital-loader {
    width: 120px;
    height: 120px;
    position: relative;
    transform-style: preserve-3d;
    animation: rotateLoader 20s linear infinite;
    
    // Zentraler Kern
    .core {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 30px;
      height: 30px;
      
      .core-inner {
        width: 100%;
        height: 100%;
        background: radial-gradient(circle, #5dade2 0%, #ff6b9d 50%, #ff8c42 100%);
        border-radius: 50%;
        animation: corePulse 2s ease-in-out infinite;
        box-shadow: 0 0 40px rgba(93, 173, 226, 0.8),
                    0 0 80px rgba(255, 107, 157, 0.6),
                    inset 0 0 20px rgba(255, 255, 255, 0.5);
      }
      
      .core-glow {
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(93, 173, 226, 0.4) 0%, transparent 70%);
        animation: glowPulse 2s ease-in-out infinite;
      }
    }
    
    // Orbitale Ringe
    .orbit {
      position: absolute;
      top: 50%;
      left: 50%;
      border: 2px solid transparent;
      border-radius: 50%;
      transform-style: preserve-3d;
      
      &.orbit-1 {
        width: 80px;
        height: 80px;
        transform: translate(-50%, -50%) rotateX(60deg) rotateZ(0deg);
        animation: orbit1 3s linear infinite;
        
        .orbit-particle {
          background: linear-gradient(45deg, #5dade2, #2e86de);
          box-shadow: 0 0 20px #5dade2, 0 0 40px rgba(93, 173, 226, 0.8);
        }
      }
      
      &.orbit-2 {
        width: 100px;
        height: 100px;
        transform: translate(-50%, -50%) rotateX(60deg) rotateY(60deg);
        animation: orbit2 4s linear infinite reverse;
        
        .orbit-particle {
          background: linear-gradient(45deg, #ff6b9d, #c44569);
          box-shadow: 0 0 20px #ff6b9d, 0 0 40px rgba(255, 107, 157, 0.8);
        }
      }
      
      &.orbit-3 {
        width: 120px;
        height: 120px;
        transform: translate(-50%, -50%) rotateX(60deg) rotateZ(120deg);
        animation: orbit3 5s linear infinite;
        
        .orbit-particle {
          background: linear-gradient(45deg, #ff8c42, #e55934);
          box-shadow: 0 0 20px #ff8c42, 0 0 40px rgba(255, 140, 66, 0.8);
        }
      }
      
      .orbit-particle {
        position: absolute;
        width: 10px;
        height: 10px;
        top: -5px;
        left: calc(50% - 5px);
        border-radius: 50%;
        transform-style: preserve-3d;
      }
    }
    
    // Morphende Formen
    .morph-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      
      .morph-shape {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 60px;
        height: 60px;
        transform: translate(-50%, -50%);
        border: 2px solid;
        opacity: 0.3;
        
        &.shape-1 {
          border-color: #5dade2;
          border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          animation: morphShape1 8s ease-in-out infinite;
        }
        
        &.shape-2 {
          border-color: #ff6b9d;
          border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%;
          animation: morphShape2 8s ease-in-out infinite 2.5s;
        }
        
        &.shape-3 {
          border-color: #ff8c42;
          border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%;
          animation: morphShape3 8s ease-in-out infinite 5s;
        }
      }
    }
    
    // Energie-Wellen
    .energy-wave {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 150px;
      height: 150px;
      transform: translate(-50%, -50%);
      border: 1px solid;
      border-radius: 50%;
      opacity: 0;
      
      &.wave-1 {
        border-color: rgba(93, 173, 226, 0.5);
        animation: energyWave 3s ease-out infinite;
      }
      
      &.wave-2 {
        border-color: rgba(255, 107, 157, 0.5);
        animation: energyWave 3s ease-out infinite 1.5s;
      }
    }
    
    // Glitch-Effekte
    .glitch-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      opacity: 0.8;
      
      .glitch-line {
        position: absolute;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, transparent, #5dade2, transparent);
        opacity: 0;
        
        &:nth-child(1) {
          top: 25%;
          animation: glitchLine 4s ease-in-out infinite;
        }
        
        &:nth-child(2) {
          top: 50%;
          background: linear-gradient(90deg, transparent, #ff6b9d, transparent);
          animation: glitchLine 4s ease-in-out infinite 1.3s;
        }
        
        &:nth-child(3) {
          top: 75%;
          background: linear-gradient(90deg, transparent, #ff8c42, transparent);
          animation: glitchLine 4s ease-in-out infinite 2.6s;
        }
      }
    }
  }

  .redirect-message {
    color: #6dd5ff;
    font-size: map.get(map.get(vars.$fonts, sizes), medium);
    font-weight: map.get(map.get(vars.$fonts, weights), medium);
    margin: 0;
    text-align: center;
    display: flex;
    align-items: center;
    gap: 4px;
    
    .message-text {
      text-shadow: 0 0 10px rgba(93, 173, 226, 0.6);
      letter-spacing: 0.5px;
    }
    
    .loading-dots {
      display: inline-flex;
      
      span {
        display: inline-block;
        width: 4px;
        height: 4px;
        background: #6dd5ff;
        border-radius: 50%;
        margin: 0 2px;
        opacity: 0;
        animation: loadingDot 1.4s ease-in-out infinite;
        box-shadow: 0 0 4px rgba(93, 173, 226, 0.8);
        
        &:nth-child(1) {
          animation-delay: 0s;
        }
        
        &:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        &:nth-child(3) {
          animation-delay: 0.4s;
        }
      }
    }
  }
}

// Loader Animationen
@keyframes rotateLoader {
  0% {
    transform: rotateY(0deg) rotateX(10deg);
  }
  100% {
    transform: rotateY(360deg) rotateX(10deg);
  }
}

@keyframes corePulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

@keyframes glowPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.5);
    opacity: 1;
  }
}

@keyframes orbit1 {
  0% {
    transform: translate(-50%, -50%) rotateX(60deg) rotateZ(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotateX(60deg) rotateZ(360deg);
  }
}

@keyframes orbit2 {
  0% {
    transform: translate(-50%, -50%) rotateX(60deg) rotateY(60deg) rotateZ(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotateX(60deg) rotateY(60deg) rotateZ(360deg);
  }
}

@keyframes orbit3 {
  0% {
    transform: translate(-50%, -50%) rotateX(60deg) rotateZ(120deg);
  }
  100% {
    transform: translate(-50%, -50%) rotateX(60deg) rotateZ(480deg);
  }
}

@keyframes morphShape1 {
  0%, 100% {
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
    transform: translate(-50%, -50%) rotate(0deg) scale(1);
  }
  25% {
    border-radius: 70% 30% 50% 50% / 50% 60% 40% 50%;
    transform: translate(-50%, -50%) rotate(90deg) scale(1.1);
  }
  50% {
    border-radius: 50% 50% 30% 70% / 70% 50% 50% 30%;
    transform: translate(-50%, -50%) rotate(180deg) scale(0.9);
  }
  75% {
    border-radius: 40% 60% 60% 40% / 60% 30% 70% 40%;
    transform: translate(-50%, -50%) rotate(270deg) scale(1.05);
  }
}

@keyframes morphShape2 {
  0%, 100% {
    border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%;
    transform: translate(-50%, -50%) rotate(0deg) scale(1);
  }
  33% {
    border-radius: 30% 70% 50% 50% / 30% 50% 50% 70%;
    transform: translate(-50%, -50%) rotate(-120deg) scale(1.15);
  }
  66% {
    border-radius: 50% 50% 70% 30% / 50% 30% 70% 50%;
    transform: translate(-50%, -50%) rotate(-240deg) scale(0.85);
  }
}

@keyframes morphShape3 {
  0%, 100% {
    border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%;
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
  }
  50% {
    border-radius: 20% 80% 80% 20% / 80% 20% 80% 20%;
    transform: translate(-50%, -50%) scale(1.3);
    opacity: 0.1;
  }
}

@keyframes energyWave {
  0% {
    transform: translate(-50%, -50%) scale(0.3);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

@keyframes glitchLine {
  0%, 100% {
    opacity: 0;
    transform: translateX(-100%);
  }
  20% {
    opacity: 0;
    transform: translateX(-100%);
  }
  25% {
    opacity: 1;
    transform: translateX(0);
  }
  30% {
    opacity: 0;
    transform: translateX(100%);
  }
}

@keyframes loadingDot {
  0%, 80%, 100% {
    opacity: 0;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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

    .MovingPointBorderTop,
    .MovingPointBorderBottom {
      height: 2px;
    }

    .MovingPointBorderLeft,
    .MovingPointBorderRight {
      width: 2px;
    }
  }

  .redirect-loader {
    .loader-container {
      padding: map.get(vars.$spacing, m);
      gap: map.get(vars.$spacing, l);
    }

    .orbital-loader {
      width: 80px;
      height: 80px;

      .core {
        .core-inner {
          width: 20px;
          height: 20px;
        }
      }

      .orbit {
        &.orbit-1 {
          width: 50px;
          height: 50px;
        }
        
        &.orbit-2 {
          width: 65px;
          height: 65px;
        }
        
        &.orbit-3 {
          width: 80px;
          height: 80px;
        }

        .orbit-particle {
          width: 6px;
          height: 6px;
          top: -3px;
          left: calc(50% - 3px);
        }
      }

      .morph-container .morph-shape {
        width: 40px;
        height: 40px;
      }

      .energy-wave {
        width: 100px;
        height: 100px;
      }
    }

    .redirect-message {
      font-size: map.get(map.get(vars.$fonts, sizes), small);
    }
  }
}
</style>