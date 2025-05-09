<!-- src/components/layout/MemberLayout.vue mit spezifischeren Klassen -->
<template>
  <div class="member-layout" :class="{ 'theme-light': isLightTheme, 'theme-dark': !isLightTheme }">
    <!-- Header mit Toggle und Benutzerinfo - verbesserte mobile Ansicht -->
    <header class="member-header custom-header">
      <div class="header-left custom-header-left">
        <button class="sidebar-toggle custom-toggle" @click="toggleSidebar" aria-label="Seitenleiste umschalten">
          <span class="toggle-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </span>
        </button>
        <h1 class="page-title custom-title">{{ pageTitle }}</h1>
      </div>
      <div class="header-right custom-header-right">
        <ThemeToggle :is-light-theme="isLightTheme" @toggle="toggleTheme" />
        <div class="user-info custom-user-info">
          <button class="logout-button custom-logout-btn" @click="handleLogout">
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

    <div class="member-container custom-container" :class="{ 'sidebar-open': isSidebarOpen }">
      <!-- Sidebar Komponente einbinden -->
      <MemberSidebar :is-open="isSidebarOpen" :active-menu="activeMenu" @select-menu="onMenuSelect"
        @close="closeSidebar" @logout="handleLogout" />

      <!-- Hauptinhalt -->
      <main class="member-content custom-content" :class="{ 'sidebar-active': isSidebarOpen }">
        <div class="content-wrapper">
          <slot></slot>
        </div>
      </main>
    </div>

    <!-- Overlay für mobile Ansicht mit besserer Performance -->
    <transition name="fade">
      <div class="sidebar-overlay" v-if="isSidebarOpen && isSmallScreen" @click="closeSidebar" aria-hidden="true"></div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import ThemeToggle from '@/components/ui/ThemeToggle.vue';
import MemberSidebar from '@/components/member/MemberSidebar.vue';
import { authService } from '@/services/auth.service';

export default defineComponent({
  name: 'MemberLayout',
  components: {
    ThemeToggle,
    MemberSidebar
  },
  props: {
    pageTitle: {
      type: String,
      default: 'Dashboard'
    },
    activeMenu: {
      type: String,
      default: 'overview'
    }
  },
  emits: ['menu-change'],
  setup(props, { emit }) {
    const router = useRouter();
    const isSmallScreen = ref(window.innerWidth < 1024);
    const isSidebarOpen = ref(window.innerWidth >= 1024); // Default offen auf Desktop
    const isLightTheme = ref(localStorage.getItem('theme') !== 'dark');
    const userName = ref('Mitglied');

    // Benutzerdaten abrufen
    onMounted(() => {
      const userData = authService.getUserData();
      if (userData && userData.name) {
        userName.value = userData.name.split(' ')[0]; // Nur Vorname verwenden
      }
    });

    // Sidebar umschalten - verbessert für mobile Geräte
    const toggleSidebar = () => {
      isSidebarOpen.value = !isSidebarOpen.value;
      
      // Body-Scroll verhindern bei offener Sidebar auf mobilen Geräten
      if (isSmallScreen.value) {
        document.body.style.overflow = isSidebarOpen.value ? 'hidden' : '';
      }
    };

    // Sidebar schließen - verbessert für mobile Geräte
    const closeSidebar = () => {
      if (isSidebarOpen.value) {
        isSidebarOpen.value = false;
        
        // Body-Scroll wiederherstellen
        if (isSmallScreen.value) {
          document.body.style.overflow = '';
        }
      }
    };

    // Menüpunkt auswählen
    const onMenuSelect = (menuItem: string) => {
      emit('menu-change', menuItem);

      // Auf mobilen Geräten Sidebar nach Auswahl schließen
      if (isSmallScreen.value) {
        closeSidebar();
      }
    };

    // Theme umschalten
    const toggleTheme = () => {
      isLightTheme.value = !isLightTheme.value;
      localStorage.setItem('theme', isLightTheme.value ? 'light' : 'dark');
    };

    // Abmelden
    const handleLogout = () => {
      authService.logout();
      router.push('/login-register');
    };

    // Verbesserte Responsive Handler für die Bildschirmgröße
    const handleResize = () => {
      isSmallScreen.value = window.innerWidth < 1024;
      
      // Sidebar automatisch schließen bei kleinen Bildschirmen
      if (isSmallScreen.value && isSidebarOpen.value) {
        closeSidebar();
      } else if (!isSmallScreen.value && !isSidebarOpen.value && window.innerWidth >= 1200) {
        // Optional: Sidebar automatisch öffnen auf großen Bildschirmen
        isSidebarOpen.value = true;
      }
    };

    // Debounce-Funktion für bessere Performance
    const debounce = (fn: Function, ms = 300) => {
      let timeoutId: ReturnType<typeof setTimeout>;
      return function(...args: any[]) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), ms);
      };
    };

    // Optimierte Event-Listener für Bildschirmgröße
    onMounted(() => {
      handleResize(); // Initial aufrufen
      window.addEventListener('resize', debounce(handleResize, 250));
      
      // Seitenorientierung berücksichtigen
      window.addEventListener('orientationchange', handleResize);
    });

    // Event-Listener sauber entfernen
    onUnmounted(() => {
      window.removeEventListener('resize', debounce(handleResize, 250));
      window.removeEventListener('orientationchange', handleResize);
      document.body.style.overflow = ''; // Scroll-Status zurücksetzen
    });

    return {
      isSidebarOpen,
      isLightTheme,
      userName,
      isSmallScreen,
      toggleSidebar,
      closeSidebar,
      onMenuSelect,
      toggleTheme,
      handleLogout
    };
  }
});
</script>

<style lang="scss">
/* Nicht-gescoped Style für spezifischere Klassen */
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

/* Grundlegendes Layout */
.member-layout {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  font-family: var(--font-family, 'Inter', system-ui, sans-serif);
  display: flex;
  flex-direction: column;
}

/* Theme-spezifische Hintergründe */
.theme-light.member-layout {
  background: linear-gradient(135deg, #e9f7ec, #f8fff9, #ffffff);
  color: #005f40;
}

.theme-dark.member-layout {
  background: linear-gradient(135deg, #081812, #0f2419, #173828);
  color: #ffffff;
}

/* Header mit zusätzlicher Klasse für Spezifität */
.member-header.custom-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 70px;
  z-index: 900;
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  border-radius: 0px 0px 25px 25px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  padding: 0 1rem;
}

/* Theme-spezifische Header-Stile */
.theme-light .member-header.custom-header {
  background-color: rgba(245, 255, 241, 0.95);
  border-bottom: 1px solid rgba(38, 187, 119, 0.2);
}

.theme-dark .member-header.custom-header {
  background-color: rgba(29, 74, 50, 0.95);
  border-bottom: 1px solid rgba(199, 233, 214, 0.2);
}

/* Anpassungen für Header-Bereich links */
.header-left.custom-header-left {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

/* Seitentitel mit spezifischerer Klasse */
.page-title.custom-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

/* Theme-spezifische Titelfarben */
.theme-light .page-title.custom-title {
  color: #005f40 !important;
}

.theme-dark .page-title.custom-title {
  color: #ffffff !important;
}

/* Sidebar-Toggle mit spezifischerer Klasse */
.sidebar-toggle.custom-toggle {
  min-width: 36px;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

/* Theme-spezifische Toggle-Farben */
.theme-light .sidebar-toggle.custom-toggle {
  color: #005f40;
}

.theme-light .sidebar-toggle.custom-toggle:hover {
  background-color: #d9f1e3;
}

.theme-dark .sidebar-toggle.custom-toggle {
  color: #ffffff;
}

.theme-dark .sidebar-toggle.custom-toggle:hover {
  background-color: #285f42;
}

/* Header rechter Bereich */
.header-right.custom-header-right {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

/* Benutzerinfo-Bereich */
.user-info.custom-user-info {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

/* Abmelde-Button mit spezifischer Klasse */
.logout-button.custom-logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0.3rem 0.8rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 36px;
  min-height: 36px;
  border: none;
}

/* Theme-spezifische Button-Stile */
.theme-light .logout-button.custom-logout-btn {
  background: linear-gradient(to right, #26bb77, #17a2b8) !important;
  color: white !important;
}

.theme-light .logout-button.custom-logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 95, 64, 0.1);
}

.theme-dark .logout-button.custom-logout-btn {
  background: linear-gradient(to right, #4ad295, #35ccd0) !important;
  color: white !important;
}

.theme-dark .logout-button.custom-logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
}

/* Hauptcontainer mit Spezifizität */
.member-container.custom-container {
  display: flex;
  flex: 1;
  min-height: calc(100vh - 70px);
  padding-top: 70px;
  transition: all 0.3s ease;
  position: relative;
}

/* Hauptinhaltsbereich */
.member-content.custom-content {
  flex: 1;
  width: 100%;
  padding: 1rem;
  animation: fadeIn 0.4s ease-out;
  transition: all 0.3s ease;
}

/* Overlay für mobile Ansicht */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 850;
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
  
  .member-header.custom-header {
    padding: 0 1.5rem;
  }
  
  .page-title.custom-title {
    font-size: 1.4rem;
    max-width: 250px;
  }
  
  .sidebar-toggle.custom-toggle {
    min-width: 40px;
    min-height: 40px;
  }
  
  .logout-button.custom-logout-btn {
    gap: 8px;
    padding: 0.3rem 1rem;
  }
  
  .header-left.custom-header-left {
    gap: 1.5rem;
  }
  
  .header-right.custom-header-right {
    gap: 1.5rem;
  }
  
  .member-content.custom-content {
    padding: 1.5rem;
  }
}

@media (min-width: 768px) {
  .page-title.custom-title {
    font-size: 1.8rem;
    max-width: none;
  }
  
  .header-right.custom-header-right {
    gap: 2rem;
  }
}

@media (min-width: 992px) {
  .member-header.custom-header {
    padding: 0 2rem;
  }
  
  .member-content.custom-content {
    padding: 2rem;
  }
}

@media (min-width: 1024px) {
  .member-container.custom-container.sidebar-open {
    margin-left: 280px;
  }
}

@media (max-width: 1023px) {
  .member-content.custom-content.sidebar-active {
    filter: blur(2px);
    pointer-events: none;
  }
}

/* Animationen */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Transition für Overlay */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>