<!-- src/components/admin/users/DeletedUserDetail.vue -->
<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>Gelöschte Benutzerdetails</h3>
        <button class="close-button" @click="$emit('close')">×</button>
      </div>
      <div class="modal-content" v-if="user">
        <!-- User Header -->
        <div class="user-header">
          <div class="user-avatar deleted">
            <span>{{ getUserInitials(user) }}</span>
          </div>

          <div class="user-main-info">
            <h3>{{ getUserDisplayName(user) }}</h3>
            <div class="user-badges">
              <span class="status-badge deleted">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline mr-1">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Gelöscht
              </span>
              <span class="reason-badge" :class="getReasonClass(user.deleteReason)">
                {{ getReasonText(user.deleteReason) }}
              </span>
              <span v-if="user.verified" class="status-badge verified">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline mr-1">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Verifiziert
              </span>
            </div>
            <p class="user-id">ID: {{ user.id }}</p>
          </div>
        </div>

        <!-- Deletion Info Section -->
        <div class="section">
          <h4>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline mr-2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
            Löschinformationen
          </h4>
          <div class="field-group">
            <div class="field">
              <label>E-Mail</label>
              <div class="field-value">{{ user.email }}</div>
            </div>
            <div class="field">
              <label>Gelöscht am</label>
              <div class="field-value">{{ formatDate(user.deletedAt) }}</div>
            </div>
            <div class="field">
              <label>Gelöscht von</label>
              <div class="field-value">{{ user.deletedByUser?.username || user.deletedBy || 'System' }}</div>
            </div>
            <div class="field">
              <label>Rolle</label>
              <div class="field-value">
                <span class="role-badge" :class="user.role?.toLowerCase()">
                  {{ getRoleLabel(user.role) }}
                </span>
              </div>
            </div>
          </div>
          <div class="field-group" v-if="user.deleteReason">
            <div class="field full-width">
              <label>Löschgrund (Details)</label>
              <div class="field-value text-area">{{ user.deleteReason }}</div>
            </div>
          </div>
        </div>

        <!-- User Stats Section -->
        <div class="section">
          <h4>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline mr-2">
              <path d="M3 3v18h18"></path>
              <path d="M18 17V9"></path>
              <path d="M13 17V5"></path>
              <path d="M8 17v-3"></path>
            </svg>
            Benutzerinformationen
          </h4>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div class="stat-content">
                <h5>{{ calculateRegisteredDays(user) }}</h5>
                <p>Tage registriert</p>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon articles">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="8" r="4"></circle>
                </svg>
              </div>
              <div class="stat-content">
                <h5>{{ user.username || 'N/A' }}</h5>
                <p>Benutzername</p>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon comments">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </div>
              <div class="stat-content">
                <h5>{{ formatDate(user.createdAt || '') }}</h5>
                <p>Registriert am</p>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon written">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div class="stat-content">
                <h5>{{ user.deactivated ? 'Ja' : 'Nein' }}</h5>
                <p>War deaktiviert</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="section danger-zone">
          <h4>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline mr-2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            Aktionen
          </h4>
          <div class="danger-actions">
            <button class="restore-btn" @click="restoreUser">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline mr-1">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                <path d="M21 3v5h-5"></path>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                <path d="M8 16H3v5"></path>
              </svg>
              Benutzer wiederherstellen
            </button>
            <button class="danger-btn" @click="permanentDeleteUser">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline mr-1">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
              Endgültig löschen
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

interface DeletedUser {
  id: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  email: string;
  role: string;
  isDeleted: boolean;
  deletedAt: string;
  deletedBy: string;
  deleteReason?: string;
  deletedByUser?: {
    username: string;
  };
  profilePicture?: string;
  createdAt?: string;
  verified?: boolean;
  deactivated?: boolean;
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
    function getUserInitials(user: DeletedUser): string {
      const firstname = user.firstname || '';
      const lastname = user.lastname || '';
      
      if (firstname && lastname) {
        return (firstname[0] + lastname[0]).toUpperCase();
      } else if (user.username) {
        return user.username.substring(0, 2).toUpperCase();
      }
      return '??';
    }

    function getUserDisplayName(user: DeletedUser): string {
      if (user.firstname && user.lastname) {
        return `${user.firstname} ${user.lastname}`;
      }
      return user.username || 'Gelöschter Benutzer';
    }

    function getReasonText(reason?: string): string {
      if (!reason) return "Kein Grund angegeben";
      
      // Mapping von Backend-Gründen zu Anzeige-Text
      const reasonMap: Record<string, string> = {
        "No reason given": "Kein Grund angegeben",
        "VIOLATION": "Regelverstoß",
        "SELF_DELETION": "Eigene Löschung",
        "ADMIN_DELETION": "Admin-Löschung",
        "INACTIVITY": "Inaktivität",
      };
      
      return reasonMap[reason] || reason;
    }

    function getReasonClass(reason?: string): string {
      if (!reason) return "other";
      
      if (reason.includes("Regel") || reason.includes("VIOLATION")) return "violation";
      if (reason.includes("Eigene") || reason.includes("SELF")) return "self-deletion";
      if (reason.includes("Admin") || reason.includes("ADMIN")) return "admin-deletion";
      if (reason.includes("Inaktiv") || reason.includes("INACTIVITY")) return "inactivity";
      
      return "other";
    }

    function formatDate(date: string): string {
      if (!date) return "Unbekannt";
      
      return new Date(date).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    function calculateRegisteredDays(user: DeletedUser): number {
      if (!user.createdAt || !user.deletedAt) return 0;
      
      const created = new Date(user.createdAt);
      const deleted = new Date(user.deletedAt);
      const diffTime = Math.abs(deleted.getTime() - created.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    }

    const restoreUser = () => {
      if (confirm(`Möchten Sie den Benutzer "${getUserDisplayName(props.user)}" wirklich wiederherstellen?`)) {
        emit('restore', props.user);
      }
    };

    const permanentDeleteUser = () => {
      if (confirm(`ACHTUNG: Diese Aktion kann nicht rückgängig gemacht werden!\n\nMöchten Sie den Benutzer "${getUserDisplayName(props.user)}" wirklich ENDGÜLTIG löschen?`)) {
        emit('permanent-delete', props.user);
      }
    };

    return {
      getUserInitials,
      getUserDisplayName,
      getReasonText,
      getReasonClass,
      formatDate,
      calculateRegisteredDays,
      getRoleLabel: (role: string) => {
        const roleMap: Record<string, string> = {
          'ADMIN': 'Admin',
          'MODERATOR': 'Moderator',
          'AUTHOR': 'Autor',
          'ADULT': 'Erwachsener',
          'CHILD': 'Kind',
          'USER': 'Benutzer'
        };
        return roleMap[role] || role;
      },
      restoreUser,
      permanentDeleteUser
    };
  }
});
</script>

<style lang="scss" scoped>
.user-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #e0e0e0;
  position: relative;
  background-color: transparent;
  min-height: auto;
}

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
  padding: 20px;
}

.modal-container {
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  background-color: #0a0a0a;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid #444;
  animation: modal-appear 0.3s ease-out;
  position: relative;
  z-index: 1101;
}

.modal-header {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #333;
  background-color: #1a1a1a;

  h3 {
    margin: 0;
    color: #fff;
    font-size: 1.4rem;
    font-weight: 600;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 1.8rem;
    color: #888;
    cursor: pointer;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.2s;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
  }
}

.modal-content {
  padding: 30px;
  overflow-y: auto;
  flex: 1;
  background-color: #0a0a0a;
}

// User Header
.user-header {
  display: flex;
  align-items: center;
  gap: 30px;
  background: #1a1a1a !important;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 20;
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  flex-shrink: 0;

  &.deleted {
    background: linear-gradient(135deg, #636e72 0%, #2d3436 100%);
  }
}

.user-main-info {
  flex: 1;

  h3 {
    margin: 0 0 10px 0;
    font-size: 1.8rem;
    color: #f0f0f0;
  }

  .user-badges {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }

  .user-id {
    color: #666;
    font-family: monospace;
    font-size: 0.9rem;
    margin: 0;
  }
}

.status-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;

  &.deleted {
    background: #636e72;
    color: white;
  }

  &.verified {
    background: rgba(46, 204, 113, 0.2);
    color: #2ecc71;
  }
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;

  &.admin {
    background: rgba(231, 76, 60, 0.2);
    color: #e74c3c;
  }

  &.moderator {
    background: rgba(52, 152, 219, 0.2);
    color: #3498db;
  }

  &.author {
    background: rgba(255, 152, 0, 0.2);
    color: #ff9800;
  }

  &.adult,
  &.child,
  &.user {
    background: rgba(149, 165, 166, 0.2);
    color: #95a5a6;
  }
}

// Sections mit z-index Fix
.section {
  background: #1a1a1a !important;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 10;
  opacity: 1 !important;
  visibility: visible !important;

  h4 {
    margin: 0 0 20px 0;
    font-size: 1.2rem;
    color: #ff9800;
    display: flex;
    align-items: center;
  }
}

.field-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &.full-width {
    grid-column: 1 / -1;
  }

  label {
    font-size: 0.85rem;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .field-value {
    background: #2a2a2a;
    padding: 12px 16px;
    border-radius: 8px;
    min-height: 44px;
    display: flex;
    align-items: center;
    color: #f0f0f0;

    &.text-area {
      min-height: 80px;
      align-items: flex-start;
      white-space: pre-wrap;
    }
  }
}

// Reason Badges
.reason-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;

  &.large {
    font-size: 0.9rem;
    padding: 6px 16px;
  }

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

// Stats Grid
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;

  .stat-item {
    background: #222;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      border-color: #444;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      background: rgba(0, 120, 215, 0.1);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #0078d7;

      &.articles {
        background: rgba(46, 204, 113, 0.1);
        color: #2ecc71;
      }

      &.comments {
        background: rgba(255, 152, 0, 0.1);
        color: #ff9800;
      }

      &.written {
        background: rgba(155, 89, 182, 0.1);
        color: #9b59b6;
      }
    }

    .stat-content {
      h5 {
        margin: 0;
        font-size: 1.3rem;
        color: #f0f0f0;
        font-weight: 600;
      }

      p {
        margin: 4px 0 0 0;
        color: #888;
        font-size: 0.85rem;
      }
    }
  }
}

// Danger Zone
.danger-zone {
  background: linear-gradient(135deg, #2a1a1a, #1f0f0f) !important;
  border: 2px solid rgba(214, 48, 49, 0.3);
  box-shadow: 0 4px 12px rgba(214, 48, 49, 0.1);

  h4 {
    color: #d63031;
  }
}

/* Alle Elemente sichtbar machen */
.modal-content * {
  position: relative;
  z-index: inherit;
}

.danger-actions {
  display: flex;
  justify-content: space-around;
  gap: 15px;
  flex-wrap: wrap;
}

.restore-btn,
.danger-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 200px;
  justify-content: center;
}

.restore-btn {
  background: linear-gradient(135deg, #00b894, #00a884);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 184, 148, 0.3);

  &:hover {
    background: linear-gradient(135deg, #00a884, #009874);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 184, 148, 0.4);
  }
}

.danger-btn {
  background: linear-gradient(135deg, #d63031, #b71c1c);
  color: white;
  box-shadow: 0 4px 12px rgba(214, 48, 49, 0.3);

  &:hover {
    background: linear-gradient(135deg, #c62828, #8b0000);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(214, 48, 49, 0.4);
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
  .user-header {
    flex-direction: column;
    text-align: center;
  }

  .field-group {
    grid-template-columns: 1fr !important;
  }

  .stats-grid {
    grid-template-columns: 1fr !important;
  }

  .danger-actions {
    flex-direction: column;

    button {
      width: 100%;
    }
  }
}
</style>