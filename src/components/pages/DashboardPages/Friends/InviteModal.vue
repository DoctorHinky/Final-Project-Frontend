<!-- src/components/pages/DashboardPages/Friends/InviteModal.vue -->
<template>
  <div v-if="isVisible" class="modal-backdrop" @click="closeModal">
    <div class="modal-content" @click.stop>
      <h3>Freunde einladen</h3>
      <p>Lade Freunde ein, der Community beizutreten.</p>
      <div class="invite-form">
        <input type="email" placeholder="E-Mail-Adresse" v-model="inviteEmailValue" />
        <textarea placeholder="Persönliche Nachricht (optional)" v-model="inviteMessageValue"></textarea>
        <button class="send-invite-button" @click="sendInvite">Einladung senden</button>
      </div>
      <button class="close-modal" @click="closeModal">×</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  name: 'InviteModal',
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

// Modal-Hintergrund
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

  .modal-content {
    width: 90%;
    max-width: 500px;
    padding: map.get(vars.$spacing, xl);
    border-radius: map.get(map.get(vars.$layout, border-radius), large);
    position: relative;
    @include animations.fade-in(0.3s);

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

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
          transition: all 0.4s ease-out;
        }
      }
    }

    p {
      margin-bottom: map.get(vars.$spacing, l);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
          transition: all 0.4s ease-out;
        }
      }
    }

    .invite-form {
      display: flex;
      flex-direction: column;
      gap: map.get(vars.$spacing, m);

      input,
      textarea {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            @include mixins.form-element($theme);
            transition: all 0.4s ease-out;
          }
        }
      }

      textarea {
        min-height: 100px;
        resize: vertical;
      }

      .send-invite-button {
        align-self: flex-end;
        padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        border: none;
        cursor: pointer;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: mixins.theme-gradient($theme, primary);
            color: white;
            transition: all 0.4s ease-out;

            &:hover {
              transform: translateY(-3px);
              @include mixins.shadow('medium', $theme);
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

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: transparent;
          color: mixins.theme-color($theme, text-secondary);
          transition: all 0.4s ease-out;

          &:hover {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }
    }
  }
}
</style>