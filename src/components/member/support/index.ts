// src/components/member/support/index.ts

export { default as UserTicketModal } from './UserTicketModal.vue';
export { default as UserTicketOverview } from './UserTicketOverview.vue';
export { default as UserTicketDetailModal } from './UserTicketDetailModal.vue';

// Neue Support-Komponenten
export { default as SupportHub } from './SupportHub.vue';
export { default as SupportFAQ } from './SupportFAQ.vue';
export { default as SupportGuides } from './SupportGuides.vue';

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

// FAQ Types
export interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
  helpfulCount?: number;
  notHelpfulCount?: number;
  userRating?: boolean | null;
  tags?: string[];
}

// Guide Types
export interface GuideStep {
  title: string;
  description: string;
  note?: string;
}

export interface Guide {
  id: number;
  title: string;
  description: string;
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  icon: any;
  iconClass: string;
  steps: GuideStep[];
}

// Support Tab Types
export type SupportTab = 'faq' | 'tickets' | 'guides';

// Support Events
export interface SupportEvents {
  'create-ticket': void;
  'tab-change': SupportTab;
  'ticket-created': TicketCreatedEvent;
  'ticket-updated': TicketUpdatedEvent;
}