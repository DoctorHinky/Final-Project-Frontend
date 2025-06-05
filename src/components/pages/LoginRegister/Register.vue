<template>
  <div class="form-container registerform">
    <h2>Werde Teil unserer Community</h2>
    <p>Erstelle ein Konto, um alle Funktionen nutzen zu können.</p>

    <form @submit.prevent="handleRegister" class="register-grid">
      <!-- Erste Zeile: Vorname und Nachname -->
      <div class="form-group half-width" :class="{ 'has-error': fieldErrors.firstName }">
        <label for="register-first-name">Vorname</label>
        <input
          type="text"
          id="register-first-name"
          v-model="registerForm.firstName"
          @blur="validateField('firstName')"
          @input="clearFieldError('firstName')"
          placeholder="Vorname"
          :class="{ error: fieldErrors.firstName }"
        />
        <span v-if="fieldErrors.firstName" class="field-error">{{ fieldErrors.firstName }}</span>
      </div>

      <div class="form-group half-width" :class="{ 'has-error': fieldErrors.lastName }">
        <label for="register-last-name">Nachname</label>
        <input
          type="text"
          id="register-last-name"
          v-model="registerForm.lastName"
          @blur="validateField('lastName')"
          @input="clearFieldError('lastName')"
          placeholder="Nachname"
          :class="{ error: fieldErrors.lastName }"
        />
        <span v-if="fieldErrors.lastName" class="field-error">{{ fieldErrors.lastName }}</span>
      </div>

      <!-- Zweite Zeile: Username und Rolle -->
      <div class="form-group sixty-width" :class="{ 'has-error': fieldErrors.username }">
        <label for="register-username">Benutzername</label>
        <input
          type="text"
          id="register-username"
          v-model="registerForm.username"
          @blur="validateField('username')"
          @input="clearFieldError('username')"
          placeholder="Benutzername"
          :class="{ error: fieldErrors.username }"
        />
        <span v-if="fieldErrors.username" class="field-error">{{ fieldErrors.username }}</span>
      </div>

      <div class="form-group forty-width" :class="{ 'has-error': fieldErrors.role }">
        <label for="register-role">Rolle</label>
        <div class="custom-dropdown">
          <div
            class="dropdown-selected"
            @click="toggleDropdown"
            :class="{ active: isOpen, error: fieldErrors.role }"
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
          <input type="hidden" id="register-role" name="role" v-model="registerForm.role" />
        </div>
        <span v-if="fieldErrors.role" class="field-error">{{ fieldErrors.role }}</span>
      </div>

      <!-- Dritte Zeile: Geburtsdatum und Telefon -->
      <div class="form-group forty-width" :class="{ 'has-error': fieldErrors.dob }">
        <label for="register-dob">Geburtsdatum</label>
        <input
          type="date"
          id="register-dob"
          v-model="registerForm.dob"
          @blur="validateField('dob')"
          @input="clearFieldError('dob')"
          :class="{ error: fieldErrors.dob }"
        />
        <span v-if="fieldErrors.dob" class="field-error">{{ fieldErrors.dob }}</span>
      </div>

      <div class="form-group sixty-width" :class="{ 'has-error': fieldErrors.phone }">
        <label for="register-phone">Telefon</label>
        <input
          type="tel"
          id="register-phone"
          v-model="registerForm.phone"
          @blur="validateField('phone')"
          @input="clearFieldError('phone')"
          placeholder="Telefonnummer"
          :class="{ error: fieldErrors.phone }"
        />
        <span v-if="fieldErrors.phone" class="field-error">{{ fieldErrors.phone }}</span>
      </div>

      <!-- E-Mail volle Breite -->
      <div class="form-group full-width" :class="{ 'has-error': fieldErrors.email }">
        <label for="register-email">E-Mail</label>
        <input
          type="email"
          id="register-email"
          v-model="registerForm.email"
          @blur="validateField('email')"
          @input="clearFieldError('email')"
          placeholder="deine@email.de"
          :class="{ error: fieldErrors.email }"
        />
        <span v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</span>
      </div>

      <!-- Passwort volle Breite -->
      <div class="form-group full-width" :class="{ 'has-error': fieldErrors.password }">
        <label for="register-password">Passwort</label>
        <div class="password-input-container">
          <input
            :type="showRegisterPassword ? 'text' : 'password'"
            id="register-password"
            v-model="registerForm.password"
            @blur="validateField('password')"
            @input="clearFieldError('password')"
            placeholder="Erstelle ein sicheres Passwort"
            :class="{ error: fieldErrors.password }"
          />
          <button
            type="button"
            class="password-toggle"
            @click="showRegisterPassword = !showRegisterPassword"
            :aria-label="showRegisterPassword ? 'Passwort verbergen' : 'Passwort anzeigen'"
          >
            <EyeSlashIcon v-if="showRegisterPassword" class="icon" />
            <EyeIcon v-else class="icon" />
          </button>
        </div>
        <span v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</span>

        <!-- Passwort-Stärke-Anzeige -->
        <div class="password-strength-container" v-if="registerForm.password && !fieldErrors.password">
          <div class="password-strength-label">Passwortstärke: {{ passwordStrengthText }}</div>
          <div class="password-strength-bar">
            <div
              class="password-strength-fill"
              :style="{ width: passwordStrength + '%' }"
              :class="passwordStrengthClass"
            ></div>
          </div>
          <div class="password-strength-tips" v-if="passwordStrength < 70">
            Für ein sicheres Passwort verwende Groß- und Kleinbuchstaben, Zahlen und Sonderzeichen.
          </div>
        </div>
      </div>

      <!-- Passwort bestätigen volle Breite -->
      <div class="form-group full-width" :class="{ 'has-error': fieldErrors.passwordConfirm }">
        <label for="register-password-confirm">Passwort bestätigen</label>
        <div class="password-input-container">
          <input
            :type="showRegisterPasswordConfirm ? 'text' : 'password'"
            id="register-password-confirm"
            v-model="registerForm.passwordConfirm"
            @blur="validateField('passwordConfirm')"
            @input="clearFieldError('passwordConfirm')"
            placeholder="Passwort erneut eingeben"
            :class="{ error: fieldErrors.passwordConfirm }"
          />
          <button
            type="button"
            class="password-toggle"
            @click="showRegisterPasswordConfirm = !showRegisterPasswordConfirm"
            :aria-label="showRegisterPasswordConfirm ? 'Passwort verbergen' : 'Passwort anzeigen'"
          >
            <EyeSlashIcon v-if="showRegisterPasswordConfirm" class="icon" />
            <EyeIcon v-else class="icon" />
          </button>
        </div>
        <span v-if="fieldErrors.passwordConfirm" class="field-error">{{ fieldErrors.passwordConfirm }}</span>

        <!-- Passwort-Übereinstimmungs-Hinweis -->
        <div
          v-if="registerForm.passwordConfirm && passwordMatch !== null && !fieldErrors.passwordConfirm"
          :class="['password-match-message', passwordMatch ? 'match-success' : 'match-error']"
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

      <!-- Nutzungsbedingungen volle Breite -->
      <div class="form-group full-width" :class="{ 'has-error': fieldErrors.agreeTerms }">
        <div class="form-options">
          <label class="checkbox-container">
            <input type="checkbox" v-model="registerForm.agreeTerms" @change="clearFieldError('agreeTerms')" />
            <span class="checkmark"></span>
            <span>
              Ich stimme den
              <a href="#" class="terms-link">Nutzungsbedingungen</a>
              zu
            </span>
          </label>
        </div>
        <span v-if="fieldErrors.agreeTerms" class="field-error">{{ fieldErrors.agreeTerms }}</span>
      </div>

      <button type="submit" class="submit-button full-width" :disabled="isLoading">
        <span v-if="isLoading">Wird registriert...</span>
        <span v-else>Konto erstellen</span>
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, onBeforeUnmount, computed, watch, nextTick } from "vue";
import api from "@/services/axiosInstance";
import { usePasswordStrength, usePasswordMatch } from "@/composables/usePasswordUtils";
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/vue/24/solid";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "Register",
  components: {
    EyeIcon,
    EyeSlashIcon,
    CheckCircleIcon,
    XCircleIcon,
  },

  emits: ["register-success"],

  setup(props, { emit }) {
    const router = useRouter();
    const isLoading = ref(false);
    const showRegisterPassword = ref(false);
    const showRegisterPasswordConfirm = ref(false);

    // Status-Meldungen
    const registerStatus = reactive({ success: false, message: "" });

    // Feld-spezifische Fehlermeldungen
    const fieldErrors = reactive<Record<string, string>>({
      firstName: "",
      lastName: "",
      username: "",
      role: "",
      dob: "",
      phone: "",
      email: "",
      password: "",
      passwordConfirm: "",
      agreeTerms: "",
    });

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

    // Password Helper Composables
    const passwordRef = ref(registerForm.password);
    const passwordConfirmRef = ref(registerForm.passwordConfirm);

    const { passwordStrength, calculateStrength } = usePasswordStrength(passwordRef);
    const { passwordMatch, checkPasswordMatch } = usePasswordMatch(passwordRef, passwordConfirmRef);

    // Watchers für automatische Validierung
    watch(
      () => registerForm.password,
      (newVal) => {
        passwordRef.value = newVal;
        calculateStrength();
        checkPasswordMatch();
      }
    );

    watch(
      () => registerForm.passwordConfirm,
      (newVal) => {
        passwordConfirmRef.value = newVal;
        checkPasswordMatch();
      }
    );

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
      clearFieldError("role");
      closeDropdown();
    };

    const navigateOptions = (direction: number) => {
      if (!isOpen.value) {
        isOpen.value = true;
        return;
      }

      const currentIndex = roleOptions.findIndex((option) => option.value === selectedOption.value.value);
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
      if (dropdown && !dropdown.contains(event.target as Node) && isOpen.value) {
        closeDropdown();
      }
    };

    // Validierungsfunktionen
    const validateField = (fieldName: string): boolean => {
      let isValid = true;

      switch (fieldName) {
        case "firstName":
          if (!registerForm.firstName.trim()) {
            fieldErrors.firstName = "Bitte gib deinen Vornamen ein.";
            isValid = false;
          }
          break;

        case "lastName":
          if (!registerForm.lastName.trim()) {
            fieldErrors.lastName = "Bitte gib deinen Nachnamen ein.";
            isValid = false;
          }
          break;

        case "username":
          if (!registerForm.username.trim()) {
            fieldErrors.username = "Bitte wähle einen Benutzernamen.";
            isValid = false;
          } else if (registerForm.username.length < 3) {
            fieldErrors.username = "Der Benutzername muss mindestens 3 Zeichen lang sein.";
            isValid = false;
          }
          break;

        case "role":
          if (!registerForm.role) {
            fieldErrors.role = "Bitte wähle eine Rolle aus.";
            isValid = false;
          }
          break;

        case "dob":
          if (!registerForm.dob) {
            fieldErrors.dob = "Bitte gib dein Geburtsdatum ein.";
            isValid = false;
          }
          break;

        case "phone":
          const germanPhoneRegex = /^(?:\+49|0049|0)\d{10,14}$/;
          if (!registerForm.phone.trim()) {
            fieldErrors.phone = "Bitte gib deine Telefonnummer ein.";
            isValid = false;
          } else if (!germanPhoneRegex.test(registerForm.phone.trim())) {
            fieldErrors.phone = "Bitte eine gültige deutsche Telefonnummer eingeben (z.B. 01701234567).";
            isValid = false;
          }
          break;

        case "email":
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!registerForm.email.trim()) {
            fieldErrors.email = "Bitte gib deine E-Mail-Adresse ein.";
            isValid = false;
          } else if (!emailRegex.test(registerForm.email.trim())) {
            fieldErrors.email = "Bitte gib eine gültige E-Mail-Adresse ein.";
            isValid = false;
          }
          break;

        case "password":
          const password = registerForm.password;
          if (!password) {
            fieldErrors.password = "Bitte wähle ein Passwort.";
            isValid = false;
          } else {
            const hasMinLength = password.length >= 8;
            const hasLetter = /[a-zA-Z]/.test(password);
            const hasNumber = /\d/.test(password);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

            if (!hasMinLength || !hasLetter || !hasNumber || !hasSpecialChar) {
              fieldErrors.password = "Mind. 8 Zeichen, Buchstaben, Zahlen und Sonderzeichen erforderlich.";
              isValid = false;
            }
          }
          break;

        case "passwordConfirm":
          if (!registerForm.passwordConfirm) {
            fieldErrors.passwordConfirm = "Bitte bestätige dein Passwort.";
            isValid = false;
          } else if (registerForm.password !== registerForm.passwordConfirm) {
            fieldErrors.passwordConfirm = "Die Passwörter stimmen nicht überein.";
            isValid = false;
          }
          break;

        case "agreeTerms":
          if (!registerForm.agreeTerms) {
            fieldErrors.agreeTerms = "Du musst den Nutzungsbedingungen zustimmen.";
            isValid = false;
          }
          break;
      }

      return isValid;
    };

    const clearFieldError = (fieldName: string) => {
      fieldErrors[fieldName] = "";
    };

    const clearAllErrors = () => {
      Object.keys(fieldErrors).forEach((key) => {
        fieldErrors[key] = "";
      });
    };

    // Scroll zum ersten Fehlerfeld
    const scrollToFirstError = async () => {
      await nextTick();

      const firstErrorField = document.querySelector(".form-group.has-error");
      if (firstErrorField) {
        firstErrorField.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        // Fokussiere das Input-Feld
        const input = firstErrorField.querySelector("input, .dropdown-selected");
        if (input) {
          (input as HTMLElement).focus();
        }
      }
    };

    // Registrierung verarbeiten
    const handleRegister = async () => {
      clearAllErrors();

      // Validiere alle Felder
      const fieldsToValidate = [
        "firstName",
        "lastName",
        "username",
        "role",
        "dob",
        "phone",
        "email",
        "password",
        "passwordConfirm",
        "agreeTerms",
      ];

      let hasErrors = false;
      for (const field of fieldsToValidate) {
        if (!validateField(field)) {
          hasErrors = true;
        }
      }

      if (hasErrors) {
        await scrollToFirstError();
        return;
      }

      try {
        isLoading.value = true;

        const registerData = {
          firstname: registerForm.firstName.trim(),
          lastname: registerForm.lastName.trim(),
          birthdate: registerForm.dob,
          username: registerForm.username.trim(),
          role: registerForm.role.trim(),
          email: registerForm.email.trim(),
          phone: registerForm.phone.trim(),
          password: registerForm.password,
        };

        const response = await api.post("/auth/local/register", registerData, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        registerStatus.message = "Registrierung erfolgreich!";
        registerStatus.success = true;

        const { access_token, refresh_token } = response.data;

        sessionStorage.setItem("access_token", access_token);
        sessionStorage.setItem("refresh_token", refresh_token);

        // Event an Parent-Komponente senden
        emit("register-success");

        await router.push("/member/dashboard");
      } catch (error: any) {
        registerStatus.success = false;

        // Server-seitige Fehler verarbeiten und dem richtigen Feld zuordnen
        if (error.response?.status === 403) {
          // Prüfe, ob es um E-Mail oder Username geht
          const errorMessage = error.response.data?.message || "";
          if (errorMessage.toLowerCase().includes("e-mail")) {
            fieldErrors.email = "Diese E-Mail-Adresse ist bereits vergeben.";
            await scrollToFirstError();
          } else if (
            errorMessage.toLowerCase().includes("username") ||
            errorMessage.toLowerCase().includes("benutzername")
          ) {
            fieldErrors.username = "Dieser Benutzername ist bereits vergeben.";
            await scrollToFirstError();
          } else {
            // Fallback für allgemeine 403 Fehler
            fieldErrors.email = "Diese E-Mail-Adresse oder dieser Benutzername ist bereits vergeben.";
            await scrollToFirstError();
          }
        } else if (error.response?.data?.errors) {
          // Verarbeite spezifische Feld-Fehler vom Server
          error.response.data.errors.forEach((err: any) => {
            if (err.field && fieldErrors.hasOwnProperty(err.field)) {
              fieldErrors[err.field] = err.message;
            }
          });
          await scrollToFirstError();
        } else {
          // Allgemeiner Fehler - zeige oben an
          registerStatus.message = "Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es später erneut.";
        }

        console.error("Register error:", error);
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => {
      document.addEventListener("click", handleClickOutside);
    });

    onBeforeUnmount(() => {
      document.removeEventListener("click", handleClickOutside);
    });

    return {
      registerForm,
      handleRegister,
      isLoading,
      registerStatus,
      // Field Errors
      fieldErrors,
      validateField,
      clearFieldError,
      // Password-Toggle-Funktionalität
      showRegisterPassword,
      showRegisterPasswordConfirm,
      // Passwort-Stärke (von Helper)
      passwordStrength,
      passwordStrengthText,
      passwordStrengthClass,
      // Passwort-Übereinstimmung (von Helper)
      passwordMatch,
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

  .form-group {
    margin-bottom: map.get(vars.$spacing, l);
    position: relative;

    // Fehlerhafte Felder
    &.has-error {
      margin-bottom: map.get(vars.$spacing, xl);
    }

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

          // Fehlerhafte Inputs
          &.error {
            border-color: #ff6464;
            box-shadow: 0 0 0 2px rgba(255, 100, 100, 0.2);

            &:focus {
              border-color: #ff6464;
              box-shadow: 0 0 0 2px rgba(255, 100, 100, 0.3);
            }
          }
        }
      }
    }

    // Inline Fehlermeldungen
    .field-error {
      display: block;
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: 4px;
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      color: #ff6464;
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      animation: fadeInError 0.3s ease-out;
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
              box-shadow: 0 0 0 2px rgba(mixins.theme-color($theme, accent-teal), 0.2);
            }

            &.active {
              border-color: mixins.theme-color($theme, accent-teal);
              box-shadow: 0 0 0 2px rgba(mixins.theme-color($theme, accent-teal), 0.2);
            }

            // Fehlerhaftes Dropdown
            &.error {
              border-color: #ff6464;
              box-shadow: 0 0 0 2px rgba(255, 100, 100, 0.2);

              &:focus {
                border-color: #ff6464;
                box-shadow: 0 0 0 2px rgba(255, 100, 100, 0.3);
              }
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
            border-radius: map.get(map.get(vars.$layout, border-radius), medium);
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
              border-bottom: 1px solid rgba(mixins.theme-color($theme, border-light), 0.2);

              &:hover,
              &:focus {
                background-color: mixins.theme-color($theme, hover-color);
              }

              &.selected {
                font-weight: map.get(map.get(vars.$fonts, weights), bold);
                background-color: rgba(mixins.theme-color($theme, accent-teal), 0.1);
              }

              &:last-child {
                border-bottom: none;
              }
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

    a.terms-link {
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

.password-match-message {
  display: flex;
  align-items: center;
  gap: map.get(vars.$spacing, xs);
  margin-top: map.get(vars.$spacing, xs);
  font-size: map.get(map.get(vars.$fonts, sizes), small);
  border-radius: map.get(map.get(vars.$layout, border-radius), medium);
  padding: 8px 12px;
  font-weight: map.get(map.get(vars.$fonts, weights), medium);
  transition: background 0.2s, color 0.2s;
  .check-icon {
    color: #26bb77; // success green
    width: 20px;
    height: 20px;
  }

  &.match-success {
    background: rgba(38, 187, 119, 0.12); // success
    color: var(--success-color, #26bb77);
  }

  &.match-error {
    background: rgba(231, 76, 60, 0.12); // error
    color: var(--error-color, #e74c3c);

    .error-icon {
      color: var(--error-color, #e74c3c);
      width: 20px;
      height: 20px;
    }
  }
}

// Animation für Fehlermeldungen
@keyframes fadeInError {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Grid-Layout für das Register-Formular
.registerform {
  .register-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: map.get(vars.$spacing, m);

    .form-group {
      &.half-width {
        grid-column: span 6;
      }

      &.forty-width {
        grid-column: span 5;
      }

      &.sixty-width {
        grid-column: span 7;
      }

      &.full-width {
        grid-column: span 12;
      }
    }

    .submit-button {
      grid-column: span 12;
    }
  }
}

// Responsive Anpassungen
@media (max-width: 768px) {
  .registerform {
    .register-grid {
      .form-group {
        &.half-width,
        &.forty-width,
        &.sixty-width {
          grid-column: span 12 !important;
        }
      }
    }
  }
}
</style>
