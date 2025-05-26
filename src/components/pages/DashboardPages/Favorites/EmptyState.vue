<!-- src/components/pages/DashboardPages/Favorites/EmptyState.vue -->
<template>
  <div class="empty-state">
    <div class="empty-illustration">
      <div class="stars-container">
        <div class="star star-1">⭐</div>
        <div class="star star-2">✨</div>
        <div class="star star-3">⭐</div>
        <div class="star star-4">✨</div>
      </div>
      <div class="empty-icon">💫</div>
    </div>
    
    <h3 class="empty-title">Keine Favoriten gefunden</h3>
    
    <p class="empty-description" v-if="searchQuery">
      Deine Suche nach <strong>"{{ searchQuery }}"</strong> ergab keine Treffer in deinen Favoriten.
    </p>
    <p class="empty-description" v-else>
      Du hast noch keine Artikel als Favoriten markiert. 
      Klicke auf das Stern-Symbol bei Artikeln, die dir gefallen, um sie hier zu speichern.
    </p>
    
    <div class="empty-actions">
      <button v-if="searchQuery" @click="clearSearch" class="action-button primary">
        <span class="button-icon">🔄</span>
        Suche zurücksetzen
      </button>
      
      <button @click="browseArticles" class="action-button" :class="searchQuery ? 'secondary' : 'primary'">
        <span class="button-icon">📚</span>
        Artikel durchstöbern
      </button>
    </div>
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: map.get(vars.$spacing, xxl);
  text-align: center;
  min-height: 500px;

  @media (max-width: 768px) {
    padding: map.get(vars.$spacing, xl) map.get(vars.$spacing, l);
    min-height: 400px;
  }

  .empty-illustration {
    position: relative;
    margin-bottom: map.get(vars.$spacing, xl);
    animation: float 3s ease-in-out infinite;

    .stars-container {
      position: absolute;
      width: 150px;
      height: 150px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      .star {
        position: absolute;
        font-size: 1.5rem;
        animation: twinkle 4s ease-in-out infinite;

        &.star-1 {
          top: 0;
          left: 20px;
          animation-delay: 0s;
        }

        &.star-2 {
          top: 30px;
          right: 10px;
          animation-delay: 1s;
          font-size: 1.2rem;
        }

        &.star-3 {
          bottom: 20px;
          left: 10px;
          animation-delay: 2s;
        }

        &.star-4 {
          bottom: 0;
          right: 20px;
          animation-delay: 3s;
          font-size: 1rem;
        }
      }
    }

    .empty-icon {
      font-size: 5rem;
      position: relative;
      z-index: 1;
      filter: drop-shadow(0 4px 20px rgba(249, 202, 36, 0.3));

      @media (max-width: 768px) {
        font-size: 4rem;
      }
    }
  }

  .empty-title {
    font-size: map.get(map.get(vars.$fonts, sizes), xxl);
    font-weight: map.get(map.get(vars.$fonts, weights), bold);
    margin-bottom: map.get(vars.$spacing, m);

    @media (max-width: 768px) {
      font-size: map.get(map.get(vars.$fonts, sizes), xl);
    }

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
      }
    }
  }

  .empty-description {
    font-size: map.get(map.get(vars.$fonts, sizes), medium);
    margin-bottom: map.get(vars.$spacing, xl);
    max-width: 500px;
    line-height: 1.6;

    @media (max-width: 768px) {
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      margin-bottom: map.get(vars.$spacing, l);
    }

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
      }
    }

    strong {
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }
  }

  .empty-actions {
    display: flex;
    gap: map.get(vars.$spacing, m);
    flex-wrap: wrap;
    justify-content: center;

    @media (max-width: 576px) {
      flex-direction: column;
      width: 100%;
      max-width: 300px;
    }

    .action-button {
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, s);
      padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      font-size: map.get(map.get(vars.$fonts, sizes), medium);
      border: none;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;

      @media (max-width: 768px) {
        padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
        font-size: map.get(map.get(vars.$fonts, sizes), small);
      }

      @media (max-width: 576px) {
        width: 100%;
        justify-content: center;
      }

      .button-icon {
        font-size: 1.2rem;
        transition: transform 0.3s ease;
      }

      &:hover .button-icon {
        transform: scale(1.2) rotate(10deg);
      }

      &.primary {
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
              transform: translateY(-3px);

              &::before {
                width: 300px;
                height: 300px;
              }
            }
          }
        }
      }

      &.secondary {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            color: mixins.theme-color($theme, text-primary);
            border: 2px solid mixins.theme-color($theme, border-light);

            &:hover {
              transform: translateY(-3px);
              background-color: mixins.theme-color($theme, hover-color);
              border-color: mixins.theme-color($theme, primary);
              color: mixins.theme-color($theme, primary);
            }
          }
        }
      }
    }
  }
}

// Animationen
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}
</style>