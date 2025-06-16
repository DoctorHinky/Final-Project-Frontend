<!-- src/components/pages/DashboardPages/Friends/ChatModal.vue -->
<template>
  <div v-if="isVisible" class="modal-backdrop" @click="closeModal">
    <div class="modal-content" @click.stop>
      <header class="modal-header">
        <div class="chat-user-info">
          <div class="chat-avatar">
            <span class="avatar-placeholder">{{ getInitials(friendName) }}</span>
            <span v-if="isOnline" class="online-indicator"></span>
          </div>
          <div class="user-details">
            <h3 class="modal-title">{{ friendName }}</h3>
            <span class="user-status">{{ isOnline ? 'Online' : 'Zuletzt aktiv vor 2h' }}</span>
          </div>
        </div>
        <button class="close-button" @click="closeModal" aria-label="Chat schließen">
          <XMarkIcon class="close-icon" />
        </button>
      </header>

      <div class="chat-container" ref="chatContainer">
        <div class="messages-list">
          <div 
            v-for="message in messages" 
            :key="message.id" 
            :class="['message', { 'own-message': message.isOwn, 'friend-message': !message.isOwn }]"
          >
            <div class="message-content">
              <p>{{ message.content }}</p>
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
            </div>
          </div>
          
          <!-- Typing Indicator -->
          <div v-if="isTyping" class="typing-indicator">
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span class="typing-text">{{ friendName }} schreibt...</span>
          </div>
        </div>
      </div>

      <form class="message-form" @submit.prevent="sendMessage">
        <div class="message-input-wrapper">
          <input 
            type="text" 
            class="message-input"
            placeholder="Nachricht schreiben..."
            v-model="newMessage"
            @keyup.enter="sendMessage"
            :disabled="isSending"
            ref="messageInput"
          />
          <button 
            type="submit" 
            class="send-button"
            :disabled="!newMessage.trim() || isSending"
          >
            <PaperAirplaneIcon class="send-icon" />
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/vue/24/outline';
import friendService from '@/services/friend.service';

interface ChatMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

export default defineComponent({
  name: 'ChatModal',
  components: {
    XMarkIcon,
    PaperAirplaneIcon
  },
  props: {
    isVisible: {
      type: Boolean,
      required: true
    },
    friendId: {
      type: [String, Number],
      required: true
    },
    friendName: {
      type: String,
      required: true
    },
    isOnline: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:isVisible', 'send-message'],
  setup(props, { emit }) {
    const newMessage = ref('');
    const messages = ref<ChatMessage[]>([]);
    const isSending = ref(false);
    const isTyping = ref(false);
    const chatContainer = ref<HTMLElement>();
    const messageInput = ref<HTMLInputElement>();

    // Nachrichten aus Backend laden
    const loadMessages = async () => {
      if (!props.friendId) return;
      
      try {
        const response = await friendService.getChatHistory(props.friendId.toString());
        messages.value = response.data.map(msg => ({
          id: msg.id,
          senderId: msg.senderId,
          recipientId: msg.recipientId,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          isOwn: msg.senderId !== props.friendId.toString() // Nachricht ist eigene wenn nicht vom Freund
        }));
        
        // Nachrichten als gelesen markieren
        await friendService.markMessagesAsRead(props.friendId.toString());
      } catch (error) {
        console.error('Fehler beim Laden der Nachrichten:', error);
        // Fallback auf leere Liste
        messages.value = [];
      }
    };

    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    const formatTime = (timestamp: Date) => {
      return timestamp.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const scrollToBottom = () => {
      nextTick(() => {
        if (chatContainer.value) {
          chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
        }
      });
    };

    const sendMessage = async () => {
      const messageText = newMessage.value.trim();
      if (!messageText || isSending.value || !props.friendId) return;

      isSending.value = true;

      try {
        // Nachricht an Backend senden
        const response = await friendService.sendMessage(props.friendId.toString(), messageText);
        
        // Neue Nachricht zur lokalen Liste hinzufügen
        const message: ChatMessage = {
          id: response.data?.id || Date.now().toString(),
          senderId: 'current_user', // TODO: Echte User-ID verwenden
          recipientId: props.friendId.toString(),
          content: messageText,
          timestamp: new Date(),
          isOwn: true
        };

        messages.value.push(message);
        newMessage.value = '';
        scrollToBottom();

        // Emit message to parent
        emit('send-message', {
          friendId: props.friendId,
          message: messageText
        });

        // Simuliere Typing-Indikator (optional für bessere UX)
        setTimeout(() => {
          isTyping.value = true;
          setTimeout(() => {
            isTyping.value = false;
            // Könnte hier neue Nachrichten vom Backend laden
            // loadMessages();
          }, 2000);
        }, 500);

      } catch (error) {
        console.error('Fehler beim Senden der Nachricht:', error);
        // Optinal: Toast-Benachrichtigung für Fehler
      } finally {
        isSending.value = false;
      }
    };

    const closeModal = () => {
      emit('update:isVisible', false);
    };

    const focusInput = () => {
      nextTick(() => {
        if (messageInput.value) {
          messageInput.value.focus();
        }
      });
    };

    // Watchers
    watch(() => props.isVisible, (visible) => {
      if (visible) {
        loadMessages();
        focusInput();
        scrollToBottom();
      }
    });

    // Keyboard shortcuts
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && props.isVisible) {
        closeModal();
      }
    };

    onMounted(() => {
      document.addEventListener('keydown', handleKeyDown);
    });

    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeyDown);
    });

    return {
      newMessage,
      messages,
      isSending,
      isTyping,
      chatContainer,
      messageInput,
      getInitials,
      formatTime,
      sendMessage,
      closeModal
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
  max-width: 600px;
  height: 80vh;
  max-height: 700px;
  display: flex;
  flex-direction: column;
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
  align-items: center;
  justify-content: space-between;
  padding: map.get(vars.$spacing, l);
  border-bottom: 1px solid;

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      border-color: mixins.theme-color($theme, border-light);
      transition: border-color 0.4s ease-out;
    }
  }

  .chat-user-info {
    display: flex;
    align-items: center;
    gap: map.get(vars.$spacing, m);

    .chat-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          border: 2px solid mixins.theme-color($theme, accent-teal);
          transition: all 0.4s ease-out;
        }
      }

      .avatar-placeholder {
        font-size: map.get(map.get(vars.$fonts, sizes), medium);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
            transition: color 0.4s ease-out;
          }
        }
      }

      .online-indicator {
        position: absolute;
        bottom: 2px;
        right: 2px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: #4CAF50;
        border: 2px solid white;
      }
    }

    .user-details {
      .modal-title {
        font-size: map.get(map.get(vars.$fonts, sizes), large);
        font-weight: map.get(map.get(vars.$fonts, weights), semibold);
        margin: 0 0 map.get(vars.$spacing, xxs) 0;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
            transition: color 0.4s ease-out;
          }
        }
      }

      .user-status {
        font-size: map.get(map.get(vars.$fonts, sizes), small);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
            transition: color 0.4s ease-out;
          }
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

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: map.get(vars.$spacing, m);
  
  .messages-list {
    display: flex;
    flex-direction: column;
    gap: map.get(vars.$spacing, m);

    .message {
      display: flex;
      max-width: 80%;

      &.own-message {
        align-self: flex-end;

        .message-content {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background: mixins.theme-gradient($theme, primary);
              color: white;
            }
          }
        }
      }

      &.friend-message {
        align-self: flex-start;

        .message-content {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
              color: mixins.theme-color($theme, text-primary);
              transition: all 0.4s ease-out;
            }
          }
        }
      }

      .message-content {
        padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);
        position: relative;

        p {
          margin: 0 0 map.get(vars.$spacing, xs) 0;
          line-height: 1.4;
          font-size: map.get(map.get(vars.$fonts, sizes), medium);
        }

        .message-time {
          font-size: map.get(map.get(vars.$fonts, sizes), xs);
          opacity: 0.7;
        }
      }
    }

    .typing-indicator {
      align-self: flex-start;
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, s);
      padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          transition: all 0.4s ease-out;
        }
      }

      .typing-dots {
        display: flex;
        gap: 4px;

        span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #666;
          animation: typing 1.4s infinite;

          &:nth-child(2) {
            animation-delay: 0.2s;
          }

          &:nth-child(3) {
            animation-delay: 0.4s;
          }
        }
      }

      .typing-text {
        font-size: map.get(map.get(vars.$fonts, sizes), small);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }
    }
  }
}

.message-form {
  padding: map.get(vars.$spacing, l);
  border-top: 1px solid;

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      border-color: mixins.theme-color($theme, border-light);
      transition: border-color 0.4s ease-out;
    }
  }

  .message-input-wrapper {
    display: flex;
    gap: map.get(vars.$spacing, s);
    align-items: center;

    .message-input {
      flex: 1;
      padding: map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-size: map.get(map.get(vars.$fonts, sizes), medium);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          @include mixins.form-element($theme);
          transition: all 0.4s ease-out;

          &:focus {
            outline: none;
            border-color: mixins.theme-color($theme, accent-teal);
            box-shadow: 0 0 0 3px rgba(mixins.theme-color($theme, accent-teal), 0.1);
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        }
      }
    }

    .send-button {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, primary);
          color: white;

          &:hover:not(:disabled) {
            transform: scale(1.05);
            @include mixins.shadow('small', $theme);
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
          }
        }
      }

      .send-icon {
        width: 20px;
        height: 20px;
      }
    }
  }
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

// Responsive Design
@media (max-width: 640px) {
  .modal-content {
    height: 90vh;
    margin: map.get(vars.$spacing, s);
  }

  .modal-header {
    padding: map.get(vars.$spacing, m);
  }

  .chat-container {
    padding: map.get(vars.$spacing, s);
  }

  .message-form {
    padding: map.get(vars.$spacing, m);
  }
}
</style>