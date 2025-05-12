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
      <div class="search-section">
        <div class="search-container">
          <input type="text" placeholder="Artikel suchen..." v-model="searchQuery" @input="filterArticles" />
          <button class="search-button">
            <span class="search-icon">🔍</span>
          </button>
        </div>
        <div class="active-filters" v-if="filterTags.length > 0">
          <span class="filter-label">Aktive Filter:</span>
          <div class="filter-tags">
            <span v-for="(tag, index) in filterTags" :key="index" class="filter-tag" @click="removeFilterTag(index)">
              {{ tag }} <span class="remove-tag">×</span>
            </span>
          </div>
          <button class="clear-filters" @click="clearFilters">Alle löschen</button>
        </div>
      </div>

      <!-- Tabs für verschiedene Artikelgruppen -->
      <div class="articles-tabs">
        <button v-for="(tab, index) in tabs" :key="index" class="tab-button" :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id">
          {{ tab.name }}
          <span class="count">{{ getArticleCount(tab.id) }}</span>
        </button>
      </div>

      <!-- Artikelliste -->
      <div class="article-list">
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
            <button class="view-button" :class="{ active: viewMode === 'grid' }" @click="switchViewMode('grid')"
              title="Rasteransicht">
              ■ ■
            </button>
            <button class="view-button" :class="{ active: viewMode === 'list' }" @click="switchViewMode('list')"
              title="Listenansicht">
              ≡
            </button>
          </div>
        </div>

        <!-- Anzeigebereich für Artikel -->
        <div :class="['articles-container', viewMode]">
          <!-- Grid-Ansicht -->
          <div v-if="viewMode === 'grid'" class="grid-view">
            <div v-for="article in filteredArticles" :key="article.id" class="article-card"
              @click="openArticleReader(article)">
              <div class="card-label">{{ article.category }}</div>
              <h3 class="card-title">{{ article.title }}</h3>
              <p class="card-preview">{{ article.preview }}</p>

              <!-- Fortschrittsbalken anzeigen, falls vorhanden -->
              <div v-if="article.currentChapter && article.totalChapters" class="chapter-progress">
                <div class="progress-bar">
                  <div class="progress-fill"
                    :style="{ width: (article.currentChapter / article.totalChapters * 100) + '%' }"></div>
                </div>
                <div class="progress-text">
                  <span class="chapter-info">{{ article.currentChapter }}/{{ article.totalChapters }} Kapitel</span>
                  <span class="last-read">{{ article.lastRead }}</span>
                </div>
              </div>

              <div class="card-meta">
                <span class="card-date">{{ article.date }}</span>
                <div class="card-tags">
                  <span v-for="(tag, idx) in article.tags" :key="idx" class="card-tag" @click.stop="addFilterTag(tag)">
                    {{ tag }}
                  </span>
                </div>
              </div>

              <!-- Aktionsbuttons für jeden Artikel -->
              <div class="card-actions">
                <button class="action-button read" @click.stop="openArticleReader(article)">
                  <span v-if="article.currentChapter">Weiterlesen</span>
                  <span v-else>Jetzt lesen</span>
                </button>
                <button class="action-button bookmark" :class="{ active: article.status === 'bookmarked' }"
                  @click.stop="toggleBookmark(article)">
                  {{ article.status === 'bookmarked' ? '★' : '☆' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Listen-Ansicht -->
          <div v-else-if="viewMode === 'list'" class="list-view">
            <div v-for="article in filteredArticles" :key="article.id" class="article-list-item"
              @click="openArticleReader(article)">
              <div class="list-item-main">
                <div class="list-item-header">
                  <div class="card-label">{{ article.category }}</div>
                  <span class="card-date">{{ article.date }}</span>
                </div>
                <h3 class="card-title">{{ article.title }}</h3>
                <p class="card-preview">{{ article.preview }}</p>

                <!-- Fortschrittsbalken anzeigen, falls vorhanden -->
                <div v-if="article.currentChapter && article.totalChapters" class="chapter-progress">
                  <div class="progress-bar">
                    <div class="progress-fill"
                      :style="{ width: (article.currentChapter / article.totalChapters * 100) + '%' }"></div>
                  </div>
                  <div class="progress-text">
                    <span class="chapter-info">{{ article.currentChapter }}/{{ article.totalChapters }} Kapitel</span>
                    <span class="last-read">{{ article.lastRead }}</span>
                  </div>
                </div>

                <div class="card-tags">
                  <span v-for="(tag, idx) in article.tags" :key="idx" class="card-tag" @click.stop="addFilterTag(tag)">
                    {{ tag }}
                  </span>
                </div>
              </div>

              <div class="list-item-actions">
                <button class="action-button read" @click.stop="openArticleReader(article)">
                  <span v-if="article.currentChapter">Weiterlesen</span>
                  <span v-else>Jetzt lesen</span>
                </button>
                <button class="action-button bookmark" :class="{ active: article.status === 'bookmarked' }"
                  @click.stop="toggleBookmark(article)">
                  {{ article.status === 'bookmarked' ? '★' : '☆' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Anzeige eines leeren Zustands -->
      <div v-if="filteredArticles.length === 0" class="empty-state">
        <div class="empty-icon">📄</div>
        <h3>Keine Artikel gefunden</h3>
        <p>Versuche andere Suchbegriffe oder Filter.</p>
        <button @click="clearFilters" class="reset-button">Filter zurücksetzen</button>
      </div>
    </div>

    <!-- Artikel-Leseansicht -->
    <div v-else class="article-reader-mode">
      <article-reader :article="selectedArticle" @close="closeArticleReader" @toggle-bookmark="toggleBookmark" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import ArticleReader from '@/components/member/article/ArticleReader.vue'; // Neue Komponente für die Artikelansicht

interface Article {
  id: number;
  title: string;
  content: string;
  preview: string;
  featured: boolean;
  date?: string;
  category?: string;
  author?: string;
  tags?: string[];
  currentChapter?: number;
  totalChapters?: number;
  lastRead?: string;
  status?: string;
  quiz?: {
    enabled: boolean;
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
    }>;
  };
}

export default defineComponent({
  name: 'MyArticlesDashboard',
  components: {
    ArticleReader
  },
  setup() {
    // Tabs für verschiedene Artikelgruppen
    const tabs = ref([
      { id: 'all', name: 'Alle Artikel' },
      { id: 'reading', name: 'Leseliste' },
      { id: 'completed', name: 'Abgeschlossene' },
      { id: 'bookmarked', name: 'Favoriten' }
    ]);

    const activeTab = ref('all');
    const searchQuery = ref('');
    const filterTags = ref<string[]>([]);
    const viewMode = ref('grid');
    const sortOption = ref('date-desc');
    const selectedArticle = ref<Article | null>(null);

    // Flag für Artikel-Leseansicht
    const articleReaderMode = ref(false);

    // Artikeldaten (später durch API ersetzen)
    const articles = ref<Article[]>([
      {
        id: 1,
        title: 'Erziehungsstile im Vergleich: Welcher passt zu Ihrer Familie?',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quis lorem ut libero malesuada feugiat. Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Cras ultricies ligula sed magna dictum porta. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Sed porttitor lectus nibh. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Nulla quis lorem ut libero malesuada feugiat.',
        preview: 'Eine umfassende Analyse verschiedener Erziehungsansätze und wie sie sich auf die Entwicklung Ihres Kindes auswirken können.',
        featured: true,
        date: '05.05.2025',
        category: 'Erziehung',
        author: 'Dr. Anna Schmidt',
        tags: ['Erziehung', 'Familienleben', 'Entwicklung'],
        currentChapter: 4,
        totalChapters: 6,
        lastRead: 'Gestern',
        status: 'reading',
        quiz: {
          enabled: true,
          questions: [
            {
              question: 'Welcher Erziehungsstil wird im Artikel als am effektivsten für die Entwicklung von Selbstständigkeit beschrieben?',
              options: ['Autoritärer Stil', 'Permissiver Stil', 'Autoritativer Stil', 'Vernachlässigender Stil'],
              correctAnswer: 2
            },
            {
              question: 'Was ist laut Artikel ein Hauptmerkmal des autoritativen Erziehungsstils?',
              options: ['Strenge Kontrolle ohne Erklärungen', 'Hohe Wärme bei gleichzeitigen klaren Grenzen', 'Wenige Regeln und Konsequenzen', 'Distanz zur emotionalen Entwicklung des Kindes'],
              correctAnswer: 1
            }
          ]
        }
      },
      {
        id: 2,
        title: 'Gesunde Ernährung für Kleinkinder: Ein praktischer Leitfaden',
        content: 'Die frühen Jahre sind entscheidend für die Entwicklung gesunder Essgewohnheiten. Dieser Artikel bietet praktische Tipps für eine ausgewogene Ernährung von Kleinkindern, geeignete Portionsgrößen und kreative Ideen, um auch wählerische Esser zu überzeugen.',
        preview: 'Praktische Tipps für eine ausgewogene Ernährung von Kleinkindern und wie man auch wählerische Esser überzeugen kann.',
        featured: true,
        date: '01.05.2025',
        category: 'Ernährung',
        author: 'Maria Weber',
        tags: ['Ernährung', 'Kleinkind', 'Gesundheit'],
        currentChapter: 1,
        totalChapters: 8,
        lastRead: 'Vor 3 Tagen',
        status: 'reading',
        quiz: {
          enabled: true,
          questions: [
            {
              question: 'Wie viele Portionen Obst und Gemüse sollten Kleinkinder laut dem Artikel täglich zu sich nehmen?',
              options: ['1-2 Portionen', '3-5 Portionen', '6-8 Portionen', 'Es kommt ausschließlich auf die Qualität an'],
              correctAnswer: 1
            }
          ]
        }
      },
      {
        id: 3,
        title: 'Digitale Medien im Kindesalter: Fluch oder Segen?',
        content: 'Die Digitalisierung ist aus unserem Alltag nicht mehr wegzudenken. Dieser Artikel beleuchtet die Vor- und Nachteile digitaler Medien für Kinder verschiedener Altersgruppen und gibt Empfehlungen für einen gesunden Umgang mit Bildschirmzeit.',
        preview: 'Eine ausgewogene Betrachtung der Vor- und Nachteile digitaler Medien für Kinder und Empfehlungen für einen gesunden Umgang.',
        featured: true,
        date: '28.04.2025',
        category: 'Medien',
        author: 'Prof. Thomas Becker',
        tags: ['Medien', 'Bildschirmzeit', 'Entwicklung'],
        status: 'bookmarked',
        quiz: {
          enabled: true,
          questions: [
            {
              question: 'Welche Bildschirmzeit empfiehlt der Artikel maximal für Kinder zwischen 2 und 5 Jahren?',
              options: ['Keine Bildschirmzeit', '30 Minuten pro Tag', '1 Stunde pro Tag', '2 Stunden pro Tag'],
              correctAnswer: 2
            }
          ]
        }
      },
      {
        id: 4,
        title: 'Grenzen setzen ohne Konflikte: Effektive Kommunikation mit Kindern',
        content: 'Klare Grenzen zu setzen ist wichtig für die Entwicklung von Kindern. In diesem Artikel erfahren Sie, wie Sie mit effektiven Kommunikationstechniken Regeln etablieren können, ohne dass es zu unnötigen Konflikten kommt.',
        preview: 'Wie Sie mit effektiven Kommunikationstechniken klare Regeln etablieren können, ohne dass es zu unnötigen Konflikten kommt.',
        featured: false,
        date: '25.04.2025',
        category: 'Kommunikation',
        author: 'Dr. Lisa Müller',
        tags: ['Kommunikation', 'Grenzen', 'Erziehung'],
        currentChapter: 6,
        totalChapters: 6,
        lastRead: 'Vor einer Woche',
        status: 'completed',
        quiz: {
          enabled: true,
          questions: [
            {
              question: 'Welche Kommunikationstechnik wird im Artikel als besonders effektiv für das Setzen von Grenzen bei Kleinkindern beschrieben?',
              options: ['Ich-Botschaften', 'Konsequentes Ignorieren', 'Zeitstrafen', 'Belohnungssysteme'],
              correctAnswer: 0
            }
          ]
        }
      },
      {
        id: 5,
        title: 'Die Phasen der kindlichen Entwicklung verstehen',
        content: 'Von der Geburt bis zur Adoleszenz durchlaufen Kinder verschiedene Entwicklungsphasen. Dieser Artikel erklärt die wichtigsten Meilensteine und wie Eltern ihr Kind in jeder Phase optimal unterstützen können.',
        preview: 'Erfahren Sie, wie Sie Ihr Kind in jeder Entwicklungsphase optimal unterstützen können.',
        featured: false,
        date: '20.04.2025',
        category: 'Entwicklung',
        author: 'Dr. Maria Schmidt',
        tags: ['Entwicklung', 'Psychologie', 'Meilensteine'],
        currentChapter: 8,
        totalChapters: 8,
        lastRead: 'Vor zwei Wochen',
        status: 'completed',
        quiz: {
          enabled: true,
          questions: [
            {
              question: 'In welchem Alter beginnt laut dem Artikel typischerweise die Phase des "magischen Denkens"?',
              options: ['6-12 Monate', '1-2 Jahre', '3-6 Jahre', '7-11 Jahre'],
              correctAnswer: 2
            }
          ]
        }
      }
    ]);

    // Gefilterte Artikel basierend auf Tab, Suche und Tags
    const filteredArticles = computed(() => {
      let result = [...articles.value];

      // Nach Tab filtern
      if (activeTab.value !== 'all') {
        result = result.filter(article => article.status === activeTab.value);
      }

      // Nach Suchbegriff filtern
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(article =>
          article.title.toLowerCase().includes(query) ||
          article.content.toLowerCase().includes(query) ||
          article.preview.toLowerCase().includes(query) ||
          (article.tags && article.tags.some(tag => tag.toLowerCase().includes(query)))
        );
      }

      // Nach Tags filtern
      if (filterTags.value.length > 0) {
        result = result.filter(article =>
          article.tags && filterTags.value.some(tag =>
            article.tags!.some(articleTag => articleTag.toLowerCase() === tag.toLowerCase())
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
        case 'date-desc':
          return sorted.sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(b.date.split('.').reverse().join('-')).getTime() -
              new Date(a.date.split('.').reverse().join('-')).getTime();
          });
        case 'date-asc':
          return sorted.sort((a, b) => {
            if (!a.date) return -1;
            if (!b.date) return 1;
            return new Date(a.date.split('.').reverse().join('-')).getTime() -
              new Date(b.date.split('.').reverse().join('-')).getTime();
          });
        case 'title-asc':
          return sorted.sort((a, b) => a.title.localeCompare(b.title));
        case 'title-desc':
          return sorted.sort((a, b) => b.title.localeCompare(a.title));
        default:
          return sorted;
      }
    };

    // Anzahl der Artikel nach Status
    const getArticleCount = (tabId: string) => {
      if (tabId === 'all') {
        return articles.value.length;
      }
      return articles.value.filter(article => article.status === tabId).length;
    };

    // Ansichtsmodus umschalten
    const switchViewMode = (mode: string) => {
      viewMode.value = mode;
      // Speichere Benutzereinstellung lokal
      localStorage.setItem('articleViewMode', mode);
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
      article.status = article.status === 'bookmarked'
        ? (article.currentChapter === article.totalChapters ? 'completed' : 'reading')
        : 'bookmarked';
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
      searchQuery.value = '';
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
      getArticleCount,
      switchViewMode,
      openArticleReader,
      closeArticleReader,
      toggleBookmark,
      filterArticles,
      addFilterTag,
      removeFilterTag,
      clearFilters
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

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

      @each $theme in ('light', 'dark') {
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

    // Filter-Tags
    .active-filters {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: map.get(vars.$spacing, s);

      .filter-label {
        font-weight: map.get(map.get(vars.$fonts, weights), medium);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }

      .filter-tags {
        display: flex;
        flex-wrap: wrap;
        gap: map.get(vars.$spacing, xs);

        .filter-tag {
          border-radius: map.get(map.get(vars.$layout, border-radius), pill);
          padding: 4px 12px;
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;

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

      .clear-filters {
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

  // Tabs für Artikelgruppen
  .articles-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: map.get(vars.$spacing, s);
    margin-bottom: map.get(vars.$spacing, l);

    @media (max-width: 576px) {
      gap: map.get(vars.$spacing, xs);
    }

    .tab-button {
      padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      cursor: pointer;
      transition: all 0.3s;
      border: none;

      @media (max-width: 576px) {
        padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, m);
        font-size: 12px;
      }

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          color: mixins.theme-color($theme, text-secondary);

          &:hover {
            background-color: mixins.theme-color($theme, hover-color);
          }

          &.active {
            background: mixins.theme-gradient($theme, primary);
            color: white;
          }
        }
      }

      .count {
        display: inline-block;
        margin-left: 5px;
        padding: 2px 6px;
        border-radius: 50%;
        font-size: 0.8rem;

        @media (max-width: 576px) {
          font-size: 0.7rem;
          padding: 1px 4px;
        }

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: rgba(255, 255, 255, 0.2);
          }
        }
      }
    }
  }

  // Artikelliste
  .article-list {
    margin-bottom: map.get(vars.$spacing, xl);

    .view-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: map.get(vars.$spacing, m);

      @media (max-width: 576px) {
        flex-direction: column;
        align-items: flex-start;
        gap: map.get(vars.$spacing, s);
      }

      .sort-by {
        display: flex;
        align-items: center;
        gap: map.get(vars.$spacing, s);

        @media (max-width: 576px) {
          width: 100%;
        }

        label {
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          white-space: nowrap;

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

          @media (max-width: 576px) {
            flex: 1;
          }

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

      .view-mode-toggle {
        display: flex;
        gap: map.get(vars.$spacing, xxs);

        @media (max-width: 576px) {
          align-self: flex-end;
        }

        .view-button {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: map.get(map.get(vars.$layout, border-radius), small);
          cursor: pointer;
          border: none;

          @media (max-width: 576px) {
            width: 32px;
            height: 32px;
          }

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

    // Container für die Artikel
    .articles-container {
      position: relative;

      // Rasteransicht
      &.grid {
        .grid-view {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: map.get(vars.$spacing, l);

          @media (max-width: 992px) {
            grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
          }

          @media (max-width: 768px) {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          }

          @media (max-width: 576px) {
            grid-template-columns: 1fr;
          }
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

      // Artikelkarte für Rasteransicht
      .article-card {
        position: relative;
        padding: map.get(vars.$spacing, l);
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        flex-direction: column;

        @media (max-width: 768px) {
          padding: map.get(vars.$spacing, m);
        }

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, card-bg);
            border: 1px solid mixins.theme-color($theme, border-light);

            &:hover {
              transform: translateY(-5px);
              @include mixins.shadow('medium', $theme);
              border-color: mixins.theme-color($theme, accent-green);
            }
          }
        }

        .card-label {
          position: absolute;
          top: 15px;
          right: 15px;
          padding: 4px 12px;
          border-radius: map.get(map.get(vars.$layout, border-radius), pill);
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          font-weight: map.get(map.get(vars.$fonts, weights), bold);

          @media (max-width: 768px) {
            top: 10px;
            right: 10px;
            padding: 3px 10px;
            font-size: 11px;
          }

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background: mixins.theme-gradient($theme, primary);
              color: white;
            }
          }
        }

        .card-title {
          margin-top: map.get(vars.$spacing, s);
          margin-bottom: map.get(vars.$spacing, m);
          font-size: map.get(map.get(vars.$fonts, sizes), large);
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
          padding-right: 80px; // Platz für das Label

          @media (max-width: 768px) {
            font-size: map.get(map.get(vars.$fonts, sizes), medium);
            padding-right: 70px;
            margin-bottom: map.get(vars.$spacing, s);
          }

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }

        .card-preview {
          font-size: map.get(map.get(vars.$fonts, sizes), medium);
          margin-bottom: map.get(vars.$spacing, m);
          display: -webkit-box;
          -webkit-line-clamp: 3;
          line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex-grow: 1;

          @media (max-width: 768px) {
            font-size: map.get(map.get(vars.$fonts, sizes), small);
            -webkit-line-clamp: 2;
            line-clamp: 2;
          }

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }

        // Kapitel-Fortschritt
        .chapter-progress {
          margin-bottom: map.get(vars.$spacing, m);

          @media (max-width: 768px) {
            margin-bottom: map.get(vars.$spacing, s);
          }

          .progress-bar {
            height: 6px;
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: map.get(vars.$spacing, xxs);

            @media (max-width: 768px) {
              height: 4px;
            }

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background-color: mixins.theme-color($theme, border-light);
              }
            }

            .progress-fill {
              height: 100%;

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background: mixins.theme-gradient($theme, primary);
                }
              }
            }
          }

          .progress-text {
            display: flex;
            justify-content: space-between;
            font-size: map.get(map.get(vars.$fonts, sizes), small);

            @media (max-width: 768px) {
              font-size: 11px;
            }

            .chapter-info {
              font-weight: map.get(map.get(vars.$fonts, weights), medium);

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, accent-green);
                }
              }
            }

            .last-read {
              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, text-tertiary);
                }
              }
            }
          }
        }

        .card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: map.get(vars.$spacing, m);

          @media (max-width: 768px) {
            flex-direction: column;
            align-items: flex-start;
            gap: map.get(vars.$spacing, xs);
          }

          .card-date {
            font-size: map.get(map.get(vars.$fonts, sizes), small);

            @media (max-width: 768px) {
              font-size: 11px;
            }

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-tertiary);
              }
            }
          }

          .card-tags {
            display: flex;
            flex-wrap: wrap;
            gap: map.get(vars.$spacing, xs);

            .card-tag {
              padding: 2px 8px;
              border-radius: map.get(map.get(vars.$layout, border-radius), pill);
              font-size: 11px;

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background-color: rgba(mixins.theme-color($theme, accent-teal), 0.1);
                  color: mixins.theme-color($theme, accent-teal);
                  border: 1px solid rgba(mixins.theme-color($theme, accent-teal), 0.2);

                  &:hover {
                    background-color: mixins.theme-color($theme, accent-teal);
                    color: white;
                  }
                }
              }
            }
          }
        }

        // Aktionsbuttons
        .card-actions {
          display: flex;
          gap: map.get(vars.$spacing, s);
          height: 40px; // Feste Höhe für die Aktionsleiste

          .action-button {
            height: 100%; // Volle Höhe nehmen
            padding: 0 map.get(vars.$spacing, m);
            border-radius: map.get(map.get(vars.$layout, border-radius), medium);
            font-size: map.get(map.get(vars.$fonts, sizes), small);
            font-weight: map.get(map.get(vars.$fonts, weights), medium);
            cursor: pointer;
            transition: all 0.3s;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;

            @media (max-width: 768px) {
              padding: 0 map.get(vars.$spacing, s);
              font-size: 12px;
            }

            &.read {
              flex: 3; // Lese-Button nimmt etwas mehr Platz ein

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

            &.bookmark {
              flex: 1; // Lesezeichen-Button nimmt weniger Platz ein, aber bleibt proportional
              min-width: 40px; // Mindestbreite für den Stern

              @media (max-width: 768px) {
                min-width: 32px;
              }

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background-color: transparent;
                  color: mixins.theme-color($theme, text-primary);
                  border: 1px solid mixins.theme-color($theme, border-medium);

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

      // Artikel-Listenelement für Listenansicht
      .article-list-item {
        display: flex;
        justify-content: space-between;
        padding: map.get(vars.$spacing, l);
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);
        cursor: pointer;
        transition: all 0.3s;
        gap: map.get(vars.$spacing, l);

        @media (max-width: 768px) {
          padding: map.get(vars.$spacing, m);
          gap: map.get(vars.$spacing, m);
        }

        @media (max-width: 576px) {
          flex-direction: column;
        }

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, card-bg);
            border: 1px solid mixins.theme-color($theme, border-light);

            &:hover {
              transform: translateY(-3px);
              @include mixins.shadow('small', $theme);
              border-color: mixins.theme-color($theme, accent-green);
            }
          }
        }

        .list-item-main {
          flex: 1;
          min-width: 0; // Für Textbegrenzung

          .list-item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: map.get(vars.$spacing, s);

            .card-label {
              padding: 4px 12px;
              border-radius: map.get(map.get(vars.$layout, border-radius), pill);
              font-size: map.get(map.get(vars.$fonts, sizes), small);
              font-weight: map.get(map.get(vars.$fonts, weights), bold);

              @media (max-width: 768px) {
                padding: 3px 10px;
                font-size: 11px;
              }

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background: mixins.theme-gradient($theme, primary);
                  color: white;
                }
              }
            }

            .card-date {
              font-size: map.get(map.get(vars.$fonts, sizes), small);

              @media (max-width: 768px) {
                font-size: 11px;
              }

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, text-tertiary);
                }
              }
            }
          }

          .card-title {
            margin-bottom: map.get(vars.$spacing, s);
            font-size: map.get(map.get(vars.$fonts, sizes), large);
            font-weight: map.get(map.get(vars.$fonts, weights), bold);

            @media (max-width: 768px) {
              font-size: map.get(map.get(vars.$fonts, sizes), medium);
            }

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-primary);
              }
            }
          }

          .card-preview {
            font-size: map.get(map.get(vars.$fonts, sizes), medium);
            margin-bottom: map.get(vars.$spacing, m);
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;

            @media (max-width: 768px) {
              font-size: map.get(map.get(vars.$fonts, sizes), small);
              margin-bottom: map.get(vars.$spacing, s);
            }

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-secondary);
              }
            }
          }

          // Kapitel-Fortschritt
          .chapter-progress {
            margin-bottom: map.get(vars.$spacing, m);

            @media (max-width: 768px) {
              margin-bottom: map.get(vars.$spacing, s);
            }

            .progress-bar {
              height: 6px;
              border-radius: 3px;
              overflow: hidden;
              margin-bottom: map.get(vars.$spacing, xxs);

              @media (max-width: 768px) {
                height: 4px;
              }

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background-color: mixins.theme-color($theme, border-light);
                }
              }

              .progress-fill {
                height: 100%;

                @each $theme in ('light', 'dark') {
                  .theme-#{$theme} & {
                    background: mixins.theme-gradient($theme, primary);
                  }
                }
              }
            }

            .progress-text {
              display: flex;
              justify-content: space-between;
              font-size: map.get(map.get(vars.$fonts, sizes), small);

              @media (max-width: 768px) {
                font-size: 11px;
              }

              .chapter-info {
                font-weight: map.get(map.get(vars.$fonts, weights), medium);

                @each $theme in ('light', 'dark') {
                  .theme-#{$theme} & {
                    color: mixins.theme-color($theme, accent-green);
                  }
                }
              }

              .last-read {
                @each $theme in ('light', 'dark') {
                  .theme-#{$theme} & {
                    color: mixins.theme-color($theme, text-tertiary);
                  }
                }
              }
            }
          }

          .card-tags {
            display: flex;
            flex-wrap: wrap;
            gap: map.get(vars.$spacing, xs);

            .card-tag {
              padding: 2px 8px;
              border-radius: map.get(map.get(vars.$layout, border-radius), pill);
              font-size: 11px;

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background-color: rgba(mixins.theme-color($theme, accent-teal), 0.1);
                  color: mixins.theme-color($theme, accent-teal);
                  border: 1px solid rgba(mixins.theme-color($theme, accent-teal), 0.2);

                  &:hover {
                    background-color: mixins.theme-color($theme, accent-teal);
                    color: white;
                  }
                }
              }
            }
          }
        }

        // Aktionsschaltflächen für Listenansicht
        .list-item-actions {
          display: flex;
          flex-direction: column;
          gap: map.get(vars.$spacing, s);
          align-self: center;
          width: 120px; // Feste Breite für die Aktionsleiste in der Listenansicht

          @media (max-width: 576px) {
            flex-direction: row;
            width: 100%;
            margin-top: map.get(vars.$spacing, s);
          }

          .action-button {
            height: 40px; // Feste Höhe für beide Buttons
            padding: 0 map.get(vars.$spacing, m);
            border-radius: map.get(map.get(vars.$layout, border-radius), medium);
            font-size: map.get(map.get(vars.$fonts, sizes), small);
            font-weight: map.get(map.get(vars.$fonts, weights), medium);
            cursor: pointer;
            transition: all 0.3s;
            border: none;
            white-space: nowrap;
            display: flex;
            align-items: center;
            justify-content: center;

            @media (max-width: 768px) {
              padding: 0 map.get(vars.$spacing, s);
              font-size: 12px;
              height: 36px; // Etwas kleiner auf mobilen Geräten
            }

            @media (max-width: 576px) {
              flex: 1;
            }

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

            &.bookmark {
              @media (max-width: 576px) {
                flex: 0 0 40px; // Feste Breite in der mobilen Listenansicht
              }

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background-color: transparent;
                  color: mixins.theme-color($theme, text-primary);
                  border: 1px solid mixins.theme-color($theme, border-medium);

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

    @media (max-width: 576px) {
      padding: map.get(vars.$spacing, xl) map.get(vars.$spacing, m);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: map.get(vars.$spacing, l);
      opacity: 0.5;

      @media (max-width: 576px) {
        font-size: 3rem;
        margin-bottom: map.get(vars.$spacing, m);
      }
    }

    h3 {
      font-size: map.get(map.get(vars.$fonts, sizes), xl);
      margin-bottom: map.get(vars.$spacing, m);

      @media (max-width: 576px) {
        font-size: map.get(map.get(vars.$fonts, sizes), large);
        margin-bottom: map.get(vars.$spacing, s);
      }

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

      @media (max-width: 576px) {
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        margin-bottom: map.get(vars.$spacing, m);
      }

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
          transition: all 0.4s ease-out;
        }
      }
    }

    .reset-button {
      padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      border: none;
      cursor: pointer;

      @media (max-width: 576px) {
        padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
        font-size: map.get(map.get(vars.$fonts, sizes), small);
      }

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

  // Artikel-Leseansicht nimmt den gesamten Bereich ein
  .article-reader-mode {
    width: 100%;
  }
}
</style>