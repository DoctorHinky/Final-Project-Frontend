<!-- src/components/member/support/UserTicketModal.vue -->
<template>
  <!-- Modal Overlay -->
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-content">
          <div class="header-icon">
            <ChatBubbleLeftRightIcon class="w-6 h-6" />
          </div>
          <div>
            <h3>Support kontaktieren</h3>
            <p class="header-subtitle">Erstellen Sie ein Ticket für Ihr Anliegen</p>
          </div>
        </div>
        <button class="close-button" @click="closeModal" :disabled="isSubmitting">
          <XMarkIcon class="w-5 h-5 Close-Icon" />
        </button>
      </div>

      <!-- Modal Content -->
      <div class="modal-content">
        <!-- Ticket-Formular -->
        <form @submit.prevent="submitTicket" class="ticket-form">
          <!-- Titel -->
          <div class="form-group">
            <label for="ticket-title" class="form-label"> Betreff <span class="required">*</span> </label>
            <input
              type="text"
              id="ticket-title"
              v-model="formData.title"
              class="form-input"
              placeholder="Beschreiben Sie Ihr Anliegen kurz"
              required
              :disabled="isSubmitting"
              maxlength="100"
            />
            <div class="input-hint">{{ formData.title.length }}/100 Zeichen</div>
            <div v-if="errors.title" class="form-error">{{ errors.title }}</div>
          </div>

          <!-- Kategorie -->
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
              <ChevronDownIcon class="select-icon" />
            </div>
          </div>

          <!-- Beschreibung -->
          <div class="form-group">
            <label for="ticket-description" class="form-label"> Beschreibung <span class="required">*</span> </label>
            <textarea
              id="ticket-description"
              v-model="formData.description"
              class="form-textarea"
              placeholder="Beschreiben Sie Ihr Problem oder Ihre Anfrage so detailliert wie möglich..."
              rows="6"
              required
              :disabled="isSubmitting"
              maxlength="2000"
            ></textarea>
            <div class="input-hint">{{ formData.description.length }}/2000 Zeichen</div>
            <div v-if="errors.description" class="form-error">{{ errors.description }}</div>
          </div>

          <!-- Datei-Upload -->
          <div class="form-group">
            <label for="ticket-files" class="form-label"> Anhänge (optional) </label>
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
                  <CloudArrowUpIcon class="w-8 h-8 Icons-Big" />
                </div>
                <p class="upload-text"><strong>Dateien hier ablegen</strong> oder klicken zum Auswählen</p>
                <p class="upload-hint">Max. 5 Dateien, je 5MB (Bilder, PDF, Word, Text)</p>
              </div>
            </div>

            <!-- Ausgewählte Dateien -->
            <div v-if="selectedFiles.length > 0" class="selected-files">
              <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
                <div class="file-info">
                  <div class="file-icon">
                    <DocumentIcon class="w-4 h-4 Icons" />
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
                  <XMarkIcon class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="closeModal" :disabled="isSubmitting">Abbrechen</button>
            <button type="submit" class="btn-submit" :disabled="!canSubmit || isSubmitting">
              <span v-if="isSubmitting" class="loading">
                <div class="spinner"></div>
                Wird gesendet...
              </span>
              <span v-else>
                <PaperAirplaneIcon class="w-4 h-4 Icons" />
                Ticket senden
              </span>
            </button>
          </div>
        </form>

        <!-- Erfolgs-Meldung -->
        <div v-if="showSuccess" class="success-message">
          <div class="success-icon">
            <CheckCircleIcon class="w-12 h-12" />
          </div>
          <h4>Ticket erfolgreich erstellt!</h4>
          <p>
            Ihr Support-Ticket wurde erfolgreich übermittelt. Sie erhalten eine Bestätigung per E-Mail und unser Team
            wird sich baldmöglichst bei Ihnen melden.
          </p>
          <div class="ticket-id" v-if="createdTicketId"><strong>Ticket-ID:</strong> {{ createdTicketId }}</div>
          <button class="btn-close-success" @click="closeModal">Schließen</button>
        </div>
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

    // Computed
    const canSubmit = computed(() => {
      return (
        formData.value.title.trim().length >= 5 &&
        formData.value.description.trim().length >= 10 &&
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

      // Titel validieren
      if (formData.value.title.trim().length < 5) {
        errors.value.title = "Der Betreff muss mindestens 5 Zeichen lang sein";
        isValid = false;
      }

      // Beschreibung validieren
      if (formData.value.description.trim().length < 10) {
        errors.value.description = "Die Beschreibung muss mindestens 10 Zeichen lang sein";
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
      } catch (error) {
        console.error("Fehler beim Erstellen des Tickets:", error);
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
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999 !important;
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}

.modal-container {
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modal-appear 0.3s ease-out;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, card-bg);
      border: 1px solid mixins.theme-color($theme, border-light);
    }
  }
}

.modal-header {
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, secondary-bg);
      border-color: mixins.theme-color($theme, border-light);
    }
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 16px;

    .header-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #4ad295 0%, #35ccd0 100%);
      color: white;
      flex-shrink: 0;
      position: relative;
      box-shadow: 0 0 20px rgba(74, 210, 149, 0.25);

      &::before {
        content: "";
        position: absolute;
        inset: -1px;
        border-radius: 12px;
        background: linear-gradient(135deg, #4ad295 0%, #35ccd0 100%);
        opacity: 0.4;
        filter: blur(8px);
        z-index: -1;
      }
    }

    h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    .header-subtitle {
      margin: 4px 0 0 0;
      font-size: 0.875rem;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  .close-button {
    width: 36px;
    height: 36px;
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
          background-color: mixins.theme-color($theme, hover-color);
          color: mixins.theme-color($theme, text-primary);
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
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.ticket-form {
  .form-group {
    margin-bottom: 20px;
  }

  .form-label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    font-size: 0.875rem;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
      }
    }

    .required {
      color: #4ad295;
      margin-left: 2px;
    }
  }

  .form-input,
  .form-textarea {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid;
    font-size: 0.875rem;
    transition: all 0.2s;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, primary-bg);
        border-color: mixins.theme-color($theme, border-medium);
        color: mixins.theme-color($theme, text-primary);

        &:focus {
          outline: none;
          border-color: #4ad295;
          box-shadow: 0 0 0 3px rgba(74, 210, 149, 0.1);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        &::placeholder {
          color: mixins.theme-color($theme, text-tertiary);
        }
      }
    }
  }

  .form-textarea {
    resize: vertical;
    min-height: 120px;
    line-height: 1.5;
  }

  // Custom Select Styling
  .custom-select {
    position: relative;

    .form-select {
      width: 100%;
      padding: 12px;
      padding-right: 36px;
      border-radius: 8px;
      border: 1px solid;
      font-size: 0.875rem;
      transition: all 0.2s;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      cursor: pointer;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, primary-bg);
          border-color: mixins.theme-color($theme, border-medium);
          color: mixins.theme-color($theme, text-primary);

          &:focus {
            outline: none;
            border-color: #4ad295;
            box-shadow: 0 0 0 3px rgba(74, 210, 149, 0.1);
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          // Option styling
          option {
            background-color: mixins.theme-color($theme, primary-bg);
            color: mixins.theme-color($theme, text-primary);
            padding: 8px;
          }
        }
      }
    }

    .select-icon {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      width: 20px;
      height: 20px;
      pointer-events: none;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  .input-hint {
    margin-top: 4px;
    font-size: 0.75rem;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-tertiary);
      }
    }
  }

  .form-error {
    margin-top: 6px;
    font-size: 0.75rem;
    color: #4ad295;
  }
}

// File Upload
.file-upload-area {
  border: 2px dashed;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      border-color: mixins.theme-color($theme, border-medium);
      background-color: mixins.theme-color($theme, secondary-bg);

      &:hover,
      &.drag-over {
        border-color: #4ad295;
        background-color: rgba(74, 210, 149, 0.05);
        box-shadow: 0 0 15px rgba(74, 210, 149, 0.1);
      }
    }
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
    margin-bottom: 12px;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
        filter: drop-shadow(0 0 5px rgba(74, 210, 149, 0.2));
      }
    }
  }

  .upload-text {
    margin: 0 0 8px 0;
    font-size: 0.875rem;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
      }
    }
  }

  .upload-hint {
    margin: 0;
    font-size: 0.75rem;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
      }
    }
  }
}

.selected-files {
  margin-top: 12px;

  .file-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-radius: 6px;
    margin-bottom: 8px;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, secondary-bg);
        border: 1px solid mixins.theme-color($theme, border-light);
      }
    }

    &:last-child {
      margin-bottom: 0;
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .file-icon {
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }

      .file-details {
        .file-name {
          font-size: 0.875rem;
          font-weight: 500;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }

        .file-size {
          font-size: 0.75rem;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }
      }
    }

    .remove-file {
      width: 24px;
      height: 24px;
      border-radius: 4px;
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
            background-color: mixins.theme-color($theme, hover-color);
            color: mixins.theme-color($theme, text-primary);
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
  gap: 12px;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      border-color: mixins.theme-color($theme, border-light);
    }
  }

  .btn-cancel {
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background-color: transparent;
        border-color: mixins.theme-color($theme, border-medium);
        color: mixins.theme-color($theme, text-secondary);

        &:hover {
          background-color: mixins.theme-color($theme, hover-color);
          color: mixins.theme-color($theme, text-primary);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
  }

  .btn-submit {
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    background: linear-gradient(135deg, #4ad295 0%, #35ccd0 100%);
    color: white;
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
    overflow: hidden;

    &::before {
      content: "";
      position: absolute;
      inset: -1px;
      border-radius: 8px;
      background: linear-gradient(135deg, #4ad295 0%, #35ccd0 100%);
      opacity: 0;
      filter: blur(8px);
      transition: opacity 0.3s;
      z-index: -1;
    }

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(74, 210, 149, 0.3), 0 0 20px rgba(74, 210, 149, 0.2);

      &::before {
        opacity: 0.5;
      }
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .loading {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-left-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }
}

// Success Message
.success-message {
  text-align: center;
  padding: 40px 20px;

  .success-icon {
    margin-bottom: 16px;
    color: #4ad295;
    filter: drop-shadow(0 0 10px rgba(74, 210, 149, 0.4));
  }

  h4 {
    margin: 0 0 12px 0;
    font-size: 1.25rem;
    font-weight: 600;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
      }
    }
  }

  p {
    margin: 0 0 20px 0;
    line-height: 1.5;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
      }
    }
  }

  .ticket-id {
    margin-bottom: 24px;
    padding: 12px;
    border-radius: 8px;
    font-family: monospace;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, secondary-bg);
        color: mixins.theme-color($theme, text-primary);
      }
    }
  }

  .btn-close-success {
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    background: linear-gradient(135deg, #4ad295 0%, #35ccd0 100%);
    color: white;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;

    &::before {
      content: "";
      position: absolute;
      inset: -1px;
      border-radius: 8px;
      background: linear-gradient(135deg, #4ad295 0%, #35ccd0 100%);
      opacity: 0;
      filter: blur(8px);
      transition: opacity 0.3s;
      z-index: -1;
    }

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(74, 210, 149, 0.3), 0 0 20px rgba(74, 210, 149, 0.2);

      &::before {
        opacity: 0.5;
      }
    }
  }
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    max-height: 95vh;
  }

  .modal-header {
    padding: 16px;

    .header-content {
      gap: 12px;

      .header-icon {
        width: 40px;
        height: 40px;
      }

      h3 {
        font-size: 1.125rem;
      }
    }
  }

  .modal-content {
    padding: 16px;
  }

  .form-actions {
    flex-direction: column;

    .btn-cancel,
    .btn-submit {
      width: 100%;
      justify-content: center;
    }
  }
}
.Icons {
  width: 30px;
}

.Close-Icon {
  width: 20px;
  position: absolute;
}

.Icons-Big {
  width: 50px;
}
</style>
