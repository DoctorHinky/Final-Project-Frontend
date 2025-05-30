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
      <div class="favorite-list-main">
        <div class="favorite-list-header">
          <div class="favorite-category">{{ favorite.category }}</div>
          <div class="favorite-meta">
            <span class="favorite-date">{{ favorite.date }}</span>
            <span class="favorite-author">{{ favorite.author }}</span>
          </div>
        </div>
        <h3 class="favorite-title">{{ favorite.title }}</h3>
        <p class="favorite-excerpt">{{ favorite.preview }}</p>
      </div>
      <div class="favorite-list-actions">
        <button class="action-button read" @click.stop="readFavorite(favorite)">Lesen</button>
        <button class="action-button remove" @click.stop="confirmRemove(favorite)">Entfernen</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { Favorite } from '@/types/Favorite';

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

    return {
      selectFavorite,
      readFavorite,
      confirmRemove
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
}

// Listenelement-Stile
.favorite-list-item {
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

      &.active {
        border-color: mixins.theme-color($theme, accent-green);
        border-width: 2px;
        @include mixins.shadow('small', $theme);
      }
    }
  }

  .favorite-list-main {
    flex: 1;
    padding-right: map.get(vars.$spacing, l);

    .favorite-list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: map.get(vars.$spacing, s);

      .favorite-category {
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

      .favorite-meta {
        display: flex;
        gap: map.get(vars.$spacing, m);
        font-size: map.get(map.get(vars.$fonts, sizes), small);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-tertiary);
          }
        }

        .favorite-author {
          font-weight: map.get(map.get(vars.$fonts, weights), medium);
        }
      }
    }

    .favorite-title {
      margin-bottom: map.get(vars.$spacing, s);
      font-size: map.get(map.get(vars.$fonts, sizes), large);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    .favorite-excerpt {
      font-size: map.get(map.get(vars.$fonts, sizes), medium);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  .favorite-list-actions {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: map.get(vars.$spacing, s);
  }

  // Responsive-Anpassungen für die Listenansicht
  @media (max-width: 768px) {
    flex-direction: column;

    .favorite-list-main {
      padding-right: 0;
      margin-bottom: map.get(vars.$spacing, m);
    }

    .favorite-list-actions {
      flex-direction: row;
      justify-content: flex-start;
    }
  }
}

// Gemeinsame Stile für Aktionsschaltflächen
.action-button {
  padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, m);
  border-radius: map.get(map.get(vars.$layout, border-radius), pill);
  font-size: map.get(map.get(vars.$fonts, sizes), small);
  font-weight: map.get(map.get(vars.$fonts, weights), medium);
  cursor: pointer;
  transition: all 0.4s ease-out;
  border: none;

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

  &.remove {
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: transparent;
        color: #ff6b6b;
        border: 1px solid rgba(255, 107, 107, 0.3);

        &:hover {
          background-color: rgba(255, 107, 107, 0.1);
          border-color: rgba(255, 107, 107, 0.5);
        }
      }
    }
  }
}
</style>