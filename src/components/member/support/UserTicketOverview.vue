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
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Neues Ticket
      </button>
    </div>

    <!-- Quick Stats -->
    <div class="quick-stats">
      <div class="stat-card">
        <div class="stat-icon open">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ openTicketsCount }}</div>
          <div class="stat-label">Offen</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon progress">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ inProgressTicketsCount }}</div>
          <div class="stat-label">In Bearbeitung</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon total">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 5v2"></path>
            <path d="M15 11v2"></path>
            <path d="M15 17v2"></path>
            <path d="M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z"></path>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ totalTicketsCount }}</div>
          <div class="stat-label">Gesamt</div>
        </div>
      </div>
    </div>

    <!-- Filter -->
    <div class="tickets-filter">
      <div class="filter-item">
        <label for="status-filter">Status:</label>
        <select id="status-filter" v-model="statusFilter" @change="applyFilters">
          <option value="">Alle</option>
          <option value="OPEN">Offen</option>
          <option value="IN_PROGRESS">In Bearbeitung</option>
          <option value="WAITING">Wartend</option>
          <option value="RESOLVED">Gelöst</option>
          <option value="CLOSED">Geschlossen</option>
        </select>
      </div>
      
      <div class="filter-item">
        <label for="category-filter">Kategorie:</label>
        <select id="category-filter" v-model="categoryFilter" @change="applyFilters">
          <option value="">Alle</option>
          <option value="ACCOUNT">Konto & Anmeldung</option>
          <option value="TECHNICAL">Technisches Problem</option>
          <option value="WEBSITE_BUG">Website-Fehler</option>
          <option value="REPORT">Inhalte melden</option>
          <option value="OTHER">Sonstiges</option>
        </select>
      </div>
      
      <div class="filter-item search">
        <label for="search-filter">Suche:</label>
        <input 
          type="text" 
          id="search-filter" 
          v-model="searchQuery" 
          @input="debounceSearch"
          placeholder="Ticket-Titel durchsuchen..."
        >
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
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          <path d="M8 10h8"></path>
          <path d="M8 14h6"></path>
        </svg>
      </div>
      <h3>{{ searchQuery || statusFilter || categoryFilter ? 'Keine Tickets gefunden' : 'Noch keine Support-Tickets' }}</h3>
      <p>
        {{ searchQuery || statusFilter || categoryFilter 
           ? 'Versuchen Sie andere Suchkriterien oder Filter.' 
           : 'Sie haben noch keine Support-Tickets erstellt. Erstellen Sie Ihr erstes Ticket, wenn Sie Hilfe benötigen.' 
        }}
      </p>
      <button v-if="!searchQuery && !statusFilter && !categoryFilter" class="btn-create-first" @click="showCreateModal = true">
        Erstes Ticket erstellen
      </button>
    </div>

    <!-- Tickets List -->
    <div v-else class="tickets-list">
      <div 
        v-for="ticket in filteredTickets" 
        :key="ticket.id" 
        class="ticket-card"
        @click="selectTicket(ticket)"
      >
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
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
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
      :isOpen="showCreateModal" 
      @close="showCreateModal = false"
      @ticket-created="handleTicketCreated"
    />

    <!-- Ticket Detail Modal -->
    <UserTicketDetailModal
      :isOpen="!!selectedTicketForDetail"
      :ticket="selectedTicketForDetail"
      @close="selectedTicketForDetail = null"
      @ticket-updated="handleTicketUpdated"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { ticketService, type UserTicket, TicketStatus, TicketCategory } from '@/services/ticket.service';
import UserTicketModal from './UserTicketModal.vue';
import UserTicketDetailModal from './UserTicketDetailModal.vue';

export default defineComponent({
  name: 'UserTicketOverview',
  components: {
    UserTicketModal,
    UserTicketDetailModal
  },
  setup() {
    // State
    const tickets = ref<UserTicket[]>([]);
    const isLoading = ref(false);
    const showCreateModal = ref(false);
    const selectedTicketForDetail = ref<any>(null);
    
    // Filter
    const statusFilter = ref('');
    const categoryFilter = ref('');
    const searchQuery = ref('');
    
    // Computed
    const filteredTickets = computed(() => {
      let result = [...tickets.value];
      
      if (statusFilter.value) {
        result = result.filter(ticket => ticket.status === statusFilter.value);
      }
      
      if (categoryFilter.value) {
        result = result.filter(ticket => ticket.category === categoryFilter.value);
      }
      
      if (searchQuery.value) {
        const search = searchQuery.value.toLowerCase();
        result = result.filter(ticket => 
          ticket.title.toLowerCase().includes(search) ||
          ticket.id.toLowerCase().includes(search)
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
    const openTicketsCount = computed(() => 
      tickets.value.filter(t => t.status === TicketStatus.OPEN).length
    );
    const inProgressTicketsCount = computed(() => 
      tickets.value.filter(t => t.status === TicketStatus.IN_PROGRESS).length
    );
    
    // Methods
    const loadTickets = async () => {
      isLoading.value = true;
      try {
        tickets.value = await ticketService.getMyTickets();
      } catch (error) {
        console.error('Fehler beim Laden der Tickets:', error);
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
        const fullTicket = await ticketService.getUserTicketById(ticket.id);
        if (fullTicket) {
          selectedTicketForDetail.value = fullTicket;
        }
      } catch (error) {
        console.error('Fehler beim Laden des Ticket-Details:', error);
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
      return ticketService.formatStatus(status);
    };
    
    const formatCategory = (category: TicketCategory) => {
      return ticketService.formatCategory(category);
    };
    
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return new Intl.RelativeTimeFormat('de-DE', { numeric: 'auto' }).format(
          -Math.round(diffInHours), 'hour'
        );
      } else if (diffInHours < 24 * 7) {
        return new Intl.RelativeTimeFormat('de-DE', { numeric: 'auto' }).format(
          -Math.round(diffInHours / 24), 'day'
        );
      } else {
        return new Intl.DateTimeFormat('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).format(date);
      }
    };
    
    const getStatusClass = (status: TicketStatus) => {
      return {
        'status-open': status === TicketStatus.OPEN,
        'status-progress': status === TicketStatus.IN_PROGRESS,
        'status-waiting': status === TicketStatus.WAITING,
        'status-resolved': status === TicketStatus.RESOLVED,
        'status-closed': status === TicketStatus.CLOSED
      };
    };
    
    // Lifecycle
    onMounted(() => {
      loadTickets();
    });
    
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
      getStatusClass
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;

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
      font-size: 1.75rem;
      font-weight: 600;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    .header-subtitle {
      margin: 0;
      font-size: 1rem;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  .btn-new-ticket {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: white;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
    }
  }
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;

  .stat-card {
    padding: 20px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.2s;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        border: 1px solid mixins.theme-color($theme, border-light);
      }
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.open {
        background-color: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
      }

      &.progress {
        background-color: rgba(168, 85, 247, 0.1);
        color: #a855f7;
      }

      &.total {
        background-color: rgba(107, 114, 128, 0.1);
        color: #6b7280;
      }
    }

    .stat-content {
      .stat-number {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 4px;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }

      .stat-label {
        font-size: 0.875rem;

        @each $theme in ('light', 'dark') {
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
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  border-radius: 12px;

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, card-bg);
      border: 1px solid mixins.theme-color($theme, border-light);
    }
  }

  .filter-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 150px;

    &.search {
      flex: 1;
      min-width: 200px;
    }

    label {
      font-size: 0.875rem;
      font-weight: 500;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }

    select,
    input {
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid;
      font-size: 0.875rem;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, primary-bg);
          border-color: mixins.theme-color($theme, border-medium);
          color: mixins.theme-color($theme, text-primary);

          &:focus {
            outline: none;
            border-color: #4facfe;
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
  padding: 64px 0;

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(79, 172, 254, 0.1);
    border-left: 4px solid #4facfe;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  p {
    margin: 0;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 64px 0;

  .empty-icon {
    margin-bottom: 20px;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-tertiary);
      }
    }
  }

  h3 {
    margin: 0 0 12px 0;
    font-size: 1.25rem;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
      }
    }
  }

  p {
    margin: 0 0 24px 0;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.5;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
      }
    }
  }

  .btn-create-first {
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: white;
    transition: all 0.2s;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
    }
  }
}

.tickets-list {
  display: grid;
  gap: 16px;

  .ticket-card {
    padding: 20px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        border: 1px solid mixins.theme-color($theme, border-light);

        &:hover {
          border-color: #4facfe;
          box-shadow: 0 4px 12px rgba(79, 172, 254, 0.1);
        }
      }
    }

    .ticket-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
      gap: 16px;

      .ticket-title {
        font-size: 1.125rem;
        font-weight: 600;
        line-height: 1.4;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }

      .ticket-status {
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
        white-space: nowrap;

        &.status-open {
          background-color: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        &.status-progress {
          background-color: rgba(168, 85, 247, 0.1);
          color: #a855f7;
        }

        &.status-waiting {
          background-color: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        &.status-resolved {
          background-color: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }

        &.status-closed {
          background-color: rgba(107, 114, 128, 0.1);
          color: #6b7280;
        }
      }
    }

    .ticket-meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
      margin-bottom: 16px;

      .meta-item {
        display: flex;
        gap: 8px;

        .meta-label {
          font-size: 0.875rem;
          font-weight: 500;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }

        .meta-value {
          font-size: 0.875rem;

          @each $theme in ('light', 'dark') {
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
      padding-top: 12px;
      border-top: 1px solid;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          border-color: mixins.theme-color($theme, border-light);
        }
      }

      .ticket-id {
        font-size: 0.75rem;
        font-family: monospace;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-tertiary);
          }
        }
      }

      .ticket-indicators {
        display: flex;
        align-items: center;
        gap: 12px;

        .message-count {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }

        .unread-indicator {
          .unread-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: #ef4444;
            animation: pulse 2s infinite;
          }
        }
      }
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

@media (max-width: 768px) {
  .user-ticket-overview {
    padding: 16px;
  }

  .tickets-header {
    flex-direction: column;
    align-items: flex-start;

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
      gap: 8px;
    }

    .ticket-meta {
      grid-template-columns: 1fr;
    }
  }
}
</style>