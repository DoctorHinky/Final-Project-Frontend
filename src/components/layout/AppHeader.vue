<!-- src/components/layout/AppHeader.vue -->
<template>
  <header class="app-header" :class="{ scrolled: isScrolled, 'mobile-open': isMobileMenuOpen }">
    <div class="header-container">
      <!-- Main Header Row -->
      <div class="header-main">
        <!-- Logo -->
        <div class="logo-wrapper">
          <router-link to="/" class="logo-link">
            <img src="@/assets/images/Logo.webp" alt="LearnToGrow Logo" class="logo-image" />
            <span class="logo-text">LearnToGrow</span>
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <nav class="desktop-nav" aria-label="Hauptnavigation">
          <ul class="nav-list">
            <li v-for="(item, index) in navItems" :key="index" class="nav-item">
              <a
                :href="`#${item.id}`"
                class="nav-link"
                :class="{ active: activeSection === index }"
                @click.prevent="navigateToSection(item.id, index)"
                :aria-current="activeSection === index ? 'page' : undefined"
              >
                <component :is="item.icon" class="nav-icon" />
                <span class="nav-text">{{ item.name }}</span>
                <span class="nav-indicator"></span>
              </a>
            </li>
          </ul>
        </nav>

        <!-- Header Actions -->
        <div class="header-actions">
          <!-- Theme Toggle -->
          <ThemeToggle :is-light-theme="isLightTheme" @toggle="toggleTheme" />

          <!-- CTA Button -->
          <router-link to="/login-register" class="cta-button desktop-only">
            <span class="cta-text">Jetzt starten</span>
            <ArrowRightIcon class="cta-icon" />
          </router-link>

          <!-- Mobile Menu Toggle -->
          <button
            class="mobile-menu-toggle"
            @click="toggleMobileMenu"
            :aria-expanded="isMobileMenuOpen"
            aria-label="Menü öffnen"
          >
            <span class="menu-icon">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="scroll-progress">
        <div class="progress-bar" :style="{ width: scrollProgress + '%' }"></div>
      </div>
    </div>

    <!-- Mobile Menu Overlay -->
    <Transition name="mobile-menu">
      <div v-if="isMobileMenuOpen" class="mobile-menu-overlay" @click.self="closeMobileMenu">
        <div class="mobile-menu-content">
          <!-- Mobile Menu Header -->
          <div class="mobile-menu-header">
            <img
              src="@/assets/images/Logo.webp"
              alt="LearnToGrow Logo"
              class="logo-image"
              style="width: 40px; height: 40px; border-radius: 10px; object-fit: cover"
            />
            <h2 class="mobile-menu-title">Lern To Grow</h2>
            <button class="close-btn" @click="closeMobileMenu" aria-label="Menü schließen">
              <XMarkIcon class="close-icon" />
            </button>
          </div>

          <!-- Mobile Navigation -->
          <nav class="mobile-nav" aria-label="Mobile Navigation">
            <ul class="mobile-nav-list">
              <li v-for="(item, index) in navItems" :key="index" class="mobile-nav-item">
                <a
                  :href="`#${item.id}`"
                  class="mobile-nav-link"
                  :class="{ active: activeSection === index }"
                  @click="handleMobileNavClick(item.id, index)"
                >
                  <div class="link-content">
                    <component :is="item.icon" class="mobile-nav-icon" />
                    <div class="link-text">
                      <span class="link-title">{{ item.name }}</span>
                      <span class="link-description">{{ item.description }}</span>
                    </div>
                  </div>
                  <ChevronRightIcon class="link-arrow" />
                </a>
              </li>
            </ul>
          </nav>

          <!-- Mobile Menu Footer -->
          <div class="mobile-menu-footer">
            <div class="theme-switcher">
              <span class="switcher-label">Design-Modus</span>
              <div class="theme-toggle-mobile">
                <ThemeToggle :is-light-theme="isLightTheme" @toggle="toggleTheme" />
              </div>
            </div>

            <router-link to="/login-register" class="mobile-cta-button" @click="closeMobileMenu">
              <UserCircleIcon class="cta-icon" />
              <span>Kostenlos registrieren</span>
            </router-link>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  HomeIcon,
  RocketLaunchIcon,
  PuzzlePieceIcon,
  UserGroupIcon,
  PencilSquareIcon,
  EyeIcon,
  ArrowRightIcon,
  XMarkIcon,
  ChevronRightIcon,
  UserCircleIcon,
} from "@heroicons/vue/24/outline";
import ThemeToggle from "../ui/ThemeToggle.vue";

export interface NavItem {
  name: string;
  id: string;
  icon: any;
  description: string;
}

export default defineComponent({
  name: "AppHeader",
  components: {
    ThemeToggle,
    HomeIcon,
    RocketLaunchIcon,
    PuzzlePieceIcon,
    UserGroupIcon,
    PencilSquareIcon,
    EyeIcon,
    ArrowRightIcon,
    XMarkIcon,
    ChevronRightIcon,
    UserCircleIcon,
  },
  props: {
    isLightTheme: {
      type: Boolean,
      required: true
    }
  },
  emits: ['toggle-theme', 'tab-change'],
  setup(_, { emit }) {
    const router = useRouter();
    const route = useRoute();

    // State
    const activeSection = ref(0);
    const isScrolled = ref(false);
    const scrollProgress = ref(0);
    const isMobileMenuOpen = ref(false);
    const isNavigating = ref(false);

    // Navigation Items
    const navItems: NavItem[] = [
      {
        name: "Start",
        id: "hero",
        icon: HomeIcon,
        description: "Zurück zum Anfang",
      },
      {
        name: "Mission",
        id: "content",
        icon: RocketLaunchIcon,
        description: "Unsere Vision & Werte",
      },
      {
        name: "Quiz",
        id: "quiz",
        icon: PuzzlePieceIcon,
        description: "Teste dein Wissen",
      },
      {
        name: "Community",
        id: "community",
        icon: UserGroupIcon,
        description: "Werde Teil der Familie",
      },
      {
        name: "Autoren",
        id: "Authors",
        icon: PencilSquareIcon,
        description: "Lerne unser Team kennen",
      },
      {
        name: "Entdecken",
        id: "sub",
        icon: EyeIcon,
        description: "Artikel & Geschichten",
      },
    ];

    // Computed
    const headerHeight = computed(() => {
      return window.innerWidth > 768 ? 80 : 70;
    });

    // Methods
    const updateScrollProgress = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      scrollProgress.value = scrolled;

      // Update isScrolled state
      isScrolled.value = winScroll > 50;
    };

    const updateActiveSection = () => {
      if (isNavigating.value) return;

      const scrollPosition = window.scrollY + headerHeight.value + 100;

      // Find current section
      for (let i = navItems.length - 1; i >= 0; i--) {
        const section = document.getElementById(navItems[i].id);
        if (section && scrollPosition >= section.offsetTop) {
          if (activeSection.value !== i) {
            activeSection.value = i;
            emit("tab-change", i);
          }
          break;
        }
      }
    };

    const navigateToSection = async (sectionId: string, index: number) => {
      isNavigating.value = true;
      activeSection.value = index;
      emit("tab-change", index);

      // Check if we're on the home page
      if (route.path !== "/") {
        await router.push("/");
        // Wait for page to load
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Scroll to section
      const element = document.getElementById(sectionId);
      if (element) {
        const offsetTop = element.offsetTop - headerHeight.value;
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      }

      // Reset navigation flag
      setTimeout(() => {
        isNavigating.value = false;
      }, 1000);
    };

    const toggleTheme = () => {
      emit("toggle-theme");
    };

    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value;
      // Prevent body scroll when menu is open
      document.body.style.overflow = isMobileMenuOpen.value ? "hidden" : "";
    };

    const closeMobileMenu = () => {
      isMobileMenuOpen.value = false;
      document.body.style.overflow = "";
    };

    const handleMobileNavClick = (sectionId: string, index: number) => {
      navigateToSection(sectionId, index);
      closeMobileMenu();
    };

    // Scroll handler
    const handleScroll = () => {
      requestAnimationFrame(() => {
        updateScrollProgress();
        updateActiveSection();
      });
    };

    // Lifecycle
    onMounted(() => {
      window.addEventListener("scroll", handleScroll, { passive: true });
      // Initial update
      updateScrollProgress();
      updateActiveSection();
    });

    onUnmounted(() => {
      window.removeEventListener("scroll", handleScroll);
      document.body.style.overflow = "";
    });

    // Watch route changes
    watch(
      () => route.path,
      () => {
        if (route.path === "/") {
          setTimeout(() => {
            updateActiveSection();
          }, 100);
        }
      }
    );

    return {
      navItems,
      activeSection,
      isScrolled,
      scrollProgress,
      isMobileMenuOpen,
      navigateToSection,
      toggleTheme,
      toggleMobileMenu,
      closeMobileMenu,
      handleMobileNavClick,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;
@use "sass:map";

// Header Container
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid rgba(mixins.theme-color($theme, border-light), 0.1);
    }
  }

  &.scrolled {
    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
      }
    }
  }

  &.mobile-open {
    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background: mixins.theme-color($theme, bg-primary);
      }
    }
  }
}

.header-container {
  position: relative;
  max-width: 1400px;
  margin: 0 auto;
}

// Main Header Row
.header-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  height: 80px;

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    height: 70px;
  }
}

// Logo
.logo-wrapper {
  flex-shrink: 0;

  .logo-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-2px);
    }
  }

  .logo-image {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    object-fit: cover;

    @media (max-width: 768px) {
      width: 40px;
      height: 40px;
    }
  }

  .logo-text {
    font-size: 1.25rem;
    font-weight: map.get(map.get(vars.$fonts, weights), bold);

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
      }
    }

    @media (max-width: 480px) {
      display: none;
    }
  }
}

// Desktop Navigation
.desktop-nav {
  display: none;

  @media (min-width: 1025px) {
    display: block;
  }

  .nav-list {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nav-link {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    border-radius: 12px;
    text-decoration: none;
    font-weight: map.get(map.get(vars.$fonts, weights), medium);
    font-size: 0.95rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);

        &:hover {
          color: mixins.theme-color($theme, text-primary);
          background: rgba(mixins.theme-color($theme, accent-green), 0.1);
        }

        &.active {
          color: mixins.theme-color($theme, text-primary);
          background: rgba(mixins.theme-color($theme, accent-green), 0.15);
        }
      }
    }

    .nav-icon {
      width: 18px;
      height: 18px;
      transition: transform 0.3s ease;
    }

    .nav-text {
      position: relative;
    }

    .nav-indicator {
      position: absolute;
      bottom: -2px;
      left: 50%;
      transform: translateX(-50%) scaleX(0);
      width: 30px;
      height: 3px;
      border-radius: 2px;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, primary);
        }
      }
    }

    &:hover .nav-icon {
      transform: translateY(-2px);
    }

    &.active .nav-indicator {
      transform: translateX(-50%) scaleX(1);
    }
  }
}

// Header Actions
.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

// CTA Button
.cta-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: map.get(map.get(vars.$fonts, weights), medium);
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background: mixins.theme-gradient($theme, primary);
      color: white;
      box-shadow: 0 4px 15px rgba(mixins.theme-color($theme, accent-green), 0.3);

      &::before {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: translate(-50%, -50%);
        transition: width 0.6s, height 0.6s;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(mixins.theme-color($theme, accent-green), 0.4);

        &::before {
          width: 300px;
          height: 300px;
        }

        .cta-icon {
          transform: translateX(3px);
        }
      }
    }
  }

  .cta-text {
    position: relative;
    z-index: 1;
  }

  .cta-icon {
    width: 16px;
    height: 16px;
    position: relative;
    z-index: 1;
    transition: transform 0.3s ease;
  }
}

// Mobile Menu Toggle
.mobile-menu-toggle {
  display: none;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;

  @media (max-width: 1024px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background: rgba(mixins.theme-color($theme, secondary-bg), 0.8);

      &:hover {
        background: mixins.theme-color($theme, secondary-bg);
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }

  .menu-icon {
    width: 24px;
    height: 18px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    span {
      display: block;
      width: 100%;
      height: 2px;
      border-radius: 2px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: mixins.theme-color($theme, text-primary);
        }
      }
    }

    .mobile-open & {
      span:nth-child(1) {
        transform: translateY(8px) rotate(45deg);
      }

      span:nth-child(2) {
        opacity: 0;
        transform: translateX(-20px);
      }

      span:nth-child(3) {
        transform: translateY(-8px) rotate(-45deg);
      }
    }
  }
}

// Progress Bar
.scroll-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background: rgba(mixins.theme-color($theme, border-light), 0.2);
    }
  }

  .progress-bar {
    height: 100%;
    transition: width 0.1s linear;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background: mixins.theme-gradient($theme, primary);
      }
    }
  }
}

// Mobile Menu Overlay
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1100;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(5px);
    }
  }
}

.mobile-menu-content {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  backdrop-filter: blur(20px);
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.85);

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background: mixins.theme-color($theme, bg-primary);
      box-shadow: -10px 0 40px rgba(0, 0, 0, 0.2);
    }
  }

  @media (max-width: 480px) {
    max-width: 100%;
  }

  @media (max-width: 360px) {
    max-width: 85%;
  }
}

// Mobile Menu Header
.mobile-menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      border-bottom: 1px solid mixins.theme-color($theme, border-light);
    }
  }

  .mobile-menu-title {
    font-size: 1.25rem;
    font-weight: map.get(map.get(vars.$fonts, weights), bold);
    margin: 0;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
      }
    }
  }

  .close-btn {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background: rgba(mixins.theme-color($theme, secondary-bg), 0.8);
        color: mixins.theme-color($theme, text-primary);

        &:hover {
          background: mixins.theme-color($theme, secondary-bg);
          transform: rotate(90deg);
        }

        &:active {
          transform: rotate(90deg) scale(0.9);
        }
      }
    }

    .close-icon {
      width: 24px;
      height: 24px;
    }
  }
}

// Mobile Navigation
.mobile-nav {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;

  .mobile-nav-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .mobile-nav-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-radius: 12px;
    text-decoration: none;
    transition: all 0.3s ease;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);

        &:hover,
        &:focus {
          background: rgba(mixins.theme-color($theme, secondary-bg), 0.8);
          transform: translateX(-5px);
        }

        &:active {
          transform: translateX(-3px) scale(0.98);
        }

        &.active {
          background: rgba(mixins.theme-color($theme, accent-green), 0.1);
          border-left: 3px solid mixins.theme-color($theme, accent-green);

          .mobile-nav-icon {
            color: mixins.theme-color($theme, accent-green);
          }
        }
      }
    }

    .link-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .mobile-nav-icon {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }

    .link-text {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .link-title {
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      font-size: 1rem;
    }

    .link-description {
      font-size: 0.875rem;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }

    .link-arrow {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      transition: transform 0.3s ease;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-tertiary);
        }
      }
    }

    &:hover .link-arrow {
      transform: translateX(3px);
    }
  }
}

// Mobile Menu Footer
.mobile-menu-footer {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      border-top: 1px solid mixins.theme-color($theme, border-light);
      background: rgba(mixins.theme-color($theme, secondary-bg), 0.3);
    }
  }

  .theme-switcher {
    .switcher-label {
      display: block;
      font-size: 0.875rem;
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      margin-bottom: 0.75rem;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }

    .theme-toggle-mobile {
      display: flex;
      justify-content: center;
    }
  }

  .mobile-cta-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 12px;
    text-decoration: none;
    font-weight: map.get(map.get(vars.$fonts, weights), bold);
    font-size: 1rem;
    transition: all 0.3s ease;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background: mixins.theme-gradient($theme, primary);
        color: white;
        box-shadow: 0 4px 15px rgba(mixins.theme-color($theme, accent-green), 0.3);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(mixins.theme-color($theme, accent-green), 0.4);
        }

        &:active {
          transform: scale(0.98);
        }
      }
    }

    .cta-icon {
      width: 24px;
      height: 24px;
    }
  }
}

// Transitions
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 0.4s ease;

  .mobile-menu-content {
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;

  .mobile-menu-content {
    transform: translateX(100%);
  }
}

// Utility Classes
.desktop-only {
  @media (max-width: 1024px) {
    display: none !important;
  }
}

// Accessibility
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

// Print styles
@media print {
  .app-header {
    display: none;
  }
}

// Performance optimizations for mobile
@media (max-width: 768px) {
  .app-header {
    will-change: transform;
  }

  .mobile-menu-content {
    will-change: transform;
    -webkit-overflow-scrolling: touch;
  }
}
</style>
