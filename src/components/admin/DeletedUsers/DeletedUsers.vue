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
        <button class="tab-button" :class="{ active: activeTab === 'list' }" @click="activeTab = 'list'">
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
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          Gelöschte Benutzer
        </button>
        <button class="tab-button" :class="{ active: activeTab === 'search' }" @click="activeTab = 'search'">
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
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          Erweiterte Suche
        </button>
      </div>
    </div>

    <div class="view-content">
      <!-- Tab Content ohne keep-alive oder mit v-show statt v-if -->
      <div v-show="activeTab === 'list'">
        <DeletedUsersList
          :key="`list-${refreshKey}`"
          @user-selected="handleUserSelected"
          @user-restored="handleUserRestored"
          @user-permanently-deleted="handleUserPermanentlyDeleted"
        />
      </div>
      
      <div v-show="activeTab === 'search'">
        <DeletedUsersSearch
          :key="`search-${refreshKey}`"
          @user-selected="handleUserSelected"
          @user-restored="handleUserRestored"
          @user-permanently-deleted="handleUserPermanentlyDeleted"
        />
      </div>
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

    <!-- Error Modal -->
    <Teleport to="body">
      <div v-if="showErrorModal" class="modal-overlay" @click="showErrorModal = false">
        <div class="modal-dialog error-dialog" @click.stop>
          <div class="modal-header error-header">
            <h3>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              Fehler
            </h3>
            <button class="close-button" @click="showErrorModal = false">×</button>
          </div>
          <div class="modal-body">
            <p>{{ errorMessage }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn-primary" @click="showErrorModal = false">OK</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onUnmounted } from "vue";
import DeletedUsersList from "./DeletedUsersList.vue";
import DeletedUsersSearch from "./DeletedUsersSearch.vue";
import DeletedUserDetail from "./DeletedUserDetail.vue";
import userService from "@/services/user.service";
import type { DeletedUser } from "@/types";

export default defineComponent({
  name: "DeletedUsers",
  components: {
    DeletedUsersList,
    DeletedUsersSearch,
    DeletedUserDetail,
  },
  setup() {
    const activeTab = ref("list");
    const selectedUser = ref<DeletedUser | null>(null);
    const refreshKey = ref(0); // Key für Force-Refresh der Child-Components
    
    // Modal States
    const showErrorModal = ref(false);
    const errorMessage = ref("");

    const handleUserSelected = (user: DeletedUser) => {
      selectedUser.value = user;
      // Body overflow verhindern wenn Modal offen
      document.body.style.overflow = "hidden";
    };

    const closeUserDetail = () => {
      selectedUser.value = null;
      // Body overflow wiederherstellen
      document.body.style.overflow = "";
    };

    const refreshChildComponents = () => {
      // Force refresh der Child-Components durch Key-Änderung
      refreshKey.value += 1;
    };

    const handleUserRestored = async (user: DeletedUser) => {
      try {
        // API Call zum Wiederherstellen
        await userService.restoreUser(user.id);
        console.log("Benutzer wiederhergestellt:", user);

        // Modal schließen
        closeUserDetail();

        // Child-Components refreshen
        refreshChildComponents();
      } catch (error) {
        console.error("Fehler beim Wiederherstellen:", error);
        errorMessage.value = "Fehler beim Wiederherstellen des Benutzers. Bitte versuchen Sie es später erneut.";
        showErrorModal.value = true;
      }
    };

    const handleUserPermanentlyDeleted = async (user: DeletedUser) => {
      try {
        await userService.deleteUserForever(user.id);
        console.log("Benutzer endgültig gelöscht:", user);
        closeUserDetail();

        refreshChildComponents();
      } catch (error) {
        console.error("Fehler beim endgültigen Löschen:", error);
        errorMessage.value = "Fehler beim endgültigen Löschen des Benutzers. Bitte versuchen Sie es später erneut.";
        showErrorModal.value = true;
      }
    };

    // Cleanup bei Component Unmount
    onUnmounted(() => {
      document.body.style.overflow = "";
    });

    return {
      activeTab,
      selectedUser,
      refreshKey,
      showErrorModal,
      errorMessage,
      handleUserSelected,
      closeUserDetail,
      handleUserRestored,
      handleUserPermanentlyDeleted,
    };
  },
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
  z-index: 2000;
  backdrop-filter: blur(3px);
}

.modal-dialog {
  background-color: #222;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  max-width: 500px;
  width: 90%;
  border: 1px solid #333;

  &.error-dialog {
    .modal-header {
      background-color: rgba(244, 67, 54, 0.1);
      border-bottom-color: rgba(244, 67, 54, 0.3);

      h3 {
        color: #f44336;
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }
  }
}

.modal-header {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #333;

  h3 {
    margin: 0;
    font-size: 1.25rem;
    color: #fff;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #888;
    cursor: pointer;
    width: 32px;
    height: 32px;
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

.modal-body {
  padding: 24px;

  p {
    margin: 0;
    line-height: 1.6;
    color: #e0e0e0;
  }
}

.modal-footer {
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #333;

  .btn-primary {
    padding: 10px 20px;
    background-color: #ff9800;
    border: none;
    border-radius: 4px;
    color: #fff;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background-color: #f57c00;
      transform: translateY(-1px);
    }
  }
}
</style>