<!-- src/components/admin/DeletedUsers/DeletedUsers.vue -->
<template>
  <div class="deleted-users-view">
    <div class="view-header">
      <h1>Gelöschte Benutzerverwaltung</h1>
      <p class="view-description">
        Verwalten Sie gelöschte Benutzerkonten, stellen Sie diese wieder her oder löschen Sie sie endgültig.
      </p>
    </div>

    <div class="view-tabs">
      <div class="tab-list">
        <button
          class="tab-button"
          :class="{ active: activeTab === 'list' }"
          @click="activeTab = 'list'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          Gelöschte Benutzer
        </button>
        <button
          class="tab-button"
          :class="{ active: activeTab === 'search' }"
          @click="activeTab = 'search'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          Erweiterte Suche
        </button>
      </div>
    </div>

    <div class="view-content">
      <keep-alive>
        <component 
          :is="currentTabComponent" 
          @user-selected="handleUserSelected"
          @user-restored="handleUserRestored"
          @user-permanently-deleted="handleUserPermanentlyDeleted"
        />
      </keep-alive>
    </div>

    <!-- Detail Modal - außerhalb des view-content -->
    <Teleport to="body">
      <DeletedUserDetail
        v-if="selectedUser"
        :user="selectedUser"
        @close="closeUserDetail"
        @restore="handleUserRestored"
        @permanent-delete="handleUserPermanentlyDeleted"
      />
    </Teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';
import DeletedUsersList from './DeletedUsersList.vue';
import DeletedUsersSearch from './DeletedUsersSearch.vue';
import DeletedUserDetail from './DeletedUserDetail.vue';
import userService, { type DeletedUser } from '@/services/user.service';

interface DeletedUser {
  id: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  email: string;
  role: string;
  isDeleted: boolean;
  deletedAt: string;
  deletedBy: string;
  deleteReason?: string;
  deletedByUser?: {
    username: string;
  };
  profilePicture?: string;
  createdAt?: string;
  verified?: boolean;
  deactivated?: boolean;
}

export default defineComponent({
  name: 'DeletedUsers',
  components: {
    DeletedUsersList,
    DeletedUsersSearch,
    DeletedUserDetail
  },
  setup() {
    const activeTab = ref('list');
    const selectedUser = ref<DeletedUser | null>(null);

    const currentTabComponent = computed(() => {
      switch (activeTab.value) {
        case 'search':
          return 'DeletedUsersSearch';
        default:
          return 'DeletedUsersList';
      }
    });

    const handleUserSelected = (user: DeletedUser) => {
      selectedUser.value = user;
      // Body overflow verhindern wenn Modal offen
      document.body.style.overflow = 'hidden';
    };

    const closeUserDetail = () => {
      selectedUser.value = null;
      // Body overflow wiederherstellen
      document.body.style.overflow = '';
    };

    const handleUserRestored = async (user: DeletedUser) => {
      try {
        // API Call zum Wiederherstellen
        await userService.restoreUser(user.id);
        console.log('Benutzer wiederhergestellt:', user);
        closeUserDetail();
        // Hier könnte man die Liste aktualisieren
      } catch (error) {
        console.error('Fehler beim Wiederherstellen:', error);
        alert('Fehler beim Wiederherstellen des Benutzers');
      }
    };

    const handleUserPermanentlyDeleted = async (user: DeletedUser) => {
      try {
        // API Call zum endgültigen Löschen
        await userService.deleteUserForever(user.id);
        console.log('Benutzer endgültig gelöscht:', user);
        closeUserDetail();
        // Hier könnte man die Liste aktualisieren
      } catch (error) {
        console.error('Fehler beim endgültigen Löschen:', error);
        alert('Fehler beim endgültigen Löschen des Benutzers');
      }
    };

    // Cleanup bei Component Unmount
    onUnmounted(() => {
      document.body.style.overflow = '';
    });

    return {
      activeTab,
      selectedUser,
      currentTabComponent,
      handleUserSelected,
      closeUserDetail,
      handleUserRestored,
      handleUserPermanentlyDeleted
    };
  }
});
</script>

<style lang="scss" scoped>
.deleted-users-view {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.view-header {
  margin-bottom: 32px;

  h1 {
    font-size: 2rem;
    color: #f0f0f0;
    margin: 0 0 8px 0;
  }

  .view-description {
    color: #a0a0a0;
    font-size: 1rem;
    margin: 0;
  }
}

.view-tabs {
  margin-bottom: 24px;

  .tab-list {
    display: flex;
    gap: 8px;
    border-bottom: 2px solid #333;
    padding-bottom: 2px;
  }

  .tab-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: none;
    border: none;
    color: #a0a0a0;
    cursor: pointer;
    font-size: 0.95rem;
    border-bottom: 2px solid transparent;
    transition: all 0.3s ease;
    position: relative;
    bottom: -2px;

    &:hover {
      color: #f0f0f0;
      background-color: rgba(255, 255, 255, 0.05);
    }

    &.active {
      color: #ff9800;
      border-bottom-color: #ff9800;
      background-color: rgba(255, 152, 0, 0.1);
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }
}

.view-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .deleted-users-view {
    padding: 16px;
  }

  .view-tabs {
    .tab-list {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      
      &::-webkit-scrollbar {
        display: none;
      }
    }

    .tab-button {
      white-space: nowrap;
      font-size: 0.85rem;
      padding: 10px 16px;
    }
  }
}
</style>