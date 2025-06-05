<template>
  <div class="login-register-page">
    <!-- Animierter Hintergrund -->
    <div class="animated-background">
      <div class="gradient-bg"></div>
      <div class="floating-shapes">
        <div class="shape" v-for="i in 3" :key="i"></div>
      </div>
      <div class="grid-overlay"></div>
    </div>

    <div class="container">
      <div class="auth-container" :class="{ 'wide-container': activeTab === 'register' }">
        <div class="tabs">
          <button class="tab" :class="{ active: activeTab === 'login' }" @click="activeTab = 'login'">Anmelden</button>
          <button class="tab" :class="{ active: activeTab === 'register' }" @click="activeTab = 'register'">
            Registrieren
          </button>
        </div>
        <!-- Login Komponente -->
        <Login v-if="activeTab === 'login'" @login-success="handleLoginSuccess" />
        <!-- Register Komponente -->
        <Register v-if="activeTab === 'register'" @register-success="handleRegisterSuccess" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import Login from "@/components/pages/LoginRegister/Login.vue";
import Register from "@/components/pages/LoginRegister/Register.vue";

export default defineComponent({
  name: "LoginRegister",
  components: {
    Login,
    Register,
  },
  setup() {
    const route = useRoute();
    const activeTab = ref("login");


    onMounted(() => {
      // Bei Redirect-Parameter den Login-Tab aktivieren
      if (route.query.redirect) {
        activeTab.value = "login";
      }
    });

    return {
      activeTab,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;

.login-register-page {
  min-height: calc(100vh - 130px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: map.get(vars.$spacing, xl) 0;
  position: relative;
  z-index: 100;
  overflow: hidden;

  // Animierter Hintergrund
  .animated-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    overflow: hidden;

    // Dunklerer Basis-Layer
    &::before {
      content: "";
      position: absolute;
      width: 100%;
      height: 100%;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          @if $theme =="dark" {
            background-color: rgba(15, 36, 25, 0.6); // Dunkler Overlay basierend auf primary-bg
          }

          @else {
            background-color: rgba(248, 255, 249, 0.3); // Leichter Overlay für Light Theme
          }
        }
      }

      z-index: 1;
    }

    // Kontrast-Filter für knackigere Farben
    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        @if $theme =="dark" {
          filter: contrast(1.05) brightness(0.7) saturate(0.8);
        }

        @else {
          filter: contrast(1.02) brightness(0.95);
        }
      }
    }

    // Mehrere Gradient-Layer für sanfte Übergänge
    .gradient-bg {
      position: absolute;
      width: 300%;
      height: 300%;
      top: -100%;
      left: -100%;

      &::before,
      &::after {
        content: "";
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
      }

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          @if $theme =="dark" {
            // Haupt-Gradient-Layer - deutlich dunkler
            background: radial-gradient(ellipse 80% 50% at 30% 40%,
                rgba(74, 210, 149, 0.08) 0%,
                rgba(74, 210, 149, 0.05) 20%,
                rgba(53, 204, 208, 0.03) 40%,
                transparent 70%),
              radial-gradient(ellipse 60% 80% at 70% 60%,
                rgba(53, 204, 208, 0.08) 0%,
                rgba(53, 204, 208, 0.05) 25%,
                rgba(155, 225, 93, 0.03) 50%,
                transparent 75%),
              radial-gradient(ellipse 90% 70% at 50% 30%,
                rgba(155, 225, 93, 0.06) 0%,
                rgba(74, 210, 149, 0.03) 30%,
                transparent 80%);

            // Zweiter Layer für Tiefe - sehr dunkel
            &::before {
              background: radial-gradient(ellipse 100% 60% at 20% 70%,
                  rgba(74, 210, 149, 0.05) 0%,
                  rgba(53, 204, 208, 0.02) 35%,
                  transparent 65%),
                radial-gradient(ellipse 70% 90% at 80% 20%,
                  rgba(53, 204, 208, 0.06) 0%,
                  rgba(155, 225, 93, 0.02) 40%,
                  transparent 70%);
              animation: gradientMove1 35s ease-in-out infinite;
            }

            // Dritter Layer für Bewegung - minimal
            &::after {
              background: radial-gradient(ellipse 120% 80% at 60% 50%,
                  rgba(155, 225, 93, 0.04) 0%,
                  rgba(74, 210, 149, 0.02) 45%,
                  transparent 75%);
              animation: gradientMove2 50s ease-in-out infinite reverse;
            }
          }

          @else {
            // Light Theme Gradients - auch etwas dunkler
            background: radial-gradient(ellipse 80% 50% at 30% 40%,
                rgba(38, 187, 119, 0.1) 0%,
                rgba(38, 187, 119, 0.05) 20%,
                rgba(23, 162, 184, 0.03) 40%,
                transparent 70%),
              radial-gradient(ellipse 60% 80% at 70% 60%,
                rgba(23, 162, 184, 0.1) 0%,
                rgba(23, 162, 184, 0.05) 25%,
                rgba(119, 205, 53, 0.03) 50%,
                transparent 75%),
              radial-gradient(ellipse 90% 70% at 50% 30%,
                rgba(119, 205, 53, 0.08) 0%,
                rgba(38, 187, 119, 0.04) 30%,
                transparent 80%);

            &::before {
              background: radial-gradient(ellipse 100% 60% at 20% 70%,
                  rgba(38, 187, 119, 0.06) 0%,
                  rgba(23, 162, 184, 0.03) 35%,
                  transparent 65%),
                radial-gradient(ellipse 70% 90% at 80% 20%,
                  rgba(23, 162, 184, 0.08) 0%,
                  rgba(119, 205, 53, 0.03) 40%,
                  transparent 70%);
              animation: gradientMove1 35s ease-in-out infinite;
            }

            &::after {
              background: radial-gradient(ellipse 120% 80% at 60% 50%,
                  rgba(119, 205, 53, 0.05) 0%,
                  rgba(38, 187, 119, 0.02) 45%,
                  transparent 75%);
              animation: gradientMove2 40s ease-in-out infinite reverse;
            }
          }
        }
      }

      animation: gradientFlow 30s ease-in-out infinite;
    }

    // Subtile schwebende Akzente (stark reduziert)
    .floating-shapes {
      position: absolute;
      width: 100%;
      height: 100%;
      opacity: 0.3; // Noch dunkler

      .shape {
        position: absolute;
        border-radius: 50%;
        filter: blur(100px); // Mehr Blur für weichere Kanten
        mix-blend-mode: screen;
        animation: gentleFloat 30s infinite ease-in-out;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            @if $theme =="dark" {
              background: radial-gradient(circle,
                  rgba(74, 210, 149, 0.04) 0%,
                  // Sehr dunkel
                  transparent 50%);
            }

            @else {
              background: radial-gradient(circle, rgba(38, 187, 119, 0.06) 0%, transparent 50%);
            }
          }
        }

        // Nur 3 sehr subtile Akzente
        @for $i from 1 through 3 {
          &:nth-child(#{$i}) {
            $size: 300px + $i * 100px;
            width: $size;
            height: $size;

            @if $i ==1 {
              left: -10%;
              top: 20%;
            }

            @else if $i ==2 {
              right: -10%;
              top: 50%;
            }

            @else {
              left: 40%;
              bottom: -20%;
            }

            animation-delay: $i * 10s;
            animation-duration: 40s+$i * 10s;
          }
        }

        &:nth-child(n + 4) {
          display: none;
        }
      }
    }

    // Sehr subtiles Gitter-Overlay
    .grid-overlay {
      position: absolute;
      width: 100%;
      height: 100%;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          @if $theme =="dark" {
            background-image: linear-gradient(rgba(74, 210, 149, 0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(74, 210, 149, 0.02) 1px, transparent 1px);
            opacity: 0.3; // Dunkler
          }

          @else {
            background-image: linear-gradient(rgba(38, 187, 119, 0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(38, 187, 119, 0.06) 1px, transparent 1px);
            opacity: 0.25;
          }
        }
      }

      background-size: 100px 100px; // Größeres Gitter
      animation: gridMove 60s linear infinite; // Langsamere Bewegung
    }
  }

  .auth-container {
    max-width: 500px;
    width: 100%;
    margin: 0px auto;
    transition: max-width 0.3s ease;
    backdrop-filter: blur(20px) saturate(150%);
    -webkit-backdrop-filter: blur(20px) saturate(150%);

    // Größerer Container für Register-Formular
    &.wide-container {
      max-width: 800px;
    }

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        @if $theme =="dark" {
          background-color: rgba(mixins.theme-color($theme, card-bg), 0.75); // Transparenter
          border: 1px solid rgba(mixins.theme-color($theme, border-medium), 0.8);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5),
            inset 0 0 0 1px rgba(mixins.theme-color($theme, border-light), 0.3),
            0 0 40px rgba(mixins.theme-color($theme, glow-green), 0.2); // Weniger Glow
        }

        @else {
          background-color: rgba(mixins.theme-color($theme, card-bg), 0.88);
          border: 1px solid rgba(mixins.theme-color($theme, border-medium), 0.9);
          box-shadow: 0 8px 32px 0 mixins.theme-color($theme, shadow-color),
            inset 0 0 0 1px mixins.theme-color($theme, border-light),
            0 0 40px rgba(mixins.theme-color($theme, glow-green), 0.3);
        }

        border-radius: map.get(map.get(vars.$layout, border-radius), large);
        overflow: hidden;
      }
    }
  }

  .tabs {
    display: flex;
    width: 100%;

    .tab {
      flex: 1;
      padding: map.get(vars.$spacing, m) 0;
      text-align: center;
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      cursor: pointer;
      border: none;
      transition: all map.get(vars.$transitions, default);
      position: relative;
      overflow: hidden;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, nav-item-bg);
          color: mixins.theme-color($theme, text-primary);

          &:hover:not(.active) {
            background-color: mixins.theme-color($theme, hover-color);
          }

          &.active {
            background: mixins.theme-gradient($theme, nav-active);
            color: white;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);

            &::before {
              content: "";
              position: absolute;
              top: 0;
              left: -100%;
              width: 100%;
              height: 100%;
              background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
              animation: shimmer 3s infinite;
            }

            &::after {
              content: "";
              position: absolute;
              bottom: 0;
              left: 0;
              width: 100%;
              height: 3px;
              background: mixins.theme-color($theme, accent-lime);
              box-shadow: 0 0 10px mixins.theme-color($theme, glow-lime);
            }
          }
        }
      }
    }
  }
}

// Animationen
@keyframes gradientFlow {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  25% {
    transform: translate(-10%, 5%) scale(1.05);
  }

  50% {
    transform: translate(5%, -10%) scale(0.98);
  }

  75% {
    transform: translate(10%, 8%) scale(1.02);
  }
}

@keyframes gradientMove1 {

  0%,
  100% {
    transform: translate(0, 0);
  }

  20% {
    transform: translate(15%, -10%);
  }

  40% {
    transform: translate(-20%, -5%);
  }

  60% {
    transform: translate(-10%, 15%);
  }

  80% {
    transform: translate(20%, 10%);
  }
}

@keyframes gradientMove2 {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  33% {
    transform: translate(-15%, 10%) scale(1.1);
  }

  66% {
    transform: translate(10%, -15%) scale(0.95);
  }
}

@keyframes gentleFloat {

  0%,
  100% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0.3;
  }

  25% {
    transform: translateY(-20px) translateX(10px) scale(1.05);
    opacity: 0.35;
  }

  50% {
    transform: translateY(10px) translateX(-15px) scale(0.98);
    opacity: 0.25;
  }

  75% {
    transform: translateY(-15px) translateX(5px) scale(1.02);
    opacity: 0.32;
  }
}

@keyframes gridMove {
  0% {
    transform: translate(0, 0);
  }

  100% {
    transform: translate(60px, 60px);
  }
}

@keyframes shimmer {
  100% {
    left: 100%;
  }
}

// Responsive
@media (max-width: 768px) {
  .login-register-page {
    .animated-background {
      .gradient-bg {

        &::before,
        &::after {
          animation-duration: 45s, 50s;
        }
      }

      .floating-shapes {
        .shape {
          filter: blur(60px);

          @for $i from 1 through 3 {
            &:nth-child(#{$i}) {
              $size: 200px + $i * 80px;
              width: $size;
              height: $size;
            }
          }
        }
      }

      .grid-overlay {
        background-size: 60px 60px;
      }
    }
  }

  .container {
    margin-top: 200px;
  }

  .auth-container {
    &.wide-container {
      max-width: 100%;
      margin: 20px;
    }
  }
}

// Performance-Optimierung
@media (prefers-reduced-motion: reduce) {
  .animated-background {

    .gradient-bg,
    .gradient-bg::before,
    .gradient-bg::after,
    .floating-shapes .shape,
    .grid-overlay {
      animation: none;
    }
  }

  .tab.active::before {
    animation: none;
  }
}
</style>
