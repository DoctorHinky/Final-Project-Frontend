<!-- src/components/pages/DashboardPages/Notifications/ConfirmDialog.vue -->
<template>
  <div v-if="show" class="modal-backdrop" @click="$emit('cancel')">
    <div class="confirm-dialog" @click.stop>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <div class="dialog-actions">
        <button class="cancel-button" @click="$emit('cancel')">Abbrechen</button>
        <button class="confirm-button" @click="$emit('confirm')">{{ actionText }}</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ConfirmDialog',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    actionText: {
      type: String,
      required: true
    }
  },
  emits: ['confirm', 'cancel']
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

  .confirm-dialog {
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

  // Aktionsbuttons für Dialog
  .dialog-actions {
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

      &.confirm-button {
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
}
</style>