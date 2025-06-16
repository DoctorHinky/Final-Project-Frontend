<!-- src/components/pages/DashboardPages/Friends/InviteModal.vue -->
<template>
  <div v-if="isVisible" class="modal-backdrop" @click="closeModal">
    <div class="modal-content" @click.stop>
      <header class="modal-header">
        <h3 class="modal-title">
          <EnvelopeIcon class="modal-icon" />
          Freunde einladen
        </h3>
        <button class="close-button" @click="closeModal" aria-label="Modal schließen">
          <XMarkIcon class="close-icon" />
        </button>
      </header>

      <p class="modal-description">
        Lade Freunde ein, der Community beizutreten und gemeinsam zu wachsen.
      </p>

      <form class="invite-form" @submit.prevent="sendInvite">
        <div class="form-group">
          <label for="invite-email" class="form-label">
            <AtSymbolIcon class="label-icon" />
            E-Mail-Adresse
          </label>
          <input 
            id="invite-email"
            type="email" 
            class="form-input"
            placeholder="beispiel@email.com"
            v-model="inviteEmailValue"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label for="invite-message" class="form-label">
            <ChatBubbleLeftEllipsisIcon class="label-icon" />
            Persönliche Nachricht
            <span class="optional-text">(optional)</span>
          </label>
          <textarea 
            id="invite-message"
            class="form-textarea"
            placeholder="Schreibe eine persönliche Nachricht für deine Einladung..."
            v-model="inviteMessageValue"
            rows="4"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="cancel-button" @click="closeModal">
            Abbrechen
          </button>
          <button type="submit" class="submit-button" :disabled="!inviteEmailValue.trim()">
            <PaperAirplaneIcon class="button-icon" />
            Einladung senden
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { 
  EnvelopeIcon, 
  AtSymbolIcon, 
  ChatBubbleLeftEllipsisIcon, 
  PaperAirplaneIcon, 
  XMarkIcon 
} from '@heroicons/vue/24/outline';

export default defineComponent({
  name: 'InviteModal',
  components: {
    EnvelopeIcon,
    AtSymbolIcon,
    ChatBubbleLeftEllipsisIcon,
    PaperAirplaneIcon,
    XMarkIcon
  },
  props: {
    isVisible: {
      type: Boolean,
      required: true
    },
    inviteEmail: {
      type: String,
      required: true
    },
    inviteMessage: {
      type: String,
      required: true
    }
  },
  emits: ['update:isVisible', 'update:inviteEmail', 'update:inviteMessage', 'send-invite'],
  setup(props, { emit }) {
    const inviteEmailValue = ref(props.inviteEmail);
    const inviteMessageValue = ref(props.inviteMessage);

    // Sync props with local state
    watch(() => props.inviteEmail, (newValue) => {
      inviteEmailValue.value = newValue;
    });

    watch(() => props.inviteMessage, (newValue) => {
      inviteMessageValue.value = newValue;
    });

    const closeModal = () => {
      emit('update:isVisible', false);
    };

    const sendInvite = () => {
      if (!inviteEmailValue.value.trim()) {
        return;
      }
      
      emit('update:inviteEmail', inviteEmailValue.value);
      emit('update:inviteMessage', inviteMessageValue.value);
      emit('send-invite');
    };

    return {
      inviteEmailValue,
      inviteMessageValue,
      closeModal,
      sendInvite
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: blur(15px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: map.get(vars.$spacing, m);
}

.modal-content {
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  padding: map.get(vars.$spacing, xl);
  border-radius: map.get(map.get(vars.$layout, border-radius), large);
  position: relative;
  @include animations.fade-in(0.3s);

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, card-bg);
      border: 1px solid mixins.theme-color($theme, border-subtle);
      @include mixins.shadow('large', $theme);
      transition: all 0.4s ease-out;
    }
  }
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: map.get(vars.$spacing, m);
  gap: map.get(vars.$spacing, m);

  .modal-title {
    font-size: map.get(map.get(vars.$fonts, sizes), xl);
    font-weight: map.get(map.get(vars.$fonts, weights), semibold);
    margin: 0;
    display: flex;
    align-items: center;
    gap: map.get(vars.$spacing, s);
    line-height: 1.2;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
        transition: color 0.4s ease-out;
      }
    }

    .modal-icon {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, accent-teal);
          transition: color 0.4s ease-out;
        }
      }
    }
  }

  .close-button {
    width: 32px;
    height: 32px;
    border-radius: map.get(map.get(vars.$layout, border-radius), small);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: none;
    flex-shrink: 0;
    transition: all 0.2s ease;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: transparent;
        color: mixins.theme-color($theme, text-secondary);

        &:hover {
          background-color: mixins.theme-color($theme, secondary-bg);
          color: mixins.theme-color($theme, text-primary);
        }

        &:active {
          transform: scale(0.95);
        }
      }
    }

    .close-icon {
      width: 20px;
      height: 20px;
    }
  }
}

.modal-description {
  margin-bottom: map.get(vars.$spacing, xl);
  line-height: 1.5;

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      color: mixins.theme-color($theme, text-secondary);
      transition: color 0.4s ease-out;
    }
  }
}

.invite-form {
  display: flex;
  flex-direction: column;
  gap: map.get(vars.$spacing, l);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: map.get(vars.$spacing, s);

  .form-label {
    font-size: map.get(map.get(vars.$fonts, sizes), sm);
    font-weight: map.get(map.get(vars.$fonts, weights), medium);
    display: flex;
    align-items: center;
    gap: map.get(vars.$spacing, xs);

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
        transition: color 0.4s ease-out;
      }
    }

    .label-icon {
      width: 16px;
      height: 16px;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, accent-teal);
          transition: color 0.4s ease-out;
        }
      }
    }

    .optional-text {
      font-weight: map.get(map.get(vars.$fonts, weights), normal);
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  .form-input,
  .form-textarea {
    width: 100%;
    font-size: map.get(map.get(vars.$fonts, sizes), base);
    transition: all 0.2s ease;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        @include mixins.form-element($theme);
        
        &:focus {
          outline: none;
          border-color: mixins.theme-color($theme, accent-teal);
          box-shadow: 0 0 0 3px rgba(mixins.theme-color($theme, accent-teal), 0.1);
        }

        &::placeholder {
          color: mixins.theme-color($theme, text-muted);
        }
      }
    }
  }

  .form-textarea {
    min-height: 100px;
    resize: none; // Kein resize mehr
    font-family: inherit;
    line-height: 1.5;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: map.get(vars.$spacing, m);
  margin-top: map.get(vars.$spacing, m);

  .cancel-button,
  .submit-button {
    padding: map.get(vars.$spacing, m) map.get(vars.$spacing, l);
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);
    font-weight: map.get(map.get(vars.$fonts, weights), medium);
    font-size: map.get(map.get(vars.$fonts, sizes), sm);
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: map.get(vars.$spacing, xs);
    min-width: 120px;
    justify-content: center;

    &:active {
      transform: translateY(1px);
    }
  }

  .cancel-button {
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: transparent;
        color: mixins.theme-color($theme, text-secondary);
        border: 1px solid mixins.theme-color($theme, border-subtle);

        &:hover {
          background-color: mixins.theme-color($theme, secondary-bg);
          color: mixins.theme-color($theme, text-primary);
          border-color: mixins.theme-color($theme, border-primary);
        }
      }
    }
  }

  .submit-button {
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background: mixins.theme-gradient($theme, primary);
        color: white;
        border: 1px solid transparent;

        &:hover:not(:disabled) {
          transform: translateY(-2px);
          @include mixins.shadow('medium', $theme);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
      }
    }

    .button-icon {
      width: 16px;
      height: 16px;
    }
  }
}

// Responsive Design
@media (max-width: 640px) {
  .modal-content {
    padding: map.get(vars.$spacing, l);
    margin: map.get(vars.$spacing, s);
  }

  .form-actions {
    flex-direction: column;
    
    .cancel-button,
    .submit-button {
      width: 100%;
    }
  }
}
</style>