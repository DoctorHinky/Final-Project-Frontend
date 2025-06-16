<!-- src/components/member/support/UserTicketDetailModal.vue -->
<template>
  <!-- Modal Overlay -->
  <div v-if="isOpen && ticket" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-content">
          <div class="header-icon" :class="getStatusIconClass(ticket.status)">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 5v2"></path>
              <path d="M15 11v2"></path>
              <path d="M15 17v2"></path>
              <path d="M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z"></path>
            </svg>
          </div>
          <div>
            <h3>{{ ticket.title }}</h3>
            <p class="header-subtitle">Ticket-ID: {{ ticket.id }}</p>
          </div>
        </div>
        <button class="close-button" @click="closeModal" :disabled="isSubmitting">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Modal Content -->
      <div class="modal-content">
        <!-- Ticket Info -->
        <div class="ticket-info">
          <div class="info-grid">
            <div class="info-item">
              <label>Status</label>
              <div class="status-badge" :class="getStatusClass(ticket.status)">
                {{ formatStatus(ticket.status) }}
              </div>
            </div>
            <div class="info-item">
              <label>Kategorie</label>
              <span>{{ formatCategory(ticket.category) }}</span>
            </div>
            <div class="info-item">
              <label>Erstellt</label>
              <span>{{ formatDateTime(ticket.createdAt) }}</span>
            </div>
            <div class="info-item">
              <label>Zuletzt aktualisiert</label>
              <span>{{ formatDateTime(ticket.updatedAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Original Description -->
        <div class="ticket-description">
          <h4>Ursprüngliche Beschreibung</h4>
          <div class="description-content">
            {{ ticket.description }}
          </div>
        </div>

        <!-- Messages Timeline -->
        <div class="messages-section" v-if="ticket.messages && ticket.messages.length > 0">
          <h4>Nachrichtenverlauf</h4>
          <div class="messages-timeline">
            <div 
              v-for="(message, index) in ticket.messages" 
              :key="message.id" 
              class="message-item"
              :class="{ 'is-staff': message.isStaff, 'is-user': !message.isStaff }"
            >
              <div class="message-avatar">
                <div class="avatar-circle" :class="{ 'staff': message.isStaff }">
                  <svg v-if="message.isStaff" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              </div>
              <div class="message-content">
                <div class="message-header">
                  <div class="message-author">
                    {{ message.userName }}
                    <span class="author-badge" v-if="message.isStaff">Support</span>
                  </div>
                  <div class="message-time">{{ formatRelativeTime(message.createdAt) }}</div>
                </div>
                <div class="message-body">{{ message.message }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reply Form (nur wenn Ticket nicht geschlossen) -->
        <div v-if="canReply" class="reply-section">
          <h4>Antworten</h4>
          <div class="reply-form">
            <textarea 
              v-model="replyMessage" 
              class="reply-input"
              placeholder="Ihre Nachricht..."
              rows="4"
              :disabled="isSubmitting"
              maxlength="1000"
            ></textarea>
            <div class="reply-footer">
              <div class="character-count">{{ replyMessage.length }}/1000</div>
              <button 
                class="btn-send-reply" 
                @click="sendReply"
                :disabled="!canSendReply || isSubmitting"
              >
                <span v-if="isSubmitting" class="loading">
                  <svg class="spinner" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-dasharray="16 16"></circle>
                  </svg>
                  Wird gesendet...
                </span>
                <span v-else>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                  Senden
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Ticket Actions -->
        <div class="ticket-actions">
          <div class="action-info">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span v-if="ticket.status === 'CLOSED'">
              Dieses Ticket ist geschlossen. Sie können es nicht mehr bearbeiten.
            </span>
            <span v-else-if="ticket.status === 'RESOLVED'">
              Dieses Ticket wurde als gelöst markiert. Falls Sie weitere Fragen haben, können Sie es wieder öffnen.
            </span>
            <span v-else>
              Unser Support-Team wird sich baldmöglichst bei Ihnen melden.
            </span>
          </div>
          
          <div class="action-buttons">
            <button 
              v-if="ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED'" 
              class="btn-action close-ticket" 
              @click="confirmCloseTicket"
              :disabled="isSubmitting"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Ticket schließen
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Confirmation Dialog -->
  <div v-if="showCloseConfirm" class="modal-overlay confirmation" @click="cancelCloseTicket">
    <div class="confirm-dialog" @click.stop>
      <div class="confirm-header">
        <h4>Ticket schließen</h4>
      </div>
      <div class="confirm-content">
        <p>Möchten Sie dieses Ticket wirklich schließen? Nach dem Schließen können Sie keine weiteren Nachrichten mehr hinzufügen.</p>
      </div>
      <div class="confirm-actions">
        <button class="btn-cancel" @click="cancelCloseTicket">Abbrechen</button>
        <button class="btn-confirm" @click="closeTicket">Schließen</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { memberTicketService, type FullTicket, TicketStatus, TicketCategory } from '@/services/member.ticket.service';

export default defineComponent({
  name: 'UserTicketDetailModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    ticket: {
      type: Object as () => FullTicket | null,
      default: null
    }
  },
  emits: ['close', 'ticket-updated'],
  setup(props, { emit }) {
    // State
    const replyMessage = ref('');
    const isSubmitting = ref(false);
    const showCloseConfirm = ref(false);
    
    // Computed
    const canReply = computed(() => {
      return props.ticket && 
             props.ticket.status !== TicketStatus.CLOSED && 
             props.ticket.status !== TicketStatus.RESOLVED;
    });
    
    const canSendReply = computed(() => {
      return replyMessage.value.trim().length >= 5;
    });
    
    // Methods
    const closeModal = () => {
      if (!isSubmitting.value) {
        replyMessage.value = '';
        emit('close');
      }
    };
    
    const sendReply = async () => {
      if (!canSendReply.value || !props.ticket) return;
      
      isSubmitting.value = true;
      
      try {
        await memberTicketService.addMessageToTicket(
          props.ticket.id,
          replyMessage.value.trim()
        );
        
        replyMessage.value = '';
        emit('ticket-updated');
      } catch (error) {
        console.error('Fehler beim Senden der Nachricht:', error);
        // Hier könnte eine Toast-Notification gezeigt werden
      } finally {
        isSubmitting.value = false;
      }
    };
    
    const confirmCloseTicket = () => {
      showCloseConfirm.value = true;
    };
    
    const cancelCloseTicket = () => {
      showCloseConfirm.value = false;
    };
    
    const closeTicket = async () => {
      if (!props.ticket) return;
      
      showCloseConfirm.value = false;
      isSubmitting.value = true;
      
      try {
        await memberTicketService.closeTicket(props.ticket.id);
        emit('ticket-updated');
      } catch (error) {
        console.error('Fehler beim Schließen des Tickets:', error);
      } finally {
        isSubmitting.value = false;
      }
    };
    
    // Formatierungsfunktionen
    const formatStatus = (status: TicketStatus) => {
      return memberTicketService.formatStatus(status);
    };
    
    const formatCategory = (category: TicketCategory) => {
      return memberTicketService.formatCategory(category);
    };
    
    const formatDateTime = (dateString: string) => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    };
    
    const formatRelativeTime = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
      
      if (diffInMinutes < 1) {
        return 'Gerade eben';
      } else if (diffInMinutes < 60) {
        return `vor ${Math.round(diffInMinutes)} Min.`;
      } else if (diffInMinutes < 24 * 60) {
        return `vor ${Math.round(diffInMinutes / 60)} Std.`;
      } else {
        return formatDateTime(dateString);
      }
    };
    
    const getStatusClass = (status: TicketStatus) => {
      return {
        'status-open': status === TicketStatus.OPEN,
        'status-progress': status === TicketStatus.IN_PROGRESS,
        'status-waiting': status === TicketStatus.WAITING,
        'status-resolved': status === TicketStatus.RESOLVED,
        'status-closed': status === TicketStatus.CLOSED
      };
    };
    
    const getStatusIconClass = (status: TicketStatus) => {
      return {
        'icon-open': status === TicketStatus.OPEN,
        'icon-progress': status === TicketStatus.IN_PROGRESS,
        'icon-waiting': status === TicketStatus.WAITING,
        'icon-resolved': status === TicketStatus.RESOLVED,
        'icon-closed': status === TicketStatus.CLOSED
      };
    };
    
    // Watch für Modal-Reset
    watch(() => props.isOpen, (newValue) => {
      if (newValue) {
        replyMessage.value = '';
        showCloseConfirm.value = false;
      }
    });
    
    return {
      replyMessage,
      isSubmitting,
      showCloseConfirm,
      canReply,
      canSendReply,
      closeModal,
      sendReply,
      confirmCloseTicket,
      cancelCloseTicket,
      closeTicket,
      formatStatus,
      formatCategory,
      formatDateTime,
      formatRelativeTime,
      getStatusClass,
      getStatusIconClass
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;

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
  z-index: 9999 !important;
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);

  &.confirmation {
    z-index: 10000 !important;
  }
}

.modal-container {
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modal-appear 0.3s ease-out;

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, card-bg);
      border: 1px solid mixins.theme-color($theme, border-light);
    }
  }
}

.modal-header {
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid;

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, secondary-bg);
      border-color: mixins.theme-color($theme, border-light);
    }
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 16px;

    .header-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;

      &.icon-open {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      }

      &.icon-progress {
        background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      }

      &.icon-waiting {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      }

      &.icon-resolved {
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      }

      &.icon-closed {
        background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
      }
    }

    h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      line-height: 1.4;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    .header-subtitle {
      margin: 4px 0 0 0;
      font-size: 0.875rem;
      font-family: monospace;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  .close-button {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: transparent;
        color: mixins.theme-color($theme, text-secondary);

        &:hover:not(:disabled) {
          background-color: mixins.theme-color($theme, hover-color);
          color: mixins.theme-color($theme, text-primary);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
  }
}

.modal-content {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.ticket-info {
  margin-bottom: 24px;

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;

    .info-item {
      label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        margin-bottom: 4px;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }

      span {
        font-size: 0.875rem;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }

      .status-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;

        &.status-open {
          background-color: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        &.status-progress {
          background-color: rgba(168, 85, 247, 0.1);
          color: #a855f7;
        }

        &.status-waiting {
          background-color: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        &.status-resolved {
          background-color: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }

        &.status-closed {
          background-color: rgba(107, 114, 128, 0.1);
          color: #6b7280;
        }
      }
    }
  }
}

.ticket-description {
  margin-bottom: 24px;

  h4 {
    margin: 0 0 12px 0;
    font-size: 1rem;
    font-weight: 600;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
      }
    }
  }

  .description-content {
    padding: 16px;
    border-radius: 8px;
    line-height: 1.6;
    white-space: pre-line;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, secondary-bg);
        border: 1px solid mixins.theme-color($theme, border-light);
        color: mixins.theme-color($theme, text-primary);
      }
    }
  }
}

.messages-section {
  margin-bottom: 24px;

  h4 {
    margin: 0 0 16px 0;
    font-size: 1rem;
    font-weight: 600;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
      }
    }
  }

  .messages-timeline {
    .message-item {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .message-avatar {
        flex-shrink: 0;

        .avatar-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;

          &.staff {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          }

          &:not(.staff) {
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background-color: mixins.theme-color($theme, border-medium);
                color: mixins.theme-color($theme, text-secondary);
              }
            }
          }
        }
      }

      .message-content {
        flex: 1;
        min-width: 0;

        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .message-author {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.875rem;
            font-weight: 600;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-primary);
              }
            }

            .author-badge {
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 0.625rem;
              font-weight: 700;
              background-color: #f59e0b;
              color: white;
            }
          }

          .message-time {
            font-size: 0.75rem;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-tertiary);
              }
            }
          }
        }

        .message-body {
          padding: 12px 16px;
          border-radius: 8px;
          line-height: 1.5;
          white-space: pre-line;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
              border: 1px solid mixins.theme-color($theme, border-light);
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }
      }

      &.is-staff {
        .message-content .message-body {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%);
          border-color: rgba(245, 158, 11, 0.2);
        }
      }
    }
  }
}

.reply-section {
  margin-bottom: 24px;

  h4 {
    margin: 0 0 12px 0;
    font-size: 1rem;
    font-weight: 600;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
      }
    }
  }

  .reply-form {
    .reply-input {
      width: 100%;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid;
      font-size: 0.875rem;
      line-height: 1.5;
      resize: vertical;
      min-height: 100px;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, primary-bg);
          border-color: mixins.theme-color($theme, border-medium);
          color: mixins.theme-color($theme, text-primary);

          &:focus {
            outline: none;
            border-color: #4facfe;
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          &::placeholder {
            color: mixins.theme-color($theme, text-tertiary);
          }
        }
      }
    }

    .reply-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;

      .character-count {
        font-size: 0.75rem;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-tertiary);
          }
        }
      }

      .btn-send-reply {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        color: white;

        &:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .loading {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }
      }
    }
  }
}

.ticket-actions {
  padding-top: 20px;
  border-top: 1px solid;

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      border-color: mixins.theme-color($theme, border-light);
    }
  }

  .action-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    padding: 12px;
    border-radius: 8px;
    font-size: 0.875rem;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, secondary-bg);
        color: mixins.theme-color($theme, text-secondary);
      }
    }
  }

  .action-buttons {
    display: flex;
    justify-content: flex-end;

    .btn-action {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;

      &.close-ticket {
        background-color: rgba(239, 68, 68, 0.1);
        color: #ef4444;

        &:hover:not(:disabled) {
          background-color: rgba(239, 68, 68, 0.2);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
  }
}

// Confirmation Dialog
.confirm-dialog {
  width: 90%;
  max-width: 400px;
  border-radius: 12px;
  overflow: hidden;
  animation: modal-appear 0.3s ease-out;

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, card-bg);
      border: 1px solid mixins.theme-color($theme, border-light);
    }
  }

  .confirm-header {
    padding: 20px;
    border-bottom: 1px solid;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        border-color: mixins.theme-color($theme, border-light);
      }
    }

    h4 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }
  }

  .confirm-content {
    padding: 20px;

    p {
      margin: 0;
      line-height: 1.5;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  .confirm-actions {
    padding: 16px 20px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    border-top: 1px solid;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, secondary-bg);
        border-color: mixins.theme-color($theme, border-light);
      }
    }

    .btn-cancel {
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: transparent;
          border-color: mixins.theme-color($theme, border-medium);
          color: mixins.theme-color($theme, text-secondary);

          &:hover {
            background-color: mixins.theme-color($theme, hover-color);
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }
    }

    .btn-confirm {
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      background-color: #ef4444;
      color: white;

      &:hover {
        background-color: #dc2626;
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    max-height: 95vh;
  }

  .modal-header {
    padding: 16px;

    .header-content {
      gap: 12px;

      .header-icon {
        width: 40px;
        height: 40px;
      }

      h3 {
        font-size: 1.125rem;
      }
    }
  }

  .modal-content {
    padding: 16px;
  }

  .ticket-info .info-grid {
    grid-template-columns: 1fr;
  }

  .messages-timeline .message-item {
    gap: 8px;

    .message-avatar .avatar-circle {
      width: 32px;
      height: 32px;
    }
  }

  .reply-section .reply-form .reply-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;

    .btn-send-reply {
      justify-content: center;
    }
  }

  .ticket-actions .action-buttons {
    justify-content: stretch;

    .btn-action {
      width: 100%;
      justify-content: center;
    }
  }
}
</style>