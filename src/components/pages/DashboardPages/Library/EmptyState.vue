<!-- src/components/pages/DashboardPages/Library/EmptyState.vue -->
<template>
  <div class="empty-state">
    <div class="empty-illustration">
      <div class="book-stack">
        <div class="book book-1"></div>
        <div class="book book-2"></div>
        <div class="book book-3"></div>
      </div>
      <div class="empty-icon">📚</div>
    </div>

    <h3 class="empty-title">Keine Artikel gefunden</h3>
    <p class="empty-description">
      Es sieht so aus, als hätten wir keine Artikel gefunden, die deinen Suchkriterien entsprechen. Versuche andere
      Suchbegriffe oder Filter.
    </p>

    <div class="empty-actions">
      <button @click="onResetClick" class="reset-button primary">
        <span class="button-icon">🔄</span>
        Filter zurücksetzen
      </button>
      <button @click="onExploreClick" class="reset-button secondary">
        <span class="button-icon">🔍</span>
        Alle Artikel erkunden
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "EmptyState",
  emits: ["reset-filters", "explore-all"],
  setup(_, { emit }) {
    const onResetClick = () => emit("reset-filters");

    const onExploreClick = () => emit("explore-all");

    return {
      onResetClick,
      onExploreClick,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;

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

    .book-stack {
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 4px;
      opacity: 0.3;

      .book {
        width: 30px;
        height: 40px;
        border-radius: 3px;
        transform-origin: bottom;
        animation: sway 4s ease-in-out infinite;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: mixins.theme-gradient($theme, primary);
          }
        }

        &.book-1 {
          animation-delay: 0s;
          height: 35px;
        }

        &.book-2 {
          animation-delay: 0.5s;
          height: 42px;
        }

        &.book-3 {
          animation-delay: 1s;
          height: 38px;
        }
      }
    }

    .empty-icon {
      font-size: 5rem;
      opacity: 0.8;
      filter: grayscale(20%);
      position: relative;
      z-index: 1;

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

    @each $theme in ("light", "dark") {
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

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
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

    .reset-button {
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
        transform: rotate(180deg);
      }

      &.primary {
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: mixins.theme-gradient($theme, primary);
            color: white;

            &::before {
              content: "";
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
        @each $theme in ("light", "dark") {
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
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes sway {
  0%,
  100% {
    transform: rotate(-2deg);
  }
  50% {
    transform: rotate(2deg);
  }
}
</style>
