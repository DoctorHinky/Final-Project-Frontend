<!-- src/components/admin/authors/AuthorList.vue -->
<template>
  <div class="author-list-container">
    <div class="list-header">
      <h2>Alle Autoren</h2>
      <div class="header-actions">
        <div class="search-container">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Autor suchen..." 
            class="search-input"
            @keyup.enter="performSearch"
          />
          <button class="search-button" @click="performSearch">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <span>Autoren werden geladen...</span>
    </div>

    <div v-else-if="filteredAuthors.length === 0" class="no-results">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
      <p>Keine Autoren gefunden</p>
    </div>

    <div v-else class="authors-grid">
      <div class="author-card" v-for="author in filteredAuthors" :key="author.id" @click="viewUserDetails(author.id)">
        <div class="author-header">
          <div class="author-avatar">
            <span v-if="!author.avatarUrl">{{ getUserInitials(author) }}</span>
            <img v-else :src="author.avatarUrl" :alt="`Avatar von ${author.name}`" />
          </div>
          <div class="author-stats">
            <div class="stat-item">
              <span class="stat-value">{{ author.stats.articlesWritten }}</span>
              <span class="stat-label">Artikel</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ author.stats.totalViews }}</span>
              <span class="stat-label">Aufrufe</span>
            </div>
          </div>
        </div>
        <div class="author-info">
          <h3 class="author-name">{{ author.name }}</h3>
          <p class="author-expertise">{{ author.expertise }}</p>
          <p class="author-bio">{{ truncateBio(author.authorBio) }}</p>
        </div>
        <div class="author-footer">
          <div class="author-since">
            Autor seit {{ formatDate(author.authorSince) }}
          </div>
          <button class="view-details-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span>Details</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';

interface AuthorStats {
  articlesWritten: number;
  totalViews: number;
}

interface Author {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  authorBio: string;
  authorSince: Date;
  expertise: string;
  stats: AuthorStats;
}

export default defineComponent({
  name: 'AuthorList',
  emits: ['user-selected'],
  setup(props, { emit }) {
    const authors = ref<Author[]>([]);
    const isLoading = ref(true);
    const searchQuery = ref('');

    // Autoren laden (Dummy-Implementierung)
    onMounted(() => {
      // Simuliere API-Abruf
      setTimeout(() => {
        authors.value = [
          {
            id: 'usr_002',
            name: 'Anna Schmidt',
            email: 'anna@example.com',
            authorBio: 'Anna ist eine leidenschaftliche Erzieherin mit über 10 Jahren Erfahrung. Sie hat zwei eigene Kinder und ist spezialisiert auf frühkindliche Entwicklung und Lernmethoden.',
            authorSince: new Date('2023-01-10'),
            expertise: 'Frühkindliche Entwicklung',
            stats: {
              articlesWritten: 15,
              totalViews: 2850
            }
          },
          {
            id: 'usr_004',
            name: 'Lisa Wagner',
            email: 'lisa@example.com',
            authorBio: 'Als Kinderpsychologin mit einer Praxis in Berlin hat Lisa besondere Expertise im Umgang mit Verhaltensauffälligkeiten und Lernstörungen bei Kindern.',
            authorSince: new Date('2022-08-05'),
            expertise: 'Kinderpsychologie',
            stats: {
              articlesWritten: 23,
              totalViews: 4120
            }
          },
          {
            id: 'usr_008',
            name: 'Laura Meyer',
            email: 'laura@example.com',
            authorBio: 'Laura ist Grundschullehrerin und Entwicklerin von kreativen Lernmaterialien. Ihre Spezialität sind innovative Unterrichtsmethoden, die Spaß machen und gleichzeitig effektiv sind.',
            authorSince: new Date('2023-03-22'),
            expertise: 'Kreative Lernmethoden',
            stats: {
              articlesWritten: 8,
              totalViews: 1240
            }
          },
          {
            id: 'usr_012',
            name: 'Nina Schneider',
            email: 'nina@example.com',
            authorBio: 'Nina ist Ernährungsberaterin mit Fokus auf Kinderernährung. Sie teilt praktische Tipps für gesunde, kinderfreundliche Mahlzeiten und hilft Eltern bei Ernährungsproblemen.',
            authorSince: new Date('2023-05-18'),
            expertise: 'Kinderernährung',
            stats: {
              articlesWritten: 12,
              totalViews: 1850
            }
          },
          {
            id: 'usr_016',
            name: 'Franziska Richter',
            email: 'franziska@example.com',
            authorBio: 'Als Familientherapeutin konzentriert sich Franziska auf die Verbesserung der Eltern-Kind-Beziehung. Sie schreibt über effektive Kommunikation und Konfliktlösung in Familien.',
            authorSince: new Date('2022-11-30'),
            expertise: 'Familientherapie',
            stats: {
              articlesWritten: 19,
              totalViews: 3280
            }
          }
        ];
        isLoading.value = false;
      }, 1000);
    });

    // Suche durchführen
    const performSearch = () => {
      // In einer echten Anwendung würde hier eine API-Anfrage erfolgen
      // Hier filtern wir nur lokal
    };

    // Gefilterte Autoren basierend auf der Suchabfrage
    const filteredAuthors = computed(() => {
      if (!searchQuery.value.trim()) {
        return authors.value;
      }
      
      const query = searchQuery.value.toLowerCase();
      return authors.value.filter(author => 
        author.name.toLowerCase().includes(query) || 
        author.expertise.toLowerCase().includes(query) ||
        author.authorBio.toLowerCase().includes(query)
      );
    });

    // Biografie kürzen für die Kartenansicht
    const truncateBio = (bio: string): string => {
      if (bio.length <= 100) return bio;
      return bio.substring(0, 100) + '...';
    };

    // Benutzerdetails anzeigen
    const viewUserDetails = (userId: string) => {
      emit('user-selected', userId);
    };

    // Benutzer-Initialen generieren
    const getUserInitials = (author: Author): string => {
      if (!author.name) return '??';
      
      const nameParts = author.name.split(' ');
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      }
      
      return nameParts[0].substring(0, 2).toUpperCase();
    };

    // Datum formatieren
    const formatDate = (date: Date): string => {
      return new Date(date).toLocaleDateString('de-DE', {
        month: 'long',
        year: 'numeric'
      });
    };

    return {
      authors,
      isLoading,
      searchQuery,
      filteredAuthors,
      performSearch,
      truncateBio,
      viewUserDetails,
      getUserInitials,
      formatDate
    };
  }
});
</script>

<style lang="scss" scoped>
.author-list-container {
  background-color: #222;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  padding: 24px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  border: 1px solid #333;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 16px;
  
  h2 {
    font-size: 1.5rem;
    margin: 0;
    color: #f0f0f0;
  }
  
  .header-actions {
    display: flex;
    gap: 12px;
    
    .search-container {
      display: flex;
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #444;
      transition: all 0.3s ease;
      
      &:focus-within {
        border-color: #666;
        box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.2);
      }
      
      .search-input {
        padding: 10px 16px;
        background-color: #2a2a2a;
        border: none;
        color: #f0f0f0;
        font-size: 0.9rem;
        width: 220px;
        
        &:focus {
          outline: none;
        }
        
        &::placeholder {
          color: #777;
        }
      }
      
      .search-button {
        background-color: #333;
        border: none;
        padding: 0 16px;
        cursor: pointer;
        color: #f0f0f0;
        
        &:hover {
          background-color: #444;
        }
      }
    }
  }
}

.loading-container, .no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 16px;
  color: #a0a0a0;
  text-align: center;
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    border-top-color: #ff9800;
    animation: spin 1s linear infinite;
  }
  
  svg {
    opacity: 0.5;
  }
  
  p {
    font-size: 1.1rem;
    margin: 0;
  }
}

.authors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  
  .author-card {
    background-color: #1c1c1c;
    border-radius: 8px;
    border: 1px solid #333;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
      border-color: #555;
    }
    
    .author-header {
      background-color: #262626;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #333;
      
      .author-avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: #444;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 1.5rem;
        overflow: hidden;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      
      .author-stats {
        display: flex;
        gap: 16px;
        
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          
          .stat-value {
            font-size: 1.2rem;
            font-weight: bold;
            color: #ff9800;
          }
          
          .stat-label {
            font-size: 0.8rem;
            color: #a0a0a0;
          }
        }
      }
    }
    
    .author-info {
      padding: 20px;
      flex: 1;
      
      .author-name {
        margin: 0 0 5px 0;
        font-size: 1.2rem;
        color: #f0f0f0;
      }
      
      .author-expertise {
        margin: 0 0 12px 0;
        font-size: 0.9rem;
        color: #ff9800;
      }
      
      .author-bio {
        margin: 0;
        font-size: 0.9rem;
        color: #a0a0a0;
        line-height: 1.5;
      }
    }
    
    .author-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      background-color: #262626;
      border-top: 1px solid #333;
      
      .author-since {
        font-size: 0.8rem;
        color: #888;
      }
      
      .view-details-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background-color: rgba(0, 120, 215, 0.2);
        color: #0078d7;
        border: none;
        border-radius: 4px;
        font-size: 0.8rem;
        cursor: pointer;
        
        &:hover {
          background-color: rgba(0, 120, 215, 0.3);
        }
      }
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .list-header {
    flex-direction: column;
    align-items: flex-start;
    
    .header-actions {
      width: 100%;
      
      .search-container {
        width: 100%;
        
        .search-input {
          width: 100%;
        }
      }
    }
  }
}
</style>