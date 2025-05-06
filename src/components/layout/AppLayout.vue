<template>
  <div class="app-layout" :class="{ 'theme-light': isLightTheme, 'theme-dark': !isLightTheme }">
    <!-- Blätter-Animation -->
    <div class="leaves" ref="leavesContainer"></div>
    
    <AppHeader 
      :site-name="'Eltern & Kind'" 
      :is-light-theme="isLightTheme" 
      @toggle-theme="toggleTheme" 
    />
    
    <AppMain />
    
    <AppFooter />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue';
import AppHeader from './AppHeader.vue';
import AppMain from './AppMain.vue';
import AppFooter from './AppFooter.vue';

export default defineComponent({
  name: 'AppLayout',
  components: {
    AppHeader,
    AppMain,
    AppFooter
  },
  setup() {
    // Theme State aus localStorage oder default (light)
    const isLightTheme = ref(localStorage.getItem('theme') !== 'dark');
    const leavesContainer = ref<HTMLElement | null>(null);
    let leafInterval: number | undefined;
    
    const toggleTheme = () => {
      isLightTheme.value = !isLightTheme.value;
      localStorage.setItem('theme', isLightTheme.value ? 'light' : 'dark');
    };
    
    // Verbesserte Blätter-Animation
    const createLeaf = () => {
      if (!leavesContainer.value) return;
      
      const leaf = document.createElement('div');
      leaf.classList.add('leaf');
      
      // Zufällige Blattform und -farbe wählen
      const leafTypes = [
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%234AD295' d='M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z'/%3E%3C/svg%3E",
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%239BE15D' d='M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z'/%3E%3C/svg%3E",
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%2335CCD0' d='M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z'/%3E%3C/svg%3E"
      ];
      
      // Zufällige Werte für die Animation
      const randomX = Math.random() * 200 - 100;
      const randomRotation = Math.random() * 360;
      const duration = Math.random() * 10 + 5; // 5-15 Sekunden
      
      // Direktes Styling anwenden
      leaf.style.position = 'absolute';
      leaf.style.width = '20px';
      leaf.style.height = '20px';
      leaf.style.backgroundImage = `url(${leafTypes[Math.floor(Math.random() * leafTypes.length)]})`;
      leaf.style.backgroundSize = 'contain';
      leaf.style.backgroundRepeat = 'no-repeat';
      leaf.style.opacity = '0';
      leaf.style.top = '-30px';
      leaf.style.left = `${Math.random() * 100}%`;
      
      // Animations-Parameter setzen
      const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
      
      // Animationen erstellen
      const style = document.createElement('style');
      style.textContent = `
        @keyframes fall-${uniqueId} {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.7; }
          90% { opacity: 0.7; }
          100% { transform: translateY(100vh) translateX(${randomX}px); opacity: 0; }
        }
        
        @keyframes rotate-${uniqueId} {
          0% { transform: rotate(${randomRotation}deg); }
          100% { transform: rotate(${randomRotation + 360}deg); }
        }
      `;
      document.head.appendChild(style);
      
      // Animationen anwenden
      leaf.style.animation = `fall-${uniqueId} ${duration}s linear forwards, rotate-${uniqueId} ${duration}s linear infinite`;
      
      // Blatt in den DOM einfügen
      leavesContainer.value.appendChild(leaf);
      
      // Blatt und Animationen nach Ende der Animation entfernen
      setTimeout(() => {
        if (leaf && leaf.parentNode === leavesContainer.value) {
          leaf.remove();
        }
        style.remove();
      }, duration * 1000);
    };
    
    onMounted(() => {
      // Initial ein paar Blätter erzeugen
      for (let i = 0; i < 5; i++) {
        setTimeout(createLeaf, i * 1000);
      }
      
      // Blätter in Intervallen erzeugen
      leafInterval = window.setInterval(createLeaf, 3000);
      
      // IntersectionObserver für Scroll-Animationen einrichten
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, { threshold: 0.1 });
      
      // Alle Sektionen beobachten
      document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
      });
    });
    
    onBeforeUnmount(() => {
      // Cleanup bei Komponentenentfernung
      if (leafInterval) {
        clearInterval(leafInterval);
      }
    });
    
    return {
      isLightTheme,
      leavesContainer,
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
  }
  
  &.theme-dark {
    background-color: mixins.theme-color('dark', primary-bg);
    color: mixins.theme-color('dark', text-primary);
  }
}

// Animierte Blätter
.leaves {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: map.get(vars.$z-index, below);
  overflow: hidden;
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