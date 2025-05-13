<!-- src/components/pages/DashboardPages/MyArticles/ArticlesList.vue -->
<template>
  <div class="article-list">
    <view-options
      :sort-option="sortOption"
      :view-mode="viewMode"
      @update:sort-option="$emit('update:sortOption', $event)"
      @update:view-mode="$emit('update:viewMode', $event)"
    />

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
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import ViewOptions from './ViewOptions.vue';

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
  name: 'ArticlesList',
  components: {
    ViewOptions
  },
  props: {
    filteredArticles: {
      type: Array as PropType<Article[]>,
      required: true
    },
    sortOption: {
      type: String,
      required: true
    },
    viewMode: {
      type: String,
      required: true
    }
  },
  emits: [
    'update:sortOption', 
    'update:viewMode', 
    'open-article', 
    'toggle-bookmark', 
    'add-filter-tag'
  ],
  setup(props, { emit }) {
    const openArticleReader = (article: Article) => {
      emit('open-article', article);
    };

    const toggleBookmark = (article: Article) => {
      emit('toggle-bookmark', article);
    };

    const addFilterTag = (tag: string) => {
      emit('add-filter-tag', tag);
    };

    return {
      openArticleReader,
      toggleBookmark,
      addFilterTag
    };
  }
});
</script>

<style lang="scss" scoped>
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use 'sass:map';

// Artikelliste
.article-list {
  margin-bottom: map.get(vars.$spacing, xl);

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
</style>