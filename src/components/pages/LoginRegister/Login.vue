<template>
  <div class="form-container">
    <div class="form-header">
      <div class="welcome-icon">
        <UserCircleIcon class="icon-large" />
      </div>
      <h2>Willkommen zurück!</h2>
      <p>Melde dich an, um auf dein persönliches Profil zuzugreifen.</p>
    </div>

    <Transition name="status">
      <div v-if="loginStatus.message" :class="['status-message', loginStatus.success ? 'success' : 'error']">
        <CheckCircleIcon v-if="loginStatus.success" class="status-icon" />
        <XCircleIcon v-else class="status-icon" />
        <span>{{ loginStatus.message }}</span>
      </div>
    </Transition>

    <form @submit.prevent="handleLogin" class="modern-form">
      <div class="form-group floating-label">
        <input
          type="text"
          id="login-identifier"
          v-model="loginForm.identifier"
          :class="{ 'has-value': loginForm.identifier }"
          required
          autocomplete="username"
        />
        <label for="login-identifier">
          <EnvelopeIcon class="label-icon" />
          E-Mail oder Benutzername
        </label>
        <div class="input-underline"></div>
      </div>

      <div class="form-group floating-label">
        <input
          :type="showLoginPassword ? 'text' : 'password'"
          id="login-password"
          v-model="loginForm.password"
          :class="{ 'has-value': loginForm.password }"
          required
          autocomplete="current-password"
        />
        <label for="login-password">
          <KeyIcon class="label-icon" />
          Passwort
        </label>
        <button
          type="button"
          class="password-toggle modern"
          @click="showLoginPassword = !showLoginPassword"
          :aria-label="showLoginPassword ? 'Passwort verbergen' : 'Passwort anzeigen'"
        >
          <EyeSlashIcon v-if="showLoginPassword" class="icon" />
          <EyeIcon v-else class="icon" />
        </button>
        <div class="input-underline"></div>
      </div>

      <div class="form-options modern">
        <label class="checkbox-modern">
          <input type="checkbox" v-model="loginForm.rememberMe" />
          <span class="checkbox-box">
            <CheckIcon class="check-icon" />
          </span>
          <span class="checkbox-label">Angemeldet bleiben</span>
        </label>

        <a href="#" class="forgot-password-link">
          <QuestionMarkCircleIcon class="link-icon" />
          Passwort vergessen?
        </a>
      </div>

      <button type="submit" class="submit-button modern" :disabled="isLoading">
        <div class="button-content">
          <span v-if="!isLoading" class="button-text">
            Anmelden
            <ArrowRightIcon class="button-icon" />
          </span>
          <div v-else class="loading-spinner">
            <div class="spinner"></div>
            <span>Wird angemeldet...</span>
          </div>
        </div>
      </button>

      <!-- Zusätzliche Links -->
      <div class="additional-links">
        <p class="register-hint">
          Noch kein Konto? 
          <a href="#" @click.prevent="$emit('switch-to-register')" class="register-link">
            Jetzt registrieren
          </a>
        </p>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "vue";
import { authService } from "@/services/auth.service";
import { 
  EyeIcon, 
  EyeSlashIcon, 
  UserCircleIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  EnvelopeIcon,
  KeyIcon,
  CheckIcon,
  QuestionMarkCircleIcon,
  ArrowRightIcon
} from "@heroicons/vue/24/outline";

export default defineComponent({
  name: "Login",
  components: {
    EyeIcon,
    EyeSlashIcon,
    UserCircleIcon,
    CheckCircleIcon,
    XCircleIcon,
    EnvelopeIcon,
    KeyIcon,
    CheckIcon,
    QuestionMarkCircleIcon,
    ArrowRightIcon
  },

  emits: ["login-success", "switch-to-register"],

  setup(_, { emit }) {
    const isLoading = ref(false);
    const showLoginPassword = ref(false);

    // Status-Meldungen
    const loginStatus = reactive({ success: false, message: "" });

    // Login-Formular
    const loginForm = reactive({
      identifier: "",
      password: "",
      rememberMe: false,
    });

    // Anmeldung verarbeiten
    const handleLogin = async () => {
      try {
        isLoading.value = true;
        loginStatus.message = "";

        const identifier = loginForm.identifier.trim();

        if (!identifier) {
          loginStatus.success = false;
          loginStatus.message = "Bitte gib deine E-Mail-Adresse oder deinen Benutzernamen ein.";
          isLoading.value = false;
          return;
        }

        // Prüfe ob es eine Email ist
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

        // Login-Daten für AuthService vorbereiten
        const loginPayload: any = {
          password: loginForm.password,
          rememberMe: loginForm.rememberMe,
        };

        if (isEmail) {
          loginPayload.email = identifier;
        } else {
          loginPayload.username = identifier;
        }

        // AuthService verwenden
        const result = await authService.login(loginPayload);

        if (result.success) {
          loginStatus.success = true;
          loginStatus.message = "Anmeldung erfolgreich! Du wirst weitergeleitet...";

          // Event an Parent-Komponente senden
          emit("login-success");
        } else {
          loginStatus.success = false;
          loginStatus.message = "Benutzername/E-Mail oder Passwort ist falsch.";
        }
      } catch (error: any) {
        loginStatus.success = false;
        loginStatus.message = "Ein Fehler ist aufgetreten. Bitte versuche es später erneut.";
      } finally {
        isLoading.value = false;
      }
    };

    return {
      loginForm,
      handleLogin,
      isLoading,
      loginStatus,
      showLoginPassword,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;

.form-container {
  padding: 2rem;
  animation: fadeInUp 0.5s ease-out;

  @media (min-width: 768px) {
    padding: 2.5rem;
  }

  .form-header {
    text-align: center;
    margin-bottom: 2rem;

    .welcome-icon {
      display: flex;
      justify-content: center;
      margin-bottom: 1.5rem;

      .icon-large {
        width: 64px;
        height: 64px;
        
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, accent-green);
            filter: drop-shadow(0 0 20px rgba(mixins.theme-color($theme, accent-green), 0.4));
          }
        }
      }
    }

    h2 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
          background: mixins.theme-gradient($theme, primary);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }
    }

    p {
      font-size: 1rem;
      line-height: 1.6;
      
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  // Status-Meldungen
  .status-message {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
    font-weight: 500;
    backdrop-filter: blur(10px);

    .status-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    &.success {
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: rgba(mixins.theme-color($theme, accent-green), 0.1);
          color: mixins.theme-color($theme, accent-green);
          border: 1px solid rgba(mixins.theme-color($theme, accent-green), 0.3);
        }
      }
    }

    &.error {
      background: rgba(255, 100, 100, 0.1);
      color: #ff6464;
      border: 1px solid rgba(255, 100, 100, 0.3);
    }
  }

  .modern-form {
    // Floating Label Groups
    .form-group {
      position: relative;
      margin-bottom: 2rem;

      &.floating-label {
        input {
          width: 100%;
          padding: 1.5rem 0.5rem 0.5rem 0.5rem;
          font-size: 1rem;
          border: none;
          border-radius: 0;
          transition: all 0.3s ease;
          
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background: transparent;
              color: mixins.theme-color($theme, text-primary);
              border-bottom: 2px solid mixins.theme-color($theme, border-light);

              &:focus {
                outline: none;
                border-bottom-color: mixins.theme-color($theme, accent-green);
              }

              &.has-value,
              &:focus {
                ~ label {
                  transform: translateY(-1.2rem) scale(0.85);
                  color: mixins.theme-color($theme, accent-green);

                  .label-icon {
                    opacity: 1;
                  }
                }
              }
            }
          }
        }

        label {
          position: absolute;
          top: 1rem;
          left: 0.5rem;
          font-size: 1rem;
          font-weight: 400;
          pointer-events: none;
          transition: all 0.3s ease;
          transform-origin: left top;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }

          .label-icon {
            width: 18px;
            height: 18px;
            opacity: 0.7;
            transition: opacity 0.3s ease;
          }
        }

        .input-underline {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          transition: width 0.3s ease;
          
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background: mixins.theme-gradient($theme, primary);
            }
          }
        }

        input:focus ~ .input-underline {
          width: 100%;
        }

        // Password Toggle
        .password-toggle {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.3s ease;

          .icon {
            width: 20px;
            height: 20px;
          }

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);

              &:hover {
                background: rgba(mixins.theme-color($theme, accent-green), 0.1);
                color: mixins.theme-color($theme, accent-green);
              }
            }
          }
        }
      }
    }

    // Modern Form Options
    .form-options.modern {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;

      @media (max-width: 480px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .checkbox-modern {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        cursor: pointer;
        user-select: none;

        input[type="checkbox"] {
          position: absolute;
          opacity: 0;
          pointer-events: none;

          &:checked ~ .checkbox-box {
            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                background: mixins.theme-gradient($theme, primary);
                border-color: transparent;

                .check-icon {
                  opacity: 1;
                  transform: scale(1);
                }
              }
            }
          }
        }

        .checkbox-box {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          position: relative;
          
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              border: 2px solid mixins.theme-color($theme, border-medium);
              background: mixins.theme-color($theme, secondary-bg);
            }
          }

          .check-icon {
            width: 14px;
            height: 14px;
            color: white;
            opacity: 0;
            transform: scale(0);
            transition: all 0.3s ease;
          }
        }

        .checkbox-label {
          font-size: 0.95rem;
          
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }

        &:hover .checkbox-box {
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              border-color: mixins.theme-color($theme, accent-green);
            }
          }
        }
      }

      .forgot-password-link {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.95rem;
        text-decoration: none;
        transition: all 0.3s ease;
        
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, accent-teal);

            &:hover {
              color: mixins.theme-color($theme, accent-green);
              transform: translateX(3px);
            }
          }
        }

        .link-icon {
          width: 16px;
          height: 16px;
        }
      }
    }

    // Modern Submit Button
    .submit-button.modern {
      width: 100%;
      padding: 1rem;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, primary);
          color: white;
          box-shadow: 0 4px 20px rgba(mixins.theme-color($theme, accent-green), 0.3);

          &::before {
            content: '';
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
            box-shadow: 0 6px 30px rgba(mixins.theme-color($theme, accent-green), 0.4);

            &::before {
              left: 100%;
            }

            .button-icon {
              transform: translateX(4px);
            }
          }

          &:active:not(:disabled) {
            transform: translateY(0);
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }
        }
      }

      .button-content {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;

        .button-text {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .button-icon {
          width: 18px;
          height: 18px;
          transition: transform 0.3s ease;
        }

        .loading-spinner {
          display: flex;
          align-items: center;
          gap: 0.75rem;

          .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
        }
      }
    }

    // Zusätzliche Links
    .additional-links {
      margin-top: 2rem;
      text-align: center;

      .register-hint {
        font-size: 0.95rem;
        
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }

        .register-link {
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, accent-green);

              &:hover {
                color: mixins.theme-color($theme, accent-teal);
                text-decoration: underline;
              }
            }
          }
        }
      }
    }
  }
}

// Animations
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// Status Transition
.status-enter-active,
.status-leave-active {
  transition: all 0.3s ease;
}

.status-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.status-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>