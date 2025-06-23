<!-- src/components/pages/DashboardPages/Overview/RecentActivities.vue -->
<template>
  <div class="section-container recent-activities">
    <div class="section-header">
      <div class="header-content">
        <h3>
          <BookOpenIcon class="icon" />
          Zuletzt gelesen
        </h3>
        <div class="header-subtitle">Setze deine Lernreise fort</div>
      </div>
      <button @click="$emit('view-all')" class="view-all-btn">
        Alle anzeigen
        <ChevronRightIcon class="arrow-icon" />
      </button>
    </div>

    <div v-if="articles.length > 0" class="articles-list">
      <article
        v-for="article in articles"
        :key="article.id"
        class="article-card"
        @click="$emit('open-article', article)"
      >
        <div class="article-content">
          <div class="article-header">
            <span :class="['status-badge', `status-${article.status}`]">
              {{ getStatusLabel(article.status) }}
            </span>
            <span class="last-read">{{ article.lastRead }}</span>
          </div>

          <h4 class="article-title">{{ article.title }}</h4>

          <div class="article-meta">
            <span class="category">
              <FolderIcon class="meta-icon" />
              {{ article.category }}
            </span>
            <span class="author">
              <UserIcon class="meta-icon" />
              {{ article.author?.username }}
            </span>
          </div>

          <div class="progress-section">
            <div class="progress-info">
              <span class="chapter-info"> Kapitel {{ article.currentChapter }} von {{ article.totalChapters }} </span>
            </div>

            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: getProgressWidth(article.currentChapter, article.totalChapters) }"
                :class="{ 'almost-complete': isAlmostComplete(article.currentChapter, article.totalChapters) }"
              >
                <span class="progress-glow"></span>
              </div>
            </div>
          </div>
        </div>

        <div class="article-action">
          <span class="continue-reading">
            Weiterlesen
            <ArrowRightIcon class="arrow-icon" />
          </span>
        </div>
      </article>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">
        <BookOpenIcon />
      </div>
      <h3>Keine kürzlich gelesenen Artikel</h3>
      <p>Entdecke spannende Artikel und beginne deine Lernreise!</p>
      <button @click="$emit('discover')" class="discover-btn">Artikel entdecken</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import {
  BookOpenIcon,
  ChevronRightIcon,
  FolderIcon,
  UserIcon,
  ClockIcon,
  ArrowRightIcon,
} from "@heroicons/vue/24/outline";

export interface RecentArticle {
  id: string;
  title: string;
  category?: string;
  author?: {
    username: string;
  };
  date?: string;
  status?: string;
  currentChapter?: number;
  totalChapters?: number;
  lastRead?: string;
}

export default defineComponent({
  name: "RecentActivities",
  components: {
    BookOpenIcon,
    ChevronRightIcon,
    FolderIcon,
    UserIcon,
    ClockIcon,
    ArrowRightIcon,
  },
  props: {
    articles: {
      type: Array as PropType<RecentArticle[]>,
      required: true,
    },
  },
  emits: ["view-all", "discover", "open-article"],

  methods: {
    getStatusLabel(status?: string): string {
      const labels: Record<string, string> = {
        "in-progress": "In Bearbeitung",
        "just-started": "Gerade begonnen",
        "almost-done": "Fast fertig",
      };
      return labels[status || ""] || "Neu";
    },

    getProgressWidth(current?: number, total?: number): string {
      if (!current || !total) return "0%";
      const percentage = (current / total) * 100;
      return `${Math.min(percentage, 100)}%`;
    },

    isAlmostComplete(current?: number, total?: number): boolean {
      if (!current || !total) return false;
      return current / total >= 0.8;
    },
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;

// Container-Styles
.section-container {
  padding: map.get(vars.$spacing, xl);
  border-radius: map.get(map.get(vars.$layout, border-radius), large);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, card-bg);
      border: 1px solid mixins.theme-color($theme, border-light);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
  }

  // Section Header
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: map.get(vars.$spacing, xl);

    .header-content {
      display: flex;
      flex-direction: column;
      gap: map.get(vars.$spacing, xs);
    }

    h3 {
      font-size: map.get(map.get(vars.$fonts, sizes), xl);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      margin: 0;
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, s);
      position: relative;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }

      .icon {
        width: 28px;
        height: 28px;
        flex-shrink: 0;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, primary);
          }
        }
      }

      &::after {
        content: "";
        position: absolute;
        width: 50px;
        height: 4px;
        bottom: -10px;
        left: 0;
        border-radius: 2px;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: mixins.theme-gradient($theme, primary);
          }
        }
      }
    }

    .header-subtitle {
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      margin-top: map.get(vars.$spacing, s);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }

    .view-all-btn {
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, xs);
      padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);
      border: none;
      background: none;
      cursor: pointer;
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      transition: all 0.3s ease;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, primary);

          &:hover {
            color: mixins.theme-color($theme, primary-hover);

            .arrow-icon {
              transform: translateX(3px);
            }
          }
        }
      }

      .arrow-icon {
        width: 16px;
        height: 16px;
        transition: transform 0.3s ease;
      }
    }
  }
}

// Recent Activities Specific Styles
.recent-activities {
  // Articles List
  .articles-list {
    display: flex;
    flex-direction: column;
    gap: map.get(vars.$spacing, m);
  }

  // Article Card
  .article-card {
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);
    padding: map.get(vars.$spacing, l);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: map.get(vars.$spacing, l);

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, secondary-bg);
        border: 1px solid mixins.theme-color($theme, border-light);

        &:hover {
          transform: translateX(8px);
          border-color: mixins.theme-color($theme, primary);
          box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.1);

          .continue-reading .arrow-icon {
            transform: translateX(5px);
          }

          .article-title {
            color: mixins.theme-color($theme, primary);
          }

          .progress-fill::after {
            opacity: 1;
          }
        }
      }
    }

    .article-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: map.get(vars.$spacing, m);
    }

    // Article Header
    .article-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: map.get(vars.$spacing, m);

      .status-badge {
        padding: 4px 12px;
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        font-size: map.get(map.get(vars.$fonts, sizes), tiny);
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        text-transform: uppercase;
        letter-spacing: 0.05em;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, accent-bg);
            color: mixins.theme-color($theme, text-secondary);
          }
        }

        &.status-in-progress {
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, warning-bg);
              color: mixins.theme-color($theme, warning);
            }
          }
        }

        &.status-just-started {
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, info-bg);
              color: mixins.theme-color($theme, info);
            }
          }
        }

        &.status-almost-done {
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, success-bg);
              color: mixins.theme-color($theme, success);
            }
          }
        }
      }

      .last-read {
        font-size: map.get(map.get(vars.$fonts, sizes), small);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-tertiary);
          }
        }
      }
    }

    // Article Title
    .article-title {
      font-size: map.get(map.get(vars.$fonts, sizes), large);
      font-weight: map.get(map.get(vars.$fonts, weights), semibold);
      margin: 0;
      transition: color 0.3s ease;
      line-height: 1.3;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    // Article Meta
    .article-meta {
      display: flex;
      flex-wrap: wrap;
      gap: map.get(vars.$spacing, l);

      > span {
        display: flex;
        align-items: center;
        gap: map.get(vars.$spacing, xs);
        font-size: map.get(map.get(vars.$fonts, sizes), small);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }

        .meta-icon {
          width: 16px;
          height: 16px;
          opacity: 0.7;
          flex-shrink: 0;
        }
      }
    }

    // Progress Section
    .progress-section {
      display: flex;
      flex-direction: column;
      gap: map.get(vars.$spacing, s);

      .progress-info {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .chapter-info {
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          font-weight: map.get(map.get(vars.$fonts, weights), medium);

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }
      }

      .progress-bar {
        position: relative;
        height: 8px;
        border-radius: map.get(map.get(vars.$layout, border-radius), full);
        overflow: hidden;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: rgba(mixins.theme-color($theme, text-tertiary), 0.15);
          }
        }
      }

      .progress-fill {
        position: relative;
        height: 100%;
        border-radius: map.get(map.get(vars.$layout, border-radius), full);
        transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: mixins.theme-gradient($theme, primary);
          }
        }

        &.almost-complete {
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background: mixins.theme-gradient($theme, success);
            }
          }
        }

        // Animated glow effect
        .progress-glow {
          position: absolute;
          top: 0;
          right: 0;
          width: 30px;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
          transform: translateX(0);
          animation: shimmer 2s infinite;
        }
      }
    }

    // Article Action
    .article-action {
      .continue-reading {
        display: flex;
        align-items: center;
        gap: map.get(vars.$spacing, xs);
        font-size: map.get(map.get(vars.$fonts, sizes), medium);
        font-weight: map.get(map.get(vars.$fonts, weights), medium);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }

        .arrow-icon {
          width: 20px;
          height: 20px;
          transition: transform 0.3s ease;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, primary);
            }
          }
        }
      }
    }
  }

  // Empty State
  .empty-state {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: map.get(vars.$spacing, m);
    padding: map.get(vars.$spacing, xxl) map.get(vars.$spacing, xl);

    .empty-icon {
      width: 64px;
      height: 64px;
      opacity: 0.3;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-tertiary);
        }
      }

      svg {
        width: 100%;
        height: 100%;
      }
    }

    h3 {
      font-size: map.get(map.get(vars.$fonts, sizes), xl);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      margin: 0;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    p {
      font-size: map.get(map.get(vars.$fonts, sizes), medium);
      margin: 0;
      max-width: 300px;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }

    .discover-btn {
      padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      border: none;
      cursor: pointer;
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      margin-top: map.get(vars.$spacing, m);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, primary);
          color: white;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.2);
          }
        }
      }
    }
  }
}

// Shimmer Animation
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(200%);
  }
}

// Responsive
@media (max-width: 768px) {
  .recent-activities {
    .section-header {
      flex-direction: column;
      gap: map.get(vars.$spacing, m);

      .view-all-btn {
        align-self: flex-start;
      }
    }

    .article-card {
      flex-direction: column;
      align-items: flex-start;
      padding: map.get(vars.$spacing, m);

      .article-action {
        align-self: flex-end;
      }
    }
  }
}

@media (max-width: 480px) {
  .recent-activities {
    .article-meta {
      gap: map.get(vars.$spacing, m);

      > span {
        font-size: map.get(map.get(vars.$fonts, sizes), tiny);
      }
    }
  }
}
</style>
