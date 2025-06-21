<!-- src/components/member/support/UserTicketModal.vue -->
<template>
  <!-- Modal Overlay -->
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-content">
          <div class="header-icon">
            <ChatBubbleLeftRightIcon class="w-4 h-4 Icons Icons" />
          </div>
          <div>
            <h3>Support kontaktieren</h3>
            <p class="header-subtitle">Erstellen Sie ein Ticket für Ihr Anliegen</p>
          </div>
        </div>
        <button class="close-button" @click="closeModal" :disabled="isSubmitting">
          <XMarkIcon class="w-4 h-4 Icons Icons" />
        </button>
      </div>

      <!-- Modal Content -->
      <div class="modal-content">
        <!-- Success State -->
        <div v-if="showSuccess" class="success-message">
          <div class="success-icon">
            <CheckCircleIcon class="w-4 h-4 Icons" />
          </div>
          <h4>Ticket erfolgreich erstellt!</h4>
          <p>
            Ihr Support-Ticket wurde erfolgreich übermittelt. Sie erhalten eine Bestätigung per E-Mail und unser Team
            wird sich baldmöglichst bei Ihnen melden.
          </p>
          <div class="ticket-id" v-if="createdTicketId">
            <span class="ticket-id-label">Ticket-ID:</span>
            <span class="ticket-id-value">{{ createdTicketId }}</span>
          </div>
          <button class="btn-close-success" @click="closeModal">
            Schließen
          </button>
        </div>

        <!-- Ticket Form -->
        <form v-else @submit.prevent="submitTicket" class="ticket-form">
          <!-- Title Field -->
          <div class="form-group">
            <label for="ticket-title" class="form-label">
              Betreff <span class="required">*</span>
            </label>
            <div class="input-wrapper">
              <input
                type="text"
                id="ticket-title"
                v-model="formData.title"
                class="form-input"
                :class="{ 'has-error': errors.title }"
                placeholder="Beschreiben Sie Ihr Anliegen kurz (min. 10 Zeichen)"
                required
                :disabled="isSubmitting"
                maxlength="50"
              />
              <div class="input-hint">{{ formData.title.length }}/50 (min. 10)</div>
            </div>
            <div v-if="errors.title" class="form-error">
              <ExclamationCircleIcon class="w-4 h-4 Icons" />
              {{ errors.title }}
            </div>
          </div>

          <!-- Category Field -->
          <div class="form-group">
            <label for="ticket-category" class="form-label">Kategorie</label>
            <div class="custom-select">
              <select id="ticket-category" v-model="formData.category" class="form-select" :disabled="isSubmitting">
                <option value="ACCOUNT">Konto & Anmeldung</option>
                <option value="TECHNICAL">Technisches Problem</option>
                <option value="WEBSITE_BUG">Website-Fehler</option>
                <option value="REPORT">Inhalte melden</option>
                <option value="OTHER">Sonstiges</option>
              </select>
              <ChevronDownIcon class="select-icon w-4 h-4 Icons Icons" />
            </div>
          </div>

          <!-- Description Field -->
          <div class="form-group">
            <label for="ticket-description" class="form-label">
              Beschreibung <span class="required">*</span>
            </label>
            <div class="textarea-wrapper">
              <textarea
                id="ticket-description"
                v-model="formData.description"
                class="form-textarea"
                :class="{ 'has-error': errors.description }"
                placeholder="Beschreiben Sie Ihr Problem oder Ihre Anfrage so detailliert wie möglich (min. 25 Zeichen)..."
                rows="6"
                required
                :disabled="isSubmitting"
                maxlength="500"
              ></textarea>
              <div class="input-hint">{{ formData.description.length }}/500 (min. 25)</div>
            </div>
            <div v-if="errors.description" class="form-error">
              <ExclamationCircleIcon class="w-4 h-4 Icons" />
              {{ errors.description }}
            </div>
          </div>

          <!-- File Upload -->
          <div class="form-group">
            <label for="ticket-files" class="form-label">
              Anhänge <span class="optional">(optional)</span>
            </label>
            <div
              class="file-upload-area"
              :class="{ 'drag-over': isDragOver }"
              @drop="handleDrop"
              @dragover.prevent="isDragOver = true"
              @dragleave="isDragOver = false"
            >
              <input
                type="file"
                id="ticket-files"
                multiple
                @change="handleFileSelect"
                accept="image/*,.pdf,.doc,.docx,.txt"
                class="file-input"
                :disabled="isSubmitting"
              />
              <div class="file-upload-content">
                <div class="upload-icon">
                  <CloudArrowUpIcon class="w-4 h-4 Icons-up" />
                </div>
                <p class="upload-text">
                  <strong>Dateien hier ablegen</strong> oder <span class="upload-link">durchsuchen</span>
                </p>
                <p class="upload-hint">Max. 5 Dateien, je 5MB (Bilder, PDF, Word, Text)</p>
              </div>
            </div>

            <!-- Selected Files -->
            <div v-if="selectedFiles.length > 0" class="selected-files">
              <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
                <div class="file-info">
                  <div class="file-icon">
                    <DocumentIcon class="w-4 h-4 Icons Icons" />
                  </div>
                  <div class="file-details">
                    <div class="file-name">{{ file.name }}</div>
                    <div class="file-size">{{ formatFileSize(file.size) }}</div>
                  </div>
                </div>
                <button
                  type="button"
                  class="remove-file"
                  @click="removeFile(index)"
                  :disabled="isSubmitting"
                  title="Datei entfernen"
                >
                  <XMarkIcon class="w-4 h-4 Icons" />
                </button>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="closeModal" :disabled="isSubmitting">
              Abbrechen
            </button>
            <button type="submit" class="btn-submit" :disabled="!canSubmit || isSubmitting">
              <span v-if="isSubmitting" class="loading">
                <div class="spinner"></div>
                Wird gesendet...
              </span>
              <span v-else class="btn-content">
                <PaperAirplaneIcon class="w-4 h-4 Icons-send" />
                Ticket senden
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import { memberTicketService } from "@/services/member.ticket.service";
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  DocumentIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ExclamationCircleIcon,
} from "@heroicons/vue/24/outline";

export default defineComponent({
  name: "UserTicketModal",
  components: {
    ChatBubbleLeftRightIcon,
    XMarkIcon,
    CloudArrowUpIcon,
    DocumentIcon,
    PaperAirplaneIcon,
    CheckCircleIcon,
    ChevronDownIcon,
    ExclamationCircleIcon,
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["close", "ticket-created"],
  setup(props, { emit }) {
    // Form Data
    const formData = ref({
      title: "",
      description: "",
      category: "OTHER",
    });

    // File handling
    const selectedFiles = ref<File[]>([]);
    const isDragOver = ref(false);

    // States
    const isSubmitting = ref(false);
    const showSuccess = ref(false);
    const createdTicketId = ref("");

    // Validation
    const errors = ref({
      title: "",
      description: "",
    });

    // Computed - ANGEPASST AN BACKEND-VALIDIERUNG
    const canSubmit = computed(() => {
      return (
        formData.value.title.trim().length >= 10 &&
        formData.value.title.trim().length <= 50 &&
        formData.value.description.trim().length >= 25 &&
        formData.value.description.trim().length <= 500 &&
        selectedFiles.value.length <= 5
      );
    });

    // Methods
    const resetForm = () => {
      formData.value = {
        title: "",
        description: "",
        category: "OTHER",
      };
      selectedFiles.value = [];
      errors.value = { title: "", description: "" };
      showSuccess.value = false;
      createdTicketId.value = "";
      isSubmitting.value = false;
    };

    const closeModal = () => {
      if (!isSubmitting.value) {
        resetForm();
        emit("close");
      }
    };

    const validateForm = () => {
      let isValid = true;
      errors.value = { title: "", description: "" };

      // Titel validieren - AN BACKEND ANGEPASST
      if (formData.value.title.trim().length < 10) {
        errors.value.title = "Der Betreff muss mindestens 10 Zeichen lang sein";
        isValid = false;
      } else if (formData.value.title.trim().length > 50) {
        errors.value.title = "Der Betreff darf maximal 50 Zeichen lang sein";
        isValid = false;
      }

      // Beschreibung validieren - AN BACKEND ANGEPASST
      if (formData.value.description.trim().length < 25) {
        errors.value.description = "Die Beschreibung muss mindestens 25 Zeichen lang sein";
        isValid = false;
      } else if (formData.value.description.trim().length > 500) {
        errors.value.description = "Die Beschreibung darf maximal 500 Zeichen lang sein";
        isValid = false;
      }

      // Datei-Größe validieren
      const oversizedFiles = selectedFiles.value.filter((file) => file.size > 5 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        errors.value.description = "Einige Dateien sind größer als 5MB";
        isValid = false;
      }

      return isValid;
    };

    const submitTicket = async () => {
      if (!validateForm()) return;

      isSubmitting.value = true;

      try {
        // FormData für File-Upload vorbereiten
        const formDataToSend = new FormData();
        formDataToSend.append("title", formData.value.title.trim());
        formDataToSend.append("description", formData.value.description.trim());
        formDataToSend.append("category", formData.value.category);

        // Dateien hinzufügen
        selectedFiles.value.forEach((file) => {
          formDataToSend.append("files", file);
        });

        const result = await memberTicketService.createTicket(formDataToSend);

        if (result && result.ticketId) {
          createdTicketId.value = result.ticketId;
          showSuccess.value = true;
          emit("ticket-created", result);
        }
      } catch (error: any) {
        console.error("Fehler beim Erstellen des Tickets:", error);
        // Zeige spezifische Fehlermeldung vom Backend
        if (error.response?.data?.message) {
          alert(error.response.data.message);
        }
      } finally {
        isSubmitting.value = false;
      }
    };

    // File handling methods
    const handleFileSelect = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files) {
        addFiles(Array.from(target.files));
      }
    };

    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      isDragOver.value = false;

      if (event.dataTransfer?.files) {
        addFiles(Array.from(event.dataTransfer.files));
      }
    };

    const addFiles = (files: File[]) => {
      // Datei-Typen validieren
      const allowedTypes = [
        "image/",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/",
      ];
      const validFiles = files.filter(
        (file) => allowedTypes.some((type) => file.type.startsWith(type)) && file.size <= 5 * 1024 * 1024 // 5MB
      );

      // Maximale Anzahl Dateien überprüfen
      const remainingSlots = 5 - selectedFiles.value.length;
      const filesToAdd = validFiles.slice(0, remainingSlots);

      selectedFiles.value.push(...filesToAdd);
    };

    const removeFile = (index: number) => selectedFiles.value.splice(index, 1);

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    // Modal zurücksetzen wenn geöffnet wird
    watch(
      () => props.isOpen,
      (newValue) => {
        if (newValue) {
          resetForm();
        }
      }
    );

    return {
      formData,
      selectedFiles,
      isDragOver,
      isSubmitting,
      showSuccess,
      createdTicketId,
      errors,
      canSubmit,
      closeModal,
      submitTicket,
      handleFileSelect,
      handleDrop,
      removeFile,
      formatFileSize,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(3px);
}


.modal-container {
  width: 90%;
  max-width: 680px;
  max-height: 90vh;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 60px rgba(74, 210, 149, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modal-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, card-bg);
      border: 2px solid mixins.theme-color($theme, border-light);
    }
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #4ad295 0%, #35ccd0 50%, #4ad295 100%);
    background-size: 200% 100%;
    animation: gradient-slide 3s ease-in-out infinite;
  }
}

.modal-header {
  padding: 28px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid;
  position: relative;
  overflow: hidden;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, secondary-bg);
      border-color: mixins.theme-color($theme, border-light);
    }
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -50%;
    right: -10%;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(74, 210, 149, 0.05) 0%, transparent 70%);
    pointer-events: none;
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 20px;

    .header-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #4ad295 0%, #35ccd0 100%);
      color: white;
      flex-shrink: 0;
      position: relative;
      box-shadow: 0 8px 24px rgba(74, 210, 149, 0.35);
      animation: icon-float 3s ease-in-out infinite;
    }

    h3 {
      margin: 0;
      font-size: 1.375rem;
      font-weight: 700;
      letter-spacing: -0.02em;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    .header-subtitle {
      margin: 6px 0 0 0;
      font-size: 0.9rem;
      line-height: 1.4;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  .close-button {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    border: 2px solid;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background-color: transparent;
        border-color: mixins.theme-color($theme, border-light);
        color: mixins.theme-color($theme, text-secondary);

        &:hover:not(:disabled) {
          background-color: mixins.theme-color($theme, hover-color);
          border-color: mixins.theme-color($theme, border-medium);
          color: mixins.theme-color($theme, text-primary);
          transform: rotate(90deg);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
  }
}

.modal-content {
  padding: 32px;
  overflow-y: auto;
  flex: 1;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, card-bg);
    }
  }
}

.ticket-form {
  .form-group {
    margin-bottom: 28px;

    &:last-of-type {
      margin-bottom: 0;
    }
  }

  .form-label {
    display: block;
    margin-bottom: 10px;
    font-weight: 600;
    font-size: 0.9rem;
    letter-spacing: 0.01em;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
      }
    }

    .required {
      color: #ff3b30;
      margin-left: 4px;
      font-weight: 700;
    }

    .optional {
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-tertiary);
          font-weight: 400;
          font-size: 0.85rem;
        }
      }
    }
  }

  .input-wrapper,
  .textarea-wrapper {
    position: relative;
  }

  .form-input,
  .form-textarea {
    width: 100%;
    padding: 14px 16px;
    border-radius: 12px;
    border: 2px solid;
    font-size: 0.95rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-weight: 500;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, primary-bg);
        border-color: mixins.theme-color($theme, border-light);
        color: mixins.theme-color($theme, text-primary);

        &:hover:not(:disabled) {
          border-color: mixins.theme-color($theme, border-medium);
        }

        &:focus {
          outline: none;
          border-color: #4ad295;
          box-shadow: 0 0 0 4px rgba(74, 210, 149, 0.1);
        }

        &.has-error {
          border-color: #ff3b30;
          
          &:focus {
            box-shadow: 0 0 0 4px rgba(255, 59, 48, 0.1);
          }
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background-color: mixins.theme-color($theme, secondary-bg);
        }

        &::placeholder {
          color: mixins.theme-color($theme, text-tertiary);
          font-weight: 400;
        }
      }
    }
  }

  .form-textarea {
    resize: vertical;
    min-height: 140px;
    line-height: 1.6;
    font-family: inherit;
  }

  .custom-select {
    position: relative;

    .form-select {
      width: 100%;
      padding: 14px 44px 14px 16px;
      border-radius: 12px;
      border: 2px solid;
      font-size: 0.95rem;
      font-weight: 500;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      appearance: none;
      cursor: pointer;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, primary-bg);
          border-color: mixins.theme-color($theme, border-light);
          color: mixins.theme-color($theme, text-primary);

          &:hover:not(:disabled) {
            border-color: mixins.theme-color($theme, border-medium);
          }

          &:focus {
            outline: none;
            border-color: #4ad295;
            box-shadow: 0 0 0 4px rgba(74, 210, 149, 0.1);
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            background-color: mixins.theme-color($theme, secondary-bg);
          }
        }
      }
    }

    .select-icon {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      transition: transform 0.3s;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }

    &:hover .select-icon {
      transform: translateY(-50%) rotate(180deg);
    }
  }

  .input-hint {
    position: absolute;
    right: 16px;
    bottom: -24px;
    font-size: 0.75rem;
    font-weight: 500;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-tertiary);
      }
    }
  }

  .form-error {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    font-size: 0.8rem;
    font-weight: 500;
    color: #ff3b30;
    animation: error-shake 0.3s ease-out;
  }
}

// File Upload
.file-upload-area {
  border: 2px dashed;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      border-color: mixins.theme-color($theme, border-medium);
      background-color: mixins.theme-color($theme, secondary-bg);

      &:hover,
      &.drag-over {
        border-color: #4ad295;
        background: linear-gradient(135deg, rgba(74, 210, 149, 0.05) 0%, rgba(53, 204, 208, 0.05) 100%);
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(74, 210, 149, 0.15);

        .upload-icon {
          transform: scale(1.1);
        }
      }
    }
  }

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(74, 210, 149, 0.1) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.5s;
  }

  &:hover::before,
  &.drag-over::before {
    opacity: 1;
  }

  .file-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }

  .upload-icon {
    margin-bottom: 16px;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: #4ad295;
        filter: drop-shadow(0 4px 12px rgba(74, 210, 149, 0.3));
      }
    }
  }

  .upload-text {
    margin: 0 0 8px 0;
    font-size: 0.95rem;
    line-height: 1.4;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
      }
    }

    strong {
      font-weight: 700;
    }

    .upload-link {
      color: #4ad295;
      text-decoration: underline;
      font-weight: 600;
    }
  }

  .upload-hint {
    margin: 0;
    font-size: 0.8rem;
    font-weight: 500;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
      }
    }
  }
}

.selected-files {
  margin-top: 16px;
  display: grid;
  gap: 12px;

  .file-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-radius: 12px;
    transition: all 0.2s;
    animation: file-slide-in 0.3s ease-out;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, secondary-bg);
        border: 2px solid mixins.theme-color($theme, border-light);

        &:hover {
          border-color: #4ad295;
          transform: translateX(4px);
        }
      }
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .file-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 10px;
        flex-shrink: 0;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: rgba(74, 210, 149, 0.1);
            color: #4ad295;
          }
        }
      }

      .file-details {
        .file-name {
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 2px;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }

        .file-size {
          font-size: 0.8rem;
          font-weight: 500;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }
      }
    }

    .remove-file {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: transparent;
          color: mixins.theme-color($theme, text-secondary);

          &:hover {
            background-color: rgba(255, 59, 48, 0.1);
            color: #ff3b30;
            transform: rotate(90deg);
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }
      }
    }
  }
}

// Form Actions
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 2px solid;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      border-color: mixins.theme-color($theme, border-light);
    }
  }

  .btn-cancel {
    padding: 14px 28px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background-color: transparent;
        border-color: mixins.theme-color($theme, border-medium);
        color: mixins.theme-color($theme, text-secondary);

        &:hover {
          background-color: mixins.theme-color($theme, hover-color);
          border-color: mixins.theme-color($theme, border-heavy);
          color: mixins.theme-color($theme, text-primary);
          transform: translateY(-1px);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
  }

  .btn-submit {
    padding: 14px 28px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: none;
    background: linear-gradient(135deg, #4ad295 0%, #35ccd0 100%);
    color: white;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(74, 210, 149, 0.3);

    &::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
    }

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(74, 210, 149, 0.4), 0 0 30px rgba(74, 210, 149, 0.3);

      &::before {
        width: 300px;
        height: 300px;
      }
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      box-shadow: none;
    }

    .btn-content,
    .loading {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-left-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
  }
}

// Success Message
.success-message {
  text-align: center;
  padding: 60px 40px;
  animation: success-fade-in 0.5s ease-out;

  .success-icon {
    margin-bottom: 24px;
    color: #4ad295;
    filter: drop-shadow(0 8px 24px rgba(74, 210, 149, 0.4));
    animation: success-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  h4 {
    margin: 0 0 16px 0;
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.02em;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
      }
    }
  }

  p {
    margin: 0 0 28px 0;
    line-height: 1.6;
    max-width: 420px;
    margin-left: auto;
    margin-right: auto;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
      }
    }
  }

  .ticket-id {
    margin-bottom: 32px;
    padding: 16px 24px;
    border-radius: 12px;
    font-family: "SF Mono", Monaco, monospace;
    display: inline-flex;
    align-items: center;
    gap: 12px;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background: linear-gradient(135deg, rgba(74, 210, 149, 0.1) 0%, rgba(53, 204, 208, 0.1) 100%);
        border: 2px solid rgba(74, 210, 149, 0.2);
      }
    }

    .ticket-id-label {
      font-weight: 600;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }

    .ticket-id-value {
      font-weight: 700;
      font-size: 1.1rem;
      color: #4ad295;
    }
  }

  .btn-close-success {
    padding: 14px 32px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    border: none;
    background: linear-gradient(135deg, #4ad295 0%, #35ccd0 100%);
    color: white;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(74, 210, 149, 0.3);

    &::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(74, 210, 149, 0.4), 0 0 30px rgba(74, 210, 149, 0.3);

      &::before {
        width: 300px;
        height: 300px;
      }
    }
  }
}

// Animations
@keyframes overlay-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modal-slide-up {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes gradient-slide {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
}

@keyframes icon-float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes error-shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
}

@keyframes file-slide-in {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes success-fade-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes success-bounce {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

// Responsive Design
@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    max-height: 95vh;
    border-radius: 16px;
  }

  .modal-header {
    padding: 20px;

    .header-content {
      gap: 16px;

      .header-icon {
        width: 48px;
        height: 48px;
      }

      h3 {
        font-size: 1.25rem;
      }
    }
  }

  .modal-content {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column;

    .btn-cancel,
    .btn-submit {
      width: 100%;
      justify-content: center;
    }
  }

  .file-upload-area {
    padding: 24px;
  }
}

.Icons{
  width: 24px;
  height: 24px;
  position: absolute;
}

.Icons-up{
  width: 30px;
  height: 30px;
}

.Icons-send{
  width: 20px;
  height: 20px;
}
</style>