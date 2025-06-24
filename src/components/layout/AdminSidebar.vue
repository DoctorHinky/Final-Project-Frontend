<!-- src/components/layout/AdminSidebar.vue -->
<template>
  <aside class="admin-sidebar" :class="{ open: isOpen }">
    <!-- Logo wie in Member-Sidebar -->
    <a href="/" class="logo-link">
      <img src="../../assets/images/Logo.webp" alt="Logo" class="logo-Sidebar" />
    </a>

    <!-- Sidebar-Header mit Benutzerinfo -->
    <div class="sidebar-header">
      <div class="profile-image-container">
        <img :src="userPicture" alt="Account Logo" class="account-logo" />
        <!-- Hover-Indikator für Klickbarkeit -->
        <div class="profile-edit-overlay">
          <span class="edit-icon">👤</span>
        </div>
      </div>
      <div class="header-content">
        <h3 v-if="userName">{{ userName }}</h3>
        <p v-if="userRole" class="user-role">{{ userRole }}</p>
        <span class="profile-status">Admin-Bereich</span>
      </div>
      <button class="close-sidebar" @click="$emit('close')">×</button>
    </div>

    <!-- Sidebar-Navigation -->
    <nav class="sidebar-nav" ref="navContainer">
      <transition-group name="nav-item-move" tag="div" class="nav-items-container">
        <div
          v-for="(item, index) in menuItems"
          :key="item.id"
          :data-item-id="item.id"
          class="nav-item"
          :class="{
            active: isActiveItem(item.id),
            dragging: draggedItem === item.id,
            'drag-over': dragOverIndex === index,
          }"
          draggable="true"
          @click="selectMenuItem(item.id)"
          @dragstart="handleDragStart($event, item.id, index)"
          @dragend="handleDragEnd"
          @dragover="handleDragOver($event, index)"
          @dragleave="handleDragLeave"
          @drop="handleDrop($event, index)"
        >
          <!-- Drag Handle -->
          <span class="drag-handle" @click.stop>
            <Bars3Icon class="h-4 w-4" />
          </span>

          <span class="nav-icon">
            <component :is="item.icon" class="h-6 w-6" />
          </span>
          <span class="nav-text">{{ item.text }}</span>
        </div>

        <!-- Drop-Indikator Linie -->
        <div v-if="showDropIndicator" class="drop-indicator" :style="dropIndicatorStyle"></div>
      </transition-group>
    </nav>

    <!-- Sidebar-Footer mit Zurück-Button -->
    <div class="sidebar-footer">
      <div class="footer-divider"></div>
      <div class="footer-container">
        <button class="back-button" @click="navigateToMemberDashboard">
          <span class="back-text">Member-Bereich</span>
          <span class="back-arrow">
            <ChevronRightIcon class="h-4 w-4" />
          </span>
        </button>

        <!-- Reset Button -->
        <button class="reset-button" @click="resetMenuOrder" title="Menüreihenfolge zurücksetzen">
          <ArrowPathIcon class="h-4 w-4 Icons" />
        </button>
      </div>
    </div>
  </aside>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  HomeIcon,
  UsersIcon,
  UserMinusIcon,
  DocumentTextIcon,
  TicketIcon,
  DocumentIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  Bars3Icon,
  ArrowPathIcon,
} from "@heroicons/vue/24/outline";
import userService from "@/services/userMD.services";
import type { TokenPayload } from "@/types/dtos";

// Storage Key für die Menüreihenfolge
const MENU_ORDER_STORAGE_KEY = "admin-sidebar-menu-order";

export default defineComponent({
  name: "AdminSidebar",
  components: {
    HomeIcon,
    UsersIcon,
    UserMinusIcon,
    DocumentTextIcon,
    DocumentIcon,
    TicketIcon,
    ArrowLeftIcon,
    ChevronRightIcon,
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
      default: "",
    },
  },
  emits: ["select-menu", "close", "logout"],
  setup(props, { emit }) {
    const router = useRouter();
    const route = useRoute();

    // Benutzerinformationen
    const userName = ref("");
    const userRole = ref("");
    const userPicture = ref("");

    // Drag & Drop State - MUSS VOR COMPUTED UND FUNKTIONEN DEFINIERT WERDEN
    const draggedItem = ref<string | null>(null);
    const draggedIndex = ref<number | null>(null);
    const dragOverIndex = ref<number | null>(null);
    const showDropIndicator = ref(false);
    const dropIndicatorStyle = ref({});
    const navContainer = ref<HTMLElement | null>(null);
    const menuOrder = ref<string[]>([]);

    // Basis-Menüelemente
    const baseMenuItems = ref([
      {
        id: "overview",
        text: "Überblick",
        icon: HomeIcon,
      },
      {
        id: "all-users",
        text: "Alle User",
        icon: UsersIcon,
      },
      {
        id: "applications",
        text: "Bewerbungen",
        icon: DocumentIcon,
      },
      {
        id: "active-posts",
        text: "Active Posts",
        icon: DocumentTextIcon,
      },
      {
        id: "tickets",
        text: "Tickets",
        icon: TicketIcon,
      },
      {
        id: "deleted-users",
        text: "Gelöschte User",
        icon: UserMinusIcon,
      },
    ]);

    // Sortierte Menüelemente basierend auf gespeicherter Reihenfolge
    const menuItems = computed(() => {
      if (menuOrder.value.length === 0) {
        return baseMenuItems.value;
      }

      // Sortiere basierend auf der gespeicherten Reihenfolge
      const sorted: typeof baseMenuItems.value = [];

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

    // Bei Montage der Komponente die Benutzerinformationen laden
    onMounted(async () => {
      // Load menu order first
      loadMenuOrder();

      try {
        // Token dekodieren für Benutzerinformationen
        const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
        if (token) {
          try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const decoded = JSON.parse(window.atob(base64)) as TokenPayload;

            // Username direkt aus dem Token
            userName.value = decoded.username || "Administrator";

            // Rolle anzeigen (auf Deutsch)
            const roleMap: Record<string, string> = {
              admin: "Administrator",
              author: "Autor",
              user: "Benutzer",
              moderator: "Moderator",
            };

            // Rolle für Anzeige setzen
            const displayRole = decoded.role || "";
            userRole.value = roleMap[displayRole.toLowerCase()] || displayRole;
            const userData = await userService.getCurrentUser();
            if (userData && userData.profilePicture) {
              console.log("Benutzerprofilbild gefunden:", userData.profilePicture);
              userPicture.value = userData.profilePicture;
            } else {
              userPicture.value = "https://api.api-ninjas.com/v1/randomimage";
            }
          } catch (e) {
            console.error("Token konnte nicht dekodiert werden:", e);
            userName.value = "Administrator";
            userRole.value = "Admin";
          }
        } else {
          // Kein Token
          userName.value = "Administrator";
          userRole.value = "Admin";
        }
      } catch (error) {
        console.error("Fehler beim Laden der Benutzerinformationen:", error);
        userName.value = "Administrator";
        userRole.value = "Admin";
      }
    });

    // Prüfen ob ein Item aktiv ist
    const isActiveItem = (itemId: string) => {
      // Wenn kein activeMenu gesetzt ist und wir auf der Dashboard-Route ohne tab sind,
      // dann ist 'overview' aktiv
      if (!props.activeMenu && route.path === "/admin/dashboard" && !route.query.tab) {
        return itemId === "overview";
      }

      // Ansonsten normaler Check
      return props.activeMenu === itemId;
    };

    // Menüpunkt auswählen
    const selectMenuItem = (itemId: string) => {
      // Event emittieren
      emit("select-menu", itemId);

      // Navigation anpassen
      if (itemId === "overview") {
        // Für Dashboard/Übersicht keine Query-Parameter
        router.push({
          path: "/admin/dashboard",
        });
      } else {
        // Für alle anderen Items mit Tab-Query navigieren
        router.push({
          path: "/admin/dashboard",
          query: { tab: itemId },
        });
      }
    };

    // Navigation zum Member Dashboard
    const navigateToMemberDashboard = () => {
      router.push("/member/dashboard");
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
      const items = [...menuItems.value];
      const draggedItemObj = items[draggedIndex.value];

      // Entferne das gezogene Element
      items.splice(draggedIndex.value, 1);

      // Füge es an der neuen Position ein
      const insertIndex = dropIndex > draggedIndex.value ? dropIndex - 1 : dropIndex;
      items.splice(insertIndex, 0, draggedItemObj);

      // Speichere neue Reihenfolge
      menuOrder.value = items.map((item) => item.id);
      saveMenuOrder();

      // Cleanup
      showDropIndicator.value = false;
      dragOverIndex.value = null;
    };

    // Menüreihenfolge speichern
    const saveMenuOrder = () => {
      localStorage.setItem(MENU_ORDER_STORAGE_KEY, JSON.stringify(menuOrder.value));
    };

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

    return {
      menuItems,
      selectMenuItem,
      isActiveItem,
      navigateToMemberDashboard,
      userName,
      userRole,
      userPicture,
      // Drag & Drop State
      draggedItem,
      dragOverIndex,
      showDropIndicator,
      dropIndicatorStyle,
      navContainer,
      // Drag & Drop Methods
      handleDragStart,
      handleDragEnd,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      resetMenuOrder,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;
@use "@/style/base/animations" as animations;

// Hauptcontainer mit intensivem Glass Effect - Admin Farben
.admin-sidebar {
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

  // Liquid glass effect mit Admin-Farben
  background: rgba(30, 30, 40, 0.85);
  box-shadow: 0 8px 32px 0 rgba(93, 173, 226, 0.25);
  backdrop-filter: blur(24px) saturate(180%) brightness(1.05);
  -webkit-backdrop-filter: blur(24px) saturate(180%) brightness(1.05);
  border-right: 1.5px solid rgba(93, 173, 226, 0.2);
  border-radius: 0 32px 32px 0;
  overflow: hidden;

  // Glass Refraction Layer mit Admin Glow
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 30% 70%, rgba(93, 173, 226, 0.15) 0%, transparent 60%),
      radial-gradient(circle at 70% 30%, rgba(255, 107, 157, 0.1) 0%, transparent 60%);
    pointer-events: none;
    mix-blend-mode: soft-light;
  }

  // Noise Texture für Glas-Effekt
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    opacity: 0.03;
    mix-blend-mode: overlay;
    background-image: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 35px,
        rgba(255, 255, 255, 0.05) 35px,
        rgba(255, 255, 255, 0.05) 70px
      ),
      repeating-linear-gradient(
        -45deg,
        transparent,
        transparent 35px,
        rgba(93, 173, 226, 0.03) 35px,
        rgba(93, 173, 226, 0.03) 70px
      );
    pointer-events: none;
  }

  &.open {
    left: 0;
    box-shadow: 0 16px 48px rgba(93, 173, 226, 0.2), 0 0 120px rgba(255, 107, 157, 0.1);
    padding-top: 2rem;
    backdrop-filter: blur(32px) saturate(220%) brightness(1.1);
    -webkit-backdrop-filter: blur(32px) saturate(220%) brightness(1.1);
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
      content: "";
      position: absolute;
      bottom: 0;
      left: map.get(vars.$spacing, m);
      right: map.get(vars.$spacing, m);
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
          box-shadow: 0 8px 24px rgba(93, 173, 226, 0.3), 0 0 40px rgba(255, 107, 157, 0.2),
            0 0 0 3px rgba(93, 173, 226, 0.3);
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
        border: 2px solid rgba(93, 173, 226, 0.3);
        background: linear-gradient(135deg, rgba(93, 173, 226, 0.1), rgba(255, 107, 157, 0.05));
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
          color: #5dade2;
          filter: drop-shadow(0 2px 8px rgba(93, 173, 226, 0.5));
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
        color: #ffffff;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .user-role {
        margin: 2px 0 0 0;
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        opacity: 0.8;
        font-weight: 500;
        color: #5dade2;
      }

      .profile-status {
        display: block;
        font-size: map.get(map.get(vars.$fonts, sizes), xs);
        margin-top: 1px;
        opacity: 0.9;
        font-style: italic;
        color: #ff6b9d;
        text-shadow: 0 0 10px rgba(255, 107, 157, 0.5);
      }
    }

    .close-sidebar {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(93, 173, 226, 0.1), rgba(93, 173, 226, 0.05));
      backdrop-filter: blur(10px);
      border: 1px solid rgba(93, 173, 226, 0.2);
      border-radius: 10px;
      font-size: 1.5rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
      flex-shrink: 0;
      color: #5dade2;

      &:hover {
        background: linear-gradient(135deg, rgba(93, 173, 226, 0.2), rgba(93, 173, 226, 0.1));
        transform: scale(1.1) rotate(90deg);
        box-shadow: 0 0 20px rgba(93, 173, 226, 0.4);
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

      // Robuste Glass Card mit Admin Akzent
      background: linear-gradient(135deg, rgba(93, 173, 226, 0.08) 0%, rgba(93, 173, 226, 0.04) 100%);
      border: 1px solid rgba(93, 173, 226, 0.12);
      color: #a8d5e8;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05);

      &:hover:not(.dragging) {
        background: linear-gradient(135deg, rgba(93, 173, 226, 0.18) 0%, rgba(255, 107, 157, 0.1) 100%);
        border-color: rgba(93, 173, 226, 0.25);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25), 0 0 24px rgba(93, 173, 226, 0.12),
          inset 0 1px 0 rgba(255, 255, 255, 0.08);

        .nav-icon {
          color: #5dade2;
          filter: drop-shadow(0 0 8px rgba(93, 173, 226, 0.5));
        }
      }

      &.active:not(.dragging) {
        background: linear-gradient(135deg, rgba(93, 173, 226, 0.28) 0%, rgba(255, 107, 157, 0.18) 100%);
        color: #ffffff;
        border-color: rgba(93, 173, 226, 0.4);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 32px rgba(93, 173, 226, 0.15),
          inset 0 0 0 1px rgba(255, 255, 255, 0.1);
        font-weight: 600;

        .nav-icon {
          color: #5dade2;
          filter: drop-shadow(0 0 12px rgba(93, 173, 226, 0.7));
        }

        &::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: linear-gradient(180deg, #5dade2, #ff6b9d);
          border-radius: 0 3px 3px 0;
          box-shadow: 0 0 16px rgba(93, 173, 226, 0.6);
        }
      }

      // Hover Glass Refraction
      &::after {
        content: "";
        position: absolute;
        inset: 0;
        background: radial-gradient(
          circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
          rgba(255, 255, 255, 0.1) 0%,
          transparent 50%
        );
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
        color: #8fd3b5;
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
    }

    // Drop Indikator mit Admin-Glow
    .drop-indicator {
      position: absolute;
      left: 8px;
      right: 8px;
      height: 3px;
      background: linear-gradient(90deg, transparent, #5dade2, transparent);
      border-radius: 1.5px;
      opacity: 0;
      transition: opacity 0.2s cubic-bezier(0.4, 0.2, 0.2, 1);
      pointer-events: none;
      z-index: 10;
      box-shadow: 0 0 10px rgba(93, 173, 226, 0.8), 0 0 20px rgba(93, 173, 226, 0.4);
    }
  }

  // Footer-Bereich mit Glass-Effekt
  .sidebar-footer {
    margin-top: auto;
    padding: map.get(vars.$spacing, m);
    padding-bottom: 100px;

    .footer-divider {
      height: 1px;
      margin-bottom: map.get(vars.$spacing, m);
      background: linear-gradient(90deg, transparent, rgba(93, 173, 226, 0.2), rgba(255, 107, 157, 0.2), transparent);
      box-shadow: 0 0 10px rgba(93, 173, 226, 0.1);
    }

    .footer-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .back-button {
      flex: 1;
      display: flex;
      align-items: center;
      padding: 14px 18px;
      background: linear-gradient(135deg, rgba(255, 107, 157, 0.12), rgba(93, 173, 226, 0.08));
      border: 1px solid rgba(255, 107, 157, 0.2);
      border-radius: 16px;
      color: #ff6b9d;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
      gap: 10px;
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.1);

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

      &:hover {
        background: linear-gradient(135deg, rgba(255, 107, 157, 0.22), rgba(93, 173, 226, 0.15));
        border-color: rgba(255, 107, 157, 0.35);
        color: #ff8fab;
        transform: translateY(-1px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25), 0 0 24px rgba(255, 107, 157, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.08);

        &::before {
          left: 100%;
        }

        .back-arrow {
          transform: translateX(3px) rotate(180deg);
        }
      }

      &:active {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 3px rgba(0, 0, 0, 0.2);
      }

      .back-icon {
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

      .back-text {
        flex: 1;
        text-align: left;
        letter-spacing: -0.2px;
        font-weight: 600;
      }

      .back-arrow {
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

    // Reset Button mit Glass-Effekt
    .reset-button {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: linear-gradient(135deg, rgba(93, 173, 226, 0.1), rgba(93, 173, 226, 0.05));
      backdrop-filter: blur(10px);
      cursor: pointer;
      border-radius: 12px;
      transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
      flex-shrink: 0;
      border: 1px solid rgba(93, 173, 226, 0.1);
      color: #8fd3b5;

      &:hover {
        color: #c7e9d6;
        background: linear-gradient(135deg, rgba(93, 173, 226, 0.15), rgba(93, 173, 226, 0.08));
        transform: rotate(-45deg) scale(1.05);
        box-shadow: 0 0 20px rgba(93, 173, 226, 0.3);
      }

      &.reset-active {
        animation: reset-spin 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }

      .Icons {
        width: 20px;
        height: 20px;
        position: absolute;
        transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
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
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(93, 173, 226, 0.2);

  &:hover {
    opacity: 1;
    transform: scale(1.05) translateZ(0);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4), 0 0 40px rgba(93, 173, 226, 0.15),
      inset 0 0 0 2px rgba(93, 173, 226, 0.3);
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
    background: linear-gradient(180deg, rgba(93, 173, 226, 0.3), rgba(255, 107, 157, 0.2));
    border-radius: 3px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    &:hover {
      background: linear-gradient(180deg, rgba(93, 173, 226, 0.5), rgba(255, 107, 157, 0.3));
      box-shadow: 0 0 10px rgba(93, 173, 226, 0.3);
    }
  }
}

// Responsive
@media (min-width: 1024px) {
  .admin-sidebar {
    left: 0;
    transform: translateX(-100%);

    &.open {
      transform: translateX(0);
    }
  }
}

// Transitions
.nav-item-move-move {
  transition: transform 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
}

// Animations
@keyframes reset-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
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
