<!-- src/components/pages/DashboardPages/Overview/RecentActivities.vue -->
<template>
  <div class="section-container recent-activities">
    <div class="section-header">
      <h3>Deine Lese-Aktivitäten</h3>
      <button class="view-all-button" @click="$emit('view-all')">Alle anzeigen</button>
    </div>

    <!-- Keine Aktivitäten Fallback -->
    <div v-if="articles.length === 0" class="empty-state">
      <p>Du hast noch keine Artikel gelesen. Entdecke jetzt neue Inhalte!</p>
      <button class="discover-button" @click="$emit('discover')">Entdecken</button>
    </div>

    <!-- Liste der aktuellen Artikel mit Kapitel/Seiten-Angabe -->
    <div v-else class="article-progress-list">
      <div v-for="(article, index) in articles" :key="index" class="progress-item"
        @click="$emit('open-article', article)">
        <div class="article-status" :class="article.status"></div>
        <div class="progress-info">
          <h4>{{ article.title }}</h4>
          <div class="progress-meta">
            <span class="progress-chapter">
              <span class="chapter-label">Fortschritt:</span>
              <span class="chapter-progress">{{ article.currentChapter }}/{{ article.totalChapters }} Kapitel</span>
            </span>
            <span class="progress-date">{{ article.lastRead }}</span>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill"
            :style="{ width: (article.currentChapter && article.totalChapters ? (article.currentChapter / article.totalChapters * 100) + '%' : '0%') }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

interface Article {
  id: number;
  title: string;
  status?: string;
  currentChapter?: number;
  totalChapters?: number;
  lastRead?: string;
}

export default defineComponent({
  name: 'RecentActivities',
  props: {
    articles: {
      type: Array as PropType<Article[]>,
      required: true
    }
  },
  emits: ['view-all', 'discover', 'open-article']
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;

// Gemeinsame Stile für Sektionen
.section-container {
  padding: map.get(vars.$spacing, xl);
  border-radius: map.get(map.get(vars.$layout, border-radius), large);

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, card-bg);
      border: 1px solid mixins.theme-color($theme, border-light);
    }
  }

  // Sektionsüberschrift
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: map.get(vars.$spacing, l);

    h3 {
      font-size: map.get(map.get(vars.$fonts, sizes), large);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      margin: 0;
      position: relative;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);

          &::after {
            content: '';
            position: absolute;
            width: 40px;
            height: 3px;
            bottom: -8px;
            left: 0;
            background: mixins.theme-gradient($theme, primary);
            border-radius: 2px;
          }
        }
      }
    }

    .view-all-button {
      background: none;
      border: none;
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      cursor: pointer;
      display: flex;
      align-items: center;

      &::after {
        content: '→';
        margin-left: 5px;
        font-size: 1.2em;
      }

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, accent-teal);

          &:hover {
            color: mixins.theme-color($theme, accent-green);
          }
        }
      }
    }
  }

  // Leerer Zustand
  .empty-state {
    text-align: center;
    padding: map.get(vars.$spacing, xl) 0;

    p {
      margin-bottom: map.get(vars.$spacing, l);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }

    .discover-button {
      padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      border: none;
      cursor: pointer;
      font-weight: map.get(map.get(vars.$fonts, weights), medium);

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
  }
}

// Aktivitäten-Sektion
.recent-activities {
  margin-bottom: map.get(vars.$spacing, l);
  max-width: 800px;
  margin: 0 auto;

  .article-progress-list {
    display: flex;
    flex-direction: column;
    gap: map.get(vars.$spacing, m);

    .progress-item {
      padding: map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      cursor: pointer;
      transition: all 0.3s;
      position: relative;
      padding-left: map.get(vars.$spacing, xl); // Platz für Status-Indikator

      // Status-Indikator links
      .article-status {
        position: absolute;
        left: map.get(vars.$spacing, s);
        top: 50%;
        transform: translateY(-50%);
        width: 8px;
        height: 50px;
        border-radius: 4px;

        &.just-started {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, accent-yellow);
            }
          }
        }

        &.in-progress {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, accent-teal);
            }
          }
        }

        &.almost-done {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, accent-green);
            }
          }
        }
      }

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

        h4 {
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

          .progress-chapter,
          .progress-date {
            font-size: map.get(map.get(vars.$fonts, sizes), small);

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-tertiary);
              }
            }
          }

          .progress-chapter {
            display: flex;
            align-items: center;
            gap: map.get(vars.$spacing, xxs);

            .chapter-label {
              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, text-tertiary);
                }
              }
            }

            .chapter-progress {
              font-weight: map.get(map.get(vars.$fonts, weights), bold);

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, accent-green);
                }
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
}
</style>