<!-- src/components/pages/DashboardPages/Notifications/SettingsModal.vue -->
<template>
  <div v-if="showModal" class="modal-backdrop" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <h3>Benachrichtigungseinstellungen</h3>
      <p>Passe an, welche Benachrichtigungen du erhalten möchtest.</p>

      <div class="settings-form">
        <div v-for="(setting, index) in settings" :key="index" class="setting-item">
          <div class="setting-info">
            <h4>{{ setting.name }}</h4>
            <p>{{ setting.description }}</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="setting.enabled">
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div class="modal-actions">
        <button class="cancel-button" @click="$emit('close')">Abbrechen</button>
        <button class="save-button" @click="saveSettings">Speichern</button>
      </div>

      <button class="close-modal" @click="$emit('close')">×</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

interface NotificationSetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export default defineComponent({
  name: 'SettingsModal',
  props: {
    showModal: {
      type: Boolean,
      required: true
    },
    settings: {
      type: Array as PropType<NotificationSetting[]>,
      required: true
    }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const saveSettings = () => {
      emit('save', props.settings);
    };

    return {
      saveSettings
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

// Modal und Bestätigungsdialog
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: map.get(vars.$spacing, m);

  .modal-content {
    width: 100%;
    max-width: 500px;
    padding: map.get(vars.$spacing, xl);
    border-radius: map.get(map.get(vars.$layout, border-radius), large);
    position: relative;
    @include animations.fade-in(0.3s);
    overflow-y: auto;
    max-height: 90vh;

    @media (max-width: 576px) {
      padding: map.get(vars.$spacing, l);
      max-width: 100%;
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
    }

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        @include mixins.shadow('large', $theme);
        transition: all 0.4s ease-out;
      }
    }

    h3 {
      font-size: map.get(map.get(vars.$fonts, sizes), xl);
      margin-bottom: map.get(vars.$spacing, m);

      @media (max-width: 576px) {
        font-size: map.get(map.get(vars.$fonts, sizes), large);
      }

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
          transition: all 0.4s ease-out;
        }
      }
    }

    p {
      margin-bottom: map.get(vars.$spacing, l);

      @media (max-width: 576px) {
        font-size: map.get(map.get(vars.$fonts, sizes), small);
      }

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
          transition: all 0.4s ease-out;
        }
      }
    }
  }

  // Einstellungsformular
  .settings-form {
    margin-bottom: map.get(vars.$spacing, xl);

    @media (max-width: 576px) {
      margin-bottom: map.get(vars.$spacing, l);
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: map.get(vars.$spacing, m) 0;

      @media (max-width: 576px) {
        flex-direction: column;
        align-items: flex-start;
        gap: map.get(vars.$spacing, s);
      }

      @each $theme in ('light', 'dark') {
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

        @media (max-width: 576px) {
          padding-right: 0;
        }

        h4 {
          margin: 0 0 map.get(vars.$spacing, xxs) 0;
          font-size: map.get(map.get(vars.$fonts, sizes), medium);

          @media (max-width: 576px) {
            font-size: map.get(map.get(vars.$fonts, sizes), small);
          }

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
              transition: all 0.4s ease-out;
            }
          }
        }

        p {
          margin: 0;
          font-size: map.get(map.get(vars.$fonts, sizes), small);

          @media (max-width: 576px) {
            font-size: 11px;
          }

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
              transition: all 0.4s ease-out;
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

        @media (max-width: 576px) {
          align-self: flex-end;
        }

        input {
          opacity: 0;
          width: 0;
          height: 0;

          &:checked+.toggle-slider {
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background-color: mixins.theme-color($theme, accent-green);
                transition: all 0.4s ease-out;
              }
            }
          }

          &:checked+.toggle-slider:before {
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
          transition: .4s;

          @each $theme in ('light', 'dark') {
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
            transition: .4s;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background-color: white;
              }
            }
          }
        }
      }
    }
  }

  // Aktionsbuttons für Modal und Dialog
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: map.get(vars.$spacing, m);

    @media (max-width: 576px) {
      flex-direction: column;
    }

    button {
      padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      cursor: pointer;
      border: none;

      @media (max-width: 576px) {
        padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);
        font-size: map.get(map.get(vars.$fonts, sizes), small);
      }

      &.cancel-button {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            color: mixins.theme-color($theme, text-primary);
            border: 1px solid mixins.theme-color($theme, border-light);
            transition: all 0.4s ease-out;
          }
        }
      }

      &.save-button {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: mixins.theme-gradient($theme, primary);
            color: white;
            transition: all 0.4s ease-out;
          }
        }
      }
    }
  }

  .close-modal {
    position: absolute;
    top: 15px;
    right: 15px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    cursor: pointer;
    border: none;
    background: none;

    @media (max-width: 576px) {
      top: 10px;
      right: 10px;
      width: 24px;
      height: 24px;
      font-size: 1.2rem;
    }

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
        transition: all 0.4s ease-out;

        &:hover {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }
  }
}
</style>