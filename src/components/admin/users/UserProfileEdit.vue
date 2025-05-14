<!-- src/components/admin/users/UserProfileEdit.vue -->
<template>
  <div class="profile-edit-container">
    <div class="modal-overlay" @click="$emit('close')">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>Benutzerprofil bearbeiten</h3>
          <button class="close-button" @click="$emit('close')">×</button>
        </div>
        <div class="modal-content">
          <form class="edit-form" @submit.prevent="saveUserProfile">
            <div class="form-sections">
              <div class="form-section">
                <h4 class="section-title">Persönliche Informationen</h4>
                <div class="form-row">
                  <div class="form-group">
                    <label for="firstName">Vorname</label>
                    <input 
                      type="text" 
                      id="firstName" 
                      v-model="formData.firstName" 
                      required
                    />
                  </div>
                  <div class="form-group">
                    <label for="lastName">Nachname</label>
                    <input 
                      type="text" 
                      id="lastName" 
                      v-model="formData.lastName" 
                      required
                    />
                  </div>
                </div>
                <div class="form-group">
                  <label for="email">E-Mail</label>
                  <input 
                    type="email" 
                    id="email" 
                    v-model="formData.email" 
                    required
                  />
                </div>
                <div class="form-group">
                  <label for="phone">Telefon</label>
                  <input 
                    type="text" 
                    id="phone" 
                    v-model="formData.phone"
                  />
                </div>
              </div>

              <div class="form-section">
                <h4 class="section-title">Kontostatus</h4>
                <div class="form-group">
                  <label for="status">Status</label>
                  <select id="status" v-model="formData.status">
                    <option value="active">Aktiv</option>
                    <option value="inactive">Inaktiv</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="role">Rolle</label>
                  <select id="role" v-model="formData.role">
                    <option value="user">Benutzer</option>
                    <option value="author">Autor</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div v-if="formData.role === 'author'" class="form-section">
                <h4 class="section-title">Autoreninformationen</h4>
                <div class="form-group">
                  <label for="expertise">Fachgebiet</label>
                  <input 
                    type="text" 
                    id="expertise" 
                    v-model="formData.expertise"
                  />
                </div>
                <div class="form-group">
                  <label for="authorBio">Biografie</label>
                  <textarea 
                    id="authorBio" 
                    v-model="formData.authorBio" 
                    rows="4"
                  ></textarea>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="cancel-button" @click="$emit('close')">
                Abbrechen
              </button>
              <button type="submit" class="save-button">
                Speichern
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, PropType } from 'vue';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  name?: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive';
  role: 'user' | 'author' | 'moderator' | 'admin';
  expertise?: string;
  authorBio?: string;
  avatarUrl?: string;
}

export default defineComponent({
  name: 'UserProfileEdit',
  props: {
    user: {
      type: Object as PropType<User>,
      required: true
    }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const formData = ref({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      status: 'active' as 'active' | 'inactive',
      role: 'user' as 'user' | 'author' | 'moderator' | 'admin',
      expertise: '',
      authorBio: ''
    });

    onMounted(() => {
      // Formulardaten mit Benutzerdaten vorausfüllen
      const user = props.user;
      
      // Wenn der komplette Name als ein String vorliegt, ihn aufteilen
      let firstName = '';
      let lastName = '';
      
      if (user.firstName && user.lastName) {
        firstName = user.firstName;
        lastName = user.lastName;
      } else if (user.name) {
        const nameParts = user.name.split(' ');
        if (nameParts.length > 1) {
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(' ');
        } else {
          firstName = user.name;
        }
      }
      
      formData.value = {
        firstName,
        lastName,
        email: user.email,
        phone: user.phone || '',
        status: user.status || 'active',
        role: user.role || 'user',
        expertise: user.expertise || '',
        authorBio: user.authorBio || ''
      };
    });

    const saveUserProfile = () => {
      // Benutzerprofil aktualisieren
      const updatedUser = {
        id: props.user.id,
        firstName: formData.value.firstName,
        lastName: formData.value.lastName,
        name: `${formData.value.firstName} ${formData.value.lastName}`,
        email: formData.value.email,
        phone: formData.value.phone,
        status: formData.value.status,
        role: formData.value.role,
        expertise: formData.value.expertise,
        authorBio: formData.value.authorBio,
        avatarUrl: props.user.avatarUrl
      };
      
      // Überflüssige Autorenfelder entfernen, wenn der Benutzer kein Autor ist
      if (updatedUser.role !== 'author') {
        delete updatedUser.expertise;
        delete updatedUser.authorBio;
      }
      
      // Emit das aktualisierte Benutzerobjekt
      emit('save', updatedUser);
    };

    return {
      formData,
      saveUserProfile
    };
  }
});
</script>

<style lang="scss" scoped>
.profile-edit-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

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
  
  .edit-form {
    .form-sections {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .form-section {
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
      
      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 16px;
        
        @media (max-width: 600px) {
          grid-template-columns: 1fr;
        }
      }
      
      .form-group {
        margin-bottom: 16px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        label {
          display: block;
          margin-bottom: 6px;
          color: #d0d0d0;
          font-weight: 500;
        }
        
        input, select, textarea {
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
        
        textarea {
          resize: vertical;
        }
      }
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      
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
</style>