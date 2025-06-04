<!-- src/components/admin/users/UserDetail.vue -->
<template>
  <div class="user-detail-container">
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>Benutzerdaten werden geladen...</span>
    </div>
    
    <div v-else-if="!user" class="error-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <h3>Benutzer nicht gefunden</h3>
      <p>Der angegebene Benutzer konnte nicht gefunden werden.</p>
    </div>
    
    <div v-else class="user-data">
      <div class="user-header">
        <div class="user-avatar">
          <span v-if="!user.avatarUrl">{{ getUserInitials(user) }}</span>
          <img v-else :src="user.avatarUrl" :alt="`Avatar von ${user.name}`" />
        </div>
        <div class="user-main-info">
          <h3>{{ user.name }}</h3>
          <div class="user-badges">
            <span 
              class="status-badge" 
              :class="{ 'active': user.status === 'active', 'inactive': user.status === 'inactive' }"
            >
              {{ user.status === 'active' ? 'Aktiv' : 'Inaktiv' }}
            </span>
            <span 
              class="type-badge" 
              :class="{ 'author': user.isAuthor }"
            >
              {{ user.isAuthor ? 'Autor' : 'Benutzer' }}
            </span>
          </div>
          <p class="user-id">ID: {{ user.id }}</p>
        </div>
      </div>
      
      <div class="user-actions-bar">
        <button 
          class="action-button" 
          :class="user.status === 'active' ? 'deactivate' : 'activate'"
          @click="toggleUserStatus"
        >
          <svg v-if="user.status === 'active'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect>
            <circle cx="16" cy="12" r="3"></circle>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect>
            <circle cx="8" cy="12" r="3"></circle>
          </svg>
          <span>{{ user.status === 'active' ? 'Benutzer deaktivieren' : 'Benutzer aktivieren' }}</span>
        </button>
        
        <button 
          class="action-button toggle-author" 
          @click="toggleAuthorStatus"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
          </svg>
          <span>{{ user.isAuthor ? 'Autoren-Status entfernen' : 'Als Autor markieren' }}</span>
        </button>
        
        <button class="action-button reset-password">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span>Passwort zurücksetzen</span>
        </button>
      </div>
      
      <div class="user-sections">
        <div class="section contact-info">
          <h4 class="section-title">Kontaktinformationen</h4>
          <div class="info-grid">
            <div class="info-item">
              <label>E-Mail</label>
              <div class="info-value">{{ user.email }}</div>
            </div>
            <div class="info-item">
              <label>Telefon</label>
              <div class="info-value">{{ user.phone || 'Nicht angegeben' }}</div>
            </div>
          </div>
        </div>
        
        <div class="section account-info">
          <h4 class="section-title">Kontoinformationen</h4>
          <div class="info-grid">
            <div class="info-item">
              <label>Registriert am</label>
              <div class="info-value">{{ formatDate(user.registeredAt) }}</div>
            </div>
            <div class="info-item">
              <label>Letzte Anmeldung</label>
              <div class="info-value">{{ formatDate(user.lastLoginAt) }}</div>
            </div>
          </div>
        </div>
        
        <div class="section activity-info">
          <h4 class="section-title">Aktivitätsstatistik</h4>
          <div class="info-grid">
            <div class="info-item">
              <label>Artikel gelesen</label>
              <div class="info-value">{{ user.stats.articlesRead }}</div>
            </div>
            <div class="info-item">
              <label>Favoriten</label>
              <div class="info-value">{{ user.stats.favorites }}</div>
            </div>
            <div class="info-item">
              <label>Kommentare</label>
              <div class="info-value">{{ user.stats.comments }}</div>
            </div>
            <div class="info-item">
              <label>Artikel geschrieben</label>
              <div class="info-value">{{ user.stats.articlesWritten }}</div>
            </div>
          </div>
        </div>
        
        <div v-if="user.isAuthor" class="section author-info">
          <h4 class="section-title">Autoreninformationen</h4>
          <div class="info-grid">
            <div class="info-item full-width">
              <label>Bio</label>
              <div class="info-value">{{ user.authorBio || 'Keine Biografie vorhanden' }}</div>
            </div>
            <div class="info-item">
              <label>Autor seit</label>
              <div class="info-value">{{ formatDate(user.authorSince) }}</div>
            </div>
            <div class="info-item">
              <label>Fachgebiet</label>
              <div class="info-value">{{ user.expertise || 'Nicht angegeben' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';

interface UserStats {
  articlesRead: number;
  favorites: number;
  comments: number;
  articlesWritten: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  isAuthor: boolean;
  status: 'active' | 'inactive';
  registeredAt: Date;
  lastLoginAt: Date;
  stats: UserStats;
  authorBio?: string;
  authorSince?: Date;
  expertise?: string;
}

export default defineComponent({
  name: 'UserDetail',
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const user = ref<User | null>(null);
    const isLoading = ref(true);

    onMounted(() => {
      fetchUserData();
    });

    // Benutzerdaten abrufen (Dummy-Implementierung)
    const fetchUserData = () => {
      isLoading.value = true;
      
      // Simuliere API-Abruf
      setTimeout(() => {
        // Suche den Benutzer mit der angegebenen ID
        if (props.userId === 'usr_001') {
          user.value = {
            id: 'usr_001',
            name: 'Max Mustermann',
            email: 'max@example.com',
            phone: '+49 123 456789',
            isAuthor: false,
            status: 'active',
            registeredAt: new Date('2023-05-15'),
            lastLoginAt: new Date('2024-05-01'),
            stats: {
              articlesRead: 42,
              favorites: 7,
              comments: 13,
              articlesWritten: 0
            }
          };
        } else if (props.userId === 'usr_002') {
          user.value = {
            id: 'usr_002',
            name: 'Anna Schmidt',
            email: 'anna@example.com',
            phone: '+49 987 654321',
            isAuthor: true,
            status: 'active',
            registeredAt: new Date('2022-10-22'),
            lastLoginAt: new Date('2024-05-10'),
            stats: {
              articlesRead: 65,
              favorites: 12,
              comments: 28,
              articlesWritten: 15
            },
            authorBio: 'Anna ist eine leidenschaftliche Erzieherin mit über 10 Jahren Erfahrung. Sie hat zwei eigene Kinder und ist spezialisiert auf frühkindliche Entwicklung und Lernmethoden.',
            authorSince: new Date('2023-01-10'),
            expertise: 'Frühkindliche Entwicklung'
          };
        } else {
          // Unbekannter Benutzer
          user.value = null;
        }
        
        isLoading.value = false;
      }, 1000);
    };

    // Benutzerstatus umschalten
    const toggleUserStatus = () => {
      if (user.value) {
        user.value.status = user.value.status === 'active' ? 'inactive' : 'active';
        // Hier würde in einer echten Anwendung ein API-Aufruf erfolgen
      }
    };

    // Autorenstatus umschalten
    const toggleAuthorStatus = () => {
      if (user.value) {
        user.value.isAuthor = !user.value.isAuthor;
        
        // Bei Aktivierung des Autorenstatus Default-Werte setzen
        if (user.value.isAuthor) {
          user.value.authorSince = new Date();
          user.value.authorBio = '';
          user.value.expertise = '';
        } else {
          // Bei Deaktivierung Werte zurücksetzen
          user.value.authorSince = undefined;
          user.value.authorBio = undefined;
          user.value.expertise = undefined;
        }
        
        // Hier würde in einer echten Anwendung ein API-Aufruf erfolgen
      }
    };

    // Benutzer-Initialen generieren
    const getUserInitials = (user: User): string => {
      if (!user.name) return '??';
      
      const nameParts = user.name.split(' ');
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      }
      
      return nameParts[0].substring(0, 2).toUpperCase();
    };

    // Datum formatieren
    const formatDate = (date?: Date): string => {
      if (!date) return 'Unbekannt';
      
      return new Date(date).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    return {
      user,
      isLoading,
      toggleUserStatus,
      toggleAuthorStatus,
      getUserInitials,
      formatDate
    };
  }
});
</script>

<style lang="scss" scoped>
.user-detail-container {
  width: 100%;
}

.loading-state, .error-state {
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
  
  h3 {
    margin: 0;
    color: #f0f0f0;
    font-size: 1.2rem;
  }
  
  p {
    margin: 0;
  }
}

.user-data {
  display: flex;
  flex-direction: column;
  gap: 24px;
  
  .user-header {
    display: flex;
    align-items: center;
    gap: 20px;
    
    .user-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background-color: #444;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: white;
      font-size: 2rem;
      overflow: hidden;
      border: 3px solid #333;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .user-main-info {
      h3 {
        margin: 0 0 8px 0;
        font-size: 1.5rem;
        color: #f0f0f0;
      }
      
      .user-badges {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
        
        .status-badge, .type-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.8rem;
        }
        
        .status-badge {
          &.active {
            background-color: rgba(46, 204, 113, 0.2);
            color: #2ecc71;
          }
          
          &.inactive {
            background-color: rgba(231, 76, 60, 0.2);
            color: #e74c3c;
          }
        }
        
        .type-badge {
          background-color: #333;
          color: #a0a0a0;
          
          &.author {
            background-color: rgba(255, 152, 0, 0.2);
            color: #ff9800;
          }
        }
      }
      
      .user-id {
        margin: 0;
        color: #777;
        font-size: 0.9rem;
      }
    }
  }
  
  .user-actions-bar {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    padding: 16px;
    background-color: #1c1c1c;
    border-radius: 8px;
    border: 1px solid #333;
    
    .action-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border-radius: 4px;
      background-color: #333;
      color: #f0f0f0;
      border: none;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      
      &:hover {
        background-color: #444;
      }
      
      &.activate {
        background-color: rgba(46, 204, 113, 0.2);
        color: #2ecc71;
        
        &:hover {
          background-color: rgba(46, 204, 113, 0.3);
        }
      }
      
      &.deactivate {
        background-color: rgba(231, 76, 60, 0.2);
        color: #e74c3c;
        
        &:hover {
          background-color: rgba(231, 76, 60, 0.3);
        }
      }
      
      &.toggle-author {
        background-color: rgba(255, 152, 0, 0.2);
        color: #ff9800;
        
        &:hover {
          background-color: rgba(255, 152, 0, 0.3);
        }
      }
      
      &.reset-password {
        background-color: rgba(52, 152, 219, 0.2);
        color: #3498db;
        
        &:hover {
          background-color: rgba(52, 152, 219, 0.3);
        }
      }
    }
  }
  
  .user-sections {
    display: flex;
    flex-direction: column;
    gap: 20px;
    
    .section {
      background-color: #1c1c1c;
      border-radius: 8px;
      border: 1px solid #333;
      padding: 16px;
      
      .section-title {
        margin: 0 0 16px 0;
        font-size: 1.1rem;
        color: #f0f0f0;
        padding-bottom: 8px;
        border-bottom: 1px solid #333;
      }
      
      .info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
        
        .info-item {
          &.full-width {
            grid-column: 1 / -1;
          }
          
          label {
            display: block;
            margin-bottom: 4px;
            color: #a0a0a0;
            font-size: 0.9rem;
          }
          
          .info-value {
            color: #f0f0f0;
            font-size: 1rem;
            word-break: break-word;
          }
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
  .user-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    
    .user-main-info {
      .user-badges {
        justify-content: center;
      }
    }
  }
  
  .user-actions-bar {
    flex-direction: column;
    
    .action-button {
      width: 100%;
      justify-content: center;
    }
  }
  
  .info-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>