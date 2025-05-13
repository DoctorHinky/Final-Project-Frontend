<!-- src/components/pages/DashboardPages/Notifications/NotificationFilters.vue -->
<template>
  <div class="notification-filters">
    <div class="filter-toolbar">
      <div class="filter-buttons">
        <button v-for="(filter, index) in filters" :key="index" class="filter-button"
          :class="{ active: activeFilter === filter.id }" @click="$emit('update:activeFilter', filter.id)">
          {{ filter.name }}
          <span v-if="filter.count > 0" class="filter-count">{{ filter.count }}</span>
        </button>
      </div>

      <div class="action-buttons">
        <button class="mark-all-read" @click="$emit('mark-all-read')" v-if="hasUnread">Alle als gelesen markieren</button>
        <button class="clear-notifications" @click="$emit('clear-all')" v-if="hasNotifications">Alle löschen</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

interface Filter {
  id: string;
  name: string;
  count: number;
}

export default defineComponent({
  name: 'NotificationFilters',
  props: {
    filters: {
      type: Array as PropType<Filter[]>,
      required: true
    },
    activeFilter: {
      type: String,
      required: true
    },
    hasUnread: {
      type: Boolean,
      required: true
    },
    hasNotifications: {
      type: Boolean,
      required: true
    }
  },
  emits: ['update:activeFilter', 'mark-all-read', 'clear-all']
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;

// Filter und Aktions-Buttons
.notification-filters {
  margin-bottom: map.get(vars.$spacing, l);

  .filter-toolbar {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    gap: map.get(vars.$spacing, m);

    @media (min-width: 992px) {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }

  .filter-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: map.get(vars.$spacing, s);
    width: 100%;
    justify-content: center;

    @media (max-width: 576px) {
      gap: map.get(vars.$spacing, xs);
    }

    .filter-button {
      padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      cursor: pointer;
      transition: all 0.3s;
      border: none;
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, xs);

      @media (max-width: 576px) {
        padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, m);
        font-size: 12px;
      }

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          color: mixins.theme-color($theme, text-secondary);
          transition: all 0.4s ease-out;

          &:hover {
            background-color: mixins.theme-color($theme, hover-color);
          }

          &.active {
            background: mixins.theme-gradient($theme, primary);
            color: white;
          }
        }
      }

      .filter-count {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 20px;
        height: 20px;
        border-radius: 10px;
        font-size: 0.8rem;
        padding: 0 6px;

        @media (max-width: 576px) {
          min-width: 16px;
          height: 16px;
          font-size: 0.7rem;
          padding: 0 4px;
        }

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: rgba(255, 255, 255, 0.2);
            transition: all 0.4s ease-out;
          }
        }
      }
    }
  }

  .action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: map.get(vars.$spacing, s);
    justify-content: center;
    width: 100%;

    @media (max-width: 576px) {
      width: 100%;

      button {
        flex: 1;
      }
    }

    button {
      padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      cursor: pointer;
      border: none;
      white-space: nowrap;

      @media (max-width: 576px) {
        font-size: 12px;
        text-align: center;
        padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, s);
      }

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: transparent;
          transition: all 0.4s ease-out;

          &:hover {
            background-color: mixins.theme-color($theme, hover-color);
          }
        }
      }

      &.mark-all-read {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, accent-teal);
            border: 1px solid mixins.theme-color($theme, accent-teal);
            transition: all 0.4s ease-out;
          }
        }
      }

      &.clear-notifications {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: #ff6b6b;
            border: 1px solid rgba(255, 107, 107, 0.3);
            transition: all 0.4s ease-out;

            &:hover {
              background-color: rgba(255, 107, 107, 0.1);
            }
          }
        }
      }
    }
  }
}
</style>