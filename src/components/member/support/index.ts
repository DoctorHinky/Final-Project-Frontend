// src/components/member/support/index.ts

export { default as UserTicketModal } from './UserTicketModal.vue';
export { default as UserTicketOverview } from './UserTicketOverview.vue';
export { default as UserTicketDetailModal } from './UserTicketDetailModal.vue';

// Typen für Support-Komponenten
export interface SupportComponentProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export interface TicketCreatedEvent {
  ticketId: string;
  message: string;
}

export interface TicketUpdatedEvent {
  ticketId: string;
  status?: string;
}