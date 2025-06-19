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
        <Cog6ToothIcon class="settings-icon hero-icon" />
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

    <!-- Loading Spinner -->
    <Transition name="fade">
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from "vue";
import { Cog6ToothIcon } from "@heroicons/vue/24/outline";

// Import der modularen Komponenten
import {
  NotificationStats,
  NotificationFilters,
  NotificationsList,
  EmptyState,
  SettingsModal,
  ConfirmDialog,
} from "@/components/pages/DashboardPages/Notifications";

// Services und Types
import { notificationService } from "@/services/notification.service";
import type { NotificationDisplay, NotificationSetting, NotificationFilter } from "@/types/dtos/Notification.types";

export default defineComponent({
  name: "NotificationsDashboard",
  components: {
    NotificationStats,
    NotificationFilters,
    NotificationsList,
    EmptyState,
    SettingsModal,
    ConfirmDialog,
    Cog6ToothIcon,
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

    // Notifications from Backend
    const notifications = ref<NotificationDisplay[]>([]);

    // Filter-Optionen
    const filters = ref<NotificationFilter[]>([
      { id: "all", name: "Alle", count: 0 },
      { id: "unread", name: "Ungelesen", count: 0 },
      { id: "FRIEND_REQUEST", name: "Freundschaftsanfragen", count: 0 },
      { id: "COMMENT", name: "Kommentare", count: 0 },
      { id: "NEW_MESSAGE", name: "Nachrichten", count: 0 },
      { id: "APPLICATION_STATUS_CHANGE", name: "Bewerbungen", count: 0 },
      { id: "TICKET_UPDATE", name: "Tickets", count: 0 },
      { id: "SYSTEM", name: "System", count: 0 },
    ]);

    // Benachrichtigungseinstellungen (später von Backend laden)
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
        id: "new_messages",
        name: "Neue Nachrichten",
        description: "Benachrichtigungen für neue Direktnachrichten.",
        enabled: true,
      },
      {
        id: "application_updates",
        name: "Bewerbungsupdates",
        description: "Statusänderungen deiner Bewerbungen.",
        enabled: true,
      },
      {
        id: "ticket_updates",
        name: "Ticket-Updates",
        description: "Benachrichtigungen über Support-Tickets.",
        enabled: true,
      },
      {
        id: "system_announcements",
        name: "Systemankündigungen",
        description: "Wichtige Ankündigungen zu Neuerungen und Updates.",
        enabled: true,
      },
    ]);

    // Benachrichtigungen vom Backend laden
    const loadNotifications = async (showLoader = true) => {
      if (showLoader) {
        isLoading.value = true;
      }
      try {
        notifications.value = await notificationService.getNotifications();
        updateFilterCounts();
      } catch (error) {
        console.error("Fehler beim Laden der Benachrichtigungen:", error);
      } finally {
        if (showLoader) {
          isLoading.value = false;
        }
      }
    };

    // Filtere Benachrichtigungen basierend auf aktivem Filter
    const filteredNotifications = computed(() => {
      return notificationService.filterByType(notifications.value, activeFilter.value);
    });

    // Dynamisch aktualisierte Anzahlen für Filter
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

    // Berechnete Werte für Status
    const unreadCount = computed(() => {
      return notifications.value.filter((n) => !n.isRead).length;
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

    // Benachrichtigung als gelesen markieren
    const markAsRead = async (id: string) => {
      try {
        await notificationService.markAsRead(id);
        // UI optimistisch aktualisieren
        const notification = notifications.value.find((n) => n.id === id);
        if (notification) {
          notification.isRead = true;
          updateFilterCounts();
        }
      } catch (error) {
        console.error("Fehler beim Markieren als gelesen:", error);
        // Bei Fehler neu laden
        await loadNotifications();
      }
    };

    // Alle Benachrichtigungen als gelesen markieren
    const markAllAsRead = () => {
      confirmDialog(
        "Alle als gelesen markieren",
        "Möchtest du wirklich alle Benachrichtigungen als gelesen markieren? Die Benachrichtigungen bleiben erhalten und können weiterhin in den Kategorien eingesehen werden.",
        "Als gelesen markieren",
        async () => {
          try {
            await notificationService.markAllAsRead();
            // UI optimistisch aktualisieren
            notifications.value.forEach((notification) => {
              notification.isRead = true;
            });
            updateFilterCounts();
          } catch (error) {
            console.error("Fehler beim Markieren aller als gelesen:", error);
            // Bei Fehler neu laden mit Loading
            await loadNotifications(true);
          }
        }
      );
    };

    // Benachrichtigung löschen
    const deleteNotification = (id: string) => {
      const notification = notifications.value.find((n) => n.id === id);
      if (notification) {
        confirmDialog(
          "Benachrichtigung löschen",
          `Möchtest du wirklich die Benachrichtigung "${notification.title}" löschen?`,
          "Löschen",
          async () => {
            try {
              await notificationService.deleteNotification(id);
              // UI optimistisch aktualisieren
              const index = notifications.value.findIndex((n) => n.id === id);
              if (index !== -1) {
                notifications.value.splice(index, 1);
                updateFilterCounts();
              }
            } catch (error) {
              console.error("Fehler beim Löschen der Benachrichtigung:", error);
              // Bei Fehler neu laden mit Loading
              await loadNotifications(true);
            }
          }
        );
      }
    };

    const clearAllNotifications = () => {
      confirmDialog(
        "Alle Benachrichtigungen entfernen",
        "Möchtest du wirklich ALLE Benachrichtigungen endgültig löschen? Dies kann nicht rückgängig gemacht werden und die Benachrichtigungen sind dann auch aus allen Kategorien verschwunden.",
        "Alle endgültig löschen",
        async () => {
          try {
            await notificationService.deleteAllNotifications();
            // UI optimistisch aktualisieren
            notifications.value = [];
            updateFilterCounts();
          } catch (error) {
            console.error("Fehler beim Löschen aller Benachrichtigungen:", error);
            // Bei Fehler neu laden mit Loading
            await loadNotifications(true);
          }
        }
      );
    };

    // Einstellungen speichern (TODO: Backend-Integration)
    const saveSettings = (settings: NotificationSetting[]) => {
      // Hier würden die Einstellungen an den Server gesendet
      notificationSettings.value = [...settings];
      showSettings.value = false;
      console.log("Einstellungen gespeichert:", settings);
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

    // Event Handler für Notification Updates
    const handleNotificationUpdate = () => {
      // Beim Polling kein Loading-Spinner anzeigen
      loadNotifications(false);
    };

    // Lifecycle
    onMounted(() => {
      // Initial laden mit Loading-Spinner
      loadNotifications(true);

      // Event Listener für Updates registrieren
      window.addEventListener("notification-count-updated", handleNotificationUpdate);
    });

    onUnmounted(() => {
      // Event Listener entfernen
      window.removeEventListener("notification-count-updated", handleNotificationUpdate);
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
  position: relative;

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
        &.hero-icon {
          width: 24px;
          height: 24px;
          stroke-width: 1.5;

          @media (max-width: 576px) {
            width: 20px;
            height: 20px;
          }
        }
      }
    }
  }

  // Loading Overlay
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 10;
    pointer-events: none;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background-color: if($theme == "light", rgba(255, 255, 255, 0.8), rgba(0, 0, 0, 0.8));
      }
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid;
      border-radius: 50%;
      animation: spin 1s linear infinite;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          border-color: mixins.theme-color($theme, border-light);
          border-top-color: mixins.theme-color($theme, accent-teal);
        }
      }
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// Fade transition
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
