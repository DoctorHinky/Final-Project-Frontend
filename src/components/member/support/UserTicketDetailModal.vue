<!-- src/components/member/support/UserTicketDetailModal.vue -->
<template>
  <!-- Modal Overlay -->
  <div v-if="isOpen && ticket" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-content">
          <div class="header-icon" :class="getStatusIconClass(ticket.status)">
            <TicketIcon class="w-6 h-6" />
          </div>
          <div>
            <h3>{{ ticket.title }}</h3>
            <p class="header-subtitle">Ticket-ID: {{ ticket.id }}</p>
          </div>
        </div>
        <button class="close-button" @click="closeModal" :disabled="isSubmitting">
          <XMarkIcon class="w-5 h-5 Icons" />
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
                  <StarIcon v-if="message.isStaff" class="w-4 h-4 Icons" />
                  <UserIcon v-else class="w-4 h-4 Icons" />
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
                  <div class="spinner"></div>
                  Wird gesendet...
                </span>
                <span v-else>
                  <PaperAirplaneIcon class="w-4 h-4 Icons" />
                  Senden
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Ticket Actions -->
        <div class="ticket-actions">
          <div class="action-info">
            <ExclamationCircleIcon class="w-4 h-4 Icons" />
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
              <XMarkIcon class="w-4 h-4 Icons" />
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
import {
  TicketIcon,
  XMarkIcon,
  ExclamationCircleIcon,
  StarIcon,
  UserIcon,
  PaperAirplaneIcon
} from '@heroicons/vue/24/outline';

export default defineComponent({
  name: 'UserTicketDetailModal',
  components: {
    TicketIcon,
    XMarkIcon,
    ExclamationCircleIcon,
    StarIcon,
    UserIcon,
    PaperAirplaneIcon
  },
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
      position: relative;

      &.icon-open,
      &.icon-progress,
      &.icon-waiting,
      &.icon-resolved,
      &.icon-closed {
        background: linear-gradient(135deg, #4ad295 0%, #35ccd0 100%);
        box-shadow: 0 0 20px rgba(74, 210, 149, 0.25);
        
        &::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 12px;
          background: linear-gradient(135deg, #4ad295 0%, #35ccd0 100%);
          opacity: 0.4;
          filter: blur(8px);
          z-index: -1;
        }
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
        background-color: rgba(74, 210, 149, 0.1);
        color: #4ad295;
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
            background: linear-gradient(135deg, #4ad295 0%, #35ccd0 100%);
            box-shadow: 0 0 15px rgba(74, 210, 149, 0.3);
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
              background: linear-gradient(135deg, #4ad295 0%, #35ccd0 100%);
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
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background: linear-gradient(135deg, rgba(74, 210, 149, 0.05) 0%, rgba(53, 204, 208, 0.05) 100%);
              border-color: rgba(74, 210, 149, 0.2);
            }
          }
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
            border-color: #4ad295;
            box-shadow: 0 0 0 3px rgba(74, 210, 149, 0.1);
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
        background: linear-gradient(135deg, #4ad295 0%, #35ccd0 100%);
        color: white;
        position: relative;
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 8px;
          background: linear-gradient(135deg, #4ad295 0%, #35ccd0 100%);
          opacity: 0;
          filter: blur(8px);
          transition: opacity 0.3s;
          z-index: -1;
        }

        &:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(74, 210, 149, 0.3), 0 0 20px rgba(74, 210, 149, 0.2);

          &::before {
            opacity: 0.5;
          }
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
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-left-color: white;
          border-radius: 50%;
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
      border: 1px solid;

      &.close-ticket {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: transparent;
            border-color: mixins.theme-color($theme, border-medium);
            color: mixins.theme-color($theme, text-secondary);

            &:hover:not(:disabled) {
              background-color: mixins.theme-color($theme, hover-color);
              color: mixins.theme-color($theme, text-primary);
              box-shadow: 0 0 10px rgba(74, 210, 149, 0.1);
            }

            &:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
          }
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
      background: linear-gradient(135deg, #4ad295 0%, #35ccd0 100%);
      color: white;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        inset: -1px;
        border-radius: 6px;
        background: linear-gradient(135deg, #4ad295 0%, #35ccd0 100%);
        opacity: 0;
        filter: blur(8px);
        transition: opacity 0.3s;
        z-index: -1;
      }

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(74, 210, 149, 0.3), 0 0 20px rgba(74, 210, 149, 0.2);

        &::before {
          opacity: 0.5;
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

.Icons{
  width: 30px !important;
}
</style>