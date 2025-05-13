<!-- src/components/pages/DashboardPages/Settings/AppearanceSettings.vue -->
<template>
  <div class="settings-section appearance-settings">
    <h3>Design & Darstellung</h3>
    <p class="section-description">Passe das Erscheinungsbild an deine Vorlieben an</p>

    <!-- Erfolgsmeldung -->
    <div v-if="saveSuccess" class="alert alert-success">
      <span class="alert-icon">✓</span>
      <span>Deine Design-Einstellungen wurden erfolgreich gespeichert!</span>
    </div>

    <!-- Fehlermeldung -->
    <div v-if="saveError" class="alert alert-error">
      <span class="alert-icon">⚠️</span>
      <span>{{ errorMessage }}</span>
    </div>

    <div class="settings-card">
      <h4>Farbschema</h4>
      <div class="theme-selection">
        <label class="theme-option">
          <input type="radio" name="theme" value="light" v-model="appearanceSettings.theme" />
          <div class="theme-preview light-theme">
            <div class="theme-icon">☀️</div>
            <div class="theme-label">Hell</div>
          </div>
        </label>

        <label class="theme-option">
          <input type="radio" name="theme" value="dark" v-model="appearanceSettings.theme" />
          <div class="theme-preview dark-theme">
            <div class="theme-icon">🌙</div>
            <div class="theme-label">Dunkel</div>
          </div>
        </label>
      </div>

      <h4>Schriftgröße</h4>
      <div class="font-size-selection">
        <div class="font-size-slider">
          <input type="range" min="1" max="5" step="1" v-model="appearanceSettings.fontSize" />
          <div class="font-size-labels">
            <span>A</span>
            <span>A</span>
            <span>A</span>
            <span>A</span>
            <span>A</span>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="save-button" @click="saveAppearanceSettings" :disabled="isSaving">
          <span v-if="isSaving" class="loading-spinner"></span>
          <span v-else>Speichern</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, watch } from 'vue';

interface AppearanceSettings {
  theme: string;
  fontSize: number;
}

export default defineComponent({
  name: 'AppearanceSettings',
  props: {
    showSuccess: {
      type: Boolean,
      default: false
    },
    showError: {
      type: Boolean,
      default: false
    },
    errorMsg: {
      type: String,
      default: ''
    }
  },
  emits: ['save-appearance', 'update:showSuccess', 'update:showError'],
  setup(props, { emit }) {
    // Status für Formularprozesse
    const isSaving = ref(false);
    const saveSuccess = ref(props.showSuccess);
    const saveError = ref(props.showError);
    const errorMessage = ref(props.errorMsg);
    
    watch(() => props.showSuccess, (newVal) => {
      saveSuccess.value = newVal;
    });
    
    watch(() => props.showError, (newVal) => {
      saveError.value = newVal;
    });
    
    watch(() => props.errorMsg, (newVal) => {
      errorMessage.value = newVal;
    });

    // Erscheinungsbild-Einstellungen
    const appearanceSettings = ref<AppearanceSettings>({
      theme: localStorage.getItem('theme') || 'light',
      fontSize: 3 // Mittelgroß
    });

    // Design-Einstellungen speichern
    const saveAppearanceSettings = async (): Promise<void> => {
      isSaving.value = true;
      emit('save-appearance', appearanceSettings.value);
      setTimeout(() => {
        isSaving.value = false;
      }, 1000);
    };

    return {
      appearanceSettings,
      isSaving,
      saveSuccess,
      saveError,
      errorMessage,
      saveAppearanceSettings
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;

.settings-section {
  margin-bottom: map.get(vars.$spacing, xxl);

  h3 {
    font-size: map.get(map.get(vars.$fonts, sizes), xl);
    font-weight: map.get(map.get(vars.$fonts, weights), bold);
    margin-bottom: map.get(vars.$spacing, xs);

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
      }
    }
  }

  .section-description {
    margin-bottom: map.get(vars.$spacing, l);

    @each $theme in ('light', 'dark') {
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

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
        transition: all 0.4s ease-out;
      }
    }
  }

  &.alert-error {
    background-color: rgba(231, 76, 60, 0.1);
    border-left: 4px solid #e74c3c;

    @each $theme in ('light', 'dark') {
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

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, card-bg);
      border: 1px solid mixins.theme-color($theme, border-light);
      transition: all 0.4s ease-out;
    }
  }

  h4 {
    font-size: map.get(map.get(vars.$fonts, sizes), large);
    margin-bottom: map.get(vars.$spacing, m);

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
        transition: all 0.4s ease-out;
      }
    }
  }
}

// Theme-Auswahl
.theme-selection {
  display: flex;
  gap: map.get(vars.$spacing, l);
  margin-bottom: map.get(vars.$spacing, xl);

  @media (max-width: 576px) {
    flex-direction: column;
  }

  .theme-option {
    flex: 1;
    cursor: pointer;

    input[type="radio"] {
      display: none;

      &:checked+.theme-preview {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            border-color: mixins.theme-color($theme, accent-green);
            box-shadow: 0 0 0 3px rgba(mixins.theme-color($theme, accent-green), 0.3);
            transition: all 0.4s ease-out;
          }
        }
      }
    }

    .theme-preview {
      height: 120px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      transition: all 0.3s;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          border: 2px solid mixins.theme-color($theme, border-light);
          transition: all 0.4s ease-out;
        }
      }

      &.light-theme {
        background-color: #f8fff9;
      }

      &.dark-theme {
        background-color: #0F2419;
      }

      .theme-icon {
        font-size: 2rem;
        margin-bottom: map.get(vars.$spacing, s);
      }

      .theme-label {
        display: flex;
        justify-content: center;
        width: 150px;
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        background-color: rgba(0, 0, 0, 0.267);
        border-radius: 20px;
        padding: 0.5rem;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
            transition: all 0.4s ease-out;
          }
        }
      }
    }
  }
}

// Schriftgröße-Auswahl
.font-size-selection {
  margin-bottom: map.get(vars.$spacing, xl);

  .font-size-slider {
    margin-bottom: map.get(vars.$spacing, m);
    position: relative;

    input[type="range"] {
      width: 100%;
      height: 4px;
      appearance: none;
      -webkit-appearance: none;
      border-radius: 2px;
      margin-bottom: map.get(vars.$spacing, m);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, border-light);
          transition: all 0.4s ease-out;

          &::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: mixins.theme-color($theme, accent-teal);
            cursor: pointer;
          }

          &::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: mixins.theme-color($theme, accent-teal);
            cursor: pointer;
            border: none;
          }
        }
      }
    }

    .font-size-labels {
      display: flex;
      justify-content: space-between;

      span {
        &:nth-child(1) {
          font-size: 0.8rem;
        }

        &:nth-child(2) {
          font-size: 0.9rem;
        }

        &:nth-child(3) {
          font-size: 1rem;
        }

        &:nth-child(4) {
          font-size: 1.1rem;
        }

        &:nth-child(5) {
          font-size: 1.2rem;
        }

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-tertiary);
            transition: all 0.4s ease-out;
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

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background: mixins.theme-gradient($theme, primary);
        color: white;
        transition: all 0.4s ease-out;

        &:hover:not(:disabled) {
          transform: translateY(-3px);
          @include mixins.shadow('medium', $theme);
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