<!-- src/components/pages/DashboardPages/Overview/WelcomeSection.vue -->
<template>
  <div class="welcome-section">
    <div class="welcome-message">
      <h2>Übersicht</h2>
      <p>Hier ist deine Übersicht für {{ currentDate }}</p>
    </div>

    <!-- CTA-Button für Autor-Bewerbung -->
    <button class="become-author-cta" @click="handleAuthorClick">
      <IconPencilSquare class="cta-icon" />
      Werde Autor
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { PencilSquareIcon as IconPencilSquare } from '@heroicons/vue/24/outline';

export default defineComponent({
  name: 'WelcomeSection',
  components: {
    IconPencilSquare
  },
  emits: ['open-author-modal'],
  setup(_, { emit }) {
    const currentDate = computed(() => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      return now.toLocaleDateString('de-DE', options);
    });

    // Debug-Funktion für Button-Click
    const handleAuthorClick = () => {
      console.log('🔘 WelcomeSection: Button clicked!');
      console.log('📤 WelcomeSection: Emitting open-author-modal event');
      emit('open-author-modal');
      console.log('✅ WelcomeSection: Event emitted');
    };

    return {
      currentDate,
      handleAuthorClick
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

// Willkommen-Sektion mit CTA-Button
.welcome-section {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: map.get(vars.$spacing, l);
  padding: map.get(vars.$spacing, l);
  border-radius: map.get(map.get(vars.$layout, border-radius), medium);
  transition: all 0.3s;

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, card-bg);
      border: 1px solid mixins.theme-color($theme, border-light);

      &:hover {
        transform: translateY(-5px);
        @include mixins.shadow('medium', $theme);
        border-color: mixins.theme-color($theme, accent-teal);
      }
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: map.get(vars.$spacing, m);
  }

  .welcome-message {
    h2 {
      font-size: map.get(map.get(vars.$fonts, sizes), xxl);
      font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
      margin-bottom: map.get(vars.$spacing, xs);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    p {
      font-size: map.get(map.get(vars.$fonts, sizes), medium);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  // CTA-Button für Autor-Bewerbung
  .become-author-cta {
    /* Grundlegende Struktur */
    width: 100%;
    max-width: 400px;
    height: auto;
    min-height: 60px;

    /* Flexbox-Layout */
    display: flex;
    justify-content: center;
    align-items: center;
    gap: map.get(vars.$spacing, xs);
    padding: map.get(vars.$spacing, m) map.get(vars.$spacing, l);

    /* Moderne Formgebung mit Variables */
    border-radius: map.get(map.get(vars.$layout, border-radius), pill);
    position: relative;
    overflow: hidden;

    /* Typografie mit Variables */
    font-weight: map.get(map.get(vars.$fonts, weights), bold);
    font-size: map.get(map.get(vars.$fonts, sizes), medium);
    text-transform: uppercase;
    letter-spacing: 1.5px;

    /* Interaktionselemente */
    border: none;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

    /* Einzigartiges Design mit Theme-Unterstützung */
    background-size: 200% 200%;
    animation: gradientShift 15s ease infinite;

    /* Theme-spezifische Eigenschaften */
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        /* Theme-spezifischer Gradient-Hintergrund */
        background: linear-gradient(135deg,
            mixins.theme-color($theme, accent-green) 0%,
            mixins.theme-color($theme, accent-teal) 50%,
            mixins.theme-color($theme, accent-lime) 100%);

        /* Theme-spezifische Schatten */
        box-shadow: 0 10px 25px mixins.theme-color($theme, shadow-color),
          0 5px 15px rgba(mixins.theme-color($theme, accent-green), 0.2);

        /* Textfarbe ist in beiden Themes weiß für Kontrast */
        color: #ffffff;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }
    }

    /* Debug: Sicherstellen dass Button klickbar ist */
    z-index: 10;
    pointer-events: auto;
  }

  /* Pseudo-Element für Glanzeffekt */
  .become-author-cta::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 60%);
    transform: rotate(30deg);
    opacity: 0;
    transition: opacity 0.6s ease;
    pointer-events: none;
  }

  /* Hover-Effekte mit Theme-Unterstützung */
  .become-author-cta:hover {
    transform: translateY(-5px) scale(1.02);

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        box-shadow: 0 15px 30px mixins.theme-color($theme, shadow-color),
          0 0 20px rgba(mixins.theme-color($theme, accent-teal), 0.45),
          inset 0 0 10px rgba(255, 255, 255, 0.3);

        /* Glow-Effekt aus Variablen */
        @include mixins.glow('green', 'medium', $theme);
      }
    }
  }

  .become-author-cta:hover::before {
    opacity: 1;
    animation: glideEffect 1.5s linear infinite;
  }

  /* Aktiv-Status mit Theme-Unterstützung */
  .become-author-cta:active {
    transform: translateY(-2px) scale(0.98);

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        box-shadow: 0 5px 15px mixins.theme-color($theme, shadow-color);
      }
    }
  }

  /* Icon-Styling in der CTA mit Theme-Unterstützung */
  .become-author-cta .cta-icon {
    width: 24px;
    height: 24px;
    fill: white;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
    transition: transform 0.4s ease;
    pointer-events: none; /* Icon soll keine Klicks abfangen */

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-on-primary);
      }
    }
  }

  .become-author-cta:hover .cta-icon {
    transform: translateX(3px) rotate(10deg);
  }

  /* Animationen */
  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }

    50% {
      background-position: 100% 50%;
    }

    100% {
      background-position: 0% 50%;
    }
  }

  @keyframes glideEffect {
    0% {
      transform: translate(-30%, -30%) rotate(30deg);
    }

    100% {
      transform: translate(30%, 30%) rotate(30deg);
    }
  }

  /* Medienabfragen für Responsivität mit variables */
  @media (max-width: map.get(map.get(vars.$layout, breakpoints), tablet)) {
    .become-author-cta {
      max-width: 100%;
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
    }
  }
}
</style>