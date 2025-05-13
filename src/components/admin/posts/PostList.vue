<!-- src/components/admin/posts/PostList.vue -->
<template>
  <div class="post-list-container">
    <div class="list-header">
      <h2>Active Posts</h2>
      <div class="header-actions">
        <div class="filter-container">
          <select v-model="statusFilter" class="filter-select">
            <option value="all">Alle Posts</option>
            <option value="published">Veröffentlicht</option>
            <option value="pending">Ausstehend</option>
            <option value="draft">Entwurf</option>
            <option value="reported">Gemeldet</option>
          </select>
        </div>
        <div class="search-container">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Artikel suchen..." 
            class="search-input"
          />
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <span>Artikel werden geladen...</span>
    </div>

    <div v-else-if="filteredPosts.length === 0" class="no-results">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
      <p>Keine Artikel gefunden</p>
    </div>

    <div v-else class="posts-table-wrapper">
      <table class="posts-table">
        <thead>
          <tr>
            <th class="col-title">Titel</th>
            <th class="col-author">Autor</th>
            <th class="col-category">Kategorie</th>
            <th class="col-date">Veröffentlicht</th>
            <th class="col-status">Status</th>
            <th class="col-views">Aufrufe</th>
            <th class="col-actions">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="post in paginatedPosts" :key="post.id" class="post-row">
            <td class="col-title">
              <div class="post-title-cell">
                <div class="post-thumbnail" v-if="post.thumbnail">
                  <img :src="post.thumbnail" :alt="post.title" />
                </div>
                <div class="post-title-text">
                  <span class="post-title">{{ post.title }}</span>
                  <span class="post-excerpt">{{ truncateExcerpt(post.excerpt) }}</span>
                </div>
              </div>
            </td>
            <td class="col-author">
              <div class="author-cell">
                <div class="author-avatar">
                  <span v-if="!post.author.avatarUrl">{{ getAuthorInitials(post.author) }}</span>
                  <img v-else :src="post.author.avatarUrl" :alt="`Avatar von ${post.author.name}`" />
                </div>
                <span>{{ post.author.name }}</span>
              </div>
            </td>
            <td class="col-category">
              <span class="post-category">{{ post.category }}</span>
            </td>
            <td class="col-date">{{ formatDate(post.publishedAt) }}</td>
            <td class="col-status">
              <span 
                class="status-badge" 
                :class="post.status"
              >
                {{ getStatusText(post.status) }}
              </span>
              <span v-if="post.status === 'reported'" class="report-count">
                {{ post.reportCount }} Meldung{{ post.reportCount > 1 ? 'en' : '' }}
              </span>
            </td>
            <td class="col-views">{{ formatNumber(post.views) }}</td>
            <td class="col-actions">
              <div class="actions-container">
                <button class="action-button view-button" @click="viewPost(post.id)" title="Artikel ansehen">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
                <button 
                  class="action-button status-button" 
                  @click="togglePostStatus(post)" 
                  :title="post.status === 'published' ? 'Artikel deaktivieren' : 'Artikel veröffentlichen'"
                >
                  <svg v-if="post.status === 'published'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect>
                    <circle cx="16" cy="12" r="3"></circle>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect>
                    <circle cx="8" cy="12" r="3"></circle>
                  </svg>
                </button>
                <button v-if="post.status === 'reported'" class="action-button dismiss-button" @click="dismissReports(post)" title="Meldungen abweisen">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="pagination-container" v-if="totalPages > 1">
      <button 
        class="pagination-button" 
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      
      <span class="page-info">Seite {{ currentPage }} von {{ totalPages }}</span>
      
      <button 
        class="pagination-button" 
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>

    <!-- Detailansicht für Reports (als Modal) -->
    <div class="modal-overlay" v-if="showReportDetails" @click="closeReportDetails">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>Meldungen für: "{{ selectedPost ? selectedPost.title : '' }}"</h3>
          <button class="close-button" @click="closeReportDetails">×</button>
        </div>
        <div class="modal-content">
          <div class="reports-list" v-if="selectedPost && selectedPost.reports">
            <div class="report-item" v-for="(report, index) in selectedPost.reports" :key="index">
              <div class="report-header">
                <div class="reporter-info">
                  <span class="reporter-name">{{ report.reporterName }}</span>
                  <span class="report-date">{{ formatDate(report.reportedAt) }}</span>
                </div>
                <span class="report-reason">{{ report.reason }}</span>
              </div>
              <div class="report-description">
                {{ report.description }}
              </div>
            </div>
          </div>
          <div class="reports-actions">
            <button class="dismiss-all-button" @click="dismissReports(selectedPost)">
              Alle Meldungen abweisen
            </button>
            <button class="remove-article-button" @click="changePostStatus(selectedPost, 'draft')">
              Artikel deaktivieren
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';

interface Author {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface Report {
  reporterName: string;
  reportedAt: Date;
  reason: string;
  description: string;
}

interface Post {
  id: string;
  title: string;
  excerpt: string;
  thumbnail?: string;
  author: Author;
  category: string;
  publishedAt: Date | null;
  status: 'published' | 'pending' | 'draft' | 'reported';
  views: number;
  reportCount?: number;
  reports?: Report[];
}

export default defineComponent({
  name: 'PostList',
  setup() {
    const posts = ref<Post[]>([]);
    const isLoading = ref(true);
    const searchQuery = ref('');
    const statusFilter = ref('all');
    const currentPage = ref(1);
    const itemsPerPage = 10;
    
    // Modal für Meldungen
    const showReportDetails = ref(false);
    const selectedPost = ref<Post | null>(null);

    // Artikel laden (Dummy-Implementierung)
    onMounted(() => {
      // Simuliere API-Abruf
      setTimeout(() => {
        posts.value = [
          {
            id: 'post_001',
            title: 'Die 10 besten Spiele für die kindliche Entwicklung',
            excerpt: 'Entdecken Sie Spiele, die nicht nur Spaß machen, sondern auch die kognitive und motorische Entwicklung fördern.',
            thumbnail: 'https://via.placeholder.com/100x60',
            author: { id: 'usr_002', name: 'Anna Schmidt' },
            category: 'Spielen & Lernen',
            publishedAt: new Date('2024-04-15'),
            status: 'published',
            views: 2340
          },
          {
            id: 'post_002',
            title: 'Gesunde Ernährung für Kleinkinder',
            excerpt: 'Tipps für eine ausgewogene Ernährung und wie man Kinder dazu bringt, gesundes Essen zu mögen.',
            author: { id: 'usr_012', name: 'Nina Schneider' },
            category: 'Ernährung',
            publishedAt: new Date('2024-05-02'),
            status: 'published',
            views: 1876
          },
          {
            id: 'post_003',
            title: 'Umgang mit Wutanfällen bei Zweijährigen',
            excerpt: 'Strategien für Eltern, um mit den emotionalen Ausbrüchen von Kleinkindern umzugehen.',
            thumbnail: 'https://via.placeholder.com/100x60',
            author: { id: 'usr_004', name: 'Lisa Wagner' },
            category: 'Erziehung',
            publishedAt: new Date('2024-04-28'),
            status: 'reported',
            views: 3452,
            reportCount: 3,
            reports: [
              {
                reporterName: 'Max Müller',
                reportedAt: new Date('2024-05-10'),
                reason: 'Unangemessene Inhalte',
                description: 'Der Artikel empfiehlt physische Bestrafung, was gegen die Gemeinschaftsrichtlinien verstößt.'
              },
              {
                reporterName: 'Sarah Klein',
                reportedAt: new Date('2024-05-09'),
                reason: 'Falschinformation',
                description: 'Enthält veraltete und potenziell schädliche Erziehungsratschläge.'
              },
              {
                reporterName: 'Thomas Weber',
                reportedAt: new Date('2024-05-11'),
                reason: 'Sonstiges',
                description: 'Der Artikel steht im Widerspruch zu wissenschaftlichen Erkenntnissen der Kinderpsychologie.'
              }
            ]
          },
          {
            id: 'post_004',
            title: 'Kreative Bastelaktivitäten für Regentage',
            excerpt: 'Einfache und unterhaltsame Bastelideen, die Sie mit Ihren Kindern an verregneten Tagen durchführen können.',
            thumbnail: 'https://via.placeholder.com/100x60',
            author: { id: 'usr_008', name: 'Laura Meyer' },
            category: 'Kreativität',
            publishedAt: null,
            status: 'draft',
            views: 0
          },
          {
            id: 'post_005',
            title: 'Die Bedeutung von Routinen für Kinder',
            excerpt: 'Warum feste Tagesabläufe wichtig für die Entwicklung sind und wie Sie diese in Ihren Alltag integrieren können.',
            author: { id: 'usr_016', name: 'Franziska Richter' },
            category: 'Erziehung',
            publishedAt: null,
            status: 'pending',
            views: 0
          },
          {
            id: 'post_006',
            title: 'Sprachentwicklung bei Kindern von 0-3 Jahren',
            excerpt: 'Meilensteine der Sprachentwicklung und wie Eltern diese optimal fördern können.',
            author: { id: 'usr_002', name: 'Anna Schmidt' },
            category: 'Entwicklung',
            publishedAt: new Date('2024-03-20'),
            status: 'published',
            views: 4213
          },
          {
            id: 'post_007',
            title: 'Schlaftraining für Babys: Pro und Contra',
            excerpt: 'Eine differenzierte Betrachtung verschiedener Schlaftrainingsmethoden und ihrer Auswirkungen.',
            thumbnail: 'https://via.placeholder.com/100x60',
            author: { id: 'usr_004', name: 'Lisa Wagner' },
            category: 'Schlaf',
            publishedAt: new Date('2024-04-10'),
            status: 'reported',
            views: 5387,
            reportCount: 2,
            reports: [
              {
                reporterName: 'Julia Schmidt',
                reportedAt: new Date('2024-05-08'),
                reason: 'Falschinformation',
                description: 'Der Artikel enthält veraltete Informationen, die nicht mehr dem aktuellen Forschungsstand entsprechen.'
              },
              {
                reporterName: 'Michael Bauer',
                reportedAt: new Date('2024-05-12'),
                reason: 'Potentiell gefährliche Ratschläge',
                description: 'Einige der empfohlenen Methoden könnten für die psychische Entwicklung des Kindes schädlich sein.'
              }
            ]
          }
        ];
        isLoading.value = false;
      }, 1000);
    });

    // Gefilterte Artikel basierend auf Suche und Filter
    const filteredPosts = computed(() => {
      let result = [...posts.value];
      
      // Filter nach Status
      if (statusFilter.value !== 'all') {
        result = result.filter(post => post.status === statusFilter.value);
      }
      
      // Filter nach Suchbegriff
      if (searchQuery.value.trim() !== '') {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(post => 
          post.title.toLowerCase().includes(query) || 
          post.excerpt.toLowerCase().includes(query) ||
          post.author.name.toLowerCase().includes(query) ||
          post.category.toLowerCase().includes(query)
        );
      }
      
      return result;
    });

    // Paginierte Artikel
    const paginatedPosts = computed(() => {
      const startIndex = (currentPage.value - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return filteredPosts.value.slice(startIndex, endIndex);
    });

    // Gesamtzahl der Seiten
    const totalPages = computed(() => {
      return Math.ceil(filteredPosts.value.length / itemsPerPage);
    });

    // Bei Änderung des Filters oder der Suche zur ersten Seite zurückkehren
    watch([statusFilter, searchQuery], () => {
      currentPage.value = 1;
    });

    // Autor-Initialen generieren
    const getAuthorInitials = (author: Author): string => {
      if (!author.name) return '??';
      
      const nameParts = author.name.split(' ');
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      }
      
      return nameParts[0].substring(0, 2).toUpperCase();
    };

    // Auszug kürzen
    const truncateExcerpt = (excerpt: string): string => {
      if (excerpt.length <= 80) return excerpt;
      return excerpt.substring(0, 80) + '...';
    };

    // Datum formatieren
    const formatDate = (date: Date | null): string => {
      if (!date) return '-';
      
      return new Date(date).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    // Zahlen formatieren
    const formatNumber = (number: number): string => {
      return number.toLocaleString('de-DE');
    };

    // Statustext abrufen
    const getStatusText = (status: string): string => {
      switch (status) {
        case 'published': return 'Veröffentlicht';
        case 'pending': return 'Ausstehend';
        case 'draft': return 'Entwurf';
        case 'reported': return 'Gemeldet';
        default: return status;
      }
    };

    // Artikelstatus ändern
    const changePostStatus = (post: Post | null, newStatus: 'published' | 'pending' | 'draft' | 'reported') => {
      if (!post) return;
      
      // Post-Objekt im Array finden und aktualisieren
      const index = posts.value.findIndex(p => p.id === post.id);
      if (index !== -1) {
        posts.value[index].status = newStatus;
        
        // Wenn auf "published" gestellt, Veröffentlichungsdatum setzen
        if (newStatus === 'published' && !posts.value[index].publishedAt) {
          posts.value[index].publishedAt = new Date();
        }
        
        // Wenn gemeldet, reportCount zurücksetzen
        if (post.status === 'reported' && newStatus !== 'reported') {
          posts.value[index].reportCount = 0;
          posts.value[index].reports = [];
        }
      }
      
      // Modal schließen, wenn geöffnet
      showReportDetails.value = false;
      selectedPost.value = null;
    };

    // Artikelstatus umschalten
    const togglePostStatus = (post: Post) => {
      if (post.status === 'published') {
        changePostStatus(post, 'draft');
      } else {
        changePostStatus(post, 'published');
      }
    };

    // Meldungen abweisen
    const dismissReports = (post: Post | null) => {
      if (!post) return;
      
      // Falls der Artikel gemeldet war, auf "veröffentlicht" zurücksetzen
      if (post.status === 'reported') {
        changePostStatus(post, 'published');
      }
    };

    // Artikel anzeigen
    const viewPost = (postId: string) => {
      // Hier würde normalerweise eine Weiterleitung oder Modal-Öffnung erfolgen
      console.log(`Artikel ${postId} anzeigen`);
      
      // Für gemeldete Artikel das Reports-Modal öffnen
      const post = posts.value.find(p => p.id === postId);
      if (post && post.status === 'reported') {
        selectedPost.value = post;
        showReportDetails.value = true;
      }
    };

    // Report-Modal schließen
    const closeReportDetails = () => {
      showReportDetails.value = false;
      selectedPost.value = null;
    };

    return {
      posts,
      isLoading,
      searchQuery,
      statusFilter,
      filteredPosts,
      paginatedPosts,
      currentPage,
      totalPages,
      showReportDetails,
      selectedPost,
      getAuthorInitials,
      truncateExcerpt,
      formatDate,
      formatNumber,
      getStatusText,
      togglePostStatus,
      dismissReports,
      viewPost,
      closeReportDetails,
      changePostStatus
    };
  }
});
</script>

<style lang="scss" scoped>
.post-list-container {
  background-color: #222;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  padding: 24px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
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
    align-items: center;
    flex-wrap: wrap;
    
    .filter-container {
      .filter-select {
        padding: 8px 12px;
        background-color: #2a2a2a;
        border: 1px solid #444;
        border-radius: 4px;
        color: #f0f0f0;
        font-size: 0.9rem;
        cursor: pointer;
        
        &:focus {
          outline: none;
          border-color: #666;
        }
        
        option {
          background-color: #2a2a2a;
        }
      }
    }
    
    .search-container {
      .search-input {
        padding: 8px 12px;
        background-color: #2a2a2a;
        border: 1px solid #444;
        border-radius: 4px;
        color: #f0f0f0;
        font-size: 0.9rem;
        width: 200px;
        
        &:focus {
          outline: none;
          border-color: #666;
        }
        
        &::placeholder {
          color: #777;
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

.posts-table-wrapper {
  overflow-x: auto;
  border-radius: 6px;
  border: 1px solid #333;
  
  .posts-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    
    th, td {
      padding: 12px 16px;
      border-bottom: 1px solid #333;
    }
    
    th {
      background-color: #262626;
      color: #a0a0a0;
      font-weight: 500;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    
    .post-row {
      transition: all 0.3s ease;
      
      &:hover {
        background-color: #2a2a2a;
      }
      
      td {
        color: #f0f0f0;
      }
    }
    
    .col-title {
      min-width: 300px;
      
      .post-title-cell {
        display: flex;
        gap: 12px;
        
        .post-thumbnail {
          width: 60px;
          height: 40px;
          background-color: #333;
          border-radius: 4px;
          overflow: hidden;
          flex-shrink: 0;
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
        
        .post-title-text {
          display: flex;
          flex-direction: column;
          
          .post-title {
            font-weight: 500;
            margin-bottom: 4px;
          }
          
          .post-excerpt {
            color: #a0a0a0;
            font-size: 0.85rem;
          }
        }
      }
    }
    
    .col-author {
      min-width: 150px;
      
      .author-cell {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .author-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: #444;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          font-size: 0.8rem;
          overflow: hidden;
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }
    }
    
    .col-category {
      .post-category {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        background-color: #333;
        color: #a0a0a0;
        font-size: 0.85rem;
      }
    }
    
    .col-date, .col-views {
      color: #a0a0a0;
      font-size: 0.9rem;
    }
    
    .col-status {
      .status-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        text-align: center;
        
        &.published {
          background-color: rgba(46, 204, 113, 0.2);
          color: #2ecc71;
        }
        
        &.pending {
          background-color: rgba(243, 156, 18, 0.2);
          color: #f39c12;
        }
        
        &.draft {
          background-color: rgba(149, 165, 166, 0.2);
          color: #95a5a6;
        }
        
        &.reported {
          background-color: rgba(231, 76, 60, 0.2);
          color: #e74c3c;
        }
      }
      
      .report-count {
        display: block;
        font-size: 0.8rem;
        color: #e74c3c;
        margin-top: 4px;
      }
    }
    
    .col-actions {
      .actions-container {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        
        .action-button {
          width: 32px;
          height: 32px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background-color: #333;
          color: #a0a0a0;
          cursor: pointer;
          transition: all 0.3s ease;
          
          &:hover {
            background-color: #444;
            color: #f0f0f0;
          }
          
          &.view-button {
            background-color: rgba(0, 120, 215, 0.2);
            color: #0078d7;
            
            &:hover {
              background-color: rgba(0, 120, 215, 0.3);
            }
          }
          
          &.status-button {
            background-color: rgba(46, 204, 113, 0.2);
            color: #2ecc71;
            
            &:hover {
              background-color: rgba(46, 204, 113, 0.3);
            }
          }
          
          &.dismiss-button {
            background-color: rgba(231, 76, 60, 0.2);
            color: #e74c3c;
            
            &:hover {
              background-color: rgba(231, 76, 60, 0.3);
            }
          }
        }
      }
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  
  .pagination-button {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #444;
    background-color: #2a2a2a;
    color: #f0f0f0;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover:not(:disabled) {
      background-color: #333;
      border-color: #666;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  
  .page-info {
    color: #a0a0a0;
    font-size: 0.9rem;
  }
}

// Modal Styles
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  backdrop-filter: blur(3px);
}

.modal-container {
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  background-color: #222;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid #444;
  animation: modal-appear 0.3s ease-out;
}

.modal-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #333;
  background-color: #262626;

  h3 {
    margin: 0;
    color: #fff;
    font-size: 1.2rem;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #888;
    cursor: pointer;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
  }
}

.modal-content {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
  
  .reports-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    
    .report-item {
      background-color: #1c1c1c;
      border-radius: 8px;
      padding: 16px;
      border: 1px solid #333;
      
      .report-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        
        .reporter-info {
          .reporter-name {
            font-weight: 500;
            color: #f0f0f0;
          }
          
          .report-date {
            color: #a0a0a0;
            font-size: 0.85rem;
            margin-left: 8px;
          }
        }
        
        .report-reason {
          background-color: rgba(231, 76, 60, 0.2);
          color: #e74c3c;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.85rem;
        }
      }
      
      .report-description {
        color: #d0d0d0;
        line-height: 1.5;
      }
    }
  }
  
  .reports-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    
    button {
      padding: 10px 16px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
      
      &.dismiss-all-button {
        background-color: #333;
        color: #f0f0f0;
        
        &:hover {
          background-color: #444;
        }
      }
      
      &.remove-article-button {
        background-color: rgba(231, 76, 60, 0.2);
        color: #e74c3c;
        
        &:hover {
          background-color: rgba(231, 76, 60, 0.3);
        }
      }
    }
  }
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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
      justify-content: space-between;
      
      .search-container .search-input {
        width: 100%;
      }
    }
  }
  
  .posts-table {
    .col-category, .col-date, .col-views {
      display: none;
    }
  }
  
  .reports-actions {
    flex-direction: column;
    gap: 12px;
    
    button {
      width: 100%;
    }
  }
}
</style>