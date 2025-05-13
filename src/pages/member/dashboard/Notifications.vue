<!-- src/components/member/dashboard/Notifications.vue -->
<template>
  <div class="notifications-dashboard">
    <div class="page-header">
      <h2>Benachrichtigungen</h2>
      <p>Bleibe über wichtige Aktivitäten und Neuigkeiten informiert</p>
    </div>

    <!-- Statistik-Karten -->
    <notification-stats 
      :unread-count="unreadCount" 
      :total-count="totalCount" 
    />

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
    <empty-state 
      v-else 
      :active-filter="activeFilter" 
      @update:active-filter="activeFilter = $event" 
    />

    <!-- Einstellungen-Link -->
    <div class="notification-settings">
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
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';

// Import der modularen Komponenten
import { 
  NotificationStats, 
  NotificationFilters, 
  NotificationsList, 
  EmptyState, 
  SettingsModal, 
  ConfirmDialog 
} from '@/components/pages/DashboardPages/Notifications';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'article' | 'comment' | 'friend' | 'system';
  time: string;
  read: boolean;
  actionLink?: string;
  actionText?: string;
}

interface NotificationSetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export default defineComponent({
  name: 'NotificationsDashboard',
  components: {
    NotificationStats,
    NotificationFilters,
    NotificationsList,
    EmptyState,
    SettingsModal,
    ConfirmDialog
  },
  setup() {
    // Status
    const activeFilter = ref('all');
    const showSettings = ref(false);
    const showConfirmDialog = ref(false);
    const confirmDialogTitle = ref('');
    const confirmDialogMessage = ref('');
    const confirmDialogAction = ref('');
    const pendingAction = ref<(() => void) | null>(null);

    // Filter-Optionen
    const filters = ref([
      { id: 'all', name: 'Alle', count: 0 },
      { id: 'unread', name: 'Ungelesen', count: 0 },
      { id: 'article', name: 'Artikel', count: 0 },
      { id: 'comment', name: 'Kommentare', count: 0 },
      { id: 'friend', name: 'Freunde', count: 0 },
      { id: 'system', name: 'System', count: 0 }
    ]);

    // Beispiel-Benachrichtigungen (später durch API-Daten ersetzen)
    const notifications = ref<Notification[]>([
      {
        id: 1,
        title: 'Neue Artikelempfehlung',
        message: 'Basierend auf deinen Interessen: "Digitale Medien im Kindesalter: Fluch oder Segen?"',
        type: 'article',
        time: 'Vor 10 Minuten',
        read: false,
        actionLink: '#',
        actionText: 'Artikel lesen'
      },
      {
        id: 2,
        title: 'Freundschaftsanfrage',
        message: 'Thomas Schmidt möchte mit dir befreundet sein.',
        type: 'friend',
        time: 'Vor 1 Stunde',
        read: false,
        actionLink: '#',
        actionText: 'Anfrage ansehen'
      },
      {
        id: 3,
        title: 'Kommentar auf deinen Artikel',
        message: 'Lisa Becker hat auf deinen Artikel "Grenzen setzen ohne Konflikte" geantwortet.',
        type: 'comment',
        time: 'Gestern',
        read: true,
        actionLink: '#',
        actionText: 'Zum Kommentar'
      },
      {
        id: 4,
        title: 'Willkommen bei Eltern & Kind!',
        message: 'Wir freuen uns, dich in unserer Community zu begrüßen. Entdecke unsere vielfältigen Artikel und Ressourcen für Eltern.',
        type: 'system',
        time: 'Vor 2 Tagen',
        read: true
      },
      {
        id: 5,
        title: 'Neuer Artikel verfügbar',
        message: 'Der Artikel "Gesunde Ernährung für Kleinkinder" wurde gerade veröffentlicht.',
        type: 'article',
        time: 'Vor 3 Tagen',
        read: true,
        actionLink: '#',
        actionText: 'Artikel lesen'
      }
    ]);

    // Benachrichtigungseinstellungen
    const notificationSettings = ref<NotificationSetting[]>([
      {
        id: 'email_notifications',
        name: 'E-Mail-Benachrichtigungen',
        description: 'Erhalte wichtige Benachrichtigungen per E-Mail.',
        enabled: true
      },
      {
        id: 'browser_notifications',
        name: 'Browser-Benachrichtigungen',
        description: 'Erlaube Benachrichtigungen im Browser.',
        enabled: false
      },
      {
        id: 'article_recommendations',
        name: 'Artikelempfehlungen',
        description: 'Benachrichtigungen für personalisierte Artikelempfehlungen.',
        enabled: true
      },
      {
        id: 'comment_notifications',
        name: 'Kommentar-Benachrichtigungen',
        description: 'Benachrichtigungen für Kommentare auf deine Artikel oder Beiträge.',
        enabled: true
      },
      {
        id: 'friend_requests',
        name: 'Freundschaftsanfragen',
        description: 'Benachrichtigungen für neue Freundschaftsanfragen.',
        enabled: true
      },
      {
        id: 'system_announcements',
        name: 'Systemankündigungen',
        description: 'Wichtige Ankündigungen zu Neuerungen und Updates.',
        enabled: true
      }
    ]);

    // Filtere Benachrichtigungen basierend auf aktivem Filter
    const filteredNotifications = computed(() => {
      if (activeFilter.value === 'all') {
        return notifications.value;
      } else if (activeFilter.value === 'unread') {
        return notifications.value.filter(notification => !notification.read);
      } else {
        return notifications.value.filter(notification => notification.type === activeFilter.value);
      }
    });

    // Dynamisch aktualisierte Anzahlen für Filter
    const updateFilterCounts = () => {
      filters.value.forEach(filter => {
        if (filter.id === 'all') {
          filter.count = notifications.value.length;
        } else if (filter.id === 'unread') {
          filter.count = notifications.value.filter(n => !n.read).length;
        } else {
          filter.count = notifications.value.filter(n => n.type === filter.id).length;
        }
      });
    };

    // Initialisiere Filter-Anzahlen
    updateFilterCounts();

    // Berechnete Werte für Status
    const unreadCount = computed(() => {
      return notifications.value.filter(n => !n.read).length;
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
    const markAsRead = (id: number) => {
      const notification = notifications.value.find(n => n.id === id);
      if (notification) {
        notification.read = true;
        updateFilterCounts();
      }
    };

    // Alle Benachrichtigungen als gelesen markieren
    const markAllAsRead = () => {
      confirmDialog(
        'Alle als gelesen markieren',
        'Möchtest du wirklich alle Benachrichtigungen als gelesen markieren?',
        'Alle markieren',
        () => {
          notifications.value.forEach(notification => {
            notification.read = true;
          });
          updateFilterCounts();
        }
      );
    };

    // Benachrichtigung löschen
    const deleteNotification = (id: number) => {
      const notification = notifications.value.find(n => n.id === id);
      if (notification) {
        confirmDialog(
          'Benachrichtigung löschen',
          `Möchtest du wirklich die Benachrichtigung "${notification.title}" löschen?`,
          'Löschen',
          () => {
            const index = notifications.value.findIndex(n => n.id === id);
            if (index !== -1) {
              notifications.value.splice(index, 1);
              updateFilterCounts();
            }
          }
        );
      }
    };

    // Alle Benachrichtigungen löschen
    const clearAllNotifications = () => {
      confirmDialog(
        'Alle Benachrichtigungen löschen',
        'Möchtest du wirklich alle Benachrichtigungen löschen? Dies kann nicht rückgängig gemacht werden.',
        'Alle löschen',
        () => {
          notifications.value = [];
          updateFilterCounts();
        }
      );
    };

    // Einstellungen speichern
    const saveSettings = (settings: NotificationSetting[]) => {
      // Hier könntest du die Einstellungen an den Server senden
      notificationSettings.value = [...settings];
      showSettings.value = false;
      alert('Einstellungen wurden gespeichert!');
    };

    // Bestätigungsdialog anzeigen
    const confirmDialog = (title: string, message: string, actionText: string, action: () => void) => {
      confirmDialogTitle.value = title;
      confirmDialogMessage.value = message;
      confirmDialogAction.value = actionText;
      pendingAction.value = action;
      showConfirmDialog.value = true;
    };

    // Aktion bestätigen
    const confirmAction = () => {
      if (pendingAction.value) {
        pendingAction.value();
        pendingAction.value = null;
      }
      showConfirmDialog.value = false;
    };

    // Aktion abbrechen
    const cancelAction = () => {
      pendingAction.value = null;
      showConfirmDialog.value = false;
    };

    return {
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
      cancelAction
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

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

      @each $theme in ('light', 'dark') {
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

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
          transition: all 0.4s ease-out;
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

      .settings-icon {
        font-size: 1.2rem;

        @media (max-width: 576px) {
          font-size: 1rem;
        }
      }
    }
  }
}
</style>