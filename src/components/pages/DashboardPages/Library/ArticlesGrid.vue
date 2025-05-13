<!-- src/components/pages/DashboardPages/Library/ArticlesGrid.vue -->
<template>
  <div class="grid-view">
    <div v-for="article in articles" :key="article.id" class="article-card" @click="openArticle(article)">
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
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

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
  name: 'ArticlesGrid',
  props: {
    articles: {
      type: Array as PropType<Article[]>,
      required: true
    }
  },
  emits: ['open-article', 'toggle-bookmark', 'add-tag'],
  setup(_, { emit }) {
    const openArticle = (article: Article) => {
      emit('open-article', article);
    };

    const toggleBookmark = (article: Article) => {
      emit('toggle-bookmark', article);
    };

    const addTag = (tag: string) => {
      emit('add-tag', tag);
    };

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
      openArticle,
      toggleBookmark,
      addTag,
      getDifficultyText
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;

.grid-view {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: map.get(vars.$spacing, l);

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
}
</style>