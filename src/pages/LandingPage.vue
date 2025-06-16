<template>
  <div>
    <!-- Logo Entrance Animation -->
    <div class="entrance-animation" v-if="showEntrance">
      <div class="animation-container">
        <!-- Animierte Hintergrund-Partikel -->
        <div class="particles">
          <div class="particle" v-for="i in 20" :key="i"></div>
        </div>
        
        <!-- Logo Container -->
        <div class="logo-wrapper">
          <img src="../assets/images/Logo.png" alt="Learn to Grow" class="entrance-logo" />
          <div class="logo-glow"></div>
        </div>
        
        <!-- Animierter Text -->
        <div class="entrance-text">
          <span class="letter learn" v-for="(letter, i) in 'Learn'" :key="'learn-'+i" :style="{animationDelay: i * 0.1 + 's'}">{{ letter }}</span>
          <span class="letter to" v-for="(letter, i) in 'To'" :key="'to-'+i" :style="{animationDelay: (5 + i) * 0.1 + 's'}">{{ letter }}</span>
          <span class="letter grow" v-for="(letter, i) in 'Grow'" :key="'grow-'+i" :style="{animationDelay: (7 + i) * 0.1 + 's'}">{{ letter }}</span>
        </div>
        
        <!-- Loading Bar -->
        <div class="loading-bar">
          <div class="loading-progress"></div>
        </div>
      </div>
    </div>

    <!-- Haupt Landing Page -->
    <main class="LandingPage container" :class="{ 'page-revealed': !showEntrance }">
      <HeroSection />
      <ContentBlocksSection />
      <QuizSection />
      <CommunitySection />
      <Authors/>
      <SubscriptionSection />
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import HeroSection from '../components/pages/LandingPage/HeroSection.vue';
import ContentBlocksSection from '../components/pages/LandingPage/ContentBlocksSection.vue';
import QuizSection from '../components/pages/LandingPage/QuizSection.vue';
import CommunitySection from '../components/pages/LandingPage/CommunitySection.vue';
import SubscriptionSection from '../components/pages/LandingPage/PreviewSection.vue';
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
  },
  setup() {
    const showEntrance = ref(true);
    
    // Prüfen ob Animation bereits gezeigt wurde
    onMounted(() => {
      const hasSeenAnimation = sessionStorage.getItem('hasSeenEntrance');
      
      if (hasSeenAnimation) {
        showEntrance.value = false;
      } else {
        // Animation nach 4 Sekunden automatisch beenden
        setTimeout(() => {
          showEntrance.value = false;
          sessionStorage.setItem('hasSeenEntrance', 'true');
        }, 4000);
      }
    });
    
    return {
      showEntrance
    };
  }
});
</script>

<style lang="scss">
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;
@use 'sass:map';
@use 'sass:math';
@use 'sass:color';

// Entrance Animation Styles
.entrance-animation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 5000;
  background: mixins.theme-color('dark', 'primary-bg');
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeOut 0.5s ease-out 3.5s forwards;
  
  .animation-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3rem;
  }
  
  // Partikel-Hintergrund
  .particles {
    position: absolute;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    
    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      background: mixins.theme-gradient('dark', 'primary');
      border-radius: 50%;
      opacity: 0;
      
      @for $i from 1 through 20 {
        &:nth-child(#{$i}) {
          $randomX: math.random() * 100;
          $randomY: math.random() * 100;
          $randomDelay: math.div(math.random() * 3000, 1000);
          $randomDuration: 3 + math.random() * 2;
          
          left: #{$randomX}vw;
          top: #{$randomY}vh;
          animation: 
            particleFloat #{$randomDuration}s ease-in-out infinite #{$randomDelay}s,
            particleGlow 2s ease-in-out infinite alternate #{$randomDelay}s;
        }
      }
    }
  }

  // Logo Animation
  .logo-wrapper {
    position: relative;
    z-index: 2;
    
    .entrance-logo {
      width: 200px;
      height: 200px;
      border-radius: 50%;
      object-fit: cover;
      opacity: 0;
      transform: scale(0.3) rotate(-180deg);
      animation: logoReveal 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
      box-shadow: 0 0 60px mixins.theme-color('dark', 'glow-green');
    }
    
    .logo-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 300px;
      height: 300px;
      transform: translate(-50%, -50%);
      background: radial-gradient(circle, 
        mixins.theme-color('dark', 'glow-green') 0%, 
        mixins.theme-color('dark', 'glow-teal') 30%, 
        mixins.theme-color('dark', 'glow-lime') 60%, 
        transparent 100%
      );
      filter: blur(40px);
      opacity: 0;
      animation: glowPulse 2s ease-in-out infinite 0.5s;
    }
  }
  
  // Text Animation
  .entrance-text {
    display: flex;
    gap: 1.5rem;
    font-size: 4rem;
    font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
    text-transform: uppercase;
    font-family: map.get(vars.$fonts, primary);
    
    .letter {
      display: inline-block;
      opacity: 0;
      transform: translateX(-50px) scale(0.8);
      animation: letterSlideIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
      
      &.learn {
        color: mixins.theme-color('dark', 'accent-green');
        text-shadow:
          0 0 30px mixins.theme-color('dark', 'glow-green'),
          0 0 60px mixins.theme-color('dark', 'glow-green'),
          0 0 90px rgba(mixins.theme-color('dark', 'accent-green'), 0.4);
        -webkit-text-stroke: 2px color.adjust(mixins.theme-color('dark', 'accent-green'), $lightness: -20%);
      }
      
      &.to {
        color: mixins.theme-color('dark', 'accent-teal');
        text-shadow:
          0 0 30px mixins.theme-color('dark', 'glow-teal'),
          0 0 60px mixins.theme-color('dark', 'glow-teal'),
          0 0 90px rgba(mixins.theme-color('dark', 'accent-teal'), 0.4);
        -webkit-text-stroke: 2px color.adjust(mixins.theme-color('dark', 'accent-teal'), $lightness: -20%);
      }
      
      &.grow {
        color: mixins.theme-color('dark', 'accent-lime');
        text-shadow:
          0 0 30px mixins.theme-color('dark', 'glow-lime'),
          0 0 60px mixins.theme-color('dark', 'glow-lime'),
          0 0 90px rgba(mixins.theme-color('dark', 'accent-lime'), 0.4);
        -webkit-text-stroke: 2px color.adjust(mixins.theme-color('dark', 'accent-lime'), $lightness: -20%);
      }
      
      // Glasmorphismus-Effekt für jeden Buchstaben
      &::before {
        content: attr(data-letter);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: inherit;
        filter: blur(0);
        z-index: -1;
        opacity: 0;
        animation: glassEffect 2s ease-in-out infinite;
        animation-delay: inherit;
      }
      
      &:hover {
        animation: letterPulse 0.5s ease-in-out;
        cursor: default;
      }
    }
  }
  
  // Loading Bar
  .loading-bar {
    width: 300px;
    height: 4px;
    background: mixins.theme-color('dark', 'border-light');
    border-radius: 2px;
    overflow: hidden;
    margin-top: 2rem;
    
    .loading-progress {
      height: 100%;
      background: mixins.theme-gradient('dark', 'primary');
      animation: loadingFill 3.5s ease-out forwards;
    }
  }
}

// Animationen
@keyframes logoReveal {
  0% {
    opacity: 0;
    transform: scale(0.3) rotate(-180deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.1) rotate(10deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0);
  }
}

@keyframes letterSlideIn {
  0% {
    opacity: 0;
    transform: translateX(-50px) scale(0.8) rotateY(-90deg);
    filter: blur(10px);
  }
  50% {
    opacity: 0.5;
    transform: translateX(10px) scale(1.1) rotateY(-45deg);
    filter: blur(5px);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1) rotateY(0);
    filter: blur(0);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
}

@keyframes particleFloat {
  0%, 100% {
    opacity: 0;
    transform: translateY(0) scale(0);
  }
  10% {
    opacity: 1;
    transform: translateY(-20px) scale(1);
  }
  90% {
    opacity: 1;
    transform: translateY(-100px) scale(1);
  }
}

@keyframes particleGlow {
  0% {
    box-shadow: 0 0 5px currentColor;
  }
  100% {
    box-shadow: 0 0 20px currentColor;
  }
}

@keyframes glowPulse {
  0%, 100% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(0.8);
  }
  50% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

@keyframes glassEffect {
  0%, 100% {
    opacity: 0;
    transform: scale(1);
    filter: blur(0);
  }
  50% {
    opacity: 0.3;
    transform: scale(1.2);
    filter: blur(20px);
  }
}

@keyframes letterPulse {
  0%, 100% {
    transform: scale(1) translateY(0);
  }
  50% {
    transform: scale(1.15) translateY(-5px);
  }
}

@keyframes loadingFill {
  0% {
    width: 0;
  }
  100% {
    width: 100%;
  }
}

@keyframes fadeOut {
  to {
    opacity: 0;
    visibility: hidden;
  }
}

// Landing Page Styles
.LandingPage {
  display: flex;
  flex-direction: column;
  gap: 300px;
  padding-bottom: map.get(vars.$spacing, xxxl);
  opacity: 0;
  transform: translateY(30px);
  max-width: 1600px;
  
  &.page-revealed {
    animation: pageReveal 0.8s ease-out forwards;
  }
}

@keyframes pageReveal {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Responsive
@include mixins.responsive('tablet') {
  .entrance-animation {
    .entrance-text {
      font-size: 2.5rem;
      gap: 1rem;
    }
    
    .logo-wrapper .entrance-logo {
      width: 150px;
      height: 150px;
    }
  }
}

@include mixins.responsive('mobile') {
  .entrance-animation {
    .entrance-text {
      font-size: 2rem;
      gap: 0.75rem;
      flex-direction: column;
      align-items: center;
      
      .letter {
        -webkit-text-stroke: 1px;
      }
    }
  }
}
</style>