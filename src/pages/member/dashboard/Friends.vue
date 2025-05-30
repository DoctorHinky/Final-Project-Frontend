<!-- src/components/member/dashboard/Friends.vue -->
<template>
  <div class="friends-dashboard">
    <div class="page-header">
      <h2>Meine Freunde</h2>
      <p>Verbinde dich mit anderen Eltern und tausche dich über Erfahrungen aus</p>
    </div>

    <!-- Freunde-Statistik-Karten -->
    <friends-stats
      :friends-count="friendsCount"
      :pending-requests-count="pendingRequestsCount"
      :suggestions-count="suggestionsCount"
    />

    <!-- Tabs für Freunde, Anfragen und Empfehlungen -->
    <friends-tabs :tabs="tabs" :active-tab="activeTab" @update:active-tab="activeTab = $event" />

    <!-- Suchleiste -->
    <search-section
      v-if="activeTab === 'friends'"
      :search-query="searchQuery"
      @update:search-query="searchQuery = $event"
      @filter-friends="filterFriends"
    />

    <!-- Freunde-Liste -->
    <friends-list
      v-if="activeTab === 'friends'"
      :filtered-friends="filteredFriends"
      :search-query="searchQuery"
      @unfriend="unfriend"
      @clear-search="clearSearch"
      @show-suggestions="activeTab = 'suggestions'"
    />

    <!-- Anfragen-Liste -->
    <requests-list
      v-if="activeTab === 'requests'"
      :pending-requests="pendingRequests"
      @accept-request="acceptRequest"
      @decline-request="declineRequest"
      @show-suggestions="activeTab = 'suggestions'"
    />

    <!-- Empfehlungen-Liste -->
    <suggestions-list
      v-if="activeTab === 'suggestions'"
      :friend-suggestions="friendSuggestions"
      @send-request="sendRequest"
      @ignore-suggestion="ignoreSuggestion"
      @show-invite-modal="showInviteModal = true"
    />

    <!-- Einladungs-Modal -->
    <invite-modal
      :is-visible="showInviteModal"
      :invite-email="inviteEmail"
      :invite-message="inviteMessage"
      @update:is-visible="showInviteModal = $event"
      @update:invite-email="inviteEmail = $event"
      @update:invite-message="inviteMessage = $event"
      @send-invite="sendInvite"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import {
  FriendsStats,
  FriendsTabs,
  SearchSection,
  FriendsList,
  RequestsList,
  SuggestionsList,
  InviteModal,
} from "@/components/pages/DashboardPages/Friends";

export interface Friend {
  id: number;
  name: string;
  bio: string;
  friendSince: string;
  sharedInterests: number;
  isOnline: boolean;
}

export interface FriendRequest {
  id: number;
  name: string;
  message: string;
  requestDate: string;
  mutualFriends: number;
}

export interface FriendSuggestion {
  id: number;
  name: string;
  bio: string;
  mutualFriends: number;
  matchReason: string;
}

export default defineComponent({
  name: "FriendsDashboard",
  components: {
    FriendsStats,
    FriendsTabs,
    SearchSection,
    FriendsList,
    RequestsList,
    SuggestionsList,
    InviteModal,
  },
  setup() {
    // Status
    const activeTab = ref("friends");
    const searchQuery = ref("");
    const showInviteModal = ref(false);
    const inviteEmail = ref("");
    const inviteMessage = ref("");

    // Tabs
    const tabs = ref([
      { id: "friends", name: "Meine Freunde" },
      { id: "requests", name: "Anfragen" },
      { id: "suggestions", name: "Empfehlungen" },
    ]);

    // Beispieldaten (später durch API-Daten ersetzen)
    const friends = ref<Friend[]>([
      {
        id: 1,
        name: "Sarah Müller",
        bio: "Mutter von zwei Jungs (3 und 6 Jahre). Leidenschaftliche Hobbyköchin und Outdoor-Fan.",
        friendSince: "15.03.2025",
        sharedInterests: 4,
        isOnline: true,
      },
      {
        id: 2,
        name: "Michael Weber",
        bio: "Vater einer Tochter (4). Software-Entwickler und Fotografie-Enthusiast.",
        friendSince: "02.04.2025",
        sharedInterests: 2,
        isOnline: false,
      },
      {
        id: 3,
        name: "Lisa Becker",
        bio: "Mutter von Zwillingen (7). Lehrerin und Yoga-Liebhaberin.",
        friendSince: "20.04.2025",
        sharedInterests: 3,
        isOnline: true,
      },
    ]);

    const pendingRequests = ref<FriendRequest[]>([
      {
        id: 101,
        name: "Thomas Schmidt",
        message: "Hallo! Ich habe gesehen, dass wir beide Interesse an Montessori-Pädagogik haben.",
        requestDate: "01.05.2025",
        mutualFriends: 1,
      },
      {
        id: 102,
        name: "Julia Fischer",
        message: "",
        requestDate: "03.05.2025",
        mutualFriends: 0,
      },
    ]);

    const friendSuggestions = ref<FriendSuggestion[]>([
      {
        id: 201,
        name: "Markus Wagner",
        bio: "Vater von zwei Kindern (5 und 8). IT-Berater und Hobbymusiker.",
        mutualFriends: 2,
        matchReason: "Interesse an Musikerziehung",
      },
      {
        id: 202,
        name: "Anna Schulz",
        bio: "Mutter eines Jungen (3). Kinderärztin und Autorin eines Elternblogs.",
        mutualFriends: 0,
        matchReason: "Interesse an Gesundheit & Ernährung",
      },
      {
        id: 203,
        name: "Daniel Hoffmann",
        bio: "Vater von drei Kindern (2, 5, 7). Sportlehrer und Outdoor-Enthusiast.",
        mutualFriends: 1,
        matchReason: "Interesse an Outdoor-Aktivitäten mit Kindern",
      },
    ]);

    // Berechnete Eigenschaften
    const friendsCount = computed(() => friends.value.length);
    const pendingRequestsCount = computed(() => pendingRequests.value.length);
    const suggestionsCount = computed(() => friendSuggestions.value.length);

    // Nach Namen gefilterte Freunde
    const filteredFriends = computed(() => {
      if (!searchQuery.value.trim()) return friends.value;

      const query = searchQuery.value.toLowerCase();
      return friends.value.filter(
        (friend) => friend.name.toLowerCase().includes(query) || friend.bio.toLowerCase().includes(query)
      );
    });

    // Such-Handler
    const filterFriends = () => {
      // Implementierung bleibt einfach, da die Filterung über das computed property erfolgt
    };

    // Suche zurücksetzen
    const clearSearch = () => {
      searchQuery.value = "";
    };

    // Freund entfernen
    const unfriend = (friendId: number) => {
      const index = friends.value.findIndex((friend) => friend.id === friendId);
      if (index !== -1) {
        const friendName = friends.value[index].name;
        if (confirm(`Möchtest du die Freundschaft mit ${friendName} wirklich beenden?`)) {
          friends.value.splice(index, 1);
        }
      }
    };

    // Anfrage annehmen
    const acceptRequest = (requestId: number) => {
      const request = pendingRequests.value.find((req) => req.id === requestId);
      if (request) {
        // Anfrage annehmen und Freund hinzufügen
        friends.value.push({
          id: request.id,
          name: request.name,
          bio: "Neu hinzugefügter Freund",
          friendSince: new Date().toLocaleDateString("de-DE"),
          sharedInterests: request.mutualFriends,
          isOnline: false,
        });

        // Anfrage entfernen
        const index = pendingRequests.value.findIndex((req) => req.id === requestId);
        if (index !== -1) {
          pendingRequests.value.splice(index, 1);
        }
      }
    };

    // Anfrage ablehnen
    const declineRequest = (requestId: number) => {
      const index = pendingRequests.value.findIndex((req) => req.id === requestId);
      if (index !== -1) {
        pendingRequests.value.splice(index, 1);
      }
    };

    // Anfrage senden
    const sendRequest = (suggestionId: number) => {
      // Empfehlung entfernen (später durch tatsächliche Anfrage-Logik ersetzen)
      const index = friendSuggestions.value.findIndex((sug) => sug.id === suggestionId);
      if (index !== -1) {
        const suggestion = friendSuggestions.value[index];

        alert(`Freundschaftsanfrage an ${suggestion.name} wurde gesendet!`);

        friendSuggestions.value.splice(index, 1);
      }
    };

    // Empfehlung ignorieren
    const ignoreSuggestion = (suggestionId: number) => {
      const index = friendSuggestions.value.findIndex((sug) => sug.id === suggestionId);
      if (index !== -1) {
        friendSuggestions.value.splice(index, 1);
      }
    };

    // Einladung senden
    const sendInvite = () => {
      if (inviteEmail.value.trim()) {
        alert(`Einladung an ${inviteEmail.value} wurde gesendet!`);
        inviteEmail.value = "";
        inviteMessage.value = "";
        showInviteModal.value = false;
      }
    };

    return {
      activeTab,
      searchQuery,
      showInviteModal,
      inviteEmail,
      inviteMessage,
      tabs,
      friends,
      pendingRequests,
      friendSuggestions,
      friendsCount,
      pendingRequestsCount,
      suggestionsCount,
      filteredFriends,
      filterFriends,
      clearSearch,
      unfriend,
      acceptRequest,
      declineRequest,
      sendRequest,
      ignoreSuggestion,
      sendInvite,
    };
  },
});
</script>

<style lang="scss">
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;
@use "@/style/base/animations" as animations;

// Global styles for the Friends Dashboard
.friends-dashboard {
  @include animations.fade-in(0.5s);
  display: flex;
  flex-direction: column;
  gap: map.get(vars.$spacing, l);

  .page-header {
    margin-bottom: map.get(vars.$spacing, l);

    h2 {
      font-size: map.get(map.get(vars.$fonts, sizes), xxl);
      font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
      margin-bottom: map.get(vars.$spacing, xs);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
          transition: all 0.4s ease-out;
        }
      }
    }

    p {
      font-size: map.get(map.get(vars.$fonts, sizes), medium);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
          transition: all 0.4s ease-out;
        }
      }
    }
  }

  // Friends-Stats
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

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, card-bg);
          border: 1px solid mixins.theme-color($theme, border-light);
          transition: all 0.4s ease-out;

          &:hover {
            transform: translateY(-5px);
            @include mixins.shadow("medium", $theme);
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
        font-size: 1.5rem;
      }

      .stat-info {
        h3 {
          font-size: map.get(map.get(vars.$fonts, sizes), xl);
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
          margin: 0 0 map.get(vars.$spacing, xxs) 0;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
              transition: all 0.4s ease-out;
            }
          }
        }

        p {
          margin: 0;
          font-size: map.get(map.get(vars.$fonts, sizes), small);

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
              transition: all 0.4s ease-out;
            }
          }
        }
      }
    }
  }

  // Tabs
  .friends-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: map.get(vars.$spacing, s);
    margin-bottom: map.get(vars.$spacing, l);

    .tab-button {
      padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      cursor: pointer;
      transition: all 0.3s;
      border: none;

      @each $theme in ("light", "dark") {
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
    }
  }

  // Suchleiste
  .search-section {
    margin-bottom: map.get(vars.$spacing, l);

    .search-container {
      position: relative;
      width: 100%;

      input {
        width: 100%;
        padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl) map.get(vars.$spacing, m)
          map.get(vars.$spacing, m);
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        font-size: map.get(map.get(vars.$fonts, sizes), medium);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            @include mixins.form-element($theme);
            transition: all 0.4s ease-out;
          }
        }
      }

      .search-button {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.2rem;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
            transition: all 0.4s ease-out;
          }
        }
      }
    }
  }

  // Gemeinsame Stile für Grid-Ansichten
  .friends-grid,
  .requests-grid,
  .suggestions-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: map.get(vars.$spacing, l);

    @media (max-width: 768px) {
      justify-content: center;
    }
  }

  // Gemeinsame Card-Styles
  .friend-card,
  .request-card,
  .suggestion-card {
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
  }

  // Avatar styles
  .friend-avatar,
  .request-avatar,
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
      background-color: #4caf50; // Green for online
      border: 2px solid white;
    }
  }

  // Info styles
  .friend-info,
  .request-info,
  .suggestion-info {
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

    .friend-bio,
    .request-message,
    .suggestion-bio {
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

    .friend-meta,
    .request-meta,
    .suggestion-meta {
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

      .friend-since,
      .request-date,
      .mutual-friends,
      .match-reason,
      .shared-interests {
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
  .friend-actions,
  .request-actions,
  .suggestion-actions {
    display: flex;
    gap: map.get(vars.$spacing, s);
    align-items: flex-start;

    .request-actions,
    .suggestion-actions {
      flex-direction: column;
    }

    .action-button {
      padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;

      &.message,
      &.accept,
      &.add {
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
      }

      &.more {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        font-size: 18px;

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
      }

      &.accept {
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, accent-green);
            color: white;
          }
        }
      }

      &.decline,
      &.ignore {
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: transparent;
            color: #ff6b6b; // Red for decline/ignore
            border: 1px solid rgba(255, 107, 107, 0.3);
            transition: all 0.4s ease-out;

            &:hover {
              background-color: rgba(255, 107, 107, 0.1);
              border-color: rgba(255, 107, 107, 0.5);
            }
          }
        }
      }

      &.add {
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, accent-teal);
            color: white;
          }
        }
      }
    }

    // Freunde-Menü
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

  // Leerer Zustand
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: map.get(vars.$spacing, xxl);
    text-align: center;

    .empty-icon {
      font-size: 4rem;
      margin-bottom: map.get(vars.$spacing, l);
      opacity: 0.5;
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

      &.invite-button {
        .invite-icon {
          font-size: 1.2rem;
        }
      }
    }
  }

  // Modal-Styles
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;

    .modal-content {
      width: 90%;
      max-width: 500px;
      padding: map.get(vars.$spacing, xl);
      border-radius: map.get(map.get(vars.$layout, border-radius), large);
      position: relative;
      @include animations.fade-in(0.3s);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, card-bg);
          @include mixins.shadow("large", $theme);
          transition: all 0.4s ease-out;
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
        margin-bottom: map.get(vars.$spacing, l);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
            transition: all 0.4s ease-out;
          }
        }
      }

      .invite-form {
        display: flex;
        flex-direction: column;
        gap: map.get(vars.$spacing, m);

        input,
        textarea {
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              @include mixins.form-element($theme);
              transition: all 0.4s ease-out;
            }
          }
        }

        textarea {
          min-height: 100px;
          resize: vertical;
        }

        .send-invite-button {
          align-self: flex-end;
          padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
          border-radius: map.get(map.get(vars.$layout, border-radius), pill);
          font-weight: map.get(map.get(vars.$fonts, weights), medium);
          border: none;
          cursor: pointer;

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
        }
      }

      .close-modal {
        position: absolute;
        top: 15px;
        right: 15px;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        cursor: pointer;
        border: none;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: transparent;
            color: mixins.theme-color($theme, text-secondary);
            transition: all 0.4s ease-out;

            &:hover {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }
      }
    }
  }
}
</style>
