<!-- src/components/member/dashboard/Library.vue -->
<template>
  <div class="library-dashboard">
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
      @filter-articles="filterArticles"
      @remove-tag="removeTag"
      @clear-tags="clearTags"
    />

    <!-- Themen-Schnellauswahl -->
    <topics-section
      :popular-topics="popularTopics"
      :selected-tags="selectedTags"
      @toggle-tag="toggleTag"
    />

    <!-- Artikel-Anzeige -->
    <div class="articles-section">
      <div v-if="filteredArticles.length > 0" :class="['articles-container', viewMode]">
        <!-- Grid-Ansicht -->
        <articles-grid
          v-if="viewMode === 'grid'"
          :articles="filteredArticles"
          @open-article="openArticle"
          @toggle-bookmark="toggleBookmark"
          @add-tag="addTag"
        />

        <!-- Listen-Ansicht -->
        <articles-list
          v-else-if="viewMode === 'list'"
          :articles="filteredArticles"
          @open-article="openArticle"
          @toggle-bookmark="toggleBookmark"
          @add-tag="addTag"
        />
      </div>

      <!-- Leerer Zustand -->
      <empty-state
        v-else
        @reset-filters="resetFilters"
      />
    </div>

    <!-- Paginierung -->
    <pagination
      v-if="filteredArticles.length > 0"
      :current-page="currentPage"
      :total-pages="totalPages"
      @prev-page="prevPage"
      @next-page="nextPage"
      @go-to-page="goToPage"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import {
  SearchFilter,
  TopicsSection,
  ArticlesGrid,
  ArticlesList,
  Pagination,
  EmptyState
} from '@/components/pages/DashboardPages/Library';

interface Article {
  id: number;
  title: string;
  preview: string;
  content?: string;
  category: string;
  author: string;
  date: string;
  tags: string[];
  readTime?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  bookmarked?: boolean;
  featured?: boolean;
  popularity?: number;
}

export default defineComponent({
  name: 'LibraryDashboard',
  components: {
    SearchFilter,
    TopicsSection,
    ArticlesGrid,
    ArticlesList,
    Pagination,
    EmptyState
  },
  setup() {
    // Status
    const searchQuery = ref('');
    const filterCategory = ref('');
    const sortOption = ref('date-desc');
    const viewMode = ref('grid');
    const selectedTags = ref<string[]>([]);
    const currentPage = ref(1);
    const itemsPerPage = ref(9);

    // Beispieldaten für Artikel (später durch API-Daten ersetzen)
    const articles = ref<Article[]>([
      {
        id: 1,
        title: 'Erziehungsstile im Vergleich: Welcher passt zu Ihrer Familie?',
        preview: 'Eine umfassende Analyse verschiedener Erziehungsansätze und wie sie sich auf die Entwicklung Ihres Kindes auswirken können.',
        category: 'Erziehung',
        author: 'Dr. Anna Schmidt',
        date: '05.05.2025',
        tags: ['Erziehung', 'Familienleben', 'Entwicklung'],
        readTime: '12 min',
        difficulty: 'medium',
        popularity: 120
      },
      {
        id: 2,
        title: 'Gesunde Ernährung für Kleinkinder: Ein praktischer Leitfaden',
        preview: 'Praktische Tipps für eine ausgewogene Ernährung von Kleinkindern und wie man auch wählerische Esser überzeugen kann.',
        category: 'Ernährung',
        author: 'Maria Weber',
        date: '01.05.2025',
        tags: ['Ernährung', 'Kleinkind', 'Gesundheit'],
        readTime: '15 min',
        difficulty: 'easy',
        bookmarked: true,
        popularity: 95
      },
      {
        id: 3,
        title: 'Digitale Medien im Kindesalter: Fluch oder Segen?',
        preview: 'Eine ausgewogene Betrachtung der Vor- und Nachteile digitaler Medien für Kinder und Empfehlungen für einen gesunden Umgang.',
        category: 'Medien',
        author: 'Prof. Thomas Becker',
        date: '28.04.2025',
        tags: ['Medien', 'Bildschirmzeit', 'Entwicklung'],
        readTime: '10 min',
        difficulty: 'medium',
        bookmarked: true,
        popularity: 150,
        featured: true
      },
      {
        id: 4,
        title: 'Grenzen setzen ohne Konflikte: Effektive Kommunikation mit Kindern',
        preview: 'Wie Sie mit effektiven Kommunikationstechniken klare Regeln etablieren können, ohne dass es zu unnötigen Konflikten kommt.',
        category: 'Kommunikation',
        author: 'Dr. Lisa Müller',
        date: '25.04.2025',
        tags: ['Kommunikation', 'Grenzen', 'Erziehung'],
        readTime: '8 min',
        difficulty: 'medium',
        popularity: 110
      },
      {
        id: 5,
        title: 'Die Phasen der kindlichen Entwicklung verstehen',
        preview: 'Erfahren Sie, wie Sie Ihr Kind in jeder Entwicklungsphase optimal unterstützen können.',
        category: 'Entwicklung',
        author: 'Dr. Maria Schmidt',
        date: '20.04.2025',
        tags: ['Entwicklung', 'Psychologie', 'Meilensteine'],
        readTime: '20 min',
        difficulty: 'hard',
        popularity: 85
      },
      {
        id: 6,
        title: 'Wie Musik die kognitive Entwicklung fördert',
        preview: 'Neue Studien zeigen den positiven Einfluss von Musikunterricht auf die Gehirnentwicklung von Kindern.',
        category: 'Bildung',
        author: 'Julia Wagner',
        date: '18.04.2025',
        tags: ['Bildung', 'Musik', 'Kognition'],
        readTime: '7 min',
        difficulty: 'easy',
        popularity: 70
      },
      {
        id: 7,
        title: 'Sport im Kindesalter: Welche Sportart für welches Alter?',
        preview: 'Ein Überblick über altersgerechte Sportarten und wie sie die körperliche und soziale Entwicklung unterstützen.',
        category: 'Gesundheit',
        author: 'Michael Berger',
        date: '15.04.2025',
        tags: ['Sport', 'Gesundheit', 'Entwicklung'],
        readTime: '9 min',
        difficulty: 'medium',
        popularity: 95
      },
      {
        id: 8,
        title: 'Schlafprobleme bei Kleinkindern und wie man sie löst',
        preview: 'Praktische Ansätze für besseren Schlaf bei Kleinkindern und wie man einen gesunden Schlafrhythmus etabliert.',
        category: 'Gesundheit',
        author: 'Dr. Stefan Wilke',
        date: '10.04.2025',
        tags: ['Schlaf', 'Kleinkind', 'Gesundheit'],
        readTime: '14 min',
        difficulty: 'medium',
        popularity: 130,
        featured: true
      },
      {
        id: 9,
        title: 'Kreative Spielideen für drinnen: So wird es nie langweilig',
        preview: 'Sammlung von kreativen Spielideen, die mit einfachen Mitteln umgesetzt werden können und die Fantasie fördern.',
        category: 'Spiel & Spaß',
        author: 'Laura Neumann',
        date: '05.04.2025',
        tags: ['Spiel', 'Kreativität', 'Indoor'],
        readTime: '6 min',
        difficulty: 'easy',
        popularity: 115
      },
      {
        id: 10,
        title: 'Die Bedeutung von Routinen im Familienalltag',
        preview: 'Warum Routinen so wichtig für Kinder sind und wie man sinnvolle Routinen für den Familienalltag entwickelt.',
        category: 'Familienleben',
        author: 'Christine Meyer',
        date: '01.04.2025',
        tags: ['Routinen', 'Familienleben', 'Organisation'],
        readTime: '8 min',
        difficulty: 'easy',
        popularity: 90
      },
      {
        id: 11,
        title: 'Umgang mit Wutanfällen: Strategien für Eltern',
        preview: 'Wie Eltern kindliche Wutanfälle verstehen und angemessen darauf reagieren können.',
        category: 'Erziehung',
        author: 'Dr. Markus Klein',
        date: '28.03.2025',
        tags: ['Emotionen', 'Erziehung', 'Wutanfälle'],
        readTime: '11 min',
        difficulty: 'medium',
        popularity: 140
      },
      {
        id: 12,
        title: 'Die Rolle der Väter in der modernen Erziehung',
        preview: 'Ein Blick auf die sich wandelnde Rolle der Väter und wie sie die Entwicklung ihrer Kinder positiv beeinflussen können.',
        category: 'Familienleben',
        author: 'Prof. Robert Schwarz',
        date: '25.03.2025',
        tags: ['Väter', 'Erziehung', 'Familienleben'],
        readTime: '13 min',
        difficulty: 'medium',
        popularity: 85
      },
      {
        id: 13,
        title: 'Naturverbundene Aktivitäten für die ganze Familie',
        preview: 'Ideen für Ausflüge und Aktivitäten in der Natur, die Kindern helfen, eine Verbindung zur natürlichen Umwelt aufzubauen.',
        category: 'Spiel & Spaß',
        author: 'Sarah Fischer',
        date: '20.03.2025',
        tags: ['Natur', 'Aktivitäten', 'Ausflüge'],
        readTime: '9 min',
        difficulty: 'easy',
        popularity: 75
      },
      {
        id: 14,
        title: 'Geschwisterrivalität: Ursachen und Lösungsansätze',
        preview: 'Warum Geschwister rivalisieren und wie Eltern ein harmonischeres Miteinander fördern können.',
        category: 'Familienleben',
        author: 'Dr. Claudia Berg',
        date: '15.03.2025',
        tags: ['Geschwister', 'Konflikte', 'Familienleben'],
        readTime: '12 min',
        difficulty: 'medium',
        popularity: 110
      },
      {
        id: 15,
        title: 'Die besten Kinderbücher für jedes Alter',
        preview: 'Eine kuratierte Auswahl an empfehlenswerten Kinderbüchern, sortiert nach Altersgruppen und Interessen.',
        category: 'Bildung',
        author: 'Elke Hoffmann',
        date: '10.03.2025',
        tags: ['Bücher', 'Lesen', 'Bildung'],
        readTime: '15 min',
        difficulty: 'easy',
        popularity: 95,
        featured: true
      }
    ]);

    // Beliebte Themen
    const popularTopics = [
      'Erziehung', 'Gesundheit', 'Bildung', 'Entwicklung', 'Familienleben',
      'Kleinkind', 'Kommunikation', 'Spiel', 'Grenzen', 'Medien'
    ];

    // Einzigartige Kategorien aus den Artikeln extrahieren
    const uniqueCategories = computed(() => {
      const categories = new Set<string>();
      articles.value.forEach(article => {
        categories.add(article.category);
      });
      return Array.from(categories).sort();
    });

    // Artikel basierend auf Filtern und Suchbegriff filtern
    const filteredArticles = computed(() => {
      let result = [...articles.value];

      // Nach Suchbegriff filtern
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(article =>
          article.title.toLowerCase().includes(query) ||
          article.preview.toLowerCase().includes(query) ||
          article.category.toLowerCase().includes(query) ||
          article.author.toLowerCase().includes(query) ||
          article.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      // Nach Kategorie filtern
      if (filterCategory.value) {
        result = result.filter(article => article.category === filterCategory.value);
      }

      // Nach Tags filtern
      if (selectedTags.value.length > 0) {
        result = result.filter(article =>
          selectedTags.value.some(tag =>
            article.tags.includes(tag)
          )
        );
      }

      // Sortieren
      result = sortArticles(result);

      // Paginierung
      const startIndex = (currentPage.value - 1) * itemsPerPage.value;
      const paginatedResult = result.slice(startIndex, startIndex + itemsPerPage.value);

      return paginatedResult;
    });

    // Artikel sortieren
    const sortArticles = (articlesToSort: Article[]) => {
      const sorted = [...articlesToSort];

      switch (sortOption.value) {
        case 'date-desc':
          return sorted.sort((a, b) => {
            return new Date(b.date.split('.').reverse().join('-')).getTime() -
              new Date(a.date.split('.').reverse().join('-')).getTime();
          });
        case 'date-asc':
          return sorted.sort((a, b) => {
            return new Date(a.date.split('.').reverse().join('-')).getTime() -
              new Date(b.date.split('.').reverse().join('-')).getTime();
          });
        case 'title-asc':
          return sorted.sort((a, b) => a.title.localeCompare(b.title));
        case 'title-desc':
          return sorted.sort((a, b) => b.title.localeCompare(a.title));
        case 'popular':
          return sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        default:
          return sorted;
      }
    };

    // Für Paginierung - Gesamtzahl der Artikel nach Filter
    const totalFilteredArticles = computed(() => {
      let result = [...articles.value];

      // Nach Suchbegriff filtern
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(article =>
          article.title.toLowerCase().includes(query) ||
          article.preview.toLowerCase().includes(query) ||
          article.category.toLowerCase().includes(query) ||
          article.author.toLowerCase().includes(query) ||
          article.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      // Nach Kategorie filtern
      if (filterCategory.value) {
        result = result.filter(article => article.category === filterCategory.value);
      }

      // Nach Tags filtern
      if (selectedTags.value.length > 0) {
        result = result.filter(article =>
          selectedTags.value.some(tag =>
            article.tags.includes(tag)
          )
        );
      }

      return result.length;
    });

    // Gesamtanzahl der Seiten
    const totalPages = computed(() => {
      return Math.ceil(totalFilteredArticles.value / itemsPerPage.value);
    });

    // Zur vorherigen Seite
    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    // Zur nächsten Seite
    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    // Zu einer spezifischen Seite springen
    const goToPage = (page: number) => {
      currentPage.value = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Artikel filtern
    const filterArticles = () => {
      // Seite zurücksetzen
      currentPage.value = 1;
    };

    // Tag hinzufügen
    const addTag = (tag: string) => {
      if (!selectedTags.value.includes(tag)) {
        selectedTags.value.push(tag);
        filterArticles();
      }
    };

    // Tag umschalten (hinzufügen oder entfernen)
    const toggleTag = (tag: string) => {
      const index = selectedTags.value.indexOf(tag);
      if (index === -1) {
        selectedTags.value.push(tag);
      } else {
        selectedTags.value.splice(index, 1);
      }
      filterArticles();
    };

    // Tag entfernen
    const removeTag = (index: number) => {
      selectedTags.value.splice(index, 1);
      filterArticles();
    };

    // Alle Tags löschen
    const clearTags = () => {
      selectedTags.value = [];
      filterArticles();
    };

    // Alle Filter zurücksetzen
    const resetFilters = () => {
      searchQuery.value = '';
      filterCategory.value = '';
      selectedTags.value = [];
      currentPage.value = 1;
      sortOption.value = 'date-desc';
    };

    // Artikel öffnen (Platzhalter)
    const openArticle = (article: Article) => {
      console.log('Artikel öffnen:', article.title);
      // Hier später mit Router-Navigation ersetzen oder Modal öffnen
      alert(`Artikel "${article.title}" wird geöffnet...`);
    };

    // Lesezeichen umschalten
    const toggleBookmark = (article: Article) => {
      article.bookmarked = !article.bookmarked;
    };

    return {
      searchQuery,
      filterCategory,
      sortOption,
      viewMode,
      selectedTags,
      articles,
      popularTopics,
      uniqueCategories,
      filteredArticles,
      currentPage,
      totalPages,
      filterArticles,
      addTag,
      toggleTag,
      removeTag,
      clearTags,
      resetFilters,
      openArticle,
      toggleBookmark,
      prevPage,
      nextPage,
      goToPage
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

.library-dashboard {
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

  // Artikel-Sektion
  .articles-section {
    margin-bottom: map.get(vars.$spacing, xl);

    .articles-container {
      &.grid, &.list {
        // Gemeinsame Stile für beide Ansichten können hier definiert werden
      }
    }
  }
}
</style>