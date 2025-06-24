// src/services/notification.service.ts

import api from "./axiosInstance";
import { convertToDisplayNotification } from "@/types/dtos/Notification.types";
import type { Notification, NotificationDisplay } from "@/types/dtos/Notification.types";

/**
 * Notification Service für API-Kommunikation
 * Mapping zu Backend-Endpunkten:
 * - GET /notification/count -> getNotificationCount()
 * - GET /notification -> getNotifications()
 * - PATCH /notification/read/:id -> markAsRead(id)
 * - PATCH /notification/read-all -> markAllAsRead()
 * - DELETE /notification/:id -> deleteNotification(id)
 * - DELETE /notification/all -> deleteAllNotifications()
 */
class NotificationService {
  private pollingInterval: ReturnType<typeof setInterval> | null = null;
  private listeners: Array<(count: number) => void> = [];

  /**
   * Anzahl ungelesener Benachrichtigungen abrufen
   */
  async getNotificationCount(): Promise<number> {
    try {
      const response = await api.get<number>("/notification/count");
      // Backend gibt direkt die Zahl zurück
      return response.data;
    } catch (error) {
      console.error("Fehler beim Abrufen der Benachrichtigungsanzahl:", error);
      // Bei Fehler 0 zurückgeben statt zu werfen (für bessere UX)
      return 0;
    }
  }

  /**
   * Alle Benachrichtigungen abrufen (ungelesen und gelesen)
   */
  async getNotifications(): Promise<NotificationDisplay[]> {
    try {
      const response = await api.get<Notification[]>("/notification");

      // Backend gibt direkt ein Array zurück
      const notifications = response.data || [];

      // Convert to Display-Notifications mit formatierten Zeiten und Titeln
      return notifications.map(convertToDisplayNotification);
    } catch (error) {
      console.error("Fehler beim Abrufen der Benachrichtigungen:", error);
      // Bei Fehler leeres Array zurückgeben statt zu werfen (für bessere UX)
      return [];
    }
  }

  /**
   * Einzelne Benachrichtigung als gelesen markieren
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await api.patch(`/notification/read/${notificationId}`);

      // Cache invalidieren
      this.invalidateCache();

      // Trigger update für Badge-Counter
      this.notifyListeners();
    } catch (error) {
      console.error("Fehler beim Markieren als gelesen:", error);
      throw error;
    }
  }

  /**
   * Alle Benachrichtigungen als gelesen markieren
   */
  async markAllAsRead(): Promise<void> {
    try {
      await api.patch("/notification/read-all");

      // Cache invalidieren
      this.invalidateCache();

      // Trigger update für Badge-Counter
      this.notifyListeners();
    } catch (error) {
      console.error("Fehler beim Markieren aller als gelesen:", error);
      throw error;
    }
  }

  /**
   * Einzelne Benachrichtigung löschen
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await api.delete(`/notification/${notificationId}`);

      // Cache invalidieren
      this.invalidateCache();

      // Trigger update für Badge-Counter
      this.notifyListeners();
    } catch (error) {
      console.error("Fehler beim Löschen der Benachrichtigung:", error);
      throw error;
    }
  }

  /**
   * Alle Benachrichtigungen löschen
   */
  async deleteAllNotifications(): Promise<void> {
    try {
      await api.delete("/notification/all");

      // Cache invalidieren
      this.invalidateCache();

      // Trigger update für Badge-Counter
      this.notifyListeners();
    } catch (error) {
      console.error("Fehler beim Löschen aller Benachrichtigungen:", error);
      throw error;
    }
  }

  /**
   * Polling für Live-Updates starten (alle 30 Sekunden)
   */
  startPolling(): void {
    // Vorheriges Polling stoppen falls vorhanden
    this.stopPolling();

    // Sofortiger erster Aufruf
    this.notifyListeners();

    // Polling alle 30 Sekunden
    this.pollingInterval = setInterval(async () => {
      try {
        await this.notifyListeners();
      } catch (error) {
        console.warn("Polling-Fehler bei Benachrichtigungen:", error);
      }
    }, 30000); // 30 Sekunden
  }

  /**
   * Polling stoppen
   */
  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Listener für Badge-Updates hinzufügen
   */
  addCountListener(callback: (count: number) => void): void {
    this.listeners.push(callback);
  }

  /**
   * Listener entfernen
   */
  removeCountListener(callback: (count: number) => void): void {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Alle Listener benachrichtigen
   */
  private async notifyListeners(): Promise<void> {
    try {
      const count = await this.getNotificationCount();

      // Alle registrierten Listener benachrichtigen
      this.listeners.forEach((callback) => {
        try {
          callback(count);
        } catch (error) {
          console.error("Fehler beim Benachrichtigen eines Listeners:", error);
        }
      });

      // Custom Event für Badge-Update in der Sidebar
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("notification-count-updated", {
            detail: { count },
          })
        );
      }
    } catch (error) {
      console.error("Fehler beim Benachrichtigen der Listener:", error);
    }
  }

  /**
   * Service für Cleanup bereinigen
   */
  cleanup(): void {
    this.stopPolling();
    this.listeners = [];
    this.invalidateCache();
  }

  /**
   * Cache-Hilfsmethoden für bessere Performance
   */
  private notificationCache = new Map<string, NotificationDisplay[]>();
  private cacheTimestamp = 0;
  private readonly CACHE_DURATION = 60000; // 1 Minute

  /**
   * Benachrichtigungen mit Caching abrufen
   */
  async getNotificationsCached(): Promise<NotificationDisplay[]> {
    const now = Date.now();
    const cacheKey = "notifications";

    // Cache prüfen
    if (this.notificationCache.has(cacheKey) && now - this.cacheTimestamp < this.CACHE_DURATION) {
      return this.notificationCache.get(cacheKey)!;
    }

    // Neue Daten laden
    const notifications = await this.getNotifications();

    // Cache aktualisieren
    this.notificationCache.set(cacheKey, notifications);
    this.cacheTimestamp = now;

    return notifications;
  }

  /**
   * Cache invalidieren (nach Änderungen)
   */
  private invalidateCache(): void {
    this.notificationCache.clear();
    this.cacheTimestamp = 0;
  }

  /**
   * Filter-Methoden für Frontend
   */
  filterByType(notifications: NotificationDisplay[], type: string): NotificationDisplay[] {
    if (type === "all") return notifications;
    if (type === "unread") return notifications.filter((n) => !n.isRead);
    // Für Kategorien: Zeige ALLE Nachrichten dieser Kategorie (gelesen und ungelesen)
    return notifications.filter((n) => n.type === type);
  }

  /**
   * Statistiken für Dashboard berechnen
   */
  getNotificationStats(notifications: NotificationDisplay[]): {
    total: number;
    unread: number;
    byType: Record<string, number>;
  } {
    const stats = {
      total: notifications.length,
      unread: notifications.filter((n) => !n.isRead).length,
      byType: {} as Record<string, number>,
    };

    // Statistiken nach Typ
    notifications.forEach((notification) => {
      const type = notification.type;
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    });

    return stats;
  }
}

// Singleton-Instanz exportieren
export const notificationService = new NotificationService();

// Service als Default exportieren für einfachere Verwendung
export default notificationService;
