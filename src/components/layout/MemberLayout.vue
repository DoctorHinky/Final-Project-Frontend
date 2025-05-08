<!-- src/components/layout/MemberLayout.vue -->
<template>
  <div class="member-layout" :class="{ 'theme-light': isLightTheme, 'theme-dark': !isLightTheme }">
    <!-- Header mit Toggle und Benutzerinfo -->
    <div class="member-header">
      <div class="header-left">
        <button class="sidebar-toggle" @click="toggleSidebar">
          <span class="toggle-icon">☰</span>
        </button>
        <h1>{{ pageTitle }}</h1>
      </div>
      <div class="header-right">
        <ThemeToggle :is-light-theme="isLightTheme" @toggle="toggleTheme" />
        <div class="user-info">
          <button class="logout-button" @click="handleLogout">Abmelden</button>
        </div>
      </div>
    </div>

    <div class="member-container" :class="{ 'sidebar-open': isSidebarOpen }">
      <!-- Sidebar Komponente einbinden -->
      <MemberSidebar 
        :is-open="isSidebarOpen" 
        :active-menu="activeMenu"
        @select-menu="onMenuSelect"
        @close="closeSidebar"
        @logout="handleLogout"
      />
      
      <!-- Hauptinhalt -->
      <main class="member-content">
        <slot></slot>
      </main>
    </div>

    <!-- Overlay für mobile Ansicht -->
    <div class="sidebar-overlay" v-if="isSidebarOpen" @click="closeSidebar"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
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

    // Sidebar umschalten
    const toggleSidebar = () => {
      isSidebarOpen.value = !isSidebarOpen.value;
    };

    // Sidebar schließen
    const closeSidebar = () => {
      isSidebarOpen.value = false;
    };

    // Menüpunkt auswählen
    const onMenuSelect = (menuItem: string) => {
      emit('menu-change', menuItem);
      
      // Auf mobilen Geräten Sidebar nach Auswahl schließen
      if (window.innerWidth < 1024) {
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

    // Responsive Verhalten für Sidebar
    watch(() => window.innerWidth, () => {
      if (window.innerWidth < 1024 && isSidebarOpen.value) {
        isSidebarOpen.value = false;
      }
    });

    // Event-Listener für Bildschirmgröße
    onMounted(() => {
      window.addEventListener('resize', () => {
        if (window.innerWidth < 1024 && isSidebarOpen.value) {
          isSidebarOpen.value = false;
        }
      });
    });

    return {
      isSidebarOpen,
      isLightTheme,
      userName,
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
  
  @each $theme in ('light', 'dark') {
    &.theme-#{$theme} {
      background-color: mixins.theme-color($theme, primary-bg);
      color: mixins.theme-color($theme, text-primary);
    }
  }
  
  // Header-Bereich
  .member-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
    z-index: 900;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        border-bottom: 1px solid mixins.theme-color($theme, border-light);
        @include mixins.shadow('small', $theme);
      }
    }
    
    .header-left {
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, m);
      
      .sidebar-toggle {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: none;
        cursor: pointer;
        border-radius: 50%;
        transition: all 0.3s;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
            
            &:hover {
              background-color: mixins.theme-color($theme, hover-color);
            }
          }
        }
      }
      
      h1 {
        font-size: 1.5rem;
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        margin: 0;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }
    }
    
    .header-right {
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, l);
      
      .user-info {
        display: flex;
        align-items: center;
        gap: map.get(vars.$spacing, m);
        
        .user-greeting {
          font-weight: map.get(map.get(vars.$fonts, weights), medium);
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
          
          @media (max-width: 768px) {
            display: none;
          }
        }
        
        .logout-button {
          padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, m);
          border-radius: map.get(map.get(vars.$layout, border-radius), pill);
          font-weight: map.get(map.get(vars.$fonts, weights), medium);
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          cursor: pointer;
          transition: all 0.3s;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: transparent;
              color: mixins.theme-color($theme, text-primary);
              border: 1px solid mixins.theme-color($theme, border-medium);
              
              &:hover {
                background-color: mixins.theme-color($theme, hover-color);
              }
            }
          }
        }
      }
    }
  }
  
  // Hauptcontainer mit Sidebar und Content
  .member-container {
    display: flex;
    min-height: 100vh;
    padding-top: 70px; // Höhe des Headers
    transition: padding-left 0.3s ease;
    
    &.sidebar-open {
      @media (min-width: 1024px) {
        padding-left: 260px; // Breite der geöffneten Sidebar
      }
    }
  }
  
  // Hauptinhalt
  .member-content {
    flex: 1;
    padding: map.get(vars.$spacing, xl);
    width: 100%;
    
    @media (max-width: 768px) {
      padding: map.get(vars.$spacing, m);
    }
  }
  
  // Overlay für mobile Sidebar
  .sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 850;
    display: none;
    
    @media (max-width: 1024px) {
      display: block;
    }
  }
}

// Animation für den Seitenwechsel
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>