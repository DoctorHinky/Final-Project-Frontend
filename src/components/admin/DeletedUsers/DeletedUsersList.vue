<!-- src/components/admin/DeletedUsers/DeletedUsersList.vue -->
<template>
  <div class="deleted-users-list">
    <div class="list-header">
      <h2>Gelöschte Benutzer</h2>
      <div class="header-stats">
        <span class="stat-badge">
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
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
          {{ deletedUsers.length }} gelöschte Benutzer
        </span>
      </div>
    </div>

    <div class="users-table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>Benutzer</th>
            <th>E-Mail</th>
            <th>Rolle</th>
            <th>Löschgrund</th>
            <th>Gelöscht am</th>
            <th>Gelöscht von</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody v-if="isLoading">
          <tr>
            <td colspan="7" class="loading-cell">
              <div class="loading-spinner"></div>
              <span>Lade gelöschte Benutzer...</span>
            </td>
          </tr>
        </tbody>
        <tbody v-else-if="deletedUsers.length === 0">
          <tr>
            <td colspan="7" class="empty-cell">
              <div class="empty-message">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 12h8"></path>
                </svg>
                <p>Keine gelöschten Benutzer gefunden</p>
              </div>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr v-for="user in paginatedUsers" :key="user.id" class="user-row" @click="selectUser(user)">
            <td>
              <div class="user-cell">
                <div class="user-avatar">
                  <span>{{ getUserInitials(user) }}</span>
                </div>
                <div class="user-info">
                  <span class="user-name">{{ getUserDisplayName(user) }}</span>
                  <span class="user-username">@{{ user.username || "N/A" }}</span>
                </div>
              </div>
            </td>
            <td>{{ user.email }}</td>
            <td>
              <span class="role-badge" :class="user.role?.toLowerCase()">
                {{ getRoleLabel(user.role) }}
              </span>
            </td>
            <td>
              <span class="reason-badge" :class="getReasonClass(user.deleteReason)">
                {{ getReasonText(user.deleteReason) }}
              </span>
            </td>
            <td>{{ formatDate(user.deletedAt, "Unbekannt") }}</td>
            <td>{{ user.deletedByUser?.username || "System" }}</td>
            <td>
              <div class="action-buttons">
                <button class="action-button restore" @click.stop="handleRestore(user)" title="Wiederherstellen">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                    <path d="M21 3v5h-5"></path>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                    <path d="M8 16H3v5"></path>
                  </svg>
                </button>
                <button class="action-button view" @click.stop="selectUser(user)" title="Details anzeigen">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4"></path>
                    <path d="M12 8h.01"></path>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination-container" v-if="totalPages > 1">
      <button class="pagination-button" :disabled="currentPage === 1" @click="currentPage--">
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
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <span class="page-info">Seite {{ currentPage }} von {{ totalPages }}</span>

      <button class="pagination-button" :disabled="currentPage === totalPages" @click="currentPage++">
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
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>

    <!-- Confirm Modal -->
    <Teleport to="body">
      <div v-if="showConfirmModal" class="modal-overlay" @click="showConfirmModal = false">
        <div class="modal-dialog confirm-dialog" @click.stop>
          <div class="modal-header">
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
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                <path d="M21 3v5h-5"></path>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                <path d="M8 16H3v5"></path>
              </svg>
              Bestätigung
            </h3>
            <button class="close-button" @click="showConfirmModal = false">×</button>
          </div>
          <div class="modal-body">
            <p>{{ confirmMessage }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="showConfirmModal = false">Abbrechen</button>
            <button class="btn-confirm" @click="confirmAction && confirmAction()">Wiederherstellen</button>
          </div>
        </div>
      </div>
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
import { defineComponent, ref, computed, onMounted } from "vue";
import userService from "@/services/user.service";
import { formatDate } from "@/utils/helperFunctions";
import type { DeletedUser } from "@/types";
import { getReasonText, getReasonClass, getUserInitials } from "./deletedUsers.helper";

export default defineComponent({
  name: "DeletedUsersList",
  emits: ["user-selected", "user-restored"],
  setup(_, { emit }) {
    const deletedUsers = ref<DeletedUser[]>([]);
    const isLoading = ref(true);
    const currentPage = ref(1);
    const itemsPerPage = 10;
    
    // Modal States
    const showConfirmModal = ref(false);
    const showErrorModal = ref(false);
    const confirmAction = ref<(() => void) | null>(null);
    const confirmMessage = ref("");
    const errorMessage = ref("");

    // Anzeigename generieren
    const getUserDisplayName = (user: DeletedUser): string => {
      if (user.firstname && user.lastname) {
        return `${user.firstname} ${user.lastname}`;
      }
      return user.username || "Gelöschter Benutzer";
    };

    // Rollen-Label
    const getRoleLabel = (role?: string): string => {
      const roleMap: Record<string, string> = {
        ADMIN: "Admin",
        MODERATOR: "Moderator",
        AUTHOR: "Autor",
        ADULT: "Erwachsener",
        CHILD: "Kind",
        USER: "Benutzer",
      };
      return roleMap[role || ""] || role || "Unbekannt";
    };

    // Paginierte Benutzer
    const paginatedUsers = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return deletedUsers.value.slice(start, end);
    });

    // Gesamtzahl der Seiten
    const totalPages = computed(() => {
      return Math.ceil(deletedUsers.value.length / itemsPerPage);
    });

    // Benutzer auswählen
    const selectUser = (user: DeletedUser) => emit("user-selected", user);

    // Benutzer wiederherstellen
    const handleRestore = async (user: DeletedUser) => {
      confirmMessage.value = `Möchten Sie den Benutzer "${getUserDisplayName(user)}" wirklich wiederherstellen?`;
      confirmAction.value = async () => {
        try {
          await userService.restoreUser(user.id);
          emit("user-restored", user);
          showConfirmModal.value = false;
          // Liste wird durch parent component refresh aktualisiert
        } catch (error) {
          console.error("Fehler beim Wiederherstellen:", error);
          showConfirmModal.value = false;
          errorMessage.value = "Fehler beim Wiederherstellen des Benutzers. Bitte versuchen Sie es später erneut.";
          showErrorModal.value = true;
        }
      };
      showConfirmModal.value = true;
    };

    // Daten laden
    const loadDeletedUsers = async () => {
      try {
        isLoading.value = true;
        deletedUsers.value = await userService.getDeletedUsers();
      } catch (error) {
        console.error("Fehler beim Laden der gelöschten Benutzer:", error);
        deletedUsers.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => loadDeletedUsers());

    return {
      deletedUsers,
      isLoading,
      currentPage,
      itemsPerPage,
      paginatedUsers,
      totalPages,
      showConfirmModal,
      showErrorModal,
      confirmAction,
      confirmMessage,
      errorMessage,
      getUserInitials,
      getUserDisplayName,
      getRoleLabel,
      getReasonText,
      getReasonClass,
      formatDate,
      selectUser,
      handleRestore,
    };
  },
});
</script>

<style lang="scss" scoped>
.deleted-users-list {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  padding: 24px;
  border: 1px solid #333;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h2 {
    font-size: 1.5rem;
    margin: 0;
    color: #f0f0f0;
  }

  .stat-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background-color: rgba(231, 76, 60, 0.1);
    border: 1px solid rgba(231, 76, 60, 0.3);
    border-radius: 20px;
    color: #e74c3c;
    font-size: 0.9rem;
    font-weight: 500;
  }
}

.users-table-container {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #333;

  .users-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;

    th,
    td {
      padding: 12px 16px;
      border-bottom: 1px solid #333;
    }

    th {
      background-color: #262626;
      color: #a0a0a0;
      font-weight: 500;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .user-row {
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background-color: #2a2a2a;
      }

      td {
        color: #f0f0f0;
      }
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 12px;

      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #636e72 0%, #2d3436 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 0.9rem;
      }

      .user-info {
        display: flex;
        flex-direction: column;

        .user-name {
          font-weight: 500;
        }

        .user-username {
          font-size: 0.85rem;
          color: #888;
        }
      }
    }

    .role-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;

      &.admin {
        background: rgba(231, 76, 60, 0.2);
        color: #e74c3c;
      }

      &.moderator {
        background: rgba(52, 152, 219, 0.2);
        color: #3498db;
      }

      &.author {
        background: rgba(255, 152, 0, 0.2);
        color: #ff9800;
      }

      &.adult,
      &.child,
      &.user {
        background: rgba(149, 165, 166, 0.2);
        color: #95a5a6;
      }
    }

    .reason-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;

      &.violation {
        background-color: rgba(231, 76, 60, 0.2);
        color: #e74c3c;
      }

      &.self-deletion {
        background-color: rgba(52, 152, 219, 0.2);
        color: #3498db;
      }

      &.admin-deletion {
        background-color: rgba(255, 152, 0, 0.2);
        color: #ff9800;
      }

      &.inactivity {
        background-color: rgba(149, 165, 166, 0.2);
        color: #95a5a6;
      }

      &.other {
        background-color: rgba(155, 89, 182, 0.2);
        color: #9b59b6;
      }
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .action-button {
      width: 32px;
      height: 32px;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      background-color: #333;
      color: #a0a0a0;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background-color: #444;
        color: #f0f0f0;
      }

      &.restore {
        background-color: rgba(46, 204, 113, 0.2);
        color: #2ecc71;

        &:hover {
          background-color: rgba(46, 204, 113, 0.3);
        }
      }

      &.view {
        background-color: rgba(0, 120, 215, 0.2);
        color: #0078d7;

        &:hover {
          background-color: rgba(0, 120, 215, 0.3);
        }
      }
    }

    .loading-cell,
    .empty-cell {
      height: 300px;
      text-align: center;
      color: #a0a0a0;

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        border-top-color: #ff9800;
        animation: spin 1s linear infinite;
        margin: 0 auto 12px;
      }

      .empty-message {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        opacity: 0.5;

        p {
          margin: 0;
          font-size: 1.1rem;
        }
      }
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;

  .pagination-button {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #444;
    background-color: #2a2a2a;
    color: #f0f0f0;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
      background-color: #333;
      border-color: #666;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .page-info {
    color: #a0a0a0;
    font-size: 0.9rem;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
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
  animation: modal-appear 0.3s ease-out;

  &.confirm-dialog {
    .modal-header h3 {
      color: #2ecc71;
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

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

  .btn-cancel {
    padding: 10px 20px;
    background-color: transparent;
    border: 1px solid #555;
    border-radius: 4px;
    color: #ccc;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background-color: #444;
      color: #fff;
    }
  }

  .btn-confirm {
    padding: 10px 20px;
    background-color: #2ecc71;
    border: none;
    border-radius: 4px;
    color: #fff;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background-color: #27ae60;
      transform: translateY(-1px);
    }
  }

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

@media (max-width: 1024px) {
  .users-table-container {
    th:nth-child(5),
    td:nth-child(5),
    th:nth-child(6),
    td:nth-child(6) {
      display: none;
    }
  }
}

@media (max-width: 768px) {
  .users-table-container {
    th:nth-child(3),
    td:nth-child(3),
    th:nth-child(4),
    td:nth-child(4) {
      display: none;
    }
  }
}
</style>