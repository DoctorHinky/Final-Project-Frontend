<!-- src/components/pages/DashboardPages/Friends/SuggestionsList.vue -->
<template>
  <div class="suggestions-list">
    <div v-if="friendSuggestions.length > 0" class="suggestions-grid">
      <div v-for="suggestion in friendSuggestions" :key="suggestion.id" class="suggestion-card">
        <div class="suggestion-avatar">
          <span class="avatar-placeholder">{{ getInitials(suggestion.name) }}</span>
        </div>
        <div class="suggestion-info">
          <h3>{{ suggestion.name }}</h3>
          <p class="suggestion-bio">{{ suggestion.bio }}</p>
          <div class="suggestion-meta">
            <span v-if="suggestion.mutualFriends" class="mutual-friends">
              {{ suggestion.mutualFriends }} gemeinsame Freunde
            </span>
            <span v-if="suggestion.matchReason" class="match-reason">
              {{ suggestion.matchReason }}
            </span>
          </div>
        </div>
        <div class="suggestion-actions">
          <button class="action-button add" @click="sendRequest(suggestion.id)">Anfragen</button>
          <button class="action-button ignore" @click="ignoreSuggestion(suggestion.id)">Ignorieren</button>
        </div>
      </div>
    </div>

    <!-- Leerer Zustand für Empfehlungen -->
    <div v-else class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3>Keine Empfehlungen vorhanden</h3>
      <p>Derzeit gibt es keine Freundschaftsempfehlungen für dich.</p>
      <button class="reset-button invite-button" @click="showInviteModal">
        <span class="invite-icon">✉️</span>
        Freunde einladen
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

interface FriendSuggestion {
  id: number;
  name: string;
  bio: string;
  mutualFriends: number;
  matchReason: string;
}

export default defineComponent({
  name: 'SuggestionsList',
  props: {
    friendSuggestions: {
      type: Array as PropType<FriendSuggestion[]>,
      required: true
    }
  },
  emits: ['send-request', 'ignore-suggestion', 'show-invite-modal'],
  setup(_, { emit }) {
    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
    };

    const sendRequest = (suggestionId: number) => {
      emit('send-request', suggestionId);
    };

    const ignoreSuggestion = (suggestionId: number) => {
      emit('ignore-suggestion', suggestionId);
    };

    const showInviteModal = () => {
      emit('show-invite-modal');
    };

    return {
      getInitials,
      sendRequest,
      ignoreSuggestion,
      showInviteModal
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;

.suggestions-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: map.get(vars.$spacing, l);

  @media (max-width: 768px) {
    justify-content: center;
  }
}

// Suggestion card styles
.suggestion-card {
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
  .suggestion-avatar {
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
  }

  // Info area
  .suggestion-info {
    flex: 1;
    min-width: 0;

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

    .suggestion-bio {
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

    .suggestion-meta {
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

      .mutual-friends,
      .match-reason {
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
  .suggestion-actions {
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

      &.add {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, accent-teal);
            color: white;

            &:hover {
              transform: translateY(-2px);
              @include mixins.shadow('small', $theme);
            }
          }
        }
      }

      &.ignore {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: transparent;
            color: #ff6b6b; // Red for ignore
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
</style>