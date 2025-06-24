<!-- src/components/layout/AdminSidebar.vue -->
<template>
  <aside class="admin-sidebar" :class="{ open: isOpen }">
    <!-- Logo -->
    <div class="logo-container">
      <a href="/" class="logo-link">
        <img src="../../assets/images/Logo.webp" alt="Logo" class="logo-sidebar" />
      </a>
    </div>

    <!-- Sidebar-Header mit Benutzerinfo -->
    <div class="sidebar-header">
      <div class="profile-image-container">
        <img :src="userPicture" alt="Account Logo" class="account-logo" />
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
          
          <!-- Active Indicator -->
          <span v-if="isActiveItem(item.id)" class="active-indicator"></span>
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

    // Drag & Drop State
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
        id: "tickets",
        text: "Tickets",
        icon: TicketIcon,
      },
      {
        id: "active-posts",
        text: "Aktive Artikel",
        icon: DocumentTextIcon,
      },
      {
        id: "all-users",
        text: "Alle Benutzer",
        icon: UsersIcon,
      },
      {
        id: "applications",
        text: "Bewerbungen",
        icon: DocumentIcon,
      },
      {
        id: "deleted-users",
        text: "Gelöschte Benutzer",
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

// Hauptcontainer mit optimiertem Glass Effect
.admin-sidebar {
  position: fixed;
  top: 0;
  left: -300px;
  width: 300px;
  height: 100vh;
  z-index: 1400;
  transition: left 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  display: flex;
  flex-direction: column;
  user-select: none;
  padding-top: 8rem;
  
  // Mobile Anpassungen
  @media (max-width: 1023px) {
    top: 0;
    width: 280px;
    left: -280px;
  }
  
  @media (max-width: 767px) {
    width: 100vw;
    left: -100vw;
  }
  
  // Optimierter Glass-Effekt
  background: rgba(30, 30, 40, 0.92);
  box-shadow: 
    4px 0 20px rgba(0, 0, 0, 0.3),
    0 0 40px rgba(93, 173, 226, 0.1);
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
  border-right: 1px solid rgba(93, 173, 226, 0.2);
  
  @media (max-width: 767px) {
    border-right: none;
    background: rgba(30, 30, 40, 0.98);
  }
  
  // Glass Refraction Layer
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(circle at 30% 70%, rgba(93, 173, 226, 0.08) 0%, transparent 60%),
      radial-gradient(circle at 70% 30%, rgba(255, 107, 157, 0.05) 0%, transparent 60%);
    pointer-events: none;
  }

  &.open {
    left: 0;
    box-shadow: 
      4px 0 30px rgba(0, 0, 0, 0.4),
      0 0 60px rgba(93, 173, 226, 0.15);
  }

  // Logo Container
  .logo-container {
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 70px;
    border-bottom: 1px solid rgba(93, 173, 226, 0.15);
    
    @media (max-width: 767px) {
      height: 60px;
      padding: 10px;
    }

    .logo-link {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-sidebar {
      height: 80px;
      width: 80px;
      margin-bottom: 4rem;
      border-radius: 12px;
      transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
      
      &:hover {
        transform: scale(1.1);
        box-shadow: 0 0 20px rgba(93, 173, 226, 0.3);
      }
    }
  }

  // Sidebar-Header mit Glass-Effekt
  .sidebar-header {
    display: flex;
    align-items: center;
    padding: 20px;
    position: relative;
    z-index: 1;
    gap: 12px;
    border-bottom: 1px solid rgba(93, 173, 226, 0.15);
    
    @media (max-width: 767px) {
      padding: 16px 20px;
    }

    .profile-image-container {
      position: relative;
      flex-shrink: 0;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);

      &:hover {
        transform: scale(1.05);

        .account-logo {
          box-shadow: 
            0 0 20px rgba(93, 173, 226, 0.4),
            0 0 0 2px rgba(93, 173, 226, 0.3);
        }

        .profile-edit-overlay {
          opacity: 1;
        }
      }

      .account-logo {
        width: 48px;
        height: 48px;
        border-radius: 14px;
        object-fit: cover;
        transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
        border: 1px solid rgba(93, 173, 226, 0.2);
      }
    }

    .header-content {
      flex: 1;
      min-width: 0;

      h3 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #ffffff;
      }

      .user-role {
        margin: 2px 0 0 0;
        font-size: 0.85rem;
        opacity: 0.8;
        font-weight: 500;
        color: #5dade2;
      }

      .profile-status {
        display: block;
        font-size: 0.75rem;
        margin-top: 2px;
        opacity: 0.7;
        color: #ff6b9d;
      }
    }

    .close-sidebar {
      width: 36px;
      height: 36px;
      display: none;
      align-items: center;
      justify-content: center;
      background: rgba(93, 173, 226, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(93, 173, 226, 0.2);
      border-radius: 10px;
      font-size: 1.5rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
      color: #5dade2;
      
      @media (max-width: 1023px) {
        display: flex;
      }

      &:hover {
        background: rgba(93, 173, 226, 0.2);
        transform: scale(1.1) rotate(90deg);
        box-shadow: 0 0 20px rgba(93, 173, 226, 0.4);
      }
    }
  }

  // Navigation mit optimierten Glass-Cards
  .sidebar-nav {
    flex: 1;
    padding: 20px 12px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
    
    @media (max-width: 767px) {
      padding: 16px;
      padding-bottom: 100px;
    }

    .nav-items-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
      position: relative;
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: 14px 16px;
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
      position: relative;
      overflow: hidden;
      min-height: 52px;
      
      @media (max-width: 767px) {
        padding: 16px 20px;
        min-height: 56px;
        border-radius: 16px;
      }
      
      // Optimierte Glass Card
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      color: #a8d5e8;
      
      &:hover:not(.dragging) {
        background: rgba(93, 173, 226, 0.12);
        border-color: rgba(93, 173, 226, 0.25);
        transform: translateX(4px);
        
        .nav-icon {
          color: #5dade2;
          transform: scale(1.1);
        }
      }

      &.active:not(.dragging) {
        background: linear-gradient(
          135deg,
          rgba(93, 173, 226, 0.2) 0%,
          rgba(255, 107, 157, 0.1) 100%
        );
        color: #ffffff;
        border-color: rgba(93, 173, 226, 0.4);
        font-weight: 600;

        .nav-icon {
          color: #5dade2;
        }
        
        .active-indicator {
          opacity: 1;
          width: 3px;
        }
      }

      // Active Indicator
      .active-indicator {
        position: absolute;
        left: 0;
        top: 20%;
        bottom: 20%;
        width: 0;
        background: linear-gradient(180deg, #5dade2, #ff6b9d);
        border-radius: 0 3px 3px 0;
        transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
        opacity: 0;
      }

      // Drag & Drop Styles
      &.dragging {
        opacity: 0.3;
        cursor: grabbing !important;
        transform: scale(0.95);
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
        
        @media (max-width: 767px) {
          display: none;
        }
      }

      &:hover .drag-handle {
        opacity: 0.5;
        
        @media (max-width: 767px) {
          opacity: 0;
        }
      }

      .nav-icon {
        margin-right: 12px;
        margin-left: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
        opacity: 0.9;
        
        @media (max-width: 767px) {
          width: 26px;
          height: 26px;
          margin-right: 14px;
        }
      }

      .nav-text {
        font-weight: 500;
        font-size: 0.95rem;
        letter-spacing: -0.01em;
        transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
        flex: 1;
        
        @media (max-width: 767px) {
          font-size: 1rem;
        }
      }
    }

    // Drop Indikator
    .drop-indicator {
      position: absolute;
      left: 12px;
      right: 12px;
      height: 2px;
      background: linear-gradient(90deg, transparent, #5dade2, transparent);
      border-radius: 1px;
      opacity: 0;
      transition: opacity 0.2s cubic-bezier(0.4, 0.2, 0.2, 1);
      pointer-events: none;
      z-index: 10;
    }
  }

  // Footer mit optimierten Buttons
  .sidebar-footer {
    margin-top: auto;
    padding: 20px;
    border-top: 1px solid rgba(93, 173, 226, 0.15);
    background: rgba(30, 30, 40, 0.5);
    
    @media (max-width: 767px) {
      padding: 16px;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(30, 30, 40, 0.98);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }

    .footer-divider {
      display: none;
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
      justify-content: center;
      padding: 12px 20px;
      background: rgba(255, 107, 157, 0.1);
      border: 1px solid rgba(255, 107, 157, 0.2);
      border-radius: 12px;
      color: #ff6b9d;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
      gap: 8px;
      position: relative;
      overflow: hidden;

      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        transition: left 0.5s ease;
      }

      &:hover {
        background: rgba(255, 107, 157, 0.2);
        border-color: rgba(255, 107, 157, 0.3);
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(255, 107, 157, 0.2);

        &::before {
          left: 100%;
        }

        .back-arrow {
          transform: translateX(3px) rotate(180deg);
        }
      }

      &:active {
        transform: translateY(0);
      }

      .back-text {
        flex: 1;
        text-align: center;
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

    // Reset Button
    .reset-button {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: rgba(93, 173, 226, 0.1);
      backdrop-filter: blur(10px);
      cursor: pointer;
      border-radius: 10px;
      transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
      flex-shrink: 0;
      border: 1px solid rgba(93, 173, 226, 0.15);
      color: #8fd3b5;

      &:hover {
        color: #5dade2;
        background: rgba(93, 173, 226, 0.15);
        transform: rotate(-45deg) scale(1.05);
        box-shadow: 0 0 20px rgba(93, 173, 226, 0.3);
      }

      &.reset-active {
        animation: reset-spin 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }

      .Icons {
        width: 20px;
        height: 20px;
        transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
      }
    }
  }
}

// Scrollbar
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
    
    &:hover {
      background: linear-gradient(180deg, rgba(93, 173, 226, 0.5), rgba(255, 107, 157, 0.3));
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

// Safe Area Support für iOS
@supports (padding: env(safe-area-inset-top)) {
  .admin-sidebar {
    @media (max-width: 767px) {
      padding-top: env(safe-area-inset-top);
      padding-bottom: env(safe-area-inset-bottom);
    }
  }
  
  .logo-container {
    @media (max-width: 767px) {
      height: calc(60px + env(safe-area-inset-top));
      padding-top: calc(10px + env(safe-area-inset-top));
    }
  }
  
  .sidebar-footer {
    @media (max-width: 767px) {
      padding-bottom: calc(16px + env(safe-area-inset-bottom));
    }
  }
}

// Reduced Motion Support
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>