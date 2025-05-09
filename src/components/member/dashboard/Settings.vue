<!-- src/components/member/dashboard/Settings.vue -->
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
        <span class="tab-icon">{{ tab.icon }}</span>
        <span>{{ tab.name }}</span>
      </button>
    </div>

    <!-- Profileinstellungen -->
    <div v-if="activeTab === 'profile'" class="settings-section profile-settings">
      <h3>Profil bearbeiten</h3>
      <p class="section-description">Aktualisiere deine persönlichen Informationen</p>

      <!-- Erfolgsmeldung -->
      <div v-if="saveSuccess" class="alert alert-success">
        <span class="alert-icon">✓</span>
        <span>Deine Profileinstellungen wurden erfolgreich gespeichert!</span>
      </div>

      <!-- Fehlermeldung -->
      <div v-if="saveError" class="alert alert-error">
        <span class="alert-icon">⚠️</span>
        <span>{{ errorMessage }}</span>
      </div>

      <form @submit.prevent="saveProfileSettings" class="settings-form">
        <div class="form-group profile-avatar">
          <div class="avatar-preview">
            <span class="avatar-placeholder">{{ getInitials(profileForm.firstName, profileForm.lastName) }}</span>
            <button type="button" class="change-avatar-btn" title="Profilbild ändern">📷</button>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="first-name" class="readonly-label">
              <span>Vorname</span>
              <span class="lock-icon" title="Nicht editierbar">🔒</span>
            </label>
            <div class="input-container readonly">
              <input type="text" id="first-name" v-model="profileForm.firstName" disabled class="readonly-field" />
            </div>
          </div>

          <div class="form-group">
            <label for="last-name" class="readonly-label">
              <span>Nachname</span>
              <span class="lock-icon" title="Nicht editierbar">🔒</span>
            </label>
            <div class="input-container readonly">
              <input type="text" id="last-name" v-model="profileForm.lastName" disabled class="readonly-field" />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="username">Benutzername</label>
          <div class="input-container">
            <input type="text" id="username" v-model="profileForm.username" required class="editable-field"
              data-field="username" />
          </div>
        </div>

        <div class="form-group">
          <label for="email">E-Mail</label>
          <div class="input-container">
            <input type="email" id="email" v-model="profileForm.email" required class="editable-field"
              data-field="email" />
          </div>
        </div>

        <div class="form-group">
          <label for="phone">Telefonnummer</label>
          <div class="input-container">
            <input type="tel" id="phone" v-model="profileForm.phone" placeholder="+49 123 456789" class="editable-field"
              data-field="phone" />
          </div>
          <span class="help-text">Ihre Telefonnummer im internationalen Format (optional)</span>
        </div>

        <div class="form-group">
          <label for="bio">Über mich</label>
          <div class="input-container">
            <textarea id="bio" v-model="profileForm.bio" rows="4" class="editable-field" data-field="bio"></textarea>
          </div>
          <span class="help-text">Kurze Beschreibung über dich (max. 200 Zeichen)</span>
          <span v-if="profileForm.bio" class="character-count"
            :class="{ warning: profileForm.bio.length > 180, error: profileForm.bio.length > 200 }">
            {{ profileForm.bio.length }}/200
          </span>
        </div>

        <div class="form-actions">
          <button type="button" class="cancel-button" @click="resetProfileForm">
            <span class="button-icon">↩️</span> Zurücksetzen
          </button>
          <button type="submit" class="save-button" :disabled="isSaving">
            <span v-if="isSaving" class="loading-spinner"></span>
            <span v-else class="button-icon">💾</span> Speichern
          </button>
        </div>
      </form>
    </div>

    <!-- Konto-Einstellungen -->
    <div v-if="activeTab === 'account'" class="settings-section account-settings">
      <h3>Kontoeinstellungen</h3>
      <p class="section-description">Verwalte dein Passwort und deine Kontoeinstellungen</p>

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

    <!-- Benachrichtigungseinstellungen -->
    <div v-if="activeTab === 'notifications'" class="settings-section notification-settings">
      <h3>Benachrichtigungseinstellungen</h3>
      <p class="section-description">Lege fest, welche Benachrichtigungen du erhalten möchtest</p>

      <div class="settings-card">
        <form @submit.prevent="saveNotificationSettings" class="settings-form">
          <div class="settings-form-grid">
            <div v-for="(setting, index) in notificationSettings" :key="index" class="setting-item">
              <div class="setting-info">
                <h4>{{ setting.name }}</h4>
                <p>{{ setting.description }}</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="setting.enabled">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="save-button" :disabled="isSaving">
              <span v-if="isSaving" class="loading-spinner"></span>
              <span v-else>Speichern</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Design-Einstellungen -->
    <div v-if="activeTab === 'appearance'" class="settings-section appearance-settings">
      <h3>Design & Darstellung</h3>
      <p class="section-description">Passe das Erscheinungsbild an deine Vorlieben an</p>

      <div class="settings-card">
        <h4>Farbschema</h4>
        <div class="theme-selection">
          <label class="theme-option">
            <input type="radio" name="theme" value="light" v-model="appearanceSettings.theme" />
            <div class="theme-preview light-theme">
              <div class="theme-icon">☀️</div>
              <div class="theme-label">Hell</div>
            </div>
          </label>

          <label class="theme-option">
            <input type="radio" name="theme" value="dark" v-model="appearanceSettings.theme" />
            <div class="theme-preview dark-theme">
              <div class="theme-icon">🌙</div>
              <div class="theme-label">Dunkel</div>
            </div>
          </label>
        </div>

        <h4>Schriftgröße</h4>
        <div class="font-size-selection">
          <div class="font-size-slider">
            <input type="range" min="1" max="5" step="1" v-model="appearanceSettings.fontSize" />
            <div class="font-size-labels">
              <span>A</span>
              <span>A</span>
              <span>A</span>
              <span>A</span>
              <span>A</span>
            </div>
          </div>
          <div class="font-size-preview" :style="{ fontSize: getFontSizePreview() }">
            Beispieltext
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="save-button" @click="saveAppearanceSettings" :disabled="isSaving">
            <span v-if="isSaving" class="loading-spinner"></span>
            <span v-else>Speichern</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Datenschutzeinstellungen -->
    <div v-if="activeTab === 'privacy'" class="settings-section privacy-settings">
      <h3>Datenschutz & Cookies</h3>
      <p class="section-description">Verwalte deine Datenschutzeinstellungen und Cookie-Präferenzen</p>

      <div class="settings-card">
        <form @submit.prevent="savePrivacySettings" class="settings-form">
          <div class="settings-form-grid">
            <div v-for="(setting, index) in privacySettings" :key="index" class="setting-item">
              <div class="setting-info">
                <h4>{{ setting.name }}</h4>
                <p>{{ setting.description }}</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="setting.enabled">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="cookie-settings">
            <h4>Cookie-Einstellungen</h4>
            <p>Wähle aus, welche Arten von Cookies du akzeptieren möchtest.</p>

            <div class="cookie-option">
              <label class="checkbox-label">
                <input type="checkbox" v-model="privacySettings[0].cookieOptions!.necessary" disabled checked />
                <span>Notwendige Cookies</span>
              </label>
              <p>Diese Cookies sind für das Funktionieren der Website unerlässlich und können nicht deaktiviert werden.
              </p>
            </div>

            <div class="cookie-option">
              <label class="checkbox-label">
                <input type="checkbox" v-model="privacySettings[0].cookieOptions!.preferences" />
                <span>Präferenz-Cookies</span>
              </label>
              <p>Diese Cookies ermöglichen es der Website, deine Einstellungen zu speichern (z.B. Spracheinstellungen).
              </p>
            </div>

            <div class="cookie-option">
              <label class="checkbox-label">
                <input type="checkbox" v-model="privacySettings[0].cookieOptions!.statistics" />
                <span>Statistik-Cookies</span>
              </label>
              <p>Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren.</p>
            </div>

            <div class="cookie-option">
              <label class="checkbox-label">
                <input type="checkbox" v-model="privacySettings[0].cookieOptions!.marketing" />
                <span>Marketing-Cookies</span>
              </label>
              <p>Diese Cookies werden verwendet, um Besuchern relevante Werbung zu zeigen.</p>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="save-button" :disabled="isSaving">
              <span v-if="isSaving" class="loading-spinner"></span>
              <span v-else>Speichern</span>
            </button>
          </div>
        </form>
      </div>
    </div>

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
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

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
interface NotificationSetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface CookieOptions {
  necessary: boolean;
  preferences: boolean;
  statistics: boolean;
  marketing: boolean;
}

interface PrivacySetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  cookieOptions?: CookieOptions;
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

interface TabItem {
  id: string;
  name: string;
  icon: string;
}

type ActionFunction = () => void;

export default defineComponent({
  name: 'SettingsDashboard',
  setup() {
    const router = useRouter();

    // Aktiver Tab
    const activeTab = ref('profile');
    const tabs = ref<TabItem[]>([
      { id: 'profile', name: 'Profil', icon: '👤' },
      { id: 'account', name: 'Konto', icon: '🔒' },
      { id: 'notifications', name: 'Benachrichtigungen', icon: '🔔' },
      { id: 'appearance', name: 'Design', icon: '🎨' },
      { id: 'privacy', name: 'Datenschutz', icon: '🔐' }
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

    // Profilformular mit neuer Telefonnummer
    const profileForm = ref<ProfileForm>({
      firstName: 'Max',
      lastName: 'Mustermann',
      username: 'max.mustermann',
      email: 'max@example.com',
      phone: '+49 123 456789', // Neues Feld für Telefonnummer
      bio: 'Vater von zwei Kindern (4 und 7 Jahre). Interesse an Erziehungsmethoden und kindlicher Entwicklung.'
    });

    // Original-Profilformular zur Wiederherstellung
    const originalProfileForm = ref<ProfileForm>({ ...profileForm.value });

    // Passwortformular
    const passwordForm = ref<PasswordForm>({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    // Benachrichtigungseinstellungen
    const notificationSettings = ref<NotificationSetting[]>([
      {
        id: 'email_notifications',
        name: 'E-Mail-Benachrichtigungen',
        description: 'Erhalte wichtige Benachrichtigungen per E-Mail.',
        enabled: true
      },
      {
        id: 'browser_notifications',
        name: 'Browser-Benachrichtigungen',
        description: 'Erlaube Benachrichtigungen im Browser.',
        enabled: false
      },
      {
        id: 'article_recommendations',
        name: 'Artikelempfehlungen',
        description: 'Benachrichtigungen für personalisierte Artikelempfehlungen.',
        enabled: true
      },
      {
        id: 'comment_notifications',
        name: 'Kommentar-Benachrichtigungen',
        description: 'Benachrichtigungen für Kommentare auf deine Artikel oder Beiträge.',
        enabled: true
      },
      {
        id: 'friend_requests',
        name: 'Freundschaftsanfragen',
        description: 'Benachrichtigungen für neue Freundschaftsanfragen.',
        enabled: true
      },
      {
        id: 'system_announcements',
        name: 'Systemankündigungen',
        description: 'Wichtige Ankündigungen zu Neuerungen und Updates.',
        enabled: true
      }
    ]);

    // Erscheinungsbild-Einstellungen
    const appearanceSettings = ref<AppearanceSettings>({
      theme: localStorage.getItem('theme') || 'light',
      fontSize: 3 // Mittelgroß
    });

    // Datenschutzeinstellungen
    const privacySettings = ref<PrivacySetting[]>([
      {
        id: 'data_collection',
        name: 'Datenerfassung',
        description: 'Erlaube uns, Nutzungsdaten zu sammeln, um die Plattform zu verbessern.',
        enabled: true,
        cookieOptions: {
          necessary: true,
          preferences: true,
          statistics: true,
          marketing: false
        }
      },
      {
        id: 'profile_visibility',
        name: 'Profilsichtbarkeit',
        description: 'Mache dein Profil für andere Benutzer sichtbar.',
        enabled: true
      },
      {
        id: 'activity_tracking',
        name: 'Aktivitätsverfolgung',
        description: 'Erlaube uns, deine Aktivitäten auf der Plattform zu verfolgen, um personalisierte Empfehlungen zu geben.',
        enabled: true
      },
      {
        id: 'third_party_sharing',
        name: 'Datenweitergabe an Dritte',
        description: 'Erlaube die Weitergabe deiner Daten an vertrauenswürdige Drittanbieter.',
        enabled: false
      }
    ]);

    // Initialen für Avatar-Platzhalter generieren
    const getInitials = (firstName: string, lastName: string): string => {
      return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    };

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

    // Schriftgröße für Vorschau
    const getFontSizePreview = (): string => {
      const baseSize = 16;
      const multiplier = 0.85 + (appearanceSettings.value.fontSize * 0.15);
      return `${baseSize * multiplier}px`;
    };

    // Profilformular laden
    const loadProfileData = async (): Promise<void> => {
      try {
        // In einem echten Szenario: Daten vom Server laden
        // const response = await userService.getProfile();
        // profileForm.value = response.data;
        // originalProfileForm.value = {...response.data};

        // Für Beispielzwecke verwenden wir hart codierte Daten
        const userData = authService.getUserData();
        if (userData && userData.name) {
          const nameParts = userData.name.split(' ');
          if (nameParts.length > 1) {
            profileForm.value.firstName = nameParts[0];
            profileForm.value.lastName = nameParts.slice(1).join(' ');
          }
        }
        originalProfileForm.value = { ...profileForm.value };
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
          profileForm.value = { ...originalProfileForm.value };
        }
      );
    };

    // Profil speichern
    const saveProfileSettings = async (): Promise<void> => {
      try {
        isSaving.value = true;
        saveError.value = false;

        // Validierung der eingegebenen Daten
        if (!validateEmail(profileForm.value.email)) {
          throw new Error('Bitte gib eine gültige E-Mail-Adresse ein.');
        }

        if (profileForm.value.phone && !validatePhone(profileForm.value.phone)) {
          throw new Error('Bitte gib eine gültige Telefonnummer ein.');
        }

        // In einem echten Szenario: Daten zum Server senden
        // await userService.updateProfile(profileForm.value);

        // Für Beispielzwecke: Simulation einer API-Antwort
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Erfolgsfall
        originalProfileForm.value = { ...profileForm.value };
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
    const changePassword = async (): Promise<void> => {
      try {
        isSaving.value = true;
        saveError.value = false;

        // Validierung
        if (passwordForm.value.newPassword.length < 8) {
          throw new Error('Das Passwort muss mindestens 8 Zeichen lang sein.');
        }

        if (!passwordsMatch.value) {
          throw new Error('Die Passwörter stimmen nicht überein.');
        }

        // In einem echten Szenario: Passwort ändern
        // await userService.changePassword(passwordForm.value);

        // Für Beispielzwecke: Simulation einer API-Antwort
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Zurücksetzen des Formulars
        passwordForm.value = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };

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
    const saveNotificationSettings = async (): Promise<void> => {
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
    const saveAppearanceSettings = async (): Promise<void> => {
      try {
        isSaving.value = true;
        saveError.value = false;

        // Theme im localStorage speichern
        localStorage.setItem('theme', appearanceSettings.value.theme);

        // Event senden, um das Theme in der App zu ändern
        const event = new CustomEvent('theme-changed', {
          detail: { theme: appearanceSettings.value.theme }
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
    const savePrivacySettings = async (): Promise<void> => {
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

    // E-Mail-Validierung
    const validateEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    // Telefonnummer-Validierung
    const validatePhone = (phone: string): boolean => {
      // Einfache Validierung für internationale Telefonnummern
      const phoneRegex = /^\+?[0-9\s()-]{8,}$/;
      return phoneRegex.test(phone);
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
      profileForm,
      passwordForm,
      notificationSettings,
      appearanceSettings,
      privacySettings,
      isSaving,
      saveSuccess,
      saveError,
      errorMessage,
      passwordStrength,
      passwordsMatch,
      showConfirmDialog,
      confirmDialogTitle,
      confirmDialogMessage,
      confirmDialogAction,
      confirmDangerAction,
      getInitials,
      getFontSizePreview,
      getPasswordStrengthText,
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

  // Entfernte max-width um volle Breite zu nutzen
  // max-width: 1200px;
  // margin: 0 auto;

  .page-header {
    margin-bottom: map.get(vars.$spacing, l);

    h2 {
      font-size: map.get(map.get(vars.$fonts, sizes), xxl);
      font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
      margin-bottom: map.get(vars.$spacing, xs);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    p {
      font-size: map.get(map.get(vars.$fonts, sizes), medium);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
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
        }
      }
    }

    &.alert-error {
      background-color: rgba(231, 76, 60, 0.1);
      border-left: 4px solid #e74c3c;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
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
        font-size: 1.2rem;
      }
    }
  }

  // Einstellungsbereiche
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
      }
    }

    h4 {
      font-size: map.get(map.get(vars.$fonts, sizes), large);
      margin-bottom: map.get(vars.$spacing, m);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    p {
      margin-bottom: map.get(vars.$spacing, l);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }

    // Gefahrenzone (Konto löschen)
    &.danger-zone {
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          border-left: 4px solid #ff6b6b;
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

  // Profilformular
  .settings-form {
    max-width: 800px;
    margin: 0 auto;

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: map.get(vars.$spacing, l);

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

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
          }
        }

        &.readonly-label {
          display: flex;
          align-items: center;
          gap: 8px;

          .lock-icon {
            font-size: 12px;
            opacity: 0.7;
            cursor: help;
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

            &:focus-within {
              border-color: mixins.theme-color($theme, accent-teal);
              box-shadow: 0 0 0 3px rgba(mixins.theme-color($theme, accent-teal), 0.2);
            }

            &:not(.readonly):hover {
              border-color: mixins.theme-color($theme, border-medium);
            }

            &.readonly {
              background-color: mixins.theme-color($theme, hover-color);
              border: 1px dashed mixins.theme-color($theme, border-medium);
              opacity: 0.8;
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

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
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
          }
        }

        &.error-text {
          color: #e74c3c;
        }
      }

      .character-count {
        position: absolute;
        right: 10px;
        bottom: 10px;
        font-size: map.get(map.get(vars.$fonts, sizes), small);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-tertiary);

            &.warning {
              color: #f39c12;
            }

            &.error {
              color: #e74c3c;
            }
          }
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
            }
          }
        }

        .strength-text {
          font-size: map.get(map.get(vars.$fonts, sizes), small);

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-tertiary);
            }
          }
        }
      }
    }

    // Profilavatar
    .profile-avatar {
      display: flex;
      justify-content: center;
      margin-bottom: map.get(vars.$spacing, xl);

      .avatar-preview {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            border: 3px solid mixins.theme-color($theme, accent-green);
          }
        }

        .avatar-placeholder {
          font-size: 3rem;
          font-weight: map.get(map.get(vars.$fonts, weights), bold);

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }

        .change-avatar-btn {
          position: absolute;
          bottom: -10px;
          right: -10px;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background: mixins.theme-gradient($theme, primary);
              color: white;

              &:hover {
                transform: translateY(-2px);
                @include mixins.shadow('small', $theme);
              }
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

      .button-icon {
        margin-right: map.get(vars.$spacing, xxs);
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

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            &:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
          }
        }
      }

      .cancel-button {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            color: mixins.theme-color($theme, text-primary);
            border: 1px solid mixins.theme-color($theme, border-light);

            &:hover:not(:disabled) {
              background-color: mixins.theme-color($theme, hover-color);
            }
          }
        }
      }

      .save-button {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: mixins.theme-gradient($theme, primary);
            color: white;

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

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      }
    }
  }

  // Einstellungsraster (für Benachrichtigungen und Datenschutz)
  .settings-form-grid {
    display: flex;
    flex-direction: column;
    gap: map.get(vars.$spacing, l);
    margin-bottom: map.get(vars.$spacing, xl);

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: map.get(vars.$spacing, m);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          border-bottom: 1px solid mixins.theme-color($theme, border-light);

          &:last-child {
            border-bottom: none;
          }
        }
      }

      .setting-info {
        flex: 1;
        padding-right: map.get(vars.$spacing, l);

        h4 {
          margin-bottom: map.get(vars.$spacing, xxs);
          font-size: map.get(map.get(vars.$fonts, sizes), medium);
        }

        p {
          margin: 0;
          font-size: map.get(map.get(vars.$fonts, sizes), small);
        }
      }

      // Toggle-Switch
      .toggle-switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 26px;

        input {
          opacity: 0;
          width: 0;
          height: 0;

          &:checked+.toggle-slider {
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background-color: mixins.theme-color($theme, accent-green);
              }
            }
          }

          &:checked+.toggle-slider:before {
            transform: translateX(24px);
          }
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 34px;
          transition: .4s;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, border-medium);
            }
          }

          &:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 4px;
            bottom: 4px;
            border-radius: 50%;
            transition: .4s;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background-color: white;
              }
            }
          }
        }
      }
    }
  }

  // Theme-Auswahl
  .theme-selection {
    display: flex;
    gap: map.get(vars.$spacing, l);
    margin-bottom: map.get(vars.$spacing, xl);

    @media (max-width: 576px) {
      flex-direction: column;
    }

    .theme-option {
      flex: 1;
      cursor: pointer;

      input[type="radio"] {
        display: none;

        &:checked+.theme-preview {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              border-color: mixins.theme-color($theme, accent-green);
              box-shadow: 0 0 0 3px rgba(mixins.theme-color($theme, accent-green), 0.3);
            }
          }
        }
      }

      .theme-preview {
        height: 120px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);
        transition: all 0.3s;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            border: 2px solid mixins.theme-color($theme, border-light);
          }
        }

        &.light-theme {
          background-color: #f8fff9;
        }

        &.dark-theme {
          background-color: #0F2419;
        }

        .theme-icon {
          font-size: 2rem;
          margin-bottom: map.get(vars.$spacing, s);
        }

        .theme-label {
          display: flex;
          justify-content: center;
          width: 150px;
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
          background-color: rgba(0, 0, 0, 0.267);
          border-radius: 20px;
          padding: 0.5rem;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }
      }
    }
  }

  // Schriftgröße-Auswahl
  .font-size-selection {
    margin-bottom: map.get(vars.$spacing, xl);

    .font-size-slider {
      margin-bottom: map.get(vars.$spacing, m);
      position: relative;

      input[type="range"] {
        width: 100%;
        height: 4px;
        appearance: none;
        -webkit-appearance: none;
        border-radius: 2px;
        margin-bottom: map.get(vars.$spacing, m);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, border-light);

            &::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background: mixins.theme-color($theme, accent-teal);
              cursor: pointer;
            }

            &::-moz-range-thumb {
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background: mixins.theme-color($theme, accent-teal);
              cursor: pointer;
              border: none;
            }
          }
        }
      }

      .font-size-labels {
        display: flex;
        justify-content: space-between;

        span {
          &:nth-child(1) {
            font-size: 0.8rem;
          }

          &:nth-child(2) {
            font-size: 0.9rem;
          }

          &:nth-child(3) {
            font-size: 1rem;
          }

          &:nth-child(4) {
            font-size: 1.1rem;
          }

          &:nth-child(5) {
            font-size: 1.2rem;
          }

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-tertiary);
            }
          }
        }
      }
    }

    .font-size-preview {
      padding: map.get(vars.$spacing, m);
      text-align: center;
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          color: mixins.theme-color($theme, text-primary);
          border: 1px solid mixins.theme-color($theme, border-light);
        }
      }
    }
  }

  // Cookie-Einstellungen
  .cookie-settings {
    margin-top: map.get(vars.$spacing, xl);
    margin-bottom: map.get(vars.$spacing, l);

    .cookie-option {
      margin-bottom: map.get(vars.$spacing, m);

      .checkbox-label {
        display: flex;
        align-items: center;
        margin-bottom: map.get(vars.$spacing, xxs);
        cursor: pointer;

        input[type="checkbox"] {
          margin-right: map.get(vars.$spacing, s);
          width: 18px;
          height: 18px;

          &:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
        }

        span {
          font-weight: map.get(map.get(vars.$fonts, weights), medium);

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }
      }

      p {
        margin-left: calc(18px + #{map.get(vars.$spacing, s)});
        margin-bottom: map.get(vars.$spacing, s);
        font-size: map.get(map.get(vars.$fonts, sizes), small);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-tertiary);
          }
        }
      }
    }
  }

  /* Fortsetzung des CSS-Codes */

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

          @include mixins.shadow('large', $theme);

        }

      }

      h3 {

        font-size: map.get(map.get(vars.$fonts, sizes), xl);

        margin-bottom: map.get(vars.$spacing, m);

        @each $theme in ('light', 'dark') {

          .theme-#{$theme} & {

            color: mixins.theme-color($theme, text-primary);

          }

        }

      }

      p {

        margin-bottom: map.get(vars.$spacing, l);

        @each $theme in ('light', 'dark') {

          .theme-#{$theme} & {

            color: mixins.theme-color($theme, text-secondary);

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

              }

            }

          }

          &.confirm-button {

            @each $theme in ('light', 'dark') {

              .theme-#{$theme} & {

                background: mixins.theme-gradient($theme, primary);

                color: white;

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