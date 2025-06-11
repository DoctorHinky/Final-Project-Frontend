<!-- src/components/pages/DashboardPages/Friends/FriendsStats.vue -->
<template>
  <div class="friends-stats">
    <div class="stat-card">
      <div class="stat-icon" style="background-color: rgba(74, 210, 149, 0.2)">
        <UserGroupIcon class="icon" />
      </div>
      <div class="stat-info">
        <h3>{{ friendsCount }}</h3>
        <p>Freunde</p>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon" style="background-color: rgba(53, 204, 208, 0.2)">
        <InboxIcon class="icon" />
      </div>
      <div class="stat-info">
        <h3>{{ pendingRequestsCount }}</h3>
        <p>Offene Anfragen</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { UserGroupIcon, InboxIcon } from '@heroicons/vue/24/outline';

export default defineComponent({
  name: 'FriendsStats',
  components: {
    UserGroupIcon,
    InboxIcon
  },
  props: {
    friendsCount: {
      type: Number,
      required: true
    },
    pendingRequestsCount: {
      type: Number,
      required: true
    }
    // suggestionsCount prop entfernt
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;

// Statistik-Karten
.friends-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: map.get(vars.$spacing, l);
  margin-bottom: map.get(vars.$spacing, l);

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

      .icon {
        width: 24px;
        height: 24px;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
            transition: all 0.4s ease-out;
          }
        }
      }
    }

    .stat-info {
      h3 {
        font-size: map.get(map.get(vars.$fonts, sizes), xl);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        margin: 0 0 map.get(vars.$spacing, xxs) 0;

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
}</style>