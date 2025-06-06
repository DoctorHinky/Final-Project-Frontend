<!-- src/pages/admin/Dashboard.vue -->
<template>
  <div class="admin-dashboard">
    <!-- User Suche -->
    <UserSearch v-if="activeTab === 'user-search'" @user-selected="viewUserDetails" />

    <!-- Alle User -->
    <UserList v-if="activeTab === 'all-users'" @user-selected="viewUserDetails" />

    <!-- Gelöschte User -->
    <DeletedUsers v-if="activeTab === 'deleted-users'" />

    <!-- Active Posts -->
    <PostList v-if="activeTab === 'active-posts'" />

    <!-- Tickets -->
    <div v-if="activeTab === 'tickets'" class="tickets">
      <Tickets />
    </div>

    <!-- Default/Overview -->
    <div v-if="activeTab === 'overview'" class="overview-content">
      <h2>Willkommen im Admin Dashboard</h2>
      <p>Wählen Sie einen Bereich aus dem Menü aus.</p>
      
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Lade Dashboard-Daten...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="loadError" class="error-container">
        <p class="error-message">{{ loadError }}</p>
        <button @click="loadDashboardStats" class="retry-button">Erneut versuchen</button>
      </div>
      
      <!-- Quick Stats Overview -->
      <div v-else class="quick-stats">
        <div class="stat-card" @click="navigateToTab('all-users')">
          <div class="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="5" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ stats.totalUsers }}</h3>
            <p>Aktive Benutzer</p>
          </div>
        </div>
        
        <div class="stat-card" @click="navigateToTab('deleted-users')">
          <div class="stat-icon deleted">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ stats.deletedUsers }}</h3>
            <p>Gelöschte Benutzer</p>
          </div>
        </div>
        
        <div class="stat-card" @click="navigateToTab('active-posts')">
          <div class="stat-icon posts">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ stats.activePosts }}</h3>
            <p>Aktive Beiträge</p>
          </div>
        </div>
        
        <div class="stat-card" @click="navigateToTab('tickets')">
          <div class="stat-icon tickets">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ stats.openTickets }}</h3>
            <p>Offene Tickets</p>
          </div>
        </div>

        <!-- Additional Stats -->
        <div class="stat-card">
          <div class="stat-icon new-users">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <line x1="19" y1="8" x2="19" y2="14"></line>
              <line x1="22" y1="11" x2="16" y2="11"></line>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ stats.newUsersToday }}</h3>
            <p>Neue User heute</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon deactivated">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ stats.deactivatedUsers }}</h3>
            <p>Deaktivierte User</p>
          </div>
        </div>
      </div>

      <!-- Last Update Info -->
      <div v-if="!isLoading && !loadError" class="last-update">
        <p>Letzte Aktualisierung: {{ lastUpdateFormatted }}</p>
        <button @click="loadDashboardStats" class="refresh-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          Aktualisieren
        </button>
      </div>
    </div>

    <!-- User Details Modal -->
    <div class="modal-overlay" v-if="showUserDetails" @click="closeUserDetails">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>Benutzerdetails</h3>
          <button class="close-button" @click="closeUserDetails">×</button>
        </div>
        <div class="modal-content">
          <UserDetail :user-id="selectedUserId" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/axiosInstance';
import userService from '@/services/user.service';
import UserSearch from '@/components/admin/users/UserSearch.vue';
import UserList from '@/components/admin/users/UserList.vue';
import DeletedUsers from '@/components/admin/DeletedUsers/DeletedUsers.vue';
import PostList from '@/components/admin/posts/PostList.vue';
import Tickets from '@/components/admin/tickets/Tickets.vue';
import UserDetail from '@/components/admin/users/UserDetail.vue';

interface DashboardStats {
  totalUsers: number;
  deletedUsers: number;
  deactivatedUsers: number;
  activePosts: number;
  openTickets: number;
  newUsersToday: number;
}

export default defineComponent({
  name: 'AdminDashboard',
  components: {
    UserSearch,
    UserList,
    DeletedUsers,
    PostList,
    Tickets,
    UserDetail
  },
  props: {
    defaultTab: {
      type: String,
      default: 'overview'
    }
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();
    
    // State
    const isLoading = ref(false);
    const loadError = ref('');
    const lastUpdate = ref(new Date());
    
    // Dashboard Stats
    const stats = reactive<DashboardStats>({
      totalUsers: 0,
      deletedUsers: 0,
      deactivatedUsers: 0,
      activePosts: 0,
      openTickets: 0,
      newUsersToday: 0
    });
    
    // Aktiver Tab
    const activeTab = computed(() => {
      if (route.query.tab) {
        return route.query.tab as string;
      }
      return props.defaultTab;
    });
    
    // User Details Modal
    const showUserDetails = ref(false);
    const selectedUserId = ref<string | null>(null);

    // Formatierte letzte Aktualisierung
    const lastUpdateFormatted = computed(() => {
      return new Intl.DateTimeFormat('de-DE', {
        dateStyle: 'short',
        timeStyle: 'medium'
      }).format(lastUpdate.value);
    });

    // Dashboard Stats laden
    const loadDashboardStats = async () => {
      isLoading.value = true;
      loadError.value = '';
      
      try {
        // Parallele API-Aufrufe für bessere Performance
        const [usersResponse, deletedUsersResponse] = await Promise.all([
          userService.getAllUsers(),
          userService.getDeletedUsers()
        ]);

        // Aktive User (nicht gelöscht und nicht deaktiviert)
        const activeUsers = usersResponse.filter(user => !user.isDeleted && !user.deactivated);
        stats.totalUsers = activeUsers.length;

        // Gelöschte User
        stats.deletedUsers = deletedUsersResponse.length;

        // Deaktivierte User
        const deactivatedUsers = usersResponse.filter(user => user.deactivated && !user.isDeleted);
        stats.deactivatedUsers = deactivatedUsers.length;

        // Neue User heute
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const newUsersToday = usersResponse.filter(user => {
          const createdAt = new Date(user.createdAt);
          return createdAt >= today && !user.isDeleted;
        });
        stats.newUsersToday = newUsersToday.length;

        // Posts Stats
        try {
          // Alle Posts vom aktuellen User (Admin/Mod) holen
          const postsResponse = await api.get('/article/getPreviews', {
            params: { limit: 1000 } // Großes Limit um alle zu bekommen
          });
          
          if (postsResponse.data?.data) {
            stats.activePosts = postsResponse.data.meta.totalPosts || 0;
          } else {
            stats.activePosts = 0;
          }
        } catch (error) {
          console.error('Fehler beim Laden der Post-Statistiken:', error);
          stats.activePosts = 0;
        }

        // Ticket Stats (wenn API verfügbar)
        try {
          const ticketsResponse = await api.get('/tickets/all', {
            params: { 
              status: 'OPEN',
              limit: 1 // Wir brauchen nur die Anzahl
            }
          });
          
          // Wenn es ein Array ist, zähle die Elemente
          if (Array.isArray(ticketsResponse.data)) {
            stats.openTickets = ticketsResponse.data.length;
          } else if (typeof ticketsResponse.data === 'string') {
            // "Fetch successfully, but no tickets found"
            stats.openTickets = 0;
          } else {
            stats.openTickets = 0;
          }
          
          // Alternative: Alle Tickets holen und filtern für genauere Stats
          const allTicketsResponse = await api.get('/tickets/all', {
            params: { limit: 1000 } // Größeres Limit für alle Tickets
          });
          
          if (Array.isArray(allTicketsResponse.data)) {
            const openTickets = allTicketsResponse.data.filter(
              (ticket: any) => ticket.status === 'OPEN'
            );
            stats.openTickets = openTickets.length;
          }
        } catch (error) {
          console.error('Fehler beim Laden der Ticket-Statistiken:', error);
          stats.openTickets = 0;
        }

        lastUpdate.value = new Date();
        
      } catch (error: any) {
        console.error('Fehler beim Laden der Dashboard-Statistiken:', error);
        loadError.value = error.response?.data?.message || 'Fehler beim Laden der Statistiken';
      } finally {
        isLoading.value = false;
      }
    };

    // Navigation zu Tab
    const navigateToTab = (tab: string) => {
      router.push({ 
        path: route.path, 
        query: { ...route.query, tab } 
      });
    };

    // User Details anzeigen
    const viewUserDetails = (userId: string) => {
      selectedUserId.value = userId;
      showUserDetails.value = true;
      document.body.style.overflow = 'hidden';
    };

    // User Details schließen
    const closeUserDetails = () => {
      showUserDetails.value = false;
      selectedUserId.value = null;
      document.body.style.overflow = '';
    };

    // Beim Mounten Stats laden
    onMounted(() => {
      if (activeTab.value === 'overview') {
        loadDashboardStats();
      }
    });

    // Stats neu laden wenn zu Overview gewechselt wird
    watch(activeTab, (newTab) => {
      if (newTab === 'overview' && stats.totalUsers === 0) {
        loadDashboardStats();
      }
    });

    // Auto-Refresh alle 5 Minuten
    let refreshInterval: number | null = null;
    onMounted(() => {
      refreshInterval = window.setInterval(() => {
        if (activeTab.value === 'overview') {
          loadDashboardStats();
        }
      }, 5 * 60 * 1000); // 5 Minuten
    });

    // Cleanup
    onMounted(() => {
      return () => {
        if (refreshInterval) {
          clearInterval(refreshInterval);
        }
      };
    });

    return {
      activeTab,
      showUserDetails,
      selectedUserId,
      stats,
      isLoading,
      loadError,
      lastUpdate,
      lastUpdateFormatted,
      viewUserDetails,
      closeUserDetails,
      loadDashboardStats,
      navigateToTab
    };
  }
});
</script>

<style lang="scss" scoped>
.admin-dashboard {
  width: 100%;
  min-height: calc(100vh - 130px);
}

.tickets {
  background: #2a2a2a;
  padding: 20px;
  border-radius: 8px;
}

.overview-content {
  text-align: center;
  padding: 40px 20px;
  
  h2 {
    color: #fff;
    margin-bottom: 12px;
    font-size: 2rem;
  }
  
  p {
    color: #888;
    font-size: 1.1rem;
    margin-bottom: 40px;
  }

  // Loading State
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    
    .loading-spinner {
      width: 48px;
      height: 48px;
      border: 3px solid #444;
      border-top-color: #0078d7;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }
    
    p {
      color: #aaa;
      font-size: 1rem;
      margin: 0;
    }
  }

  // Error State
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    
    .error-message {
      color: #e74c3c;
      font-size: 1rem;
      margin-bottom: 20px;
    }
    
    .retry-button {
      background-color: #0078d7;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.95rem;
      transition: background-color 0.2s;
      
      &:hover {
        background-color: #106ebe;
      }
    }
  }
  
  .quick-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    max-width: 1200px;
    margin: 0 auto;
    
    .stat-card {
      background-color: #222;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      transition: all 0.3s ease;
      cursor: pointer;
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        border-color: #444;
      }
      
      .stat-icon {
        width: 60px;
        height: 60px;
        background-color: rgba(0, 120, 215, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #0078d7;
        
        &.deleted {
          background-color: rgba(231, 76, 60, 0.2);
          color: #e74c3c;
        }
        
        &.posts {
          background-color: rgba(46, 204, 113, 0.2);
          color: #2ecc71;
        }
        
        &.tickets {
          background-color: rgba(255, 152, 0, 0.2);
          color: #ff9800;
        }

        &.new-users {
          background-color: rgba(155, 89, 182, 0.2);
          color: #9b59b6;
        }

        &.deactivated {
          background-color: rgba(149, 165, 166, 0.2);
          color: #95a5a6;
        }
        
        svg {
          width: 28px;
          height: 28px;
        }
      }
      
      .stat-content {
        text-align: left;
        
        h3 {
          margin: 0;
          font-size: 2rem;
          color: #f0f0f0;
          font-weight: 600;
        }
        
        p {
          margin: 4px 0 0 0;
          color: #a0a0a0;
          font-size: 0.95rem;
        }
      }
    }
  }

  // Last Update Info
  .last-update {
    margin-top: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    
    p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }
    
    .refresh-button {
      background-color: transparent;
      border: 1px solid #444;
      color: #aaa;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
      
      svg {
        width: 16px;
        height: 16px;
      }
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.05);
        border-color: #666;
        color: #fff;
      }
    }
  }
}

// Modal Styles
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
  max-width: 800px;
  max-height: 90vh;
  background-color: #222;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid #444;
  animation: modal-appear 0.3s ease-out;
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

// Animations
@keyframes spin {
  to { transform: rotate(360deg); }
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

// Responsive
@media (max-width: 768px) {
  .overview-content {
    padding: 20px;
    
    h2 {
      font-size: 1.5rem;
    }
    
    p {
      font-size: 1rem;
    }
    
    .quick-stats {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .last-update {
      flex-direction: column;
      gap: 12px;
    }
  }
  
  .modal-container {
    width: 95%;
    max-width: none;
    margin: 10px;
  }
}
</style>