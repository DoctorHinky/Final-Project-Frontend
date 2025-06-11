<!-- src/components/layout/AppHeader.vue -->
<template>
  <header class="app-header container">
    <div class="header-top">
      <div class="logo">
        <!-- Logo als Link zur Hauptseite -->
        <router-link to="/">
          <img src="@/assets/images/Logo.png" alt="Logo" class="logo-image" />
        </router-link>
      </div>

      <!-- Desktop Header Actions -->
      <div class="header-actions desktop-only">
        <ThemeToggle :is-light-theme="isLightTheme" @toggle="toggleTheme" />
        <router-link to="/login-register" class="login-button">Anmelden</router-link>
      </div>

      <!-- Mobile Hamburger Menu -->
      <button class="hamburger-menu mobile-only" :class="{ active: isMobileMenuOpen }" @click="toggleMobileMenu"
        aria-label="Navigation öffnen">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>

    <!-- Desktop Navigation -->
    <nav class="nav-tabs desktop-only">
      <a v-for="(tab, index) in tabs" :key="index" class="nav-tab" :class="{ active: activeTab === index }"
        @click="scrollToSection(tab.id, index)" href="javascript:void(0);">
        {{ tab.name }}
      </a>
    </nav>

    <!-- Mobile Navigation Overlay -->
    <transition name="slide-down">
      <div v-if="isMobileMenuOpen" class="mobile-menu-overlay">
        <nav class="mobile-nav">
          <a v-for="(tab, index) in tabs" :key="index" class="mobile-nav-item" :class="{ active: activeTab === index }"
            @click="handleMobileNavClick(tab.id, index)">
            <component :is="tab.icon" class="nav-icon" />
            {{ tab.name }}
          </a>

          <div class="mobile-actions">
            <div class="theme-toggle-wrapper">
              <span class="action-label">Design</span>
              <ThemeToggle :is-light-theme="isLightTheme" @toggle="toggleTheme" />
            </div>
            <router-link to="/login-register" class="mobile-login-button" @click="closeMobileMenu">
              <UserIcon class="login-icon" />
              Anmelden
            </router-link>
          </div>
        </nav>
      </div>
    </transition>
  </header>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, computed, watch } from 'vue';
import ThemeToggle from '../ui/ThemeToggle.vue';
import { useRouter, useRoute } from 'vue-router';
import {
  InformationCircleIcon,
  BriefcaseIcon,
  PuzzlePieceIcon,
  UserGroupIcon,
  PencilIcon,
  EnvelopeIcon,
  UserIcon
} from '@heroicons/vue/24/outline';

export default defineComponent({
  name: 'AppHeader',
  components: {
    ThemeToggle,
    InformationCircleIcon,
    BriefcaseIcon,
    PuzzlePieceIcon,
    UserGroupIcon,
    PencilIcon,
    EnvelopeIcon,
    UserIcon
  },
  props: {
    isLightTheme: {
      type: Boolean,
      required: true
    }
  },
  emits: ['tab-change', 'toggle-theme'],
  setup(_, { emit }) {
    const activeTab = ref(0);
    const router = useRouter();
    const route = useRoute();
    const isMobileMenuOpen = ref(false);
    const isScrolling = ref(false);
    const scrollTimeout = ref<number | null>(null);
    const sectionPositions = ref<Array<{ id: string; top: number; bottom: number }>>([]);

    const tabs = [
      { name: 'Über', id: 'hero', icon: InformationCircleIcon },
      { name: 'Mission', id: 'content', icon: BriefcaseIcon },
      { name: 'Quiz', id: 'quiz', icon: PuzzlePieceIcon },
      { name: 'Community', id: 'community', icon: UserGroupIcon },
      { name: 'Autoren', id: 'Authors', icon: PencilIcon },
      { name: 'Newsletter', id: 'sub', icon: EnvelopeIcon }
    ];

    // Berechnet die Header-Höhe basierend auf der Bildschirmgröße
    const headerOffset = computed(() => window.innerWidth > 768 ? 130 : 80);

    // Aktualisiert die Positionen aller Sektionen
    const updateSectionPositions = () => {
      sectionPositions.value = tabs.map(tab => {
        const element = document.getElementById(tab.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          return {
            id: tab.id,
            top: rect.top + scrollTop - headerOffset.value - 20, // 20px zusätzlicher Puffer
            bottom: rect.bottom + scrollTop - headerOffset.value
          };
        }
        return { id: tab.id, top: 0, bottom: 0 };
      });
    };

    // Bestimmt die aktive Sektion basierend auf der Scroll-Position
    const determineActiveSection = () => {
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Spezialfall: Ganz unten auf der Seite
      if (scrollPosition + windowHeight >= documentHeight - 50) {
        const lastIndex = tabs.length - 1;
        if (activeTab.value !== lastIndex) {
          activeTab.value = lastIndex;
          emit('tab-change', lastIndex);
        }
        return;
      }

      // Finde die aktuelle Sektion
      for (let i = sectionPositions.value.length - 1; i >= 0; i--) {
        const section = sectionPositions.value[i];
        if (scrollPosition >= section.top) {
          if (activeTab.value !== i) {
            activeTab.value = i;
            emit('tab-change', i);
          }
          break;
        }
      }

      // Spezialfall: Ganz oben auf der Seite
      if (scrollPosition < sectionPositions.value[0]?.top) {
        if (activeTab.value !== 0) {
          activeTab.value = 0;
          emit('tab-change', 0);
        }
      }
    };

    // Optimierter Scroll-Handler mit Debouncing
    const handleScroll = () => {
      if (!isScrolling.value) {
        requestAnimationFrame(determineActiveSection);
      }

      // Clear existing timeout
      if (scrollTimeout.value) {
        clearTimeout(scrollTimeout.value);
      }

      // Set scrolling timeout
      scrollTimeout.value = window.setTimeout(() => {
        isScrolling.value = false;
      }, 150);
    };

    // Scroll zu einer spezifischen Sektion
    const scrollToSection = (sectionId: string, index: number) => {
      isScrolling.value = true;
      activeTab.value = index;

      // Überprüfen, ob wir uns auf der Homepage befinden
      if (route.path !== '/') {
        // Wenn nicht, zuerst zur Homepage navigieren
        router.push('/').then(() => {
          // Kleine Verzögerung, um sicherzustellen, dass die Komponente gemountet ist
          setTimeout(() => {
            scrollToElement(sectionId);
          }, 100);
        });
      } else {
        // Direkt zum Element scrollen, wenn wir bereits auf der Homepage sind
        scrollToElement(sectionId);
      }

      // Event für andere Komponenten emittieren
      emit('tab-change', index);
    };

    const scrollToElement = (sectionId: string) => {
      const element = document.getElementById(sectionId);
      if (element) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset.value;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Scroll-Tracking nach dem Smooth-Scroll wieder aktivieren
        setTimeout(() => {
          isScrolling.value = false;
          updateSectionPositions();
        }, 800);
      }
    };

    const toggleTheme = () => {
      emit('toggle-theme');
    };

    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value;
      document.body.style.overflow = isMobileMenuOpen.value ? 'hidden' : '';
    };

    const closeMobileMenu = () => {
      isMobileMenuOpen.value = false;
      document.body.style.overflow = '';
    };

    const handleMobileNavClick = (sectionId: string, index: number) => {
      scrollToSection(sectionId, index);
      closeMobileMenu();
    };

    // Resize-Handler für responsive Anpassungen
    const handleResize = () => {
      if (window.innerWidth > 768 && isMobileMenuOpen.value) {
        closeMobileMenu();
      }
      // Sektionspositionen bei Resize neu berechnen
      updateSectionPositions();
    };

    // Intersection Observer für präziseres Tracking (optional, aber performanter)
    const setupIntersectionObserver = () => {
      const options = {
        rootMargin: `-${headerOffset.value}px 0px -50% 0px`,
        threshold: [0, 0.25, 0.5, 0.75, 1]
      };

      const observer = new IntersectionObserver((entries) => {
        if (isScrolling.value) return;

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const index = tabs.findIndex(tab => tab.id === entry.target.id);
            if (index !== -1 && activeTab.value !== index) {
              activeTab.value = index;
              emit('tab-change', index);
            }
          }
        });
      }, options);

      // Beobachte alle Sektionen
      tabs.forEach(tab => {
        const element = document.getElementById(tab.id);
        if (element) {
          observer.observe(element);
        }
      });

      return observer;
    };

    // Route-Watcher für Navigation zwischen Seiten
    watch(() => route.path, (newPath) => {
      if (newPath === '/') {
        // Wenn zur Homepage navigiert wird, Positionen aktualisieren
        setTimeout(() => {
          updateSectionPositions();
          determineActiveSection();
        }, 100);
      }
    });

    onMounted(() => {
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize);

      // Initial positions update
      setTimeout(() => {
        updateSectionPositions();
        determineActiveSection();
      }, 100);

      // Optional: Intersection Observer für noch bessere Performance
      const observer = setupIntersectionObserver();

      // Cleanup function
      onUnmounted(() => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        document.body.style.overflow = '';
        if (scrollTimeout.value) {
          clearTimeout(scrollTimeout.value);
        }
        observer.disconnect();
      });
    });

    return {
      activeTab,
      tabs,
      scrollToSection,
      toggleTheme,
      isMobileMenuOpen,
      toggleMobileMenu,
      closeMobileMenu,
      handleMobileNavClick
    };
  }
});
</script>

<style lang="scss">
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;

.app-header {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%) translateY(-100px);
  width: 100%;
  padding: map.get(vars.$spacing, m) 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 20px;
  user-select: none;
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  background-color: rgba(255, 255, 255, 0.65);
  opacity: 0;
  animation: navbar-slide-down 2s cubic-bezier(0.23, 1, 0.32, 1) forwards;

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      background-color: if($theme =='light', rgba(255, 255, 255, 0.65), rgba(30, 30, 30, 0.45));
      box-shadow: 0 2px 8px rgba(mixins.theme-color($theme, shadow-color), 0.1);
      transition: all 0.4s ease-out;
    }
  }

  // Container für Logo und Header-Actions
  .header-top {
    @include mixins.flex(row, space-between, center, nowrap);
    padding: 10px map.get(vars.$spacing, m) 0;
  }

  // Header Actions Container
  .header-actions {
    @include mixins.flex(row, flex-end, center, nowrap);
    gap: map.get(vars.$spacing, m);
  }

  .logo {
    position: relative;
    display: flex;
    align-items: center;

    a {
      display: flex;
      align-items: center;
    }

    .logo-image {
      height: 60px;
      width: auto;
      border-radius: 50px;
      object-fit: contain;
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.05);
      }
    }

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        &::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 100%;
          height: 2px;
          background: mixins.theme-gradient($theme, primary);
          border-radius: 2px;
        }
      }
    }
  }

  // Login Button
  .login-button {
    display: inline-block;
    text-decoration: none;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        @include mixins.button-style($theme, 'small', true);
      }
    }
  }
}

@keyframes navbar-slide-down {
  0% {
    transform: translateX(-50%) translateY(-100px);
    opacity: 0;
  }

  100% {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

// Desktop Navigation
.nav-tabs {
  font-family: "Comic Sans MS", sans-serif;
  @include mixins.flex(row, center, center, wrap);
  gap: map.get(vars.$spacing, m);
  margin-bottom: map.get(vars.$spacing, s);
  padding: 1rem;

  .nav-tab {
    display: flex;
    justify-content: center;
    position: relative;
    overflow: hidden;
    padding: map.get(vars.$spacing, s) map.get(vars.$spacing, xl);
    border-radius: map.get(map.get(vars.$layout, border-radius), pill);
    font-weight: map.get(map.get(vars.$fonts, weights), bold);
    font-size: map.get(map.get(vars.$fonts, sizes), small);
    cursor: pointer;
    background: transparent;
    text-decoration: none;
    transition: all 0.3s;
    width: 150px;
    height: 40px;
    align-items: center;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, nav-item-bg);
        color: mixins.theme-color($theme, text-primary);
        border: 2px solid mixins.theme-color($theme, border-light);
        @include mixins.shadow('small', $theme);

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left map.get(vars.$transitions, slow);
        }

        &:hover,
        &.active {
          background: mixins.theme-gradient($theme, nav-active);
          color: rgba(26, 26, 26, 0.59);
          transform: scale(1.05);
          @include mixins.glow('green', 'medium', $theme);
          border-color: transparent;
          transition: 0.5s;
        }

        &:hover::before {
          left: 100%;
        }
      }
    }
  }
}

// Hamburger Menu Button
.hamburger-menu {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 30px;
  height: 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 10;

  span {
    width: 100%;
    height: 3px;
    border-radius: 10px;
    transition: all 0.3s linear;
    position: relative;
    transform-origin: 1px;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, text-primary);
      }
    }
  }

  &.active {
    span:first-child {
      transform: rotate(45deg);
    }

    span:nth-child(2) {
      opacity: 0;
      transform: translateX(20px);
    }

    span:nth-child(3) {
      transform: rotate(-45deg);
    }
  }
}

// Mobile Menu Overlay
.mobile-menu-overlay {
  position: fixed;
  top: 50px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99999;
  display: block !important; // Sicherstellen, dass es sichtbar ist

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, primary-bg);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
  }
}

.mobile-nav {
  padding: map.get(vars.$spacing, xl) map.get(vars.$spacing, m);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: map.get(vars.$spacing, m);
  margin-top: 50px;

  height: 100vh;

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      color: mixins.theme-color($theme, text-primary);
      background-color: mixins.theme-color($theme, nav-item-bg);
      border: 2px solid transparent;
    }
  }

  .mobile-nav-item {
    display: flex;
    align-items: center;
    gap: map.get(vars.$spacing, m);
    padding: map.get(vars.$spacing, m) map.get(vars.$spacing, l);
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);
    text-decoration: none;
    font-weight: map.get(map.get(vars.$fonts, weights), medium);
    font-size: map.get(map.get(vars.$fonts, sizes), base);
    transition: all 0.3s ease;
    cursor: pointer;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
        background-color: mixins.theme-color($theme, nav-item-bg);
        border: 2px solid transparent;

        &:hover,
        &:active,
        &.active {
          background: mixins.theme-gradient($theme, nav-active);
          color: rgba(26, 26, 26, 0.59);
          border-color: mixins.theme-color($theme, accent);
          transform: translateX(10px);
        }
      }
    }

    .nav-icon {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }
  }

  .mobile-actions {
    margin-top: map.get(vars.$spacing, xl);
    padding-top: map.get(vars.$spacing, xl);
    display: flex;
    flex-direction: column;
    gap: map.get(vars.$spacing, l);

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        border-top: 2px solid mixins.theme-color($theme, border-light);
      }
    }

    .theme-toggle-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 map.get(vars.$spacing, l);

      .action-label {
        font-weight: map.get(map.get(vars.$fonts, weights), medium);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }
    }

    .mobile-login-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: map.get(vars.$spacing, m);
      padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      text-decoration: none;
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      transition: all 0.3s ease;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, primary);
          color: white;
          @include mixins.shadow('medium', $theme);

          &:active {
            transform: scale(0.95);
          }
        }
      }

      .login-icon {
        width: 20px;
        height: 20px;
      }
    }
  }
}

// Animations
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-out;
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

// Utility Classes
.desktop-only {
  display: flex;
}

.mobile-only {
  display: none;
}

// Responsive Design
@media (max-width: 768px) {
  .app-header {
    padding: map.get(vars.$spacing, s) 0;
    border-radius: 0 0 20px 20px;
    width: 100%;
    position: fixed;
    left: 50%;
    transform: translateX(-50%); // Zentriert das Header-Element auf Mobile

    .header-top {
      padding: 5px map.get(vars.$spacing, m);
      margin-bottom: 0;
    }

    .logo-image {
      height: 45px !important;
    }
  }

  .desktop-only {
    display: none !important;
  }

  .mobile-only {
    display: flex !important;
  }

  .hamburger-menu {
    display: flex;
  }
}

@media (max-width: 480px) {
  .app-header {
    .logo-image {
      height: 40px !important;
    }
  }

  .mobile-nav {
    padding: map.get(vars.$spacing, m);

    .mobile-nav-item {
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);

      .nav-icon {
        width: 20px;
        height: 20px;
      }
    }
  }
}

// Tablet specific adjustments
@media (min-width: 481px) and (max-width: 768px) {
  .nav-tabs {
    gap: map.get(vars.$spacing, s);
    padding: map.get(vars.$spacing, s);

    .nav-tab {
      width: 120px;
      font-size: 0.875rem;
      padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, m);
    }
  }
}
</style>