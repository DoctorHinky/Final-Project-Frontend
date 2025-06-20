<!-- src/components/member/dashboard/MyArticles.vue -->
<template>
  <div class="my-articles-dashboard">
    <!-- Hauptansicht der Artikel -->
    <div v-if="!articleReaderMode">
      <div class="page-header">
        <h2>Meine Artikel</h2>
        <p>Hier findest du deine kürzlich gelesenen Artikel</p>
      </div>

      <!-- Suchleiste -->
      <search-section
        :search-query="searchQuery"
        :filter-tags="filterTags"
        @update:search-query="searchQuery = $event"
        @filter-articles="filterArticles"
        @remove-filter-tag="removeFilterTag"
        @clear-filters="clearFilters"
      />

      <!-- Tabs für verschiedene Artikelgruppen -->
      <articles-tabs
        :tabs="tabs"
        :active-tab="activeTab"
        :article-counts="articleCounts"
        @update:active-tab="activeTab = $event"
      />

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Artikel werden geladen...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Fehler beim Laden</h3>
        <p>{{ error }}</p>
        <button @click="loadArticles()" class="retry-button">Erneut versuchen</button>
      </div>

      <!-- Artikelliste -->
      <articles-list
        v-else-if="filteredArticles.length > 0"
        :filtered-articles="filteredArticles"
        :sort-option="sortOption"
        :view-mode="viewMode"
        @update:sort-option="sortOption = $event"
        @update:view-mode="viewMode = $event"
        @open-article="openArticleReader"
        @remove-article="removeArticleFromHistory"
        @add-filter-tag="addFilterTag"
      />

      <!-- Anzeige eines leeren Zustands -->
      <empty-state
        v-else-if="!loading && articles.length === 0"
        @reset-filters="clearFilters"
        :is-empty-history="true"
      />

      <!-- Keine gefilterten Ergebnisse -->
      <empty-state
        v-else-if="!loading && filteredArticles.length === 0"
        @reset-filters="clearFilters"
        :is-empty-history="false"
      />

      <!-- Pagination -->
      <div v-if="meta && meta.totalPages > 1" class="pagination">
        <button class="pagination-button" :disabled="meta.page <= 1" @click="loadPage(meta.page - 1)">Zurück</button>

        <span class="pagination-info"> Seite {{ meta.page }} von {{ meta.totalPages }} </span>

        <button class="pagination-button" :disabled="meta.page >= meta.totalPages" @click="loadPage(meta.page + 1)">
          Weiter
        </button>
      </div>
    </div>

    <!-- Artikel-Leseansicht -->
    <div v-else class="article-reader-mode">
      <article-reader :articleId="selectedArticle?.id || ''" @close="closeArticleReader" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from "vue";
import ArticleReader from "@/components/member/article/ArticleReader.vue";
import { mapPostCategoryToGerman } from "@/utils/postCategory";
import { SearchSection, ArticlesTabs, ArticlesList, EmptyState } from "@/components/pages/DashboardPages/MyArticles";
import { historyService, type HistoryItem } from "@/services/history.service";
import type { MyArticleItem, MyArticleTab } from "@/types/MyArticles.types";

export default defineComponent({
  name: "MyArticlesDashboard",
  components: {
    ArticleReader,
    SearchSection,
    ArticlesTabs,
    ArticlesList,
    EmptyState,
  },
  setup() {
    // Reactive State
    const loading = ref(false);
    const error = ref<string | null>(null);
    const articles = ref<MyArticleItem[]>([]);
    const selectedArticle = ref<MyArticleItem | null>(null);
    const articleReaderMode = ref(false);
    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const meta = ref<{
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    } | null>(null);

    // Tabs für verschiedene Artikelgruppen
    const tabs = ref<MyArticleTab[]>([
      { id: "all", name: "Alle Artikel" },
      // Später hinzufügen wenn Backend bereit:
      // { id: "reading", name: "Aktuelle" },
      // { id: "completed", name: "Abgeschlossen" },
    ]);

    // Artikel-Counts für Tabs
    const articleCounts = computed(() => {
      return {
        all: articles.value.length,
        reading: articles.value.filter((a) => a.status === "reading").length,
        completed: articles.value.filter((a) => a.status === "completed").length,
      };
    });

    // Filter State
    const activeTab = ref("all");
    const searchQuery = ref("");
    const filterTags = ref<string[]>([]);
    const viewMode = ref("grid");
    const sortOption = ref("date-desc");

    // Helper: Formatiere Datum für Anzeige
    const formatLastRead = (readAt: string): string => {
      const date = new Date(readAt);
      const now = new Date();
      const diffTime = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

      if (diffHours < 1) return "Gerade eben";
      if (diffHours < 24) return `Vor ${diffHours} Stunde${diffHours > 1 ? "n" : ""}`;
      if (diffDays === 1) return "Gestern";
      if (diffDays < 7) return `Vor ${diffDays} Tagen`;

      return date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    // Helper: Konvertiere History zu MyArticleItem
    const convertHistoryToArticle = (historyItem: HistoryItem): MyArticleItem => {
      return {
        // History-Daten
        historyId: historyItem.id,
        readAt: historyItem.readAt,

        // Post-Daten (aus History-Response)
        id: historyItem.postId,
        title: historyItem.postTitle,
        image: historyItem.postImage ?? null,
        quickDescription: historyItem.postQuickDescription,
        author: {
          username: historyItem.author.username ?? "unbekannt",
        },

        // Dummy-Werte (werden später durch echte Post-Daten ersetzt)
        category: mapPostCategoryToGerman(historyItem.postCategory),
        tags: historyItem.postTags.slice(0, 3) ?? [],
        createdAt: historyItem.readAt,
        isCertifiedAuthor: historyItem.author.isPedagogicalAuthor ?? false,

        // Computed Felder
        lastRead: formatLastRead(historyItem.readAt),
        status: historyItem.solvedAt ? "completed" : "reading",
      };
    };

    // Artikel laden
    const loadArticles = async (page: number = 1) => {
      loading.value = true;
      error.value = null;

      try {
        const response = await historyService.getHistory(page, itemsPerPage.value);

        // Konvertiere History-Items zu MyArticleItems
        articles.value = response.data.map(convertHistoryToArticle);
        meta.value = response.meta;
        currentPage.value = page;
      } catch (err) {
        error.value = err instanceof Error ? err.message : "Unbekannter Fehler beim Laden der Artikel";
        console.error("Error loading articles:", err);
      } finally {
        loading.value = false;
      }
    };

    // Seite laden
    const loadPage = (page: number) => {
      if (page >= 1 && meta.value && page <= meta.value.totalPages) {
        loadArticles(page);
      }
    };

    // Gefilterte Artikel basierend auf Tab, Suche und Tags
    const filteredArticles = computed(() => {
      let result = [...articles.value];

      // Nach Tab filtern
      if (activeTab.value !== "all") {
        result = result.filter((article) => article.status === activeTab.value);
      }

      // Nach Suchbegriff filtern
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(
          (article) =>
            article.title.toLowerCase().includes(query) ||
            article.quickDescription.toLowerCase().includes(query) ||
            (article.author && article.author.username.toLowerCase().includes(query)) ||
            article.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      // Nach Tags filtern
      if (filterTags.value.length > 0) {
        result = result.filter(
          (article) =>
            article.tags &&
            filterTags.value.some((tag) =>
              article.tags.some((articleTag) => articleTag.toLowerCase() === tag.toLowerCase())
            )
        );
      }

      // Sortieren
      result = sortArticles(result);

      return result;
    });

    // Artikel sortieren
    const sortArticles = (articlesToSort: MyArticleItem[]) => {
      const sorted = [...articlesToSort];

      switch (sortOption.value) {
        case "date-desc":
          return sorted.sort((a, b) => new Date(b.readAt).getTime() - new Date(a.readAt).getTime());
        case "date-asc":
          return sorted.sort((a, b) => new Date(a.readAt).getTime() - new Date(b.readAt).getTime());
        case "title-asc":
          return sorted.sort((a, b) => a.title.localeCompare(b.title));
        case "title-desc":
          return sorted.sort((a, b) => b.title.localeCompare(a.title));
        default:
          return sorted;
      }
    };

    // Artikel in Reader-Modus öffnen
    const openArticleReader = async (article: MyArticleItem) => {
      try {
        // Hier würde später der vollständige Artikel geladen werden
        // Vorerst verwenden wir die vorhandenen Daten
        selectedArticle.value = article;
        articleReaderMode.value = true;
      } catch (err) {
        console.error("Error opening article:", err);
        alert("Fehler beim Öffnen des Artikels");
      }
    };

    // Reader-Modus schließen
    const closeArticleReader = () => {
      articleReaderMode.value = false;
      selectedArticle.value = null;
    };

    // Artikel aus Historie entfernen
    const removeArticleFromHistory = async (articleId: string) => {
      try {
        // Finde das History-Item
        const article = articles.value.find((a) => a.id === articleId);
        if (!article) return;

        // Bestätigung anfordern
        const confirmed = confirm(`Möchtest du "${article.title}" wirklich aus deiner Lesehistorie entfernen?`);
        if (!confirmed) return;

        // Aus Backend entfernen
        await historyService.removeFromHistory(article.historyId);

        // Aus lokaler Liste entfernen
        articles.value = articles.value.filter((a) => a.id !== articleId);

        // Toast/Notification (falls verfügbar)
        console.log("Artikel erfolgreich aus Historie entfernt");
      } catch (err) {
        console.error("Error removing article:", err);
        alert("Fehler beim Entfernen des Artikels aus der Historie");
      }
    };

    // Suche und Filter
    const filterArticles = () => {
      // Filtert Artikel nach aktuellem Suchbegriff - wird durch computed automatisch gemacht
    };

    // Filter-Tag hinzufügen
    const addFilterTag = (tag: string) => {
      if (!filterTags.value.includes(tag)) {
        filterTags.value.push(tag);
      }
    };

    // Filter-Tag entfernen
    const removeFilterTag = (index: number) => {
      filterTags.value.splice(index, 1);
    };

    // Alle Filter zurücksetzen
    const clearFilters = () => {
      filterTags.value = [];
      searchQuery.value = "";
    };

    // Bei Tab-Wechsel Filter zurücksetzen
    watch(activeTab, () => {
      clearFilters();
    });

    // Beim Mounten Artikel laden
    onMounted(() => {
      loadArticles();
    });

    return {
      // Reactive State
      loading,
      error,
      articles,
      meta,
      selectedArticle,
      articleReaderMode,

      // UI State
      tabs,
      activeTab,
      searchQuery,
      filterTags,
      filteredArticles,
      viewMode,
      sortOption,
      articleCounts,

      // Functions
      loadArticles,
      loadPage,
      openArticleReader,
      closeArticleReader,
      removeArticleFromHistory,
      filterArticles,
      addFilterTag,
      removeFilterTag,
      clearFilters,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;
@use "@/style/base/animations" as animations;

.my-articles-dashboard {
  @include animations.fade-in(0.5s);
  display: flex;
  flex-direction: column;
  gap: map.get(vars.$spacing, l);
  width: 100%;
  margin: 0 auto;
  padding: 0 map.get(vars.$spacing, m);

  @media (max-width: 768px) {
    padding: 0 map.get(vars.$spacing, s);
  }

  .page-header {
    margin-bottom: map.get(vars.$spacing, l);

    h2 {
      font-size: map.get(map.get(vars.$fonts, sizes), xxl);
      font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
      margin-bottom: map.get(vars.$spacing, xs);

      @media (max-width: 576px) {
        font-size: map.get(map.get(vars.$fonts, sizes), xl);
      }

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    p {
      font-size: map.get(map.get(vars.$fonts, sizes), medium);

      @media (max-width: 576px) {
        font-size: map.get(map.get(vars.$fonts, sizes), small);
      }

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  // Loading State
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: map.get(vars.$spacing, xxl);
    text-align: center;

    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 3px solid;
      border-radius: 50%;
      margin-bottom: map.get(vars.$spacing, m);
      animation: spin 1s linear infinite;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          border-color: mixins.theme-color($theme, border-light);
          border-top-color: mixins.theme-color($theme, primary);
        }
      }
    }

    p {
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  // Error State
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: map.get(vars.$spacing, xxl);
    text-align: center;

    .error-icon {
      font-size: 3rem;
      margin-bottom: map.get(vars.$spacing, m);
    }

    h3 {
      margin-bottom: map.get(vars.$spacing, s);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    p {
      margin-bottom: map.get(vars.$spacing, l);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }

    .retry-button {
      padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      border: none;
      cursor: pointer;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, primary);
          color: white;

          &:hover {
            transform: translateY(-2px);
            @include mixins.shadow("small", $theme);
          }
        }
      }
    }
  }

  // Pagination
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: map.get(vars.$spacing, l);
    margin-top: map.get(vars.$spacing, xl);
    padding: map.get(vars.$spacing, l);

    .pagination-button {
      padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      border: none;
      cursor: pointer;
      transition: all 0.3s;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          color: mixins.theme-color($theme, text-primary);
          border: 1px solid mixins.theme-color($theme, border-light);

          &:hover:not(:disabled) {
            background-color: mixins.theme-color($theme, hover-color);
            transform: translateY(-2px);
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }
      }
    }

    .pagination-info {
      font-weight: map.get(map.get(vars.$fonts, weights), medium);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  // Artikel-Leseansicht nimmt den gesamten Bereich ein
  .article-reader-mode {
    width: 100%;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
