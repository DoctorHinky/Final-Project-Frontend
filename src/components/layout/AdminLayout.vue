<!-- src/components/layout/AdminLayout.vue -->
<template>
  <div class="admin-layout">
    <!-- Header mit Toggle und Admin-Infos -->
    <header class="admin-header">
      <div class="header-left">
        <button class="sidebar-toggle" @click="toggleSidebar" aria-label="Seitenleiste umschalten">
          <span class="toggle-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
          <span class="admin-badge">Admin</span>
          <button class="logout-button" @click="handleLogout">
            <span class="logout-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
        <div class="content-wrapper">
          <router-view />
        </div>
      </main>
    </div>

    <!-- Overlay für mobile Ansicht -->
    <transition name="fade">
      <div class="sidebar-overlay" v-if="isSidebarOpen && isSmallScreen" @click="closeSidebar" aria-hidden="true"></div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { authService } from '@/services/auth.service';
import AdminSidebar from '@/components/admin/AdminSidebar.vue';

export default defineComponent({
  name: 'AdminLayout',
  components: {
    AdminSidebar
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const isSmallScreen = ref(window.innerWidth < 1024);
    const isSidebarOpen = ref(window.innerWidth >= 1024);

    // Aktives Menü basierend auf Route
    const activeMenu = computed(() => {
      if (route.path.includes('/admin/tickets')) {
        return 'tickets';
      }
      return (route.query.tab as string) || 'user-search';
    });

    // Seitentitel basierend auf aktivem Menü
    const pageTitle = computed(() => {
      switch (activeMenu.value) {
        case 'user-search': return 'User Suche';
        case 'all-users': return 'Alle User';
        case 'all-authors': return 'Alle Autoren';
        case 'active-posts': return 'Active Posts';
        case 'tickets': return 'Ticket Management';
        case 'staff-team': return 'Staff Team';
        default: return 'Admin Dashboard';
      }
    });

    // Sidebar umschalten
    const toggleSidebar = () => {
      isSidebarOpen.value = !isSidebarOpen.value;

      if (isSmallScreen.value) {
        document.body.style.overflow = isSidebarOpen.value ? 'hidden' : '';
      }
    };

    // Sidebar schließen
    const closeSidebar = () => {
      if (isSidebarOpen.value) {
        isSidebarOpen.value = false;

        if (isSmallScreen.value) {
          document.body.style.overflow = '';
        }
      }
    };

    // Menüpunkt auswählen
    const onMenuSelect = (menuItem: string) => {
      console.log('AdminLayout: Menu selected:', menuItem);
      
      // Navigation basierend auf dem ausgewählten Menüpunkt
      if (menuItem === 'tickets') {
        router.push('/admin/tickets');
      } else {
        router.push({
          path: '/admin/dashboard',
          query: { tab: menuItem }
        });
      }

      // Auf mobilen Geräten Sidebar nach Auswahl schließen
      if (isSmallScreen.value) {
        closeSidebar();
      }
    };

    // Abmelden
    const handleLogout = () => {
      authService.adminLogout();
      router.push('/admin/login');
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

    // Event-Listener
    onMounted(() => {
      handleResize();
      window.addEventListener('resize', debounce(handleResize, 250));
      window.addEventListener('orientationchange', handleResize);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', debounce(handleResize, 250));
      window.removeEventListener('orientationchange', handleResize);
      document.body.style.overflow = '';
    });

    return {
      isSidebarOpen,
      isSmallScreen,
      toggleSidebar,
      closeSidebar,
      onMenuSelect,
      handleLogout,
      pageTitle,
      activeMenu
    };
  }
});
</script>

<style lang="scss" scoped>
/* Grundlegendes Layout */
.admin-layout {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  background: #161616;
  color: #f0f0f0;
}

/* Header Stil */
.admin-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 70px;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(10px);
  background-color: rgba(26, 26, 26, 0.95);
  border-bottom: 1px solid #333;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  padding: 0 16px;
}

/* Header-Bereich links */
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Seitentitel */
.page-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
  color: #f0f0f0;
}

/* Sidebar-Toggle */
.sidebar-toggle {
  min-width: 36px;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.4s ease-out;
  color: #f0f0f0;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
}

/* Header rechter Bereich */
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Admin-Info-Bereich */
.admin-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Admin-Abzeichen */
.admin-badge {
  display: inline-block;
  padding: 4px 8px;
  background-color: #333;
  color: #ff9800;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
  border: 1px solid #ff9800;
}

/* Abmelde-Button */
.logout-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.4s ease-out;
  min-width: 36px;
  min-height: 36px;
  border: none;
  background: linear-gradient(135deg, #600, #800);
  color: white;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
}

/* Hauptcontainer */
.admin-container {
  display: flex;
  flex: 1;
  min-height: calc(100vh - 70px);
  padding-top: 70px;
  transition: all 0.4s ease-out;
  position: relative;
}

/* Hauptinhaltsbereich */
.admin-content {
  flex: 1;
  width: 100%;
  padding: 16px;
  transition: all 0.4s ease-out;
  
  .content-wrapper {
    max-width: 1400px;
    margin: 0 auto;
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
  z-index: 950;
  backdrop-filter: blur(2px);
}

/* Utility-Klassen */
.d-none {
  display: none !important;
}

/* Responsive Anpassungen */
@media (min-width: 576px) {
  .d-sm-inline {
    display: inline !important;
  }

  .admin-header {
    padding: 0 24px;
  }

  .page-title {
    font-size: 1.5rem;
    max-width: 250px;
  }

  .sidebar-toggle {
    min-width: 40px;
    min-height: 40px;
  }

  .logout-button {
    gap: 8px;
    padding: 6px 16px;
  }

  .header-left {
    gap: 24px;
  }

  .header-right {
    gap: 24px;
  }

  .admin-content {
    padding: 24px;
  }
}

@media (min-width: 768px) {
  .page-title {
    font-size: 1.75rem;
    max-width: none;
  }

  .header-right {
    gap: 32px;
  }
}

@media (min-width: 992px) {
  .admin-header {
    padding: 0 32px;
  }

  .admin-content {
    padding: 32px;
  }
}

@media (min-width: 1024px) {
  .admin-container.sidebar-open {
    margin-left: 280px;
  }
}

@media (max-width: 1023px) {
  .admin-content.sidebar-active {
    filter: blur(2px);
    pointer-events: none;
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
</style>