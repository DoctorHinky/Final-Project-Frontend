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
      <pre style="color: white; font-size: 12px">{{ user }}</pre>
      <div class="user-header">
        <div class="user-avatar">
          <span v-if="!user.profilePicture">{{ getUserInitials(user) }}</span>
          <img v-else :src="user.profilePicture" :alt="`Avatar von ${user.firstname} ${user.lastname}`" />
        </div>
        <div class="user-main-info">
          <h3>{{ user.firstname }} {{ user.lastname }}</h3>
          <div class="user-badges">
            <span class="type-badge">
              {{ user.role || 'Benutzer' }}
            </span>
            <span class="status-badge" :class="{ 'active': user.verified, 'inactive': !user.verified }">
              {{ user.verified ? 'Verifiziert' : 'Nicht verifiziert' }}
            </span>
          </div>
          <p class="user-id">ID: {{ user.id }}</p>
        </div>
        <div class="user-actions-bar">
  <button class="action-button deactivate" @click="onSoftDelete">
    Benutzer löschen
  </button>
  <button class="action-button activate" v-if="user?.isDeleted" @click="onRestoreUser">
    Benutzer wiederherstellen
  </button>
  <button class="action-button" @click="onEditUser">
    Benutzer bearbeiten
  </button>
</div>
      </div>

      <div class="user-sections">
        <div class="section username-info">
          <h4 class="section-title">Benutzername</h4>
          <div class="info-grid">
            <div class="info-item">
              <label>Username</label>
              <div class="info-value">{{ user.username }}</div>
            </div>
          </div>
        </div>
        <div class="section system-info">
  <h4 class="section-title">Systeminformationen</h4>
  <div class="info-grid">
    <div class="info-item">
      <label>Erstellt am</label>
      <div class="info-value">{{ formatDate(user.createdAt) }}</div>
    </div>
    <div class="info-item">
      <label>Zuletzt aktualisiert</label>
      <div class="info-value">{{ formatDate(user.updatedAt) }}</div>
    </div>
    <div class="info-item">
      <label>Deaktiviert</label>
      <div class="info-value">{{ user.deactivated ? 'Ja' : 'Nein' }}</div>
    </div>
    <div class="info-item">
      <label>Gelöscht</label>
      <div class="info-value">{{ user.isDeleted ? 'Ja' : 'Nein' }}</div>
    </div>
    <div class="info-item" v-if="user.isDeleted">
      <label>Löschgrund</label>
      <div class="info-value">{{ user.deleteReason || 'Nicht angegeben' }}</div>
    </div>
    <div class="info-item" v-if="user.isDeleted">
      <label>Gelöscht am</label>
      <div class="info-value">{{ formatDate(user.deletedAt) }}</div>
    </div>
    <div class="info-item" v-if="user.isDeleted">
      <label>Gelöscht von</label>
      <div class="info-value">{{ user.deletedBy || 'Unbekannt' }}</div>
    </div>
    <div class="info-item">
      <label>Gesperrt für Bewerbungen</label>
      <div class="info-value">{{ user.blockedForApplication ? 'Ja' : 'Nein' }}</div>
    </div>
    <div class="info-item">
      <label>Autorisiert von</label>
      <div class="info-value">{{ user.authorizedBy || '—' }}</div>
    </div>
    <div class="info-item">
      <label>Autorisiert am</label>
      <div class="info-value">{{ formatDate(user.authorizedAt) }}</div>
    </div>
    <div class="info-item">
      <label>Moderiert von</label>
      <div class="info-value">{{ user.moderatedBy || '—' }}</div>
    </div>
    <div class="info-item">
      <label>Moderiert am</label>
      <div class="info-value">{{ formatDate(user.moderatedAt) }}</div>
    </div>
  </div>
</div>

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
              <label>Geburtsdatum</label>
              <div class="info-value">{{ formatDate(user.birthdate) }}</div>
            </div>
            <div class="info-item">
              <label>Rolle</label>
              <div class="info-value">{{ user.role }}</div>
            </div>
            <div class="info-item">
              <label>Verifiziert</label>
              <div class="info-value">{{ user.verified ? 'Ja' : 'Nein' }}</div>
            </div>
          </div>
        </div>

        <div class="section description-info">
          <h4 class="section-title">Kurzbeschreibung</h4>
          <div class="info-grid">
            <div class="info-item full-width">
              <label>Kurzbeschreibung</label>
              <div class="info-value">{{ user.shortDescription || 'Keine Kurzbeschreibung vorhanden' }}</div>
            </div>
          </div>
        </div>

        <div class="section bio-info">
          <h4 class="section-title">Biografie</h4>
          <div class="info-grid">
            <div class="info-item full-width">
              <label>Biografie</label>
              <div class="info-value">{{ user.bio || 'Keine Biografie vorhanden' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import userService from '@/services/user.service';
import type { User } from '@/types/User.types';

const props = defineProps<{
  userId: string;
}>();

const user = ref<User | null>(null);
const isLoading = ref(true);

onMounted(async () => {
  if (props.userId) {
    try {
      isLoading.value = true;
      const res = await userService.getUserById(props.userId);
      user.value = res;
    } catch (err) {
      console.error('Fehler beim Laden der User-Daten:', err);
    } finally {
      isLoading.value = false;
    }
  }
});

const formatDate = (date?: string | Date): string => {
  if (!date) return 'Unbekannt';
  return new Date(date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getUserInitials = (user: User): string => {
  const f = user.firstname?.[0] || '';
  const l = user.lastname?.[0] || '';
  return (f + l).toUpperCase();
};
const reloadUser = async () => {
  if (!props.userId) return;
  try {
    const res = await userService.getUserById(props.userId);
    user.value = res;
  } catch (err) {
    console.error('Fehler beim Reload:', err);
  }
};

const onSoftDelete = async () => {
  const reason = prompt('Bitte gib den Löschgrund ein:');
  if (!reason) return;

  try {
    await userService.deleteUser(props.userId, reason);
    alert('Benutzer wurde gelöscht');
    await reloadUser();
  } catch (err) {
    console.error(err);
    alert('Fehler beim Löschen des Benutzers');
  }
};

const onRestoreUser = async () => {
  try {
    await userService.restoreUser(props.userId);
    alert('Benutzer wiederhergestellt');
    await reloadUser();
  } catch (err) {
    console.error(err);
    alert('Fehler beim Wiederherstellen');
  }
};

const onEditUser = async () => {
  const updated = {
    firstname: prompt('Vorname ändern:', user.value?.firstname),
    lastname: prompt('Nachname ändern:', user.value?.lastname),
    phone: prompt('Telefonnummer ändern:', user.value?.phone ?? ''),
  };

  try {
    await userService.updateUser(props.userId, updated);
    alert('Benutzer aktualisiert');
    await reloadUser();
  } catch (err) {
    console.error(err);
    alert('Fehler beim Aktualisieren');
  }
};

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