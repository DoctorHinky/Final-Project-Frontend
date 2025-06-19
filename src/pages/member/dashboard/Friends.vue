<!-- src/pages/member/dashboard/Friends.vue -->
<template>
  <div class="friends-dashboard">
    <div class="page-header">
      <h2>Meine Freunde</h2>
      <p>Verbinde dich mit anderen Eltern und tausche dich über Erfahrungen aus</p>
    </div>

    <!-- Freunde-Statistik-Karten -->
    <friends-stats :friends-count="friendsCount" :pending-requests-count="pendingRequestsCount" />

    <!-- Tabs für Freunde, Anfragen -->
    <friends-tabs
      :tabs="tabs"
      :active-tab="activeTab"
      :pending-requests-count="pendingRequestsCount"
      :unread-messages-count="unreadMessagesCount"
      @update:active-tab="activeTab = $event"
    />

    <!-- Suchleiste -->
    <search-section
      v-if="activeTab === 'friends'"
      :search-query="searchQuery"
      :sent-requests="sentRequests"
      @update:search-query="searchQuery = $event"
      @filter-friends="filterFriends"
      @friend-request-sent="onFriendRequestSent"
      @friend-request-cancelled="onFriendRequestCancelled"
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
    />

    <!-- Chat-Modal -->
    <chat-modal
      v-model:is-visible="showChatModal"
      :friend-id="selectedFriend?.friendId || selectedFriend?.id || ''"
      :friend-name="selectedFriend?.name || selectedFriend?.username || ''"
      :is-online="selectedFriend?.isOnline || false"
      :friend-profile-image="selectedFriend?.profileImage || ''"
      @send-message="handleSendMessage"
      @show-toast="showToast"
    />

    <!-- Toast-Benachrichtigungen -->
    <div v-if="toast.show" class="toast-notification" :class="toast.type">
      <div class="toast-content">
        <span class="toast-icon">
          {{ toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "ℹ️" }}
        </span>
        <span class="toast-message">{{ toast.message }}</span>
        <button class="toast-close" @click="toast.show = false">×</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from "vue";
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
import type {
  Friend,
  FriendRequest,
  Tab,
  Toast,
  SentRequest,
  FriendRequestEvent,
  ChatMessageEvent,
} from "@/types/Friends.types";
import chatService from "@/services/chat.service";

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
    const sentRequests = ref<SentRequest[]>([]);
    const unreadMessagesCount = ref(0);

    // Toast-Benachrichtigungen
    const toast = ref<Toast>({
      show: false,
      message: "",
      type: "success",
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
          friend.name?.toLowerCase().includes(query) ||
          friend.username?.toLowerCase().includes(query) ||
          friend.bio?.toLowerCase().includes(query)
      );
    });

    // Ungelesene Nachrichten laden - KORRIGIERTE VERSION
    const loadUnreadMessagesCount = async () => {
      try {
        // Verwende die getTotalUnreadMessagesCount Methode vom friendService
        const totalUnread = await friendService.getTotalUnreadMessagesCount();
        unreadMessagesCount.value = totalUnread;

        // Event für MemberSidebar senden
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("unread-messages-updated", {
              detail: { count: totalUnread },
            })
          );
        }
      } catch (error) {
        console.error("Fehler beim Laden der ungelesenen Nachrichten:", error);
        unreadMessagesCount.value = 0;
      }
    };

    // Polling für ungelesene Nachrichten
    let unreadMessagesInterval: ReturnType<typeof setInterval> | null = null;

    const startUnreadMessagesPolling = () => {
      // Initial laden
      loadUnreadMessagesCount();

      // Alle 30 Sekunden aktualisieren
      unreadMessagesInterval = setInterval(() => {
        loadUnreadMessagesCount();
      }, 30000);
    };

    const stopUnreadMessagesPolling = () => {
      if (unreadMessagesInterval) {
        clearInterval(unreadMessagesInterval);
        unreadMessagesInterval = null;
      }
    };

    // Toast-Helper
    const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
      toast.value = { show: true, message, type };

      // Auto-hide nach 5 Sekunden
      setTimeout(() => {
        toast.value.show = false;
      }, 5000);
    };

    const onFriendRequestSent = async (data: FriendRequestEvent) => {
      showToast(`Freundschaftsanfrage an ${data.displayName} gesendet!`, "success");
      console.log("Friend request sent to:", data.displayName);

      // Reload sent requests to update UI
      await loadSentRequests();
    };

    const onFriendRequestCancelled = async (data: FriendRequestEvent) => {
      showToast(`Freundschaftsanfrage an ${data.displayName} zurückgezogen.`, "info");
      console.log("Friend request cancelled for:", data.displayName);

      // Reload sent requests to update UI
      await loadSentRequests();
    };

    // API-Funktionen
    const loadFriends = async () => {
      try {
        const response = await friendService.getAllFriendsOfUser();
        friends.value = response.data.map((friend) => ({
          id: friend.id,
          friendId: friend.friendId,
          name: friend.username, // Falls kein displayName vorhanden
          username: friend.username,
          avatar: friend.profileImage,
          profileImage: friend.profileImage,
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
        pendingRequests.value = response.data.map((request) => ({
          id: request.id,
          senderId: request.senderId,
          name: request.username,
          username: request.username,
          avatar: request.profileImage,
          profileImage: request.profileImage,
          message: "Möchte mit dir befreundet sein.",
          requestDate: new Date().toLocaleDateString("de-DE"),
          mutualFriends: Math.floor(Math.random() * 3),
        }));
      } catch (err: any) {
        throw new Error(err.response?.data?.message || "Fehler beim Laden der Anfragen");
      }
    };

    const loadSentRequests = async () => {
      try {
        const requests = await friendService.getMySentRequests();
        sentRequests.value = requests.map((req: any) => ({
          id: req.id,
          receiverId: req.receiverId,
          status: req.status,
          receiver: {
            id: req.receiver?.id,
            username: req.receiver?.username,
            profilePicture: req.receiver?.profilePicture ?? null,
          },
          createdAt: req.createdAt,
          responsedAt: req.responsedAt,
          message: req.message,
        }));
      } catch (err: any) {
        console.error("Fehler beim Laden der gesendeten Anfragen:", err);
        // Kein Toast hier, da es nicht kritisch ist
      }
    };

    const loadData = async () => {
      isLoading.value = true;
      error.value = null;

      try {
        // Lade Daten parallel, aber mit individueller Fehlerbehandlung
        const results = await Promise.allSettled([loadFriends(), loadPendingRequests(), loadSentRequests()]);

        // Prüfe auf Fehler
        const failedOperations = results.filter((result) => result.status === "rejected");

        if (failedOperations.length > 0) {
          console.error("Some operations failed:", failedOperations);
          // Zeige Warnung, aber lade trotzdem was funktioniert hat
          showToast("Einige Daten konnten nicht geladen werden", "info");
        }

        // Starte ungelesene Nachrichten Polling nach dem Laden der Freunde
        startUnreadMessagesPolling();
      } catch (err: any) {
        error.value = err.message || "Unbekannter Fehler beim Laden der Daten";
        showToast("Fehler beim Laden der Daten", "error");
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
      const friend = friends.value.find((f) => f.id === friendId || f.friendId === friendId);
      if (!friend) return;

      if (confirm(`Möchtest du die Freundschaft mit ${friend.name} wirklich beenden?`)) {
        try {
          await friendService.removeFriend(friendId);
          friends.value = friends.value.filter((f) => f.id !== friendId && f.friendId !== friendId);
          showToast(`Freundschaft mit ${friend.name} wurde beendet.`, "info");
        } catch (err: any) {
          showToast(err.response?.data?.message || "Fehler beim Entfernen des Freundes", "error");
        }
      }
    };

    const acceptRequest = async (requestId: string | number) => {
      try {
        await friendService.acceptFriendRequest(requestId.toString());

        // Request aus der Liste entfernen
        const request = pendingRequests.value.find((req) => req.id === requestId.toString());
        if (request) {
          pendingRequests.value = pendingRequests.value.filter((req) => req.id !== requestId.toString());

          // Als neuen Freund hinzufügen
          const newFriend: Friend = {
            id: `friend_${Date.now()}`, // Temporäre ID
            friendId: request.senderId,
            name: request.name,
            username: request.username,
            avatar: request.avatar,
            profileImage: request.profileImage,
            bio: "Neu hinzugefügter Freund",
            friendSince: new Date().toLocaleDateString("de-DE"),
            isOnline: false,
            sharedInterests: 0,
          };
          friends.value.push(newFriend);

          showToast(`Freundschaftsanfrage von ${request.name} angenommen!`, "success");
        }
      } catch (err: any) {
        showToast(err.response?.data?.message || "Fehler beim Annehmen der Anfrage", "error");
      }
    };

    const declineRequest = async (requestId: string | number) => {
      try {
        await friendService.rejectFriendRequest(requestId.toString());

        const request = pendingRequests.value.find((req) => req.id === requestId.toString());
        pendingRequests.value = pendingRequests.value.filter((req) => req.id !== requestId.toString());

        if (request) {
          showToast(`Freundschaftsanfrage von ${request.name} abgelehnt.`, "info");
        }
      } catch (err: any) {
        showToast(err.response?.data?.message || "Fehler beim Ablehnen der Anfrage", "error");
      }
    };

    // Chat-Funktionen
    const openChat = (friend: Friend) => {
      console.log("Opening chat with friend:", friend); // DEBUG
      selectedFriend.value = friend;
      showChatModal.value = true;
      console.log("Chat modal should be visible:", showChatModal.value); // DEBUG
      console.log("Selected friend:", selectedFriend.value); // DEBUG
    };

    const handleSendMessage = async (data: ChatMessageEvent) => {
      try {
        // Verwende Chat-Service für direktere Kommunikation
        const conversation = await chatService.createOrGetConversation(data.friendId.toString());
        await chatService.sendMessage(conversation.id, data.message);

        console.log("Message sent successfully to:", data.friendId);
        showToast("Nachricht erfolgreich gesendet!", "success");

        // Aktualisiere ungelesene Nachrichten
        loadUnreadMessagesCount();
      } catch (error) {
        console.error("Error sending message:", error);
        showToast("Fehler beim Senden der Nachricht", "error");
      }
    };

    // Lifecycle
    onMounted(() => {
      loadData();
    });

    onUnmounted(() => {
      stopUnreadMessagesPolling();
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
      sentRequests,
      unreadMessagesCount,

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
      openChat,
      handleSendMessage,
      onFriendRequestSent,
      onFriendRequestCancelled,
      showToast,
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
      border: 4px solid;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: map.get(vars.$spacing, m);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          border-color: mixins.theme-color($theme, border-light);
          border-left-color: mixins.theme-color($theme, accent-teal);
        }
      }
    }

    p {
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
          transition: all 0.4s ease-out;
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
          transition: all 0.4s ease-out;
        }
      }
    }

    p {
      margin-bottom: map.get(vars.$spacing, l);
      max-width: 500px;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
          transition: all 0.4s ease-out;
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
            @include mixins.shadow("medium", $theme);
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
    max-width: 500px;
    @include animations.fade-in(0.3s);
    @include mixins.shadow("large", "light");

    &.success {
      background-color: rgba(76, 175, 80, 0.95);
      color: white;
      border-left: 4px solid #4caf50;
    }

    &.error {
      background-color: rgba(244, 67, 54, 0.95);
      color: white;
      border-left: 4px solid #f44336;
    }

    &.info {
      background-color: rgba(33, 150, 243, 0.95);
      color: white;
      border-left: 4px solid #2196f3;
    }

    .toast-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: map.get(vars.$spacing, s);

      .toast-icon {
        font-size: 1.2rem;
        flex-shrink: 0;
      }

      .toast-message {
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        flex: 1;
        line-height: 1.4;
      }

      .toast-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        opacity: 0.8;
        transition: all 0.2s ease;
        flex-shrink: 0;

        &:hover {
          opacity: 1;
          background-color: rgba(255, 255, 255, 0.2);
        }
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
    gap: map.get(vars.$spacing, m);
  }

  .toast-notification {
    right: 10px;
    left: 10px;
    max-width: none;
    min-width: auto;
  }
}
</style>
