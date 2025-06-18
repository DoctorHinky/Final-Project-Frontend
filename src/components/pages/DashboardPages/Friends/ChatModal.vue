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
          <XMarkIcon class="icon-size" />
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
            <ChatBubbleLeftRightIcon class="empty-chat-icon" />
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
              
              <!-- Normal message mit Rich-Text -->
              <div v-else v-html="parseMessageContent(message.content)" class="message-text"></div>
              
              <!-- Attachment (if any) -->
              <div v-if="message.attachmentUrl" class="message-attachment">
                <a :href="message.attachmentUrl" target="_blank" rel="noopener noreferrer">
                  <PaperClipIcon class="attachment-icon" />
                  Datei anhang
                </a>
              </div>
              
              <span class="message-time">{{ formatTime(message.createdAt) }}</span>
            </div>
          </div>
          
          <!-- Own Typing Indicator -->
          <div v-if="isUserTyping && editorContent.trim()" class="typing-indicator own-typing">
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span class="typing-text">Du schreibst...</span>
          </div>
          
          <!-- Friend Typing Indicator -->
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

      <!-- Rich Text Editor -->
      <div class="message-editor">
        <!-- Formatting Toolbar -->
        <div class="formatting-toolbar">
          <button 
            type="button"
            @click="toggleFormat('bold')"
            :class="['format-button', { active: activeFormats.bold }]"
            title="Fett (Strg+B)"
          >
            <strong>B</strong>
          </button>
          
          <button 
            type="button"
            @click="toggleFormat('italic')"
            :class="['format-button', { active: activeFormats.italic }]"
            title="Kursiv (Strg+I)"
          >
            <em>I</em>
          </button>
          
          <button 
            type="button"
            @click="toggleFormat('underline')"
            :class="['format-button', { active: activeFormats.underline }]"
            title="Unterstreichen (Strg+U)"
          >
            <u>U</u>
          </button>
          
          <div class="toolbar-separator"></div>
          
          <div class="emoji-picker-container">
            <button 
              type="button"
              @click="toggleEmojiPicker"
              class="format-button emoji-button"
              title="Emoji einfügen"
            >
              <FaceSmileIcon class="icon-size" />
            </button>
            
            <!-- Emoji Picker -->
            <div v-if="showEmojiPicker" class="emoji-picker" @click.stop>
              <div class="emoji-grid">
                <button
                  v-for="emoji in availableEmojis"
                  :key="emoji"
                  @click="insertEmoji(emoji)"
                  class="emoji-item"
                  type="button"
                >
                  {{ emoji }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Rich Text Input -->
        <div class="message-input-wrapper">
          <div 
            ref="messageEditor"
            class="message-input"
            contenteditable="true"
            @input="handleInput"
            @keyup="handleInput"
            @keydown="handleKeyDown"
            @paste="handlePaste"
            @focus="updateActiveFormats"
            @click="updateActiveFormats"
            @blur="handleInput"
            :data-placeholder="'Nachricht schreiben...'"
          ></div>
          
          <button 
            type="button"
            @click.prevent="sendMessage"
            class="send-button"
            :disabled="!canSendMessage"
            :title="`Senden (${canSendMessage ? 'Bereit' : 'Nachricht eingeben'})`"
          >
            <PaperAirplaneIcon class="icon-size" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue';
import { 
  XMarkIcon, 
  PaperAirplaneIcon, 
  PaperClipIcon,
  FaceSmileIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/vue/24/outline';
import chatService, { type ChatMessage } from '@/services/chat.service';
import { authService } from '@/services/auth.service';

export default defineComponent({
  name: 'ChatModal',
  components: {
    XMarkIcon,
    PaperAirplaneIcon,
    PaperClipIcon,
    FaceSmileIcon,
    ChatBubbleLeftRightIcon
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
    // State
    const messages = ref<ChatMessage[]>([]);
    const isSending = ref(false);
    const isTyping = ref(false);
    const isLoading = ref(false);
    const chatContainer = ref<HTMLElement>();
    const messageEditor = ref<HTMLDivElement>();
    const currentConversationId = ref<string>('');
    const currentUserId = ref<string>('');
    const isUserTyping = ref(false);
    const showEmojiPicker = ref(false);
    const editorContent = ref(''); // Neue reaktive Variable für Content
    let typingTimeout: ReturnType<typeof setTimeout> | null = null;

    // Active formats tracking
    const activeFormats = ref({
      bold: false,
      italic: false,
      underline: false
    });

    // 50 verschiedene Emojis
    const availableEmojis = [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊',
      '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛',
      '😜', '🤪', '😝', '🤗', '🤭', '🤫', '🤔', '😐', '😑', '😶',
      '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '😴',
      '😌', '😓', '😔', '😕', '🙃', '🤑', '😲', '😢', '😭', '😤'
    ];

    // Computed
    const hasContent = computed(() => {
      return editorContent.value.trim().length > 0;
    });

    const canSendMessage = computed(() => hasContent.value && !isSending.value);

    // Methods
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

    const loadMessages = async () => {
      if (!props.friendId) return;
      
      isLoading.value = true;
      
      try {
        const conversation = await chatService.createOrGetConversation(props.friendId.toString());
        currentConversationId.value = conversation.id;
        messages.value = [...(conversation.messages || [])].reverse();
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

    const parseMessageContent = (content: string | null): string => {
      if (!content) return '';
      // Konvertiere em-Tags zu i-Tags für bessere Kompatibilität
      let parsed = chatService.parseMessageContent(content);
      parsed = parsed.replace(/<em>/g, '<i>').replace(/<\/em>/g, '</i>');
      return parsed;
    };

    const scrollToBottom = () => {
      nextTick(() => {
        if (chatContainer.value) {
          chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
        }
      });
    };

    // Rich Text Editor Functions
    const updateActiveFormats = () => {
      activeFormats.value.bold = document.queryCommandState('bold');
      activeFormats.value.italic = document.queryCommandState('italic');
      activeFormats.value.underline = document.queryCommandState('underline');
    };

    const toggleFormat = (format: 'bold' | 'italic' | 'underline') => {
      messageEditor.value?.focus();
      
      // Stelle sicher, dass eine Selection existiert
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        document.execCommand(format, false);
        updateActiveFormats();
        
        // Update content after formatting
        nextTick(() => {
          handleInput();
        });
      }
    };

    const insertEmoji = (emoji: string) => {
      messageEditor.value?.focus();
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(emoji);
        range.insertNode(textNode);
        
        // Cursor nach dem Emoji positionieren
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      
      showEmojiPicker.value = false;
      
      // Update content manually
      nextTick(() => {
        handleInput();
      });
    };

    const toggleEmojiPicker = () => {
      showEmojiPicker.value = !showEmojiPicker.value;
    };

    const handleInput = () => {
      // Update editor content
      if (messageEditor.value) {
        // Get text content and clean it
        let text = messageEditor.value.textContent || '';
        
        // Also check innerHTML for cases where only formatting tags exist
        const html = messageEditor.value.innerHTML || '';
        
        // If there's only a <br> tag or empty formatting tags, consider it empty
        if (html === '<br>' || html.match(/^<[^>]+><\/[^>]+>$/)) {
          text = '';
        }
        
        editorContent.value = text;
        
        console.log('Input changed:', {
          text,
          html,
          editorContent: editorContent.value,
          hasContent: hasContent.value,
          canSendMessage: canSendMessage.value
        });
      }
      
      // Update active formats
      updateActiveFormats();
      
      // Typing indicator
      isUserTyping.value = true;
      
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      typingTimeout = setTimeout(() => {
        isUserTyping.value = false;
      }, 2000);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // Strg+B für Fett
      if (event.ctrlKey && event.key === 'b') {
        event.preventDefault();
        toggleFormat('bold');
      }
      
      // Strg+I für Kursiv
      if (event.ctrlKey && event.key === 'i') {
        event.preventDefault();
        toggleFormat('italic');
      }
      
      // Strg+U für Unterstreichen
      if (event.ctrlKey && event.key === 'u') {
        event.preventDefault();
        toggleFormat('underline');
      }
      
      // Enter zum Senden (Shift+Enter für neue Zeile)
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    };

    const handlePaste = (event: ClipboardEvent) => {
      event.preventDefault();
      const text = event.clipboardData?.getData('text/plain') || '';
      document.execCommand('insertText', false, text);
      
      // Update content after paste
      nextTick(() => {
        handleInput();
      });
    };

    const sendMessage = async () => {
      // Debug-Logs
      console.log('SendMessage called:', {
        canSendMessage: canSendMessage.value,
        hasContent: hasContent.value,
        isSending: isSending.value,
        editorContent: editorContent.value,
        currentConversationId: currentConversationId.value,
        textContent: messageEditor.value?.textContent,
        innerHTML: messageEditor.value?.innerHTML
      });

      if (!canSendMessage.value || !currentConversationId.value) {
        console.log('SendMessage aborted - conditions not met');
        return;
      }

      // Hole Text und HTML-Inhalt
      const messageText = messageEditor.value?.textContent?.trim() || '';
      let htmlContent = messageEditor.value?.innerHTML || '';
      
      // Prüfe nochmal ob wirklich Inhalt vorhanden ist
      if (!messageText && !htmlContent.replace(/<[^>]*>/g, '').trim()) {
        console.log('SendMessage aborted - no content');
        return;
      }

      isSending.value = true;
      isUserTyping.value = false;
      
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        typingTimeout = null;
      }

      try {
        console.log('Sending message with content:', htmlContent);
        
        // Konvertiere i-Tags zurück zu em-Tags für konsistentes Speichern
        htmlContent = htmlContent.replace(/<i>/g, '<em>').replace(/<\/i>/g, '</em>');
        
        // Sende Nachricht über Chat-Service
        const response = await chatService.sendMessage(currentConversationId.value, htmlContent);
        
        console.log('Message sent successfully:', response);
        
        // Erstelle lokale Nachricht für sofortige Anzeige
        const localMessage: ChatMessage = {
          id: response.message.id || Date.now().toString(),
          conversationId: currentConversationId.value,
          senderId: currentUserId.value,
          content: htmlContent,
          messageType: 'TEXT',
          attachmentUrl: null,
          isRead: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        messages.value.push(localMessage);
        
        // Clear editor
        if (messageEditor.value) {
          messageEditor.value.innerHTML = '';
          editorContent.value = '';
          updateActiveFormats();
        }
        
        scrollToBottom();

        // Emit message to parent
        emit('send-message', {
          friendId: props.friendId,
          message: messageText
        });

      } catch (error) {
        console.error('Fehler beim Senden der Nachricht:', error);
      } finally {
        isSending.value = false;
      }
    };

    const closeModal = () => {
      showEmojiPicker.value = false;
      emit('update:isVisible', false);
    };

    const focusEditor = () => {
      nextTick(() => {
        if (messageEditor.value) {
          messageEditor.value.focus();
          // Setze Cursor ans Ende
          const range = document.createRange();
          const selection = window.getSelection();
          if (selection) {
            range.selectNodeContents(messageEditor.value);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          }
          
          // Initial content check
          handleInput();
        }
      });
    };

    // Click outside emoji picker
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showEmojiPicker.value && !target.closest('.emoji-picker-container')) {
        showEmojiPicker.value = false;
      }
    };

    // Selection change handler für Format-Updates
    const handleSelectionChange = () => {
      if (messageEditor.value && document.activeElement === messageEditor.value) {
        updateActiveFormats();
      }
    };

    // Debug helper
    const debugSendButton = () => {
      console.log('Debug Send Button:', {
        canSendMessage: canSendMessage.value,
        hasContent: hasContent.value,
        isSending: isSending.value,
        editorContent: editorContent.value,
        editorHTML: messageEditor.value?.innerHTML,
        editorText: messageEditor.value?.textContent,
        conversationId: currentConversationId.value
      });
    };

    // Watcher für editorContent
    watch(editorContent, (newValue) => {
      console.log('Editor content changed:', newValue, 'Can send:', canSendMessage.value);
    });

    // Watchers
    watch(() => props.isVisible, (visible) => {
      if (visible) {
        loadCurrentUser();
        loadMessages();
        focusEditor();
        document.addEventListener('click', handleClickOutside);
        document.addEventListener('selectionchange', handleSelectionChange);
      } else {
        // Reset state
        messages.value = [];
        currentConversationId.value = '';
        editorContent.value = '';
        if (messageEditor.value) {
          messageEditor.value.innerHTML = '';
        }
        isTyping.value = false;
        isUserTyping.value = false;
        showEmojiPicker.value = false;
        activeFormats.value = {
          bold: false,
          italic: false,
          underline: false
        };
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('selectionchange', handleSelectionChange);
        
        if (typingTimeout) {
          clearTimeout(typingTimeout);
          typingTimeout = null;
        }
      }
    });

    watch(() => props.friendId, () => {
      if (props.isVisible && props.friendId) {
        loadMessages();
      }
    });

    // Keyboard shortcuts
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && props.isVisible) {
        closeModal();
      }
    };

    onMounted(() => {
      document.addEventListener('keydown', handleGlobalKeyDown);
      loadCurrentUser();
    });

    onUnmounted(() => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('selectionchange', handleSelectionChange);
      
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    });

    return {
      // State
      messages,
      isSending,
      isTyping,
      isLoading,
      isUserTyping,
      showEmojiPicker,
      availableEmojis,
      activeFormats,
      editorContent,
      
      // Refs
      chatContainer,
      messageEditor,
      
      // Computed
      hasContent,
      canSendMessage,
      
      // Methods
      getInitials,
      formatTime,
      isOwnMessage,
      parseMessageContent,
      toggleFormat,
      insertEmoji,
      toggleEmojiPicker,
      handleInput,
      handleKeyDown,
      handlePaste,
      sendMessage,
      closeModal,
      updateActiveFormats,
      debugSendButton
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

// Einheitliche Icon-Größe
.icon-size {
  width: 20px !important;
  height: 20px !important;
  position: absolute;
}

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
  z-index: 1050;
  padding: map.get(vars.$spacing, m);
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  width: 100%;
  max-width: 1200px;
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
  }

  .debug-info {
    padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
    font-size: map.get(map.get(vars.$fonts, sizes), xs);
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, secondary-bg);
        color: mixins.theme-color($theme, text-secondary);
      }
    }
    
    button {
      margin-top: map.get(vars.$spacing, xs);
      padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, s);
      font-size: map.get(map.get(vars.$fonts, sizes), xs);
      border-radius: map.get(map.get(vars.$layout, border-radius), small);
      border: 1px solid;
      cursor: pointer;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, card-bg);
          border-color: mixins.theme-color($theme, border-light);
          color: mixins.theme-color($theme, text-primary);
          
          &:hover {
            background-color: mixins.theme-color($theme, hover-color);
          }
        }
      }
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
      width: 48px;
      height: 48px;
      margin-bottom: map.get(vars.$spacing, m);
      opacity: 0.6;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
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

        .message-text {
          margin: 0 0 map.get(vars.$spacing, xs) 0;
          line-height: 1.4;
          font-size: map.get(map.get(vars.$fonts, sizes), medium);
          word-wrap: break-word;
          
          // Styles für Rich-Text
          :deep(b),
          :deep(strong) {
            font-weight: map.get(map.get(vars.$fonts, weights), bold);
          }
          
          :deep(i),
          :deep(em) {
            font-style: italic;
          }
          
          :deep(u) {
            text-decoration: underline;
          }
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

            .attachment-icon {
              width: 16px;
              height: 16px;
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

// Rich Text Editor
.message-editor {
  border-top: 1px solid;

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      border-color: mixins.theme-color($theme, border-light);
      transition: border-color 0.4s ease-out;
    }
  }

  .formatting-toolbar {
    display: flex;
    align-items: center;
    gap: map.get(vars.$spacing, xs);
    padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);

    .format-button {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: map.get(map.get(vars.$layout, border-radius), small);
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: map.get(map.get(vars.$fonts, sizes), medium);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: transparent;
          color: mixins.theme-color($theme, text-secondary);

          &:hover {
            background-color: mixins.theme-color($theme, secondary-bg);
            color: mixins.theme-color($theme, text-primary);
          }

          &.active {
            background-color: mixins.theme-color($theme, accent-teal);
            color: white;
          }
        }
      }
    }

    .toolbar-separator {
      width: 1px;
      height: 24px;
      margin: 0 map.get(vars.$spacing, xs);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, border-light);
        }
      }
    }

    .emoji-picker-container {
      position: relative;

      .emoji-picker {
        position: absolute;
        bottom: calc(100% + #{map.get(vars.$spacing, s)});
        left: 50%;
        transform: translateX(-50%);
        width: 320px;
        max-height: 280px;
        overflow-y: auto;
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);
        @include animations.fade-in(0.2s);
        z-index: 100;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, card-bg);
            border: 1px solid mixins.theme-color($theme, border-light);
            @include mixins.shadow('medium', $theme);
          }
        }

        .emoji-grid {
          display: grid;
          grid-template-columns: repeat(10, 1fr);
          gap: map.get(vars.$spacing, xxs);
          padding: map.get(vars.$spacing, s);

          .emoji-item {
            width: 28px;
            height: 28px;
            font-size: 25px !important;
            border: none;
            background: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: map.get(map.get(vars.$layout, border-radius), small);
            transition: all 0.2s ease;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                &:hover {
                  background-color: mixins.theme-color($theme, secondary-bg);
                  transform: scale(1.2);
                }
              }
            }
          }
        }
      }
    }
  }

  .message-input-wrapper {
    display: flex;
    gap: map.get(vars.$spacing, s);
    align-items: flex-end;
    padding: map.get(vars.$spacing, xl) map.get(vars.$spacing, xl);

    .message-input {
      flex: 1;
      min-height: 44px;
      max-height: 120px;
      overflow-y: auto;
      padding: map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-size: map.get(map.get(vars.$fonts, sizes), medium);
      outline: none;
      line-height: 1.5;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          @include mixins.form-element($theme);
          transition: all 0.4s ease-out;

          &:focus {
            border-color: mixins.theme-color($theme, accent-teal);
            box-shadow: 0 0 0 3px rgba(mixins.theme-color($theme, accent-teal), 0.1);
          }

          &:empty:not(:focus):before {
            content: attr(data-placeholder);
            color: mixins.theme-color($theme, text-muted);
            pointer-events: none;
            position: absolute;
          }
        }
      }
      
      // Rich-Text Styles
      :deep(b),
      :deep(strong) {
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
      }
      
      :deep(i),
      :deep(em) {
        font-style: italic;
      }
      
      :deep(u) {
        text-decoration: underline;
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

  .message-editor {
    .formatting-toolbar {
      padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, m);
    }

    .message-input-wrapper {
      padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);
    }
  }

  .formatting-toolbar {
    .emoji-picker-container {
      .emoji-picker {
        left: -10px;
        right: 10px;
        width: calc(100vw - 40px);
        max-width: 320px;
        transform: none;
      }
    }
  }
}
</style>