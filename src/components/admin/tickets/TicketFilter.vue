<!-- src/components/admin/tickets/TicketFilter.vue -->
<template>
  <div class="ticket-filter">
    <div class="filter-header">
      <h3 class="filter-title">Filter & Sortierung</h3>
      <button class="btn-reset" @click="resetFilters" title="Filter zurücksetzen">
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
          <path d="M21 12a9 9 0 0 1-9 9"></path>
          <path d="M3 12a9 9 0 0 1 9-9"></path>
          <path d="M21 12H3"></path>
          <path d="M12 3v9"></path>
        </svg>
        Zurücksetzen
      </button>
    </div>

    <div class="filter-grid">
      <!-- Suchfeld -->
      <div class="filter-group search-group">
        <div class="filter-input-wrapper">
          <svg
            class="search-icon"
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
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            v-model="searchQuery"
            @input="debounceSearch"
            class="filter-input search-input"
            placeholder="Suche nach Tickets..."
          />
          <button v-if="searchQuery" class="clear-search" @click="clearSearch" title="Suche löschen">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Status Filter -->
      <div class="filter-group">
        <label class="filter-label">Status</label>
        <select v-model="localFilters.status" @change="applyFilters" class="filter-select">
          <option value="">Alle Status</option>
          <option v-for="status in statusOptions" :key="status.value" :value="status.value">
            {{ status.label }}
          </option>
        </select>
      </div>

      <!-- Kategorie Filter -->
      <div class="filter-group">
        <label class="filter-label">Kategorie</label>
        <select v-model="localFilters.category" @change="applyFilters" class="filter-select">
          <option value="">Alle Kategorien</option>
          <option v-for="category in categoryOptions" :key="category.value" :value="category.value">
            {{ category.label }}
          </option>
        </select>
      </div>

      <!-- Sortierung -->
      <div class="filter-group">
        <label class="filter-label">Sortierung</label>
        <select v-model="localFilters.sortBy" @change="applyFilters" class="filter-select">
          <option value="updatedAt">Zuletzt aktualisiert</option>
          <option value="createdAt">Erstellungsdatum</option>
        </select>
      </div>
    </div>

    <!-- Aktive Filter Anzeige -->
    <div class="active-filters" v-if="hasActiveFilters">
      <div class="active-filters-title">Aktive Filter:</div>
      <div class="active-filter-tags">
        <div v-if="localFilters.status" class="filter-tag">
          Status: {{ getStatusLabel(localFilters.status) }}
          <button class="remove-filter" @click="removeFilter('status')" title="Filter entfernen">×</button>
        </div>
        <div v-if="localFilters.category" class="filter-tag">
          Kategorie: {{ getCategoryLabel(localFilters.category) }}
          <button class="remove-filter" @click="removeFilter('category')" title="Filter entfernen">×</button>
        </div>
        <div v-if="localFilters.search" class="filter-tag">
          Suche: {{ localFilters.search }}
          <button class="remove-filter" @click="removeFilter('search')" title="Filter entfernen">×</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import { TicketStatus, TicketCategory } from "@/types";

export default defineComponent({
  name: "TicketFilter",
  props: {
    filters: {
      type: Object,
      default: () => ({
        status: "",
        category: "",
        search: "",
        sortBy: "updatedAt",
      }),
    },
  },
  emits: ["update:filters", "reset-filters"],
  setup(props, { emit }) {
    // Lokale Kopie der Filter
    const localFilters = ref({ ...props.filters });

    // Suchfeld
    const searchQuery = ref(props.filters.search || "");
    let searchTimeout: ReturnType<typeof setTimeout> | null = null;

    // Status-Optionen
    const statusOptions = [
      { value: TicketStatus.OPEN, label: "Offen" },
      { value: TicketStatus.IN_PROGRESS, label: "In Bearbeitung" },
      { value: TicketStatus.CLOSED, label: "Geschlossen" },
    ];

    // Kategorie-Optionen
    const categoryOptions = [
      { value: TicketCategory.ACCOUNT, label: "Konto" },
      { value: TicketCategory.WEBSITE_BUG, label: "Website Fehler" },
      { value: TicketCategory.TECHNICAL, label: "Technisch" },
      { value: TicketCategory.OTHER, label: "Sonstiges" },
    ];

    // Aktive Filter
    const hasActiveFilters = computed(() => {
      return localFilters.value.status !== "" || localFilters.value.category !== "" || localFilters.value.search !== "";
    });

    // Debounce für die Suche
    const debounceSearch = () => {
      if (searchTimeout) clearTimeout(searchTimeout);

      searchTimeout = setTimeout(() => {
        localFilters.value.search = searchQuery.value;
        applyFilters();
      }, 300);
    };

    // Suche zurücksetzen
    const clearSearch = () => {
      searchQuery.value = "";
      localFilters.value.search = "";
      applyFilters();
    };

    // Filter anwenden
    const applyFilters = () => {
      emit("update:filters", { ...localFilters.value });
    };

    // Alle Filter zurücksetzen
    const resetFilters = () => {
      localFilters.value = {
        status: "",
        category: "",
        search: "",
        sortBy: "updatedAt",
      };
      searchQuery.value = "";
      emit("reset-filters");
    };

    // Einzelnen Filter entfernen
    const removeFilter = (filterKey: string) => {
      if (filterKey in localFilters.value) {
        (localFilters.value as any)[filterKey] = "";

        if (filterKey === "search") {
          searchQuery.value = "";
        }

        applyFilters();
      }
    };

    // Label-Helfer
    const getStatusLabel = (statusValue: string) => {
      const option = statusOptions.find((opt) => opt.value === statusValue);
      return option ? option.label : statusValue;
    };

    const getCategoryLabel = (categoryValue: string) => {
      const option = categoryOptions.find((opt) => opt.value === categoryValue);
      return option ? option.label : categoryValue;
    };

    // Props-Änderungen überwachen
    watch(
      () => props.filters,
      (newFilters) => {
        localFilters.value = { ...newFilters };
        searchQuery.value = newFilters.search || "";
      },
      { deep: true }
    );

    return {
      localFilters,
      searchQuery,
      statusOptions,
      categoryOptions,
      hasActiveFilters,
      debounceSearch,
      clearSearch,
      applyFilters,
      resetFilters,
      removeFilter,
      getStatusLabel,
      getCategoryLabel,
    };
  },
});
</script>

<style lang="scss" scoped>
.ticket-filter {
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filter-title {
  margin: 0;
  font-size: 1.1rem;
  color: #f0f0f0;
  font-weight: 600;
}

.btn-reset {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: transparent;
  border: 1px solid #444;
  border-radius: 4px;
  color: #bbb;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #333;
    color: #fff;
  }
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;

  .search-group {
    grid-column: 1 / -1;
  }
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 0.875rem;
  color: #bbb;
}

.filter-select {
  padding: 10px 12px;
  border-radius: 4px;
  background-color: transparent;
  border: 1px solid #444;
  color: #fff;
  font-size: 0.875rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #ff9800;
  }

  option {
    background-color: #222;
    color: #fff;
  }
}

.filter-input-wrapper {
  position: relative;

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #888;
  }

  .search-input {
    width: 100%;
    padding: 10px 12px 10px 36px;
    border-radius: 4px;
    background-color: transparent;
    border: 1px solid #444;
    color: #fff;
    font-size: 0.875rem;

    &:focus {
      outline: none;
      border-color: #ff9800;
    }

    &::placeholder {
      color: #888;
    }
  }

  .clear-search {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #888;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: #fff;
    }
  }
}

.active-filters {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #444;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;

  .active-filters-title {
    font-size: 0.875rem;
    color: #bbb;
  }

  .active-filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .filter-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background-color: rgba(255, 152, 0, 0.15);
    border-radius: 4px;
    font-size: 0.75rem;
    color: #ff9800;

    .remove-filter {
      background: none;
      border: none;
      color: #ff9800;
      font-size: 1.1rem;
      line-height: 1;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        color: #fff;
      }
    }
  }
}

@media (max-width: 768px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }
}
</style>
