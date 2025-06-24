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
            <svg class="icon icon-sm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Übernehmen
          </button>

          <button 
            v-if="application.status === 'IN_PROGRESS'"
            @click="showAcceptModal = true" 
            class="action-btn accept-btn"
            :disabled="isProcessing"
          >
            <svg class="icon icon-sm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Akzeptieren
          </button>

          <button 
            v-if="application.status === 'IN_PROGRESS'"
            @click="showRejectModal = true" 
            class="action-btn reject-btn"
            :disabled="isProcessing"
          >
            <svg class="icon icon-sm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Ablehnen
          </button>
        </div>
      </div>

      <!-- Kontaktdaten -->
      <div class="section glass-section">
        <h4>
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
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
      <div class="section glass-section">
        <h4>
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
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
      <div class="section glass-section" v-if="application.referenceDocument && application.referenceDocument.length > 0">
        <h4>
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
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
              <svg class="icon icon-md" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
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
              <svg class="icon icon-sm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <!-- Bearbeitung & Status -->
      <div class="section glass-section">
        <h4>
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
      <div class="section glass-section" v-if="application.user">
        <h4>
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
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
            <svg class="icon icon-sm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            Benutzer sperren
          </button>
        </div>
      </div>

      <!-- Danger Zone (für gelöschte User) -->
      <div class="section danger-zone" v-if="!application.user">
        <h4>
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
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
    <div class="admin-modal-overlay admin-confirm-modal" v-if="showAcceptModal" @click="showAcceptModal = false">
      <div class="admin-modal-container" @click.stop>
        <div class="admin-modal-header">
          <h3>
            <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Bewerbung akzeptieren
          </h3>
          <button class="close-button" @click="showAcceptModal = false">×</button>
        </div>
        <div class="confirm-content">
          <div class="confirm-icon success">
            <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p>Möchten Sie diese Bewerbung wirklich akzeptieren?</p>
          <p class="subtitle">
            Der Benutzer wird automatisch zum Autor befördert und alle anderen Bewerbungen werden gelöscht.
          </p>
        </div>
        <div class="confirm-actions">
          <button @click="showAcceptModal = false" class="cancel-btn">Abbrechen</button>
          <button @click="acceptApplication" class="confirm-btn success" :disabled="isProcessing">
            <span v-if="isProcessing">Wird bearbeitet...</span>
            <span v-else>Akzeptieren</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div class="admin-modal-overlay admin-form-modal" v-if="showRejectModal" @click="showRejectModal = false">
      <div class="admin-modal-container small" @click.stop>
        <div class="admin-modal-header">
          <h3>
            <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Bewerbung ablehnen
          </h3>
          <button class="close-button" @click="showRejectModal = false">×</button>
        </div>
        <div class="admin-modal-content">
          <div class="form-field">
            <label>Warum möchten Sie diese Bewerbung ablehnen?</label>
            <textarea
              v-model="rejectReason"
              placeholder="Bitte geben Sie einen Grund für die Ablehnung an..."
              rows="4"
              required
            ></textarea>
          </div>
        </div>
        <div class="confirm-actions">
          <button @click="showRejectModal = false" class="cancel-btn">Abbrechen</button>
          <button @click="rejectApplication" class="confirm-btn danger" :disabled="isProcessing || !rejectReason.trim()">
            <span v-if="isProcessing">Wird bearbeitet...</span>
            <span v-else>Ablehnen</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Block User Modal -->
    <div class="admin-modal-overlay admin-form-modal" v-if="showBlockModal" @click="showBlockModal = false">
      <div class="admin-modal-container small" @click.stop>
        <div class="admin-modal-header">
          <h3>
            <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            Benutzer für Bewerbungen sperren
          </h3>
          <button class="close-button" @click="showBlockModal = false">×</button>
        </div>
        <div class="admin-modal-content">
          <div class="form-field">
            <label>Warum möchten Sie diesen Benutzer für weitere Bewerbungen sperren?</label>
            <textarea
              v-model="blockReason"
              placeholder="Bitte geben Sie einen Grund für die Sperre an..."
              rows="3"
              required
            ></textarea>
          </div>
        </div>
        <div class="confirm-actions">
          <button @click="showBlockModal = false" class="cancel-btn">Abbrechen</button>
          <button @click="blockUser" class="confirm-btn danger" :disabled="isProcessing || !blockReason.trim()">
            <span v-if="isProcessing">Wird bearbeitet...</span>
            <span v-else>Sperren</span>
          </button>
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
      } catch (error) {
        console.error('Fehler beim Übernehmen:', error);
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
      } catch (error) {
        console.error('Fehler beim Akzeptieren:', error);
      } finally {
        isProcessing.value = false;
      }
    };

    const rejectApplication = async () => {
      if (!rejectReason.value.trim()) {
        return;
      }

      try {
        isProcessing.value = true;
        await applicationService.rejectApplication(props.applicationId, rejectReason.value.trim());
        showRejectModal.value = false;
        rejectReason.value = '';
        await loadApplication();
        emit('application-updated');
      } catch (error) {
        console.error('Fehler beim Ablehnen:', error);
      } finally {
        isProcessing.value = false;
      }
    };

    const blockUser = async () => {
      if (!blockReason.value.trim()) {
        return;
      }

      if (!application.value?.user?.id) {
        return;
      }

      try {
        isProcessing.value = true;
        await applicationService.blockUserFromApplications(application.value.user.id, blockReason.value.trim());
        showBlockModal.value = false;
        blockReason.value = '';
      } catch (error) {
        console.error('Fehler beim Sperren:', error);
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
// Import der globalen Admin-Styles
@import '../../../style/base/admin-global.scss'; // style\base\admin-global.scss


// Icon Styles
.icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;

  &.icon-sm {
    width: 16px;
    height: 16px;
  }

  &.icon-md {
    width: 24px;
    height: 24px;
  }
}

.application-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #e0e0e0;
  position: relative !important;
  z-index: 10000 !important;
  min-height: 100vh;
  
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

.loading-state,
.error-state {
  text-align: center;
  padding: 60px;
  background: rgba(30, 30, 40, 0.6);
  backdrop-filter: blur(16px);
  border-radius: 16px;
  position: relative;
  z-index: 10;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(93, 173, 226, 0.2);
  border-top-color: #5dade2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.retry-button {
  @extend .admin-button;
  @extend .primary;
}

.application-header {
  display: flex !important;
  align-items: center;
  gap: 30px;
  padding: 30px;
  border-radius: 16px;
  margin-bottom: 30px;
  background: rgba(30, 30, 40, 0.6);
  backdrop-filter: blur(16px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  position: relative !important;
  z-index: 10010 !important;
  visibility: visible !important;
  opacity: 1 !important;
  border: 1px solid rgba(93, 173, 226, 0.15);

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
    box-shadow: 0 8px 24px rgba(255, 152, 0, 0.3);

    &.no-user {
      background: linear-gradient(135deg, #666 0%, #444 100%);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
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
        backdrop-filter: blur(10px);

        &.status-pending {
          background: linear-gradient(135deg, rgba(255, 193, 7, 0.2), rgba(255, 193, 7, 0.1));
          color: #ffc107;
          border: 1px solid rgba(255, 193, 7, 0.3);
        }

        &.status-in-progress {
          background: linear-gradient(135deg, rgba(0, 120, 215, 0.2), rgba(0, 120, 215, 0.1));
          color: #0078d7;
          border: 1px solid rgba(0, 120, 215, 0.3);
        }

        &.status-accepted {
          background: linear-gradient(135deg, rgba(46, 204, 113, 0.2), rgba(46, 204, 113, 0.1));
          color: #2ecc71;
          border: 1px solid rgba(46, 204, 113, 0.3);
        }

        &.status-rejected {
          background: linear-gradient(135deg, rgba(231, 76, 60, 0.2), rgba(231, 76, 60, 0.1));
          color: #e74c3c;
          border: 1px solid rgba(231, 76, 60, 0.3);
        }

        &.status-canceled {
          background: linear-gradient(135deg, rgba(149, 165, 166, 0.2), rgba(149, 165, 166, 0.1));
          color: #95a5a6;
          border: 1px solid rgba(149, 165, 166, 0.3);
        }

        &.large {
          padding: 8px 20px;
          font-size: 1rem;
        }
      }

      .username-badge {
        background: rgba(30, 30, 40, 0.6);
        color: #888;
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 0.9rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
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
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.95rem;
      backdrop-filter: blur(10px);

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &.take-btn {
        background: linear-gradient(135deg, rgba(255, 193, 7, 0.3), rgba(255, 152, 0, 0.3));
        color: white;
        border: 1px solid rgba(255, 193, 7, 0.4);

        &:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(255, 152, 0, 0.4), rgba(245, 124, 0, 0.4));
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(255, 152, 0, 0.3);
        }
      }

      &.accept-btn {
        background: linear-gradient(135deg, rgba(46, 204, 113, 0.3), rgba(39, 174, 96, 0.3));
        color: white;
        border: 1px solid rgba(46, 204, 113, 0.4);

        &:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(39, 174, 96, 0.4), rgba(34, 153, 84, 0.4));
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(46, 204, 113, 0.3);
        }
      }

      &.reject-btn {
        background: linear-gradient(135deg, rgba(231, 76, 60, 0.3), rgba(192, 57, 43, 0.3));
        color: white;
        border: 1px solid rgba(231, 76, 60, 0.4);

        &:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(192, 57, 43, 0.4), rgba(169, 50, 38, 0.4));
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(231, 76, 60, 0.3);
        }
      }
    }
  }
}

.section {
  padding: 25px;
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  position: relative !important;
  z-index: 10005 !important;
  opacity: 1 !important;
  visibility: visible !important;
  background: rgba(30, 30, 40, 0.4);
  border: 1px solid rgba(93, 173, 226, 0.15);

  &.glass-section {
    backdrop-filter: blur(16px);
    background: rgba(30, 30, 40, 0.6);
  }

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
      padding: 20px;
      background: rgba(30, 30, 40, 0.8);
      border-radius: 10px;
      color: #e0e0e0;
      line-height: 1.6;
      white-space: pre-wrap;
      word-wrap: break-word;
      backdrop-filter: blur(10px);
    }
  }

  .documents-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;

    .document-card {
      background: rgba(30, 30, 40, 0.8);
      padding: 16px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.06);

      &:hover {
        background: rgba(40, 40, 50, 0.9);
        transform: translateY(-2px);
        border-color: rgba(93, 173, 226, 0.2);
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
        border-radius: 6px;
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
      border-radius: 10px;
      background: linear-gradient(135deg, rgba(231, 76, 60, 0.3), rgba(192, 57, 43, 0.3));
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(231, 76, 60, 0.4);

      &:hover {
        background: linear-gradient(135deg, rgba(192, 57, 43, 0.4), rgba(169, 50, 38, 0.4));
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(231, 76, 60, 0.3);
      }
    }
  }

  &.danger-zone {
    background: linear-gradient(135deg, rgba(42, 26, 26, 0.6), rgba(31, 15, 15, 0.6)) !important;
    border: 1px solid rgba(231, 76, 60, 0.3);

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

@keyframes spin {
  to { transform: rotate(360deg); }
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
}
</style>