<!-- src/components/admin/staff/StaffList.vue -->
<template>
  <div class="staff-list-container">
    <div class="list-header">
      <h2>Staff Team</h2>
      <div class="header-actions">
        <button class="add-staff-button" @click="showAddStaffModal = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Mitarbeiter hinzufügen</span>
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <span>Mitarbeiter werden geladen...</span>
    </div>

    <div v-else-if="staffMembers.length === 0" class="no-results">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
      <p>Keine Mitarbeiter gefunden</p>
    </div>

    <div v-else class="staff-grid">
      <div v-for="staff in staffMembers" :key="staff.id" class="staff-card">
        <div class="staff-header" :class="{ 'administrator': staff.role === 'administrator' }">
          <div class="staff-avatar">
            <span v-if="!staff.avatarUrl">{{ getInitials(staff) }}</span>
            <img v-else :src="staff.avatarUrl" :alt="`Avatar von ${staff.name}`" />
          </div>
          <div class="staff-role">
            <span class="role-badge" :class="staff.role">{{ getRoleName(staff.role) }}</span>
          </div>
        </div>
        <div class="staff-info">
          <h3 class="staff-name">{{ staff.name }}</h3>
          <p class="staff-email">{{ staff.email }}</p>
          <div class="staff-activity">
            <div class="activity-item">
              <span class="activity-label">Letzter Login</span>
              <span class="activity-value">{{ formatDate(staff.lastLogin) }}</span>
            </div>
            <div class="activity-item">
              <span class="activity-label">Zugewiesen seit</span>
              <span class="activity-value">{{ formatDate(staff.assignedAt) }}</span>
            </div>
          </div>
          <div class="staff-departments">
            <span 
              v-for="department in staff.departments" 
              :key="department" 
              class="department-badge"
            >
              {{ department }}
            </span>
          </div>
        </div>
        <div class="staff-actions">
          <button class="action-button edit-button" @click="editStaffMember(staff)">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span>Bearbeiten</span>
          </button>
          <button v-if="staff.id !== currentUserId" class="action-button delete-button" @click="confirmDeleteStaff(staff)">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            <span>Entfernen</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Staff Bearbeiten/Hinzufügen Modal -->
    <div class="modal-overlay" v-if="showEditModal || showAddStaffModal" @click="closeModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>{{ showEditModal ? 'Mitarbeiter bearbeiten' : 'Mitarbeiter hinzufügen' }}</h3>
          <button class="close-button" @click="closeModal">×</button>
        </div>
        <div class="modal-content">
          <form class="staff-form" @submit.prevent="saveStaffMember">
            <div class="form-group">
              <label for="staff-name">Name</label>
              <input type="text" id="staff-name" v-model="editingStaff.name" required />
            </div>

            <div class="form-group">
              <label for="staff-email">E-Mail</label>
              <input type="email" id="staff-email" v-model="editingStaff.email" required />
            </div>

            <div class="form-group">
              <label for="staff-role">Rolle</label>
              <select id="staff-role" v-model="editingStaff.role">
                <option value="administrator">Administrator</option>
                <option value="moderator">Moderator</option>
                <option value="editor">Editor</option>
                <option value="support">Support</option>
              </select>
            </div>

            <div class="form-group">
              <label>Abteilungen</label>
              <div class="checkboxes-group">
                <div class="checkbox-item" v-for="dept in availableDepartments" :key="dept">
                  <input 
                    type="checkbox" 
                    :id="'dept-' + dept" 
                    :value="dept" 
                    v-model="editingStaff.departments"
                  />
                  <label :for="'dept-' + dept">{{ dept }}</label>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="cancel-button" @click="closeModal">Abbrechen</button>
              <button type="submit" class="save-button">
                {{ showEditModal ? 'Speichern' : 'Hinzufügen' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Bestätigungsdialog für Löschen -->
    <div class="modal-overlay" v-if="showDeleteConfirm" @click="showDeleteConfirm = false">
      <div class="modal-container confirm-dialog" @click.stop>
        <div class="modal-header">
          <h3>Mitarbeiter entfernen</h3>
          <button class="close-button" @click="showDeleteConfirm = false">×</button>
        </div>
        <div class="modal-content">
          <p class="confirm-message">
            Sind Sie sicher, dass Sie <strong>{{ staffToDelete ? staffToDelete.name : '' }}</strong> aus dem Staff-Team entfernen möchten?
          </p>
          <p class="confirm-details">
            Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
          <div class="confirm-actions">
            <button class="cancel-button" @click="showDeleteConfirm = false">Abbrechen</button>
            <button class="delete-button" @click="deleteStaffMember">Entfernen</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'administrator' | 'moderator' | 'editor' | 'support';
  avatarUrl?: string;
  lastLogin: Date;
  assignedAt: Date;
  departments: string[];
}

export default defineComponent({
  name: 'StaffList',
  setup() {
    const staffMembers = ref<StaffMember[]>([]);
    const isLoading = ref(true);
    const currentUserId = ref('staff_001'); // Simulierte aktuelle Benutzer-ID (normalerweise aus Auth-Service)
    
    // Verfügbare Abteilungen
    const availableDepartments = [
      'Inhaltsverwaltung',
      'Benutzersupport',
      'Technischer Support',
      'Qualitätssicherung',
      'Community-Management'
    ];
    
    // Modal-Status
    const showEditModal = ref(false);
    const showAddStaffModal = ref(false);
    const showDeleteConfirm = ref(false);
    
    // Zu bearbeitender/löschender Mitarbeiter
    const editingStaff = ref<StaffMember>({
      id: '',
      name: '',
      email: '',
      role: 'support',
      lastLogin: new Date(),
      assignedAt: new Date(),
      departments: []
    });
    const staffToDelete = ref<StaffMember | null>(null);

    // Mitarbeiter laden (Dummy-Implementierung)
    onMounted(() => {
      // Simuliere API-Abruf
      setTimeout(() => {
        staffMembers.value = [
          {
            id: 'staff_001',
            name: 'Thomas Wagner',
            email: 'thomas.wagner@example.com',
            role: 'administrator',
            lastLogin: new Date('2024-05-12T10:30:00'),
            assignedAt: new Date('2022-01-15'),
            departments: ['Inhaltsverwaltung', 'Technischer Support']
          },
          {
            id: 'staff_002',
            name: 'Julia Meyer',
            email: 'julia.meyer@example.com',
            role: 'moderator',
            lastLogin: new Date('2024-05-10T15:45:00'),
            assignedAt: new Date('2022-05-22'),
            departments: ['Community-Management', 'Benutzersupport']
          },
          {
            id: 'staff_003',
            name: 'Michael Schmidt',
            email: 'michael.schmidt@example.com',
            role: 'editor',
            lastLogin: new Date('2024-05-11T09:15:00'),
            assignedAt: new Date('2023-03-10'),
            departments: ['Inhaltsverwaltung', 'Qualitätssicherung']
          },
          {
            id: 'staff_004',
            name: 'Sandra Bauer',
            email: 'sandra.bauer@example.com',
            role: 'support',
            lastLogin: new Date('2024-05-09T14:20:00'),
            assignedAt: new Date('2023-08-05'),
            departments: ['Benutzersupport']
          },
          {
            id: 'staff_005',
            name: 'Markus Fischer',
            email: 'markus.fischer@example.com',
            role: 'moderator',
            lastLogin: new Date('2024-05-08T11:10:00'),
            assignedAt: new Date('2022-11-15'),
            departments: ['Community-Management', 'Qualitätssicherung']
          }
        ];
        isLoading.value = false;
      }, 1000);
    });

    // Initialen für Avatar generieren
    const getInitials = (staff: StaffMember): string => {
      if (!staff.name) return '??';
      
      const nameParts = staff.name.split(' ');
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      }
      
      return nameParts[0].substring(0, 2).toUpperCase();
    };

    // Rollenbezeichnung abrufen
    const getRoleName = (role: string): string => {
      switch (role) {
        case 'administrator': return 'Administrator';
        case 'moderator': return 'Moderator';
        case 'editor': return 'Editor';
        case 'support': return 'Support';
        default: return role;
      }
    };

    // Datum formatieren
    const formatDate = (date: Date): string => {
      return new Date(date).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    // Mitarbeiter bearbeiten
    const editStaffMember = (staff: StaffMember) => {
      editingStaff.value = { ...staff }; // Kopie erstellen
      showEditModal.value = true;
    };

    // Mitarbeiter hinzufügen (Modal öffnen)
    const addStaffMember = () => {
      editingStaff.value = {
        id: '',
        name: '',
        email: '',
        role: 'support',
        lastLogin: new Date(),
        assignedAt: new Date(),
        departments: []
      };
      showAddStaffModal.value = true;
    };

    // Mitarbeiter speichern (hinzufügen oder aktualisieren)
    const saveStaffMember = () => {
      if (showEditModal.value) {
        // Bestehenden Mitarbeiter aktualisieren
        const index = staffMembers.value.findIndex(s => s.id === editingStaff.value.id);
        if (index !== -1) {
          staffMembers.value[index] = { ...editingStaff.value };
        }
      } else {
        // Neuen Mitarbeiter hinzufügen
        const newStaff = { 
          ...editingStaff.value,
          id: 'staff_' + (staffMembers.value.length + 1).toString().padStart(3, '0'),
          assignedAt: new Date(),
          lastLogin: new Date()
        };
        staffMembers.value.push(newStaff);
      }
      
      closeModal();
    };

    // Mitarbeiter löschen bestätigen
    const confirmDeleteStaff = (staff: StaffMember) => {
      staffToDelete.value = staff;
      showDeleteConfirm.value = true;
    };

    // Mitarbeiter löschen
    const deleteStaffMember = () => {
      if (staffToDelete.value) {
        staffMembers.value = staffMembers.value.filter(s => s.id !== staffToDelete.value?.id);
        showDeleteConfirm.value = false;
        staffToDelete.value = null;
      }
    };

    // Modal schließen
    const closeModal = () => {
      showEditModal.value = false;
      showAddStaffModal.value = false;
    };

    return {
      staffMembers,
      isLoading,
      currentUserId,
      availableDepartments,
      showEditModal,
      showAddStaffModal,
      showDeleteConfirm,
      editingStaff,
      staffToDelete,
      getInitials,
      getRoleName,
      formatDate,
      editStaffMember,
      addStaffMember,
      saveStaffMember,
      confirmDeleteStaff,
      deleteStaffMember,
      closeModal
    };
  }
});
</script>

<style lang="scss" scoped>
.staff-list-container {
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
    .add-staff-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background-color: rgba(46, 204, 113, 0.2);
      color: #2ecc71;
      border: none;
      border-radius: 4px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background-color: rgba(46, 204, 113, 0.3);
        transform: translateY(-2px);
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

.staff-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 20px;
  
  .staff-card {
    background-color: #1c1c1c;
    border-radius: 8px;
    border: 1px solid #333;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
      border-color: #555;
    }
    
    .staff-header {
      background: linear-gradient(135deg, #262626, #1a1a1a);
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #333;
      
      &.administrator {
        background: linear-gradient(135deg, #2c3e50, #1a1a1a);
      }
      
      .staff-avatar {
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
        border: 2px solid #333;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      
      .staff-role {
        .role-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          
          &.administrator {
            background-color: rgba(41, 128, 185, 0.2);
            color: #3498db;
            border: 1px solid rgba(41, 128, 185, 0.3);
          }
          
          &.moderator {
            background-color: rgba(142, 68, 173, 0.2);
            color: #9b59b6;
            border: 1px solid rgba(142, 68, 173, 0.3);
          }
          
          &.editor {
            background-color: rgba(46, 204, 113, 0.2);
            color: #2ecc71;
            border: 1px solid rgba(46, 204, 113, 0.3);
          }
          
          &.support {
            background-color: rgba(230, 126, 34, 0.2);
            color: #e67e22;
            border: 1px solid rgba(230, 126, 34, 0.3);
          }
        }
      }
    }
    
    .staff-info {
      padding: 20px;
      flex: 1;
      
      .staff-name {
        margin: 0 0 5px 0;
        font-size: 1.2rem;
        color: #f0f0f0;
      }
      
      .staff-email {
        margin: 0 0 16px 0;
        font-size: 0.9rem;
        color: #a0a0a0;
      }
      
      .staff-activity {
        margin-bottom: 16px;
        
        .activity-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          
          .activity-label {
            color: #888;
            font-size: 0.85rem;
          }
          
          .activity-value {
            color: #d0d0d0;
            font-size: 0.85rem;
          }
        }
      }
      
      .staff-departments {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        
        .department-badge {
          background-color: #333;
          color: #a0a0a0;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          white-space: nowrap;
        }
      }
    }
    
    .staff-actions {
      display: flex;
      gap: 10px;
      padding: 16px;
      background-color: #262626;
      border-top: 1px solid #333;
      
      .action-button {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 8px;
        border-radius: 4px;
        font-size: 0.9rem;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &.edit-button {
          background-color: rgba(41, 128, 185, 0.2);
          color: #3498db;
          
          &:hover {
            background-color: rgba(41, 128, 185, 0.3);
          }
        }
        
        &.delete-button {
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
  max-width: 600px;
  max-height: 90vh;
  background-color: #222;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid #444;
  animation: modal-appear 0.3s ease-out;
  
  &.confirm-dialog {
    max-width: 450px;
  }
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
  
  .staff-form {
    .form-group {
      margin-bottom: 16px;
      
      label {
        display: block;
        margin-bottom: 6px;
        color: #d0d0d0;
        font-weight: 500;
      }
      
      input, select {
        width: 100%;
        padding: 10px 12px;
        background-color: #2a2a2a;
        border: 1px solid #444;
        border-radius: 4px;
        color: #f0f0f0;
        font-size: 1rem;
        
        &:focus {
          outline: none;
          border-color: #666;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }
      }
      
      .checkboxes-group {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 10px;
        margin-top: 10px;
        
        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 8px;
          
          input[type="checkbox"] {
            width: auto;
            cursor: pointer;
          }
          
          label {
            margin: 0;
            cursor: pointer;
            font-weight: normal;
          }
        }
      }
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 20px;
      
      button {
        padding: 10px 20px;
        border-radius: 4px;
        font-weight: 500;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &.cancel-button {
          background-color: #333;
          color: #f0f0f0;
          
          &:hover {
            background-color: #444;
          }
        }
        
        &.save-button {
          background-color: rgba(46, 204, 113, 0.7);
          color: white;
          
          &:hover {
            background-color: rgba(46, 204, 113, 0.9);
          }
        }
      }
    }
  }
  
  .confirm-message {
    font-size: 1.1rem;
    margin: 0 0 10px 0;
    color: #f0f0f0;
    
    strong {
      color: #e74c3c;
    }
  }
  
  .confirm-details {
    margin: 0 0 20px 0;
    color: #a0a0a0;
  }
  
  .confirm-actions {
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
      
      &.cancel-button {
        background-color: #333;
        color: #f0f0f0;
        
        &:hover {
          background-color: #444;
        }
      }
      
      &.delete-button {
        background-color: rgba(231, 76, 60, 0.7);
        color: white;
        
        &:hover {
          background-color: rgba(231, 76, 60, 0.9);
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
      
      .add-staff-button {
        width: 100%;
        justify-content: center;
      }
    }
  }
  
  .staff-card {
    .staff-header {
      flex-direction: column;
      gap: 12px;
      
      .staff-role {
        align-self: flex-start;
      }
    }
    
    .staff-actions {
      flex-direction: column;
      
      .action-button {
        width: 100%;
      }
    }
  }
  
  .modal-content {
    .staff-form {
      .checkboxes-group {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>