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
  iconName?: string; // Hero Icon Name für Icon-Darstellung
  iconColor?: string; // Farbe für das Icon
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
 * API Response Types - NICHT MEHR VERWENDET (Backend gibt direkt Arrays/Zahlen zurück)
 * Behalten für mögliche zukünftige Erweiterungen
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
 * Filter-Mapping für UI mit Hero Icons
 */
export const NotificationTypeMap: Record<NotificationType, { 
  name: string; 
  iconName: string; 
  color: string;
  bgColor: string;
}> = {
  [NotificationType.FRIEND_REQUEST]: {
    name: 'Freundschaftsanfrage',
    iconName: 'UserGroupIcon',
    color: '#4AD695',
    bgColor: 'rgba(74, 214, 149, 0.15)'
  },
  [NotificationType.FRIENDSHIP_ACCEPTED]: {
    name: 'Freundschaft angenommen',
    iconName: 'UserPlusIcon',
    color: '#4AD695',
    bgColor: 'rgba(74, 214, 149, 0.15)'
  },
  [NotificationType.COMMENT]: {
    name: 'Kommentar',
    iconName: 'ChatBubbleLeftRightIcon',
    color: '#35CCD0',
    bgColor: 'rgba(53, 204, 208, 0.15)'
  },
  [NotificationType.NEW_MESSAGE]: {
    name: 'Neue Nachricht',
    iconName: 'EnvelopeIcon',
    color: '#35CCD0',
    bgColor: 'rgba(53, 204, 208, 0.15)'
  },
  [NotificationType.APPLICATION_STATUS_CHANGE]: {
    name: 'Bewerbungsstatus',
    iconName: 'ClipboardDocumentCheckIcon',
    color: '#F7DC6F',
    bgColor: 'rgba(247, 220, 111, 0.15)'
  },
  [NotificationType.TICKET_UPDATE]: {
    name: 'Ticket-Update',
    iconName: 'TicketIcon',
    color: '#F7DC6F',
    bgColor: 'rgba(247, 220, 111, 0.15)'
  },
  [NotificationType.SYSTEM]: {
    name: 'System',
    iconName: 'InformationCircleIcon',
    color: '#85C1E9',
    bgColor: 'rgba(133, 193, 233, 0.15)'
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
    iconName: typeInfo?.iconName || 'BellIcon',
    iconColor: typeInfo?.color || '#85C1E9',
    // Action-Links können basierend auf dem Typ generiert werden
    actionLink: generateActionLink(notification),
    actionText: generateActionText(notification.type)
  };
};

const generateActionLink = (notification: Notification): string | undefined => {
  switch (notification.type) {
    case NotificationType.FRIEND_REQUEST:
      return '/member/dashboard?tab=friends';
    case NotificationType.FRIENDSHIP_ACCEPTED:
      return '/member/dashboard?tab=friends';
    case NotificationType.COMMENT:
      return '/member/dashboard?tab=my-articles';
    case NotificationType.APPLICATION_STATUS_CHANGE:
      return '/member/dashboard?tab=overview';
    case NotificationType.TICKET_UPDATE:
      return '/member/dashboard?tab=support';
    case NotificationType.NEW_MESSAGE:
      return '/member/dashboard?tab=friends';
    default:
      return undefined;
  }
};

const generateActionText = (type: NotificationType): string | undefined => {
  switch (type) {
    case NotificationType.FRIEND_REQUEST:
      return 'Anfrage ansehen';
    case NotificationType.FRIENDSHIP_ACCEPTED:
      return 'Freunde anzeigen';
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