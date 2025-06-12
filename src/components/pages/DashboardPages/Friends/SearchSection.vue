<!-- src/components/pages/DashboardPages/Friends/SearchSection.vue -->
<template>
  <div class="search-section">
    <!-- Search Mode Toggle -->
    <div class="search-mode-toggle">
      <button 
        @click="searchMode = 'filter'"
        :class="{ active: searchMode === 'filter' }"
        class="mode-button"
      >
        <AdjustmentsHorizontalIcon class="mode-icon" />
        Freunde filtern
      </button>
      <button 
        @click="searchMode = 'users'"
        :class="{ active: searchMode === 'users' }"
        class="mode-button"
      >
        <UserPlusIcon class="mode-icon" />
        Neue Freunde finden
      </button>
    </div>

    <!-- Search Container -->
    <div class="search-container">
      <div class="search-input-wrapper">
        <MagnifyingGlassIcon class="search-icon" />
        <input 
          type="text" 
          :placeholder="searchMode === 'filter' ? 'Freunde suchen...' : 'Username suchen (z.B. @benutzername)'"
          v-model="searchQueryValue" 
          @input="onSearchInput"
          @keyup.enter="handleSearch"
          :disabled="isSearching"
        />
        <button 
          v-if="searchQueryValue" 
          @click="clearSearch" 
          class="clear-button"
          type="button"
        >
          <XMarkIcon class="clear-icon" />
        </button>
      </div>
      <button 
        v-if="searchMode === 'users'"
        @click="searchUsers" 
        class="search-button"
        :disabled="!isValidUsername || isSearching"
      >
        <span v-if="isSearching">Suche...</span>
        <span v-else>Suchen</span>
      </button>
    </div>

    <!-- Username validation hint -->
    <div v-if="searchMode === 'users' && searchQueryValue && !isValidUsername" class="validation-hint">
      <ExclamationTriangleIcon class="hint-icon" />
      <span>Bitte gib einen gültigen Username ein (mindestens 3 Zeichen, kann mit @ beginnen)</span>
    </div>

    <!-- User Search Result (Einzelnes Objekt) -->
    <div v-if="searchMode === 'users' && searchResult" class="search-results">
      <h4>
        <UsersIcon class="results-icon" />
        Benutzer gefunden
      </h4>
      <div class="user-result">
        <div class="user-card">
          <div class="user-avatar">
            <img 
              v-if="searchResult.profileImage" 
              :src="searchResult.profileImage" 
              :alt="searchResult.displayName || searchResult.username"
              class="avatar-image"
            />
            <span v-else class="avatar-placeholder">
              {{ getInitials(searchResult.displayName || searchResult.username) }}
            </span>
            <CheckBadgeIcon 
              v-if="searchResult.verified" 
              class="verified-badge" 
              title="Verifizierter Benutzer"
            />
          </div>
          
          <div class="user-info">
            <h5>{{ searchResult.displayName || searchResult.username }}</h5>
            <p class="username">@{{ searchResult.username }}</p>
            <div class="user-meta">
              <span class="user-type">
                <UserIcon class="meta-icon" />
                {{ searchResult.verified ? 'Verifiziert' : 'Benutzer' }}
              </span>
            </div>
          </div>

          <div class="user-actions">
            <!-- Anfragen Button oder Zurückziehen Button -->
            <button 
              v-if="!hasPendingRequest(searchResult.id)"
              @click="sendFriendRequest(searchResult.id, searchResult.displayName || searchResult.username)"
              :disabled="requestingUsers.has(searchResult.id)"
              class="action-button send-request"
            >
              <UserPlusIcon class="button-icon" />
              <span v-if="requestingUsers.has(searchResult.id)">Sende...</span>
              <span v-else>Anfragen</span>
            </button>

            <!-- Zurückziehen Button -->
            <button 
              v-else
              @click="cancelFriendRequest(searchResult.id, searchResult.displayName || searchResult.username)"
              :disabled="cancellingUsers.has(searchResult.id)"
              class="action-button cancel-request"
            >
              <XMarkIcon class="button-icon" />
              <span v-if="cancellingUsers.has(searchResult.id)">Ziehe zurück...</span>
              <span v-else>Anfrage zurückziehen</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty Search Results -->
    <div v-else-if="searchMode === 'users' && hasSearched && !isSearching && !searchResult" class="empty-search-results">
      <div class="empty-icon">
        <MagnifyingGlassIcon class="empty-icon-svg" />
      </div>
      <h4>Kein Benutzer gefunden</h4>
      <p>Der Username "{{ searchQueryValue }}" wurde nicht gefunden. Überprüfe die Schreibweise.</p>
    </div>

    <!-- Search Hints -->
    <div v-if="searchMode === 'users' && !hasSearched && !isSearching" class="search-hints">
      <div class="hint-icon">
        <InformationCircleIcon class="hint-icon-svg" />
      </div>
      <h4>Username-Suche</h4>
      <ul>
        <li>Suche nach dem exakten Username (z.B. @sarah_mueller oder sarah_mueller)</li>
        <li>Mindestens 3 Zeichen erforderlich</li>
        <li>Groß- und Kleinschreibung wird ignoriert</li>
        <li>Nur aktive, nicht gelöschte Benutzer werden angezeigt</li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed, type PropType } from 'vue';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  UserPlusIcon,
  UsersIcon,
  CheckBadgeIcon,
  UserIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline';
import friendService from '@/services/friend.service';

interface SearchUser {
  id: string;
  username: string;
  displayName?: string;
  profileImage: string | null;
  verified?: boolean;
}

interface SentRequest {
  id: string;
  receiverId: string;
  status: string;
  receiver: {
    id: string;
    username: string;
    profilePicture: string | null;
  };
}

export default defineComponent({
  name: 'SearchSection',
  components: {
    MagnifyingGlassIcon,
    XMarkIcon,
    AdjustmentsHorizontalIcon,
    UserPlusIcon,
    UsersIcon,
    CheckBadgeIcon,
    UserIcon,
    InformationCircleIcon,
    ExclamationTriangleIcon
  },
  props: {
    searchQuery: {
      type: String,
      required: true
    },
    sentRequests: {
      type: Array as PropType<SentRequest[]>,
      required: true
    }
  },
  emits: [
    'update:searchQuery', 
    'filter-friends', 
    'friend-request-sent', 
    'friend-request-cancelled',
    'show-toast'
  ],
  setup(props, { emit }) {
    // State
    const searchQueryValue = ref(props.searchQuery);
    const searchMode = ref<'filter' | 'users'>('filter');
    const searchResult = ref<SearchUser | null>(null);
    const isSearching = ref(false);
    const hasSearched = ref(false);
    const requestingUsers = ref(new Set<string>());
    const cancellingUsers = ref(new Set<string>());

    // Debounced search
    let searchTimeout: NodeJS.Timeout | null = null;

    // Computed - Username validation
    const isValidUsername = computed(() => {
      if (searchMode.value !== 'users') return true;
      const cleanUsername = searchQueryValue.value.replace(/^@/, '').trim();
      return cleanUsername.length >= 3;
    });

    // Prüft ob für einen User bereits eine pending Anfrage existiert
    const hasPendingRequest = (userId: string): boolean => {
      return props.sentRequests.some(req => 
        req.receiverId === userId && req.status === 'PENDING'
      );
    };

    // Findet die Request ID für einen User
    const findRequestId = (userId: string): string | null => {
      const request = props.sentRequests.find(req => 
        req.receiverId === userId && req.status === 'PENDING'
      );
      return request?.id || null;
    };

    // Methods für Filter-Modus
    const onSearchInput = () => {
      if (searchMode.value === 'filter') {
        emit('update:searchQuery', searchQueryValue.value);
        
        if (searchTimeout) {
          clearTimeout(searchTimeout);
        }
        
        searchTimeout = setTimeout(() => {
          emit('filter-friends');
        }, 300);
      }
    };

    // Watchers
    watch(() => props.searchQuery, (newValue) => {
      searchQueryValue.value = newValue;
    });

    // Methods
    const getInitials = (name: string) => {
      return (name || 'U')
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    const normalizeUsername = (username: string) => {
      return username.replace(/^@/, '').trim();
    };

    const handleSearch = () => {
      if (searchMode.value === 'users') {
        searchUsers();
      }
    };

    const searchUsers = async () => {
      const query = normalizeUsername(searchQueryValue.value);
      
      if (!isValidUsername.value) {
        emit('show-toast', 'Username muss mindestens 3 Zeichen lang sein.', 'error');
        return;
      }

      isSearching.value = true;
      hasSearched.value = true;

      try {
        const user = await friendService.searchUsers(query);
        
        if (!user) {
          searchResult.value = null;
          emit('show-toast', `Username "${query}" nicht gefunden.`, 'info');
          return;
        }
        
        searchResult.value = user;
      } catch (error: any) {
        console.error('Search error:', error);
        emit('show-toast', 'Fehler bei der Suche. Versuche es später erneut.', 'error');
        searchResult.value = null;
      } finally {
        isSearching.value = false;
      }
    };

    const clearSearch = () => {
      searchQueryValue.value = '';
      searchResult.value = null;
      hasSearched.value = false;
      
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      if (searchMode.value === 'filter') {
        emit('update:searchQuery', '');
        emit('filter-friends');
      }
    };

    const sendFriendRequest = async (userId: string, displayName: string) => {
      if (requestingUsers.value.has(userId)) return;

      requestingUsers.value.add(userId);

      try {
        await friendService.sendFriendRequest(userId);
        
        emit('show-toast', `Freundschaftsanfrage an ${displayName} gesendet!`, 'success');
        emit('friend-request-sent', { userId, displayName });
        
        // Card bleibt sichtbar - State wird durch sentRequests Update geändert
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Fehler beim Senden der Anfrage';
        emit('show-toast', errorMessage, 'error');
      } finally {
        requestingUsers.value.delete(userId);
      }
    };

    const cancelFriendRequest = async (userId: string, displayName: string) => {
      if (cancellingUsers.value.has(userId)) return;

      const requestId = findRequestId(userId);
      if (!requestId) {
        emit('show-toast', 'Anfrage nicht gefunden.', 'error');
        return;
      }

      cancellingUsers.value.add(userId);

      try {
        await friendService.cancelFriendRequest(requestId);
        
        emit('show-toast', `Freundschaftsanfrage an ${displayName} zurückgezogen.`, 'info');
        emit('friend-request-cancelled', { userId, displayName });
        
        // Card bleibt sichtbar - State wird durch sentRequests Update geändert
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Fehler beim Zurückziehen der Anfrage';
        emit('show-toast', errorMessage, 'error');
      } finally {
        cancellingUsers.value.delete(userId);
      }
    };

    // Watch search mode change
    watch(searchMode, (newMode) => {
      clearSearch();
      if (newMode === 'filter') {
        emit('update:searchQuery', '');
        emit('filter-friends');
      }
    });

    return {
      searchQueryValue,
      searchMode,
      searchResult,
      isSearching,
      hasSearched,
      requestingUsers,
      cancellingUsers,
      isValidUsername,
      hasPendingRequest,
      getInitials,
      onSearchInput,
      handleSearch,
      searchUsers,
      clearSearch,
      sendFriendRequest,
      cancelFriendRequest,
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;

.search-section {
  display: flex;
  flex-direction: column;
  gap: map.get(vars.$spacing, m);

  .search-mode-toggle {
    display: flex;
    gap: map.get(vars.$spacing, s);
    margin-bottom: map.get(vars.$spacing, m);

    .mode-button {
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, xs);
      padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      cursor: pointer;
      border: none;
      transition: all 0.3s;

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

      .mode-icon {
        width: 16px;
        height: 16px;
      }
    }
  }

  .search-container {
    display: flex;
    gap: map.get(vars.$spacing, m);
    align-items: center;

    .search-input-wrapper {
      flex: 1;
      position: relative;

      .search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        width: 20px;
        height: 20px;
        z-index: 1;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
            transition: all 0.4s ease-out;
          }
        }
      }

      input {
        width: 100%;
        padding: map.get(vars.$spacing, m) 44px map.get(vars.$spacing, m) 44px;
        padding-left: 2.5rem !important;
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        font-size: map.get(map.get(vars.$fonts, sizes), medium);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            @include mixins.form-element($theme);
            transition: all 0.4s ease-out;

            &:focus + .search-icon {
              color: mixins.theme-color($theme, accent-teal);
            }

            &:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }
          }
        }
      }

      .clear-button {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 50%;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
            transition: all 0.4s ease-out;

            &:hover {
              background-color: mixins.theme-color($theme, secondary-bg);
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }

        .clear-icon {
          width: 16px;
          height: 16px;
        }
      }
    }

    .search-button {
      padding: map.get(vars.$spacing, m) map.get(vars.$spacing, l);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      border: none;
      cursor: pointer;
      min-width: 100px;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, primary);
          color: white;
          transition: all 0.4s ease-out;

          &:hover:not(:disabled) {
            transform: translateY(-2px);
            @include mixins.shadow('small', $theme);
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }
        }
      }
    }
  }

  .validation-hint {
    display: flex;
    align-items: center;
    gap: map.get(vars.$spacing, s);
    padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);
    font-size: map.get(map.get(vars.$fonts, sizes), small);

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: rgba(255, 193, 7, 0.1);
        color: #856404;
        border: 1px solid rgba(255, 193, 7, 0.2);
        transition: all 0.4s ease-out;
      }
    }

    .hint-icon {
      width: 16px;
      height: 16px;
      color: #ffc107;
    }
  }

  .search-results {
    h4 {
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, s);
      font-size: map.get(map.get(vars.$fonts, sizes), large);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      margin-bottom: map.get(vars.$spacing, m);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
          transition: all 0.4s ease-out;
        }
      }

      .results-icon {
        width: 20px;
        height: 20px;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, accent-teal);
          }
        }
      }
    }

    .user-result {
      display: flex;
      justify-content: center;

      .user-card {
        display: flex;
        align-items: center;
        padding: map.get(vars.$spacing, m);
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);
        gap: map.get(vars.$spacing, m);
        max-width: 500px;
        width: 100%;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, card-bg);
            border: 1px solid mixins.theme-color($theme, border-light);
            transition: all 0.4s ease-out;

            &:hover {
              transform: translateY(-2px);
              @include mixins.shadow('small', $theme);
              border-color: mixins.theme-color($theme, border-medium);
            }
          }
        }

        .user-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          position: relative;
          flex-shrink: 0;

          .avatar-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
          }

          .avatar-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            font-weight: map.get(map.get(vars.$fonts, weights), bold);
            font-size: map.get(map.get(vars.$fonts, sizes), small);

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background-color: mixins.theme-color($theme, secondary-bg);
                color: mixins.theme-color($theme, text-primary);
                border: 2px solid mixins.theme-color($theme, border-light);
                transition: all 0.4s ease-out;
              }
            }
          }

          .verified-badge {
            position: absolute;
            bottom: -2px;
            right: -2px;
            width: 18px;
            height: 18px;
            color: #1DA1F2;
            background-color: white;
            border-radius: 50%;
            padding: 2px;
          }
        }

        .user-info {
          flex: 1;
          min-width: 0;

          h5 {
            font-size: map.get(map.get(vars.$fonts, sizes), medium);
            font-weight: map.get(map.get(vars.$fonts, weights), bold);
            margin: 0 0 map.get(vars.$spacing, xxs) 0;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-primary);
                transition: all 0.4s ease-out;
              }
            }
          }

          .username {
            font-size: map.get(map.get(vars.$fonts, sizes), small);
            margin: 0 0 map.get(vars.$spacing, xs) 0;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-secondary);
                transition: all 0.4s ease-out;
              }
            }
          }

          .user-meta {
            display: flex;
            align-items: center;

            .user-type {
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: map.get(map.get(vars.$fonts, sizes), xs);
              padding: 2px 8px;
              border-radius: map.get(map.get(vars.$layout, border-radius), pill);

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background-color: mixins.theme-color($theme, secondary-bg);
                  color: mixins.theme-color($theme, text-tertiary);
                  transition: all 0.4s ease-out;
                }
              }

              .meta-icon {
                width: 12px;
                height: 12px;
              }
            }
          }
        }

        .user-actions {
          .action-button {
            padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, s);
            border-radius: map.get(map.get(vars.$layout, border-radius), pill);
            font-size: map.get(map.get(vars.$fonts, sizes), small);
            font-weight: map.get(map.get(vars.$fonts, weights), medium);
            cursor: pointer;
            border: none;
            display: flex;
            align-items: center;
            gap: map.get(vars.$spacing, xs);

            &.send-request {
              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background-color: mixins.theme-color($theme, accent-teal);
                  color: white;
                  transition: all 0.4s ease-out;

                  &:hover:not(:disabled) {
                    transform: translateY(-1px);
                    @include mixins.shadow('xs', $theme);
                  }

                  &:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                  }
                }
              }
            }

            &.cancel-request {
              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background-color: #ff6b6b;
                  color: white;
                  transition: all 0.4s ease-out;

                  &:hover:not(:disabled) {
                    transform: translateY(-1px);
                    @include mixins.shadow('xs', $theme);
                    background-color: #ff5252;
                  }

                  &:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                  }
                }
              }
            }

            .button-icon {
              width: 14px;
              height: 14px;
            }
          }
        }
      }
    }
  }

  .empty-search-results,
  .search-hints {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: map.get(vars.$spacing, xl);

    .empty-icon,
    .hint-icon {
      margin-bottom: map.get(vars.$spacing, m);

      .empty-icon-svg,
      .hint-icon-svg {
        width: 48px;
        height: 48px;
        opacity: 0.5;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
            transition: all 0.4s ease-out;
          }
        }
      }
    }

    h4 {
      font-size: map.get(map.get(vars.$fonts, sizes), large);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      margin-bottom: map.get(vars.$spacing, s);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
          transition: all 0.4s ease-out;
        }
      }
    }

    p {
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
          transition: all 0.4s ease-out;
        }
      }
    }
  }

  .search-hints {
    ul {
      list-style: none;
      padding: 0;
      margin: map.get(vars.$spacing, s) 0 0 0;

      li {
        padding: map.get(vars.$spacing, xs) 0;
        position: relative;
        padding-left: map.get(vars.$spacing, m);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
            transition: all 0.4s ease-out;
          }
        }

        &::before {
          content: '•';
          position: absolute;
          left: 0;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, accent-teal);
            }
          }
        }
      }
    }
  }
}
</style>