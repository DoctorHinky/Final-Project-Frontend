<!-- src/components/admin/users/DeletedUsersSearch.vue -->
<template>
  <div class="deleted-users-search-container">
    <div class="search-header">
      <h2>Erweiterte Suche - Gelöschte Benutzer</h2>
      <p>Durchsuchen Sie gelöschte Benutzerkonten mit erweiterten Filteroptionen</p>
    </div>

    <div class="search-form">
      <div class="form-section">
        <h3>Suchkriterien</h3>
        <div class="form-grid">
          <div class="form-group">
            <label for="searchName">Name</label>
            <input type="text" id="searchName" v-model="searchCriteria.name" placeholder="Nach Namen suchen..." />
          </div>
          <div class="form-group">
            <label for="searchEmail">E-Mail</label>
            <input type="email" id="searchEmail" v-model="searchCriteria.email" placeholder="Nach E-Mail suchen..." />
          </div>
          <div class="form-group">
            <label for="searchId">Benutzer-ID</label>
            <input type="text" id="searchId" v-model="searchCriteria.id" placeholder="Nach ID suchen..." />
          </div>
          <div class="form-group">
            <label for="searchDeletedBy">Gelöscht von</label>
            <input type="text" id="searchDeletedBy" v-model="searchCriteria.deletedBy" placeholder="Admin-Name..." />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3>Filter</h3>
        <div class="form-grid">
          <div class="form-group">
            <label for="filterReason">Löschgrund</label>
            <select id="filterReason" v-model="searchCriteria.reason">
              <option value="">Alle Gründe</option>
              <option value="VIOLATION">Regelverstoß</option>
              <option value="SELF_DELETION">Eigene Löschung</option>
              <option value="ADMIN_DELETION">Admin-Löschung</option>
              <option value="INACTIVITY">Inaktivität</option>
              <option value="OTHER">Sonstige</option>
            </select>
          </div>
          <div class="form-group">
            <label for="filterDateFrom">Gelöscht von</label>
            <input type="date" id="filterDateFrom" v-model="searchCriteria.dateFrom" />
          </div>
          <div class="form-group">
            <label for="filterDateTo">Gelöscht bis</label>
            <input type="date" id="filterDateTo" v-model="searchCriteria.dateTo" />
          </div>
          <div class="form-group">
            <label for="filterHasNotes">Mit Notizen</label>
            <select id="filterHasNotes" v-model="searchCriteria.hasNotes">
              <option value="">Alle</option>
              <option value="yes">Ja</option>
              <option value="no">Nein</option>
            </select>
          </div>
        </div>
      </div>

      <div class="search-actions">
        <button class="btn-reset" @click="resetSearch">
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
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
          Zurücksetzen
        </button>
        <button class="btn-search" @click="performSearch">
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
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          Suchen
        </button>
      </div>
    </div>

    <div class="search-results" v-if="hasSearched">
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <span>Suche läuft...</span>
      </div>

      <div v-else-if="searchResults.length === 0" class="no-results">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
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
        <p>Keine gelöschten Benutzer gefunden</p>
      </div>

      <div v-else class="results-list">
        <div class="results-header">
          <h3>{{ searchResults.length }} Ergebnisse gefunden</h3>
          <button class="btn-export" @click="exportResults">
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
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Exportieren
          </button>
        </div>

        <div class="result-card" v-for="user in searchResults" :key="user.id" @click="viewUserDetails(user)">
          <div class="card-header">
            <div class="user-info">
              <div class="user-avatar deleted">
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
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </div>
              <div>
                <h4>{{ user.username }}</h4>
                <p class="user-email">{{ user.email }}</p>
              </div>
            </div>
            <span class="reason-badge" :class="getReasonClass(user.deleteReason) ?? 'no reason given'">
              {{ getReasonText(user.deleteReason) ?? "no reason given" }}
            </span>
          </div>

          <div class="card-details">
            <div class="detail-item">
              <label>ID:</label>
              <span>{{ user.id }}</span>
            </div>
            <div class="detail-item">
              <label>Gelöscht am:</label>
              <span>{{
                formatDate(typeof user.deletedAt === "string" ? new Date(user.deletedAt) : user.deletedAt)
              }}</span>
            </div>
            <div class="detail-item">
              <label>Gelöscht von:</label>
              <span>{{ user.deletedBy }}</span>
            </div>
          </div>

          <div class="card-actions">
            <button class="action-button view-button" @click.stop="viewUserDetails(user)">
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
              Details
            </button>
            <button class="action-button restore-button" @click.stop="restoreUser(user)">
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
              Wiederherstellen
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="search-tips" v-if="!hasSearched">
      <div class="tips-icon">
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
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </div>
      <div class="tips-content">
        <h3>Suchtipps</h3>
        <ul>
          <li>Kombinieren Sie mehrere Kriterien für präzisere Ergebnisse</li>
          <li>Nutzen Sie Datumsbereiche um zeitlich einzugrenzen</li>
          <li>Filtern Sie nach Löschgrund für spezifische Fälle</li>
          <li>Exportieren Sie Suchergebnisse für Berichte</li>
        </ul>
      </div>
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

    <!-- Export Modal -->
    <Teleport to="body">
      <div v-if="showExportModal" class="modal-overlay" @click="showExportModal = false">
        <div class="modal-dialog info-dialog" @click.stop>
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
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Export
            </h3>
            <button class="close-button" @click="showExportModal = false">×</button>
          </div>
          <div class="modal-body">
            <p>Die Export-Funktion wird in Kürze implementiert. Sie werden dann die Suchergebnisse als CSV-Datei herunterladen können.</p>
          </div>
          <div class="modal-footer">
            <button class="btn-primary" @click="showExportModal = false">OK</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "vue";
import type { DeletedUser, SearchCriteria } from "@/types";
import { getReasonText, getReasonClass } from "./deletedUsers.helper";
import { formatDate } from "@/utils/helperFunctions";
import userService from "@/services/user.service";

export default defineComponent({
  name: "DeletedUsersSearch",
  emits: ["user-selected", "user-restored"],
  setup(_props, { emit }) {
    const isLoading = ref(false);
    const hasSearched = ref(false);
    const searchResults = ref<DeletedUser[]>([]);
    
    // Modal States
    const showConfirmModal = ref(false);
    const showErrorModal = ref(false);
    const showExportModal = ref(false);
    const confirmAction = ref<(() => void) | null>(null);
    const confirmMessage = ref("");
    const errorMessage = ref("");

    const searchCriteria = reactive<SearchCriteria>({
      name: "",
      email: "",
      id: "",
      deletedBy: "",
      reason: "",
      dateFrom: "",
      dateTo: "",
      hasNotes: "",
    });

    const resetSearch = () => {
      searchCriteria.name = "";
      searchCriteria.email = "";
      searchCriteria.id = "";
      searchCriteria.deletedBy = "";
      searchCriteria.reason = "";
      searchCriteria.dateFrom = "";
      searchCriteria.dateTo = "";
      searchCriteria.hasNotes = "";
      hasSearched.value = false;
      searchResults.value = [];
    };

    const performSearch = async () => {
      isLoading.value = true;
      hasSearched.value = true;

      // Simuliere Netzwerkverzögerung
      let results = [...(await userService.getDeletedUsers())]; // Hier sollte der echte API-Aufruf stehen

      // Filter anwenden
      if (searchCriteria.name) {
        results = results.filter((user) => user.username.toLowerCase().includes(searchCriteria.name.toLowerCase()));
      }

      if (searchCriteria.email) {
        results = results.filter((user) => user.email.toLowerCase().includes(searchCriteria.email.toLowerCase()));
      }

      if (searchCriteria.id) {
        results = results.filter((user) => user.id.toLowerCase().includes(searchCriteria.id.toLowerCase()));
      }

      if (searchCriteria.deletedBy) {
        results = results.filter((user) =>
          user.deletedBy.toLowerCase().includes(searchCriteria.deletedBy.toLowerCase())
        );
      }

      if (searchCriteria.reason) {
        results = results.filter((user) => user.deleteReason === searchCriteria.reason);
      }

      if (searchCriteria.dateFrom) {
        const fromDate = new Date(searchCriteria.dateFrom);
        results = results.filter((user) => new Date(user.deletedAt) >= fromDate);
      }

      if (searchCriteria.dateTo) {
        const toDate = new Date(searchCriteria.dateTo);
        toDate.setHours(23, 59, 59);
        results = results.filter((user) => new Date(user.deletedAt) <= toDate);
      }

      searchResults.value = results;
      isLoading.value = false;
    };

    const viewUserDetails = (user: DeletedUser) => {
      emit("user-selected", user);
    };

    const restoreUser = async (user: DeletedUser) => {
      confirmMessage.value = `Möchten Sie den Benutzer "${user.username}" wirklich wiederherstellen?`;
      confirmAction.value = async () => {
        try {
          // TODO: API-Aufruf implementieren
          searchResults.value = searchResults.value.filter((u) => u.id !== user.id);
          emit("user-restored", user);
          showConfirmModal.value = false;
        } catch (error) {
          console.error("Fehler beim Wiederherstellen:", error);
          showConfirmModal.value = false;
          errorMessage.value = "Fehler beim Wiederherstellen des Benutzers. Bitte versuchen Sie es später erneut.";
          showErrorModal.value = true;
        }
      };
      showConfirmModal.value = true;
    };

    const exportResults = () => {
      // TODO: Export-Funktionalität implementieren
      showExportModal.value = true;
    };

    return {
      isLoading,
      hasSearched,
      searchResults,
      searchCriteria,
      showConfirmModal,
      showErrorModal,
      showExportModal,
      confirmAction,
      confirmMessage,
      errorMessage,
      resetSearch,
      performSearch,
      viewUserDetails,
      restoreUser,
      exportResults,
      getReasonText,
      getReasonClass,
      formatDate,
    };
  },
});
</script>

<style lang="scss" scoped>
.deleted-users-search-container {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  padding: 24px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  border: 1px solid #333;
}

.search-header {
  margin-bottom: 8px;

  h2 {
    font-size: 1.5rem;
    margin: 0 0 8px 0;
    color: #f0f0f0;
  }

  p {
    margin: 0;
    color: #a0a0a0;
    font-size: 0.9rem;
  }
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 24px;

  .form-section {
    border-radius: 8px;
    border: 1px solid #333;
    padding: 20px;

    h3 {
      margin: 0 0 16px 0;
      color: #f0f0f0;
      font-size: 1.1rem;
      padding-bottom: 8px;
      border-bottom: 1px solid #333;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;

      label {
        color: #d0d0d0;
        font-size: 0.9rem;
        font-weight: 500;
      }

      input,
      select {
        padding: 10px 12px;
        background-color: #33333300;
        border: 1px solid #444;
        border-radius: 4px;
        color: #f0f0f0;
        font-size: 1rem;
        transition: all 0.3s ease;

        &:focus, &:hover {
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

  .search-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;

    button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.3s ease;

      &.btn-reset {
        background-color: #333;
        color: #f0f0f0;

        &:hover {
          background-color: #444;
        }
      }

      &.btn-search {
        background-color: rgba(255, 152, 0, 0.7);
        color: white;

        &:hover {
          background-color: rgba(255, 152, 0, 0.9);
        }
      }
    }
  }
}

.search-results {
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    gap: 16px;
    color: #a0a0a0;

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      border-top-color: #ff9800;
      animation: spin 1s linear infinite;
    }
  }

  .no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    gap: 16px;
    color: #a0a0a0;

    svg {
      opacity: 0.5;
    }

    p {
      font-size: 1.1rem;
      margin: 0;
    }
  }

  .results-list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 1px solid #333;

      h3 {
        margin: 0;
        font-size: 1rem;
        color: #a0a0a0;
        font-weight: normal;
      }

      .btn-export {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background-color: #333;
        border: none;
        border-radius: 4px;
        color: #f0f0f0;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.3s ease;

        &:hover {
          background-color: #444;
        }
      }
    }

    .result-card {
      background-color: #2a2a2a;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        background-color: #333;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;

        .user-info {
          display: flex;
          gap: 12px;
          align-items: center;

          .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: rgba(231, 76, 60, 0.2);
            color: #e74c3c;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          h4 {
            margin: 0 0 4px 0;
            color: #f0f0f0;
            font-size: 1.1rem;
          }

          .user-email {
            margin: 0;
            color: #a0a0a0;
            font-size: 0.9rem;
          }
        }
      }

      .card-details {
        display: flex;
        gap: 24px;
        margin-bottom: 12px;
        flex-wrap: wrap;

        .detail-item {
          display: flex;
          gap: 6px;
          align-items: center;

          label {
            color: #777;
            font-size: 0.85rem;
          }

          span {
            color: #d0d0d0;
            font-size: 0.85rem;
          }
        }
      }

      .card-actions {
        display: flex;
        gap: 12px;
        border-top: 1px solid #333;
        padding-top: 12px;

        .action-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s ease;

          &.view-button {
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
        }
      }
    }
  }
}

.search-tips {
  display: flex;
  border-radius: 8px;
  border: 1px solid #333;
  padding: 16px;
  gap: 16px;

  .tips-icon {
    color: #777;
  }

  .tips-content {
    h3 {
      margin: 0 0 8px 0;
      font-size: 1.1rem;
      color: #f0f0f0;
    }

    ul {
      margin: 0;
      padding-left: 20px;
      color: #a0a0a0;

      li {
        margin-bottom: 6px;
      }
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

  &.info-dialog {
    .modal-header h3 {
      color: #3498db;
      display: flex;
      align-items: center;
      gap: 12px;
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .search-form {
    .form-grid {
      grid-template-columns: 1fr;
    }

    .search-actions {
      flex-direction: column;

      button {
        width: 100%;
        justify-content: center;
      }
    }
  }

  .result-card {
    .card-header {
      flex-direction: column;
      gap: 12px;
    }

    .card-actions {
      flex-direction: column;
    }
  }
}
</style>