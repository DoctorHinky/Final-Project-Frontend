<!-- src/components/pages/DashboardPages/Settings/AccountSettings.vue -->
<template>
  <div class="settings-section account-settings">
    <h3>Kontoeinstellungen</h3>
    <p class="section-description">Verwalte dein Passwort und deine Kontoeinstellungen</p>

    <!-- Erfolgsmeldung -->
    <div v-if="saveSuccess" class="alert alert-success">
      <span class="alert-icon">✓</span>
      <span>{{ successMessage }}</span>
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
          <div class="input-container" :class="{ 'error': passwordErrors.currentPassword }">
            <input 
              type="password" 
              id="current-password" 
              v-model="passwordForm.currentPassword" 
              required 
              :disabled="isChangingPassword"
            />
          </div>
          <span v-if="passwordErrors.currentPassword" class="help-text error-text">
            {{ passwordErrors.currentPassword }}
          </span>
        </div>

        <div class="form-group">
          <label for="new-password">Neues Passwort</label>
          <div class="input-container" :class="{ 'error': passwordErrors.newPassword }">
            <input 
              type="password" 
              id="new-password" 
              v-model="passwordForm.newPassword" 
              required 
              :disabled="isChangingPassword"
              @input="validatePasswordStrength"
            />
          </div>
          <span v-if="passwordErrors.newPassword" class="help-text error-text">
            {{ passwordErrors.newPassword }}
          </span>
          <div v-if="passwordForm.newPassword" class="password-strength" :class="passwordStrength">
            <div class="strength-bar"></div>
            <span class="strength-text">{{ getPasswordStrengthText() }}</span>
          </div>
          <span class="help-text">Mindestens 8 Zeichen, inkl. Groß-/Kleinbuchstaben, Zahlen und Sonderzeichen</span>
        </div>

        <div class="form-group">
          <label for="confirm-password">Passwort bestätigen</label>
          <div class="input-container" :class="{ 'error': !passwordsMatch && passwordForm.confirmPassword }">
            <input 
              type="password" 
              id="confirm-password" 
              v-model="passwordForm.confirmPassword" 
              required 
              :disabled="isChangingPassword"
            />
          </div>
          <span class="help-text error-text" v-if="!passwordsMatch && passwordForm.confirmPassword">
            Passwörter stimmen nicht überein
          </span>
        </div>

        <div class="form-actions right">
          <button 
            type="submit" 
            class="save-button" 
            :disabled="!canSubmitPassword || isChangingPassword"
          >
            <span v-if="isChangingPassword" class="loading-spinner"></span>
            <span v-else>Passwort ändern</span>
          </button>
        </div>
      </form>
    </div>

    <div class="settings-card danger-zone">
      <h4>Konto löschen</h4>
      <p>Wenn du dein Konto löschst, werden alle deine Daten permanent entfernt. Diese Aktion kann nicht rückgängig gemacht werden.</p>
      
      <!-- Bestätigungsformular für Kontolöschung -->
      <div v-if="showDeleteConfirm" class="delete-confirm-form">
        <p class="warning-text">⚠️ Bist du sicher? Diese Aktion kann nicht rückgängig gemacht werden.</p>
        <form @submit.prevent="deleteAccount">
          <div class="form-group">
            <label for="delete-reason">Grund für die Löschung (optional)</label>
            <div class="input-container textarea-container">
              <textarea 
                id="delete-reason" 
                v-model="deleteForm.deleteReason" 
                :disabled="isDeletingAccount"
                placeholder="Teile uns mit, warum du dein Konto löschen möchtest..."
                rows="4"
              ></textarea>
            </div>
            <span class="help-text">Du kannst uns optional mitteilen, warum du gehst</span>
          </div>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="deleteForm.confirmDeletion"
                :disabled="isDeletingAccount"
              />
              <span>Ich verstehe, dass alle meine Daten permanent gelöscht werden</span>
            </label>
          </div>
          
          <div class="form-actions">
            <button 
              type="button" 
              class="cancel-button" 
              @click="cancelDelete"
              :disabled="isDeletingAccount"
            >
              Abbrechen
            </button>
            <button 
              type="submit" 
              class="danger-button" 
              :disabled="isDeletingAccount || !deleteForm.confirmDeletion"
            >
              <span v-if="isDeletingAccount" class="loading-spinner"></span>
              <span v-else>Konto endgültig löschen</span>
            </button>
          </div>
        </form>
      </div>
      
      <button 
        v-else
        type="button" 
        class="danger-button" 
        @click="confirmDeleteAccount"
      >
        Konto löschen
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import api from '@/services/axiosInstance';
import { useRouter } from 'vue-router';

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface DeleteForm {
  deleteReason?: string;
  confirmDeletion: boolean;
}

interface ValidationErrors {
  currentPassword?: string;
  newPassword?: string;
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
  emits: ['update:showSuccess', 'update:showError', 'password-changed', 'account-deleted'],
  setup(props, { emit }) {
    const router = useRouter();
    
    // Status für Formularprozesse
    const isChangingPassword = ref(false);
    const isDeletingAccount = ref(false);
    const saveSuccess = ref(props.showSuccess);
    const saveError = ref(props.showError);
    const errorMessage = ref(props.errorMsg);
    const successMessage = ref('');
    const showDeleteConfirm = ref(false);
    
    // Fehlerobjekte
    const passwordErrors = ref<ValidationErrors>({});
    const deleteErrors = ref<{ deleteReason?: string }>({});
    
    // Beobachter für Prop-Änderungen
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
    
    // Löschformular
    const deleteForm = ref<DeleteForm>({
      deleteReason: '',
      confirmDeletion: false
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

      if (strength <= 2) return 'weak';
      if (strength === 3) return 'medium';
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
    
    // Prüfen, ob Passwortformular abgeschickt werden kann
    const canSubmitPassword = computed((): boolean => {
      return !!(
        passwordForm.value.currentPassword &&
        passwordForm.value.newPassword &&
        passwordForm.value.confirmPassword &&
        passwordsMatch.value &&
        passwordStrength.value !== 'weak'
      );
    });
    
    // Passwort-Validierung
    const validatePasswordStrength = (): void => {
      const password = passwordForm.value.newPassword;
      passwordErrors.value.newPassword = '';
      
      if (password && password.length < 8) {
        passwordErrors.value.newPassword = 'Passwort muss mindestens 8 Zeichen lang sein';
      } else if (password && passwordStrength.value === 'weak') {
        passwordErrors.value.newPassword = 'Passwort ist zu schwach. Verwende Groß-/Kleinbuchstaben, Zahlen und Sonderzeichen';
      }
    };

    // Passwort ändern
    const changePassword = async (): Promise<void> => {
      if (!canSubmitPassword.value) return;
      
      try {
        isChangingPassword.value = true;
        saveError.value = false;
        saveSuccess.value = false;
        passwordErrors.value = {};
        
        const response = await api.patch('/user/updatePassword', {
          password: passwordForm.value.currentPassword,
          newPassword: passwordForm.value.newPassword
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        // Erfolg anzeigen
        successMessage.value = 'Dein Passwort wurde erfolgreich geändert!';
        saveSuccess.value = true;
        emit('update:showSuccess', true);
        emit('password-changed');
        
        // Formular zurücksetzen
        passwordForm.value = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        
        // Erfolgsmeldung nach 3 Sekunden ausblenden
        setTimeout(() => {
          saveSuccess.value = false;
          emit('update:showSuccess', false);
        }, 3000);
        
      } catch (error: any) {
        console.error('Fehler beim Ändern des Passworts:', error);
        saveError.value = true;
        emit('update:showError', true);
        
        // Spezifische Fehlerbehandlung
        if (error.response?.status === 401) {
          passwordErrors.value.currentPassword = 'Das aktuelle Passwort ist falsch';
          errorMessage.value = 'Das aktuelle Passwort ist falsch';
        } else if (error.response?.data?.message) {
          errorMessage.value = error.response.data.message;
        } else {
          errorMessage.value = 'Fehler beim Ändern des Passworts. Bitte versuche es später erneut.';
        }
        
        // Fehlermeldung nach 5 Sekunden ausblenden
        setTimeout(() => {
          saveError.value = false;
          emit('update:showError', false);
        }, 5000);
      } finally {
        isChangingPassword.value = false;
      }
    };

    // Konto löschen bestätigen
    const confirmDeleteAccount = (): void => {
      showDeleteConfirm.value = true;
      deleteForm.value.deleteReason = '';
      deleteForm.value.confirmDeletion = false;
      deleteErrors.value = {};
    };
    
    // Löschvorgang abbrechen
    const cancelDelete = (): void => {
      showDeleteConfirm.value = false;
      deleteForm.value.deleteReason = '';
      deleteForm.value.confirmDeletion = false;
      deleteErrors.value = {};
    };
    
    // Konto löschen
    const deleteAccount = async (): Promise<void> => {
      // Bestätigung prüfen
      if (!deleteForm.value.confirmDeletion) {
        return;
      }
      
      try {
        isDeletingAccount.value = true;
        saveError.value = false;
        deleteErrors.value = {};
        
        // Request-Body vorbereiten
        const requestBody: any = {};
        if (deleteForm.value.deleteReason && deleteForm.value.deleteReason.trim()) {
          requestBody.deleteReason = deleteForm.value.deleteReason.trim();
        }
        
        // Account löschen
        await api.patch('/user/deleteMyAccount', requestBody, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        // Erfolgsmeldung anzeigen
        successMessage.value = 'Dein Konto wurde erfolgreich gelöscht. Du wirst gleich weitergeleitet...';
        saveSuccess.value = true;
        emit('update:showSuccess', true);
        emit('account-deleted');
        
        // LocalStorage bereinigen
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Zur Startseite weiterleiten
        setTimeout(() => {
          router.push('/');
        }, 1500);
        
      } catch (error: any) {
        console.error('Fehler beim Löschen des Kontos:', error);
        
        // Fehlerbehandlung
        if (error.response?.data?.message) {
          errorMessage.value = error.response.data.message;
        } else {
          errorMessage.value = 'Fehler beim Löschen des Kontos. Bitte versuche es später erneut.';
        }
        
        saveError.value = true;
        emit('update:showError', true);
        
        // Fehlermeldung nach 5 Sekunden ausblenden
        setTimeout(() => {
          saveError.value = false;
          emit('update:showError', false);
        }, 5000);
      } finally {
        isDeletingAccount.value = false;
      }
    };

    return {
      passwordForm,
      deleteForm,
      isChangingPassword,
      isDeletingAccount,
      saveSuccess,
      saveError,
      errorMessage,
      successMessage,
      passwordStrength,
      passwordsMatch,
      canSubmitPassword,
      showDeleteConfirm,
      passwordErrors,
      deleteErrors,
      getPasswordStrengthText,
      validatePasswordStrength,
      changePassword,
      confirmDeleteAccount,
      cancelDelete,
      deleteAccount
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
  animation: slideInDown 0.3s ease-out;

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
      transition: all 0.3s ease;

      &:hover:not(:disabled) {
        background-color: color.adjust(#ff6b6b, $lightness: -10%);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(255, 107, 107, 0.3);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
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
    }

    .delete-confirm-form {
      animation: fadeIn 0.3s ease-out;

      .warning-text {
        color: #ff6b6b;
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        margin-bottom: map.get(vars.$spacing, m);
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

          &:hover:not(:focus-within) {
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

      input,
      textarea {
        width: 100%;
        border: none;
        background: transparent;
        padding: map.get(vars.$spacing, m);
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);
        resize: vertical;
        font-family: inherit;
        min-height: 40px;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
            transition: all 0.4s ease-out;

            &::placeholder {
              color: mixins.theme-color($theme, text-tertiary);
              opacity: 0.7;
            }
          }
        }

        &:focus {
          outline: none;
          box-shadow: none;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      // Spezifische Textarea-Styles
      &.textarea-container textarea {
        line-height: 1.5;
        padding-top: map.get(vars.$spacing, m);
        padding-bottom: map.get(vars.$spacing, m);
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

    // Checkbox-Label
    .checkbox-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      user-select: none;
      font-size: map.get(map.get(vars.$fonts, sizes), base);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
          transition: all 0.4s ease-out;
        }
      }

      input[type="checkbox"] {
        width: 20px;
        height: 20px;
        margin-right: map.get(vars.$spacing, m);
        cursor: pointer;
        accent-color: #ff6b6b;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            border: 2px solid mixins.theme-color($theme, border-medium);
            background-color: mixins.theme-color($theme, secondary-bg);
            transition: all 0.4s ease-out;
          }
        }

        &:checked {
          background-color: #ff6b6b;
          border-color: #ff6b6b;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      span {
        flex: 1;
        line-height: 1.4;
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

    .cancel-button,
    .save-button {
      padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      cursor: pointer;
      border: none;
      display: flex;
      align-items: center;
      transition: all 0.3s ease;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .cancel-button {
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          color: mixins.theme-color($theme, text-primary);
          border: 1px solid mixins.theme-color($theme, border-light);
          transition: all 0.4s ease-out;

          &:hover:not(:disabled) {
            background-color: mixins.theme-color($theme, hover-color);
            border-color: mixins.theme-color($theme, border-medium);
          }
        }
      }
    }

    .save-button {
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, primary);
          color: white;
          transition: all 0.4s ease-out;

          &:hover:not(:disabled) {
            transform: translateY(-3px);
            @include mixins.shadow('medium', $theme);
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
    }
  }
}

// Animationen
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>