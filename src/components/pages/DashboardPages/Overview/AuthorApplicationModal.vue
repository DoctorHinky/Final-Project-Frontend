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
import { defineComponent, ref, reactive, type PropType } from 'vue';
import {
  XMarkIcon as IconXMark,
  DocumentIcon as IconDocument,
  DocumentTextIcon as IconDocumentText,
  AcademicCapIcon as IconAcademicCap,
  PlusIcon as IconPlus,
  CheckIcon as IconCheck,
  TrashIcon as IconTrash
} from '@heroicons/vue/24/outline';

interface AuthorApplicationForm {
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
    IconTrash
  },
  props: {
    showModal: {
      type: Boolean,
      required: true
    }
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
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
    const form = reactive<AuthorApplicationForm>({
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
    const submitForm = async () => {
      isSubmitting.value = true;

      try {
        // FormData für den Upload erstellen
        const formData = new FormData();

        // Textdaten hinzufügen
        formData.append('expertise', form.expertise);
        if (form.expertise === 'other') {
          formData.append('expertiseOther', form.expertiseOther);
        }
        formData.append('qualifications', form.qualifications);
        formData.append('motivation', form.motivation);
        formData.append('sampleTitle', form.sampleTitle);
        formData.append('sampleDescription', form.sampleDescription);

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

        // Simuliere API-Aufruf mit Verzögerung
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Event für das Absenden des Formulars auslösen
        emit('submit', {
          formData,
          textData: {
            ...form
          },
          files: {
            coverLetter: coverLetterFile.value?.name,
            certification: certificationFile.value?.name,
            writingSample: writingSampleFile.value?.name
          }
        });

        resetForm();
        emit('close');

      } catch (error) {
        console.error('Fehler beim Senden der Autor-Bewerbung:', error);
        alert('Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.');
      } finally {
        isSubmitting.value = false;
      }
    };

    // Formular zurücksetzen
    const resetForm = () => {
      Object.assign(form, {
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
    min-height: 100vh;
    overflow-y: auto;
    border-radius: map.get(map.get(vars.$layout, border-radius), large);
    padding: 0;
    position: relative;
    top: -100px;
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
</style>