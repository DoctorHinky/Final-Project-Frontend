<!-- src/components/pages/DashboardPages/Overview/AuthorApplicationModal.vue -->
<template>
  <div class="author-modal-backdrop" v-if="showModal" @click="closeModalOnBackdrop">
    <div class="author-modal">
      <div class="modal-header">
        <h2>Als Autor bewerben</h2>
        <button class="close-button" @click="$emit('close')">
          <IconXMark class="close-icon" />
        </button>
      </div>

      <div class="modal-content">
        <p class="modal-description">
          Teile dein Wissen und deine Erfahrungen mit unserer Community.
          Als Autor kannst du wertvolle Inhalte erstellen und anderen Eltern helfen.
        </p>

        <form @submit.prevent="submitForm" class="author-application-form">
          <!-- Persönliche Informationen -->
          <div class="form-section">
            <h3>Persönliche Informationen</h3>

            <div class="form-group">
              <label for="phone">Telefonnummer *</label>
              <input type="tel" id="phone" v-model="form.phone"
                placeholder="z.B. +49 123 456789" required />
            </div>

            <div class="form-group">
              <label for="email">E-Mail-Adresse *</label>
              <input type="email" id="email" v-model="form.email"
                placeholder="ihre.email@beispiel.de" required />
            </div>

            <div class="form-group">
              <label for="expertise">Fachbereich</label>
              <select id="expertise" v-model="form.expertise" required>
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

            <div class="form-group" v-if="form.expertise === 'other'">
              <label for="expertiseOther">Fachbereich (Sonstiges)</label>
              <input type="text" id="expertiseOther" v-model="form.expertiseOther"
                placeholder="Bitte spezifizieren Sie Ihren Fachbereich" required />
            </div>

            <div class="form-group">
              <label for="qualifications">Qualifikationen</label>
              <textarea id="qualifications" v-model="form.qualifications"
                placeholder="Beschreiben Sie Ihre Ausbildung, Erfahrung und Qualifikationen..." rows="4"
                required></textarea>
            </div>
          </div>

          <!-- Motivation -->
          <div class="form-section">
            <h3>Motivation</h3>

            <div class="form-group">
              <label for="motivation">Warum möchten Sie Autor werden?</label>
              <textarea id="motivation" v-model="form.motivation"
                placeholder="Teilen Sie Ihre Motivation, als Autor für unsere Plattform zu schreiben..." rows="4"
                required></textarea>
            </div>
          </div>

          <!-- Beispielinhalte -->
          <div class="form-section">
            <h3>Beispielinhalte</h3>

            <div class="form-group">
              <label for="sampleTitle">Titel eines möglichen Artikels</label>
              <input type="text" id="sampleTitle" v-model="form.sampleTitle"
                placeholder="z.B. 'Effektive Kommunikationsstrategien für Eltern'" required />
            </div>

            <div class="form-group">
              <label for="sampleDescription">Kurze Beschreibung des Artikels</label>
              <textarea id="sampleDescription" v-model="form.sampleDescription"
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
              <input type="checkbox" id="agreeTerms" v-model="form.agreeTerms" required />
              <label for="agreeTerms">
                Ich stimme der Verarbeitung meiner Daten gemäß der <a href="#"
                  class="privacy-link">Datenschutzerklärung</a> zu
              </label>
            </div>

            <div class="form-actions">
              <button type="button" class="cancel-button" @click="$emit('close')">Abbrechen</button>
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
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';
import { applicationService, type ApplicationFiles } from '@/services/application.service';
import {
  XMarkIcon as IconXMark,
  DocumentIcon as IconDocument,
  DocumentTextIcon as IconDocumentText,
  AcademicCapIcon as IconAcademicCap,
  PlusIcon as IconPlus,
  CheckIcon as IconCheck,
  CheckCircleIcon as IconCheckCircle,
  XCircleIcon as IconXCircle,
  TrashIcon as IconTrash
} from '@heroicons/vue/24/outline';

interface AuthorApplicationForm {
  phone: string;
  email: string;
  expertise: string;
  expertiseOther: string;
  qualifications: string;
  motivation: string;
  sampleTitle: string;
  sampleDescription: string;
  agreeTerms: boolean;
}

export default defineComponent({
  name: 'AuthorApplicationModal',
  components: {
    IconXMark,
    IconDocument,
    IconDocumentText,
    IconAcademicCap,
    IconPlus,
    IconCheck,
    IconCheckCircle,
    IconXCircle,
    IconTrash
  },
  props: {
    showModal: {
      type: Boolean,
      required: true
    }
  },
  emits: ['close', 'submit'],
  setup(_, { emit }) {
    const isSubmitting = ref(false);
    
    // Einfacher Info Modal State
    const infoModal = reactive({
      show: false,
      type: 'success' as 'success' | 'error',
      title: '',
      message: '',
      details: ''
    });

    // Datei-Upload-Referenzen
    const coverLetterInput = ref<HTMLInputElement | null>(null);
    const certificationInput = ref<HTMLInputElement | null>(null);
    const writingSampleInput = ref<HTMLInputElement | null>(null);

    // Datei-Objekte
    const coverLetterFile = ref<File | null>(null);
    const certificationFile = ref<File | null>(null);
    const writingSampleFile = ref<File | null>(null);

    // Formular-Daten
    const form = reactive<AuthorApplicationForm>({
      phone: '',
      email: '',
      expertise: '',
      expertiseOther: '',
      qualifications: '',
      motivation: '',
      sampleTitle: '',
      sampleDescription: '',
      agreeTerms: false
    });

    // Modal nur schließen, wenn auf Backdrop geklickt wird
    const closeModalOnBackdrop = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('author-modal-backdrop')) {
        emit('close');
      }
    };

    // Info Modal Helper
    const showInfoModal = (type: 'success' | 'error', title: string, message: string, details = '') => {
      infoModal.show = true;
      infoModal.type = type;
      infoModal.title = title;
      infoModal.message = message;
      infoModal.details = details;
    };

    const closeInfoModal = () => {
      infoModal.show = false;
      // Bei Erfolg das Hauptmodal schließen
      if (infoModal.type === 'success') {
        resetForm();
        emit('close');
      }
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

    // Formular absenden - MIT ECHTER BACKEND-ANBINDUNG
    const submitForm = async () => {
      isSubmitting.value = true;

      try {
        // Dateien sammeln
        const files: ApplicationFiles = {
          coverLetter: coverLetterFile.value,
          certification: certificationFile.value,
          writingSample: writingSampleFile.value
        };

        // Client-Side Validierung
        const fileErrors = applicationService.validateFiles(files);
        if (fileErrors.length > 0) {
          showInfoModal(
            'error',
            'Datei-Fehler',
            'Es gibt Probleme mit den hochgeladenen Dateien:',
            fileErrors.join('\n')
          );
          return;
        }

        // Backend-Anfrage senden
        const result = await applicationService.sendApplication(form, files);

        // Erfolg anzeigen
        showInfoModal(
          'success',
          'Bewerbung erfolgreich eingereicht!',
          result.message,
          `Bewerbungs-ID: ${result.applicationId}\nHochgeladene Dokumente: ${result.documentsUploaded}`
        );

        // Erfolg-Event für Parent-Component
        emit('submit', {
          success: true,
          message: result.message,
          applicationId: result.applicationId,
          documentsUploaded: result.documentsUploaded
        });

      } catch (error: any) {
        console.error('Fehler beim Senden der Autor-Bewerbung:', error);
        
        // Fehler anzeigen
        showInfoModal(
          'error',
          'Fehler bei der Bewerbung',
          'Die Bewerbung konnte nicht gesendet werden.',
          error.message || 'Unbekannter Fehler beim Senden der Bewerbung'
        );

        // Error-Event für Parent-Component
        emit('submit', {
          success: false,
          error: error.message || 'Unbekannter Fehler beim Senden der Bewerbung'
        });

      } finally {
        isSubmitting.value = false;
      }
    };

    // Formular zurücksetzen
    const resetForm = () => {
      Object.assign(form, {
        phone: '',
        email: '',
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

    return {
      form,
      isSubmitting,
      infoModal, // Info Modal State
      // Datei-Upload-Refs
      coverLetterInput,
      certificationInput,
      writingSampleInput,
      // Datei-Objekte
      coverLetterFile,
      certificationFile,
      writingSampleFile,
      // Methoden
      closeModalOnBackdrop,
      closeInfoModal,
      handleCoverLetterUpload,
      handleCertificationUpload,
      handleWritingSampleUpload,
      removeCoverLetter,
      removeCertification,
      removeWritingSample,
      submitForm
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

// Modal für Autor-Bewerbung
.author-modal-backdrop {
  position: fixed;
  top: 0px;
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
      backdrop-filter: blur(6px);
    }
  }

  .author-modal {
    width: 100%;
    min-height: 100vh;
    overflow-y: auto;
    border-radius: map.get(map.get(vars.$layout, border-radius), large);
    padding: 1rem;
    position: relative;
    top: 0px;
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
        .close-icon {
          position: absolute;
          width: 24px;
          height: 24px;
        }
    .modal-content {
      max-width: 100% !important;
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
            input[type="tel"],
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
                    display: flex;
                    border-radius: 50%;
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

// Info Modal Styles - integriert mit bestehender Stylebase
.info-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000; // Höher als das Author Modal
  padding: map.get(vars.$spacing, xl);

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      background-color: rgba(mixins.theme-color($theme, shadow-color), 0.7);
      backdrop-filter: blur(8px);
    }
  }

  @include animations.fade-in(0.3s);
}

.info-modal {
  @include animations.fade-in(0.4s);
  max-width: 500px;
  width: 100%;
  overflow: hidden;
  position: relative;

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      @include mixins.card-style($theme, 'large', false);
    }
  }

  // Type-specific styling using your color system
  &--success {
    .info-header {
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: linear-gradient(135deg, 
            rgba(mixins.theme-color($theme, accent-green), 0.1),
            rgba(mixins.theme-color($theme, accent-green), 0.05)
          );
          border-bottom: 1px solid rgba(mixins.theme-color($theme, accent-green), 0.2);
        }
      }
    }
  }

  &--error {
    .info-header {
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: linear-gradient(135deg, 
            rgba(mixins.theme-color($theme, error), 0.1),
            rgba(mixins.theme-color($theme, error), 0.05)
          );
          border-bottom: 1px solid rgba(mixins.theme-color($theme, error), 0.2);
        }
      }
    }
  }
}

.info-header {
  display: flex;
  align-items: center;
  padding: map.get(vars.$spacing, xl);
  gap: map.get(vars.$spacing, m);

  .info-icon-container {
    .info-icon {
      width: 48px;
      height: 48px;
      flex-shrink: 0;

      &.success-icon {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, accent-green);
          }
        }
      }

      &.error-icon {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, error);
          }
        }
      }
    }
  }

  .info-title {
    flex-grow: 1;
    margin: 0;
    font-size: map.get(map.get(vars.$fonts, sizes), xl);
    font-weight: map.get(map.get(vars.$fonts, weights), bold);

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
    width: 32px;
    height: 32px;
    border-radius: 50%;
    transition: all map.get(vars.$transitions, default);
    flex-shrink: 0;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-tertiary);

        &:hover {
          background-color: mixins.theme-color($theme, hover-color);
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    .close-icon {
      width: 20px;
      height: 20px;
    }
  }
}

.info-content {
  padding: 0 map.get(vars.$spacing, xl) map.get(vars.$spacing, xl) map.get(vars.$spacing, xl);

  .info-message {
    margin: 0 0 map.get(vars.$spacing, m) 0;
    font-size: map.get(map.get(vars.$fonts, sizes), medium);
    line-height: 1.6;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
      }
    }
  }

  .info-details {
    details {
      margin-top: map.get(vars.$spacing, m);
      
      summary {
        cursor: pointer;
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        margin-bottom: map.get(vars.$spacing, s);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, accent-teal);
          }
        }

        &:hover {
          text-decoration: underline;
        }
      }

      .details-content {
        padding: map.get(vars.$spacing, m);
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        font-family: monospace;
        white-space: pre-wrap;
        word-break: break-word;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            border: 1px solid mixins.theme-color($theme, border-light);
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }
    }
  }
}

.info-actions {
  display: flex;
  justify-content: flex-end;
  padding: map.get(vars.$spacing, xl);
  padding-top: 0;

  .info-button {
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        @include mixins.button-style($theme, 'medium', true);
      }
    }
  }
}

@include mixins.responsive(mobile) {
  .info-modal-backdrop {
    padding: map.get(vars.$spacing, m);
  }

  .info-modal {
    .info-header {
      padding: map.get(vars.$spacing, l);
      
      .info-title {
        font-size: map.get(map.get(vars.$fonts, sizes), large);
      }
    }

    .info-content {
      padding: 0 map.get(vars.$spacing, l) map.get(vars.$spacing, l) map.get(vars.$spacing, l);
    }

    .info-actions {
      padding: map.get(vars.$spacing, l);
      padding-top: 0;
    }
  }
}
</style>