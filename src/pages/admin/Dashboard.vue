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

    <!-- Staff Team -->
    <StaffList v-if="activeTab === 'staff-team'" @user-selected="viewUserDetails" />

    <!-- Default/Overview -->
    <div v-if="activeTab === 'overview' || !activeTab" class="overview-content">
      <h2>Willkommen im Admin Dashboard</h2>
      <p>Wählen Sie einen Bereich aus dem Menü aus.</p>
      
      <!-- Quick Stats Overview -->
      <div class="quick-stats">
        <div class="stat-card">
          <div class="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="5" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ totalUsers }}</h3>
            <p>Aktive Benutzer</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon deleted">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ deletedUsers }}</h3>
            <p>Gelöschte Benutzer</p>
          </div>
        </div>
        
        <div class="stat-card">
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
            <h3>{{ activePosts }}</h3>
            <p>Aktive Beiträge</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon tickets">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ openTickets }}</h3>
            <p>Offene Tickets</p>
          </div>
        </div>
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
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import UserSearch from '@/components/admin/users/UserSearch.vue';
import UserList from '@/components/admin/users/UserList.vue';
import DeletedUsers from '@/components/admin/DeletedUsers/DeletedUsers.vue';
import PostList from '@/components/admin/posts/PostList.vue';
import Tickets from '@/components/admin/tickets/Tickets.vue';
import StaffList from '@/components/admin/staff/StaffList.vue';
import UserDetail from '@/components/admin/users/UserDetail.vue';

export default defineComponent({
  name: 'AdminDashboard',
  components: {
    UserSearch,
    UserList,
    DeletedUsers,
    PostList,
    Tickets,
    StaffList,
    UserDetail
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    
    // Aktiver Tab
    const activeTab = ref((route.query.tab as string) || 'overview');
    
    // User Details Modal
    const showUserDetails = ref(false);
    const selectedUserId = ref<string | null>(null);
    
    // Dashboard Stats (würden normalerweise vom Backend kommen)
    const totalUsers = ref(2548);
    const deletedUsers = ref(127);
    const activePosts = ref(1342);
    const openTickets = ref(23);

    // Watcher für Route-Änderungen
    watch(() => route.query.tab, (newTab) => {
      if (newTab && typeof newTab === 'string') {
        activeTab.value = newTab;
      }
    });

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

    // Beim Mounten Tab aus Query-Parameter setzen
    onMounted(() => {
      const tabFromQuery = route.query.tab as string;
      if (tabFromQuery) {
        activeTab.value = tabFromQuery;
      }
      
      // Hier könnten die Dashboard-Statistiken geladen werden
      // loadDashboardStats();
    });

    return {
      activeTab,
      showUserDetails,
      selectedUserId,
      totalUsers,
      deletedUsers,
      activePosts,
      openTickets,
      viewUserDetails,
      closeUserDetails
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
  }
  
  .modal-container {
    width: 95%;
    max-width: none;
    margin: 10px;
  }
}
</style>