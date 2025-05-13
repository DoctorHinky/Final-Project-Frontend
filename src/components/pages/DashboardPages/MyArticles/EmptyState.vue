<!-- src/components/pages/DashboardPages/MyArticles/EmptyState.vue -->
<template>
  <div class="empty-state">
    <div class="empty-icon">📄</div>
    <h3>Keine Artikel gefunden</h3>
    <p>Versuche andere Suchbegriffe oder Filter.</p>
    <button @click="onResetClick" class="reset-button">Filter zurücksetzen</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'EmptyState',
  emits: ['reset-filters'],
  setup(_, { emit }) {
    const onResetClick = () => {
      emit('reset-filters');
    };

    return {
      onResetClick
    };
  }
});
</script>

<style lang="scss" scoped>
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use 'sass:map';

// Leerer Zustand
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: map.get(vars.$spacing, xxl);
  text-align: center;

  @media (max-width: 576px) {
    padding: map.get(vars.$spacing, xl) map.get(vars.$spacing, m);
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: map.get(vars.$spacing, l);
    opacity: 0.5;

    @media (max-width: 576px) {
      font-size: 3rem;
      margin-bottom: map.get(vars.$spacing, m);
    }
  }

  h3 {
    font-size: map.get(map.get(vars.$fonts, sizes), xl);
    margin-bottom: map.get(vars.$spacing, m);

    @media (max-width: 576px) {
      font-size: map.get(map.get(vars.$fonts, sizes), large);
      margin-bottom: map.get(vars.$spacing, s);
    }

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
        transition: all 0.4s ease-out;
      }
    }
  }

  p {
    font-size: map.get(map.get(vars.$fonts, sizes), medium);
    margin-bottom: map.get(vars.$spacing, l);

    @media (max-width: 576px) {
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      margin-bottom: map.get(vars.$spacing, m);
    }

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
        transition: all 0.4s ease-out;
      }
    }
  }

  .reset-button {
    padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);
    font-weight: map.get(map.get(vars.$fonts, weights), medium);
    border: none;
    cursor: pointer;

    @media (max-width: 576px) {
      padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
      font-size: map.get(map.get(vars.$fonts, sizes), small);
    }

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