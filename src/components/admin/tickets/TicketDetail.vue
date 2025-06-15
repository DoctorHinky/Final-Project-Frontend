<!-- src/components/admin/tickets/TicketDetail.vue -->
<template>
  <div class="ticket-detail">
    <!-- Ticket Header -->
    <div class="ticket-header">
      <div class="header-left">
        <button class="btn-back" @click="$emit('close')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Zurück
        </button>
        <h2 class="ticket-title">{{ ticket.title }}</h2>
      </div>
    </div>

    <!-- Ticket Info Box -->
    <div class="ticket-info-box">
      <div class="info-section">
        <div class="info-label">Ticket-ID</div>
        <div class="info-value">{{ ticket.id }}</div>
      </div>
      <div class="info-section">
        <div class="info-label">Erstellt</div>
        <div class="info-value">{{ formatDate(ticket.createdAt) }}</div>
      </div>
      <div class="info-section">
        <div class="info-label">Aktualisiert</div>
        <div class="info-value">{{ formatDate(ticket.updatedAt) }}</div>
      </div>
      <div class="info-section">
        <div class="info-label">Kategorie</div>
        <div class="info-value">
          <select v-model="currentCategory" @change="updateTicketCategory" class="category-select">
            <option v-for="category in availableCategories" :key="category" :value="category">
              {{ formatCategory(category) }}
            </option>
          </select>
        </div>
      </div>
      <div class="info-section">
        <div class="info-label">Zugewiesen an</div>
        <div class="info-value">
          <div>
            <button v-if="canTakeTicket" class="btn-primary" @click="takeTicket">Ticket übernehmen</button>
          </div>
          <button v-if="canCloseTicket" class="btn-secondary" @click="closeTicket">Ticket schließen</button>
          <button v-if="canCancelTicket" class="btn-danger" @click="cancelTicket">Ticket stornieren</button>
          <form @submit.prevent="submitMessage" class="message-form">
            <textarea v-model="newMessage" placeholder="Nachricht eingeben..." required />
            <button type="submit" :disabled="isSending">
              <span v-if="isSending">Senden...</span>
              <span v-else>Nachricht senden</span>
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Ticket Description -->
    <div class="ticket-description-box">
      <h3 class="box-title">Beschreibung</h3>
      <p class="description-text">{{ ticket.description }}</p>
    </div>

    <!-- Message Timeline -->
    <div class="message-timeline" v-if="ticket.messages && ticket.messages.length > 0">
      <h3 class="box-title">Nachrichtenverlauf</h3>
      <div class="timeline">
        <div
          v-for="message in ticket.messages"
          :key="message.id"
          class="timeline-item"
          :class="{ 'is-staff': message.isStaff }"
        >
          <div class="timeline-icon" :class="{ 'staff-icon': message.isStaff }">
            <svg
              v-if="message.isStaff"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div class="timeline-content">
            <div class="message-header">
              <div class="message-author">
                {{ message.userName }}
                <span class="author-role">{{ message.userRole }}</span>
              </div>
              <div class="message-time">
                {{ formatDate(message.createdAt) }}
              </div>
            </div>
            <div class="message-body">{{ message.message }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="action-bar">
      <button class="btn-action delete" @click="confirmDeleteTicket">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
        Ticket löschen
      </button>

      <div v-if="currentStatus === TicketStatus.CLOSED">
        <button class="btn-action reopen" @click="reopenTicket">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 12h18"></path>
            <path d="M3 6h18"></path>
            <path d="M3 18h18"></path>
          </svg>
          Ticket wieder öffnen
        </button>
      </div>
      <div v-else>
        <button class="btn-action close" @click="cancelTicket">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          Ticket schließen
        </button>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="cancelDelete">
      <div class="confirm-dialog" @click.stop>
        <div class="confirm-header">
          <h3>Ticket löschen</h3>
          <button class="close-button" @click="cancelDelete">×</button>
        </div>
        <div class="confirm-content">
          <p>
            Sind Sie sicher, dass Sie dieses Ticket löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
        </div>
        <div class="confirm-actions">
          <button class="btn-cancel" @click="cancelDelete">Abbrechen</button>
          <button class="btn-delete" @click="deleteTicket">Löschen</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { ticketService, type Ticket, TicketStatus, TicketCategory } from "@/services/ticket.service";
import { authService } from "@/services/auth.service";

export default defineComponent({
  name: "TicketDetail",
  props: {
    ticket: {
      type: Object as () => Ticket,
      required: true,
    },
  },
  emits: ["close", "updated", "deleted"],
  setup(props, { emit }) {
    // Status des aktuellen Tickets
    const currentStatus = ref(props.ticket.status);
    const currentCategory = ref(props.ticket.category);
    const currentAssignee = ref(props.ticket.workedBy.username || "");

    // Antwortformular
    const replyMessage = ref("");
    const newMessage = ref("");
    const isSending = ref(false);

    const submitMessage = async () => {
      if (!newMessage.value.trim()) return;
      isSending.value = true;
      try {
        await ticketService.addMessage(props.ticket.id, newMessage.value);
        newMessage.value = "";
        emit("updated");
      } catch (e) {
        console.error("Fehler beim Senden der Nachricht", e);
      } finally {
        isSending.value = false;
      }
    };
    const takeTicket = async () => {
      await ticketService.takeTicket(props.ticket.id);
      emit("updated");
    };
    const userdata = authService.getUserData();
    /*     const isString = (value: any) => {
      if (value === null) {
        return "";
      }
      if (typeof value === "string") {
        return value.trim();
      } else {
        return "";
      }
    }; */
    const canTakeTicket = computed(() => {
      if (userdata === null) {
        return false;
      }
      return userdata.role === "ADMIN" && !props.ticket.workedBy.username;
    });
    const canCloseTicket = computed(() => props.ticket.status === TicketStatus.IN_PROGRESS);
    const canCancelTicket = computed(() => props.ticket.status === TicketStatus.OPEN);
    // const isStaff = userdata?.role === "ADMIN" || userdata?.role === "MODERATOR";
    const cancelTicket = async () => {
      await ticketService.cancelTicket(props.ticket.id);
      emit("deleted", props.ticket.id);
    };
    // Löschen-Dialog
    const showDeleteConfirm = ref(false);

    // Verfügbare Status-Optionen
    const availableStatuses = Object.values(TicketStatus);
    const availableCategories = Object.values(TicketCategory);
    const availableAdmins = ref<{ id: string; name: string }[]>([]);

    // Kann Antwort gesendet werden?
    const canSendReply = computed(() => {
      return replyMessage.value.trim().length > 0;
    });

    // Enums für den Template-Zugriff
    const TicketStatusEnum = TicketStatus;

    // Kategorie aktualisieren
    const updateTicketCategory = async () => {
      try {
        await ticketService.updateTicketCategory(props.ticket.id, currentCategory.value);
        emit("updated");
      } catch (error) {
        console.error("Fehler beim Aktualisieren der Kategorie:", error);
        currentCategory.value = props.ticket.category;
      }
    };

    const closeTicket = async () => {
      try {
        await ticketService.cancelTicket(props.ticket.id);
        emit("updated");
      } catch (error) {
        console.error("Fehler beim Schließen des Tickets:", error);
      }
    };

    // Ticket wieder öffnen
    const reopenTicket = async () => {
      try {
        currentStatus.value = TicketStatus.OPEN;
        await ticketService.reopenTicket(props.ticket.id);
        emit("updated");
      } catch (error) {
        console.error("Fehler beim Wiedereröffnen des Tickets:", error);
        currentStatus.value = props.ticket.status;
      }
    };

    // Antwort senden
    const sendReply = async () => {
      if (!canSendReply.value) return;

      try {
        await ticketService.addMessage(props.ticket.id, replyMessage.value);

        // Formular zurücksetzen
        resetReplyForm();

        // Ticket aktualisiert
        emit("updated");
      } catch (error) {
        console.error("Fehler beim Senden der Antwort:", error);
      }
    };
    // Antwortformular zurücksetzen
    const resetReplyForm = () => (replyMessage.value = "");

    // Ticket löschen Dialog anzeigen
    const confirmDeleteTicket = () => (showDeleteConfirm.value = true);

    // Löschen abbrechen
    const cancelDelete = () => (showDeleteConfirm.value = false);

    // Ticket löschen
    const deleteTicket = async () => {
      try {
        await ticketService.cancelTicket(props.ticket.id);
        // Löschen-Dialog schließen
        showDeleteConfirm.value = false;

        emit("deleted", props.ticket.id);
      } catch (error) {
        console.error("Fehler beim Löschen des Tickets:", error);
        showDeleteConfirm.value = false;
      }
    };

    // Formatierungsfunktionen
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    };

    const formatStatus = (status: TicketStatus) => {
      switch (status) {
        case TicketStatus.OPEN:
          return "Offen";
        case TicketStatus.IN_PROGRESS:
          return "In Bearbeitung";
        case TicketStatus.CLOSED:
          return "Geschlossen";
        case TicketStatus.CANCELED:
          return "Storniert";
        default:
          return status;
      }
    };

    const formatCategory = (category: TicketCategory) => {
      switch (category) {
        case TicketCategory.ACCOUNT:
          return "Konto";
        case TicketCategory.TECHNICAL:
          return "Technisch";
        case TicketCategory.REPORT:
          return "Bericht";
        case TicketCategory.OTHER:
          return "Sonstiges";
        default:
          return category;
      }
    };

    // Verfügbare Admins laden
    const loadAvailableAdmins = async () => {
      try {
        availableAdmins.value = await ticketService.getAvailableAdmins();
      } catch (error) {
        console.error("Fehler beim Laden der verfügbaren Admins:", error);
      }
    };

    // Beim Mounten der Komponente
    onMounted(() => loadAvailableAdmins());

    return {
      // Reaktive States
      currentStatus,
      currentCategory,
      currentAssignee,
      replyMessage,
      newMessage,
      isSending,
      showDeleteConfirm,

      // Daten für Dropdowns
      availableStatuses,
      availableCategories,
      availableAdmins,

      // Enums & Formatierungen
      TicketStatusEnum,
      TicketStatus,
      TicketCategory,
      formatDate,
      formatStatus,
      formatCategory,

      // Computed
      canSendReply,
      canTakeTicket,

      // Methoden – Änderungen
      updateTicketCategory,

      // Methoden – Aktionen
      closeTicket,
      takeTicket,
      reopenTicket,
      cancelTicket,
      deleteTicket,
      submitMessage,
      sendReply,
      resetReplyForm,
      canCloseTicket,
      canCancelTicket,

      // Dialoge
      confirmDeleteTicket,
      cancelDelete,
    };
  },
});
</script>

<style lang="scss" scoped>
.ticket-detail {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px 0;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .btn-back {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background-color: #333;
    border: none;
    border-radius: 4px;
    color: #fff;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background-color: #444;
    }
  }

  .ticket-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #f0f0f0;
  }

  .ticket-status {
    .status-switcher {
      .status-select {
        padding: 8px 12px;
        border-radius: 4px;
        background-color: #333;
        border: 1px solid #444;
        color: #fff;
        font-weight: 500;
        cursor: pointer;
        min-width: 160px;

        &:focus {
          outline: none;
          border-color: #ff9800;
        }

        option {
          background-color: #222;
          color: #fff;
        }
      }
    }
  }
}

.ticket-info-box {
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;

  .info-section {
    .info-label {
      font-size: 0.875rem;
      color: #888;
      margin-bottom: 4px;
    }

    .info-value {
      font-size: 1rem;
      color: #f0f0f0;

      select {
        width: 100%;
        padding: 6px 10px;
        border-radius: 4px;
        background-color: #333;
        border: 1px solid #444;
        color: #fff;

        &:focus {
          outline: none;
          border-color: #ff9800;
        }

        option {
          background-color: #222;
          color: #fff;
        }
      }
    }
  }
}

.box-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #f0f0f0;
  margin: 0 0 16px 0;
}

.ticket-description-box {
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;

  .description-text {
    margin: 0;
    line-height: 1.6;
    white-space: pre-line;
  }
}

.message-timeline {
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;

  .timeline {
    position: relative;

    &:before {
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      left: 24px;
      width: 2px;
      background-color: #444;
    }
  }

  .timeline-item {
    position: relative;
    padding-left: 60px;
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    &.is-staff {
      .timeline-content {
        background-color: rgba(255, 152, 0, 0.05);
        border-left: 3px solid #ff9800;
      }
    }
  }

  .timeline-icon {
    position: absolute;
    left: 12px;
    top: 0;
    width: 24px;
    height: 24px;
    background-color: #444;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;

    &.staff-icon {
      background-color: #ff9800;
    }
  }

  .timeline-content {
    background-color: #333;
    border-radius: 6px;
    padding: 16px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .message-author {
      font-weight: 600;
      color: #f0f0f0;

      .author-role {
        font-weight: normal;
        color: #888;
        font-size: 0.875rem;
        margin-left: 8px;
      }
    }

    .message-time {
      font-size: 0.875rem;
      color: #888;
    }
  }

  .message-body {
    line-height: 1.6;
    white-space: pre-line;
  }
}

.reply-form {
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;

  .reply-input {
    width: 100%;
    padding: 12px;
    border-radius: 6px;
    background-color: #333;
    border: 1px solid #444;
    color: #fff;
    resize: vertical;
    font-size: 1rem;
    line-height: 1.5;

    &:focus {
      outline: none;
      border-color: #ff9800;
    }
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 16px;
  }

  .btn-cancel {
    padding: 8px 16px;
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
    padding: 8px 16px;
    background-color: #ff9800;
    border: none;
    border-radius: 4px;
    color: #fff;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background-color: #f57c00;
    }

    &:disabled {
      background-color: #555;
      color: #888;
      cursor: not-allowed;
    }
  }
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;

  > div {
    display: flex;
    gap: 12px;
  }
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  &.delete {
    background-color: #461e1e;
    color: #f44336;

    &:hover {
      background-color: #5a2a2a;
    }
  }

  &.resolve {
    background-color: #1e4620;
    color: #4caf50;

    &:hover {
      background-color: #2a5a2a;
    }
  }

  &.close {
    background-color: #333;
    color: #ccc;

    &:hover {
      background-color: #444;
    }
  }

  &.reopen {
    background-color: #1e3a46;
    color: #42a5f5;

    &:hover {
      background-color: #2a4a5a;
    }
  }
}

/* Confirmation Dialog */
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
  z-index: 1100;
  backdrop-filter: blur(3px);
}

.confirm-dialog {
  width: 90%;
  max-width: 500px;
  background-color: #222;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  animation: modal-appear 0.3s ease-out;
}

.confirm-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #333;
  background-color: #262626;

  h3 {
    margin: 0;
    color: #f44336;
    font-size: 1.2rem;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #888;
    cursor: pointer;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
  }
}

.confirm-content {
  padding: 20px;

  p {
    margin: 0;
    line-height: 1.6;
  }
}

.confirm-actions {
  padding: 16px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #333;
  background-color: #262626;

  .btn-cancel {
    padding: 8px 16px;
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

  .btn-delete {
    padding: 8px 16px;
    background-color: #f44336;
    border: none;
    border-radius: 4px;
    color: #fff;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background-color: #d32f2f;
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

/* Responsive Anpassungen */
@media (max-width: 768px) {
  .ticket-header {
    flex-direction: column;
    align-items: flex-start;

    .header-left {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .ticket-status {
      width: 100%;

      .status-switcher {
        .status-select {
          width: 100%;
        }
      }
    }
  }

  .ticket-info-box {
    grid-template-columns: 1fr;
  }

  .action-bar {
    flex-direction: column;
    gap: 16px;

    > div {
      width: 100%;
      justify-content: space-between;
    }
  }

  .timeline-item {
    padding-left: 40px;
  }
}
</style>
