<!-- src/components/pages/DashboardPages/Friends/FriendsList.vue -->
<template>
  <div class="friends-list">
    <div v-if="filteredFriends.length > 0" class="friends-grid">
      <div v-for="friend in filteredFriends" :key="friend.id" class="friend-card">
        <div class="friend-avatar">
          <img
            v-if="friend.profileImage"
            :src="friend.profileImage"
            :alt="`${friend.username}'s Avatar`"
            class="avatar-image"
          />
          <span v-else class="avatar-placeholder">{{ getInitials(friend.username) }}</span>
          <span v-if="friend.isOnline" class="online-indicator"></span>
        </div>
        <div class="friend-info">
          <h3>{{ friend.username }}</h3>
          <p class="friend-bio">{{ friend.bio }}</p>
          <div class="friend-meta">
            <span class="friend-since">Freunde seit {{ friend.friendSince }}</span>
          </div>
        </div>
        <div class="friend-actions">
          <button class="action-button message" @click="openChat(friend)">
            <ChatBubbleLeftIcon class="button-icon" />
            Nachricht
          </button>
          <button class="action-button more" @click.stop="toggleFriendMenu(friend.id)">
            <EllipsisVerticalIcon class="menu-icon" />
          </button>
          <div v-if="activeFriendMenu === friend.id" class="friend-menu">
            <button @click="unfriend(friend.id)">Freundschaft beenden</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Leerer Zustand für Freunde -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <UserGroupIcon class="empty-icon-svg" />
      </div>
      <h3>Keine Freunde gefunden</h3>
      <p v-if="searchQuery">Deine Suche ergab keine Treffer. Versuche es mit einem anderen Suchbegriff.</p>
      <p v-else>Du hast noch keine Freunde hinzugefügt. Lade Freunde ein, um zu beginnen.</p>
      <button v-if="searchQuery" @click="clearSearch" class="reset-button">
        <ArrowPathIcon class="button-icon" />
        Suche zurücksetzen
      </button>
      <button v-else @click="showInviteModal" class="reset-button">
        <EnvelopeIcon class="button-icon" />
        Freunde einladen
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, type PropType } from "vue";
import {
  UserGroupIcon,
  ChatBubbleLeftIcon,
  EllipsisVerticalIcon,
  ArrowPathIcon,
  EnvelopeIcon,
} from "@heroicons/vue/24/outline";
import type { Friend } from "@/types/Friends.types";

export default defineComponent({
  name: "FriendsList",
  components: {
    UserGroupIcon,
    ChatBubbleLeftIcon,
    EllipsisVerticalIcon,
    ArrowPathIcon,
    EnvelopeIcon,
  },
  props: {
    filteredFriends: {
      type: Array as PropType<Friend[]>,
      required: true,
    },
    searchQuery: {
      type: String,
      required: true,
    },
  },
  emits: ["unfriend", "clear-search", "show-invite-modal", "open-chat"],
  setup(_, { emit }) {
    const activeFriendMenu = ref<string | null>(null);

    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    };

    const toggleFriendMenu = (friendId: string) => {
      activeFriendMenu.value = activeFriendMenu.value === friendId ? null : friendId;
    };

    const unfriend = (friendId: string) => {
      emit("unfriend", friendId);
      activeFriendMenu.value = null;
    };

    const clearSearch = () => emit("clear-search");

    const showInviteModal = () => emit("show-invite-modal");

    const openChat = (friend: Friend) => {
      emit("open-chat", friend);
      console.log("FriendsList: open-chat event emitted"); // DEBUG
    };

    return {
      activeFriendMenu,
      getInitials,
      toggleFriendMenu,
      unfriend,
      clearSearch,
      showInviteModal,
      openChat,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;

// Gemeinsame Stile für Cards
.friends-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: map.get(vars.$spacing, l);

  @media (max-width: 768px) {
    justify-content: center;
  }
}

// Friend card styles
.friend-card {
  width: 700px;
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
  .friend-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
      transition: all 0.4s ease-out;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          border: 2px solid mixins.theme-color($theme, accent-green);
        }
      }
    }

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

    .online-indicator {
      position: absolute;
      bottom: 5px;
      right: 5px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: #4caf50;
      border: 2px solid white;
    }
  }

  // Info area
  .friend-info {
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

    .friend-bio {
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

    .friend-meta {
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

      .friend-since {
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
  .friend-actions {
    display: flex;
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
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, xs);

      &.message {
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: mixins.theme-gradient($theme, primary);
            color: white;
            transition: all 0.4s ease-out;

            &:hover {
              transform: translateY(-2px);
              @include mixins.shadow("small", $theme);
            }
          }
        }

        .button-icon {
          width: 16px;
          height: 16px;
        }
      }

      &.more {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            color: mixins.theme-color($theme, text-secondary);
            transition: all 0.4s ease-out;

            &:hover {
              background-color: mixins.theme-color($theme, hover-color);
            }
          }
        }

        .menu-icon {
          width: 18px;
          height: 18px;
        }
      }
    }

    // Friend menu
    .friend-menu {
      position: absolute;
      top: 50px;
      right: 20px;
      z-index: 10;
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      overflow: hidden;
      @include mixins.shadow("medium", "light");

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, card-bg);
          border: 1px solid mixins.theme-color($theme, border-light);
        }
      }

      button {
        width: 100%;
        padding: map.get(vars.$spacing, m);
        text-align: left;
        border: none;
        cursor: pointer;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: transparent;
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
