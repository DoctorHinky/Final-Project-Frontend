<!-- src/components/member/dashboard/Library.vue -->
<template>
  <div class="library-dashboard">
    <!-- Hauptansicht der Artikel -->
    <div v-if="!articleReaderMode">
      <div class="page-header">
        <h2>Bibliothek</h2>
        <p>Entdecke alle verfügbaren Artikel zu verschiedenen Themen</p>
      </div>

      <!-- Filter- und Suchleiste -->
      <search-filter
        :search-query="searchQuery"
        :filter-category="filterCategory"
        :sort-option="sortOption"
        :view-mode="viewMode"
        :selected-tags="selectedTags"
        :unique-categories="uniqueCategories"
        @update:search-query="searchQuery = $event"
        @update:filter-category="filterCategory = $event"
        @update:sort-option="sortOption = $event"
        @update:view-mode="viewMode = $event"
        @filter-articles="applyFilters"
        @remove-tag="removeTag"
        @clear-tags="clearTags"
      />

      <!-- Themen-Schnellauswahl -->
      <topics-section :popular-topics="popularTopics" :selected-tags="selectedTags" @toggle-tag="toggleTag" />

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

      <!-- Artikel-Anzeige -->
      <div v-else-if="filteredArticles.length > 0" class="articles-section">
        <div :class="['articles-container', viewMode]">
          <!-- Grid-Ansicht -->
          <articles-grid
            v-if="viewMode === 'grid'"
            :articles="filteredArticles"
            @open-article="openArticleReader"
            @toggle-bookmark="toggleBookmark"
            @add-tag="addTag"
          />

          <!-- Listen-Ansicht -->
          <articles-list
            v-else-if="viewMode === 'list'"
            :articles="filteredArticles"
            @open-article="openArticleReader"
            @toggle-bookmark="toggleBookmark"
            @add-tag="addTag"
          />
        </div>
      </div>

      <!-- Leerer Zustand -->
      <empty-state v-else-if="!loading" @reset-filters="resetFilters" @explore-all="exploreAll" />

      <!-- Paginierung -->
      <div v-if="meta && meta.totalPages > 1" class="pagination">
        <button class="pagination-button" :disabled="meta.currentPage <= 1" @click="loadPage(meta.currentPage - 1)">
          « Zurück
        </button>

        <div class="page-numbers">
          <button
            v-for="page in paginationPages"
            :key="page"
            class="page-number"
            :class="{ active: page === meta.currentPage }"
            @click="loadPage(page)"
          >
            {{ page }}
          </button>
        </div>

        <button
          class="pagination-button"
          :disabled="meta.currentPage >= meta.totalPages"
          @click="loadPage(meta.currentPage + 1)"
        >
          Weiter »
        </button>
      </div>
    </div>

    <!-- Artikel-Leseansicht -->
    <div v-else class="article-reader-mode">
      <article-reader :articleId="selectedArticleId || ''" @close="closeArticleReader" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import ArticleReader from "@/components/member/article/ArticleReader.vue";
import {
  SearchFilter,
  TopicsSection,
  ArticlesGrid,
  ArticlesList,
  EmptyState,
} from "@/components/pages/DashboardPages/Library";
import { postService, type PostPreviewItem } from "@/services/post.service";
import { historyService } from "@/services/history.service";
import type { LibraryArticle } from "@/types/dtos";
import { mapPostCategoryToGerman } from "@/utils/postCategory";

export default defineComponent({
  name: "LibraryDashboard",
  components: {
    ArticleReader,
    SearchFilter,
    TopicsSection,
    ArticlesGrid,
    ArticlesList,
    EmptyState,
  },
  setup() {
    // Backend State
    const loading = ref(false);
    const error = ref<string | null>(null);
    const articles = ref<PostPreviewItem[]>([]);
    const meta = ref<{
      currentPage: number;
      totalPages: number;
      totalPosts: number;
    } | null>(null);

    // UI State
    const searchQuery = ref("");
    const filterCategory = ref("");
    const sortOption = ref("date-desc");
    const viewMode = ref("grid");
    const selectedTags = ref<string[]>([]);
    const itemsPerPage = ref(9);

    // ArticleReader State
    const articleReaderMode = ref(false);
    const selectedArticle = ref<PostPreviewItem | null>(null);
    const selectedArticleId = ref<string | null>(null);

    // Beliebte Themen (später eventuell vom Backend)
    const popularTopics = [
      "Erziehung",
      "Gesundheit",
      "Bildung",
      "Entwicklung",
      "Familienleben",
      "Kleinkind",
      "Kommunikation",
      "Spiel",
      "Grenzen",
      "Medien",
    ];

    // Eindeutige Kategorien aus Backend-Daten
    const uniqueCategories = computed(() => {
      const categories = new Set<string>();
      articles.value.forEach((article) => {
        categories.add(article.category);
      });
      return Array.from(categories).sort();
    });

    // Backend-Artikel zu Frontend-Format konvertieren
    const convertToLibraryArticle = (item: PostPreviewItem): LibraryArticle => {
      return {
        id: item.id,
        title: item.title,
        quickDescription: item.quickDescription,
        category: mapPostCategoryToGerman(item.category),
        author: {
          id: item.author.id,
          username: item.author.username,
          profilePicture: item.author.profilePicture,
        },
        publishedAt: formatDate(item.createdAt),
        tags: item.tags.slice(0, 3),
        image: item.image,
        isCertifiedAuthor: item.isCertifiedAuthor,
        createdAt: item.createdAt,
        // Geschätzte Werte
        readTime: estimateReadTime(item.quickDescription),
      };
    };

    // Helper: Datum formatieren
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    // Helper: Lesezeit schätzen
    const estimateReadTime = (text: string): string => {
      const words = text.split(" ").length;
      const minutes = Math.max(1, Math.ceil(words / 200)); // ~200 Wörter pro Minute
      return `${minutes} min`;
    };

    // Artikel vom Backend laden
    const loadArticles = async (page: number = 1) => {
      loading.value = true;
      error.value = null;

      try {
        const response = await postService.getPostPreviews(page, itemsPerPage.value);
        articles.value = response.data;
        meta.value = response.meta;
      } catch (err) {
        error.value = err instanceof Error ? err.message : "Fehler beim Laden der Artikel";
        console.error("Error loading articles:", err);
      } finally {
        loading.value = false;
      }
    };

    // Frontend-Filterung der geladenen Artikel
    const filteredArticles = computed(() => {
      let result = articles.value.map(convertToLibraryArticle);

      // Nach Suchbegriff filtern
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(
          (article) =>
            article.title.toLowerCase().includes(query) ||
            article.quickDescription.toLowerCase().includes(query) ||
            article.category.toLowerCase().includes(query) ||
            article.author.username.toLowerCase().includes(query) ||
            article.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      // Nach Kategorie filtern
      if (filterCategory.value) {
        result = result.filter((article) => article.category === filterCategory.value);
      }

      // Nach Tags filtern
      if (selectedTags.value.length > 0) {
        result = result.filter((article) =>
          selectedTags.value.some((tag) =>
            article.tags.some((articleTag) => articleTag.toLowerCase().includes(tag.toLowerCase()))
          )
        );
      }

      // Sortieren
      result = sortArticles(result);

      return result;
    });

    // Artikel sortieren
    const sortArticles = (articlesToSort: LibraryArticle[]) => {
      const sorted = [...articlesToSort];

      switch (sortOption.value) {
        case "date-desc":
          return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        case "date-asc":
          return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        case "title-asc":
          return sorted.sort((a, b) => a.title.localeCompare(b.title));
        case "title-desc":
          return sorted.sort((a, b) => b.title.localeCompare(a.title));
        default:
          return sorted;
      }
    };

    // Seite laden
    const loadPage = (page: number) => {
      if (page >= 1 && meta.value && page <= meta.value.totalPages) {
        loadArticles(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    // Pagination-Seiten berechnen
    const paginationPages = computed(() => {
      if (!meta.value) return [];

      const current = meta.value.currentPage;
      const total = meta.value.totalPages;
      const pages = [];

      // Zeige maximal 5 Seiten
      const start = Math.max(1, current - 2);
      const end = Math.min(total, start + 4);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    });

    // ArticleReader öffnen
    const openArticleReader = async (article: LibraryArticle) => {
      try {
        // Originalen PostPreviewItem finden
        const originalArticle = articles.value.find((a) => a.id === article.id);
        if (!originalArticle) return;

        selectedArticle.value = originalArticle;
        selectedArticleId.value = article.id;

        articleReaderMode.value = true;

        // Artikel als gelesen markieren
        await historyService.markAsRead(article.id);
      } catch (err) {
        console.error("Error opening article:", err);
        alert("Fehler beim Öffnen des Artikels");
      }
    };

    // ArticleReader schließen
    const closeArticleReader = () => {
      articleReaderMode.value = false;
      selectedArticle.value = null;
    };

    // Artikel für ArticleReader konvertieren (BaseArticleItem-kompatibel)

    // Filter und Suche
    const applyFilters = () => {
      // Filtert durch computed automatisch
    };

    const addTag = (tag: string) => {
      if (!selectedTags.value.includes(tag)) {
        selectedTags.value.push(tag);
      }
    };

    const toggleTag = (tag: string) => {
      const index = selectedTags.value.indexOf(tag);
      if (index === -1) {
        selectedTags.value.push(tag);
      } else {
        selectedTags.value.splice(index, 1);
      }
    };

    const removeTag = (index: number) => selectedTags.value.splice(index, 1);

    const clearTags = () => (selectedTags.value = []);

    const resetFilters = () => {
      searchQuery.value = "";
      filterCategory.value = "";
      selectedTags.value = [];
      sortOption.value = "date-desc";
    };

    const exploreAll = () => {
      resetFilters();
      loadArticles(1);
    };

    // Dummy Bookmark-Funktion (später implementieren)
    const toggleBookmark = (_article: LibraryArticle) => {
      // TODO: Backend-Integration für Bookmarks
    };

    // Beim Mounten Artikel laden
    onMounted(() => {
      loadArticles();
    });

    return {
      // Backend State
      loading,
      error,
      meta,

      // UI State
      searchQuery,
      filterCategory,
      sortOption,
      viewMode,
      selectedTags,

      // Data
      filteredArticles,
      popularTopics,
      uniqueCategories,
      paginationPages,

      // ArticleReader
      articleReaderMode,
      selectedArticleId,
      // Functions
      loadArticles,
      loadPage,
      openArticleReader,
      closeArticleReader,
      applyFilters,
      addTag,
      toggleTag,
      removeTag,
      clearTags,
      resetFilters,
      exploreAll,
      toggleBookmark,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;
@use "@/style/base/animations" as animations;

.library-dashboard {
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

  // Artikel-Sektion
  .articles-section {
    margin-bottom: map.get(vars.$spacing, xl);
  }

  // Pagination
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: map.get(vars.$spacing, m);
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

    .page-numbers {
      display: flex;
      gap: map.get(vars.$spacing, xs);

      .page-number {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: map.get(map.get(vars.$layout, border-radius), small);
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        cursor: pointer;
        border: none;
        transition: all 0.3s;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            color: mixins.theme-color($theme, text-primary);
            border: 1px solid mixins.theme-color($theme, border-light);

            &:hover:not(.active) {
              background-color: mixins.theme-color($theme, hover-color);
            }

            &.active {
              background: mixins.theme-gradient($theme, primary);
              color: white;
              border-color: transparent;
            }
          }
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
