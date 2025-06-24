<!-- src/components/member/support/SupportHub.vue -->
<template>
  <div class="support-hub">
    <!-- Support Header mit klarer Struktur -->
    <div class="support-header">
      <div class="header-main">
        <div class="header-icon-wrapper">
          <div class="header-icon">
            <ChatBubbleLeftRightIcon class="w-8 h-8" />
          </div>
        </div>
        <div class="header-text">
          <h1>Support Center</h1>
          <p class="header-subtitle">Wir sind für Sie da - 24/7</p>
        </div>
      </div>
    </div>

    <!-- Schnellzugriff Karten -->
    <div class="quick-access-section">
      <div class="section-title">
        <h2>Wie können wir Ihnen helfen?</h2>
      </div>

      <div class="quick-access-grid">
        <!-- FAQ Karte -->
        <div class="access-card" @click="showFaqModal = true">
          <div class="card-icon">
            <QuestionMarkCircleIcon class="w-6 h-6" />
          </div>
          <h3>Häufige Fragen</h3>
          <p>Finden Sie schnelle Antworten auf die meistgestellten Fragen</p>
          <div class="card-action">
            <span>{{ faqCount }} Artikel</span>
            <ChevronRightIcon class="w-4 h-4 Icons" />
          </div>
        </div>

        <!-- Tickets Karte -->
        <div class="access-card" @click="showTicketsModal = true">
          <div class="card-icon">
            <TicketIcon class="w-6 h-6" />
          </div>
          <h3>Meine Tickets</h3>
          <p>Verwalten Sie Ihre Support-Anfragen</p>
          <div class="card-action">
            <span v-if="openTicketsCount > 0" class="open-count"> {{ openTicketsCount }} offen </span>
            <span v-else>{{ totalTicketsCount }} gesamt</span>
            <ChevronRightIcon class="w-4 h-4 Icons" />
          </div>
        </div>

        <!-- Anleitungen Karte -->
        <div class="access-card" @click="showGuidesModal = true">
          <div class="card-icon">
            <BookOpenIcon class="w-6 h-6" />
          </div>
          <h3>Anleitungen</h3>
          <p>Schritt-für-Schritt Tutorials für alle Funktionen</p>
          <div class="card-action">
            <span>7 Anleitungen</span>
            <ChevronRightIcon class="w-4 h-4 Icons" />
          </div>
        </div>

        <!-- Neues Ticket Karte -->
        <div class="access-card new-ticket-card" @click="showCreateTicket = true">
          <div class="card-icon">
            <PlusIcon class="w-6 h-6" />
          </div>
          <h3>Neues Ticket</h3>
          <p>Erstellen Sie eine neue Support-Anfrage</p>
          <div class="card-action">
            <span>Ticket erstellen</span>
            <ChevronRightIcon class="w-4 h-4 Icons" />
          </div>
        </div>
      </div>
    </div>

    <!-- Support Statistiken (kompakter) -->
    <div class="support-info">
      <div class="info-item">
        <ClockIcon class="w-5 h-5 Icons" />
        <span><strong>&lt; 2h</strong> Ø Antwortzeit</span>
      </div>
      <div class="info-item">
        <CheckCircleIcon class="w-5 h-5 Icons" />
        <span><strong>94%</strong> Zufriedenheit</span>
      </div>
      <div class="info-item">
        <UserGroupIcon class="w-5 h-5 Icons" />
        <span><strong>24/7</strong> Support verfügbar</span>
      </div>
    </div>

    <!-- FAQ Modal -->
    <Teleport to="body">
      <div v-if="showFaqModal" class="modal-overlay" @click="closeFaqModal">
        <div class="modal-container large" @click.stop>
          <div class="modal-header">
            <button @click="closeFaqModal" class="back-button">
              <ChevronLeftIcon class="w-5 h-5 Icons" />
              Zurück
            </button>
            <h2>Häufig gestellte Fragen</h2>
            <button @click="closeFaqModal" class="close-button">
              <XMarkIcon class="w-5 h-5 Icons" />
            </button>
          </div>
          <div class="modal-content">
            <SupportFAQ @create-ticket="handleCreateTicketFromFaq" />
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Tickets Modal -->
    <Teleport to="body">
      <div v-if="showTicketsModal" class="modal-overlay" @click="closeTicketsModal">
        <div class="modal-container large" @click.stop>
          <div class="modal-header">
            <button @click="closeTicketsModal" class="back-button">
              <ChevronLeftIcon class="w-5 h-5 Icons" />
              Zurück
            </button>
            <h2>Meine Support-Tickets</h2>
            <button @click="closeTicketsModal" class="close-button">
              <XMarkIcon class="w-5 h-5 Icons" />
            </button>
          </div>
          <div class="modal-content">
            <UserTicketOverview />
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Guides Modal -->
    <Teleport to="body">
      <div v-if="showGuidesModal" class="modal-overlay" @click="closeGuidesModal">
        <div class="modal-container large" @click.stop>
          <div class="modal-header">
            <button @click="closeGuidesModal" class="back-button">
              <ChevronLeftIcon class="w-5 h-5 Icons" />
              Zurück
            </button>
            <h2>Anleitungen & Tutorials</h2>
            <button @click="closeGuidesModal" class="close-button">
              <XMarkIcon class="w-5 h-5 Icons" />
            </button>
          </div>
          <div class="modal-content">
            <SupportGuides @create-ticket="handleCreateTicketFromGuides" />
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Create Ticket Modal -->
    <Teleport to="body">
      <UserTicketModal
        :is-open="showCreateTicket"
        @close="showCreateTicket = false"
        @ticket-created="handleTicketCreated"
      />
    </Teleport>
  </div>

  <img src="../../../assets/images/Support.webp" alt="Support IMG" class="Support-IMG" />
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import {
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  TicketIcon,
  BookOpenIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  UserGroupIcon,
  EnvelopeIcon,
  ChatBubbleLeftIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";

// Import child components
import SupportFAQ from "./SupportFAQ.vue";
import UserTicketOverview from "./UserTicketOverview.vue";
import UserTicketModal from "./UserTicketModal.vue";
import SupportGuides from "./SupportGuides.vue";

// Import services
import { memberTicketService, type UserTicket } from "@/services/member.ticket.service";

export default defineComponent({
  name: "SupportHub",
  components: {
    ChatBubbleLeftRightIcon,
    QuestionMarkCircleIcon,
    TicketIcon,
    BookOpenIcon,
    PlusIcon,
    ClockIcon,
    CheckCircleIcon,
    UserGroupIcon,
    EnvelopeIcon,
    ChatBubbleLeftIcon,
    ChevronRightIcon,
    ChevronLeftIcon,
    XMarkIcon,
    SupportFAQ,
    UserTicketOverview,
    UserTicketModal,
    SupportGuides,
  },
  setup() {
    // State
    const showCreateTicket = ref(false);
    const showFaqModal = ref(false);
    const showTicketsModal = ref(false);
    const showGuidesModal = ref(false);
    const tickets = ref<UserTicket[]>([]);
    const faqCount = ref(12);
    const isLoading = ref(false);

    // Computed
    const openTicketsCount = computed(() => {
      return tickets.value.filter((ticket: any) => ticket.status === "OPEN" || ticket.status === "IN_PROGRESS").length;
    });

    const totalTicketsCount = computed(() => tickets.value.length);

    // Methods
    const closeFaqModal = () => {
      showFaqModal.value = false;
    };

    const closeTicketsModal = () => {
      showTicketsModal.value = false;
    };

    const closeGuidesModal = () => {
      showGuidesModal.value = false;
    };

    const handleCreateTicketFromFaq = () => {
      showFaqModal.value = false;
      showCreateTicket.value = true;
    };

    const handleCreateTicketFromGuides = () => {
      showGuidesModal.value = false;
      showCreateTicket.value = true;
    };

    const handleTicketCreated = () => {
      showCreateTicket.value = false;
      showTicketsModal.value = true;
      loadTickets();
    };

    const loadTickets = async () => {
      isLoading.value = true;
      try {
        const response = await memberTicketService.getMyTickets();
        tickets.value = response || [];
      } catch (error) {
        console.error("Fehler beim Laden der Tickets:", error);
        tickets.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    // Lifecycle
    onMounted(async () => {
      await loadTickets();
    });

    return {
      showCreateTicket,
      showFaqModal,
      showTicketsModal,
      showGuidesModal,
      tickets,
      faqCount,
      isLoading,
      openTicketsCount,
      totalTicketsCount,
      closeFaqModal,
      closeTicketsModal,
      closeGuidesModal,
      handleCreateTicketFromFaq,
      handleCreateTicketFromGuides,
      handleTicketCreated,
      loadTickets,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;

.support-hub {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  min-height: calc(100vh - 140px);
}

// Header Section
.support-header {
  margin-bottom: 40px;

  .header-main {
    display: flex;
    align-items: center;
    gap: 24px;

    .header-icon-wrapper {
      .header-icon {
        width: 64px;
        height: 64px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #4ad295 0%, #35ccd0 100%);
        color: white;
        box-shadow: 0 8px 24px rgba(74, 210, 149, 0.25), 0 0 30px rgba(74, 210, 149, 0.15);
        position: relative;

        &::before {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: 16px;
          background: linear-gradient(135deg, #4ad295 0%, #35ccd0 100%);
          opacity: 0.5;
          filter: blur(10px);
          z-index: -1;
        }
      }
    }

    .header-text {
      h1 {
        margin: 0 0 4px 0;
        font-size: 2.25rem;
        font-weight: 700;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }

      .header-subtitle {
        margin: 0;
        font-size: 1.125rem;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }
    }
  }
}

// Quick Access Section
.quick-access-section {
  margin-bottom: 32px;

  .section-title {
    margin-bottom: 24px;

    h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }
  }

  .quick-access-grid {
    margin-top: 150px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;

    .access-card {
      padding: 24px;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, card-bg);
          border: 1px solid mixins.theme-color($theme, border-light);

          &:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1), 0 0 20px rgba(74, 210, 149, 0.15);
            border-color: #4ad295;

            .card-icon {
              transform: scale(1.1);
              box-shadow: 0 0 15px rgba(74, 210, 149, 0.2);
            }

            .card-action {
              color: #4ad295;
            }
          }
        }
      }

      &.new-ticket-card {
        background: linear-gradient(135deg, rgba(74, 210, 149, 0.1) 0%, rgba(53, 204, 208, 0.1) 100%);
        position: relative;
        overflow: visible;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            border-color: rgba(74, 210, 149, 0.3);

            &:hover {
              background: linear-gradient(135deg, rgba(74, 210, 149, 0.15) 0%, rgba(53, 204, 208, 0.15) 100%);
              box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1), 0 0 30px rgba(74, 210, 149, 0.2);

              &::after {
                content: "";
                position: absolute;
                inset: -2px;
                border-radius: 16px;
                background: linear-gradient(135deg, rgba(74, 210, 149, 0.3) 0%, rgba(53, 204, 208, 0.3) 100%);
                opacity: 0.5;
                filter: blur(15px);
                z-index: -1;
                pointer-events: none;
              }
            }
          }
        }
      }

      .card-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
        transition: transform 0.3s ease;
        background: linear-gradient(135deg, rgba(74, 210, 149, 0.1) 0%, rgba(53, 204, 208, 0.1) 100%);
        color: #4ad295;
      }

      h3 {
        margin: 0 0 8px 0;
        font-size: 1.25rem;
        font-weight: 600;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }

      p {
        margin: 0 0 16px 0;
        font-size: 0.875rem;
        line-height: 1.5;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }

      .card-action {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.875rem;
        font-weight: 500;
        transition: color 0.3s ease;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-tertiary);
          }
        }

        .open-count {
          color: #4ad295;
          font-weight: 600;
        }
      }
    }
  }
}

// Support Info Bar
.support-info {
  display: flex;
  justify-content: center;
  gap: 48px;
  padding: 20px;
  margin-bottom: 32px;
  border-radius: 12px;
  flex-wrap: wrap;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, secondary-bg);
      border: 1px solid mixins.theme-color($theme, border-light);
    }
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 8px;

    .Icons {
      color: #4ad295;
      filter: drop-shadow(0 0 3px rgba(74, 210, 149, 0.4));
    }

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);

        strong {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }
  }
}

// Modal Overlay
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(3px);
}

// Modal Container
.modal-container {
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modalAppear 0.3s ease-out;

  &.large {
    max-width: 1000px;
  }

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, card-bg);
      border: 1px solid mixins.theme-color($theme, border-light);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
  }
}

// Modal Header
.modal-header {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, secondary-bg);
      border-color: mixins.theme-color($theme, border-light);
    }
  }

  h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    flex: 1;
    text-align: center;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
      }
    }
  }

  .back-button,
  .close-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 8px;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);

        &:hover {
          background-color: mixins.theme-color($theme, hover-color);
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }
  }
}

// Modal Content
.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

// Animations
@keyframes modalAppear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Responsive Design
@media (max-width: 768px) {
  .support-hub {
    padding: 16px;
  }

  .support-header {
    margin-bottom: 32px;

    .header-main {
      gap: 16px;

      .header-icon-wrapper .header-icon {
        width: 48px;
        height: 48px;
      }

      .header-text {
        h1 {
          font-size: 1.75rem;
        }

        .header-subtitle {
          font-size: 1rem;
        }
      }
    }
  }

  .quick-access-section {
    .quick-access-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }

  .support-info {
    gap: 24px;
    flex-direction: column;
    align-items: flex-start;
  }

  .contact-footer {
    padding: 24px;

    .footer-content {
      gap: 16px;

      .footer-actions {
        width: 100%;

        .contact-link,
        .contact-button {
          flex: 1;
          justify-content: center;
        }
      }
    }
  }

  .modal-container {
    width: 95%;
    max-height: 95vh;
  }

  .modal-header {
    padding: 16px;

    h2 {
      font-size: 1.125rem;
    }
  }

  .modal-content {
    padding: 16px;
  }
}

.Icons {
  width: 30px;
}

.Support-IMG {
  width: 600px;
  position: absolute;
  top: 8%;
  left: 60%;
  transform: translateX(-50%);
  border-radius: 40%;
  z-index: -1;
}
</style>