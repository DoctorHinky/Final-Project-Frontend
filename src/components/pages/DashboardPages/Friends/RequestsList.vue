<!-- src/components/pages/DashboardPages/Friends/RequestsList.vue -->
<template>
  <div class="requests-list">
    <div v-if="pendingRequests.length > 0" class="requests-grid">
      <div v-for="request in pendingRequests" :key="request.id" class="request-card">
        <div class="request-avatar">
          <span class="avatar-placeholder">{{ getInitials(request.name) }}</span>
        </div>
        <div class="request-info">
          <h3>{{ request.name }}</h3>
          <p class="request-message">{{ request.message || "Möchte mit dir befreundet sein." }}</p>
          <div class="request-meta">
            <span class="request-date">Angefragt am {{ request.requestDate }}</span>
            <span class="mutual-friends">{{ request.mutualFriends }} gemeinsame Freunde</span>
          </div>
        </div>
        <div class="request-actions">
          <button class="action-button accept" @click="acceptRequest(request.id)">Annehmen</button>
          <button class="action-button decline" @click="declineRequest(request.id)">Ablehnen</button>
        </div>
      </div>
    </div>

    <!-- Leerer Zustand für Anfragen -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <InboxIcon class="empty-icon-svg" />
      </div>
      <h3>Keine Anfragen vorhanden</h3>
      <p>Du hast derzeit keine offenen Freundschaftsanfragen.</p>
      <button @click="showInviteModal" class="reset-button">
        <EnvelopeIcon class="button-icon" />
        Freunde einladen
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { InboxIcon, EnvelopeIcon } from "@heroicons/vue/24/outline";
import type { FriendRequest } from "@/types/Friends.types";

export default defineComponent({
  name: "RequestsList",
  components: {
    InboxIcon,
    EnvelopeIcon,
  },
  props: {
    pendingRequests: {
      type: Array as PropType<FriendRequest[]>,
      required: true,
    },
  },
  emits: ["accept-request", "decline-request", "show-invite-modal"],
  setup(_props, { emit }) {
    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    };

    const acceptRequest = (requestId: string) => emit("accept-request", requestId);

    const declineRequest = (requestId: string) => emit("decline-request", requestId);

    const showInviteModal = () => emit("show-invite-modal");

    return {
      getInitials,
      acceptRequest,
      declineRequest,
      showInviteModal,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;

.requests-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: map.get(vars.$spacing, l);

  @media (max-width: 768px) {
    justify-content: center;
  }
}

// Request card styles
.request-card {
  width: 600px;
  display: flex;
  padding: map.get(vars.$spacing, l);
  border-radius: map.get(map.get(vars.$layout, border-radius), medium);
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  gap: map.get(vars.$spacing, m);
  overflow: hidden;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, card-bg);
      border: 1px solid mixins.theme-color($theme, border-light);
      transition: all 0.4s ease-out;

      &:hover {
        transform: translateY(-4px);
        @include mixins.shadow("medium", $theme);
        border-color: mixins.theme-color($theme, border-medium);
      }
    }
  }

  // Avatar style
  .request-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    flex-shrink: 0;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, secondary-bg);
        border: 2px solid mixins.theme-color($theme, accent-green);
        transition: all 0.4s ease-out;
      }
    }

    .avatar-placeholder {
      font-size: 2rem;
      font-weight: map.get(map.get(vars.$fonts, weights), bold);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
          transition: all 0.4s ease-out;
        }
      }
    }
  }

  // Info area
  .request-info {
    flex: 1;
    min-width: 0;

    h3 {
      margin: 0 0 map.get(vars.$spacing, xs) 0;
      font-size: map.get(map.get(vars.$fonts, sizes), large);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
          transition: all 0.4s ease-out;
        }
      }
    }

    .request-message {
      margin-bottom: map.get(vars.$spacing, s);
      font-size: map.get(map.get(vars.$fonts, sizes), medium);
      line-height: 1.4;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
          transition: all 0.4s ease-out;
        }
      }
    }

    .request-meta {
      display: flex;
      flex-wrap: wrap;
      gap: map.get(vars.$spacing, s);
      font-size: map.get(map.get(vars.$fonts, sizes), small);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-tertiary);
          transition: all 0.4s ease-out;
        }
      }

      .request-date,
      .mutual-friends {
        padding: 4px 10px;
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        white-space: nowrap;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            transition: all 0.4s ease-out;
          }
        }
      }
    }
  }

  // Actions
  .request-actions {
    display: flex;
    flex-direction: column;
    gap: map.get(vars.$spacing, s);
    align-items: flex-start;

    .action-button {
      padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;

      &.accept {
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, accent-green);
            color: white;
            transition: all 0.4s ease-out;

            &:hover {
              transform: translateY(-2px);
              @include mixins.shadow("small", $theme);
            }
          }
        }
      }

      &.decline {
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: transparent;
            color: #ff6b6b; // Red for decline
            border: 1px solid rgba(255, 107, 107, 0.3);
            transition: all 0.4s ease-out;

            &:hover {
              background-color: rgba(255, 107, 107, 0.1);
              border-color: rgba(255, 107, 107, 0.5);
            }
          }
        }
      }
    }
  }
}

// Empty State Styling
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: map.get(vars.$spacing, xxl);
  text-align: center;

  .empty-icon {
    margin-bottom: map.get(vars.$spacing, l);

    .empty-icon-svg {
      width: 64px;
      height: 64px;
      opacity: 0.5;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
          transition: all 0.4s ease-out;
        }
      }
    }
  }

  h3 {
    font-size: map.get(map.get(vars.$fonts, sizes), xl);
    margin-bottom: map.get(vars.$spacing, m);

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
        transition: all 0.4s ease-out;
      }
    }
  }

  p {
    font-size: map.get(map.get(vars.$fonts, sizes), medium);
    margin-bottom: map.get(vars.$spacing, l);
    max-width: 500px;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
        transition: all 0.4s ease-out;
      }
    }
  }

  .reset-button {
    padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
    border-radius: map.get(map.get(vars.$layout, border-radius), pill);
    font-weight: map.get(map.get(vars.$fonts, weights), medium);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: map.get(vars.$spacing, s);

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background: mixins.theme-gradient($theme, primary);
        color: white;
        transition: all 0.4s ease-out;

        &:hover {
          transform: translateY(-3px);
          @include mixins.shadow("medium", $theme);
        }
      }
    }

    .button-icon {
      width: 20px;
      height: 20px;
    }
  }
}
</style>
