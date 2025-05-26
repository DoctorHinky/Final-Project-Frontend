<!-- src/components/pages/DashboardPages/Favorites/FavoritesList.vue -->
<template>
  <div class="list-view">
    <div 
      v-for="favorite in filteredFavorites" 
      :key="favorite.id" 
      class="favorite-list-item"
      :class="{ active: selectedFavorite && selectedFavorite.id === favorite.id }"
      @click="selectFavorite(favorite)"
    >
      <!-- Artikel-Bild -->
      <div class="list-item-image">
        <img v-if="favorite.coverImage" :src="favorite.coverImage" :alt="favorite.title" />
        <div v-else class="image-placeholder">
          <span class="placeholder-icon">⭐</span>
        </div>
        <!-- Favorit-Badge -->
        <div class="favorite-badge">
          <span class="badge-icon">⭐</span>
        </div>
      </div>

      <div class="list-item-main">
        <!-- Meta-Informationen -->
        <div class="favorite-meta">
          <span class="meta-category">{{ favorite.category }}</span>
          <span class="meta-separator">•</span>
          <span class="meta-author">{{ favorite.author }}</span>
          <span class="meta-separator">•</span>
          <span class="meta-date">{{ favorite.date || 'Kein Datum' }}</span>
        </div>

        <h3 class="favorite-title">{{ favorite.title }}</h3>
        <p class="favorite-excerpt">{{ favorite.preview }}</p>

        <!-- Tags wenn vorhanden -->
        <div v-if="favorite.tags && favorite.tags.length" class="favorite-tags">
          <span v-for="(tag, idx) in favorite.tags" :key="idx" class="favorite-tag">
            {{ tag }}
          </span>
        </div>
      </div>

      <div class="list-item-actions">
        <button class="action-button read" @click.stop="readFavorite(favorite)">
          Lesen
        </button>
        <button class="action-button remove" @click.stop="confirmRemove(favorite)">
          <span class="remove-icon">🗑️</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

interface Favorite {
  id: number;
  title: string;
  preview: string;
  content?: string;
  category: string;
  author: string;
  date: string;
  coverImage?: string;
  tags?: string[];
  currentChapter?: number;
  totalChapters?: number;
  quiz?: any;
}

export default defineComponent({
  name: 'FavoritesList',
  props: {
    filteredFavorites: {
      type: Array as PropType<Favorite[]>,
      required: true
    },
    selectedFavorite: {
      type: Object as PropType<Favorite | null>,
      default: null
    }
  },
  emits: ['select-favorite', 'read-favorite', 'confirm-remove'],
  setup(_, { emit }) {
    const selectFavorite = (favorite: Favorite) => {
      emit('select-favorite', favorite);
    };

    const readFavorite = (favorite: Favorite) => {
      emit('read-favorite', favorite);
    };

    const confirmRemove = (favorite: Favorite) => {
      emit('confirm-remove', favorite);
    };

    const formatDate = (dateString: string) => {
      if (!dateString) return 'Kein Datum';
      
      try {
        const date = new Date(dateString);
        
        // Prüfen ob das Datum gültig ist
        if (isNaN(date.getTime())) {
          return 'Ungültiges Datum';
        }
        
        return new Intl.DateTimeFormat('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).format(date);
      } catch (error) {
        console.error('Fehler beim Formatieren des Datums:', error);
        return 'Datumsfehler';
      }
    };

    return {
      selectFavorite,
      readFavorite,
      confirmRemove,
      formatDate
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

  .favorite-list-item {
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

        &.active {
          border-color: mixins.theme-color($theme, accent-yellow);
          border-width: 2px;
          box-shadow: 0 0 0 4px rgba(mixins.theme-color($theme, accent-yellow), 0.1);
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
            background: mixins.theme-color($theme, secondary-bg);
          }
        }

        .placeholder-icon {
          font-size: 3rem;
          opacity: 0.8;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
        }
      }

      // Favorit-Badge (kompakt für Listen)
      .favorite-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
        background-color: rgba(249, 202, 36, 0.9);
        box-shadow: 0 2px 8px rgba(249, 202, 36, 0.4);

        .badge-icon {
          font-size: 0.9rem;
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
      .favorite-meta {
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

        .meta-separator {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-tertiary);
              opacity: 0.5;
            }
          }
        }
      }

      .favorite-title {
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

      .favorite-excerpt {
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

      .favorite-tags {
        display: flex;
        flex-wrap: wrap;
        gap: map.get(vars.$spacing, xs);

        .favorite-tag {
          padding: 4px 12px;
          border-radius: map.get(map.get(vars.$layout, border-radius), small);
          font-size: 12px;
          font-weight: map.get(map.get(vars.$fonts, weights), medium);

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
              color: mixins.theme-color($theme, text-secondary);
              border: 1px solid transparent;
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
        gap: map.get(vars.$spacing, xs);

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

        &.remove {
          width: 50px;

          @media (max-width: 576px) {
            width: 50px;
            flex: 0 0 50px;
          }

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: rgba(255, 107, 107, 0.1);
              color: #ff6b6b;
              border: 2px solid rgba(255, 107, 107, 0.3);

              &:hover {
                background-color: rgba(255, 107, 107, 0.2);
                border-color: #ff6b6b;
                transform: translateY(-2px);
              }
            }
          }

          .remove-icon {
            font-size: 1rem;
          }
        }
      }
    }
  }
}
</style>