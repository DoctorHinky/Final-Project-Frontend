<!-- src/components/member/dashboard/Overview.vue -->
<template>
  <div class="overview-dashboard">
    <div class="welcome-section">
      <div class="welcome-message">
        <h2>Übersicht</h2>
        <p>Hier ist deine Übersicht für {{ currentDate }}</p>
      </div>

      <!-- Neuer CTA-Button für Autor-Bewerbung -->
      <button class="become-author-cta" @click="toggleAuthorModal">
        <IconPencilSquare class="cta-icon" />
        Werde Autor
      </button>
    </div>

    <!-- Statistik-Karten -->
    <div class="stats-cards">
      <div class="stat-card" v-for="(stat, index) in stats" :key="index">
        <div class="stat-icon" :style="{ backgroundColor: stat.color }">
          <span>{{ stat.icon }}</span>
        </div>
        <div class="stat-info">
          <h3>{{ stat.value }}</h3>
          <p>{{ stat.label }}</p>
        </div>
      </div>
    </div>

    <!-- Hauptinhaltsbereich mit klarer Trennung -->
    <div class="dashboard-content">
      <!-- Aktivitäten-Sektion -->
      <div class="section-container recent-activities">
        <div class="section-header">
          <h3>Deine Lese-Aktivitäten</h3>
          <button class="view-all-button" @click="goToMyArticles">Alle anzeigen</button>
        </div>

        <!-- Keine Aktivitäten Fallback -->
        <div v-if="recentArticles.length === 0" class="empty-state">
          <p>Du hast noch keine Artikel gelesen. Entdecke jetzt neue Inhalte!</p>
          <button class="discover-button">Entdecken</button>
        </div>

        <!-- Liste der aktuellen Artikel mit Kapitel/Seiten-Angabe -->
        <div v-else class="article-progress-list">
          <div v-for="(article, index) in recentArticles" :key="index" class="progress-item"
            @click="openArticle(article)">
            <div class="article-status" :class="article.status"></div>
            <div class="progress-info">
              <h4>{{ article.title }}</h4>
              <div class="progress-meta">
                <span class="progress-chapter">
                  <span class="chapter-label">Fortschritt:</span>
                  <span class="chapter-progress">{{ article.currentChapter }}/{{ article.totalChapters }} Kapitel</span>
                </span>
                <span class="progress-date">{{ article.lastRead }}</span>
              </div>
            </div>
            <div class="progress-bar">
              <div class="progress-fill"
                :style="{ width: (article.currentChapter / article.totalChapters * 100) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empfehlungen-Sektion mit klarer Trennung -->
      <div class="section-container recommendations">
        <div class="section-header">
          <h3>Empfohlen für dich</h3>
        </div>

        <!-- Liste der empfohlenen Artikel -->
        <div class="recommended-list">
          <div v-for="(article, index) in recommendedArticles" :key="index" class="recommended-item"
            @click="openArticle(article)">
            <div class="recommendation-tag">{{ article.category }}</div>
            <h4>{{ article.title }}</h4>
            <p class="article-preview">{{ article.preview }}</p>
            <div class="article-meta">
              <span class="article-author">{{ article.author }}</span>
              <span class="article-date">{{ article.date }}</span>
            </div>
            <button class="read-now-button">Jetzt lesen</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal für Autor-Bewerbung -->
    <div class="author-modal-backdrop" v-if="showAuthorModal" @click="closeModalOnBackdrop">
      <div class="author-modal">
        <div class="modal-header">
          <h2>Als Autor bewerben</h2>
          <button class="close-button" @click="toggleAuthorModal">
            <IconXMark class="close-icon" />
          </button>
        </div>

        <div class="modal-content">
          <p class="modal-description">
            Teile dein Wissen und deine Erfahrungen mit unserer Community.
            Als Autor kannst du wertvolle Inhalte erstellen und anderen Eltern helfen.
          </p>

          <form @submit.prevent="submitAuthorApplication" class="author-application-form">
            <!-- Persönliche Informationen -->
            <div class="form-section">
              <h3>Persönliche Informationen</h3>

              <div class="form-group">
                <label for="expertise">Fachbereich</label>
                <select id="expertise" v-model="authorApplication.expertise" required>
                  <option value="" disabled selected>Bitte wählen...</option>
                  <option value="erziehung">Erziehung &amp; Entwicklung</option>
                  <option value="bildung">Bildung &amp; Schule</option>
                  <option value="gesundheit">Gesundheit &amp; Ernährung</option>
                  <option value="psychologie">Familienpsychologie</option>
                  <option value="freizeit">Freizeit &amp; Aktivitäten</option>
                  <option value="beziehung">Familienbeziehungen</option>
                  <option value="other">Sonstiges</option>
                </select>
              </div>

              <div class="form-group" v-if="authorApplication.expertise === 'other'">
                <label for="expertiseOther">Fachbereich (Sonstiges)</label>
                <input type="text" id="expertiseOther" v-model="authorApplication.expertiseOther"
                  placeholder="Bitte spezifizieren Sie Ihren Fachbereich" required />
              </div>

              <div class="form-group">
                <label for="qualifications">Qualifikationen</label>
                <textarea id="qualifications" v-model="authorApplication.qualifications"
                  placeholder="Beschreiben Sie Ihre Ausbildung, Erfahrung und Qualifikationen..." rows="4"
                  required></textarea>
              </div>
            </div>

            <!-- Motivation -->
            <div class="form-section">
              <h3>Motivation</h3>

              <div class="form-group">
                <label for="motivation">Warum möchten Sie Autor werden?</label>
                <textarea id="motivation" v-model="authorApplication.motivation"
                  placeholder="Teilen Sie Ihre Motivation, als Autor für unsere Plattform zu schreiben..." rows="4"
                  required></textarea>
              </div>
            </div>

            <!-- Beispielinhalte -->
            <div class="form-section">
              <h3>Beispielinhalte</h3>

              <div class="form-group">
                <label for="sampleTitle">Titel eines möglichen Artikels</label>
                <input type="text" id="sampleTitle" v-model="authorApplication.sampleTitle"
                  placeholder="z.B. 'Effektive Kommunikationsstrategien für Eltern'" required />
              </div>

              <div class="form-group">
                <label for="sampleDescription">Kurze Beschreibung des Artikels</label>
                <textarea id="sampleDescription" v-model="authorApplication.sampleDescription"
                  placeholder="Beschreiben Sie kurz den Inhalt Ihres Beispielartikels..." rows="3" required></textarea>
              </div>
            </div>

            <!-- Dateien hochladen -->
            <div class="form-section">
              <h3>Unterlagen hochladen</h3>

              <div class="file-upload-group">
                <div class="file-upload-item">
                  <label for="coverLetter" class="file-label">
                    <div class="file-icon-container">
                      <IconDocument class="file-icon" />
                      <IconPlus class="add-icon" v-if="!coverLetterFile" />
                      <IconCheck class="check-icon" v-else />
                    </div>
                    <span class="file-type">Anschreiben</span>
                    <span class="file-description">PDF oder DOC, max. 5MB</span>
                  </label>
                  <input type="file" id="coverLetter" ref="coverLetterInput" @change="handleCoverLetterUpload"
                    accept=".pdf,.doc,.docx" class="file-input" required />
                  <div class="file-info" v-if="coverLetterFile">
                    <span class="file-name">{{ coverLetterFile.name }}</span>
                    <button type="button" class="remove-file" @click="removeCoverLetter">
                      <IconTrash class="trash-icon" />
                    </button>
                  </div>
                </div>

                <div class="file-upload-item">
                  <label for="certification" class="file-label">
                    <div class="file-icon-container">
                      <IconAcademicCap class="file-icon" />
                      <IconPlus class="add-icon" v-if="!certificationFile" />
                      <IconCheck class="check-icon" v-else />
                    </div>
                    <span class="file-type">Zertifizierungen</span>
                    <span class="file-description">PDF oder Bilder, max. 10MB</span>
                  </label>
                  <input type="file" id="certification" ref="certificationInput" @change="handleCertificationUpload"
                    accept=".pdf,.jpg,.jpeg,.png" class="file-input" />
                  <div class="file-info" v-if="certificationFile">
                    <span class="file-name">{{ certificationFile.name }}</span>
                    <button type="button" class="remove-file" @click="removeCertification">
                      <IconTrash class="trash-icon" />
                    </button>
                  </div>
                </div>

                <div class="file-upload-item">
                  <label for="writingSample" class="file-label">
                    <div class="file-icon-container">
                      <IconDocumentText class="file-icon" />
                      <IconPlus class="add-icon" v-if="!writingSampleFile" />
                      <IconCheck class="check-icon" v-else />
                    </div>
                    <span class="file-type">Textprobe</span>
                    <span class="file-description">PDF oder DOC, max. 5MB</span>
                  </label>
                  <input type="file" id="writingSample" ref="writingSampleInput" @change="handleWritingSampleUpload"
                    accept=".pdf,.doc,.docx" class="file-input" required />
                  <div class="file-info" v-if="writingSampleFile">
                    <span class="file-name">{{ writingSampleFile.name }}</span>
                    <button type="button" class="remove-file" @click="removeWritingSample">
                      <IconTrash class="trash-icon" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Datenschutz und Einreichung -->
            <div class="form-section">
              <div class="form-checkbox">
                <input type="checkbox" id="agreeTerms" v-model="authorApplication.agreeTerms" required />
                <label for="agreeTerms">
                  Ich stimme der Verarbeitung meiner Daten gemäß der <a href="#"
                    class="privacy-link">Datenschutzerklärung</a> zu
                </label>
              </div>

              <div class="form-actions">
                <button type="button" class="cancel-button" @click="toggleAuthorModal">Abbrechen</button>
                <button type="submit" class="submit-button" :disabled="isSubmitting">
                  <span v-if="isSubmitting">Wird gesendet...</span>
                  <span v-else>Bewerbung absenden</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services/auth.service';
// Import Heroicons
import {
  PencilSquareIcon as IconPencilSquare,
  XMarkIcon as IconXMark,
  DocumentIcon as IconDocument,
  DocumentTextIcon as IconDocumentText,
  AcademicCapIcon as IconAcademicCap,
  PlusIcon as IconPlus,
  CheckIcon as IconCheck,
  TrashIcon as IconTrash
} from '@heroicons/vue/24/outline';

interface Article {
  id: number;
  title: string;
  preview?: string;
  category?: string;
  author?: string;
  date?: string;
  status?: string;
  currentChapter?: number;
  totalChapters?: number;
  lastRead?: string;
}

interface AuthorApplication {
  expertise: string;
  expertiseOther: string;
  qualifications: string;
  motivation: string;
  sampleTitle: string;
  sampleDescription: string;
  agreeTerms: boolean;
}

export default defineComponent({
  name: 'OverviewDashboard',
  components: {
    IconPencilSquare,
    IconXMark,
    IconDocument,
    IconDocumentText,
    IconAcademicCap,
    IconPlus,
    IconCheck,
    IconTrash
  },
  setup() {
    const router = useRouter();
    const userName = ref('Mitglied');
    const currentDate = computed(() => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      return now.toLocaleDateString('de-DE', options);
    });

    // Statistiken
    const stats = ref([
      { icon: '📚', label: 'Gelesene Artikel', value: '12', color: 'rgba(74, 210, 149, 0.2)' },
      { icon: '⭐', label: 'Favoriten', value: '5', color: 'rgba(255, 212, 96, 0.2)' },
      { icon: '👥', label: 'Freunde', value: '3', color: 'rgba(53, 204, 208, 0.2)' },
    ]);

    // Zuletzt gelesene Artikel mit Kapitel/Seiten statt Prozent
    const recentArticles = ref<Article[]>([
      {
        id: 1,
        title: 'Erziehungsstile im Vergleich: Welcher passt zu Ihrer Familie?',
        status: 'in-progress',
        currentChapter: 4,
        totalChapters: 6,
        lastRead: 'Gestern'
      },
      {
        id: 2,
        title: 'Gesunde Ernährung für Kleinkinder: Ein praktischer Leitfaden',
        status: 'just-started',
        currentChapter: 1,
        totalChapters: 8,
        lastRead: 'Vor 3 Tagen'
      },
      {
        id: 4,
        title: 'Grenzen setzen ohne Konflikte: Effektive Kommunikation mit Kindern',
        status: 'almost-done',
        currentChapter: 5,
        totalChapters: 6,
        lastRead: 'Vor einer Woche'
      }
    ]);

    // Empfohlene Artikel
    const recommendedArticles = ref<Article[]>([
      {
        id: 3,
        title: 'Digitale Medien im Kindesalter: Fluch oder Segen?',
        preview: 'Eine ausgewogene Betrachtung der Vor- und Nachteile digitaler Medien für Kinder.',
        category: 'Medien',
        author: 'Prof. Thomas Becker',
        date: '28.04.2025'
      },
      {
        id: 5,
        title: 'Die Phasen der kindlichen Entwicklung verstehen',
        preview: 'Erfahren Sie, wie Sie Ihr Kind in jeder Entwicklungsphase optimal unterstützen können.',
        category: 'Entwicklung',
        author: 'Dr. Maria Schmidt',
        date: '15.04.2025'
      },
      {
        id: 6,
        title: 'Wie Musik die kognitive Entwicklung fördert',
        preview: 'Neue Studien zeigen den positiven Einfluss von Musikunterricht auf die Gehirnentwicklung.',
        category: 'Bildung',
        author: 'Julia Wagner',
        date: '10.04.2025'
      }
    ]);

    // Autor-Bewerbung Modal
    const showAuthorModal = ref(false);
    const isSubmitting = ref(false);

    // Datei-Upload-Referenzen
    const coverLetterInput = ref<HTMLInputElement | null>(null);
    const certificationInput = ref<HTMLInputElement | null>(null);
    const writingSampleInput = ref<HTMLInputElement | null>(null);

    // Datei-Objekte
    const coverLetterFile = ref<File | null>(null);
    const certificationFile = ref<File | null>(null);
    const writingSampleFile = ref<File | null>(null);

    // Formular-Daten
    const authorApplication = reactive<AuthorApplication>({
      expertise: '',
      expertiseOther: '',
      qualifications: '',
      motivation: '',
      sampleTitle: '',
      sampleDescription: '',
      agreeTerms: false
    });

    // Modal öffnen/schließen
    const toggleAuthorModal = () => {
      showAuthorModal.value = !showAuthorModal.value;

      // Wenn Modal geschlossen wird, Formular zurücksetzen
      if (!showAuthorModal.value) {
        resetForm();
      }
    };

    // Modal nur schließen, wenn auf Backdrop geklickt wird
    const closeModalOnBackdrop = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('author-modal-backdrop')) {
        toggleAuthorModal();
      }
    };

    // Formular zurücksetzen
    const resetForm = () => {
      Object.assign(authorApplication, {
        expertise: '',
        expertiseOther: '',
        qualifications: '',
        motivation: '',
        sampleTitle: '',
        sampleDescription: '',
        agreeTerms: false
      });

      // Datei-Uploads zurücksetzen
      coverLetterFile.value = null;
      certificationFile.value = null;
      writingSampleFile.value = null;

      if (coverLetterInput.value) coverLetterInput.value.value = '';
      if (certificationInput.value) certificationInput.value.value = '';
      if (writingSampleInput.value) writingSampleInput.value.value = '';
    };

    // Datei-Upload-Handler
    const handleCoverLetterUpload = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        coverLetterFile.value = target.files[0];
      }
    };

    const handleCertificationUpload = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        certificationFile.value = target.files[0];
      }
    };

    const handleWritingSampleUpload = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        writingSampleFile.value = target.files[0];
      }
    };

    // Datei entfernen
    const removeCoverLetter = () => {
      coverLetterFile.value = null;
      if (coverLetterInput.value) coverLetterInput.value.value = '';
    };

    const removeCertification = () => {
      certificationFile.value = null;
      if (certificationInput.value) certificationInput.value.value = '';
    };

    const removeWritingSample = () => {
      writingSampleFile.value = null;
      if (writingSampleInput.value) writingSampleInput.value.value = '';
    };

    // Formular absenden
    const submitAuthorApplication = async () => {
      isSubmitting.value = true;

      try {
        // Hier würde normalerweise der API-Aufruf erfolgen
        // mit FormData für Dateien und JSON für Textdaten

        // FormData für den Upload erstellen
        const formData = new FormData();

        // Textdaten hinzufügen
        formData.append('expertise', authorApplication.expertise);
        if (authorApplication.expertise === 'other') {
          formData.append('expertiseOther', authorApplication.expertiseOther);
        }
        formData.append('qualifications', authorApplication.qualifications);
        formData.append('motivation', authorApplication.motivation);
        formData.append('sampleTitle', authorApplication.sampleTitle);
        formData.append('sampleDescription', authorApplication.sampleDescription);

        // Dateien hinzufügen
        if (coverLetterFile.value) {
          formData.append('coverLetter', coverLetterFile.value);
        }

        if (certificationFile.value) {
          formData.append('certification', certificationFile.value);
        }

        if (writingSampleFile.value) {
          formData.append('writingSample', writingSampleFile.value);
        }

        // Benutzer-ID aus dem Auth-Service hinzufügen
        const userData = authService.getUserData();
        if (userData && userData.id) {
          formData.append('userId', userData.id);
        }

        // Simuliere API-Aufruf mit Verzögerung
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log('Autor-Bewerbung wurde erfolgreich gesendet:', {
          formData,
          textData: {
            ...authorApplication,
            userId: userData?.id
          },
          files: {
            coverLetter: coverLetterFile.value?.name,
            certification: certificationFile.value?.name,
            writingSample: writingSampleFile.value?.name
          }
        });

        // Modal schließen und Erfolgsmeldung anzeigen
        toggleAuthorModal();
        alert('Vielen Dank für deine Bewerbung! Wir werden deine Unterlagen prüfen und uns in Kürze bei dir melden.');

      } catch (error) {
        console.error('Fehler beim Senden der Autor-Bewerbung:', error);
        alert('Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.');
      } finally {
        isSubmitting.value = false;
      }
    };

    // Artikel öffnen (Platzhalter)
    const openArticle = (article: Article) => {
      console.log('Artikel öffnen:', article.title);
      // Hier später Implementierung für Artikel-Ansicht
      alert(`Artikel "${article.title}" wird geöffnet...`);
    };

    // Navigation zu anderen Dashboardbereichen
    const goToMyArticles = () => {
      router.push({ name: 'MemberDashboard', query: { tab: 'my-articles' } });
    };

    const goToDiscovery = () => {
      // Hier könnte eine eigene Entdecken-Seite oder ein bestimmter Tab angesteuert werden
      router.push({ name: 'MemberDashboard', query: { tab: 'favorites' } });
    };

    // Benutzerdaten beim Mounten laden
    onMounted(() => {
      const userData = authService.getUserData();
      if (userData && userData.name) {
        userName.value = userData.name.split(' ')[0]; // Nur Vorname verwenden
      }

      // Hier später API-Aufruf für Dashboard-Daten
    });

    return {
      userName,
      currentDate,
      stats,
      recentArticles,
      recommendedArticles,
      openArticle,
      goToMyArticles,
      goToDiscovery,
      // Autor-Bewerbung
      showAuthorModal,
      authorApplication,
      toggleAuthorModal,
      closeModalOnBackdrop,
      submitAuthorApplication,
      isSubmitting,
      // Datei-Upload-Refs
      coverLetterInput,
      certificationInput,
      writingSampleInput,
      // Datei-Objekte
      coverLetterFile,
      certificationFile,
      writingSampleFile,
      // Datei-Handler
      handleCoverLetterUpload,
      handleCertificationUpload,
      handleWritingSampleUpload,
      removeCoverLetter,
      removeCertification,
      removeWritingSample
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

.overview-dashboard {
  @include animations.fade-in(0.5s);
  display: flex;
  flex-direction: column;
  gap: map.get(vars.$spacing, xl);

  // Willkommen-Sektion mit CTA-Button
  .welcome-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: map.get(vars.$spacing, l);
    padding: map.get(vars.$spacing, l);
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);
    transition: all 0.3s;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        border: 1px solid mixins.theme-color($theme, border-light);

        &:hover {
          transform: translateY(-5px);
          @include mixins.shadow('medium', $theme);
          border-color: mixins.theme-color($theme, accent-teal);
        }
      }
    }

    @media (max-width: 768px) {
      flex-direction: column;
      gap: map.get(vars.$spacing, m);
    }

    .welcome-message {
      h2 {
        font-size: map.get(map.get(vars.$fonts, sizes), xxl);
        font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
        margin-bottom: map.get(vars.$spacing, xs);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }

      p {
        font-size: map.get(map.get(vars.$fonts, sizes), medium);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }
    }

    // CTA-Button für Autor-Bewerbung
    .become-author-cta {
      /* Grundlegende Struktur */
      width: 100%;
      max-width: 400px;
      height: auto;
      min-height: 60px;

      /* Flexbox-Layout */
      display: flex;
      justify-content: center;
      align-items: center;
      gap: map.get(vars.$spacing, xs);
      padding: map.get(vars.$spacing, m) map.get(vars.$spacing, l);

      /* Moderne Formgebung mit Variables */
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      position: relative;
      overflow: hidden;

      /* Typografie mit Variables */
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      font-size: map.get(map.get(vars.$fonts, sizes), medium);
      text-transform: uppercase;
      letter-spacing: 1.5px;

      /* Interaktionselemente */
      border: none;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

      /* Einzigartiges Design mit Theme-Unterstützung */
      background-size: 200% 200%;
      animation: gradientShift 15s ease infinite;

      /* Theme-spezifische Eigenschaften */
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          /* Theme-spezifischer Gradient-Hintergrund */
          background: linear-gradient(135deg,
              mixins.theme-color($theme, accent-green) 0%,
              mixins.theme-color($theme, accent-teal) 50%,
              mixins.theme-color($theme, accent-lime) 100%);

          /* Theme-spezifische Schatten */
          box-shadow: 0 10px 25px mixins.theme-color($theme, shadow-color),
            0 5px 15px rgba(mixins.theme-color($theme, accent-green), 0.2);

          /* Textfarbe ist in beiden Themes weiß für Kontrast */
          color: #ffffff;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
      }
    }

    /* Pseudo-Element für Glanzeffekt */
    .become-author-cta::before {
      content: "";
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 60%);
      transform: rotate(30deg);
      opacity: 0;
      transition: opacity 0.6s ease;
      pointer-events: none;
    }

    /* Hover-Effekte mit Theme-Unterstützung */
    .become-author-cta:hover {
      transform: translateY(-5px) scale(1.02);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          box-shadow: 0 15px 30px mixins.theme-color($theme, shadow-color),
            0 0 20px rgba(mixins.theme-color($theme, accent-teal), 0.45),
            inset 0 0 10px rgba(255, 255, 255, 0.3);

          /* Glow-Effekt aus Variablen */
          @include mixins.glow('green', 'medium', $theme);
        }
      }
    }

    .become-author-cta:hover::before {
      opacity: 1;
      animation: glideEffect 1.5s linear infinite;
    }

    /* Aktiv-Status mit Theme-Unterstützung */
    .become-author-cta:active {
      transform: translateY(-2px) scale(0.98);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          box-shadow: 0 5px 15px mixins.theme-color($theme, shadow-color);
        }
      }
    }

    /* Icon-Styling in der CTA mit Theme-Unterstützung */
    .become-author-cta .cta-icon {
      width: 24px;
      height: 24px;
      fill: white;
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
      transition: transform 0.4s ease;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-on-primary);
        }
      }
    }

    .become-author-cta:hover .cta-icon {
      transform: translateX(3px) rotate(10deg);
    }

    /* Animationen */
    @keyframes gradientShift {
      0% {
        background-position: 0% 50%;
      }

      50% {
        background-position: 100% 50%;
      }

      100% {
        background-position: 0% 50%;
      }
    }

    @keyframes glideEffect {
      0% {
        transform: translate(-30%, -30%) rotate(30deg);
      }

      100% {
        transform: translate(30%, 30%) rotate(30deg);
      }
    }

    /* Medienabfragen für Responsivität mit variables */
    @media (max-width: map.get(map.get(vars.$layout, breakpoints), tablet)) {
      .become-author-cta {
        max-width: 100%;
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
      }
    }
  }

  // Statistik-Karten
  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: map.get(vars.$spacing, l);
    margin-bottom: map.get(vars.$spacing, xl);

    .stat-card {
      display: flex;
      align-items: center;
      padding: map.get(vars.$spacing, l);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      transition: all 0.3s;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, card-bg);
          border: 1px solid mixins.theme-color($theme, border-light);

          &:hover {
            transform: translateY(-5px);
            @include mixins.shadow('medium', $theme);
            border-color: mixins.theme-color($theme, accent-green);
          }
        }
      }

      .stat-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: map.get(vars.$spacing, m);
        font-size: 1.5rem;
      }

      .stat-info {
        h3 {
          font-size: map.get(map.get(vars.$fonts, sizes), xl);
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
          margin: 0 0 map.get(vars.$spacing, xxs) 0;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }

        p {
          margin: 0;
          font-size: map.get(map.get(vars.$fonts, sizes), small);

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }
      }
    }
  }

  // Hauptinhaltsbereich
  .dashboard-content {
    display: flex;
    flex-direction: column;
    gap: map.get(vars.$spacing, xxl); // Größerer Abstand für bessere Trennung

    // Gemeinsame Stile für Sektionen
    .section-container {
      padding: map.get(vars.$spacing, xl);
      border-radius: map.get(map.get(vars.$layout, border-radius), large);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, card-bg);
          border: 1px solid mixins.theme-color($theme, border-light);
        }
      }

      // Sektionsüberschrift
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: map.get(vars.$spacing, l);

        h3 {
          font-size: map.get(map.get(vars.$fonts, sizes), large);
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
          margin: 0;
          position: relative;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);

              &::after {
                content: '';
                position: absolute;
                width: 40px;
                height: 3px;
                bottom: -8px;
                left: 0;
                background: mixins.theme-gradient($theme, primary);
                border-radius: 2px;
              }
            }
          }
        }

        .view-all-button {
          background: none;
          border: none;
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          cursor: pointer;
          display: flex;
          align-items: center;

          &::after {
            content: '→';
            margin-left: 5px;
            font-size: 1.2em;
          }

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, accent-teal);

              &:hover {
                color: mixins.theme-color($theme, accent-green);
              }
            }
          }
        }
      }
    }

    // Leerer Zustand
    .empty-state {
      text-align: center;
      padding: map.get(vars.$spacing, xl) 0;

      p {
        margin-bottom: map.get(vars.$spacing, l);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }

      .discover-button {
        padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        border: none;
        cursor: pointer;
        font-weight: map.get(map.get(vars.$fonts, weights), medium);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: mixins.theme-gradient($theme, primary);
            color: white;

            &:hover {
              transform: translateY(-2px);
              @include mixins.shadow('small', $theme);
            }
          }
        }
      }
    }

    // Aktivitäten-Sektion
    .recent-activities {
      margin-bottom: map.get(vars.$spacing, l);
      max-width: 800px;
      margin: 0 auto;

      .article-progress-list {
        display: flex;
        flex-direction: column;
        gap: map.get(vars.$spacing, m);

        .progress-item {
          padding: map.get(vars.$spacing, m);
          border-radius: map.get(map.get(vars.$layout, border-radius), medium);
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
          padding-left: map.get(vars.$spacing, xl); // Platz für Status-Indikator

          // Status-Indikator links
          .article-status {
            position: absolute;
            left: map.get(vars.$spacing, s);
            top: 50%;
            transform: translateY(-50%);
            width: 8px;
            height: 50px;
            border-radius: 4px;

            &.just-started {
              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background-color: mixins.theme-color($theme, accent-yellow);
                }
              }
            }

            &.in-progress {
              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background-color: mixins.theme-color($theme, accent-teal);
                }
              }
            }

            &.almost-done {
              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background-color: mixins.theme-color($theme, accent-green);
                }
              }
            }
          }

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
              border: 1px solid mixins.theme-color($theme, border-light);

              &:hover {
                background-color: mixins.theme-color($theme, hover-color);
                border-color: mixins.theme-color($theme, border-medium);
                transform: translateX(5px);
              }
            }
          }

          .progress-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: map.get(vars.$spacing, s);

            @media (max-width: 768px) {
              flex-direction: column;
              align-items: flex-start;
              gap: map.get(vars.$spacing, xxs);
            }

            h4 {
              font-size: map.get(map.get(vars.$fonts, sizes), medium);
              font-weight: map.get(map.get(vars.$fonts, weights), bold);
              margin: 0;

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, text-primary);
                }
              }
            }

            .progress-meta {
              display: flex;
              gap: map.get(vars.$spacing, m);

              .progress-chapter,
              .progress-date {
                font-size: map.get(map.get(vars.$fonts, sizes), small);

                @each $theme in ('light', 'dark') {
                  .theme-#{$theme} & {
                    color: mixins.theme-color($theme, text-tertiary);
                  }
                }
              }

              .progress-chapter {
                display: flex;
                align-items: center;
                gap: map.get(vars.$spacing, xxs);

                .chapter-label {
                  @each $theme in ('light', 'dark') {
                    .theme-#{$theme} & {
                      color: mixins.theme-color($theme, text-tertiary);
                    }
                  }
                }

                .chapter-progress {
                  font-weight: map.get(map.get(vars.$fonts, weights), bold);

                  @each $theme in ('light', 'dark') {
                    .theme-#{$theme} & {
                      color: mixins.theme-color($theme, accent-green);
                    }
                  }
                }
              }
            }
          }

          .progress-bar {
            height: 6px;
            border-radius: 3px;
            overflow: hidden;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background-color: mixins.theme-color($theme, border-light);
              }
            }

            .progress-fill {
              height: 100%;

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background: mixins.theme-gradient($theme, primary);
                }
              }
            }
          }
        }
      }
    }

    // Empfehlungen-Sektion
    .recommendations {
      .recommended-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: map.get(vars.$spacing, l);

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
        }

        .recommended-item {
          position: relative;
          padding: map.get(vars.$spacing, l);
          border-radius: map.get(map.get(vars.$layout, border-radius), medium);
          transition: all 0.3s;
          display: flex;
          flex-direction: column;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
              border: 1px solid mixins.theme-color($theme, border-light);

              &:hover {
                transform: translateY(-5px);
                @include mixins.shadow('medium', $theme);
                border-color: mixins.theme-color($theme, accent-teal);
              }
            }
          }

          .recommendation-tag {
            position: absolute;
            top: 10px;
            right: 10px;
            padding: map.get(vars.$spacing, xxs) map.get(vars.$spacing, s);
            border-radius: map.get(map.get(vars.$layout, border-radius), pill);
            font-size: map.get(map.get(vars.$fonts, sizes), small);
            font-weight: map.get(map.get(vars.$fonts, weights), medium);

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background: mixins.theme-gradient($theme, primary);
                color: white;
              }
            }
          }

          h4 {
            font-size: map.get(map.get(vars.$fonts, sizes), medium);
            font-weight: map.get(map.get(vars.$fonts, weights), bold);
            margin: 0 0 map.get(vars.$spacing, s) 0;
            padding-right: 80px; // Platz für Tag

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-primary);
              }
            }
          }

          .article-preview {
            font-size: map.get(map.get(vars.$fonts, sizes), small);
            margin-bottom: map.get(vars.$spacing, m);
            flex-grow: 1;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-secondary);
              }
            }
          }

          .article-meta {
            display: flex;
            justify-content: space-between;
            font-size: map.get(map.get(vars.$fonts, sizes), small);
            margin-bottom: map.get(vars.$spacing, m);

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-tertiary);
              }
            }

            .article-author {
              font-weight: map.get(map.get(vars.$fonts, weights), medium);
            }
          }

          .read-now-button {
            padding: map.get(vars.$spacing, s) 0;
            border-radius: map.get(map.get(vars.$layout, border-radius), medium);
            border: none;
            cursor: pointer;
            font-weight: map.get(map.get(vars.$fonts, weights), medium);

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background: mixins.theme-gradient($theme, primary);
                color: white;

                &:hover {
                  transform: translateY(-2px);
                  @include mixins.shadow('small', $theme);
                }
              }
            }
          }
        }
      }
    }
  }

  // Modal für Autor-Bewerbung
  .author-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: map.get(vars.$spacing, l);

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: rgba(if($theme =='dark', #000000, #ffffff), 0.75);
        backdrop-filter: blur(6px);
      }
    }

    .author-modal {
      max-width: 800px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      border-radius: map.get(map.get(vars.$layout, border-radius), large);
      padding: 0;
      position: relative;
      display: flex;
      flex-direction: column;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, card-bg);
          border: 1px solid mixins.theme-color($theme, border-medium);
          @include mixins.shadow('large', $theme);
        }
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: map.get(vars.$spacing, l) map.get(vars.$spacing, xl);
        position: sticky;
        top: 0;
        z-index: 10;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, card-bg);
            border-bottom: 1px solid mixins.theme-color($theme, border-light);
          }
        }

        h2 {
          font-size: map.get(map.get(vars.$fonts, sizes), xl);
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
          margin: 0;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }

        .close-button {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          transition: all 0.2s;

          .close-icon {
            width: 24px;
            height: 24px;
          }

          @each $theme in ('light', 'dark') {
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

      .modal-content {
        padding: map.get(vars.$spacing, xl);

        .modal-description {
          font-size: map.get(map.get(vars.$fonts, sizes), medium);
          margin-bottom: map.get(vars.$spacing, xl);

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }

        // Bewerbungsformular
        .author-application-form {
          display: flex;
          flex-direction: column;
          gap: map.get(vars.$spacing, xl);

          .form-section {
            h3 {
              font-size: map.get(map.get(vars.$fonts, sizes), medium);
              font-weight: map.get(map.get(vars.$fonts, weights), bold);
              margin: 0 0 map.get(vars.$spacing, m) 0;

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, text-primary);
                }
              }
            }

            .form-group {
              margin-bottom: map.get(vars.$spacing, m);

              label {
              display: block;
              margin-bottom: map.get(vars.$spacing, xs);
              font-weight: map.get(map.get(vars.$fonts, weights), medium);

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-secondary);
                }
              }
              }

              input[type="text"],
              input[type="email"],
              select,
              textarea {
              width: 100%;
              padding: map.get(vars.$spacing, m);
              border-radius: map.get(map.get(vars.$layout, border-radius), medium);

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                background-color: mixins.theme-color($theme, secondary-bg);
                border: 1px solid mixins.theme-color($theme, border-light);
                color: mixins.theme-color($theme, text-primary);

                &:focus {
                  border-color: mixins.theme-color($theme, accent-teal);
                  outline: none;
                  box-shadow: 0 0 0 2px rgba(mixins.theme-color($theme, accent-teal), 0.2);
                }

                &::placeholder {
                  color: mixins.theme-color($theme, text-tertiary);
                }
                }
              }
              }

              select {
              cursor: pointer;
              }

              textarea {
              min-height: 100px;
              resize: none;
              }
            }

            // Datei-Upload-Gruppe
            .file-upload-group {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: map.get(vars.$spacing, l);

              .file-upload-item {
                position: relative;

                .file-input {
                  display: none; // Verstecke Original-Input
                }

                .file-label {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  gap: map.get(vars.$spacing, s);
                  padding: map.get(vars.$spacing, l);
                  border-radius: map.get(map.get(vars.$layout, border-radius), medium);
                  cursor: pointer;
                  text-align: center;
                  transition: all 0.3s;

                  @each $theme in ('light', 'dark') {
                    .theme-#{$theme} & {
                      background-color: mixins.theme-color($theme, secondary-bg);
                      border: 2px dashed mixins.theme-color($theme, border-medium);

                      &:hover {
                        border-color: mixins.theme-color($theme, accent-teal);
                        background-color: rgba(mixins.theme-color($theme, accent-teal), 0.05);
                      }
                    }
                  }

                  .file-icon-container {
                    position: relative;
                    width: 50px;
                    height: 50px;

                    .file-icon {
                      width: 100%;
                      height: 100%;

                      @each $theme in ('light', 'dark') {
                        .theme-#{$theme} & {
                          color: mixins.theme-color($theme, text-secondary);
                        }
                      }
                    }

                    .add-icon,
                    .check-icon {
                      position: absolute;
                      bottom: -5px;
                      right: -5px;
                      width: 20px;
                      height: 20px;
                      border-radius: 50%;
                      display: flex;
                      align-items: center;
                      justify-content: center;

                      @each $theme in ('light', 'dark') {
                        .theme-#{$theme} & {
                          background-color: mixins.theme-color($theme, card-bg);
                          border: 1px solid mixins.theme-color($theme, border-light);
                        }
                      }
                    }

                    .add-icon {
                      @each $theme in ('light', 'dark') {
                        .theme-#{$theme} & {
                          color: mixins.theme-color($theme, accent-teal);
                        }
                      }
                    }

                    .check-icon {
                      @each $theme in ('light', 'dark') {
                        .theme-#{$theme} & {
                          color: mixins.theme-color($theme, accent-green);
                        }
                      }
                    }
                  }

                  .file-type {
                    font-weight: map.get(map.get(vars.$fonts, weights), bold);
                    font-size: map.get(map.get(vars.$fonts, sizes), medium);

                    @each $theme in ('light', 'dark') {
                      .theme-#{$theme} & {
                        color: mixins.theme-color($theme, text-primary);
                      }
                    }
                  }

                  .file-description {
                    font-size: map.get(map.get(vars.$fonts, sizes), small);

                    @each $theme in ('light', 'dark') {
                      .theme-#{$theme} & {
                        color: mixins.theme-color($theme, text-tertiary);
                      }
                    }
                  }
                }

                .file-info {
                  margin-top: map.get(vars.$spacing, s);
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, s);
                  border-radius: map.get(map.get(vars.$layout, border-radius), small);

                  @each $theme in ('light', 'dark') {
                    .theme-#{$theme} & {
                      background-color: mixins.theme-color($theme, secondary-bg);
                      border: 1px solid mixins.theme-color($theme, border-light);
                    }
                  }

                  .file-name {
                    font-size: map.get(map.get(vars.$fonts, sizes), small);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 80%;

                    @each $theme in ('light', 'dark') {
                      .theme-#{$theme} & {
                        color: mixins.theme-color($theme, text-secondary);
                      }
                    }
                  }

                  .remove-file {
                    background: none;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    .trash-icon {
                      width: 16px;
                      height: 16px;

                      @each $theme in ('light', 'dark') {
                        .theme-#{$theme} & {
                          color: mixins.theme-color($theme, accent-red);

                        }
                      }
                    }
                  }
                }
              }
            }

            // Checkbox für Nutzungsbedingungen
            .form-checkbox {
              display: flex;
              align-items: center;
              gap: map.get(vars.$spacing, s);
              margin-bottom: map.get(vars.$spacing, l);

              input[type="checkbox"] {
                width: 18px;
                height: 18px;

                @each $theme in ('light', 'dark') {
                  .theme-#{$theme} & {
                    accent-color: mixins.theme-color($theme, accent-teal);
                  }
                }
              }

              label {
                font-size: map.get(map.get(vars.$fonts, sizes), small);

                @each $theme in ('light', 'dark') {
                  .theme-#{$theme} & {
                    color: mixins.theme-color($theme, text-secondary);
                  }
                }

                .privacy-link {
                  @each $theme in ('light', 'dark') {
                    .theme-#{$theme} & {
                      color: mixins.theme-color($theme, accent-teal);
                      text-decoration: none;

                      &:hover {
                        text-decoration: underline;
                      }
                    }
                  }
                }
              }
            }

            // Formular-Aktionen
            .form-actions {
              display: flex;
              justify-content: flex-end;
              gap: map.get(vars.$spacing, m);

              .cancel-button,
              .submit-button {
                display: flex;
                align-items: center;
                gap: map.get(vars.$spacing, xs);
                padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
                border-radius: map.get(map.get(vars.$layout, border-radius), pill);
                font-weight: map.get(map.get(vars.$fonts, weights), bold);
                font-size: map.get(map.get(vars.$fonts, sizes), medium);
                border: none;
                cursor: pointer;
                transition: all 0.3s;
              }

              .cancel-button {
                @each $theme in ('light', 'dark') {
                  .theme-#{$theme} & {
                    background-color: transparent;
                    border: 1px solid mixins.theme-color($theme, border-medium);
                    color: mixins.theme-color($theme, text-secondary);

                    &:hover {
                      background-color: mixins.theme-color($theme, hover-color);
                      color: mixins.theme-color($theme, text-primary);
                    }
                  }
                }
              }

              .submit-button {
                display: flex;
                align-items: center;
                gap: map.get(vars.$spacing, xs);

                @each $theme in ('light', 'dark') {
                  .theme-#{$theme} & {
                    background-color: mixins.theme-color($theme, accent-teal);
                    color: white;
                    @include mixins.shadow('medium', $theme);

                    &:hover {
                      background-color: mixins.theme-color($theme, accent-green);
                      transform: translateY(-3px);
                      @include mixins.glow('green', 'medium', $theme);
                    }

                    &:disabled {
                      opacity: 0.7;
                      cursor: not-allowed;
                      transform: none;
                      box-shadow: none;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>