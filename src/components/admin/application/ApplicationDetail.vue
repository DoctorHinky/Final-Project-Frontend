<!-- src/components/admin/application/ApplicationDetail.vue -->
<template>
  <div class="application-detail-container">
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>Bewerbungsdaten werden geladen...</span>
    </div>

    <div v-else-if="!application" class="error-state">
      <h3>Bewerbung nicht gefunden</h3>
      <p>Die angegebene Bewerbung konnte nicht gefunden werden.</p>
      <button @click="loadApplication" class="retry-button">Erneut versuchen</button>
    </div>

    <div v-else class="application-data">
      <!-- Header -->
      <div class="application-header">
        <div class="applicant-avatar" :class="{ 'no-user': !application.user }">
          <span v-if="!application.user?.profilePicture">{{ applicantInitials }}</span>
          <img
            v-else
            :src="application.user.profilePicture"
            :alt="`Avatar von ${applicantName}`"
          />
        </div>

        <div class="application-main-info">
          <h2 class="applicant-name">{{ applicantName }}</h2>
          <p class="application-id">Bewerbungs-ID: {{ application.id }}</p>
          
          <div class="status-badges">
            <span class="status-badge" :class="getStatusClass(application.status)">
              {{ getStatusLabel(application.status) }}
            </span>
            
            <span v-if="application.user?.username" class="username-badge">
              @{{ application.user.username }}
            </span>
          </div>

          <div class="application-meta">
            <div class="meta-item">
              <span class="meta-label">Eingereicht:</span>
              <span class="meta-value">{{ formatDateTime(application.createdAt) }}</span>
            </div>
            <div class="meta-item" v-if="application.updatedAt !== application.createdAt">
              <span class="meta-label">Aktualisiert:</span>
              <span class="meta-value">{{ formatDateTime(application.updatedAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <button 
            v-if="application.status === 'PENDING'"
            @click="takeApplication" 
            class="action-btn take-btn"
            :disabled="isProcessing"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 12l2 2 4-4"></path>
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
            Übernehmen
          </button>

          <button 
            v-if="application.status === 'IN_PROGRESS'"
            @click="showAcceptModal = true" 
            class="action-btn accept-btn"
            :disabled="isProcessing"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Akzeptieren
          </button>

          <button 
            v-if="application.status === 'IN_PROGRESS'"
            @click="showRejectModal = true" 
            class="action-btn reject-btn"
            :disabled="isProcessing"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Ablehnen
          </button>
        </div>
      </div>

      <!-- Kontaktdaten -->
      <div class="section">
        <h4>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
          Kontaktdaten
        </h4>
        <div class="info-grid">
          <div class="info-item">
            <label>E-Mail</label>
            <div class="info-value">
              <a :href="`mailto:${application.email}`" class="contact-link">
                {{ application.email }}
              </a>
            </div>
          </div>
          <div class="info-item">
            <label>Telefon</label>
            <div class="info-value">
              <a :href="`tel:${application.phone}`" class="contact-link">
                {{ application.phone }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Bewerbungsinhalt -->
      <div class="section">
        <h4>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          Bewerbungstext
        </h4>
        <div class="content-display">
          <div class="content-text">
            {{ application.content }}
          </div>
        </div>
      </div>

      <!-- Hochgeladene Dokumente -->
      <div class="section" v-if="application.referenceDocument && application.referenceDocument.length > 0">
        <h4>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          Hochgeladene Dokumente ({{ application.referenceDocument.length }})
        </h4>
        <div class="documents-grid">
          <div 
            v-for="document in application.referenceDocument" 
            :key="document.id"
            class="document-card"
          >
            <div class="document-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <div class="document-info">
              <div class="document-type">{{ getDocumentTypeLabel(document.type) }}</div>
              <div class="document-date">{{ formatDate(document.createdAt) }}</div>
            </div>
            <a 
              :href="document.url" 
              target="_blank" 
              rel="noopener noreferrer"
              class="document-download"
              title="Dokument öffnen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <!-- Bearbeitung & Status -->
      <div class="section">
        <h4>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 1v6m0 6v6m11-11h-6m-6 0H1"></path>
          </svg>
          Bearbeitungsstatus
        </h4>
        <div class="processing-info">
          <div class="processing-item">
            <label>Status:</label>
            <span class="status-badge large" :class="getStatusClass(application.status)">
              {{ getStatusLabel(application.status) }}
            </span>
          </div>
          <div class="processing-item" v-if="application.modId">
            <label>Bearbeitet von:</label>
            <span class="moderator-info">Moderator (ID: {{ application.modId }})</span>
          </div>
        </div>
      </div>

      <!-- User Information (wenn verfügbar) -->
      <div class="section" v-if="application.user">
        <h4>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="8" r="4"></circle>
          </svg>
          Benutzerinformationen
        </h4>
        <div class="user-info-grid">
          <div class="info-item">
            <label>Benutzer-ID</label>
            <div class="info-value">{{ application.user.id }}</div>
          </div>
          <div class="info-item">
            <label>Username</label>
            <div class="info-value">{{ application.user.username }}</div>
          </div>
          <div class="info-item">
            <label>Vollständiger Name</label>
            <div class="info-value">{{ `${application.user.firstname} ${application.user.lastname}`.trim() }}</div>
          </div>
        </div>
        
        <!-- Benutzer-Aktionen -->
        <div class="user-actions">
          <button 
            @click="showBlockModal = true" 
            class="danger-btn"
            title="Benutzer für weitere Bewerbungen sperren"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
            </svg>
            Benutzer sperren
          </button>
        </div>
      </div>

      <!-- Danger Zone (für gelöschte User) -->
      <div class="section danger-zone" v-if="!application.user">
        <h4>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          Verwaiste Bewerbung
        </h4>
        <p class="warning-text">
          Der Benutzer, der diese Bewerbung eingereicht hat, wurde gelöscht. 
          Diese Bewerbung kann nicht mehr bearbeitet werden.
        </p>
      </div>
    </div>

    <!-- Accept Modal -->
    <div class="modal-overlay confirmation-modal" v-if="showAcceptModal" @click="showAcceptModal = false">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>Bewerbung akzeptieren</h3>
          <button class="close-button" @click="showAcceptModal = false">×</button>
        </div>
        <div class="modal-content">
          <p>Möchten Sie diese Bewerbung wirklich akzeptieren?</p>
          <p class="modal-note">
            Der Benutzer wird automatisch zum Autor befördert und alle anderen Bewerbungen werden gelöscht.
          </p>
          <div class="modal-actions">
            <button @click="showAcceptModal = false" class="cancel-button">Abbrechen</button>
            <button @click="acceptApplication" class="confirm-button" :disabled="isProcessing">
              <span v-if="isProcessing">Wird bearbeitet...</span>
              <span v-else>Akzeptieren</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div class="modal-overlay confirmation-modal" v-if="showRejectModal" @click="showRejectModal = false">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>Bewerbung ablehnen</h3>
          <button class="close-button" @click="showRejectModal = false">×</button>
        </div>
        <div class="modal-content">
          <p>Warum möchten Sie diese Bewerbung ablehnen?</p>
          <textarea
            v-model="rejectReason"
            placeholder="Bitte geben Sie einen Grund für die Ablehnung an..."
            rows="4"
            class="reason-textarea"
            required
          ></textarea>
          <div class="modal-actions">
            <button @click="showRejectModal = false" class="cancel-button">Abbrechen</button>
            <button @click="rejectApplication" class="reject-button" :disabled="isProcessing || !rejectReason.trim()">
              <span v-if="isProcessing">Wird bearbeitet...</span>
              <span v-else>Ablehnen</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Block User Modal -->
    <div class="modal-overlay confirmation-modal" v-if="showBlockModal" @click="showBlockModal = false">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>Benutzer für Bewerbungen sperren</h3>
          <button class="close-button" @click="showBlockModal = false">×</button>
        </div>
        <div class="modal-content">
          <p>Warum möchten Sie diesen Benutzer für weitere Bewerbungen sperren?</p>
          <textarea
            v-model="blockReason"
            placeholder="Bitte geben Sie einen Grund für die Sperre an..."
            rows="3"
            class="reason-textarea"
            required
          ></textarea>
          <div class="modal-actions">
            <button @click="showBlockModal = false" class="cancel-button">Abbrechen</button>
            <button @click="blockUser" class="block-button" :disabled="isProcessing || !blockReason.trim()">
              <span v-if="isProcessing">Wird bearbeitet...</span>
              <span v-else>Sperren</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue';
import applicationService from '@/services/application.service';

export default defineComponent({
  name: 'ApplicationDetail',
  props: {
    applicationId: {
      type: String,
      required: true
    }
  },
  emits: ['application-updated'],
  setup(props, { emit }) {
    const application = ref(null);
    const isLoading = ref(true);
    const isProcessing = ref(false);
    
    // Modal States
    const showAcceptModal = ref(false);
    const showRejectModal = ref(false);
    const showBlockModal = ref(false);
    
    // Form Data
    const rejectReason = ref('');
    const blockReason = ref('');

    // Computed Properties
    const applicantName = computed(() => {
      if (application.value?.user) {
        const firstName = application.value.user.firstname || '';
        const lastName = application.value.user.lastname || '';
        if (firstName || lastName) {
          return `${firstName} ${lastName}`.trim();
        }
        return application.value.user.username || 'Unbekannt';
      }
      return 'Benutzer gelöscht';
    });

    const applicantInitials = computed(() => {
      const name = applicantName.value;
      if (name === 'Benutzer gelöscht' || name === 'Unbekannt') {
        return "??";
      }

      const nameParts = name.split(" ");
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      }

      return nameParts[0].substring(0, 2).toUpperCase();
    });

    // Helper Methods
    const getStatusClass = (status) => {
      const classes = {
        'PENDING': 'status-pending',
        'IN_PROGRESS': 'status-in-progress',
        'ACCEPTED': 'status-accepted',
        'REJECTED': 'status-rejected',
        'CANCELED': 'status-canceled'
      };
      return classes[status] || 'status-unknown';
    };

    const getStatusLabel = (status) => {
      const labels = {
        'PENDING': 'Ausstehend',
        'IN_PROGRESS': 'In Bearbeitung',
        'ACCEPTED': 'Akzeptiert',
        'REJECTED': 'Abgelehnt',
        'CANCELED': 'Abgebrochen'
      };
      return labels[status] || status;
    };

    const getDocumentTypeLabel = (type) => {
      const labels = {
        'CV': 'Lebenslauf',
        'COVER_LETTER': 'Anschreiben',
        'CERTIFICATE': 'Zertifikat',
        'OTHER': 'Anderes Dokument'
      };
      return labels[type] || type;
    };

    // Methods
    const loadApplication = async () => {
      try {
        isLoading.value = true;
        const result = await applicationService.getApplicationById(props.applicationId);
        application.value = result;
      } catch (error) {
        application.value = null;
      } finally {
        isLoading.value = false;
      }
    };

    const takeApplication = async () => {
      try {
        isProcessing.value = true;
        await applicationService.takeApplication(props.applicationId);
        await loadApplication();
        emit('application-updated');
        alert('✅ Bewerbung erfolgreich übernommen!');
      } catch (error) {
        console.error('Fehler beim Übernehmen:', error);
        alert(`❌ Fehler: ${error.message}`);
      } finally {
        isProcessing.value = false;
      }
    };

    const acceptApplication = async () => {
      try {
        isProcessing.value = true;
        await applicationService.acceptApplication(props.applicationId);
        showAcceptModal.value = false;
        await loadApplication();
        emit('application-updated');
        alert('✅ Bewerbung erfolgreich akzeptiert! Der Benutzer ist jetzt Autor.');
      } catch (error) {
        console.error('Fehler beim Akzeptieren:', error);
        alert(`❌ Fehler: ${error.message}`);
      } finally {
        isProcessing.value = false;
      }
    };

    const rejectApplication = async () => {
      if (!rejectReason.value.trim()) {
        alert('Bitte geben Sie einen Grund für die Ablehnung an.');
        return;
      }

      try {
        isProcessing.value = true;
        await applicationService.rejectApplication(props.applicationId, rejectReason.value.trim());
        showRejectModal.value = false;
        rejectReason.value = '';
        await loadApplication();
        emit('application-updated');
        alert('✅ Bewerbung erfolgreich abgelehnt.');
      } catch (error) {
        console.error('Fehler beim Ablehnen:', error);
        alert(`❌ Fehler: ${error.message}`);
      } finally {
        isProcessing.value = false;
      }
    };

    const blockUser = async () => {
      if (!blockReason.value.trim()) {
        alert('Bitte geben Sie einen Grund für die Sperre an.');
        return;
      }

      if (!application.value?.user?.id) {
        alert('Benutzer-ID nicht verfügbar.');
        return;
      }

      try {
        isProcessing.value = true;
        await applicationService.blockUserFromApplications(application.value.user.id, blockReason.value.trim());
        showBlockModal.value = false;
        blockReason.value = '';
        alert('✅ Benutzer erfolgreich für weitere Bewerbungen gesperrt.');
      } catch (error) {
        console.error('Fehler beim Sperren:', error);
        alert(`❌ Fehler: ${error.message}`);
      } finally {
        isProcessing.value = false;
      }
    };

    const formatDate = (dateString) => {
      try {
        return new Date(dateString).toLocaleDateString('de-DE');
      } catch (error) {
        return 'Ungültiges Datum';
      }
    };

    const formatDateTime = (dateString) => {
      try {
        return new Date(dateString).toLocaleString('de-DE');
      } catch (error) {
        return 'Ungültiges Datum';
      }
    };

    // Lifecycle
    onMounted(() => {
      loadApplication();
    });

    return {
      application,
      isLoading,
      isProcessing,
      showAcceptModal,
      showRejectModal,
      showBlockModal,
      rejectReason,
      blockReason,
      applicantName,
      applicantInitials,
      getStatusClass,
      getStatusLabel,
      getDocumentTypeLabel,
      takeApplication,
      acceptApplication,
      rejectApplication,
      blockUser,
      formatDate,
      formatDateTime,
      loadApplication
    };
  }
});
</script>

<style lang="scss" scoped>
.application-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #e0e0e0;
  position: relative !important;
  z-index: 10000 !important; /* Sehr hoher z-index wie bei UserDetail */
  min-height: 100vh;
  background-color: #0a0a0a !important; /* Expliziter Hintergrund */
  
  /* Überschreibt alle anderen Styles */
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* Alle Elemente explizit sichtbar machen */
.application-detail-container * {
  position: relative;
  z-index: inherit;
  visibility: visible !important;
  opacity: 1 !important;
}

.debug-info {
  background: #333;
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  font-family: monospace;
  font-size: 0.8rem;
  color: #ff9800;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 60px;
  background-color: #1a1a1a;
  border-radius: 12px;
  position: relative;
  z-index: 10;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #333;
  border-top-color: #ff9800;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.retry-button {
  background-color: #0078d7;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  margin-top: 16px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #106ebe;
  }
}

.application-header {
  display: flex !important;
  align-items: center;
  gap: 30px;
  background: #1a1a1a !important;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  position: relative !important;
  z-index: 10010 !important;
  visibility: visible !important;
  opacity: 1 !important;

  .applicant-avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    font-weight: bold;
    color: white;
    flex-shrink: 0;

    &.no-user {
      background: linear-gradient(135deg, #666 0%, #444 100%);
    }

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }
  }

  .application-main-info {
    flex: 1;

    .applicant-name {
      margin: 0 0 8px 0;
      font-size: 1.8rem;
      color: #f0f0f0;
    }

    .application-id {
      color: #666;
      font-family: monospace;
      font-size: 0.9rem;
      margin: 0 0 12px 0;
    }

    .status-badges {
      display: flex;
      gap: 10px;
      margin-bottom: 12px;
      flex-wrap: wrap;

      .status-badge {
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 500;

        &.status-pending {
          background-color: rgba(255, 193, 7, 0.2);
          color: #ffc107;
        }

        &.status-in-progress {
          background-color: rgba(0, 120, 215, 0.2);
          color: #0078d7;
        }

        &.status-accepted {
          background-color: rgba(46, 204, 113, 0.2);
          color: #2ecc71;
        }

        &.status-rejected {
          background-color: rgba(231, 76, 60, 0.2);
          color: #e74c3c;
        }

        &.status-canceled {
          background-color: rgba(149, 165, 166, 0.2);
          color: #95a5a6;
        }

        &.large {
          padding: 8px 20px;
          font-size: 1rem;
        }
      }

      .username-badge {
        background: #2a2a2a;
        color: #888;
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 0.9rem;
      }
    }

    .application-meta {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .meta-item {
        display: flex;
        gap: 8px;
        font-size: 0.9rem;

        .meta-label {
          color: #888;
          font-weight: 500;
        }

        .meta-value {
          color: #aaa;
        }
      }
    }
  }

  .quick-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.95rem;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &.take-btn {
        background: linear-gradient(135deg, #ffc107, #ff9800);
        color: white;

        &:hover:not(:disabled) {
          background: linear-gradient(135deg, #ff9800, #f57c00);
          transform: translateY(-2px);
        }
      }

      &.accept-btn {
        background: linear-gradient(135deg, #2ecc71, #27ae60);
        color: white;

        &:hover:not(:disabled) {
          background: linear-gradient(135deg, #27ae60, #229954);
          transform: translateY(-2px);
        }
      }

      &.reject-btn {
        background: linear-gradient(135deg, #e74c3c, #c0392b);
        color: white;

        &:hover:not(:disabled) {
          background: linear-gradient(135deg, #c0392b, #a93226);
          transform: translateY(-2px);
        }
      }
    }
  }
}

.section {
  background: #1a1a1a !important;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  position: relative !important;
  z-index: 10005 !important;
  opacity: 1 !important;
  visibility: visible !important;

  h4 {
    margin: 0 0 20px 0;
    font-size: 1.2rem;
    color: #ff9800;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .info-grid,
  .user-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 8px;

      label {
        font-size: 0.85rem;
        color: #888;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .info-value {
        color: #aaa;
        font-size: 0.95rem;

        .contact-link {
          color: #0078d7;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }

  .content-display {
    .content-text {
      background: #2a2a2a;
      padding: 20px;
      border-radius: 8px;
      color: #e0e0e0;
      line-height: 1.6;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  }

  .documents-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;

    .document-card {
      background: #2a2a2a;
      padding: 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.3s ease;

      &:hover {
        background: #333;
        transform: translateY(-2px);
      }

      .document-icon {
        color: #ff9800;
      }

      .document-info {
        flex: 1;

        .document-type {
          font-weight: 500;
          color: #f0f0f0;
          margin-bottom: 4px;
        }

        .document-date {
          font-size: 0.8rem;
          color: #888;
        }
      }

      .document-download {
        color: #0078d7;
        text-decoration: none;
        padding: 8px;
        border-radius: 4px;
        transition: all 0.2s;

        &:hover {
          background: rgba(0, 120, 215, 0.1);
        }
      }
    }
  }

  .processing-info {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .processing-item {
      display: flex;
      align-items: center;
      gap: 12px;

      label {
        font-size: 0.9rem;
        color: #888;
        font-weight: 500;
        min-width: 120px;
      }

      .moderator-info {
        color: #aaa;
        font-family: monospace;
        font-size: 0.9rem;
      }
    }
  }

  .user-actions {
    margin-top: 20px;

    .danger-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      background: linear-gradient(135deg, #e74c3c, #c0392b);
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: linear-gradient(135deg, #c0392b, #a93226);
        transform: translateY(-2px);
      }
    }
  }

  &.danger-zone {
    background: linear-gradient(135deg, #2a1a1a, #1f0f0f) !important;
    border: 2px solid rgba(231, 76, 60, 0.3);

    h4 {
      color: #e74c3c;
    }

    .warning-text {
      color: #aaa;
      margin: 0;
      line-height: 1.6;
    }
  }
}

// Modal Styles mit höherem z-index
.modal-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex !important;
  justify-content: center;
  align-items: center;
  z-index: 10200 !important; /* Höher als ApplicationDetail Container */
  backdrop-filter: blur(3px);

  &.confirmation-modal {
    z-index: 10300 !important;
    background-color: rgba(0, 0, 0, 0.9);
  }
}

.modal-container {
  width: 90%;
  max-width: 500px;
  background-color: #222 !important;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border: 1px solid #444;
  animation: modal-appear 0.3s ease-out;
  position: relative !important;
  z-index: 10400 !important;
  display: flex !important;
  flex-direction: column !important;
  visibility: visible !important;
  opacity: 1 !important;
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

  p {
    margin: 0 0 16px 0;
    color: #e0e0e0;
    line-height: 1.5;
  }

  .modal-note {
    font-size: 0.9rem;
    color: #aaa;
    font-style: italic;
  }

  .reason-textarea {
    width: 100%;
    min-height: 100px;
    padding: 12px;
    border-radius: 6px;
    border: 1px solid #444;
    background-color: #2a2a2a;
    color: #f0f0f0;
    font-family: inherit;
    font-size: 0.95rem;
    resize: vertical;
    margin-bottom: 20px;

    &:focus {
      outline: none;
      border-color: #666;
    }

    &::placeholder {
      color: #777;
    }
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    button {
      padding: 10px 20px;
      border-radius: 4px;
      font-weight: 500;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &.cancel-button {
        background-color: #333;
        color: #f0f0f0;

        &:hover:not(:disabled) {
          background-color: #444;
        }
      }

      &.confirm-button {
        background-color: rgba(46, 204, 113, 0.8);
        color: white;

        &:hover:not(:disabled) {
          background-color: rgba(46, 204, 113, 1);
        }
      }

      &.reject-button,
      &.block-button {
        background-color: rgba(231, 76, 60, 0.8);
        color: white;

        &:hover:not(:disabled) {
          background-color: rgba(231, 76, 60, 1);
        }
      }
    }
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

@media (max-width: 768px) {
  .application-header {
    flex-direction: column;
    text-align: center;
    gap: 20px;

    .quick-actions {
      width: 100%;
      flex-direction: row;
      justify-content: center;
      flex-wrap: wrap;
    }
  }

  .info-grid,
  .user-info-grid {
    grid-template-columns: 1fr;
  }

  .documents-grid {
    grid-template-columns: 1fr;
  }

  .modal-container {
    width: 95%;
    margin: 10px;
  }
}
</style>