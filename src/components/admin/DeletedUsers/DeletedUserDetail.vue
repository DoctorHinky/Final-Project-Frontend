<!-- src/components/admin/users/DeletedUserDetail.vue -->
<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>Gelöschte Benutzerdetails</h3>
        <button class="close-button" @click="$emit('close')">×</button>
      </div>
      <div class="modal-content" v-if="user">
        <div class="detail-sections">
          <div class="detail-section">
            <h4 class="section-title">Benutzerinformationen</h4>
            <div class="info-grid">
              <div class="info-item">
                <label>ID</label>
                <div class="info-value">{{ user.id }}</div>
              </div>
              <div class="info-item">
                <label>Name</label>
                <div class="info-value">{{ user.name }}</div>
              </div>
              <div class="info-item">
                <label>E-Mail</label>
                <div class="info-value">{{ user.email }}</div>
              </div>
              <div class="info-item">
                <label>Löschgrund</label>
                <div class="info-value">
                  <span class="reason-badge" :class="getReasonClass(user.deletionReason)">
                    {{ getReasonText(user.deletionReason) }}
                  </span>
                </div>
              </div>
              <div class="info-item">
                <label>Gelöscht am</label>
                <div class="info-value">{{ formatDate(user.deletedAt) }}</div>
              </div>
              <div class="info-item">
                <label>Gelöscht von</label>
                <div class="info-value">{{ user.deletedBy }}</div>
              </div>
            </div>
          </div>
          
          <div class="detail-section" v-if="user.additionalInfo">
            <h4 class="section-title">Zusätzliche Informationen</h4>
            <div class="info-grid">
              <div class="info-item full-width">
                <label>Löschnotizen</label>
                <div class="info-value">{{ user.additionalInfo }}</div>
              </div>
            </div>
          </div>

          <div class="detail-section" v-if="user.stats">
            <h4 class="section-title">Benutzerstatistiken (vor Löschung)</h4>
            <div class="info-grid">
              <div class="info-item">
                <label>Registriert seit</label>
                <div class="info-value">{{ user.stats.registeredDays }} Tage</div>
              </div>
              <div class="info-item">
                <label>Artikel gelesen</label>
                <div class="info-value">{{ user.stats.articlesRead }}</div>
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
        </div>
        
        <div class="modal-actions">
          <button class="action-button restore-button" @click="restoreUser">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            <span>Benutzer wiederherstellen</span>
          </button>
          <button class="action-button delete-permanent-button" @click="permanentDeleteUser">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            <span>Endgültig löschen</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

type DeletionReason = "VIOLATION" | "SELF_DELETION" | "ADMIN_DELETION" | "INACTIVITY" | "OTHER";

interface UserStats {
  registeredDays: number;
  articlesRead: number;
  comments: number;
  articlesWritten: number;
}

interface DeletedUser {
  id: string;
  name: string;
  email: string;
  deletionReason: DeletionReason;
  deletedAt: Date;
  deletedBy: string;
  additionalInfo?: string;
  stats?: UserStats;
}

export default defineComponent({
  name: 'DeletedUserDetail',
  props: {
    user: {
      type: Object as PropType<DeletedUser>,
      required: true
    }
  },
  emits: ['close', 'restore', 'permanent-delete'],
  setup(props, { emit }) {
    function getReasonText(reason: DeletionReason): string {
      switch (reason) {
        case "VIOLATION":
          return "Regelverstoß";
        case "SELF_DELETION":
          return "Eigene Löschung";
        case "ADMIN_DELETION":
          return "Admin-Löschung";
        case "INACTIVITY":
          return "Inaktivität";
        case "OTHER":
          return "Sonstige";
        default:
          return "Unbekannt";
      }
    }

    function getReasonClass(reason: DeletionReason): string {
      switch (reason) {
        case "VIOLATION":
          return "violation";
        case "SELF_DELETION":
          return "self-deletion";
        case "ADMIN_DELETION":
          return "admin-deletion";
        case "INACTIVITY":
          return "inactivity";
        default:
          return "other";
      }
    }

    function formatDate(date: Date): string {
      return new Date(date).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    const restoreUser = () => {
      if (confirm(`Möchten Sie den Benutzer "${props.user.name}" wirklich wiederherstellen?`)) {
        emit('restore', props.user);
      }
    };

    const permanentDeleteUser = () => {
      if (confirm(`ACHTUNG: Diese Aktion kann nicht rückgängig gemacht werden!\n\nMöchten Sie den Benutzer "${props.user.name}" wirklich ENDGÜLTIG löschen?`)) {
        emit('permanent-delete', props.user);
      }
    };

    return {
      getReasonText,
      getReasonClass,
      formatDate,
      restoreUser,
      permanentDeleteUser
    };
  }
});
</script>

<style lang="scss" scoped>
.modal-overlay {
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(3px);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  z-index: 1000;
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
  
  .detail-sections {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .detail-section {
    background-color: #1c1c1c;
    border-radius: 8px;
    border: 1px solid #333;
    padding: 16px;
    
    .section-title {
      margin: 0 0 16px 0;
      color: #f0f0f0;
      padding-bottom: 8px;
      border-bottom: 1px solid #333;
      font-size: 1.1rem;
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
  
  .modal-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
    flex-wrap: wrap;
    
    .action-button {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 16px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      min-width: 200px;
      
      &.restore-button {
        background-color: rgba(46, 204, 113, 0.7);
        color: white;
        
        &:hover {
          background-color: rgba(46, 204, 113, 0.9);
        }
      }
      
      &.delete-permanent-button {
        background-color: rgba(231, 76, 60, 0.7);
        color: white;
        
        &:hover {
          background-color: rgba(231, 76, 60, 0.9);
        }
      }
    }
  }
}

.reason-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  text-align: center;

  &.violation {
    background-color: rgba(231, 76, 60, 0.2);
    color: #e74c3c;
  }

  &.self-deletion {
    background-color: rgba(52, 152, 219, 0.2);
    color: #3498db;
  }

  &.admin-deletion {
    background-color: rgba(255, 152, 0, 0.2);
    color: #ff9800;
  }

  &.inactivity {
    background-color: rgba(149, 165, 166, 0.2);
    color: #95a5a6;
  }

  &.other {
    background-color: rgba(155, 89, 182, 0.2);
    color: #9b59b6;
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

@media (max-width: 768px) {
  .modal-content {
    .info-grid {
      grid-template-columns: 1fr !important;
    }
    
    .modal-actions {
      flex-direction: column;
      
      .action-button {
        width: 100%;
      }
    }
  }
}
</style>