<!-- src/components/member/dashboard/Library.vue -->
<template>
  <div class="library-dashboard">
    <div class="page-header">
      <h2>Bibliothek</h2>
      <p>Entdecke alle verfügbaren Artikel zu verschiedenen Themen</p>
    </div>

    <!-- Filter- und Suchleiste -->
    <div class="filter-section">
      <div class="search-container">
        <input type="text" placeholder="Artikel durchsuchen..." v-model="searchQuery" @input="filterArticles" />
        <button class="search-button">
          <span class="search-icon">🔍</span>
        </button>
      </div>

      <div class="filter-options">
        <div class="filter-group">
          <label>Kategorie:</label>
          <select v-model="filterCategory" @change="filterArticles">
            <option value="">Alle Kategorien</option>
            <option v-for="category in uniqueCategories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Sortieren nach:</label>
          <select v-model="sortOption" @change="filterArticles">
            <option value="date-desc">Neuste zuerst</option>
            <option value="date-asc">Älteste zuerst</option>
            <option value="title-asc">Titel (A-Z)</option>
            <option value="title-desc">Titel (Z-A)</option>
            <option value="popular">Beliebteste</option>
          </select>
        </div>

        <div class="view-toggle">
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

      <div class="active-filters" v-if="selectedTags.length > 0">
        <span class="filter-label">Aktive Tags:</span>
        <div class="tag-list">
          <span v-for="(tag, index) in selectedTags" :key="index" class="tag-item" @click="removeTag(index)">
            {{ tag }} <span class="remove-tag">×</span>
          </span>
        </div>
        <button class="clear-tags" @click="clearTags">Alle löschen</button>
      </div>
    </div>

    <!-- Themen-Schnellauswahl -->
    <div class="topics-section">
      <h3>Beliebte Themen</h3>
      <div class="topic-tags">
        <button v-for="(topic, index) in popularTopics" :key="index" class="topic-tag"
          :class="{ active: selectedTags.includes(topic) }" @click="toggleTag(topic)">
          {{ topic }}
        </button>
      </div>
    </div>

    <!-- Artikel-Anzeige -->
    <div class="articles-section">
      <div v-if="filteredArticles.length > 0" :class="['articles-container', viewMode]">
        <!-- Grid-Ansicht -->
        <div v-if="viewMode === 'grid'" class="grid-view">
          <div v-for="article in filteredArticles" :key="article.id" class="article-card" @click="openArticle(article)">
            <div class="article-label">{{ article.category }}</div>
            <h3 class="article-title">{{ article.title }}</h3>
            <p class="article-preview">{{ article.preview }}</p>

            <div class="article-meta">
              <span class="article-author">{{ article.author }}</span>
              <span class="article-date">{{ article.date }}</span>
            </div>

            <div class="article-tags">
              <span v-for="(tag, idx) in article.tags" :key="idx" class="article-tag" @click.stop="addTag(tag)">
                {{ tag }}
              </span>
            </div>

            <div class="article-meta-bottom">
              <span class="read-time">{{ article.readTime || '10 min' }} Lesezeit</span>
              <span class="difficulty" :class="article.difficulty || 'medium'">
                {{ getDifficultyText(article.difficulty) }}
              </span>
            </div>

            <div class="article-actions">
              <button class="action-button read" @click.stop="openArticle(article)">
                Lesen
              </button>
              <button class="action-button bookmark" :class="{ active: article.bookmarked }"
                @click.stop="toggleBookmark(article)">
                {{ article.bookmarked ? '★' : '☆' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Listen-Ansicht -->
        <div v-else-if="viewMode === 'list'" class="list-view">
          <div v-for="article in filteredArticles" :key="article.id" class="article-list-item"
            @click="openArticle(article)">
            <div class="article-list-main">
              <div class="article-list-header">
                <div class="article-label">{{ article.category }}</div>
                <div class="article-meta">
                  <span class="article-author">{{ article.author }}</span>
                  <span class="article-date">{{ article.date }}</span>
                </div>
              </div>

              <h3 class="article-title">{{ article.title }}</h3>
              <p class="article-preview">{{ article.preview }}</p>

              <div class="article-list-footer">
                <div class="article-tags">
                  <span v-for="(tag, idx) in article.tags" :key="idx" class="article-tag" @click.stop="addTag(tag)">
                    {{ tag }}
                  </span>
                </div>

                <div class="article-meta-bottom">
                  <span class="read-time">{{ article.readTime || '10 min' }} Lesezeit</span>
                  <span class="difficulty" :class="article.difficulty || 'medium'">
                    {{ getDifficultyText(article.difficulty) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="article-list-actions">
              <button class="action-button read" @click.stop="openArticle(article)">
                Lesen
              </button>
              <button class="action-button bookmark" :class="{ active: article.bookmarked }"
                @click.stop="toggleBookmark(article)">
                {{ article.bookmarked ? '★' : '☆' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Leerer Zustand -->
      <div v-else class="empty-state">
        <div class="empty-icon">📚</div>
        <h3>Keine Artikel gefunden</h3>
        <p>Versuche andere Suchbegriffe oder Filter.</p>
        <button @click="resetFilters" class="reset-button">Filter zurücksetzen</button>
      </div>
    </div>

    <!-- Paginierung -->
    <div class="pagination" v-if="filteredArticles.length > 0">
      <button class="pagination-button prev" :disabled="currentPage === 1" @click="prevPage">
        « Zurück
      </button>

      <div class="page-numbers">
        <button v-for="page in totalPages" :key="page" class="page-number" :class="{ active: page === currentPage }"
          @click="goToPage(page)">
          {{ page }}
        </button>
      </div>

      <button class="pagination-button next" :disabled="currentPage === totalPages" @click="nextPage">
        Weiter »
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';

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

    // Text für Schwierigkeitsgrad
    const getDifficultyText = (difficulty?: string) => {
      switch (difficulty) {
        case 'easy':
          return 'Einfach';
        case 'medium':
          return 'Mittel';
        case 'hard':
          return 'Fortgeschritten';
        default:
          return 'Mittel';
      }
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
      goToPage,
      getDifficultyText
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

  // Filter-Sektion
  .filter-section {
    margin-bottom: map.get(vars.$spacing, xl);

    .search-container {
      position: relative;
      width: 100%;
      margin-bottom: map.get(vars.$spacing, m);

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

    .filter-options {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: map.get(vars.$spacing, m);
      margin-bottom: map.get(vars.$spacing, m);

      .filter-group {
        display: flex;
        align-items: center;
        gap: map.get(vars.$spacing, s);

        label {
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          font-weight: map.get(map.get(vars.$fonts, weights), medium);

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }

        select {
          padding: 8px 12px;
          border-radius: map.get(map.get(vars.$layout, border-radius), medium);
          font-size: map.get(map.get(vars.$fonts, sizes), small);

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
              color: mixins.theme-color($theme, text-primary);
              border: 1px solid mixins.theme-color($theme, border-light);

              &:focus {
                border-color: mixins.theme-color($theme, accent-teal);
                outline: none;
              }
            }
          }
        }
      }

      .view-toggle {
        display: flex;
        gap: 4px;

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

    .active-filters {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: map.get(vars.$spacing, s);

      .filter-label {
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        font-weight: map.get(map.get(vars.$fonts, weights), medium);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }

      .tag-list {
        display: flex;
        flex-wrap: wrap;
        gap: map.get(vars.$spacing, xs);

        .tag-item {
          padding: 4px 10px;
          border-radius: map.get(map.get(vars.$layout, border-radius), pill);
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, accent-teal);
              color: white;

              &:hover {
                background-color: mixins.theme-color($theme, accent-green);
              }
            }
          }

          .remove-tag {
            font-weight: map.get(map.get(vars.$fonts, weights), bold);
          }
        }
      }

      .clear-tags {
        background: none;
        border: none;
        cursor: pointer;
        font-size: map.get(map.get(vars.$fonts, sizes), small);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, accent-teal);

            &:hover {
              color: mixins.theme-color($theme, accent-green);
              text-decoration: underline;
            }
          }
        }
      }
    }
  }

  // Themen-Sektion
  .topics-section {
    margin-bottom: map.get(vars.$spacing, xl);

    h3 {
      font-size: map.get(map.get(vars.$fonts, sizes), large);
      margin-bottom: map.get(vars.$spacing, m);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    .topic-tags {
      display: flex;
      flex-wrap: wrap;
      gap: map.get(vars.$spacing, s);

      .topic-tag {
        padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, m);
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        cursor: pointer;
        border: none;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            color: mixins.theme-color($theme, text-primary);
            border: 1px solid mixins.theme-color($theme, border-light);

            &:hover {
              background-color: mixins.theme-color($theme, hover-color);
            }

            &.active {
              background-color: mixins.theme-color($theme, accent-green);
              color: white;
              border-color: transparent;
            }
          }
        }
      }
    }
  }

  // Artikel-Sektion
  .articles-section {
    margin-bottom: map.get(vars.$spacing, xl);

    .articles-container {
      &.grid {
        .grid-view {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: map.get(vars.$spacing, l);
        }
      }

      &.list {
        .list-view {
          display: flex;
          flex-direction: column;
          gap: map.get(vars.$spacing, m);
        }
      }

      // Gemeinsame Kartenstile für Grid-Ansicht
      .article-card {
        width: 500px;
        position: relative;
        padding: map.get(vars.$spacing, l);
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);
        cursor: pointer;
        transition: all 0.3s;

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
          }
        }

        .article-label {
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

        .article-title {
          margin-top: map.get(vars.$spacing, s);
          margin-bottom: map.get(vars.$spacing, s);
          font-size: map.get(map.get(vars.$fonts, sizes), large);
          font-weight: map.get(map.get(vars.$fonts, weights), bold);

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
              transition: all 0.4s ease-out;
            }
          }
        }

        .article-preview {
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
              transition: all 0.4s ease-out;
            }
          }
        }

        .article-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: map.get(vars.$spacing, s);
          font-size: map.get(map.get(vars.$fonts, sizes), small);

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-tertiary);
              transition: all 0.4s ease-out;
            }
          }
        }

        .article-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: map.get(vars.$spacing, m);

          .article-tag {
            padding: 2px 8px;
            border-radius: map.get(map.get(vars.$layout, border-radius), pill);
            font-size: 11px;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background-color: rgba(mixins.theme-color($theme, accent-teal), 0.1);
                color: mixins.theme-color($theme, accent-teal);
                border: 1px solid rgba(mixins.theme-color($theme, accent-teal), 0.2);
                transition: all 0.4s ease-out;

                &:hover {
                  background-color: mixins.theme-color($theme, accent-teal);
                  color: white;
                }
              }
            }
          }
        }

        .article-meta-bottom {
          display: flex;
          justify-content: space-between;
          margin-bottom: map.get(vars.$spacing, m);
          font-size: map.get(map.get(vars.$fonts, sizes), small);

          .read-time {
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-tertiary);
                transition: all 0.4s ease-out;
              }
            }
          }

          .difficulty {
            padding: 2px 8px;
            border-radius: map.get(map.get(vars.$layout, border-radius), pill);

            &.easy {
              background-color: rgba(74, 210, 149, 0.1);
              color: #4AD295;
            }

            &.medium {
              background-color: rgba(53, 204, 208, 0.1);
              color: #35CCD0;
            }

            &.hard {
              background-color: rgba(155, 225, 93, 0.1);
              color: #9BE15D;
            }
          }
        }

        .article-actions {
          display: flex;
          gap: map.get(vars.$spacing, s);

          .action-button {
            padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, m);
            border-radius: map.get(map.get(vars.$layout, border-radius), pill);
            font-size: map.get(map.get(vars.$fonts, sizes), small);
            font-weight: map.get(map.get(vars.$fonts, weights), medium);
            cursor: pointer;
            border: none;

            &.read {
              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background: mixins.theme-gradient($theme, primary);
                  color: white;

                  transition: all 0.4s ease-out;

                  &:hover {
                    transform: translateY(-2px);
                    @include mixins.shadow('small', $theme);
                  }
                }
              }
            }

            &.bookmark {
              width: 100px;
              height: 32px;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background-color: transparent;
                  color: mixins.theme-color($theme, text-secondary);
                  border: 1px solid mixins.theme-color($theme, border-medium);
                  transition: all 0.4s ease-out;

                  &:hover {
                    background-color: mixins.theme-color($theme, hover-color);
                  }

                  &.active {
                    background-color: rgba(249, 202, 36, 0.1);
                    color: #F9CA24;
                    border-color: #F9CA24;
                  }
                }
              }
            }
          }
        }
      }

      // Liste-Stile
      .article-list-item {
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
          }
        }

        .article-list-main {
          flex: 1;
          padding-right: map.get(vars.$spacing, l);

          .article-list-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: map.get(vars.$spacing, s);

            .article-label {
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

            .article-meta {
              display: flex;
              gap: map.get(vars.$spacing, m);
              font-size: map.get(map.get(vars.$fonts, sizes), small);

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, text-tertiary);
                  transition: all 0.4s ease-out;
                }
              }
            }
          }

          .article-title {
            margin-bottom: map.get(vars.$spacing, s);
            font-size: map.get(map.get(vars.$fonts, sizes), large);
            font-weight: map.get(map.get(vars.$fonts, weights), bold);

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-primary);
                transition: all 0.4s ease-out;
              }
            }
          }

          .article-preview {
            margin-bottom: map.get(vars.$spacing, m);
            font-size: map.get(map.get(vars.$fonts, sizes), medium);
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-secondary);
                transition: all 0.4s ease-out;
              }
            }
          }

          .article-list-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .article-tags {
              display: flex;
              flex-wrap: wrap;
              gap: 6px;

              .article-tag {
                padding: 2px 8px;
                border-radius: map.get(map.get(vars.$layout, border-radius), pill);
                font-size: 11px;

                @each $theme in ('light', 'dark') {
                  .theme-#{$theme} & {
                    background-color: rgba(mixins.theme-color($theme, accent-teal), 0.1);
                    color: mixins.theme-color($theme, accent-teal);
                    border: 1px solid rgba(mixins.theme-color($theme, accent-teal), 0.2);
                    transition: all 0.4s ease-out;

                    &:hover {
                      background-color: mixins.theme-color($theme, accent-teal);
                      color: white;
                    }
                  }
                }
              }
            }

            .article-meta-bottom {
              display: flex;
              gap: map.get(vars.$spacing, m);
              font-size: map.get(map.get(vars.$fonts, sizes), small);

              .read-time {
                @each $theme in ('light', 'dark') {
                  .theme-#{$theme} & {
                    color: mixins.theme-color($theme, text-tertiary);
                    transition: all 0.4s ease-out;
                  }
                }
              }

              .difficulty {
                padding: 2px 8px;
                border-radius: map.get(map.get(vars.$layout, border-radius), pill);

                &.easy {
                  background-color: rgba(74, 210, 149, 0.1);
                  color: #4AD295;
                }

                &.medium {
                  background-color: rgba(53, 204, 208, 0.1);
                  color: #35CCD0;
                }

                &.hard {
                  background-color: rgba(155, 225, 93, 0.1);
                  color: #9BE15D;
                }
              }
            }
          }
        }

        .article-list-actions {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: map.get(vars.$spacing, s);

          .action-button {
            padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, m);
            border-radius: map.get(map.get(vars.$layout, border-radius), pill);
            font-size: map.get(map.get(vars.$fonts, sizes), small);
            font-weight: map.get(map.get(vars.$fonts, weights), medium);
            cursor: pointer;
            border: none;

            &.read {
              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background: mixins.theme-gradient($theme, primary);
                  color: white;
                  transition: all 0.4s ease-out;

                  &:hover {
                    transform: translateY(-2px);
                    @include mixins.shadow('small', $theme);
                  }
                }
              }
            }

            &.bookmark {
              width: 90px;
              height: 32px;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background-color: transparent;
                  color: mixins.theme-color($theme, text-secondary);
                  border: 1px solid mixins.theme-color($theme, border-medium);
                  transition: all 0.4s ease-out;

                  &:hover {
                    background-color: mixins.theme-color($theme, hover-color);
                  }

                  &.active {
                    background-color: rgba(249, 202, 36, 0.1);
                    color: #F9CA24;
                    border-color: #F9CA24;
                  }
                }
              }
            }
          }
        }

        // Responsive-Anpassungen für die Listenansicht auf mobilen Geräten
        @media (max-width: 768px) {
          flex-direction: column;

          .article-list-main {
            padding-right: 0;
            margin-bottom: map.get(vars.$spacing, m);
          }

          .article-list-actions {
            flex-direction: row;
            justify-content: flex-start;
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
            transition: all 0.4s ease-out;
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
            transition: all 0.4s ease-out;
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
  }

  // Paginierung
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: map.get(vars.$spacing, m);
    margin-bottom: map.get(vars.$spacing, xl);

    .pagination-button {
      padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      cursor: pointer;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          color: mixins.theme-color($theme, text-primary);
          border: 1px solid mixins.theme-color($theme, border-light);
          transition: all 0.4s ease-out;

          &:hover:not(:disabled) {
            background-color: mixins.theme-color($theme, hover-color);
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
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: map.get(map.get(vars.$layout, border-radius), small);
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        cursor: pointer;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            color: mixins.theme-color($theme, text-primary);
            border: 1px solid mixins.theme-color($theme, border-light);
            transition: all 0.4s ease-out;

            &:hover {
              background-color: mixins.theme-color($theme, hover-color);
            }

            &.active {
              background-color: mixins.theme-color($theme, accent-green);
              color: white;
              border-color: transparent;
            }
          }
        }
      }
    }
  }
}
</style>