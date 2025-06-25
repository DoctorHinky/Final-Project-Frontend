<!-- src/components/layout/MemberSidebar.vue -->
<template>
  <aside class="member-sidebar" :class="{ open: isOpen }">
    <!-- Sidebar-Header mit Logo und Schließen-Button -->
    <a v-if="!isMobile" href="/" class="logo-link">
      <img src="../../assets/images/Logo.webp" alt="Logo" class="logo-Sidebar" />
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
        <span v-if="isCustomProfileImage" class="profile-status">Am lesen</span>
      </div>

      <button class="close-sidebar" @click="$emit('close')">×</button>
    </div>

    <!-- Admin-Bereich Button (nur für Admin/Moderator) -->
    <div v-if="isAdminOrModerator" class="admin-section">
      <button class="admin-button" @click="navigateToAdmin">
        <span class="admin-icon">
          <ShieldCheckIcon class="h-5 w-5" />
        </span>
        <span class="admin-text">Admin-Bereich</span>
        <span class="admin-arrow">
          <ChevronRightIcon class="h-4 w-4" />
        </span>
      </button>
    </div>

    <!-- Sidebar-Navigation mit Drag & Drop -->
    <nav class="sidebar-nav" ref="navContainer">
      <transition-group name="nav-item-move" tag="div" class="nav-items-container">
        <div v-for="(item, index) in sortedMenuItems" :key="item.id" :data-item-id="item.id" class="nav-item" :class="{
          active: activeMenu === item.id,
          dragging: draggedItem === item.id && !isMobile,
          'drag-over': dragOverIndex === index && !isMobile,
        }" :draggable="!isMobile" @click="selectMenuItem(item.id)" 
          @dragstart="!isMobile && handleDragStart($event, item.id, index)"
          @dragend="!isMobile && handleDragEnd" 
          @dragover="!isMobile && handleDragOver($event, index)" 
          @dragleave="!isMobile && handleDragLeave"
          @drop="!isMobile && handleDrop($event, index)">
          <!-- Drag Handle -->
          <span v-if="!isMobile" class="drag-handle" @click.stop>
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
        <button v-if="!isMobile" class="reset-button" @click="resetMenuOrder" title="Menüreihenfolge zurücksetzen">
          <ArrowPathIcon class="h-4 w-4 Icons" />
        </button>
      </div>
    </div>

    <!-- Loading Overlay für Admin-Navigation -->
    <transition name="fade">
      <div v-if="isNavigatingToAdmin" class="admin-loading-overlay">
        <div class="loading-content">
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
          </div>
          <p class="loading-text">Wechsel zum Admin-Bereich...</p>
          <p class="loading-subtext">Bitte warten</p>
        </div>
      </div>
    </transition>
  </aside>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
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
  ShieldCheckIcon,
  ChevronRightIcon,
} from "@heroicons/vue/24/outline";
import { userService } from "@/services/userMD.services";
import { notificationService } from "@/services/notification.service";
import { memberTicketService } from "@/services/member.ticket.service";
import { authService } from "@/services/auth.service";
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
    ShieldCheckIcon,
    ChevronRightIcon,
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
    const router = useRouter();
    
    // State
    const canCreateArticles = ref(false);
    const userName = ref("");
    const userRole = ref("");
    const userRoleType = ref(""); // Speichert die tatsächliche Rolle (ADMIN, MODERATOR, etc.)
    const userData = ref<User | null>(null);
    const isImageLoaded = ref(true);
    const fallbackImageUrl = "/src/assets/images/AvatarIcon1.webp";
    const openTicketsCount = ref(0);
    const notificationCount = ref(0);
    const isNavigatingToAdmin = ref(false); // Loading state für Admin-Navigation

    // Mobile Detection
    const isMobile = ref(window.innerWidth <= 768);
    const isSmallMobile = ref(window.innerWidth <= 360);

    // Drag & Drop State
    const draggedItem = ref<string | null>(null);
    const draggedIndex = ref<number | null>(null);
    const dragOverIndex = ref<number | null>(null);
    const showDropIndicator = ref(false);
    const dropIndicatorStyle = ref({});
    const navContainer = ref<HTMLElement | null>(null);
    const menuOrder = ref<string[]>([]);

    // Touch-Gesten State
    const touchStartX = ref(0);
    const touchEndX = ref(0);

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

    // Computed property um zu prüfen ob der Nutzer Admin oder Moderator ist
    const isAdminOrModerator = computed(() => {
      return userRoleType.value === "ADMIN" || userRoleType.value === "MODERATOR";
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
      if (menuOrder.value.length === 0 || isMobile.value) {
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
    const checkScreenSize = () => {
      isMobile.value = window.innerWidth <= 768;
      isSmallMobile.value = window.innerWidth <= 360;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!isMobile.value) return;
      touchStartX.value = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isMobile.value) return;
      touchEndX.value = e.changedTouches[0].screenX;
      handleSwipe();
    };

    const handleSwipe = () => {
      // Swipe nach links zum Schließen
      if (touchStartX.value - touchEndX.value > 50) {
        emit('close');
      }
    };

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
      userRoleType.value = role; // Speichere die tatsächliche Rolle

      // Nur Autoren dürfen Artikel erstellen
      canCreateArticles.value = role === "AUTHOR";
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
          userRoleType.value = displayRole.toUpperCase(); // Speichere die tatsächliche Rolle

          // NUR Authors können Artikel erstellen
          const roleCheck = (decoded.role || "").toLowerCase();
          canCreateArticles.value = roleCheck === "author";
        }
      } catch (e) {
        console.error("Token konnte nicht dekodiert werden:", e);
        // Fallback-Werte setzen
        canCreateArticles.value = false;
        userName.value = "Benutzer";
        userRole.value = "Benutzer";
        userRoleType.value = "";
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

    // Navigation zum Admin-Bereich
    const navigateToAdmin = async () => {
      console.log("[MemberSidebar] Navigating to admin area...");
      
      // Loading state aktivieren
      isNavigatingToAdmin.value = true;
      
      try {
        // Kurze Verzögerung für bessere UX (damit der Loader sichtbar wird)
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Aus Sicherheitsgründen erst ausloggen
        authService.logout();
        
        // Weitere kurze Verzögerung
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Direkt zu /admin weiterleiten
        await router.push("/admin");
      } catch (error) {
        console.error("[MemberSidebar] Error during admin navigation:", error);
        // Bei Fehler trotzdem weiterleiten
        window.location.href = "/admin";
      } finally {
        // Loading state wird nicht deaktiviert, da die Seite neu geladen wird
      }
    };

    // Drag & Drop Handler
    const handleDragStart = (event: DragEvent, itemId: string, index: number) => {
      // Verhindere Drag & Drop auf Mobile
      if (isMobile.value) {
        event.preventDefault();
        return;
      }

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

      // Mobile Detection
      checkScreenSize();
      window.addEventListener('resize', checkScreenSize);
      
      // Touch-Events für Swipe-to-close
      if (isMobile.value) {
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });
      }
      
      // Verhindere Drag & Drop auf Mobile
      if (isMobile.value) {
        menuOrder.value = []; // Reset der Reihenfolge auf Mobile
      }

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

      window.removeEventListener('resize', checkScreenSize);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);

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
      isAdminOrModerator,
      isNavigatingToAdmin,

      // Mobile states
      isMobile,
      isSmallMobile,

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
      navigateToAdmin,

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

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;
@use "@/style/base/animations" as animations;

// Moderne Icons
.Icons {
  width: 20px;
  height: 20px;
  position: absolute;
  transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
}

// Hauptcontainer mit intensivem Glass Effect
.member-sidebar {
  position: fixed;
  top: 70px;
  left: -300px;
  width: 300px;
  height: 100vh;
  z-index: 950;
  transition: left 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
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
  overflow: hidden;
  
  // Glass Refraction Layer mit grünem Glow
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(circle at 30% 70%, rgba(74, 210, 149, 0.15) 0%, transparent 60%),
      radial-gradient(circle at 70% 30%, rgba(155, 225, 93, 0.1) 0%, transparent 60%);
    pointer-events: none;
    mix-blend-mode: soft-light;
  }
  
  // Noise Texture für Glas-Effekt
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.03;
    mix-blend-mode: overlay;
    background-image: 
      repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255, 255, 255, 0.05) 35px, rgba(255, 255, 255, 0.05) 70px),
      repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(74, 210, 149, 0.03) 35px, rgba(74, 210, 149, 0.03) 70px);
    pointer-events: none;
  }

  // Light Theme - Angepasst an das Memberlayout
  .theme-light & {
    background: linear-gradient(
      135deg,
      rgba(237, 250, 239, 0.82) 0%,    // primary-bg mit höherer Opazität
      rgba(230, 245, 235, 0.72) 100%   // secondary-bg
    );
    box-shadow: 
      0 8px 32px rgba(38, 187, 119, 0.12),
      0 0 80px rgba(119, 205, 53, 0.08),
      inset 0 0 0 1px rgba(255, 255, 255, 0.8);
    border-right: 1px solid rgba(38, 187, 119, 0.18);
    
    &::before {
      background: 
        radial-gradient(circle at 30% 70%, rgba(38, 187, 119, 0.12) 0%, transparent 60%),
        radial-gradient(circle at 70% 30%, rgba(119, 205, 53, 0.08) 0%, transparent 60%);
    }
  }

  // Dark Theme - Intensiviertes Glas mit grünem Farbschema
  .theme-dark & {
    background: linear-gradient(
      135deg,
      rgba(15, 36, 25, 0.78) 0%,       // primary-bg dark mit Glass-Effekt
      rgba(22, 58, 39, 0.68) 100%      // secondary-bg dark
    );
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.4),
      0 0 100px rgba(74, 210, 149, 0.08),
      inset 0 0 0 1px rgba(74, 210, 149, 0.12);
    border-right: 1px solid rgba(74, 210, 149, 0.1);
    
    &::before {
      background: 
        radial-gradient(circle at 30% 70%, rgba(74, 210, 149, 0.08) 0%, transparent 60%),
        radial-gradient(circle at 70% 30%, rgba(155, 225, 93, 0.05) 0%, transparent 60%);
    }
  }

  &.open {
    left: 0;
    box-shadow: 
      0 16px 48px rgba(74, 210, 149, 0.08),
      0 0 120px rgba(74, 210, 149, 0.04);
    padding-top: 2rem;
    
    .theme-light & {
      box-shadow: 
        0 16px 64px rgba(38, 187, 119, 0.15),
        0 0 120px rgba(119, 205, 53, 0.08),
        inset 0 0 0 1px rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(28px) saturate(180%) brightness(1.12);
      -webkit-backdrop-filter: blur(28px) saturate(180%) brightness(1.12);
    }
    
    .theme-dark & {
      box-shadow: 
        0 16px 64px rgba(0, 0, 0, 0.5),
        0 0 120px rgba(74, 210, 149, 0.1),
        inset 0 0 0 1px rgba(74, 210, 149, 0.2);
      backdrop-filter: blur(32px) saturate(220%) brightness(1.18);
      -webkit-backdrop-filter: blur(32px) saturate(220%) brightness(1.18);
    }
  }

  // Sidebar-Header mit Glass-Separation
  .sidebar-header {
    display: flex;
    align-items: center;
    padding: map.get(vars.$spacing, m);
    position: relative;
    z-index: 1;
    
    // Glass Separator mit Glow
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: map.get(vars.$spacing, m);
      right: map.get(vars.$spacing, m);
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(74, 210, 149, 0.3) 20%,
        rgba(74, 210, 149, 0.3) 80%,
        transparent
      );
      box-shadow: 0 0 20px rgba(74, 210, 149, 0.2);
    }

    .profile-image-container {
      position: relative;
      margin-right: map.get(vars.$spacing, s);
      flex-shrink: 0;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);

      &:hover {
        transform: scale(1.05) translateZ(0);

        .account-logo {
          filter: brightness(1.1);
          box-shadow: 
            0 8px 24px rgba(74, 210, 149, 0.2),
            0 0 40px rgba(74, 210, 149, 0.1),
            0 0 0 3px rgba(74, 210, 149, 0.2);
        }

        .profile-edit-overlay {
          opacity: 1;
        }
      }

      .account-logo {
        width: 50px;
        height: 50px;
        border-radius: 16px;
        object-fit: cover;
        transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
        border: 2px solid rgba(74, 210, 149, 0.2);
        background: linear-gradient(135deg, rgba(74, 210, 149, 0.1), rgba(155, 225, 93, 0.05));
      }

      .profile-edit-overlay {
        position: absolute;
        inset: 0;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.3));
        backdrop-filter: blur(8px);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
        pointer-events: none;

        .edit-icon {
          font-size: 16px;
          color: #4ad295;
          filter: drop-shadow(0 2px 8px rgba(74, 210, 149, 0.5));
        }
      }

      .image-placeholder {
        width: 50px;
        height: 50px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, rgba(74, 210, 149, 0.15), rgba(155, 225, 93, 0.08));
        border: 2px solid rgba(74, 210, 149, 0.2);
        backdrop-filter: blur(10px);

        .placeholder-icon {
          width: 24px;
          height: 24px;
          color: #4ad295;
          opacity: 0.8;
        }
      }

      .profile-status-indicator {
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 18px;
        height: 18px;
        background: linear-gradient(135deg, #9be15d, #4ad295);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        border: 2px solid;
        animation: glow-pulse 2s ease-in-out infinite;
        
        .theme-light & {
          border-color: #edfaef;
          box-shadow: 0 0 20px rgba(155, 225, 93, 0.6);
        }
        
        .theme-dark & {
          border-color: #0f2419;
          box-shadow: 0 0 20px rgba(155, 225, 93, 0.8);
        }
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
        letter-spacing: -0.5px;

        .theme-light & {
          color: #005f40;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
        }
        
        .theme-dark & {
          color: #ffffff;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
      }

      .user-role {
        margin: 2px 0 0 0;
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        opacity: 0.8;
        font-weight: 500;

        .theme-light & {
          color: #2a7857;
        }
        
        .theme-dark & {
          color: #c7e9d6;
        }
      }

      .profile-status {
        display: block;
        font-size: map.get(map.get(vars.$fonts, sizes), xs);
        margin-top: 1px;
        opacity: 0.9;
        font-style: italic;
        color: #4ad295;
        text-shadow: 0 0 10px rgba(74, 210, 149, 0.5);
      }
    }

    .close-sidebar {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(74, 210, 149, 0.1), rgba(74, 210, 149, 0.05));
      backdrop-filter: blur(10px);
      border: 1px solid rgba(74, 210, 149, 0.2);
      border-radius: 10px;
      font-size: 1.5rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
      flex-shrink: 0;

      .theme-light & {
        color: #26bb77;

        &:hover {
          background: linear-gradient(135deg, rgba(38, 187, 119, 0.2), rgba(38, 187, 119, 0.1));
          transform: scale(1.1) rotate(90deg);
          box-shadow: 0 0 20px rgba(38, 187, 119, 0.3);
        }
      }
      
      .theme-dark & {
        color: #4ad295;

        &:hover {
          background: linear-gradient(135deg, rgba(74, 210, 149, 0.2), rgba(74, 210, 149, 0.1));
          transform: scale(1.1) rotate(90deg);
          box-shadow: 0 0 20px rgba(74, 210, 149, 0.4);
        }
      }
    }
  }

  // Admin-Bereich Button
  .admin-section {
    padding: 12px 16px;
    position: relative;
    z-index: 1;
    
    // Glass Separator mit Glow
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 16px;
      right: 16px;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(93, 173, 226, 0.3) 20%,
        rgba(255, 107, 157, 0.3) 80%,
        transparent
      );
      box-shadow: 0 0 20px rgba(93, 173, 226, 0.2);
    }

    .admin-button {
      width: 100%;
      display: flex;
      align-items: center;
      padding: 14px 18px;
      background: linear-gradient(135deg, rgba(93, 173, 226, 0.12), rgba(255, 107, 157, 0.08));
      border: 1px solid rgba(93, 173, 226, 0.2);
      border-radius: 16px;
      color: #5dade2;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
      gap: 10px;
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(10px);
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.08),
        inset 0 1px 2px rgba(255, 255, 255, 0.1);

      // Shimmer-Effekt
      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
        transition: left 0.5s ease;
      }

      // Light Theme
      .theme-light & {
        background: linear-gradient(135deg, rgba(93, 173, 226, 0.15), rgba(255, 107, 157, 0.1));
        border-color: rgba(93, 173, 226, 0.25);
        color: #0078d7;
        box-shadow: 
          0 2px 8px rgba(93, 173, 226, 0.12),
          inset 0 1px 0 rgba(255, 255, 255, 0.8);

        &:hover {
          background: linear-gradient(135deg, rgba(93, 173, 226, 0.22), rgba(255, 107, 157, 0.15));
          border-color: rgba(93, 173, 226, 0.35);
          color: #005a9e;
          transform: translateY(-1px);
          box-shadow: 
            0 4px 16px rgba(93, 173, 226, 0.18),
            0 0 24px rgba(93, 173, 226, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);

          &::before {
            left: 100%;
          }

          .admin-arrow {
            transform: translateX(3px);
          }
        }

        &:active {
          transform: translateY(0);
          box-shadow: 
            0 2px 8px rgba(93, 173, 226, 0.12),
            inset 0 1px 3px rgba(0, 0, 0, 0.05);
        }
      }
      
      // Dark Theme
      .theme-dark & {
        background: linear-gradient(135deg, rgba(93, 173, 226, 0.1), rgba(255, 107, 157, 0.06));
        border-color: rgba(93, 173, 226, 0.15);
        color: #5dade2;
        box-shadow: 
          0 2px 8px rgba(0, 0, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.05);

        &:hover {
          background: linear-gradient(135deg, rgba(93, 173, 226, 0.18), rgba(255, 107, 157, 0.12));
          border-color: rgba(93, 173, 226, 0.3);
          color: #85c1e2;
          transform: translateY(-1px);
          box-shadow: 
            0 4px 16px rgba(0, 0, 0, 0.25),
            0 0 24px rgba(93, 173, 226, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);

          &::before {
            left: 100%;
          }

          .admin-arrow {
            transform: translateX(3px);
          }
        }

        &:active {
          transform: translateY(0);
          box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.2),
            inset 0 1px 3px rgba(0, 0, 0, 0.2);
        }
      }

      .admin-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        flex-shrink: 0;

        svg {
          width: 20px;
          height: 20px;
          transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
        }
      }

      .admin-text {
        flex: 1;
        text-align: left;
        letter-spacing: -0.2px;
        font-weight: 600;
      }

      .admin-arrow {
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
        opacity: 0.8;

        svg {
          width: 16px;
          height: 16px;
        }
      }
    }
  }

  // Robuste Navigation mit Glass-Cards
  .sidebar-nav {
    flex: 1;
    padding: map.get(vars.$spacing, m);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;

    .nav-items-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
      position: relative;
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: 14px 18px;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
      position: relative;
      overflow: hidden;
      min-height: 52px;
      
      // Robuste Glass Card mit grünem Akzent
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.08) 0%,
        rgba(255, 255, 255, 0.04) 100%
      );
      border: 1px solid rgba(74, 210, 149, 0.1);
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.08),
        inset 0 1px 2px rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);

      // Light Theme Glass Cards
      .theme-light & {
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.75) 0%,
          rgba(237, 250, 239, 0.65) 100%
        );
        border: 1px solid rgba(38, 187, 119, 0.15);
        color: #005f40;
        font-weight: 500;
        box-shadow: 
          0 2px 8px rgba(38, 187, 119, 0.08),
          inset 0 1px 0 rgba(255, 255, 255, 0.8);
        
        &:hover:not(.dragging) {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(237, 250, 239, 0.8) 100%
          );
          border-color: rgba(38, 187, 119, 0.25);
          box-shadow: 
            0 4px 16px rgba(38, 187, 119, 0.12),
            0 0 24px rgba(38, 187, 119, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
          
          .nav-icon {
            color: #26bb77;
            filter: drop-shadow(0 0 8px rgba(38, 187, 119, 0.4));
          }
        }

        &.active:not(.dragging) {
          background: linear-gradient(
            135deg,
            rgba(38, 187, 119, 0.18) 0%,
            rgba(119, 205, 53, 0.12) 100%
          );
          color: #005f40;
          border-color: rgba(38, 187, 119, 0.35);
          box-shadow: 
            0 4px 20px rgba(38, 187, 119, 0.18),
            0 0 32px rgba(38, 187, 119, 0.1),
            inset 0 0 0 1px rgba(255, 255, 255, 0.5);
          font-weight: 600;

          .nav-icon {
            color: #26bb77;
            filter: drop-shadow(0 0 12px rgba(38, 187, 119, 0.6));
          }
          
          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 3px;
            height: 60%;
            background: linear-gradient(180deg, #77cd35, #26bb77);
            border-radius: 0 3px 3px 0;
            box-shadow: 0 0 16px rgba(38, 187, 119, 0.5);
          }
        }
      }
      
      // Dark Theme Glass Cards
      .theme-dark & {
        background: linear-gradient(
          135deg,
          rgba(74, 210, 149, 0.1) 0%,
          rgba(74, 210, 149, 0.05) 100%
        );
        border: 1px solid rgba(74, 210, 149, 0.12);
        color: #c7e9d6;
        box-shadow: 
          0 2px 8px rgba(0, 0, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.05);
        
        &:hover:not(.dragging) {
          background: linear-gradient(
            135deg,
            rgba(74, 210, 149, 0.18) 0%,
            rgba(155, 225, 93, 0.1) 100%
          );
          border-color: rgba(74, 210, 149, 0.25);
          box-shadow: 
            0 4px 16px rgba(0, 0, 0, 0.25),
            0 0 24px rgba(74, 210, 149, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
          
          .nav-icon {
            color: #4ad295;
            filter: drop-shadow(0 0 8px rgba(74, 210, 149, 0.5));
          }
        }

        &.active:not(.dragging) {
          background: linear-gradient(
            135deg,
            rgba(74, 210, 149, 0.28) 0%,
            rgba(155, 225, 93, 0.18) 100%
          );
          color: #ffffff;
          border-color: rgba(74, 210, 149, 0.4);
          box-shadow: 
            0 4px 20px rgba(0, 0, 0, 0.3),
            0 0 32px rgba(74, 210, 149, 0.15),
            inset 0 0 0 1px rgba(255, 255, 255, 0.1);
          font-weight: 600;

          .nav-icon {
            color: #4ad295;
            filter: drop-shadow(0 0 12px rgba(74, 210, 149, 0.7));
          }
          
          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 3px;
            height: 60%;
            background: linear-gradient(180deg, #9be15d, #4ad295);
            border-radius: 0 3px 3px 0;
            box-shadow: 0 0 16px rgba(74, 210, 149, 0.6);
          }
        }
      }

      // Hover Glass Refraction
      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.1) 0%, transparent 50%);
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      }

      &:hover::after {
        opacity: 1;
      }

      // Drag & Drop Styles
      &.dragging {
        opacity: 0.3;
        cursor: grabbing !important;
        transform: scale(0.95);
        filter: blur(2px);
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
        
        .theme-light & {
          color: #2a7857;
        }
        
        .theme-dark & {
          color: #8fd3b5;
        }
      }

      &:hover .drag-handle {
        opacity: 0.5;
      }

      .nav-icon {
        margin-right: 14px;
        margin-left: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
        opacity: 0.8;
      }

      .nav-text {
        font-weight: 500;
        font-size: 14px;
        letter-spacing: -0.2px;
        transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
        flex: 1;
      }

      // Badge mit intensivem Grün-Glow
      .nav-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 22px;
        height: 22px;
        padding: 0 7px;
        border-radius: 11px;
        font-size: 11px;
        font-weight: 600;
        line-height: 1;
        margin-left: auto;
        background: linear-gradient(135deg, #4ad295, #35ccd0);
        color: white;
        box-shadow: 
          0 2px 12px rgba(74, 210, 149, 0.5),
          0 0 24px rgba(74, 210, 149, 0.3),
          inset 0 0 0 1px rgba(255, 255, 255, 0.3);
        animation: badge-glow 2s ease-in-out infinite;
        border: 1px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(4px);
      }
    }

    // Drop Indikator mit Grün-Glow
    .drop-indicator {
      position: absolute;
      left: 8px;
      right: 8px;
      height: 3px;
      background: linear-gradient(90deg, transparent, #4ad295, transparent);
      border-radius: 1.5px;
      opacity: 0;
      transition: opacity 0.2s cubic-bezier(0.4, 0.2, 0.2, 1);
      pointer-events: none;
      z-index: 10;
      box-shadow: 
        0 0 10px rgba(74, 210, 149, 0.8),
        0 0 20px rgba(74, 210, 149, 0.4);
    }
  }

  // Support-Bereich mit Glass-Effekt
  .support-section {
    margin-top: auto;
    padding: map.get(vars.$spacing, m);
    padding-bottom: 100px;

    .support-divider {
      height: 1px;
      margin-bottom: map.get(vars.$spacing, m);
      background: linear-gradient(
        90deg,
        transparent,
        rgba(74, 210, 149, 0.2),
        transparent
      );
      box-shadow: 0 0 10px rgba(74, 210, 149, 0.1);
    }

    .support-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .support-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
      position: relative;
      font-size: 13px;
      flex: 1;
      min-height: 44px;

      .theme-light & {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.6), rgba(230, 245, 235, 0.4));
        border: 1px solid rgba(38, 187, 119, 0.1);
        color: #2a7857;

        &:hover {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(230, 245, 235, 0.6));
          color: #005f40;
          transform: translateX(3px);
          box-shadow: 0 4px 16px rgba(38, 187, 119, 0.1);
          
          .support-icon {
            color: #26bb77;
          }
        }

        &.active {
          background: linear-gradient(135deg, rgba(38, 187, 119, 0.15), rgba(119, 205, 53, 0.1));
          color: #005f40;
          box-shadow: 0 0 20px rgba(38, 187, 119, 0.15);
          
          .support-icon {
            color: #26bb77;
          }
        }
      }
      
      .theme-dark & {
        background: linear-gradient(135deg, rgba(74, 210, 149, 0.08), rgba(74, 210, 149, 0.03));
        border: 1px solid rgba(74, 210, 149, 0.08);
        color: #8fd3b5;

        &:hover {
          background: linear-gradient(135deg, rgba(74, 210, 149, 0.15), rgba(155, 225, 93, 0.08));
          color: #c7e9d6;
          transform: translateX(3px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
          
          .support-icon {
            color: #4ad295;
          }
        }

        &.active {
          background: linear-gradient(135deg, rgba(74, 210, 149, 0.2), rgba(155, 225, 93, 0.1));
          color: #ffffff;
          box-shadow: 0 0 20px rgba(74, 210, 149, 0.2);
          
          .support-icon {
            color: #4ad295;
          }
        }
      }

      .support-icon {
        margin-right: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
      }

      .support-text {
        font-weight: 500;
        letter-spacing: -0.2px;
        flex: 1;
      }

      .support-badge {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 20px;
        height: 20px;
        padding: 0 6px;
        border-radius: 10px;
        font-size: 10px;
        font-weight: 600;
        line-height: 1;
        margin-left: auto;
        background: linear-gradient(135deg, #4ad295, #35ccd0);
        color: white;
        box-shadow: 0 2px 8px rgba(74, 210, 149, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
    }

    // Reset Button mit Glass-Effekt
    .reset-button {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: linear-gradient(135deg, rgba(74, 210, 149, 0.1), rgba(74, 210, 149, 0.05));
      backdrop-filter: blur(10px);
      cursor: pointer;
      border-radius: 12px;
      transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
      flex-shrink: 0;
      border: 1px solid rgba(74, 210, 149, 0.1);

      .theme-light & {
        color: #2a7857;

        &:hover {
          color: #005f40;
          background: linear-gradient(135deg, rgba(38, 187, 119, 0.15), rgba(38, 187, 119, 0.08));
          transform: rotate(-45deg) scale(1.05);
          box-shadow: 0 0 20px rgba(38, 187, 119, 0.2);
        }
      }
      
      .theme-dark & {
        color: #8fd3b5;

        &:hover {
          color: #c7e9d6;
          background: linear-gradient(135deg, rgba(74, 210, 149, 0.15), rgba(74, 210, 149, 0.08));
          transform: rotate(-45deg) scale(1.05);
          box-shadow: 0 0 20px rgba(74, 210, 149, 0.3);
        }
      }

      &.reset-active {
        animation: reset-spin 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }
    }
  }
}

// Logo mit Glass-Effekt
.logo-Sidebar {
  display: block;
  margin: 0 auto;
  height: 100px;
  width: 100px;
  border-radius: 24px;
  margin-bottom: map.get(vars.$spacing, m);
  opacity: 0.95;
  transition: all 0.4s cubic-bezier(0.4, 0.2, 0.2, 1);
  backdrop-filter: blur(10px);
  
  .theme-light & {
    box-shadow: 
      0 8px 24px rgba(38, 187, 119, 0.15),
      inset 0 0 0 1px rgba(255, 255, 255, 0.5);
  }
  
  .theme-dark & {
    box-shadow: 
      0 8px 24px rgba(0, 0, 0, 0.3),
      inset 0 0 0 1px rgba(74, 210, 149, 0.2);
  }

  &:hover {
    opacity: 1;
    transform: scale(1.05) translateZ(0);
    
    .theme-light & {
      box-shadow: 
        0 12px 32px rgba(38, 187, 119, 0.2),
        0 0 40px rgba(38, 187, 119, 0.1),
        inset 0 0 0 2px rgba(38, 187, 119, 0.3);
    }
    
    .theme-dark & {
      box-shadow: 
        0 12px 32px rgba(0, 0, 0, 0.4),
        0 0 40px rgba(74, 210, 149, 0.15),
        inset 0 0 0 2px rgba(74, 210, 149, 0.3);
    }
  }
}

// Admin Loading Overlay
.admin-loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  border-radius: 0 32px 32px 0;
  
  // Glass-Effect passend zum Sidebar-Design
  .theme-light & {
    background: linear-gradient(
      135deg,
      rgba(237, 250, 239, 0.95) 0%,
      rgba(255, 255, 255, 0.9) 100%
    );
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
  }
  
  .theme-dark & {
    background: linear-gradient(
      135deg,
      rgba(15, 36, 25, 0.95) 0%,
      rgba(22, 58, 39, 0.9) 100%
    );
    backdrop-filter: blur(20px) saturate(220%);
    -webkit-backdrop-filter: blur(20px) saturate(220%);
  }

  .loading-content {
    text-align: center;
    padding: 20px;
  }

  // Multi-Ring Spinner mit Admin-Farben (Blau/Pink)
  .loading-spinner {
    position: relative;
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;

    .spinner-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 3px solid transparent;
      
      // Ring 1 - Äußerer Ring (Blau)
      &:nth-child(1) {
        border-top-color: #5dade2;
        border-right-color: #5dade2;
        animation: spin-ring-1 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
      }

      // Ring 2 - Mittlerer Ring (Pink)
      &:nth-child(2) {
        inset: 10px;
        border-top-color: #ff6b9d;
        border-bottom-color: #ff6b9d;
        animation: spin-ring-2 2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
      }

      // Ring 3 - Innerer Ring (Orange)
      &:nth-child(3) {
        inset: 20px;
        border-left-color: #ff8c42;
        border-right-color: #ff8c42;
        animation: spin-ring-3 1s linear infinite;
      }
    }
  }

  .loading-text {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
    
    .theme-light & {
      color: #0078d7;
      text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
    }
    
    .theme-dark & {
      color: #5dade2;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
  }

  .loading-subtext {
    font-size: 14px;
    opacity: 0.8;
    
    .theme-light & {
      color: #005a9e;
    }
    
    .theme-dark & {
      color: #85c1e2;
    }
    
    // Pulsierender Punkt-Animation
    &::after {
      content: '';
      display: inline-block;
      animation: dots 1.5s steps(4, end) infinite;
    }
  }
}

// Spinner Animationen
@keyframes spin-ring-1 {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.1);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}

@keyframes spin-ring-2 {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(-180deg) scale(0.9);
  }
  100% {
    transform: rotate(-360deg) scale(1);
  }
}

@keyframes spin-ring-3 {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dots {
  0%, 20% {
    content: '';
  }
  40% {
    content: '.';
  }
  60% {
    content: '..';
  }
  80%, 100% {
    content: '...';
  }
}

// Fade Transition für Overlay
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// Transitions
.nav-item-move-move {
  transition: transform 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
}

// Animations
@keyframes badge-glow {
  0%, 100% {
    box-shadow: 
      0 2px 8px rgba(74, 210, 149, 0.4),
      0 0 20px rgba(74, 210, 149, 0.3);
  }
  50% {
    box-shadow: 
      0 2px 12px rgba(74, 210, 149, 0.6),
      0 0 30px rgba(74, 210, 149, 0.5);
  }
}

@keyframes glow-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 20px rgba(155, 225, 93, 0.6);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.05);
    box-shadow: 0 0 30px rgba(155, 225, 93, 0.8);
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

// Glass-Scrollbar
.sidebar-nav {
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(74, 210, 149, 0.3), rgba(155, 225, 93, 0.2));
    border-radius: 3px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    
    &:hover {
      background: linear-gradient(180deg, rgba(74, 210, 149, 0.5), rgba(155, 225, 93, 0.3));
      box-shadow: 0 0 10px rgba(74, 210, 149, 0.3);
    }
  }
}

// Mobile Responsive Styles
@media (max-width: 768px) {
  .member-sidebar {
    width: 100vw;
    left: -100vw;
    border-radius: 0;
    padding-top: 0;
    
    &.open {
      left: 0;
      width: 100vw;
      padding-top: 0;
      
      // Entferne den Glassmorphismus-Rand auf Mobile
      border-right: none;
      border-radius: 0;
    }
    
    // Logo komplett ausblenden auf Mobile
    .logo-link,
    .logo-Sidebar {
      display: none;
    }
    
    // Header anpassen für mehr Platz
    .sidebar-header {
      padding: 16px;
      padding-top: 24px; // Mehr Abstand oben für Status Bar
      
      .profile-image-container {
        margin-right: 12px;
        
        .account-logo,
        .image-placeholder {
          width: 45px;
          height: 45px;
        }
      }
      
      .header-content {
        h3 {
          font-size: 16px;
        }
        
        .user-role {
          font-size: 12px;
        }
      }
      
      .close-sidebar {
        width: 36px;
        height: 36px;
        font-size: 1.8rem;
      }
    }
    
    // Admin-Bereich Button anpassen
    .admin-section {
      padding: 12px;
      
      .admin-button {
        padding: 12px 14px;
        font-size: 13px;
      }
    }
    
    // Navigation volle Breite
    .sidebar-nav {
      padding: 12px;
      
      .nav-items-container {
        gap: 6px;
      }
      
      .nav-item {
        padding: 12px 14px;
        min-height: 48px;
        
        // Drag Handle auf Mobile ausblenden
        .drag-handle {
          display: none;
        }
        
        .nav-icon {
          margin-left: 0;
          margin-right: 12px;
          width: 22px;
          height: 22px;
        }
        
        .nav-text {
          font-size: 14px;
        }
        
        .nav-badge {
          min-width: 20px;
          height: 20px;
          font-size: 10px;
          padding: 0 6px;
        }
      }
    }
    
    // Support-Bereich anpassen
    .support-section {
      padding: 12px;
      padding-bottom: 20px; // Weniger Abstand unten
      
      .support-container {
        gap: 6px;
      }
      
      .support-item {
        padding: 10px 12px;
        min-height: 40px;
        font-size: 12px;
        
        .support-icon {
          width: 18px;
          height: 18px;
          margin-right: 8px;
        }
      }
      
      .reset-button {
        width: 36px;
        height: 36px;
      }
    }
    
    // Admin Loading Overlay
    .admin-loading-overlay {
      border-radius: 0;
      
      .loading-spinner {
        width: 60px;
        height: 60px;
        
        .spinner-ring {
          border-width: 2px;
          
          &:nth-child(2) {
            inset: 8px;
          }
          
          &:nth-child(3) {
            inset: 16px;
          }
        }
      }
      
      .loading-text {
        font-size: 14px;
      }
      
      .loading-subtext {
        font-size: 12px;
      }
    }
  }
}

// Noch kleinere Bildschirme (unter 360px)
@media (max-width: 360px) {
  .member-sidebar {
    .sidebar-header {
      padding: 12px;
      padding-top: 20px;
      
      .profile-image-container {
        .account-logo,
        .image-placeholder {
          width: 40px;
          height: 40px;
        }
      }
      
      .header-content {
        h3 {
          font-size: 14px;
        }
        
        .user-role {
          font-size: 11px;
        }
      }
      
      .close-sidebar {
        width: 32px;
        height: 32px;
      }
    }
    
    .sidebar-nav {
      padding: 10px;
      
      .nav-item {
        padding: 10px 12px;
        min-height: 44px;
        
        .nav-icon {
          width: 20px;
          height: 20px;
        }
        
        .nav-text {
          font-size: 13px;
        }
      }
    }
  }
}

// Touch-Geräte optimieren
@media (hover: none) and (pointer: coarse) {
  .member-sidebar {
    // Erhöhe Touch-Targets
    .nav-item,
    .support-item,
    .admin-button {
      min-height: 48px;
    }
    
    // Deaktiviere Hover-Effekte auf Touch-Geräten
    .profile-image-container:hover {
      transform: none;
      
      .profile-edit-overlay {
        opacity: 0;
      }
    }
    
    // Scrollbar optimieren für Touch
    .sidebar-nav {
      &::-webkit-scrollbar {
        width: 0;
      }
      
      // Momentum Scrolling für iOS
      -webkit-overflow-scrolling: touch;
      overflow-y: auto;
    }
  }
}

// Landscape Modus für Mobile
@media (max-width: 768px) and (orientation: landscape) {
  .member-sidebar {
    .sidebar-header {
      padding: 12px;
      padding-top: 16px;
      
      .profile-image-container {
        .account-logo,
        .image-placeholder {
          width: 35px;
          height: 35px;
        }
      }
    }
    
    .sidebar-nav {
      .nav-item {
        min-height: 42px;
        padding: 10px 12px;
      }
    }
    
    .support-section {
      padding-bottom: 16px;
    }
  }
}

// Safe Area Insets für Notch-Geräte
@supports (padding: max(0px)) {
  .member-sidebar {
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
    
    &.open {
      .sidebar-header {
        padding-top: max(24px, env(safe-area-inset-top));
      }
      
      .support-section {
        padding-bottom: max(20px, env(safe-area-inset-bottom));
      }
    }
  }
}

// Responsive
@media (min-width: 1024px) {
  .member-sidebar {
    left: 0;
    transform: translateX(-100%);

    &.open {
      transform: translateX(0);
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>