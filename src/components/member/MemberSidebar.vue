<!-- src/components/member/MemberSidebar.vue -->
<template>
  <aside class="member-sidebar" :class="{ 'open': isOpen }">
    <!-- Sidebar-Header mit Logo und Schließen-Button -->
    <div class="sidebar-header">
      <img src="@/assets/images/AuthorIcon1.jpg" alt="Account Logo" class="account-logo" />
      <div class="header-content">
        <h3>Eltern & Kind</h3>
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
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-text">{{ item.text }}</span>
      </div>
    </nav>
    
    <!-- Sidebar-Footer mit Abmelde-Button -->
    <div class="sidebar-footer">
      <button class="logout-button" @click="$emit('logout')">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
        <span>Abmelden</span>
      </button>
    </div>
  </aside>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'MemberSidebar',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    activeMenu: {
      type: String,
      default: 'overview'
    }
  },
  emits: ['select-menu', 'close', 'logout'],
  setup(props, { emit }) {
    // Menüelemente definieren
    const menuItems = ref([
      { id: 'overview', text: 'Übersicht', icon: '📊' },
      { id: 'my-articles', text: 'Meine Artikel', icon: '📚' },
      { id: 'library', text: 'Bibliothek', icon: '📖' }, // Neuer Menüpunkt für Bibliothek
      { id: 'favorites', text: 'Favoriten', icon: '❤️' },
      { id: 'friends', text: 'Freunde', icon: '👥' },
      { id: 'notifications', text: 'Benachrichtigungen', icon: '🔔' },
      { id: 'settings', text: 'Einstellungen', icon: '⚙️' }
    ]);
    
    // Menüpunkt auswählen
    const selectMenuItem = (itemId: string) => {
      emit('select-menu', itemId);
    };
    
    return {
      menuItems,
      selectMenuItem
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

.member-sidebar {
  position: fixed;
  top: 0;
  left: -260px;
  width: 260px;
  height: 100vh;
  z-index: 950;
  transition: left 0.3s ease;
  display: flex;
  flex-direction: column;
  padding-top: 70px; // Platz für den Header
  
  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, card-bg);
      border-right: 1px solid mixins.theme-color($theme, border-medium);
    }
  }
  
  &.open {
    left: 0;
    box-shadow: 5px 0 15px rgba(0, 0, 0, 0.1);
  }
  
  // Sidebar-Header
  .sidebar-header {
    display: flex;
    align-items: center;
    padding: map.get(vars.$spacing, m);
    border-bottom: 1px solid;
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        border-color: mixins.theme-color($theme, border-light);
      }
    }
    
    .account-logo {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      margin-right: map.get(vars.$spacing, s);
    }
    
    .header-content {
      flex: 1;
      
      h3 {
        margin: 0;
        font-size: map.get(map.get(vars.$fonts, sizes), medium);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
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
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
          
          &:hover {
            color: mixins.theme-color($theme, text-primary);
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
    
    .nav-item {
      display: flex;
      align-items: center;
      padding: map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      cursor: pointer;
      transition: all 0.3s;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
          
          &:hover {
            background-color: mixins.theme-color($theme, hover-color);
            color: mixins.theme-color($theme, text-primary);
          }
          
          &.active {
            background: mixins.theme-gradient($theme, primary);
            color: white;
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
      }
      
      .nav-text {
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
      }
    }
  }
  
  // Sidebar-Footer
  .sidebar-footer {
    padding: map.get(vars.$spacing, m);
    border-top: 1px solid;
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        border-color: mixins.theme-color($theme, border-light);
      }
    }
    
    .logout-button {
      width: 100%;
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      padding: map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      background: none;
      border: 1px solid;
      cursor: pointer;
      transition: all 0.3s;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: #ff0000; // Rot für Abmelden
          border-color: rgba(255, 0, 0, 0.3);
          
          &:hover {
            background-color: rgba(255, 0, 0, 0.1);
            border-color: rgba(255, 107, 107, 0.5);
          }
        }
      }
      
      .nav-icon {
        margin-right: map.get(vars.$spacing, m);
        font-size: 1.2rem;
      }
    }
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