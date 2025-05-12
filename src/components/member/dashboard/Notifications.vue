<!-- src/components/member/dashboard/Notifications.vue -->
<template>
  <div class="notifications-dashboard">
    <div class="page-header">
      <h2>Benachrichtigungen</h2>
      <p>Bleibe über wichtige Aktivitäten und Neuigkeiten informiert</p>
    </div>

    <!-- Statistik-Karten -->
    <div class="notification-stats">
      <div class="stat-card">
        <div class="stat-icon" style="background-color: rgba(74, 210, 149, 0.2)">🔔</div>
        <div class="stat-info">
          <h3>{{ unreadCount }}</h3>
          <p>Ungelesen</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background-color: rgba(53, 204, 208, 0.2)">📊</div>
        <div class="stat-info">
          <h3>{{ totalCount }}</h3>
          <p>Gesamt</p>
        </div>
      </div>
    </div>

    <!-- Filter-Optionen -->
    <div class="notification-filters">
      <div class="filter-toolbar">
        <div class="filter-buttons">
          <button v-for="(filter, index) in filters" :key="index" class="filter-button"
            :class="{ active: activeFilter === filter.id }" @click="activeFilter = filter.id">
            {{ filter.name }}
            <span v-if="filter.count > 0" class="filter-count">{{ filter.count }}</span>
          </button>
        </div>

        <div class="action-buttons">
          <button class="mark-all-read" @click="markAllAsRead" v-if="hasUnread">Alle als gelesen markieren</button>
          <button class="clear-notifications" @click="clearAllNotifications" v-if="hasNotifications">Alle
            löschen</button>
        </div>
      </div>
    </div>

    <!-- Benachrichtigungsliste -->
    <div v-if="filteredNotifications.length > 0" class="notifications-list">
      <transition-group name="notification">
        <div v-for="notification in filteredNotifications" :key="notification.id" class="notification-item"
          :class="{ unread: !notification.read }">
          <div class="notification-icon" :class="notification.type">
            <span v-if="notification.type === 'article'">📚</span>
            <span v-else-if="notification.type === 'comment'">💬</span>
            <span v-else-if="notification.type === 'friend'">👥</span>
            <span v-else-if="notification.type === 'system'">ℹ️</span>
            <span v-else>🔔</span>
          </div>
          <div class="notification-content">
            <div class="notification-header">
              <h3>{{ notification.title }}</h3>
              <span class="notification-time">{{ notification.time }}</span>
            </div>
            <p class="notification-message">{{ notification.message }}</p>
            <div v-if="notification.actionLink" class="notification-action">
              <a :href="notification.actionLink">{{ notification.actionText || 'Ansehen' }}</a>
            </div>
          </div>
          <div class="notification-actions">
            <button v-if="!notification.read" class="action-button mark-read" @click.stop="markAsRead(notification.id)"
              title="Als gelesen markieren">
              ✓
            </button>
            <button class="action-button delete" @click.stop="deleteNotification(notification.id)" title="Löschen">
              ×
            </button>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- Leerer Zustand -->
    <div v-else class="empty-state">
      <div class="empty-icon">🔔</div>
      <h3>Keine Benachrichtigungen</h3>
      <p v-if="activeFilter !== 'all'">
        Es gibt keine Benachrichtigungen in dieser Kategorie.
        <button @click="activeFilter = 'all'" class="switch-filter">Alle anzeigen</button>
      </p>
      <p v-else>Du hast zurzeit keine Benachrichtigungen. Wir werden dich über wichtige Aktivitäten informieren.</p>
    </div>

    <!-- Einstellungen-Link -->
    <div class="notification-settings">
      <button @click="showSettings = true" class="settings-button">
        <span class="settings-icon">⚙️</span>
        Benachrichtigungseinstellungen anpassen
      </button>
    </div>

    <!-- Einstellungs-Modal -->
    <div v-if="showSettings" class="modal-backdrop" @click="showSettings = false">
      <div class="modal-content" @click.stop>
        <h3>Benachrichtigungseinstellungen</h3>
        <p>Passe an, welche Benachrichtigungen du erhalten möchtest.</p>

        <div class="settings-form">
          <div v-for="(setting, index) in notificationSettings" :key="index" class="setting-item">
            <div class="setting-info">
              <h4>{{ setting.name }}</h4>
              <p>{{ setting.description }}</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="setting.enabled">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div class="modal-actions">
          <button class="cancel-button" @click="showSettings = false">Abbrechen</button>
          <button class="save-button" @click="saveSettings">Speichern</button>
        </div>

        <button class="close-modal" @click="showSettings = false">×</button>
      </div>
    </div>

    <!-- Bestätigungsdialog -->
    <div v-if="showConfirmDialog" class="modal-backdrop" @click="cancelAction">
      <div class="confirm-dialog" @click.stop>
        <h3>{{ confirmDialogTitle }}</h3>
        <p>{{ confirmDialogMessage }}</p>
        <div class="dialog-actions">
          <button class="cancel-button" @click="cancelAction">Abbrechen</button>
          <button class="confirm-button" @click="confirmAction">{{ confirmDialogAction }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';

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
      { id: 'all', name: 'Alle' },
      { id: 'unread', name: 'Ungelesen' },
      { id: 'article', name: 'Artikel' },
      { id: 'comment', name: 'Kommentare' },
      { id: 'friend', name: 'Freunde' },
      { id: 'system', name: 'System' }
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
    const saveSettings = () => {
      // Hier später API-Aufruf implementieren
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

  // Statistik-Karten
  .notification-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: map.get(vars.$spacing, l);
    margin-bottom: map.get(vars.$spacing, l);

    @media (max-width: 576px) {
      grid-template-columns: 1fr;
      gap: map.get(vars.$spacing, m);
    }

    .stat-card {
      display: flex;
      align-items: center;
      padding: map.get(vars.$spacing, l);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      transition: all 0.3s;

      @media (max-width: 576px) {
        padding: map.get(vars.$spacing, m);
      }

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, card-bg);
          border: 1px solid mixins.theme-color($theme, border-light);
          transition: all 0.4s ease-out;

          &:hover {
            transform: translateY(-5px);
            @include mixins.shadow('medium', $theme);
          }
        }
      }

      .stat-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: map.get(vars.$spacing, m);
        font-size: 1.5rem;

        @media (max-width: 576px) {
          width: 40px;
          height: 40px;
          font-size: 1.2rem;
          margin-right: map.get(vars.$spacing, s);
        }
      }

      .stat-info {
        h3 {
          font-size: map.get(map.get(vars.$fonts, sizes), xl);
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
          margin: 0 0 map.get(vars.$spacing, xxs) 0;

          @media (max-width: 576px) {
            font-size: map.get(map.get(vars.$fonts, sizes), large);
          }

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
              transition: all 0.4s ease-out;
            }
          }
        }

        p {
          margin: 0;
          font-size: map.get(map.get(vars.$fonts, sizes), small);

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
              transition: all 0.4s ease-out;
            }
          }
        }
      }
    }
  }

  // Filter und Aktions-Buttons
  .notification-filters {
    margin-bottom: map.get(vars.$spacing, l);

    .filter-toolbar {
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      gap: map.get(vars.$spacing, m);

      @media (min-width: 992px) {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
    }

    .filter-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: map.get(vars.$spacing, s);
      width: 100%;
      justify-content: center;

      @media (max-width: 576px) {
        gap: map.get(vars.$spacing, xs);
      }

      .filter-button {
        padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        cursor: pointer;
        transition: all 0.3s;
        border: none;
        display: flex;
        align-items: center;
        gap: map.get(vars.$spacing, xs);

        @media (max-width: 576px) {
          padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, m);
          font-size: 12px;
        }

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            color: mixins.theme-color($theme, text-secondary);
            transition: all 0.4s ease-out;

            &:hover {
              background-color: mixins.theme-color($theme, hover-color);
            }

            &.active {
              background: mixins.theme-gradient($theme, primary);
              color: white;
            }
          }
        }

        .filter-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          border-radius: 10px;
          font-size: 0.8rem;
          padding: 0 6px;

          @media (max-width: 576px) {
            min-width: 16px;
            height: 16px;
            font-size: 0.7rem;
            padding: 0 4px;
          }

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: rgba(255, 255, 255, 0.2);
              transition: all 0.4s ease-out;
            }
          }
        }
      }
    }

    .action-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: map.get(vars.$spacing, s);
      justify-content: center;
      width: 100%;

      @media (max-width: 576px) {
        width: 100%;

        button {
          flex: 1;
        }
      }

      button {
        padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, m);
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        cursor: pointer;
        border: none;
        white-space: nowrap;

        @media (max-width: 576px) {
          font-size: 12px;
          text-align: center;
          padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, s);
        }

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: transparent;
            transition: all 0.4s ease-out;

            &:hover {
              background-color: mixins.theme-color($theme, hover-color);
            }
          }
        }

        &.mark-all-read {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, accent-teal);
              border: 1px solid mixins.theme-color($theme, accent-teal);
              transition: all 0.4s ease-out;
            }
          }
        }

        &.clear-notifications {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: #ff6b6b;
              border: 1px solid rgba(255, 107, 107, 0.3);
              transition: all 0.4s ease-out;

              &:hover {
                background-color: rgba(255, 107, 107, 0.1);
              }
            }
          }
        }
      }
    }
  }

  // Benachrichtigungsliste
  .notifications-list {
    margin-bottom: map.get(vars.$spacing, xl);
    display: flex;
    flex-direction: column;
    align-items: center;

    .notification-item {
      display: flex;
      gap: map.get(vars.$spacing, m);
      padding: map.get(vars.$spacing, l);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      margin-bottom: map.get(vars.$spacing, m);
      position: relative;
      transition: all 0.3s;
      width: 100%;
      max-width: 800px;
  transition: all 0.4s ease-out;

      @media (max-width: 768px) {
        padding: map.get(vars.$spacing, m);
        gap: map.get(vars.$spacing, s);
      }

      @media (max-width: 576px) {
        flex-direction: column;
        align-items: flex-start;
        padding: map.get(vars.$spacing, s);
      }

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          transition: all 0.4s ease-out !important;
          background-color: mixins.theme-color($theme, card-bg);
          border: 1px solid mixins.theme-color($theme, border-light);

          &.unread {
            border-left: 4px solid mixins.theme-color($theme, accent-green);

            background-color: rgba(mixins.theme-color($theme, accent-green), 0.05);

            @media (max-width: 576px) {
              border-left-width: 1px;
              border-top: 4px solid mixins.theme-color($theme, accent-green);
            }
          }

          &:hover {
            @include mixins.shadow('medium', $theme);
          }
        }
      }

      .notification-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        flex-shrink: 0;

        @media (max-width: 768px) {
          width: 40px;
          height: 40px;
          font-size: 1.2rem;
        }

        @media (max-width: 576px) {
          margin-bottom: map.get(vars.$spacing, s);
        }

        &.article {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: rgba(mixins.theme-color($theme, accent-green), 0.15);
              transition: all 0.4s ease-out;
            }
          }
        }

        &.comment {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: rgba(mixins.theme-color($theme, accent-teal), 0.15);
              transition: all 0.4s ease-out;
            }
          }
        }

        &.friend {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: rgba(mixins.theme-color($theme, accent-lime), 0.15);
              transition: all 0.4s ease-out;
            }
          }
        }

        &.system {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: rgba(mixins.theme-color($theme, accent-yellow), 0.15);
              transition: all 0.4s ease-out;
            }
          }
        }
      }

      .notification-content {
        flex: 1;
        min-width: 0; // Für Textbegrenzung

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: map.get(vars.$spacing, xs);

          @media (max-width: 576px) {
            flex-direction: column;
            gap: map.get(vars.$spacing, xxs);
          }

          h3 {
            margin: 0;
            font-size: map.get(map.get(vars.$fonts, sizes), medium);
            font-weight: map.get(map.get(vars.$fonts, weights), bold);

            @media (max-width: 768px) {
              font-size: map.get(map.get(vars.$fonts, sizes), small);
            }

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-primary);
                transition: all 0.4s ease-out;
              }
            }
          }

          .notification-time {
            font-size: map.get(map.get(vars.$fonts, sizes), small);
            white-space: nowrap;

            @media (max-width: 768px) {
              font-size: 11px;
            }

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-tertiary);
                transition: all 0.4s ease-out;
              }
            }
          }
        }

        .notification-message {
          margin-bottom: map.get(vars.$spacing, s);
          font-size: map.get(map.get(vars.$fonts, sizes), medium);

          @media (max-width: 768px) {
            font-size: map.get(map.get(vars.$fonts, sizes), small);
          }

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
              transition: all 0.4s ease-out;
            }
          }
        }

        .notification-action {
          a {
            display: inline-flex;
            align-items: center;
            padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, m);
            border-radius: map.get(map.get(vars.$layout, border-radius), pill);
            font-size: map.get(map.get(vars.$fonts, sizes), small);
            text-decoration: none;

            @media (max-width: 768px) {
              font-size: 11px;
              padding: 4px 10px;
            }

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, accent-teal);
                border: 1px solid mixins.theme-color($theme, accent-teal);
                transition: all 0.4s ease-out;

                &:hover {
                  background-color: rgba(mixins.theme-color($theme, accent-teal), 0.1);
                }
              }
            }
          }
        }
      }

      .notification-actions {
        display: flex;
        flex-direction: column;
        gap: map.get(vars.$spacing, s);
        flex-shrink: 0;

        @media (max-width: 576px) {
          flex-direction: row;
          align-self: flex-end;
          margin-top: map.get(vars.$spacing, s);
        }

        .action-button {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          font-size: 1rem;

          @media (max-width: 768px) {
            width: 26px;
            height: 26px;
            font-size: 0.9rem;
          }

          &.mark-read {
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background-color: mixins.theme-color($theme, accent-green);
                color: white;
                transition: all 0.4s ease-out;

                &:hover {
                  transform: scale(1.1);
                }
              }
            }
          }

          &.delete {
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background-color: mixins.theme-color($theme, secondary-bg);
                color: #ff6b6b;
                transition: all 0.4s ease-out;

                &:hover {
                  background-color: rgba(255, 107, 107, 0.1);
                }
              }
            }
          }
        }
      }
    }
  }

  // Leerer Zustand
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: map.get(vars.$spacing, xxl) map.get(vars.$spacing, m);
    text-align: center;

    @media (max-width: 576px) {
      padding: map.get(vars.$spacing, xl) map.get(vars.$spacing, s);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: map.get(vars.$spacing, l);
      opacity: 0.5;

      @media (max-width: 576px) {
        font-size: 3rem;
        margin-bottom: map.get(vars.$spacing, m);
      }
    }

    h3 {
      font-size: map.get(map.get(vars.$fonts, sizes), xl);
      margin-bottom: map.get(vars.$spacing, m);

      @media (max-width: 576px) {
        font-size: map.get(map.get(vars.$fonts, sizes), large);
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
      margin-bottom: map.get(vars.$spacing, l);
      max-width: 500px;

      @media (max-width: 576px) {
        font-size: map.get(map.get(vars.$fonts, sizes), small);
      }

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
          transition: all 0.4s ease-out;
        }
      }

      .switch-filter {
        background: none;
        border: none;
        cursor: pointer;
        font-size: inherit;
        padding: 0;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, accent-teal);
            text-decoration: underline;
            transition: all 0.4s ease-out;

            &:hover {
              color: mixins.theme-color($theme, accent-green);
            }
          }
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

  // Modal und Bestätigungsdialog
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
    padding: map.get(vars.$spacing, m);

    .modal-content,
    .confirm-dialog {
      width: 100%;
      max-width: 500px;
      padding: map.get(vars.$spacing, xl);
      border-radius: map.get(map.get(vars.$layout, border-radius), large);
      position: relative;
      @include animations.fade-in(0.3s);
      overflow-y: auto;
      max-height: 90vh;

      @media (max-width: 576px) {
        padding: map.get(vars.$spacing, l);
        max-width: 100%;
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      }

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

        @media (max-width: 576px) {
          font-size: map.get(map.get(vars.$fonts, sizes), large);
        }

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
            transition: all 0.4s ease-out;
          }
        }
      }

      p {
        margin-bottom: map.get(vars.$spacing, l);

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

    // Einstellungsformular
    .settings-form {
      margin-bottom: map.get(vars.$spacing, xl);

      @media (max-width: 576px) {
        margin-bottom: map.get(vars.$spacing, l);
      }

      .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: map.get(vars.$spacing, m) 0;

        @media (max-width: 576px) {
          flex-direction: column;
          align-items: flex-start;
          gap: map.get(vars.$spacing, s);
        }

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            border-bottom: 1px solid mixins.theme-color($theme, border-light);
            transition: all 0.4s ease-out;

            &:last-child {
              border-bottom: none;
            }
          }
        }

        .setting-info {
          flex: 1;
          padding-right: map.get(vars.$spacing, l);

          @media (max-width: 576px) {
            padding-right: 0;
          }

          h4 {
            margin: 0 0 map.get(vars.$spacing, xxs) 0;
            font-size: map.get(map.get(vars.$fonts, sizes), medium);

            @media (max-width: 576px) {
              font-size: map.get(map.get(vars.$fonts, sizes), small);
            }

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-primary);
                transition: all 0.4s ease-out;
              }
            }
          }

          p {
            margin: 0;
            font-size: map.get(map.get(vars.$fonts, sizes), small);

            @media (max-width: 576px) {
              font-size: 11px;
            }

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-secondary);
                transition: all 0.4s ease-out;
              }
            }
          }
        }

        // Toggle-Switch
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 26px;

          @media (max-width: 576px) {
            align-self: flex-end;
          }

          input {
            opacity: 0;
            width: 0;
            height: 0;

            &:checked+.toggle-slider {
              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background-color: mixins.theme-color($theme, accent-green);
                  transition: all 0.4s ease-out;
                }
              }
            }

            &:checked+.toggle-slider:before {
              transform: translateX(24px);
            }
          }

          .toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 34px;
            transition: .4s;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background-color: mixins.theme-color($theme, border-medium);
                transition: all 0.4s ease-out;
              }
            }

            &:before {
              position: absolute;
              content: "";
              height: 18px;
              width: 18px;
              left: 4px;
              bottom: 4px;
              border-radius: 50%;
              transition: .4s;

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background-color: white;
                }
              }
            }
          }
        }
      }
    }

    // Aktionsbuttons für Modal und Dialog
    .modal-actions,
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: map.get(vars.$spacing, m);

      @media (max-width: 576px) {
        flex-direction: column;
      }

      button {
        padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        cursor: pointer;
        border: none;

        @media (max-width: 576px) {
          padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);
          font-size: map.get(map.get(vars.$fonts, sizes), small);
        }

        &.cancel-button {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
              color: mixins.theme-color($theme, text-primary);
              border: 1px solid mixins.theme-color($theme, border-light);
              transition: all 0.4s ease-out;
            }
          }
        }

        &.save-button,
        &.confirm-button {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background: mixins.theme-gradient($theme, primary);
              color: white;
              transition: all 0.4s ease-out;
            }
          }
        }

        &.confirm-button {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              &.danger {
                background-color: #ff6b6b;
                background-image: none;
                transition: all 0.4s ease-out;
              }
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
      background: none;

      @media (max-width: 576px) {
        top: 10px;
        right: 10px;
        width: 24px;
        height: 24px;
        font-size: 1.2rem;
      }

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
          transition: all 0.4s ease-out;

          &:hover {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }
    }
  }

  // Animationen für Benachrichtigungen
  .notification-enter-active,
  .notification-leave-active {
    transition: all 0.5s;
  }

  .notification-enter-from,
  .notification-leave-to {
    opacity: 0;
    transform: translateX(30px);
  }
}
</style>