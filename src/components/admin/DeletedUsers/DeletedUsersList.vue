<!-- src/components/admin/users/DeletedUsersList.vue -->
<template>
  <div class="deleted-users-container">
    <div class="list-header">
      <h2>Gelöschte Benutzer</h2>
      <div class="header-actions">
        <div class="filter-container">
          <!-- Custom Dropdown für Löschgrund -->
          <div class="custom-select" :class="{ open: isReasonDropdownOpen }">
            <div class="select-trigger" @click="toggleReasonDropdown">
              <span>{{ getReasonLabel(reasonFilter) }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chevron">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <div class="select-options" v-if="isReasonDropdownOpen">
              <div class="select-option" 
                   v-for="option in reasonOptions" 
                   :key="option.value"
                   :class="{ selected: reasonFilter === option.value }"
                   @click="selectReasonFilter(option.value)">
                {{ option.label }}
              </div>
            </div>
          </div>
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

    <div class="deleted-users-table-container">
      <table class="deleted-users-table">
        <thead>
          <tr>
            <th class="col-id">ID</th>
            <th class="col-name">Name</th>
            <th class="col-email">E-Mail</th>
            <th class="col-reason">Löschgrund</th>
            <th class="col-date">Gelöscht am</th>
            <th class="col-deletedby">Gelöscht von</th>
            <th class="col-actions">Aktionen</th>
          </tr>
        </thead>
        <tbody v-if="isLoading">
          <tr>
            <td colspan="7" class="loading-cell">
              <div class="loading-spinner"></div>
              <span>Lade gelöschte Benutzerdaten...</span>
            </td>
          </tr>
        </tbody>
        <tbody v-else-if="filteredDeletedUsers.length === 0">
          <tr>
            <td colspan="7" class="empty-cell">
              <div class="empty-message">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                <p>Keine gelöschten Benutzer gefunden</p>
              </div>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr
            v-for="user in paginatedDeletedUsers"
            :key="user.id"
            @click="viewDeletedUserDetails(user)"
            class="deleted-user-row"
            :class="{ 'hidden-user': hiddenUsers.has(user.id) }"
          >
            <td class="col-id">{{ user.id }}</td>
            <td class="col-name">
              <div class="user-name-cell">
                <div class="user-avatar deleted">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                </div>
                <span>{{ user.name }}</span>
              </div>
            </td>
            <td class="col-email">{{ user.email }}</td>
            <td class="col-reason">
              <span class="reason-badge" :class="getReasonClass(user.deletionReason)">
                {{ getReasonText(user.deletionReason) }}
              </span>
            </td>
            <td class="col-date">{{ formatDate(user.deletedAt) }}</td>
            <td class="col-deletedby">{{ user.deletedBy }}</td>
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
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
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
              <button
                class="action-button restore-button"
                @click.stop="restoreUser(user)"
                title="Benutzer wiederherstellen"
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
                  <polyline points="1 4 1 10 7 10"></polyline>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                </svg>
              </button>
              <button
                class="action-button delete-permanent-button"
                @click.stop="permanentDeleteUser(user)"
                title="Endgültig löschen"
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
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div
        class="toggle-hidden-container"
        v-if="hiddenUsers.size > 0"
      >
        <button
          @click="showHiddenUsers = !showHiddenUsers"
          class="btn-toggle-hidden"
        >
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
            <path v-else d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line v-else x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
          {{
            showHiddenUsers
              ? "Ausgeblendete verbergen"
              : `Ausgeblendete anzeigen (${hiddenUsers.size})`
          }}
        </button>
        <button
          @click="unhideAllUsers"
          class="btn-unhide-all"
          title="Alle Benutzer wieder einblenden"
        >
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
      <button
        class="pagination-button"
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <span class="page-info">Seite {{ currentPage }} von {{ totalPages }}</span>

      <button
        class="pagination-button"
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>

  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from "vue";
import UserService from "@/services/user.service";

type DeletionReason = "VIOLATION" | "SELF_DELETION" | "ADMIN_DELETION" | "INACTIVITY" | "OTHER";

interface DeletedUser {
  id: string;
  name: string;
  email: string;
  deletionReason: DeletionReason;
  deletedAt: Date;
  deletedBy: string;
  additionalInfo?: string;
}

export default defineComponent({
  name: "DeletedUsersList",
  emits: ["user-selected", "user-restored", "user-permanently-deleted"],
  setup(props, { emit }) {
    const deletedUsers = ref<DeletedUser[]>([]);
    const isLoading = ref(true);
    const searchQuery = ref("");
    const reasonFilter = ref("all");
    const currentPage = ref(1);
    const itemsPerPage = 15;
    const showHiddenUsers = ref(false);
    const hiddenUsers = ref(new Set<string>());
    const isReasonDropdownOpen = ref(false);

    // Filter-Optionen für Löschgrund
    const reasonOptions = [
      { value: "all", label: "Alle Löschgründe" },
      { value: "VIOLATION", label: "Regelverstöße" },
      { value: "SELF_DELETION", label: "Eigene Löschung" },
      { value: "ADMIN_DELETION", label: "Admin-Löschung" },
      { value: "INACTIVITY", label: "Inaktivität" },
      { value: "OTHER", label: "Sonstige" },
    ];

    function getReasonLabel(value: string): string {
      const option = reasonOptions.find(opt => opt.value === value);
      return option ? option.label : "Alle Löschgründe";
    }

    function toggleReasonDropdown() {
      isReasonDropdownOpen.value = !isReasonDropdownOpen.value;
    }

    function selectReasonFilter(value: string) {
      reasonFilter.value = value;
      isReasonDropdownOpen.value = false;
      currentPage.value = 1;
    }

    function getReasonText(reason: DeletionReason): string {
      switch (reason) {
        case "VIOLATION":
          return "Regelverstoß";
        case "SELF_DELETION":
          return "Eigene Löschung";
        case "ADMIN_DELETION":
          return "Admin-Löschung";
        case "INACTIVITY":
          return "Inaktivität";
        case "OTHER":
          return "Sonstige";
        default:
          return "Unbekannt";
      }
    }

    function getReasonClass(reason: DeletionReason): string {
      switch (reason) {
        case "VIOLATION":
          return "violation";
        case "SELF_DELETION":
          return "self-deletion";
        case "ADMIN_DELETION":
          return "admin-deletion";
        case "INACTIVITY":
          return "inactivity";
        default:
          return "other";
      }
    }

    function formatDate(date: Date): string {
      return new Date(date).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // Benutzer ausblenden/einblenden
    const toggleHideUser = (userId: string) => {
      if (hiddenUsers.value.has(userId)) {
        hiddenUsers.value.delete(userId);
      } else {
        hiddenUsers.value.add(userId);
      }
    };

    // Alle ausgeblendeten Benutzer wieder einblenden
    const unhideAllUsers = () => {
      hiddenUsers.value.clear();
      showHiddenUsers.value = false;
    };

    // Detailansicht öffnen
    const viewDeletedUserDetails = (user: DeletedUser) => {
      emit('user-selected', user);
    };

    // Benutzer wiederherstellen
    const restoreUser = async (user: DeletedUser) => {
      if (confirm(`Möchten Sie den Benutzer "${user.name}" wirklich wiederherstellen?`)) {
        try {
          // TODO: API-Aufruf implementieren
          // await UserService.restoreUser(user.id);
          
          // Aus der Liste entfernen
          deletedUsers.value = deletedUsers.value.filter(u => u.id !== user.id);
          
          // Event emittieren
          emit('user-restored', user);
          
          alert('Benutzer wurde erfolgreich wiederhergestellt.');
        } catch (error) {
          console.error('Fehler beim Wiederherstellen:', error);
          alert('Fehler beim Wiederherstellen des Benutzers.');
        }
      }
    };

    // Benutzer endgültig löschen
    const permanentDeleteUser = async (user: DeletedUser) => {
      if (confirm(`ACHTUNG: Diese Aktion kann nicht rückgängig gemacht werden!\n\nMöchten Sie den Benutzer "${user.name}" wirklich ENDGÜLTIG löschen?`)) {
        try {
          // TODO: API-Aufruf implementieren
          // await UserService.permanentDeleteUser(user.id);
          
          // Aus der Liste entfernen
          deletedUsers.value = deletedUsers.value.filter(u => u.id !== user.id);
          
          // Event emittieren
          emit('user-permanently-deleted', user);
          
          alert('Benutzer wurde endgültig gelöscht.');
        } catch (error) {
          console.error('Fehler beim endgültigen Löschen:', error);
          alert('Fehler beim endgültigen Löschen des Benutzers.');
        }
      }
    };

    // Klick außerhalb des Dropdowns
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest('.custom-select')) {
        isReasonDropdownOpen.value = false;
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
      loadDeletedUsers();
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    // Gelöschte Benutzer laden
    const loadDeletedUsers = async () => {
      isLoading.value = true;
      try {
        // TODO: API-Aufruf implementieren
        // const response = await UserService.getDeletedUsers();
        
        // Dummy-Daten für Demonstration
        deletedUsers.value = [
          {
            id: "del_001",
            name: "Max Mustermann",
            email: "max.mustermann@example.com",
            deletionReason: "VIOLATION",
            deletedAt: new Date("2024-01-15T14:30:00"),
            deletedBy: "Admin Schmidt",
            additionalInfo: "Mehrfache Verstöße gegen die Community-Richtlinien"
          },
          {
            id: "del_002",
            name: "Erika Beispiel",
            email: "erika.beispiel@example.com",
            deletionReason: "SELF_DELETION",
            deletedAt: new Date("2024-02-20T09:15:00"),
            deletedBy: "System"
          },
          {
            id: "del_003",
            name: "Klaus Tester",
            email: "klaus.tester@example.com",
            deletionReason: "INACTIVITY",
            deletedAt: new Date("2024-03-01T00:00:00"),
            deletedBy: "System",
            additionalInfo: "Automatische Löschung nach 2 Jahren Inaktivität"
          },
          {
            id: "del_004",
            name: "Maria Demo",
            email: "maria.demo@example.com",
            deletionReason: "ADMIN_DELETION",
            deletedAt: new Date("2024-03-10T16:45:00"),
            deletedBy: "Admin Weber",
            additionalInfo: "Auf Anfrage des Benutzers per Support-Ticket"
          },
        ];
      } catch (error) {
        console.error("Fehler beim Laden gelöschter Benutzer:", error);
      } finally {
        isLoading.value = false;
      }
    };

    // Gefilterte gelöschte Benutzer
    const filteredDeletedUsers = computed(() => {
      let result = [...deletedUsers.value];

      // Ausgeblendete Benutzer filtern
      if (!showHiddenUsers.value) {
        result = result.filter(user => !hiddenUsers.value.has(user.id));
      }

      // Löschgrund-Filter
      if (reasonFilter.value !== "all") {
        result = result.filter(user => user.deletionReason === reasonFilter.value);
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
    const paginatedDeletedUsers = computed(() => {
      const startIndex = (currentPage.value - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return filteredDeletedUsers.value.slice(startIndex, endIndex);
    });

    // Gesamtzahl der Seiten
    const totalPages = computed(() => {
      return Math.ceil(filteredDeletedUsers.value.length / itemsPerPage);
    });

    // Bei Änderung des Filters oder der Suche zur ersten Seite zurückkehren
    watch([reasonFilter, searchQuery], () => {
      currentPage.value = 1;
    });

    return {
      deletedUsers,
      isLoading,
      searchQuery,
      reasonFilter,
      currentPage,
      totalPages,
      showHiddenUsers,
      hiddenUsers,
      filteredDeletedUsers,
      paginatedDeletedUsers,
      isReasonDropdownOpen,
      reasonOptions,
      getReasonLabel,
      toggleReasonDropdown,
      selectReasonFilter,
      getReasonText,
      getReasonClass,
      formatDate,
      toggleHideUser,
      unhideAllUsers,
      viewDeletedUserDetails,
      restoreUser,
      permanentDeleteUser,
    };
  },
});
</script>

<style lang="scss" scoped>
.deleted-users-container {
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

    // Custom Select Dropdown
    .custom-select {
      position: relative;
      min-width: 180px;

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
            color: #ff9800;
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
      .search-input {
        padding: 8px 12px;
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

.deleted-users-table-container {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #333;

  .deleted-users-table {
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

    .deleted-user-row {
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
          overflow: hidden;

          &.deleted {
            background-color: rgba(231, 76, 60, 0.2);
            color: #e74c3c;
          }

          svg {
            width: 20px;
            height: 20px;
          }
        }
      }
    }

    .col-email {
      min-width: 200px;
      color: #a0a0a0;
    }

    .col-reason {
      width: 150px;
      text-align: center;
    }

    .col-date {
      width: 180px;
      color: #a0a0a0;
      font-size: 0.85rem;
    }

    .col-deletedby {
      width: 150px;
      color: #888;
    }

    .col-actions {
      width: 140px;
      text-align: right;
      white-space: nowrap;
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

      &.restore-button {
        background-color: rgba(46, 204, 113, 0.2);
        color: #2ecc71;

        &:hover {
          background-color: rgba(46, 204, 113, 0.3);
        }
      }

      &.delete-permanent-button {
        background-color: rgba(231, 76, 60, 0.2);
        color: #e74c3c;

        &:hover {
          background-color: rgba(231, 76, 60, 0.3);
        }
      }
    }

    .reason-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
      text-align: center;

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

      svg {
        width: 16px;
        height: 16px;
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

      .custom-select {
        min-width: 120px;
      }

      .search-container .search-input {
        width: 100%;
      }
    }
  }

  .deleted-users-table {
    font-size: 0.9rem;

    .col-deletedby,
    .col-date {
      display: none;
    }
  }
}
</style>