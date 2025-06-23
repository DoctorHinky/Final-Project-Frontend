<!-- src/components/admin/users/UserList.vue -->
<template>
  <div class="user-list-container">
    <div class="list-header">
      <div class="header-title-section">
        <h2>Alle Benutzer</h2>
        <div class="user-count-badge">
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
            class="h-4 w-4"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="5" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span>{{ totalUsersCount }} registrierte Benutzer</span>
        </div>
      </div>
      <div class="header-actions">
        <div class="filter-container">
          <!-- Custom Dropdown -->
          <div class="custom-select" :class="{ open: isDropdownOpen }">
            <div class="select-trigger" @click="toggleDropdown">
              <span>{{ getFilterLabel(userFilter) }}</span>
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
                class="chevron"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <div class="select-options" v-if="isDropdownOpen">
              <div
                class="select-option"
                v-for="option in filterOptions"
                :key="option.value"
                :class="{ selected: userFilter === option.value }"
                @click="selectFilter(option.value)"
              >
                {{ option.label }}
              </div>
            </div>
          </div>
        </div>
        <div class="search-container">
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
            class="search-icon h-4 w-4"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input type="text" v-model="searchQuery" placeholder="Schnellsuche..." class="search-input" />
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
                  class="h-8 w-8"
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
            :class="{ 'hidden-user': hiddenUsers.has(user.id) }"
          >
            <td class="col-id">{{ user.id }}</td>
            <td class="col-name">
              <div class="user-name-cell">
                <div class="user-avatar">
                  <span v-if="!user.profilePicture">{{ getUserInitials(user) }}</span>
                  <img v-else :src="user.profilePicture" :alt="`Avatar von ${user.username}`" />
                </div>
                <span>{{ user.username }}</span>
              </div>
            </td>
            <td class="col-email">{{ user.email }}</td>
            <td class="col-type">
              <span
                :class="{
                  'text-red-600 font-bold': user.role === 'ADMIN',
                  'text-blue-600 font-semibold': user.role === 'AUTHOR',
                  'text-gray-800': user.role === 'CHILD' || user.role === 'ADULT',
                }"
              >
                {{ roleLabel(user.role) }}
              </span>
            </td>
            <td class="col-actions">
              <button
                class="action-button hide-button"
                @click.stop="toggleHideUser(user.id)"
                :title="hiddenUsers.has(user.id) ? 'Benutzer einblenden' : 'Benutzer ausblenden'"
              >
                <svg
                  v-if="!hiddenUsers.has(user.id)"
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
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                  ></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
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
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
              <button class="action-button view-button" @click.stop="viewUserDetails(user.id)" title="Details anzeigen">
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
            </td>
          </tr>
        </tbody>
      </table>
      <div class="toggle-hidden-container" v-if="hiddenUsers.size > 0">
        <button @click="showHiddenUsers = !showHiddenUsers" class="btn-toggle-hidden">
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
            <path v-if="!showHiddenUsers" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle v-if="!showHiddenUsers" cx="12" cy="12" r="3"></circle>
            <path
              v-else
              d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
            ></path>
            <line v-else x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
          {{ showHiddenUsers ? "Ausgeblendete verbergen" : `Ausgeblendete anzeigen (${hiddenUsers.size})` }}
        </button>
        <button @click="unhideAllUsers" class="btn-unhide-all" title="Alle Benutzer wieder einblenden">
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
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          Alle einblenden
        </button>
      </div>
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
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from "vue";
import type { User, UserRoles } from "@/types/dtos";
import UserService from "@/services/user.service";

/* 
  deleted users muss über einen anderen endpoint geladen werden,
  damit gelöschte Benutzer nicht in der Hauptliste erscheinen.
*/

export default defineComponent({
  name: "UserList",
  emits: ["user-selected"],
  setup(_props, { emit }) {
    const users = ref<User[]>([]);
    const isLoading = ref(true);
    const searchQuery = ref("");
    const userFilter = ref("all");
    const currentPage = ref(1);
    const itemsPerPage = 10;
    const showHiddenUsers = ref(false);
    const hiddenUsers = ref(new Set<string>());
    const isDropdownOpen = ref(false);
    const totalUsersCount = ref(0);

    // Filter-Optionen für das Custom Dropdown
    const filterOptions = [
      { value: "all", label: "Alle Rollen" },
      { value: "ADMIN", label: "Admins" },
      { value: "AUTHOR", label: "Autoren" },
      { value: "ADULT", label: "Erwachsene" },
      { value: "CHILD", label: "Kinder" },
      { value: "MODERATOR", label: "Moderatoren" },
    ];

    function getFilterLabel(value: string): string {
      const option = filterOptions.find((opt) => opt.value === value);
      return option ? option.label : "Alle Rollen";
    }

    function toggleDropdown() {
      isDropdownOpen.value = !isDropdownOpen.value;
    }

    function selectFilter(value: string) {
      userFilter.value = value;
      isDropdownOpen.value = false;
      resetPagination();
    }

    // Klick außerhalb des Dropdowns schließt es
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest(".custom-select")) {
        isDropdownOpen.value = false;
      }
    }

    onMounted(() => document.addEventListener("click", handleClickOutside));

    onUnmounted(() => {
      document.removeEventListener("click", handleClickOutside);
    });

    function roleLabel(role: UserRoles): string {
      switch (role) {
        case "ADMIN":
          return "Admin";
        case "AUTHOR":
          return "Autor";
        case "ADULT":
          return "Erwachsener";
        case "CHILD":
          return "Kind";
        case "MODERATOR":
          return "Moderator";
        default:
          return "Unbekannt";
      }
    }

    onMounted(async () => {
      isLoading.value = true;
      try {
        users.value = await UserService.getAllUsers();
        totalUsersCount.value = users.value.length;
      } catch (error) {
        console.error("Fehler beim Laden der Benutzer:", error);
      } finally {
        isLoading.value = false;
      }
    });

    // Benutzer ausblenden/einblenden
    const toggleHideUser = (userId: string) => {
      if (hiddenUsers.value.has(userId)) {
        hiddenUsers.value.delete(userId);
      } else {
        hiddenUsers.value.add(userId);
      }
    };

    // Gefilterte Benutzer
    const filteredUsers = computed(() => {
      let result = [...users.value];

      // Ausgeblendete Benutzer filtern
      if (!showHiddenUsers.value) {
        result = result.filter((user) => !hiddenUsers.value.has(user.id));
      }

      // Rollenfilter
      if (userFilter.value !== "all") {
        result = result.filter((user) => user.role === userFilter.value);
      }

      // Suchfilter
      if (searchQuery.value.trim() !== "") {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(
          (user) =>
            user.username.toLowerCase().includes(query) ||
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
    const resetPagination = () => (currentPage.value = 1);

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

    // Benutzer-Initialen generieren
    const getUserInitials = (user: User): string => {
      if (!user.username) return "??";

      const nameParts = user.username.split(" ");
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      }

      return nameParts[0].substring(0, 2).toUpperCase();
    };

    // Alle ausgeblendeten Benutzer wieder einblenden
    const unhideAllUsers = () => {
      hiddenUsers.value.clear();
      showHiddenUsers.value = false;
    };

    return {
      users,
      isLoading,
      searchQuery,
      userFilter,
      showHiddenUsers,
      hiddenUsers,
      filteredUsers,
      paginatedUsers,
      currentPage,
      totalPages,
      totalUsersCount,
      viewUserDetails,
      toggleHideUser,
      getUserInitials,
      roleLabel,
      isDropdownOpen,
      filterOptions,
      getFilterLabel,
      toggleDropdown,
      selectFilter,
      unhideAllUsers,
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

  .header-title-section {
    display: flex;
    align-items: center;
    gap: 16px;

    h2 {
      font-size: 1.5rem;
      margin: 0;
      color: #f0f0f0;
    }

    .user-count-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background-color: rgba(0, 120, 215, 0.1);
      border: 1px solid rgba(0, 120, 215, 0.3);
      border-radius: 20px;
      color: #0078d7;
      font-size: 0.85rem;
      font-weight: 500;
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;

    // Custom Select Dropdown
    .custom-select {
      position: relative;
      min-width: 150px;

      .select-trigger {
        padding: 8px 12px;
        background-color: #2a2a2a;
        border: 1px solid #444;
        border-radius: 4px;
        color: #f0f0f0;
        font-size: 0.9rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        transition: all 0.3s ease;

        &:hover {
          border-color: #666;
          background-color: #333;
        }

        .chevron {
          transition: transform 0.3s ease;
        }
      }

      &.open {
        .select-trigger {
          border-color: #666;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;

          .chevron {
            transform: rotate(180deg);
          }
        }

        .select-options {
          border-top: none;
          border-top-left-radius: 0;
          border-top-right-radius: 0;
        }
      }

      .select-options {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background-color: #2a2a2a;
        border: 1px solid #444;
        border-radius: 4px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        z-index: 100;

        .select-option {
          padding: 10px 12px;
          color: #f0f0f0;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background-color: #333;
          }

          &.selected {
            background-color: #3a3a3a;
            color: #0078d7;
            font-weight: 500;
          }

          &:first-child {
            border-top-left-radius: 3px;
            border-top-right-radius: 3px;
          }

          &:last-child {
            border-bottom-left-radius: 3px;
            border-bottom-right-radius: 3px;
          }
        }
      }
    }

    .search-container {
      position: relative;

      .search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #777;
        pointer-events: none;
      }

      .search-input {
        padding: 8px 12px 8px 36px;
        background-color: #2a2a2a;
        border: 1px solid #444;
        border-radius: 4px;
        color: #f0f0f0;
        font-size: 0.9rem;
        width: 200px;
        transition: all 0.3s ease;

        &:focus {
          outline: none;
          border-color: #666;
          background-color: #333;
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

      &.hidden-user {
        opacity: 0.5;
        background-color: #1a1a1a;
      }

      td {
        color: #f0f0f0;
      }
    }

    .col-id {
      width: 30%;
      color: #777;
      font-size: 0.85rem;
    }

    .col-name {
      width: 25%;

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
      width: 30%;
      color: #a0a0a0;
    }

    .col-status,
    .col-type {
      width: 10%;
      text-align: center;
    }

    .col-actions {
      width: 120px;
      text-align: right;
      white-space: nowrap;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
      text-align: center;

      &.active {
        background-color: rgba(46, 204, 113, 0.2);
        color: #2ecc71;
      }

      &.inactive {
        background-color: rgba(231, 76, 60, 0.2);
        color: #e74c3c;
      }
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
      margin-left: 4px;

      &:hover {
        background-color: #444;
        color: #f0f0f0;
      }

      &.hide-button {
        background-color: rgba(0, 120, 215, 0.2);
        color: #0078d7;

        &:hover {
          background-color: rgba(0, 120, 215, 0.3);
        }
      }

      &.view-button {
        background-color: rgba(255, 152, 0, 0.2);
        color: #ff9800;

        &:hover {
          background-color: rgba(255, 152, 0, 0.3);
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

  .toggle-hidden-container {
    margin-top: 1rem;
    text-align: right;
    padding: 0 1rem;
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    .btn-toggle-hidden,
    .btn-unhide-all {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background-color: #2a2a2a;
      border: 1px solid #444;
      border-radius: 4px;
      color: #f0f0f0;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background-color: #333;
        border-color: #666;
      }
    }

    .btn-unhide-all {
      background-color: rgba(0, 120, 215, 0.2);
      color: #0078d7;
      border-color: rgba(0, 120, 215, 0.4);

      &:hover {
        background-color: rgba(0, 120, 215, 0.3);
        border-color: rgba(0, 120, 215, 0.6);
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

// Utility-Klassen für Rollendarstellung
.text-red-600 {
  color: #dc2626;
}

.text-blue-600 {
  color: #2563eb;
}

.text-gray-800 {
  color: #cccccc;
}

.font-bold {
  font-weight: 700;
}

.font-semibold {
  font-weight: 600;
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

    .header-title-section {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .header-actions {
      width: 100%;
      justify-content: space-between;

      .custom-select {
        min-width: 120px;
      }

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
