<template>
  <footer class="app-footer container">
    <p class="footer-text">* Beiträge von Nutzern stellen ausschließlich die persönliche Meinung der Verfasser dar und müssen nicht der Meinung des Betreibers entsprechen.</p>
  </footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AppFooter'
});
</script>

<style lang="scss">
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;

.app-footer {
  padding: map-get(vars.$spacing, xl) 0;
  text-align: center;
  
  .footer-text {
    font-size: map-get(map-get(vars.$fonts, sizes), small);
    line-height: 1.6;
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-tertiary);
      }
    }
  }
}
</style>