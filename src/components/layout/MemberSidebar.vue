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
        <img v-if="isImageLoaded && userProfileImage" :src="userProfileImage" :alt="'Profilbild'" class="account-logo"
          @error="handleImageError" />
        <div v-else class="image-placeholder">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="placeholder-icon">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
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

    <!-- Sidebar-Navigation mit Drag & Drop -->
    <nav class="sidebar-nav" ref="navContainer">
      <transition-group name="nav-item-move" tag="div" class="nav-items-container">
        <div v-for="(item, index) in sortedMenuItems" :key="item.id" :data-item-id="item.id" class="nav-item" :class="{
          active: activeMenu === item.id,
          dragging: draggedItem === item.id,
          'drag-over': dragOverIndex === index,
        }" draggable="true" @click="selectMenuItem(item.id)" @dragstart="handleDragStart($event, item.id, index)"
          @dragend="handleDragEnd" @dragover="handleDragOver($event, index)" @dragleave="handleDragLeave"
          @drop="handleDrop($event, index)">
          <!-- Drag Handle -->
          <span class="drag-handle" @click.stop>
            <Bars3Icon class="h-4 w-4" />
          </span>

          <span class="nav-icon">
            <component :is="item.icon" class="h-6 w-6" />
          </span>
          <span class="nav-text">{{ item.text }}</span>



          <!-- Badge für ungelesene Benachrichtigungen -->
          <span v-if="item.id === 'notifications' && notificationCount > 0" class="nav-badge"
            :title="`${notificationCount} ungelesene Benachrichtigung${notificationCount === 1 ? '' : 'en'}`">
            {{ notificationCount > 99 ? "99+" : notificationCount }}
          </span>
        </div>

        <!-- Drop-Indikator Linie -->
        <div v-if="showDropIndicator" class="drop-indicator" :style="dropIndicatorStyle"></div>
      </transition-group>
    </nav>

    <!-- Support-Bereich mit Reset-Button -->
    <div class="support-section">
      <div class="support-divider"></div>
      <div class="support-container">
        <div class="support-item" :class="{ active: activeMenu === 'support' }" @click="selectMenuItem('support')">
          <span class="support-icon">
            <LifebuoyIcon class="h-5 w-5" />
          </span>
          <span class="support-text">Support</span>
          <span v-if="openTicketsCount > 0" class="support-badge">
            {{ openTicketsCount }}
          </span>
        </div>

        <!-- Reset Button -->
        <button class="reset-button" @click="resetMenuOrder" title="Menüreihenfolge zurücksetzen">
          <ArrowPathIcon class="h-4 w-4 Icons" />
        </button>
      </div>
    </div>
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
  LifebuoyIcon,
  Bars3Icon,
  ArrowPathIcon,
} from "@heroicons/vue/24/outline";
import { userService } from "@/services/userMD.services";
import { notificationService } from "@/services/notification.service";
import { memberTicketService } from "@/services/member.ticket.service";
import type { User, TokenPayload } from "@/types/dtos";

// Interface für Menu Items
export interface MenuItem {
  id: string;
  text: string;
  icon: any;
}

// Storage Key für die Menüreihenfolge
const MENU_ORDER_STORAGE_KEY = "member-sidebar-menu-order";

// TypeScript Interface für Token-Payload

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
    LifebuoyIcon,
    Bars3Icon,
    ArrowPathIcon,
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
  setup(_props, { emit }) {
    // State
    const canCreateArticles = ref(false);
    const userName = ref("");
    const userRole = ref("");
    const userData = ref<User | null>(null);
    const isImageLoaded = ref(true);
    const fallbackImageUrl = "/src/assets/images/AvatarIcon1.webp";
    const openTicketsCount = ref(0);
    const notificationCount = ref(0);

    // Drag & Drop State
    const draggedItem = ref<string | null>(null);
    const draggedIndex = ref<number | null>(null);
    const dragOverIndex = ref<number | null>(null);
    const showDropIndicator = ref(false);
    const dropIndicatorStyle = ref({});
    const navContainer = ref<HTMLElement | null>(null);
    const menuOrder = ref<string[]>([]);

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

    // Basis-Menüelemente
    const baseMenuItems = computed(() => {
      const items: MenuItem[] = [
        { id: "overview", text: "Übersicht", icon: ChartBarIcon },
        { id: "my-articles", text: "Meine Artikel", icon: DocumentTextIcon },
      ];

      // Menüpunkt für Artikel-Erstellung nur für Authors und Admins hinzufügen
      if (canCreateArticles.value) {
        items.push({ id: "create-article", text: "Artikel erstellen", icon: PencilIcon });
      }

      return [
        ...items,
        { id: "library", text: "Bibliothek", icon: BookOpenIcon },
        { id: "friends", text: "Freunde", icon: UserGroupIcon },
        { id: "notifications", text: "Benachrichtigungen", icon: BellIcon },
        { id: "settings", text: "Einstellungen", icon: Cog6ToothIcon },
      ];
    });

    // Sortierte Menüelemente basierend auf gespeicherter Reihenfolge
    const sortedMenuItems = computed(() => {
      if (menuOrder.value.length === 0) {
        return baseMenuItems.value;
      }

      // Sortiere basierend auf der gespeicherten Reihenfolge
      const sorted: MenuItem[] = [];

      // Füge Items in der gespeicherten Reihenfolge hinzu
      menuOrder.value.forEach((id) => {
        const item = baseMenuItems.value.find((i) => i.id === id);
        if (item) {
          sorted.push(item);
        }
      });

      // Füge neue Items hinzu, die noch nicht in der gespeicherten Reihenfolge sind
      baseMenuItems.value.forEach((item) => {
        if (!sorted.find((i) => i.id === item.id)) {
          sorted.push(item);
        }
      });

      return sorted;
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

    const handleImageError = () => (isImageLoaded.value = false);

    // Menüpunkt auswählen
    const selectMenuItem = (itemId: string) => emit("select-menu", itemId);

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

    // Drag & Drop Handler
    const handleDragStart = (event: DragEvent, itemId: string, index: number) => {
      draggedItem.value = itemId;
      draggedIndex.value = index;

      // Visuelles Feedback
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/html", ""); // Für Firefox
      }

      // Füge Dragging-Klasse nach kurzer Verzögerung hinzu
      setTimeout(() => {
        const element = event.target as HTMLElement;
        element.classList.add("dragging");
      }, 0);
    };

    const handleDragEnd = (event: DragEvent) => {
      // Cleanup
      draggedItem.value = null;
      draggedIndex.value = null;
      dragOverIndex.value = null;
      showDropIndicator.value = false;

      // Entferne Dragging-Klasse
      const element = event.target as HTMLElement;
      element.classList.remove("dragging");
    };

    const handleDragOver = (event: DragEvent, index: number) => {
      event.preventDefault();

      if (draggedIndex.value === null || draggedIndex.value === index) {
        return;
      }

      // Zeige Drop-Indikator
      showDropIndicator.value = true;
      dragOverIndex.value = index;

      // Berechne Position für Drop-Indikator
      if (navContainer.value) {
        const items = navContainer.value.querySelectorAll(".nav-item");
        const targetItem = items[index] as HTMLElement;

        if (targetItem) {
          const rect = targetItem.getBoundingClientRect();
          const containerRect = navContainer.value.getBoundingClientRect();

          // Position relativ zum Container
          const relativeTop = rect.top - containerRect.top;

          // Entscheide ob oben oder unten basierend auf Mausposition
          const mouseY = event.clientY - rect.top;
          const itemHeight = rect.height;

          if (mouseY < itemHeight / 2) {
            // Oberhalb des Items
            dropIndicatorStyle.value = {
              top: `${relativeTop - 2}px`,
              opacity: 1,
            };
          } else {
            // Unterhalb des Items
            dropIndicatorStyle.value = {
              top: `${relativeTop + itemHeight - 2}px`,
              opacity: 1,
            };
          }
        }
      }
    };

    const handleDragLeave = () => {
      // Verzögere das Ausblenden um Flackern zu vermeiden
      setTimeout(() => {
        if (dragOverIndex.value !== null) {
          showDropIndicator.value = false;
          dragOverIndex.value = null;
        }
      }, 50);
    };

    const handleDrop = (event: DragEvent, dropIndex: number) => {
      event.preventDefault();

      if (draggedIndex.value === null || draggedIndex.value === dropIndex) {
        return;
      }

      // Erstelle neue Reihenfolge
      const items = [...sortedMenuItems.value];
      const draggedItem = items[draggedIndex.value];

      // Entferne das gezogene Element
      items.splice(draggedIndex.value, 1);

      // Füge es an der neuen Position ein
      const insertIndex = dropIndex > draggedIndex.value ? dropIndex - 1 : dropIndex;
      items.splice(insertIndex, 0, draggedItem);

      // Speichere neue Reihenfolge
      menuOrder.value = items.map((item) => item.id);
      saveMenuOrder();

      // Cleanup
      showDropIndicator.value = false;
      dragOverIndex.value = null;
    };

    // Menüreihenfolge speichern
    const saveMenuOrder = () => localStorage.setItem(MENU_ORDER_STORAGE_KEY, JSON.stringify(menuOrder.value));

    // Menüreihenfolge laden
    const loadMenuOrder = () => {
      const saved = localStorage.getItem(MENU_ORDER_STORAGE_KEY);
      if (saved) {
        try {
          menuOrder.value = JSON.parse(saved);
        } catch (error) {
          console.error("Fehler beim Laden der Menüreihenfolge:", error);
          menuOrder.value = [];
        }
      }
    };

    // Menüreihenfolge zurücksetzen
    const resetMenuOrder = () => {
      menuOrder.value = [];
      localStorage.removeItem(MENU_ORDER_STORAGE_KEY);

      // Visuelles Feedback
      const resetBtn = document.querySelector(".reset-button") as HTMLElement;
      if (resetBtn) {
        resetBtn.classList.add("reset-active");
        setTimeout(() => resetBtn.classList.remove("reset-active"), 600);
      }
    };

    // NOTIFICATION FUNCTIONS
    const updateNotificationCount = (count: number) => (notificationCount.value = count);

    const handleNotificationCountUpdate = (event: CustomEvent) => {
      const count = event.detail.count || 0;
      updateNotificationCount(count);
    };

    // Support-Tickets laden
    const loadOpenTickets = async () => {
      try {
        const tickets = await memberTicketService.getMyTickets();
        const stats = memberTicketService.getTicketStats(tickets);
        openTicketsCount.value = stats.open + stats.inProgress;
      } catch (error) {
        console.error("Fehler beim Laden der Support-Tickets:", error);
      }
    };

    // NOTIFICATION POLLING SETUP
    const setupNotificationPolling = () => {
      try {
        // Listener für Notification-Updates registrieren
        notificationService.addCountListener(updateNotificationCount);

        // Polling starten (alle 30 Sekunden)
        notificationService.startPolling();
      } catch (error) { }
    };

    const cleanupNotificationPolling = () => {
      try {
        // Listener entfernen
        notificationService.removeCountListener(updateNotificationCount);

        // Polling stoppen
        notificationService.stopPolling();
      } catch (error) {
        console.error("Fehler beim Cleanup des Notification-Systems:", error);
      }
    };

    // Lifecycle hooks
    onMounted(() => {
      loadUserData();
      loadOpenTickets();
      loadMenuOrder();

      // Event-Listener für verschiedene Updates registrieren
      if (typeof window !== "undefined") {
        window.addEventListener("notification-count-updated", handleNotificationCountUpdate as EventListener);
      }

      // Notification-System starten
      setupNotificationPolling();
    });

    onUnmounted(() => {
      // Event-Listener entfernen
      if (typeof window !== "undefined") {
        window.removeEventListener("notification-count-updated", handleNotificationCountUpdate as EventListener);
      }

      // Notification-System bereinigen
      cleanupNotificationPolling();
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
    const handleProfileUpdate = () => loadUserData();

    // Event-Listener registrieren (kann von außen getriggert werden)
    if (typeof window !== "undefined") {
      window.addEventListener("profile-updated", handleProfileUpdate);
    }

    return {
      // State
      sortedMenuItems,
      canCreateArticles,
      userName,
      userRole,
      userData,
      userProfileImage,
      isCustomProfileImage,
      isImageLoaded,
      notificationCount,
      openTicketsCount,

      // Drag & Drop State
      draggedItem,
      dragOverIndex,
      showDropIndicator,
      dropIndicatorStyle,
      navContainer,

      // Methods
      selectMenuItem,
      handleImageError,
      loadUserData,
      goToProfileSettings,
      resetMenuOrder,

      // Drag & Drop Methods
      handleDragStart,
      handleDragEnd,
      handleDragOver,
      handleDragLeave,
      handleDrop,
    };
  },
});
</script>

<!-- Der Style-Block bleibt unverändert -->
<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;
@use "@/style/base/animations" as animations;

.Icons {
  width: 20px;
  height: 20px;
  color: mixins.theme-color("light", text-secondary);
  position: absolute;
}

.member-sidebar {
  position: fixed;
  top: 70px;
  left: -300px;
  width: 300px;
  height: 100vh;
  z-index: 950;
  transition: left 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
  display: flex;
  flex-direction: column;
  padding-top: 70px;
  user-select: none;
  // Liquid glass effect
  background: rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(48, 135, 31, 0.18);
  backdrop-filter: blur(24px) saturate(180%) brightness(1.15);
  -webkit-backdrop-filter: blur(24px) saturate(180%) brightness(1.15);
  border-right: 1.5px solid rgba(255, 255, 255, 0.22);
  border-radius: 0 32px 32px 0;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background: if($theme =="light", rgba(255, 255, 255, 0.22), rgba(30, 34, 40, 0.22));
      box-shadow: 0 8px 32px 0 rgba(31, 135, 45, 0.18);
      border-right: 1.5px solid rgba(255, 255, 255, 0.22);
      transition: all 0.4s cubic-bezier(0.4, 0.2, 0.2, 1);
    }
  }

  &.open {
    left: 0;
    box-shadow: 0 12px 32px 0 rgba(40, 135, 31, 0.22);
    padding-top: 2rem;
    backdrop-filter: blur(32px) saturate(200%) brightness(1.18);
    -webkit-backdrop-filter: blur(32px) saturate(200%) brightness(1.18);

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        box-shadow: 0 12px 32px 0 rgba(34, 135, 31, 0.22);
        transition: all 0.4s cubic-bezier(0.4, 0.2, 0.2, 1);
      }
    }
  }

  // Sidebar-Header
  .sidebar-header {
    display: flex;
    align-items: center;
    padding: map.get(vars.$spacing, m);
    border-bottom: 1px solid rgba(255, 255, 255, 0.18);
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(8px) saturate(180%);
    -webkit-backdrop-filter: blur(8px) saturate(180%);

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        border-color: rgba(255, 255, 255, 0.18);
        background: if($theme =="light", rgba(255, 255, 255, 0.1), rgba(30, 34, 40, 0.1));
        transition: all 0.4s cubic-bezier(0.4, 0.2, 0.2, 1);
      }
    }

    .profile-image-container {
      position: relative;
      margin-right: map.get(vars.$spacing, s);
      flex-shrink: 0;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);

      &:hover {
        transform: scale(1.05);

        .account-logo {
          filter: brightness(0.8) drop-shadow(0 2px 8px rgba(31, 38, 135, 0.1));
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
        transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
        border: 2px solid rgba(255, 255, 255, 0.22);
        box-shadow: 0 2px 8px 0 rgba(31, 38, 135, 0.1);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            border-color: rgba(255, 255, 255, 0.22);
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
        background: rgba(255, 255, 255, 0.22);
        box-shadow: 0 2px 8px 0 rgba(31, 38, 135, 0.1);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
        pointer-events: none;

        .edit-icon {
          font-size: 16px;
          color: #fff;
          text-shadow: 0 1px 4px rgba(31, 38, 135, 0.18);
        }
      }

      .image-placeholder {
        position: static;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        background: rgba(255, 255, 255, 0.18);
        border: 2px solid rgba(255, 255, 255, 0.22);

        .placeholder-icon {
          width: 24px;
          height: 24px;
          color: rgba(31, 38, 135, 0.22);
        }
      }

      .profile-status-indicator {
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 18px;
        height: 18px;
        background: linear-gradient(135deg, #ffd700, #ffa500, #fffbe6 80%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        border: 2px solid rgba(255, 255, 255, 0.22);
        animation: twinkle 2s ease-in-out infinite;
        box-shadow: 0 2px 8px 0 rgba(255, 215, 0, 0.18);
      }
    }

    .header-content {
      flex: 1;
      min-width: 0;

      h3 {
        margin: 0;
        font-size: map.get(map.get(vars.$fonts, sizes), medium);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #222;
        text-shadow: 0 1px 4px rgba(255, 255, 255, 0.18);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: if($theme =="light", #222, #fff);
            transition: all 0.4s cubic-bezier(0.4, 0.2, 0.2, 1);
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
        color: #444;
        opacity: 0.8;
        text-shadow: 0 1px 4px rgba(255, 255, 255, 0.18);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: if($theme =="light", #444, #e0e0e0);
          }
        }
      }

      .profile-status {
        display: block;
        font-size: map.get(map.get(vars.$fonts, sizes), xs);
        margin-top: 1px;
        opacity: 0.8;
        font-style: italic;
        color: #00bfae;
        text-shadow: 0 1px 4px rgba(255, 255, 255, 0.18);
      }
    }

    .close-sidebar {
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.12);
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
      border-radius: 6px;
      flex-shrink: 0;
      color: #222;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: if($theme =="light", #222, #fff);

          &:hover {
            color: #fff;
            background: rgba(31, 38, 135, 0.18);
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
    overflow-y: auto;
    user-select: none;
    position: relative;

    .nav-items-container {
      display: flex;
      flex-direction: column;
      gap: map.get(vars.$spacing, s);
      position: relative;
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: map.get(vars.$spacing, m);
      border-radius: 18px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
      position: relative;
      background: rgba(255, 255, 255, 0.1);
      box-shadow: 0 1px 4px 0 rgba(31, 38, 135, 0.06);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: if($theme =="light", #222, #e0e0e0);

          &:hover:not(.dragging) {
            background: rgba(255, 255, 255, 0.18);
            color: #ffffff6b;
            transform: translateX(3px) scale(1.03);
            box-shadow: 0 2px 8px 0 rgba(31, 38, 135, 0.1);
          }

          &.active:not(.dragging) {
            background: linear-gradient(135deg, #58585856 0%, #b2febf 100%);
            color: #ffffff;
            transform: translateX(5px);
            box-shadow: 0 4px 16px 0 rgba(31, 38, 135, 0.12);
            border-left: 2px solid #22c55e;

            .nav-icon {
              color: #22c55e;
              filter: drop-shadow(0 2px 8px rgba(34, 197, 94, 0.18));
            }
          }
        }
      }

      // Drag & Drop Styles
      &.dragging {
        opacity: 0.5;
        cursor: grabbing !important;
        transform: scale(0.95);

        * {
          pointer-events: none;
        }
      }

      &:not(.dragging) {
        cursor: grab;

        &:active {
          cursor: grabbing;
        }
      }

      .drag-handle {
        position: absolute;
        left: 4px;
        top: 50%;
        transform: translateY(-50%);
        opacity: 0;
        transition: opacity 0.2s cubic-bezier(0.4, 0.2, 0.2, 1);
        cursor: grab;
        padding: 4px;
        color: #b0b8d0;
      }

      &:hover .drag-handle {
        opacity: 0.6;
      }

      .nav-icon {
        margin-right: map.get(vars.$spacing, m);
        margin-left: map.get(vars.$spacing, s);
        font-size: 1.2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
        filter: drop-shadow(0 1px 4px rgba(31, 38, 135, 0.08));
      }

      .nav-text {
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
        flex: 1;
      }

      // Einheitlich rote Badges
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
        background: linear-gradient(135deg, #00000056 0%, #035f2c 100%);

        color: white;
        box-shadow: 0 2px 8px rgba(255, 71, 87, 0.18);
        @include animations.fade-in(0.3s);
        animation: nav-badge-pulse 3s infinite;
        border: 1.5px solid rgba(255, 255, 255, 0.22);
      }

      &:hover:not(.dragging) .nav-icon {
        transform: scale(1.1);
      }
    }

    // Drop Indikator
    .drop-indicator {
      position: absolute;
      left: map.get(vars.$spacing, s);
      right: map.get(vars.$spacing, s);
      height: 3px;
      background: linear-gradient(90deg, transparent 0%, #22c55e 20%, #22c55e 80%, transparent 100%);
      border-radius: 2px;
      opacity: 0;
      transition: opacity 0.2s cubic-bezier(0.4, 0.2, 0.2, 1);
      pointer-events: none;
      z-index: 10;

      &::before {
        content: "";
        position: absolute;
        left: -8px;
        top: 50%;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 6px 8px 6px 0;
        border-color: transparent #ffffff transparent transparent;
      }

      &::after {
        content: "";
        position: absolute;
        right: -8px;
        top: 50%;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 6px 0 6px 8px;
        border-color: transparent transparent transparent #ffffff;
      }
    }
  }

  // Support-Bereich (separiert am unteren Ende)
  .support-section {
    margin-top: auto;
    padding: map.get(vars.$spacing, m);
    padding-top: 0;
    padding-bottom: 100px;

    .support-divider {
      height: 1px;
      margin-bottom: map.get(vars.$spacing, m);
      background: rgba(255, 255, 255, 0.18);
    }

    .support-container {
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, xs);
    }

    .support-item {
      display: flex;
      align-items: center;
      padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);
      border-radius: 18px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
      position: relative;
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      flex: 1;
      background: rgba(255, 255, 255, 0.1);
      color: #444;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: if($theme =="light", #444, #e0e0e0);

          &:hover {
            background: rgba(255, 255, 255, 0.18);
            color: #222;
            transform: translateX(2px) scale(1.03);
            box-shadow: 0 2px 8px 0 rgba(31, 38, 135, 0.1);
          }

          &.active {
            background: linear-gradient(135deg, #e0e7ff56 0%, #b2febf 100%);
            color: #222;
            transform: translateX(3px) scale(1.04);
            box-shadow: 0 4px 16px 0 rgba(31, 38, 135, 0.12);
          }
        }
      }

      .support-icon {
        margin-right: map.get(vars.$spacing, s);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        opacity: 0.8;
        transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
        filter: drop-shadow(0 1px 4px rgba(31, 38, 135, 0.08));
      }

      .support-text {
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
        flex: 1;
      }

      .support-badge {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 18px;
        height: 18px;
        padding: 10px;
        border-radius: 50%;
        font-size: 0.625rem;
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        line-height: 1;
        margin-left: auto;
        background: linear-gradient(135deg, #00000056 0%, #035f2c 100%);
        color: white;
        @include animations.fade-in(0.3s);
        border: none;
        box-shadow: 0 2px 8px 0 rgba(31, 38, 135, 0.1);
      }

      &:hover .support-icon {
        opacity: 1;
        transform: scale(1.05);
      }
    }

    // Reset Button
    .reset-button {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: rgba(255, 255, 255, 0.12);
      cursor: pointer;
      border-radius: 12px;
      transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
      flex-shrink: 0;
      color: #888;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: if($theme =="light", #888, #e0e0e0);

          &:hover {
            color: #222;
            background: rgba(31, 38, 135, 0.12);
            transform: rotate(-45deg) scale(1.08);
          }
        }
      }

      &.reset-active {
        animation: reset-spin 0.6s cubic-bezier(0.4, 0.2, 0.2, 1);
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

// Transition für Nav Items
.nav-item-move-move {
  transition: transform 0.3s ease;
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

@keyframes reset-spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(-360deg);
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