<!-- src/components/pages/DashboardPages/Favorites/ConfirmDialog.vue -->
<template>
  <div v-if="showDialog" class="confirm-dialog-backdrop" @click="cancelRemove">
    <div class="confirm-dialog" @click.stop>
      <h3>Favorit entfernen</h3>
      <p>Möchtest du "{{ favoriteTitle }}" wirklich aus deinen Favoriten entfernen?</p>
      <div class="dialog-actions">
        <button class="cancel-button" @click="cancelRemove">Abbrechen</button>
        <button class="confirm-button" @click="confirmRemove">Entfernen</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ConfirmDialog',
  props: {
    showDialog: {
      type: Boolean,
      required: true
    },
    favoriteTitle: {
      type: String,
      default: ''
    }
  },
  emits: ['confirm-remove', 'cancel-remove'],
  setup(_, { emit }) {
    const confirmRemove = () => {
      emit('confirm-remove');
    };

    const cancelRemove = () => {
      emit('cancel-remove');
    };

    return {
      confirmRemove,
      cancelRemove
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use 'sass:color';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

// Bestätigungsdialog
.confirm-dialog-backdrop {
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
  border-radius: 20px;

  .confirm-dialog {
    width: 100%;
    max-width: 400px;
    padding: map.get(vars.$spacing, xl);
    border-radius: map.get(map.get(vars.$layout, border-radius), large);
    @include animations.fade-in(0.3s);

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        @include mixins.shadow('large', $theme);
        transition: all 0.4s ease-out;
      }
    }

    h3 {
      font-size: map.get(map.get(vars.$fonts, sizes), large);
      margin-bottom: map.get(vars.$spacing, m);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    p {
      margin-bottom: map.get(vars.$spacing, l);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: map.get(vars.$spacing, m);

      button {
        padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        cursor: pointer;
        border: none;

        &.cancel-button {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
              color: mixins.theme-color($theme, text-primary);
              border: 1px solid mixins.theme-color($theme, border-light);
            }
          }
        }

        &.confirm-button {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: #ff6b6b;
              color: white;

              &:hover {
                background-color: color.adjust(#ff6b6b, $lightness: -10%);
              }
            }
          }
        }
      }
    }
  }
}
</style>