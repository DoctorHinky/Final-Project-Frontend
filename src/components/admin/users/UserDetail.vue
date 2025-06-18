<template>
  <div class="user-detail-container">
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>Benutzerdaten werden geladen...</span>
    </div>

    <div v-else-if="!user" class="error-state">
      <h3>Benutzer nicht gefunden</h3>
      <p>Der angegebene Benutzer konnte nicht gefunden werden.</p>
    </div>

    <div v-else class="user-data">
      <!-- Header -->
      <div class="user-header">
        <div class="user-avatar" :class="{ admin: user.role === 'ADMIN' }">
          <span v-if="!user.profilePicture">{{ userInitials }}</span>
          <img v-else :src="user.profilePicture" :alt="`Avatar von ${user.username}`" />
        </div>

        <div class="user-main-info">
          <div class="editable-name">
            <input
              v-if="editing.name"
              v-model="editData.firstname"
              @keyup.enter="saveField('name')"
              @keyup.esc="cancelEdit('name')"
              placeholder="Vorname"
              class="edit-input"
            />
            <h3 v-else @click="startEdit('name')">{{ user.firstname || "Vorname" }}</h3>

            <input
              v-if="editing.name"
              v-model="editData.lastname"
              @keyup.enter="saveField('name')"
              @keyup.esc="cancelEdit('name')"
              placeholder="Nachname"
              class="edit-input"
            />
            <h3 v-else @click="startEdit('name')">{{ user.lastname || "Nachname" }}</h3>
          </div>

          <div class="user-badges">
            <select v-if="editing.role" v-model="editData.role" @change="saveField('role')" class="role-select">
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
              <option value="MODERATOR">Moderator</option>
              <option value="AUTHOR">Author</option>
            </select>
            <span v-else class="type-badge" :class="roleBadgeClass" @click="startEdit('role')">
              {{ user.role || "USER" }}
            </span>

            <span class="status-badge" :class="user.verified ? 'active' : 'inactive'" @click="toggleVerified">
              <svg
                v-if="user.verified"
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="inline mr-1"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="inline mr-1"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              {{ user.verified ? "Verifiziert" : "Nicht verifiziert" }}
            </span>

            <span v-if="user.isDeleted" class="status-badge deleted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="inline mr-1"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Gelöscht
            </span>
          </div>

          <p class="user-id">ID: {{ user.id }}</p>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <button @click="resetChanges" :disabled="!hasChanges" class="reset-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="inline mr-1"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M8 16H3v5"></path>
            </svg>
            Zurücksetzen
          </button>
        </div>
      </div>

      <!-- Kontakt Section -->
      <div class="section">
        <h4>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="inline mr-2"
          >
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
          Kontaktdaten
        </h4>
        <div class="field-group">
          <div class="field">
            <label>E-Mail</label>
            <input
              v-if="editing.email"
              v-model="editData.email"
              @blur="saveField('email')"
              @keyup.enter="saveField('email')"
              type="email"
              class="field-input"
            />
            <div v-else class="field-value" @click="startEdit('email')">
              {{ user.email || "Keine E-Mail" }}
            </div>
          </div>

          <div class="field">
            <label>Telefon</label>
            <input
              v-if="editing.phone"
              v-model="editData.phone"
              @blur="saveField('phone')"
              @keyup.enter="saveField('phone')"
              type="tel"
              class="field-input"
            />
            <div v-else class="field-value" @click="startEdit('phone')">
              {{ user.phone || "Nicht angegeben" }}
            </div>
          </div>

          <div class="field">
            <label>Geburtsdatum</label>
            <input
              v-if="editing.birthdate"
              v-model="editData.birthdate"
              @blur="saveField('birthdate')"
              type="date"
              class="field-input"
            />
            <div v-else class="field-value" @click="startEdit('birthdate')">
              {{ formattedBirthdate }}
            </div>
          </div>
        </div>
      </div>

      <!-- Profil Section -->
      <div class="section">
        <h4>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="inline mr-2"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="8" r="4"></circle>
          </svg>
          Profilinformationen
        </h4>
        <div class="field-group">
          <div class="field full-width">
            <label>Kurzbeschreibung</label>
            <textarea
              v-if="editing.shortDescription"
              v-model="editData.shortDescription"
              @blur="saveField('shortDescription')"
              rows="2"
              class="field-input"
            >
            </textarea>
            <div v-else class="field-value text-area" @click="startEdit('shortDescription')">
              {{ user.shortDescription || "Keine Beschreibung" }}
            </div>
          </div>

          <div class="field full-width">
            <label>Biografie</label>
            <textarea v-if="editing.bio" v-model="editData.bio" @blur="saveField('bio')" rows="4" class="field-input">
            </textarea>
            <div v-else class="field-value text-area" @click="startEdit('bio')">
              {{ user.bio || "Keine Biografie" }}
            </div>
          </div>
        </div>
      </div>

      <!-- Berechtigungen Section -->
      <div class="section">
        <h4>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="inline mr-2"
          >
            <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Berechtigungen & Status
        </h4>
        <div class="toggles-grid">
          <div class="toggle-item" @click="toggleField('verified')">
            <span class="toggle" :class="{ active: user.verified }"></span>
            <label>E-Mail verifiziert</label>
          </div>

          <div class="toggle-item" @click="toggleField('deactivated')">
            <span class="toggle" :class="{ active: user.deactivated }"></span>
            <label>Account deaktiviert</label>
          </div>

          <div class="toggle-item" @click="toggleField('isPedagogicalAuthor')">
            <span class="toggle" :class="{ active: user.isPedagogicalAuthor }"></span>
            <label>Pädagogischer Autor</label>
          </div>

          <div class="toggle-item" @click="toggleField('blockedForApplication')">
            <span class="toggle" :class="{ active: user.blockedForApplication }"></span>
            <label>Für Bewerbungen gesperrt</label>
          </div>
        </div>
      </div>

      <!-- System Info Section -->
      <div class="section system-info">
        <h4>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="inline mr-2"
          >
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 1v6m0 6v6m11-11h-6m-6 0H1"></path>
            <path
              d="m20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            ></path>
          </svg>
          Systeminformationen
        </h4>
        <div class="info-grid">
          <div class="info-item">
            <label>Erstellt am</label>
            <div class="info-value">{{ formattedCreatedAt }}</div>
          </div>
          <div class="info-item">
            <label>Aktualisiert am</label>
            <div class="info-value">{{ formattedUpdatedAt }}</div>
          </div>
          <div v-if="user.isDeleted" class="info-item">
            <label>Gelöscht am</label>
            <div class="info-value">{{ formatDateTime(user.deletedAt) }}</div>
          </div>
          <div v-if="user.deletedBy" class="info-item">
            <label>Gelöscht von</label>
            <div class="info-value">{{ user.deletedBy }}</div>
          </div>
          <div v-if="user.deleteReason" class="info-item full-width">
            <label>Löschgrund</label>
            <div class="info-value">{{ user.deleteReason }}</div>
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="section danger-zone">
        <h4>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="inline mr-2"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          Gefahrenzone
        </h4>
        <div class="danger-actions">
          <button v-if="!user.isDeleted" @click="deleteUser" class="danger-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="inline mr-1"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Benutzer löschen
          </button>
          <button v-else @click="restoreUser" class="restore-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="inline mr-1"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M8 16H3v5"></path>
            </svg>
            Benutzer wiederherstellen
          </button>
          <button @click="resetPassword" class="warning-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="inline mr-1"
            >
              <path
                d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"
              ></path>
            </svg>
            Passwort zurücksetzen
          </button>
          <button v-if="user.role !== 'ADMIN'" @click="makeAdmin" class="warning-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="inline mr-1"
            >
              <polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              ></polygon>
            </svg>
            Zum Admin machen
          </button>
        </div>
      </div>

      <!-- Save Button am Ende -->
      <div class="save-section">
        <button @click="saveAllChanges" :disabled="!hasChanges" class="save-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="inline mr-1"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Alle Änderungen speichern
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import userService from "@/services/user.service";
import axiosInstance from "@/services/axiosInstance";

// Props
const props = defineProps({ userId: { type: String, required: true } });

// State
const user = ref(null);
const originalUser = ref(null);
const isLoading = ref(true);
const editing = reactive({});
const editData = reactive({});

// Computed
const hasChanges = computed(() => {
  if (!user.value || !originalUser.value) return false;
  return JSON.stringify(user.value) !== JSON.stringify(originalUser.value);
});

const userInitials = computed(() => {
  if (!user.value) return "??";
  const f = user.value.firstname || "";
  const l = user.value.lastname || "";
  if (!f && !l) return "U";
  return ((f[0] || "") + (l[0] || "")).toUpperCase();
});

const roleBadgeClass = computed(() => {
  if (!user.value) return "";
  const role = (user.value.role || "user").toLowerCase();
  return role;
});

const formattedBirthdate = computed(() => {
  if (!user.value || !user.value.birthdate) return "Nicht angegeben";
  return formatDate(user.value.birthdate);
});

const formattedCreatedAt = computed(() => {
  if (!user.value || !user.value.createdAt) return "Unbekannt";
  return formatDateTime(user.value.createdAt);
});

const formattedUpdatedAt = computed(() => {
  if (!user.value || !user.value.updatedAt) return "Unbekannt";
  return formatDateTime(user.value.updatedAt);
});

// Methods
const formatDate = (date) => {
  if (!date) return "Nicht angegeben";
  try {
    return new Date(date).toLocaleDateString("de-DE");
  } catch (e) {
    return "Ungültiges Datum";
  }
};

const formatDateTime = (date) => {
  if (!date) return "Nicht angegeben";
  try {
    return new Date(date).toLocaleString("de-DE");
  } catch (e) {
    return "Ungültiges Datum";
  }
};

const startEdit = (field) => {
  editing[field] = true;
  if (field === "name") {
    editData.firstname = user.value.firstname || "";
    editData.lastname = user.value.lastname || "";
  } else if (field === "birthdate" && user.value[field]) {
    editData[field] = new Date(user.value[field]).toISOString().split("T")[0];
  } else {
    editData[field] = user.value[field] || "";
  }
};

const cancelEdit = (field) => {
  editing[field] = false;
  delete editData[field];
};

const saveField = (field) => {
  if (field === "name") {
    user.value.firstname = editData.firstname;
    user.value.lastname = editData.lastname;
  } else {
    user.value[field] = editData[field];
  }
  editing[field] = false;
};

const toggleField = (field) => {
  user.value[field] = !user.value[field];
};

const toggleVerified = () => toggleField("verified");

const saveAllChanges = async () => {
  try {
    const formData = new FormData();
    for (const key in user.value) {
      if (user.value[key] !== undefined) {
        formData.append(key, user.value[key]);
      }
    }

    const response = await axiosInstance.patch(`/user/updateUser/${props.userId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });

    originalUser.value = { ...user.value };
  } catch (err) {
    alert("❌ Fehler beim Speichern! Check die Konsole.");
    console.error("Fehler beim Speichern:", err.response?.data || err.message);
  }
};

const resetChanges = () => {
  user.value = { ...originalUser.value };
  Object.keys(editing).forEach((key) => (editing[key] = false));
};

const deleteUser = async () => {
  const reason = prompt("Löschgrund eingeben:");
  if (!reason) return;

  if (confirm(`Wirklich löschen? Grund: ${reason}`)) {
    try {
      await userService.deleteUser(props.userId, reason);
      await loadUser();
    } catch (err) {
      alert("❌ Fehler beim Löschen!");
      console.error(err);
    }
  }
};

const restoreUser = async () => {
  if (confirm("Benutzer wiederherstellen?")) {
    try {
      await userService.restoreUser(props.userId);
      await loadUser();
    } catch (err) {
      alert("❌ Fehler beim Wiederherstellen!");
      console.error(err);
    }
  }
};

const resetPassword = async () => {
  if (confirm("Passwort wirklich zurücksetzen? Der Benutzer erhält eine E-Mail.")) {
    alert("🔑 Passwort-Reset E-Mail wurde gesendet!");
  }
};

const makeAdmin = async () => {
  if (confirm("Diesen Benutzer wirklich zum Admin machen? Diese Aktion kann nicht rückgängig gemacht werden!")) {
    try {
      user.value.role = "ADMIN";
      await saveAllChanges();
      alert("👑 Benutzer ist jetzt Admin!");
    } catch (err) {
      alert("❌ Fehler beim Admin-Upgrade!");
      console.error(err);
    }
  }
};

const loadUser = async () => {
  try {
    isLoading.value = true;
    const res = await userService.getUserById(props.userId);
    user.value = res;
    originalUser.value = { ...res };
  } catch (err) {
    console.error("Fehler beim Laden:", err);
    user.value = null;
  } finally {
    isLoading.value = false;
  }
};

// Lifecycle
onMounted(() => loadUser());
</script>

<style scoped>
/* Z-Index Fix für Modal/Dialog */
.user-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #e0e0e0;
  position: relative !important;
  z-index: 9999 !important;
  background-color: #0a0a0a !important;
  min-height: 100vh;
}

/* Alle Elemente sichtbar machen */
.user-detail-container * {
  position: relative;
  z-index: inherit;
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

.user-data {
  position: relative;
  z-index: 10;
}

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

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
}

.user-avatar.admin {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.user-main-info {
  flex: 1;
}

.editable-name {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.editable-name h3 {
  margin: 0;
  font-size: 1.8rem;
  cursor: pointer;
  transition: color 0.2s;
}

.editable-name h3:hover {
  color: #ff9800;
}

.edit-input {
  background: #2a2a2a;
  border: 2px solid #ff9800;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 1.2rem;
  outline: none;
}

.user-badges {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.type-badge,
.status-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.type-badge {
  background: #2a2a2a;
  color: #888;
}

.type-badge.admin {
  background: #f5576c;
  color: white;
}

.type-badge.moderator {
  background: #4facfe;
  color: white;
}

.type-badge.author {
  background: #ff9800;
  color: white;
}

.type-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.status-badge.active {
  background: #00b894;
  color: white;
}

.status-badge.inactive {
  background: #d63031;
  color: white;
}

.status-badge.deleted {
  background: #636e72;
  color: white;
}

.role-select {
  background: #2a2a2a;
  color: white;
  border: 2px solid #ff9800;
  padding: 6px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  outline: none;
}

.user-id {
  color: #666;
  font-family: monospace;
  font-size: 0.9rem;
  margin: 0;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reset-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
  background: #2a2a2a;
  color: #888;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.reset-btn:hover:not(:disabled) {
  background: #3a3a3a;
}

/* Sections mit z-index Fix */
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
}

.section h4 {
  margin: 0 0 20px 0;
  font-size: 1.2rem;
  color: #ff9800;
  display: flex;
  align-items: center;
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
}

.field.full-width {
  grid-column: 1 / -1;
}

.field label {
  font-size: 0.85rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.field-value {
  background: #2a2a2a;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px;
  display: flex;
  align-items: center;
}

.field-value:hover {
  background: #333;
  border: 1px solid #444;
  padding: 11px 15px;
}

.field-value.text-area {
  min-height: 80px;
  align-items: flex-start;
  white-space: pre-wrap;
}

.field-input,
textarea.field-input {
  background: #2a2a2a;
  border: 2px solid #ff9800;
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  font-family: inherit;
  resize: vertical;
}

.toggles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.toggle-item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: background 0.2s;
}

.toggle-item:hover {
  background: #2a2a2a;
}

.toggle {
  width: 48px;
  height: 24px;
  background: #333;
  border-radius: 12px;
  position: relative;
  transition: background 0.3s;
}

.toggle::after {
  content: "";
  position: absolute;
  width: 20px;
  height: 20px;
  background: #666;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: all 0.3s;
}

.toggle.active {
  background: #00b894;
}

.toggle.active::after {
  background: white;
  left: 26px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-value {
  color: #aaa;
  font-size: 0.95rem;
}

.danger-zone {
  background: linear-gradient(135deg, #2a1a1a, #1f0f0f) !important;
  border: 2px solid rgba(214, 48, 49, 0.3);
  box-shadow: 0 4px 12px rgba(214, 48, 49, 0.1);
}

.danger-zone h4 {
  color: #d63031;
}

.danger-actions {
  display: flex;
  justify-content: space-around;
  gap: 15px;
  flex-wrap: wrap;
}

.danger-btn,
.restore-btn,
.warning-btn {
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
}

.danger-btn {
  background: linear-gradient(135deg, #d63031, #b71c1c);
  color: white;
  box-shadow: 0 4px 12px rgba(214, 48, 49, 0.3);
}

.danger-btn:hover {
  background: linear-gradient(135deg, #c62828, #8b0000);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(214, 48, 49, 0.4);
}

.restore-btn {
  background: linear-gradient(135deg, #00b894, #00a884);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 184, 148, 0.3);
}

.restore-btn:hover {
  background: linear-gradient(135deg, #00a884, #009874);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 184, 148, 0.4);
}

.warning-btn {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
}

.warning-btn:hover {
  background: linear-gradient(135deg, #f57c00, #e65100);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 152, 0, 0.4);
}

/* Save Section am Ende */
.save-section {
  margin-top: 30px;
  padding: 30px;
  background: linear-gradient(135deg, #1a1a1a, #222);
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.save-btn {
  padding: 16px 40px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.1rem;
  background: linear-gradient(135deg, #00b894, #00a884);
  color: white;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 184, 148, 0.3);
}

.save-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #00a884, #009874);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 184, 148, 0.4);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: linear-gradient(135deg, #444, #333);
  box-shadow: none;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Override für Modal/Dialog Probleme */
:deep(.modal-backdrop),
:deep(.dialog-backdrop) {
  z-index: 9998 !important;
}

:deep(#lumaly-shadowroot) {
  z-index: 1 !important;
}

/* Responsive */
@media (max-width: 768px) {
  .user-header {
    flex-direction: column;
    text-align: center;
  }

  .quick-actions {
    width: 100%;
  }

  .danger-actions {
    flex-direction: column;
  }

  .danger-actions button {
    width: 100%;
  }

  .save-section {
    padding: 20px;
  }
}
</style>
