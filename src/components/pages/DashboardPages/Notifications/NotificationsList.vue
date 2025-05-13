<!-- src/components/pages/DashboardPages/Notifications/NotificationsList.vue -->
<template>
  <div v-if="notifications.length > 0" class="notifications-list">
    <transition-group name="notification">
      <div v-for="notification in notifications" :key="notification.id" class="notification-item"
        :class="{ unread: !notification.read }">
        <div class="notification-icon" :class="notification.type">
          <span v-if="notification.type === 'article'">📚</span>
          <span v-else-if="notification.type === 'comment'">💬</span>
          <span v-else-if="notification.type === 'friend'">👥</span>
          <span v-else-if="notification.type === 'system'">ℹ️</span>
          <span v-else>🔔</span>
        </div>
        <div class="notification-content">
          <div class="notification-header">
            <h3>{{ notification.title }}</h3>
            <span class="notification-time">{{ notification.time }}</span>
          </div>
          <p class="notification-message">{{ notification.message }}</p>
          <div v-if="notification.actionLink" class="notification-action">
            <a :href="notification.actionLink">{{ notification.actionText || 'Ansehen' }}</a>
          </div>
        </div>
        <div class="notification-actions">
          <button v-if="!notification.read" class="action-button mark-read" @click.stop="$emit('mark-read', notification.id)"
            title="Als gelesen markieren">
            ✓
          </button>
          <button class="action-button delete" @click.stop="$emit('delete', notification.id)" title="Löschen">
            ×
          </button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'article' | 'comment' | 'friend' | 'system';
  time: string;
  read: boolean;
  actionLink?: string;
  actionText?: string;
}

export default defineComponent({
  name: 'NotificationsList',
  props: {
    notifications: {
      type: Array as PropType<Notification[]>,
      required: true
    }
  },
  emits: ['mark-read', 'delete']
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;

// Benachrichtigungsliste
.notifications-list {
  margin-bottom: map.get(vars.$spacing, xl);
  display: flex;
  flex-direction: column;
  align-items: center;

  .notification-item {
    display: flex;
    gap: map.get(vars.$spacing, m);
    padding: map.get(vars.$spacing, l);
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);
    margin-bottom: map.get(vars.$spacing, m);
    position: relative;
    transition: all 0.3s;
    width: 100%;
    max-width: 800px;
    transition: all 0.4s ease-out;

    @media (max-width: 768px) {
      padding: map.get(vars.$spacing, m);
      gap: map.get(vars.$spacing, s);
    }

    @media (max-width: 576px) {
      flex-direction: column;
      align-items: flex-start;
      padding: map.get(vars.$spacing, s);
    }

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        transition: all 0.4s ease-out !important;
        background-color: mixins.theme-color($theme, card-bg);
        border: 1px solid mixins.theme-color($theme, border-light);

        &.unread {
          border-left: 4px solid mixins.theme-color($theme, accent-green);

          background-color: rgba(mixins.theme-color($theme, accent-green), 0.05);

          @media (max-width: 576px) {
            border-left-width: 1px;
            border-top: 4px solid mixins.theme-color($theme, accent-green);
          }
        }

        &:hover {
          @include mixins.shadow('medium', $theme);
        }
      }
    }

    .notification-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;

      @media (max-width: 768px) {
        width: 40px;
        height: 40px;
        font-size: 1.2rem;
      }

      @media (max-width: 576px) {
        margin-bottom: map.get(vars.$spacing, s);
      }

      &.article {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: rgba(mixins.theme-color($theme, accent-green), 0.15);
            transition: all 0.4s ease-out;
          }
        }
      }

      &.comment {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: rgba(mixins.theme-color($theme, accent-teal), 0.15);
            transition: all 0.4s ease-out;
          }
        }
      }

      &.friend {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: rgba(mixins.theme-color($theme, accent-lime), 0.15);
            transition: all 0.4s ease-out;
          }
        }
      }

      &.system {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: rgba(mixins.theme-color($theme, accent-yellow), 0.15);
            transition: all 0.4s ease-out;
          }
        }
      }
    }

    .notification-content {
      flex: 1;
      min-width: 0; // Für Textbegrenzung

      .notification-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: map.get(vars.$spacing, xs);

        @media (max-width: 576px) {
          flex-direction: column;
          gap: map.get(vars.$spacing, xxs);
        }

        h3 {
          margin: 0;
          font-size: map.get(map.get(vars.$fonts, sizes), medium);
          font-weight: map.get(map.get(vars.$fonts, weights), bold);

          @media (max-width: 768px) {
            font-size: map.get(map.get(vars.$fonts, sizes), small);
          }

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
              transition: all 0.4s ease-out;
            }
          }
        }

        .notification-time {
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          white-space: nowrap;

          @media (max-width: 768px) {
            font-size: 11px;
          }

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-tertiary);
              transition: all 0.4s ease-out;
            }
          }
        }
      }

      .notification-message {
        margin-bottom: map.get(vars.$spacing, s);
        font-size: map.get(map.get(vars.$fonts, sizes), medium);

        @media (max-width: 768px) {
          font-size: map.get(map.get(vars.$fonts, sizes), small);
        }

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
            transition: all 0.4s ease-out;
          }
        }
      }

      .notification-action {
        a {
          display: inline-flex;
          align-items: center;
          padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, m);
          border-radius: map.get(map.get(vars.$layout, border-radius), pill);
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          text-decoration: none;

          @media (max-width: 768px) {
            font-size: 11px;
            padding: 4px 10px;
          }

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, accent-teal);
              border: 1px solid mixins.theme-color($theme, accent-teal);
              transition: all 0.4s ease-out;

              &:hover {
                background-color: rgba(mixins.theme-color($theme, accent-teal), 0.1);
              }
            }
          }
        }
      }
    }

    .notification-actions {
      display: flex;
      flex-direction: column;
      gap: map.get(vars.$spacing, s);
      flex-shrink: 0;

      @media (max-width: 576px) {
        flex-direction: row;
        align-self: flex-end;
        margin-top: map.get(vars.$spacing, s);
      }

      .action-button {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        cursor: pointer;
        font-size: 1rem;

        @media (max-width: 768px) {
          width: 26px;
          height: 26px;
          font-size: 0.9rem;
        }

        &.mark-read {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, accent-green);
              color: white;
              transition: all 0.4s ease-out;

              &:hover {
                transform: scale(1.1);
              }
            }
          }
        }

        &.delete {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
              color: #ff6b6b;
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
}

// Animationen für Benachrichtigungen
.notification-enter-active,
.notification-leave-active {
  transition: all 0.5s;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>