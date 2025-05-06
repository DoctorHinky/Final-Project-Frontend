<!-- src/components/layout/AppHeader.vue -->
<template>
  <header class="app-header container">
    <div class="header-top">
      <div class="logo">{{ siteName }}</div>
      <div class="header-actions">
        <ThemeToggle :is-light-theme="isLightTheme" @toggle="toggleTheme" />
        <router-link to="/login-register" class="login-button">Anmelden</router-link>
      </div>
    </div>

    <nav class="nav-tabs">
      <a v-for="(tab, index) in tabs" :key="index" class="nav-tab" :class="{ active: activeTab === index }"
        @click="scrollToSection(tab.id, index)" href="javascript:void(0);">
        {{ tab.name }}
      </a>
    </nav>
  </header>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import ThemeToggle from '../ui/ThemeToggle.vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'AppHeader',
  components: {
    ThemeToggle
  },
  props: {
    siteName: {
      type: String,
      required: true
    },
    isLightTheme: {
      type: Boolean,
      required: true
    }
  },
  emits: ['tab-change', 'toggle-theme'],
  setup(props, { emit }) {
    const activeTab = ref(0);
    const router = useRouter();

    const tabs = [
      { name: 'Über', id: 'hero' },
      { name: 'Was wir tun', id: 'content' },
      { name: 'Quiz', id: 'quiz' },
      { name: 'Community', id: 'community' },
      { name: 'Über Autoren', id: 'Authors' },
      { name: 'Newsletter', id: 'sub' }
    ];

    const scrollToSection = (sectionId: string, index: number) => {
      activeTab.value = index;

      // Überprüfen, ob wir uns auf der Homepage befinden
      if (router.currentRoute.value.path !== '/') {
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
        // Den Header-Offset beim Scrollen berücksichtigen
        const headerOffset = 130; // Muss konsistent mit dem Layout-Padding-Top sein
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    };

    const toggleTheme = () => {
      // Event an übergeordnete Komponente weiterleiten
      emit('toggle-theme');
    };

    return {
      activeTab,
      tabs,
      scrollToSection,
      toggleTheme
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
  transform: translateX(-50%);
  width: 100%;
  padding: map.get(vars.$spacing, m) 0;
  z-index: 1000;
  height: 130px;
  /* Feste Höhe für den Header, konsistent mit dem Layout-Padding */
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, primary-bg);
      /* Hintergrund hinzufügen */
      box-shadow: 0 2px 8px rgba(mixins.theme-color($theme, shadow-color), 0.1);
      /* Schatten für bessere Sichtbarkeit */
    }
  }

  // Container für Logo und Header-Actions
  .header-top {
    @include mixins.flex(row, space-between, center, nowrap);
    margin-bottom: map.get(vars.$spacing, s);
    padding-top: 10px;
  }

  // Neuer Container für Theme-Toggle und Login-Button
  .header-actions {
    @include mixins.flex(row, flex-end, center, nowrap);
    gap: map.get(vars.$spacing, m);
  }

  .logo {
    font-size: map.get(map.get(vars.$fonts, sizes), xxl);
    font-weight: map.get(map.get(vars.$fonts, weights), bold);
    position: relative;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        @include mixins.text-gradient('primary', $theme);

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

  // Styling für den Login-Button
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

// Navigation
.nav-tabs {
  width: 100%;
  @include mixins.flex(row, center, center, wrap);
  gap: map.get(vars.$spacing, m);
  margin-bottom: map.get(vars.$spacing, s);


  .nav-tab {
    position: relative;
    overflow: hidden;
    padding: map.get(vars.$spacing, s) map.get(vars.$spacing, xl);
    border-radius: map.get(map.get(vars.$layout, border-radius), pill);
    font-weight: map.get(map.get(vars.$fonts, weights), bold);
    font-size: map.get(map.get(vars.$fonts, sizes), medium);
    cursor: pointer;
    background: transparent;
    text-decoration: none;
    transition: all 0.3s;

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
          color: white;
          transform: scale(1.1);
          @include mixins.glow('green', 'medium', $theme);
          border-color: transparent;
          transition: all 0.3s;
        }

        &:hover::before {
          left: 100%;
        }
      }
    }
  }
}

// Responsives Design für den Header
@media (max-width: map.get(map.get(vars.$layout, breakpoints), tablet)) {
  .app-header {
    height: auto;
    /* Flexible Höhe auf kleineren Bildschirmen */
    padding-bottom: map.get(vars.$spacing, m);

    .header-top {
      @include mixins.flex(row, space-between, center, wrap);
      margin-bottom: map.get(vars.$spacing, l);
    }

    .header-actions {
      margin-top: map.get(vars.$spacing, s);
    }

    .nav-tabs {
      justify-content: flex-start;
      overflow-x: auto;
      padding-bottom: map.get(vars.$spacing, s);

      .nav-tab {
        flex: 0 0 auto;
        white-space: nowrap;
      }
    }
  }
}
</style>