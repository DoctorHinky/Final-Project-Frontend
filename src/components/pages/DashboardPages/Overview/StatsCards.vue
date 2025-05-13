<!-- src/components/pages/DashboardPages/Overview/StatsCards.vue -->
<template>
  <div class="stats-cards">
    <div class="stat-card" v-for="(stat, index) in stats" :key="index">
      <div class="stat-icon" :style="{ backgroundColor: stat.color }">
        <span>{{ stat.icon }}</span>
      </div>
      <div class="stat-info">
        <h3>{{ stat.value }}</h3>
        <p>{{ stat.label }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

interface StatCard {
  icon: string;
  label: string;
  value: string;
  color: string;
}

export default defineComponent({
  name: 'StatsCards',
  props: {
    stats: {
      type: Array as PropType<StatCard[]>,
      required: true
    }
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;

// Statistik-Karten
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: map.get(vars.$spacing, l);
  margin-bottom: map.get(vars.$spacing, xl);

  .stat-card {
    display: flex;
    align-items: center;
    padding: map.get(vars.$spacing, l);
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);
    transition: all 0.3s;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        border: 1px solid mixins.theme-color($theme, border-light);

        &:hover {
          transform: translateY(-5px);
          @include mixins.shadow('medium', $theme);
          border-color: mixins.theme-color($theme, accent-green);
        }
      }
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: map.get(vars.$spacing, m);
      font-size: 1.5rem;
    }

    .stat-info {
      h3 {
        font-size: map.get(map.get(vars.$fonts, sizes), xl);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        margin: 0 0 map.get(vars.$spacing, xxs) 0;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }

      p {
        margin: 0;
        font-size: map.get(map.get(vars.$fonts, sizes), small);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }
    }
  }
}
</style>