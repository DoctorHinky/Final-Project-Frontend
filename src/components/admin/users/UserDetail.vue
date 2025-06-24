<!-- src/components/admin/users/UserDetail.vue -->
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
              <option value="CHILD">Kind</option>
              <option value="ADULT">Erwachsener</option>
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
                class="icon icon-sm"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <svg
                v-else
                class="icon icon-sm"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              {{ user.verified ? "Verifiziert" : "Nicht verifiziert" }}
            </span>

            <span v-if="user.isDeleted" class="status-badge deleted">
              <svg
                class="icon icon-sm"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
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
              class="icon icon-sm"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Zurücksetzen
          </button>
        </div>
      </div>

      <!-- Kontakt Section -->
      <div class="section glass-section">
        <h4>
          <svg
            class="icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
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
      <div class="section glass-section">
        <h4>
          <svg
            class="icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
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
      <div class="section glass-section">
        <h4>
          <svg
            class="icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
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
      <div class="section glass-section system-info">
        <h4>
          <svg
            class="icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
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
            class="icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          Gefahrenzone
        </h4>
        <div class="danger-actions">
          <button v-if="!user.isDeleted" @click="deleteUser" class="danger-btn">
            <svg
              class="icon icon-sm"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Benutzer löschen
          </button>
          <button v-else @click="restoreUser" class="restore-btn">
            <svg
              class="icon icon-sm"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Benutzer wiederherstellen
          </button>
          <button @click="resetPassword" class="warning-btn">
            <svg
              class="icon icon-sm"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
            Passwort zurücksetzen
          </button>
          <button v-if="user.role !== 'ADMIN'" @click="makeAdmin" class="warning-btn">
            <svg
              class="icon icon-sm"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
            Zum Admin machen
          </button>
        </div>
      </div>

      <!-- Save Button am Ende -->
      <div class="save-section">
        <button @click="saveAllChanges" :disabled="!hasChanges" class="save-btn">
          <svg
            class="icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
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
      console.error(err);
    }
  }
};

const resetPassword = async () => {
  if (confirm("Passwort wirklich zurücksetzen? Der Benutzer erhält eine E-Mail.")) {
    console.log("Passwort-Reset E-Mail wurde gesendet!");
  }
};

const makeAdmin = async () => {
  if (confirm("Diesen Benutzer wirklich zum Admin machen? Diese Aktion kann nicht rückgängig gemacht werden!")) {
    try {
      user.value.role = "ADMIN";
      await saveAllChanges();
      console.log("Benutzer ist jetzt Admin!");
    } catch (err) {
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

<style scoped lang="scss">
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
}

/* Z-Index Fix für Modal/Dialog */
.user-detail-container {
  margin: 0 auto;
  padding: 20px;
  color: #e0e0e0;
  position: relative !important;
  z-index: 9999 !important;
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

.user-data {
  position: relative;
  z-index: 10;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 30px;
  border-radius: 16px;
  margin-bottom: 30px;
  background: rgba(30, 30, 40, 0.6);
  backdrop-filter: blur(16px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 20;
  border: 1px solid rgba(93, 173, 226, 0.15);
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
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
}

.user-avatar.admin {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 8px 24px rgba(245, 87, 108, 0.3);
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
  background: rgba(30, 30, 40, 0.8);
  border: 2px solid #ff9800;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 1.2rem;
  outline: none;
  backdrop-filter: blur(10px);
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
  backdrop-filter: blur(10px);
}

.type-badge {
  background: rgba(30, 30, 40, 0.6);
  color: #888;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.type-badge.admin {
  background: linear-gradient(135deg, rgba(245, 87, 108, 0.2), rgba(245, 87, 108, 0.1));
  color: #f5576c;
  border-color: rgba(245, 87, 108, 0.3);
}

.type-badge.moderator {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.2), rgba(79, 172, 254, 0.1));
  color: #4facfe;
  border-color: rgba(79, 172, 254, 0.3);
}

.type-badge.author {
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.2), rgba(255, 152, 0, 0.1));
  color: #ff9800;
  border-color: rgba(255, 152, 0, 0.3);
}

.type-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.status-badge.active {
  background: linear-gradient(135deg, rgba(0, 184, 148, 0.2), rgba(0, 184, 148, 0.1));
  color: #00b894;
  border: 1px solid rgba(0, 184, 148, 0.3);
}

.status-badge.inactive {
  background: linear-gradient(135deg, rgba(214, 48, 49, 0.2), rgba(214, 48, 49, 0.1));
  color: #d63031;
  border: 1px solid rgba(214, 48, 49, 0.3);
}

.status-badge.deleted {
  background: linear-gradient(135deg, rgba(99, 110, 114, 0.2), rgba(99, 110, 114, 0.1));
  color: #636e72;
  border: 1px solid rgba(99, 110, 114, 0.3);
}

.role-select {
  background: rgba(30, 30, 40, 0.8);
  color: white;
  border: 2px solid #ff9800;
  padding: 6px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  outline: none;
  backdrop-filter: blur(10px);
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
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
  background: rgba(30, 30, 40, 0.6);
  color: #888;
  backdrop-filter: blur(10px);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.reset-btn:hover:not(:disabled) {
  background: rgba(40, 40, 50, 0.8);
  border-color: rgba(255, 255, 255, 0.2);
}

/* Sections mit z-index Fix und Glass-Effekt */
.section {
  padding: 25px;
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 10;
  opacity: 1 !important;
  visibility: visible !important;
  background: rgba(30, 30, 40, 0.4);
  border: 1px solid rgba(93, 173, 226, 0.15);
}

.section.glass-section {
  backdrop-filter: blur(16px);
  background: rgba(30, 30, 40, 0.6);
}

.section h4 {
  margin: 0 0 20px 0;
  font-size: 1.2rem;
  color: #ff9800;
  display: flex;
  align-items: center;
  gap: 8px;
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
  background: rgba(30, 30, 40, 0.8);
  padding: 12px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px;
  display: flex;
  align-items: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.field-value:hover {
  background: rgba(40, 40, 50, 0.9);
  border-color: rgba(93, 173, 226, 0.2);
}

.field-value.text-area {
  min-height: 80px;
  align-items: flex-start;
  white-space: pre-wrap;
}

.field-input,
textarea.field-input {
  background: rgba(30, 30, 40, 0.8);
  border: 2px solid #ff9800;
  color: white;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 1rem;
  outline: none;
  font-family: inherit;
  resize: vertical;
  backdrop-filter: blur(10px);
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
  border-radius: 10px;
  transition: background 0.2s;
}

.toggle-item:hover {
  background: rgba(30, 30, 40, 0.6);
}

.toggle {
  width: 48px;
  height: 24px;
  background: rgba(51, 51, 51, 0.8);
  border-radius: 12px;
  position: relative;
  transition: background 0.3s;
  backdrop-filter: blur(10px);
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
  background: linear-gradient(135deg, rgba(0, 184, 148, 0.4), rgba(0, 184, 148, 0.2));
}

.toggle.active::after {
  background: #00b894;
  left: 26px;
  box-shadow: 0 2px 8px rgba(0, 184, 148, 0.4);
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
  background: linear-gradient(135deg, rgba(42, 26, 26, 0.6), rgba(31, 15, 15, 0.6)) !important;
  border: 1px solid rgba(214, 48, 49, 0.3);
  box-shadow: 0 4px 16px rgba(214, 48, 49, 0.1);
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
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(10px);
}

.danger-btn {
  background: linear-gradient(135deg, rgba(214, 48, 49, 0.3), rgba(183, 28, 28, 0.3));
  color: white;
  box-shadow: 0 4px 12px rgba(214, 48, 49, 0.3);
  border: 1px solid rgba(214, 48, 49, 0.4);
}

.danger-btn:hover {
  background: linear-gradient(135deg, rgba(198, 40, 40, 0.4), rgba(139, 0, 0, 0.4));
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(214, 48, 49, 0.4);
}

.restore-btn {
  background: linear-gradient(135deg, rgba(0, 184, 148, 0.3), rgba(0, 168, 132, 0.3));
  color: white;
  box-shadow: 0 4px 12px rgba(0, 184, 148, 0.3);
  border: 1px solid rgba(0, 184, 148, 0.4);
}

.restore-btn:hover {
  background: linear-gradient(135deg, rgba(0, 168, 132, 0.4), rgba(0, 152, 116, 0.4));
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 184, 148, 0.4);
}

.warning-btn {
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.3), rgba(245, 124, 0, 0.3));
  color: white;
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
  border: 1px solid rgba(255, 152, 0, 0.4);
}

.warning-btn:hover {
  background: linear-gradient(135deg, rgba(245, 124, 0, 0.4), rgba(229, 81, 0, 0.4));
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 152, 0, 0.4);
}

/* Save Section am Ende */
.save-section {
  margin-top: 30px;
  padding: 30px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  background: rgba(30, 30, 40, 0.6);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(93, 173, 226, 0.15);
}

.save-btn {
  padding: 16px 40px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.1rem;
  background: linear-gradient(135deg, rgba(0, 184, 148, 0.3), rgba(0, 168, 132, 0.3));
  color: white;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 184, 148, 0.3);
  border: 1px solid rgba(0, 184, 148, 0.4);
  backdrop-filter: blur(10px);
}

.save-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(0, 168, 132, 0.4), rgba(0, 152, 116, 0.4));
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 184, 148, 0.4);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: linear-gradient(135deg, rgba(68, 68, 68, 0.3), rgba(51, 51, 51, 0.3));
  box-shadow: none;
  border-color: rgba(255, 255, 255, 0.1);
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