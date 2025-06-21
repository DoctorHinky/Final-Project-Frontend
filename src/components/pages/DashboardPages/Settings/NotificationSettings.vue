<!-- src/components/pages/DashboardPages/Settings/NotificationSettings.vue -->
<template>
  <div class="settings-section notification-settings">
    <h3>Benachrichtigungseinstellungen</h3>
    <p class="section-description">Lege fest, welche Benachrichtigungen du erhalten möchtest</p>

    <!-- Erfolgsmeldung -->
    <div v-if="saveSuccess" class="alert alert-success">
      <span class="alert-icon">✓</span>
      <span>Deine Benachrichtigungseinstellungen wurden erfolgreich gespeichert!</span>
    </div>

    <!-- Fehlermeldung -->
    <div v-if="saveError" class="alert alert-error">
      <span class="alert-icon">⚠️</span>
      <span>{{ errorMessage }}</span>
    </div>

    <div class="settings-card">
      <form @submit.prevent="saveNotificationSettings" class="settings-form">
        <div class="settings-form-grid">
          <div v-for="(setting, index) in notificationSettings" :key="index" class="setting-item">
            <div class="setting-info">
              <h4>{{ setting.name }}</h4>
              <p>{{ setting.description }}</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="setting.enabled" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="save-button" :disabled="isSaving">
            <span v-if="isSaving" class="loading-spinner"></span>
            <span v-else>Speichern</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";

export interface NotificationSetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export default defineComponent({
  name: "NotificationSettings",
  props: {
    showSuccess: {
      type: Boolean,
      default: false,
    },
    showError: {
      type: Boolean,
      default: false,
    },
    errorMsg: {
      type: String,
      default: "",
    },
  },
  emits: ["save-notifications", "update:showSuccess", "update:showError"],
  setup(props, { emit }) {
    // Status für Formularprozesse
    const isSaving = ref(false);
    const saveSuccess = ref(props.showSuccess);
    const saveError = ref(props.showError);
    const errorMessage = ref(props.errorMsg);

    watch(
      () => props.showSuccess,
      (newVal) => {
        saveSuccess.value = newVal;
      }
    );

    watch(
      () => props.showError,
      (newVal) => {
        saveError.value = newVal;
      }
    );

    watch(
      () => props.errorMsg,
      (newVal) => {
        errorMessage.value = newVal;
      }
    );

    // Benachrichtigungseinstellungen
    const notificationSettings = ref<NotificationSetting[]>([
      {
        id: "email_notifications",
        name: "E-Mail-Benachrichtigungen",
        description: "Erhalte wichtige Benachrichtigungen per E-Mail.",
        enabled: true,
      },
      {
        id: "article_recommendations",
        name: "Artikelempfehlungen",
        description: "Benachrichtigungen für personalisierte Artikelempfehlungen.",
        enabled: true,
      },
      {
        id: "comment_notifications",
        name: "Kommentar-Benachrichtigungen",
        description: "Benachrichtigungen für Kommentare auf deine Artikel oder Beiträge.",
        enabled: true,
      },
      {
        id: "friend_requests",
        name: "Freundschaftsanfragen",
        description: "Benachrichtigungen für neue Freundschaftsanfragen.",
        enabled: true,
      },
      {
        id: "system_announcements",
        name: "Systemankündigungen",
        description: "Wichtige Ankündigungen zu Neuerungen und Updates.",
        enabled: true,
      },
    ]);

    // Benachrichtigungseinstellungen speichern
    const saveNotificationSettings = async (): Promise<void> => {
      isSaving.value = true;
      emit("save-notifications", notificationSettings.value);
      setTimeout(() => {
        isSaving.value = false;
      }, 1000);
    };

    return {
      notificationSettings,
      isSaving,
      saveSuccess,
      saveError,
      errorMessage,
      saveNotificationSettings,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;

.settings-section {
  margin-bottom: map.get(vars.$spacing, xxl);

  h3 {
    font-size: map.get(map.get(vars.$fonts, sizes), xl);
    font-weight: map.get(map.get(vars.$fonts, weights), bold);
    margin-bottom: map.get(vars.$spacing, xs);

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
      }
    }
  }

  .section-description {
    margin-bottom: map.get(vars.$spacing, l);

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
        transition: all 0.4s ease-out;
      }
    }
  }
}

// Alerts
.alert {
  margin-bottom: map.get(vars.$spacing, l);
  padding: map.get(vars.$spacing, m);
  border-radius: map.get(map.get(vars.$layout, border-radius), medium);
  display: flex;
  align-items: center;

  .alert-icon {
    margin-right: map.get(vars.$spacing, m);
    font-size: 1.2rem;
  }

  &.alert-success {
    background-color: rgba(46, 204, 113, 0.1);
    border-left: 4px solid #2ecc71;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
        transition: all 0.4s ease-out;
      }
    }
  }

  &.alert-error {
    background-color: rgba(231, 76, 60, 0.1);
    border-left: 4px solid #e74c3c;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
        transition: all 0.4s ease-out;
      }
    }
  }
}

// Karten für Einstellungsbereiche
.settings-card {
  margin-bottom: map.get(vars.$spacing, xl);
  padding: map.get(vars.$spacing, xl);
  border-radius: map.get(map.get(vars.$layout, border-radius), large);

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, card-bg);
      border: 1px solid mixins.theme-color($theme, border-light);
      transition: all 0.4s ease-out;
    }
  }

  h4 {
    font-size: map.get(map.get(vars.$fonts, sizes), large);
    margin-bottom: map.get(vars.$spacing, m);

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
        transition: all 0.4s ease-out;
      }
    }
  }
}

// Einstellungsraster
.settings-form-grid {
  display: flex;
  flex-direction: column;
  gap: map.get(vars.$spacing, l);
  margin-bottom: map.get(vars.$spacing, xl);

  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: map.get(vars.$spacing, m);

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        border-bottom: 1px solid mixins.theme-color($theme, border-light);
        transition: all 0.4s ease-out;

        &:last-child {
          border-bottom: none;
        }
      }
    }

    .setting-info {
      flex: 1;
      padding-right: map.get(vars.$spacing, l);

      h4 {
        margin-bottom: map.get(vars.$spacing, xxs);
        font-size: map.get(map.get(vars.$fonts, sizes), medium);
      }

      p {
        margin: 0;
        font-size: map.get(map.get(vars.$fonts, sizes), small);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }
    }

    // Toggle-Switch
    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 26px;

      input {
        opacity: 0;
        width: 0;
        height: 0;

        &:checked + .toggle-slider {
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, accent-green);
              transition: all 0.4s ease-out;
            }
          }
        }

        &:checked + .toggle-slider:before {
          transform: translateX(24px);
        }
      }

      .toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 34px;
        transition: 0.4s;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, border-medium);
            transition: all 0.4s ease-out;
          }
        }

        &:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 4px;
          bottom: 4px;
          border-radius: 50%;
          transition: 0.4s;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background-color: white;
              transition: all 0.4s ease-out;
            }
          }
        }
      }
    }
  }
}

// Formularaktionen
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: map.get(vars.$spacing, m);
  margin-top: map.get(vars.$spacing, xl);

  .save-button {
    padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);
    font-weight: map.get(map.get(vars.$fonts, weights), medium);
    cursor: pointer;
    border: none;
    transition: all 0.3s ease;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background: mixins.theme-gradient($theme, primary);
        color: white;
        transition: all 0.4s ease-out;

        &:hover:not(:disabled) {
          transform: translateY(-3px);
          @include mixins.shadow("medium", $theme);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }

    .loading-spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      margin-right: map.get(vars.$spacing, xs);
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  }
}
</style>
