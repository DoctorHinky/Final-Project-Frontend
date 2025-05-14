// src/services/ticket.service.ts
import axios from 'axios';
import { authService } from './auth.service';

// Ticket-Status-Typen
export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING = 'WAITING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

// Ticket-Priorität
export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Ticket-Kategorie
export enum TicketCategory {
  ACCOUNT = 'ACCOUNT',
  PAYMENT = 'PAYMENT',
  TECHNICAL = 'TECHNICAL',
  CONTENT = 'CONTENT',
  OTHER = 'OTHER'
}

// Ticket-Interface
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  createdAt: string;
  updatedAt: string;
  assignedTo: string | null;
  createdBy: string;
  messages?: TicketMessage[];
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

// Mock-Daten für Tickets während der Entwicklung
const mockTickets: Ticket[] = [
  {
    id: '1',
    title: 'Login-Problem',
    description: 'Ich kann mich seit heute Morgen nicht mehr einloggen. Bei jedem Versuch erscheint "Ungültige Anmeldedaten", obwohl ich mir sicher bin, dass mein Passwort korrekt ist.',
    status: TicketStatus.OPEN,
    priority: TicketPriority.HIGH,
    category: TicketCategory.ACCOUNT,
    createdAt: '2025-05-10T10:30:00Z',
    updatedAt: '2025-05-10T11:45:00Z', 
    assignedTo: null,
    createdBy: 'user123',
    messages: [
      {
        id: 'm1',
        ticketId: '1',
        userId: 'user123',
        userName: 'Max Mustermann',
        userRole: 'user',
        message: 'Ich habe es mit verschiedenen Browsern probiert, aber das Problem bleibt bestehen.',
        createdAt: '2025-05-10T10:35:00Z',
        isStaff: false
      }
    ]
  },
  {
    id: '2',
    title: 'Fehler beim Artikel-Upload',
    description: 'Beim Versuch, meinen neuen Artikel hochzuladen, erscheint eine Fehlermeldung: "Format nicht unterstützt".',
    status: TicketStatus.IN_PROGRESS,
    priority: TicketPriority.MEDIUM,
    category: TicketCategory.TECHNICAL,
    createdAt: '2025-05-09T15:20:00Z',
    updatedAt: '2025-05-11T09:30:00Z',
    assignedTo: 'admin1',
    createdBy: 'author42',
    messages: [
      {
        id: 'm2',
        ticketId: '2',
        userId: 'author42',
        userName: 'Laura Schmidt',
        userRole: 'author',
        message: 'Die Datei ist ein normales .docx-Dokument, das sollte doch unterstützt werden?',
        createdAt: '2025-05-09T15:25:00Z',
        isStaff: false
      },
      {
        id: 'm3',
        ticketId: '2',
        userId: 'admin1',
        userName: 'Admin Team',
        userRole: 'admin',
        message: 'Wir untersuchen das Problem. Können Sie uns bitte die genaue Größe der Datei mitteilen?',
        createdAt: '2025-05-10T09:15:00Z',
        isStaff: true
      }
    ]
  },
  {
    id: '3',
    title: 'Frage zur Premium-Mitgliedschaft',
    description: 'Ich interessiere mich für die Premium-Mitgliedschaft, finde aber keine Informationen zu den verfügbaren Zahlungsmethoden.',
    status: TicketStatus.WAITING,
    priority: TicketPriority.LOW,
    category: TicketCategory.PAYMENT,
    createdAt: '2025-05-08T11:45:00Z',
    updatedAt: '2025-05-10T14:20:00Z',
    assignedTo: 'admin2',
    createdBy: 'user456',
    messages: [
      {
        id: 'm4',
        ticketId: '3',
        userId: 'admin2',
        userName: 'Support Team',
        userRole: 'admin',
        message: 'Wir akzeptieren PayPal, Kreditkarte und Banküberweisung. Haben Sie eine bestimmte Präferenz?',
        createdAt: '2025-05-08T13:10:00Z',
        isStaff: true
      },
      {
        id: 'm5',
        ticketId: '3',
        userId: 'user456',
        userName: 'Julia Weber',
        userRole: 'user',
        message: 'Ich würde gerne per PayPal bezahlen. Gibt es da einen Mengenrabatt für jährliche Zahlungen?',
        createdAt: '2025-05-09T10:30:00Z',
        isStaff: false
      }
    ]
  }
];

// API URL - Für Entwicklung und Produktion
const API_URL = 'http://localhost:3000/api';

export const ticketService = {
  // Alle Tickets abrufen mit Filtern
  async getTickets(filters: any = {}) {
    try {
      // Im Entwicklungsmodus: Mock-Daten verwenden
      if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulierte Verzögerung
        
        let filteredTickets = [...mockTickets];
        
        // Filter anwenden
        if (filters.status) {
          filteredTickets = filteredTickets.filter(ticket => ticket.status === filters.status);
        }
        
        if (filters.priority) {
          filteredTickets = filteredTickets.filter(ticket => ticket.priority === filters.priority);
        }
        
        if (filters.category) {
          filteredTickets = filteredTickets.filter(ticket => ticket.category === filters.category);
        }
        
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredTickets = filteredTickets.filter(ticket => 
            ticket.title.toLowerCase().includes(searchLower) || 
            ticket.description.toLowerCase().includes(searchLower)
          );
        }
        
        // Sortierung
        if (filters.sortBy) {
          filteredTickets.sort((a, b) => {
            if (filters.sortBy === 'createdAt') {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else if (filters.sortBy === 'updatedAt') {
              return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            } else if (filters.sortBy === 'priority') {
              const priorityOrder = {
                [TicketPriority.CRITICAL]: 0,
                [TicketPriority.HIGH]: 1,
                [TicketPriority.MEDIUM]: 2,
                [TicketPriority.LOW]: 3
              };
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return 0;
          });
        }
        
        return filteredTickets;
      } else {
        // Im Produktionsmodus: API-Aufruf
        const token = authService.getAdminToken();
        const response = await axios.get(`${API_URL}/tickets`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: filters
        });
        return response.data;
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Tickets:', error);
      return []; // Leeres Array im Fehlerfall zurückgeben
    }
  },
  
  // Ein einzelnes Ticket abrufen
  async getTicketById(id: string) {
    try {
      // Im Entwicklungsmodus: Mock-Daten verwenden
      if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulierte Verzögerung
        return mockTickets.find(ticket => ticket.id === id);
      } else {
        // Im Produktionsmodus: API-Aufruf
        const token = authService.getAdminToken();
        const response = await axios.get(`${API_URL}/tickets/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        return response.data;
      }
    } catch (error) {
      console.error(`Fehler beim Abrufen des Tickets mit ID ${id}:`, error);
      return null; // Null im Fehlerfall zurückgeben
    }
  },
  
  // Ticket erstellen
  async createTicket(ticketData: Partial<Ticket>) {
    try {
      // Im Entwicklungsmodus: Mock-Daten verwenden
      if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulierte Verzögerung
        
        const newTicket: Ticket = {
          id: Math.random().toString(36).substring(2, 11),
          title: ticketData.title || '',
          description: ticketData.description || '',
          status: TicketStatus.OPEN,
          priority: ticketData.priority || TicketPriority.MEDIUM,
          category: ticketData.category || TicketCategory.OTHER,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          assignedTo: null,
          createdBy: ticketData.createdBy || 'system',
          messages: []
        };
        
        mockTickets.unshift(newTicket);
        return newTicket;
      } else {
        // Im Produktionsmodus: API-Aufruf
        const token = authService.getAdminToken();
        const response = await axios.post(`${API_URL}/tickets`, ticketData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        return response.data;
      }
    } catch (error) {
      console.error('Fehler beim Erstellen des Tickets:', error);
      throw error;
    }
  },
  
  // Ticket aktualisieren
  async updateTicket(id: string, updates: Partial<Ticket>) {
    try {
      // Im Entwicklungsmodus: Mock-Daten verwenden
      if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        await new Promise(resolve => setTimeout(resolve, 400)); // Simulierte Verzögerung
        
        const index = mockTickets.findIndex(ticket => ticket.id === id);
        
        if (index !== -1) {
          mockTickets[index] = {
            ...mockTickets[index],
            ...updates,
            updatedAt: new Date().toISOString()
          };
          return mockTickets[index];
        }
        
        throw new Error('Ticket nicht gefunden');
      } else {
        // Im Produktionsmodus: API-Aufruf
        const token = authService.getAdminToken();
        const response = await axios.patch(`${API_URL}/tickets/${id}`, updates, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        return response.data;
      }
    } catch (error) {
      console.error(`Fehler beim Aktualisieren des Tickets mit ID ${id}:`, error);
      throw error;
    }
  },
  
  // Ticket-Status ändern
  async changeTicketStatus(id: string, status: TicketStatus) {
    return this.updateTicket(id, { status });
  },
  
  // Ticket einem Admin zuweisen
  async assignTicket(ticketId: string, adminId: string | null) {
    return this.updateTicket(ticketId, { assignedTo: adminId });
  },
  
  // Nachricht zu einem Ticket hinzufügen
  async addMessage(ticketId: string, message: string, userId: string, userName: string, userRole: string, isStaff: boolean) {
    try {
      // Im Entwicklungsmodus: Mock-Daten verwenden
      if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        const ticket = await this.getTicketById(ticketId);
        
        if (!ticket) {
          throw new Error('Ticket nicht gefunden');
        }
        
        const newMessage: TicketMessage = {
          id: Math.random().toString(36).substring(2, 11),
          ticketId,
          userId,
          userName,
          userRole,
          message,
          createdAt: new Date().toISOString(),
          isStaff
        };
        
        if (!ticket.messages) {
          ticket.messages = [];
        }
        
        ticket.messages.push(newMessage);
        
        // Aktualisiere das Ticket mit der neuen Nachricht
        await this.updateTicket(ticketId, { 
          messages: ticket.messages,
          updatedAt: new Date().toISOString()
        });
        
        return newMessage;
      } else {
        // Im Produktionsmodus: API-Aufruf
        const token = authService.getAdminToken();
        const response = await axios.post(`${API_URL}/tickets/${ticketId}/messages`, {
          message,
          userId,
          userName,
          userRole,
          isStaff
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        return response.data;
      }
    } catch (error) {
      console.error(`Fehler beim Hinzufügen einer Nachricht zum Ticket mit ID ${ticketId}:`, error);
      throw error;
    }
  },
  
  // Ticket-Statistiken abrufen
  async getTicketStats() {
    try {
      // Im Entwicklungsmodus: Mock-Daten verwenden
      if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulierte Verzögerung
        
        const stats = {
          total: mockTickets.length,
          byStatus: {
            [TicketStatus.OPEN]: mockTickets.filter(t => t.status === TicketStatus.OPEN).length,
            [TicketStatus.IN_PROGRESS]: mockTickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length,
            [TicketStatus.WAITING]: mockTickets.filter(t => t.status === TicketStatus.WAITING).length,
            [TicketStatus.RESOLVED]: mockTickets.filter(t => t.status === TicketStatus.RESOLVED).length,
            [TicketStatus.CLOSED]: mockTickets.filter(t => t.status === TicketStatus.CLOSED).length
          },
          byPriority: {
            [TicketPriority.CRITICAL]: mockTickets.filter(t => t.priority === TicketPriority.CRITICAL).length,
            [TicketPriority.HIGH]: mockTickets.filter(t => t.priority === TicketPriority.HIGH).length,
            [TicketPriority.MEDIUM]: mockTickets.filter(t => t.priority === TicketPriority.MEDIUM).length,
            [TicketPriority.LOW]: mockTickets.filter(t => t.priority === TicketPriority.LOW).length
          },
          byCategory: {
            [TicketCategory.ACCOUNT]: mockTickets.filter(t => t.category === TicketCategory.ACCOUNT).length,
            [TicketCategory.PAYMENT]: mockTickets.filter(t => t.category === TicketCategory.PAYMENT).length,
            [TicketCategory.TECHNICAL]: mockTickets.filter(t => t.category === TicketCategory.TECHNICAL).length,
            [TicketCategory.CONTENT]: mockTickets.filter(t => t.category === TicketCategory.CONTENT).length,
            [TicketCategory.OTHER]: mockTickets.filter(t => t.category === TicketCategory.OTHER).length
          }
        };
        
        return stats;
      } else {
        // Im Produktionsmodus: API-Aufruf
        const token = authService.getAdminToken();
        const response = await axios.get(`${API_URL}/tickets/stats`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        return response.data;
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Ticket-Statistiken:', error);
      return {
        total: 0,
        byStatus: {
          [TicketStatus.OPEN]: 0,
          [TicketStatus.IN_PROGRESS]: 0,
          [TicketStatus.WAITING]: 0,
          [TicketStatus.RESOLVED]: 0,
          [TicketStatus.CLOSED]: 0
        },
        byPriority: {
          [TicketPriority.CRITICAL]: 0,
          [TicketPriority.HIGH]: 0,
          [TicketPriority.MEDIUM]: 0,
          [TicketPriority.LOW]: 0
        },
        byCategory: {
          [TicketCategory.ACCOUNT]: 0,
          [TicketCategory.PAYMENT]: 0,
          [TicketCategory.TECHNICAL]: 0,
          [TicketCategory.CONTENT]: 0,
          [TicketCategory.OTHER]: 0
        }
      };
    }
  },
  
  // Verfügbare Admins abrufen
  async getAvailableAdmins() {
    try {
      // Im Entwicklungsmodus: Mock-Daten verwenden
      if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        await new Promise(resolve => setTimeout(resolve, 200)); // Simulierte Verzögerung
        return [
          { id: 'admin1', name: 'Support Team' },
          { id: 'admin2', name: 'Content Team' },
          { id: 'admin3', name: 'Tech Support' }
        ];
      } else {
        // Im Produktionsmodus: API-Aufruf
        const token = authService.getAdminToken();
        const response = await axios.get(`${API_URL}/admins`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        return response.data;
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der verfügbaren Admins:', error);
      return [];
    }
  },
  
  // Ticket löschen
  async deleteTicket(id: string) {
    try {
      // Im Entwicklungsmodus: Mock-Daten verwenden
      if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulierte Verzögerung
        
        const index = mockTickets.findIndex(ticket => ticket.id === id);
        
        if (index === -1) {
          throw new Error('Ticket nicht gefunden');
        }
        
        // Entferne das Ticket aus dem Array
        mockTickets.splice(index, 1);
        
        return { success: true, message: 'Ticket erfolgreich gelöscht' };
      } else {
        // Im Produktionsmodus: API-Aufruf
        const token = authService.getAdminToken();
        const response = await axios.delete(`${API_URL}/tickets/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        return response.data;
      }
    } catch (error) {
      console.error(`Fehler beim Löschen des Tickets mit ID ${id}:`, error);
      throw error;
    }
  }
};