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
        <!-- Modern Tab Switcher -->
        <div class="tabs-modern">
          <div class="tab-indicator" :style="{ transform: `translateX(${activeTab === 'register' ? '100%' : '0'})` }"></div>
          <button 
            class="tab-modern" 
            :class="{ active: activeTab === 'login' }" 
            @click="activeTab = 'login'"
          >
            <LockClosedIcon class="tab-icon" />
            <span>Anmelden</span>
          </button>
          <button 
            class="tab-modern" 
            :class="{ active: activeTab === 'register' }" 
            @click="activeTab = 'register'"
          >
            <UserPlusIcon class="tab-icon" />
            <span>Registrieren</span>
          </button>
        </div>

        <!-- Content Wrapper mit Transition -->
        <div class="content-wrapper">
          <Transition name="slide-fade" mode="out-in">
            <!-- Login Komponente -->
            <Login v-if="activeTab === 'login'" @login-success="handleLoginSuccess" key="login" />
            <!-- Register Komponente -->
            <Register v-else @register-success="handleRegisterSuccess" key="register" />
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { LockClosedIcon, UserPlusIcon } from "@heroicons/vue/24/outline";
import Login from "@/components/pages/LoginRegister/Login.vue";
import Register from "@/components/pages/LoginRegister/Register.vue";
import router from "@/router";

export default defineComponent({
  name: "LoginRegister",
  components: {
    Login,
    Register,
    LockClosedIcon,
    UserPlusIcon
  },
  setup() {
    const route = useRoute();
    const activeTab = ref("login");

    const handleRegisterSuccess = async () => await router.push("/member/dashboard");

    const handleLoginSuccess = async () => await router.push("/member/dashboard");

    onMounted(() => {
      // Bei Redirect-Parameter den Login-Tab aktivieren
      if (route.query.redirect) {
        activeTab.value = "login";
      }
    });

    return {
      activeTab,
      handleRegisterSuccess,
      handleLoginSuccess,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;

.login-register-page {
  margin-top: 40px;
  min-height: calc(100vh - 130px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
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

    // Basis-Layer
    &::before {
      content: "";
      position: absolute;
      width: 100%;
      height: 100%;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          @if $theme == "dark" {
            background: linear-gradient(135deg, 
              rgba(15, 36, 25, 0.95) 0%, 
              rgba(15, 36, 25, 0.85) 50%, 
              rgba(20, 46, 35, 0.9) 100%
            );
          } @else {
            background: linear-gradient(135deg, 
              rgba(248, 255, 249, 0.9) 0%, 
              rgba(245, 252, 246, 0.85) 50%, 
              rgba(240, 255, 242, 0.9) 100%
            );
          }
        }
      }

      z-index: 1;
    }

    // Gradient Animation
    .gradient-bg {
      position: absolute;
      width: 200%;
      height: 200%;
      top: -50%;
      left: -50%;

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
          @if $theme == "dark" {
            background: radial-gradient(
                ellipse 60% 40% at 20% 30%,
                rgba(74, 210, 149, 0.15) 0%,
                rgba(74, 210, 149, 0.08) 25%,
                rgba(53, 204, 208, 0.05) 50%,
                transparent 70%
              ),
              radial-gradient(
                ellipse 50% 60% at 80% 70%,
                rgba(53, 204, 208, 0.12) 0%,
                rgba(53, 204, 208, 0.06) 30%,
                rgba(155, 225, 93, 0.04) 60%,
                transparent 80%
              );
          } @else {
            background: radial-gradient(
                ellipse 60% 40% at 20% 30%,
                rgba(38, 187, 119, 0.2) 0%,
                rgba(38, 187, 119, 0.1) 25%,
                rgba(23, 162, 184, 0.05) 50%,
                transparent 70%
              ),
              radial-gradient(
                ellipse 50% 60% at 80% 70%,
                rgba(23, 162, 184, 0.15) 0%,
                rgba(23, 162, 184, 0.08) 30%,
                rgba(119, 205, 53, 0.05) 60%,
                transparent 80%
              );
          }
        }
      }

      animation: gradientRotate 20s ease-in-out infinite;
    }

    // Floating Shapes
    .floating-shapes {
      position: absolute;
      width: 100%;
      height: 100%;
      opacity: 0.6;

      .shape {
        position: absolute;
        border-radius: 50%;
        filter: blur(80px);
        animation: float 20s infinite ease-in-out;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            @if $theme == "dark" {
              background: radial-gradient(
                circle,
                rgba(74, 210, 149, 0.2) 0%,
                transparent 70%
              );
            } @else {
              background: radial-gradient(
                circle,
                rgba(38, 187, 119, 0.3) 0%,
                transparent 70%
              );
            }
          }
        }

        @for $i from 1 through 3 {
          &:nth-child(#{$i}) {
            $size: 200px + $i * 150px;
            width: $size;
            height: $size;

            @if $i == 1 {
              left: -10%;
              top: 10%;
            } @else if $i == 2 {
              right: -15%;
              top: 60%;
              animation-delay: 7s;
            } @else {
              left: 50%;
              bottom: -10%;
              animation-delay: 14s;
            }
          }
        }
      }
    }

    // Grid Overlay
    .grid-overlay {
      position: absolute;
      width: 100%;
      height: 100%;
      opacity: 0.15;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          @if $theme == "dark" {
            background-image: 
              linear-gradient(rgba(74, 210, 149, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(74, 210, 149, 0.1) 1px, transparent 1px);
          } @else {
            background-image: 
              linear-gradient(rgba(38, 187, 119, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(38, 187, 119, 0.15) 1px, transparent 1px);
          }
        }
      }

      background-size: 50px 50px;
      animation: gridSlide 40s linear infinite;
    }
  }

  // Auth Container
  .auth-container {
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(30px) saturate(200%);
    -webkit-backdrop-filter: blur(30px) saturate(200%);

    &.wide-container {
      max-width: 820px;
    }

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        @if $theme == "dark" {
          background: rgba(mixins.theme-color($theme, card-bg), 0.85);
          border: 1px solid rgba(mixins.theme-color($theme, border-medium), 0.5);
          box-shadow: 
            0 20px 50px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(mixins.theme-color($theme, border-light), 0.2),
            0 0 80px rgba(mixins.theme-color($theme, accent-green), 0.1);
        } @else {
          background: rgba(mixins.theme-color($theme, card-bg), 0.95);
          border: 1px solid rgba(mixins.theme-color($theme, border-medium), 0.3);
          box-shadow: 
            0 20px 50px rgba(0, 0, 0, 0.1),
            0 0 0 1px mixins.theme-color($theme, border-light),
            0 0 80px rgba(mixins.theme-color($theme, accent-green), 0.15);
        }

        border-radius: 20px;
        overflow: hidden;
      }
    }
  }

  // Modern Tabs
  .tabs-modern {
    display: flex;
    position: relative;
    padding: 0.5rem;
    margin: 0.5rem;
    border-radius: 16px;
    
    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background: mixins.theme-color($theme, secondary-bg);
      }
    }

    .tab-indicator {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      width: calc(50% - 0.5rem);
      height: calc(100% - 1rem);
      border-radius: 12px;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, primary);
          box-shadow: 0 4px 15px rgba(mixins.theme-color($theme, accent-green), 0.3);
        }
      }
    }

    .tab-modern {
      flex: 1;
      padding: 0.875rem 1.5rem;
      border: none;
      background: transparent;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      position: relative;
      z-index: 1;
      transition: all 0.3s ease;
      border-radius: 12px;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);

          &.active {
            color: white;
          }

          &:not(.active):hover {
            background: rgba(mixins.theme-color($theme, hover-color), 0.5);
          }
        }
      }

      .tab-icon {
        width: 20px;
        height: 20px;
        transition: transform 0.3s ease;
      }

      &.active .tab-icon {
        transform: scale(1.1);
      }
    }
  }

  // Content Wrapper
  .content-wrapper {
    position: relative;
    overflow: hidden;
  }
}

// Animations
@keyframes gradientRotate {
  0%, 100% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.2);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0) scale(1);
  }
  33% {
    transform: translateY(-30px) translateX(20px) scale(1.1);
  }
  66% {
    transform: translateY(20px) translateX(-10px) scale(0.95);
  }
}

@keyframes gridSlide {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(50px, 50px);
  }
}

// Slide Fade Transition
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  transform: translateX(30px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}

// Responsive
@media (max-width: 768px) {
  .login-register-page {
    padding: 1rem;
    
    .auth-container {
      &.wide-container {
        max-width: 100%;
      }
    }

    .tabs-modern {
      .tab-modern {
        padding: 0.75rem 1rem;
        font-size: 0.875rem;

        .tab-icon {
          width: 18px;
          height: 18px;
        }
      }
    }
  }
}

// Performance
@media (prefers-reduced-motion: reduce) {
  .animated-background {
    .gradient-bg,
    .floating-shapes .shape,
    .grid-overlay {
      animation: none;
    }
  }

  .tabs-modern .tab-indicator {
    transition: none;
  }
}
</style>