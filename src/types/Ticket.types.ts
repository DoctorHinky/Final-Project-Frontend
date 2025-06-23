export const TicketStatus = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  WEBSITE_BUG: "WEBSITE_BUG",
  CANCELED: "CANCELED",
  CLOSED: "CLOSED",
} as const;
export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus];

// Ticket-Kategorie
export const TicketCategory = {
  WEBSITE_BUG: "WEBSITE_BUG",
  ACCOUNT: "ACCOUNT",
  TECHNICAL: "TECHNICAL",
  REPORT: "REPORT",
  OTHER: "OTHER",
} as const;
export type TicketCategory = (typeof TicketCategory)[keyof typeof TicketCategory];

// Ticket-Interface
export type Ticket = {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  category: TicketCategory;
  createdAt: string;
  updatedAt: string;
  userFile: {
    user: {
      username: string;
    };
  };
  workedBy: {
    username: string;
    id: string;
    email: string;
  };
  messages: TicketMessage[];
  _count: {
    messages: number;
  };
};

// Ticket-Nachricht-Interface
export type TicketMessage = {
  id: string;
  isStaff?: boolean;
  author?: {
    username: string;
  };

  ticketId: string;
  userId: string;
  content: string;
  createdAt: string;
};
