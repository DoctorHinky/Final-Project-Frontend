<!-- src/components/member/dashboard/Overview.vue -->
<template>
  <div class="overview-dashboard">
    <!-- Animierte Blätter im Hintergrund -->
    <div class="background-decoration">
      <div class="leaf leaf--1"></div>
      <div class="leaf leaf--2"></div>
      <div class="leaf leaf--3"></div>
    </div>

    <!-- Willkommenssektion mit CTA-Button -->
    <welcome-section @open-author-modal="toggleAuthorModal" class="dashboard-section dashboard-section--hero" />

    <!-- Statistik-Karten mit Theme-Support -->
    <div class="stats-container">
      <stats-cards :stats="stats" class="stats-grid" />
    </div>

    <!-- Hauptinhaltsbereich -->
    <div class="dashboard-content">
      <!-- Aktivitäten-Sektion -->
      <recent-activities :articles="recentArticles" @view-all="goToMyArticles" @discover="goToDiscovery"
        @open-article="openArticle" class="dashboard-section dashboard-section--activities" />

      <!-- Empfehlungen-Sektion -->
      <recommended-articles :articles="recommendedArticles" @open-article="openArticle"
        class="dashboard-section dashboard-section--recommendations" />
    </div>

    <!-- Modal für Autor-Bewerbung -->
    <author-application-modal :show-modal="showAuthorModal" @close="toggleAuthorModal" @submit="submitAuthorApplication"
      class="modal-enhanced" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services/auth.service';

// Import der modularen Komponenten
import {
  WelcomeSection,
  StatsCards,
  RecentActivities,
  RecommendedArticles,
  AuthorApplicationModal
} from '@/components/pages/DashboardPages/Overview';

interface Article {
  id: number;
  title: string;
  preview?: string;
  category?: string;
  author?: string;
  date?: string;
  status?: string;
  currentChapter?: number;
  totalChapters?: number;
  lastRead?: string;
  readingTime?: string;
  difficulty?: 'Einfach' | 'Mittel' | 'Fortgeschritten';
}

export default defineComponent({
  name: 'OverviewDashboard',
  components: {
    WelcomeSection,
    StatsCards,
    RecentActivities,
    RecommendedArticles,
    AuthorApplicationModal
  },
  setup() {
    const router = useRouter();
    const userName = ref('Mitglied');

    // Autor-Bewerbung Modal
    const showAuthorModal = ref(false);
    const isSubmitting = ref(false);

    // Erweiterte Statistiken mit Animationen
    const stats = ref([
      {
        icon: '📚',
        label: 'Gelesene Artikel',
        value: '12',
        color: 'gradient-green',
        animation: 'pulse'
      },
      {
        icon: '⭐',
        label: 'Favoriten',
        value: '5',
        color: 'gradient-yellow',
        animation: 'float'
      },
      {
        icon: '👥',
        label: 'Freunde',
        value: '3',
        color: 'gradient-teal',
        animation: 'bounce'
      },
    ]);

    // Zuletzt gelesene Artikel mit erweiterten Metadaten
    const recentArticles = ref<Article[]>([
      {
        id: 1,
        title: 'Erziehungsstile im Vergleich: Welcher passt zu Ihrer Familie?',
        status: 'in-progress',
        currentChapter: 4,
        totalChapters: 6,
        lastRead: 'Gestern',
        category: 'Erziehung',
        author: 'Dr. Sarah Miller',
        readingTime: '15 Min.',
        difficulty: 'Mittel'
      },
      {
        id: 2,
        title: 'Gesunde Ernährung für Kleinkinder: Ein praktischer Leitfaden',
        status: 'just-started',
        currentChapter: 1,
        totalChapters: 8,
        lastRead: 'Vor 3 Tagen',
        category: 'Gesundheit',
        author: 'Ernährungsberater Tim Koch',
        readingTime: '20 Min.',
        difficulty: 'Einfach'
      },
      {
        id: 4,
        title: 'Grenzen setzen ohne Konflikte: Effektive Kommunikation mit Kindern',
        status: 'almost-done',
        currentChapter: 5,
        totalChapters: 6,
        lastRead: 'Vor einer Woche',
        category: 'Kommunikation',
        author: 'Psychologin Anna Weber',
        readingTime: '12 Min.',
        difficulty: 'Fortgeschritten'
      }
    ]);

    // Empfohlene Artikel mit erweiterten Daten
    const recommendedArticles = ref<Article[]>([
      {
        id: 3,
        title: 'Digitale Medien im Kindesalter: Fluch oder Segen?',
        preview: 'Eine ausgewogene Betrachtung der Vor- und Nachteile digitaler Medien für Kinder.',
        category: 'Medien',
        author: 'Prof. Thomas Becker',
        date: '28.04.2025',
        readingTime: '18 Min.',
        difficulty: 'Mittel'
      },
      {
        id: 5,
        title: 'Die Phasen der kindlichen Entwicklung verstehen',
        preview: 'Erfahren Sie, wie Sie Ihr Kind in jeder Entwicklungsphase optimal unterstützen können.',
        category: 'Entwicklung',
        author: 'Dr. Maria Schmidt',
        date: '15.04.2025',
        readingTime: '25 Min.',
        difficulty: 'Fortgeschritten'
      },
      {
        id: 6,
        title: 'Wie Musik die kognitive Entwicklung fördert',
        preview: 'Neue Studien zeigen den positiven Einfluss von Musikunterricht auf die Gehirnentwicklung.',
        category: 'Bildung',
        author: 'Julia Wagner',
        date: '10.04.2025',
        readingTime: '10 Min.',
        difficulty: 'Einfach'
      }
    ]);

    // Modal öffnen/schließen mit Animation
    const toggleAuthorModal = () => {
      showAuthorModal.value = !showAuthorModal.value;
    };

    // Formular absenden mit verbessertem Feedback
    const submitAuthorApplication = async (data: any) => {
      isSubmitting.value = true;

      try {
        // Simuliere API-Aufruf mit Verzögerung
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log('Autor-Bewerbung wurde erfolgreich gesendet:', data);

        // Erfolgsmeldung anzeigen (später durch Toast/Notification ersetzen)
        alert('Vielen Dank für deine Bewerbung! Wir werden deine Unterlagen prüfen und uns in Kürze bei dir melden.');

        toggleAuthorModal();

      } catch (error) {
        console.error('Fehler beim Senden der Autor-Bewerbung:', error);
        alert('Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.');
      } finally {
        isSubmitting.value = false;
      }
    };

    // Artikel öffnen mit Transition
    const openArticle = (article: Article) => {
      console.log('Artikel öffnen:', article.title);
      // Weiterleitung zu my-articles Tab
      window.location.href = 'http://localhost:5173/member/dashboard?tab=my-articles';
    };

    // Navigation zu anderen Dashboardbereichen
    const goToMyArticles = () => {
      window.location.href = 'http://localhost:5173/member/dashboard?tab=my-articles';
    };

    const goToDiscovery = () => {
      window.location.href = 'http://localhost:5173/member/dashboard?tab=my-articles';
    };

    // Benutzerdaten beim Mounten laden
    onMounted(() => {
      const userData = authService.getUserData();
      if (userData && userData.name) {
        userName.value = userData.name.split(' ')[0];
      }

      // Scroll-Animationen aktivieren
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, observerOptions);

      document.querySelectorAll('.dashboard-section').forEach(section => {
        observer.observe(section);
      });
    });

    return {
      stats,
      recentArticles,
      recommendedArticles,
      showAuthorModal,
      toggleAuthorModal,
      submitAuthorApplication,
      openArticle,
      goToMyArticles,
      goToDiscovery
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

// Global Box-Sizing für konsistente Größenberechnung
* {
  box-sizing: border-box;
}

.overview-dashboard {
  @include animations.fade-in(0.5s);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: map.get(vars.$spacing, xxl);
  padding: map.get(vars.$spacing, xl);
  margin: 0 auto; // Zentriert den gesamten Container
  width: 100%;
  min-height: 100vh;
  overflow: hidden;

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      color: mixins.theme-color($theme, text-primary);
      transition: all 0.4s; // <--- Transition für Theme-Switch
    }
  }

  // Dashboard-Sektionen mit Theme-Support
  .dashboard-section {
    @include mixins.card-style($theme: 'light', $padding: 'medium', $hover-effect: true);
    @include animations.scroll-fade-in();
    position: relative;
    overflow: hidden;
    z-index: map.get(vars.$z-index, base); // Basis z-index

    // Shine-Effekt für alle Sektionen
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg,
          transparent,
          rgba(255, 255, 255, 0.2),
          transparent);
      transition: left 0.8s ease;
      z-index: 0;
      pointer-events: none; // Verhindert Klick-Blockierung
    }

    &:hover::before {
      left: 100%;
    }

    // Theme-Anpassungen für Dark Mode
    .theme-dark & {
      @include mixins.card-style($theme: 'dark', $padding: 'medium', $hover-effect: true);
    }

    &--hero {

      // Gradient-Border für Hero-Sektion
      &::before {
        content: '';
        position: absolute;
        inset: -2px;
        border-radius: map.get(map.get(vars.$layout, border-radius), large);
        padding: 2px;
        background: mixins.theme-gradient('light', 'primary');
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        opacity: 0.6;
        transition: opacity map.get(vars.$transitions, default);
        z-index: -1; // Hinter dem Content
        pointer-events: none; // Keine Klick-Interferenz

        .theme-dark & {
          background: mixins.theme-gradient('dark', 'primary');
        }
      }

      &:hover::before {
        opacity: 1;
      }
    }

    &--activities {
      // Spezieller Hover-Effekt für Aktivitäten
      transition: all map.get(vars.$transitions, default);

      &:hover {
        @include mixins.glow('lime', 'medium', 'light');

        .theme-dark & {
          @include mixins.glow('lime', 'medium', 'dark');
        }
      }
    }

    &--recommendations {

      // Pulsierender Rahmen für Empfehlungen
      &::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: map.get(map.get(vars.$layout, border-radius), large);
        border: 2px solid transparent;
        background: mixins.theme-gradient('light', 'header') border-box;
        -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        opacity: 0;
        transition: opacity map.get(vars.$transitions, default);
        z-index: -1; // Hinter dem Content
        pointer-events: none; // Keine Klick-Interferenz

        .theme-dark & {
          background: mixins.theme-gradient('dark', 'header') border-box;
        }
      }

      &:hover::after {
        opacity: 0.5;
        @include animations.pulse(2s);
      }
    }

    // Sicherstellen, dass der Content klickbar bleibt
    &>* {
      position: relative;
      z-index: 1;
    }

    // Explizit für Links und Buttons
    :deep(a),
    :deep(button),
    :deep(.clickable),
    :deep([role="button"]) {
      position: relative;
      z-index: 2;
      cursor: pointer;
    }
  }

  // Statistik-Container
  .stats-container {
    @include animations.fade-in(0.8s, 0.2s);
    width: 100%;
    display: flex;
    justify-content: center;
  }

  // Statistik-Grid
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: map.get(vars.$spacing, xl);
    width: 100%;
    justify-content: center;

    @include mixins.responsive(tablet) {
      grid-template-columns: 1fr;
      gap: map.get(vars.$spacing, m);
      max-width: 400px;
      margin: 0 auto;
    }

    // Individuelle Stat-Karten-Animationen
    :deep(.stat-card) {
      @include mixins.card-style($theme: 'light', $padding: 'small', $hover-effect: false);
      @include animations.fade-in(0.6s);
      cursor: pointer;
      position: relative;
      overflow: hidden;
      width: 100%;

      .theme-dark & {
        @include mixins.card-style($theme: 'dark', $padding: 'small', $hover-effect: false);
      }

      // Icon-Container mit Gradient
      .icon-container {
        @include mixins.icon-container($theme: 'light', $size: 'medium');
        margin-bottom: map.get(vars.$spacing, m);
        transition: transform map.get(vars.$transitions, default);

        .theme-dark & {
          @include mixins.icon-container($theme: 'dark', $size: 'medium');
        }
      }

      // Hover-Effekte für Stat-Karten
      &:hover {
        transform: translateY(-5px) scale(1.02);
        @include mixins.shadow('large', 'light');

        .theme-dark & {
          @include mixins.shadow('large', 'dark');
        }

        .icon-container {
          transform: rotate(10deg) scale(1.1);
        }

        // Animationen basierend auf Typ
        &[data-animation="pulse"] .icon-container {
          @include animations.pulse(1s);
        }

        &[data-animation="float"] .icon-container {
          animation: float 2s ease-in-out infinite;
        }

        &[data-animation="bounce"] .icon-container {
          animation: bounce 1s ease-in-out infinite;
        }
      }
    }
  }

  // Hauptinhaltsbereich
  .dashboard-content {
    display: grid;
    grid-template-columns: 1fr;
    gap: map.get(vars.$spacing, xxl);
    width: 100%;

    @media (min-width: map.get(map.get(vars.$layout, breakpoints), xlarge)) {
      grid-template-columns: 2fr 1fr;
      align-items: start;
      gap: map.get(vars.$spacing, xl);
    }

    @include mixins.responsive(tablet) {
      gap: map.get(vars.$spacing, xl);
    }

    // Container für bessere Ausrichtung
    >* {
      width: 100%;
      min-width: 0; // Verhindert Grid-Overflow
    }

    // Artikel-Karten Hover-Effekte
    :deep(.article-card) {
      transition: all map.get(vars.$transitions, default);
      cursor: pointer;
      position: relative;
      z-index: 1;

      &:hover {
        transform: translateX(8px);
        z-index: 2; // Erhöht bei Hover

        .article-title {
          @include mixins.text-gradient('primary', 'light');

          .theme-dark & {
            @include mixins.text-gradient('primary', 'dark');
          }
        }

        .read-more {
          transform: translateX(5px);
        }
      }
    }
  }

  // Modal-Verbesserungen
  .modal-enhanced {
    :deep(.modal-backdrop) {
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      @include mixins.themed(background-color, shadow-color);
    }

    :deep(.modal-content) {
      @include mixins.card-style($theme: 'light', $padding: 'large');
      @include animations.fade-in(0.4s);
      max-width: 600px;
      margin: auto;

      .theme-dark & {
        @include mixins.card-style($theme: 'dark', $padding: 'large');
      }
    }
  }
}

// Bounce Animation
@keyframes bounce {

  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }

  40% {
    transform: translateY(-15px);
  }

  60% {
    transform: translateY(-7px);
  }
}

// Responsive Anpassungen
@include mixins.responsive(tablet) {
  .overview-dashboard {
    padding: map.get(vars.$spacing, m);
    gap: map.get(vars.$spacing, l);

    .dashboard-section {
      // Reduzierte Padding auf Mobile
      padding: map.get(vars.$spacing, l);
    }
  }
}

@include mixins.responsive(mobile) {
  .overview-dashboard {
    padding: map.get(vars.$spacing, s);
    gap: map.get(vars.$spacing, m);

    .dashboard-section {
      padding: map.get(vars.$spacing, m);
    }
  }
}

// Print Styles
@media print {

  .background-decoration,
  .modal-enhanced {
    display: none;
  }
}
</style>