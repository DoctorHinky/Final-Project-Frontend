<!-- src/components/pages/DashboardPages/Overview/StatsCards.vue -->
<template>
  <div class="stats-cards">
    <div class="stat-card" v-for="(stat, index) in stats" :key="index" :class="`stat-${index}`">
      <div class="stat-background"></div>
      <div class="stat-content">
        <div class="stat-icon" :style="{ backgroundColor: stat.color + '20', color: stat.color }">
          <span class="icon-emoji">{{ stat.icon }}</span>
        </div>
        <div class="stat-info">
          <h3 class="stat-value" :data-value="stat.value">{{ stat.value }}</h3>
          <p class="stat-label">{{ stat.label }}</p>
        </div>
        <div class="stat-trend" v-if="stat.trend">
          <span class="trend-icon" :class="stat.trend > 0 ? 'positive' : 'negative'">
            {{ stat.trend > 0 ? "↑" : "↓" }}
          </span>
          <span class="trend-value">{{ Math.abs(stat.trend) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";

export interface StatCard {
  icon: string;
  label: string;
  value: string;
  color: string;
  trend?: number;
}

export default defineComponent({
  name: "StatsCards",
  props: {
    stats: {
      type: Array as PropType<StatCard[]>,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;

// Statistik-Karten Grid
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: map.get(vars.$spacing, l);
  margin-bottom: map.get(vars.$spacing, xl);

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: map.get(vars.$spacing, m);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }

  .stat-card {
    position: relative;
    border-radius: map.get(map.get(vars.$layout, border-radius), large);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    user-select: none;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        border: 1px solid mixins.theme-color($theme, border-light);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

        &:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border-color: transparent;

          .stat-background {
            transform: rotate(15deg) scale(1.5);
            opacity: 0.15;
          }

          .stat-value {
            transform: scale(1.05);
          }

          .stat-icon {
            transform: rotate(-5deg) scale(1.1);
          }
        }
      }
    }

    // Animierter Hintergrund
    .stat-background {
      position: absolute;
      top: -50%;
      right: -30%;
      width: 200%;
      height: 200%;
      border-radius: 50%;
      opacity: 0.08;
      transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, primary);
        }
      }
    }

    // Stat Content
    .stat-content {
      position: relative;
      display: flex;
      align-items: center;
      padding: map.get(vars.$spacing, xl);
      gap: map.get(vars.$spacing, m);

      @media (max-width: 768px) {
        padding: map.get(vars.$spacing, l);
      }

      .stat-icon {
        flex-shrink: 0;
        width: 60px;
        height: 60px;
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

        @media (max-width: 768px) {
          width: 50px;
          height: 50px;
        }

        .icon-emoji {
          font-size: 1.8rem;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));

          @media (max-width: 768px) {
            font-size: 1.5rem;
          }
        }
      }

      .stat-info {
        flex: 1;
        min-width: 0;

        .stat-value {
          font-size: map.get(map.get(vars.$fonts, sizes), xxl);
          font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
          margin: 0 0 map.get(vars.$spacing, xxs) 0;
          line-height: 1;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);

          @media (max-width: 768px) {
            font-size: map.get(map.get(vars.$fonts, sizes), xl);
          }

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }

          // Animierte Zahl beim Hover
          &::after {
            content: attr(data-value);
            position: absolute;
            top: 0;
            left: 0;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.3s ease;
          }
        }

        .stat-label {
          margin: 0;
          font-size: map.get(map.get(vars.$fonts, sizes), small);

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }
      }

      // Trend-Indikator
      .stat-trend {
        position: absolute;
        top: map.get(vars.$spacing, m);
        right: map.get(vars.$spacing, m);
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        padding: 4px 8px;
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);

        .trend-icon {
          font-size: 0.8rem;

          &.positive {
            color: #4ad295;
          }

          &.negative {
            color: #ff6b6b;
          }
        }

        .trend-value {
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
          }
        }
      }
    }

    // Individuelle Karten-Animationen
    @for $i from 0 through 3 {
      &.stat-#{$i} {
        animation: slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) #{$i * 0.1}s both;
      }
    }
  }
}

// Animationen
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
