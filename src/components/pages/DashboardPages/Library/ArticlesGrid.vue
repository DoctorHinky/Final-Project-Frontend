<!-- src/components/pages/DashboardPages/Library/ArticlesGrid.vue -->
<template>
  <div class="grid-view">
    <div v-for="article in articles" :key="article.id" class="article-card" @click="openArticle(article)">
      <!-- Artikel-Bild -->
      <div class="article-image">
        <img v-if="article.coverImage" :src="article.coverImage" :alt="article.title" />
        <div v-else class="image-placeholder">
          <span class="placeholder-icon">📚</span>
        </div>
        <!-- Schwierigkeitsgrad-Badge -->
        <div class="difficulty-badge" :class="article.difficulty || 'medium'">
          {{ getDifficultyText(article.difficulty) }}
        </div>
        <!-- Zertifizierter Autor Badge -->
        <div v-if="article.isCertifiedAuthor" class="certified-badge">
          ✓ Zertifiziert
        </div>
      </div>

      <div class="card-content">
        <!-- Meta-Informationen -->
        <div class="article-meta">
          <span class="meta-category">{{ article.category }}</span>
          <span class="meta-separator">•</span>
          <span class="meta-author">{{ article.author }}</span>
          <span class="meta-separator">•</span>
          <span class="meta-date">{{ article.date }}</span>
        </div>

        <!-- Titel -->
        <h3 class="article-title">{{ article.title }}</h3>
        
        <!-- Beschreibung -->
        <p class="article-preview">{{ article.preview }}</p>

        <!-- Lesezeit -->
        <div class="read-time-info">
          <span class="read-time-icon">⏱</span>
          <span class="read-time-text">{{ article.readTime || '10 min' }} Lesezeit</span>
        </div>

        <!-- Tags -->
        <div class="article-tags">
          <span v-for="(tag, idx) in article.tags" :key="idx" class="article-tag" @click.stop="addTag(tag)">
            {{ tag }}
          </span>
        </div>

        <!-- Aktionsbuttons -->
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
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

interface LibraryArticle {
  id: string;
  title: string;
  preview: string;
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
  isCertifiedAuthor: boolean;
  createdAt: string;
}

export default defineComponent({
  name: 'ArticlesGrid',
  props: {
    articles: {
      type: Array as PropType<LibraryArticle[]>,
      required: true
    }
  },
  emits: ['open-article', 'toggle-bookmark', 'add-tag'],
  setup(_, { emit }) {
    const openArticle = (article: LibraryArticle) => {
      emit('open-article', article);
    };

    const toggleBookmark = (article: LibraryArticle) => {
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
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: map.get(vars.$spacing, xl);

  @media (max-width: 992px) {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: map.get(vars.$spacing, l);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }

  .article-card {
    position: relative;
    border-radius: map.get(map.get(vars.$layout, border-radius), large);
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    overflow: hidden;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        border: 1px solid mixins.theme-color($theme, border-light);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
                    0 2px 4px -1px rgba(0, 0, 0, 0.06);

        &:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 
                      0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border-color: transparent;

          .article-image img {
            transform: scale(1.1);
          }
        }
      }
    }

    // Artikel-Bild
    .article-image {
      position: relative;
      width: 100%;
      height: 220px;
      overflow: hidden;

      @media (max-width: 768px) {
        height: 180px;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .image-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: linear-gradient(135deg, 
              mixins.theme-color($theme, primary) 0%, 
              mixins.theme-color($theme, accent-teal) 100%);
          }
        }

        &::before {
          content: '';
          position: absolute;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: shimmer 3s infinite;
        }

        .placeholder-icon {
          font-size: 4rem;
          opacity: 0.8;
          z-index: 1;

          @media (max-width: 768px) {
            font-size: 3rem;
          }
        }
      }

      // Schwierigkeitsgrad-Badge
      .difficulty-badge {
        position: absolute;
        top: 15px;
        right: 15px;
        padding: 6px 14px;
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        font-size: 11px;
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        backdrop-filter: blur(10px);
        text-transform: uppercase;
        letter-spacing: 0.05em;

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

      // Zertifizierter Autor Badge
      .certified-badge {
        position: absolute;
        top: 15px;
        left: 15px;
        padding: 4px 10px;
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        font-size: 10px;
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        backdrop-filter: blur(10px);
        background-color: rgba(74, 210, 149, 0.9);
        color: white;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    }

    // Karten-Inhalt
    .card-content {
      padding: map.get(vars.$spacing, l);
      display: flex;
      flex-direction: column;
      flex-grow: 1;

      @media (max-width: 768px) {
        padding: map.get(vars.$spacing, m);
      }
    }

    // Meta-Informationen
    .article-meta {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: map.get(vars.$spacing, xs);
      margin-bottom: map.get(vars.$spacing, m);
      font-size: map.get(map.get(vars.$fonts, sizes), small);

      @media (max-width: 768px) {
        font-size: 12px;
        margin-bottom: map.get(vars.$spacing, s);
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
      margin-bottom: map.get(vars.$spacing, m);
      font-size: map.get(map.get(vars.$fonts, sizes), xl);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      line-height: 1.3;

      @media (max-width: 768px) {
        font-size: map.get(map.get(vars.$fonts, sizes), large);
        margin-bottom: map.get(vars.$spacing, s);
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
      -webkit-line-clamp: 3;
      line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex-grow: 1;
      line-height: 1.6;

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

    // Lesezeit-Info
    .read-time-info {
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, xs);
      margin-bottom: map.get(vars.$spacing, m);
      font-size: map.get(map.get(vars.$fonts, sizes), small);

      .read-time-icon {
        font-size: 1rem;
        opacity: 0.7;
      }

      .read-time-text {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-tertiary);
          }
        }
      }
    }

    // Tags
    .article-tags {
      display: flex;
      flex-wrap: wrap;
      gap: map.get(vars.$spacing, xs);
      margin-bottom: map.get(vars.$spacing, m);

      .article-tag {
        padding: 4px 12px;
        border-radius: map.get(map.get(vars.$layout, border-radius), small);
        font-size: 12px;
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        transition: all 0.2s;
        cursor: pointer;

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

    // Aktionsbuttons
    .article-actions {
      display: flex;
      gap: map.get(vars.$spacing, s);
      margin-top: auto;

      .action-button {
        height: 45px;
        padding: 0 map.get(vars.$spacing, l);
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;

        @media (max-width: 768px) {
          height: 40px;
          padding: 0 map.get(vars.$spacing, m);
          font-size: 12px;
        }

        &.read {
          flex: 1;
          position: relative;
          overflow: hidden;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background: mixins.theme-gradient($theme, primary);
              color: white;

              &::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
                transform: translate(-50%, -50%);
                transition: width 0.6s, height 0.6s;
              }

              &:hover {
                transform: translateY(-2px);

                &::before {
                  width: 300px;
                  height: 300px;
                }
              }
            }
          }
        }

        &.bookmark {
          width: 50px;
          font-size: 1.2rem;

          @media (max-width: 768px) {
            width: 45px;
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

// Animation für Shimmer-Effekt
@keyframes shimmer {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}
</style>