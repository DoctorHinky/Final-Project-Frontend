<!-- src/components/member/dashboard/SettingsNew.vue -->
<template>
  <div class="settings-dashboard">
    <div class="page-header">
      <h2>Einstellungen</h2>
      <p>Passe dein Konto und deine Erfahrung an</p>
    </div>

    <!-- Einstellungen-Tabs -->
    <div class="settings-tabs">
      <button v-for="(tab, index) in tabs" :key="index" class="tab-button" :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id">
        <component :is="tab.icon" class="tab-icon" />
        <span>{{ tab.name }}</span>
      </button>
    </div>

    <!-- Einzelne Einstellungs-Komponenten -->
    <profile-settings 
      v-if="activeTab === 'profile'" 
      :showSuccess="saveSuccess" 
      :showError="saveError" 
      :errorMsg="errorMessage"
      @reset-form="resetProfileForm"
      @save-profile="saveProfileSettings"
    />
    
    <account-settings 
      v-if="activeTab === 'account'" 
      :showSuccess="saveSuccess" 
      :showError="saveError" 
      :errorMsg="errorMessage"
      @delete-account="confirmDeleteAccount"
      @change-password="changePassword"
    />
    
    <notification-settings 
      v-if="activeTab === 'notifications'" 
      :showSuccess="saveSuccess" 
      :showError="saveError" 
      :errorMsg="errorMessage"
      @save-notifications="saveNotificationSettings"
    />
    
    <appearance-settings 
      v-if="activeTab === 'appearance'" 
      :showSuccess="saveSuccess" 
      :showError="saveError" 
      :errorMsg="errorMessage"
      @save-appearance="saveAppearanceSettings"
    />
    
    <privacy-settings 
      v-if="activeTab === 'privacy'" 
      :showSuccess="saveSuccess" 
      :showError="saveError" 
      :errorMsg="errorMessage"
      @save-privacy="savePrivacySettings"
    />

    <!-- Bestätigungsdialog -->
    <div v-if="showConfirmDialog" class="modal-backdrop" @click="cancelAction">
      <div class="confirm-dialog" @click.stop>
        <h3>{{ confirmDialogTitle }}</h3>
        <p>{{ confirmDialogMessage }}</p>
        <div class="dialog-actions">
          <button class="cancel-button" @click="cancelAction">Abbrechen</button>
          <button class="confirm-button" :class="{ danger: confirmDangerAction }" @click="confirmAction">
            {{ confirmDialogAction }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  UserIcon, 
  KeyIcon, 
  BellIcon, 
  PaintBrushIcon, 
  ShieldCheckIcon 
} from '@heroicons/vue/24/outline';

// Import der neuen Komponenten - alle aus der Barrel-Datei
import {
  ProfileSettings,
  AccountSettings,
  NotificationSettings,
  AppearanceSettings,
  PrivacySettings
} from '@/components/pages/DashboardPages/Settings';

// Dummy auth service für TypeScript-Kompatibilität
const authService = {
  logout: () => {
    // Dummy-Funktion
    console.log('User logged out');
  },
  getUserData: (): { name?: string } | null => {
    // Dummy-Funktion
    return { name: 'Max Mustermann' };
  }
};

// Interface-Definitionen
interface TabItem {
  id: string;
  name: string;
  icon: string;
}

interface ProfileForm {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface AppearanceSettings {
  theme: string;
  fontSize: number;
}

type ActionFunction = () => void;

export default defineComponent({
  name: 'SettingsDashboardNew',
  components: {
    ProfileSettings,
    AccountSettings,
    NotificationSettings,
    AppearanceSettings,
    PrivacySettings,
    UserIcon,
    KeyIcon,
    BellIcon,
    PaintBrushIcon,
    ShieldCheckIcon
  },
  setup() {
    const router = useRouter();

    // Aktiver Tab
    const activeTab = ref('profile');
    const tabs = ref<TabItem[]>([
      { id: 'profile', name: 'Profil', icon: 'UserIcon' },
      { id: 'account', name: 'Konto', icon: 'KeyIcon' },
      { id: 'notifications', name: 'Benachrichtigungen', icon: 'BellIcon' },
      { id: 'appearance', name: 'Design', icon: 'PaintBrushIcon' },
      { id: 'privacy', name: 'Datenschutz', icon: 'ShieldCheckIcon' }
    ]);

    // Bestätigungsdialog Funktionalität
    const showConfirmDialog = ref(false);
    const confirmDialogTitle = ref('');
    const confirmDialogMessage = ref('');
    const confirmDialogAction = ref('');
    const confirmDangerAction = ref(false);
    const pendingAction = ref<ActionFunction | null>(null);

    // Status für Formularprozesse
    const isSaving = ref(false);
    const saveSuccess = ref(false);
    const saveError = ref(false);
    const errorMessage = ref('');

    // Original-Daten
    const originalProfileForm = ref<ProfileForm>({
      firstName: 'Max',
      lastName: 'Mustermann',
      username: 'max.mustermann',
      email: 'max@example.com',
      phone: '+49 123 456789',
      bio: 'Vater von zwei Kindern (4 und 7 Jahre). Interesse an Erziehungsmethoden und kindlicher Entwicklung.'
    });

    // Profilformular laden
    const loadProfileData = async (): Promise<void> => {
      try {
        // In einem echten Szenario: Daten vom Server laden
        const userData = authService.getUserData();
        if (userData && userData.name) {
          const nameParts = userData.name.split(' ');
          if (nameParts.length > 1) {
            // In der neuen Struktur nicht direkt verfügbar
            // stattdessen würden wir Events verwenden
          }
        }
      } catch (error) {
        console.error('Fehler beim Laden der Profildaten:', error);
        errorMessage.value = 'Profildaten konnten nicht geladen werden.';
      }
    };

    // Profilformular zurücksetzen
    const resetProfileForm = (): void => {
      confirmDialog(
        'Änderungen verwerfen',
        'Möchtest du wirklich alle Änderungen verwerfen?',
        'Verwerfen',
        () => {
          // Wird jetzt in der ProfileSettings-Komponente behandelt
          console.log('Formular zurückgesetzt');
        }
      );
    };

    // Profil speichern
    const saveProfileSettings = async (profileData: ProfileForm): Promise<void> => {
      try {
        isSaving.value = true;
        saveError.value = false;

        // Validierung der eingegebenen Daten wird in der Unterkomponente durchgeführt

        // In einem echten Szenario: Daten zum Server senden
        // await userService.updateProfile(profileForm.value);

        // Für Beispielzwecke: Simulation einer API-Antwort
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Erfolgsfall
        originalProfileForm.value = { ...profileData };
        saveSuccess.value = true;
        setTimeout(() => {
          saveSuccess.value = false;
        }, 3000);

      } catch (error) {
        saveError.value = true;
        if (error instanceof Error) {
          errorMessage.value = error.message;
        } else {
          errorMessage.value = 'Profil konnte nicht gespeichert werden.';
        }
      } finally {
        isSaving.value = false;
      }
    };

    // Passwort ändern
    const changePassword = async (passwordData: PasswordForm): Promise<void> => {
      try {
        isSaving.value = true;
        saveError.value = false;

        // Validierung wird in der Unterkomponente durchgeführt

        // In einem echten Szenario: Passwort ändern
        // await userService.changePassword(passwordForm.value);

        // Für Beispielzwecke: Simulation einer API-Antwort
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Erfolgsanzeige
        saveSuccess.value = true;
        setTimeout(() => {
          saveSuccess.value = false;
        }, 3000);

      } catch (error) {
        saveError.value = true;
        if (error instanceof Error) {
          errorMessage.value = error.message;
        } else {
          errorMessage.value = 'Passwort konnte nicht geändert werden.';
        }
      } finally {
        isSaving.value = false;
      }
    };

    // Benachrichtigungseinstellungen speichern
    const saveNotificationSettings = async (notificationSettings: any): Promise<void> => {
      try {
        isSaving.value = true;
        saveError.value = false;

        // In einem echten Szenario: Daten zum Server senden
        // await userService.updateNotificationSettings(notificationSettings.value);

        // Für Beispielzwecke: Simulation einer API-Antwort
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Erfolgsanzeige
        saveSuccess.value = true;
        setTimeout(() => {
          saveSuccess.value = false;
        }, 3000);

      } catch (error) {
        saveError.value = true;
        if (error instanceof Error) {
          errorMessage.value = error.message;
        } else {
          errorMessage.value = 'Benachrichtigungseinstellungen konnten nicht gespeichert werden.';
        }
      } finally {
        isSaving.value = false;
      }
    };

    // Design-Einstellungen speichern
    const saveAppearanceSettings = async (appearanceSettings: AppearanceSettings): Promise<void> => {
      try {
        isSaving.value = true;
        saveError.value = false;

        // Theme im localStorage speichern
        localStorage.setItem('theme', appearanceSettings.theme);

        // Event senden, um das Theme in der App zu ändern
        const event = new CustomEvent('theme-changed', {
          detail: { theme: appearanceSettings.theme }
        });
        window.dispatchEvent(event);

        // In einem echten Szenario: Weitere Einstellungen zum Server senden
        // await userService.updateAppearanceSettings(appearanceSettings.value);

        // Für Beispielzwecke: Simulation einer API-Antwort
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Erfolgsanzeige
        saveSuccess.value = true;
        setTimeout(() => {
          saveSuccess.value = false;
        }, 3000);

      } catch (error) {
        saveError.value = true;
        if (error instanceof Error) {
          errorMessage.value = error.message;
        } else {
          errorMessage.value = 'Design-Einstellungen konnten nicht gespeichert werden.';
        }
      } finally {
        isSaving.value = false;
      }
    };

    // Datenschutzeinstellungen speichern
    const savePrivacySettings = async (privacySettings: any): Promise<void> => {
      try {
        isSaving.value = true;
        saveError.value = false;

        // In einem echten Szenario: Daten zum Server senden
        // await userService.updatePrivacySettings(privacySettings.value);

        // Für Beispielzwecke: Simulation einer API-Antwort
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Erfolgsanzeige
        saveSuccess.value = true;
        setTimeout(() => {
          saveSuccess.value = false;
        }, 3000);

      } catch (error) {
        saveError.value = true;
        if (error instanceof Error) {
          errorMessage.value = error.message;
        } else {
          errorMessage.value = 'Datenschutzeinstellungen konnten nicht gespeichert werden.';
        }
      } finally {
        isSaving.value = false;
      }
    };

    // Konto löschen bestätigen
    const confirmDeleteAccount = (): void => {
      confirmDialog(
        'Konto löschen',
        'Bist du sicher, dass du dein Konto löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden und alle deine Daten werden permanent gelöscht.',
        'Konto löschen',
        deleteAccount,
        true
      );
    };

    // Konto löschen
    const deleteAccount = async (): Promise<void> => {
      try {
        isSaving.value = true;

        // In einem echten Szenario: Konto löschen
        // await userService.deleteAccount();

        // Für Beispielzwecke: Simulation einer API-Antwort
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Benutzer ausloggen und zur Startseite weiterleiten
        authService.logout();
        router.push('/');

      } catch (error) {
        saveError.value = true;
        if (error instanceof Error) {
          errorMessage.value = error.message;
        } else {
          errorMessage.value = 'Konto konnte nicht gelöscht werden.';
        }
        isSaving.value = false;
      }
    };

    // Bestätigungsdialog anzeigen
    const confirmDialog = (
      title: string,
      message: string,
      actionText: string,
      action: ActionFunction,
      isDangerAction = false
    ): void => {
      confirmDialogTitle.value = title;
      confirmDialogMessage.value = message;
      confirmDialogAction.value = actionText;
      confirmDangerAction.value = isDangerAction;
      pendingAction.value = action;
      showConfirmDialog.value = true;
    };

    // Aktion bestätigen
    const confirmAction = (): void => {
      if (pendingAction.value) {
        pendingAction.value();
        pendingAction.value = null;
      }
      showConfirmDialog.value = false;
    };

    // Aktion abbrechen
    const cancelAction = (): void => {
      pendingAction.value = null;
      showConfirmDialog.value = false;
    };

    // Bei Komponentenerstellung Profildaten laden
    onMounted(() => {
      loadProfileData();
    });

    return {
      activeTab,
      tabs,
      isSaving,
      saveSuccess,
      saveError,
      errorMessage,
      showConfirmDialog,
      confirmDialogTitle,
      confirmDialogMessage,
      confirmDialogAction,
      confirmDangerAction,
      resetProfileForm,
      saveProfileSettings,
      changePassword,
      saveNotificationSettings,
      saveAppearanceSettings,
      savePrivacySettings,
      confirmDeleteAccount,
      confirmAction,
      cancelAction
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use 'sass:color';
@use '@/style/base/animations' as animations;

.settings-dashboard {
  @include animations.fade-in(0.5s);
  display: flex;
  flex-direction: column;
  gap: map.get(vars.$spacing, l);

  .page-header {
    margin-bottom: map.get(vars.$spacing, l);

    h2 {
      font-size: map.get(map.get(vars.$fonts, sizes), xxl);
      font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
      margin-bottom: map.get(vars.$spacing, xs);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
          transition: all 0.4s ease-out;
        }
      }
    }

    p {
      font-size: map.get(map.get(vars.$fonts, sizes), medium);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
          transition: all 0.4s ease-out;
        }
      }
    }
  }

  // Tabs für Einstellungsbereiche
  .settings-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: map.get(vars.$spacing, s);
    margin-bottom: map.get(vars.$spacing, xl);

    .tab-button {
      padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      cursor: pointer;
      transition: all 0.3s;
      border: none;
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, s);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          color: mixins.theme-color($theme, text-secondary);
          transition: all 0.4s ease-out;

          &:hover {
            background-color: mixins.theme-color($theme, hover-color);
          }

          &.active {
            background: mixins.theme-gradient($theme, primary);
            color: white;
          }
        }
      }

      .tab-icon {
        width: 1.25rem;
        height: 1.25rem;
      }
    }
  }

  /* Bestätigungsdialog-Styles */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;

    .confirm-dialog {
      width: 90%;
      max-width: 500px;
      padding: map.get(vars.$spacing, xl);
      border-radius: map.get(map.get(vars.$layout, border-radius), large);
      position: relative;
      @include animations.fade-in(0.3s);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, card-bg);
          transition: all 0.4s ease-out;
          @include mixins.shadow('large', $theme);
        }
      }

      h3 {
        font-size: map.get(map.get(vars.$fonts, sizes), xl);
        margin-bottom: map.get(vars.$spacing, m);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            transition: all 0.4s ease-out;
            color: mixins.theme-color($theme, text-primary);
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

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: map.get(vars.$spacing, m);

        button {
          padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
          border-radius: map.get(map.get(vars.$layout, border-radius), medium);
          font-weight: map.get(map.get(vars.$fonts, weights), medium);
          cursor: pointer;
          border: none;

          &.cancel-button {
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background-color: mixins.theme-color($theme, secondary-bg);
                color: mixins.theme-color($theme, text-primary);
                border: 1px solid mixins.theme-color($theme, border-light);
                transition: all 0.4s ease-out;
              }
            }
          }

          &.confirm-button {
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background: mixins.theme-gradient($theme, primary);
                color: white;
                transition: all 0.4s ease-out;

                &.danger {
                  background-color: #ff6b6b;
                  background-image: none;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>