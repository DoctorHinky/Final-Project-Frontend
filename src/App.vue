<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';

export default defineComponent({
  name: 'App',
  setup() {
    onMounted(() => {
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
  }
});
</script>

<style lang="scss">
// Basis-Styling für die gesamte Anwendung
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Nunito', sans-serif;
  line-height: 1.6;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  width: 100%;
}
</style>