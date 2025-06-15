// src/services/ticket.service.ts
import api from "@/services/axiosInstance";
import { authService } from "./auth.service";
import axios from "axios";
// Ticket-Status-Typen
export enum TicketStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  CANCELED = "CANCELED",
  CLOSED = "CLOSED",
}

// Ticket-Kategorie
export enum TicketCategory {
  ACCOUNT = "ACCOUNT",
  TECHNICAL = "TECHNICAL",
  REPORT = "REPORT",
  OTHER = "OTHER",
}

// Ticket-Interface
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  category: TicketCategory;
  createdAt: string;
  updatedAt: string;
  assignedTo: string | null;
  messages: TicketMessage[];
}

// Ticket-Nachricht-Interface
export interface TicketMessage {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userRole: string,
  message: string,
  createdAt: string,
  isStaff: boolean,
}

// Mock-Daten für Tickets während der Entwicklung


// API URL - Für Entwicklung und Produktion
const API_URL = import.meta.env.VITE_BASE_URL;
console.log("API URL:", API_URL);
export const ticketService = {
  // Alle Tickets abrufen mit Filtern
  async cancelTicket(id: string) {
    const token = authService.getAdminAccessToken();
    const response = await api.post(
      `${API_URL}tickets/${id}/cancel`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(response)
    return response.data;
  },

  async closeTicket(id: string) {
    const token = authService.getAdminAccessToken();
    const response = await api.post(
      `${API_URL}tickets/${id}/close`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(response)
    return response.data;
  },

  async takeTicket(id: string) {
    const token = authService.getAdminAccessToken();
    const response = await api.post(
      `${API_URL}tickets/${id}/take`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(response)
    return response.data;
  },

  async reassignTicket(id: string, newAssigneeId: string) {
    const token = authService.getAdminAccessToken();
    const response = await api.post(
      `${API_URL}tickets/${id}/reassign`,
      {
        newAssigneeId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(response)
    return response.data;
  },

  async getTicketsByModerator(moderatorId: string) {
    const response = await api.get(
      `${API_URL}tickets/by-moderator/${moderatorId}`,
      {
        headers: {
        },
      }
    );
    console.log(response)
    return response.data;
  },

  async getTickets(filters: any = {}) {
    try {
      // Im Entwicklungsmodus: Mock-Daten verwenden
        // Im Produktionsmodus: API-Aufruf
        const response = await api.get(`${API_URL}tickets/all`, {
          headers: {
            "Content-Type": "application/json",
          },
          params: filters,
        });
        console.log(response)
        return response.data;
    } catch (error) {
      console.error("Fehler beim Abrufen der Tickets:", error);
      return []; // Leeres Array im Fehlerfall zurückgeben
    }
  },

  // Ein einzelnes Ticket abrufen
  async getTicketById(id: string) {
    try {
        const response = await api.get(`${API_URL}tickets/${id}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log(response)
        return response.data;
    } catch (error) {
      console.error(`Fehler beim Abrufen des Tickets mit ID ${id}:`, error);
      return null; // Null im Fehlerfall zurückgeben
    }
  },

  // Ticket erstellen
  async createTicket(ticketData: Partial<Ticket> | FormData) {
    try {
      const response = await api.post(`${API_URL}tickets/create`, ticketData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Ticket erstellt:", response);
      console.log(response)
      return response.data;
    } catch (error) {
      console.error("Fehler beim Erstellen des Tickets:", error);
      throw error;
    }
  },

  // Nachricht zu einem Ticket hinzufügen
  async addMessage(
    ticketId: string,
    message: string,
    userId: string,
    userName: string,
    userRole: string,
    isStaff: boolean
  ) {
    try {
        // Im Produktionsmodus: API-Aufruf
        const response = await api.post(
          `${API_URL}/tickets/${ticketId}/messages`,
          {
            message,
            userId,
            userName,
            userRole,
            isStaff,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log(response)
        return response.data;
    } catch (error) {
      console.error(
        `Fehler beim Hinzufügen einer Nachricht zum Ticket mit ID ${ticketId}:`,
        error
      );
      throw error;
    }
  },

  // Ticket-Statistiken abrufen
  async getTicketStats() {
    try {
     
        // Im Produktionsmodus: API-Aufruf
        const token = authService.getAdminAccessToken();
        const response = await api.get(`${API_URL}tickets/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log(response)
        return response.data;
    } catch (error) {
      console.error("Fehler beim Abrufen der Ticket-Statistiken:", error);
      return {
        total: 0,
        byStatus: {
          [TicketStatus.OPEN]: 0,
          [TicketStatus.IN_PROGRESS]: 0,
          [TicketStatus.WAITING]: 0,
          [TicketStatus.RESOLVED]: 0,
          [TicketStatus.CLOSED]: 0,
        },
        byCategory: {
          [TicketCategory.ACCOUNT]: 0,
          [TicketCategory.TECHNICAL]: 0,
          [TicketCategory.REPORT]: 0,
          [TicketCategory.OTHER]: 0,
        },
      };
    }
  },

  // Verfügbare Admins abrufen
  async getAvailableAdmins() {
  try {
    const token = authService.getAdminAccessToken();
    const response = await api.get(`${API_URL}user/getAllUsers`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // Nur ADMIN und MODERATOR zurückgeben
    return response.data.filter((user: any) =>
      ["ADMIN", "MODERATOR"].includes(user.role)
    );
  } catch (error) {
    console.error("Fehler beim Abrufen der Benutzer:", error);
    return [];
  }
},

  // Ticket löschen
  async deleteTicket(id: string) {
    try {
        // Im Produktionsmodus: API-Aufruf
        const token = authService.getAdminAccessToken();
        const response = await axios.delete(`${API_URL}tickets/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response)
        return response.data;
      
    } catch (error) {
      console.error(`Fehler beim Löschen des Tickets mit ID ${id}:`, error);
      throw error;
    }
  },
};
