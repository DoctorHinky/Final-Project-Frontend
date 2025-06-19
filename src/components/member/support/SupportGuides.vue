<!-- src/components/member/support/SupportGuides.vue -->
<template>
  <div class="support-guides">
    <!-- Guides Header -->
    <div class="guides-header">
      <h2>Hilfreiche Anleitungen</h2>
      <p>Schritt-für-Schritt Anleitungen für häufige Aufgaben</p>
    </div>

    <!-- Guides Grid -->
    <div class="guides-grid">
      <div v-for="guide in guides" :key="guide.id" class="guide-card" @click="selectGuide(guide)">
        <div class="guide-icon">
          <component :is="guide.icon" class="w-6 h-6" />
        </div>

        <div class="guide-content">
          <h3 class="guide-title">{{ guide.title }}</h3>
          <p class="guide-description">{{ guide.description }}</p>
        </div>

        <ChevronRightIcon class="guide-arrow" />
      </div>
    </div>

    <!-- Selected Guide Modal -->
    <div v-if="selectedGuide" class="guide-modal-overlay" @click="closeGuide">
      <div class="guide-modal" @click.stop>
        <div class="guide-modal-header">
          <div class="modal-title-section">
            <div class="modal-icon">
              <component :is="selectedGuide.icon" class="w-6 h-6" />
            </div>
            <div>
              <h3>{{ selectedGuide.title }}</h3>
              <p>{{ selectedGuide.description }}</p>
            </div>
          </div>
          <button @click="closeGuide" class="close-btn">
            <XMarkIcon class="w-5 h-5 Icons" />
          </button>
        </div>

        <div class="guide-modal-content">
          <div class="guide-steps">
            <div v-for="(step, index) in selectedGuide.steps" :key="index" class="guide-step">
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-content">
                <h4>{{ step.title }}</h4>
                <p>{{ step.description }}</p>
                <div v-if="step.note" class="step-note">
                  <ExclamationTriangleIcon class="w-4 h-4 Icons" />
                  {{ step.note }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="guide-modal-footer">
          <button @click="closeGuide" class="btn-secondary">Schließen</button>
          <button @click="showCreateTicket" class="btn-primary">
            <ChatBubbleLeftIcon class="w-4 h-4 Icons" />
            Hilfe benötigt?
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import {
  ClockIcon,
  ChevronRightIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftIcon,
  UserCircleIcon,
  KeyIcon,
  PhotoIcon,
  CogIcon,
  ShieldCheckIcon,
  BellIcon,
  DocumentIcon,
  PencilIcon,
} from "@heroicons/vue/24/outline";

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
  difficulty: "easy" | "medium" | "hard";
  icon: any;
  iconClass: string;
  steps: GuideStep[];
}

export default defineComponent({
  name: "SupportGuides",
  components: {
    ClockIcon,
    ChevronRightIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    ChatBubbleLeftIcon,
    UserCircleIcon,
    KeyIcon,
    PhotoIcon,
    CogIcon,
    ShieldCheckIcon,
    BellIcon,
    DocumentIcon,
    PencilIcon,
  },
  emits: ["create-ticket"],
  setup(_, { emit }) {
    const selectedGuide = ref<Guide | null>(null);

    const guides: Guide[] = [
      {
        id: 1,
        title: "Passwort ändern",
        description: "Lernen Sie, wie Sie Ihr Passwort sicher ändern können",
        duration: "3 Min.",
        difficulty: "easy",
        icon: KeyIcon,
        iconClass: "icon-account",
        steps: [
          {
            title: "Zu den Einstellungen navigieren",
            description: 'Klicken Sie in der Sidebar auf "Einstellungen" oder auf Ihr Profilbild rechts oben',
          },
          {
            title: "Account-Tab öffnen",
            description: 'Wechseln Sie zum Tab "Account" in den Einstellungen',
          },
          {
            title: "Passwort-Bereich finden",
            description: 'Scrollen Sie nach unten zum Bereich "Passwort & Sicherheit"',
          },
          {
            title: "Neues Passwort eingeben",
            description:
              "Geben Sie Ihr aktuelles Passwort und das neue Passwort ein. Das neue Passwort sollte mindestens 8 Zeichen haben.",
            note: "Sie werden automatisch abgemeldet und müssen sich neu anmelden",
          },
        ],
      },
      {
        id: 2,
        title: "Profilbild hochladen",
        description: "So laden Sie ein neues Profilbild hoch",
        duration: "2 Min.",
        difficulty: "easy",
        icon: PhotoIcon,
        iconClass: "icon-media",
        steps: [
          {
            title: "Einstellungen öffnen",
            description: "Gehen Sie zu Ihren Einstellungen über die Sidebar",
          },
          {
            title: "Profil-Tab wählen",
            description: 'Wählen Sie den Tab "Profil" in den Einstellungen',
          },
          {
            title: "Profilbild bearbeiten",
            description: 'Klicken Sie auf Ihr aktuelles Profilbild oder "Profilbild ändern"',
          },
          {
            title: "Datei auswählen und speichern",
            description: 'Wählen Sie eine Bilddatei von Ihrem Gerät und klicken Sie "Speichern"',
            note: "Erlaubte Formate: JPG, PNG, WEBP (max. 5MB). Das Bild wird automatisch zugeschnitten",
          },
        ],
      },
      {
        id: 3,
        title: "Zwei-Faktor-Authentifizierung",
        description: "Erhöhen Sie die Sicherheit Ihres Kontos",
        duration: "5 Min.",
        difficulty: "medium",
        icon: ShieldCheckIcon,
        iconClass: "icon-security",
        steps: [
          {
            title: "Einstellungen → Account öffnen",
            description: "Navigieren Sie zu Einstellungen und wählen Sie den Account-Tab",
          },
          {
            title: "Sicherheitsbereich finden",
            description: 'Scrollen Sie zum Bereich "Passwort & Sicherheit"',
          },
          {
            title: "Authenticator-App vorbereiten",
            description: "Installieren Sie eine App wie Google Authenticator oder Authy auf Ihrem Smartphone",
          },
          {
            title: "2FA aktivieren",
            description: "Folgen Sie den Anweisungen auf der Seite und scannen Sie den QR-Code",
            note: "Bewahren Sie die Backup-Codes sicher auf!",
          },
        ],
      },
      {
        id: 4,
        title: "Benachrichtigungen verwalten",
        description: "Passen Sie Ihre Benachrichtigungseinstellungen an",
        duration: "4 Min.",
        difficulty: "easy",
        icon: BellIcon,
        iconClass: "icon-notifications",
        steps: [
          {
            title: "Benachrichtigungen in der Sidebar",
            description: 'Klicken Sie in der Sidebar auf "Benachrichtigungen"',
          },
          {
            title: "Einstellungen öffnen",
            description: "Klicken Sie auf das Zahnrad-Symbol in der Benachrichtigungsübersicht",
          },
          {
            title: "Präferenzen anpassen",
            description: "Wählen Sie aus, für welche Ereignisse Sie Benachrichtigungen erhalten möchten",
          },
          {
            title: "Änderungen speichern",
            description: "Vergessen Sie nicht, Ihre Änderungen zu speichern",
          },
        ],
      },
      {
        id: 5,
        title: "Artikel erstellen",
        description: "Schreiben und veröffentlichen Sie Ihren ersten Artikel",
        duration: "10 Min.",
        difficulty: "medium",
        icon: PencilIcon,
        iconClass: "icon-writing",
        steps: [
          {
            title: "Author-Berechtigung prüfen",
            description:
              "Stellen Sie sicher, dass Sie die Author-Rolle haben. Falls nicht, bewerben Sie sich über die Übersicht.",
            note: "Nur Authors und Admins können Artikel erstellen",
          },
          {
            title: "Artikel-Editor öffnen",
            description: 'Klicken Sie in der Sidebar auf "Artikel erstellen"',
          },
          {
            title: "Grunddaten eingeben",
            description: "Geben Sie Titel, Kategorie und eine kurze Beschreibung ein",
          },
          {
            title: "Inhalt erstellen",
            description: "Verwenden Sie den Editor, um Kapitel hinzuzufügen und Ihren Artikel zu schreiben",
          },
          {
            title: "Veröffentlichen",
            description: "Nutzen Sie die Vorschau und veröffentlichen Sie, wenn Sie zufrieden sind",
            note: "Artikel werden von Moderatoren geprüft, bevor sie öffentlich werden",
          },
        ],
      },
      {
        id: 6,
        title: "Freunde hinzufügen",
        description: "Verbinden Sie sich mit anderen Nutzern",
        duration: "3 Min.",
        difficulty: "easy",
        icon: UserCircleIcon,
        iconClass: "icon-social",
        steps: [
          {
            title: "Freunde-Bereich öffnen",
            description: 'Klicken Sie in der Sidebar auf "Freunde"',
          },
          {
            title: "Andere Nutzer suchen",
            description: "Verwenden Sie die Suchfunktion, um andere Nutzer zu finden",
          },
          {
            title: "Freundschaftsanfrage senden",
            description: 'Klicken Sie bei einem Nutzer auf "Freundschaftsanfrage senden"',
          },
          {
            title: "Bestätigung abwarten",
            description:
              "Der andere Nutzer muss Ihre Anfrage bestätigen. Sie erhalten eine Benachrichtigung bei Annahme oder Ablehnung",
          },
        ],
      },
      {
        id: 7,
        title: "Unterstützung erhalten",
        description: "So erstellen Sie ein Support-Ticket",
        duration: "5 Min.",
        difficulty: "easy",
        icon: ChatBubbleLeftIcon,
        iconClass: "icon-support",
        steps: [
          {
            title: "Support-Bereich öffnen",
            description: 'Klicken Sie in der Sidebar auf "Support" oder den blauen Support-Button',
          },
          {
            title: "FAQ durchsuchen",
            description: "Schauen Sie zuerst in den häufigen Fragen nach Ihrer Lösung",
          },
          {
            title: "Ticket erstellen",
            description: 'Falls Sie keine Lösung finden, klicken Sie auf "Neues Ticket erstellen"',
          },
          {
            title: "Problem beschreiben",
            description: "Füllen Sie das Formular aus und beschreiben Sie Ihr Problem so detailliert wie möglich",
            note: "Sie können Screenshots oder Dateien anhängen",
          },
        ],
      },
    ];

    const selectGuide = (guide: Guide) => {
      selectedGuide.value = guide;
    };

    const closeGuide = () => {
      selectedGuide.value = null;
    };

    const showCreateTicket = () => {
      closeGuide();
      emit("create-ticket");
    };

    const getDifficultyClass = (difficulty: string) => {
      return `difficulty-${difficulty}`;
    };

    const formatDifficulty = (difficulty: string) => {
      const map: Record<string, string> = {
        easy: "Einfach",
        medium: "Mittel",
        hard: "Schwer",
      };
      return map[difficulty] || difficulty;
    };

    return {
      guides,
      selectedGuide,
      selectGuide,
      closeGuide,
      showCreateTicket,
      getDifficultyClass,
      formatDifficulty,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;

.support-guides {
  .guides-header {
    margin-bottom: 32px;
    text-align: center;

    h2 {
      margin: 0 0 8px 0;
      font-size: 1.5rem;
      font-weight: 600;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    p {
      margin: 0;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  .guides-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 20px;

    .guide-card {
      padding: 20px;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      transition: all 0.2s;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, card-bg);
          border: 1px solid mixins.theme-color($theme, border-light);

          &:hover {
            border-color: #4ad295;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(74, 210, 149, 0.15), 0 0 20px rgba(74, 210, 149, 0.1);
          }
        }
      }

      .guide-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: linear-gradient(135deg, rgba(74, 210, 149, 0.1) 0%, rgba(53, 204, 208, 0.1) 100%);
        color: #4ad295;
        transition: all 0.2s;
      }

      .guide-content {
        flex: 1;

        .guide-title {
          margin: 0 0 6px 0;
          font-size: 1.125rem;
          font-weight: 600;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }

        .guide-description {
          margin: 0 0 12px 0;
          line-height: 1.5;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }

        .guide-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.875rem;

          .guide-duration {
            display: flex;
            align-items: center;
            gap: 4px;

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-tertiary);
              }
            }
          }

          .guide-difficulty {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            background-color: rgba(74, 210, 149, 0.1);
            color: #4ad295;
          }
        }
      }

      .guide-arrow {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
        transition: transform 0.2s;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-tertiary);
          }
        }
      }

      &:hover {
        .guide-arrow {
          transform: translateX(4px);
        }

        .guide-icon {
          box-shadow: 0 0 15px rgba(74, 210, 149, 0.2);
        }
      }
    }
  }

  // Guide Modal
  .guide-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.75);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(3px);

    .guide-modal {
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      border-radius: 12px;
      overflow: hidden;
      animation: modalAppear 0.3s ease-out;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, card-bg);
          border: 1px solid mixins.theme-color($theme, border-light);
        }
      }

      .guide-modal-header {
        padding: 24px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 1px solid;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            border-color: mixins.theme-color($theme, border-light);
          }
        }

        .modal-title-section {
          display: flex;
          align-items: center;
          gap: 16px;

          .modal-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            background: linear-gradient(135deg, rgba(74, 210, 149, 0.1) 0%, rgba(53, 204, 208, 0.1) 100%);
            color: #4ad295;
            box-shadow: 0 0 15px rgba(74, 210, 149, 0.2);
          }

          h3 {
            margin: 0 0 4px 0;
            font-size: 1.25rem;
            font-weight: 600;

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-primary);
              }
            }
          }

          p {
            margin: 0;

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-secondary);
              }
            }
          }
        }

        .close-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;

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

      .guide-modal-content {
        padding: 24px;
        max-height: 400px;
        overflow-y: auto;

        .guide-steps {
          .guide-step {
            display: flex;
            gap: 16px;
            margin-bottom: 24px;

            &:last-child {
              margin-bottom: 0;
            }

            .step-number {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: linear-gradient(135deg, #4ad295 0%, #35ccd0 100%);
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 600;
              font-size: 0.875rem;
              flex-shrink: 0;
              box-shadow: 0 0 12px rgba(74, 210, 149, 0.25);
            }

            .step-content {
              flex: 1;

              h4 {
                margin: 0 0 8px 0;
                font-size: 1rem;
                font-weight: 600;

                @each $theme in ("light", "dark") {
                  .theme-#{$theme} & {
                    color: mixins.theme-color($theme, text-primary);
                  }
                }
              }

              p {
                margin: 0 0 12px 0;
                line-height: 1.5;

                @each $theme in ("light", "dark") {
                  .theme-#{$theme} & {
                    color: mixins.theme-color($theme, text-secondary);
                  }
                }
              }

              .step-note {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 0.875rem;
                margin-top: 8px;

                @each $theme in ("light", "dark") {
                  .theme-#{$theme} & {
                    background-color: rgba(74, 210, 149, 0.1);
                    color: #4ad295;
                    border: 1px solid rgba(74, 210, 149, 0.2);
                  }
                }
              }
            }
          }
        }
      }

      .guide-modal-footer {
        padding: 16px 24px;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        border-top: 1px solid;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            border-color: mixins.theme-color($theme, border-light);
          }
        }

        .btn-secondary,
        .btn-primary {
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-secondary {
          border: 1px solid;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background-color: transparent;
              border-color: mixins.theme-color($theme, border-medium);
              color: mixins.theme-color($theme, text-secondary);

              &:hover {
                background-color: mixins.theme-color($theme, hover-color);
                color: mixins.theme-color($theme, text-primary);
              }
            }
          }
        }

        .btn-primary {
          border: none;
          background: linear-gradient(135deg, #4ad295 0%, #35ccd0 100%);
          color: white;
          position: relative;
          overflow: hidden;

          &::before {
            content: "";
            position: absolute;
            inset: -1px;
            border-radius: 6px;
            background: linear-gradient(135deg, #4ad295 0%, #35ccd0 100%);
            opacity: 0;
            filter: blur(8px);
            transition: opacity 0.3s;
            z-index: -1;
          }

          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(74, 210, 149, 0.3), 0 0 20px rgba(74, 210, 149, 0.2);

            &::before {
              opacity: 0.5;
            }
          }
        }
      }
    }
  }
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 768px) {
  .support-guides {
    .guides-grid {
      grid-template-columns: 1fr;

      .guide-card {
        padding: 16px;

        .guide-icon {
          width: 40px;
          height: 40px;
        }
      }
    }

    .guide-modal-overlay {
      .guide-modal {
        width: 95%;

        .guide-modal-header {
          padding: 16px;

          .modal-title-section {
            gap: 12px;

            .modal-icon {
              width: 40px;
              height: 40px;
            }
          }
        }

        .guide-modal-content {
          padding: 16px;
        }

        .guide-modal-footer {
          padding: 12px 16px;
          flex-direction: column;

          .btn-secondary,
          .btn-primary {
            width: 100%;
            justify-content: center;
          }
        }
      }
    }
  }
}
</style>
