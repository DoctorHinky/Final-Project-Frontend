<!-- src/components/pages/DashboardPages/Favorites/ConfirmDialog.vue -->
<template>
  <div v-if="showDialog" class="confirm-dialog-backdrop" @click="cancelRemove">
    <div class="confirm-dialog" @click.stop>
      <div class="dialog-icon">
        <span class="icon-content">⚠️</span>
      </div>
      
      <h3 class="dialog-title">Favorit entfernen</h3>
      
      <p class="dialog-message">
        Möchtest du <strong>"{{ favoriteTitle }}"</strong> wirklich aus deinen Favoriten entfernen?
      </p>
      
      <div class="dialog-actions">
        <button class="dialog-button cancel" @click="cancelRemove">
          <span class="button-icon">✖️</span>
          Abbrechen
        </button>
        <button class="dialog-button confirm" @click="confirmRemove">
          <span class="button-icon">🗑️</span>
          Entfernen
        </button>
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

.confirm-dialog-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;

  .confirm-dialog {
    width: 100%;
    max-width: 450px;
    padding: map.get(vars.$spacing, xl);
    border-radius: map.get(map.get(vars.$layout, border-radius), large);
    position: relative;
    overflow: hidden;
    @include animations.fade-in(0.3s);
    animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    @media (max-width: 576px) {
      max-width: 90%;
      padding: map.get(vars.$spacing, l);
    }

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      }
    }

    // Animierter Hintergrund
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #ff6b6b 0%, #ffa502 50%, #ff6b6b 100%);
      background-size: 200% 100%;
      animation: gradientMove 3s ease infinite;
    }

    .dialog-icon {
      display: flex;
      justify-content: center;
      margin-bottom: map.get(vars.$spacing, l);

      .icon-content {
        font-size: 3rem;
        animation: pulse 2s ease-in-out infinite;
      }
    }

    .dialog-title {
      font-size: map.get(map.get(vars.$fonts, sizes), xl);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      text-align: center;
      margin-bottom: map.get(vars.$spacing, m);

      @media (max-width: 576px) {
        font-size: map.get(map.get(vars.$fonts, sizes), large);
      }

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    .dialog-message {
      text-align: center;
      line-height: 1.6;
      margin-bottom: map.get(vars.$spacing, xl);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }

      strong {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }
    }

    .dialog-actions {
      display: flex;
      gap: map.get(vars.$spacing, m);
      justify-content: center;

      @media (max-width: 400px) {
        flex-direction: column;
      }

      .dialog-button {
        display: flex;
        align-items: center;
        gap: map.get(vars.$spacing, s);
        padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        font-size: map.get(map.get(vars.$fonts, sizes), medium);
        cursor: pointer;
        border: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;

        @media (max-width: 576px) {
          padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
          font-size: map.get(map.get(vars.$fonts, sizes), small);
        }

        @media (max-width: 400px) {
          width: 100%;
          justify-content: center;
        }

        .button-icon {
          font-size: 1rem;
          transition: transform 0.3s ease;
        }

        &:hover .button-icon {
          transform: scale(1.2);
        }

        &.cancel {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
              color: mixins.theme-color($theme, text-primary);
              border: 2px solid mixins.theme-color($theme, border-light);

              &:hover {
                transform: translateY(-2px);
                background-color: mixins.theme-color($theme, hover-color);
                border-color: mixins.theme-color($theme, border-medium);
              }
            }
          }
        }

        &.confirm {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%);
              color: white;

              &::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
                transform: translate(-50%, -50%);
                transition: width 0.6s, height 0.6s;
              }

              &:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px -5px rgba(#ff6b6b, 0.4);

                &::before {
                  width: 300px;
                  height: 300px;
                }
              }
            }
          }
        }
      }
    }
  }
}

// Animationen
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes gradientMove {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
}
</style>