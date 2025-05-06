<template>
  <header class="app-header container">
    <div class="header-top">
      <div class="logo">{{ siteName }}</div>
      <div class="header-actions">
        <ThemeToggle :is-light-theme="isLightTheme" @toggle="toggleTheme" />
        <router-link to="/login-register" class="login-button">Anmelden</router-link>
      </div>
    </div>
    
    <nav class="nav-tabs">
      <button 
        v-for="(tab, index) in tabs" 
        :key="index" 
        class="nav-tab" 
        :class="{ active: activeTab === index }"
        @click="setActiveTab(index)"
      >
        {{ tab }}
      </button>
    </nav>
  </header>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import ThemeToggle from '../ui/ThemeToggle.vue';

export default defineComponent({
  name: 'AppHeader',
  components: {
    ThemeToggle
  },
  props: {
    siteName: {
      type: String,
      required: true
    },
    isLightTheme: {
      type: Boolean,
      required: true
    }
  },
  emits: ['tab-change', 'toggle-theme'],
  setup(props, { emit }) {
    const activeTab = ref(0);
    
    const tabs = [
      'Über',
      'Was wir tun',
      'Bücher',
      'Community',
      'Über Autoren'
    ];
    
    const setActiveTab = (index: number) => {
      activeTab.value = index;
      // Event für andere Komponenten emittieren
      emit('tab-change', index);
    };
    
    const toggleTheme = () => {
      // Event an übergeordnete Komponente weiterleiten
      emit('toggle-theme');
    };
    
    return {
      activeTab,
      tabs,
      setActiveTab,
      toggleTheme
    };
  }
});
</script>

<style lang="scss">
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;

.app-header {
  padding: map.get(vars.$spacing, m) 0;
  margin-bottom: map.get(vars.$spacing, xl);
  
  // Container für Logo und Header-Actions
  .header-top {
    @include mixins.flex(row, space-between, center, nowrap);
    margin-bottom: map.get(vars.$spacing, m);
  }
  
  // Neuer Container für Theme-Toggle und Login-Button
  .header-actions {
    @include mixins.flex(row, flex-end, center, nowrap);
    gap: map.get(vars.$spacing, m);
  }
  
  .logo {
    font-size: map.get(map.get(vars.$fonts, sizes), xxl);
    font-weight: map.get(map.get(vars.$fonts, weights), bold);
    position: relative;
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        @include mixins.text-gradient('primary', $theme);
        
        &::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 100%;
          height: 2px;
          background: mixins.theme-gradient($theme, primary);
          border-radius: 2px;
        }
      }
    }
  }
  
  // Styling für den Login-Button
  .login-button {
    display: inline-block;
    text-decoration: none;
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        @include mixins.button-style($theme, 'small', true);
      }
    }
  }
}

// Navigation
.nav-tabs {
  width: 100%;
  margin: map.get(vars.$spacing, xl) 0 map.get(vars.$spacing, m);
  @include mixins.flex(row, center, center, wrap);
  gap: map.get(vars.$spacing, m);
  
  .nav-tab {
    position: relative;
    overflow: hidden;
    padding: map.get(vars.$spacing, s) map.get(vars.$spacing, xl);
    border-radius: map.get(map.get(vars.$layout, border-radius), pill);
    font-weight: map.get(map.get(vars.$fonts, weights), bold);
    font-size: map.get(map.get(vars.$fonts, sizes), medium);
    cursor: pointer;
    background: transparent;
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, nav-item-bg);
        color: mixins.theme-color($theme, text-primary);
        border: 2px solid mixins.theme-color($theme, border-light);
        @include mixins.shadow('small', $theme);
        
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left map.get(vars.$transitions, slow);
        }
        
        &:hover, &.active {
          background: mixins.theme-gradient($theme, nav-active);
          color: white;
          transform: translateY(-4px);
          @include mixins.glow('green', 'medium', $theme);
          border-color: transparent;
        }
        
        &:hover::before {
          left: 100%;
        }
      }
    }
  }
}

// Responsives Design für den Header
@media (max-width: map.get(map.get(vars.$layout, breakpoints), tablet)) {
  .app-header {
    .header-top {
      @include mixins.flex(row, space-between, center, wrap);
      margin-bottom: map.get(vars.$spacing, l);
    }
    
    .header-actions {
      margin-top: map.get(vars.$spacing, s);
    }
    
    .nav-tabs {
      justify-content: flex-start;
      overflow-x: auto;
      padding-bottom: map.get(vars.$spacing, s);
      
      .nav-tab {
        flex: 0 0 auto;
        white-space: nowrap;
      }
    }
  }
}
</style>