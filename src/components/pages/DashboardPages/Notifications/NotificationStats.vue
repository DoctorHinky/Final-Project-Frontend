<!-- src/components/pages/DashboardPages/Notifications/NotificationStats.vue -->
<template>
  <div class="notification-stats">
    <div class="stat-card">
      <div class="stat-icon">
        <BellAlertIcon class="hero-icon-stat" />
      </div>
      <div class="stat-info">
        <h3>{{ unreadCount }}</h3>
        <p>Ungelesen</p>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">
        <ChartBarIcon class="hero-icon-stat" />
      </div>
      <div class="stat-info">
        <h3>{{ totalCount }}</h3>
        <p>Gesamt</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { BellAlertIcon, ChartBarIcon } from '@heroicons/vue/24/outline';

export default defineComponent({
  name: 'NotificationStats',
  components: {
    BellAlertIcon,
    ChartBarIcon
  },
  props: {
    unreadCount: {
      type: Number,
      required: true
    },
    totalCount: {
      type: Number,
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
.notification-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: map.get(vars.$spacing, l);
  margin-bottom: map.get(vars.$spacing, l);

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
    gap: map.get(vars.$spacing, m);
  }

  .stat-card {
    display: flex;
    align-items: center;
    padding: map.get(vars.$spacing, l);
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);
    transition: all 0.3s;

    @media (max-width: 576px) {
      padding: map.get(vars.$spacing, m);
    }

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        border: 1px solid mixins.theme-color($theme, border-light);
        transition: all 0.4s ease-out;

        &:hover {
          transform: translateY(-5px);
          @include mixins.shadow('medium', $theme);
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

      @media (max-width: 576px) {
        width: 40px;
        height: 40px;
        margin-right: map.get(vars.$spacing, s);
      }

      &:first-child .hero-icon-stat {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, accent-green);
          }
        }
      }

      .hero-icon-stat {
        width: 30px;
        height: 30px;
        stroke-width: 1.5;

        @media (max-width: 576px) {
          width: 24px;
          height: 24px;
        }
      }

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
        }
      }
    }

    &:first-child .stat-icon {
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: rgba(mixins.theme-color($theme, accent-green), 0.15);
        }
      }
    }

    &:last-child .stat-icon {
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: rgba(mixins.theme-color($theme, accent-teal), 0.15);
        }
      }

      .hero-icon-stat {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, accent-teal);
          }
        }
      }
    }

    .stat-info {
      h3 {
        font-size: map.get(map.get(vars.$fonts, sizes), xl);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        margin: 0 0 map.get(vars.$spacing, xxs) 0;

        @media (max-width: 576px) {
          font-size: map.get(map.get(vars.$fonts, sizes), large);
        }

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
            transition: all 0.4s ease-out;
          }
        }
      }

      p {
        margin: 0;
        font-size: map.get(map.get(vars.$fonts, sizes), small);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
            transition: all 0.4s ease-out;
          }
        }
      }
    }
  }
}
</style>