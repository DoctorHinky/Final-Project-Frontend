<!-- src/components/layout/AppMain.vue -->
<template>
  <main class="landing-page container">
    <LandingPage />
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LandingPage from '../../pages/LandingPage.vue';

export default defineComponent({
  name: 'AppMain',
  components: {
    LandingPage,
  },
});
</script>

<style lang="scss">
@use '@/style/base/variables' as vars;

/* Der feste Abstand wurde entfernt, da er jetzt vom Layout-Container übernommen wird */
</style>