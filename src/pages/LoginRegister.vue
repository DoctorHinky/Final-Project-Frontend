<!-- src/pages/LoginRegister.vue -->
<template>
  <div class="login-register-page">
    <div class="container">
      <div class="auth-container">
        <div class="tabs">
          <button
            class="tab"
            :class="{ active: activeTab === 'login' }"
            @click="activeTab = 'login'"
          >
            Anmelden
          </button>
          <button
            class="tab"
            :class="{ active: activeTab === 'register' }"
            @click="activeTab = 'register'"
          >
            Registrieren
          </button>
        </div>

        <!-- Login Formular -->
        <div class="form-container" v-if="activeTab === 'login'">
          <h2>Willkommen zurück!</h2>
          <p>Melde dich an, um auf dein persönliches Profil zuzugreifen.</p>

          <div
            v-if="loginStatus.message"
            :class="[
              'status-message',
              loginStatus.success ? 'success' : 'error',
            ]"
          >
            {{ loginStatus.message }}
          </div>

          <form @submit.prevent="handleLogin">
            <div class="form-group">
              <label for="login-email">E-Mail</label>
              <input
                type="email"
                id="login-email"
                v-model="loginForm.email"
                placeholder="deine@email.de"
                required
              />
              <div class="hint-text">Testlogin: test@example.com</div>
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
                  :aria-label="
                    showLoginPassword
                      ? 'Passwort verbergen'
                      : 'Passwort anzeigen'
                  "
                >
                  <EyeSlashIcon v-if="showLoginPassword" class="icon" />
                  <EyeIcon v-else class="icon" />
                </button>
              </div>
              <div class="hint-text">Testpasswort: password123</div>
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

        <!-- Register Formular -->
        <div class="form-container" v-if="activeTab === 'register'">
          <h2>Werde Teil unserer Community</h2>
          <p>Erstelle ein Konto, um alle Funktionen nutzen zu können.</p>

          <div
            v-if="registerStatus.message"
            :class="[
              'status-message',
              registerStatus.success ? 'success' : 'error',
            ]"
          >
            {{ registerStatus.message }}
          </div>

          <form @submit.prevent="handleRegister">
            <div class="form-group">
              <label for="register-first-name">Vorname</label>
              <input
                type="text"
                id="register-first-name"
                v-model="registerForm.firstName"
                placeholder="Vorname"
                required
              />
            </div>

            <div class="form-group">
              <label for="register-last-name">Nachname</label>
              <input
                type="text"
                id="register-last-name"
                v-model="registerForm.lastName"
                placeholder="Nachname"
                required
              />
            </div>

            <div class="form-group">
              <label for="register-username">Benutzername</label>
              <input
                type="text"
                id="register-username"
                v-model="registerForm.username"
                placeholder="Benutzername"
                required
              />
            </div>

            <div class="form-group">
              <label for="register-role">Rolle</label>
              <div class="custom-dropdown">
                <div
                  class="dropdown-selected"
                  @click="toggleDropdown"
                  :class="{ active: isOpen }"
                  tabindex="0"
                  @keydown.enter="toggleDropdown"
                  @keydown.space="toggleDropdown"
                  @keydown.up="navigateOptions(-1)"
                  @keydown.down="navigateOptions(1)"
                  @keydown.esc="closeDropdown"
                >
                  <span>{{ selectedOption.text }}</span>
                  <span class="dropdown-arrow">▼</span>
                </div>

                <div class="dropdown-options" :class="{ show: isOpen }">
                  <div
                    v-for="(option, index) in roleOptions"
                    :key="option.value"
                    class="dropdown-option"
                    :class="{ selected: option.value === selectedOption.value }"
                    @click="selectOption(option)"
                    tabindex="0"
                    @keydown.enter="selectOption(option)"
                    :data-index="index"
                  >
                    {{ option.text }}
                  </div>
                </div>

                <!-- Hidden input for form submission -->
                <input
                  type="hidden"
                  id="register-role"
                  name="role"
                  v-model="registerForm.role"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="register-dob">Geburtsdatum</label>
              <input
                type="date"
                id="register-dob"
                v-model="registerForm.dob"
                required
              />
            </div>

            <div class="form-group">
              <label for="register-phone">Telefon</label>
              <input
                type="tel"
                id="register-phone"
                v-model="registerForm.phone"
                placeholder="Telefonnummer"
                required
              />
            </div>

            <div class="form-group">
              <label for="register-email">E-Mail</label>
              <input
                type="email"
                id="register-email"
                v-model="registerForm.email"
                placeholder="deine@email.de"
                required
              />
            </div>

            <div class="form-group">
              <label for="register-password">Passwort</label>
              <div class="password-input-container">
                <input
                  :type="showRegisterPassword ? 'text' : 'password'"
                  id="register-password"
                  v-model="registerForm.password"
                  placeholder="Erstelle ein sicheres Passwort"
                  required
                  @input="checkPasswordStrength"
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="showRegisterPassword = !showRegisterPassword"
                  :aria-label="
                    showRegisterPassword
                      ? 'Passwort verbergen'
                      : 'Passwort anzeigen'
                  "
                >
                  <EyeSlashIcon v-if="showRegisterPassword" class="icon" />
                  <EyeIcon v-else class="icon" />
                </button>
              </div>

              <!-- Passwort-Stärke-Anzeige -->
              <div
                class="password-strength-container"
                v-if="registerForm.password"
              >
                <div class="password-strength-label">
                  Passwortstärke: {{ passwordStrengthText }}
                </div>
                <div class="password-strength-bar">
                  <div
                    class="password-strength-fill"
                    :style="{ width: passwordStrength + '%' }"
                    :class="passwordStrengthClass"
                  ></div>
                </div>
                <div
                  class="password-strength-tips"
                  v-if="passwordStrength < 70"
                >
                  Für ein sicheres Passwort verwende Groß- und Kleinbuchstaben,
                  Zahlen und Sonderzeichen.
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="register-password-confirm">Passwort bestätigen</label>
              <div class="password-input-container">
                <input
                  :type="showRegisterPasswordConfirm ? 'text' : 'password'"
                  id="register-password-confirm"
                  v-model="registerForm.passwordConfirm"
                  placeholder="Passwort erneut eingeben"
                  required
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="
                    showRegisterPasswordConfirm = !showRegisterPasswordConfirm
                  "
                  :aria-label="
                    showRegisterPasswordConfirm
                      ? 'Passwort verbergen'
                      : 'Passwort anzeigen'
                  "
                >
                  <EyeSlashIcon
                    v-if="showRegisterPasswordConfirm"
                    class="icon"
                  />
                  <EyeIcon v-else class="icon" />
                </button>
              </div>

              <!-- Passwort-Übereinstimmungs-Hinweis -->
              <div
                v-if="registerForm.passwordConfirm && passwordMatch !== null"
                :class="[
                  'password-match-message',
                  passwordMatch ? 'match-success' : 'match-error',
                ]"
              >
                <span v-if="passwordMatch">
                  <CheckCircleIcon class="check-icon" />
                  Passwörter stimmen überein
                </span>
                <span v-else>
                  <XCircleIcon class="error-icon" />
                  Passwörter stimmen nicht überein
                </span>
              </div>
            </div>

            <div class="form-options">
              <label class="checkbox-container">
                <input
                  type="checkbox"
                  v-model="registerForm.agreeTerms"
                  required
                />
                <span class="checkmark"></span>
                <span
                  >Ich stimme den
                  <a href="#" class="terms-link">Nutzungsbedingungen</a>
                  zu</span
                >
              </label>
            </div>

            <button type="submit" class="submit-button" :disabled="isLoading">
              <span v-if="isLoading">Wird registriert...</span>
              <span v-else>Konto erstellen</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  reactive,
  onMounted,
  onBeforeUnmount,
} from "vue";
import axios from "axios";
import { jwtDecode, JwtPayload } from "jwt-decode";
import {
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/vue/24/solid";
import { useRouter, useRoute } from "vue-router";
import { computed } from "vue";

export default defineComponent({
  name: "LoginRegister",
  components: {
    EyeIcon,
    EyeSlashIcon,
    CheckCircleIcon,
    XCircleIcon,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const activeTab = ref("login");
    const isLoading = ref(false);

    // Password-Toggle-Variablen
    const showLoginPassword = ref(false);
    const showRegisterPassword = ref(false);
    const showRegisterPasswordConfirm = ref(false);

    // Passwort-Stärke-Variablen
    const passwordStrength = ref(0);

    // Passwort-Übereinstimmungs-Variable
    const passwordMatch = ref(null);

    // Passwort-Stärke-Texte und -Klassen berechnen
    const passwordStrengthText = computed(() => {
      if (passwordStrength.value <= 25) return "Sehr schwach";
      if (passwordStrength.value <= 50) return "Schwach";
      if (passwordStrength.value <= 75) return "Mittel";
      return "Stark";
    });

    const passwordStrengthClass = computed(() => {
      if (passwordStrength.value <= 25) return "strength-very-weak";
      if (passwordStrength.value <= 50) return "strength-weak";
      if (passwordStrength.value <= 75) return "strength-medium";
      return "strength-strong";
    });

    // Funktion zum Prüfen der Passwortstärke
    const checkPasswordStrength = () => {
      const password = registerForm.password;

      // Wenn kein Passwort, dann 0% Stärke
      if (!password) {
        passwordStrength.value = 0;
        return;
      }

      let strength = 0;

      // Grundlegende Längenprüfung
      if (password.length >= 8) strength += 25;
      if (password.length >= 12) strength += 10;

      // Prüfung auf Buchstaben, Zahlen und Sonderzeichen
      const hasLowerCase = /[a-z]/.test(password);
      const hasUpperCase = /[A-Z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
        password
      );

      if (hasLowerCase) strength += 10;
      if (hasUpperCase) strength += 15;
      if (hasNumbers) strength += 15;
      if (hasSpecialChars) strength += 25;

      // Begrenzung auf maximal 100%
      passwordStrength.value = Math.min(strength, 100);

      // Wenn Bestätigungspasswort existiert, prüfe Übereinstimmung
      if (registerForm.passwordConfirm) {
        checkPasswordMatch();
      }
    };

    // Status-Meldungen
    const loginStatus = reactive({
      success: false,
      message: "",
    });

    const registerStatus = reactive({
      success: false,
      message: "",
    });

    // Login-Formular
    const loginForm = reactive({
      email: "",
      password: "",
      rememberMe: false,
    });

    // Passwort-Übereinstimmung prüfen
    const checkPasswordMatch = () => {
      if (!registerForm.passwordConfirm) {
        passwordMatch.value = null;
        return;
      }

      passwordMatch.value =
        registerForm.password === registerForm.passwordConfirm;
    };

    // Register-Formular
    const registerForm = reactive({
      firstName: "",
      lastName: "",
      username: "",
      role: "",
      dob: "",
      phone: "",
      email: "",
      password: "",
      passwordConfirm: "",
      agreeTerms: false,
    });

    // Dropdown-Funktionalität
    const isOpen = ref(false);

    const roleOptions = [
      { value: "", text: "Wähle eine Rolle" },
      { value: "parent", text: "Eltern" },
      { value: "child", text: "Kind" },
    ];

    const selectedOption = ref(roleOptions[0]);

    const toggleDropdown = () => {
      isOpen.value = !isOpen.value;
    };

    const closeDropdown = () => {
      isOpen.value = false;
    };

    const selectOption = (option: { value: string; text: string }) => {
      selectedOption.value = option;
      registerForm.role = option.value;
      closeDropdown();
    };

    const navigateOptions = (direction: number) => {
      if (!isOpen.value) {
        isOpen.value = true;
        return;
      }

      const currentIndex = roleOptions.findIndex(
        (option) => option.value === selectedOption.value.value
      );
      let newIndex = currentIndex + direction;

      if (newIndex < 0) newIndex = roleOptions.length - 1;
      else if (newIndex >= roleOptions.length) newIndex = 0;

      // Nur fokussieren, nicht auswählen
      const optionElements = document.querySelectorAll(".dropdown-option");
      if (optionElements[newIndex]) {
        (optionElements[newIndex] as HTMLElement).focus();
      }
    };

    // Klick außerhalb schließt Dropdown
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.querySelector(".custom-dropdown");
      if (
        dropdown &&
        !dropdown.contains(event.target as Node) &&
        isOpen.value
      ) {
        closeDropdown();
      }
    };

    // Anmeldung verarbeiten
    const handleLogin = async () => {
      try {
        isLoading.value = true;
        loginStatus.message = "";

        const loginData: Record<string, string> = {};
        const trimmedInput = loginForm.email.trim();

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedInput);
        if (isEmail) loginData.email = trimmedInput;
        else loginData.username = trimmedInput;

        loginData.password = loginForm.password;

        const response = await axios.post(
          "https://final-project-backend-rsqk.onrender.com/auth/local/login",
          loginData,
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        const { access_token, refresh_token } = response.data;

        // Token speichern
        localStorage.setItem("accessToken", access_token);
        localStorage.setItem("refreshToken", refresh_token);

        loginStatus.success = true;
        loginStatus.message = "Anmeldung erfolgreich! Du wirst weitergeleitet...";

        // Direkt zum Dashboard weiterleiten ohne Verzögerung
        window.location.href = (route.query.redirect as string) || "/member/dashboard";
        
      } catch (error: any) {
        loginStatus.success = false;
        if (error.response?.status === 401) {
          loginStatus.message = "Benutzername/E-Mail oder Passwort ist falsch.";
        } else {
          loginStatus.message =
            "Ein Fehler ist aufgetreten. Bitte versuche es später erneut.";
        }
        console.error("Login error:", error);
      } finally {
        isLoading.value = false;
      }
    };

    // Registrierung verarbeiten
    const handleRegister = async () => {
      // Prüfe, ob Passwörter übereinstimmen
      if (registerForm.password !== registerForm.passwordConfirm) {
        registerStatus.success = false;
        registerStatus.message = "Die Passwörter stimmen nicht überein.";
        return;
      }

      try {
        isLoading.value = true;
        registerStatus.message = "";

        const password = registerForm.password;
        const hasMinLength = password.length >= 8;
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (!hasMinLength || !hasLetter || !hasNumber || !hasSpecialChar) {
          registerStatus.message =
            "Das Passwort muss mindestens 8 Zeichen lang sein und Buchstaben, Zahlen sowie Sonderzeichen enthalten.";
          registerStatus.success = false;
          return;
        }

        const phone = registerForm.phone.trim();
        const germanPhoneRegex = /^(?:\+49|0049|0)\d{10,14}$/;

        if (!germanPhoneRegex.test(phone)) {
          registerStatus.message =
            "Bitte eine gültige deutsche Telefonnummer eingeben.";
          registerStatus.success = false;
          return;
        }

        const registerData = {
          firstname: registerForm.firstName.trim(),
          lastname: registerForm.lastName.trim(),
          birthdate: registerForm.dob,
          username: registerForm.username.trim(),
          role: registerForm.role.trim(),
          email: registerForm.email.trim(),
          phone: phone,
          password: registerForm.password,
        };

        const response = await axios.post(
          "https://final-project-backend-rsqk.onrender.com/auth/local/register",
          registerData
        );
        
        registerStatus.message = "Registrierung erfolgreich!";
        registerStatus.success = true;

        // Sofort zum Login-Tab wechseln
        activeTab.value = "login";

        // Anmeldedaten vorausfüllen
        loginForm.email = registerForm.email;

        // Formular zurücksetzen
        registerForm.firstName = "";
        registerForm.lastName = "";
        registerForm.username = "";
        registerForm.role = "";
        registerForm.dob = "";
        registerForm.phone = "";
        registerForm.email = "";
        registerForm.password = "";
        registerForm.passwordConfirm = "";
        registerForm.agreeTerms = false;
        passwordStrength.value = 0;
        passwordMatch.value = null;
        
      } catch (error: any) {
        registerStatus.success = false;
        if (error.response?.data?.message) {
          registerStatus.message = `Fehler: ${error.response.data.message}`;
        } else {
          registerStatus.message = "Ein unerwarteter Fehler ist aufgetreten.";
        }
        console.error("Register error:", error);
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => {
      document.addEventListener("click", handleClickOutside);

      // Bei Redirect-Parameter den Login-Tab aktivieren
      if (route.query.redirect) {
        activeTab.value = "login";
      }
    });

    onBeforeUnmount(() => {
      document.removeEventListener("click", handleClickOutside);
    });

    return {
      activeTab,
      loginForm,
      registerForm,
      handleLogin,
      handleRegister,
      isLoading,
      loginStatus,
      registerStatus,
      // Password-Toggle-Funktionalität
      showLoginPassword,
      showRegisterPassword,
      showRegisterPasswordConfirm,
      // Passwort-Stärke
      passwordStrength,
      passwordStrengthText,
      passwordStrengthClass,
      checkPasswordStrength,
      // Passwort-Übereinstimmung
      passwordMatch,
      checkPasswordMatch,
      // Dropdown-Funktionalität
      isOpen,
      roleOptions,
      selectedOption,
      toggleDropdown,
      closeDropdown,
      selectOption,
      navigateOptions,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;
@use "@/style/base/animations" as animations;

.login-register-page {
  min-height: calc(100vh - 130px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: map.get(vars.$spacing, xl) 0;
  position: relative;
  z-index: 100;

  .auth-container {
    max-width: 500px;
    width: 100%;
    margin: 0 auto;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        border-radius: map.get(map.get(vars.$layout, border-radius), large);
        border: 2px solid mixins.theme-color($theme, border-medium);
        @include mixins.shadow("medium", $theme);
        overflow: hidden;
      }
    }
  }

  .tabs {
    display: flex;
    width: 100%;

    .tab {
      flex: 1;
      padding: map.get(vars.$spacing, m) 0;
      text-align: center;
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      cursor: pointer;
      border: none;
      transition: all map.get(vars.$transitions, default);
      position: relative;
      overflow: hidden;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, nav-item-bg);
          color: mixins.theme-color($theme, text-primary);

          &.active {
            background: mixins.theme-gradient($theme, nav-active);
            color: white;
          }
        }
      }
    }
  }

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
            background-color: rgba(
              mixins.theme-color($theme, accent-green),
              0.15
            );
            color: mixins.theme-color($theme, accent-green);
            border: 1px
              solid
              rgba(mixins.theme-color($theme, accent-green), 0.3);
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

      input,
      select {
        width: 100%;
        padding: map.get(vars.$spacing, s);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            border: 1px solid mixins.theme-color($theme, border-light);
            border-radius: map.get(
              map.get(vars.$layout, border-radius),
              medium
            );
            background-color: mixins.theme-color($theme, secondary-bg);
            color: mixins.theme-color($theme, text-primary);

            &::placeholder {
              color: mixins.theme-color($theme, text-tertiary);
            }

            &:focus {
              outline: none;
              border-color: mixins.theme-color($theme, accent-teal);
              box-shadow: 0
                0
                0
                2px
                rgba(mixins.theme-color($theme, accent-teal), 0.3);
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

      // Passwort-Stärke-Anzeige
      .password-strength-container {
        margin-top: map.get(vars.$spacing, s);

        .password-strength-label {
          display: flex;
          justify-content: space-between;
          font-size: map.get(map.get(vars.$fonts, sizes), small);

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }

        .password-strength-bar {
          height: 6px;
          width: 100%;
          margin: 4px 0;
          border-radius: 3px;
          overflow: hidden;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
            }
          }

          .password-strength-fill {
            height: 100%;
            transition: width 0.3s ease;

            &.strength-very-weak {
              background-color: #ff4d4d;
            }

            &.strength-weak {
              background-color: #ffaa00;
            }

            &.strength-medium {
              background-color: #ffdd00;
            }

            &.strength-strong {
              background-color: #00cc66;
            }
          }
        }

        .password-strength-tips {
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          margin-top: 4px;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-tertiary);
            }
          }
        }
      }

      // Benutzerdefiniertes Dropdown-Menü
      .custom-dropdown {
        position: relative;
        width: 100%;
        font-family: map.get(vars.$fonts, primary);

        // Ausgewähltes Element
        .dropdown-selected {
          width: 100%;
          padding: 0.9rem 1.2rem;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          border-radius: map.get(map.get(vars.$layout, border-radius), medium);
          outline: none;
          font-size: map.get(map.get(vars.$fonts, sizes), base);

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              @if $theme == "dark" {
                background-color: rgba(15, 36, 25, 0.8);
              } @else {
                background-color: rgba(255, 255, 255, 0.7);
              }

              color: mixins.theme-color($theme, text-primary);
              border: 1px solid mixins.theme-color($theme, border-medium);
              transition: all map.get(vars.$transitions, default);

              &:hover,
              &:focus {
                border-color: mixins.theme-color($theme, accent-teal);
                box-shadow: 0
                  0
                  0
                  2px
                  rgba(mixins.theme-color($theme, accent-teal), 0.2);
              }

              &.active {
                border-color: mixins.theme-color($theme, accent-teal);
                box-shadow: 0
                  0
                  0
                  2px
                  rgba(mixins.theme-color($theme, accent-teal), 0.2);
              }
            }
          }

          // Pfeil-Icon
          .dropdown-arrow {
            font-size: 0.8rem;
            transition: transform 0.2s ease;

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-secondary);
              }
            }
          }

          &.active .dropdown-arrow {
            transform: rotate(180deg);
          }
        }

        // Optionen-Dropdown
        .dropdown-options {
          position: absolute;
          top: calc(100% + 5px);
          left: 0;
          right: 0;
          z-index: 100;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
          max-height: 250px;
          overflow-y: auto;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, card-bg);
              border: 1px solid mixins.theme-color($theme, border-light);
              border-radius: map.get(
                map.get(vars.$layout, border-radius),
                medium
              );
              box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            }
          }

          &.show {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
          }

          // Einzelne Option
          .dropdown-option {
            padding: 12px 16px;
            cursor: pointer;
            outline: none;
            font-size: map.get(map.get(vars.$fonts, sizes), base);

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-primary);
                border-bottom: 1px
                  solid
                  rgba(mixins.theme-color($theme, border-light), 0.2);

                &:hover,
                &:focus {
                  background-color: mixins.theme-color($theme, hover-color);
                }

                &.selected {
                  font-weight: map.get(map.get(vars.$fonts, weights), bold);
                  background-color: rgba(
                    mixins.theme-color($theme, accent-teal),
                    0.1
                  );
                }

                &:last-child {
                  border-bottom: none;
                }
              }
            }
          }
        }
      }

      // Hints für Testdaten
      .hint-text {
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        margin-top: map.get(vars.$spacing, xxs);
        font-style: italic;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-tertiary);
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

      a.terms-link,
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
}
</style>