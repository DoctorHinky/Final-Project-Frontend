// src/services/ticket.service.ts
import api from "@/services/axiosInstance";
// Ticket-Status-Typen
import { TicketCategory, type Ticket } from "@/types";
// API URL - Für Entwicklung und Produktion
const ticketService = {
  // Alle Tickets abrufen mit Filtern
  async cancelTicket(id: string) {
    const response = await api.post(
      `tickets/${id}/close`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  async closeTicket(id: string) {
    const response = await api.post(
      `tickets/${id}/close`,
      {},
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  },

  async takeTicket(id: string) {
    const response = await api.post(
      `tickets/${id}/take`,
      {},
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  },

  async reassignTicket(id: string, newAssigneeId: string) {
    const response = await api.post(
      `tickets/${id}/reassign`,
      {
        newAssigneeId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  async getMyTickets() {
    const response = await api.get(`tickets/my-tickets`, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  },

  async getTicketsByModerator(moderatorId: string) {
    const response = await api.get(`tickets/by-moderator/${moderatorId}`, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  },

  async getTickets(filters: any = {}) {
    try {
      const response = await api.get(`tickets/all`, {
        headers: { "Content-Type": "application/json" },
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error("Fehler beim Abrufen der Tickets:", error);
      return []; // Leeres Array im Fehlerfall zurückgeben
    }
  },

  // Ein einzelnes Ticket abrufen
  async getTicketById(id: string) {
    try {
      const response = await api.get(`tickets/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Fehler beim Abrufen des Tickets mit ID ${id}:`, error);
      return null; // Null im Fehlerfall zurückgeben
    }
  },

  // Ticket erstellen
  async createTicket(ticketData: Partial<Ticket> | FormData) {
    try {
      const response = await api.post(`tickets/create`, ticketData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    } catch (error) {
      console.error("Fehler beim Erstellen des Tickets:", error);
      throw error;
    }
  },

  // Nachricht zu einem Ticket hinzufügen
  async addMessage(ticketId: string, message: string) {
    try {
      const response = await api.post(
        `tickets/${ticketId}/message`,
        { message }, // nur das message-Feld senden
        { headers: { "Content-Type": "application/json" } }
      );

      return response.data;
    } catch (error) {
      console.error(`Fehler beim Hinzufügen einer Nachricht zum Ticket mit ID ${ticketId}:`, error);
      throw error;
    }
  },

  async updateTicketCategory(ticketId: string, category: TicketCategory) {
    try {
      const response = await api.patch(
        `tickets/${ticketId}`,
        { category },
        { headers: { "Content-Type": "application/json" } }
      );

      return response.data;
    } catch (error) {
      console.error(`Fehler beim Aktualisieren der Kategorie des Tickets mit ID ${ticketId}:`, error);
      throw error;
    }
  },

  async reopenTicket(ticketId: string) {
    try {
      const response = await api.post(
        `tickets/${ticketId}/reopen`,
        {},
        { headers: { "Content-Type": "application/json" } }
      );

      return response.data;
    } catch (error) {
      console.error(`Fehler beim Wiedereröffnen des Tickets mit ID ${ticketId}:`, error);
      throw error;
    }
  },

  // Verfügbare Admins abrufen
  async getAvailableAdmins() {
    try {
      const response = await api.get(`user/getAllUsers`, {
        headers: { "Content-Type": "application/json" },
      });

      // Nur ADMIN und MODERATOR zurückgeben
      return response.data.filter((user: any) => ["ADMIN", "MODERATOR"].includes(user.role));
    } catch (error) {
      console.error("Fehler beim Abrufen der Benutzer:", error);
      return [];
    }
  },
};

export default ticketService;
