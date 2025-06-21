// src/services/member.ticket.service.ts
import api from "@/services/axiosInstance";
import { getCurrentUserId } from "@/utils/auth.helper";
import router from "@/router";

// Ticket-Status-Typen
export const TicketStatus = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  CLOSED: "CLOSED",
} as const;

export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus];

// Ticket-Kategorie
export const TicketCategory = {
  ACCOUNT: "ACCOUNT",
  TECHNICAL: "TECHNICAL",
  WEBSITE_BUG: "WEBSITE_BUG",
  REPORT: "REPORT",
  OTHER: "OTHER",
} as const;

export type TicketCategory = (typeof TicketCategory)[keyof typeof TicketCategory];

// Ticket-Interface für User
export interface UserTicket {
  id: string;
  title: string;
  description?: string;
  status: TicketStatus;
  category: TicketCategory;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
  hasUnreadMessages?: boolean;
  _count?: {
    messages: number;
    Files?: number;
  };
  workedBy?: {
    id: string;
    username: string;
    email: string;
  };
}

// Vollständiges Ticket-Interface
export interface FullTicket extends UserTicket {
  description: string;
  messages?: TicketMessage[];
  files?: TicketFile[];
  Files?: TicketFile[]; // Backend nutzt "Files" mit großem F
  userFile?: {
    user: {
      id: string;
      username: string;
      email: string;
    };
  };
}

// Ticket-Nachricht-Interface
export interface TicketMessage {
  id: string;
  ticketId?: string;
  authorId?: string;
  content: string;
  createdAt: string;
  author?: {
    id: string;
    username: string;
    email?: string;
    role?: string;
  };
  // Computed fields für Frontend
  isStaff?: boolean;
  userName?: string;
  userRole?: string;
}

// Ticket-Datei-Interface
export interface TicketFile {
  id: string;
  ticketId: string;
  url: string;
  publicId: string;
  uploadedAt?: string;
}

// Create-Ticket-Response
export interface CreateTicketResponse {
  message?: string;
  ticketId: string;
  id?: string;
  success?: boolean;
}

export const memberTicketService = {
  // ===== USER TICKET FUNKTIONEN =====

  // Ticket für User erstellen
  async createTicket(formData: FormData): Promise<CreateTicketResponse> {
    try {
      const response = await api.post(`/tickets/create`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Response normalisieren
      return {
        ticketId: response.data.ticketId || response.data.id,
        id: response.data.ticketId || response.data.id,
        message: response.data.message || "Ticket erfolgreich erstellt",
        success: true,
      };
    } catch (error: any) {
      console.error("Fehler beim Erstellen des Support-Tickets:", error);
      console.error("Error details:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Ticket konnte nicht erstellt werden. Bitte versuchen Sie es später erneut."
      );
    }
  },

  // Eigene Tickets abrufen - NUTZT JETZT by-user ROUTE!
  async getMyTickets(): Promise<UserTicket[]> {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        console.error("User nicht eingeloggt");
        return [];
      }

      console.log("Fetching tickets for user:", userId);

      // Nutze die by-user Route statt myTickets
      const response = await api.get(`/tickets/by-user/${userId}`);

      // Backend gibt String zurück wenn keine Tickets vorhanden
      if (typeof response.data === "string") {
        console.log("No tickets message:", response.data);
        return [];
      }

      // Response-Daten normalisieren
      const tickets = Array.isArray(response.data) ? response.data : [];
      console.log("Tickets found:", tickets.length);

      return tickets.map((ticket: any) => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        category: ticket.category,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        messageCount: ticket._count?.messages || 0,
        hasUnreadMessages: false,
        _count: ticket._count,
        workedBy: ticket.workedBy,
      }));
    } catch (error: any) {
      console.error("Fehler beim Abrufen der Tickets:", error);
      console.error("Error response:", error.response?.data);

      // Bei Authentifizierungsfehler
      if (error.response?.status === 401) {
        console.error("Nicht authentifiziert - bitte neu anmelden");
        // window.location.href = '/login';
        router.push("/login");
      }

      return [];
    }
  },

  // Einzelnes Ticket abrufen (vollständige Details)
  async getTicketById(id: string): Promise<FullTicket | null> {
    try {
      const response = await api.get(`/tickets/${id}`);
      const ticketData = response.data;

      if (!ticketData) return null;

      // Messages normalisieren
      if (ticketData.messages) {
        ticketData.messages = ticketData.messages.map((msg: any) => {
          const isStaff =
            msg.author?.role === "ADMIN" ||
            msg.author?.role === "MODERATOR" ||
            msg.author?.id === ticketData.workedBy?.id;

          return {
            ...msg,
            isStaff,
            userName: msg.author?.username || "Unbekannt",
            userRole: msg.author?.role || "USER",
            message: msg.content, // Frontend erwartet "message"
            content: msg.content,
          };
        });
      }

      // Files/files normalisieren
      if (ticketData.Files) {
        ticketData.files = ticketData.Files;
      }

      return ticketData;
    } catch (error: any) {
      console.error(`Fehler beim Abrufen des Tickets mit ID ${id}:`, error);
      console.error("Error details:", error.response?.data);
      return null;
    }
  },

  // Einzelnes User-Ticket abrufen (Alias)
  async getUserTicketById(id: string): Promise<FullTicket | null> {
    return this.getTicketById(id);
  },

  // Nachricht zu Ticket hinzufügen
  async addMessageToTicket(ticketId: string, message: string): Promise<void> {
    try {
      await api.post(`/tickets/${ticketId}/message`, {
        message: message.trim(),
      });
    } catch (error: any) {
      console.error(`Fehler beim Hinzufügen einer Nachricht zum Ticket ${ticketId}:`, error);
      console.error("Error details:", error.response?.data);
      throw new Error(error.response?.data?.message || "Nachricht konnte nicht gesendet werden.");
    }
  },

  // Ticket schließen (User kann eigene Tickets schließen)
  async closeTicket(ticketId: string): Promise<void> {
    try {
      await api.post(`/tickets/${ticketId}/close`);
    } catch (error: any) {
      console.error(`Fehler beim Schließen des Tickets ${ticketId}:`, error);
      console.error("Error details:", error.response?.data);
      throw new Error(error.response?.data?.message || "Ticket konnte nicht geschlossen werden.");
    }
  },

  // Ticket wieder öffnen (nur für Moderatoren/Admins laut Backend)
  async reopenTicket(ticketId: string): Promise<void> {
    try {
      await api.post(`/tickets/${ticketId}/reopen`);
    } catch (error: any) {
      console.error(`Fehler beim Wiedereröffnen des Tickets ${ticketId}:`, error);
      console.error("Error details:", error.response?.data);

      // Wenn User keine Berechtigung hat
      if (error.response?.status === 403) {
        throw new Error("Sie haben keine Berechtigung, dieses Ticket wieder zu öffnen.");
      }

      throw new Error(error.response?.data?.message || "Ticket konnte nicht wieder geöffnet werden.");
    }
  },

  // Alle Tickets eines bestimmten Users abrufen
  async getTicketsByUserId(userId: string): Promise<UserTicket[]> {
    try {
      const response = await api.get(`/tickets/by-user/${userId}`);

      if (typeof response.data === "string") {
        return [];
      }

      const tickets = Array.isArray(response.data) ? response.data : [];

      return tickets.map((ticket: any) => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        category: ticket.category,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        messageCount: ticket._count?.messages || 0,
        hasUnreadMessages: false,
        _count: ticket._count,
        workedBy: ticket.workedBy,
      }));
    } catch (error: any) {
      console.error(`Fehler beim Abrufen der Tickets für User ${userId}:`, error);
      return [];
    }
  },

  // ===== UTILITY FUNCTIONS =====

  // Status-Formatierung für UI
  formatStatus(status: TicketStatus): string {
    const statusMap: Record<TicketStatus, string> = {
      [TicketStatus.OPEN]: "Offen",
      [TicketStatus.IN_PROGRESS]: "In Bearbeitung",
      [TicketStatus.CLOSED]: "Geschlossen",
    };
    return statusMap[status] || status;
  },

  // Kategorie-Formatierung für UI
  formatCategory(category: TicketCategory): string {
    const categoryMap: Record<TicketCategory, string> = {
      [TicketCategory.ACCOUNT]: "Konto & Anmeldung",
      [TicketCategory.TECHNICAL]: "Technisches Problem",
      [TicketCategory.WEBSITE_BUG]: "Website-Fehler",
      [TicketCategory.REPORT]: "Inhalte melden",
      [TicketCategory.OTHER]: "Sonstiges",
    };
    return categoryMap[category] || category;
  },

  // Ticket-Statistiken berechnen
  getTicketStats(tickets: UserTicket[]) {
    return {
      total: tickets.length,
      open: tickets.filter((t) => t.status === TicketStatus.OPEN).length,
      inProgress: tickets.filter((t) => t.status === TicketStatus.IN_PROGRESS).length,
      closed: tickets.filter((t) => t.status === TicketStatus.CLOSED).length,
      unread: tickets.filter((t) => t.hasUnreadMessages).length,
    };
  },

  // Ticket-Priorität bestimmen (basierend auf Status und Alter)
  getTicketPriority(ticket: UserTicket): "high" | "medium" | "low" {
    const daysSinceCreation = (Date.now() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60 * 24);

    if (ticket.status === TicketStatus.OPEN && daysSinceCreation > 3) {
      return "high";
    } else if (ticket.status === TicketStatus.IN_PROGRESS) {
      return "medium";
    } else {
      return "low";
    }
  },

  // Kann User auf Ticket antworten?
  canReplyToTicket(ticket: UserTicket | FullTicket): boolean {
    return ticket.status !== TicketStatus.CLOSED;
  },

  // Kann User Ticket schließen?
  canCloseTicket(ticket: UserTicket | FullTicket): boolean {
    return ticket.status !== TicketStatus.CLOSED;
  },

  // Debug-Funktion für Entwicklung
  async testConnection(): Promise<void> {
    try {
      console.log("Testing ticket service connection...");
      const userId = getCurrentUserId();
      console.log("Current user ID:", userId);

      const tickets = await this.getMyTickets();
      console.log("Connection successful, tickets:", tickets);
    } catch (error) {
      console.error("Connection test failed:", error);
    }
  },
};

export default memberTicketService;
