<!-- src/components/layout/AppLayout.vue -->
<template>
  <div class="app-layout" :class="{ 'theme-light': isLightTheme, 'theme-dark': !isLightTheme }">
    <AppHeader :site-name="'LearnToGrow'" :is-light-theme="isLightTheme" @toggle-theme="toggleTheme" />
    <div class="main-content">
      <router-view />
    </div>
    <AppFooter />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppHeader from './AppHeader.vue';
import AppFooter from './AppFooter.vue';
import { themeService } from '@/services/theme.service';

export default defineComponent({
  name: 'AppLayout',
  components: {
    AppHeader,
    AppFooter
  },
  setup() {
    // Theme-Service verwenden
    const isLightTheme = themeService.isLightTheme;

    const toggleTheme = () => {
      themeService.toggleTheme();
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

  @each $theme in ('light', 'dark') {
    &.theme-#{$theme} {
      background-color: mixins.theme-color($theme, primary-bg);
      color: mixins.theme-color($theme, text-primary);
      transition: all 0.4s ease-out;
    }
  }

  .main-content {
    /* Fester Abstand zum Header für alle Seiten */
    padding-top: 80px;
    /* Anpassbar je nach Höhe des Headers */
  }
}

// Basis-Styling für Sektionen mit Scroll-Fade-In-Animation
.section {
  opacity: 0;
  transform: translateY(30px);
  transition:
    opacity map.get(vars.$transitions, very-slow),
    transform map.get(vars.$transitions, very-slow);

  &.visible {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>