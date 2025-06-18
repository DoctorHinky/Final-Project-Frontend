<!-- src/components/pages/DashboardPages/Notifications.vue -->
<template>
  <div class="notifications-dashboard">
    <div class="page-header">
      <h2>Benachrichtigungen</h2>
      <p>Bleibe über wichtige Aktivitäten und Neuigkeiten informiert</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Benachrichtigungen werden geladen...</p>
    </div>

    <!-- Main Content -->
    <template v-else>
      <!-- Statistik-Karten -->
      <notification-stats :unread-count="unreadCount" :total-count="totalCount" />

      <!-- Filter-Optionen -->
      <notification-filters
        :filters="filters"
        :active-filter="activeFilter"
        :has-unread="hasUnread"
        :has-notifications="hasNotifications"
        @update:active-filter="activeFilter = $event"
        @mark-all-read="markAllAsRead"
        @clear-all="clearAllNotifications"
      />

      <!-- Benachrichtigungsliste oder Leerer Zustand -->
      <notifications-list
        v-if="filteredNotifications.length > 0"
        :notifications="filteredNotifications"
        @mark-read="markAsRead"
        @delete="deleteNotification"
      />
      <empty-state v-else :active-filter="activeFilter" @update:active-filter="activeFilter = $event" />
    </template>

    <!-- Einstellungen-Link -->
    <div class="notification-settings" v-if="!isLoading">
      <button @click="showSettings = true" class="settings-button">
        <span class="settings-icon">⚙️</span>
        Benachrichtigungseinstellungen anpassen
      </button>
    </div>

    <!-- Einstellungs-Modal -->
    <settings-modal
      :show-modal="showSettings"
      :settings="notificationSettings"
      @close="showSettings = false"
      @save="saveSettings"
    />

    <!-- Bestätigungsdialog -->
    <confirm-dialog
      :show="showConfirmDialog"
      :title="confirmDialogTitle"
      :message="confirmDialogMessage"
      :action-text="confirmDialogAction"
      @confirm="confirmAction"
      @cancel="cancelAction"
    />

    <!-- Error Toast -->
    <div v-if="errorMessage" class="error-toast" @click="errorMessage = ''">
      <span class="error-icon">❌</span>
      <span class="error-text">{{ errorMessage }}</span>
    </div>

    <!-- Success Toast -->
    <div v-if="successMessage" class="success-toast" @click="successMessage = ''">
      <span class="success-icon">✅</span>
      <span class="success-text">{{ successMessage }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from "vue";

// Import der modularen Komponenten
import {
  NotificationStats,
  NotificationFilters,
  NotificationsList,
  EmptyState,
  SettingsModal,
  ConfirmDialog,
} from "@/components/pages/DashboardPages/Notifications";

// 🔔 API Service Import
import { notificationService } from "@/services/notification.service";
import type { 
  NotificationDisplay,
  NotificationSetting,
  NotificationFilter,
  NotificationType,
  NotificationTypeMap
} from "@/types/dtos/Notification.types";

export default defineComponent({
  name: "NotificationsDashboard",
  components: {
    NotificationStats,
    NotificationFilters,
    NotificationsList,
    EmptyState,
    SettingsModal,
    ConfirmDialog,
  },
  setup() {
    // 🔔 STATE MANAGEMENT
    const isLoading = ref(true);
    const errorMessage = ref("");
    const successMessage = ref("");
    const activeFilter = ref("all");
    const showSettings = ref(false);
    const showConfirmDialog = ref(false);
    const confirmDialogTitle = ref("");
    const confirmDialogMessage = ref("");
    const confirmDialogAction = ref("");
    const pendingAction = ref<(() => void) | null>(null);

    // 🔔 NOTIFICATION DATA
    const notifications = ref<NotificationDisplay[]>([]);

    // Filter-Optionen - initialisiert mit Typen aus dem Schema
    const filters = ref<NotificationFilter[]>([
      { id: "all", name: "Alle", count: 0 },
      { id: "unread", name: "Ungelesen", count: 0 },
      { id: "FRIEND_REQUEST", name: "Freunde", count: 0 },
      { id: "COMMENT", name: "Kommentare", count: 0 },
      { id: "APPLICATION_STATUS_CHANGE", name: "Bewerbungen", count: 0 },
      { id: "TICKET_UPDATE", name: "Tickets", count: 0 },
      { id: "SYSTEM", name: "System", count: 0 },
    ]);

    // Benachrichtigungseinstellungen
    const notificationSettings = ref<NotificationSetting[]>([
      {
        id: "email_notifications",
        name: "E-Mail-Benachrichtigungen",
        description: "Erhalte wichtige Benachrichtigungen per E-Mail.",
        enabled: true,
      },
      {
        id: "browser_notifications",
        name: "Browser-Benachrichtigungen",
        description: "Erlaube Benachrichtigungen im Browser.",
        enabled: false,
      },
      {
        id: "friend_requests",
        name: "Freundschaftsanfragen",
        description: "Benachrichtigungen für neue Freundschaftsanfragen.",
        enabled: true,
      },
      {
        id: "comment_notifications",
        name: "Kommentar-Benachrichtigungen",
        description: "Benachrichtigungen für Kommentare auf deine Artikel oder Beiträge.",
        enabled: true,
      },
      {
        id: "application_updates",
        name: "Bewerbungsupdates",
        description: "Statusänderungen bei Autor-Bewerbungen.",
        enabled: true,
      },
      {
        id: "system_announcements",
        name: "Systemankündigungen",
        description: "Wichtige Ankündigungen zu Neuerungen und Updates.",
        enabled: true,
      },
    ]);

    // 🔔 COMPUTED PROPERTIES
    const filteredNotifications = computed(() => {
      return notificationService.filterByType(notifications.value, activeFilter.value);
    });

    const unreadCount = computed(() => {
      return notifications.value.filter(n => !n.isRead).length;
    });

    const totalCount = computed(() => {
      return notifications.value.length;
    });

    const hasUnread = computed(() => {
      return unreadCount.value > 0;
    });

    const hasNotifications = computed(() => {
      return totalCount.value > 0;
    });

    // 🔔 UTILITY FUNCTIONS
    const updateFilterCounts = () => {
      const stats = notificationService.getNotificationStats(notifications.value);
      
      filters.value.forEach((filter) => {
        if (filter.id === "all") {
          filter.count = stats.total;
        } else if (filter.id === "unread") {
          filter.count = stats.unread;
        } else {
          filter.count = stats.byType[filter.id] || 0;
        }
      });
    };

    const showSuccess = (message: string) => {
      successMessage.value = message;
      setTimeout(() => {
        successMessage.value = "";
      }, 3000);
    };

    const showError = (message: string) => {
      errorMessage.value = message;
      setTimeout(() => {
        errorMessage.value = "";
      }, 5000);
    };

    // 🔔 API FUNCTIONS
    const loadNotifications = async () => {
      try {
        isLoading.value = true;
        notifications.value = await notificationService.getNotificationsCached();
        updateFilterCounts();
      } catch (error) {
        console.error("Fehler beim Laden der Benachrichtigungen:", error);
        showError("Benachrichtigungen konnten nicht geladen werden.");
      } finally {
        isLoading.value = false;
      }
    };

    const markAsRead = async (notificationId: string) => {
      try {
        await notificationService.markAsRead(notificationId);
        
        // Lokale Update
        const notification = notifications.value.find(n => n.id === notificationId);
        if (notification) {
          notification.isRead = true;
          updateFilterCounts();
          showSuccess("Benachrichtigung wurde als gelesen markiert.");
        }
      } catch (error) {
        console.error("Fehler beim Markieren als gelesen:", error);
        showError("Benachrichtigung konnte nicht als gelesen markiert werden.");
      }
    };

    const markAllAsRead = () => {
      confirmDialog(
        "Alle als gelesen markieren",
        "Möchtest du wirklich alle Benachrichtigungen als gelesen markieren?",
        "Alle markieren",
        async () => {
          try {
            await notificationService.markAllAsRead();
            
            // Lokale Updates
            notifications.value.forEach(notification => {
              notification.isRead = true;
            });
            updateFilterCounts();
            showSuccess("Alle Benachrichtigungen wurden als gelesen markiert.");
          } catch (error) {
            console.error("Fehler beim Markieren aller als gelesen:", error);
            showError("Benachrichtigungen konnten nicht als gelesen markiert werden.");
          }
        }
      );
    };

    const deleteNotification = (notificationId: string) => {
      const notification = notifications.value.find(n => n.id === notificationId);
      if (notification) {
        confirmDialog(
          "Benachrichtigung löschen",
          `Möchtest du wirklich die Benachrichtigung "${notification.title}" löschen?`,
          "Löschen",
          async () => {
            try {
              await notificationService.deleteNotification(notificationId);
              
              // Lokale Entfernung
              const index = notifications.value.findIndex(n => n.id === notificationId);
              if (index !== -1) {
                notifications.value.splice(index, 1);
                updateFilterCounts();
                showSuccess("Benachrichtigung wurde gelöscht.");
              }
            } catch (error) {
              console.error("Fehler beim Löschen der Benachrichtigung:", error);
              showError("Benachrichtigung konnte nicht gelöscht werden.");
            }
          }
        );
      }
    };

    const clearAllNotifications = () => {
      confirmDialog(
        "Alle Benachrichtigungen löschen",
        "Möchtest du wirklich alle Benachrichtigungen löschen? Dies kann nicht rückgängig gemacht werden.",
        "Alle löschen",
        async () => {
          try {
            await notificationService.deleteAllNotifications();
            
            // Lokale Bereinigung
            notifications.value = [];
            updateFilterCounts();
            showSuccess("Alle Benachrichtigungen wurden gelöscht.");
          } catch (error) {
            console.error("Fehler beim Löschen aller Benachrichtigungen:", error);
            showError("Benachrichtigungen konnten nicht gelöscht werden.");
          }
        }
      );
    };

    // 🔔 SETTINGS FUNCTIONS
    const saveSettings = (settings: NotificationSetting[]) => {
      // Hier würden die Einstellungen an den Server gesendet
      notificationSettings.value = [...settings];
      showSettings.value = false;
      showSuccess("Einstellungen wurden gespeichert!");
    };

    // 🔔 DIALOG FUNCTIONS
    const confirmDialog = (title: string, message: string, actionText: string, action: () => void) => {
      confirmDialogTitle.value = title;
      confirmDialogMessage.value = message;
      confirmDialogAction.value = actionText;
      pendingAction.value = action;
      showConfirmDialog.value = true;
    };

    const confirmAction = () => {
      if (pendingAction.value) {
        pendingAction.value();
        pendingAction.value = null;
      }
      showConfirmDialog.value = false;
    };

    const cancelAction = () => {
      pendingAction.value = null;
      showConfirmDialog.value = false;
    };

    // 🔔 LIFECYCLE HOOKS
    onMounted(async () => {
      console.log("🔔 Notifications Dashboard initialisiert");
      await loadNotifications();
    });

    onUnmounted(() => {
      console.log("🔔 Notifications Dashboard bereinigt");
    });

    // 🔔 REACTIVE UPDATES
    // Watch für Filter-Änderungen
    watch(activeFilter, () => {
      console.log(`Filter geändert zu: ${activeFilter.value}`);
    });

    // Event-Listener für Echtzeit-Updates
    const handleNotificationUpdate = () => {
      console.log("🔔 Echtzeit-Update empfangen, lade Benachrichtigungen neu");
      loadNotifications();
    };

    onMounted(() => {
      if (typeof window !== "undefined") {
        window.addEventListener("notification-count-updated", handleNotificationUpdate);
      }
    });

    onUnmounted(() => {
      if (typeof window !== "undefined") {
        window.removeEventListener("notification-count-updated", handleNotificationUpdate);
      }
    });

    return {
      // State
      isLoading,
      errorMessage,
      successMessage,
      activeFilter,
      filters,
      notifications,
      filteredNotifications,
      unreadCount,
      totalCount,
      hasUnread,
      hasNotifications,
      showSettings,
      notificationSettings,
      showConfirmDialog,
      confirmDialogTitle,
      confirmDialogMessage,
      confirmDialogAction,

      // Methods
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAllNotifications,
      saveSettings,
      confirmAction,
      cancelAction,
      loadNotifications, // Für manuelle Aktualisierung
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;
@use "@/style/base/animations" as animations;

.notifications-dashboard {
  @include animations.fade-in(0.5s);
  display: flex;
  flex-direction: column;
  gap: map.get(vars.$spacing, l);
  width: 100%;
  margin: 0 auto;
  padding: 0 map.get(vars.$spacing, m);

  @media (max-width: 768px) {
    padding: 0 map.get(vars.$spacing, s);
  }

  .page-header {
    margin-bottom: map.get(vars.$spacing, l);

    h2 {
      font-size: map.get(map.get(vars.$fonts, sizes), xxl);
      font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
      margin-bottom: map.get(vars.$spacing, xs);

      @media (max-width: 576px) {
        font-size: map.get(map.get(vars.$fonts, sizes), xl);
      }

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
          transition: all 0.4s ease-out;
        }
      }
    }

    p {
      font-size: map.get(map.get(vars.$fonts, sizes), medium);

      @media (max-width: 576px) {
        font-size: map.get(map.get(vars.$fonts, sizes), small);
      }

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
          transition: all 0.4s ease-out;
        }
      }
    }
  }

  // 🔔 LOADING STATE
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: map.get(vars.$spacing, xxl);
    text-align: center;

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid transparent;
      border-radius: 50%;
      margin-bottom: map.get(vars.$spacing, m);
      animation: spin 1s linear infinite;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          border-top-color: mixins.theme-color($theme, accent-teal);
          border-right-color: mixins.theme-color($theme, accent-green);
        }
      }
    }

    p {
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  // Einstellungen-Link
  .notification-settings {
    margin-top: map.get(vars.$spacing, xl);
    display: flex;
    justify-content: center;

    @media (max-width: 576px) {
      margin-top: map.get(vars.$spacing, l);
    }

    .settings-button {
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, s);
      padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      cursor: pointer;
      border: none;
      font-weight: map.get(map.get(vars.$fonts, weights), medium);

      @media (max-width: 576px) {
        padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        width: 100%;
        justify-content: center;
      }

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, primary);
          color: white;
          transition: all 0.4s ease-out;

          &:hover {
            transform: translateY(-3px);
            @include mixins.shadow("medium", $theme);
          }
        }
      }

      .settings-icon {
        font-size: 1.2rem;

        @media (max-width: 576px) {
          font-size: 1rem;
        }
      }
    }
  }

  // 🔔 TOAST NOTIFICATIONS
  .error-toast,
  .success-toast {
    position: fixed;
    top: 100px;
    right: 20px;
    display: flex;
    align-items: center;
    gap: map.get(vars.$spacing, s);
    padding: map.get(vars.$spacing, m) map.get(vars.$spacing, l);
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);
    cursor: pointer;
    z-index: 1000;
    @include animations.fade-in(0.3s);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
    }

    @media (max-width: 576px) {
      right: 10px;
      left: 10px;
      padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);
    }
  }

  .error-toast {
    background-color: #ff6b6b;
    color: white;
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
  }

  .success-toast {
    background-color: #2ed573;
    color: white;
    box-shadow: 0 4px 12px rgba(46, 213, 115, 0.3);
  }
}

// 🔔 ANIMATIONS
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>