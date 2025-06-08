<!-- src/components/member/dashboard/MyArticles.vue -->
<template>
  <div class="my-articles-dashboard">
    <!-- Hauptansicht der Artikel -->
    <div v-if="!articleReaderMode">
      <div class="page-header">
        <h2>Meine Artikel</h2>
        <p>Hier findest du deine gespeicherten und kürzlich gelesenen Artikel</p>
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
        :articles="articles"
        @update:active-tab="activeTab = $event"
      />

      <!-- Artikelliste -->
      <articles-list
        v-if="filteredArticles.length > 0"
        :filtered-articles="filteredArticles"
        :sort-option="sortOption"
        :view-mode="viewMode"
        @update:sort-option="sortOption = $event"
        @update:view-mode="viewMode = $event"
        @open-article="openArticleReader"
        @toggle-bookmark="toggleBookmark"
        @add-filter-tag="addFilterTag"
      />

      <!-- Anzeige eines leeren Zustands -->
      <empty-state v-if="filteredArticles.length === 0" @reset-filters="clearFilters" />
    </div>

    <!-- Artikel-Leseansicht -->
    <div v-else class="article-reader-mode">
      <article-reader :article="selectedArticle" @close="closeArticleReader" @toggle-bookmark="toggleBookmark" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import ArticleReader from "@/components/member/article/ArticleReader.vue";
import { SearchSection, ArticlesTabs, ArticlesList, EmptyState } from "@/components/pages/DashboardPages/MyArticles";
import type { Article } from "@/types/Article";

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
    // Tabs für verschiedene Artikelgruppen
    const tabs = ref([
      { id: "all", name: "Alle Artikel" },
/*       { id: "reading", name: "Leseliste" }, */
/*       { id: "completed", name: "Abgeschlossene" },
      { id: "bookmarked", name: "Favoriten" }, */
       /* Kommt später noch hinzu */
    ]);

    const activeTab = ref("all");
    const searchQuery = ref("");
    const filterTags = ref<string[]>([]);
    const viewMode = ref("grid");
    const sortOption = ref("date-desc");
    const selectedArticle = ref<Article | null>(null);

    // Flag für Artikel-Leseansicht
    const articleReaderMode = ref(false);

    // Artikeldaten (später durch API ersetzen)
    const articles = ref<Article[]>([
      {
        id: 1,
        title: "Erziehungsstile im Vergleich: Welcher passt zu Ihrer Familie?",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quis lorem ut libero malesuada feugiat. Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Cras ultricies ligula sed magna dictum porta. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Sed porttitor lectus nibh. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Nulla quis lorem ut libero malesuada feugiat.",
        preview:
          "Eine umfassende Analyse verschiedener Erziehungsansätze und wie sie sich auf die Entwicklung Ihres Kindes auswirken können.",
        featured: true,
        date: "05.05.2025",
        category: "Erziehung",
        author: "Dr. Anna Schmidt",
        tags: ["Erziehung", "Familienleben", "Entwicklung"],
        currentChapter: 4,
        totalChapters: 6,
        lastRead: "Gestern",
        status: "reading",
        quiz: {
          enabled: true,
          questions: [
            {
              question:
                "Welcher Erziehungsstil wird im Artikel als am effektivsten für die Entwicklung von Selbstständigkeit beschrieben?",
              options: ["Autoritärer Stil", "Permissiver Stil", "Autoritativer Stil", "Vernachlässigender Stil"],
              correctAnswer: 2,
            },
            {
              question: "Was ist laut Artikel ein Hauptmerkmal des autoritativen Erziehungsstils?",
              options: [
                "Strenge Kontrolle ohne Erklärungen",
                "Hohe Wärme bei gleichzeitigen klaren Grenzen",
                "Wenige Regeln und Konsequenzen",
                "Distanz zur emotionalen Entwicklung des Kindes",
              ],
              correctAnswer: 1,
            },
          ],
        },
      },
      {
        id: 2,
        title: "Gesunde Ernährung für Kleinkinder: Ein praktischer Leitfaden",
        content:
          "Die frühen Jahre sind entscheidend für die Entwicklung gesunder Essgewohnheiten. Dieser Artikel bietet praktische Tipps für eine ausgewogene Ernährung von Kleinkindern, geeignete Portionsgrößen und kreative Ideen, um auch wählerische Esser zu überzeugen.",
        preview:
          "Praktische Tipps für eine ausgewogene Ernährung von Kleinkindern und wie man auch wählerische Esser überzeugen kann.",
        featured: true,
        date: "01.05.2025",
        category: "Ernährung",
        author: "Maria Weber",
        tags: ["Ernährung", "Kleinkind", "Gesundheit"],
        currentChapter: 1,
        totalChapters: 8,
        lastRead: "Vor 3 Tagen",
        status: "reading",
        quiz: {
          enabled: true,
          questions: [
            {
              question:
                "Wie viele Portionen Obst und Gemüse sollten Kleinkinder laut dem Artikel täglich zu sich nehmen?",
              options: [
                "1-2 Portionen",
                "3-5 Portionen",
                "6-8 Portionen",
                "Es kommt ausschließlich auf die Qualität an",
              ],
              correctAnswer: 1,
            },
          ],
        },
      },
      {
        id: 3,
        title: "Digitale Medien im Kindesalter: Fluch oder Segen?",
        content:
          "Die Digitalisierung ist aus unserem Alltag nicht mehr wegzudenken. Dieser Artikel beleuchtet die Vor- und Nachteile digitaler Medien für Kinder verschiedener Altersgruppen und gibt Empfehlungen für einen gesunden Umgang mit Bildschirmzeit.",
        preview:
          "Eine ausgewogene Betrachtung der Vor- und Nachteile digitaler Medien für Kinder und Empfehlungen für einen gesunden Umgang.",
        featured: true,
        date: "28.04.2025",
        category: "Medien",
        author: "Prof. Thomas Becker",
        tags: ["Medien", "Bildschirmzeit", "Entwicklung"],
        status: "bookmarked",
        quiz: {
          enabled: true,
          questions: [
            {
              question: "Welche Bildschirmzeit empfiehlt der Artikel maximal für Kinder zwischen 2 und 5 Jahren?",
              options: ["Keine Bildschirmzeit", "30 Minuten pro Tag", "1 Stunde pro Tag", "2 Stunden pro Tag"],
              correctAnswer: 2,
            },
          ],
        },
      },
      {
        id: 4,
        title: "Grenzen setzen ohne Konflikte: Effektive Kommunikation mit Kindern",
        content:
          "Klare Grenzen zu setzen ist wichtig für die Entwicklung von Kindern. In diesem Artikel erfahren Sie, wie Sie mit effektiven Kommunikationstechniken Regeln etablieren können, ohne dass es zu unnötigen Konflikten kommt.",
        preview:
          "Wie Sie mit effektiven Kommunikationstechniken klare Regeln etablieren können, ohne dass es zu unnötigen Konflikten kommt.",
        featured: false,
        date: "25.04.2025",
        category: "Kommunikation",
        author: "Dr. Lisa Müller",
        tags: ["Kommunikation", "Grenzen", "Erziehung"],
        currentChapter: 6,
        totalChapters: 6,
        lastRead: "Vor einer Woche",
        status: "completed",
        quiz: {
          enabled: true,
          questions: [
            {
              question:
                "Welche Kommunikationstechnik wird im Artikel als besonders effektiv für das Setzen von Grenzen bei Kleinkindern beschrieben?",
              options: ["Ich-Botschaften", "Konsequentes Ignorieren", "Zeitstrafen", "Belohnungssysteme"],
              correctAnswer: 0,
            },
          ],
        },
      },
      {
        id: 5,
        title: "Die Phasen der kindlichen Entwicklung verstehen",
        content:
          "Von der Geburt bis zur Adoleszenz durchlaufen Kinder verschiedene Entwicklungsphasen. Dieser Artikel erklärt die wichtigsten Meilensteine und wie Eltern ihr Kind in jeder Phase optimal unterstützen können.",
        preview: "Erfahren Sie, wie Sie Ihr Kind in jeder Entwicklungsphase optimal unterstützen können.",
        featured: false,
        date: "20.04.2025",
        category: "Entwicklung",
        author: "Dr. Maria Schmidt",
        tags: ["Entwicklung", "Psychologie", "Meilensteine"],
        currentChapter: 8,
        totalChapters: 8,
        lastRead: "Vor zwei Wochen",
        status: "completed",
        quiz: {
          enabled: true,
          questions: [
            {
              question: 'In welchem Alter beginnt laut dem Artikel typischerweise die Phase des "magischen Denkens"?',
              options: ["6-12 Monate", "1-2 Jahre", "3-6 Jahre", "7-11 Jahre"],
              correctAnswer: 2,
            },
          ],
        },
      },
    ]);

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
            article.content.toLowerCase().includes(query) ||
            article.preview.toLowerCase().includes(query) ||
            (article.tags && article.tags.some((tag) => tag.toLowerCase().includes(query)))
        );
      }

      // Nach Tags filtern
      if (filterTags.value.length > 0) {
        result = result.filter(
          (article) =>
            article.tags &&
            filterTags.value.some((tag) =>
              article.tags!.some((articleTag) => articleTag.toLowerCase() === tag.toLowerCase())
            )
        );
      }

      // Sortieren
      result = sortArticles(result);

      return result;
    });

    // Artikel sortieren
    const sortArticles = (articlesToSort: Article[]) => {
      const sorted = [...articlesToSort];

      switch (sortOption.value) {
        case "date-desc":
          return sorted.sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return (
              new Date(b.date.split(".").reverse().join("-")).getTime() -
              new Date(a.date.split(".").reverse().join("-")).getTime()
            );
          });
        case "date-asc":
          return sorted.sort((a, b) => {
            if (!a.date) return -1;
            if (!b.date) return 1;
            return (
              new Date(a.date.split(".").reverse().join("-")).getTime() -
              new Date(b.date.split(".").reverse().join("-")).getTime()
            );
          });
        case "title-asc":
          return sorted.sort((a, b) => a.title.localeCompare(b.title));
        case "title-desc":
          return sorted.sort((a, b) => b.title.localeCompare(a.title));
        default:
          return sorted;
      }
    };

    // Artikel in Reader-Modus öffnen
    const openArticleReader = (article: Article) => {
      selectedArticle.value = article;
      articleReaderMode.value = true;
    };

    // Reader-Modus schließen
    const closeArticleReader = () => {
      articleReaderMode.value = false;
      selectedArticle.value = null;
    };

    // Lesezeichen-Status umschalten
    const toggleBookmark = (article: Article) => {
      article.status =
        article.status === "bookmarked"
          ? article.currentChapter === article.totalChapters
            ? "completed"
            : "reading"
          : "bookmarked";
    };

    // Suche und Filter
    const filterArticles = () => {
      // Filtert Artikel nach aktuellem Suchbegriff
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

    return {
      tabs,
      activeTab,
      searchQuery,
      filterTags,
      articles,
      filteredArticles,
      viewMode,
      sortOption,
      selectedArticle,
      articleReaderMode,
      openArticleReader,
      closeArticleReader,
      toggleBookmark,
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

  // Artikel-Leseansicht nimmt den gesamten Bereich ein
  .article-reader-mode {
    width: 100%;
  }
}
</style>
