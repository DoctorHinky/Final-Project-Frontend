// src/services/member.ticket.service.ts
import api from "@/services/axiosInstance";

// Ticket-Status-Typen
export enum TicketStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  WAITING = "WAITING",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

// Ticket-Kategorie
export enum TicketCategory {
  ACCOUNT = "ACCOUNT",
  TECHNICAL = "TECHNICAL",
  WEBSITE_BUG = "WEBSITE_BUG",
  REPORT = "REPORT",
  OTHER = "OTHER",
}

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
}

// Vollständiges Ticket-Interface
export interface FullTicket extends UserTicket {
  description: string;
  messages?: TicketMessage[];
  files?: TicketFile[];
}

// Ticket-Nachricht-Interface
export interface TicketMessage {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userRole: string;
  message: string;
  createdAt: string;
  isStaff: boolean;
}

// Ticket-Datei-Interface
export interface TicketFile {
  id: string;
  ticketId: string;
  url: string;
  publicId: string;
  uploadedAt: string;
}

// Create-Ticket-Response
export interface CreateTicketResponse {
  message: string;
  ticketId: string;
}

// Mock-Daten für Entwicklung
const mockUserTickets: FullTicket[] = [
  {
    id: "usr_ticket_001",
    title: "Problem beim Einloggen",
    description: "Ich kann mich seit gestern nicht mehr in meinen Account einloggen. Die Passwort-Reset-E-Mail kommt nicht an.",
    status: TicketStatus.OPEN,
    category: TicketCategory.ACCOUNT,
    createdAt: "2025-06-15T14:30:00Z",
    updatedAt: "2025-06-15T14:30:00Z",
    messageCount: 1,
    hasUnreadMessages: false,
    messages: [
      {
        id: "msg_001",
        ticketId: "usr_ticket_001",
        userId: "currentUser",
        userName: "Max Mustermann",
        userRole: "user",
        message: "Ich habe bereits versucht, das Passwort über 'Passwort vergessen' zurückzusetzen, aber die E-Mail kommt nicht an. Auch im Spam-Ordner ist nichts.",
        createdAt: "2025-06-15T14:35:00Z",
        isStaff: false,
      }
    ]
  },
  {
    id: "usr_ticket_002",
    title: "Artikel wird nicht gespeichert",
    description: "Wenn ich versuche, meinen Artikel zu speichern, bekomme ich eine Fehlermeldung und die Änderungen gehen verloren.",
    status: TicketStatus.IN_PROGRESS,
    category: TicketCategory.TECHNICAL,
    createdAt: "2025-06-14T09:15:00Z",
    updatedAt: "2025-06-15T11:20:00Z",
    messageCount: 3,
    hasUnreadMessages: true,
    messages: [
      {
        id: "msg_002",
        ticketId: "usr_ticket_002",
        userId: "currentUser",
        userName: "Max Mustermann",
        userRole: "user",
        message: "Das Problem tritt besonders bei längeren Artikeln auf. Die Fehlermeldung lautet: 'Zeitüberschreitung beim Speichern'.",
        createdAt: "2025-06-14T09:20:00Z",
        isStaff: false,
      },
      {
        id: "msg_003",
        ticketId: "usr_ticket_002",
        userId: "support_001",
        userName: "Sarah Schmidt",
        userRole: "support",
        message: "Hallo Max, vielen Dank für Ihre Meldung. Wir haben das Problem identifiziert und arbeiten an einer Lösung. Können Sie uns bitte die ungefähre Länge Ihres Artikels mitteilen?",
        createdAt: "2025-06-14T15:45:00Z",
        isStaff: true,
      },
      {
        id: "msg_004",
        ticketId: "usr_ticket_002",
        userId: "support_001",
        userName: "Sarah Schmidt",
        userRole: "support",
        message: "Update: Wir haben einen Fix implementiert. Bitte versuchen Sie es erneut und lassen Sie uns wissen, ob das Problem weiterhin besteht.",
        createdAt: "2025-06-15T11:20:00Z",
        isStaff: true,
      }
    ]
  },
  {
    id: "usr_ticket_003",
    title: "Profilbild kann nicht hochgeladen werden",
    description: "Das Hochladen meines Profilbildes funktioniert nicht. Es wird immer 'Datei zu groß' angezeigt, obwohl die Datei nur 1MB hat.",
    status: TicketStatus.RESOLVED,
    category: TicketCategory.TECHNICAL,
    createdAt: "2025-06-10T16:45:00Z",
    updatedAt: "2025-06-12T10:30:00Z",
    messageCount: 4,
    hasUnreadMessages: false,
    messages: [
      {
        id: "msg_005",
        ticketId: "usr_ticket_003",
        userId: "currentUser",
        userName: "Max Mustermann",
        userRole: "user",
        message: "Die Datei ist ein JPEG mit 1024x1024 Pixeln und etwa 980KB groß.",
        createdAt: "2025-06-10T16:50:00Z",
        isStaff: false,
      },
      {
        id: "msg_006",
        ticketId: "usr_ticket_003",
        userId: "support_002",
        userName: "Tech Support",
        userRole: "support",
        message: "Danke für die Details. Wir haben einen Bug in der Dateigröße-Überprüfung gefunden. Dieser wird mit dem nächsten Update behoben.",
        createdAt: "2025-06-11T09:15:00Z",
        isStaff: true,
      },
      {
        id: "msg_007",
        ticketId: "usr_ticket_003",
        userId: "support_002",
        userName: "Tech Support",
        userRole: "support",
        message: "Das Problem wurde behoben. Sie sollten nun Ihr Profilbild ohne Probleme hochladen können.",
        createdAt: "2025-06-12T10:30:00Z",
        isStaff: true,
      },
      {
        id: "msg_008",
        ticketId: "usr_ticket_003",
        userId: "currentUser",
        userName: "Max Mustermann",
        userRole: "user",
        message: "Perfekt! Das Hochladen funktioniert jetzt einwandfrei. Vielen Dank!",
        createdAt: "2025-06-12T14:20:00Z",
        isStaff: false,
      }
    ]
  }
];

export const memberTicketService = {
  // ===== USER TICKET FUNKTIONEN =====
  
  // Ticket für User erstellen
  async createTicket(formData: FormData): Promise<CreateTicketResponse> {
    try {
      // Im Entwicklungsmodus: Mock-Verhalten
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulierte Verzögerung
        
        const mockTicketId = `usr_ticket_${Date.now()}`;
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const category = formData.get('category') as TicketCategory;
        
        // Mock-Ticket zu den bestehenden hinzufügen
        const newTicket: FullTicket = {
          id: mockTicketId,
          title: title || "Neues Support-Ticket",
          description: description || "",
          status: TicketStatus.OPEN,
          category: category || TicketCategory.OTHER,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messageCount: 0,
          hasUnreadMessages: false,
          messages: [],
        };
        
        mockUserTickets.unshift(newTicket);
        
        return {
          message: "Ihr Support-Ticket wurde erfolgreich erstellt",
          ticketId: mockTicketId
        };
      } else {
        // Im Produktionsmodus: API-Aufruf
        const response = await api.post(`/tickets/create`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      }
    } catch (error) {
      console.error("Fehler beim Erstellen des Support-Tickets:", error);
      throw new Error("Ticket konnte nicht erstellt werden. Bitte versuchen Sie es später erneut.");
    }
  },

  // Eigene Tickets abrufen (Übersicht)
  async getMyTickets(): Promise<UserTicket[]> {
    try {
      // Im Entwicklungsmodus: Mock-Daten verwenden
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 800)); // Simulierte Verzögerung

        // Vereinfachte Ticket-Daten für die Übersicht
        const userTickets: UserTicket[] = mockUserTickets.map(ticket => ({
          id: ticket.id,
          title: ticket.title,
          status: ticket.status,
          category: ticket.category,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt,
          messageCount: ticket.messageCount || 0,
          hasUnreadMessages: ticket.hasUnreadMessages || false
        }));

        return userTickets;
      } else {
        // Im Produktionsmodus: API-Aufruf
        const response = await api.get(`/tickets/myTickets`);
        return response.data;
      }
    } catch (error) {
      console.error("Fehler beim Abrufen der Tickets:", error);
      throw new Error("Tickets konnten nicht geladen werden.");
    }
  },

  // Einzelnes User-Ticket abrufen (vollständige Details)
  async getTicketById(id: string): Promise<FullTicket | null> {
    try {
      // Im Entwicklungsmodus: Mock-Daten verwenden
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulierte Verzögerung
        
        const ticket = mockUserTickets.find(t => t.id === id);
        if (ticket) {
          // Simuliere "gelesen" Status-Update
          ticket.hasUnreadMessages = false;
        }
        return ticket || null;
      } else {
        // Im Produktionsmodus: API-Aufruf
        const response = await api.get(`/tickets/${id}`);
        return response.data;
      }
    } catch (error) {
      console.error(`Fehler beim Abrufen des Tickets mit ID ${id}:`, error);
      throw new Error("Ticket-Details konnten nicht geladen werden.");
    }
  },

  // Nachricht zu Ticket hinzufügen
  async addMessageToTicket(ticketId: string, message: string): Promise<TicketMessage[]> {
    try {
      // Im Entwicklungsmodus: Mock-Verhalten
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 700)); // Simulierte Verzögerung

        const ticket = mockUserTickets.find(t => t.id === ticketId);
        if (!ticket) {
          throw new Error("Ticket nicht gefunden");
        }

        const newMessage: TicketMessage = {
          id: `msg_${Date.now()}`,
          ticketId,
          userId: "currentUser",
          userName: "Max Mustermann",
          userRole: "user",
          message: message.trim(),
          createdAt: new Date().toISOString(),
          isStaff: false,
        };

        if (!ticket.messages) {
          ticket.messages = [];
        }
        ticket.messages.push(newMessage);
        ticket.updatedAt = new Date().toISOString();
        ticket.messageCount = ticket.messages.length;

        return ticket.messages;
      } else {
        // Im Produktionsmodus: API-Aufruf
        const response = await api.post(`/tickets/${ticketId}/message`, {
          message: message.trim()
        });
        return response.data;
      }
    } catch (error) {
      console.error(`Fehler beim Hinzufügen einer Nachricht zum Ticket ${ticketId}:`, error);
      throw new Error("Nachricht konnte nicht gesendet werden.");
    }
  },

  // Ticket schließen (User kann eigene Tickets schließen)
  async closeTicket(ticketId: string): Promise<boolean> {
    try {
      // Im Entwicklungsmodus: Mock-Verhalten
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulierte Verzögerung

        const ticket = mockUserTickets.find(t => t.id === ticketId);
        if (ticket) {
          ticket.status = TicketStatus.CLOSED;
          ticket.updatedAt = new Date().toISOString();
          
          // Automatische Abschluss-Nachricht hinzufügen
          const closeMessage: TicketMessage = {
            id: `msg_close_${Date.now()}`,
            ticketId,
            userId: "system",
            userName: "System",
            userRole: "system",
            message: "Dieses Ticket wurde vom Benutzer geschlossen.",
            createdAt: new Date().toISOString(),
            isStaff: true,
          };
          
          if (!ticket.messages) {
            ticket.messages = [];
          }
          ticket.messages.push(closeMessage);
          ticket.messageCount = ticket.messages.length;
        }

        return true;
      } else {
        // Im Produktionsmodus: API-Aufruf
        const response = await api.post(`/tickets/${ticketId}/close`);
        return response.status === 200;
      }
    } catch (error) {
      console.error(`Fehler beim Schließen des Tickets ${ticketId}:`, error);
      throw new Error("Ticket konnte nicht geschlossen werden.");
    }
  },

  // ===== UTILITY FUNCTIONS =====
  
  // Status-Formatierung für UI
  formatStatus(status: TicketStatus): string {
    const statusMap: Record<TicketStatus, string> = {
      [TicketStatus.OPEN]: 'Offen',
      [TicketStatus.IN_PROGRESS]: 'In Bearbeitung',
      [TicketStatus.WAITING]: 'Wartend',
      [TicketStatus.RESOLVED]: 'Gelöst',
      [TicketStatus.CLOSED]: 'Geschlossen'
    };
    return statusMap[status] || status;
  },

  // Kategorie-Formatierung für UI
  formatCategory(category: TicketCategory): string {
    const categoryMap: Record<TicketCategory, string> = {
      [TicketCategory.ACCOUNT]: 'Konto & Anmeldung',
      [TicketCategory.TECHNICAL]: 'Technisches Problem',
      [TicketCategory.WEBSITE_BUG]: 'Website-Fehler',
      [TicketCategory.REPORT]: 'Inhalte melden',
      [TicketCategory.OTHER]: 'Sonstiges'
    };
    return categoryMap[category] || category;
  },

  // Ticket-Statistiken berechnen
  getTicketStats(tickets: UserTicket[]) {
    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === TicketStatus.OPEN).length,
      inProgress: tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length,
      waiting: tickets.filter(t => t.status === TicketStatus.WAITING).length,
      resolved: tickets.filter(t => t.status === TicketStatus.RESOLVED).length,
      closed: tickets.filter(t => t.status === TicketStatus.CLOSED).length,
      unread: tickets.filter(t => t.hasUnreadMessages).length
    };
  },

  // Ticket-Priorität bestimmen (basierend auf Status und Alter)
  getTicketPriority(ticket: UserTicket): 'high' | 'medium' | 'low' {
    const daysSinceCreation = (Date.now() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    
    if (ticket.status === TicketStatus.OPEN && daysSinceCreation > 3) {
      return 'high';
    } else if (ticket.status === TicketStatus.IN_PROGRESS) {
      return 'medium';
    } else {
      return 'low';
    }
  },

  // Kann User auf Ticket antworten?
  canReplyToTicket(ticket: UserTicket | FullTicket): boolean {
    return ticket.status !== TicketStatus.CLOSED && ticket.status !== TicketStatus.RESOLVED;
  },

  // Kann User Ticket schließen?
  canCloseTicket(ticket: UserTicket | FullTicket): boolean {
    return ticket.status !== TicketStatus.CLOSED && ticket.status !== TicketStatus.RESOLVED;
  }
};

export default memberTicketService;