<!-- src/components/layout/MemberLayout.vue -->
<template>
  <div class="member-layout" :class="{ 'theme-light': isLightTheme, 'theme-dark': !isLightTheme }">
    <!-- Header mit Toggle und Benutzerinfo - verbesserte mobile Ansicht -->
    <header class="member-header custom-header">
      <div class="header-left custom-header-left">
        <button class="sidebar-toggle custom-toggle" @click="toggleSidebar" aria-label="Seitenleiste umschalten">
          <span class="toggle-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </span>
        </button>
        <h1 class="page-title custom-title">{{ pageTitle }}</h1>
      </div>
      <div class="header-right custom-header-right">
        <ThemeToggle :is-light-theme="isLightTheme" @toggle="toggleTheme" />
        <div class="user-info custom-user-info">
          <button class="logout-button custom-logout-btn" @click="handleLogout">
            <span class="logout-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </span>
            <span class="logout-text d-none d-sm-inline">Abmelden</span>
          </button>
        </div>
      </div>
    </header>

    <div class="member-container custom-container" :class="{ 'sidebar-open': isSidebarOpen }">
      <!-- Sidebar Komponente einbinden -->
      <MemberSidebar
        :is-open="isSidebarOpen"
        :active-menu="activeMenu"
        @select-menu="onMenuSelect"
        @close="closeSidebar"
        @logout="handleLogout"
      />

      <!-- Hauptinhalt -->
      <main class="member-content custom-content" :class="{ 'sidebar-active': isSidebarOpen }">
        <div class="content-wrapper">
          <slot></slot>
        </div>
      </main>
    </div>

    <!-- Overlay für mobile Ansicht mit besserer Performance -->
    <transition name="fade">
      <div class="sidebar-overlay" v-if="isSidebarOpen && isSmallScreen" @click="closeSidebar" aria-hidden="true"></div>
    </transition>
  </div>
  <div class="bubble"></div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import ThemeToggle from "@/components/ui/ThemeToggle.vue";
import MemberSidebar from "@/components/layout/MemberSidebar.vue";
import { authService } from "@/services/auth.service";
import { themeService } from "@/services/theme.service";

export default defineComponent({
  name: "MemberLayout",
  components: {
    ThemeToggle,
    MemberSidebar,
  },
  props: {
    pageTitle: {
      type: String,
      default: "Dashboard",
    },
    activeMenu: {
      type: String,
      default: "overview",
    },
  },
  emits: ["menu-change"],
  setup(_props, { emit }) {
    const router = useRouter();
    const isSmallScreen = ref(window.innerWidth < 1024);
    const isSidebarOpen = ref(window.innerWidth >= 1024); // Default offen auf Desktop
    const userName = ref("Mitglied");

    // Theme-Service verwenden
    const isLightTheme = themeService.isLightTheme;

    // Benutzerdaten abrufen
    onMounted(() => {
      const userData = authService.getUserData();
      if (userData && userData.name) {
        userName.value = userData.name.split(" ")[0]; // Nur Vorname verwenden
      }
    });

    // Sidebar umschalten - verbessert für mobile Geräte
    const toggleSidebar = () => {
      isSidebarOpen.value = !isSidebarOpen.value;

      // Body-Scroll verhindern bei offener Sidebar auf mobilen Geräten
      if (isSmallScreen.value) {
        document.body.style.overflow = isSidebarOpen.value ? "hidden" : "";
      }
    };

    // Sidebar schließen - verbessert für mobile Geräte
    const closeSidebar = () => {
      if (isSidebarOpen.value) {
        isSidebarOpen.value = false;

        // Body-Scroll wiederherstellen
        if (isSmallScreen.value) {
          document.body.style.overflow = "";
        }
      }
    };

    // Menüpunkt auswählen
    const onMenuSelect = (menuItem: string) => {
      emit("menu-change", menuItem);

      // Auf mobilen Geräten Sidebar nach Auswahl schließen
      if (isSmallScreen.value) closeSidebar();
    };

    // Theme umschalten
    const toggleTheme = () => themeService.toggleTheme();

    // Abmelden
    const handleLogout = () => {
      authService.logout();
      router.push("/login-register");
    };

    // Verbesserte Responsive Handler für die Bildschirmgröße
    const handleResize = () => {
      isSmallScreen.value = window.innerWidth < 1024;

      // Sidebar automatisch schließen bei kleinen Bildschirmen
      if (isSmallScreen.value && isSidebarOpen.value) {
        closeSidebar();
      } else if (!isSmallScreen.value && !isSidebarOpen.value && window.innerWidth >= 1200) {
        // Optional: Sidebar automatisch öffnen auf großen Bildschirmen
        isSidebarOpen.value = true;
      }
    };

    // Debounce-Funktion für bessere Performance
    const debounce = (fn: Function, ms = 300) => {
      let timeoutId: ReturnType<typeof setTimeout>;
      return (...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), ms);
      };
    };

    // Debounced resize handler als Konstante speichern
    const debouncedHandleResize = debounce(handleResize, 250);

    // Optimierte Event-Listener für Bildschirmgröße
    onMounted(() => {
      handleResize(); // Initial aufrufen
      window.addEventListener("resize", debouncedHandleResize);

      // Seitenorientierung berücksichtigen
      window.addEventListener("orientationchange", handleResize);
    });

    // Event-Listener sauber entfernen
    onUnmounted(() => {
      window.removeEventListener("resize", debouncedHandleResize);
      window.removeEventListener("orientationchange", handleResize);
      document.body.style.overflow = ""; // Scroll-Status zurücksetzen
    });

    return {
      isSidebarOpen,
      isLightTheme,
      userName,
      isSmallScreen,
      toggleSidebar,
      closeSidebar,
      onMenuSelect,
      toggleTheme,
      handleLogout,
    };
  },
});
</script>

<style lang="scss">
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;
@use "@/style/base/animations" as animations;

/* Grundlegendes Layout */

/* Info-Point + Sprechblase als Bubble */
.bubble {
  border: 1px solid black;
  position: fixed;
  bottom: 40px;
  right: map.get(vars.$spacing, l);
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, rgba(9, 114, 88, 0.7) 60%, rgba(255, 255, 255, 0.25) 100%);
  border-radius: 50%;
  box-shadow: 0 4px 16px 0 rgba(31, 38, 135, 0.12), 0 1px 4px rgba(0, 0, 0, 0.08);
  border: 1.5px solid rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(8px) saturate(140%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: map.get(vars.$z-index, modal) + 1000;
  cursor: pointer;
  transition: box-shadow map.get(vars.$transitions, default), background map.get(vars.$transitions, default),
    width 0.3s cubic-bezier(0.4, 0.2, 0.2, 1), height 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);

  /* Info-i */
  &::before {
    content: "i";
    display: flex;
    align-items: center;
    justify-content: center;
    color: #f3de21;
    font-size: map.get(map.get(vars.$fonts, sizes), base);
    font-weight: map.get(map.get(vars.$fonts, weights), bold);
    font-family: map.get(vars.$fonts, primary);
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: none;
    user-select: none;
    transition: color 0.2s;
  }

  /* Sprechblase */
  &::after {
    content: "Jetzt Feedback geben!";
    position: absolute;
    right: 110%;
    bottom: 50%;
    transform: translateY(50%);
    min-width: 140px;
    max-width: 220px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 60%, rgba(100, 180, 255, 0.18) 100%);
    color: map.get(map.get(vars.$colors, light), text-primary);
    font-size: map.get(map.get(vars.$fonts, sizes), small);
    font-weight: map.get(map.get(vars.$fonts, weights), bold);
    font-family: map.get(vars.$fonts, primary);
    text-align: left;
    padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, s);
    border-radius: 16px 16px 16px 0;
    box-shadow: 0 2px 8px rgba(31, 38, 135, 0.1);
    opacity: 0;
    pointer-events: none;
    user-select: none;
    white-space: pre-line;
    transition: opacity 0.25s, transform 0.25s;
    /* Sprechblasen-Pfeil */
    clip-path: polygon(0 0, 100% 0, 100% 100%, 16px 100%, 0 100%, 0 16px);
  }

  &:hover,
  &:focus {
    width: 40px;
    height: 40px;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18), 0 2px 8px rgba(0, 0, 0, 0.1);
    background: linear-gradient(135deg, rgba(14, 131, 67, 0.85) 60%, rgba(255, 255, 255, 0.35) 100%);

    &::after {
      opacity: 1;
      transform: translateY(50%) translateX(-8px);
      transition-delay: 0.1s;
    }
    &::before {
      color: #fcfcfc8f;
    }
  }
}

@media (max-width: 600px) {
  .bubble {
    width: 24px;
    height: 24px;
    bottom: map.get(vars.$spacing, s);
    right: map.get(vars.$spacing, s);

    &::after {
      min-width: 90px;
      font-size: map.get(map.get(vars.$fonts, sizes), xxs);
      padding: map.get(vars.$spacing, xxs) map.get(vars.$spacing, xs);
    }

    &:hover,
    &:focus {
      width: 32px;
      height: 32px;
      &::after {
        font-size: map.get(map.get(vars.$fonts, sizes), xs);
      }
    }
  }
}

.member-layout {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;

  /* Schriftstil nur für h1-h6 Elemente */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family: map.get(vars.$fonts, primary);
  }

  @each $theme in ("light", "dark") {
    &.theme-#{$theme} {
      background-color: mixins.theme-color($theme, primary-bg);
      color: mixins.theme-color($theme, text-primary);
      transition: all 0.4s ease-out;
    }
  }
}

/* Header mit zusätzlicher Klasse für Spezifität */
.member-header.custom-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 70px;
  z-index: map.get(vars.$z-index, header);
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* Blur- und Sättigungseffekt wie .app-header */
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-radius: 0 0 map.get(map.get(vars.$layout, border-radius), large)
    map.get(map.get(vars.$layout, border-radius), large);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 0 map.get(vars.$spacing, m);
  user-select: none;
  /* Langsamer Background-Toggle mit verzögerter Transition */
  transition: all 1.5s cubic-bezier(0.19, 1, 0.22, 1);

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background-color: if($theme == "light", rgba(255, 255, 255, 0.65), rgba(30, 30, 30, 0.45));
      box-shadow: 0 2px 8px rgba(mixins.theme-color($theme, shadow-color), 0.1);
      border-bottom: 1px solid mixins.theme-color($theme, border-light);
      transition: all 0.4s ease-out;
    }
  }
}

/* Anpassungen für Header-Bereich links */
.header-left.custom-header-left {
  display: flex;
  align-items: center;
}

/* Seitentitel mit spezifischerer Klasse */
.page-title.custom-title {
  font-size: map.get(map.get(vars.$fonts, sizes), large);
  font-weight: map.get(map.get(vars.$fonts, weights), bold);
  margin: 0;
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
  /* Sanfte Überblendung für Text */
  transition: color 0.4s ease-out;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      color: mixins.theme-color($theme, text-primary) !important;
    }
  }
}

/* Sidebar-Toggle mit spezifischerer Klasse */
.sidebar-toggle.custom-toggle {
  min-width: 36px;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: map.get(map.get(vars.$layout, border-radius), small);
  transition: all 0.4s ease-out;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      color: mixins.theme-color($theme, text-primary);

      &:hover {
        background-color: mixins.theme-color($theme, hover-color);
      }
    }
  }
}

/* Header rechter Bereich */
.header-right.custom-header-right {
  display: flex;
  align-items: center;
  gap: map.get(vars.$spacing, s);
}

/* Benutzerinfo-Bereich */
.user-info.custom-user-info {
  display: flex;
  align-items: center;
  gap: map.get(vars.$spacing, s);
}

/* Abmelde-Button mit spezifischer Klasse */
.logout-button.custom-logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, s);
  border-radius: map.get(map.get(vars.$layout, border-radius), pill);
  font-weight: map.get(map.get(vars.$fonts, weights), bold);
  font-size: map.get(map.get(vars.$fonts, sizes), small);
  cursor: pointer;
  transition: all 0.4s ease-out;
  min-width: 36px;
  min-height: 36px;
  border: none;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background: mixins.theme-gradient($theme, primary) !important;
      color: white !important;

      &:hover {
        transform: translateY(-2px);
        @include mixins.shadow("medium", $theme);
      }
    }
  }
}

/* Hauptcontainer mit Spezifizität */
.member-container.custom-container {
  display: flex;
  flex: 1;
  min-height: calc(100vh - 70px);
  padding-top: 70px;
  transition: all 0.4s ease-out;
  position: relative;
}

/* Hauptinhaltsbereich */
.member-content.custom-content {
  flex: 1;
  width: 100%;
  padding: map.get(vars.$spacing, m);
  @include animations.fade-in(0.4s);
  transition: all 0.4s ease-out;
}

/* Overlay für mobile Ansicht */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 940; // Unter der Sidebar (950)
  backdrop-filter: blur(2px);
}

/* Utility-Klassen */
.d-none {
  display: none !important;
}

/* Responsive Anpassungen */
@media (min-width: 576px) {
  .d-sm-inline {
    display: inline !important;
  }

  .member-header.custom-header {
    padding: 0 map.get(vars.$spacing, l);
  }

  .page-title.custom-title {
    padding: 0.8rem;
    font-size: map.get(map.get(vars.$fonts, sizes), xl);
    max-width: 250px;
  }

  .sidebar-toggle.custom-toggle {
    min-width: 40px;
    min-height: 40px;
  }

  .logout-button.custom-logout-btn {
    gap: 8px;
    padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, m);
  }

  .header-left.custom-header-left {
    gap: map.get(vars.$spacing, l);
  }

  .header-right.custom-header-right {
    gap: map.get(vars.$spacing, l);
  }

  .member-content.custom-content {
    padding: map.get(vars.$spacing, l);
  }
}

@media (min-width: 768px) {
  .page-title.custom-title {
    font-size: map.get(map.get(vars.$fonts, sizes), xxl);
    max-width: none;
  }

  .header-right.custom-header-right {
    gap: map.get(vars.$spacing, xl);
  }
}

@media (min-width: 992px) {
  .member-header.custom-header {
    padding: 0 map.get(vars.$spacing, xl);
  }

  .member-content.custom-content {
    padding: map.get(vars.$spacing, xl);
  }
}

@media (min-width: 1024px) {
  .member-container.custom-container.sidebar-open {
    margin-left: 280px;
  }
}

// Mobile-spezifische Anpassungen
@media (max-width: 768px) {
  // Sidebar-Overlay für volle Breite
  .sidebar-overlay {
    z-index: 940; // Unter der Sidebar (950)
  }
  
  // Content nicht verschieben auf Mobile
  .member-container.custom-container.sidebar-open {
    margin-left: 0;
  }
  
  // Header bleibt sichtbar und erhöht z-index
  .member-header.custom-header {
    z-index: 1000; // Über der Sidebar
  }
  
  // Content Blur entfernen für bessere Performance
  .member-content.custom-content.sidebar-active {
    filter: none;
    pointer-events: auto;
  }
}

@media (max-width: 1023px) {
  // Nur auf größeren Tablets den Blur-Effekt
  @media (min-width: 769px) {
    .member-content.custom-content.sidebar-active {
      filter: blur(2px);
      pointer-events: none;
    }
  }
}

/* Transition für Overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>