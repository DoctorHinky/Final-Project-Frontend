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
      <div class="modal-container glass-modal" @click.stop>
        <div class="modal-header">
          <h3>Ticketdetails</h3>
          <button class="close-button" @click="closeTicketDetail">
            <span>×</span>
          </button>
        </div>
        <div class="modal-content">
          <TicketDetail
            :ticket="selectedTicket"
            @close="closeTicketDetail"
            @updated="handleTicketUpdate"
            @deleted="handleTicketDeleted"
          />
        </div>
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
  min-height: 100vh;
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
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  background: rgba(30, 30, 40, 0.95);
  backdrop-filter: blur(24px) saturate(150%);
  -webkit-backdrop-filter: blur(24px) saturate(150%);
  border-radius: 20px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 100px rgba(93, 173, 226, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(93, 173, 226, 0.2);
  animation: modal-appear 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  position: absolute;
  top: -50px;
  z-index: 2000;

  @media (max-width: 767px) {
    width: 100%;
    max-width: none;
    max-height: calc(100vh - 32px);
    border-radius: 16px;
  }

  &.glass-modal {
    background: rgba(30, 30, 40, 0.85);

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 20% 80%, rgba(93, 173, 226, 0.1) 0%, transparent 60%),
        radial-gradient(circle at 80% 20%, rgba(255, 107, 157, 0.08) 0%, transparent 60%);
      pointer-events: none;
    }
  }
}

.modal-header {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(93, 173, 226, 0.15);
  background: rgba(40, 40, 50, 0.5);
  position: relative;
  z-index: 2100;

  @media (max-width: 767px) {
    padding: 16px 20px;
  }

  h3 {
    margin: 0;
    color: #ffffff;
    font-size: 1.3rem;
    font-weight: 600;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);

    @media (max-width: 767px) {
      font-size: 1.1rem;
    }
  }

  .close-button {
    background: linear-gradient(135deg, rgba(255, 107, 157, 0.2), rgba(255, 107, 157, 0.1));
    border: 1px solid rgba(255, 107, 157, 0.3);
    color: #ff6b9d;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
    position: relative;
    z-index: 2200;
    font-size: 1.5rem;
    font-weight: 300;

    @media (max-width: 767px) {
      width: 32px;
      height: 32px;
      font-size: 1.3rem;
    }

    &:hover {
      background: linear-gradient(135deg, rgba(255, 107, 157, 0.3), rgba(255, 107, 157, 0.2));
      border-color: rgba(255, 107, 157, 0.5);
      transform: scale(1.1) rotate(90deg);
      box-shadow:
        0 0 20px rgba(255, 107, 157, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }

    &:active {
      transform: scale(0.95) rotate(90deg);
    }
  }
}

.modal-content {
  padding: 0;
  overflow-y: auto;
  flex: 1;
  position: relative;
  z-index: 2100;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(93, 173, 226, 0.3), rgba(255, 107, 157, 0.2));
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    &:hover {
      background: linear-gradient(180deg, rgba(93, 173, 226, 0.5), rgba(255, 107, 157, 0.3));
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