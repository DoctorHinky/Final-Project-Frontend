<!-- src/pages/member/Articles.vue (Im Stil der Hauptseite) -->
<template>
  <div class="member-articles-page" :class="{ 'sidebar-open': isSidebarOpen }">
    <!-- Haupt-Container mit ähnlichem Layout wie die Hauptseite -->
    <div class="container">
      <!-- Header-Bereich mit Toggle und Nutzerinfo -->
      <div class="member-header">
        <div class="header-left">
          <button class="sidebar-toggle" @click="toggleSidebar">
            <span class="toggle-icon">☰</span>
          </button>
          <h1>Meine Artikel</h1>
        </div>
        <div class="header-right">
          <ThemeToggle :is-light-theme="isLightTheme" @toggle="toggleTheme" />
          <div class="user-info">
            <span class="user-greeting">Willkommen, {{ userName }}</span>
            <button class="logout-button" @click="handleLogout">Abmelden</button>
          </div>
        </div>
      </div>

      <!-- Suchleiste -->
      <div class="search-section">
        <div class="search-container">
          <input 
            type="text" 
            placeholder="Artikel suchen..." 
            v-model="searchQuery"
            @input="filterArticles"
          />
          <button class="search-button">
            <span class="search-icon">🔍</span>
          </button>
        </div>
        <div class="active-filters" v-if="filterTags.length > 0">
          <span class="filter-label">Aktive Filter:</span>
          <div class="filter-tags">
            <span 
              v-for="(tag, index) in filterTags" 
              :key="index"
              class="filter-tag"
              @click="removeFilterTag(index)"
            >
              {{ tag }} <span class="remove-tag">×</span>
            </span>
          </div>
          <button class="clear-filters" @click="clearFilters">Alle löschen</button>
        </div>
      </div>

      <!-- Hauptinhalt mit Artikelvorschau und Detailansicht -->
      <div class="content-section">
        <!-- Vorgeschlagene Artikel -->
        <div class="featured-articles section">
          <div class="section-header">
            <h2>Vorgeschlagene Artikel</h2>
            <div class="view-options">
              <button :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">
                ■ ■
              </button>
              <button :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">
                ≡
              </button>
            </div>
          </div>
          
          <div class="article-cards" :class="viewMode">
            <div 
              v-for="article in featuredArticles" 
              :key="article.id" 
              class="article-card"
              :class="{ active: selectedArticle && selectedArticle.id === article.id }"
              @click="openArticle(article)"
            >
              <div class="card-label">{{ article.category }}</div>
              <h3 class="card-title">{{ article.title }}</h3>
              <p class="card-preview">{{ article.preview }}</p>
              <div class="card-meta">
                <span class="card-date">{{ article.date }}</span>
                <div class="card-tags">
                  <span 
                    v-for="(tag, idx) in article.tags" 
                    :key="idx" 
                    class="card-tag"
                    @click.stop="addFilterTag(tag)"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Aktuelle Artikel -->
        <div class="recent-articles section">
          <div class="section-header">
            <h2>Fortsetzung deiner Lektüre</h2>
          </div>
          
          <div class="article-progress-list">
            <div class="progress-item" v-for="article in recentArticles" :key="article.id" @click="openArticle(article)">
              <div class="progress-info">
                <h3>{{ article.title }}</h3>
                <div class="progress-meta">
                  <span class="progress-percentage">{{ article.progress }}% gelesen</span>
                  <span class="progress-date">{{ article.lastRead }}</span>
                </div>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: article.progress + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Artikel-Detail-Ansicht -->
        <div class="article-detail section" v-if="selectedArticle">
          <div class="article-header">
            <div class="article-title">
              <h2>{{ selectedArticle.title }}</h2>
              <div class="article-meta">
                <span class="article-date">{{ selectedArticle.date }}</span>
                <span class="article-author">Von {{ selectedArticle.author || 'Autor unbekannt' }}</span>
              </div>
            </div>
            <div class="article-actions">
              <button 
                class="action-button bookmark" 
                :class="{ active: isBookmarked }" 
                @click="toggleBookmark"
                title="Als Favorit speichern"
              >
                {{ isBookmarked ? '★' : '☆' }}
              </button>
              <button 
                class="action-button share" 
                @click="shareArticle"
                title="Artikel teilen"
              >
                ↗
              </button>
            </div>
          </div>
          
          <div class="article-content" ref="articleContent">
            <p class="article-text" :class="{'diagonal-text': showDiagonalText}">
              {{ selectedArticle.content }}
            </p>
          </div>
          
          <div class="article-footer">
            <div class="article-pagination">
              <button 
                class="pagination-button prev" 
                :disabled="currentPage === 1"
                @click="previousPage"
              >
                ← Zurück
              </button>
              <div class="pagination-info">
                Seite {{ currentPage }} von {{ totalPages }}
              </div>
              <button 
                class="pagination-button next" 
                :disabled="currentPage >= totalPages"
                @click="nextPage"
              >
                Weiter →
              </button>
            </div>
            
            <div class="article-rating">
              <div class="rating-label">Diesen Artikel bewerten</div>
              <div class="rating-stars">
                <span 
                  v-for="n in 5" 
                  :key="n"
                  class="star"
                  :class="{ active: n <= rating }"
                  @click="setRating(n)"
                >
                  ★
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Seitliche Navigationsleiste (ausfahrbar) -->
    <aside class="sidebar" :class="{ open: isSidebarOpen }">
      <div class="sidebar-header">
        <h3>Account-Verwaltung</h3>
        <button class="close-sidebar" @click="toggleSidebar">×</button>
      </div>
      <nav class="sidebar-nav">
        <a href="#" class="nav-item active">
          <span class="nav-icon">📚</span>
          <span>Meine Artikel</span>
        </a>
        <a href="#" class="nav-item">
          <span class="nav-icon">❤️</span>
          <span>Favoriten</span>
        </a>
        <a href="#" class="nav-item">
          <span class="nav-icon">👤</span>
          <span>Mein Profil</span>
        </a>
        <a href="#" class="nav-item">
          <span class="nav-icon">📝</span>
          <span>Leseliste</span>
        </a>
        <a href="#" class="nav-item">
          <span class="nav-icon">🔔</span>
          <span>Benachrichtigungen</span>
        </a>
        <a href="#" class="nav-item">
          <span class="nav-icon">⚙️</span>
          <span>Einstellungen</span>
        </a>
      </nav>
      <div class="sidebar-footer">
        <button class="logout-button full" @click="handleLogout">
          <span class="nav-icon">🚪</span>
          <span>Abmelden</span>
        </button>
      </div>
    </aside>
    
    <!-- Overlay für mobile Ansicht -->
    <div class="sidebar-overlay" v-if="isSidebarOpen" @click="toggleSidebar"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services/auth.service';
import ThemeToggle from '@/components/ui/ThemeToggle.vue';

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
  progress?: number;
  lastRead?: string;
}

export default defineComponent({
  name: 'MemberArticles',
  components: {
    ThemeToggle
  },
  setup() {
    const router = useRouter();
    const searchQuery = ref('');
    const filterTags = ref<string[]>([]);
    const isBookmarked = ref(false);
    const articleContent = ref<HTMLElement | null>(null);
    const isSidebarOpen = ref(false);
    const isLightTheme = ref(localStorage.getItem('theme') !== 'dark');
    const userName = ref('Mitglied');
    const viewMode = ref('grid');
    const showDiagonalText = ref(true); // Demo-Zwecke, später entfernen
    
    // Artikel-Daten (später durch API-Aufrufe ersetzen)
    const articles = ref<Article[]>([
      {
        id: 1,
        title: 'Erziehungsstile im Vergleich: Welcher passt zu Ihrer Familie?',
        content: 'Text des ARTIKELS - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quis lorem ut libero malesuada feugiat. Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Cras ultricies ligula sed magna dictum porta. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Sed porttitor lectus nibh. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Nulla quis lorem ut libero malesuada feugiat.',
        preview: 'Eine umfassende Analyse verschiedener Erziehungsansätze und wie sie sich auf die Entwicklung Ihres Kindes auswirken können.',
        featured: true,
        date: '05.05.2025',
        category: 'Erziehung',
        author: 'Dr. Anna Schmidt',
        tags: ['Erziehung', 'Familienleben', 'Entwicklung'],
        progress: 65,
        lastRead: 'Gestern'
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
        progress: 30,
        lastRead: 'Vor 3 Tagen'
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
        progress: 0,
        lastRead: ''
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
        progress: 80,
        lastRead: 'Vor einer Woche'
      }
    ]);

    const selectedArticle = ref<Article | null>(null);
    const currentPage = ref(1);
    const totalPages = ref(5); // Angenommen, der Artikel hat 5 Seiten
    const rating = ref(0);

    // Gefilterte Artikel basierend auf Suchanfrage und Tags
    const filteredArticles = computed(() => {
      let result = [...articles.value];
      
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
      
      return result;
    });

    // Hervorgehobene Artikel
    const featuredArticles = computed(() => {
      return filteredArticles.value.filter(article => article.featured);
    });

    // Kürzlich gelesene Artikel
    const recentArticles = computed(() => {
      return articles.value
        .filter(article => article.progress && article.progress > 0)
        .sort((a, b) => {
          const dateA = a.lastRead ? new Date(a.lastRead).getTime() : 0;
          const dateB = b.lastRead ? new Date(b.lastRead).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 3);
    });

    // Artikel öffnen
    const openArticle = (article: Article) => {
      selectedArticle.value = article;
      currentPage.value = 1; // Zurück zur ersten Seite
      
      // Scrollposition zurücksetzen
      nextTick(() => {
        if (articleContent.value) {
          articleContent.value.scrollTop = 0;
        }
      });
    };

    // Seitenwechsel
    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
        // Scrollposition zurücksetzen
        if (articleContent.value) {
          articleContent.value.scrollTop = 0;
        }
      }
    };

    const previousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
        // Scrollposition zurücksetzen
        if (articleContent.value) {
          articleContent.value.scrollTop = 0;
        }
      }
    };

    // Bewertung setzen
    const setRating = (value: number) => {
      rating.value = value;
      // Hier später API-Aufruf zum Speichern der Bewertung
      // z.B. api.rateArticle(selectedArticle.value.id, value)
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

    // Alle Filter löschen
    const clearFilters = () => {
      filterTags.value = [];
      searchQuery.value = '';
    };

    // Artikel filtern basierend auf Suchanfrage
    const filterArticles = () => {
      // Wenn die Filterung Ergebnisse liefert, den ersten als ausgewählten Artikel setzen
      if (filteredArticles.value.length > 0 && !selectedArticle.value) {
        selectedArticle.value = filteredArticles.value[0];
      }
    };

    // Lesezeichen-Status umschalten
    const toggleBookmark = () => {
      isBookmarked.value = !isBookmarked.value;
      // Hier später API-Aufruf zum Speichern des Lesezeichen-Status
      // z.B. api.toggleBookmark(selectedArticle.value.id, isBookmarked.value)
    };

    // Artikel teilen
    const shareArticle = () => {
      if (selectedArticle.value) {
        // Hier später Funktionalität zum Teilen implementieren
        alert(`Artikel "${selectedArticle.value.title}" wird geteilt...`);
      }
    };

    // Sidebar ein-/ausblenden
    const toggleSidebar = () => {
      isSidebarOpen.value = !isSidebarOpen.value;
    };

    // Theme umschalten
    const toggleTheme = () => {
      isLightTheme.value = !isLightTheme.value;
      localStorage.setItem('theme', isLightTheme.value ? 'light' : 'dark');
      // Theme-Klasse im body-Element aktualisieren
      document.body.classList.toggle('theme-dark', !isLightTheme.value);
      document.body.classList.toggle('theme-light', isLightTheme.value);
    };

    // Abmelden
    const handleLogout = () => {
      authService.logout();
      router.push('/login-register');
    };

    // Initialisierung
    onMounted(() => {
      // Benutzername aus Auth-Daten abrufen
      const userData = authService.getUserData();
      if (userData && userData.name) {
        userName.value = userData.name.split(' ')[0]; // Nur Vorname verwenden
      }
      
      // Theme aus localStorage anwenden
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        isLightTheme.value = savedTheme === 'light';
        document.body.classList.toggle('theme-dark', !isLightTheme.value);
        document.body.classList.toggle('theme-light', isLightTheme.value);
      }
      
      // Ersten Artikel auswählen, falls noch keiner ausgewählt ist
      if (!selectedArticle.value && featuredArticles.value.length > 0) {
        selectedArticle.value = featuredArticles.value[0];
      }
    });

    // Observer für Bildschirmgröße
    watch(() => window.innerWidth, () => {
      // Bei kleinen Bildschirmen Sidebar automatisch schließen
      if (window.innerWidth < 768 && isSidebarOpen.value) {
        isSidebarOpen.value = false;
      }
    });

    return {
      searchQuery,
      articles: filteredArticles,
      featuredArticles,
      recentArticles,
      selectedArticle,
      currentPage,
      totalPages,
      rating,
      filterTags,
      isBookmarked,
      isSidebarOpen,
      isLightTheme,
      userName,
      viewMode,
      articleContent,
      showDiagonalText,
      openArticle,
      nextPage,
      previousPage,
      setRating,
      filterArticles,
      addFilterTag,
      removeFilterTag,
      clearFilters,
      toggleBookmark,
      shareArticle,
      toggleSidebar,
      toggleTheme,
      handleLogout
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

// Grundlegendes Layout
.member-articles-page {
  padding-top: 0;
  position: relative;
  min-height: 100vh;
  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, primary-bg);
    }
  }

  .container {
    max-width: map.get(vars.$layout, max-width);
    margin: 0 auto;
    padding: map.get(vars.$spacing, xl);
    transition: transform 0.3s ease;

    @media (max-width: 768px) {
      padding: map.get(vars.$spacing, m);
    }
  }

  &.sidebar-open .container {
    @media (min-width: 769px) {
      transform: translateX(300px);
    }
  }
}

// Header-Styling
.member-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: map.get(vars.$spacing, xl);

  .header-left {
    display: flex;
    align-items: center;
    gap: map.get(vars.$spacing, m);

    .sidebar-toggle {
      height: 40px;
      width: 40px;
      cursor: pointer;
      background: none;
      border: none;
      font-size: 1.5rem;
      padding: map.get(vars.$spacing, xs);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
          
          &:hover {
            background-color: mixins.theme-color($theme, hover-color);
          }
        }
      }
    }

    h1 {
      font-size: 2rem;
      font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
      margin: 0;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }

      @media (max-width: 768px) {
        font-size: 1.5rem;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: map.get(vars.$spacing, l);

    .user-info {
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, m);

      .user-greeting {
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }

        @media (max-width: 768px) {
          display: none;
        }
      }

      .logout-button {
        @include mixins.button-style('light', 'small', true);
        transition: all 0.3s ease;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: transparent;
            color: mixins.theme-color($theme, text-primary);
            border: 1px solid mixins.theme-color($theme, border-medium);
            
            &:hover {
              background-color: mixins.theme-color($theme, hover-color);
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }
      }
    }
  }
}

// Suchleiste
.search-section {
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
        transition: all 0.2s ease;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, accent-teal);
            color: white;
            
            &:hover {
              background-color: mixins.theme-color($theme, accent-green);
              transform: translateY(-2px);
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

// Hauptinhalt
.content-section {
  display: flex;
  flex-direction: column;
  gap: map.get(vars.$spacing, xxl);

  .section {
    @include animations.fade-in;
    
    &:not(:last-child) {
      margin-bottom: map.get(vars.$spacing, xl);
    }
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: map.get(vars.$spacing, l);

    h2 {
      font-size: map.get(map.get(vars.$fonts, sizes), xl);
      font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
      position: relative;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
          
          &::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 0;
            width: 50px;
            height: 3px;
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background: mixins.theme-gradient($theme, primary);
              }
            }
          }
        }
      }
    }

    .view-options {
      display: flex;
      gap: map.get(vars.$spacing, xs);
      
      button {
        background: none;
        border: none;
        cursor: pointer;
        padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, s);
        border-radius: map.get(map.get(vars.$layout, border-radius), small);
        font-size: 1.2rem;
        transition: all 0.2s ease;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
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

  // Artikel-Karten
  .article-cards {
    display: grid;
    gap: map.get(vars.$spacing, l);
    
    &.grid {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      
      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }
    
    &.list {
      grid-template-columns: 1fr;
    }
    
    .article-card {
      position: relative;
      padding: map.get(vars.$spacing, l);
      border-radius: map.get(map.get(vars.$layout, border-radius), large);
      transition: all 0.3s ease;
      cursor: pointer;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          @include mixins.card-style($theme, 'medium', true);
          
          &.active {
            border-color: mixins.theme-color($theme, accent-green);
            box-shadow: 0 8px 24px rgba(mixins.theme-color($theme, accent-green), 0.25);
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
        max-width: 85%;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }
      
      .card-preview {
        font-size: map.get(map.get(vars.$fonts, sizes), medium);
        margin-bottom: map.get(vars.$spacing, l);
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }
      
      .card-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .card-date {
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          
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
                border: 1px solid mixins.theme-color($theme, accent-teal);
                
                &:hover {
                  background-color: mixins.theme-color($theme, accent-teal);
                  color: white;
                }
              }
            }
          }
        }
      }
      
      // Unterschiedliches Layout für List-Ansicht
      .list & {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: map.get(vars.$spacing, l);
        
        .card-title {
          margin-top: 0;
        }
        
        .card-preview {
          margin-bottom: map.get(vars.$spacing, s);
        }
        
        @media (max-width: 768px) {
          grid-template-columns: 1fr;
        }
      }
    }
  }

  // Fortschritts-Leseliste
  .article-progress-list {
    display: flex;
    flex-direction: column;
    gap: map.get(vars.$spacing, m);
    
    .progress-item {
      padding: map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      cursor: pointer;
      transition: all 0.3s ease;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          border: 1px solid mixins.theme-color($theme, border-light);
          
          &:hover {
            background-color: mixins.theme-color($theme, hover-color);
            border-color: mixins.theme-color($theme, border-medium);
            transform: translateX(5px);
          }
        }
      }
      
      .progress-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: map.get(vars.$spacing, s);
        
        @media (max-width: 768px) {
          flex-direction: column;
          align-items: flex-start;
          gap: map.get(vars.$spacing, xxs);
        }
        
        h3 {
          font-size: map.get(map.get(vars.$fonts, sizes), medium);
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
          margin: 0;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }
        
        .progress-meta {
          display: flex;
          gap: map.get(vars.$spacing, m);
          
          .progress-percentage, .progress-date {
            font-size: map.get(map.get(vars.$fonts, sizes), small);
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-tertiary);
              }
            }
          }
          
          .progress-percentage {
            font-weight: map.get(map.get(vars.$fonts, weights), bold);
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, accent-green);
              }
            }
          }
        }
      }
      
      .progress-bar {
        height: 6px;
        border-radius: 3px;
        overflow: hidden;
        
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
    }
  }

  // Artikel-Detailansicht
  .article-detail {
    position: relative;
    padding: map.get(vars.$spacing, xl);
    border-radius: map.get(map.get(vars.$layout, border-radius), large);
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        border: 1px solid mixins.theme-color($theme, border-medium);
        @include mixins.shadow('medium', $theme);
      }
    }
    
    .article-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: map.get(vars.$spacing, xl);
      
      .article-title {
        h2 {
          font-size: map.get(map.get(vars.$fonts, sizes), xxl);
          font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
          margin-bottom: map.get(vars.$spacing, s);
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }
        
        .article-meta {
          display: flex;
          gap: map.get(vars.$spacing, m);
          
          .article-date, .article-author {
            font-size: map.get(map.get(vars.$fonts, sizes), small);
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-tertiary);
              }
            }
          }
        }
      }
      
      .article-actions {
        display: flex;
        gap: map.get(vars.$spacing, s);
        
        .action-button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          cursor: pointer;
          transition: all 0.2s ease;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
              color: mixins.theme-color($theme, text-secondary);
              border: 1px solid mixins.theme-color($theme, border-light);
              
              &:hover {
                background-color: mixins.theme-color($theme, hover-color);
                color: mixins.theme-color($theme, text-primary);
                border-color: mixins.theme-color($theme, border-medium);
              }
              
              &.bookmark {
                &.active {
                  background-color: mixins.theme-color($theme, accent-yellow);
                  color: white;
                  border-color: mixins.theme-color($theme, accent-yellow);
                }
                
                &:not(.active):hover {
                  color: mixins.theme-color($theme, accent-yellow);
                  border-color: mixins.theme-color($theme, accent-yellow);
                }
              }
              
              &.share:hover {
                color: mixins.theme-color($theme, accent-teal);
                border-color: mixins.theme-color($theme, accent-teal);
              }
            }
          }
        }
      }
    }
    
    .article-content {
      min-height: 400px;
      max-height: 600px;
      overflow-y: auto;
      margin-bottom: map.get(vars.$spacing, xl);
      padding: map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          border: 1px solid mixins.theme-color($theme, border-light);
        }
      }
      
      .article-text {
        font-size: map.get(map.get(vars.$fonts, sizes), medium);
        line-height: 1.8;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
        
        &.diagonal-text {
          transform: rotate(-10deg);
          font-family: 'Courier New', monospace;
          padding: 30px;
          text-align: center;
          position: relative;
          top: 80px;
        }
      }
    }
    
    .article-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid;
      padding-top: map.get(vars.$spacing, l);
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          border-color: mixins.theme-color($theme, border-light);
        }
      }
      
      .article-pagination {
        display: flex;
        align-items: center;
        gap: map.get(vars.$spacing, m);
        
        .pagination-button {
          padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);
          border-radius: map.get(map.get(vars.$layout, border-radius), medium);
          font-weight: map.get(map.get(vars.$fonts, weights), medium);
          cursor: pointer;
          transition: all 0.2s ease;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              @include mixins.button-style($theme, 'small', false);
              
              &:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                box-shadow: none;
                transform: none;
              }
            }
          }
        }
        
        .pagination-info {
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-tertiary);
            }
          }
        }
      }
      
      .article-rating {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: map.get(vars.$spacing, xs);
        
        .rating-label {
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-tertiary);
            }
          }
        }
        
        .rating-stars {
          display: flex;
          gap: 5px;
          
          .star {
            font-size: 1.2rem;
            cursor: pointer;
            transition: all 0.2s ease;
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, border-medium);
                
                &:hover, &.active {
                  color: mixins.theme-color($theme, accent-yellow);
                  transform: scale(1.2);
                }
              }
            }
          }
        }
      }
    }
  }
}

// Sidebar-Styling
.sidebar {
  position: fixed;
  left: -300px;
  top: 0;
  width: 300px;
  height: 100vh;
  z-index: 1000;
  transition: left 0.3s ease;
  display: flex;
  flex-direction: column;
  
  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, card-bg);
      border-right: 1px solid mixins.theme-color($theme, border-medium);
      box-shadow: 5px 0 20px rgba(0, 0, 0, 0.1);
    }
  }
  
  &.open {
    left: 0;
  }
  
  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: map.get(vars.$spacing, l);
    border-bottom: 1px solid;
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        border-color: mixins.theme-color($theme, border-light);
      }
    }
    
    h3 {
      font-size: map.get(map.get(vars.$fonts, sizes), large);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      margin: 0;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }
    
    .close-sidebar {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 5px;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
          
          &:hover {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }
    }
  }
  
  .sidebar-nav {
    flex: 1;
    padding: map.get(vars.$spacing, m);
    display: flex;
    flex-direction: column;
    gap: map.get(vars.$spacing, m);
    overflow-y: auto;
    
    .nav-item {
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, m);
      padding: map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      text-decoration: none;
      transition: all 0.2s ease;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
          
          &:hover {
            background-color: mixins.theme-color($theme, hover-color);
            color: mixins.theme-color($theme, text-primary);
          }
          
          &.active {
            background: mixins.theme-gradient($theme, primary);
            color: white;
          }
        }
      }
      
      .nav-icon {
        font-size: 1.2rem;
      }
    }
  }
  
  .sidebar-footer {
    padding: map.get(vars.$spacing, m);
    border-top: 1px solid;
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        border-color: mixins.theme-color($theme, border-light);
      }
    }
    
    .logout-button.full {
      width: 100%;
      padding: map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: map.get(vars.$spacing, m);
      cursor: pointer;
      transition: all 0.2s ease;
      
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

// Overlay für mobile Ansicht
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: none;
  
  @media (max-width: 768px) {
    display: block;
  }
}

// Animationen
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.member-articles-page {
  animation: fadeIn 0.5s ease-out;
}

// Responsive Anpassungen
@media (max-width: 992px) {
  .article-detail .article-header {
    flex-direction: column;
    gap: map.get(vars.$spacing, m);
    
    .article-actions {
      align-self: flex-end;
    }
  }
}

@media (max-width: 768px) {
  .member-header {
    flex-wrap: wrap;
    gap: map.get(vars.$spacing, m);
    
    .header-right {
      width: 100%;
      justify-content: space-between;
    }
  }
  
  .article-detail {
    padding: map.get(vars.$spacing, m);
    
    .article-content {
      min-height: 300px;
    }
    
    .article-footer {
      flex-direction: column;
      gap: map.get(vars.$spacing, l);
      
      .article-pagination {
        width: 100%;
      }
      
      .article-rating {
        width: 100%;
        align-items: center;
      }
    }
  }
}
</style>