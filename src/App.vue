<!-- src/App.vue -->
<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent, watch, onMounted } from "vue";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "App",
  setup() {
    const route = useRoute();

    // Funktion zum Anpassen der Body-Klasse basierend auf der aktuellen Route
    const updateBodyClass = () => {
      // Prüfen, ob die aktuelle Route zum Mitgliederbereich gehört
      const isMemberRoute = route.path.startsWith("/member");

      // Body-Klasse entsprechend setzen oder entfernen
      if (isMemberRoute) {
        document.body.classList.add("member-area");
      } else {
        document.body.classList.remove("member-area");
      }
    };

    // Body-Klasse beim ersten Laden setzen
    onMounted(() => {
      updateBodyClass();
    });

    // Body-Klasse aktualisieren, wenn sich die Route ändert
    watch(
      () => route.path,
      () => {
        updateBodyClass();
      }
    );
  },
});
</script>

<style>
/* Globale Stile */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Nunito", sans-serif;
  line-height: 1.6;
  min-height: 100vh;
  position: relative;
}

.container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 2rem;
  width: 100%;
}
/* Basisstile für Formulare und Buttons */
button {
  cursor: pointer;
  border: none;
  outline: none;
}

input,
select,
textarea {
  font-family: inherit;
}
</style>
