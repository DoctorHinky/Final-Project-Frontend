<!-- src/components/layout/MemberLayout.vue -->
<template>
  <div class="member-layout" :class="{ 'theme-light': isLightTheme, 'theme-dark': !isLightTheme }">
    <!-- Header mit Toggle und Benutzerinfo - verbesserte mobile Ansicht -->
    <header class="member-header">
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
        <ThemeToggle :is-light-theme="isLightTheme" @toggle="toggleTheme" />
        <div class="user-info">
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

    <div class="member-container" :class="{ 'sidebar-open': isSidebarOpen }">
      <!-- Sidebar Komponente einbinden -->
      <MemberSidebar :is-open="isSidebarOpen" :active-menu="activeMenu" @select-menu="onMenuSelect"
        @close="closeSidebar" @logout="handleLogout" />

      <!-- Hauptinhalt -->
      <main class="member-content" :class="{ 'sidebar-active': isSidebarOpen }">
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

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

.member-layout {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  font-family: var(--font-family, 'Inter', system-ui, sans-serif);
  display: flex;
  flex-direction: column;

  @each $theme in ('light', 'dark') {
    &.theme-#{$theme} {
      background-color: mixins.theme-color($theme, primary-bg);
      color: mixins.theme-color($theme, text-primary);
    }
  }

  // Header-Bereich - responsiv verbessert
  .member-header {
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
    background-color: #0f241982;
    border-radius: 0px 0px 25px 25px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    padding: 0 map.get(vars.$spacing, m);
    
    @media (min-width: 576px) {
      padding: 0 map.get(vars.$spacing, l);
    }
    
    @media (min-width: 992px) {
      padding: 0 map.get(vars.$spacing, xl);
    }

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: rgba(mixins.theme-color($theme, card-bg), 0.95);
        border-bottom: 1px solid mixins.theme-color($theme, border-light);
        @include mixins.shadow('small', $theme);
      }
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, s);
      
      @media (min-width: 576px) {
        gap: map.get(vars.$spacing, m);
      }

      .page-title {
        font-size: map.get(map.get(vars.$fonts, sizes), l);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        margin: 0;
        letter-spacing: -0.02em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 150px;
        
        @media (min-width: 576px) {
          font-size: map.get(map.get(vars.$fonts, sizes), xl);
          max-width: 250px;
        }
        
        @media (min-width: 768px) {
          font-size: map.get(map.get(vars.$fonts, sizes), xxl);
          max-width: none;
        }

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }

      .sidebar-toggle {
        min-width: 36px;
        min-height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: none;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.2s;
        
        @media (min-width: 576px) {
          min-width: 40px;
          min-height: 40px;
        }

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);

            &:hover {
              background-color: mixins.theme-color($theme, hover-color);
            }
          }
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, s);
      
      @media (min-width: 576px) {
        gap: map.get(vars.$spacing, m);
      }
      
      @media (min-width: 768px) {
        gap: map.get(vars.$spacing, l);
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: map.get(vars.$spacing, s);
        
        @media (min-width: 576px) {
          gap: map.get(vars.$spacing, m);
        }
        
        .user-name {
          font-weight: map.get(map.get(vars.$fonts, weights), medium);
          white-space: nowrap;
        }

        .logout-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, s);
          border-radius: 50px;
          font-weight: map.get(map.get(vars.$fonts, weights), medium);
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          cursor: pointer;
          transition: all 0.2s;
          background: linear-gradient(90deg, #4caf50, #81c784); // Gradient background
          color: #fff;
          min-width: 36px;
          min-height: 36px;
          
          @media (min-width: 576px) {
        gap: 8px;
        padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, m);
          }

          .logout-icon {
            display: flex;
            align-items: center;
          }
        }
      }
    }
  }

  // Hauptcontainer mit Sidebar und Content - responsive verbessert
  .member-container {
    display: flex;
    flex: 1;
    min-height: calc(100vh - 70px); // Höhe abzüglich Header
    padding-top: 70px; // Höhe des Headers
    transition: all 0.3s ease;
    position: relative;

    &.sidebar-open {
      @media (min-width: 1024px) {
        margin-left: 280px; // Breite der geöffneten Sidebar
      }
    }
  }

  // Hauptinhalt - responsive verbessert
  .member-content {
    flex: 1;
    width: 100%;
    padding: map.get(vars.$spacing, m);
    animation: fadeIn 0.4s ease-out;
    transition: all 0.3s ease;
    
    @media (min-width: 576px) {
      padding: map.get(vars.$spacing, l);
    }
    
    @media (min-width: 992px) {
      padding: map.get(vars.$spacing, xl);
    }

    &.sidebar-active {
      @media (max-width: 1023px) {
        filter: blur(2px);
        pointer-events: none;
      }
    }

    .content-wrapper {
      max-width: 1600px;
      margin: 0 auto;
      width: 100%;
    }
  }

  // Overlay für mobile Sidebar - verbessert
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
}

// Utility-Klassen für responsives Verhalten
.d-none {
  display: none !important;
}

.d-sm-inline {
  @media (min-width: 576px) {
    display: inline !important;
  }
}

.d-md-block {
  @media (min-width: 768px) {
    display: block !important;
  }
}

// Animationen - optimiert
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

// Transition für Overlay
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>