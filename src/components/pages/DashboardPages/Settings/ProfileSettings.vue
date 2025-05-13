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
        <div 
          class="avatar-preview" 
          :class="{ 'drag-active': isDragging }"
          @dragenter.prevent="onDragOver"
          @dragover.prevent="onDragOver"
          @dragleave.prevent="onDragLeave"
          @drop.prevent="onDrop"
          @click="triggerFileInput"
        >
          <img v-if="profileForm.avatarUrl" :src="profileForm.avatarUrl" alt="Profilbild" class="avatar-image" />
          <span v-else class="avatar-placeholder">{{ getInitials(profileForm.firstName, profileForm.lastName) }}</span>
          
          <input 
            type="file" 
            ref="fileInput" 
            @change="handleFileChange" 
            accept="image/*" 
            class="file-input" 
          />
          
          <button type="button" class="change-avatar-btn" title="Profilbild ändern" @click.stop="triggerFileInput">
            <span v-if="isUploading" class="loading-spinner avatar-spinner"></span>
            <span v-else>📷</span>
          </button>
          
          <div v-if="isDragging" class="drop-overlay">
            <span>Bild hier ablegen</span>
          </div>
        </div>
        <p v-if="profileForm.avatarUrl" class="avatar-actions">
          <button type="button" class="text-button" @click="removeAvatar">Profilbild entfernen</button>
        </p>
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
        <button type="submit" class="save-button" :disabled="isSaving || isUploading">
          <span v-if="isSaving" class="loading-spinner"></span>
          <span v-else class="button-icon">💾</span> Speichern
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, watch, onMounted } from 'vue';
import { cloudinaryUpload, cloudinaryDelete } from '@/services/cloudinaryService';

interface ProfileForm {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
  avatarUrl: string;
  avatarPublicId: string | null;
}

export default defineComponent({
  name: 'ProfileSettings',
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
  emits: ['reset-form', 'save-profile', 'update:showSuccess', 'update:showError'],
  setup(props, { emit }) {
    // Status für Formularprozesse
    const isSaving = ref(false);
    const isUploading = ref(false);
    const saveSuccess = ref(props.showSuccess);
    const saveError = ref(props.showError);
    const errorMessage = ref(props.errorMsg);
    const fileInput = ref<HTMLInputElement | null>(null);
    const isDragging = ref(false);
    
    // Profilformular mit neuem Bild-URL-Feld
    const profileForm = ref<ProfileForm>({
      firstName: 'Max',
      lastName: 'Mustermann',
      username: 'max.mustermann',
      email: 'max@example.com',
      phone: '+49 123 456789',
      bio: 'Vater von zwei Kindern (4 und 7 Jahre). Interesse an Erziehungsmethoden und kindlicher Entwicklung.',
      avatarUrl: '',
      avatarPublicId: null
    });
    
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

    // Initialen für Avatar-Platzhalter generieren
    const getInitials = (firstName: string, lastName: string): string => {
      return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    };

    // Datei-Upload-Funktionen
    const triggerFileInput = (): void => {
      if (fileInput.value) {
        fileInput.value.click();
      }
    };
    
    const handleFileChange = async (event: Event): Promise<void> => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        await uploadFile(target.files[0]);
      }
    };
    
    const onDragOver = (event: DragEvent): void => {
      isDragging.value = true;
    };
    
    const onDragLeave = (event: DragEvent): void => {
      isDragging.value = false;
    };
    
    const onDrop = async (event: DragEvent): Promise<void> => {
      isDragging.value = false;
      if (event.dataTransfer && event.dataTransfer.files.length > 0) {
        const file = event.dataTransfer.files[0];
        if (file.type.startsWith('image/')) {
          await uploadFile(file);
        } else {
          errorMessage.value = 'Bitte nur Bilder hochladen.';
          saveError.value = true;
          setTimeout(() => {
            saveError.value = false;
          }, 3000);
        }
      }
    };
    
    const uploadFile = async (file: File): Promise<void> => {
      try {
        isUploading.value = true;
        saveError.value = false;
        
        // Wenn es ein vorheriges Bild gibt, löschen wir es
        if (profileForm.value.avatarPublicId) {
          await cloudinaryDelete(profileForm.value.avatarPublicId);
        }
        
        // Hochladen des neuen Bildes
        const result = await cloudinaryUpload(file, 'profile_avatars', profileForm.value.username);
        
        profileForm.value.avatarUrl = result.secureUrl;
        profileForm.value.avatarPublicId = result.publicId;
        
        saveSuccess.value = true;
        setTimeout(() => {
          saveSuccess.value = false;
        }, 3000);
      } catch (error) {
        saveError.value = true;
        errorMessage.value = 'Fehler beim Hochladen des Bildes. Bitte versuche es erneut.';
      } finally {
        isUploading.value = false;
      }
    };
    
    const removeAvatar = async (): Promise<void> => {
      try {
        if (!profileForm.value.avatarPublicId) return;
        
        isUploading.value = true;
        await cloudinaryDelete(profileForm.value.avatarPublicId);
        
        profileForm.value.avatarUrl = '';
        profileForm.value.avatarPublicId = null;
        
        saveSuccess.value = true;
        setTimeout(() => {
          saveSuccess.value = false;
        }, 3000);
      } catch (error) {
        saveError.value = true;
        errorMessage.value = 'Fehler beim Entfernen des Bildes. Bitte versuche es erneut.';
      } finally {
        isUploading.value = false;
      }
    };

    // Profilformular zurücksetzen
    const resetProfileForm = (): void => {
      emit('reset-form', 'profile');
    };

    // Profil speichern
    const saveProfileSettings = async (): Promise<void> => {
      isSaving.value = true;
      // Cloudinary-Bild-Informationen in Formulardaten einschließen
      emit('save-profile', profileForm.value);
      setTimeout(() => {
        isSaving.value = false;
      }, 1000);
    };

    return {
      profileForm,
      isSaving,
      isUploading,
      saveSuccess,
      saveError,
      errorMessage,
      fileInput,
      isDragging,
      getInitials,
      resetProfileForm,
      saveProfileSettings,
      triggerFileInput,
      handleFileChange,
      onDragOver,
      onDragLeave,
      onDrop,
      removeAvatar
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
          transition: all 0.4s ease-out;
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
          transition: all 0.4s ease-out;

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
        resize: none;
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

    .character-count {
      position: absolute;
      right: 10px;
      bottom: 10px;
      font-size: map.get(map.get(vars.$fonts, sizes), small);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-tertiary);
          transition: all 0.4s ease-out;

          &.warning {
            color: #f39c12;
          }

          &.error {
            color: #e74c3c;
          }
        }
      }
    }
  }

  // Profilavatar mit Drag and Drop
  .profile-avatar {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: map.get(vars.$spacing, xl);

    .avatar-preview {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      overflow: hidden;
      transition: all 0.3s ease;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          border: 3px solid mixins.theme-color($theme, accent-green);
          transition: all 0.4s ease-out;

          &:hover {
            background-color: mixins.theme-color($theme, hover-color);
          }
        }
      }

      &.drag-active {
        transform: scale(1.05);
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
        border-style: dashed;
        transition: all 0.2s ease;
      }

      .avatar-placeholder {
        font-size: 3rem;
        font-weight: map.get(map.get(vars.$fonts, weights), bold);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
            transition: all 0.4s ease-out;
          }
        }
      }

      .avatar-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .file-input {
        display: none;
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
        z-index: 2;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: mixins.theme-gradient($theme, primary);
            color: white;
            transition: all 0.4s ease-out;

            &:hover {
              transform: translateY(-2px);
              @include mixins.shadow('small', $theme);
            }
          }
        }

        .avatar-spinner {
          width: 14px;
          height: 14px;
          border-width: 2px;
        }
      }

      .drop-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        font-size: 0.9rem;
        border-radius: 50%;
        text-align: center;
        z-index: 1;
        pointer-events: none; /* Verhindert, dass das Overlay Drag-Events abfängt */
      }
    }

    .avatar-actions {
      margin-top: map.get(vars.$spacing, m);
      font-size: map.get(map.get(vars.$fonts, sizes), small);

      .text-button {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        text-decoration: underline;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, accent-teal);
            
            &:hover {
              color: mixins.theme-color($theme, accent-green);
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
          transition: all 0.4s ease-out;

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

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    }
  }
}
</style>