<!-- src/components/pages/DashboardPages/Settings/ProfileSettings.vue -->
<template>
  <div class="settings-section profile-settings">
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
        <button type="button" class="cancel-button" @click="resetForm">
          <span class="button-icon">↩️</span> Zurücksetzen
        </button>
        <button type="submit" class="save-button" :disabled="isSaving">
          <span v-if="isSaving" class="loading-spinner"></span>
          <span v-else class="button-icon">💾</span> Speichern
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';

// Interface-Definition
interface ProfileForm {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
}

export default defineComponent({
  name: 'ProfileSettings',
  emits: ['confirm-dialog', 'save-success'],
  setup(props, { emit }) {
    // Status für Formularprozesse
    const isSaving = ref(false);
    const saveSuccess = ref(false);
    const saveError = ref(false);
    const errorMessage = ref('');

    // Profilformular
    const profileForm = ref<ProfileForm>({
      firstName: 'Max',
      lastName: 'Mustermann',
      username: 'max.mustermann',
      email: 'max@example.com',
      phone: '+49 123 456789',
      bio: 'Vater von zwei Kindern (4 und 7 Jahre). Interesse an Erziehungsmethoden und kindlicher Entwicklung.'
    });

    // Original-Profilformular zur Wiederherstellung
    const originalProfileForm = ref<ProfileForm>({ ...profileForm.value });

    // Initialen für Avatar-Platzhalter generieren
    const getInitials = (firstName: string, lastName: string): string => {
      return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    };

    // Profilformular laden
    const loadProfileData = async (): Promise<void> => {
      try {
        // In einem echten Szenario: Daten vom Server laden
        // Für Beispielzwecke verwenden wir hart codierte Daten
        originalProfileForm.value = { ...profileForm.value };
      } catch (error) {
        console.error('Fehler beim Laden der Profildaten:', error);
        errorMessage.value = 'Profildaten konnten nicht geladen werden.';
      }
    };

    // Profilformular zurücksetzen
    const resetForm = (): void => {
      emit('confirm-dialog', {
        title: 'Änderungen verwerfen',
        message: 'Möchtest du wirklich alle Änderungen verwerfen?',
        actionText: 'Verwerfen',
        action: () => {
          profileForm.value = { ...originalProfileForm.value };
        }
      });
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
        // Für Beispielzwecke: Simulation einer API-Antwort
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Erfolgsfall
        originalProfileForm.value = { ...profileForm.value };
        saveSuccess.value = true;
        emit('save-success');
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

    // Bei Komponentenerstellung Profildaten laden
    onMounted(() => {
      loadProfileData();
    });

    return {
      profileForm,
      isSaving,
      saveSuccess,
      saveError,
      errorMessage,
      getInitials,
      resetForm,
      saveProfileSettings
    };
  }
});
</script>