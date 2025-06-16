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

    <!-- Lade-Indikator -->
    <div v-if="isLoadingProfile" class="loading-container">
      <span class="loading-spinner"></span>
      <span>Profildaten werden geladen...</span>
    </div>

    <form v-else @submit.prevent="saveProfileSettings" class="settings-form">
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
          <img
            v-if="profileForm.profilePicture"
            :src="profileForm.profilePicture"
            alt="Profilbild"
            class="avatar-image"
          />
          <span v-else class="avatar-placeholder">{{ getInitials(profileForm.firstname, profileForm.lastname) }}</span>

          <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" class="file-input" />

          <button type="button" class="change-avatar-btn" title="Profilbild ändern" @click.stop="triggerFileInput">
            <span v-if="isUploading" class="loading-spinner avatar-spinner"></span>
            <span v-else>📷</span>
          </button>

          <div v-if="isDragging" class="drop-overlay">
            <span>Bild hier ablegen</span>
          </div>
        </div>
        <p v-if="profileForm.profilePicture" class="avatar-actions">
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
            <input type="text" id="first-name" v-model="profileForm.firstname" disabled class="readonly-field" />
          </div>
        </div>

        <div class="form-group">
          <label for="last-name" class="readonly-label">
            <span>Nachname</span>
            <span class="lock-icon" title="Nicht editierbar">🔒</span>
          </label>
          <div class="input-container readonly">
            <input type="text" id="last-name" v-model="profileForm.lastname" disabled class="readonly-field" />
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="username">Benutzername</label>
        <div class="input-container">
          <input
            type="text"
            id="username"
            v-model="profileForm.username"
            required
            class="editable-field"
            data-field="username"
            :disabled="!isUsernameEditable"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="email">E-Mail</label>
        <div class="input-container">
          <input
            type="email"
            id="email"
            v-model="profileForm.email"
            required
            class="editable-field"
            data-field="email"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="phone">Telefonnummer</label>
        <div class="input-container">
          <input
            type="tel"
            id="phone"
            v-model="profileForm.phone"
            placeholder="+49 123 456789"
            class="editable-field"
            data-field="phone"
          />
        </div>
        <span class="help-text">Ihre Telefonnummer im internationalen Format (optional)</span>
      </div>

      <div class="form-group">
        <label for="shortDescription">Kurzbeschreibung</label>
        <div class="input-container">
          <input
            type="text"
            id="shortDescription"
            v-model="profileForm.shortDescription"
            placeholder="Eine kurze Beschreibung über dich"
            class="editable-field"
            data-field="shortDescription"
            maxlength="100"
          />
        </div>
        <span class="help-text">Kurze Beschreibung (max. 100 Zeichen)</span>
        <span
          v-if="profileForm.shortDescription"
          class="character-count"
          :class="{
            warning: profileForm.shortDescription.length > 80,
            error: profileForm.shortDescription.length > 100,
          }"
        >
          {{ profileForm.shortDescription.length }}/100
        </span>
      </div>

      <div class="form-group">
        <label for="bio">Über mich</label>
        <div class="input-container">
          <textarea
            id="bio"
            v-model="profileForm.bio"
            rows="4"
            class="editable-field"
            data-field="bio"
            placeholder="Erzähle etwas über dich..."
          ></textarea>
        </div>
        <span class="help-text">Ausführliche Beschreibung über dich (max. 500 Zeichen)</span>
        <span
          v-if="profileForm.bio"
          class="character-count"
          :class="{ warning: profileForm.bio.length > 450, error: profileForm.bio.length > 500 }"
        >
          {{ profileForm.bio.length }}/500
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
import { defineComponent, ref, watch, onMounted } from "vue";
import { cloudinaryUpload, cloudinaryDelete } from "@/services/cloudinaryService";
import api from "@/services/axiosInstance";

interface ProfileForm {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
  shortDescription: string;
  profilePicture: string;
  publicId_picture: string | null;
}

export default defineComponent({
  name: "ProfileSettings",
  props: {
    showSuccess: {
      type: Boolean,
      default: false,
    },
    showError: {
      type: Boolean,
      default: false,
    },
    errorMsg: {
      type: String,
      default: "",
    },
  },
  emits: ["reset-form", "save-profile", "update:showSuccess", "update:showError"],
  setup(props, { emit }) {
    // Status für Formularprozesse
    const isSaving = ref(false);
    const isUploading = ref(false);
    const isLoadingProfile = ref(true);
    const saveSuccess = ref(props.showSuccess);
    const saveError = ref(props.showError);
    const errorMessage = ref(props.errorMsg);
    const fileInput = ref<HTMLInputElement | null>(null);
    const isDragging = ref(false);
    const isUsernameEditable = ref(true); // Normalerweise false, kann je nach Anforderung angepasst werden

    // Originale Daten für Reset-Funktion
    const originalProfileData = ref<ProfileForm | null>(null);

    // Profilformular mit echten Feldern aus dem Backend
    const profileForm = ref<ProfileForm>({
      firstname: "",
      lastname: "",
      username: "",
      email: "",
      phone: "",
      bio: "",
      shortDescription: "",
      profilePicture: "",
      publicId_picture: null,
    });

    // Beobachter für Prop-Änderungen
    watch(
      () => props.showSuccess,
      (newVal) => {
        saveSuccess.value = newVal;
      }
    );

    watch(
      () => props.showError,
      (newVal) => {
        saveError.value = newVal;
      }
    );

    watch(
      () => props.errorMsg,
      (newVal) => {
        errorMessage.value = newVal;
      }
    );

    // Profildaten vom Backend laden
    const loadUserProfile = async (): Promise<void> => {
      try {
        isLoadingProfile.value = true;
        const response = await api.get("/user/getMe", {
          headers: {
            "Content-Type": "application/json",
          },
        });
        const userData = response.data;

        // Formulardaten mit Backend-Daten füllen
        profileForm.value = {
          firstname: userData.firstname || "",
          lastname: userData.lastname || "",
          username: userData.username || "",
          email: userData.email || "",
          phone: userData.phone || "",
          bio: userData.bio || "",
          shortDescription: userData.shortDescription || "",
          profilePicture: userData.profilePicture || "",
          publicId_picture: userData.publicId_picture || null,
        };

        // Originaldaten für Reset speichern
        originalProfileData.value = { ...profileForm.value };
      } catch (error: any) {
        console.error("Fehler beim Laden der Profildaten:", error);
        saveError.value = true;
        errorMessage.value = "Fehler beim Laden der Profildaten. Bitte versuche es später erneut.";
      } finally {
        isLoadingProfile.value = false;
      }
    };

    // Initialen für Avatar-Platzhalter generieren
    const getInitials = (firstName: string, lastName: string): string => {
      const first = firstName ? firstName.charAt(0) : "";
      const last = lastName ? lastName.charAt(0) : "";
      return (first + last).toUpperCase() || "??";
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

    const onDragOver = (_event: DragEvent): void => {
      isDragging.value = true;
    };

    const onDragLeave = (_event: DragEvent): void => {
      isDragging.value = false;
    };

    const onDrop = async (event: DragEvent): Promise<void> => {
      isDragging.value = false;
      if (event.dataTransfer && event.dataTransfer.files.length > 0) {
        const file = event.dataTransfer.files[0];
        if (file.type.startsWith("image/")) {
          await uploadFile(file);
        } else {
          errorMessage.value = "Bitte nur Bilder hochladen.";
          saveError.value = true;
          setTimeout(() => {
            saveError.value = false;
          }, 3000);
        }
      }
    };

    // 🔧 GEFIXTER UPLOAD - verwendet Backend statt direkter Cloudinary
    const uploadFile = async (file: File): Promise<void> => {
      try {
        isUploading.value = true;
        saveError.value = false;

        // Datei-Validierung
        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
          throw new Error("Ungültiger Dateityp. Nur JPG, PNG und WebP sind erlaubt.");
        }

        if (file.size > maxSize) {
          throw new Error("Datei ist zu groß. Maximum 5MB erlaubt.");
        }

        // Backend-Upload verwenden statt direkter Cloudinary-Upload
        const formData = new FormData();
        formData.append("file", file); // Backend erwartet 'file' als field name

        const uploadResponse = await api.post("/cloud", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (uploadResponse.data?.url) {
          // Formular-Daten aktualisieren
          profileForm.value.profilePicture = uploadResponse.data.url;
          profileForm.value.publicId_picture = uploadResponse.data.public_id || `profile_${Date.now()}`;

          // Automatisch speichern nach Upload
          await saveProfileSettings();

          // Event für andere Komponenten triggern
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("profile-updated"));
          }
        } else {
          throw new Error("Keine URL vom Server erhalten");
        }
      } catch (error: any) {
        console.error("Fehler beim Hochladen des Bildes:", error);
        saveError.value = true;
        errorMessage.value =
          error.message ||
          error.response?.data?.message ||
          "Fehler beim Hochladen des Bildes. Bitte versuche es erneut.";
      } finally {
        isUploading.value = false;
      }
    };

    // 🔧 GEFIXTER REMOVE - vereinfacht ohne direkten Cloudinary-Delete
    const removeAvatar = async (): Promise<void> => {
      try {
        if (!profileForm.value.profilePicture) return;

        isUploading.value = true;

        // Profilbild über Backend entfernen (nur Form-Daten löschen)
        profileForm.value.profilePicture = "";
        profileForm.value.publicId_picture = null;

        // Automatisch speichern nach Entfernen
        await saveProfileSettings();

        // Event für andere Komponenten triggern
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("profile-updated"));
        }
      } catch (error: any) {
        console.error("Fehler beim Entfernen des Bildes:", error);
        saveError.value = true;
        errorMessage.value =
          error.message ||
          error.response?.data?.message ||
          "Fehler beim Entfernen des Bildes. Bitte versuche es erneut.";
      } finally {
        isUploading.value = false;
      }
    };

    // Profilformular zurücksetzen
    const resetProfileForm = (): void => {
      if (originalProfileData.value) {
        profileForm.value = { ...originalProfileData.value };
      }
      saveSuccess.value = false;
      saveError.value = false;
      emit("reset-form", "profile");
    };

    // Profil speichern
    const saveProfileSettings = async (): Promise<void> => {
      try {
        isSaving.value = true;
        saveError.value = false;
        saveSuccess.value = false;

        // Nur die veränderbaren Felder senden
        const updateData: any = {
          email: profileForm.value.email,
          phone: profileForm.value.phone || "",
          bio: profileForm.value.bio || "",
          shortDescription: profileForm.value.shortDescription || "",
        };

        // Profilbild nur senden, wenn es geändert wurde
        if (profileForm.value.profilePicture !== originalProfileData.value?.profilePicture) {
          updateData.profilePicture = profileForm.value.profilePicture;
          updateData.publicid_picture = profileForm.value.publicId_picture;
        }

        // Username nur senden, wenn editierbar und geändert
        if (isUsernameEditable.value && profileForm.value.username !== originalProfileData.value?.username) {
          updateData.username = profileForm.value.username;
        }

        await api.patch("/user/updateMe", updateData, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Originaldaten aktualisieren
        originalProfileData.value = { ...profileForm.value };

        saveSuccess.value = true;
        emit("save-profile", profileForm.value);
        emit("update:showSuccess", true);

        // Erfolgsmeldung nach 3 Sekunden ausblenden
        setTimeout(() => {
          saveSuccess.value = false;
          emit("update:showSuccess", false);
        }, 3000);
      } catch (error: any) {
        console.error("Fehler beim Speichern der Profildaten:", error);
        saveError.value = true;
        emit("update:showError", true);

        if (error.response?.data?.message) {
          errorMessage.value = error.response.data.message;
        } else {
          errorMessage.value = "Fehler beim Speichern der Profildaten. Bitte versuche es später erneut.";
        }

        // Fehlermeldung nach 5 Sekunden ausblenden
        setTimeout(() => {
          saveError.value = false;
          emit("update:showError", false);
        }, 5000);
      } finally {
        isSaving.value = false;
      }
    };

    // Beim Mounten Profildaten laden
    onMounted(() => {
      loadUserProfile();
    });

    return {
      profileForm,
      isSaving,
      isUploading,
      isLoadingProfile,
      saveSuccess,
      saveError,
      errorMessage,
      fileInput,
      isDragging,
      isUsernameEditable,
      getInitials,
      resetProfileForm,
      saveProfileSettings,
      triggerFileInput,
      handleFileChange,
      onDragOver,
      onDragLeave,
      onDrop,
      removeAvatar,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;
@use "sass:color";
@use "@/style/base/animations" as animations;

.settings-section {
  margin-bottom: map.get(vars.$spacing, xxl);

  h3 {
    font-size: map.get(map.get(vars.$fonts, sizes), xl);
    font-weight: map.get(map.get(vars.$fonts, weights), bold);
    margin-bottom: map.get(vars.$spacing, xs);

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
      }
    }
  }

  .section-description {
    margin-bottom: map.get(vars.$spacing, l);

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
        transition: all 0.4s ease-out;
      }
    }
  }
}

// Loading Container
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: map.get(vars.$spacing, xxl);
  gap: map.get(vars.$spacing, m);

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      color: mixins.theme-color($theme, text-secondary);
    }
  }

  .loading-spinner {
    display: inline-block;
    width: 24px;
    height: 24px;
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: currentColor;
    animation: spin 1s linear infinite;
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

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
        transition: all 0.4s ease-out;
      }
    }
  }

  &.alert-error {
    background-color: rgba(231, 76, 60, 0.1);
    border-left: 4px solid #e74c3c;

    @each $theme in ("light", "dark") {
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

      @each $theme in ("light", "dark") {
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

      @each $theme in ("light", "dark") {
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

        @each $theme in ("light", "dark") {
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

      @each $theme in ("light", "dark") {
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

      @each $theme in ("light", "dark") {
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

      @each $theme in ("light", "dark") {
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

        @each $theme in ("light", "dark") {
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

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: mixins.theme-gradient($theme, primary);
            color: white;
            transition: all 0.4s ease-out;

            &:hover {
              transform: translateY(-2px);
              @include mixins.shadow("small", $theme);
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

        @each $theme in ("light", "dark") {
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

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }
      }
    }

    .cancel-button {
      @each $theme in ("light", "dark") {
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
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, primary);
          color: white;
          transition: all 0.4s ease-out;

          &:hover:not(:disabled) {
            transform: translateY(-3px);
            @include mixins.shadow("medium", $theme);
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
