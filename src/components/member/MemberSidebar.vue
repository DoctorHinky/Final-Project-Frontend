<!-- src/components/member/MemberSidebar.vue -->
<template>
  <aside class="member-sidebar" :class="{ 'open': isOpen }">
    <!-- Sidebar-Header mit Logo und Schließen-Button -->
    <a href="/" class="logo-link">
      <img src="../../assets/images/Logo.png" alt="Logo" class="logo-Sidebar" />
    </a>
    <div class="sidebar-header">
      <img src="@/assets/images/AuthorIcon1.jpg" alt="Account Logo" class="account-logo" />
      <div class="header-content">
      </div>
      <button class="close-sidebar" @click="$emit('close')">×</button>
    </div>

    <!-- Sidebar-Navigation -->
    <nav class="sidebar-nav">
      <div v-for="(item, index) in menuItems" :key="index" class="nav-item" :class="{ active: activeMenu === item.id }"
        @click="selectMenuItem(item.id)">
        <span class="nav-icon">
          <component :is="item.icon" class="h-6 w-6" />
        </span>
        <span class="nav-text">{{ item.text }}</span>
      </div>
    </nav>

    <!-- Sidebar-Footer mit Abmelde-Button -->
    <div class="sidebar-footer">
      <button class="logout-button" @click="$emit('logout')">
        <ArrowRightOnRectangleIcon class="h-5 w-5 LogoutIcon" />
        <span>Abmelden</span>
      </button>
    </div>
  </aside>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import {
  ChartBarIcon,
  BookOpenIcon,
  HeartIcon,
  UserGroupIcon,
  BellIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline';

export default defineComponent({
  name: 'MemberSidebar',
  components: {
    ChartBarIcon,
    BookOpenIcon,
    HeartIcon,
    UserGroupIcon,
    BellIcon,
    Cog6ToothIcon,
    DocumentTextIcon,
    ArrowRightOnRectangleIcon
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    activeMenu: {
      type: String,
      default: 'overview'
    }
  },
  emits: ['select-menu', 'close', 'logout'],
  setup(props, { emit }) {
    // Menüelemente definieren
    const menuItems = ref([
      { id: 'overview', text: 'Übersicht', icon: ChartBarIcon },
      { id: 'my-articles', text: 'Meine Artikel', icon: DocumentTextIcon },
      { id: 'library', text: 'Bibliothek', icon: BookOpenIcon },
      { id: 'favorites', text: 'Favoriten', icon: HeartIcon },
      { id: 'friends', text: 'Freunde', icon: UserGroupIcon },
      { id: 'notifications', text: 'Benachrichtigungen', icon: BellIcon },
      { id: 'settings', text: 'Einstellungen', icon: Cog6ToothIcon }
    ]);

    // Menüpunkt auswählen
    const selectMenuItem = (itemId: string) => {
      emit('select-menu', itemId);
    };

    return {
      menuItems,
      selectMenuItem
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

.member-sidebar {
  position: fixed;
  top: 0;
  left: -260px;
  width: 260px;
  height: 100vh;
  z-index: 950;
  transition: left 0.3s ease;
  display: flex;
  flex-direction: column;
  padding-top: 70px; // Platz für den Header

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, card-bg);
      border-right: 1px solid mixins.theme-color($theme, border-medium);
      transition: all 0.4s ease-out;
    }
  }

  &.open {
    left: 0;
    box-shadow: 5px 0 15px rgba(0, 0, 0, 0.1);
  }

  // Sidebar-Header
  .sidebar-header {
    display: flex;
    align-items: center;
    padding: map.get(vars.$spacing, m);
    border-bottom: 1px solid;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        border-color: mixins.theme-color($theme, border-light);
        transition: all 0.4s ease-out;
      }
    }

    .account-logo {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      margin-right: map.get(vars.$spacing, s);
    }

    .header-content {
      flex: 1;

      h3 {
        margin: 0;
        font-size: map.get(map.get(vars.$fonts, sizes), medium);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
            transition: all 0.4s ease-out;
          }
        }
      }
    }

    .close-sidebar {
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
          transition: all 0.4s ease-out;

          &:hover {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }
    }
  }

  // Sidebar-Navigation
  .sidebar-nav {
    flex: 1;
    padding: map.get(vars.$spacing, m);
    display: flex;
    flex-direction: column;
    gap: map.get(vars.$spacing, s);
    overflow-y: auto;

    .nav-item {
      display: flex;
      align-items: center;
      padding: map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      cursor: pointer;
      transition: all 0.3s;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
          transition: all 0.4s ease-out;

          &:hover {
            background-color: mixins.theme-color($theme, hover-color);
            color: mixins.theme-color($theme, text-primary);
          }

          &.active {
            background: mixins.theme-gradient($theme, primary);
            color: white;
          }
        }
      }

      .nav-icon {
        margin-right: map.get(vars.$spacing, m);
        font-size: 1.2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
      }

      .nav-text {
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
      }
    }
  }

  // Sidebar-Footer
  .sidebar-footer {
    padding: map.get(vars.$spacing, m);
    border-top: 1px solid;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        border-color: mixins.theme-color($theme, border-light);
        transition: all 0.4s ease-out;
      }
    }

    .logout-button {
      width: 100%;
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      padding: map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      background: none;
      border: 1px solid;
      cursor: pointer;
      transition: all 0.3s;

      .LogoutIcon {
        width: 20px;
      }

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary); // Dynamische Textfarbe
          border-color: rgb(255, 0, 0);
          transition: all 0.4s ease-out;

          &:hover {
            background-color: rgba(255, 0, 0, 0.308);
            border-color: rgb(255, 0, 0);
            color: mixins.theme-color($theme, text-primary); // Dynamische Hover-Textfarbe
          }
        }
      }
    }
  }
}

.logo-Sidebar {
  display: block;
  margin: 0 auto;
  /* Zentriert das Bild horizontal */
  height: 80px;
  border-radius: 50px;
  margin-bottom: map.get(vars.$spacing, m);
  opacity: .9;
  border: 1px solid #000;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    opacity: 1;
    box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2);
    animation: WackelpuddingHop 1.5s ease-in-out forwards;
  }
}

@keyframes WackelpuddingHop {
  0% {
    transform: translateY(0) scale(1, 1);
  }

  25% {
    transform: translateY(-20px) scale(1, 1.05);
    /* Leicht vertikal gedehnt während des Aufstiegs */
  }

  40% {
    transform: translateY(-25px) scale(1.05, 0.95);
    /* Bereitet sich auf den Fall vor */
  }

  50% {
    transform: translateY(5px) scale(1.1, 0.8);
    /* Abgeflacht beim Aufprall */
  }

  65% {
    transform: translateY(-5px) scale(0.95, 1.1);
    /* Vertikale Gegenbewegung - quetscht nach oben */
  }

  75% {
    transform: translateY(0) scale(1.05, 0.95);
    /* Zweite kleine Abflachung */
  }

  85% {
    transform: translateY(0) scale(0.98, 1.02);
    /* Kleine Nachwackelbewegung */
  }

  100% {
    transform: translateY(0) scale(1, 1);
    /* Zurück zur Ausgangsgröße */
  }
}

// Medienquery für große Bildschirme
@media (min-width: 1024px) {
  .member-sidebar {
    left: 0;
    transform: translateX(-100%);

    &.open {
      transform: translateX(0);
    }
  }
}
</style>