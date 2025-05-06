<template>
  <main class="LandingPage container">
    <HeroSection />
    <ContentBlocksSection />
    <QuizSection />
    <CommunitySection />
    <Authors/>
    <SubscriptionSection />
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import HeroSection from '../components/pages/LandingPage/HeroSection.vue';
import ContentBlocksSection from '../components/pages/LandingPage/ContentBlocksSection.vue';
import QuizSection from '../components/pages/LandingPage/QuizSection.vue';
import CommunitySection from '../components/pages/LandingPage/CommunitySection.vue';
import SubscriptionSection from '../components/pages/LandingPage/SubscriptionSection.vue';
import Authors from '../components/pages/LandingPage/Authors.vue'

export default defineComponent({
  name: 'AppMain',
  components: {
    HeroSection,
    ContentBlocksSection,
    QuizSection,
    CommunitySection,
    SubscriptionSection,
    Authors
  }
});
</script>

<style lang="scss">
@use '@/style/base/variables' as vars;

.LandingPage {
  display: flex;
  flex-direction: column;
  gap: map-get(vars.$spacing, xxxl);
  padding-bottom: map-get(vars.$spacing, xxxl);
}
</style>