<template>
  <div class="form-container registerform">
    <div class="form-header">
      <div class="welcome-icon">
        <UserGroupIcon class="icon-large" />
      </div>
      <h2>Werde Teil unserer Community</h2>
      <p>Erstelle ein Konto, um alle Funktionen nutzen zu können.</p>
    </div>

    <form @submit.prevent="handleRegister" class="register-grid modern-form">
      <!-- Progress Indicator -->
      <div class="progress-indicator">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: formProgress + '%' }"></div>
        </div>
        <span class="progress-text">{{ Math.round(formProgress) }}% ausgefüllt</span>
      </div>

      <!-- Persönliche Informationen Section -->
      <div class="form-section">
        <h3 class="section-title">
          <UserIcon class="section-icon" />
          Persönliche Informationen
        </h3>
        
        <div class="form-row">
          <div class="form-group floating-label" :class="{ 'has-error': fieldErrors.firstName }">
            <input
              type="text"
              id="register-first-name"
              v-model="registerForm.firstName"
              @blur="validateField('firstName')"
              @input="clearFieldError('firstName')"
              :class="{ 'has-value': registerForm.firstName, error: fieldErrors.firstName }"
              autocomplete="given-name"
            />
            <label for="register-first-name">Vorname</label>
            <span v-if="fieldErrors.firstName" class="field-error">{{ fieldErrors.firstName }}</span>
          </div>

          <div class="form-group floating-label" :class="{ 'has-error': fieldErrors.lastName }">
            <input
              type="text"
              id="register-last-name"
              v-model="registerForm.lastName"
              @blur="validateField('lastName')"
              @input="clearFieldError('lastName')"
              :class="{ 'has-value': registerForm.lastName, error: fieldErrors.lastName }"
              autocomplete="family-name"
            />
            <label for="register-last-name">Nachname</label>
            <span v-if="fieldErrors.lastName" class="field-error">{{ fieldErrors.lastName }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group floating-label" :class="{ 'has-error': fieldErrors.dob }">
            <input
              type="date"
              id="register-dob"
              v-model="registerForm.dob"
              @blur="validateField('dob')"
              @input="clearFieldError('dob')"
              :class="{ 'has-value': registerForm.dob, error: fieldErrors.dob }"
              autocomplete="bday"
            />
            <label for="register-dob">Geburtsdatum</label>
            <span v-if="fieldErrors.dob" class="field-error">{{ fieldErrors.dob }}</span>
          </div>

          <div class="form-group floating-label" :class="{ 'has-error': fieldErrors.phone }">
            <input
              type="tel"
              id="register-phone"
              v-model="registerForm.phone"
              @blur="validateField('phone')"
              @input="clearFieldError('phone')"
              :class="{ 'has-value': registerForm.phone, error: fieldErrors.phone }"
              autocomplete="tel"
            />
            <label for="register-phone">Telefonnummer</label>
            <span v-if="fieldErrors.phone" class="field-error">{{ fieldErrors.phone }}</span>
          </div>
        </div>
      </div>

      <!-- Konto-Informationen Section -->
      <div class="form-section">
        <h3 class="section-title">
          <KeyIcon class="section-icon" />
          Konto-Informationen
        </h3>

        <div class="form-row">
          <div class="form-group floating-label" :class="{ 'has-error': fieldErrors.username }">
            <input
              type="text"
              id="register-username"
              v-model="registerForm.username"
              @blur="validateField('username')"
              @input="clearFieldError('username')"
              :class="{ 'has-value': registerForm.username, error: fieldErrors.username }"
              autocomplete="username"
            />
            <label for="register-username">
              <AtSymbolIcon class="label-icon" />
              Benutzername
            </label>
            <span v-if="fieldErrors.username" class="field-error">{{ fieldErrors.username }}</span>
          </div>

          <div class="form-group modern-dropdown" :class="{ 'has-error': fieldErrors.role }">
            <label class="dropdown-label">Rolle</label>
            <div class="custom-dropdown-modern">
              <div
                class="dropdown-selected-modern"
                @click="toggleDropdown"
                :class="{ active: isOpen, error: fieldErrors.role, 'has-value': registerForm.role }"
                tabindex="0"
                @keydown.enter="toggleDropdown"
                @keydown.space="toggleDropdown"
                @keydown.up="navigateOptions(-1)"
                @keydown.down="navigateOptions(1)"
                @keydown.esc="closeDropdown"
              >
                <UserCircleIcon class="dropdown-icon" />
                <span>{{ selectedOption.text }}</span>
                <ChevronDownIcon class="dropdown-arrow" :class="{ rotated: isOpen }" />
              </div>

              <Transition name="dropdown">
                <div v-if="isOpen" class="dropdown-options-modern">
                  <div
                    v-for="(option, index) in roleOptions.slice(1)"
                    :key="option.value"
                    class="dropdown-option-modern"
                    :class="{ selected: option.value === selectedOption.value }"
                    @click="selectOption(option)"
                    tabindex="0"
                    @keydown.enter="selectOption(option)"
                    :data-index="index"
                  >
                    <UserIcon v-if="option.value === 'parent'" class="option-icon" />
                    <FaceSmileIcon v-else class="option-icon" />
                    {{ option.text }}
                  </div>
                </div>
              </Transition>

              <input type="hidden" id="register-role" name="role" v-model="registerForm.role" />
            </div>
            <span v-if="fieldErrors.role" class="field-error">{{ fieldErrors.role }}</span>
          </div>
        </div>

        <div class="form-group floating-label full-width" :class="{ 'has-error': fieldErrors.email }">
          <input
            type="email"
            id="register-email"
            v-model="registerForm.email"
            @blur="validateField('email')"
            @input="clearFieldError('email')"
            :class="{ 'has-value': registerForm.email, error: fieldErrors.email }"
            autocomplete="email"
          />
          <label for="register-email">
            <EnvelopeIcon class="label-icon" />
            E-Mail-Adresse
          </label>
          <span v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</span>
        </div>

        <div class="form-group floating-label full-width" :class="{ 'has-error': fieldErrors.password }">
          <input
            :type="showRegisterPassword ? 'text' : 'password'"
            id="register-password"
            v-model="registerForm.password"
            @blur="validateField('password')"
            @input="clearFieldError('password')"
            :class="{ 'has-value': registerForm.password, error: fieldErrors.password }"
            autocomplete="new-password"
          />
          <label for="register-password">
            <LockClosedIcon class="label-icon" />
            Passwort
          </label>
          <button
            type="button"
            class="password-toggle modern"
            @click="showRegisterPassword = !showRegisterPassword"
            :aria-label="showRegisterPassword ? 'Passwort verbergen' : 'Passwort anzeigen'"
          >
            <EyeSlashIcon v-if="showRegisterPassword" class="icon" />
            <EyeIcon v-else class="icon" />
          </button>
          <span v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</span>

          <!-- Modern Password Strength Indicator -->
          <div class="password-strength-modern" v-if="registerForm.password && !fieldErrors.password">
            <div class="strength-bars">
              <div 
                v-for="i in 4" 
                :key="i" 
                class="strength-bar"
                :class="{ 
                  'active': passwordStrength >= (i * 25),
                  'weak': passwordStrength >= (i * 25) && passwordStrength <= 25,
                  'medium': passwordStrength >= (i * 25) && passwordStrength > 25 && passwordStrength <= 50,
                  'good': passwordStrength >= (i * 25) && passwordStrength > 50 && passwordStrength <= 75,
                  'strong': passwordStrength >= (i * 25) && passwordStrength > 75
                }"
              ></div>
            </div>
            <span class="strength-text">{{ passwordStrengthText }}</span>
          </div>
        </div>

        <div class="form-group floating-label full-width" :class="{ 'has-error': fieldErrors.passwordConfirm }">
          <input
            :type="showRegisterPasswordConfirm ? 'text' : 'password'"
            id="register-password-confirm"
            v-model="registerForm.passwordConfirm"
            @blur="validateField('passwordConfirm')"
            @input="clearFieldError('passwordConfirm')"
            :class="{ 'has-value': registerForm.passwordConfirm, error: fieldErrors.passwordConfirm }"
            autocomplete="new-password"
          />
          <label for="register-password-confirm">
            <ShieldCheckIcon class="label-icon" />
            Passwort bestätigen
          </label>
          <button
            type="button"
            class="password-toggle modern"
            @click="showRegisterPasswordConfirm = !showRegisterPasswordConfirm"
            :aria-label="showRegisterPasswordConfirm ? 'Passwort verbergen' : 'Passwort anzeigen'"
          >
            <EyeSlashIcon v-if="showRegisterPasswordConfirm" class="icon" />
            <EyeIcon v-else class="icon" />
          </button>
          <span v-if="fieldErrors.passwordConfirm" class="field-error">{{ fieldErrors.passwordConfirm }}</span>

          <!-- Modern Password Match Indicator -->
          <Transition name="fade">
            <div
              v-if="registerForm.passwordConfirm && passwordMatch !== null && !fieldErrors.passwordConfirm"
              class="password-match-modern"
              :class="passwordMatch ? 'match' : 'no-match'"
            >
              <CheckCircleIcon v-if="passwordMatch" class="match-icon" />
              <XCircleIcon v-else class="match-icon" />
              <span>{{ passwordMatch ? 'Passwörter stimmen überein' : 'Passwörter stimmen nicht überein' }}</span>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Terms Acceptance -->
      <div class="form-group terms-group full-width" :class="{ 'has-error': fieldErrors.agreeTerms }">
        <label class="checkbox-modern">
          <input type="checkbox" v-model="registerForm.agreeTerms" @change="clearFieldError('agreeTerms')" />
          <span class="checkbox-box">
            <CheckIcon class="check-icon" />
          </span>
          <span class="checkbox-label">
            Ich stimme den
            <a href="#" class="terms-link">Nutzungsbedingungen</a>
            und der
            <a href="#" class="terms-link">Datenschutzerklärung</a>
            zu
          </span>
        </label>
        <span v-if="fieldErrors.agreeTerms" class="field-error">{{ fieldErrors.agreeTerms }}</span>
      </div>

      <button type="submit" class="submit-button modern full-width" :disabled="isLoading || !isFormValid">
        <div class="button-content">
          <span v-if="!isLoading" class="button-text">
            Konto erstellen
            <UserPlusIcon class="button-icon" />
          </span>
          <div v-else class="loading-spinner">
            <div class="spinner"></div>
            <span>Wird registriert...</span>
          </div>
        </div>
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, onBeforeUnmount, computed, watch, nextTick } from "vue";
import api from "@/services/axiosInstance";
import { usePasswordStrength, usePasswordMatch } from "@/composables/usePasswordUtils";
import { 
  EyeIcon, 
  EyeSlashIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  UserGroupIcon,
  UserIcon,
  KeyIcon,
  AtSymbolIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  ChevronDownIcon,
  CheckIcon,
  UserPlusIcon,
  FaceSmileIcon
} from "@heroicons/vue/24/outline";

export default defineComponent({
  name: "Register",
  components: {
    EyeIcon,
    EyeSlashIcon,
    CheckCircleIcon,
    XCircleIcon,
    UserGroupIcon,
    UserIcon,
    KeyIcon,
    AtSymbolIcon,
    EnvelopeIcon,
    LockClosedIcon,
    ShieldCheckIcon,
    UserCircleIcon,
    ChevronDownIcon,
    CheckIcon,
    UserPlusIcon,
    FaceSmileIcon
  },

  emits: ["register-success"],

  setup(_, { emit }) {
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

    // Form Progress
    const formProgress = computed(() => {
      const fields = [
        registerForm.firstName,
        registerForm.lastName,
        registerForm.username,
        registerForm.role,
        registerForm.dob,
        registerForm.phone,
        registerForm.email,
        registerForm.password,
        registerForm.passwordConfirm,
        registerForm.agreeTerms
      ];
      
      const filledFields = fields.filter(field => {
        if (typeof field === 'boolean') return field;
        return field && field.length > 0;
      }).length;
      
      return (filledFields / fields.length) * 100;
    });

    // Form Validity Check
    const isFormValid = computed(() => {
      return formProgress.value === 100 && passwordMatch.value;
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
      const optionElements = document.querySelectorAll(".dropdown-option-modern");
      if (optionElements[newIndex]) {
        (optionElements[newIndex] as HTMLElement).focus();
      }
    };

    // Klick außerhalb schließt Dropdown
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.querySelector(".custom-dropdown-modern");
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

    const clearFieldError = (fieldName: string) => (fieldErrors[fieldName] = "");

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
        const input = firstErrorField.querySelector("input, .dropdown-selected-modern");
        if (input) (input as HTMLElement).focus();
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

        // Datum formatieren (falls nötig)
        const formattedDate = registerForm.dob ? new Date(registerForm.dob).toISOString() : "";

        const registerData = {
          firstname: registerForm.firstName.trim(),
          lastname: registerForm.lastName.trim(),
          birthdate: formattedDate,
          username: registerForm.username.trim(),
          role: registerForm.role.trim(),
          email: registerForm.email.trim(),
          phone: registerForm.phone.trim(),
          password: registerForm.password,
        };

        const response = await api.post("/auth/local/register", registerData, {
          headers: { "Content-Type": "application/json" },
        });
        registerStatus.message = "Registrierung erfolgreich!";
        registerStatus.success = true;

        const { access_token, refresh_token } = response.data;

        sessionStorage.setItem("access_token", access_token);
        sessionStorage.setItem("refresh_token", refresh_token);

        // Event an Parent-Komponente senden
        emit("register-success");
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
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => document.addEventListener("click", handleClickOutside));

    onBeforeUnmount(() => document.removeEventListener("click", handleClickOutside));

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
      // Form Progress
      formProgress,
      isFormValid,
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

  // Progress Indicator
  .progress-indicator {
    margin-bottom: 2rem;
    text-align: center;

    .progress-bar {
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.5rem;
      
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: mixins.theme-color($theme, secondary-bg);
        }
      }

      .progress-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 0.3s ease;
        
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: mixins.theme-gradient($theme, primary);
          }
        }
      }
    }

    .progress-text {
      font-size: 0.875rem;
      font-weight: 500;
      
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  // Form Sections
  .form-section {
    margin-bottom: 2rem;

    .section-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }

      .section-icon {
        width: 24px;
        height: 24px;
        
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, accent-green);
          }
        }
      }
    }
  }

  // Form Layout
  .modern-form {
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .form-group {
      position: relative;
      margin-bottom: 1.5rem;

      &.full-width {
        grid-column: 1 / -1;
      }

      &.has-error {
        margin-bottom: 2.5rem;
      }

      // Floating Labels
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

              &.error {
                border-bottom-color: #ff6464;
              }
            }
          }

          &[type="date"] {
            &::-webkit-calendar-picker-indicator {
              cursor: pointer;
              opacity: 0.6;
              transition: opacity 0.3s ease;

              &:hover {
                opacity: 1;
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

      // Modern Dropdown
      &.modern-dropdown {
        .dropdown-label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }

        .custom-dropdown-modern {
          position: relative;

          .dropdown-selected-modern {
            width: 100%;
            padding: 1rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            border-radius: 12px;
            transition: all 0.3s ease;
            
            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                background: mixins.theme-color($theme, secondary-bg);
                border: 2px solid mixins.theme-color($theme, border-light);
                color: mixins.theme-color($theme, text-primary);

                &:hover,
                &:focus {
                  outline: none;
                  border-color: mixins.theme-color($theme, accent-green);
                  background: mixins.theme-color($theme, hover-color);
                }

                &.active {
                  border-color: mixins.theme-color($theme, accent-green);
                }

                &.error {
                  border-color: #ff6464;
                }

                &.has-value {
                  color: mixins.theme-color($theme, text-primary);
                }
              }
            }

            .dropdown-icon {
              width: 20px;
              height: 20px;
              
              @each $theme in ("light", "dark") {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, text-secondary);
                }
              }
            }

            .dropdown-arrow {
              margin-left: auto;
              width: 20px;
              height: 20px;
              transition: transform 0.3s ease;
              
              @each $theme in ("light", "dark") {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, text-secondary);
                }
              }

              &.rotated {
                transform: rotate(180deg);
              }
            }
          }

          .dropdown-options-modern {
            position: absolute;
            top: calc(100% + 0.5rem);
            left: 0;
            right: 0;
            z-index: 10;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            
            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                background: mixins.theme-color($theme, card-bg);
                border: 1px solid mixins.theme-color($theme, border-light);
              }
            }

            .dropdown-option-modern {
              padding: 1rem;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 0.75rem;
              transition: all 0.2s ease;
              
              @each $theme in ("light", "dark") {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, text-primary);

                  &:hover,
                  &:focus {
                    background: mixins.theme-color($theme, hover-color);
                    outline: none;
                  }

                  &.selected {
                    background: rgba(mixins.theme-color($theme, accent-green), 0.1);
                    color: mixins.theme-color($theme, accent-green);
                  }

                  &:not(:last-child) {
                    border-bottom: 1px solid mixins.theme-color($theme, border-light);
                  }
                }
              }

              .option-icon {
                width: 20px;
                height: 20px;
              }
            }
          }
        }
      }

      // Field Errors
      .field-error {
        position: absolute;
        bottom: -1.5rem;
        left: 0;
        font-size: 0.813rem;
        color: #ff6464;
        font-weight: 500;
        animation: fadeInError 0.3s ease-out;
      }
    }

    // Password Strength
    .password-strength-modern {
      margin-top: 0.75rem;
      display: flex;
      align-items: center;
      gap: 1rem;

      .strength-bars {
        display: flex;
        gap: 0.25rem;
        flex: 1;

        .strength-bar {
          flex: 1;
          height: 4px;
          border-radius: 2px;
          transition: all 0.3s ease;
          
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background: mixins.theme-color($theme, secondary-bg);

              &.active {
                &.weak {
                  background: #ff6464;
                }
                &.medium {
                  background: #ffaa00;
                }
                &.good {
                  background: #ffd700;
                }
                &.strong {
                  background: #00cc66;
                }
              }
            }
          }
        }
      }

      .strength-text {
        font-size: 0.813rem;
        font-weight: 500;
        min-width: 80px;
        text-align: right;
        
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }
    }

    // Password Match
    .password-match-modern {
      margin-top: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;

      .match-icon {
        width: 18px;
        height: 18px;
      }

      &.match {
        color: #00cc66;
      }

      &.no-match {
        color: #ff6464;
      }
    }

    // Terms Checkbox
    .terms-group {
      margin-top: 2rem;
      margin-bottom: 2rem;

      .checkbox-modern {
        display: flex;
        align-items: flex-start;
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
          flex-shrink: 0;
          margin-top: 2px;
          
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
          line-height: 1.5;
          
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }

          .terms-link {
            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, accent-teal);
                text-decoration: none;
                font-weight: 500;

                &:hover {
                  text-decoration: underline;
                }
              }
            }
          }
        }
      }
    }

    // Submit Button
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
              transform: translateX(4px) scale(1.1);
            }
          }

          &:active:not(:disabled) {
            transform: translateY(0);
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
            background: mixins.theme-color($theme, text-tertiary);
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
          width: 20px;
          height: 20px;
          transition: all 0.3s ease;
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// Dropdown Animation
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

// Fade Animation
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>