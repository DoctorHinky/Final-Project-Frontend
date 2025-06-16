<!-- src/pages/member/dashboard/Friends.vue -->
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
    />

    <!-- Tabs für Freunde, Anfragen -->
    <friends-tabs 
      :tabs="tabs" 
      :active-tab="activeTab" 
      @update:active-tab="activeTab = $event" 
    />

    <!-- Suchleiste -->
    <search-section
      v-if="activeTab === 'friends'"
      :search-query="searchQuery"
      @update:search-query="searchQuery = $event"
      @filter-friends="filterFriends"
      @friend-request-sent="onFriendRequestSent"
      @show-toast="showToast"
    />

    <!-- Loading States -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Lade Daten...</p>
    </div>

    <!-- Error States -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Fehler beim Laden</h3>
      <p>{{ error }}</p>
      <button @click="loadData" class="retry-button">Erneut versuchen</button>
    </div>

    <!-- Freunde-Liste -->
    <friends-list
      v-else-if="activeTab === 'friends'"
      :filtered-friends="filteredFriends"
      :search-query="searchQuery"
      @unfriend="unfriend"
      @clear-search="clearSearch"
      @show-invite-modal="showInviteModal = true"
      @open-chat="openChat"
    />

    <!-- Anfragen-Liste -->
    <requests-list
      v-else-if="activeTab === 'requests'"
      :pending-requests="pendingRequests"
      @accept-request="acceptRequest"
      @decline-request="declineRequest"
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

    <!-- Chat-Modal -->
    <chat-modal
      v-model:is-visible="showChatModal"
      :friend-id="selectedFriend?.friendId || selectedFriend?.id || ''"
      :friend-name="selectedFriend?.name || selectedFriend?.username || ''"
      :is-online="selectedFriend?.isOnline || false"
      @send-message="handleSendMessage"
    />

    <!-- Toast-Benachrichtigungen -->
    <div v-if="toast.show" class="toast-notification" :class="toast.type">
      <div class="toast-content">
        <span class="toast-icon">
          {{ toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️' }}
        </span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import {
  FriendsStats,
  FriendsTabs,
  SearchSection,
  FriendsList,
  RequestsList,
  InviteModal,
  ChatModal,
} from "@/components/pages/DashboardPages/Friends";
import friendService from "@/services/friend.service";
import type { Friend } from "@/types/Friend";
import type { FriendRequest } from "@/types/FriendRequest";
import type { Tab } from "@/types/Tab";

interface Toast {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default defineComponent({
  name: "FriendsDashboard",
  components: {
    FriendsStats,
    FriendsTabs,
    SearchSection,
    FriendsList,
    RequestsList,
    InviteModal,
    ChatModal,
  },
  setup() {
    // Reactive States
    const activeTab = ref("friends");
    const searchQuery = ref("");
    const showInviteModal = ref(false);
    const showChatModal = ref(false);
    const inviteEmail = ref("");
    const inviteMessage = ref("");
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const selectedFriend = ref<Friend | null>(null);

    // Data
    const friends = ref<Friend[]>([]);
    const pendingRequests = ref<FriendRequest[]>([]);

    // Toast-Benachrichtigungen
    const toast = ref<Toast>({
      show: false,
      message: '',
      type: 'success'
    });

    // Tabs
    const tabs = ref<Tab[]>([
      { id: "friends", name: "Meine Freunde" },
      { id: "requests", name: "Anfragen" },
    ]);

    // Computed Properties
    const friendsCount = computed(() => friends.value.length);
    const pendingRequestsCount = computed(() => pendingRequests.value.length);

    const filteredFriends = computed(() => {
      if (!searchQuery.value.trim()) return friends.value;

      const query = searchQuery.value.toLowerCase();
      return friends.value.filter(
        (friend) =>
          friend.name.toLowerCase().includes(query) ||
          friend.username.toLowerCase().includes(query) ||
          friend.bio?.toLowerCase().includes(query)
      );
    });

    // Toast-Helper
    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      toast.value = { show: true, message, type };
      setTimeout(() => {
        toast.value.show = false;
      }, 4000);
    };

    const onFriendRequestSent = (data: { userId: string; displayName: string }) => {
      showToast(`Freundschaftsanfrage an ${data.displayName} gesendet!`, 'success');
      console.log('Friend request sent to:', data.displayName);
    };

    // API-Funktionen
    const loadFriends = async () => {
      try {
        const response = await friendService.getAllFriendsOfUser();
        friends.value = response.data.map(friend => ({
          id: friend.id,
          friendId: friend.friendId,
          name: friend.username, // Falls kein displayName vorhanden
          username: friend.username,
          avatar: friend.profileImage,
          bio: "Neu hinzugefügter Freund", // Placeholder
          friendSince: new Date().toLocaleDateString("de-DE"),
          isOnline: Math.random() > 0.5, // Random für Demo
          sharedInterests: Math.floor(Math.random() * 5),
        }));
      } catch (err: any) {
        throw new Error(err.response?.data?.message || "Fehler beim Laden der Freunde");
      }
    };

    const loadPendingRequests = async () => {
      try {
        const response = await friendService.getAllPendingRequests();
        pendingRequests.value = response.data.map(request => ({
          id: request.id,
          senderId: request.senderId,
          name: request.username,
          username: request.username,
          avatar: request.profileImage,
          message: "Möchte mit dir befreundet sein.",
          requestDate: new Date().toLocaleDateString("de-DE"),
          mutualFriends: Math.floor(Math.random() * 3),
        }));
      } catch (err: any) {
        throw new Error(err.response?.data?.message || "Fehler beim Laden der Anfragen");
      }
    };

    const loadData = async () => {
      isLoading.value = true;
      error.value = null;

      try {
        await Promise.all([loadFriends(), loadPendingRequests()]);
      } catch (err: any) {
        error.value = err.message;
      } finally {
        isLoading.value = false;
      }
    };

    // Event Handlers
    const filterFriends = () => {
      // Filterung erfolgt über computed property
    };

    const clearSearch = () => {
      searchQuery.value = "";
    };

    const unfriend = async (friendId: string) => {
      const friend = friends.value.find((f) => f.id === friendId);
      if (!friend) return;

      if (confirm(`Möchtest du die Freundschaft mit ${friend.name} wirklich beenden?`)) {
        try {
          await friendService.removeFriend(friendId);
          friends.value = friends.value.filter((f) => f.id !== friendId);
          showToast(`Freundschaft mit ${friend.name} wurde beendet.`);
        } catch (err: any) {
          showToast(err.response?.data?.message || "Fehler beim Entfernen des Freundes", 'error');
        }
      }
    };

    const acceptRequest = async (requestId: string) => {
      try {
        await friendService.acceptFriendRequest(requestId);
        
        // Request aus der Liste entfernen
        const request = pendingRequests.value.find((req) => req.id === requestId);
        if (request) {
          pendingRequests.value = pendingRequests.value.filter((req) => req.id !== requestId);
          
          // Als neuen Freund hinzufügen
          const newFriend: Friend = {
            id: `friend_${Date.now()}`, // Temporäre ID
            friendId: request.senderId,
            name: request.name,
            username: request.username,
            avatar: request.avatar,
            bio: "Neu hinzugefügter Freund",
            friendSince: new Date().toLocaleDateString("de-DE"),
            isOnline: false,
            sharedInterests: 0,
          };
          friends.value.push(newFriend);
          
          showToast(`Freundschaftsanfrage von ${request.name} angenommen!`);
        }
      } catch (err: any) {
        showToast(err.response?.data?.message || "Fehler beim Annehmen der Anfrage", 'error');
      }
    };

    const declineRequest = async (requestId: string) => {
      try {
        await friendService.rejectFriendRequest(requestId);
        
        const request = pendingRequests.value.find((req) => req.id === requestId);
        pendingRequests.value = pendingRequests.value.filter((req) => req.id !== requestId);
        
        if (request) {
          showToast(`Freundschaftsanfrage von ${request.name} abgelehnt.`);
        }
      } catch (err: any) {
        showToast(err.response?.data?.message || "Fehler beim Ablehnen der Anfrage", 'error');
      }
    };

    const sendInvite = async () => {
      if (!inviteEmail.value.trim()) {
        showToast("Bitte gib eine E-Mail-Adresse ein.", 'error');
        return;
      }

      try {
        await friendService.sendEmailInvite(inviteEmail.value, inviteMessage.value);
        showToast(`Einladung an ${inviteEmail.value} wurde gesendet!`);
        
        // Modal schließen und Felder zurücksetzen
        inviteEmail.value = "";
        inviteMessage.value = "";
        showInviteModal.value = false;
      } catch (err: any) {
        showToast(err.response?.data?.message || "Fehler beim Senden der Einladung", 'error');
      }
    };

    // Chat-Funktionen
    const openChat = (friend: Friend) => {
      selectedFriend.value = friend;
      showChatModal.value = true;
    };

    const handleSendMessage = async ({ friendId, message }: { friendId: string | number; message: string }) => {
      try {
        await friendService.sendMessage(friendId.toString(), message);
        console.log('Message sent successfully to:', friendId);
      } catch (error) {
        console.error('Error sending message:', error);
        showToast('Fehler beim Senden der Nachricht', 'error');
      }
    };

    // Lifecycle
    onMounted(() => {
      loadData();
    });

    return {
      // State
      activeTab,
      searchQuery,
      showInviteModal,
      showChatModal,
      inviteEmail,
      inviteMessage,
      isLoading,
      error,
      toast,
      selectedFriend,
      
      // Data
      tabs,
      friends,
      pendingRequests,
      
      // Computed
      friendsCount,
      pendingRequestsCount,
      filteredFriends,
      
      // Methods
      loadData,
      filterFriends,
      clearSearch,
      unfriend,
      acceptRequest,
      declineRequest,
      sendInvite,
      openChat,
      handleSendMessage,
      onFriendRequestSent,
      showToast
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;
@use "@/style/base/animations" as animations;

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

  // Loading State
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: map.get(vars.$spacing, xxl);
    text-align: center;

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-left-color: #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: map.get(vars.$spacing, m);
    }

    p {
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  // Error State
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: map.get(vars.$spacing, xxl);
    text-align: center;

    .error-icon {
      font-size: 4rem;
      margin-bottom: map.get(vars.$spacing, l);
      opacity: 0.7;
    }

    h3 {
      font-size: map.get(map.get(vars.$fonts, sizes), xl);
      margin-bottom: map.get(vars.$spacing, m);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    p {
      margin-bottom: map.get(vars.$spacing, l);
      max-width: 500px;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }

    .retry-button {
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
            @include mixins.shadow('medium', $theme);
          }
        }
      }
    }
  }

  // Toast Notification
  .toast-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);
    padding: map.get(vars.$spacing, m);
    min-width: 300px;
    @include animations.fade-in(0.3s);

    &.success {
      background-color: rgba(76, 175, 80, 0.9);
      color: white;
    }

    &.error {
      background-color: rgba(244, 67, 54, 0.9);
      color: white;
    }

    &.info {
      background-color: rgba(33, 150, 243, 0.9);
      color: white;
    }

    .toast-content {
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, s);

      .toast-icon {
        font-size: 1.2rem;
      }

      .toast-message {
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
      }
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// Responsive Design
@media (max-width: 768px) {
  .friends-dashboard {
    padding: map.get(vars.$spacing, m);
  }

  .toast-notification {
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
</style>