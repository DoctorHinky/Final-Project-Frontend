<!-- src/components/pages/DashboardPages/Favorites/FavoritesGrid.vue -->
<template>
  <div class="grid-view">
    <div 
      v-for="favorite in filteredFavorites" 
      :key="favorite.id" 
      class="favorite-card"
      :class="{ active: selectedFavorite && selectedFavorite.id === favorite.id }"
      @click="selectFavorite(favorite)"
    >
      <!-- Artikel-Bild -->
      <div class="favorite-image">
        <img v-if="favorite.coverImage" :src="favorite.coverImage" :alt="favorite.title" />
        <div v-else class="image-placeholder">
          <span class="placeholder-icon">⭐</span>
        </div>
        <!-- Favorit-Badge -->
        <div class="favorite-badge">
          <span class="badge-icon">⭐</span>
        </div>
      </div>

      <div class="card-content">
        <!-- Meta-Informationen -->
        <div class="favorite-meta">
          <span class="meta-category">{{ favorite.category }}</span>
          <span class="meta-separator">•</span>
          <span class="meta-author">{{ favorite.author }}</span>
          <span class="meta-separator">•</span>
          <span class="meta-date">{{ favorite.date || 'Kein Datum' }}</span>
        </div>

        <!-- Titel -->
        <h3 class="favorite-title">{{ favorite.title }}</h3>
        
        <!-- Beschreibung -->
        <p class="favorite-excerpt">{{ favorite.preview }}</p>

        <!-- Tags wenn vorhanden -->
        <div v-if="favorite.tags && favorite.tags.length" class="favorite-tags">
          <span v-for="(tag, idx) in favorite.tags" :key="idx" class="favorite-tag">
            {{ tag }}
          </span>
        </div>

        <!-- Aktionsbuttons -->
        <div class="favorite-actions">
          <button class="action-button read" @click.stop="readFavorite(favorite)">
            Lesen
          </button>
          <button class="action-button remove" @click.stop="confirmRemove(favorite)">
            Entfernen
          </button>
        </div>
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
  name: 'FavoritesGrid',
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

  .favorite-card {
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

          .favorite-image img {
            transform: scale(1.1);
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
    .favorite-image {
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
              mixins.theme-color($theme, accent-yellow) 0%, 
              darken(mixins.theme-color($theme, accent-yellow), 10%) 100%);
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
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));

          @media (max-width: 768px) {
            font-size: 3rem;
          }
        }
      }

      // Favorit-Badge
      .favorite-badge {
        position: absolute;
        top: 15px;
        right: 15px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
        background-color: rgba(249, 202, 36, 0.9);
        box-shadow: 0 4px 12px rgba(249, 202, 36, 0.4);

        .badge-icon {
          font-size: 1.2rem;
          color: white;
        }
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
    .favorite-meta {
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

    .favorite-title {
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

    .favorite-excerpt {
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

    // Tags
    .favorite-tags {
      display: flex;
      flex-wrap: wrap;
      gap: map.get(vars.$spacing, xs);
      margin-bottom: map.get(vars.$spacing, m);

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

    // Aktionsbuttons
    .favorite-actions {
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
        gap: map.get(vars.$spacing, xs);

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

        &.remove {
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