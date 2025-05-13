<!-- src/components/pages/DashboardPages/Favorites/EmptyState.vue -->
<template>
  <div class="empty-state">
    <div class="empty-icon">⭐</div>
    <h3>Keine Favoriten gefunden</h3>
    <p>Du hast noch keine Artikel als Favoriten gespeichert oder deine Suche ergab keine Treffer.</p>
    <button v-if="searchQuery" @click="clearSearch" class="reset-button">Suche zurücksetzen</button>
    <button v-else @click="browseArticles" class="reset-button">Artikel durchstöbern</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'EmptyState',
  props: {
    searchQuery: {
      type: String,
      required: true
    }
  },
  emits: ['clear-search', 'browse-articles'],
  setup(_, { emit }) {
    const clearSearch = () => {
      emit('clear-search');
    };

    const browseArticles = () => {
      emit('browse-articles');
    };

    return {
      clearSearch,
      browseArticles
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;

// Leerer Zustand
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: map.get(vars.$spacing, xxl);
  text-align: center;

  .empty-icon {
    font-size: 4rem;
    margin-bottom: map.get(vars.$spacing, l);
    opacity: 0.5;
  }

  h3 {
    font-size: map.get(map.get(vars.$fonts, sizes), xl);
    margin-bottom: map.get(vars.$spacing, m);

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
      }
    }
  }

  p {
    font-size: map.get(map.get(vars.$fonts, sizes), medium);
    margin-bottom: map.get(vars.$spacing, l);
    max-width: 500px;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
      }
    }
  }

  .reset-button {
    padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
    border-radius: map.get(map.get(vars.$layout, border-radius), pill);
    font-weight: map.get(map.get(vars.$fonts, weights), medium);
    border: none;
    cursor: pointer;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background: mixins.theme-gradient($theme, primary);
        color: white;
        transition: all 0.4s ease-out;

        &:hover {
          transform: translateY(-3px);
          @include mixins.shadow('medium', $theme);
        }
      }
    }
  }
}
</style>