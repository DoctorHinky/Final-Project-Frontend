<!-- src/components/pages/DashboardPages/Library/ArticlesList.vue -->
<template>
  <div class="list-view">
    <div v-for="article in articles" :key="article.id" class="article-list-item" @click="openArticle(article)">
      <!-- Artikel-Bild -->
      <div class="list-item-image">
        <img v-if="article.coverImage" :src="article.coverImage" :alt="article.title" />
        <div v-else class="image-placeholder">
          <span class="placeholder-icon">📚</span>
        </div>
        <!-- Schwierigkeitsgrad-Badge -->
        <div class="difficulty-badge" :class="article.difficulty || 'medium'">
          {{ getDifficultyShort(article.difficulty) }}
        </div>
      </div>

      <div class="list-item-main">
        <!-- Meta-Informationen -->
        <div class="article-meta">
          <span class="meta-category">{{ article.category }}</span>
          <span class="meta-separator">•</span>
          <span class="meta-author">{{ article.author }}</span>
          <span class="meta-separator">•</span>
          <span class="meta-date">{{ article.date }}</span>
          <span class="meta-separator">•</span>
          <span class="meta-readtime">
            <span class="read-time-icon">⏱</span>
            {{ article.readTime || '10 min' }}
          </span>
        </div>

        <h3 class="article-title">{{ article.title }}</h3>
        <p class="article-preview">{{ article.preview }}</p>

        <!-- Tags -->
        <div class="article-tags">
          <span v-for="(tag, idx) in article.tags" :key="idx" class="article-tag" @click.stop="addTag(tag)">
            {{ tag }}
          </span>
        </div>
      </div>

      <div class="list-item-actions">
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
  coverImage?: string;
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

    const getDifficultyShort = (difficulty?: string) => {
      switch (difficulty) {
        case 'easy':
          return 'E';
        case 'medium':
          return 'M';
        case 'hard':
          return 'F';
        default:
          return 'M';
      }
    };

    return {
      openArticle,
      toggleBookmark,
      addTag,
      getDifficultyShort
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

  .article-list-item {
    display: flex;
    justify-content: space-between;
    padding: map.get(vars.$spacing, l);
    border-radius: map.get(map.get(vars.$layout, border-radius), large);
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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
        box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.06);

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
                      0 4px 6px -2px rgba(0, 0, 0, 0.05);
          border-color: transparent;

          .list-item-image img {
            transform: scale(1.05);
          }
        }
      }
    }

    // Artikel-Bild
    .list-item-image {
      flex-shrink: 0;
      width: 180px;
      height: 135px;
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      overflow: hidden;
      position: relative;

      @media (max-width: 768px) {
        width: 150px;
        height: 110px;
      }

      @media (max-width: 576px) {
        width: 100%;
        height: 200px;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .image-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: linear-gradient(135deg, 
              mixins.theme-color($theme, primary) 0%, 
              mixins.theme-color($theme, accent-teal) 100%);
          }
        }

        .placeholder-icon {
          font-size: 3rem;
          opacity: 0.8;
        }
      }

      // Schwierigkeitsgrad-Badge (kompakt für Listen)
      .difficulty-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        backdrop-filter: blur(10px);

        &.easy {
          background-color: rgba(74, 210, 149, 0.9);
          color: white;
        }

        &.medium {
          background-color: rgba(53, 204, 208, 0.9);
          color: white;
        }

        &.hard {
          background-color: rgba(255, 107, 107, 0.9);
          color: white;
        }
      }
    }

    .list-item-main {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;

      // Meta-Informationen
      .article-meta {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: map.get(vars.$spacing, xs);
        margin-bottom: map.get(vars.$spacing, s);
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

        .meta-date {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-tertiary);
            }
          }
        }

        .meta-readtime {
          display: flex;
          align-items: center;
          gap: 3px;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-tertiary);
            }
          }

          .read-time-icon {
            font-size: 0.9rem;
            opacity: 0.7;
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

      .article-title {
        margin-bottom: map.get(vars.$spacing, s);
        font-size: map.get(map.get(vars.$fonts, sizes), large);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        line-height: 1.3;

        @media (max-width: 768px) {
          font-size: map.get(map.get(vars.$fonts, sizes), medium);
        }

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }

      .article-preview {
        font-size: map.get(map.get(vars.$fonts, sizes), medium);
        margin-bottom: map.get(vars.$spacing, m);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        line-height: 1.5;

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

      .article-tags {
        display: flex;
        flex-wrap: wrap;
        gap: map.get(vars.$spacing, xs);

        .article-tag {
          padding: 4px 12px;
          border-radius: map.get(map.get(vars.$layout, border-radius), small);
          font-size: 12px;
          font-weight: map.get(map.get(vars.$fonts, weights), medium);
          transition: all 0.2s;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
              color: mixins.theme-color($theme, text-secondary);
              border: 1px solid transparent;

              &:hover {
                background-color: mixins.theme-color($theme, primary);
                color: white;
                transform: translateY(-2px);
              }
            }
          }
        }
      }
    }

    // Aktionsschaltflächen
    .list-item-actions {
      display: flex;
      flex-direction: column;
      gap: map.get(vars.$spacing, s);
      align-self: center;

      @media (max-width: 576px) {
        flex-direction: row;
        width: 100%;
        margin-top: map.get(vars.$spacing, m);
      }

      .action-button {
        height: 40px;
        padding: 0 map.get(vars.$spacing, l);
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: none;
        white-space: nowrap;
        display: flex;
        align-items: center;
        justify-content: center;

        @media (max-width: 768px) {
          padding: 0 map.get(vars.$spacing, m);
          font-size: 12px;
          height: 36px;
        }

        @media (max-width: 576px) {
          flex: 1;
        }

        &.read {
          min-width: 100px;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background: mixins.theme-gradient($theme, primary);
              color: white;

              &:hover {
                transform: translateY(-2px);
              }
            }
          }
        }

        &.bookmark {
          width: 50px;
          font-size: 1.2rem;

          @media (max-width: 576px) {
            width: 50px;
            flex: 0 0 50px;
          }

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
              color: mixins.theme-color($theme, text-secondary);
              border: 2px solid mixins.theme-color($theme, border-light);

              &:hover {
                background-color: mixins.theme-color($theme, hover-color);
                border-color: mixins.theme-color($theme, accent-yellow);
                color: mixins.theme-color($theme, accent-yellow);
                transform: translateY(-2px);
              }

              &.active {
                background-color: mixins.theme-color($theme, accent-yellow);
                color: white;
                border-color: mixins.theme-color($theme, accent-yellow);
              }
            }
          }
        }
      }
    }
  }
}
</style>