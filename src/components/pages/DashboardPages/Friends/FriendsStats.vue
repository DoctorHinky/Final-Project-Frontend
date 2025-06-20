<!-- src/components/pages/DashboardPages/Friends/FriendsStats.vue -->
<template>
  <div class="friends-stats">
    <div 
      class="stat-card clickable"
      :class="{ active: activeView === 'friends' }"
      @click="$emit('change-view', 'friends')"
    >
      <div class="stat-icon" style="background-color: rgba(74, 210, 149, 0.2)">
        <UserGroupIcon class="icon" />
      </div>
      <div class="stat-info">
        <h3>{{ friendsCount }}</h3>
        <p>{{ friendsCount === 1 ? 'Freund' : 'Freunde' }}</p>
      </div>
      <div class="card-action">
        <ChevronRightIcon class="action-icon" />
      </div>
    </div>

    <div 
      class="stat-card clickable"
      :class="{ active: activeView === 'requests' }"
      @click="$emit('change-view', 'requests')"
    >
      <div class="stat-icon" style="background-color: rgba(53, 204, 208, 0.2)">
        <InboxIcon class="icon" />
      </div>
      <div class="stat-info">
        <h3>{{ pendingRequestsCount }}</h3>
        <p>Offene {{ pendingRequestsCount === 1 ? 'Anfrage' : 'Anfragen' }}</p>
      </div>
      <!-- Badge für neue Anfragen -->
      <div v-if="pendingRequestsCount > 0" class="badge-indicator">
        {{ pendingRequestsCount }}
      </div>
      <div class="card-action">
        <ChevronRightIcon class="action-icon" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { UserGroupIcon, InboxIcon, ChevronRightIcon } from '@heroicons/vue/24/outline';

export default defineComponent({
  name: 'FriendsStats',
  components: {
    UserGroupIcon,
    InboxIcon,
    ChevronRightIcon
  },
  props: {
    friendsCount: {
      type: Number,
      required: true
    },
    pendingRequestsCount: {
      type: Number,
      required: true
    },
    activeView: {
      type: String,
      default: 'friends'
    }
  },
  emits: ['change-view']
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;

// Statistik-Karten
.friends-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: map.get(vars.$spacing, l);
  margin-bottom: map.get(vars.$spacing, xl);

  .stat-card {
    display: flex;
    align-items: center;
    padding: map.get(vars.$spacing, l);
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        border: 2px solid mixins.theme-color($theme, border-light);
        transition: all 0.4s ease-out;

        &.clickable {
          cursor: pointer;

          &:hover {
            transform: translateY(-5px);
            @include mixins.shadow('medium', $theme);
            border-color: mixins.theme-color($theme, accent-teal);

            .card-action {
              opacity: 1;
              transform: translateX(0);
            }
          }

          &.active {
            border-color: mixins.theme-color($theme, accent-teal);
            @include mixins.shadow('small', $theme);

            // Aktiver Indikator
            &::before {
              content: '';
              position: absolute;
              left: 0;
              top: 0;
              bottom: 0;
              width: 4px;
              background: mixins.theme-gradient($theme, primary);
            }
          }
        }
      }
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: map.get(vars.$spacing, m);
      flex-shrink: 0;

      .icon {
        width: 28px;
        height: 28px;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
            transition: all 0.4s ease-out;
          }
        }
      }
    }

    .stat-info {
      flex: 1;

      h3 {
        font-size: map.get(map.get(vars.$fonts, sizes), xxl);
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
        font-size: map.get(map.get(vars.$fonts, sizes), medium);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
            transition: all 0.4s ease-out;
          }
        }
      }
    }

    // Badge für neue Anfragen
    .badge-indicator {
      position: absolute;
      top: 15px;
      right: 15px;
      min-width: 24px;
      height: 24px;
      padding: 0 6px;
      border-radius: 12px;
      background-color: #ff4757;
      color: white;
      font-size: map.get(map.get(vars.$fonts, sizes), xs);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 2s infinite;
    }

    // Chevron-Icon für Klickbarkeit
    .card-action {
      display: flex;
      align-items: center;
      margin-left: map.get(vars.$spacing, s);
      opacity: 0;
      transform: translateX(-10px);
      transition: all 0.3s ease;

      .action-icon {
        width: 20px;
        height: 20px;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-tertiary);
          }
        }
      }
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.9;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

// Responsive Design
@media (max-width: 768px) {
  .friends-stats {
    grid-template-columns: 1fr;
    gap: map.get(vars.$spacing, m);

    .stat-card {
      padding: map.get(vars.$spacing, m);

      .stat-icon {
        width: 50px;
        height: 50px;

        .icon {
          width: 24px;
          height: 24px;
        }
      }

      .card-action {
        opacity: 1;
        transform: translateX(0);
      }
    }
  }
}
</style>