<!-- src/components/pages/DashboardPages/Settings/AppearanceSettings.vue -->
<template>
  <div class="settings-section appearance-settings">
    <h3>Design & Darstellung</h3>
    <p class="section-description">Passe das Erscheinungsbild an deine Vorlieben an</p>

    <!-- Erfolgsmeldung -->
    <div v-if="showSuccessMessage" class="alert alert-success">
      <span class="alert-icon">✓</span>
      <span>Deine Design-Einstellungen wurden erfolgreich gespeichert!</span>
    </div>

    <!-- Fehlermeldung -->
    <div v-if="showErrorMessage" class="alert alert-error">
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
            <div class="theme-label-dark">Dunkel</div>
          </div>
        </label>
      </div>

      <h4>Schriftgröße</h4>
      <div class="font-size-selection">
        <div class="font-size-slider">
          <input type="range" min="1" max="5" step="1" v-model="appearanceSettings.fontSize" @input="previewFontSize" />
          <div class="font-size-labels">
            <span>A</span>
            <span>A</span>
            <span>A</span>
            <span>A</span>
            <span>A</span>
          </div>
        </div>
        <p class="font-size-preview">
          {{ getFontSizeLabel(appearanceSettings.fontSize) }}
        </p>
      </div>

      <div class="form-actions">
        <button type="button" class="reset-button" @click="resetToDefaults" :disabled="isSaving">Zurücksetzen</button>
        <button type="button" class="save-button" @click="saveAppearanceSettings" :disabled="isSaving">
          <span v-if="isSaving" class="loading-spinner"></span>
          <span v-else>Speichern</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted, onUnmounted } from "vue";
import { themeService } from "@/services/theme.service";

export interface AppearanceSettings {
  theme: "light" | "dark";
  fontSize: number;
}

export default defineComponent({
  name: "AppearanceSettings",
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
  emits: ["save-appearance", "update:showSuccess", "update:showError"],
  setup(props, { emit }) {
    // Status für Formularprozesse
    const isSaving = ref(false);
    const showSuccessMessage = ref(props.showSuccess);
    const showErrorMessage = ref(props.showError);
    const errorMessage = ref(props.errorMsg);
    
    // Flag ob Einstellungen gespeichert wurden
    const hasUnsavedChanges = ref(false);
    const savedSettings = ref<AppearanceSettings | null>(null);

    // Ursprüngliche Einstellungen für Preview-Rückgängigmachung
    const originalSettings = ref<AppearanceSettings | null>(null);

    // Props watchen
    watch(
      () => props.showSuccess,
      (newVal) => {
        showSuccessMessage.value = newVal;
      }
    );

    watch(
      () => props.showError,
      (newVal) => {
        showErrorMessage.value = newVal;
      }
    );

    watch(
      () => props.errorMsg,
      (newVal) => {
        errorMessage.value = newVal;
      }
    );

    // Erscheinungsbild-Einstellungen vom Service laden
    const appearanceSettings = ref<AppearanceSettings>(themeService.getAppearanceSettings());

    // Theme-Änderungen in Echtzeit anwenden (Preview)
    watch(
      () => appearanceSettings.value.theme,
      (newTheme) => {
        themeService.setThemeByName(newTheme);
        hasUnsavedChanges.value = true;
      }
    );

    // Schriftgröße Preview
    const previewFontSize = () => {
      themeService.setFontSize(appearanceSettings.value.fontSize);
      hasUnsavedChanges.value = true;
    };

    // Schriftgrößen-Label
    const getFontSizeLabel = (size: number): string => {
      const labels = ["Sehr klein", "Klein", "Normal", "Groß", "Sehr groß"];
      return labels[size - 1] || "Normal";
    };

    // Design-Einstellungen speichern
    const saveAppearanceSettings = async (): Promise<void> => {
      isSaving.value = true;
      showSuccessMessage.value = false;
      showErrorMessage.value = false;

      try {
        // Settings im Service speichern
        themeService.setAppearanceSettings(appearanceSettings.value);
        
        // Als gespeichert markieren
        savedSettings.value = { ...appearanceSettings.value };
        hasUnsavedChanges.value = false;

        // Parent-Komponente informieren
        emit("save-appearance", appearanceSettings.value);

        // Erfolg anzeigen
        showSuccessMessage.value = true;
        emit("update:showSuccess", true);

        // Erfolg nach 3 Sekunden ausblenden - aber NICHT die gespeicherten Settings verwerfen!
        setTimeout(() => {
          showSuccessMessage.value = false;
          emit("update:showSuccess", false);
        }, 3000);
      } catch (error) {
        showErrorMessage.value = true;
        errorMessage.value = "Einstellungen konnten nicht gespeichert werden.";
        emit("update:showError", true);
      } finally {
        setTimeout(() => {
          isSaving.value = false;
        }, 500);
      }
    };

    // Auf Standardwerte zurücksetzen
    const resetToDefaults = () => {
      appearanceSettings.value = {
        theme: "light",
        fontSize: 3,
      };
      themeService.setAppearanceSettings(appearanceSettings.value);
      hasUnsavedChanges.value = true;
    };

    // Beim Verlassen der Seite: Original wiederherstellen wenn nicht gespeichert
    const restoreOriginalSettings = () => {
      // NUR wiederherstellen wenn es ungespeicherte Änderungen gibt
      if (originalSettings.value && hasUnsavedChanges.value) {
        themeService.setAppearanceSettings(originalSettings.value);
      }
    };

    onMounted(() => {
      // Aktuelle Einstellungen als Original speichern
      originalSettings.value = { ...themeService.getAppearanceSettings() };
      savedSettings.value = { ...originalSettings.value };
      hasUnsavedChanges.value = false;
    });

    onUnmounted(() => {
      // Wenn Änderungen nicht gespeichert wurden, Original wiederherstellen
      restoreOriginalSettings();
    });

    return {
      appearanceSettings,
      isSaving,
      showSuccessMessage,
      showErrorMessage,
      errorMessage,
      saveAppearanceSettings,
      resetToDefaults,
      previewFontSize,
      getFontSizeLabel,
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
    font-size: var(--font-xl);
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
    font-size: var(--font-base);

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
  font-size: var(--font-base);

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
    font-size: var(--font-large);
    margin-bottom: map.get(vars.$spacing, m);

    @each $theme in ("light", "dark") {
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

      &:checked + .theme-preview {
        @each $theme in ("light", "dark") {
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

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          border: 2px solid mixins.theme-color($theme, border-light);
          transition: all 0.4s ease-out;
        }
      }

      &.light-theme {
        background-color: mixins.theme-color("light", card-bg);
      }

      &.dark-theme {
        background-color: mixins.theme-color("dark", card-bg);
      }

      .theme-icon {
        font-size: 2rem;
        margin-bottom: map.get(vars.$spacing, s);
      }

      .theme-label,
      .theme-label-dark {
        font-size: var(--font-base);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        background-color: rgba(0, 0, 0, 0.29);
        padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, s);
        border-radius: map.get(map.get(vars.$layout, border-radius), small);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100px;
        height: 30px;
        border: 1px solid white;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: white;
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

      @each $theme in ("light", "dark") {
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
        font-weight: map.get(map.get(vars.$fonts, weights), medium);

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

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-tertiary);
            transition: all 0.4s ease-out;
          }
        }
      }
    }
  }

  .font-size-preview {
    text-align: center;
    font-size: var(--font-small);
    margin-top: map.get(vars.$spacing, s);

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
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

  .reset-button {
    padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);
    font-weight: map.get(map.get(vars.$fonts, weights), medium);
    font-size: var(--font-base);
    cursor: pointer;
    border: 2px solid;
    transition: all 0.3s ease;
    background: transparent;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
        border-color: mixins.theme-color($theme, border-medium);

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

  .save-button {
    padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);
    font-weight: map.get(map.get(vars.$fonts, weights), medium);
    font-size: var(--font-base);
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