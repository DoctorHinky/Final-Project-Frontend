<template>
  <div class="theme-toggle">
    <button class="theme-toggle-button" title="Theme wechseln" @click="$emit('toggle')">
      <span class="dark-icon" v-if="isLightTheme">🌙</span>
      <span class="light-icon" v-else>☀️</span>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ThemeToggle',
  props: {
    isLightTheme: {
      type: Boolean,
      required: true
    }
  },
  emits: ['toggle']
});
</script>

<style lang="scss">
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;

.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  .theme-toggle-button {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all map-get(vars.$transitions, default);
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, secondary-bg);
        color: mixins.theme-color($theme, text-primary);
        box-shadow: 0 2px 8px mixins.theme-color($theme, shadow-color);
        
        &:hover {
          transform: scale(1.1) rotate(15deg);
          @include mixins.glow('teal', 'small', $theme);
        }
        
        &:active {
          transform: scale(0.95);
        }
      }
    }
  }
}
</style>