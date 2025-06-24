<!-- src/components/admin/application/ApplicationSearch.vue -->
<template>
  <div class="application-search-container">
    <div class="search-header">
      <h2>Bewerbungen durchsuchen</h2>
      <p>Suche nach Bewerbungen mit E-Mail, Telefon oder Bewerber-ID</p>
    </div>

    <div class="search-box">
      <div class="search-input-container">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Suchen..."
          class="search-input"
          @keyup.enter="performSearch"
        />
        <button class="search-button" @click="performSearch">
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
        </button>
      </div>

      <!-- Advanced Filters -->
      <div class="advanced-filters" v-if="showAdvancedFilters">
        <div class="filter-row">
          <select v-model="statusFilter" class="filter-select">
            <option value="">Alle Status</option>
            <option value="PENDING">Ausstehend</option>
            <option value="IN_PROGRESS">In Bearbeitung</option>
            <option value="ACCEPTED">Akzeptiert</option>
            <option value="REJECTED">Abgelehnt</option>
            <option value="CANCELED">Storniert</option>
          </select>

          <input type="date" v-model="dateFrom" class="filter-date" title="Von Datum" />

          <input type="date" v-model="dateTo" class="filter-date" title="Bis Datum" />
        </div>
      </div>

      <button class="toggle-filters" @click="showAdvancedFilters = !showAdvancedFilters">
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
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
        {{ showAdvancedFilters ? "Filter ausblenden" : "Erweiterte Filter" }}
      </button>
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
        <p>Keine Bewerbungen gefunden</p>
      </div>

      <div v-else class="results-list">
        <div class="results-header">
          <h3>{{ searchResults.length }} Ergebnisse gefunden</h3>
        </div>

        <div
          class="application-card"
          v-for="application in searchResults"
          :key="application.id"
          @click="viewApplicationDetails(application.id)"
        >
          <div class="application-header">
            <div class="applicant-avatar">
              <span v-if="!application.user?.profilePicture">{{ getApplicantInitials(application) }}</span>
              <img v-else :src="application.user.profilePicture" :alt="`Avatar von ${getApplicantName(application)}`" />
            </div>
            <div class="application-info">
              <h4 class="applicant-name">{{ getApplicantName(application) }}</h4>
              <p class="application-email">{{ application.email }}</p>
              <div class="application-meta">
                <span class="application-id">ID: {{ application.id.substring(0, 8) }}...</span>
                <span class="application-date">{{ formatDate(application.createdAt) }}</span>
              </div>
            </div>
          </div>

          <div class="application-status">
            <span class="status-badge" :class="applicationService.getStatusClass(application.status)">
              {{ applicationService.getStatusLabel(application.status) }}
            </span>
          </div>

          <div class="application-actions">
            <button class="action-button view-button">
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
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <span class="tooltip">Details anzeigen</span>
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
          <li>Suche nach E-Mail: z.B. <code>max@example.com</code></li>
          <li>Suche nach Telefon: z.B. <code>+49 123 456789</code></li>
          <li>Suche nach ID: z.B. <code>app_12345</code></li>
          <li>Suche nach Bewerber: z.B. <code>Max Mustermann</code></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import applicationService, { type Application } from "@/services/application.service";

export default defineComponent({
  name: "ApplicationSearch",
  emits: ["application-selected"],
  setup(_props, { emit }) {
    const searchQuery = ref("");
    const statusFilter = ref("");
    const dateFrom = ref("");
    const dateTo = ref("");
    const isLoading = ref(false);
    const hasSearched = ref(false);
    const showAdvancedFilters = ref(false);
    const searchResults = ref<Application[]>([]);

    // Suche durchführen
    const performSearch = async () => {
      if (
        searchQuery.value.trim() === "" &&
        statusFilter.value === "" &&
        dateFrom.value === "" &&
        dateTo.value === ""
      ) {
        return;
      }

      isLoading.value = true;
      hasSearched.value = true;

      try {
        // Alle Bewerbungen abrufen und clientseitig filtern
        let applications = await applicationService.getAllApplications("ALL");

        // Text-Suche
        if (searchQuery.value.trim() !== "") {
          const query = searchQuery.value.toLowerCase();
          applications = applications.filter(
            (app) =>
              app.email.toLowerCase().includes(query) ||
              app.phone.toLowerCase().includes(query) ||
              app.id.toLowerCase().includes(query) ||
              getApplicantName(app).toLowerCase().includes(query)
          );
        }

        // Status-Filter
        if (statusFilter.value !== "") {
          applications = applications.filter((app) => app.status === statusFilter.value);
        }

        // Datum-Filter
        if (dateFrom.value !== "") {
          const fromDate = new Date(dateFrom.value);
          applications = applications.filter((app) => new Date(app.createdAt) >= fromDate);
        }

        if (dateTo.value !== "") {
          const toDate = new Date(dateTo.value);
          toDate.setHours(23, 59, 59, 999); // Ende des Tages
          applications = applications.filter((app) => new Date(app.createdAt) <= toDate);
        }

        searchResults.value = applications;
      } catch (error) {
        console.error("Fehler bei der Suche:", error);
        searchResults.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    // Bewerbungsdetails anzeigen
    const viewApplicationDetails = (applicationId: string) => {
      emit("application-selected", applicationId);
    };

    // Bewerber-Name ermitteln
    const getApplicantName = (application: Application): string => {
      if (application.user) {
        const firstName = application.user.firstname || "";
        const lastName = application.user.lastname || "";
        if (firstName || lastName) {
          return `${firstName} ${lastName}`.trim();
        }
        return application.user.username || "Unbekannt";
      }
      return "Benutzer gelöscht";
    };

    // Bewerber-Initialen generieren
    const getApplicantInitials = (application: Application): string => {
      const name = getApplicantName(application);
      if (name === "Benutzer gelöscht" || name === "Unbekannt") {
        return "??";
      }

      const nameParts = name.split(" ");
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      }

      return nameParts[0].substring(0, 2).toUpperCase();
    };

    // Datum formatieren
    const formatDate = (dateString: string): string => {
      try {
        return new Date(dateString).toLocaleDateString("de-DE");
      } catch (error) {
        return "Ungültiges Datum";
      }
    };

    return {
      searchQuery,
      statusFilter,
      dateFrom,
      dateTo,
      isLoading,
      hasSearched,
      showAdvancedFilters,
      searchResults,
      applicationService,
      performSearch,
      viewApplicationDetails,
      getApplicantName,
      getApplicantInitials,
      formatDate,
    };
  },
});
</script>

<style lang="scss" scoped>
.application-search-container {
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

.search-box {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .search-input-container {
    display: flex;
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid #444;
    transition: all 0.3s ease;

    &:focus-within {
      border-color: #666;
      box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.2);
    }

    .search-input {
      flex: 1;
      padding: 14px 16px;
      font-size: 1rem;
      border: none;
      background-color: transparent;
      color: #f0f0f0;

      &:focus {
        outline: none;
      }

      &::placeholder {
        color: #777;
      }
    }

    .search-button {
      background-color: transparent;
      border: none;
      padding: 0 20px;
      cursor: pointer;
      color: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.3s ease;

      &:hover {
        background-color: #444;
      }
    }
  }

  .advanced-filters {
    padding: 16px;
    border-radius: 8px;
    border: 1px solid #444;

    .filter-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;

      .filter-select,
      .filter-date {
        padding: 8px 12px;
        border: 1px solid #444;
        border-radius: 4px;
        background-color: #333;
        color: #f0f0f0;
        font-size: 0.9rem;

        &:focus {
          outline: none;
          border-color: #666;
        }
      }

      .filter-select {
        min-width: 150px;
      }

      .filter-date {
        min-width: 140px;
      }
    }
  }

  .toggle-filters {
    align-self: flex-start;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background-color: transparent;
    border: 1px solid #444;
    border-radius: 4px;
    color: #f0f0f0;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: #444;
      border-color: #666;
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
    gap: 12px;

    .results-header {
      padding-bottom: 12px;
      border-bottom: 1px solid #333;

      h3 {
        margin: 0;
        font-size: 1rem;
        color: #a0a0a0;
        font-weight: normal;
      }
    }

    .application-card {
      display: flex;
      align-items: center;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #333;
      gap: 16px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        background-color: #33333338;
      }

      .application-header {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;

        .applicant-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: #444;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          font-size: 1.2rem;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .application-info {
          .applicant-name {
            margin: 0 0 4px 0;
            font-size: 1.1rem;
            color: #f0f0f0;
          }

          .application-email {
            margin: 0 0 6px 0;
            font-size: 0.9rem;
            color: #a0a0a0;
          }

          .application-meta {
            display: flex;
            gap: 12px;
            font-size: 0.8rem;

            .application-id {
              color: #777;
            }

            .application-date {
              color: #888;
            }
          }
        }
      }

      .application-status {
        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;

          &.status-pending {
            background-color: rgba(255, 193, 7, 0.2);
            color: #ffc107;
          }

          &.status-in-progress {
            background-color: rgba(0, 120, 215, 0.2);
            color: #0078d7;
          }

          &.status-accepted {
            background-color: rgba(46, 204, 113, 0.2);
            color: #2ecc71;
          }

          &.status-rejected {
            background-color: rgba(231, 76, 60, 0.2);
            color: #e74c3c;
          }

          &.status-canceled {
            background-color: rgba(149, 165, 166, 0.2);
            color: #95a5a6;
          }
        }
      }

      .application-actions {
        display: flex;
        gap: 8px;

        .action-button {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background-color: #333;
          color: #a0a0a0;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;

          &:hover {
            background-color: #444;
            color: #f0f0f0;

            .tooltip {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .tooltip {
            position: absolute;
            top: -30px;
            right: 0;
            background-color: #333;
            color: #f0f0f0;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            white-space: nowrap;
            opacity: 0;
            transform: translateY(5px);
            transition: all 0.3s ease;
            pointer-events: none;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

            &:after {
              content: "";
              position: absolute;
              bottom: -5px;
              right: 10px;
              width: 0;
              height: 0;
              border-left: 5px solid transparent;
              border-right: 5px solid transparent;
              border-top: 5px solid #333;
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

        code {
          background-color: #333;
          padding: 2px 6px;
          border-radius: 4px;
          color: #ff9800;
        }
      }
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .application-card {
    flex-direction: column;
    align-items: flex-start !important;

    .application-header {
      width: 100%;
    }

    .application-status {
      width: 100%;
      display: flex;
      justify-content: flex-start;
    }

    .application-actions {
      width: 100%;
      justify-content: flex-end;
      padding-top: 12px;
    }
  }

  .search-tips {
    flex-direction: column;

    .tips-icon {
      display: flex;
      justify-content: center;
    }
  }

  .advanced-filters .filter-row {
    flex-direction: column;

    .filter-select,
    .filter-date {
      width: 100%;
    }
  }
}
</style>
