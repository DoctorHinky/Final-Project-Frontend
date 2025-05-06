<template>
  <div class="theme-toggle-container">
    <button id="themeToggle" title="Theme wechseln" @click="$emit('toggle')">
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

.theme-toggle-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
  
  button {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, secondary-bg);
        box-shadow: 0 3px 10px mixins.theme-color($theme, shadow-color);
        
        &:hover {
          transform: scale(1.1);
        }
      }
    }
  }
}
</style>