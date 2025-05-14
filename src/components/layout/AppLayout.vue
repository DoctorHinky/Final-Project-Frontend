<!-- src/components/layout/AppLayout.vue -->
<template>
  <div class="app-layout" :class="{ 'theme-light': isLightTheme, 'theme-dark': !isLightTheme }">
    <AppHeader 
      :site-name="'Eltern & Kind'" 
      :is-light-theme="isLightTheme" 
      @toggle-theme="toggleTheme" 
    />
    
    <div class="main-content">
      <router-view />
    </div>
    
    <AppFooter />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import AppHeader from './AppHeader.vue';
import AppFooter from './AppFooter.vue';

export default defineComponent({
  name: 'AppLayout',
  components: {
    AppHeader,
    AppFooter
  },
  setup() {
    const isLightTheme = ref(localStorage.getItem('theme') !== 'dark');
    
    const toggleTheme = () => {
      isLightTheme.value = !isLightTheme.value;
      localStorage.setItem('theme', isLightTheme.value ? 'light' : 'dark');
    };
    
    return {
      isLightTheme,
      toggleTheme
    };
  }
});
</script>

<style lang="scss">
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;
@use 'sass:map';

.app-layout {
  min-height: 100vh;
  
  &.theme-light {
    background-color: mixins.theme-color('light', primary-bg);
    color: mixins.theme-color('light', text-primary);
    transition: all 0.4s ease-out;
  }
  
  &.theme-dark {
    background-color: mixins.theme-color('dark', primary-bg);
    color: mixins.theme-color('dark', text-primary);
    transition: all 0.4s ease-out;
  }
  
  .main-content {
    /* Fester Abstand zum Header für alle Seiten */
    padding-top: 130px; /* Anpassbar je nach Höhe des Headers */
  }
}

// Basis-Styling für Sektionen mit Scroll-Fade-In-Animation
.section {
  opacity: 0;
  transform: translateY(30px);
  transition: 
    opacity map.get(vars.$transitions, very-slow), 
    transform map.get(vars.$transitions, very-slow);
    margin-top: 100px;
  
  &.visible {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>