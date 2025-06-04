<template>
  <div class="form-container">
    <h2>Willkommen zurück!</h2>
    <p>Melde dich an, um auf dein persönliches Profil zuzugreifen.</p>

    <div v-if="loginStatus.message" :class="['status-message', loginStatus.success ? 'success' : 'error']">
      {{ loginStatus.message }}
    </div>

    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="login-identifier">E-Mail oder Benutzername</label>
        <input 
          type="text" 
          id="login-identifier" 
          v-model="loginForm.identifier" 
          placeholder="E-Mail oder Benutzername" 
          required
        />
      </div>

      <div class="form-group">
        <label for="login-password">Passwort</label>
        <div class="password-input-container">
          <input
            :type="showLoginPassword ? 'text' : 'password'"
            id="login-password"
            v-model="loginForm.password"
            placeholder="Dein Passwort"
            required
          />
          <button
            type="button"
            class="password-toggle"
            @click="showLoginPassword = !showLoginPassword"
            :aria-label="showLoginPassword ? 'Passwort verbergen' : 'Passwort anzeigen'"
          >
            <EyeSlashIcon v-if="showLoginPassword" class="icon" />
            <EyeIcon v-else class="icon" />
          </button>
        </div>
      </div>

      <div class="form-options">
        <label class="checkbox-container">
          <input type="checkbox" v-model="loginForm.rememberMe" />
          Angemeldet bleiben
        </label>

        <a href="#" class="forgot-password">Passwort vergessen?</a>
      </div>

      <button type="submit" class="submit-button" :disabled="isLoading">
        <span v-if="isLoading">Wird angemeldet...</span>
        <span v-else>Anmelden</span>
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "vue";
import { authService } from "@/services/auth.service";
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/solid";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "Login",
  components: {
    EyeIcon,
    EyeSlashIcon,
  },
  
  emits: ['login-success'],

  setup(props, { emit }) {
    const route = useRoute();
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
          rememberMe: loginForm.rememberMe
        };

        if (isEmail) {
          loginPayload.email = identifier;
        } else {
          loginPayload.username = identifier;
        }

        console.log("Login attempt with:", { 
          [isEmail ? 'email' : 'username']: identifier,
          rememberMe: loginForm.rememberMe 
        });

        // AuthService verwenden
        const result = await authService.login(loginPayload);

        if (result.success) {
          loginStatus.success = true;
          loginStatus.message = "Anmeldung erfolgreich! Du wirst weitergeleitet...";
          
          // Event an Parent-Komponente senden
          emit('login-success');

          // Zum Dashboard weiterleiten
          setTimeout(() => {
            window.location.href = (route.query.redirect as string) || "/member/dashboard";
          }, 100);
        } else {
          loginStatus.success = false;
          loginStatus.message = "Benutzername/E-Mail oder Passwort ist falsch.";
        }
      } catch (error: any) {
        loginStatus.success = false;
        loginStatus.message = "Ein Fehler ist aufgetreten. Bitte versuche es später erneut.";
        console.error("Login error:", error);
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
  padding: map.get(vars.$spacing, xl);

  h2 {
    font-size: map.get(map.get(vars.$fonts, sizes), xl);
    margin-bottom: map.get(vars.$spacing, m);

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
      }
    }
  }

  p {
    font-size: map.get(map.get(vars.$fonts, sizes), medium);
    margin-bottom: map.get(vars.$spacing, l);
    line-height: 1.6;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
      }
    }
  }

  // Status-Meldungen
  .status-message {
    padding: map.get(vars.$spacing, m);
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);
    margin-bottom: map.get(vars.$spacing, l);
    font-weight: map.get(map.get(vars.$fonts, weights), medium);

    &.success {
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: rgba(mixins.theme-color($theme, accent-green), 0.15);
          color: mixins.theme-color($theme, accent-green);
          border: 1px solid rgba(mixins.theme-color($theme, accent-green), 0.3);
        }
      }
    }

    &.error {
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: rgba(255, 100, 100, 0.15);
          color: #ff6464;
          border: 1px solid rgba(255, 100, 100, 0.3);
        }
      }
    }
  }

  .form-group {
    margin-bottom: map.get(vars.$spacing, l);
    position: relative;

    label {
      display: block;
      margin-bottom: map.get(vars.$spacing, xs);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }

    input {
      width: 100%;
      padding: map.get(vars.$spacing, s);
      transition: all map.get(vars.$transitions, default);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          border: 1px solid mixins.theme-color($theme, border-light);
          border-radius: map.get(map.get(vars.$layout, border-radius), medium);
          background-color: mixins.theme-color($theme, secondary-bg);
          color: mixins.theme-color($theme, text-primary);

          &::placeholder {
            color: mixins.theme-color($theme, text-tertiary);
          }

          &:focus {
            outline: none;
            border-color: mixins.theme-color($theme, accent-teal);
            box-shadow: 0 0 0 2px rgba(mixins.theme-color($theme, accent-teal), 0.3);
          }
        }
      }
    }

    // Password-Input-Container für den Toggle-Button
    .password-input-container {
      position: relative;
      display: flex;
      align-items: center;

      input {
        padding-right: 40px; // Platz für den Button
      }

      .password-toggle {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;

        .icon {
          width: 20px;
          height: 20px;
        }

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);

            &:hover {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }
      }
    }
  }

  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: map.get(vars.$spacing, l);

    .checkbox-container {
      display: flex;
      align-items: center;
      cursor: pointer;

      input[type="checkbox"] {
        margin-right: map.get(vars.$spacing, xs);
        width: auto;
      }

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }

    a.forgot-password {
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, accent-teal) !important;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }

  .submit-button {
    margin-top: map.get(vars.$spacing, xl);
    width: 100%;
    padding: map.get(vars.$spacing, m);
    border: none;
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);
    cursor: pointer;
    font-weight: map.get(map.get(vars.$fonts, weights), bold);
    transform: scale(1.05);
    transition: all 0.5s;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background: mixins.theme-gradient($theme, primary);
        color: white;

        &:hover {
          transform: translateY(-3px);
          @include mixins.glow("green", "small", $theme);
        }

        &:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
      }
    }
  }
}
</style>