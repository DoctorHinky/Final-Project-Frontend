<!-- src/components/pages/DashboardPages/Notifications/NotificationsList.vue -->
<template>
  <div v-if="notifications.length > 0" class="notifications-list">
    <transition-group name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-item"
        :class="{ unread: !notification.isRead }"
      >
        <div
          class="notification-icon"
          :class="notification.type"
          :style="{ backgroundColor: getIconBgColor(notification.type) }"
        >
          <component
            :is="getIconComponent(notification.iconName)"
            class="hero-icon-notification"
            :style="{ color: notification.iconColor }"
          />
        </div>
        <div class="notification-content">
          <div class="notification-header">
            <h3>{{ notification.title }}</h3>
            <span class="notification-time">{{ notification.time }}</span>
          </div>
          <p class="notification-message">{{ notification.content }}</p>
          <div v-if="notification.actionLink" class="notification-action">
            <router-link :to="notification.actionLink" class="action-link">
              {{ notification.actionText || "Ansehen" }}
            </router-link>
          </div>
        </div>
        <div class="notification-actions">
          <button
            v-if="!notification.isRead"
            class="action-button mark-read"
            @click.stop="$emit('mark-read', notification.id)"
            title="Als gelesen markieren"
          >
            <CheckIcon class="hero-icon-action" />
          </button>
          <button class="action-button delete" @click.stop="$emit('delete', notification.id)" title="Löschen">
            <XMarkIcon class="hero-icon-action" />
          </button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import {
  UserGroupIcon,
  UserPlusIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  ClipboardDocumentCheckIcon,
  TicketIcon,
  InformationCircleIcon,
  BellIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";
import { NotificationTypeMap } from "@/types/dtos/Notification.types";
import type { NotificationDisplay } from "@/types/dtos/Notification.types";

export default defineComponent({
  name: "NotificationsList",
  components: {
    UserGroupIcon,
    UserPlusIcon,
    ChatBubbleLeftRightIcon,
    EnvelopeIcon,
    ClipboardDocumentCheckIcon,
    TicketIcon,
    InformationCircleIcon,
    BellIcon,
    CheckIcon,
    XMarkIcon,
  },
  props: {
    notifications: {
      type: Array as PropType<NotificationDisplay[]>,
      required: true,
    },
  },
  emits: ["mark-read", "delete"],
  methods: {
    getIconComponent(iconName: string | undefined) {
      // Map Icon-Namen zu Komponenten
      const iconMap: Record<string, any> = {
        UserGroupIcon: UserGroupIcon,
        UserPlusIcon: UserPlusIcon,
        ChatBubbleLeftRightIcon: ChatBubbleLeftRightIcon,
        EnvelopeIcon: EnvelopeIcon,
        ClipboardDocumentCheckIcon: ClipboardDocumentCheckIcon,
        TicketIcon: TicketIcon,
        InformationCircleIcon: InformationCircleIcon,
        BellIcon: BellIcon,
      };

      return iconMap[iconName || "BellIcon"] || BellIcon;
    },
    getIconBgColor(type: string) {
      const typeInfo = NotificationTypeMap[type as keyof typeof NotificationTypeMap];
      return typeInfo?.bgColor || "rgba(133, 193, 233, 0.15)";
    },
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;

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

    @each $theme in ("light", "dark") {
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
          @include mixins.shadow("medium", $theme);
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
      flex-shrink: 0;
      transition: all 0.4s ease-out;

      @media (max-width: 768px) {
        width: 40px;
        height: 40px;
      }

      @media (max-width: 576px) {
        margin-bottom: map.get(vars.$spacing, s);
      }

      // Hero Icon Styling
      .hero-icon-notification {
        width: 30px;
        height: 30px;
        stroke-width: 1.5;

        @media (max-width: 768px) {
          width: 24px;
          height: 24px;
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

          @each $theme in ("light", "dark") {
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

          @each $theme in ("light", "dark") {
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

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
            transition: all 0.4s ease-out;
          }
        }
      }

      .notification-action {
        .action-link {
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

          @each $theme in ("light", "dark") {
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
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;

        @media (max-width: 768px) {
          width: 32px;
          height: 32px;
        }

        // Hero Icon Styling für Action Buttons
        .hero-icon-action {
          width: 16px;
          height: 16px;
          stroke-width: 2;
          position: absolute;

          @media (max-width: 768px) {
            width: 18px;
            height: 18px;
          }
        }

        &.mark-read {
          @each $theme in ("light", "dark") {
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
          @each $theme in ("light", "dark") {
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
