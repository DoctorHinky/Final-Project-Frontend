<!-- src/components/layout/MemberSidebar.vue -->
<template>
  <aside class="member-sidebar" :class="{ open: isOpen }">
    <!-- Sidebar-Header mit Logo und Schließen-Button -->
    <a href="/" class="logo-link">
      <img src="../../assets/images/Logo.png" alt="Logo" class="logo-Sidebar" />
    </a>
    <div class="sidebar-header">
      <!-- Dynamisches Profilbild -->
      <div class="profile-image-container" @click="goToProfileSettings">
        <img :src="userProfileImage" :alt="userName + ' Profilbild'" class="account-logo" @error="handleImageError" />
        <div v-if="!isImageLoaded" class="image-placeholder">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="placeholder-icon"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
        </div>
        <!-- Hover-Indikator für Klickbarkeit -->
        <div class="profile-edit-overlay">
          <span class="edit-icon">✏️</span>
        </div>
        <!-- Status-Indikator für Custom Bild -->
        <div v-if="isCustomProfileImage" class="profile-status-indicator" title="Benutzerdefiniertes Profilbild">
          ✨
        </div>
      </div>

      <div class="header-content">
        <h3 v-if="userName">{{ userName }}</h3>
        <p v-if="userRole" class="user-role">{{ userRole }}</p>
        <span v-if="isCustomProfileImage" class="profile-status">Am Verfassen</span>
      </div>

      <button class="close-sidebar" @click="$emit('close')">×</button>
    </div>

    <!-- Sidebar-Navigation -->
    <nav class="sidebar-nav">
      <div
        v-for="(item, index) in menuItems"
        :key="index"
        class="nav-item"
        :class="{ active: activeMenu === item.id }"
        @click="selectMenuItem(item.id)"
      >
        <span class="nav-icon">
          <component :is="item.icon" class="h-6 w-6" />
        </span>
        <span class="nav-text">{{ item.text }}</span>
        <!-- Badge für ungelesene Nachrichten bei Freunde -->
        <span
          v-if="item.id === 'friends' && unreadMessagesCount > 0"
          class="nav-badge"
          :title="`${unreadMessagesCount} ungelesene Nachricht${unreadMessagesCount === 1 ? '' : 'en'}`"
        >
          {{ unreadMessagesCount > 99 ? "99+" : unreadMessagesCount }}
        </span>
      </div>
    </nav>

    <!-- Support-Bereich -->
    <div class="support-section">
      <div class="support-divider"></div>
      <button class="support-button" @click="openSupportModal" title="Support kontaktieren">
        <span class="support-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            <path d="M8 10h8"></path>
            <path d="M8 14h6"></path>
          </svg>
        </span>
        <span class="support-text">Support</span>
      </button>
    </div>

    <!-- Support Modal -->
    <Teleport to="body">
      <UserTicketModal :isOpen="showSupportModal" @close="closeSupportModal" @ticket-created="handleTicketCreated" />
    </Teleport>
  </aside>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from "vue";
import {
  ChartBarIcon,
  BookOpenIcon,
  UserGroupIcon,
  BellIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  PencilIcon,
} from "@heroicons/vue/24/outline";
import { userService } from "@/services/userMD.services";
import UserTicketModal from "@/components/member/support/UserTicketModal.vue";
import type { User } from "@/types/dtos/User.types";

// TypeScript Interface für Token-Payload
interface TokenPayload {
  userId?: string;
  username?: string;
  email?: string;
  role?: string;
}

export default defineComponent({
  name: "MemberSidebar",
  components: {
    ChartBarIcon,
    BookOpenIcon,
    UserGroupIcon,
    BellIcon,
    Cog6ToothIcon,
    DocumentTextIcon,
    PencilIcon,
    UserTicketModal,
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    activeMenu: {
      type: String,
      default: "overview",
    },
  },
  emits: ["select-menu", "close", "logout"],
  setup(_, { emit }) {
    // State
    const canCreateArticles = ref(false);
    const userName = ref("");
    const userRole = ref("");
    const userData = ref<User | null>(null);
    const isImageLoaded = ref(true);
    const fallbackImageUrl = "/src/assets/images/AvatarIcon1.webp";
    const showSupportModal = ref(false);
    const unreadMessagesCount = ref(0);

    // Computed Properties
    const userProfileImage = computed(() => {
      if (userData.value?.profilePicture) {
        return userData.value.profilePicture;
      }
      return fallbackImageUrl;
    });

    const isCustomProfileImage = computed(() => {
      return userData.value?.profilePicture && userData.value.profilePicture !== fallbackImageUrl;
    });

    // Menüelemente als Computed-Property, die sich bei Änderung des Status aktualisiert
    const menuItems = computed(() => {
      const baseItems = [
        { id: "overview", text: "Übersicht", icon: ChartBarIcon },
        { id: "my-articles", text: "Meine Artikel", icon: DocumentTextIcon },
      ];

      // Menüpunkt für Artikel-Erstellung nur für Authors und Admins hinzufügen
      if (canCreateArticles.value) {
        baseItems.push({ id: "create-article", text: "Artikel erstellen", icon: PencilIcon });
      }

      return [
        ...baseItems,
        { id: "library", text: "Bibliothek", icon: BookOpenIcon },
        { id: "friends", text: "Freunde", icon: UserGroupIcon },
        { id: "notifications", text: "Benachrichtigungen", icon: BellIcon },
        { id: "settings", text: "Einstellungen", icon: Cog6ToothIcon },
      ];
    });

    // Methods
    const loadUserData = async () => {
      try {
        const user = await userService.getCurrentUser();
        userData.value = user;

        // Username setzen
        userName.value = user?.username || "Benutzer";

        // Rolle für Anzeige setzen (auf Deutsch)
        const roleMap: Record<string, string> = {
          ADMIN: "Administrator",
          AUTHOR: "Autor",
          ADULT: "Erwachsener",
          CHILD: "Kind",
          MODERATOR: "Moderator",
        };

        const role = user?.role?.toString() || "";
        userRole.value = roleMap[role] || role;

        // Berechtigung für Artikel-Erstellung setzen
        canCreateArticles.value = role === "AUTHOR" || role === "ADMIN";
      } catch (error) {
        console.error("Fehler beim Laden der Benutzerdaten:", error);
        // Fallback zu Token-Dekodierung
        loadUserFromToken();
      }
    };

    const loadUserFromToken = () => {
      try {
        // Token dekodieren für Benutzerinformationen
        const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
        if (token) {
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const decoded = JSON.parse(window.atob(base64)) as TokenPayload;

          // Username direkt aus dem Token
          userName.value = decoded.username || "Benutzer";

          // Rolle anzeigen (auf Deutsch)
          const roleMap: Record<string, string> = {
            admin: "Administrator",
            author: "Autor",
            user: "Benutzer",
            adult: "Erwachsener",
            child: "Kind",
            moderator: "Moderator",
          };

          // Rolle für Anzeige setzen
          const displayRole = decoded.role || "";
          userRole.value = roleMap[displayRole.toLowerCase()] || displayRole;

          // NUR Authors und Admins können Artikel erstellen
          const roleCheck = (decoded.role || "").toLowerCase();
          canCreateArticles.value = roleCheck === "author" || roleCheck === "admin";
        }
      } catch (e) {
        console.error("Token konnte nicht dekodiert werden:", e);
        // Fallback-Werte setzen
        canCreateArticles.value = false;
        userName.value = "Benutzer";
        userRole.value = "Benutzer";
      }
    };

    const handleImageError = () => {
      isImageLoaded.value = false;
      console.warn("Profilbild konnte nicht geladen werden, verwende Fallback");
    };

    // Menüpunkt auswählen
    const selectMenuItem = (itemId: string) => {
      emit("select-menu", itemId);
    };

    // Zu Profileinstellungen weiterleiten
    const goToProfileSettings = () => {
      emit("select-menu", "settings");
      // Optional: Event für direkten Tab-Wechsel zu Profil-Tab
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("switch-to-profile-tab"));
        }
      }, 100);
    };

    // Support Modal-Funktionen
    const openSupportModal = () => {
      console.log("Support Modal wird geöffnet..."); // Debug
      showSupportModal.value = true;
      console.log("showSupportModal.value:", showSupportModal.value); // Debug
    };

    const closeSupportModal = () => {
      console.log("Support Modal wird geschlossen..."); // Debug
      showSupportModal.value = false;
    };

    const handleTicketCreated = () => {
      console.log("Ticket wurde erfolgreich erstellt"); // Debug
      closeSupportModal();
    };

    // Event-Listener für ungelesene Nachrichten
    const handleUnreadMessagesUpdate = (event: CustomEvent) => {
      unreadMessagesCount.value = event.detail.count || 0;
    };

    // Lifecycle hooks
    onMounted(() => {
      loadUserData();

      // Event-Listener für ungelesene Nachrichten registrieren
      if (typeof window !== "undefined") {
        window.addEventListener("unread-messages-updated", handleUnreadMessagesUpdate as EventListener);
      }
    });

    onUnmounted(() => {
      // Event-Listener entfernen
      if (typeof window !== "undefined") {
        window.removeEventListener("unread-messages-updated", handleUnreadMessagesUpdate as EventListener);
      }
    });

    // Watch für Updates der Benutzerdaten (z.B. nach Profilbild-Upload)
    watch(
      () => userData.value?.profilePicture,
      (newImage, oldImage) => {
        if (newImage !== oldImage) {
          isImageLoaded.value = true;
        }
      }
    );

    // Event-Listener für Profilbild-Updates
    const handleProfileUpdate = () => {
      loadUserData();
    };

    // Event-Listener registrieren (kann von außen getriggert werden)
    if (typeof window !== "undefined") {
      window.addEventListener("profile-updated", handleProfileUpdate);
    }

    return {
      // State
      menuItems,
      canCreateArticles,
      userName,
      userRole,
      userData,
      userProfileImage,
      isCustomProfileImage,
      isImageLoaded,
      showSupportModal,
      unreadMessagesCount,

      // Methods
      selectMenuItem,
      handleImageError,
      loadUserData,
      goToProfileSettings,
      openSupportModal,
      closeSupportModal,
      handleTicketCreated,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;
@use "@/style/base/animations" as animations;

.member-sidebar {
  position: fixed;
  top: 70px;
  left: -300px;
  width: 300px;
  height: 100vh;
  z-index: 950;
  transition: left 0.3s ease;
  display: flex;
  flex-direction: column;
  padding-top: 70px; // Platz für den Header
  padding-bottom: 20px; // Mehr Platz für Support-Bereich
  user-select: none;
  padding-bottom: 5rem;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, card-bg);
      border-right: 1px solid mixins.theme-color($theme, border-medium);
      transition: all 0.4s ease-out;
    }
  }

  &.open {
    left: 0;
    box-shadow: 5px 0 15px rgba(0, 0, 0, 0.1);
    padding-top: 2rem;
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    background-color: rgba(255, 255, 255, 0.65);

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background-color: if($theme == "light", rgba(255, 255, 255, 0.65), rgba(30, 30, 30, 0.45));
        box-shadow: 5px 0 15px rgba(mixins.theme-color($theme, shadow-color), 0.1);
        transition: all 0.4s ease-out;
      }
    }
  }

  // Sidebar-Header
  .sidebar-header {
    display: flex;
    align-items: center;
    padding: map.get(vars.$spacing, m);
    border-bottom: 1px solid;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        border-color: mixins.theme-color($theme, border-light);
        transition: all 0.4s ease-out;
      }
    }

    .profile-image-container {
      position: relative;
      margin-right: map.get(vars.$spacing, s);
      flex-shrink: 0;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.05);

        .account-logo {
          filter: brightness(0.8);
        }

        .profile-edit-overlay {
          opacity: 1;
        }
      }

      .account-logo {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        object-fit: cover;
        transition: all 0.3s ease;
        border: 2px solid transparent;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            border-color: mixins.theme-color($theme, border-light);
          }
        }
      }

      .profile-edit-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(0, 0, 0, 0.6);
        opacity: 0;
        transition: all 0.3s ease;
        pointer-events: none;

        .edit-icon {
          font-size: 16px;
          color: white;
        }
      }

      .image-placeholder {
        position: absolute;
        top: 0;
        left: 0;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            border: 2px solid mixins.theme-color($theme, border-light);
          }
        }

        .placeholder-icon {
          width: 24px;
          height: 24px;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-tertiary);
            }
          }
        }
      }

      .profile-status-indicator {
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 18px;
        height: 18px;
        background: linear-gradient(135deg, #ffd700, #ffa500);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        border: 2px solid;
        animation: twinkle 2s ease-in-out infinite;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            border-color: mixins.theme-color($theme, card-bg);
          }
        }
      }
    }

    .header-content {
      flex: 1;
      min-width: 0; // Wichtig für text-overflow

      h3 {
        margin: 0;
        font-size: map.get(map.get(vars.$fonts, sizes), medium);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
            transition: all 0.4s ease-out;
          }
        }
      }

      .user-role {
        margin: 0;
        margin-top: 2px;
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }

      .profile-status {
        display: block;
        font-size: map.get(map.get(vars.$fonts, sizes), xs);
        margin-top: 1px;
        opacity: 0.8;
        font-style: italic;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, accent-teal);
          }
        }
      }
    }

    .close-sidebar {
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      border-radius: 6px;
      flex-shrink: 0;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);

          &:hover {
            color: mixins.theme-color($theme, text-primary);
            background-color: mixins.theme-color($theme, hover-color);
          }
        }
      }
    }
  }

  // Sidebar-Navigation
  .sidebar-nav {
    flex: 1;
    padding: map.get(vars.$spacing, m);
    display: flex;
    flex-direction: column;
    gap: map.get(vars.$spacing, s);
    overflow-y: auto;
    user-select: none;

    .nav-item {
      display: flex;
      align-items: center;
      padding: map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      cursor: pointer;
      transition: all 0.3s;
      position: relative;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
          transition: all 0.4s ease-out;

          &:hover {
            background-color: mixins.theme-color($theme, hover-color);
            color: mixins.theme-color($theme, text-primary);
            transform: translateX(3px);
          }

          &.active {
            background: mixins.theme-gradient($theme, primary);
            color: white;
            transform: translateX(5px);
          }
        }
      }

      .nav-icon {
        margin-right: map.get(vars.$spacing, m);
        font-size: 1.2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        transition: all 0.3s ease;
      }

      .nav-text {
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        transition: all 0.3s ease;
        flex: 1;
      }

      .nav-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 20px;
        height: 20px;
        padding: 0 6px;
        border-radius: 50%;
        font-size: map.get(map.get(vars.$fonts, sizes), xs);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        line-height: 1;
        margin-left: auto;
        @include animations.fade-in(0.3s);
        animation: nav-badge-pulse 3s infinite;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: #2ed573; // Grün für Nachrichten
            color: white;
            box-shadow: 0 2px 4px rgba(46, 213, 115, 0.3);
            transition: all 0.4s ease-out;
          }
        }
      }

      &:hover .nav-icon {
        transform: scale(1.1);
      }
    }
  }

  // Support-Bereich
  .support-section {
    margin-top: auto;
    padding: map.get(vars.$spacing, m);

    .support-divider {
      height: 1px;
      margin-bottom: map.get(vars.$spacing, m);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, border-light);
        }
      }
    }

    .support-button {
      display: flex;
      align-items: center;
      padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      cursor: pointer;
      transition: all 0.3s ease;
      background: none;
      border: none;
      width: 100%;
      font-size: map.get(map.get(vars.$fonts, sizes), small);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-tertiary);

          &:hover {
            background-color: mixins.theme-color($theme, hover-color);
            color: mixins.theme-color($theme, text-secondary);
            transform: translateX(2px);
          }
        }
      }

      .support-icon {
        margin-right: map.get(vars.$spacing, s);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.7;
        transition: all 0.3s ease;
      }

      .support-text {
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        transition: all 0.3s ease;
      }

      &:hover .support-icon {
        opacity: 1;
        transform: scale(1.05);
      }
    }
  }
}

.logo-Sidebar {
  display: block;
  margin: 0 auto;
  height: 100px;
  width: 100px;
  border-radius: 50px;
  margin-bottom: map.get(vars.$spacing, m);
  opacity: 0.9;
  transition: all 0.3s ease;

  &:hover {
    opacity: 1;
    box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2);
    animation: WackelpuddingHop 1.5s ease-in-out forwards;
  }
}

// Animations
@keyframes WackelpuddingHop {
  0% {
    transform: translateY(0) scale(1, 1);
  }
  25% {
    transform: translateY(-20px) scale(1, 1.05);
  }
  40% {
    transform: translateY(-25px) scale(1.05, 0.95);
  }
  50% {
    transform: translateY(5px) scale(1.1, 0.8);
  }
  65% {
    transform: translateY(-5px) scale(0.95, 1.1);
  }
  75% {
    transform: translateY(0) scale(1.05, 0.95);
  }
  85% {
    transform: translateY(0) scale(0.98, 1.02);
  }
  100% {
    transform: translateY(0) scale(1, 1);
  }
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

@keyframes nav-badge-pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  25% {
    transform: scale(1.05);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  75% {
    transform: scale(1.05);
    opacity: 0.9;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

// Medienquery für große Bildschirme
@media (min-width: 1024px) {
  .member-sidebar {
    left: 0;
    transform: translateX(-100%);

    &.open {
      transform: translateX(0);
    }
  }
}
</style>
