<!-- src/components/pages/DashboardPages/Friends/FriendsList.vue -->
<template>
  <div class="friends-list">
    <div v-if="filteredFriends.length > 0" class="friends-grid">
      <div v-for="friend in filteredFriends" :key="friend.id" class="friend-card">
        <div class="friend-avatar">
          <span class="avatar-placeholder">{{ getInitials(friend.name) }}</span>
          <span v-if="friend.isOnline" class="online-indicator"></span>
        </div>
        <div class="friend-info">
          <h3>{{ friend.name }}</h3>
          <p class="friend-bio">{{ friend.bio }}</p>
          <div class="friend-meta">
            <span class="friend-since">Freunde seit {{ friend.friendSince }}</span>
            <span class="shared-interests">{{ friend.sharedInterests }} gemeinsame Interessen</span>
          </div>
        </div>
        <div class="friend-actions">
          <button class="action-button message">Nachricht</button>
          <button class="action-button more" @click.stop="toggleFriendMenu(friend.id)">⋮</button>
          <div v-if="activeFriendMenu === friend.id" class="friend-menu">
            <button @click="unfriend(friend.id)">Freundschaft beenden</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Leerer Zustand für Freunde -->
    <div v-else class="empty-state">
      <div class="empty-icon">👥</div>
      <h3>Keine Freunde gefunden</h3>
      <p v-if="searchQuery">Deine Suche ergab keine Treffer. Versuche es mit einem anderen Suchbegriff.</p>
      <p v-else>Du hast noch keine Freunde hinzugefügt. Entdecke Empfehlungen oder lade Freunde ein.</p>
      <button v-if="searchQuery" @click="clearSearch" class="reset-button">Suche zurücksetzen</button>
      <button v-else @click="showSuggestions" class="reset-button">Empfehlungen anzeigen</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue';

interface Friend {
  id: number;
  name: string;
  bio: string;
  friendSince: string;
  sharedInterests: number;
  isOnline: boolean;
}

export default defineComponent({
  name: 'FriendsList',
  props: {
    filteredFriends: {
      type: Array as PropType<Friend[]>,
      required: true
    },
    searchQuery: {
      type: String,
      required: true
    }
  },
  emits: ['unfriend', 'clear-search', 'show-suggestions'],
  setup(_, { emit }) {
    const activeFriendMenu = ref<number | null>(null);

    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
    };

    const toggleFriendMenu = (friendId: number) => {
      activeFriendMenu.value = activeFriendMenu.value === friendId ? null : friendId;
    };

    const unfriend = (friendId: number) => {
      emit('unfriend', friendId);
      activeFriendMenu.value = null;
    };

    const clearSearch = () => {
      emit('clear-search');
    };

    const showSuggestions = () => {
      emit('show-suggestions');
    };

    return {
      activeFriendMenu,
      getInitials,
      toggleFriendMenu,
      unfriend,
      clearSearch,
      showSuggestions
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;

// Gemeinsame Stile für Cards
.friends-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: map.get(vars.$spacing, l); // Adjusted spacing for better alignment

  @media (max-width: 768px) {
    justify-content: center; // Center align cards on smaller screens
  }
}

// Friend card styles
.friend-card {
  width: 600px;
  display: flex;
  padding: map.get(vars.$spacing, l);
  border-radius: map.get(map.get(vars.$layout, border-radius), medium);
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  gap: map.get(vars.$spacing, m);
  overflow: hidden;

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, card-bg);
      border: 1px solid mixins.theme-color($theme, border-light);
      transition: all 0.4s ease-out;

      &:hover {
        transform: translateY(-4px);
        @include mixins.shadow('medium', $theme);
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

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, secondary-bg);
        border: 2px solid mixins.theme-color($theme, accent-green);
        transition: all 0.4s ease-out;
      }
    }

    .avatar-placeholder {
      font-size: 2rem;
      font-weight: map.get(map.get(vars.$fonts, weights), bold);

      @each $theme in ('light', 'dark') {
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
      background-color: #4CAF50; // Green for online
      border: 2px solid white;
    }
  }

  // Info area
  .friend-info {
    flex: 1;
    min-width: 0; // For text truncation

    h3 {
      margin: 0 0 map.get(vars.$spacing, xs) 0;
      font-size: map.get(map.get(vars.$fonts, sizes), large);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);

      @each $theme in ('light', 'dark') {
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

      @each $theme in ('light', 'dark') {
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

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-tertiary);
          transition: all 0.4s ease-out;
        }
      }

      .friend-since,
      .shared-interests {
        padding: 4px 10px;
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        white-space: nowrap;

        @each $theme in ('light', 'dark') {
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

      &.message {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: mixins.theme-gradient($theme, primary);
            color: white;
            transition: all 0.4s ease-out;

            &:hover {
              transform: translateY(-2px);
              @include mixins.shadow('small', $theme);
            }
          }
        }
      }

      &.more {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        font-size: 18px;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            color: mixins.theme-color($theme, text-secondary);
            transition: all 0.4s ease-out;

            &:hover {
              background-color: mixins.theme-color($theme, hover-color);
            }
          }
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
      @include mixins.shadow('medium', 'light');

      @each $theme in ('light', 'dark') {
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

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: transparent;
            color: #ff6b6b; // Red for delete
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