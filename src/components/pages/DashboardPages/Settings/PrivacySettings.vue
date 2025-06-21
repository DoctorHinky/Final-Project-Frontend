<!-- src/components/pages/DashboardPages/Settings/PrivacySettings.vue -->
<template>
  <div class="settings-section privacy-settings">
    <h3>Datenschutz & Cookies</h3>
    <p class="section-description">Verwalte deine Datenschutzeinstellungen und Cookie-Präferenzen</p>

    <!-- Erfolgsmeldung -->
    <div v-if="saveSuccess" class="alert alert-success">
      <span class="alert-icon">✓</span>
      <span>Deine Datenschutzeinstellungen wurden erfolgreich gespeichert!</span>
    </div>

    <!-- Fehlermeldung -->
    <div v-if="saveError" class="alert alert-error">
      <span class="alert-icon">⚠️</span>
      <span>{{ errorMessage }}</span>
    </div>

    <div class="settings-card">
      <form @submit.prevent="savePrivacySettings" class="settings-form">
        <div class="settings-form-grid">
          <div v-for="(setting, index) in privacySettings" :key="index" class="setting-item">
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

        <div class="cookie-settings">
          <h4>Cookie-Einstellungen</h4>
          <p>Wähle aus, welche Arten von Cookies du akzeptieren möchtest.</p>

          <div class="cookie-option">
            <label class="checkbox-label">
              <input type="checkbox" v-model="privacySettings[0].cookieOptions!.necessary" disabled checked />
              <span>Notwendige Cookies</span>
            </label>
            <p>
              Diese Cookies sind für das Funktionieren der Website unerlässlich und können nicht deaktiviert werden.
            </p>
          </div>

          <div class="cookie-option">
            <label class="checkbox-label">
              <input type="checkbox" v-model="privacySettings[0].cookieOptions!.preferences" />
              <span>Präferenz-Cookies</span>
            </label>
            <p>
              Diese Cookies ermöglichen es der Website, deine Einstellungen zu speichern (z.B. Spracheinstellungen).
            </p>
          </div>

          <div class="cookie-option">
            <label class="checkbox-label">
              <input type="checkbox" v-model="privacySettings[0].cookieOptions!.statistics" />
              <span>Statistik-Cookies</span>
            </label>
            <p>Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren.</p>
          </div>

          <div class="cookie-option">
            <label class="checkbox-label">
              <input type="checkbox" v-model="privacySettings[0].cookieOptions!.marketing" />
              <span>Marketing-Cookies</span>
            </label>
            <p>Diese Cookies werden verwendet, um Besuchern relevante Werbung zu zeigen.</p>
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

export interface CookieOptions {
  necessary: boolean;
  preferences: boolean;
  statistics: boolean;
  marketing: boolean;
}

export interface PrivacySetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  cookieOptions?: CookieOptions;
}

export default defineComponent({
  name: "PrivacySettings",
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
  emits: ["save-privacy", "update:showSuccess", "update:showError"],
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

    // Datenschutzeinstellungen
    const privacySettings = ref<PrivacySetting[]>([
      {
        id: "data_collection",
        name: "Datenerfassung",
        description: "Erlaube uns, Nutzungsdaten zu sammeln, um die Plattform zu verbessern.",
        enabled: true,
        cookieOptions: {
          necessary: true,
          preferences: true,
          statistics: true,
          marketing: false,
        },
      },
      {
        id: "profile_visibility",
        name: "Profilsichtbarkeit",
        description: "Mache dein Profil für andere Benutzer sichtbar.",
        enabled: true,
      },
    ]);

    // Datenschutzeinstellungen speichern
    const savePrivacySettings = async (): Promise<void> => {
      isSaving.value = true;
      emit("save-privacy", privacySettings.value);
      setTimeout(() => {
        isSaving.value = false;
      }, 1000);
    };

    return {
      privacySettings,
      isSaving,
      saveSuccess,
      saveError,
      errorMessage,
      savePrivacySettings,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;
@use "sass:color";

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

  p {
    margin-bottom: map.get(vars.$spacing, l);

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
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

// Cookie-Einstellungen
.cookie-settings {
  margin-top: map.get(vars.$spacing, xl);
  margin-bottom: map.get(vars.$spacing, l);

  .cookie-option {
    margin-bottom: map.get(vars.$spacing, m);

    .checkbox-label {
      display: flex;
      align-items: center;
      margin-bottom: map.get(vars.$spacing, xxs);
      cursor: pointer;

      input[type="checkbox"] {
        margin-right: map.get(vars.$spacing, s);
        width: 18px;
        height: 18px;

        &:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      }

      span {
        font-weight: map.get(map.get(vars.$fonts, weights), medium);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
            transition: all 0.4s ease-out;
          }
        }
      }
    }

    p {
      margin-left: calc(18px + #{map.get(vars.$spacing, s)});
      margin-bottom: map.get(vars.$spacing, s);
      font-size: map.get(map.get(vars.$fonts, sizes), small);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-tertiary);
          transition: all 0.4s ease-out;
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
