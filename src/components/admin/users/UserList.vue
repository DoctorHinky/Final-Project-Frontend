<!-- src/components/admin/users/UserList.vue -->
<template>
  <div class="user-list-container">
    <div class="list-header">
      <h2>Alle Benutzer</h2>
      <div class="header-actions">
        <div class="filter-container">
          <select v-model="userFilter" class="filter-select">
            <option value="all">Alle Rollen</option>
            <option value="ADMIN">Admins</option>
            <option value="AUTHOR">Autoren</option>
            <option value="USER">Normale Nutzer</option>
          </select>
        </div>
        <div class="search-container">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Schnellsuche..."
            class="search-input"
          />
        </div>
      </div>
    </div>

    <div class="users-table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th class="col-id">ID</th>
            <th class="col-name">Name</th>
            <th class="col-email">E-Mail</th>
            <th class="col-status">Status</th>
            <th class="col-type">Typ</th>
            <th class="col-actions">Aktionen</th>
          </tr>
        </thead>
        <tbody v-if="isLoading">
          <tr>
            <td colspan="6" class="loading-cell">
              <div class="loading-spinner"></div>
              <span>Lade Benutzerdaten...</span>
            </td>
          </tr>
        </tbody>
        <tbody v-else-if="filteredUsers.length === 0">
          <tr>
            <td colspan="6" class="empty-cell">
              <div class="empty-message">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                <p>Keine Benutzer gefunden</p>
              </div>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr
            v-for="user in paginatedUsers"
            :key="user.id"
            @click="viewUserDetails(user.id)"
            class="user-row"
          >
            <td class="col-id">{{ user.id }}</td>
            <td class="col-name">
              <div class="user-name-cell">
                <div class="user-avatar">
                  <span v-if="!user.avatarUrl">{{
                    getUserInitials(user)
                  }}</span>
                  <img
                    v-else
                    :src="user.avatarUrl"
                    :alt="`Avatar von ${user.name}`"
                  />
                </div>
                <span>{{ user.name }}</span>
              </div>
            </td>
            <td class="col-email">{{ user.email }}</td>
            <td class="col-status">
              <span
                class="status-badge"
                :class="{
                  active: user.status === 'active',
                  inactive: user.status === 'inactive',
                }"
              >
                {{ user.status === "active" ? "Aktiv" : "Inaktiv" }}
              </span>
            </td>
            <td class="col-type">
              <span
                :class="{
                  'text-red-600 font-bold': user.role === 'ADMIN',
                  'text-blue-600 font-semibold': user.role === 'AUTHOR',
                  'text-gray-800': user.role === 'USER',
                }"
              >
                {{ roleLabel(user.role) }}
              </span>
            </td>
            <td class="col-actions">
              <button
                class="action-button view-button"
                @click.stop="viewUserDetails(user.id)"
              >
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
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
              <button
                class="action-button toggle-button"
                :class="{
                  deactivate: user.status === 'active',
                  activate: user.status === 'inactive',
                }"
                @click.stop="toggleUserStatus(user)"
              >
                <svg
                  v-if="user.status === 'active'"
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
                  <rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect>
                  <circle cx="16" cy="12" r="3"></circle>
                </svg>
                <svg
                  v-else
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
                  <rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect>
                  <circle cx="8" cy="12" r="3"></circle>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div
        class="toggle-inactive-container"
        style="margin-top: 1rem; text-align: right"
      >
        <button
          @click="showInactiveUsers = !showInactiveUsers"
          class="btn-toggle-inactive"
        >
          {{
            showInactiveUsers
              ? "Ausgeblendete ausblenden"
              : "Ausgeblendete anzeigen"
          }}
        </button>
      </div>
    </div>

    <div class="pagination-container" v-if="totalPages > 1">
      <button
        class="pagination-button"
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
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

      <span class="page-info"
        >Seite {{ currentPage }} von {{ totalPages }}</span
      >

      <button
        class="pagination-button"
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
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
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import type { User } from "@/services/user.types";
import UserService from "@/services/user.service";

export default defineComponent({
  name: "UserList",
  emits: ["user-selected"],
  setup(props, { emit }) {
    const users = ref<User[]>([]);
    const isLoading = ref(true);
    const searchQuery = ref("");
    const userFilter = ref("all");
    const currentPage = ref(1);
    const itemsPerPage = 10;
    const roleFilter = ref("all");
    const showInactiveUsers = ref(false);
function roleLabel(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "AUTHOR":
      return "Autor";
    case "USER":
      return "Nutzer";
    case "MODERATOR":
      return "Moderator";
    default:
      return "Unbekannt";
  }
}
    onMounted(async () => {
      isLoading.value = true;
      try {
        const allUsers = await UserService.getAllUsers();
        console.log("GELADENE ROLLEN:", allUsers.map(u => u.role));
 users.value = allUsers.map((u) => ({
  id: u.id,
  name: u.username,
  email: u.email,
  status: u.deactivated ? "inactive" : "active",
  role: ["ADMIN", "AUTHOR", "USER", "MODERATOR"].includes(u.role)
  ? (u.role as UserRole)
  : "USER",
}));


      } catch (error) {
        console.error("Fehler beim Laden der Benutzer:", error);
      } finally {
        isLoading.value = false;
      }
    });

    // Gefilterte Benutzer
    const filteredUsers = computed(() => {
  let result = [...users.value];

  // Statusfilter
  if (userFilter.value === "active") {
    result = result.filter(user =>
      user.status === "active" || (showInactiveUsers.value && user.status === "inactive")
    );
  } else if (userFilter.value === "inactive") {
    result = result.filter(user => user.status === "inactive");
  }

  // Rollenfilter
  if (roleFilter.value !== "all") {
    result = result.filter(user => user.role === roleFilter.value);
  }

  // Suchfilter
  if (searchQuery.value.trim() !== "") {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query)
    );
  }

  return result;
});

    // Paginierte Benutzer
    const paginatedUsers = computed(() => {
      const startIndex = (currentPage.value - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return filteredUsers.value.slice(startIndex, endIndex);
    });

    // Gesamtzahl der Seiten
    const totalPages = computed(() => {
      return Math.ceil(filteredUsers.value.length / itemsPerPage);
    });

    // Bei Änderung des Filters oder der Suche zur ersten Seite zurückkehren
    const resetPagination = () => {
      currentPage.value = 1;
    };

    // Beobachter für Filter und Suche
    const setupWatchers = () => {
      const watchEffect = (callback: () => void) => {
        return callback;
      };

      watchEffect(() => {
        if (userFilter.value) {
          resetPagination();
        }
      })();

      watchEffect(() => {
        if (searchQuery.value) {
          resetPagination();
        }
      })();
    };

    setupWatchers();

    // Benutzerdetails anzeigen
    const viewUserDetails = (userId: string) => {
      emit("user-selected", userId);
    };

    // Benutzerstatus umschalten
    const toggleUserStatus = async (user: User) => {
      const newStatus = user.status === "inactive" ? false : true;

      try {
        await UserService.toggleUserDeactivation(user.id, !newStatus);

        // Lokalen Zustand updaten
        user.status = newStatus ? "inactive" : "active";
      } catch (error) {
        console.error("Aktualisierung fehlgeschlagen:", error);
        alert("Fehler beim Ändern des Benutzerstatus.");
      }
    };
    // Benutzer-Initialen generieren
    const getUserInitials = (user: User): string => {
      if (!user.name) return "??";

      const nameParts = user.name.split(" ");
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      }

      return nameParts[0].substring(0, 2).toUpperCase();
    };

    return {
  users,
  isLoading,
  searchQuery,
  userFilter,
  roleFilter,
  showInactiveUsers,
  filteredUsers,
  paginatedUsers,
  currentPage,
  totalPages,
  viewUserDetails,
  toggleUserStatus,
  getUserInitials,
  roleLabel,
};
  },
});
</script>

<style lang="scss" scoped>
.user-list-container {
  background-color: #222;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  padding: 24px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  border: 1px solid #333;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 16px;

  h2 {
    font-size: 1.5rem;
    margin: 0;
    color: #f0f0f0;
  }

  .header-actions {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;

    .filter-container {
      .filter-select {
        padding: 8px 12px;
        background-color: #2a2a2a;
        border: 1px solid #444;
        border-radius: 4px;
        color: #f0f0f0;
        font-size: 0.9rem;
        cursor: pointer;

        &:focus {
          outline: none;
          border-color: #666;
        }

        option {
          background-color: #2a2a2a;
        }
      }
    }

    .search-container {
      .search-input {
        padding: 8px 12px;
        background-color: #2a2a2a;
        border: 1px solid #444;
        border-radius: 4px;
        color: #f0f0f0;
        font-size: 0.9rem;
        width: 200px;

        &:focus {
          outline: none;
          border-color: #666;
        }

        &::placeholder {
          color: #777;
        }
      }
    }
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

    .col-id {
      width: 100px;
      color: #777;
      font-size: 0.85rem;
    }

    .col-name {
      min-width: 200px;

      .user-name-cell {
        display: flex;
        align-items: center;
        gap: 12px;

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #444;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          font-size: 0.8rem;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }
    }

    .col-email {
      min-width: 200px;
      color: #a0a0a0;
    }

    .col-status,
    .col-type {
      width: 120px;
      text-align: center;
    }

    .col-actions {
      width: 100px;
      text-align: right;
      white-space: nowrap;
    }

    .status-badge,
    .type-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
      text-align: center;
    }

    .status-badge {
      &.active {
        background-color: rgba(46, 204, 113, 0.2);
        color: #2ecc71;
      }

      &.inactive {
        background-color: rgba(231, 76, 60, 0.2);
        color: #e74c3c;
      }
    }

    .type-badge {
      background-color: #333;
      color: #a0a0a0;

      &.author {
        background-color: rgba(255, 152, 0, 0.2);
        color: #ff9800;
      }
    }

    .action-button {
      width: 32px;
      height: 32px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background-color: #333;
      color: #a0a0a0;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-left: 4px;
      display: inline-flex;

      &:hover {
        background-color: #444;
        color: #f0f0f0;
      }

      &.view-button {
        background-color: rgba(0, 120, 215, 0.2);
        color: #0078d7;

        &:hover {
          background-color: rgba(0, 120, 215, 0.3);
        }
      }

      &.toggle-button {
        &.activate {
          background-color: rgba(46, 204, 113, 0.2);
          color: #2ecc71;

          &:hover {
            background-color: rgba(46, 204, 113, 0.3);
          }
        }

        &.deactivate {
          background-color: rgba(231, 76, 60, 0.2);
          color: #e74c3c;

          &:hover {
            background-color: rgba(231, 76, 60, 0.3);
          }
        }
      }
    }

    .loading-cell,
    .empty-cell {
      height: 200px;
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
        gap: 12px;
        opacity: 0.5;

        p {
          margin: 0;
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
  margin-top: 16px;

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

@media (max-width: 768px) {
  .list-header {
    flex-direction: column;
    align-items: flex-start;

    .header-actions {
      width: 100%;
      justify-content: space-between;

      .search-container .search-input {
        width: 100%;
      }
    }
  }

  .users-table {
    font-size: 0.9rem;

    .col-id,
    .col-status,
    .col-type {
      display: none;
    }
  }
}
</style>
