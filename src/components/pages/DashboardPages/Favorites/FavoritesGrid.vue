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
      <div class="favorite-category">{{ favorite.category }}</div>
      <div class="favorite-content">
        <h3>{{ favorite.title }}</h3>
        <p class="favorite-excerpt">{{ favorite.preview }}</p>
        <div class="favorite-meta">
          <span class="favorite-date">{{ favorite.date }}</span>
          <span class="favorite-author">{{ favorite.author }}</span>
        </div>
      </div>
      <div class="favorite-actions">
        <button class="action-button read" @click.stop="readFavorite(favorite)">Lesen</button>
        <button class="action-button remove" @click.stop="confirmRemove(favorite)">Entfernen</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

interface Favorite {
  id: number;
  title: string;
  preview: string;
  category: string;
  author: string;
  date: string;
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

.grid-view {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: map.get(vars.$spacing, l);
}

// Karten-Stile für Rasteransicht
.favorite-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: map.get(vars.$spacing, l);
  border-radius: map.get(map.get(vars.$layout, border-radius), medium);
  transition: all 0.3s;
  width: 500px;

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

      &.active {
        border-color: mixins.theme-color($theme, accent-green);
        border-width: 2px;
        @include mixins.shadow('medium', $theme);
      }
    }
  }

  .favorite-category {
    align-self: flex-start;
    padding: 4px 12px;
    border-radius: map.get(map.get(vars.$layout, border-radius), pill);
    font-size: map.get(map.get(vars.$fonts, sizes), small);
    font-weight: map.get(map.get(vars.$fonts, weights), bold);

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background: mixins.theme-gradient($theme, primary);
        color: white;
      }
    }
  }

  .favorite-content {
    margin-top: map.get(vars.$spacing, m);
    flex: 1;

    h3 {
      margin-top: map.get(vars.$spacing, xs);
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
        }
      }
    }

    .favorite-meta {
      display: flex;
      justify-content: space-between;
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

  .favorite-actions {
    display: flex;
    gap: map.get(vars.$spacing, s);
    margin-top: map.get(vars.$spacing, m);
    justify-content: flex-end;
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