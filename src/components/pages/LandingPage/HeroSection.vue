<template>
  <section class="section hero-section" id="hero">
    <div class="hero-container">
      <div class="hero-text">
        <h1>Begleitung für die wichtigsten Momente</h1>
        <p class="hero-subtext">Experten-Wissen und praktische Hilfestellungen für den Familienalltag – von Trotzphase bis nach der Pubertät.</p>
        <div class="hero-features">
          <div class="feature">
            <div class="feature-icon">🧠</div>
            <p>Ausführliche Artikel</p>
          </div>
          <div class="feature">
            <div class="feature-icon">👨‍👩‍👧‍👦</div>
            <p>Von Eltern und Pädagogen entwickelt</p>
          </div>
          <div class="feature">
            <div class="feature-icon">📱</div>
            <p>Jederzeit abrufbare Ratschläge</p>
          </div>
        </div>
        <div class="hero-cta">
            <router-link to="/login-register" class="btn-primary">Loslegen</router-link>
            <button class="btn-secondary" @click="$router.push({ hash: '#content' })">
              Mehr erfahren
                <HeroiconsChevronDownIcon class="arrow-down-icon" style="margin-left: 0.5em; vertical-align: middle; width: 1.5em; height: 1.5em;" />
            </button>
        </div>
      </div>
      <div class="ScrollIndicator">
        <HeroiconsChevronDownIcon class="scroll-indicator-icon" style="width: 2em; height: 2em;" />
      </div>
      <div class="hero-visual">
        <div class="illustration">
          <!-- Hintergrundkreis, wird vor den Elementen definiert -->
          <div class="background-circle"></div>
          
          <!-- Kreispfad (unsichtbar, aber für Entwicklung hilfreich) -->
          <div class="circle-path"></div>
          
          <!-- Animierte Elemente auf dem Kreisrand -->
          <div class="illustration-element leaf1">🍃</div>
          <div class="illustration-element leaf2">🌿</div>
          <div class="illustration-element leaf3">🌱</div>
          <div class="illustration-element leaf4">🌷</div>
          
          <!-- Hauptillustration in der Mitte -->
            <img src="@/assets/images/Logo.png" alt="LearnToGrow Logo" class="main-illustration" />
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ChevronDownIcon as HeroiconsChevronDownIcon } from '@heroicons/vue/24/solid';

export default defineComponent({
  name: 'HeroSection',
  components: {
    HeroiconsChevronDownIcon
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

// Keyframes für präzise rotierende Animation
@keyframes rotate-on-circle {
  0% {
    transform: rotate(0deg) translateX(125px) rotate(0deg);
  }
  100% {
    transform: rotate(360deg) translateX(125px) rotate(-360deg);
  }
}

@keyframes rotate-on-circle-reverse {
  0% {
    transform: rotate(0deg) translateX(125px) rotate(0deg);
  }
  100% {
    transform: rotate(-360deg) translateX(125px) rotate(360deg);
  }
}

.hero-section {
  margin: 150px auto 0px auto;
  min-height: 70vh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  
  
  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: -1;
    opacity: 0.4;
  }
  
  .hero-container {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: map.get(vars.$spacing, xxl);
    width: 100%;
    
    @media (max-width: map.get(map.get(vars.$layout, breakpoints), desktop)) {
      grid-template-columns: 1fr;
    }
  }
  
  .hero-text {
    h1 {
      font-size: 3.5rem !important;
      font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
      line-height: 1.2;
      margin-bottom: map.get(vars.$spacing, l);
      position: relative;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
          
          &::after {
            content: '';
            position: absolute;
            width: 100px;
            height: 4px;
            bottom: -16px;
            left: 0;
            background: mixins.theme-gradient($theme, primary);
            border-radius: 4px;
          }
        }
      }
      
      @media (max-width: map.get(map.get(vars.$layout, breakpoints), tablet)) {
        font-size: 2.5rem;
      }
    }
    
    .hero-subtext {
      font-size: map.get(map.get(vars.$fonts, sizes), xl);
      margin-bottom: map.get(vars.$spacing, xl);
      max-width: 600px;
      line-height: 1.6;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  // ScrollIndicator mit animierter Bounce- und Fade-in-Animation
  @keyframes bounce {
    0%, 100% {
      transform: translateX(-50%) translateY(0);
    }
    50% {
      transform: translateX(-50%) translateY(12px);
    }
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  .ScrollIndicator {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    opacity: 0;
    animation:
      fade-in 1s ease-out 0.5s forwards,
      bounce 1.5s infinite 1s;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
      }
    }

    &:hover {
      transform: translateX(-50%) scale(1.1);
      transition: transform map.get(vars.$transitions, default);
    }
  }
  
  .hero-features {
    display: flex;
    flex-direction: column;
    gap: map.get(vars.$spacing, l);
    margin-bottom: map.get(vars.$spacing, xxl);
    
    .feature {
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, s);
      
      .feature-icon {
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        font-size: 1.5rem;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            box-shadow: 0 4px 12px rgba(mixins.theme-color($theme, shadow-color), 0.15);
          }
        }
      }
      
      p {
        font-size: map.get(map.get(vars.$fonts, sizes), medium);
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        margin: 0;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }
      
      &:nth-child(1) .feature-icon {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: rgba(mixins.theme-color($theme, accent-teal), 0.15);
          }
        }
      }
      
      &:nth-child(2) .feature-icon {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: rgba(mixins.theme-color($theme, accent-lime), 0.15);
          }
        }
      }
      
      &:nth-child(3) .feature-icon {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: rgba(mixins.theme-color($theme, accent-green), 0.15);
          }
        }
      }
    }
  }
  
  .hero-cta {
    display: flex;
    gap: map.get(vars.$spacing, m);
    margin-top: map.get(vars.$spacing, xl);
    padding: 1rem;
    
    @media (max-width: map.get(map.get(vars.$layout, breakpoints), mobile)) {
      flex-direction: column;
    }

    // Spezifisches Styling für router-link mit .btn-primary
    .btn-primary.router-link-active,
    .btn-primary.router-link-exact-active,
    .btn-primary {
      display: inline-block;
      text-decoration: none;
      padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      font-size: map.get(map.get(vars.$fonts, sizes), medium);
      cursor: pointer;
      transition: transform map.get(vars.$transitions, default),
                  box-shadow map.get(vars.$transitions, default);
      transform: scale(1.05);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          @include mixins.button-style($theme, 'medium', true);
        }
      }
    }
    
    .btn-primary:hover,
    .btn-primary:focus {
      transform: scale(1.08) translateY(-2px);
      box-shadow: 0 6px 18px rgba(0,0,0,0.10);
      outline: none;
    }
    
    .btn-secondary {
      padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      font-size: map.get(map.get(vars.$fonts, sizes), medium);
      cursor: pointer;
      transition: transform map.get(vars.$transitions, default),
                 box-shadow map.get(vars.$transitions, default);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: transparent;
          color: mixins.theme-color($theme, text-primary);
          border: 2px solid mixins.theme-color($theme, border-medium);
          
          &:hover {
            transform: translateY(-4px);
            @include mixins.shadow('small', $theme);
            border-color: mixins.theme-color($theme, accent-teal);
          }
        }
      }
    }
  }
  
  .hero-visual {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    @media (max-width: map.get(map.get(vars.$layout, breakpoints), desktop)) {
      display: none;
    }
    
    .illustration {
      position: relative;
      width: 350px;
      height: 350px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      // Hintergrund-Kreis als separates Element
      .background-circle {
        position: absolute;
        width: 250px;
        height: 250px;
        border-radius: 50%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 0;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: radial-gradient(
              circle,
              rgba(mixins.theme-color($theme, accent-green), 0.15) 0%,
              rgba(mixins.theme-color($theme, accent-lime), 0.08) 60%,
              transparent 80%
            );
          }
        }
      }
      
      // Hilfslinie für den Kreisrand (in der Produktion auskommentieren)
      .circle-path {
        position: absolute;
        width: 250px;
        height: 250px;
        border-radius: 50%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 0;
        border: 1px dotted rgba(0, 0, 0, 0.1); // Sehr subtile Hilfsline
        pointer-events: none; // Verhindert Klicks auf die Hilfsline
        display: none; // In der Produktion auskommentieren, für Entwicklung einkommentieren
      }
      
      .main-illustration {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 150px !important; // Größe der Hauptillustration
        z-index: 2;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); // Leichter Schatten für bessere Sichtbarkeit
        user-select: none;
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
          }
        }
      }
      
      .illustration-element {
        position: absolute;
        font-size: 2.5rem;
        z-index: 1;
        top: 40%;
        left: 45%;
        transform-origin: center;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1)); // Leichter Schatten für bessere Sichtbarkeit
        user-select: none; // Verhindert das Markieren der Emojis
        
        &.leaf1 {
          animation: rotate-on-circle 30s linear infinite;
        }
        
        &.leaf2 {
          animation: rotate-on-circle-reverse 30s linear infinite;
          animation-delay: -7.5s; // Genau ein Viertel der Gesamtdauer
        }
        
        &.leaf3 {
          animation: rotate-on-circle 30s linear infinite;
          animation-delay: -15s; // Genau die Hälfte der Gesamtdauer
        }
        
        &.leaf4 {
          animation: rotate-on-circle-reverse 30s linear infinite;
          animation-delay: -22.5s; // Genau drei Viertel der Gesamtdauer
        }
      }
    }
  }
}
</style>