<!-- src/components/admin/tickets/TicketList.vue -->
<template>
  <div class="ticket-list-container">
    <!-- Aktionsfunktionen -->
    <div class="ticket-actions">
      <div class="bulk-actions" v-if="selectedTickets.length > 0">
        <span class="selected-count">{{ selectedTickets.length }} Tickets ausgewählt</span>
        <div class="action-buttons">
          <button class="btn-action resolve" @click="bulkAction('resolve')" title="Als gelöst markieren">
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
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Lösen
          </button>
          <button class="btn-action close" @click="bulkAction('close')" title="Schließen">
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
            Schließen
          </button>
        </div>
      </div>
      <div class="view-options">
        <button
          class="btn-view"
          :class="{ active: viewMode === 'table' }"
          @click="viewMode = 'table'"
          title="Tabellenansicht"
        >
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
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </button>
        <button
          class="btn-view"
          :class="{ active: viewMode === 'card' }"
          @click="viewMode = 'card'"
          title="Kartenansicht"
        >
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
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </button>
      </div>
    </div>

    <!-- Ladeindikator -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Tickets werden geladen...</p>
    </div>

    <!-- Leerer Zustand -->
    <div v-else-if="tickets.length === 0" class="empty-state">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M15 5v2"></path>
        <path d="M15 11v2"></path>
        <path d="M15 17v2"></path>
        <path
          d="M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z"
        ></path>
      </svg>
      <h3>Keine Tickets gefunden</h3>
      <p>Es wurden keine Tickets gefunden, die Ihren Filterkriterien entsprechen.</p>
    </div>

    <!-- Tabellenansicht -->
    <div v-else-if="viewMode === 'table'" class="table-view">
      <table class="tickets-table">
        <thead>
          <tr>
            <th class="checkbox-column">
              <input
                type="checkbox"
                :checked="isAllSelected"
                :indeterminate="isIndeterminate"
                @change="toggleSelectAll"
                id="select-all"
              />
              <label for="select-all" class="sr-only">Alle auswählen</label>
            </th>
            <th>Ticket</th>
            <th>Status</th>
            <th>Kategorie</th>
            <th>Zugewiesen</th>
            <th>Erstellt</th>
            <th>Aktualisiert</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="ticket in tickets"
            :key="ticket.id"
            @click="selectTicket(ticket)"
            class="ticket-row"
            :class="{ selected: isTicketSelected(ticket.id) }"
          >
            <td class="checkbox-column" @click.stop>
              <input
                type="checkbox"
                :checked="isTicketSelected(ticket.id)"
                @change="toggleTicketSelection(ticket.id)"
                :id="`ticket-${ticket.id}`"
              />
              <label :for="`ticket-${ticket.id}`" class="sr-only">Ticket auswählen</label>
            </td>
            <td class="ticket-info">
              <div class="ticket-title">{{ ticket.title }}</div>
            </td>
            <td>
              <span class="status-badge" :class="statusClass(ticket.status)">
                {{ formatStatus(ticket.status) }}
              </span>
            </td>
            <td>{{ formatCategory(ticket.category) }}</td>
            <td>{{ ticket.workedBy?.username ? ticket.workedBy?.username : "Nicht zugewiesen" }}</td>
            <td>{{ formatDate(ticket.createdAt) }}</td>
            <td>{{ formatDate(ticket.updatedAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Kartenansicht -->
    <div v-else class="card-view">
      <div
        v-for="ticket in tickets"
        :key="ticket.id"
        class="ticket-card"
        :class="{ selected: isTicketSelected(ticket.id) }"
        @click="selectTicket(ticket)"
      >
        <div class="card-header">
          <div class="card-checkbox" @click.stop>
            <input
              type="checkbox"
              :checked="isTicketSelected(ticket.id)"
              @change="toggleTicketSelection(ticket.id)"
              :id="`card-ticket-${ticket.id}`"
            />
            <label :for="`card-ticket-${ticket.id}`" class="sr-only">Ticket auswählen</label>
          </div>
          <h3 class="card-title">{{ ticket.title }}</h3>
          <span class="status-badge" :class="statusClass(ticket.status)">
            {{ formatStatus(ticket.status) }}
          </span>
        </div>
        <div class="card-body">
          <p class="card-description">{{ truncateText(ticket.description, 120) }}</p>
          <div class="card-details">
            <div class="detail-item">
              <span class="detail-label">ID:</span>
              <span class="detail-value">{{ ticket.id }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Kategorie:</span>
              <span class="detail-value">{{ formatCategory(ticket.category) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Zugewiesen:</span>
              <span class="detail-value">{{
                ticket.workedBy?.username ? ticket.workedBy?.username : "Nicht zugewiesen"
              }}</span>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <div class="timestamp">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>{{ formatDate(ticket.updatedAt) }}</span>
          </div>
          <div class="message-count" v-if="ticket.messages">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>{{ ticket.messages.length }} Nachrichten</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <!-- Hier könnte eine Pagination-Komponente eingebunden werden -->
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { type Ticket, TicketStatus, TicketCategory } from "@/types";

export default defineComponent({
  name: "TicketList",
  props: {
    tickets: {
      type: Array as () => Ticket[],
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["select-ticket", "bulk-action"],
  setup(props, { emit }) {
    // Ansicht-Modus
    const viewMode = ref<"table" | "card">("table");

    // Ausgewählte Tickets
    const selectedTickets = ref<string[]>([]);

    // Alle Tickets ausgewählt
    const isAllSelected = computed(() => {
      return props.tickets.length > 0 && selectedTickets.value.length === props.tickets.length;
    });

    // Teilweise ausgewählt
    const isIndeterminate = computed(() => {
      return selectedTickets.value.length > 0 && selectedTickets.value.length < props.tickets.length;
    });

    // Ticket auswählen
    const selectTicket = (ticket: Ticket) => emit("select-ticket", ticket);

    // Alle Tickets auswählen/abwählen
    const toggleSelectAll = (event: Event) => {
      const checked = (event.target as HTMLInputElement).checked;

      if (checked) {
        selectedTickets.value = props.tickets.map((ticket) => ticket.id);
      } else {
        selectedTickets.value = [];
      }
    };

    // Einzelnes Ticket auswählen/abwählen
    const toggleTicketSelection = (ticketId: string) => {
      const index = selectedTickets.value.indexOf(ticketId);

      if (index === -1) {
        selectedTickets.value.push(ticketId);
      } else {
        selectedTickets.value.splice(index, 1);
      }
    };

    // Prüfen, ob ein Ticket ausgewählt ist
    const isTicketSelected = (ticketId: string) => {
      return selectedTickets.value.includes(ticketId);
    };

    // Massen-Aktion ausführen
    const bulkAction = (action: string) => {
      emit("bulk-action", action, selectedTickets.value);
      selectedTickets.value = []; // Auswahl zurücksetzen
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
        case TicketStatus.CANCELED:
          return "Abgebrochen";
        case TicketStatus.CLOSED:
          return "Geschlossen";
        default:
          return status;
      }
    };

    const statusClass = (status: TicketStatus) => {
      return {
        "status-open": status === TicketStatus.OPEN,
        "status-in-progress": status === TicketStatus.IN_PROGRESS,
        "status-waiting": status === TicketStatus.CANCELED,
        "status-closed": status === TicketStatus.CLOSED,
      };
    };

    const formatCategory = (category: TicketCategory) => {
      switch (category) {
        case TicketCategory.ACCOUNT:
          return "Konto";
        case TicketCategory.TECHNICAL:
          return "Technisch";
        case TicketCategory.OTHER:
          return "Sonstiges";
        default:
          return category;
      }
    };

    const truncateText = (text: string, maxLength: number) => {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + "...";
    };

    return {
      viewMode,
      selectedTickets,
      isAllSelected,
      isIndeterminate,
      selectTicket,
      toggleSelectAll,
      toggleTicketSelection,
      isTicketSelected,
      bulkAction,
      formatDate,
      formatStatus,
      statusClass,
      formatCategory,
      truncateText,
    };
  },
});
</script>

<style lang="scss" scoped>
.ticket-list-container {
  margin-top: 24px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.ticket-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #333;
}

.bulk-actions {
  display: flex;
  align-items: center;
  gap: 16px;

  .selected-count {
    font-size: 0.875rem;
    color: #bbb;
  }

  .action-buttons {
    display: flex;
    gap: 8px;
  }
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &.resolve {
    background-color: #1e4620;
    color: #4caf50;

    &:hover {
      background-color: #2a5a2a;
    }
  }

  &.close {
    background-color: #461e1e;
    color: #f44336;

    &:hover {
      background-color: #5a2a2a;
    }
  }
}

.view-options {
  display: flex;
  gap: 8px;
}

.btn-view {
  background: none;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #888;
  transition: all 0.2s;

  &:hover {
    background-color: #333;
    color: #ccc;
  }

  &.active {
    background: rgba(68, 68, 68, 0.6);
    color: #fff;
    border-color: #666;
    backdrop-filter: blur(8px) saturate(160%);
    box-shadow: 0 4px 24px 0 rgba(255, 255, 255, 0.08);
    transition: background 0.3s, box-shadow 0.3s;
  }
}

/* Loading State */
.loading-state {
  padding: 48px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 152, 0, 0.1);
    border-left: 4px solid #ff9800;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  p {
    margin-top: 16px;
    color: #888;
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

/* Empty State */
.empty-state {
  padding: 48px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;

  svg {
    margin-bottom: 16px;
  }

  h3 {
    font-size: 1.25rem;
    margin: 0 0 8px 0;
  }

  p {
    margin: 0;
    max-width: 400px;
    text-align: center;
  }
}

/* Table View */
.table-view {
  overflow-x: auto;
}

.tickets-table {
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    text-align: left;
    padding: 12px 16px;
    border-bottom: 1px solid #333;
  }

  th {
    font-weight: 600;
    color: #bbb;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .checkbox-column {
    width: 48px;
    text-align: center;

    input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
  }

  .ticket-row {
    transition: background-color 0.2s;
    cursor: pointer;

    &:hover {
      background-color: #2a2a2a;
    }

    &.selected {
      background-color: rgba(255, 152, 0, 0.1);

      &:hover {
        background-color: rgba(255, 152, 0, 0.15);
      }
    }
  }

  .ticket-info {
    .ticket-title {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .ticket-meta {
      font-size: 0.75rem;
      color: #888;
    }
  }
}

/* Card View */
.card-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  padding: 16px;
}

.ticket-card {
  background-color: #2a2a2a;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  &.selected {
    border: 2px solid #ff9800;

    .card-header {
      background-color: rgba(255, 152, 0, 0.15);
    }
  }

  .card-header {
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    background-color: #333;
    border-bottom: 1px solid #444;

    .card-checkbox {
      input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }
    }

    .card-title {
      flex: 1;
      margin: 0;
      font-size: 1rem;
      font-weight: 500;
      line-height: 1.4;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .card-body {
    padding: 16px;

    .card-description {
      margin: 0 0 16px 0;
      font-size: 0.875rem;
      line-height: 1.5;
      color: #ddd;
    }

    .card-details {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;

      .detail-item {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .detail-label {
          font-size: 0.75rem;
          color: #888;
        }

        .detail-value {
          font-size: 0.875rem;
        }
      }
    }
  }

  .card-footer {
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    background-color: #262626;
    border-top: 1px solid #3a3a3a;
    font-size: 0.75rem;
    color: #888;

    .timestamp,
    .message-count {
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }
}

/* Badges */
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;

  &.status-open {
    background-color: rgba(33, 150, 243, 0.15);
    color: #42a5f5;
  }

  &.status-in-progress {
    background-color: rgba(156, 39, 176, 0.15);
    color: #ba68c8;
  }

  &.status-waiting {
    background-color: rgba(255, 193, 7, 0.15);
    color: #ffd54f;
  }

  &.status-resolved {
    background-color: rgba(76, 175, 80, 0.15);
    color: #81c784;
  }

  &.status-closed {
    background-color: rgba(158, 158, 158, 0.15);
    color: #bdbdbd;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Responsive Anpassungen */
@media (max-width: 768px) {
  .card-view {
    grid-template-columns: 1fr;
  }

  .bulk-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .ticket-actions {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
