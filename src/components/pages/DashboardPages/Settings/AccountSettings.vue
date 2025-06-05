<!-- src/components/pages/DashboardPages/Settings/AccountSettings.vue -->
<template>
  <div class="settings-section account-settings">
    <h3>Kontoeinstellungen</h3>
    <p class="section-description">Verwalte dein Passwort und deine Kontoeinstellungen</p>

    <!-- Alert Messages -->
    <div v-if="saveSuccess" class="alert alert-success">
      <span class="alert-icon">✓</span>
      <span>{{ successMessage }}</span>
    </div>

    <div v-if="saveError" class="alert alert-error">
      <span class="alert-icon">⚠️</span>
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Password Change Card -->
    <div class="settings-card">
      <h4>Passwort ändern</h4>
      <form @submit.prevent="changePassword" class="settings-form">
        <div class="form-group">
          <label for="current-password">Aktuelles Passwort</label>
          <div class="input-container" :class="{ error: passwordErrors.currentPassword }">
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
          <div class="input-container" :class="{ error: passwordErrors.newPassword }">
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
            <span class="strength-text">{{ passwordStrengthText }}</span>
          </div>
          <span class="help-text">Mindestens 8 Zeichen, inkl. Groß-/Kleinbuchstaben, Zahlen und Sonderzeichen</span>
        </div>

        <div class="form-group">
          <label for="confirm-password">Passwort bestätigen</label>
          <div class="input-container" :class="{ error: !passwordsMatch && passwordForm.confirmPassword }">
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

        <div class="form-actions">
          <button type="submit" class="save-button" :disabled="!canSubmitPassword || isChangingPassword">
            <span v-if="isChangingPassword" class="loading-spinner"></span>
            <span v-else>Passwort ändern</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Delete Account Card -->
    <div class="settings-card danger-zone">
      <h4>Konto löschen</h4>
      <p>Wenn du dein Konto löschst, werden alle deine Daten permanent entfernt. Diese Aktion kann nicht rückgängig gemacht werden.</p>
      
      <div v-if="showDeleteConfirm" class="delete-confirm-form">
        <div class="warning-box">
          <span class="warning-icon">⚠️</span>
          <p>Bist du sicher? Diese Aktion kann nicht rückgängig gemacht werden.</p>
        </div>

        <div class="legal-info-box">
          <span class="info-icon">ℹ️</span>
          <div class="info-content">
            <strong>Rechtlicher Hinweis:</strong>
            <p>Aus rechtlichen Gründen werden deine Daten nach der Löschung noch 30 Tage in einem gesicherten Archiv aufbewahrt. Nach Ablauf dieser Frist werden sie unwiderruflich und vollständig gelöscht.</p>
          </div>
        </div>

        <form @submit.prevent="deleteAccount">
          <div class="form-group delete-reason-group">
            <label for="delete-reason">Möchtest du uns mitteilen, warum du gehst?</label>
            <div class="modern-textarea-wrapper">
              <textarea 
                id="delete-reason" 
                v-model="deleteForm.deleteReason" 
                :disabled="isDeletingAccount"
                placeholder="Teile uns deine Erfahrungen mit – dein Feedback hilft uns, besser zu werden..."
                class="modern-textarea"
              ></textarea>
              <div class="textarea-decoration">
                <span class="decoration-line"></span>
                <span class="decoration-dot"></span>
              </div>
            </div>
            <span class="help-text">Dein Feedback ist optional, aber wertvoll für uns</span>
          </div>
          
          <div class="form-group confirm-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="deleteForm.confirmDeletion"
                :disabled="isDeletingAccount"
              />
              <span> Ich verstehe, dass alle meine Daten permanent gelöscht werden</span>
            </label>
          </div>
          
          <div class="form-actions">
            <button type="button" class="cancel-buttonPW" @click="cancelDelete" :disabled="isDeletingAccount">
              Abbrechen
            </button>
            <button type="submit" class="danger-button" :disabled="isDeletingAccount || !deleteForm.confirmDeletion">
              <span v-if="isDeletingAccount" class="loading-spinner"></span>
              <span v-else>Konto endgültig löschen</span>
            </button>
          </div>
        </form>
      </div>
      
      <button v-else type="button" class="danger-button" @click="confirmDeleteAccount">
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

export default defineComponent({
  name: 'AccountSettings',
  props: {
    showSuccess: Boolean,
    showError: Boolean,
    errorMsg: String
  },
  emits: ['update:showSuccess', 'update:showError', 'password-changed', 'account-deleted'],
  setup(props, { emit }) {
    const router = useRouter();
    
    // State
    const isChangingPassword = ref(false);
    const isDeletingAccount = ref(false);
    const saveSuccess = ref(props.showSuccess);
    const saveError = ref(props.showError);
    const errorMessage = ref(props.errorMsg || '');
    const successMessage = ref('');
    const showDeleteConfirm = ref(false);
    
    const passwordErrors = ref<Record<string, string>>({});
    
    const passwordForm = ref<PasswordForm>({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    const deleteForm = ref<DeleteForm>({
      deleteReason: '',
      confirmDeletion: false
    });

    // Watchers
    watch(() => props.showSuccess, (val) => saveSuccess.value = val);
    watch(() => props.showError, (val) => saveError.value = val);
    watch(() => props.errorMsg, (val) => errorMessage.value = val || '');

    // Computed
    const passwordStrength = computed((): string => {
      const password = passwordForm.value.newPassword;
      if (!password) return '';
      if (password.length < 8) return 'weak';

      const checks = [
        /[A-Z]/.test(password),
        /[a-z]/.test(password),
        /\d/.test(password),
        /[!@#$%^&*(),.?":{}|<>]/.test(password)
      ];

      const strength = checks.filter(Boolean).length;
      return strength <= 2 ? 'weak' : strength === 3 ? 'medium' : 'strong';
    });

    const passwordStrengthText = computed(() => {
      const texts = { weak: 'Schwach', medium: 'Mittel', strong: 'Stark' };
      return texts[passwordStrength.value] || '';
    });

    const passwordsMatch = computed(() => 
      !passwordForm.value.newPassword || 
      !passwordForm.value.confirmPassword || 
      passwordForm.value.newPassword === passwordForm.value.confirmPassword
    );
    
    const canSubmitPassword = computed(() => 
      passwordForm.value.currentPassword &&
      passwordForm.value.newPassword &&
      passwordForm.value.confirmPassword &&
      passwordsMatch.value &&
      passwordStrength.value !== 'weak'
    );
    
    // Methods
    const validatePasswordStrength = () => {
      const password = passwordForm.value.newPassword;
      passwordErrors.value.newPassword = '';
      
      if (password && password.length < 8) {
        passwordErrors.value.newPassword = 'Passwort muss mindestens 8 Zeichen lang sein';
      } else if (password && passwordStrength.value === 'weak') {
        passwordErrors.value.newPassword = 'Passwort ist zu schwach. Verwende Groß-/Kleinbuchstaben, Zahlen und Sonderzeichen';
      }
    };

    const showMessage = (message: string, isError = false) => {
      if (isError) {
        errorMessage.value = message;
        saveError.value = true;
        emit('update:showError', true);
      } else {
        successMessage.value = message;
        saveSuccess.value = true;
        emit('update:showSuccess', true);
      }
      
      setTimeout(() => {
        if (isError) {
          saveError.value = false;
          emit('update:showError', false);
        } else {
          saveSuccess.value = false;
          emit('update:showSuccess', false);
        }
      }, isError ? 5000 : 3000);
    };

    const changePassword = async () => {
      if (!canSubmitPassword.value) return;
      
      try {
        isChangingPassword.value = true;
        passwordErrors.value = {};
        
        await api.patch('/user/updatePassword', {
          password: passwordForm.value.currentPassword,
          newPassword: passwordForm.value.newPassword
        });
        
        showMessage('Dein Passwort wurde erfolgreich geändert!');
        emit('password-changed');
        
        // Reset form
        Object.assign(passwordForm.value, {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
      } catch (error: any) {
        console.error('Fehler beim Ändern des Passworts:', error);
        
        if (error.response?.status === 401) {
          passwordErrors.value.currentPassword = 'Das aktuelle Passwort ist falsch';
          showMessage('Das aktuelle Passwort ist falsch', true);
        } else {
          showMessage(
            error.response?.data?.message || 
            'Fehler beim Ändern des Passworts. Bitte versuche es später erneut.',
            true
          );
        }
      } finally {
        isChangingPassword.value = false;
      }
    };

    const confirmDeleteAccount = () => {
      showDeleteConfirm.value = true;
      deleteForm.value = { deleteReason: '', confirmDeletion: false };
    };
    
    const cancelDelete = () => {
      showDeleteConfirm.value = false;
      deleteForm.value = { deleteReason: '', confirmDeletion: false };
    };
    
    const deleteAccount = async () => {
      if (!deleteForm.value.confirmDeletion) return;
      
      try {
        isDeletingAccount.value = true;
        
        const requestBody = deleteForm.value.deleteReason?.trim() 
          ? { deleteReason: deleteForm.value.deleteReason.trim() } 
          : {};
        
        await api.patch('/user/deleteMyAccount', requestBody);
        
        showMessage('Dein Konto wurde erfolgreich gelöscht. Du wirst gleich weitergeleitet...');
        emit('account-deleted');
        
        // Cleanup
        ['authToken', 'refreshToken', 'user'].forEach(key => localStorage.removeItem(key));
        
        setTimeout(() => router.push('/'), 1500);
        
      } catch (error: any) {
        console.error('Fehler beim Löschen des Kontos:', error);
        showMessage(
          error.response?.data?.message || 
          'Fehler beim Löschen des Kontos. Bitte versuche es später erneut.',
          true
        );
      } finally {
        isDeletingAccount.value = false;
      }
    };

    return {
      // State
      passwordForm,
      deleteForm,
      isChangingPassword,
      isDeletingAccount,
      saveSuccess,
      saveError,
      errorMessage,
      successMessage,
      showDeleteConfirm,
      passwordErrors,
      
      // Computed
      passwordStrength,
      passwordStrengthText,
      passwordsMatch,
      canSubmitPassword,
      
      // Methods
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

// Base styles
.settings-section {
  margin-bottom: map.get(vars.$spacing, xxl);

  h3 {
    font-size: map.get(map.get(vars.$fonts, sizes), xl);
    font-weight: map.get(map.get(vars.$fonts, weights), bold);
    margin-bottom: map.get(vars.$spacing, xs);

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
        transition: all 0.4s ease-out;
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
  }

  &.alert-error {
    background-color: rgba(231, 76, 60, 0.1);
    border-left: 4px solid #e74c3c;
  }

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      color: mixins.theme-color($theme, text-primary);
      transition: all 0.4s ease-out;
    }
  }
}

// Cards
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
    line-height: 1.6;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
        transition: all 0.4s ease-out;
      }
    }
  }

  &.danger-zone {
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        border-left: 4px solid #ff6b6b;
        transition: all 0.4s ease-out;
      }
    }

    .warning-box {
      display: flex;
      align-items: center;
      padding: map.get(vars.$spacing, m) map.get(vars.$spacing, l);
      margin-bottom: map.get(vars.$spacing, xl);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      background-color: rgba(255, 107, 107, 0.1);
      border: 1px solid rgba(255, 107, 107, 0.3);

      .warning-icon {
        font-size: 1.5rem;
        margin-right: map.get(vars.$spacing, m);
        color: #ff6b6b;
      }

      p {
        margin: 0;
        color: #ff6b6b;
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
      }
    }

    .delete-confirm-form {
      animation: fadeIn 0.3s ease-out;

      .legal-info-box {
        display: flex;
        align-items: flex-start;
        padding: map.get(vars.$spacing, m) map.get(vars.$spacing, l);
        margin-bottom: map.get(vars.$spacing, xl);
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);
        background: linear-gradient(135deg, rgba(52, 152, 219, 0.08), rgba(52, 152, 219, 0.03));
        border: 1px solid rgba(52, 152, 219, 0.2);

        .info-icon {
          font-size: 1.2rem;
          margin-right: map.get(vars.$spacing, m);
          color: #3498db;
          flex-shrink: 0;
        }

        .info-content {
          flex: 1;

          strong {
            display: block;
            margin-bottom: map.get(vars.$spacing, xxs);
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-primary);
              }
            }
          }

          p {
            margin: 0;
            font-size: map.get(map.get(vars.$fonts, sizes), small);
            line-height: 1.6;
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-secondary);
              }
            }
          }
        }
      }

      .delete-reason-group {
        margin-bottom: map.get(vars.$spacing, xl);

        label {
          font-size: map.get(map.get(vars.$fonts, sizes), base);
          margin-bottom: map.get(vars.$spacing, m);
          display: block;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }

        .modern-textarea-wrapper {
          position: relative;
          max-width: 100%;
          margin-bottom: map.get(vars.$spacing, s);

          .modern-textarea {
            width: 100%;
            min-height: 150px;
            padding: map.get(vars.$spacing, l);
            border-radius: map.get(map.get(vars.$layout, border-radius), large);
            resize: none;
            font-size: map.get(map.get(vars.$fonts, sizes), base);
            line-height: 1.7;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background: linear-gradient(
                  135deg,
                  mixins.theme-color($theme, secondary-bg),
                  color.adjust(mixins.theme-color($theme, secondary-bg), $lightness: -2%)
                );
                border: 2px solid mixins.theme-color($theme, border-light);
                color: mixins.theme-color($theme, text-primary);
                box-shadow: 0 4px 20px rgba(0, 0, 0, if($theme == 'dark', 0.2, 0.05));

                &::placeholder {
                  color: mixins.theme-color($theme, text-tertiary);
                  opacity: 0.8;
                }

                &:focus {
                  border-color: #ff6b6b;
                  transform: translateY(-2px);
                  box-shadow: 
                    0 8px 30px rgba(255, 107, 107, 0.15),
                    0 0 0 3px rgba(255, 107, 107, 0.1);
                }

                &:hover:not(:focus):not(:disabled) {
                  border-color: color.adjust(mixins.theme-color($theme, border-light), $lightness: -10%);
                  box-shadow: 0 6px 25px rgba(0, 0, 0, if($theme == 'dark', 0.25, 0.08));
                }

                &:disabled {
                  opacity: 0.6;
                  cursor: not-allowed;
                  transform: none;
                }
              }
            }
          }

          .textarea-decoration {
            position: absolute;
            bottom: -10px;
            right: 20px;
            display: flex;
            align-items: center;
            pointer-events: none;
            opacity: 0;
            transform: translateX(-10px);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

            .decoration-line {
              width: 30px;
              height: 2px;
              background: linear-gradient(90deg, transparent, #ff6b6b);
              margin-right: 8px;
            }

            .decoration-dot {
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: #ff6b6b;
              animation: pulse 2s infinite;
            }
          }

          &:focus-within .textarea-decoration {
            opacity: 1;
            transform: translateX(0);
          }
        }
      }

      .confirm-group {
        margin-bottom: map.get(vars.$spacing, xl);
        padding: map.get(vars.$spacing, m);
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
          }
        }
      }
    }
  }
}

// Forms
.settings-form {
  max-width: 600px;

  .form-group {
    margin-bottom: map.get(vars.$spacing, l);

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

      input {
        width: 100%;
        border: none;
        background: transparent;
        padding: map.get(vars.$spacing, m);
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);
        font-family: inherit;

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
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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

    .checkbox-label {
      display: flex;
      align-items: flex-start;
      cursor: pointer;
      user-select: none;

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
        margin-top: 2px;
        cursor: pointer;
        accent-color: #ff6b6b;
        flex-shrink: 0;

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      span {
        flex: 1;
        line-height: 1.5;
      }
    }
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: map.get(vars.$spacing, m);
    margin-top: map.get(vars.$spacing, xl);

    button {
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



    .save-button {
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, primary);
          color: white;
          transition: all 0.4s ease-out;

          &:hover:not(:disabled) {
            transform: translateY(-3px);
          }
          @include mixins.shadow('medium', $theme);
        }
      }
    }
  }
}

// Danger button
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
}

    .cancel-buttonPW {
  padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
  border-radius: map.get(map.get(vars.$layout, border-radius), medium);
  font-weight: map.get(map.get(vars.$fonts, weights), medium);
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  transition: all 0.3s ease;

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, secondary-bg);
      color: mixins.theme-color($theme, text-primary);
      border: 1px solid mixins.theme-color($theme, border-light);
      transition: all 0.4s ease-out;

      &:hover:not(:disabled) {
        background-color: mixins.theme-color($theme, hover-color);
        border-color: mixins.theme-color($theme, border-medium);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// Animations
@keyframes spin {
  to { transform: rotate(360deg); }
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
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}
</style>