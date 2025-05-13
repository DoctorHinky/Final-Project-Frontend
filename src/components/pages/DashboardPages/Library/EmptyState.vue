<!-- src/components/pages/DashboardPages/Library/EmptyState.vue -->
<template>
  <div class="empty-state">
    <div class="empty-icon">📚</div>
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
        transition: all 0.4s ease-out;
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
        transition: all 0.4s ease-out;
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