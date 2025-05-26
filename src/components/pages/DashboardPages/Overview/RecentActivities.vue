<!-- src/components/pages/DashboardPages/Overview/RecentActivities.vue -->
<template>
  <div class="section-container recent-activities">
    <div class="section-header">
      <h3>Deine Lese-Aktivitäten</h3>
      <button class="view-all-button" @click="$emit('view-all')">
        <span>Alle anzeigen</span>
        <span class="arrow-icon">→</span>
      </button>
    </div>

    <!-- Keine Aktivitäten Fallback -->
    <div v-if="articles.length === 0" class="empty-state">
      <div class="empty-icon">📚</div>
      <p>Du hast noch keine Artikel gelesen. Entdecke jetzt neue Inhalte!</p>
      <button class="discover-button" @click="$emit('discover')">
        <span class="button-icon">🔍</span>
        Entdecken
      </button>
    </div>

    <!-- Liste der aktuellen Artikel mit Kapitel/Seiten-Angabe -->
    <div v-else class="article-progress-list">
      <div v-for="(article, index) in articles" :key="index" class="progress-item"
        @click="$emit('open-article', article)">
        <!-- Artikel-Bild -->
        <div class="article-thumbnail">
          <img v-if="article.coverImage" :src="article.coverImage" :alt="article.title" />
          <div v-else class="image-placeholder">
            <span class="placeholder-icon">📖</span>
          </div>
          <!-- Status-Badge -->
          <div class="status-badge" :class="getStatusClass(article)">
            {{ getStatusText(article) }}
          </div>
        </div>

        <div class="progress-content">
          <div class="progress-info">
            <h4>{{ article.title }}</h4>
            <div class="progress-meta">
              <span class="meta-category">{{ article.category }}</span>
              <span class="meta-separator">•</span>
              <span class="meta-author">{{ article.author || 'Unbekannt' }}</span>
              <span class="meta-separator">•</span>
              <span class="progress-date">{{ article.lastRead }}</span>
            </div>
          </div>
          
          <!-- Fortschrittsanzeige -->
          <div class="progress-section">
            <div class="progress-details">
              <span class="chapter-label">Fortschritt:</span>
              <span class="chapter-progress">{{ article.currentChapter || 0 }}/{{ article.totalChapters || 1 }} Kapitel</span>
              <span class="progress-percentage">{{ getProgressPercentage(article) }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill"
                :style="{ width: getProgressPercentage(article) + '%' }"></div>
            </div>
          </div>
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
  coverImage?: string;
  category?: string;
  author?: string;
}

export default defineComponent({
  name: 'RecentActivities',
  props: {
    articles: {
      type: Array as PropType<Article[]>,
      required: true
    }
  },
  emits: ['view-all', 'discover', 'open-article'],
  setup() {
    const getProgressPercentage = (article: Article) => {
      if (!article.currentChapter || !article.totalChapters) return 0;
      return Math.round((article.currentChapter / article.totalChapters) * 100);
    };

    const getStatusClass = (article: Article) => {
      const percentage = getProgressPercentage(article);
      if (percentage === 0) return 'not-started';
      if (percentage < 30) return 'just-started';
      if (percentage < 70) return 'in-progress';
      if (percentage < 100) return 'almost-done';
      return 'completed';
    };

    const getStatusText = (article: Article) => {
      const percentage = getProgressPercentage(article);
      if (percentage === 0) return 'Neu';
      if (percentage < 30) return 'Begonnen';
      if (percentage < 70) return 'Läuft';
      if (percentage < 100) return 'Fast fertig';
      return 'Abgeschlossen';
    };

    return {
      getProgressPercentage,
      getStatusClass,
      getStatusText
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;

// Container-Styles
.section-container {
  padding: map.get(vars.$spacing, xl);
  border-radius: map.get(map.get(vars.$layout, border-radius), large);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, card-bg);
      border: 1px solid mixins.theme-color($theme, border-light);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
                  0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
  }

  // Sektionsüberschrift
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: map.get(vars.$spacing, xl);

    h3 {
      font-size: map.get(map.get(vars.$fonts, sizes), xl);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      margin: 0;
      position: relative;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);

          &::after {
            content: '';
            position: absolute;
            width: 50px;
            height: 4px;
            bottom: -10px;
            left: 0;
            background: mixins.theme-gradient($theme, primary);
            border-radius: 2px;
          }
        }
      }
    }

    .view-all-button {
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, xs);
      background: none;
      border: none;
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      cursor: pointer;
      transition: all 0.3s ease;
      padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);

      .arrow-icon {
        font-size: 1.2em;
        transition: transform 0.3s ease;
      }

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, primary);

          &:hover {
            background-color: mixins.theme-color($theme, hover-color);
            
            .arrow-icon {
              transform: translateX(3px);
            }
          }
        }
      }
    }
  }

  // Leerer Zustand
  .empty-state {
    text-align: center;
    padding: map.get(vars.$spacing, xxl) 0;

    .empty-icon {
      font-size: 4rem;
      margin-bottom: map.get(vars.$spacing, l);
      opacity: 0.8;
      animation: float 3s ease-in-out infinite;
    }

    p {
      margin-bottom: map.get(vars.$spacing, l);
      font-size: map.get(map.get(vars.$fonts, sizes), medium);
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }

    .discover-button {
      display: inline-flex;
      align-items: center;
      gap: map.get(vars.$spacing, s);
      padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      border: none;
      cursor: pointer;
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      .button-icon {
        font-size: 1.2rem;
      }

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, primary);
          color: white;

          &:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 20px -5px rgba(53, 204, 208, 0.3); // fallback color, replace with your primary color's RGB
            // If you have a CSS variable for the primary color in RGB, use:
            // box-shadow: 0 10px 20px -5px rgba(var(--color-primary-rgb), 0.3);
          }
        }
      }
    }
  }
}

// Aktivitäten-Liste
.recent-activities {
  .article-progress-list {
    display: flex;
    flex-direction: column;
    gap: map.get(vars.$spacing, m);

    .progress-item {
      display: flex;
      gap: map.get(vars.$spacing, l);
      padding: map.get(vars.$spacing, l);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

      @media (max-width: 768px) {
        padding: map.get(vars.$spacing, m);
        gap: map.get(vars.$spacing, m);
      }

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          border: 1px solid mixins.theme-color($theme, border-light);

          &:hover {
            background-color: mixins.theme-color($theme, hover-color);
            transform: translateX(8px);
            border-color: mixins.theme-color($theme, primary);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

            .article-thumbnail img {
              transform: scale(1.05);
            }
          }
        }
      }

      // Artikel-Thumbnail
      .article-thumbnail {
        position: relative;
        flex-shrink: 0;
        width: 120px;
        height: 90px;
        border-radius: map.get(map.get(vars.$layout, border-radius), small);
        overflow: hidden;

        @media (max-width: 576px) {
          width: 80px;
          height: 60px;
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background: mixins.theme-gradient($theme, secondary);
            }
          }

          .placeholder-icon {
            font-size: 2rem;
            opacity: 0.7;
          }
        }

        // Status-Badge
        .status-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          padding: 4px 10px;
          border-radius: map.get(map.get(vars.$layout, border-radius), pill);
          font-size: 11px;
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
          backdrop-filter: blur(10px);
          text-transform: uppercase;
          letter-spacing: 0.05em;

          &.not-started {
            background-color: rgba(108, 117, 125, 0.9);
            color: white;
          }

          &.just-started {
            background-color: rgba(249, 202, 36, 0.9);
            color: white;
          }

          &.in-progress {
            background-color: rgba(53, 204, 208, 0.9);
            color: white;
          }

          &.almost-done {
            background-color: rgba(74, 210, 149, 0.9);
            color: white;
          }

          &.completed {
            background-color: rgba(155, 225, 93, 0.9);
            color: white;
          }
        }
      }

      // Fortschritts-Inhalt
      .progress-content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .progress-info {
          margin-bottom: map.get(vars.$spacing, s);

          h4 {
            font-size: map.get(map.get(vars.$fonts, sizes), medium);
            font-weight: map.get(map.get(vars.$fonts, weights), bold);
            margin: 0 0 map.get(vars.$spacing, xs) 0;
            line-height: 1.3;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-primary);
              }
            }
          }

          .progress-meta {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: map.get(vars.$spacing, xs);
            font-size: map.get(map.get(vars.$fonts, sizes), small);

            @media (max-width: 768px) {
              font-size: 12px;
            }

            .meta-category {
              font-weight: map.get(map.get(vars.$fonts, weights), bold);
              text-transform: uppercase;
              letter-spacing: 0.05em;

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, primary);
                }
              }
            }

            .meta-author {
              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, text-secondary);
                }
              }
            }

            .progress-date {
              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, text-tertiary);
                }
              }
            }

            .meta-separator {
              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, text-tertiary);
                  opacity: 0.5;
                }
              }
            }
          }
        }

        // Fortschrittsbereich
        .progress-section {
          .progress-details {
            display: flex;
            align-items: center;
            gap: map.get(vars.$spacing, s);
            margin-bottom: map.get(vars.$spacing, xs);
            font-size: map.get(map.get(vars.$fonts, sizes), small);

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
                  color: mixins.theme-color($theme, primary);
                }
              }
            }

            .progress-percentage {
              margin-left: auto;
              font-weight: map.get(map.get(vars.$fonts, weights), bold);

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, accent-green);
                }
              }
            }
          }

          .progress-bar {
            height: 8px;
            border-radius: 4px;
            overflow: hidden;
            position: relative;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background-color: mixins.theme-color($theme, border-light);
              }
            }

            .progress-fill {
              height: 100%;
              border-radius: 4px;
              transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);

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
  }
}

// Animationen
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>