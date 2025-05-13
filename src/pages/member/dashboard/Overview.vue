<!-- src/components/member/dashboard/Overview.vue -->
<template>
  <div class="overview-dashboard">
    <!-- Willkommenssektion mit CTA-Button -->
    <welcome-section @open-author-modal="toggleAuthorModal" />

    <!-- Statistik-Karten -->
    <stats-cards :stats="stats" />

    <!-- Hauptinhaltsbereich mit klarer Trennung -->
    <div class="dashboard-content">
      <!-- Aktivitäten-Sektion -->
      <recent-activities 
        :articles="recentArticles" 
        @view-all="goToMyArticles" 
        @discover="goToDiscovery"
        @open-article="openArticle"
      />

      <!-- Empfehlungen-Sektion -->
      <recommended-articles 
        :articles="recommendedArticles" 
        @open-article="openArticle" 
      />
    </div>

    <!-- Modal für Autor-Bewerbung -->
    <author-application-modal 
      :show-modal="showAuthorModal"
      @close="toggleAuthorModal"
      @submit="submitAuthorApplication"
    />
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

    // Statistiken
    const stats = ref([
      { icon: '📚', label: 'Gelesene Artikel', value: '12', color: 'rgba(74, 210, 149, 0.2)' },
      { icon: '⭐', label: 'Favoriten', value: '5', color: 'rgba(255, 212, 96, 0.2)' },
      { icon: '👥', label: 'Freunde', value: '3', color: 'rgba(53, 204, 208, 0.2)' },
    ]);

    // Zuletzt gelesene Artikel mit Kapitel/Seiten statt Prozent
    const recentArticles = ref<Article[]>([
      {
        id: 1,
        title: 'Erziehungsstile im Vergleich: Welcher passt zu Ihrer Familie?',
        status: 'in-progress',
        currentChapter: 4,
        totalChapters: 6,
        lastRead: 'Gestern'
      },
      {
        id: 2,
        title: 'Gesunde Ernährung für Kleinkinder: Ein praktischer Leitfaden',
        status: 'just-started',
        currentChapter: 1,
        totalChapters: 8,
        lastRead: 'Vor 3 Tagen'
      },
      {
        id: 4,
        title: 'Grenzen setzen ohne Konflikte: Effektive Kommunikation mit Kindern',
        status: 'almost-done',
        currentChapter: 5,
        totalChapters: 6,
        lastRead: 'Vor einer Woche'
      }
    ]);

    // Empfohlene Artikel
    const recommendedArticles = ref<Article[]>([
      {
        id: 3,
        title: 'Digitale Medien im Kindesalter: Fluch oder Segen?',
        preview: 'Eine ausgewogene Betrachtung der Vor- und Nachteile digitaler Medien für Kinder.',
        category: 'Medien',
        author: 'Prof. Thomas Becker',
        date: '28.04.2025'
      },
      {
        id: 5,
        title: 'Die Phasen der kindlichen Entwicklung verstehen',
        preview: 'Erfahren Sie, wie Sie Ihr Kind in jeder Entwicklungsphase optimal unterstützen können.',
        category: 'Entwicklung',
        author: 'Dr. Maria Schmidt',
        date: '15.04.2025'
      },
      {
        id: 6,
        title: 'Wie Musik die kognitive Entwicklung fördert',
        preview: 'Neue Studien zeigen den positiven Einfluss von Musikunterricht auf die Gehirnentwicklung.',
        category: 'Bildung',
        author: 'Julia Wagner',
        date: '10.04.2025'
      }
    ]);

    // Modal öffnen/schließen
    const toggleAuthorModal = () => {
      showAuthorModal.value = !showAuthorModal.value;
    };

    // Formular absenden
    const submitAuthorApplication = async (data: any) => {
      isSubmitting.value = true;

      try {
        // Simuliere API-Aufruf mit Verzögerung
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log('Autor-Bewerbung wurde erfolgreich gesendet:', data);

        // Erfolgsmeldung anzeigen
        alert('Vielen Dank für deine Bewerbung! Wir werden deine Unterlagen prüfen und uns in Kürze bei dir melden.');

      } catch (error) {
        console.error('Fehler beim Senden der Autor-Bewerbung:', error);
        alert('Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.');
      } finally {
        isSubmitting.value = false;
      }
    };

    // Artikel öffnen (Platzhalter)
    const openArticle = (article: Article) => {
      console.log('Artikel öffnen:', article.title);
      // Hier später Implementierung für Artikel-Ansicht
      alert(`Artikel "${article.title}" wird geöffnet...`);
    };

    // Navigation zu anderen Dashboardbereichen
    const goToMyArticles = () => {
      router.push({ name: 'MemberDashboard', query: { tab: 'my-articles' } });
    };

    const goToDiscovery = () => {
      // Hier könnte eine eigene Entdecken-Seite oder ein bestimmter Tab angesteuert werden
      router.push({ name: 'MemberDashboard', query: { tab: 'favorites' } });
    };

    // Benutzerdaten beim Mounten laden
    onMounted(() => {
      const userData = authService.getUserData();
      if (userData && userData.name) {
        userName.value = userData.name.split(' ')[0]; // Nur Vorname verwenden
      }

      // Hier später API-Aufruf für Dashboard-Daten
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

.overview-dashboard {
  @include animations.fade-in(0.5s);
  display: flex;
  flex-direction: column;
  gap: map.get(vars.$spacing, xl);

  // Hauptinhaltsbereich
  .dashboard-content {
    display: flex;
    flex-direction: column;
    gap: map.get(vars.$spacing, xxl); // Größerer Abstand für bessere Trennung
  }
}
</style>