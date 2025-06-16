<!-- src/components/admin/application/ApplicationList.vue -->
<template>
  <div class="application-list-container">
    <div class="list-header">
      <div class="header-title-section">
        <h2>Alle Bewerbungen</h2>
        <div class="application-count-badge">
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
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span>{{ totalApplicationsCount }} Bewerbungen</span>
        </div>
      </div>
      <div class="header-actions">
        <div class="filter-container">
          <!-- Status Filter Dropdown -->
          <div class="custom-select" :class="{ open: isDropdownOpen }">
            <div class="select-trigger" @click="toggleDropdown">
              <span>{{ getFilterLabel(statusFilter) }}</span>
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
              <div class="select-option" 
                   v-for="option in filterOptions" 
                   :key="option.value"
                   :class="{ selected: statusFilter === option.value }"
                   @click="selectFilter(option.value)">
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
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Suche nach E-Mail, Telefon..."
            class="search-input"
          />
        </div>
        <button 
          class="refresh-button"
          @click="loadApplications"
          :disabled="isLoading"
          title="Bewerbungen aktualisieren"
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
            :class="{ 'animate-spin': isLoading }"
          >
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
        </button>
      </div>
    </div>

    <div class="applications-table-container">
      <table class="applications-table">
        <thead>
          <tr>
            <th class="col-id">ID</th>
            <th class="col-applicant">Bewerber</th>
            <th class="col-email">E-Mail</th>
            <th class="col-phone">Telefon</th>
            <th class="col-status">Status</th>
            <th class="col-date">Eingereicht</th>
            <th class="col-actions">Aktionen</th>
          </tr>
        </thead>
        <tbody v-if="isLoading">
          <tr>
            <td colspan="7" class="loading-cell">
              <div class="loading-spinner"></div>
              <span>Lade Bewerbungsdaten...</span>
            </td>
          </tr>
        </tbody>
        <tbody v-else-if="filteredApplications.length === 0">
          <tr>
            <td colspan="7" class="empty-cell">
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
                <p>Keine Bewerbungen gefunden</p>
              </div>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr
            v-for="application in paginatedApplications"
            :key="application.id"
            @click="viewApplicationDetails(application.id)"
            class="application-row"
          >
            <td class="col-id">{{ application.id.substring(0, 8) }}...</td>
            <td class="col-applicant">
              <div class="applicant-cell">
                <div class="applicant-avatar">
                  <span v-if="!application.user?.profilePicture">{{
                    getApplicantInitials(application)
                  }}</span>
                  <img
                    v-else
                    :src="application.user.profilePicture"
                    :alt="`Avatar von ${getApplicantName(application)}`"
                  />
                </div>
                <div class="applicant-info">
                  <span class="applicant-name">{{ getApplicantName(application) }}</span>
                  <span class="applicant-username" v-if="application.user?.username">@{{ application.user.username }}</span>
                </div>
              </div>
            </td>
            <td class="col-email">{{ application.email }}</td>
            <td class="col-phone">{{ application.phone }}</td>
            <td class="col-status">
              <span
                class="status-badge"
                :class="applicationService.getStatusClass(application.status)"
              >
                {{ applicationService.getStatusLabel(application.status) }}
              </span>
            </td>
            <td class="col-date">{{ formatDate(application.createdAt) }}</td>
            <td class="col-actions">
              <button
                v-if="application.status === 'PENDING'"
                class="action-button take-button"
                @click.stop="takeApplication(application.id)"
                title="Bewerbung übernehmen"
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
                  <path d="M9 12l2 2 4-4"></path>
                  <path d="M21 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"></path>
                  <path d="M3 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"></path>
                  <path d="M12 21c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"></path>
                  <path d="M12 3c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"></path>
                </svg>
              </button>
              <button
                class="action-button view-button"
                @click.stop="viewApplicationDetails(application.id)"
                title="Details anzeigen"
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
            </td>
          </tr>
        </tbody>
      </table>
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
import { defineComponent, ref, computed, onMounted, onUnmounted } from "vue";
import applicationService, { type Application, type ApplicationStatus } from "@/services/application.service";

export default defineComponent({
  name: "ApplicationList",
  emits: ["application-selected"],
  setup(props, { emit }) {
    const applications = ref<Application[]>([]);
    const isLoading = ref(true);
    const searchQuery = ref("");
    const statusFilter = ref<ApplicationStatus | 'ALL'>("ALL");
    const currentPage = ref(1);
    const itemsPerPage = 10;
    const isDropdownOpen = ref(false);
    const totalApplicationsCount = ref(0);

    // Filter-Optionen für das Dropdown
    const filterOptions = [
      { value: "ALL", label: "Alle Status" },
      { value: "PENDING", label: "Ausstehend" },
      { value: "IN_PROGRESS", label: "In Bearbeitung" },
      { value: "ACCEPTED", label: "Akzeptiert" },
      { value: "REJECTED", label: "Abgelehnt" },
      { value: "CANCELED", label: "Storniert" },
    ];

    function getFilterLabel(value: ApplicationStatus | 'ALL'): string {
      const option = filterOptions.find(opt => opt.value === value);
      return option ? option.label : "Alle Status";
    }

    function toggleDropdown() {
      isDropdownOpen.value = !isDropdownOpen.value;
    }

    function selectFilter(value: ApplicationStatus | 'ALL') {
      statusFilter.value = value;
      isDropdownOpen.value = false;
      resetPagination();
    }

    // Klick außerhalb des Dropdowns schließt es
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest('.custom-select')) {
        isDropdownOpen.value = false;
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
      loadApplications();
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    // Bewerbungen laden
    const loadApplications = async () => {
      isLoading.value = true;
      try {
        const allApplications = await applicationService.getAllApplications('ALL');
        applications.value = allApplications;
        totalApplicationsCount.value = allApplications.length;
      } catch (error) {
        console.error("Fehler beim Laden der Bewerbungen:", error);
        // Hier könnte eine Toast-Benachrichtigung angezeigt werden
      } finally {
        isLoading.value = false;
      }
    };

    // Bewerbung übernehmen
    const takeApplication = async (applicationId: string) => {
      try {
        await applicationService.takeApplication(applicationId);
        // Bewerbungen neu laden, um Status-Update zu sehen
        await loadApplications();
        // Hier könnte eine Success-Toast angezeigt werden
      } catch (error: any) {
        console.error("Fehler beim Übernehmen der Bewerbung:", error);
        alert(error.message || "Fehler beim Übernehmen der Bewerbung");
      }
    };

    // Gefilterte Bewerbungen
    const filteredApplications = computed(() => {
      let result = [...applications.value];

      // Status-Filter
      if (statusFilter.value !== "ALL") {
        result = result.filter(app => app.status === statusFilter.value);
      }

      // Suchfilter
      if (searchQuery.value.trim() !== "") {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(app =>
          app.email.toLowerCase().includes(query) ||
          app.phone.toLowerCase().includes(query) ||
          app.id.toLowerCase().includes(query) ||
          getApplicantName(app).toLowerCase().includes(query)
        );
      }

      return result;
    });

    // Paginierte Bewerbungen
    const paginatedApplications = computed(() => {
      const startIndex = (currentPage.value - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return filteredApplications.value.slice(startIndex, endIndex);
    });

    // Gesamtzahl der Seiten
    const totalPages = computed(() => {
      return Math.ceil(filteredApplications.value.length / itemsPerPage);
    });

    // Bei Änderung des Filters oder der Suche zur ersten Seite zurückkehren
    const resetPagination = () => {
      currentPage.value = 1;
    };

    // Bewerbungsdetails anzeigen
    const viewApplicationDetails = (applicationId: string) => {
      emit("application-selected", applicationId);
    };

    // Bewerber-Name ermitteln
    const getApplicantName = (application: Application): string => {
      if (application.user) {
        const firstName = application.user.firstname || '';
        const lastName = application.user.lastname || '';
        if (firstName || lastName) {
          return `${firstName} ${lastName}`.trim();
        }
        return application.user.username || 'Unbekannt';
      }
      return 'Benutzer gelöscht';
    };

    // Bewerber-Initialen generieren
    const getApplicantInitials = (application: Application): string => {
      const name = getApplicantName(application);
      if (name === 'Benutzer gelöscht' || name === 'Unbekannt') {
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
        return new Date(dateString).toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        return 'Ungültiges Datum';
      }
    };

    return {
      applications,
      isLoading,
      searchQuery,
      statusFilter,
      filteredApplications,
      paginatedApplications,
      currentPage,
      totalPages,
      totalApplicationsCount,
      isDropdownOpen,
      filterOptions,
      applicationService, // Für Template-Zugriff
      getFilterLabel,
      toggleDropdown,
      selectFilter,
      loadApplications,
      takeApplication,
      viewApplicationDetails,
      getApplicantName,
      getApplicantInitials,
      formatDate,
    };
  },
});
</script>

<style lang="scss" scoped>
.application-list-container {
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

    .application-count-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background-color: rgba(255, 152, 0, 0.1);
      border: 1px solid rgba(255, 152, 0, 0.3);
      border-radius: 20px;
      color: #ff9800;
      font-size: 0.85rem;
      font-weight: 500;
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;

    // Custom Select Dropdown (gleich wie in UserList)
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
        width: 250px;
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

    .refresh-button {
      width: 36px;
      height: 36px;
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

      .animate-spin {
        animation: spin 1s linear infinite;
      }
    }
  }
}

.applications-table-container {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #333;

  .applications-table {
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

    .application-row {
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
      width: 120px;
      color: #777;
      font-size: 0.85rem;
      font-family: monospace;
    }

    .col-applicant {
      min-width: 200px;

      .applicant-cell {
        display: flex;
        align-items: center;
        gap: 12px;

        .applicant-avatar {
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

        .applicant-info {
          display: flex;
          flex-direction: column;
          gap: 2px;

          .applicant-name {
            font-weight: 500;
          }

          .applicant-username {
            font-size: 0.8rem;
            color: #888;
          }
        }
      }
    }

    .col-email {
      min-width: 200px;
      color: #a0a0a0;
    }

    .col-phone {
      min-width: 150px;
      color: #a0a0a0;
    }

    .col-status {
      width: 140px;
      text-align: center;
    }

    .col-date {
      width: 150px;
      color: #a0a0a0;
      font-size: 0.85rem;
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

      &.take-button {
        background-color: rgba(255, 193, 7, 0.2);
        color: #ffc107;

        &:hover {
          background-color: rgba(255, 193, 7, 0.3);
        }
      }

      &.view-button {
        background-color: rgba(0, 120, 215, 0.2);
        color: #0078d7;

        &:hover {
          background-color: rgba(0, 120, 215, 0.3);
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
        width: 180px;
      }
    }
  }

  .applications-table {
    font-size: 0.9rem;

    .col-id,
    .col-phone,
    .col-date {
      display: none;
    }
  }
}
</style>