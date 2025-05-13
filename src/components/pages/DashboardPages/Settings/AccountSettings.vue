<!-- src/components/pages/DashboardPages/Settings/AccountSettings.vue -->
<template>
  <div class="settings-section account-settings">
    <h3>Kontoeinstellungen</h3>
    <p class="section-description">Verwalte dein Passwort und deine Kontoeinstellungen</p>

    <!-- Erfolgsmeldung -->
    <div v-if="saveSuccess" class="alert alert-success">
      <span class="alert-icon">✓</span>
      <span>Deine Kontoeinstellungen wurden erfolgreich gespeichert!</span>
    </div>

    <!-- Fehlermeldung -->
    <div v-if="saveError" class="alert alert-error">
      <span class="alert-icon">⚠️</span>
      <span>{{ errorMessage }}</span>
    </div>

    <div class="settings-card">
      <h4>Passwort ändern</h4>
      <form @submit.prevent="changePassword" class="settings-form">
        <div class="form-group">
          <label for="current-password">Aktuelles Passwort</label>
          <div class="input-container">
            <input type="password" id="current-password" v-model="passwordForm.currentPassword" required />
          </div>
        </div>

        <div class="form-group">
          <label for="new-password">Neues Passwort</label>
          <div class="input-container">
            <input type="password" id="new-password" v-model="passwordForm.newPassword" required />
          </div>
          <div class="password-strength" :class="passwordStrength">
            <div class="strength-bar"></div>
            <span class="strength-text">{{ getPasswordStrengthText() }}</span>
          </div>
        </div>

        <div class="form-group">
          <label for="confirm-password">Passwort bestätigen</label>
          <div class="input-container" :class="{ 'error': !passwordsMatch && passwordForm.confirmPassword }">
            <input type="password" id="confirm-password" v-model="passwordForm.confirmPassword" required />
          </div>
          <span class="help-text error-text" v-if="!passwordsMatch && passwordForm.confirmPassword">Passwörter stimmen
            nicht überein</span>
        </div>

        <div class="form-actions right">
          <button type="submit" class="save-button" :disabled="!passwordsMatch || !passwordForm.newPassword">Passwort
            ändern</button>
        </div>
      </form>
    </div>

    <div class="settings-card danger-zone">
      <h4>Konto löschen</h4>
      <p>Wenn du dein Konto löschst, werden alle deine Daten permanent entfernt. Diese Aktion kann nicht rückgängig
        gemacht werden.</p>
      <button type="button" class="danger-button" @click="confirmDeleteAccount">Konto löschen</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType, watch } from 'vue';

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default defineComponent({
  name: 'AccountSettings',
  props: {
    showSuccess: {
      type: Boolean,
      default: false
    },
    showError: {
      type: Boolean,
      default: false
    },
    errorMsg: {
      type: String,
      default: ''
    }
  },
  emits: ['delete-account', 'change-password', 'update:showSuccess', 'update:showError'],
  setup(props, { emit }) {
    // Status für Formularprozesse
    const isSaving = ref(false);
    const saveSuccess = ref(props.showSuccess);
    const saveError = ref(props.showError);
    const errorMessage = ref(props.errorMsg);
    
    watch(() => props.showSuccess, (newVal) => {
      saveSuccess.value = newVal;
    });
    
    watch(() => props.showError, (newVal) => {
      saveError.value = newVal;
    });
    
    watch(() => props.errorMsg, (newVal) => {
      errorMessage.value = newVal;
    });

    // Passwortformular
    const passwordForm = ref<PasswordForm>({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    // Passwort-Stärke berechnen
    const passwordStrength = computed((): string => {
      const password = passwordForm.value.newPassword;
      if (!password) return '';

      if (password.length < 8) return 'weak';

      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars].filter(Boolean).length;

      if (strength <= 2) return 'medium';
      return 'strong';
    });

    // Text für Passwort-Stärke
    const getPasswordStrengthText = (): string => {
      switch (passwordStrength.value) {
        case 'weak':
          return 'Schwach';
        case 'medium':
          return 'Mittel';
        case 'strong':
          return 'Stark';
        default:
          return '';
      }
    };

    // Prüfen, ob Passwörter übereinstimmen
    const passwordsMatch = computed((): boolean => {
      if (!passwordForm.value.newPassword || !passwordForm.value.confirmPassword) return true;
      return passwordForm.value.newPassword === passwordForm.value.confirmPassword;
    });

    // Passwort ändern
    const changePassword = async (): Promise<void> => {
      isSaving.value = true;
      emit('change-password', passwordForm.value);
      setTimeout(() => {
        isSaving.value = false;
        // Nach erfolgreichem Speichern Formular zurücksetzen
        passwordForm.value = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
      }, 1000);
    };

    // Konto löschen bestätigen
    const confirmDeleteAccount = (): void => {
      emit('delete-account');
    };

    return {
      passwordForm,
      isSaving,
      saveSuccess,
      saveError,
      errorMessage,
      passwordStrength,
      passwordsMatch,
      getPasswordStrengthText,
      changePassword,
      confirmDeleteAccount
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use 'sass:color';

.settings-section {
  margin-bottom: map.get(vars.$spacing, xxl);

  h3 {
    font-size: map.get(map.get(vars.$fonts, sizes), xl);
    font-weight: map.get(map.get(vars.$fonts, weights), bold);
    margin-bottom: map.get(vars.$spacing, xs);

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
      }
    }
  }

  .section-description {
    margin-bottom: map.get(vars.$spacing, l);

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
        transition: all 0.4s ease-out;
      }
    }
  }
}

// Alerts
.alert {
  margin-bottom: map.get(vars.$spacing, l);
  padding: map.get(vars.$spacing, m);
  border-radius: map.get(map.get(vars.$layout, border-radius), medium);
  display: flex;
  align-items: center;

  .alert-icon {
    margin-right: map.get(vars.$spacing, m);
    font-size: 1.2rem;
  }

  &.alert-success {
    background-color: rgba(46, 204, 113, 0.1);
    border-left: 4px solid #2ecc71;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
        transition: all 0.4s ease-out;
      }
    }
  }

  &.alert-error {
    background-color: rgba(231, 76, 60, 0.1);
    border-left: 4px solid #e74c3c;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
        transition: all 0.4s ease-out;
      }
    }
  }
}

// Karten für Einstellungsbereiche
.settings-card {
  margin-bottom: map.get(vars.$spacing, xl);
  padding: map.get(vars.$spacing, xl);
  border-radius: map.get(map.get(vars.$layout, border-radius), large);

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, card-bg);
      border: 1px solid mixins.theme-color($theme, border-light);
      transition: all 0.4s ease-out;
    }
  }

  h4 {
    font-size: map.get(map.get(vars.$fonts, sizes), large);
    margin-bottom: map.get(vars.$spacing, m);

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
        transition: all 0.4s ease-out;
      }
    }
  }

  p {
    margin-bottom: map.get(vars.$spacing, l);

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
        transition: all 0.4s ease-out;
      }
    }
  }

  // Gefahrenzone (Konto löschen)
  &.danger-zone {
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        border-left: 4px solid #ff6b6b;
        transition: all 0.4s ease-out;
      }
    }

    .danger-button {
      padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      cursor: pointer;
      border: none;
      background-color: #ff6b6b;
      color: white;

      &:hover {
        background-color: color.adjust(#ff6b6b, $lightness: -10%);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(255, 107, 107, 0.3);
      }
    }
  }
}

// Formularstile
.settings-form {
  max-width: 800px;
  margin: 0 auto;

  .form-group {
    margin-bottom: map.get(vars.$spacing, l);
    position: relative;

    label {
      display: block;
      margin-bottom: map.get(vars.$spacing, xs);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
          transition: all 0.4s ease-out;
        }
      }
    }

    .input-container {
      position: relative;
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      transition: all 0.3s ease;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          border: 1px solid mixins.theme-color($theme, border-light);
          transition: all 0.4s ease-out;

          &:focus-within {
            border-color: mixins.theme-color($theme, accent-teal);
            box-shadow: 0 0 0 3px rgba(mixins.theme-color($theme, accent-teal), 0.2);
          }

          &:hover {
            border-color: mixins.theme-color($theme, border-medium);
          }

          &.error {
            border-color: #e74c3c;

            &:focus-within {
              box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2);
            }
          }
        }
      }

      input {
        width: 100%;
        border: none;
        background: transparent;
        padding: map.get(vars.$spacing, m);
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
            transition: all 0.4s ease-out;
          }
        }

        &:focus {
          outline: none;
          box-shadow: none;
        }
      }
    }

    .help-text {
      display: block;
      margin-top: map.get(vars.$spacing, xxs);
      font-size: map.get(map.get(vars.$fonts, sizes), small);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-tertiary);
          transition: all 0.4s ease-out;
        }
      }

      &.error-text {
        color: #e74c3c;
      }
    }

    // Passwort-Stärke
    .password-strength {
      margin-top: map.get(vars.$spacing, s);

      .strength-bar {
        height: 4px;
        border-radius: 2px;
        margin-bottom: map.get(vars.$spacing, xxs);
        transition: all 0.3s;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, border-light);
            transition: all 0.4s ease-out;
          }
        }
      }

      &.weak .strength-bar {
        width: 30%;
        background-color: #ff6b6b;
      }

      &.medium .strength-bar {
        width: 60%;
        background-color: #ffbe3d;
      }

      &.strong .strength-bar {
        width: 100%;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, accent-green);
            transition: all 0.4s ease-out;
          }
        }
      }

      .strength-text {
        font-size: map.get(map.get(vars.$fonts, sizes), small);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-tertiary);
            transition: all 0.4s ease-out;
          }
        }
      }
    }
  }

  // Formularaktionen
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: map.get(vars.$spacing, m);
    margin-top: map.get(vars.$spacing, xl);

    &.right {
      justify-content: flex-end;
    }

    .save-button {
      padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      cursor: pointer;
      border: none;
      transition: all 0.3s ease;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, primary);
          color: white;
          transition: all 0.4s ease-out;

          &:hover:not(:disabled) {
            transform: translateY(-3px);
            @include mixins.shadow('medium', $theme);
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }
      }

      .loading-spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        margin-right: map.get(vars.$spacing, xs);
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    }
  }
}
</style>