<!-- src/components/pages/DashboardPages/Friends/ChatModal.vue -->
<template>
  <div v-if="isVisible" class="modal-backdrop" @click="closeModal">
    <div class="modal-content" @click.stop>
      <!-- Header -->
      <header class="chat-header">
        <div class="user-info">
          <div class="avatar">
            <span class="avatar-text">{{ getInitials(friendName) }}</span>
            <div v-if="isOnline" class="online-status"></div>
          </div>
          <div class="user-details">
            <h3 class="user-name">{{ friendName }}</h3>
            <span class="user-status">{{ isOnline ? "Online" : "Zuletzt aktiv vor 2h" }}</span>
          </div>
        </div>
        <button class="close-btn" @click="closeModal" aria-label="Chat schließen">
          <XMarkIcon class="close-icon" />
        </button>
      </header>

      <!-- Messages Container -->
      <div class="messages-container" ref="chatContainer">
        <!-- Loading -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <span>Nachrichten werden geladen...</span>
        </div>

        <!-- Messages -->
        <div v-else class="messages-list">
          <!-- Empty state -->
          <div v-if="messages.length === 0" class="empty-state">
            <div class="empty-icon">💬</div>
            <p>Noch keine Nachrichten vorhanden.</p>
            <p>Schreibe die erste Nachricht!</p>
          </div>

          <!-- Message bubbles -->
          <div v-else v-for="message in messages" :key="message.id" :class="[
            'message-wrapper',
            {
              'own-message': isOwnMessage(message),
              'friend-message': !isOwnMessage(message),
              'editing': editingMessageId === message.id,
            },
          ]">
            <!-- Edit Mode -->
            <div v-if="editingMessageId === message.id" class="edit-container">
              <div ref="editRichText" class="edit-input" contenteditable="true" @input="handleEditInput"
                @keydown.escape="cancelEdit" @keydown.enter.ctrl="saveEdit" @keydown.enter.exact.prevent="saveEdit">
              </div>
              <div class="edit-actions">
                <button @click="cancelEdit" class="edit-btn cancel">
                  <XMarkIcon class="btn-icon" />
                </button>
                <button @click="saveEdit" class="edit-btn save" :disabled="!editingContent.trim()">
                  <CheckIcon class="btn-icon" />
                </button>
              </div>
            </div>

            <!-- Normal Message -->
            <div v-else class="message-bubble" @dblclick="startEdit(message)">
              <!-- Deleted message -->
              <div v-if="message.content === 'Die Nachricht wurde gelöscht'" class="deleted-message">
                <TrashIcon class="deleted-icon" />
                <em>Diese Nachricht wurde gelöscht</em>
              </div>

              <!-- Normal message content -->
              <div v-else>
                <div class="message-text" v-html="formatMessage(message.content)"></div>

                <!-- Attachment -->
                <div v-if="message.attachmentUrl" class="attachment">
                  <a :href="message.attachmentUrl" target="_blank" rel="noopener noreferrer">
                    📎 Anhang anzeigen
                  </a>
                </div>
              </div>

              <!-- Message footer -->
              <div class="message-footer">
                <span v-if="message.isEdited" class="edited-label">(bearbeitet)</span>
                <span class="message-time">{{ formatTime(message.createdAt) }}</span>

                <!-- Message actions -->
                <div v-if="isOwnMessage(message) && message.content !== 'Die Nachricht wurde gelöscht'"
                  class="message-actions">
                  <button @click="startEdit(message)" class="action-btn" title="Bearbeiten">
                    <PencilIcon class="action-icon" />
                  </button>
                  <button @click="deleteMessage(message)" class="action-btn" title="Löschen">
                    <TrashIcon class="action-icon" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Typing indicators -->
          <div v-if="isUserTyping && newMessage.trim()" class="typing-indicator own-typing">
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span class="typing-text">Du schreibst...</span>
          </div>

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

      <!-- Emoji Picker -->
      <div v-if="showEmojiPicker" class="emoji-picker" @click.stop>
        <div class="emoji-header">
          <span>Emojis auswählen</span>
          <button @click="showEmojiPicker = false" class="emoji-close">
            <XMarkIcon class="close-icon" />
          </button>
        </div>
        <div class="emoji-grid">
          <button v-for="emoji in popularEmojis" :key="emoji" @click="insertEmoji(emoji)" class="emoji-btn">
            {{ emoji }}
          </button>
        </div>
      </div>

      <!-- Input Area -->
      <div class="input-area">
        <!-- Formatting Toolbar -->
        <div class="formatting-toolbar">
          <button type="button" @click="applyFormatting('bold')" class="format-btn"
            :class="{ active: isFormatActive('bold') }" title="Fett (Strg+B)">
            <span class="format-icon bold">B</span>
          </button>
          <button type="button" @click="applyFormatting('italic')" class="format-btn"
            :class="{ active: isFormatActive('italic') }" title="Kursiv (Strg+I)">
            <span class="format-icon italic">I</span>
          </button>
          <button type="button" @click="applyFormatting('underline')" class="format-btn"
            :class="{ active: isFormatActive('underline') }" title="Unterstrichen (Strg+U)">
            <span class="format-icon underline">U</span>
          </button>
          <div class="divider"></div>
          <button type="button" @click="toggleEmojiPicker" class="format-btn emoji-btn" title="Emojis">
            😀
          </button>
        </div>

        <!-- Message Input -->
        <form class="input-form" @submit.prevent="sendMessage">
          <div class="input-wrapper">
            <div ref="richTextInput" class="rich-input" contenteditable="true" @input="handleRichTextInput"
              @keydown="handleKeydown" @paste="handlePaste" @focus="updateActiveFormats" @blur="updateActiveFormats"
              @keyup="updateActiveFormats" @mouseup="updateActiveFormats"
              :data-placeholder="newMessage ? '' : 'Nachricht schreiben...'"></div>
          </div>
          <button type="submit" class="send-btn" :disabled="!newMessage.trim() || isSending">
            <PaperAirplaneIcon class="send-icon" />
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, nextTick, onMounted, onUnmounted } from "vue";
import {
  XMarkIcon,
  PaperAirplaneIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon
} from "@heroicons/vue/24/outline";
import chatService, { type ChatMessage } from "@/services/chat.service";
import { authService } from "@/services/auth.service";

export default defineComponent({
  name: "ChatModal",
  components: {
    XMarkIcon,
    PaperAirplaneIcon,
    PencilIcon,
    TrashIcon,
    CheckIcon,
  },
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
    friendId: {
      type: [String, Number],
      required: true,
    },
    friendName: {
      type: String,
      required: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:isVisible", "send-message", "show-toast"],
  setup(props, { emit }) {
    // Reactive state
    const newMessage = ref("");
    const messages = ref<ChatMessage[]>([]);
    const isSending = ref(false);
    const isTyping = ref(false);
    const isLoading = ref(false);
    const chatContainer = ref<HTMLElement>();
    const richTextInput = ref<HTMLDivElement>();
    const editRichText = ref<HTMLDivElement>();
    const currentConversationId = ref<string>("");
    const currentUserId = ref<string>("");
    const isUserTyping = ref(false);

    // Features
    const showEmojiPicker = ref(false);
    const editingMessageId = ref<string | null>(null);
    const editingContent = ref("");
    const activeFormats = ref(new Set<string>());

    let typingTimeout: ReturnType<typeof setTimeout> | null = null;

    // Beliebte Emojis
    const popularEmojis = ref([
      "😀", "😃", "😄", "😊", "😉", "😍", "🥰", "😘", "😗", "😙",
      "😚", "🙂", "🤗", "🤔", "😐", "😑", "😶", "🙄", "😏", "😣",
      "😥", "😮", "🤐", "😯", "😪", "😫", "🥱", "😴", "😌", "😛",
      "😜", "😝", "🤤", "😒", "😓", "😔", "😕", "🙃", "🤑", "😲",
      "👍", "👎", "👏", "🙌", "👌", "✌️", "🤞", "🤟", "🤘", "🤙",
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
      "💯", "🔥", "⭐", "🌟", "✨", "⚡", "💫", "💥", "💢", "💨"
    ]);

    // Rich Text Editor Functions
    const isFormatActive = (format: string): boolean => {
      return activeFormats.value.has(format);
    };

    const updateActiveFormats = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      activeFormats.value.clear();

      const range = selection.getRangeAt(0);
      let parentElement = range.commonAncestorContainer;

      if (parentElement.nodeType === Node.TEXT_NODE) {
        parentElement = parentElement.parentElement;
      }

      let current = parentElement as Element;
      while (current && current !== richTextInput.value) {
        if (current.tagName === 'STRONG' || current.tagName === 'B') {
          activeFormats.value.add('bold');
        }
        if (current.tagName === 'EM' || current.tagName === 'I') {
          activeFormats.value.add('italic');
        }
        if (current.tagName === 'U') {
          activeFormats.value.add('underline');
        }
        current = current.parentElement as Element;
      }
    };

    const applyFormatting = (format: 'bold' | 'italic' | 'underline') => {
      if (!richTextInput.value) return;

      richTextInput.value.focus();

      try {
        let command: string;
        switch (format) {
          case 'bold':
            command = 'bold';
            break;
          case 'italic':
            command = 'italic';
            break;
          case 'underline':
            command = 'underline';
            break;
          default:
            return;
        }

        document.execCommand(command, false);
        updateActiveFormats();
        updateNewMessageFromRichText();
      } catch (error) {
        console.error('Fehler beim Anwenden der Formatierung:', error);
      }
    };

    const handleRichTextInput = () => {
      updateNewMessageFromRichText();
      updateActiveFormats();
      handleTyping();
    };

    const handleEditInput = () => {
      if (!editRichText.value) return;
      editingContent.value = editRichText.value.innerHTML;
    };

    const updateNewMessageFromRichText = () => {
      if (!richTextInput.value) return;

      let html = richTextInput.value.innerHTML;

      // HTML zu Markdown für Backend
      let text = html
        .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
        .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
        .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
        .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
        .replace(/<u[^>]*>(.*?)<\/u>/gi, '__$1__')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<div[^>]*>/gi, '\n')
        .replace(/<\/div>/gi, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&amp;/gi, '&');

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = text;
      text = tempDiv.textContent || tempDiv.innerText || '';

      newMessage.value = text.trim();
    };

    const insertEmoji = (emoji: string) => {
      if (!richTextInput.value) return;

      richTextInput.value.focus();

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(emoji));

        range.setStartAfter(range.endContainer);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        richTextInput.value.innerHTML += emoji;
      }

      updateNewMessageFromRichText();
      showEmojiPicker.value = false;
    };

    const toggleEmojiPicker = () => {
      showEmojiPicker.value = !showEmojiPicker.value;
    };

    const formatMessage = (content: string): string => {
      return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.*?)__/g, '<u>$1</u>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
    };

    const handleKeydown = (event: KeyboardEvent) => {
      // Keyboard shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'b':
            event.preventDefault();
            applyFormatting('bold');
            break;
          case 'i':
            event.preventDefault();
            applyFormatting('italic');
            break;
          case 'u':
            event.preventDefault();
            applyFormatting('underline');
            break;
          case 'enter':
            event.preventDefault();
            sendMessage();
            break;
        }
      } else if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    };

    const handlePaste = (event: ClipboardEvent) => {
      event.preventDefault();

      const clipboardData = event.clipboardData;
      if (!clipboardData) return;

      const text = clipboardData.getData('text/plain');

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));

        range.setStartAfter(range.endContainer);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }

      updateNewMessageFromRichText();
    };

    // Edit functions
    const startEdit = (message: ChatMessage) => {
      if (!isOwnMessage(message) || message.content === 'Die Nachricht wurde gelöscht') return;

      editingMessageId.value = message.id;
      editingContent.value = message.content;

      nextTick(() => {
        if (editRichText.value) {
          editRichText.value.innerHTML = formatMessage(message.content);
          editRichText.value.focus();
        }
      });
    };

    const cancelEdit = () => {
      editingMessageId.value = null;
      editingContent.value = "";
    };

    const saveEdit = async () => {
      if (!editingMessageId.value || !editingContent.value.trim()) return;

      try {
        // TODO: Backend call
        const messageIndex = messages.value.findIndex(m => m.id === editingMessageId.value);
        if (messageIndex !== -1) {
          messages.value[messageIndex].content = editingContent.value;
          messages.value[messageIndex].isEdited = true;
        }

        cancelEdit();
        emit("show-toast", "Nachricht wurde bearbeitet", "success");
      } catch (error) {
        console.error("Fehler beim Bearbeiten der Nachricht:", error);
        emit("show-toast", "Fehler beim Bearbeiten der Nachricht", "error");
      }
    };

    const deleteMessage = async (message: ChatMessage) => {
      if (!confirm("Möchtest du diese Nachricht wirklich löschen?")) return;

      try {
        // TODO: Backend call
        const messageIndex = messages.value.findIndex(m => m.id === message.id);
        if (messageIndex !== -1) {
          messages.value[messageIndex].content = "Die Nachricht wurde gelöscht";
        }

        emit("show-toast", "Nachricht wurde gelöscht", "info");
      } catch (error) {
        console.error("Fehler beim Löschen der Nachricht:", error);
        emit("show-toast", "Fehler beim Löschen der Nachricht", "error");
      }
    };

    // Core functions
    const loadCurrentUser = () => {
      try {
        const userData = authService.getUserData();
        if (userData?.sub) {
          currentUserId.value = userData.sub;
        }
      } catch (error) {
        console.error("Fehler beim Laden der User-Daten:", error);
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
        console.error("Fehler beim Laden der Nachrichten:", error);
        messages.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
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
      isUserTyping.value = true;

      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      typingTimeout = setTimeout(() => {
        isUserTyping.value = false;
      }, 2000);
    };

    const sendMessage = async () => {
      const messageText = newMessage.value.trim();
      if (!messageText || isSending.value || !currentConversationId.value) return;

      isSending.value = true;
      isUserTyping.value = false;
      showEmojiPicker.value = false;

      if (typingTimeout) {
        clearTimeout(typingTimeout);
        typingTimeout = null;
      }

      try {
        const response = await chatService.sendMessage(currentConversationId.value, messageText);

        const localMessage: ChatMessage = {
          id: response.message.id || Date.now().toString(),
          conversationId: currentConversationId.value,
          senderId: currentUserId.value,
          content: messageText,
          messageType: "TEXT",
          attachmentUrl: null,
          isRead: true,
          isEdited: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        messages.value.push(localMessage);

        // Reset input
        newMessage.value = "";
        if (richTextInput.value) {
          richTextInput.value.innerHTML = "";
        }

        scrollToBottom();

        emit("send-message", {
          friendId: props.friendId,
          message: messageText,
        });

      } catch (error) {
        console.error("Fehler beim Senden der Nachricht:", error);
        emit("show-toast", "Fehler beim Senden der Nachricht", "error");
      } finally {
        isSending.value = false;
      }
    };

    const closeModal = () => {
      emit("update:isVisible", false);
    };

    const focusInput = () => {
      nextTick(() => {
        if (richTextInput.value) {
          richTextInput.value.focus();
        }
      });
    };

    // Watchers
    watch(
      () => props.isVisible,
      (visible) => {
        if (visible) {
          loadCurrentUser();
          loadMessages();
          focusInput();
        } else {
          messages.value = [];
          currentConversationId.value = "";
          newMessage.value = "";
          isTyping.value = false;
          isUserTyping.value = false;
          showEmojiPicker.value = false;
          cancelEdit();

          if (typingTimeout) {
            clearTimeout(typingTimeout);
            typingTimeout = null;
          }
        }
      }
    );

    watch(
      () => props.friendId,
      () => {
        if (props.isVisible && props.friendId) {
          loadMessages();
        }
      }
    );

    // Keyboard shortcuts
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (editingMessageId.value) {
          cancelEdit();
        } else if (showEmojiPicker.value) {
          showEmojiPicker.value = false;
        } else if (props.isVisible) {
          closeModal();
        }
      }
    };

    onMounted(() => {
      document.addEventListener("keydown", handleGlobalKeyDown);
      loadCurrentUser();
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handleGlobalKeyDown);

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
      richTextInput,
      editRichText,
      showEmojiPicker,
      editingMessageId,
      editingContent,
      popularEmojis,
      getInitials,
      formatTime,
      isOwnMessage,
      formatMessage,
      isFormatActive,
      applyFormatting,
      insertEmoji,
      toggleEmojiPicker,
      handleRichTextInput,
      handleEditInput,
      handleKeydown,
      handlePaste,
      startEdit,
      cancelEdit,
      saveEdit,
      deleteMessage,
      handleTyping,
      sendMessage,
      closeModal,
    };
  },
});
</script>

// Verbesserte responsive Styles für das Chat-Modal
// Ersetzen Sie den bestehenden Style-Block mit diesem Code

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;
@use "@/style/base/animations" as animations;

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: map.get(vars.$spacing, m);

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background: rgba(mixins.theme-color($theme, primary-bg), 0.8);
    }
  }

  // Mobile: Vollbild ohne Padding
  @media (max-width: 640px) {
    padding: 0;
    align-items: stretch;
    justify-content: stretch;
  }

  // Tablet: Reduziertes Padding
  @media (min-width: 641px) and (max-width: 1024px) {
    padding: map.get(vars.$spacing, s);
  }
}

.modal-content {
  // Desktop: Große, feste Größe
  width: 100%;
  max-width: 1200px;
  height: 80vh;
  max-height: 800px;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  border-radius: 24px;
  overflow: hidden;
  @include animations.fade-in(0.3s);

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, card-bg);
      border: 1px solid mixins.theme-color($theme, border-light);
      @include mixins.shadow("large", $theme);
    }
  }

  // Mobile: Vollbild-Layout
  @media (max-width: 640px) {
    width: 100vw;
    height: 100vh;
    max-width: none;
    max-height: none;
    min-height: 100vh;
    border-radius: 0;

    // Mindestbreite für sehr kleine Geräte
    min-width: 370px;
  }

  // Tablet: Angepasste Größe
  @media (min-width: 641px) and (max-width: 1024px) {
    width: 95vw;
    height: 85vh;
    max-width: 600px;
    max-height: 700px;
    min-height: 500px;
    border-radius: 16px;
  }

  // Große Desktop-Bildschirme
  @media (min-width: 1400px) {
    max-width: 1400px;
    max-height: 900px;
  }
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: map.get(vars.$spacing, l);
  border-bottom: 1px solid;
  flex-shrink: 0;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, secondary-bg);
      border-color: mixins.theme-color($theme, border-light);
    }
  }

  // Mobile: Kompakterer Header
  @media (max-width: 640px) {
    padding: map.get(vars.$spacing, m) map.get(vars.$spacing, s);
    min-height: 60px;
  }

  // Tablet: Mittlere Größe
  @media (min-width: 641px) and (max-width: 1024px) {
    padding: map.get(vars.$spacing, m);
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: map.get(vars.$spacing, m);
    min-width: 0; // Ermöglicht Text-Overflow

    // Mobile: Weniger Gap
    @media (max-width: 640px) {
      gap: map.get(vars.$spacing, s);
    }

    .avatar {
      position: relative;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, primary);
        }
      }

      // Mobile: Kleinerer Avatar
      @media (max-width: 640px) {
        width: 36px;
        height: 36px;
      }

      .avatar-text {
        font-size: map.get(map.get(vars.$fonts, sizes), medium);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        color: white;

        // Mobile: Kleinere Schrift
        @media (max-width: 640px) {
          font-size: map.get(map.get(vars.$fonts, sizes), small);
        }
      }

      .online-status {
        position: absolute;
        bottom: 2px;
        right: 2px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: #4caf50;
        border: 2px solid white;

        // Mobile: Kleinerer Indikator
        @media (max-width: 640px) {
          width: 10px;
          height: 10px;
          border-width: 1px;
        }
      }
    }

    .user-details {
      min-width: 0; // Für Text-Overflow
      flex: 1;

      .user-name {
        font-size: map.get(map.get(vars.$fonts, sizes), large);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }

        // Mobile: Kleinere Schrift
        @media (max-width: 640px) {
          font-size: map.get(map.get(vars.$fonts, sizes), medium);
        }
      }

      .user-status {
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }

        // Mobile: Noch kleinere Schrift
        @media (max-width: 640px) {
          font-size: map.get(map.get(vars.$fonts, sizes), xs);
        }
      }
    }
  }

  .close-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
    flex-shrink: 0;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background-color: transparent;
        color: mixins.theme-color($theme, text-secondary);

        &:hover {
          background-color: mixins.theme-color($theme, hover-color);
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    // Mobile: Kleinerer Button
    @media (max-width: 640px) {
      width: 32px;
      height: 32px;
    }

    .close-icon {
      width: 20px;
      height: 20px;
      position: absolute;

      // Mobile: Kleineres Icon
      @media (max-width: 640px) {
        width: 18px;
        height: 18px;
      }
    }
  }
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: map.get(vars.$spacing, s);
  position: relative;
  min-height: 0; // Wichtig für Flex-Layout

  // Mobile: Weniger Padding
  @media (max-width: 640px) {
    padding: map.get(vars.$spacing, xs);
  }

  // Texturierter Hintergrund wie WhatsApp/Telegram
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.03;
    z-index: 0;
    background-image:
      radial-gradient(circle at 20% 50%, rgba(120, 120, 120, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(120, 120, 120, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 80%, rgba(120, 120, 120, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 60% 30%, rgba(120, 120, 120, 0.2) 0%, transparent 50%);
    background-size: 200px 200px, 150px 150px, 180px 180px, 220px 220px;
    background-position: 0 0, 50px 50px, 100px 25px, 150px 75px;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        @if $theme =='dark' {
          background-image:
            radial-gradient(circle at 20% 50%, rgba(200, 200, 200, 0.02) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(200, 200, 200, 0.02) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(200, 200, 200, 0.02) 0%, transparent 50%),
            radial-gradient(circle at 60% 30%, rgba(200, 200, 200, 0.01) 0%, transparent 50%);
        }

        @else {
          background-image:
            radial-gradient(circle at 20% 50%, rgba(120, 120, 120, 0.04) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(120, 120, 120, 0.04) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(120, 120, 120, 0.04) 0%, transparent 50%),
            radial-gradient(circle at 60% 30%, rgba(120, 120, 120, 0.03) 0%, transparent 50%);
        }
      }
    }
  }

  // Alle Child-Elemente über dem Hintergrund
  >* {
    position: relative;
    z-index: 1;
  }

  &::-webkit-scrollbar {
    width: 6px;

    // Mobile: Dünnere Scrollbar
    @media (max-width: 640px) {
      width: 3px;
    }
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, border-medium);
        border-radius: 3px;
      }
    }
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: map.get(vars.$spacing, xl);
    gap: map.get(vars.$spacing, m);

    // Mobile: Weniger Padding
    @media (max-width: 640px) {
      padding: map.get(vars.$spacing, l);
    }

    .loading-spinner {
      width: 24px;
      height: 24px;
      border: 2px solid;
      border-radius: 50%;
      animation: spin 1s linear infinite;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          border-color: mixins.theme-color($theme, border-light);
          border-top-color: mixins.theme-color($theme, accent-teal);
        }
      }
    }

    span {
      font-size: map.get(map.get(vars.$fonts, sizes), small);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: map.get(vars.$spacing, xxl);
    text-align: center;

    // Mobile: Weniger Padding
    @media (max-width: 640px) {
      padding: map.get(vars.$spacing, xl);
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: map.get(vars.$spacing, m);
      opacity: 0.6;

      // Mobile: Kleineres Icon
      @media (max-width: 640px) {
        font-size: 36px;
      }
    }

    p {
      margin: map.get(vars.$spacing, xs) 0;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }

      &:first-of-type {
        font-weight: map.get(map.get(vars.$fonts, weights), medium);

        @each $theme in ("light", "dark") {
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
    gap: map.get(vars.$spacing, s);
    padding: map.get(vars.$spacing, s);

    // Mobile: Weniger Padding und Gap
    @media (max-width: 640px) {
      padding: map.get(vars.$spacing, xs);
      gap: map.get(vars.$spacing, xs);
    }

    .message-wrapper {
      display: flex;
      flex-direction: column;
      max-width: 75%;

      // Mobile: Größere maximale Breite
      @media (max-width: 640px) {
        max-width: 85%;
      }

      // Tablet: Mittlere Breite
      @media (min-width: 641px) and (max-width: 1024px) {
        max-width: 80%;
      }

      &.own-message {
        align-self: flex-end;

        .message-bubble {
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
                background-color: darken(mixins.theme-color($theme, accent-teal), 10%);
              color: white;
            }
          }
        }
      }

      &.friend-message {
        align-self: flex-start;

        .message-bubble {
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, primary-bg);
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }
      }

      .edit-container {
        display: flex;
        flex-direction: column;
        gap: map.get(vars.$spacing, s);

        .edit-input {
          padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);
          border-radius: 18px;
          min-height: 40px;
          max-height: 120px;
          overflow-y: auto;
          outline: none;
          font-size: map.get(map.get(vars.$fonts, sizes), medium);
          line-height: 1.4;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, hover-color);
              color: mixins.theme-color($theme, text-primary);
              border: 2px solid mixins.theme-color($theme, accent-teal);
            }
          }

          // Mobile: Kompakterer Edit-Input
          @media (max-width: 640px) {
            padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, s);
            font-size: map.get(map.get(vars.$fonts, sizes), small);
            min-height: 36px;
            max-height: 100px;
            border-radius: 16px;
          }
        }

        .edit-actions {
          display: flex;
          gap: map.get(vars.$spacing, xs);
          justify-content: flex-end;

          .edit-btn {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;

            // Mobile: Kleinere Buttons
            @media (max-width: 640px) {
              width: 28px;
              height: 28px;
            }

            .btn-icon {
              width: 16px;
              height: 16px;

              // Mobile: Kleinere Icons
              @media (max-width: 640px) {
                width: 14px;
                height: 14px;
              }
            }

            &.cancel {
              @each $theme in ("light", "dark") {
                .theme-#{$theme} & {
                  background-color: mixins.theme-color($theme, secondary-bg);
                  color: mixins.theme-color($theme, text-secondary);

                  &:hover {
                    background-color: mixins.theme-color($theme, hover-color);
                  }
                }
              }
            }

            &.save {
              @each $theme in ("light", "dark") {
                .theme-#{$theme} & {
                  background-color: mixins.theme-color($theme, accent-teal);
                  color: white;

                  &:hover:not(:disabled) {
                    background-color: darken(mixins.theme-color($theme, accent-teal), 10%);
                  }

                  &:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                  }
                }
              }
            }
          }
        }
      }

      .message-bubble {
        padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);
        border-radius: 18px;
        position: relative;
        transition: all 0.2s ease;

        // Mobile: Kompakteres Padding
        @media (max-width: 640px) {
          padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, s);
          border-radius: 16px;
        }

        .deleted-message {
          display: flex;
          align-items: center;
          gap: map.get(vars.$spacing, xs);
          font-style: italic;
          opacity: 0.6;

          .deleted-icon {
            width: 14px;
            height: 14px;

            // Mobile: Kleineres Icon
            @media (max-width: 640px) {
              width: 12px;
              height: 12px;
            }
          }
        }

        .message-text {
          font-size: map.get(map.get(vars.$fonts, sizes), medium);
          line-height: 1.4;
          word-wrap: break-word;

          // Mobile: Kleinere Schrift
          @media (max-width: 640px) {
            font-size: map.get(map.get(vars.$fonts, sizes), small);
            line-height: 1.5;
          }

          :deep(strong) {
            font-weight: map.get(map.get(vars.$fonts, weights), bold);
          }

          :deep(em) {
            font-style: italic;
          }

          :deep(u) {
            text-decoration: underline;
          }
        }

        .attachment {
          margin-top: map.get(vars.$spacing, s);
          padding: map.get(vars.$spacing, s);
          border-radius: 12px;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background-color: rgba(255, 255, 255, 0.1);
            }
          }

          // Mobile: Kompakterer Attachment
          @media (max-width: 640px) {
            margin-top: map.get(vars.$spacing, xs);
            padding: map.get(vars.$spacing, xs);
            border-radius: 8px;
          }

          a {
            color: inherit;
            text-decoration: none;
            font-size: map.get(map.get(vars.$fonts, sizes), small);

            // Mobile: Kleinere Schrift
            @media (max-width: 640px) {
              font-size: map.get(map.get(vars.$fonts, sizes), xs);
            }

            &:hover {
              text-decoration: underline;
            }
          }
        }

        .message-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: map.get(vars.$spacing, xs);
          gap: map.get(vars.$spacing, s);

          // Mobile: Weniger Gap
          @media (max-width: 640px) {
            gap: map.get(vars.$spacing, xs);
            margin-top: 2px;
          }

          .edited-label {
            font-size: map.get(map.get(vars.$fonts, sizes), xs);
            opacity: 0.7;

            // Mobile: Noch kleinere Schrift
            @media (max-width: 640px) {
              font-size: 10px;
            }
          }

          .message-time {
            font-size: map.get(map.get(vars.$fonts, sizes), xs);
            opacity: 0.7;

            // Mobile: Noch kleinere Schrift
            @media (max-width: 640px) {
              font-size: 10px;
            }
          }

          .message-actions {
            display: flex;
            gap: map.get(vars.$spacing, xxs);
            opacity: 0;
            transition: opacity 0.2s ease;

            // Mobile: Immer sichtbar für bessere Zugänglichkeit
            @media (max-width: 640px) {
              opacity: 0.7;
            }

            .action-btn {
              width: 24px;
              height: 24px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              border: none;
              cursor: pointer;
              transition: all 0.2s ease;

              @each $theme in ("light", "dark") {
                .theme-#{$theme} & {
                  background-color: rgba(0, 0, 0, 0.1);
                  color: rgba(255, 255, 255, 0.8);

                  &:hover {
                    background-color: rgba(0, 0, 0, 0.2);
                    color: white;
                  }
                }
              }

              // Mobile: Größere Touch-Targets
              @media (max-width: 640px) {
                width: 28px;
                height: 28px;
              }

              .action-icon {
                width: 12px;
                height: 12px;
                position: absolute;

                // Mobile: Etwas größere Icons
                @media (max-width: 640px) {
                  width: 14px;
                  height: 14px;
                }
              }
            }
          }
        }

        &:hover .message-actions {
          opacity: 1;
        }
      }
    }

    .typing-indicator {
      align-self: flex-start;
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, s);
      padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);
      border-radius: 18px;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
        }
      }

      // Mobile: Kompakterer Typing-Indikator
      @media (max-width: 640px) {
        padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, s);
        gap: map.get(vars.$spacing, xs);
        border-radius: 16px;
      }

      &.own-typing {
        align-self: flex-end;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: rgba(mixins.theme-color($theme, accent-teal), 0.1);
            border: 1px solid rgba(mixins.theme-color($theme, accent-teal), 0.2);
          }
        }

        .typing-text {
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, accent-teal);
              font-style: italic;
            }
          }
        }
      }

      .typing-dots {
        display: flex;
        gap: 3px;

        span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #888;
          animation: typing 1.4s infinite;

          // Mobile: Kleinere Dots
          @media (max-width: 640px) {
            width: 5px;
            height: 5px;
          }

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

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }

        // Mobile: Kleinere Schrift
        @media (max-width: 640px) {
          font-size: map.get(map.get(vars.$fonts, sizes), xs);
        }
      }
    }
  }
}

.emoji-picker {
  position: absolute;
  bottom: 120px;
  right: map.get(vars.$spacing, m);
  width: 300px;
  height: 240px;
  border-radius: 16px;
  z-index: 10;
  @include animations.fade-in(0.2s);

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, card-bg);
      border: 1px solid mixins.theme-color($theme, border-light);
      @include mixins.shadow("large", $theme);
    }
  }

  // Mobile: Vollbreite am unteren Rand
  @media (max-width: 640px) {
    left: map.get(vars.$spacing, s);
    right: map.get(vars.$spacing, s);
    bottom: 140px;
    width: auto;
    height: 280px;
    border-radius: 12px;
  }

  // Tablet: Angepasste Größe
  @media (min-width: 641px) and (max-width: 1024px) {
    width: 350px;
    height: 260px;
    bottom: 130px;
  }

  .emoji-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: map.get(vars.$spacing, m);
    border-bottom: 1px solid;
    flex-shrink: 0;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        border-color: mixins.theme-color($theme, border-light);
      }
    }

    // Mobile: Weniger Padding
    @media (max-width: 640px) {
      padding: map.get(vars.$spacing, s);
    }

    span {
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      font-size: map.get(map.get(vars.$fonts, sizes), small);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }

      // Mobile: Kleinere Schrift
      @media (max-width: 640px) {
        font-size: map.get(map.get(vars.$fonts, sizes), xs);
      }
    }

    .emoji-close {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: transparent;
          color: mixins.theme-color($theme, text-secondary);

          &:hover {
            background-color: mixins.theme-color($theme, secondary-bg);
          }
        }
      }

      .close-icon {
        width: 14px;
        height: 14px;
      }
    }
  }

  .emoji-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 4px;
    padding: map.get(vars.$spacing, s);
    height: calc(100% - 60px);
    overflow-y: auto;

    // Mobile: Mehr Spalten für bessere Nutzung des Platzes
    @media (max-width: 640px) {
      grid-template-columns: repeat(8, 1fr);
      gap: 2px;
      padding: map.get(vars.$spacing, xs);
    }

    // Tablet: Angepasste Spaltenanzahl
    @media (min-width: 641px) and (max-width: 1024px) {
      grid-template-columns: repeat(7, 1fr);
    }

    .emoji-btn {
      width: 44px;
      height: 44px;
      border: none;
      background: none;
      cursor: pointer;
      border-radius: 12px;
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      // Mobile: Kleinere Buttons
      @media (max-width: 640px) {
        width: 36px;
        height: 36px;
        font-size: 20px;
        border-radius: 8px;
      }

      // Tablet: Mittlere Größe
      @media (min-width: 641px) and (max-width: 1024px) {
        width: 40px;
        height: 40px;
        font-size: 22px;
      }

      &:hover {
        transform: scale(1.15);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, hover-color);
          }
        }

        // Mobile: Weniger Scale für Touch-Geräte
        @media (max-width: 640px) {
          transform: scale(1.1);
        }
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }
}

.input-area {
  flex-shrink: 0;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, secondary-bg);
      border-top: 1px solid mixins.theme-color($theme, border-light);
    }
  }

  .formatting-toolbar {
    display: flex;
    align-items: center;
    gap: map.get(vars.$spacing, s);
    padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);
    overflow-x: auto;

    // Mobile: Kompaktere Toolbar
    @media (max-width: 640px) {
      padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, s);
      gap: map.get(vars.$spacing, xs);
    }

    .format-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: transparent;
          color: mixins.theme-color($theme, text-secondary);

          &:hover,
          &.active {
            background-color: mixins.theme-color($theme, hover-color);
            color: mixins.theme-color($theme, text-primary);
          }

          &.active {
            background-color: mixins.theme-color($theme, accent-teal);
            color: white;
          }
        }
      }

      // Mobile: Kleinere Buttons
      @media (max-width: 640px) {
        width: 28px;
        height: 28px;
        border-radius: 6px;
      }

      .format-icon {
        font-size: 14px;

        // Mobile: Kleinere Icons
        @media (max-width: 640px) {
          font-size: 12px;
        }

        &.bold {
          font-weight: 900;
        }

        &.italic {
          font-style: italic;
        }

        &.underline {
          text-decoration: underline;
        }
      }

      &.emoji-btn {
        font-size: 16px;

        // Mobile: Kleineres Emoji
        @media (max-width: 640px) {
          font-size: 14px;
        }
      }
    }

    .divider {
      width: 1px;
      height: 20px;
      flex-shrink: 0;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, border-light);
        }
      }

      // Mobile: Kürzere Divider
      @media (max-width: 640px) {
        height: 16px;
      }
    }
  }

  .input-form {
    display: flex;
    align-items: flex-end;
    gap: map.get(vars.$spacing, s);
    padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);

    // Mobile: Kompakteres Form
    @media (max-width: 640px) {
      padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, s);
      gap: map.get(vars.$spacing, xs);
    }

    .input-wrapper {
      flex: 1;
      min-width: 0; // Für Flex-Layout

      .rich-input {
        width: 100%;
        min-height: 40px;
        max-height: 100px;
        padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);
        border-radius: 20px;
        font-size: map.get(map.get(vars.$fonts, sizes), medium);
        line-height: 1.4;
        overflow-y: auto;
        outline: none;
        word-wrap: break-word;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, hover-color);
            color: mixins.theme-color($theme, text-primary);
            border: 1px solid mixins.theme-color($theme, border-light);

            &:focus {
              border-color: mixins.theme-color($theme, accent-teal);
            }

            &:empty:before {
              content: attr(data-placeholder);
              color: mixins.theme-color($theme, text-secondary);
              pointer-events: none;
            }
          }
        }

        // Mobile: Kompakterer Input
        @media (max-width: 640px) {
          min-height: 36px;
          max-height: 80px;
          padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, s);
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          border-radius: 18px;
        }

        // Rich text formatting
        :deep(strong) {
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
        }

        :deep(em) {
          font-style: italic;
        }

        :deep(u) {
          text-decoration: underline;
        }

        &::-webkit-scrollbar {
          width: 4px;
        }

        &::-webkit-scrollbar-track {
          background: transparent;
        }

        &::-webkit-scrollbar-thumb {
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, border-medium);
              border-radius: 2px;
            }
          }
        }
      }
    }

    .send-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, primary);
          color: white;

          &:hover:not(:disabled) {
            transform: scale(1.05);
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
          }
        }
      }

      // Mobile: Kompakterer Send-Button
      @media (max-width: 640px) {
        width: 36px;
        height: 36px;
      }

      .send-icon {
        width: 18px;
        height: 18px;

        // Mobile: Kleineres Icon
        @media (max-width: 640px) {
          width: 16px;
          height: 16px;
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

  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }

  30% {
    transform: translateY(-6px);
    opacity: 1;
  }
}

// Spezielle Behandlung für sehr kleine Bildschirme (370px Minimum)
@media (max-width: 380px) {
  .modal-content {
    min-width: 370px;
    overflow-x: auto; // Falls Content zu breit wird
  }

  .chat-header {
    .user-info {
      .user-details {
        .user-name {
          font-size: map.get(map.get(vars.$fonts, sizes), small);
        }

        .user-status {
          font-size: 10px;
        }
      }
    }
  }

  .messages-container {
    .messages-list {
      .message-wrapper {
        max-width: 90%;

        .message-bubble {
          .message-text {
            font-size: 12px;
          }

          .message-footer {

            .message-time,
            .edited-label {
              font-size: 9px;
            }
          }
        }
      }
    }
  }

  .emoji-picker {
    .emoji-grid {
      grid-template-columns: repeat(7, 1fr);

      .emoji-btn {
        width: 32px;
        height: 32px;
        font-size: 18px;
      }
    }
  }

  .input-area {
    .formatting-toolbar {
      .format-btn {
        width: 26px;
        height: 26px;

        .format-icon {
          font-size: 10px;
        }

        &.emoji-btn {
          font-size: 12px;
        }
      }
    }

    .input-form {
      .input-wrapper {
        .rich-input {
          font-size: 12px;
          min-height: 32px;
          max-height: 70px;
          padding: 6px 12px;
        }
      }

      .send-btn {
        width: 32px;
        height: 32px;

        .send-icon {
          width: 14px;
          height: 14px;
        }
      }
    }
  }
}

// Landscape-Modus für Mobile
@media (max-width: 640px) and (orientation: landscape) {
  .modal-content {
    height: 100vh;
    max-height: none;
  }

  .messages-container {
    // Mehr Platz für Nachrichten im Landscape-Modus
    min-height: 200px;
  }

  .emoji-picker {
    height: 200px;
    bottom: 120px;
  }
}

// High-DPI Displays
@media (-webkit-min-device-pixel-ratio: 2),
(min-resolution: 192dpi) {
  .modal-content {

    // Schärfere Schatten für High-DPI
    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        @include mixins.shadow("large", $theme);
      }
    }
  }
}

// Hover-Unterstützung (Desktop)
@media (hover: hover) and (pointer: fine) {
  .message-wrapper .message-bubble .message-footer .message-actions {
    opacity: 0;

    .message-wrapper:hover & {
      opacity: 1;
    }
  }
}

// Touch-Geräte (bessere Touch-Targets)
@media (hover: none) and (pointer: coarse) {
  .message-wrapper .message-bubble .message-footer .message-actions {
    opacity: 0.7;
  }

  .format-btn,
  .action-btn,
  .edit-btn,
  .emoji-btn,
  .send-btn,
  .close-btn {
    min-height: 44px; // iOS HIG empfohlene Mindestgröße
    min-width: 44px;
  }
}
</style>