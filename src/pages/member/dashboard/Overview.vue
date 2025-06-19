<!-- src/components/member/dashboard/Overview.vue -->
<template>
  <div class="overview-dashboard">
    <!-- Willkommenssektion mit CTA-Button -->
    <welcome-section @open-author-modal="toggleAuthorModal" class="dashboard-section dashboard-section--hero" />

    <!-- Statistik-Karten mit Theme-Support -->
    <div class="stats-container">
      <stats-cards :stats="stats" class="stats-grid" />
    </div>

    <!-- Hauptinhaltsbereich -->
    <div class="dashboard-content">
      <!-- Aktivitäten-Sektion -->
      <recent-activities
        :articles="recentArticles"
        @view-all="goToMyArticles"
        @discover="goToDiscovery"
        @open-article="openArticle"
        class="dashboard-section dashboard-section--activities"
      />

      <!-- Empfehlungen-Sektion -->
      <recommended-articles
        :articles="recommendedArticles"
        @open-article="openArticle"
        class="dashboard-section dashboard-section--recommendations"
      />
    </div>

    <!-- Modal für Autor-Bewerbung -->
    <author-application-modal
      :show-modal="showAuthorModal"
      @close="toggleAuthorModal"
      @submit="submitAuthorApplication"
      class="modal-enhanced"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { authService } from "@/services/auth.service";
import {
  overviewService,
  type DashboardStats,
  type RecentActivityArticle,
  type RecommendedArticle,
} from "@/services/overview.service";

// Import der modularen Komponenten
import {
  WelcomeSection,
  StatsCards,
  RecentActivities,
  RecommendedArticles,
  AuthorApplicationModal,
} from "@/components/pages/DashboardPages/Overview";

interface Article {
  id: string;
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
  difficulty?: "Einfach" | "Mittel" | "Fortgeschritten";
}

export default defineComponent({
  name: "OverviewDashboard",
  components: {
    WelcomeSection,
    StatsCards,
    RecentActivities,
    RecommendedArticles,
    AuthorApplicationModal,
  },
  setup() {
    const router = useRouter();
    const userName = ref("Mitglied");

    // Loading states
    const isLoading = ref(true);

    // Autor-Bewerbung Modal
    const showAuthorModal = ref(false);

    // Dashboard-Daten
    const stats = ref([
      {
        icon: "📚",
        label: "Gelesene Artikel",
        value: "0",
        color: "gradient-green",
        animation: "pulse",
      },
      {
        icon: "⭐",
        label: "Favoriten",
        value: "0",
        color: "gradient-yellow",
        animation: "float",
      },
      {
        icon: "👥",
        label: "Freunde",
        value: "0",
        color: "gradient-teal",
        animation: "bounce",
      },
    ]);

    // Artikel-Daten
    const recentArticles = ref<RecentActivityArticle[]>([]);
    const recommendedArticles = ref<RecommendedArticle[]>([]);

    // Alle Dashboard-Daten laden
    const loadAllDashboardData = async () => {
      try {
        isLoading.value = true;

        const result = await overviewService.getAllDashboardData();

        // Statistiken aktualisieren
        stats.value = [
          {
            icon: "📚",
            label: "Gelesene Artikel",
            value: result.stats.readArticles.toString(),
            color: "gradient-green",
            animation: "pulse",
          },
          {
            icon: "⭐",
            label: "Favoriten",
            value: result.stats.favorites.toString(),
            color: "gradient-yellow",
            animation: "float",
          },
          {
            icon: "👥",
            label: "Freunde",
            value: result.stats.friends.toString(),
            color: "gradient-teal",
            animation: "bounce",
          },
        ];

        // Artikel-Daten setzen
        recentArticles.value = result.recentActivities;
        recommendedArticles.value = result.recommendedArticles;
      } catch (error) {
        console.error("Fehler beim Laden der Dashboard-Daten:", error);

        // Fallback: Leere Arrays
        recentArticles.value = [];
        recommendedArticles.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    // Modal öffnen/schließen
    const toggleAuthorModal = () => {
      showAuthorModal.value = !showAuthorModal.value;
    };

    // Formular absenden
    const submitAuthorApplication = async (data: any) => {
      if (data.success) {
        // Das Modal zeigt bereits die Erfolgsmeldung an
      } else {
        console.error("Fehler bei Bewerbung:", data.error);
      }
    };

    // Artikel öffnen
    const openArticle = () => {
      window.location.href = "http://localhost:5173/member/dashboard?tab=my-articles";
    };

    // Navigation zu anderen Dashboardbereichen
    const goToMyArticles = () => {
      window.location.href = "http://localhost:5173/member/dashboard?tab=my-articles";
    };

    const goToDiscovery = () => {
      window.location.href = "http://localhost:5173/member/dashboard?tab=my-articles";
    };

    // Daten neu laden
    const refreshDashboard = async () => {
      await loadAllDashboardData();
    };

    // Benutzerdaten und Dashboard-Daten beim Mounten laden
    onMounted(async () => {
      const userData = authService.getUserData();
      if (userData && userData.name) {
        userName.value = userData.name.split(" ")[0];
      }

      await loadAllDashboardData();

      // Scroll-Animationen aktivieren
      const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      }, observerOptions);

      document.querySelectorAll(".dashboard-section").forEach((section) => {
        observer.observe(section);
      });
    });

    return {
      // Daten
      stats,
      recentArticles,
      recommendedArticles,
      isLoading,

      // Modal
      showAuthorModal,
      toggleAuthorModal,
      submitAuthorApplication,

      // Navigation
      openArticle,
      goToMyArticles,
      goToDiscovery,

      // Refresh
      refreshDashboard,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;
@use "@/style/base/animations" as animations;

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
  margin: 0 auto;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      color: mixins.theme-color($theme, text-primary);
      transition: all 0.4s;
    }
  }

  .dashboard-section {
    @include mixins.card-style($theme: "light", $padding: "medium", $hover-effect: true);
    @include animations.scroll-fade-in();
    position: relative;
    overflow: hidden;
    z-index: map.get(vars.$z-index, base);

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.8s ease;
      z-index: 0;
      pointer-events: none;
    }

    &:hover::before {
      left: 100%;
    }

    .theme-dark & {
      @include mixins.card-style($theme: "dark", $padding: "medium", $hover-effect: true);
    }

    &--hero {
      &::before {
        content: "";
        position: absolute;
        inset: -2px;
        border-radius: map.get(map.get(vars.$layout, border-radius), large);
        padding: 2px;
        background: mixins.theme-gradient("light", "primary");
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        opacity: 0.6;
        transition: opacity map.get(vars.$transitions, default);
        z-index: -1;
        pointer-events: none;

        .theme-dark & {
          background: mixins.theme-gradient("dark", "primary");
        }
      }

      &:hover::before {
        opacity: 1;
      }
    }

    &--activities {
      transition: all map.get(vars.$transitions, default);

      &:hover {
        @include mixins.glow("lime", "medium", "light");

        .theme-dark & {
          @include mixins.glow("lime", "medium", "dark");
        }
      }
    }

    &--recommendations {
      &::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: map.get(map.get(vars.$layout, border-radius), large);
        border: 2px solid transparent;
        background: mixins.theme-gradient("light", "header") border-box;
        -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
        mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        opacity: 0;
        transition: opacity map.get(vars.$transitions, default);
        z-index: -1;
        pointer-events: none;

        .theme-dark & {
          background: mixins.theme-gradient("dark", "header") border-box;
        }
      }

      &:hover::after {
        opacity: 0.5;
        @include animations.pulse(2s);
      }
    }

    & > * {
      position: relative;
      z-index: 1;
    }

    :deep(a),
    :deep(button),
    :deep(.clickable),
    :deep([role="button"]) {
      position: relative;
      z-index: 2;
      cursor: pointer;
    }
  }

  .stats-container {
    @include animations.fade-in(0.8s, 0.2s);
    width: 100%;
    display: flex;
    justify-content: center;
  }

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

    :deep(.stat-card) {
      @include mixins.card-style($theme: "light", $padding: "small", $hover-effect: false);
      @include animations.fade-in(0.6s);
      cursor: pointer;
      position: relative;
      overflow: hidden;
      width: 100%;

      .theme-dark & {
        @include mixins.card-style($theme: "dark", $padding: "small", $hover-effect: false);
      }

      .icon-container {
        @include mixins.icon-container($theme: "light", $size: "medium");
        margin-bottom: map.get(vars.$spacing, m);
        transition: transform map.get(vars.$transitions, default);

        .theme-dark & {
          @include mixins.icon-container($theme: "dark", $size: "medium");
        }
      }

      &:hover {
        transform: translateY(-5px) scale(1.02);
        @include mixins.shadow("large", "light");

        .theme-dark & {
          @include mixins.shadow("large", "dark");
        }

        .icon-container {
          transform: rotate(10deg) scale(1.1);
        }

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

    > * {
      width: 100%;
      min-width: 0;
    }

    :deep(.article-card) {
      transition: all map.get(vars.$transitions, default);
      cursor: pointer;
      position: relative;
      z-index: 1;

      &:hover {
        transform: translateX(8px);
        z-index: 2;

        .article-title {
          @include mixins.text-gradient("primary", "light");

          .theme-dark & {
            @include mixins.text-gradient("primary", "dark");
          }
        }

        .read-more {
          transform: translateX(5px);
        }
      }
    }
  }

  .modal-enhanced {
    :deep(.modal-backdrop) {
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      @include mixins.themed(background-color, shadow-color);
    }

    :deep(.modal-content) {
      @include mixins.card-style($theme: "light", $padding: "large");
      @include animations.fade-in(0.4s);
      max-width: 600px;
      margin: auto;

      .theme-dark & {
        @include mixins.card-style($theme: "dark", $padding: "large");
      }
    }
  }
}

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

@include mixins.responsive(tablet) {
  .overview-dashboard {
    padding: map.get(vars.$spacing, m);
    gap: map.get(vars.$spacing, l);

    .dashboard-section {
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
</style>
