<!-- src/components/admin/tickets/TicketForm.vue -->
<template>
  <div class="ticket-form">
    <form @submit.prevent="submitForm">
      <!-- Ticket Titel -->
      <div class="form-group">
        <label for="ticket-title" class="form-label"
          >Titel <span class="required">*</span></label
        >
        <input
          type="text"
          id="ticket-title"
          v-model="ticketData.title"
          class="form-input"
          placeholder="Geben Sie einen beschreibenden Titel ein"
          required
        />
        <div v-if="errors.title" class="form-error">{{ errors.title }}</div>
      </div>

      <!-- Ticket Beschreibung -->
      <div class="form-group">
        <label for="ticket-description" class="form-label"
          >Beschreibung <span class="required">*</span></label
        >
        <textarea
          id="ticket-description"
          v-model="ticketData.description"
          class="form-textarea"
          placeholder="Beschreiben Sie das Problem oder die Anfrage detailliert"
          rows="6"
          required
        ></textarea>
        <div v-if="errors.description" class="form-error">
          {{ errors.description }}
        </div>
      </div>
      <div class="form-group">
        <label for="attachments">Anhänge (optional)</label>
        <input
          type="file"
          id="attachments"
          multiple
          @change="handleFileChange"
        />
      </div>

      <!-- Ticket Kategorie -->
      <div class="form-group">
        <label for="ticket-category" class="form-label">Kategorie</label>
        <select
          id="ticket-category"
          v-model="ticketData.category"
          class="form-select"
        >
          <option value="account">Konto</option>
          <option value="payment">Zahlung</option>
          <option value="technical">Technisch</option>
          <option value="content">Inhalt</option>
          <option value="other">Sonstiges</option>
        </select>
      </div>

      <!-- Benutzer-ID (Dummy-Feld für Demo) -->
      <div class="form-group">
        <label for="ticket-user" class="form-label"
          >Betroffener Benutzer <span class="required">*</span></label
        >
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" class="btn-cancel" @click="$emit('cancel')">
          Abbrechen
        </button>
        <button type="submit" class="btn-submit" :disabled="isSubmitting">
          <span v-if="isSubmitting">
            <svg
              class="spinner"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
                stroke-dasharray="30 30"
                stroke-dashoffset="0"
              >
                <animateTransform
                  attributeName="transform"
                  attributeType="XML"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
            Wird erstellt...
          </span>
          <span v-else>Ticket erstellen</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import type { TicketCategory } from "@/services/ticket.service";

export default defineComponent({
  name: "TicketForm",
  emits: ["submit", "cancel"],
  setup(props, { emit }) {
    // Ticket-Daten
    const ticketData = ref({
      title: "",
      description: "",
      category: TicketCategory.TECHNICAL,
    });

    // Validation errors
    const errors = ref({
      title: "",
      description: "",
    });
    const attachments = ref<File[]>([]);
    const handleFileChange = (event: Event) => {
      const files = (event.target as HTMLInputElement).files;
      if (files) {
        attachments.value = Array.from(files);
      }
    };
    // Submission state
    const isSubmitting = ref(false);

    // Form validation
    const validateForm = () => {
      let isValid = true;

      // Reset errors
      errors.value = {
        title: "",
        description: "",

      };

      // Validate title
      if (!ticketData.value.title.trim()) {
        errors.value.title = "Titel ist erforderlich";
        isValid = false;
      } else if (ticketData.value.title.length < 5) {
        errors.value.title = "Titel muss mindestens 5 Zeichen lang sein";
        isValid = false;
      }

      // Validate description
      if (!ticketData.value.description.trim()) {
        errors.value.description = "Beschreibung ist erforderlich";
        isValid = false;
      } else if (ticketData.value.description.length < 10) {
        errors.value.description =
          "Beschreibung muss mindestens 10 Zeichen lang sein";
        isValid = false;
      }

      return isValid;
    };

    // Form submission
    const submitForm = async () => {
      if (!validateForm()) return;

      isSubmitting.value = true;

      try {
  const formData = new FormData();
  formData.append("title", ticketData.value.title);
  formData.append("description", ticketData.value.description);
  formData.append("category", ticketData.value.category);

  // Dateien anhängen
  attachments.value.forEach((file) => {
    formData.append("files", file);
  });

  emit("submit", formData);
} catch (error) {
  console.error("Fehler beim Erstellen des Tickets:", error);
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      ticketData,
      errors,
      isSubmitting,
      submitForm,
      attachments,
      handleFileChange,
    };
  },
});
</script>

<style lang="scss" scoped>
.ticket-form {
  width: 100%;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #f0f0f0;

  .required {
    color: #f44336;
    margin-left: 4px;
  }
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 12px;
  border-radius: 4px;
  background-color: #333;
  border: 1px solid #444;
  color: #fff;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #ff9800;
  }

  &::placeholder {
    color: #888;
  }
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.form-select {
  cursor: pointer;

  option {
    background-color: #222;
    color: #fff;
  }
}

.form-error {
  margin-top: 6px;
  font-size: 0.75rem;
  color: #f44336;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-cancel {
  padding: 10px 16px;
  background-color: transparent;
  border: 1px solid #555;
  border-radius: 4px;
  color: #ccc;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #444;
    color: #fff;
  }
}

.btn-submit {
  padding: 10px 16px;
  background-color: #ff9800;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background-color: #f57c00;
  }

  &:disabled {
    background-color: #555;
    color: #888;
    cursor: not-allowed;
  }

  .spinner {
    animation: spin 1s linear infinite;
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
</style>
