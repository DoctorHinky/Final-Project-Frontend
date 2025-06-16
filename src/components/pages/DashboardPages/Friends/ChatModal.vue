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
        <!-- Loading indicator -->
        <div v-if="isLoading" class="loading-indicator">
          <div class="loading-spinner"></div>
          <span>Nachrichten werden geladen...</span>
        </div>

        <div v-else class="messages-list">
          <!-- Empty state -->
          <div v-if="messages.length === 0" class="empty-chat">
            <div class="empty-chat-icon">💬</div>
            <p>Noch keine Nachrichten vorhanden.</p>
            <p>Schreibe die erste Nachricht!</p>
          </div>

          <!-- Messages -->
          <div 
            v-else
            v-for="message in messages" 
            :key="message.id" 
            :class="['message', { 
              'own-message': isOwnMessage(message), 
              'friend-message': !isOwnMessage(message),
              'deleted-message': message.content === 'Die Nachricht wurde gelöscht'
            }]"
          >
            <div class="message-content">
              <!-- Deleted message -->
              <p v-if="message.content === 'Die Nachricht wurde gelöscht'" class="deleted-text">
                <em>Diese Nachricht wurde gelöscht</em>
              </p>
              
              <!-- Normal message -->
              <p v-else>{{ message.content }}</p>
              
              <!-- Attachment (if any) -->
              <div v-if="message.attachmentUrl" class="message-attachment">
                <a :href="message.attachmentUrl" target="_blank" rel="noopener noreferrer">
                  📎 Datei anhang
                </a>
              </div>
              
              <span class="message-time">{{ formatTime(message.createdAt) }}</span>
            </div>
          </div>
          
          <!-- Own Typing Indicator -->
          <div v-if="isUserTyping && newMessage.trim()" class="typing-indicator own-typing">
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span class="typing-text">Du schreibst...</span>
          </div>
          
          <!-- Friend Typing Indicator (nur wenn echte WebSocket-Verbindung) -->
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
            @input="handleTyping"
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
import chatService, { type ChatMessage } from '@/services/chat.service';
import { authService } from '@/services/auth.service';

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
    const isLoading = ref(false);
    const chatContainer = ref<HTMLElement>();
    const messageInput = ref<HTMLInputElement>();
    const currentConversationId = ref<string>('');
    const currentUserId = ref<string>('');
    const isUserTyping = ref(false); // Eigener Typing-Status
    let typingTimeout: ReturnType<typeof setTimeout> | null = null;

    // Debug logging
    watch(() => props.isVisible, (visible) => {
      console.log('ChatModal: isVisible changed to:', visible);
    });

    watch(() => props.friendId, (friendId) => {
      console.log('ChatModal: friendId changed to:', friendId);
    });

    // Lade aktuelle User-ID
    const loadCurrentUser = () => {
      try {
        const userData = authService.getUserData();
        if (userData?.sub) {
          currentUserId.value = userData.sub;
        }
      } catch (error) {
        console.error('Fehler beim Laden der User-Daten:', error);
      }
    };

    // Nachrichten und Conversation laden
    const loadMessages = async () => {
      if (!props.friendId) {
        console.warn('ChatModal: No friendId provided');
        return;
      }
      
      isLoading.value = true;
      console.log('ChatModal: Loading messages for friendId:', props.friendId);
      
      try {
        const conversation = await chatService.createOrGetConversation(props.friendId.toString());
        currentConversationId.value = conversation.id;
        
        // Nachrichten umkehren, damit die neuesten unten stehen
        messages.value = [...(conversation.messages || [])].reverse();
        
        // 🔍 DEBUG: Prüfe was vom Backend kommt
        console.log('ChatModal: Raw conversation from backend:', conversation);
        conversation.messages?.forEach((msg, index) => {
          console.log(`ChatModal: Message ${index + 1}:`, {
            id: msg.id,
            content: msg.content,
            contentLength: msg.content?.length || 0,
            looksEncrypted: msg.content?.length > 50 && !msg.content?.includes(' '),
            messageType: msg.messageType,
            senderId: msg.senderId
          });
        });
        
        console.log('ChatModal: Loaded', messages.value.length, 'messages');
        scrollToBottom();
      } catch (error) {
        console.error('Fehler beim Laden der Nachrichten:', error);
        messages.value = [];
      } finally {
        isLoading.value = false;
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

    const formatTime = (timestamp: string) => {
      return chatService.formatChatTime(timestamp);
    };

    const isOwnMessage = (message: ChatMessage): boolean => {
      return chatService.isOwnMessage(message, currentUserId.value);
    };

    const scrollToBottom = () => {
      nextTick(() => {
        if (chatContainer.value) {
          chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
        }
      });
    };

    const handleTyping = () => {
      // Zeige "Du schreibst..." wenn User tippt
      isUserTyping.value = true;
      
      // Reset Timer
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      // Nach 2 Sekunden ohne tippen, verstecke Indicator
      typingTimeout = setTimeout(() => {
        isUserTyping.value = false;
      }, 2000);
    };

    const sendMessage = async () => {
      const messageText = newMessage.value.trim();
      if (!messageText || isSending.value || !currentConversationId.value) return;

      isSending.value = true;
      isUserTyping.value = false; // Stoppe eigenen Typing-Indicator
      
      // Clear typing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        typingTimeout = null;
      }
      
      console.log('ChatModal: Sending message:', messageText);

      try {
        // Sende Nachricht über Chat-Service
        const response = await chatService.sendMessage(currentConversationId.value, messageText);
        
        // Erstelle lokale Nachricht für sofortige Anzeige
        const localMessage: ChatMessage = {
          id: response.message.id || Date.now().toString(),
          conversationId: currentConversationId.value,
          senderId: currentUserId.value,
          content: messageText,
          messageType: 'TEXT',
          attachmentUrl: null,
          isRead: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        messages.value.push(localMessage);
        newMessage.value = '';
        scrollToBottom();

        // Emit message to parent
        emit('send-message', {
          friendId: props.friendId,
          message: messageText
        });

        console.log('ChatModal: Message sent successfully');

      } catch (error) {
        console.error('Fehler beim Senden der Nachricht:', error);
        // TODO: Toast-Benachrichtigung für Fehler anzeigen
      } finally {
        isSending.value = false;
      }
    };

    const closeModal = () => {
      console.log('ChatModal: Closing modal');
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
      console.log('ChatModal: isVisible watcher triggered:', visible);
      if (visible) {
        loadCurrentUser();
        loadMessages();
        focusInput();
      } else {
        // Reset state when modal closes
        messages.value = [];
        currentConversationId.value = '';
        newMessage.value = '';
        isTyping.value = false;
        isUserTyping.value = false;
        
        // Clear typing timeout
        if (typingTimeout) {
          clearTimeout(typingTimeout);
          typingTimeout = null;
        }
      }
    });

    watch(() => props.friendId, () => {
      if (props.isVisible && props.friendId) {
        console.log('ChatModal: friendId changed, reloading messages');
        loadMessages();
      }
    });

    // Keyboard shortcuts
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && props.isVisible) {
        closeModal();
      }
    };

    onMounted(() => {
      console.log('ChatModal: Component mounted');
      document.addEventListener('keydown', handleKeyDown);
      loadCurrentUser();
    });

    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Cleanup typing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    });

    return {
      newMessage,
      messages,
      isSending,
      isTyping,
      isLoading,
      isUserTyping,
      chatContainer,
      messageInput,
      getInitials,
      formatTime,
      isOwnMessage,
      handleTyping,
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
  z-index: 1050; // Höher als Sidebar (950)
  padding: map.get(vars.$spacing, m);
  background-color: rgba(0, 0, 0, 0.5); // Dunkler Hintergrund für bessere Sichtbarkeit
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
  
  .loading-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: map.get(vars.$spacing, xl);
    gap: map.get(vars.$spacing, m);

    .loading-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid;
      border-radius: 50%;
      animation: spin 1s linear infinite;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          border-color: mixins.theme-color($theme, border-light);
          border-top-color: mixins.theme-color($theme, accent-teal);
        }
      }
    }

    span {
      font-size: map.get(map.get(vars.$fonts, sizes), small);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  .empty-chat {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: map.get(vars.$spacing, xxl);
    text-align: center;

    .empty-chat-icon {
      font-size: 48px;
      margin-bottom: map.get(vars.$spacing, m);
      opacity: 0.6;
    }

    p {
      margin: map.get(vars.$spacing, xs) 0;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }

      &:first-of-type {
        font-weight: map.get(map.get(vars.$fonts, weights), medium);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }
    }
  }
  
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

      &.deleted-message {
        .message-content {
          opacity: 0.6;

          .deleted-text {
            font-style: italic;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-secondary);
              }
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
          word-wrap: break-word;
        }

        .message-attachment {
          margin: map.get(vars.$spacing, xs) 0;
          
          a {
            display: inline-flex;
            align-items: center;
            gap: map.get(vars.$spacing, xs);
            padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, s);
            border-radius: map.get(map.get(vars.$layout, border-radius), small);
            font-size: map.get(map.get(vars.$fonts, sizes), small);
            text-decoration: none;
            transition: all 0.2s ease;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background-color: rgba(255, 255, 255, 0.1);
                color: inherit;

                &:hover {
                  background-color: rgba(255, 255, 255, 0.2);
                }
              }
            }
          }
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

      &.own-typing {
        align-self: flex-end;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: rgba(mixins.theme-color($theme, accent-teal), 0.1);
            border: 1px solid rgba(mixins.theme-color($theme, accent-teal), 0.2);
          }
        }

        .typing-text {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, accent-teal);
              font-style: italic;
            }
          }
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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
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