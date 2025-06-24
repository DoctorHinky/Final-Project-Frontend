<!-- src/components/member/support/SupportFAQ.vue -->
<template>
  <div class="support-faq">
    <!-- Suchleiste und Filter -->
    <div class="faq-header">
      <div class="search-filter-container">
        <div class="search-input-wrapper">
          <MagnifyingGlassIcon class="search-icon" />
          <input 
            type="text" 
            v-model="searchTerm"
            placeholder="FAQ durchsuchen..."
            class="search-input"
          />
        </div>
        
        <div class="custom-select">
          <select 
            v-model="selectedCategory" 
            class="category-filter"
          >
            <option value="">Alle Kategorien</option>
            <option value="ACCOUNT">Konto & Anmeldung</option>
            <option value="TECHNICAL">Technische Probleme</option>
            <option value="WEBSITE_BUG">Website-Fehler</option>
            <option value="REPORT">Inhalte melden</option>
            <option value="OTHER">Sonstiges</option>
          </select>
          <ChevronDownIcon class="select-icon" />
        </div>
      </div>

      <!-- Kategorie Pills -->
      <div class="category-pills">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="selectedCategory = category.id"
          class="category-pill"
          :class="{ active: selectedCategory === category.id }"
        >
          <component :is="category.icon" class="category-icon" />
          {{ category.name }}
        </button>
      </div>
    </div>

    <!-- FAQ Liste -->
    <div class="faq-list">
      <div 
        v-if="filteredFaqs.length === 0" 
        class="empty-state"
      >
        <QuestionMarkCircleIcon class="empty-icon" />
        <h3>Keine Ergebnisse gefunden</h3>
        <p>Versuchen Sie andere Suchbegriffe oder erstellen Sie ein Ticket.</p>
        <button @click="$emit('create-ticket')" class="btn-create-ticket">
          <PlusIcon class="h-4 w-4 Icons" />
          Ticket erstellen
        </button>
      </div>

      <div 
        v-else
        v-for="faq in filteredFaqs"
        :key="faq.id"
        class="faq-item"
      >
        <button 
          @click="toggleFaq(faq.id)"
          class="faq-question"
        >
          <div class="question-content">
            <div class="category-badge">
              <component :is="getCategoryIcon(faq.category)" class="w-3 h-3" />
              {{ formatCategory(faq.category) }}
            </div>
            <h3 class="question-text">{{ faq.question }}</h3>
          </div>
          <ChevronDownIcon 
            class="chevron-icon"
            :class="{ 'rotated': expandedFaq === faq.id }"
          />
        </button>
        
        <Transition name="faq-expand">
          <div v-if="expandedFaq === faq.id" class="faq-answer">
            <div class="answer-content">
              <p class="answer-text">{{ faq.answer }}</p>
              
              <!-- Hilfreich-Bewertung -->
              <div class="feedback-section">
                <span class="feedback-label">War das hilfreich?</span>
                <div class="feedback-buttons">
                  <button 
                    @click="rateFaq(faq.id, true)"
                    class="feedback-btn helpful"
                    :class="{ active: faq.userRating === true }"
                  >
                    <HandThumbUpIcon class="w-4 h-4 Icons" />
                    Ja ({{ faq.helpfulCount || 0 }})
                  </button>
                  <button 
                    @click="rateFaq(faq.id, false)"
                    class="feedback-btn not-helpful"
                    :class="{ active: faq.userRating === false }"
                  >
                    <HandThumbDownIcon class="w-4 h-4 Icons" />
                    Nein ({{ faq.notHelpfulCount || 0 }})
                  </button>
                </div>
              </div>

              <!-- Verwandte FAQs -->
              <div v-if="getRelatedFaqs(faq.category, faq.id).length > 0" class="related-faqs">
                <h4>Ähnliche Fragen:</h4>
                <ul>
                  <li 
                    v-for="related in getRelatedFaqs(faq.category, faq.id)"
                    :key="related.id"
                  >
                    <button @click="toggleFaq(related.id)" class="related-link">
                      {{ related.question }}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Call-to-Action -->
    <div class="cta-section">
      <ExclamationTriangleIcon class="cta-icon" />
      <h3>Problem nicht gelöst?</h3>
      <p>Erstellen Sie ein Support-Ticket und unser Team hilft Ihnen persönlich weiter.</p>
      <button @click="$emit('create-ticket')" class="btn-create-ticket primary">
        <PlusIcon class="w-4 h-4 Icons" />
        Neues Ticket erstellen
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import {
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  UserCircleIcon,
  ComputerDesktopIcon,
  BugAntIcon,
  FlagIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/vue/24/outline';

interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
  helpfulCount?: number;
  notHelpfulCount?: number;
  userRating?: boolean | null;
  tags?: string[];
}

export default defineComponent({
  name: 'SupportFAQ',
  components: {
    MagnifyingGlassIcon,
    QuestionMarkCircleIcon,
    ChevronDownIcon,
    HandThumbUpIcon,
    HandThumbDownIcon,
    ExclamationTriangleIcon,
    PlusIcon,
    UserCircleIcon,
    ComputerDesktopIcon,
    BugAntIcon,
    FlagIcon,
    ChatBubbleLeftRightIcon
  },
  emits: ['create-ticket'],
  setup() {
    // State
    const searchTerm = ref('');
    const selectedCategory = ref('');
    const expandedFaq = ref<number | null>(null);

    // Categories
    const categories = [
      { id: '', name: 'Alle', icon: QuestionMarkCircleIcon },
      { id: 'ACCOUNT', name: 'Konto', icon: UserCircleIcon },
      { id: 'TECHNICAL', name: 'Technisch', icon: ComputerDesktopIcon },
      { id: 'WEBSITE_BUG', name: 'Fehler', icon: BugAntIcon },
      { id: 'REPORT', name: 'Melden', icon: FlagIcon },
      { id: 'OTHER', name: 'Sonstiges', icon: ChatBubbleLeftRightIcon }
    ];

    // Statische FAQ Daten (im Frontend gespeichert)
    const faqs = ref<FAQ[]>([
      {
        id: 1,
        category: 'ACCOUNT',
        question: 'Wie kann ich mein Passwort zurücksetzen?',
        answer: 'Klicken Sie auf der Anmeldeseite auf "Passwort vergessen" und folgen Sie den Anweisungen in der E-Mail. Falls Sie keine E-Mail erhalten, überprüfen Sie Ihren Spam-Ordner. Der Link ist 24 Stunden gültig.',
        helpfulCount: 24,
        notHelpfulCount: 2,
        tags: ['passwort', 'login', 'vergessen', 'email']
      },
      {
        id: 2,
        category: 'ACCOUNT',
        question: 'Wie ändere ich mein Profilbild?',
        answer: 'Gehen Sie zu Einstellungen → Profil und klicken Sie auf Ihr aktuelles Profilbild. Sie können dann ein neues Bild hochladen (max. 5MB, JPG/PNG/WEBP). Das Bild wird automatisch zugeschnitten.',
        helpfulCount: 18,
        notHelpfulCount: 1,
        tags: ['profil', 'bild', 'avatar', 'foto']
      },
      {
        id: 3,
        category: 'ACCOUNT',
        question: 'Wie kann ich mein Konto löschen?',
        answer: 'Kontaktieren Sie unseren Support über ein Ticket mit dem Betreff "Konto löschen". Wir helfen Ihnen beim sicheren Löschen und erklären die Folgen. Alternativ können Sie Ihr Konto in den Einstellungen deaktivieren.',
        helpfulCount: 8,
        notHelpfulCount: 2,
        tags: ['konto', 'löschen', 'deaktivieren', 'account']
      },
      {
        id: 4,
        category: 'TECHNICAL',
        question: 'Die Seite lädt sehr langsam. Was kann ich tun?',
        answer: 'Versuchen Sie folgende Schritte: 1) Browser-Cache leeren (Strg+F5), 2) Cookies löschen, 3) Anderen Browser testen, 4) Internetverbindung prüfen, 5) Adblocker temporär deaktivieren. Bei anhaltenden Problemen erstellen Sie bitte ein Ticket.',
        helpfulCount: 15,
        notHelpfulCount: 3,
        tags: ['langsam', 'laden', 'performance', 'cache']
      },
      {
        id: 5,
        category: 'TECHNICAL',
        question: 'Warum funktioniert die Benachrichtigung nicht?',
        answer: 'Überprüfen Sie: 1) Browser-Benachrichtigungen aktiviert? 2) Website-Berechtigung erteilt? 3) Benachrichtigungseinstellungen im Profil korrekt? 4) "Nicht stören"-Modus deaktiviert? Testen Sie mit einem anderen Gerät.',
        helpfulCount: 12,
        notHelpfulCount: 5,
        tags: ['benachrichtigung', 'push', 'notification', 'browser']
      },
      {
        id: 6,
        category: 'WEBSITE_BUG',
        question: 'Ich kann keine Artikel speichern/erstellen',
        answer: 'Überprüfen Sie: 1) Internetverbindung stabil? 2) Browser aktuell? 3) JavaScript aktiviert? 4) Adblocker deaktiviert? 5) Ausreichend Berechtigung (Author-Rolle)? Falls das Problem bestehen bleibt, melden Sie es als Bug mit Screenshots.',
        helpfulCount: 12,
        notHelpfulCount: 1,
        tags: ['artikel', 'speichern', 'erstellen', 'editor']
      },
      {
        id: 7,
        category: 'WEBSITE_BUG',
        question: 'Bilder werden nicht angezeigt',
        answer: 'Mögliche Ursachen: 1) Langsame Internetverbindung, 2) Adblocker blockiert Bilder, 3) Browser-Cache-Problem, 4) Bildformat nicht unterstützt. Versuchen Sie die Seite neu zu laden oder einen anderen Browser.',
        helpfulCount: 9,
        notHelpfulCount: 2,
        tags: ['bilder', 'laden', 'anzeige', 'cloudinary']
      },
      {
        id: 8,
        category: 'REPORT',
        question: 'Wie melde ich unangemessene Inhalte?',
        answer: 'Klicken Sie auf das Flaggen-Symbol neben dem Inhalt und wählen Sie den Grund für die Meldung. Unser Moderations-Team prüft alle Meldungen innerhalb von 24 Stunden. Sie erhalten eine Benachrichtigung über das Ergebnis.',
        helpfulCount: 20,
        notHelpfulCount: 0,
        tags: ['melden', 'unangemessen', 'moderation', 'content']
      },
      {
        id: 9,
        category: 'REPORT',
        question: 'Was passiert nach einer Meldung?',
        answer: 'Nach Ihrer Meldung: 1) Automatische Bestätigung, 2) Moderator prüft innerhalb 24h, 3) Maßnahmen werden ergriffen (Warnung, Inhalt entfernen, Account sperren), 4) Sie erhalten eine Rückmeldung. Falsche Meldungen können zu Konsequenzen führen.',
        helpfulCount: 14,
        notHelpfulCount: 1,
        tags: ['meldung', 'prozess', 'moderation', 'feedback']
      },
      {
        id: 10,
        category: 'OTHER',
        question: 'Wie funktioniert das Freunde-System?',
        answer: 'Suchen Sie andere Nutzer über die Freunde-Funktion, senden Sie eine Freundschaftsanfrage. Nach Bestätigung können Sie privat chatten und sehen Updates. Freundschaften können jederzeit beendet werden.',
        helpfulCount: 11,
        notHelpfulCount: 3,
        tags: ['freunde', 'anfrage', 'chat', 'social']
      },
      {
        id: 11,
        category: 'OTHER',
        question: 'Wie kann ich Author werden?',
        answer: 'Bewerben Sie sich über das Dashboard unter "Übersicht" → "Author werden". Füllen Sie das Bewerbungsformular aus und fügen Sie Referenzen hinzu. Die Prüfung dauert 3-7 Werktage. Authors können Artikel erstellen und veröffentlichen.',
        helpfulCount: 25,
        notHelpfulCount: 1,
        tags: ['author', 'bewerbung', 'artikel', 'schreiben']
      },
      {
        id: 12,
        category: 'OTHER',
        question: 'Welche Dateiformate werden unterstützt?',
        answer: 'Bilder: JPG, PNG, WEBP, GIF (max. 5MB). Dokumente: PDF, DOC, DOCX, TXT (max. 10MB). Videos: MP4, WEBM (max. 50MB). Keine ausführbaren Dateien (.exe, .bat) aus Sicherheitsgründen.',
        helpfulCount: 7,
        notHelpfulCount: 0,
        tags: ['dateien', 'upload', 'format', 'größe']
      }
    ]);

    // Computed
    const filteredFaqs = computed(() => {
      let result = [...faqs.value];

      // Category filter
      if (selectedCategory.value) {
        result = result.filter(faq => faq.category === selectedCategory.value);
      }

      // Search filter
      if (searchTerm.value) {
        const search = searchTerm.value.toLowerCase();
        result = result.filter(faq => 
          faq.question.toLowerCase().includes(search) ||
          faq.answer.toLowerCase().includes(search) ||
          faq.tags?.some(tag => tag.toLowerCase().includes(search))
        );
      }

      // Sort by helpfulness
      return result.sort((a, b) => {
        const aScore = (a.helpfulCount || 0) - (a.notHelpfulCount || 0);
        const bScore = (b.helpfulCount || 0) - (b.notHelpfulCount || 0);
        return bScore - aScore;
      });
    });

    // Methods
    const toggleFaq = (faqId: number) => {
      expandedFaq.value = expandedFaq.value === faqId ? null : faqId;
    };

    const rateFaq = (faqId: number, helpful: boolean) => {
      const faq = faqs.value.find(f => f.id === faqId);
      if (!faq) return;

      // Lokale Bewertung (in echter App würde das im LocalStorage gespeichert)
      if (faq.userRating === helpful) {
        // Remove rating
        faq.userRating = null;
        if (helpful) {
          faq.helpfulCount = Math.max(0, (faq.helpfulCount || 1) - 1);
        } else {
          faq.notHelpfulCount = Math.max(0, (faq.notHelpfulCount || 1) - 1);
        }
      } else {
        // Update rating
        if (faq.userRating !== null && faq.userRating !== undefined) {
          // Remove old rating
          if (faq.userRating) {
            faq.helpfulCount = Math.max(0, (faq.helpfulCount || 1) - 1);
          } else {
            faq.notHelpfulCount = Math.max(0, (faq.notHelpfulCount || 1) - 1);
          }
        }
        
        // Add new rating
        faq.userRating = helpful;
        if (helpful) {
          faq.helpfulCount = (faq.helpfulCount || 0) + 1;
        } else {
          faq.notHelpfulCount = (faq.notHelpfulCount || 0) + 1;
        }
      }

      // In einer echten App: Bewertung in localStorage speichern
      const userRatings = JSON.parse(localStorage.getItem('faq_ratings') || '{}');
      userRatings[faqId] = faq.userRating;
      localStorage.setItem('faq_ratings', JSON.stringify(userRatings));
    };

    const getCategoryIcon = (category: string) => {
      const categoryMap: Record<string, any> = {
        'ACCOUNT': UserCircleIcon,
        'TECHNICAL': ComputerDesktopIcon,
        'WEBSITE_BUG': BugAntIcon,
        'REPORT': FlagIcon,
        'OTHER': ChatBubbleLeftRightIcon
      };
      return categoryMap[category] || QuestionMarkCircleIcon;
    };

    const formatCategory = (category: string) => {
      const nameMap: Record<string, string> = {
        'ACCOUNT': 'Konto',
        'TECHNICAL': 'Technisch',
        'WEBSITE_BUG': 'Fehler',
        'REPORT': 'Melden',
        'OTHER': 'Sonstiges'
      };
      return nameMap[category] || category;
    };

    const getRelatedFaqs = (category: string, currentId: number) => {
      return faqs.value
        .filter(faq => faq.category === category && faq.id !== currentId)
        .slice(0, 3);
    };

    // Load user ratings from localStorage
    const loadUserRatings = () => {
      const userRatings = JSON.parse(localStorage.getItem('faq_ratings') || '{}');
      faqs.value.forEach(faq => {
        if (userRatings[faq.id] !== undefined) {
          faq.userRating = userRatings[faq.id];
        }
      });
    };

    // Initialize
    loadUserRatings();

    return {
      searchTerm,
      selectedCategory,
      expandedFaq,
      categories,
      filteredFaqs,
      toggleFaq,
      rateFaq,
      getCategoryIcon,
      formatCategory,
      getRelatedFaqs
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;

.support-faq {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.faq-header {
  margin-bottom: 32px;
  
  .search-filter-container {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
    flex-wrap: wrap;

    .search-input-wrapper {
      flex: 1;
      position: relative;
      min-width: 200px;

      .search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        width: 20px;
        height: 20px;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-tertiary);
          }
        }
      }

      .search-input {
        width: 100%;
        padding: 12px 12px 12px 44px;
        border-radius: 8px;
        border: 1px solid;
        font-size: 0.875rem;
        transition: all 0.2s;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, primary-bg);
            border-color: mixins.theme-color($theme, border-medium);
            color: mixins.theme-color($theme, text-primary);

            &:focus {
              outline: none;
              border-color: #4ad295;
              box-shadow: 0 0 0 3px rgba(74, 210, 149, 0.1);
            }

            &::placeholder {
              color: mixins.theme-color($theme, text-tertiary);
            }
          }
        }
      }
    }

    .custom-select {
      position: relative;
      min-width: 180px;

      .category-filter {
        width: 100%;
        padding: 12px 40px 12px 16px;
        border-radius: 8px;
        border: 1px solid;
        font-size: 0.875rem;
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        cursor: pointer;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, primary-bg);
            border-color: mixins.theme-color($theme, border-medium);
            color: mixins.theme-color($theme, text-primary);

            &:focus {
              outline: none;
              border-color: #4ad295;
            }

            option {
              background-color: mixins.theme-color($theme, primary-bg);
              color: mixins.theme-color($theme, text-primary);
              padding: 8px;
            }
          }
        }
      }

      .select-icon {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        width: 20px;
        height: 20px;
        pointer-events: none;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }
    }
  }

  .category-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .category-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 500;
      border: none;
      cursor: pointer;
      transition: all 0.2s;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          color: mixins.theme-color($theme, text-secondary);

          &:hover {
            background-color: mixins.theme-color($theme, hover-color);
            box-shadow: 0 0 10px rgba(74, 210, 149, 0.1);
          }

          &.active {
            background: linear-gradient(135deg, #4ad295 0%, #35ccd0 100%);
            color: white;
            box-shadow: 0 0 15px rgba(74, 210, 149, 0.2);
          }
        }
      }

      .category-icon {
        width: 16px;
        height: 16px;
      }
    }
  }
}

.faq-list {
  .empty-state {
    text-align: center;
    padding: 48px 24px;
    border-radius: 12px;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        border: 1px solid mixins.theme-color($theme, border-light);
      }
    }

    .empty-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 16px;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-tertiary);
        }
      }
    }

    h3 {
      margin: 0 0 8px 0;
      font-size: 1.125rem;
      font-weight: 600;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    p {
      margin: 0 0 24px 0;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  .faq-item {
    margin-bottom: 12px;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.2s;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        border: 1px solid mixins.theme-color($theme, border-light);

        &:hover {
          border-color: #4ad295;
          box-shadow: 0 0 12px rgba(74, 210, 149, 0.1);
        }
      }
    }

    .faq-question {
      width: 100%;
      padding: 20px;
      text-align: left;
      border: none;
      background: transparent;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      transition: all 0.2s;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          &:hover {
            background-color: mixins.theme-color($theme, hover-color);
          }
        }
      }

      .question-content {
        flex: 1;

        .category-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          margin-bottom: 8px;
          background-color: rgba(74, 210, 149, 0.1);
          color: #4ad295;
        }

        .question-text {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          line-height: 1.4;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }
      }

      .chevron-icon {
        width: 20px;
        height: 20px;
        transition: transform 0.2s;
        flex-shrink: 0;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }

        &.rotated {
          transform: rotate(180deg);
        }
      }
    }

    .faq-answer {
      .answer-content {
        padding: 0 20px 20px;
        border-top: 1px solid;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            border-color: mixins.theme-color($theme, border-light);
          }
        }

        .answer-text {
          margin: 16px 0 20px 0;
          line-height: 1.6;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }

        .feedback-section {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 0;
          border-top: 1px solid;
          flex-wrap: wrap;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              border-color: mixins.theme-color($theme, border-light);
            }
          }

          .feedback-label {
            font-size: 0.875rem;
            font-weight: 500;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-secondary);
              }
            }
          }

          .feedback-buttons {
            display: flex;
            gap: 8px;

            .feedback-btn {
              display: flex;
              align-items: center;
              gap: 4px;
              padding: 6px 12px;
              border-radius: 16px;
              font-size: 0.75rem;
              font-weight: 500;
              border: 1px solid;
              cursor: pointer;
              transition: all 0.2s;

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background-color: transparent;
                  border-color: mixins.theme-color($theme, border-medium);
                  color: mixins.theme-color($theme, text-secondary);

                  &:hover, &.active {
                    background-color: mixins.theme-color($theme, hover-color);
                    color: mixins.theme-color($theme, text-primary);
                    border-color: #4ad295;
                    box-shadow: 0 0 8px rgba(74, 210, 149, 0.15);
                  }
                }
              }
            }
          }
        }

        .related-faqs {
          margin-top: 16px;
          padding: 16px;
          border-radius: 8px;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
            }
          }

          h4 {
            margin: 0 0 8px 0;
            font-size: 0.875rem;
            font-weight: 600;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-primary);
              }
            }
          }

          ul {
            margin: 0;
            padding: 0;
            list-style: none;

            li {
              margin-bottom: 4px;

              .related-link {
                color: #4ad295;
                text-decoration: none;
                font-size: 0.875rem;
                background: none;
                border: none;
                cursor: pointer;
                transition: all 0.2s;

                &:hover {
                  text-decoration: underline;
                  text-shadow: 0 0 8px rgba(74, 210, 149, 0.3);
                }
              }
            }
          }
        }
      }
    }
  }
}

.cta-section {
  margin-top: 40px;
  text-align: center;
  padding: 32px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(74, 210, 149, 0.05) 0%, rgba(53, 204, 208, 0.05) 100%);

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      border: 1px solid mixins.theme-color($theme, border-light);
    }
  }

  .cta-icon {
    width: 32px;
    height: 32px;
    margin: 0 auto 16px;
    color: #4ad295;
    filter: drop-shadow(0 0 6px rgba(74, 210, 149, 0.4));
  }

  h3 {
    margin: 0 0 8px 0;
    font-size: 1.25rem;
    font-weight: 600;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
      }
    }
  }

  p {
    margin: 0 0 24px 0;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
      }
    }
  }
}

.btn-create-ticket {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, secondary-bg);
      color: mixins.theme-color($theme, text-primary);
      border: 1px solid mixins.theme-color($theme, border-medium);

      &:hover {
        background-color: mixins.theme-color($theme, hover-color);
        box-shadow: 0 0 10px rgba(74, 210, 149, 0.1);
      }
    }
  }

  &.primary {
    background: linear-gradient(135deg, #4ad295 0%, #35ccd0 100%);
    color: white;
    border: none;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      inset: -1px;
      border-radius: 8px;
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

// FAQ Expand Animation
.faq-expand-enter-active,
.faq-expand-leave-active {
  transition: all 0.3s ease-out;
  overflow: hidden;
}

.faq-expand-enter-from,
.faq-expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.faq-expand-enter-to,
.faq-expand-leave-from {
  max-height: 500px;
  opacity: 1;
}

@media (max-width: 768px) {
  .support-faq {
    padding: 16px;
  }

  .faq-header {
    .search-filter-container {
      flex-direction: column;

      .search-input-wrapper,
      .custom-select {
        min-width: 100%;
      }
    }

    .category-pills {
      justify-content: center;
    }
  }

  .faq-item {
    .faq-question {
      padding: 16px;

      .question-content .question-text {
        font-size: 0.9rem;
      }
    }
  }

  .feedback-section {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 12px !important;
  }
}

.Icons{
  width: 20px;
}
</style>