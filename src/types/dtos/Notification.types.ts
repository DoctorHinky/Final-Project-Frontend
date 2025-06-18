// src/types/dtos/Notification.types.ts

/**
 * Benachrichtigungstypen basierend auf dem Prisma Schema
 */
export enum NotificationType {
  FRIEND_REQUEST = 'FRIEND_REQUEST', // Freundschaftsanfrage
  FRIENDSHIP_ACCEPTED = 'FRIENDSHIP_ACCEPTED', // Freundschaft angenommen
  COMMENT = 'COMMENT', // Antwort auf Kommentar / Kommentar auf Post
  NEW_MESSAGE = 'NEW_MESSAGE', // Neue Nachricht mit Freunden etc
  APPLICATION_STATUS_CHANGE = 'APPLICATION_STATUS_CHANGE', // Statusänderung der Bewerbung
  TICKET_UPDATE = 'TICKET_UPDATE', // Status, neue Nachricht im Ticket
  SYSTEM = 'SYSTEM' // Alles was Admins machen etc
}

/**
 * Hauptbenachrichtigungs-Interface basierend auf Prisma Model
 */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  content: string; // Inhalt der Benachrichtigung
  isRead: boolean; // ob die Benachrichtigung gelesen wurde
  createdAt: string; // ISO Date String
}

/**
 * Erweiterte Notification für Frontend-Darstellung
 */
export interface NotificationDisplay extends Notification {
  title?: string; // Generiert basierend auf type
  time?: string; // Formatierte Zeit (z.B. "Vor 10 Minuten")
  actionLink?: string; // Link für "Ansehen"-Button
  actionText?: string; // Text für Action-Button
  icon?: string; // Emoji für Icon-Darstellung
}

/**
 * Filter für Benachrichtigungen
 */
export interface NotificationFilter {
  id: string;
  name: string;
  count: number;
}

/**
 * Benachrichtigungseinstellungen
 */
export interface NotificationSetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

/**
 * API Response Types
 */
export interface NotificationCountResponse {
  count: number;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unread: number;
}

/**
 * API Request Types
 */
export interface CreateNotificationRequest {
  userId: string;
  type: string; // NotificationType as string
  content: string;
}

/**
 * Filter-Mapping für UI
 */
export const NotificationTypeMap: Record<NotificationType, { name: string; icon: string; color: string }> = {
  [NotificationType.FRIEND_REQUEST]: {
    name: 'Freundschaftsanfrage',
    icon: '👥',
    color: '#4AD695'
  },
  [NotificationType.FRIENDSHIP_ACCEPTED]: {
    name: 'Freundschaft angenommen',
    icon: '🤝',
    color: '#4AD695'
  },
  [NotificationType.COMMENT]: {
    name: 'Kommentar',
    icon: '💬',
    color: '#35CCD0'
  },
  [NotificationType.NEW_MESSAGE]: {
    name: 'Neue Nachricht',
    icon: '✉️',
    color: '#35CCD0'
  },
  [NotificationType.APPLICATION_STATUS_CHANGE]: {
    name: 'Bewerbungsstatus',
    icon: '📋',
    color: '#F7DC6F'
  },
  [NotificationType.TICKET_UPDATE]: {
    name: 'Ticket-Update',
    icon: '🎫',
    color: '#F7DC6F'
  },
  [NotificationType.SYSTEM]: {
    name: 'System',
    icon: 'ℹ️',
    color: '#85C1E9'
  }
};

/**
 * Utility Functions
 */
export const formatNotificationTime = (createdAt: string): string => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Gerade eben';
  if (diffMinutes < 60) return `Vor ${diffMinutes} Minute${diffMinutes === 1 ? '' : 'n'}`;
  if (diffHours < 24) return `Vor ${diffHours} Stunde${diffHours === 1 ? '' : 'n'}`;
  if (diffDays < 7) return `Vor ${diffDays} Tag${diffDays === 1 ? '' : 'en'}`;
  
  return created.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const generateNotificationTitle = (type: NotificationType): string => {
  const typeInfo = NotificationTypeMap[type];
  return typeInfo?.name || 'Benachrichtigung';
};

export const convertToDisplayNotification = (notification: Notification): NotificationDisplay => {
  const typeInfo = NotificationTypeMap[notification.type];
  
  return {
    ...notification,
    title: generateNotificationTitle(notification.type),
    time: formatNotificationTime(notification.createdAt),
    icon: typeInfo?.icon || '🔔',
    // Action-Links können basierend auf dem Typ generiert werden
    actionLink: generateActionLink(notification),
    actionText: generateActionText(notification.type)
  };
};

const generateActionLink = (notification: Notification): string | undefined => {
  switch (notification.type) {
    case NotificationType.FRIEND_REQUEST:
      return '/member/dashboard?tab=friends';
    case NotificationType.COMMENT:
      return '/member/dashboard?tab=my-articles';
    case NotificationType.APPLICATION_STATUS_CHANGE:
      return '/member/dashboard?tab=overview';
    case NotificationType.TICKET_UPDATE:
      return '/member/dashboard?tab=settings';
    default:
      return undefined;
  }
};

const generateActionText = (type: NotificationType): string | undefined => {
  switch (type) {
    case NotificationType.FRIEND_REQUEST:
      return 'Anfrage ansehen';
    case NotificationType.COMMENT:
      return 'Zum Kommentar';
    case NotificationType.APPLICATION_STATUS_CHANGE:
      return 'Status ansehen';
    case NotificationType.TICKET_UPDATE:
      return 'Ticket öffnen';
    case NotificationType.NEW_MESSAGE:
      return 'Nachricht lesen';
    default:
      return 'Ansehen';
  }
};