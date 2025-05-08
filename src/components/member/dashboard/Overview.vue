<!-- src/components/member/dashboard/Overview.vue -->
<template>
  <div class="overview-dashboard">
    <div class="welcome-message">
      <h2>Willkommen zurück, {{ userName }}!</h2>
      <p>Hier ist deine Übersicht für {{ currentDate }}</p>
    </div>
    
    <!-- Statistik-Karten -->
    <div class="stats-cards">
      <div class="stat-card" v-for="(stat, index) in stats" :key="index">
        <div class="stat-icon" :style="{ backgroundColor: stat.color }">
          <span>{{ stat.icon }}</span>
        </div>
        <div class="stat-info">
          <h3>{{ stat.value }}</h3>
          <p>{{ stat.label }}</p>
        </div>
      </div>
    </div>
    
    <!-- Hauptinhaltsbereich mit klarer Trennung -->
    <div class="dashboard-content">
      <!-- Aktivitäten-Sektion -->
      <div class="section-container recent-activities">
        <div class="section-header">
          <h3>Deine Lese-Aktivitäten</h3>
          <button class="view-all-button" @click="goToMyArticles">Alle anzeigen</button>
        </div>
        
        <!-- Keine Aktivitäten Fallback -->
        <div v-if="recentArticles.length === 0" class="empty-state">
          <p>Du hast noch keine Artikel gelesen. Entdecke jetzt neue Inhalte!</p>
          <button class="discover-button">Entdecken</button>
        </div>
        
        <!-- Liste der aktuellen Artikel mit Kapitel/Seiten-Angabe -->
        <div v-else class="article-progress-list">
          <div 
            v-for="(article, index) in recentArticles" 
            :key="index" 
            class="progress-item"
            @click="openArticle(article)"
          >
            <div class="article-status" :class="article.status"></div>
            <div class="progress-info">
              <h4>{{ article.title }}</h4>
              <div class="progress-meta">
                <span class="progress-chapter">
                  <span class="chapter-label">Fortschritt:</span>
                  <span class="chapter-progress">{{ article.currentChapter }}/{{ article.totalChapters }} Kapitel</span>
                </span>
                <span class="progress-date">{{ article.lastRead }}</span>
              </div>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: (article.currentChapter / article.totalChapters * 100) + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empfehlungen-Sektion mit klarer Trennung -->
      <div class="section-container recommendations">
        <div class="section-header">
          <h3>Empfohlen für dich</h3>
          <button class="view-all-button" @click="goToDiscovery">Alle Empfehlungen</button>
        </div>
        
        <!-- Liste der empfohlenen Artikel -->
        <div class="recommended-list">
          <div 
            v-for="(article, index) in recommendedArticles" 
            :key="index" 
            class="recommended-item"
            @click="openArticle(article)"
          >
            <div class="recommendation-tag">{{ article.category }}</div>
            <h4>{{ article.title }}</h4>
            <p class="article-preview">{{ article.preview }}</p>
            <div class="article-meta">
              <span class="article-author">{{ article.author }}</span>
              <span class="article-date">{{ article.date }}</span>
            </div>
            <button class="read-now-button">Jetzt lesen</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services/auth.service';

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
  setup() {
    const router = useRouter();
    const userName = ref('Mitglied');
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
    
    // Statistiken
    const stats = ref([
      { icon: '📚', label: 'Gelesene Artikel', value: '12', color: 'rgba(74, 210, 149, 0.2)' },
      { icon: '⭐', label: 'Favoriten', value: '5', color: 'rgba(255, 212, 96, 0.2)' },
      { icon: '👥', label: 'Freunde', value: '3', color: 'rgba(53, 204, 208, 0.2)' },
      { icon: '🏆', label: 'Punkte', value: '230', color: 'rgba(155, 225, 93, 0.2)' },
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
      userName,
      currentDate,
      stats,
      recentArticles,
      recommendedArticles,
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
  
  .welcome-message {
    margin-bottom: map.get(vars.$spacing, l);
    
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
  
  // Statistik-Karten
  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: map.get(vars.$spacing, l);
    margin-bottom: map.get(vars.$spacing, xl);
    
    .stat-card {
      display: flex;
      align-items: center;
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
            border-color: mixins.theme-color($theme, accent-green);
          }
        }
      }
      
      .stat-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: map.get(vars.$spacing, m);
        font-size: 1.5rem;
      }
      
      .stat-info {
        h3 {
          font-size: map.get(map.get(vars.$fonts, sizes), xl);
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
          margin: 0 0 map.get(vars.$spacing, xxs) 0;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }
        
        p {
          margin: 0;
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }
      }
    }
  }
  
  // Hauptinhaltsbereich
  .dashboard-content {
    display: flex;
    flex-direction: column;
    gap: map.get(vars.$spacing, xxl); // Größerer Abstand für bessere Trennung
    
    // Gemeinsame Stile für Sektionen
    .section-container {
      padding: map.get(vars.$spacing, xl);
      border-radius: map.get(map.get(vars.$layout, border-radius), large);
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, card-bg);
          border: 1px solid mixins.theme-color($theme, border-light);
        }
      }
      
      // Sektionsüberschrift
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: map.get(vars.$spacing, l);
        
        h3 {
          font-size: map.get(map.get(vars.$fonts, sizes), large);
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
          margin: 0;
          position: relative;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
              
              &::after {
                content: '';
                position: absolute;
                width: 40px;
                height: 3px;
                bottom: -8px;
                left: 0;
                background: mixins.theme-gradient($theme, primary);
                border-radius: 2px;
              }
            }
          }
        }
        
        .view-all-button {
          background: none;
          border: none;
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          cursor: pointer;
          display: flex;
          align-items: center;
          
          &::after {
            content: '→';
            margin-left: 5px;
            font-size: 1.2em;
          }
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, accent-teal);
              
              &:hover {
                color: mixins.theme-color($theme, accent-green);
              }
            }
          }
        }
      }
    }
    
    // Leerer Zustand
    .empty-state {
      text-align: center;
      padding: map.get(vars.$spacing, xl) 0;
      
      p {
        margin-bottom: map.get(vars.$spacing, l);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }
      
      .discover-button {
        padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        border: none;
        cursor: pointer;
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: mixins.theme-gradient($theme, primary);
            color: white;
            
            &:hover {
              transform: translateY(-2px);
              @include mixins.shadow('small', $theme);
            }
          }
        }
      }
    }
    
    // Aktivitäten-Sektion
    .recent-activities {
      margin-bottom: map.get(vars.$spacing, l);
      
      .article-progress-list {
        display: flex;
        flex-direction: column;
        gap: map.get(vars.$spacing, m);
        
        .progress-item {
          padding: map.get(vars.$spacing, m);
          border-radius: map.get(map.get(vars.$layout, border-radius), medium);
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
          padding-left: map.get(vars.$spacing, xl); // Platz für Status-Indikator
          
          // Status-Indikator links
          .article-status {
            position: absolute;
            left: map.get(vars.$spacing, s);
            top: 50%;
            transform: translateY(-50%);
            width: 8px;
            height: 50px;
            border-radius: 4px;
            
            &.just-started {
              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background-color: mixins.theme-color($theme, accent-yellow);
                }
              }
            }
            
            &.in-progress {
              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background-color: mixins.theme-color($theme, accent-teal);
                }
              }
            }
            
            &.almost-done {
              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background-color: mixins.theme-color($theme, accent-green);
                }
              }
            }
          }
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
              border: 1px solid mixins.theme-color($theme, border-light);
              
              &:hover {
                background-color: mixins.theme-color($theme, hover-color);
                border-color: mixins.theme-color($theme, border-medium);
                transform: translateX(5px);
              }
            }
          }
          
          .progress-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: map.get(vars.$spacing, s);
            
            @media (max-width: 768px) {
              flex-direction: column;
              align-items: flex-start;
              gap: map.get(vars.$spacing, xxs);
            }
            
            h4 {
              font-size: map.get(map.get(vars.$fonts, sizes), medium);
              font-weight: map.get(map.get(vars.$fonts, weights), bold);
              margin: 0;
              
              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, text-primary);
                }
              }
            }
            
            .progress-meta {
              display: flex;
              gap: map.get(vars.$spacing, m);
              
              .progress-chapter, .progress-date {
                font-size: map.get(map.get(vars.$fonts, sizes), small);
                
                @each $theme in ('light', 'dark') {
                  .theme-#{$theme} & {
                    color: mixins.theme-color($theme, text-tertiary);
                  }
                }
              }
              
              .progress-chapter {
                display: flex;
                align-items: center;
                gap: map.get(vars.$spacing, xxs);
                
                .chapter-label {
                  @each $theme in ('light', 'dark') {
                    .theme-#{$theme} & {
                      color: mixins.theme-color($theme, text-tertiary);
                    }
                  }
                }
                
                .chapter-progress {
                  font-weight: map.get(map.get(vars.$fonts, weights), bold);
                  
                  @each $theme in ('light', 'dark') {
                    .theme-#{$theme} & {
                      color: mixins.theme-color($theme, accent-green);
                    }
                  }
                }
              }
            }
          }
          
          .progress-bar {
            height: 6px;
            border-radius: 3px;
            overflow: hidden;
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background-color: mixins.theme-color($theme, border-light);
              }
            }
            
            .progress-fill {
              height: 100%;
              
              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background: mixins.theme-gradient($theme, primary);
                }
              }
            }
          }
        }
      }
    }
    
    // Empfehlungen-Sektion
    .recommendations {
      .recommended-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: map.get(vars.$spacing, l);
        
        @media (max-width: 768px) {
          grid-template-columns: 1fr;
        }
        
        .recommended-item {
          position: relative;
          padding: map.get(vars.$spacing, l);
          border-radius: map.get(map.get(vars.$layout, border-radius), medium);
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
              border: 1px solid mixins.theme-color($theme, border-light);
              
              &:hover {
                transform: translateY(-5px);
                @include mixins.shadow('medium', $theme);
                border-color: mixins.theme-color($theme, accent-teal);
              }
            }
          }
          
          .recommendation-tag {
            position: absolute;
            top: 10px;
            right: 10px;
            padding: map.get(vars.$spacing, xxs) map.get(vars.$spacing, s);
            border-radius: map.get(map.get(vars.$layout, border-radius), pill);
            font-size: map.get(map.get(vars.$fonts, sizes), small);
            font-weight: map.get(map.get(vars.$fonts, weights), medium);
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background: mixins.theme-gradient($theme, primary);
                color: white;
              }
            }
          }
          
          h4 {
            font-size: map.get(map.get(vars.$fonts, sizes), medium);
            font-weight: map.get(map.get(vars.$fonts, weights), bold);
            margin: 0 0 map.get(vars.$spacing, s) 0;
            padding-right: 80px; // Platz für Tag
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-primary);
              }
            }
          }
          
          .article-preview {
            font-size: map.get(map.get(vars.$fonts, sizes), small);
            margin-bottom: map.get(vars.$spacing, m);
            flex-grow: 1;
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-secondary);
              }
            }
          }
          
          .article-meta {
            display: flex;
            justify-content: space-between;
            font-size: map.get(map.get(vars.$fonts, sizes), small);
            margin-bottom: map.get(vars.$spacing, m);
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-tertiary);
              }
            }
            
            .article-author {
              font-weight: map.get(map.get(vars.$fonts, weights), medium);
            }
          }
          
          .read-now-button {
            padding: map.get(vars.$spacing, s) 0;
            border-radius: map.get(map.get(vars.$layout, border-radius), medium);
            border: none;
            cursor: pointer;
            font-weight: map.get(map.get(vars.$fonts, weights), medium);
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background: mixins.theme-gradient($theme, primary);
                color: white;
                
                &:hover {
                  transform: translateY(-2px);
                  @include mixins.shadow('small', $theme);
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>