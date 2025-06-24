<!-- src/components/admin/tickets/TicketDetail.vue -->
<template>
  <div class="ticket-detail">
    <!-- Ticket Info Box -->
    <div class="ticket-info-box">
      <div class="info-grid">
        <div class="info-section">
          <div class="info-label">Status</div>
          <div class="info-value">
            <span class="status-badge" :class="'status-' + ticket.status.toLowerCase()">
              {{ formatStatus(ticket.status) }}
            </span>
          </div>
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
          <div class="info-label">Erstellt am</div>
          <div class="info-value">{{ formatDate(ticket.createdAt) }}</div>
        </div>
        <div class="info-section">
          <div class="info-label">Aktualisiert</div>
          <div class="info-value">{{ formatDate(ticket.updatedAt) }}</div>
        </div>
        <div class="info-section">
          <div class="info-label">Zugewiesen an</div>
          <div class="info-value">
            {{ ticket.workedBy?.username || "Nicht zugewiesen" }}
          </div>
        </div>
        <div class="info-section">
          <div class="info-label">Ersteller</div>
          <div class="info-value">{{ ticket.userFile?.user.username || "Unbekannt" }}</div>
        </div>
      </div>
    </div>

    <!-- Quick Actions Bar -->
    <div class="quick-actions-bar">
      <button v-if="canTakeTicket" class="btn-action take" @click="takeTicket">
        <!-- Hero Icon: User Plus -->
        <svg
          class="icon-action"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
          />
        </svg>
        Ticket übernehmen
      </button>

      <button v-if="canCloseTicket" class="btn-action close" @click="closeTicket">
        <!-- Hero Icon: Check Circle -->
        <svg
          class="icon-action"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
        Ticket schließen
      </button>

      <button v-if="currentStatus === TicketStatus.CLOSED" class="btn-action reopen" @click="reopenTicket">
        <!-- Hero Icon: Arrow Path -->
        <svg
          class="icon-action"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
        Wieder öffnen
      </button>

      <button v-if="canCancelTicket" class="btn-action cancel" @click="cancelTicket">
        <!-- Hero Icon: X Circle -->
        <svg
          class="icon-action"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
        Stornieren
      </button>

      <button class="btn-action delete" @click="confirmDeleteTicket">
        <!-- Hero Icon: Trash -->
        <svg
          class="icon-action"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
          />
        </svg>
        Löschen
      </button>
    </div>

    <!-- Ticket Description -->
    <div class="ticket-description-box">
      <h3 class="box-title">
        <!-- Hero Icon: Document Text -->
        <svg
          class="icon-title"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
          />
        </svg>
        Beschreibung
      </h3>
      <p class="description-text">{{ ticket.description }}</p>
    </div>

    <!-- Message Timeline -->
    <div class="message-section">
      <h3 class="box-title">
        <!-- Hero Icon: Chat Bubble -->
        <svg
          class="icon-title"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
          />
        </svg>
        Kommunikation
        <span class="sort-indicator">
          <!-- Hero Icon: Arrow Down -->
          <svg
            class="icon-sort"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25 12 21m0 0-3.75-3.75M12 21V3" />
          </svg>
          Neueste zuerst
        </span>
      </h3>

      <!-- Message Form -->
      <form @submit.prevent="submitMessage" class="message-form">
        <textarea v-model="newMessage" placeholder="Nachricht an den Nutzer eingeben..." required rows="3" />
        <button type="submit" :disabled="isSending || !newMessage.trim()">
          <span v-if="isSending">
            <!-- Hero Icon: Loading spinner -->
            <svg class="icon-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Senden...
          </span>
          <span v-else>
            <!-- Hero Icon: Paper Airplane -->
            <svg
              class="icon-send"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
              />
            </svg>
            Nachricht senden
          </span>
        </button>
      </form>

      <!-- Messages Timeline -->
      <div class="message-timeline" v-if="sortedMessages && sortedMessages.length > 0">
        <div
          v-for="(message, index) in sortedMessages"
          :key="message.id"
          class="timeline-item"
          :class="{
            'is-staff': isMessageFromStaff(message),
            'is-newest': index === 0,
          }"
        >
          <div class="timeline-icon" :class="{ 'staff-icon': isMessageFromStaff(message) }">
            <!-- Hero Icon: User -->
            <svg
              class="icon-user"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          </div>
          <div class="timeline-content">
            <div class="message-header">
              <div class="message-author">
                {{ message.author?.username || "Unbekannt" }}
                <span v-if="isMessageFromStaff(message)" class="staff-badge">Team</span>
                <span v-if="index === 0" class="newest-badge">Neueste</span>
              </div>
              <div class="message-time">
                {{ index === 0 ? formatRelativeTime(message.createdAt) : formatDate(message.createdAt) }}
              </div>
            </div>
            <div class="message-body">{{ message.content }}</div>
          </div>
        </div>
      </div>
      <div v-else class="no-messages">
        <p>Noch keine Nachrichten vorhanden.</p>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="cancelDelete">
      <div class="confirm-dialog" @click.stop>
        <div class="confirm-header">
          <h3>
            <!-- Hero Icon: Exclamation Triangle -->
            <svg
              class="icon-warning"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
            Ticket löschen
          </h3>
          <button class="close-button" @click="cancelDelete">
            <!-- Hero Icon: X Mark -->
            <svg
              class="icon-close"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="confirm-content">
          <p>
            Sind Sie sicher, dass Sie dieses Ticket löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
        </div>
        <div class="confirm-actions">
          <button class="btn-cancel" @click="cancelDelete">Abbrechen</button>
          <button class="btn-delete" @click="deleteTicket">Endgültig löschen</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { type Ticket, TicketStatus, TicketCategory } from "@/types";
import ticketService from "@/services/ticket.service";
import { authService } from "@/services/auth.service";
import { formatDate } from "@/utils/helperFunctions";

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
    const currentAssignee = ref(props.ticket.workedBy?.username || "");

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
        // Ticket neu laden um die Messages zu aktualisieren
        const updatedTicket = await ticketService.getTicketById(props.ticket.id);
        if (updatedTicket) {
          emit("updated", updatedTicket);
          // Nach kurzer Verzögerung zur neuesten Nachricht scrollen
          setTimeout(() => {
            const timeline = document.querySelector(".message-timeline");
            if (timeline) {
              timeline.scrollTop = 0;
            }
          }, 100);
        }
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

    const canTakeTicket = computed(() => {
      if (userdata === null) {
        return false;
      }
      return userdata.role === "ADMIN" && !props.ticket.workedBy?.username;
    });

    const canCloseTicket = computed(() => props.ticket.status === TicketStatus.IN_PROGRESS);
    const canCancelTicket = computed(() => props.ticket.status === TicketStatus.OPEN);

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

    // Relative Zeit für die neueste Nachricht
    const formatRelativeTime = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Gerade eben";
      if (diffMins < 60) return `vor ${diffMins} Minute${diffMins > 1 ? "n" : ""}`;
      if (diffHours < 24) return `vor ${diffHours} Stunde${diffHours > 1 ? "n" : ""}`;
      if (diffDays < 7) return `vor ${diffDays} Tag${diffDays > 1 ? "en" : ""}`;

      return formatDate(dateString);
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

    // Sortierte Messages (neueste zuerst)
    const sortedMessages = computed(() => {
      if (!props.ticket.messages || props.ticket.messages.length === 0) {
        return [];
      }
      // Kopiere das Array und sortiere es nach Datum absteigend (neueste zuerst)
      return [...props.ticket.messages].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    });

    // Prüfen ob Nachricht vom Staff ist
    const isMessageFromStaff = (message: any) => {
      // Wenn kein author vorhanden, nicht als Staff markieren
      if (!message.author?.id) return false;

      // Prüfen ob die Nachricht NICHT vom Ticket-Ersteller ist
      // Das Ticket hat eine userFile mit user Property vom Backend
      const ticketOwnerId = (props.ticket as any).userFile?.user?.id || (props.ticket as any).author?.id;

      // Wenn der Author der Nachricht nicht der Ticket-Ersteller ist, ist es Staff
      return message.author.id !== ticketOwnerId;
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
      formatRelativeTime,
      formatStatus,
      formatCategory,

      // Computed
      canSendReply,
      canTakeTicket,
      canCloseTicket,
      canCancelTicket,
      sortedMessages,

      // Methoden – Änderungen
      updateTicketCategory,
      isMessageFromStaff,

      // Methoden – Aktionen
      closeTicket,
      takeTicket,
      reopenTicket,
      cancelTicket,
      deleteTicket,
      submitMessage,
      sendReply,
      resetReplyForm,

      // Dialoge
      confirmDeleteTicket,
      cancelDelete,
    };
  },
});
</script>

<style lang="scss" scoped>
.ticket-detail {
  width: 100%;
}

/* Icon Styles */
.icon-back,
.icon-action,
.icon-title,
.icon-user,
.icon-warning,
.icon-close,
.icon-send {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.icon-title {
  width: 18px;
  height: 18px;
}

.icon-user {
  width: 16px;
  height: 16px;
}

.icon-warning {
  width: 24px;
  height: 24px;
  color: #f44336;
}

.icon-spinner {
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Info Box */
.ticket-info-box {
  padding: 24px;
  margin: 20px;
  border-radius: 8px;
  border: 1px solid #333;
  flex-shrink: 0;

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }

  .info-section {
    .info-label {
      font-size: 0.875rem;
      color: #888;
      margin-bottom: 6px;
      font-weight: 500;
    }

    .info-value {
      font-size: 0.95rem;
      color: #f0f0f0;

      .status-badge {
        display: inline-flex;
        align-items: center;
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 0.875rem;
        font-weight: 600;

        &.status-open {
          background-color: rgba(33, 150, 243, 0.15);
          color: #42a5f5;
        }

        &.status-in_progress {
          background-color: rgba(156, 39, 176, 0.15);
          color: #ba68c8;
        }

        &.status-closed,
        &.status-canceled {
          background-color: rgba(158, 158, 158, 0.15);
          color: #bdbdbd;
        }
      }

      .category-select {
        width: 100%;
        padding: 8px 12px;
        border-radius: 6px;
        background-color: #333;
        border: 1px solid #444;
        color: #fff;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 0.95rem;

        &:focus {
          outline: none;
          border-color: #ff9800;
          box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.2);
        }

        option {
          background-color: #222;
          color: #fff;
        }
      }
    }
  }
}

/* Quick Actions Bar */
.quick-actions-bar {
  padding: 0 20px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  flex-shrink: 0;

  .btn-action {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    &.take {
      background-color: #ff9800;
      color: #fff;

      &:hover {
        background-color: #f57c00;
      }
    }

    &.close {
      background-color: #4caf50;
      color: #fff;

      &:hover {
        background-color: #388e3c;
      }
    }

    &.reopen {
      background-color: #2196f3;
      color: #fff;

      &:hover {
        background-color: #1976d2;
      }
    }

    &.cancel {
      background-color: #ff5722;
      color: #fff;

      &:hover {
        background-color: #e64a19;
      }
    }

    &.delete {
      background-color: transparent;
      color: #f44336;
      border: 1px solid #f44336;

      &:hover {
        background-color: rgba(244, 67, 54, 0.1);
      }
    }
  }
}

/* Description Box */
.ticket-description-box {
  margin: 20px;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #333;
  flex-shrink: 0;

  .box-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    color: #f0f0f0;
    margin: 0 0 16px 0;
  }

  .description-text {
    margin: 0;
    line-height: 1.6;
    white-space: pre-line;
    color: #e0e0e0;
  }
}

/* Message Section */
.message-section {
  flex: 1;
  margin: 0 20px 20px;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #333;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .box-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    color: #f0f0f0;
    margin: 0 0 16px 0;
    flex-shrink: 0;

    .sort-indicator {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.8rem;
      color: #888;
      font-weight: 400;

      .icon-sort {
        width: 14px;
        height: 14px;
      }
    }
  }

  .message-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 20px;
    flex-shrink: 0;

    textarea {
      width: 100%;
      padding: 12px;
      border-radius: 6px;
      background-color: transparent;
      border: 1px solid #444;
      color: #fff;
      resize: vertical;
      font-size: 0.95rem;
      line-height: 1.5;
      font-family: inherit;
      transition: all 0.2s;

      &:focus {
        outline: none;
        border-color: #ff9800;
        box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.2);
      }

      &::placeholder {
        color: #888;
      }
    }

    button {
      align-self: flex-end;
      padding: 10px 20px;
      background-color: #ff9800;
      border: none;
      border-radius: 6px;
      color: #fff;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 8px;

      &:hover:not(:disabled) {
        background-color: #f57c00;
        transform: translateY(-1px);
      }

      &:disabled {
        background-color: #555;
        color: #888;
        cursor: not-allowed;
        transform: none;
      }
    }
  }

  .message-timeline {
    flex: 1;
    overflow-y: auto;
    position: relative;
    padding-right: 8px;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background-color: #333;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #555;
      border-radius: 4px;

      &:hover {
        background-color: #666;
      }
    }

    &:before {
      content: "";
      position: absolute;
      top: 30px;
      bottom: 0;
      left: 24px;
      width: 2px;
      background: linear-gradient(to bottom, #2196f3, #666, #444);
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
          background-color: rgba(255, 152, 0, 0.08);
          border-left: 3px solid #ff9800;
        }

        &.is-newest {
          .timeline-content {
            background-color: rgba(33, 150, 243, 0.08);
            border: 2px solid rgba(33, 150, 243, 0.3);
            box-shadow: 0 4px 12px rgba(33, 150, 243, 0.15);
            animation: pulse-newest 2s ease-in-out;
          }

          .timeline-icon {
            background-color: #2196f3;
            box-shadow: 0 0 0 4px rgba(33, 150, 243, 0.2);
            animation: pulse-icon 1.5s ease-in-out;
          }
        }

        @keyframes pulse-newest {
          0% {
            transform: scale(1);
            box-shadow: 0 4px 12px rgba(33, 150, 243, 0.15);
          }
          50% {
            transform: scale(1.02);
            box-shadow: 0 6px 16px rgba(33, 150, 243, 0.25);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 4px 12px rgba(33, 150, 243, 0.15);
          }
        }

        @keyframes pulse-icon {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .timeline-icon {
          background-color: #ff9800;
          box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.2);
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
        border: 2px solid #2a2a2a;
        z-index: 1;

        &.staff-icon {
          background-color: #ff9800;
        }
      }

      .timeline-content {
        background-color: #333;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        border: 1px solid #444;
        transition: all 0.2s;

        &:hover {
          border-color: #555;
          transform: translateY(-1px);
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;

          .message-author {
            font-weight: 600;
            color: #f0f0f0;
            display: flex;
            align-items: center;
            gap: 8px;

            .staff-badge {
              font-size: 0.75rem;
              padding: 2px 8px;
              background-color: #ff9800;
              color: #fff;
              border-radius: 12px;
              font-weight: 500;
            }

            .newest-badge {
              font-size: 0.75rem;
              padding: 2px 8px;
              background-color: #2196f3;
              color: #fff;
              border-radius: 12px;
              font-weight: 500;
              margin-left: 8px;
              animation: pulse-badge 1.5s ease-in-out infinite;
            }

            @keyframes pulse-badge {
              0%,
              100% {
                opacity: 1;
              }
              50% {
                opacity: 0.7;
              }
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
          color: #e0e0e0;
        }
      }
    }
  }

  .no-messages {
    text-align: center;
    padding: 40px;
    color: #888;
  }
}

/* Confirmation Dialog */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  backdrop-filter: blur(4px);
  padding: 20px;
}

.confirm-dialog {
  width: 90%;
  max-width: 480px;
  background-color: #222;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  animation: modal-appear 0.3s ease-out;
  border: 1px solid #333;

  .confirm-header {
    padding: 20px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #333;
    background-color: #262626;

    h3 {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 12px;
      color: #f44336;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .close-button {
      background: none;
      border: none;
      color: #888;
      cursor: pointer;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.2s;

      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: #fff;
      }
    }
  }

  .confirm-content {
    padding: 24px;

    p {
      margin: 0;
      line-height: 1.6;
      color: #e0e0e0;
      font-size: 1rem;
    }
  }

  .confirm-actions {
    padding: 20px 24px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    border-top: 1px solid #333;
    background-color: #262626;

    .btn-cancel {
      padding: 10px 20px;
      background-color: transparent;
      border: 1px solid #555;
      border-radius: 6px;
      color: #ccc;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background-color: #444;
        color: #fff;
        border-color: #666;
      }
    }

    .btn-delete {
      padding: 10px 20px;
      background-color: #f44336;
      border: none;
      border-radius: 6px;
      color: #fff;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background-color: #d32f2f;
        transform: translateY(-1px);
      }
    }
  }
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .ticket-info-box {
    margin: 16px;
    padding: 16px;

    .info-grid {
      grid-template-columns: 1fr;
    }
  }

  .quick-actions-bar {
    padding: 0 16px;

    .btn-action {
      flex: 1;
      justify-content: center;
    }
  }

  .ticket-description-box,
  .message-section {
    margin: 16px;
    padding: 16px;
  }

  .message-timeline {
    .timeline-item {
      padding-left: 50px;
    }

    &:before {
      left: 20px;
    }

    .timeline-icon {
      left: 8px;
    }
  }

  .confirm-dialog {
    .confirm-actions {
      flex-direction: column-reverse;
      gap: 8px;

      .btn-cancel,
      .btn-delete {
        width: 100%;
        justify-content: center;
      }
    }
  }
}

@media (max-width: 480px) {
  .quick-actions-bar {
    .btn-action {
      padding: 8px 12px;
      font-size: 0.85rem;

      .icon-action {
        width: 18px;
        height: 18px;
      }
    }
  }
}
</style>