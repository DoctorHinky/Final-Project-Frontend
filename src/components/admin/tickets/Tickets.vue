<!-- src/components/admin/tickets/Tickets.vue -->
<template>
  <div class="tickets-container">
    <!-- Header -->
    <div class="tickets-header">
      <h1>Ticket Management</h1>
      <button class="btn-new-ticket" @click="showNewTicketForm = true">
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
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Neues Ticket
      </button>
    </div>

    <!-- Statistiken -->
    <TicketStats :stats="ticketStats" @filter-by-status="filterByStatus" />

    <!-- Filter -->
    <TicketFilter :filters="filters" @update:filters="updateFilters" @reset-filters="resetFilters" />

    <!-- Ticket Liste -->
    <TicketList :tickets="filteredTickets" :loading="isLoading" @select-ticket="selectTicket" />

    <!-- Neues Ticket Formular Modal -->
    <div v-if="showNewTicketForm" class="modal-overlay" @click="closeNewTicketForm">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>Neues Ticket erstellen</h3>
          <button class="close-button" @click="closeNewTicketForm">×</button>
        </div>
        <div class="modal-content">
          <TicketForm @submit="createTicket" @cancel="closeNewTicketForm" />
        </div>
      </div>
    </div>

    <!-- Ticket Detail Modal -->
    <div v-if="selectedTicket" class="modal-overlay" @click="closeTicketDetail">
      <div class="modal-container large" @click.stop>
        <TicketDetail
          :ticket="selectedTicket"
          @close="closeTicketDetail"
          @updated="handleTicketUpdate"
          @deleted="handleTicketDeleted"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import TicketStats from "./TicketStats.vue";
import TicketFilter from "./TicketFilter.vue";
import TicketList from "./TicketList.vue";
import TicketForm from "./TicketForm.vue";
import TicketDetail from "./TicketDetail.vue";
import { TicketStatus, type Ticket } from "@/types";
import ticketService from "@/services/ticket.service";

export default defineComponent({
  name: "Tickets",
  components: {
    TicketStats,
    TicketFilter,
    TicketList,
    TicketForm,
    TicketDetail,
  },
  setup() {
    // State
    const tickets = ref<Ticket[]>([]);
    const isLoading = ref(false);
    const showNewTicketForm = ref(false);
    const selectedTicket = ref<Ticket | null>(null);
    // Filter
    const filters = ref({
      status: "",
      category: "",
      search: "",
      sortBy: "updatedAt",
    });

    // Ticket-Statistiken
    const ticketStats = computed(() => {
      const stats = {
        total: tickets.value.length,
        byStatus: {
          open: 0,
          in_progress: 0,
          website_bug: 0,
          closed: 0,
        },
        byCategory: {},
      };

      tickets.value.forEach((ticket) => {
        // Status
        if (ticket.status === TicketStatus.OPEN) stats.byStatus.open++;
        else if (ticket.status === TicketStatus.IN_PROGRESS) stats.byStatus.in_progress++;
        else if (ticket.status === TicketStatus.WEBSITE_BUG) stats.byStatus.website_bug++;
        else if (ticket.status === TicketStatus.CLOSED) stats.byStatus.closed++;
      });

      return stats;
    });

    // Gefilterte Tickets
    const filteredTickets = computed(() => {
      let result = [...tickets.value];

      // Status-Filter
      if (filters.value.status) result = result.filter((ticket) => ticket.status === filters.value.status);

      // Kategorie-Filter
      if (filters.value.category) {
        result = result.filter((ticket) => ticket.category === filters.value.category);
      }

      // Such-Filter
      if (filters.value.search) {
        const searchLower = filters.value.search.toLowerCase();
        result = result.filter(
          (ticket) =>
            ticket.title.toLowerCase().includes(searchLower) ||
            ticket.description.toLowerCase().includes(searchLower) ||
            ticket.id.toLowerCase().includes(searchLower)
        );
      }

      // Sortierung
      if (filters.value.sortBy === "updatedAt") {
        result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      } else if (filters.value.sortBy === "createdAt") {
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      return result;
    });

    // Tickets laden
    const loadTickets = async () => {
      isLoading.value = true;
      try {
        tickets.value = await ticketService.getTickets();
        console.log("Tickets geladen:", tickets.value);
      } catch (error) {
        console.error("Fehler beim Laden der Tickets:", error);
      } finally {
        isLoading.value = false;
      }
    };

    // Filter aktualisieren
    const updateFilters = (newFilters: typeof filters.value) => {
      filters.value = { ...newFilters };
    };

    // Filter zurücksetzen
    const resetFilters = () => {
      filters.value = {
        status: "",
        category: "",
        search: "",
        sortBy: "updatedAt",
      };
    };

    // Nach Status filtern (von Stats)
    const filterByStatus = (status: string) => (filters.value.status = status);

    // Ticket auswählen
    const selectTicket = async (ticket: Ticket) => {
      try {
        const res = await ticketService.getTicketById(ticket.id);
        console.log("Ticket detail response:", res);

        if (res !== null) {
          selectedTicket.value = res;
        }
      } catch (error) {
        console.error("something gone wrong, ", error);
      }
    };

    // Ticket-Detail schließen
    const closeTicketDetail = () => (selectedTicket.value = null);

    // Neues Ticket Formular schließen
    const closeNewTicketForm = () => (showNewTicketForm.value = false);

    // Neues Ticket erstellen
    const createTicket = async (ticketData: any) => {
      try {
        await ticketService.createTicket(ticketData); // <- ticketData ist schon FormData
        showNewTicketForm.value = false;
        await loadTickets();
      } catch (error) {
        console.error("Fehler beim Erstellen des Tickets:", error);
      }
    };

    // Ticket Update Handler
    const handleTicketUpdate = async (updatedTicket?: Ticket) => {
      // Wenn ein aktualisiertes Ticket übergeben wurde, verwende es direkt
      if (updatedTicket) {
        selectedTicket.value = updatedTicket;
        // Aktualisiere auch die Ticket-Liste
        const index = tickets.value.findIndex(t => t.id === updatedTicket.id);
        if (index !== -1) {
          tickets.value[index] = updatedTicket;
        }
      } else {
        // Ansonsten lade das Ticket neu
        if (selectedTicket.value) {
          const updated = await ticketService.getTicketById(selectedTicket.value.id);
          if (updated) {
            selectedTicket.value = updated;
            // Aktualisiere auch die Ticket-Liste
            const index = tickets.value.findIndex(t => t.id === updated.id);
            if (index !== -1) {
              tickets.value[index] = updated;
            }
          }
        }
      }
    };

    // Ticket gelöscht
    const handleTicketDeleted = () => {
      closeTicketDetail();
      loadTickets(); // Liste neu laden
    };

    // Beim Mounten
    onMounted(() => loadTickets());

    return {
      createTicket,
      tickets,
      isLoading,
      showNewTicketForm,
      selectedTicket,
      filters,
      ticketStats,
      filteredTickets,
      updateFilters,
      resetFilters,
      filterByStatus,
      selectTicket,
      closeTicketDetail,
      closeNewTicketForm,
      handleTicketUpdate,
      handleTicketDeleted,
    };
  },
});
</script>

<style lang="scss" scoped>
.tickets-container {
  width: 100%;
}

.tickets-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h1 {
    font-size: 2rem;
    margin: 0;
    color: #f0f0f0;
  }

  .btn-new-ticket {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
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
  }
}

/* Modal Styles */
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

.modal-container {
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  background-color: #222;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modal-appear 0.3s ease-out;

  &.large {
    max-width: 1000px;
  }
}

.modal-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #333;
  background-color: #262626;

  h3 {
    margin: 0;
    color: #fff;
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

.modal-content {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
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

@media (max-width: 768px) {
  .tickets-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;

    h1 {
      font-size: 1.5rem;
    }
  }
}
</style>