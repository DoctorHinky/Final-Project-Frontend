<!-- src/components/pages/DashboardPages/MyArticles/EmptyState.vue -->
<template>
  <div class="empty-state">
    <div class="empty-icon">{{ isEmptyHistory ? '📚' : '📄' }}</div>
    
    <h3>{{ emptyTitle }}</h3>
    <p>{{ emptyMessage }}</p>
    
    <div class="empty-actions">
      <button 
        v-if="!isEmptyHistory" 
        @click="onResetClick" 
        class="reset-button"
      >
        Filter zurücksetzen
      </button>
      
      <button 
        v-if="isEmptyHistory"
        @click="goToLibrary"
        class="browse-button"
      >
        Artikel entdecken
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'EmptyState',
  props: {
    isEmptyHistory: {
      type: Boolean,
      default: false
    }
  },
  emits: ['reset-filters'],
  setup(props, { emit }) {
    const router = useRouter();

    const emptyTitle = computed(() => {
      return props.isEmptyHistory 
        ? 'Noch keine Artikel gelesen'
        : 'Keine Artikel gefunden';
    });

    const emptyMessage = computed(() => {
      return props.isEmptyHistory
        ? 'Du hast noch keine Artikel in deiner Lesehistorie. Entdecke interessante Inhalte in unserer Bibliothek!'
        : 'Versuche andere Suchbegriffe oder Filter, um Artikel zu finden.';
    });

    const onResetClick = () => {
      emit('reset-filters');
    };

    const goToLibrary = () => {
      router.push({ name: "MemberDashboard", query: { tab: "library" } });
    };

    return {
      emptyTitle,
      emptyMessage,
      onResetClick,
      goToLibrary
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
    max-width: 400px;
    line-height: 1.5;

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

  .empty-actions {
    display: flex;
    gap: map.get(vars.$spacing, m);

    @media (max-width: 576px) {
      flex-direction: column;
      width: 100%;
    }

    .reset-button,
    .browse-button {
      padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      border: none;
      cursor: pointer;
      transition: all 0.4s ease-out;

      @media (max-width: 576px) {
        padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
        font-size: map.get(map.get(vars.$fonts, sizes), small);
      }

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, primary);
          color: white;

          &:hover {
            transform: translateY(-3px);
            @include mixins.shadow('medium', $theme);
          }
        }
      }
    }

    .browse-button {
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, accent-teal);
        }
      }
    }
  }
}
</style>