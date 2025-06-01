<!-- src/components/member/dashboard/Favorites.vue -->
<template>
  <div class="favorites-dashboard">
    <div class="page-header">
      <h2>Meine Favoriten</h2>
      <p>Hier findest du alle Artikel, die du als Favoriten gespeichert hast</p>
    </div>

    <!-- Suchleiste -->
    <search-section
      :search-query="searchQuery"
      @update:search-query="searchQuery = $event"
      @filter-favorites="filterFavorites"
    />

    <!-- Ansichtsoptionen -->
    <view-options
      :sort-option="sortOption"
      :view-mode="viewMode"
      @update:sort-option="sortOption = $event"
      @update:view-mode="viewMode = $event"
    />

    <!-- Favoriten-Anzeige -->
    <div v-if="filteredFavorites.length > 0" :class="['favorites-container', viewMode]">
      <!-- Grid-Ansicht -->
      <favorites-grid
        v-if="viewMode === 'grid'"
        :filtered-favorites="filteredFavorites"
        :selected-favorite="selectedFavorite"
        @select-favorite="selectFavorite"
        @read-favorite="readFavorite"
        @confirm-remove="confirmRemoveFavorite"
      />

      <!-- Listen-Ansicht -->
      <favorites-list
        v-else-if="viewMode === 'list'"
        :filtered-favorites="filteredFavorites"
        :selected-favorite="selectedFavorite"
        @select-favorite="selectFavorite"
        @read-favorite="readFavorite"
        @confirm-remove="confirmRemoveFavorite"
      />
    </div>

    <!-- Leerer Zustand -->
    <empty-state v-else :search-query="searchQuery" @clear-search="clearSearch" @browse-articles="browseArticles" />

    <!-- Bestätigungsdialog -->
    <confirm-dialog
      :show-dialog="showConfirmDialog"
      :favorite-title="favoriteToRemove?.title"
      @confirm-remove="removeFavorite"
      @cancel-remove="cancelRemove"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import {
  SearchSection,
  ViewOptions,
  FavoritesGrid,
  FavoritesList,
  EmptyState,
  ConfirmDialog,
} from "@/components/pages/DashboardPages/Favorites";

import type { Favorite } from "@/types/Favorite";

export default defineComponent({
  name: "FavoritesDashboard",
  components: {
    SearchSection,
    ViewOptions,
    FavoritesGrid,
    FavoritesList,
    EmptyState,
    ConfirmDialog,
  },
  setup() {
    // Status
    const searchQuery = ref("");
    const sortOption = ref("date-desc");
    const viewMode = ref("grid");
    const selectedFavorite = ref<Favorite | null>(null);
    const showConfirmDialog = ref(false);
    const favoriteToRemove = ref<Favorite | null>(null);

    // Beispiel-Favoriten (später durch API-Daten ersetzen)
    const favorites = ref<Favorite[]>([
      {
        id: 1,
        title: "Digitale Medien im Kindesalter: Fluch oder Segen?",
        preview:
          "Eine ausgewogene Betrachtung der Vor- und Nachteile digitaler Medien für Kinder und Empfehlungen für einen gesunden Umgang.",
        category: "Medien",
        author: "Prof. Thomas Becker",
        date: "28.04.2025",
      },
      {
        id: 2,
        title: "Wie Musik die kognitive Entwicklung fördert",
        preview:
          "Neue Studien zeigen den positiven Einfluss von Musikunterricht auf die Gehirnentwicklung von Kindern.",
        category: "Bildung",
        author: "Julia Wagner",
        date: "10.04.2025",
      },
      {
        id: 3,
        title: "Gesunder Schlaf für Kleinkinder",
        preview:
          "Schlafexperten erklären, wie viel Schlaf Kinder in unterschiedlichen Altersstufen benötigen und wie Eltern gute Schlafgewohnheiten fördern können.",
        category: "Gesundheit",
        author: "Dr. Martin Schulz",
        date: "02.04.2025",
      },
      {
        id: 4,
        title: "Die Bedeutung des freien Spiels für die kindliche Entwicklung",
        preview:
          "Warum unstrukturierte Spielzeit für Kinder wichtiger ist als je zuvor und wie Eltern eine förderliche Spielumgebung schaffen können.",
        category: "Entwicklung",
        author: "Prof. Sabine Müller",
        date: "25.03.2025",
      },
    ]);

    // Gefilterte und sortierte Favoriten
    const filteredFavorites = computed(() => {
      let result = [...favorites.value];

      // Nach Suchbegriff filtern
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(
          (favorite) =>
            favorite.title.toLowerCase().includes(query) ||
            favorite.preview.toLowerCase().includes(query) ||
            favorite.category.toLowerCase().includes(query) ||
            favorite.author.toLowerCase().includes(query)
        );
      }

      // Sortieren
      switch (sortOption.value) {
        case "date-desc":
          return result.sort((a, b) => {
            return (
              new Date(b.date.split(".").reverse().join("-")).getTime() -
              new Date(a.date.split(".").reverse().join("-")).getTime()
            );
          });
        case "date-asc":
          return result.sort((a, b) => {
            return (
              new Date(a.date.split(".").reverse().join("-")).getTime() -
              new Date(b.date.split(".").reverse().join("-")).getTime()
            );
          });
        case "title-asc":
          return result.sort((a, b) => a.title.localeCompare(b.title));
        case "title-desc":
          return result.sort((a, b) => b.title.localeCompare(a.title));
        default:
          return result;
      }
    });

    // Such-Handler
    const filterFavorites = () => {
      selectedFavorite.value = null;
    };

    // Suche zurücksetzen
    const clearSearch = () => {
      searchQuery.value = "";
    };

    // Zu Artikeln navigieren (Platzhalter)
    const browseArticles = () => {
      console.log("Navigiere zu allen Artikeln");
      // Später mit Router-Navigation ersetzen
    };

    // Favorit auswählen
    const selectFavorite = (favorite: Favorite) => {
      selectedFavorite.value = selectedFavorite.value?.id === favorite.id ? null : favorite;
    };

    // Favorit lesen
    const readFavorite = (favorite: Favorite) => {
      console.log("Favorit lesen:", favorite.title);
      // Später mit Artikelansicht-Navigation ersetzen
    };

    // Entfernen-Dialog anzeigen
    const confirmRemoveFavorite = (favorite: Favorite) => {
      favoriteToRemove.value = favorite;
      showConfirmDialog.value = true;
    };

    // Entfernen abbrechen
    const cancelRemove = () => {
      showConfirmDialog.value = false;
      favoriteToRemove.value = null;
    };

    // Favorit entfernen
    const removeFavorite = () => {
      if (favoriteToRemove.value) {
        const index = favorites.value.findIndex((f) => f.id === favoriteToRemove.value!.id);
        if (index !== -1) {
          favorites.value.splice(index, 1);
        }

        if (selectedFavorite.value?.id === favoriteToRemove.value.id) {
          selectedFavorite.value = null;
        }
      }

      showConfirmDialog.value = false;
      favoriteToRemove.value = null;
    };

    return {
      searchQuery,
      sortOption,
      viewMode,
      favorites,
      filteredFavorites,
      selectedFavorite,
      showConfirmDialog,
      favoriteToRemove,
      filterFavorites,
      clearSearch,
      browseArticles,
      selectFavorite,
      readFavorite,
      confirmRemoveFavorite,
      cancelRemove,
      removeFavorite,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;
@use "@/style/base/animations" as animations;

.favorites-dashboard {
  @include animations.fade-in(0.5s);
  display: flex;
  flex-direction: column;
  gap: map.get(vars.$spacing, l);

  .page-header {
    margin-bottom: map.get(vars.$spacing, l);

    h2 {
      font-size: map.get(map.get(vars.$fonts, sizes), xxl);
      font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
      margin-bottom: map.get(vars.$spacing, xs);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    p {
      font-size: map.get(map.get(vars.$fonts, sizes), medium);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  // Zusätzliche Stile für den Container
  /*.favorites-container {
    &.grid,
    &.list {
      // Gemeinsame Stile für beide Ansichten
    }
  }*/
}
</style>
