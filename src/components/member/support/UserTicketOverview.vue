<!-- src/components/member/support/UserTicketOverview.vue -->
<template>
  <div class="user-ticket-overview">
    <!-- Header -->
    <div class="tickets-header">
      <div class="header-content">
        <h2>Meine Support-Tickets</h2>
        <p class="header-subtitle">Hier finden Sie alle Ihre Support-Anfragen und deren Status</p>
      </div>
      <button class="btn-new-ticket" @click="showCreateModal = true">
        <PlusIcon class="icon-size" />
        Neues Ticket
      </button>
    </div>

    <!-- Quick Stats -->
    <div class="quick-stats">
      <div class="stat-card stat-open">
        <div class="stat-icon">
          <ExclamationCircleIcon class="icon-size" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ openTicketsCount }}</div>
          <div class="stat-label">Offen</div>
        </div>
      </div>

      <div class="stat-card stat-progress">
        <div class="stat-icon">
          <ClockIcon class="icon-size" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ inProgressTicketsCount }}</div>
          <div class="stat-label">In Bearbeitung</div>
        </div>
      </div>

      <div class="stat-card stat-total">
        <div class="stat-icon">
          <TicketIcon class="icon-size" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ totalTicketsCount }}</div>
          <div class="stat-label">Gesamt</div>
        </div>
      </div>
    </div>

    <!-- Filter -->
    <div class="tickets-filter">
      <div class="filter-item">
        <label for="status-filter">Status:</label>
        <div class="custom-select">
          <select id="status-filter" v-model="statusFilter" @change="applyFilters">
            <option value="">Alle</option>
            <option value="OPEN">Offen</option>
            <option value="IN_PROGRESS">In Bearbeitung</option>
            <option value="WAITING">Wartend</option>
            <option value="RESOLVED">Gelöst</option>
            <option value="CLOSED">Geschlossen</option>
          </select>
          <ChevronDownIcon class="select-icon icon-size-sm" />
        </div>
      </div>

      <div class="filter-item">
        <label for="category-filter">Kategorie:</label>
        <div class="custom-select">
          <select id="category-filter" v-model="categoryFilter" @change="applyFilters">
            <option value="">Alle</option>
            <option value="ACCOUNT">Konto & Anmeldung</option>
            <option value="TECHNICAL">Technisches Problem</option>
            <option value="WEBSITE_BUG">Website-Fehler</option>
            <option value="REPORT">Inhalte melden</option>
            <option value="OTHER">Sonstiges</option>
          </select>
          <ChevronDownIcon class="select-icon icon-size-sm" />
        </div>
      </div>

      <div class="filter-item search">
        <label for="search-filter">Suche:</label>
        <div class="search-wrapper">
          <MagnifyingGlassIcon class="search-icon icon-size-sm" />
          <input
            type="text"
            id="search-filter"
            v-model="searchQuery"
            @input="debounceSearch"
            placeholder="Ticket-Titel durchsuchen..."
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Tickets werden geladen...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredTickets.length === 0 && !isLoading" class="empty-state">
      <div class="empty-icon">
        <ChatBubbleLeftRightIcon class="icon-size-xl" />
      </div>
      <h3>
        {{ searchQuery || statusFilter || categoryFilter ? "Keine Tickets gefunden" : "Noch keine Support-Tickets" }}
      </h3>
      <p>
        {{
          searchQuery || statusFilter || categoryFilter
            ? "Versuchen Sie andere Suchkriterien oder Filter."
            : "Sie haben noch keine Support-Tickets erstellt. Erstellen Sie Ihr erstes Ticket, wenn Sie Hilfe benötigen."
        }}
      </p>
      <button
        v-if="!searchQuery && !statusFilter && !categoryFilter"
        class="btn-create-first"
        @click="showCreateModal = true"
      >
        Erstes Ticket erstellen
      </button>
    </div>

    <!-- Tickets List -->
    <div v-else class="tickets-list">
      <div v-for="ticket in filteredTickets" :key="ticket.id" class="ticket-card" @click="selectTicket(ticket)">
        <div class="ticket-header">
          <div class="ticket-title">{{ ticket.title }}</div>
          <div class="ticket-status" :class="getStatusClass(ticket.status)">
            {{ formatStatus(ticket.status) }}
          </div>
        </div>

        <div class="ticket-meta">
          <div class="meta-item">
            <span class="meta-label">Kategorie:</span>
            <span class="meta-value">{{ formatCategory(ticket.category) }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Erstellt:</span>
            <span class="meta-value">{{ formatDate(ticket.createdAt) }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Aktualisiert:</span>
            <span class="meta-value">{{ formatDate(ticket.updatedAt) }}</span>
          </div>
        </div>

        <div class="ticket-footer">
          <div class="ticket-id">ID: {{ ticket.id }}</div>
          <div class="ticket-indicators">
            <div v-if="ticket.messageCount && ticket.messageCount > 0" class="message-count" title="Nachrichten">
              <ChatBubbleLeftRightIcon class="icon-size-xs" />
              {{ ticket.messageCount }}
            </div>
            <div v-if="ticket.hasUnreadMessages" class="unread-indicator" title="Ungelesene Nachrichten">
              <div class="unread-dot"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Ticket Modal -->
    <UserTicketModal
      :is-open="showCreateModal"
      @close="showCreateModal = false"
      @ticket-created="handleTicketCreated"
    />

    <!-- Ticket Detail Modal -->
    <UserTicketDetailModal
      :is-open="!!selectedTicketForDetail"
      :ticket="selectedTicketForDetail"
      @close="selectedTicketForDetail = null"
      @ticket-updated="handleTicketUpdated"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import {
  PlusIcon,
  ExclamationCircleIcon,
  ClockIcon,
  TicketIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
} from "@heroicons/vue/24/outline";
import { memberTicketService, type UserTicket, TicketStatus, TicketCategory } from "@/services/member.ticket.service";
import UserTicketModal from "./UserTicketModal.vue";
import UserTicketDetailModal from "./UserTicketDetailModal.vue";

export default defineComponent({
  name: "UserTicketOverview",
  components: {
    PlusIcon,
    ExclamationCircleIcon,
    ClockIcon,
    TicketIcon,
    MagnifyingGlassIcon,
    ChatBubbleLeftRightIcon,
    ChevronDownIcon,
    UserTicketModal,
    UserTicketDetailModal,
  },
  setup() {
    // State
    const tickets = ref<UserTicket[]>([]);
    const isLoading = ref(false);
    const showCreateModal = ref(false);
    const selectedTicketForDetail = ref<any>(null);

    // Filter
    const statusFilter = ref("");
    const categoryFilter = ref("");
    const searchQuery = ref("");

    // Computed
    const filteredTickets = computed(() => {
      let result = [...tickets.value];

      if (statusFilter.value) {
        result = result.filter((ticket) => ticket.status === statusFilter.value);
      }

      if (categoryFilter.value) {
        result = result.filter((ticket) => ticket.category === categoryFilter.value);
      }

      if (searchQuery.value) {
        const search = searchQuery.value.toLowerCase();
        result = result.filter(
          (ticket) => ticket.title.toLowerCase().includes(search) || ticket.id.toLowerCase().includes(search)
        );
      }

      // Sortierung: Neueste zuerst, offene Tickets oben
      result.sort((a, b) => {
        // Offene Tickets haben Priorität
        if (a.status === TicketStatus.OPEN && b.status !== TicketStatus.OPEN) return -1;
        if (b.status === TicketStatus.OPEN && a.status !== TicketStatus.OPEN) return 1;

        // Dann nach Aktualisierungsdatum
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });

      return result;
    });

    const totalTicketsCount = computed(() => tickets.value.length);
    const openTicketsCount = computed(
      () => tickets.value.filter((t: UserTicket) => t.status === TicketStatus.OPEN).length
    );
    const inProgressTicketsCount = computed(
      () => tickets.value.filter((t: UserTicket) => t.status === TicketStatus.IN_PROGRESS).length
    );

    // Methods
    const loadTickets = async () => {
      isLoading.value = true;
      try {
        tickets.value = await memberTicketService.getMyTickets();
      } catch (error) {
        console.error("Fehler beim Laden der Tickets:", error);
      } finally {
        isLoading.value = false;
      }
    };

    const applyFilters = () => {
      // Filter werden automatisch durch computed property angewendet
    };

    let searchTimeout: ReturnType<typeof setTimeout> | null = null;
    const debounceSearch = () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      searchTimeout = setTimeout(() => {
        // Suche wird automatisch durch computed property angewendet
      }, 300);
    };

    const selectTicket = async (ticket: UserTicket) => {
      try {
        // Vollständiges Ticket laden
        const fullTicket = await memberTicketService.getUserTicketById(ticket.id);
        if (fullTicket) {
          selectedTicketForDetail.value = fullTicket;
        }
      } catch (error) {
        console.error("Fehler beim Laden des Ticket-Details:", error);
      }
    };

    const handleTicketCreated = () => {
      showCreateModal.value = false;
      loadTickets(); // Tickets neu laden
    };

    const handleTicketUpdated = () => {
      selectedTicketForDetail.value = null;
      loadTickets(); // Tickets neu laden
    };

    // Formatierungsfunktionen
    const formatStatus = (status: TicketStatus) => {
      return memberTicketService.formatStatus(status);
    };

    const formatCategory = (category: TicketCategory) => {
      return memberTicketService.formatCategory(category);
    };

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return new Intl.RelativeTimeFormat("de-DE", { numeric: "auto" }).format(-Math.round(diffInHours), "hour");
      } else if (diffInHours < 24 * 7) {
        return new Intl.RelativeTimeFormat("de-DE", { numeric: "auto" }).format(-Math.round(diffInHours / 24), "day");
      } else {
        return new Intl.DateTimeFormat("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(date);
      }
    };

    const getStatusClass = (status: TicketStatus) => {
      return {
        "status-open": status === TicketStatus.OPEN,
        "status-progress": status === TicketStatus.IN_PROGRESS,
        "status-closed": status === TicketStatus.CLOSED,
      };
    };

    // Lifecycle
    onMounted(() => loadTickets());

    return {
      tickets,
      isLoading,
      showCreateModal,
      selectedTicketForDetail,
      statusFilter,
      categoryFilter,
      searchQuery,
      filteredTickets,
      totalTicketsCount,
      openTicketsCount,
      inProgressTicketsCount,
      loadTickets,
      applyFilters,
      debounceSearch,
      selectTicket,
      handleTicketCreated,
      handleTicketUpdated,
      formatStatus,
      formatCategory,
      formatDate,
      getStatusClass,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;

// Icon Size Classes
.icon-size-xs {
  width: 16px !important;
  height: 16px !important;
}

.icon-size-sm {
  width: 20px !important;
  height: 20px !important;
}

.icon-size {
  width: 24px !important;
  height: 24px !important;
}

.icon-size-lg {
  width: 28px !important;
  height: 28px !important;
}

.icon-size-xl {
  width: 30px !important;
  height: 30px !important;
}

.user-ticket-overview {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.tickets-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;

  .header-content {
    h2 {
      margin: 0 0 8px 0;
      font-size: 2rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          @if $theme == "light" {
            background: linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%);
          } @else {
            background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
          }
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }
    }

    .header-subtitle {
      margin: 0;
      font-size: 1rem;
      line-height: 1.6;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  .btn-new-ticket {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 24px;
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

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(74, 210, 149, 0.4), 0 0 30px rgba(74, 210, 149, 0.3);

      &::before {
        width: 300px;
        height: 300px;
      }
    }

    &:active {
      transform: translateY(0);
    }
  }
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 32px;

  .stat-card {
    padding: 24px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 20px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        border: 1px solid mixins.theme-color($theme, border-light);
      }
    }

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, transparent, #4ad295, transparent);
      transform: translateX(-100%);
      transition: transform 0.6s;
    }

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1), 0 0 20px rgba(74, 210, 149, 0.15);

      &::before {
        transform: translateX(100%);
      }

      .stat-icon {
        transform: scale(1.1) rotate(5deg);
      }
    }

    &.stat-open .stat-icon {
      background: linear-gradient(135deg, rgba(255, 59, 48, 0.1) 0%, rgba(255, 149, 0, 0.1) 100%);
      color: #ff3b30;
    }

    &.stat-progress .stat-icon {
      background: linear-gradient(135deg, rgba(255, 204, 0, 0.1) 0%, rgba(255, 149, 0, 0.1) 100%);
      color: #ffcc00;
    }

    &.stat-total .stat-icon {
      background: linear-gradient(135deg, rgba(74, 210, 149, 0.1) 0%, rgba(53, 204, 208, 0.1) 100%);
      color: #4ad295;
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .stat-info {
      .stat-value {
        font-size: 1.75rem;
        font-weight: 800;
        margin-bottom: 4px;
        letter-spacing: -0.02em;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }

      .stat-label {
        font-size: 0.875rem;
        font-weight: 500;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }
    }
  }
}

.tickets-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 32px;
  padding: 24px;
  border-radius: 16px;
  backdrop-filter: blur(10px);

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, card-bg);
      border: 1px solid mixins.theme-color($theme, border-light);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
  }

  .filter-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 160px;

    &.search {
      flex: 1;
      min-width: 240px;

      .search-wrapper {
        position: relative;

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          transition: color 0.2s;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-tertiary);
            }
          }
        }

        input {
          padding-left: 48px;

          &:focus ~ .search-icon {
            color: #4ad295;
          }
        }
      }
    }

    label {
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: 0.02em;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }

    .custom-select {
      position: relative;

      select {
        width: 100%;
        padding: 12px 40px 12px 16px;
        border-radius: 10px;
        border: 2px solid;
        font-size: 0.9rem;
        font-weight: 500;
        appearance: none;
        cursor: pointer;
        transition: all 0.2s;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, primary-bg);
            border-color: mixins.theme-color($theme, border-light);
            color: mixins.theme-color($theme, text-primary);

            &:hover {
              border-color: mixins.theme-color($theme, border-medium);
            }

            &:focus {
              outline: none;
              border-color: #4ad295;
              box-shadow: 0 0 0 4px rgba(74, 210, 149, 0.1);
            }
          }
        }
      }

      .select-icon {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        transition: color 0.2s;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }
    }

    input {
      width: 100%;
      padding: 12px 16px;
      border-radius: 10px;
      border: 2px solid;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, primary-bg);
          border-color: mixins.theme-color($theme, border-light);
          color: mixins.theme-color($theme, text-primary);

          &:hover {
            border-color: mixins.theme-color($theme, border-medium);
          }

          &:focus {
            outline: none;
            border-color: #4ad295;
            box-shadow: 0 0 0 4px rgba(74, 210, 149, 0.1);
          }

          &::placeholder {
            color: mixins.theme-color($theme, text-tertiary);
          }
        }
      }
    }
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(74, 210, 149, 0.1);
    border-left: 4px solid #4ad295;
    border-radius: 50%;
    animation: spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
    margin-bottom: 20px;
    filter: drop-shadow(0 0 15px rgba(74, 210, 149, 0.5));
  }

  p {
    margin: 0;
    font-weight: 500;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;

  .empty-icon {
    margin-bottom: 24px;
    animation: float 3s ease-in-out infinite;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-tertiary);
        filter: drop-shadow(0 0 20px rgba(74, 210, 149, 0.3));
      }
    }
  }

  h3 {
    margin: 0 0 16px 0;
    font-size: 1.5rem;
    font-weight: 700;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
      }
    }
  }

  p {
    margin: 0 0 32px 0;
    max-width: 420px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
      }
    }
  }

  .btn-create-first {
    padding: 14px 32px;
    border-radius: 12px;
    font-weight: 600;
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

.tickets-list {
  display: grid;
  gap: 20px;

  .ticket-card {
    padding: 24px;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        border: 2px solid mixins.theme-color($theme, border-light);

        &:hover {
          border-color: #4ad295;
          box-shadow: 0 8px 24px rgba(74, 210, 149, 0.15), 0 0 30px rgba(74, 210, 149, 0.1);
          transform: translateY(-3px) scale(1.01);
        }
      }
    }

    &::before {
      content: "";
      position: absolute;
      top: -100%;
      left: -100%;
      width: 300%;
      height: 300%;
      background: radial-gradient(circle, rgba(74, 210, 149, 0.05) 0%, transparent 70%);
      transition: transform 0.6s;
      transform: scale(0);
    }

    &:hover::before {
      transform: scale(1);
    }

    .ticket-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
      gap: 16px;

      .ticket-title {
        font-size: 1.2rem;
        font-weight: 700;
        line-height: 1.4;
        letter-spacing: -0.01em;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }

      .ticket-status {
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 0.8rem;
        font-weight: 700;
        letter-spacing: 0.02em;
        white-space: nowrap;
        text-transform: uppercase;
        transition: all 0.2s;

        &.status-open {
          background: linear-gradient(135deg, rgba(255, 59, 48, 0.15) 0%, rgba(255, 149, 0, 0.15) 100%);
          color: #ff3b30;
          box-shadow: 0 0 15px rgba(255, 59, 48, 0.2);
        }

        &.status-progress {
          background: linear-gradient(135deg, rgba(255, 204, 0, 0.15) 0%, rgba(255, 149, 0, 0.15) 100%);
          color: #ffcc00;
          box-shadow: 0 0 15px rgba(255, 204, 0, 0.2);
        }

        &.status-waiting {
          background: linear-gradient(135deg, rgba(0, 122, 255, 0.15) 0%, rgba(0, 199, 255, 0.15) 100%);
          color: #007aff;
          box-shadow: 0 0 15px rgba(0, 122, 255, 0.2);
        }

        &.status-resolved {
          background: linear-gradient(135deg, rgba(52, 199, 89, 0.15) 0%, rgba(74, 210, 149, 0.15) 100%);
          color: #34c759;
          box-shadow: 0 0 15px rgba(52, 199, 89, 0.2);
        }

        &.status-closed {
          background: linear-gradient(135deg, rgba(142, 142, 147, 0.15) 0%, rgba(174, 174, 178, 0.15) 100%);
          color: #8e8e93;
          box-shadow: 0 0 15px rgba(142, 142, 147, 0.2);
        }
      }
    }

    .ticket-meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 14px;
      margin-bottom: 20px;

      .meta-item {
        display: flex;
        gap: 8px;

        .meta-label {
          font-size: 0.875rem;
          font-weight: 600;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }

        .meta-value {
          font-size: 0.875rem;
          font-weight: 500;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }
      }
    }

    .ticket-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 2px solid;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          border-color: mixins.theme-color($theme, border-light);
        }
      }

      .ticket-id {
        font-size: 0.8rem;
        font-family: "SF Mono", Monaco, monospace;
        font-weight: 600;
        letter-spacing: 0.02em;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-tertiary);
          }
        }
      }

      .ticket-indicators {
        display: flex;
        align-items: center;
        gap: 16px;

        .message-count {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 6px;
          transition: all 0.2s;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background-color: rgba(74, 210, 149, 0.1);
              color: #4ad295;
            }
          }
        }

        .unread-indicator {
          .unread-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: radial-gradient(circle, #4ad295 0%, #35ccd0 100%);
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            box-shadow: 0 0 20px rgba(74, 210, 149, 0.8);
          }
        }
      }
    }
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

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 20px rgba(74, 210, 149, 0.8);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.2);
    box-shadow: 0 0 30px rgba(74, 210, 149, 1);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

// Responsive Design
@media (max-width: 768px) {
  .user-ticket-overview {
    padding: 16px;
  }

  .tickets-header {
    flex-direction: column;
    align-items: stretch;

    .btn-new-ticket {
      width: 100%;
      justify-content: center;
    }
  }

  .quick-stats {
    grid-template-columns: 1fr;
  }

  .tickets-filter {
    .filter-item {
      min-width: 100%;

      &.search {
        min-width: 100%;
      }
    }
  }

  .ticket-card {
    .ticket-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .ticket-meta {
      grid-template-columns: 1fr;
    }
  }
}
</style>
