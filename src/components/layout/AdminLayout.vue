<!-- src/components/layout/AdminLayout.vue -->
<template>
  <div class="admin-layout">
    <!-- Header mit Toggle und Admin-Infos -->
    <header class="admin-header">
      <div class="header-left">
        <button class="sidebar-toggle" @click="toggleSidebar" aria-label="Seitenleiste umschalten">
          <span class="toggle-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </span>
        </button>
        <h1 class="page-title">{{ pageTitle }}</h1>
      </div>
      <div class="header-right">
        <div class="admin-info">
          <button class="logout-button" @click="handleLogout">
            <span class="logout-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </span>
            <span class="logout-text d-none d-sm-inline">Abmelden</span>
          </button>
        </div>
      </div>
    </header>

    <div class="admin-container" :class="{ 'sidebar-open': isSidebarOpen }">
      <!-- Sidebar Komponente einbinden -->
      <AdminSidebar
        :is-open="isSidebarOpen"
        :active-menu="activeMenu"
        @select-menu="onMenuSelect"
        @close="closeSidebar"
        @logout="handleLogout"
      />

      <!-- Hauptinhalt -->
      <main class="admin-content" :class="{ 'sidebar-active': isSidebarOpen }">
        <router-view />
      </main>
    </div>

    <!-- Overlay für mobile Ansicht -->
    <transition name="fade">
      <div class="sidebar-overlay" v-if="isSidebarOpen && isSmallScreen" @click="closeSidebar" aria-hidden="true"></div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { authService } from "@/services/auth.service";
import AdminSidebar from "@/components/layout/AdminSidebar.vue";

export default defineComponent({
  name: "AdminLayout",
  components: {
    AdminSidebar,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const isSmallScreen = ref(window.innerWidth < 1024);
    const isSidebarOpen = ref(window.innerWidth >= 1024);

    // Aktives Menü basierend auf Route
    const activeMenu = computed(() => {
      if (route.path.includes("/admin/tickets")) {
        return "tickets";
      }
      // WICHTIG: Wenn kein Tab-Query vorhanden ist, ist 'overview' aktiv
      return (route.query.tab as string) || "overview";
    });

    // Seitentitel basierend auf aktivem Menü
    const pageTitle = computed(() => {
      switch (activeMenu.value) {
        case "overview":
          return "Dashboard Übersicht";
        case "user-search":
          return "User Suche";
        case "all-users":
          return "Alle User";
        case "deleted-users":
          return "Gelöschte Benutzer";
        case "applications":
          return "Bewerbungen";
        case "active-posts":
          return "Active Posts";
        case "tickets":
          return "Ticket Management";
        case "staff-team":
          return "Staff Team";
        default:
          return "Admin Dashboard";
      }
    });

    // Sidebar umschalten
    const toggleSidebar = () => {
      isSidebarOpen.value = !isSidebarOpen.value;

      if (isSmallScreen.value) {
        document.body.style.overflow = isSidebarOpen.value ? "hidden" : "";
      }
    };

    // Sidebar schließen
    const closeSidebar = () => {
      if (isSidebarOpen.value) {
        isSidebarOpen.value = false;

        if (isSmallScreen.value) {
          document.body.style.overflow = "";
        }
      }
    };

    // Menüpunkt auswählen
    const onMenuSelect = (menuItem: string) => {
      // Navigation basierend auf dem ausgewählten Menüpunkt
      if (menuItem === "tickets") {
        router.push("/admin/tickets");
      } else if (menuItem === "overview") {
        // Für Dashboard/Overview ohne Query-Parameter navigieren
        router.push("/admin/dashboard");
      } else {
        // Für alle anderen Items mit Tab-Query navigieren
        router.push({
          path: "/admin/dashboard",
          query: { tab: menuItem },
        });
      }

      // Auf mobilen Geräten Sidebar nach Auswahl schließen
      if (isSmallScreen.value) {
        closeSidebar();
      }
    };

    // Abmelden
    const handleLogout = () => {
      // Beide Sessions beenden für vollständiges Logout
      authService.adminLogout();
      authService.logout();

      // Zur allgemeinen Login-Seite navigieren
      router.push("/login-register");
    };

    // Handler für die Bildschirmgröße
    const handleResize = () => {
      isSmallScreen.value = window.innerWidth < 1024;

      if (isSmallScreen.value && isSidebarOpen.value) {
        closeSidebar();
      } else if (!isSmallScreen.value && !isSidebarOpen.value && window.innerWidth >= 1200) {
        isSidebarOpen.value = true;
      }
    };

    // Debounce-Funktion
    const debounce = (fn: Function, ms = 300) => {
      let timeoutId: ReturnType<typeof setTimeout>;
      return (...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), ms);
      };
    };

    const debouncedHandleResize = debounce(handleResize, 250);

    // Event-Listener
    onMounted(() => {
      handleResize();
      window.addEventListener("resize", debouncedHandleResize);
      window.addEventListener("orientationchange", handleResize);
    });

    onUnmounted(() => {
      window.removeEventListener("resize", debouncedHandleResize);
      window.removeEventListener("orientationchange", handleResize);
      document.body.style.overflow = "";
    });

    return {
      isSidebarOpen,
      isSmallScreen,
      toggleSidebar,
      closeSidebar,
      onMenuSelect,
      handleLogout,
      pageTitle,
      activeMenu,
    };
  },
});
</script>

<style lang="scss" scoped>
/* Grundlegendes Layout */
.admin-layout {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: transparent;
  z-index: 999;
}

/* Header Stil */
.admin-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 70px;
  z-index: 1500;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  background: rgba(30, 30, 40, 0.95);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(16px) saturate(150%);
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  border-bottom: 1px solid rgba(93, 173, 226, 0.2);
}

/* Header-Bereich links */
.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Seitentitel */
.page-title {
  font-size: 1.35rem;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: linear-gradient(135deg, #ffffff 0%, #a8d5e8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Sidebar-Toggle */
.sidebar-toggle {
  min-width: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: rgba(93, 173, 226, 0.1);
  backdrop-filter: blur(10px);
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
  color: #5dade2;

  &:hover {
    background: rgba(93, 173, 226, 0.2);
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(93, 173, 226, 0.3);
  }

  &:active {
    transform: scale(0.95);
  }
}

/* Header rechter Bereich */
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Abmelde-Button */
.logout-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
  min-height: 40px;
  border: 1px solid rgba(255, 107, 157, 0.2);
  background: rgba(255, 107, 157, 0.1);
  color: #ff6b9d;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 107, 157, 0.2);
    border-color: rgba(255, 107, 157, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(255, 107, 157, 0.25);
  }

  &:active {
    transform: translateY(0);
  }
}

/* Hauptcontainer */
.admin-container {
  display: flex;
  flex: 1;
  position: relative;
  width: 100%;
  height: 100%;
}

/* Hauptinhaltsbereich */
.admin-content {
  flex: 1;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0.2, 0.2, 1);
  
  // Scrollbar Styling
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(93, 173, 226, 0.3), rgba(255, 107, 157, 0.2));
    border-radius: 4px;
    
    &:hover {
      background: linear-gradient(180deg, rgba(93, 173, 226, 0.5), rgba(255, 107, 157, 0.3));
    }
  }
}

/* Overlay für mobile Ansicht */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1300;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* Utility-Klassen */
.d-none {
  display: none !important;
}

/* Mobile Responsive Anpassungen */
@media (max-width: 768px) {
  .admin-header {
    height: 60px;
    padding: 0 16px;
    z-index: 1600; // Höher als Sidebar auf Mobile
  }

  .header-left {
    gap: 12px;
  }

  .page-title {
    font-size: 1.1rem;
    max-width: 150px;
  }

  .sidebar-toggle {
    min-width: 36px;
    min-height: 36px;
  }

  .logout-button {
    min-height: 36px;
    padding: 6px 12px;
    font-size: 0.875rem;
    
    .logout-text {
      display: none !important;
    }
  }
  
  // Content nicht verschieben auf Mobile
  .admin-container.sidebar-open {
    margin-left: 0;
  }
  
  // Content Blur entfernen für bessere Performance
  .admin-content.sidebar-active {
    filter: none;
    pointer-events: auto;
  }
}

@media (max-width: 360px) {
  .page-title {
    font-size: 1rem;
    max-width: 120px;
  }
  
  .sidebar-toggle {
    min-width: 32px;
    min-height: 32px;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
  
  .logout-button {
    min-width: 32px;
    min-height: 32px;
    padding: 0;
    
    svg {
      width: 14px;
      height: 14px;
    }
  }
}

/* Responsive Anpassungen für größere Bildschirme */
@media (min-width: 576px) {
  .d-sm-inline {
    display: inline !important;
  }
}

@media (min-width: 768px) {
  .admin-header {
    padding: 0 32px;
  }

  .page-title {
    font-size: 1.5rem;
    max-width: none;
  }

  .header-left {
    gap: 24px;
  }

  .header-right {
    gap: 24px;
  }
}

@media (min-width: 1024px) {
  .admin-header {
    padding: 0 40px;
  }
  
  // Desktop: Margin basierend auf Sidebar-Status
  .admin-content {
    margin-left: 0;
    
    .admin-container.sidebar-open & {
      margin-left: 300px; // Sidebar-Breite
    }
  }
}

@media (max-width: 1023px) {
  // Nur auf größeren Tablets den Blur-Effekt
  @media (min-width: 769px) {
    .admin-content.sidebar-active {
      filter: blur(2px);
      pointer-events: none;
      user-select: none;
    }
  }
}

/* Transition für Overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Touch-optimierte Scrollbars für Mobile */
@media (hover: none) and (pointer: coarse) {
  .admin-content {
    &::-webkit-scrollbar {
      width: 0;
    }
    
    // Momentum Scrolling für iOS
    -webkit-overflow-scrolling: touch;
  }
}

/* Landscape Modus für Mobile */
@media (max-width: 768px) and (orientation: landscape) {
  .admin-header {
    height: 50px;
    
    .page-title {
      font-size: 1rem;
    }
    
    .sidebar-toggle,
    .logout-button {
      min-height: 32px;
    }
  }
}

/* Safe Area Support für iOS */
@supports (padding: env(safe-area-inset-top)) {
  .admin-header {
    @media (max-width: 768px) {
      padding-top: env(safe-area-inset-top);
      height: calc(60px + env(safe-area-inset-top));
    }
    
    @media (max-width: 768px) and (orientation: landscape) {
      height: calc(50px + env(safe-area-inset-top));
    }
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>