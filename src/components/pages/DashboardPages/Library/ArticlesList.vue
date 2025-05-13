<!-- src/components/pages/DashboardPages/Library/ArticlesList.vue -->
<template>
  <div class="list-view">
    <div v-for="article in articles" :key="article.id" class="article-list-item" @click="openArticle(article)">
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
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

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
  name: 'ArticlesList',
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

.list-view {
  display: flex;
  flex-direction: column;
  gap: map.get(vars.$spacing, m);

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
</style>