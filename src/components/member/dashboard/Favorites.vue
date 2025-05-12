<!-- src/components/member/dashboard/Favorites.vue -->
<template>
  <div class="favorites-dashboard">
    <div class="page-header">
      <h2>Meine Favoriten</h2>
      <p>Hier findest du alle Artikel, die du als Favoriten gespeichert hast</p>
    </div>

    <!-- Suchleiste -->
    <div class="search-section">
      <div class="search-container">
        <input type="text" placeholder="Favoriten durchsuchen..." v-model="searchQuery" @input="filterFavorites" />
        <button class="search-button">
          <span class="search-icon">🔍</span>
        </button>
      </div>
    </div>

    <!-- Ansichtsoptionen -->
    <div class="view-options">
      <div class="sort-by">
        <label for="sort-select">Sortieren nach:</label>
        <select id="sort-select" v-model="sortOption">
          <option value="date-desc">Datum (neueste zuerst)</option>
          <option value="date-asc">Datum (älteste zuerst)</option>
          <option value="title-asc">Titel (A-Z)</option>
          <option value="title-desc">Titel (Z-A)</option>
        </select>
      </div>
      <div class="view-mode-toggle">
        <button class="view-button" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'"
          title="Rasteransicht">
          ■ ■
        </button>
        <button class="view-button" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'"
          title="Listenansicht">
          ≡
        </button>
      </div>
    </div>

    <!-- Favoriten-Anzeige -->
    <div v-if="filteredFavorites.length > 0" :class="['favorites-container', viewMode]">
      <!-- Grid-Ansicht -->
      <div v-if="viewMode === 'grid'" class="grid-view">
        <div v-for="favorite in filteredFavorites" :key="favorite.id" class="favorite-card"
          :class="{ active: selectedFavorite && selectedFavorite.id === favorite.id }"
          @click="selectFavorite(favorite)">
          <div class="favorite-category">{{ favorite.category }}</div>
          <div class="favorite-content">
            <h3>{{ favorite.title }}</h3>
            <p class="favorite-excerpt">{{ favorite.preview }}</p>
            <div class="favorite-meta">
              <span class="favorite-date">{{ favorite.date }}</span>
              <span class="favorite-author">{{ favorite.author }}</span>
            </div>
          </div>
          <div class="favorite-actions">
            <button class="action-button read" @click.stop="readFavorite(favorite)">Lesen</button>
            <button class="action-button remove" @click.stop="confirmRemoveFavorite(favorite)">Entfernen</button>
          </div>
        </div>
      </div>

      <!-- Listen-Ansicht -->
      <div v-else-if="viewMode === 'list'" class="list-view">
        <div v-for="favorite in filteredFavorites" :key="favorite.id" class="favorite-list-item"
          :class="{ active: selectedFavorite && selectedFavorite.id === favorite.id }"
          @click="selectFavorite(favorite)">
          <div class="favorite-list-main">
            <div class="favorite-list-header">
              <div class="favorite-category">{{ favorite.category }}</div>
              <div class="favorite-meta">
                <span class="favorite-date">{{ favorite.date }}</span>
                <span class="favorite-author">{{ favorite.author }}</span>
              </div>
            </div>
            <h3 class="favorite-title">{{ favorite.title }}</h3>
            <p class="favorite-excerpt">{{ favorite.preview }}</p>
          </div>
          <div class="favorite-list-actions">
            <button class="action-button read" @click.stop="readFavorite(favorite)">Lesen</button>
            <button class="action-button remove" @click.stop="confirmRemoveFavorite(favorite)">Entfernen</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Leerer Zustand -->
    <div v-else class="empty-state">
      <div class="empty-icon">⭐</div>
      <h3>Keine Favoriten gefunden</h3>
      <p>Du hast noch keine Artikel als Favoriten gespeichert oder deine Suche ergab keine Treffer.</p>
      <button v-if="searchQuery" @click="clearSearch" class="reset-button">Suche zurücksetzen</button>
      <button v-else @click="browseArticles" class="reset-button">Artikel durchstöbern</button>
    </div>

    <!-- Bestätigungsdialog -->
    <div v-if="showConfirmDialog" class="confirm-dialog-backdrop" @click="cancelRemove">
      <div class="confirm-dialog" @click.stop>
        <h3>Favorit entfernen</h3>
        <p>Möchtest du "{{ favoriteToRemove?.title }}" wirklich aus deinen Favoriten entfernen?</p>
        <div class="dialog-actions">
          <button class="cancel-button" @click="cancelRemove">Abbrechen</button>
          <button class="confirm-button" @click="removeFavorite">Entfernen</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';

interface Favorite {
  id: number;
  title: string;
  preview: string;
  category: string;
  author: string;
  date: string;
}

export default defineComponent({
  name: 'FavoritesDashboard',
  setup() {
    // Status
    const searchQuery = ref('');
    const sortOption = ref('date-desc');
    const viewMode = ref('grid');
    const selectedFavorite = ref<Favorite | null>(null);
    const showConfirmDialog = ref(false);
    const favoriteToRemove = ref<Favorite | null>(null);

    // Beispiel-Favoriten (später durch API-Daten ersetzen)
    const favorites = ref<Favorite[]>([
      {
        id: 1,
        title: "Digitale Medien im Kindesalter: Fluch oder Segen?",
        preview: "Eine ausgewogene Betrachtung der Vor- und Nachteile digitaler Medien für Kinder und Empfehlungen für einen gesunden Umgang.",
        category: "Medien",
        author: "Prof. Thomas Becker",
        date: "28.04.2025"
      },
      {
        id: 2,
        title: "Wie Musik die kognitive Entwicklung fördert",
        preview: "Neue Studien zeigen den positiven Einfluss von Musikunterricht auf die Gehirnentwicklung von Kindern.",
        category: "Bildung",
        author: "Julia Wagner",
        date: "10.04.2025"
      },
      {
        id: 3,
        title: "Gesunder Schlaf für Kleinkinder",
        preview: "Schlafexperten erklären, wie viel Schlaf Kinder in unterschiedlichen Altersstufen benötigen und wie Eltern gute Schlafgewohnheiten fördern können.",
        category: "Gesundheit",
        author: "Dr. Martin Schulz",
        date: "02.04.2025"
      },
      {
        id: 4,
        title: "Die Bedeutung des freien Spiels für die kindliche Entwicklung",
        preview: "Warum unstrukturierte Spielzeit für Kinder wichtiger ist als je zuvor und wie Eltern eine förderliche Spielumgebung schaffen können.",
        category: "Entwicklung",
        author: "Prof. Sabine Müller",
        date: "25.03.2025"
      }
    ]);

    // Gefilterte und sortierte Favoriten
    const filteredFavorites = computed(() => {
      let result = [...favorites.value];

      // Nach Suchbegriff filtern
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(favorite =>
          favorite.title.toLowerCase().includes(query) ||
          favorite.preview.toLowerCase().includes(query) ||
          favorite.category.toLowerCase().includes(query) ||
          favorite.author.toLowerCase().includes(query)
        );
      }

      // Sortieren
      switch (sortOption.value) {
        case 'date-desc':
          return result.sort((a, b) => {
            return new Date(b.date.split('.').reverse().join('-')).getTime() -
              new Date(a.date.split('.').reverse().join('-')).getTime();
          });
        case 'date-asc':
          return result.sort((a, b) => {
            return new Date(a.date.split('.').reverse().join('-')).getTime() -
              new Date(b.date.split('.').reverse().join('-')).getTime();
          });
        case 'title-asc':
          return result.sort((a, b) => a.title.localeCompare(b.title));
        case 'title-desc':
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
      searchQuery.value = '';
    };

    // Zu Artikeln navigieren (Platzhalter)
    const browseArticles = () => {
      console.log('Navigiere zu allen Artikeln');
      // Später mit Router-Navigation ersetzen
    };

    // Favorit auswählen
    const selectFavorite = (favorite: Favorite) => {
      selectedFavorite.value = selectedFavorite.value?.id === favorite.id ? null : favorite;
    };

    // Favorit lesen
    const readFavorite = (favorite: Favorite) => {
      console.log('Favorit lesen:', favorite.title);
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
        const index = favorites.value.findIndex(f => f.id === favoriteToRemove.value!.id);
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
      removeFavorite
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use 'sass:color';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

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

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    p {
      font-size: map.get(map.get(vars.$fonts, sizes), medium);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  // Suchleiste
  .search-section {
    margin-bottom: map.get(vars.$spacing, l);

    .search-container {
      position: relative;
      width: 100%;

      input {
        width: 100%;
        padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl) map.get(vars.$spacing, m) map.get(vars.$spacing, m);
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        font-size: map.get(map.get(vars.$fonts, sizes), medium);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            @include mixins.form-element($theme);
          }
        }
      }

      .search-button {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.2rem;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }
    }
  }

  // Ansichtsoptionen
  .view-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: map.get(vars.$spacing, l);

    .sort-by {
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, s);

      label {
        font-size: map.get(map.get(vars.$fonts, sizes), small);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }

      select {
        padding: 6px 12px;
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);
        font-size: map.get(map.get(vars.$fonts, sizes), small);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            color: mixins.theme-color($theme, text-primary);
            border: 1px solid mixins.theme-color($theme, border-light);
             transition: all 0.4s ease-out;
            &:focus {
              border-color: mixins.theme-color($theme, accent-teal);
              outline: none;
            }
          }
        }
      }
    }

    .view-mode-toggle {
      display: flex;
      gap: map.get(vars.$spacing, xxs);

      .view-button {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: map.get(map.get(vars.$layout, border-radius), small);
        cursor: pointer;
        border: none;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            color: mixins.theme-color($theme, text-secondary);
             transition: all 0.4s ease-out;
            &:hover {
              background-color: mixins.theme-color($theme, hover-color);
            }

            &.active {
              background-color: mixins.theme-color($theme, accent-green);
              color: white;
            }
          }
        }
      }
    }
  }

  // Favoriten-Container
  .favorites-container {

    // Rasteransicht
    &.grid {
      .grid-view {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: map.get(vars.$spacing, l);
      }
    }

    // Listenansicht
    &.list {
      .list-view {
        display: flex;
        flex-direction: column;
        gap: map.get(vars.$spacing, m);
      }
    }

    // Gemeinsame Karten-Stile für Rasteransicht
    .favorite-card {
      position: relative;
      display: flex;
      flex-direction: column;
      padding: map.get(vars.$spacing, l);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      transition: all 0.3s;
      width: 500px;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, card-bg);
          border: 1px solid mixins.theme-color($theme, border-light);
          transition: all 0.4s ease-out;
          &:hover {
            transform: translateY(-5px);
            @include mixins.shadow('medium', $theme);
            border-color: mixins.theme-color($theme, accent-green);
          }

          &.active {
            border-color: mixins.theme-color($theme, accent-green);
            border-width: 2px;
            @include mixins.shadow('medium', $theme);
          }
        }
      }

      .favorite-category {
        align-self: flex-start;
        padding: 4px 12px;
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: mixins.theme-gradient($theme, primary);
            color: white;
          }
        }
      }

      .favorite-content {
        margin-top: map.get(vars.$spacing, m);
        flex: 1;

        h3 {
          margin-top: map.get(vars.$spacing, xs);
          margin-bottom: map.get(vars.$spacing, s);
          font-size: map.get(map.get(vars.$fonts, sizes), large);
          font-weight: map.get(map.get(vars.$fonts, weights), bold);

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }

        .favorite-excerpt {
          margin-bottom: map.get(vars.$spacing, m);
          font-size: map.get(map.get(vars.$fonts, sizes), medium);
          display: -webkit-box;
          -webkit-line-clamp: 3;
          line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }

        .favorite-meta {
          display: flex;
          justify-content: space-between;
          font-size: map.get(map.get(vars.$fonts, sizes), small);

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-tertiary);
            }
          }

          .favorite-author {
            font-weight: map.get(map.get(vars.$fonts, weights), medium);
          }
        }
      }

      .favorite-actions {
        display: flex;
        gap: map.get(vars.$spacing, s);
        margin-top: map.get(vars.$spacing, m);
        justify-content: flex-end;
      }
    }

    // Listenelement-Stile
    .favorite-list-item {
      display: flex;
      justify-content: space-between;
      padding: map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      cursor: pointer;
      transition: all 0.3s;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, card-bg);
          border: 1px solid mixins.theme-color($theme, border-light);
          transition: all 0.4s ease-out;
          &:hover {
            transform: translateY(-3px);
            @include mixins.shadow('small', $theme);
            border-color: mixins.theme-color($theme, accent-green);
          }

          &.active {
            border-color: mixins.theme-color($theme, accent-green);
            border-width: 2px;
            @include mixins.shadow('small', $theme);
          }
        }
      }

      .favorite-list-main {
        flex: 1;
        padding-right: map.get(vars.$spacing, l);

        .favorite-list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: map.get(vars.$spacing, s);

          .favorite-category {
            display: inline-block;
            padding: 4px 10px;
            border-radius: map.get(map.get(vars.$layout, border-radius), pill);
            font-size: map.get(map.get(vars.$fonts, sizes), small);
            font-weight: map.get(map.get(vars.$fonts, weights), medium);

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background: mixins.theme-gradient($theme, primary);
                color: white;
          transition: all 0.4s ease-out;
              }
            }
          }

          .favorite-meta {
            display: flex;
            gap: map.get(vars.$spacing, m);
            font-size: map.get(map.get(vars.$fonts, sizes), small);

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-tertiary);
              }
            }

            .favorite-author {
              font-weight: map.get(map.get(vars.$fonts, weights), medium);
            }
          }
        }

        .favorite-title {
          margin-bottom: map.get(vars.$spacing, s);
          font-size: map.get(map.get(vars.$fonts, sizes), large);
          font-weight: map.get(map.get(vars.$fonts, weights), bold);

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }

        .favorite-excerpt {
          font-size: map.get(map.get(vars.$fonts, sizes), medium);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }
      }

      .favorite-list-actions {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: map.get(vars.$spacing, s);
      }

      // Responsive-Anpassungen für die Listenansicht
      @media (max-width: 768px) {
        flex-direction: column;

        .favorite-list-main {
          padding-right: 0;
          margin-bottom: map.get(vars.$spacing, m);
        }

        .favorite-list-actions {
          flex-direction: row;
          justify-content: flex-start;
        }
      }
    }

    // Gemeinsame Stile für Aktionsschaltflächen
    .action-button {
      padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      cursor: pointer;
      transition: all 0.4s ease-out;

      border: none;

      &.read {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: mixins.theme-gradient($theme, primary);
            color: white;

            &:hover {
              transform: translateY(-2px);
              @include mixins.shadow('small', $theme);
            }
          }
        }
      }

      &.remove {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: transparent;
            color: #ff6b6b;
            border: 1px solid rgba(255, 107, 107, 0.3);

            &:hover {
              background-color: rgba(255, 107, 107, 0.1);
              border-color: rgba(255, 107, 107, 0.5);
            }
          }
        }
      }
    }
  }

  // Leerer Zustand
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: map.get(vars.$spacing, xxl);
    text-align: center;

    .empty-icon {
      font-size: 4rem;
      margin-bottom: map.get(vars.$spacing, l);
      opacity: 0.5;
    }

    h3 {
      font-size: map.get(map.get(vars.$fonts, sizes), xl);
      margin-bottom: map.get(vars.$spacing, m);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    p {
      font-size: map.get(map.get(vars.$fonts, sizes), medium);
      margin-bottom: map.get(vars.$spacing, l);
      max-width: 500px;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }

    .reset-button {
      padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      border: none;
      cursor: pointer;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, primary);
          color: white;
          transition: all 0.4s ease-out;

          &:hover {
            transform: translateY(-3px);
            @include mixins.shadow('medium', $theme);
          }
        }
      }
    }
  }

  // Bestätigungsdialog
  .confirm-dialog-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    border-radius: 20px;

    .confirm-dialog {
      width: 100%;
      max-width: 400px;
      padding: map.get(vars.$spacing, xl);
      border-radius: map.get(map.get(vars.$layout, border-radius), large);
      @include animations.fade-in(0.3s);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, card-bg);
          @include mixins.shadow('large', $theme);
          transition: all 0.4s ease-out;
        }
      }

      h3 {
        font-size: map.get(map.get(vars.$fonts, sizes), large);
        margin-bottom: map.get(vars.$spacing, m);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }

      p {
        margin-bottom: map.get(vars.$spacing, l);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: map.get(vars.$spacing, m);

        button {
          padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
          border-radius: map.get(map.get(vars.$layout, border-radius), medium);
          font-weight: map.get(map.get(vars.$fonts, weights), medium);
          cursor: pointer;
          border: none;

          &.cancel-button {
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background-color: mixins.theme-color($theme, secondary-bg);
                color: mixins.theme-color($theme, text-primary);
                border: 1px solid mixins.theme-color($theme, border-light);
              }
            }
          }

          &.confirm-button {
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background-color: #ff6b6b;
                color: white;

                &:hover {
                  background-color: color.adjust(#ff6b6b, $lightness: -10%);
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>