// src/pages/member/dashboard/CreateArticle.vue
<template>
  <div class="create-article-dashboard">
    <div class="page-header">
      <h2>Artikel erstellen</h2>
      <p>Erstelle und veröffentliche deinen eigenen Artikel</p>
    </div>
    
    <!-- Status-Benachrichtigungen -->
    <div v-if="showSuccess" class="status-message success">
      <span class="icon">✓</span>
      <span>Artikel erfolgreich gespeichert!</span>
    </div>
    
    <div v-if="showError" class="status-message error">
      <span class="icon">✕</span>
      <span>{{ errorMessage }}</span>
    </div>
    
    <!-- Artikel-Editor -->
    <div class="article-editor">
      <!-- Header mit Titel und Funktionen -->
      <div class="editor-header">
        <div class="title-section">
          <input
            v-model="article.title"
            type="text"
            placeholder="Titel des Artikels"
            class="title-input"
          />
        </div>
        
        <div class="action-buttons">
          <button @click="saveArticle(false)" class="save-button">
            <span v-if="isSaving">Speichern...</span>
            <span v-else>Speichern</span>
          </button>
          
          <button @click="publishArticle" class="publish-button" :disabled="!canPublish || isPublishing">
            <span v-if="isPublishing">Veröffentlichen...</span>
            <span v-else>Veröffentlichen</span>
          </button>
        </div>
      </div>
      
      <!-- Artikel-Metadaten -->
      <div class="article-metadata">
        <div class="metadata-section">
          <div class="form-group">
            <label for="article-category">Kategorie</label>
            <select id="article-category" v-model="article.category">
              <option value="">Kategorie wählen</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="article-tags">Tags (mit Komma trennen)</label>
            <input
              type="text"
              id="article-tags"
              v-model="tagsInput"
              placeholder="z.B. Erziehung, Kleinkind, Ernährung"
              @blur="processTags"
            />
          </div>
          
          <div class="tags-preview" v-if="article.tags && article.tags.length > 0">
            <span 
              v-for="(tag, index) in article.tags" 
              :key="index" 
              class="tag"
            >
              {{ tag }}
              <button @click="removeTag(index)" class="remove-tag">×</button>
            </span>
          </div>
        </div>
        
        <div class="metadata-section">
          <div class="form-group">
            <label for="article-preview">Vorschautext (max. 200 Zeichen)</label>
            <textarea
              id="article-preview"
              v-model="article.preview"
              placeholder="Kurze Beschreibung des Artikels"
              maxlength="200"
              rows="3"
            ></textarea>
            <div class="char-count">
              {{ article.preview.length }}/200
            </div>
          </div>
        </div>
      </div>
      
      <!-- Artikelbild-Upload -->
      <div class="article-image-section">
        <div class="form-group">
          <label>Titelbild</label>
          <div class="image-upload-container">
            <div 
              class="image-preview" 
              :class="{ 'has-image': article.featuredImage }"
              @click="triggerImageUpload"
            >
              <img 
                v-if="article.featuredImage" 
                :src="article.featuredImage" 
                alt="Artikelbild" 
              />
              <div v-else class="upload-placeholder">
                <span class="upload-icon">📷</span>
                <span>Klicke, um ein Bild hochzuladen</span>
              </div>
            </div>
            <input 
              type="file" 
              ref="imageInput"
              accept="image/*" 
              style="display: none"
              @change="handleImageUpload" 
            />
            <button 
              v-if="article.featuredImage" 
              @click="removeImage" 
              class="remove-image-button"
            >
              Bild entfernen
            </button>
          </div>
        </div>
      </div>
      
      <!-- Kapitel-Navigation -->
      <div class="chapters-navigation">
        <h3>Kapitel</h3>
        <div class="chapters-list">
          <div 
            v-for="(chapter, index) in article.chapters" 
            :key="index"
            class="chapter-item"
            :class="{ active: currentChapterIndex === index }"
            @click="switchChapter(index)"
          >
            <span class="chapter-number">{{ index + 1 }}</span>
            <span class="chapter-title">{{ chapter.title || 'Unbenanntes Kapitel' }}</span>
            <button 
              v-if="article.chapters.length > 1" 
              @click.stop="removeChapter(index)" 
              class="remove-chapter"
            >
              ×
            </button>
          </div>
          <button @click="addNewChapter" class="add-chapter-button">
            + Neues Kapitel
          </button>
        </div>
      </div>
      
      <!-- Kapitel-Editor -->
      <div class="chapter-editor" v-if="currentChapter">
        <div class="chapter-header">
          <input
            v-model="currentChapter.title"
            type="text"
            placeholder="Kapiteltitel"
            class="chapter-title-input"
          />
        </div>
        
        <div class="chapter-content">
          <textarea
            v-model="currentChapter.content"
            placeholder="Schreibe hier den Inhalt des Kapitels..."
            class="chapter-content-textarea"
            rows="15"
          ></textarea>
        </div>
      </div>
      
      <!-- Kapitel-Navigation (Pfeile) -->
      <div class="chapter-navigation-arrows">
        <button 
          @click="previousChapter" 
          :disabled="currentChapterIndex === 0"
          class="nav-arrow prev"
        >
          ← Vorheriges Kapitel
        </button>
        <button 
          @click="nextChapter" 
          :disabled="currentChapterIndex === article.chapters.length - 1"
          class="nav-arrow next"
        >
          Nächstes Kapitel →
        </button>
      </div>
      
      <!-- Fortschrittsanzeige -->
      <div class="article-progress">
        <div class="progress-label">Fortschritt:</div>
        <div class="progress-bar-container">
          <div class="progress-bar" :style="{ width: completionPercentage + '%' }"></div>
        </div>
        <div class="progress-percentage">{{ completionPercentage }}%</div>
      </div>
      
      <!-- Abschließende Aktionen -->
      <div class="editor-footer">
        <button @click="saveArticle(false)" class="save-button">
          <span v-if="isSaving">Speichern...</span>
          <span v-else>Speichern</span>
        </button>
        
        <button @click="previewArticle" class="preview-button">
          Vorschau
        </button>
        
        <button @click="publishArticle" class="publish-button" :disabled="!canPublish || isPublishing">
          <span v-if="isPublishing">Veröffentlichen...</span>
          <span v-else>Veröffentlichen</span>
        </button>
      </div>
    </div>
    
    <!-- Vorschau-Modal -->
    <div v-if="showPreview" class="preview-modal-backdrop" @click="closePreview">
      <div class="preview-modal-content" @click.stop>
        <div class="preview-modal-header">
          <h3>Vorschau: {{ article.title || 'Unbenannter Artikel' }}</h3>
          <button @click="closePreview" class="close-preview">×</button>
        </div>
        <div class="preview-modal-body">
          <div class="article-preview-container">
            <!-- Artikelbild -->
            <div v-if="article.featuredImage" class="preview-image">
              <img :src="article.featuredImage" alt="Artikelbild" />
            </div>
            
            <!-- Artikel Metadaten -->
            <div class="preview-metadata">
              <div class="preview-category" v-if="article.category">{{ article.category }}</div>
              <div class="preview-tags" v-if="article.tags && article.tags.length > 0">
                <span v-for="(tag, index) in article.tags" :key="index" class="preview-tag">
                  {{ tag }}
                </span>
              </div>
            </div>
            
            <!-- Artikel Titel und Vorschautext -->
            <h1 class="preview-title">{{ article.title || 'Unbenannter Artikel' }}</h1>
            <div class="preview-author">Von {{ authorName }}</div>
            <p class="preview-text">{{ article.preview }}</p>
            
            <!-- Kapitelnavigation -->
            <div class="preview-chapters-nav">
              <button 
                v-for="(chapter, index) in article.chapters" 
                :key="index"
                class="preview-chapter-button"
                :class="{ active: previewChapterIndex === index }"
                @click="previewChapterIndex = index"
              >
                Kapitel {{ index + 1 }}
              </button>
            </div>
            
            <!-- Kapitelinhalt -->
            <div class="preview-chapter" v-if="article.chapters[previewChapterIndex]">
              <h2 class="preview-chapter-title">
                {{ article.chapters[previewChapterIndex].title || 'Unbenanntes Kapitel' }}
              </h2>
              <div class="preview-chapter-content">
                {{ article.chapters[previewChapterIndex].content }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Bestätigungsdialog -->
    <div v-if="showConfirmDialog" class="confirm-dialog-backdrop">
      <div class="confirm-dialog">
        <div class="confirm-dialog-header">
          <h3>{{ confirmDialogTitle }}</h3>
        </div>
        <div class="confirm-dialog-body">
          <p>{{ confirmDialogMessage }}</p>
        </div>
        <div class="confirm-dialog-actions">
          <button @click="cancelConfirmAction" class="cancel-button">Abbrechen</button>
          <button @click="executeConfirmAction" class="confirm-button">{{ confirmActionText }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services/auth.service';

interface Chapter {
  title: string;
  content: string;
}

interface Article {
  id?: number;
  title: string;
  preview: string;
  featuredImage: string | null;
  category: string;
  tags: string[];
  chapters: Chapter[];
  isDraft: boolean;
  createdAt?: string;
  updatedAt?: string;
  authorId?: string;
  authorName?: string;
}

export default defineComponent({
  name: 'CreateArticleDashboard',
  setup() {
    const router = useRouter();
    
    // Autor-Informationen
    const authorName = ref('');
    const isAuthor = ref(false);
    
    // Status
    const isSaving = ref(false);
    const isPublishing = ref(false);
    const showSuccess = ref(false);
    const showError = ref(false);
    const errorMessage = ref('');
    
    // Artikel-Modell
    const article = ref<Article>({
      title: '',
      preview: '',
      featuredImage: null,
      category: '',
      tags: [],
      chapters: [{ title: '', content: '' }],
      isDraft: true
    });
    
    const currentChapterIndex = ref(0);
    const currentChapter = computed(() => {
      return article.value.chapters[currentChapterIndex.value];
    });
    
    // Verfügbare Kategorien
    const categories = [
      'Erziehung',
      'Entwicklung',
      'Gesundheit',
      'Ernährung',
      'Bildung',
      'Psychologie',
      'Medien',
      'Familienleben',
      'Kommunikation',
      'Freizeit',
      'Spiel & Spaß'
    ];
    
    // Tags-Eingabe
    const tagsInput = ref('');
    
    // Fortschritt
    const completionPercentage = computed(() => {
      const requiredFields = [
        !!article.value.title,
        !!article.value.preview,
        !!article.value.category
      ];
      
      // Kapitel prüfen
      const chaptersCount = article.value.chapters.length;
      const chaptersWithContent = article.value.chapters.filter(
        chapter => !!chapter.title && !!chapter.content
      ).length;
      
      // Berechnung des Fortschritts
      const completedBasics = requiredFields.filter(Boolean).length;
      const totalItems = requiredFields.length + chaptersCount;
      const completedItems = completedBasics + chaptersWithContent;
      
      return Math.round((completedItems / totalItems) * 100);
    });
    
    // Prüfen, ob Artikel veröffentlicht werden kann
    const canPublish = computed(() => {
      return (
        !!article.value.title &&
        !!article.value.preview &&
        !!article.value.category &&
        article.value.chapters.some(chapter => !!chapter.title && !!chapter.content)
      );
    });
    
    // Bild-Upload Referenz
    const imageInput = ref<HTMLInputElement | null>(null);
    
    // Vorschau-Modal
    const showPreview = ref(false);
    const previewChapterIndex = ref(0);
    
    // Bestätigungsdialog
    const showConfirmDialog = ref(false);
    const confirmDialogTitle = ref('');
    const confirmDialogMessage = ref('');
    const confirmActionText = ref('');
    const confirmAction = ref<() => void>(() => {});
    
    // Methoden für Kapitel-Management
    const addNewChapter = () => {
      article.value.chapters.push({ title: '', content: '' });
      currentChapterIndex.value = article.value.chapters.length - 1;
    };
    
    const removeChapter = (index: number) => {
      if (article.value.chapters.length <= 1) {
        showErrorMessage('Ein Artikel muss mindestens ein Kapitel haben');
        return;
      }
      
      showConfirmDialog.value = true;
      confirmDialogTitle.value = 'Kapitel löschen';
      confirmDialogMessage.value = `Möchtest du wirklich das Kapitel "${article.value.chapters[index].title || 'Unbenanntes Kapitel'}" löschen?`;
      confirmActionText.value = 'Löschen';
      
      confirmAction.value = () => {
        article.value.chapters.splice(index, 1);
        if (currentChapterIndex.value >= article.value.chapters.length) {
          currentChapterIndex.value = article.value.chapters.length - 1;
        }
        showConfirmDialog.value = false;
      };
    };
    
    const switchChapter = (index: number) => {
      currentChapterIndex.value = index;
    };
    
    const previousChapter = () => {
      if (currentChapterIndex.value > 0) {
        currentChapterIndex.value--;
      }
    };
    
    const nextChapter = () => {
      if (currentChapterIndex.value < article.value.chapters.length - 1) {
        currentChapterIndex.value++;
      } else {
        addNewChapter();
      }
    };
    
    // Methoden für Tags-Management
    const processTags = () => {
      if (!tagsInput.value) return;
      
      const tags = tagsInput.value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // Nur neue Tags hinzufügen
      const uniqueTags = new Set([...article.value.tags, ...tags]);
      article.value.tags = Array.from(uniqueTags);
      
      // Eingabefeld zurücksetzen
      tagsInput.value = '';
    };
    
    const removeTag = (index: number) => {
      article.value.tags.splice(index, 1);
    };
    
    // Methoden für Bild-Upload
    const triggerImageUpload = () => {
      if (imageInput.value) {
        imageInput.value.click();
      }
    };
    
    const handleImageUpload = (event: Event) => {
      const input = event.target as HTMLInputElement;
      
      if (input.files && input.files.length > 0) {
        const file = input.files[0];
        const reader = new FileReader();
        
        reader.onload = (e) => {
          if (e.target?.result) {
            article.value.featuredImage = e.target.result as string;
          }
        };
        
        reader.readAsDataURL(file);
      }
    };
    
    const removeImage = () => {
      article.value.featuredImage = null;
      if (imageInput.value) {
        imageInput.value.value = '';
      }
    };
    
    // Speichern und Veröffentlichen
    const saveArticle = async (autoSave = false) => {
      if (!autoSave) {
        isSaving.value = true;
      }
      
      try {
        // Hier würde im realen Fall ein API-Aufruf stattfinden
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Erfolgsfall simulieren
        showSuccess.value = true;
        setTimeout(() => {
          showSuccess.value = false;
        }, 3000);
        
        // Speicherdatum aktualisieren
        article.value.updatedAt = new Date().toISOString();
        
        // In der Konsole ausgeben (zur Entwicklung)
        console.log('Artikel gespeichert:', JSON.stringify(article.value, null, 2));
        
        // LocalStorage-Speicherung für Entwicklungszwecke
        localStorage.setItem('draft-article', JSON.stringify(article.value));
      } catch (error) {
        showErrorMessage('Fehler beim Speichern des Artikels');
        console.error('Fehler beim Speichern:', error);
      } finally {
        if (!autoSave) {
          isSaving.value = false;
        }
      }
    };
    
    const publishArticle = async () => {
      if (!canPublish.value) {
        showErrorMessage('Bitte fülle alle erforderlichen Felder aus, bevor du den Artikel veröffentlichst');
        return;
      }
      
      showConfirmDialog.value = true;
      confirmDialogTitle.value = 'Artikel veröffentlichen';
      confirmDialogMessage.value = 'Möchtest du diesen Artikel wirklich veröffentlichen? Nach der Veröffentlichung wird er für alle Benutzer sichtbar sein.';
      confirmActionText.value = 'Veröffentlichen';
      
      confirmAction.value = async () => {
        isPublishing.value = true;
        showConfirmDialog.value = false;
        
        try {
          article.value.isDraft = false;
          
          // Hier würde im realen Fall ein API-Aufruf stattfinden
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Erfolgsfall simulieren
          showSuccess.value = true;
          setTimeout(() => {
            showSuccess.value = false;
            
            // Zur Artikelübersicht navigieren
            router.push('/member/dashboard?tab=my-articles');
          }, 2000);
          
          console.log('Artikel veröffentlicht:', JSON.stringify(article.value, null, 2));
        } catch (error) {
          showErrorMessage('Fehler beim Veröffentlichen des Artikels');
          console.error('Fehler beim Veröffentlichen:', error);
        } finally {
          isPublishing.value = false;
        }
      };
    };
    
    // Vorschau
    const previewArticle = () => {
      showPreview.value = true;
      previewChapterIndex.value = 0;
    };
    
    const closePreview = () => {
      showPreview.value = false;
    };
    
    // Hilfsfunktionen
    const showErrorMessage = (message: string) => {
      errorMessage.value = message;
      showError.value = true;
      
      setTimeout(() => {
        showError.value = false;
      }, 5000);
    };
    
    const loadDraft = () => {
      const savedDraft = localStorage.getItem('draft-article');
      
      if (savedDraft) {
        try {
          const parsedDraft = JSON.parse(savedDraft);
          article.value = parsedDraft;
        } catch (error) {
          console.error('Fehler beim Laden des Entwurfs:', error);
        }
      }
    };
    
    // Bestätigungsdialog
    const cancelConfirmAction = () => {
      showConfirmDialog.value = false;
    };
    
    const executeConfirmAction = () => {
      confirmAction.value();
    };
    
    // Auto-Save alle 60 Sekunden
    const setupAutoSave = () => {
      const autoSaveInterval = setInterval(() => {
        saveArticle(true);
      }, 60000);
      
      // Intervall beim Verlassen der Komponente löschen
      onBeforeUnmount(() => {
        clearInterval(autoSaveInterval);
      });
    };
    
    // Autorprüfung
    const checkAuthorRole = () => {
      // Hier würde im realen Fall eine Prüfung der Benutzerrolle stattfinden
      const userData = authService.getUserData();
      isAuthor.value = true; // Für Beispielzwecke immer true
      
      // Beispiel für Autorname
      authorName.value = userData?.name || 'Max Mustermann';
      
      if (!isAuthor.value) {
        router.push('/member/dashboard');
      }
    };
    
    // Lifecycle hooks
    onMounted(() => {
      checkAuthorRole();
      loadDraft();
      setupAutoSave();
    });
    
    // Kapitelinhalt überwachen und automatisch das Kapitelmodell aktualisieren
    watch(currentChapter, (newValue) => {
      if (newValue && currentChapterIndex.value >= 0) {
        article.value.chapters[currentChapterIndex.value] = newValue;
      }
    }, { deep: true });
    
    return {
      article,
      categories,
      authorName,
      currentChapterIndex,
      currentChapter,
      tagsInput,
      imageInput,
      showPreview,
      previewChapterIndex,
      showSuccess,
      showError,
      errorMessage,
      isSaving,
      isPublishing,
      completionPercentage,
      canPublish,
      showConfirmDialog,
      confirmDialogTitle,
      confirmDialogMessage,
      confirmActionText,
      
      // Methoden
      addNewChapter,
      removeChapter,
      switchChapter,
      previousChapter,
      nextChapter,
      processTags,
      removeTag,
      triggerImageUpload,
      handleImageUpload,
      removeImage,
      saveArticle,
      publishArticle,
      previewArticle,
      closePreview,
      cancelConfirmAction,
      executeConfirmAction
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

.create-article-dashboard {
  @include animations.fade-in(0.5s);
  display: flex;
  flex-direction: column;
  gap: map.get(vars.$spacing, l);
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;

  .page-header {
    margin-bottom: map.get(vars.$spacing, l);

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

  // Status-Meldungen
  .status-message {
    padding: map.get(vars.$spacing, m);
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);
    display: flex;
    align-items: center;
    gap: map.get(vars.$spacing, s);
    margin-bottom: map.get(vars.$spacing, l);

    .icon {
      font-size: 1.2rem;
      font-weight: bold;
    }

    &.success {
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: rgba(74, 210, 149, 0.1);
          color: mixins.theme-color($theme, accent-green);
          border: 1px solid rgba(74, 210, 149, 0.3);
        }
      }
    }

    &.error {
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.3);
          color: #ff6b6b;
        }
      }
    }
  }

  // Artikel-Editor
  .article-editor {
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        border-radius: map.get(map.get(vars.$layout, border-radius), large);
        border: 1px solid mixins.theme-color($theme, border-light);
        @include mixins.shadow('medium', $theme);
      }
    }
    
    padding: map.get(vars.$spacing, xl);
    display: flex;
    flex-direction: column;
    gap: map.get(vars.$spacing, xl);

    // Editor-Header
    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: map.get(vars.$spacing, l);

      .title-section {
        flex: 1;
        min-width: 300px;

        .title-input {
          width: 100%;
          font-size: map.get(map.get(vars.$fonts, sizes), xl);
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
          border: none;
          padding: map.get(vars.$spacing, s) 0;
          border-bottom: 2px solid transparent;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: transparent;
              color: mixins.theme-color($theme, text-primary);
              border-bottom-color: mixins.theme-color($theme, border-light);
              
              &:focus {
                outline: none;
                border-bottom-color: mixins.theme-color($theme, accent-green);
              }
              
              &::placeholder {
                color: mixins.theme-color($theme, text-tertiary);
              }
            }
          }
        }
      }

      .action-buttons {
        display: flex;
        gap: map.get(vars.$spacing, m);
      }
    }

    // Artikel-Metadaten
    .article-metadata {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: map.get(vars.$spacing, l);

      .metadata-section {
        display: flex;
        flex-direction: column;
        gap: map.get(vars.$spacing, m);
      }

      .form-group {
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

        input, select, textarea {
          width: 100%;
          padding: map.get(vars.$spacing, m);
          border-radius: map.get(map.get(vars.$layout, border-radius), medium);
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              @include mixins.form-element($theme);
            }
          }
        }

        .char-count {
          margin-top: map.get(vars.$spacing, xxs);
          text-align: right;
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-tertiary);
            }
          }
        }
      }

      .tags-preview {
        display: flex;
        flex-wrap: wrap;
        gap: map.get(vars.$spacing, xs);
        margin-top: map.get(vars.$spacing, s);

        .tag {
          padding: map.get(vars.$spacing, xxs) map.get(vars.$spacing, s);
          border-radius: map.get(map.get(vars.$layout, border-radius), pill);
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          display: flex;
          align-items: center;
          gap: 4px;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
              color: mixins.theme-color($theme, text-secondary);
            }
          }

          .remove-tag {
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            border: none;
            cursor: pointer;
            font-size: 12px;
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background-color: rgba(255, 107, 107, 0.2);
                color: #ff6b6b;
                
                &:hover {
                  background-color: rgba(255, 107, 107, 0.4);
                }
              }
            }
          }
        }
      }
    }

    // Artikelbild-Upload
    .article-image-section {
      .image-upload-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: map.get(vars.$spacing, m);

        .image-preview {
          width: 100%;
          height: 300px;
          border-radius: map.get(map.get(vars.$layout, border-radius), medium);
          overflow: hidden;
          position: relative;
          cursor: pointer;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
              border: 2px dashed mixins.theme-color($theme, border-medium);
              
              &:hover {
                border-color: mixins.theme-color($theme, accent-green);
              }
            }
          }

          &.has-image {
            border-style: solid;
          }

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .upload-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            gap: map.get(vars.$spacing, m);
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-tertiary);
              }
            }

            .upload-icon {
              font-size: 3rem;
              margin-bottom: map.get(vars.$spacing, s);
            }
          }
        }

        .remove-image-button {
          padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
          border-radius: map.get(map.get(vars.$layout, border-radius), pill);
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          font-weight: map.get(map.get(vars.$fonts, weights), medium);
          cursor: pointer;
          border: none;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: rgba(255, 107, 107, 0.1);
              color: #ff6b6b;
              border: 1px solid rgba(255, 107, 107, 0.3);
              
              &:hover {
                background-color: rgba(255, 107, 107, 0.2);
              }
            }
          }
        }
      }
    }

    // Kapitel-Navigation
    .chapters-navigation {
      h3 {
        font-size: map.get(map.get(vars.$fonts, sizes), large);
        margin-bottom: map.get(vars.$spacing, m);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }

      .chapters-list {
        display: flex;
        flex-wrap: wrap;
        gap: map.get(vars.$spacing, s);
        margin-bottom: map.get(vars.$spacing, l);

        .chapter-item {
          padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);
          border-radius: map.get(map.get(vars.$layout, border-radius), pill);
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          display: flex;
          align-items: center;
          gap: map.get(vars.$spacing, s);
          cursor: pointer;
          position: relative;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
              color: mixins.theme-color($theme, text-secondary);
              
              &:hover {
                background-color: mixins.theme-color($theme, hover-color);
              }
              
              &.active {
                background-color: mixins.theme-color($theme, accent-green);
                color: white;
              }
            }
          }

          .chapter-number {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            font-weight: map.get(map.get(vars.$fonts, weights), bold);
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background-color: rgba(255, 255, 255, 0.2);
              }
            }
          }

          .remove-chapter {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            background-color: transparent;
            cursor: pointer;
            font-size: 16px;
            margin-left: 4px;
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: rgba(255, 255, 255, 0.7);
                
                &:hover {
                  background-color: rgba(255, 255, 255, 0.1);
                  color: white;
                }
              }
            }
          }
        }

        .add-chapter-button {
          padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);
          border-radius: map.get(map.get(vars.$layout, border-radius), pill);
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          display: flex;
          align-items: center;
          cursor: pointer;
          border: none;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: transparent;
              color: mixins.theme-color($theme, accent-green);
              border: 1px dashed mixins.theme-color($theme, accent-green);
              
              &:hover {
                background-color: rgba(mixins.theme-color($theme, accent-green), 0.1);
              }
            }
          }
        }
      }
    }

    // Kapitel-Editor
    .chapter-editor {
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          border-radius: map.get(map.get(vars.$layout, border-radius), medium);
          border: 1px solid mixins.theme-color($theme, border-light);
        }
      }
      
      padding: map.get(vars.$spacing, l);
      display: flex;
      flex-direction: column;
      gap: map.get(vars.$spacing, l);

      .chapter-header {
        .chapter-title-input {
          width: 100%;
          font-size: map.get(map.get(vars.$fonts, sizes), large);
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
          padding: map.get(vars.$spacing, s);
          border-radius: map.get(map.get(vars.$layout, border-radius), medium);
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, card-bg);
              color: mixins.theme-color($theme, text-primary);
              border: 1px solid mixins.theme-color($theme, border-light);
              
              &:focus {
                outline: none;
                border-color: mixins.theme-color($theme, accent-green);
                box-shadow: 0 0 0 2px rgba(mixins.theme-color($theme, accent-green), 0.2);
              }
              
              &::placeholder {
                color: mixins.theme-color($theme, text-tertiary);
              }
            }
          }
        }
      }

      .chapter-content {
        .chapter-content-textarea {
          width: 100%;
          resize: vertical;
          min-height: 300px;
          padding: map.get(vars.$spacing, l);
          border-radius: map.get(map.get(vars.$layout, border-radius), medium);
          font-family: map.get(vars.$fonts, primary);
          line-height: 1.6;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, card-bg);
              color: mixins.theme-color($theme, text-primary);
              border: 1px solid mixins.theme-color($theme, border-light);
              
              &:focus {
                outline: none;
                border-color: mixins.theme-color($theme, accent-green);
                box-shadow: 0 0 0 2px rgba(mixins.theme-color($theme, accent-green), 0.2);
              }
              
              &::placeholder {
                color: mixins.theme-color($theme, text-tertiary);
              }
            }
          }
        }
      }
    }

    // Kapitel-Navigation (Pfeile)
    .chapter-navigation-arrows {
      display: flex;
      justify-content: space-between;
      margin-top: map.get(vars.$spacing, m);

      .nav-arrow {
        padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        cursor: pointer;
        border: none;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            color: mixins.theme-color($theme, text-primary);
            
            &:hover:not(:disabled) {
              background-color: mixins.theme-color($theme, hover-color);
            }
            
            &:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
          }
        }
      }
    }

    // Fortschrittsanzeige
    .article-progress {
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, m);
      margin-top: map.get(vars.$spacing, l);

      .progress-label {
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }

      .progress-bar-container {
        flex: 1;
        height: 8px;
        border-radius: 4px;
        overflow: hidden;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
          }
        }

        .progress-bar {
          height: 100%;
          transition: width 0.3s ease;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background: mixins.theme-gradient($theme, primary);
            }
          }
        }
      }

      .progress-percentage {
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }
    }

    // Footer mit Aktionen
    .editor-footer {
      display: flex;
      justify-content: flex-end;
      gap: map.get(vars.$spacing, m);
      margin-top: map.get(vars.$spacing, l);
    }
  }

  // Button-Styles
  .save-button,
  .publish-button,
  .preview-button {
    padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
    border-radius: map.get(map.get(vars.$layout, border-radius), pill);
    font-weight: map.get(map.get(vars.$fonts, weights), medium);
    cursor: pointer;
    border: none;
    min-width: 120px;
    transition: all 0.2s ease;
  }

  .save-button {
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, secondary-bg);
        color: mixins.theme-color($theme, text-primary);
        border: 1px solid mixins.theme-color($theme, border-medium);
        
        &:hover {
          background-color: mixins.theme-color($theme, hover-color);
        }
      }
    }
  }

  .preview-button {
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, accent-teal);
        color: white;
        
        &:hover {
          background-color: darken(mixins.theme-color($theme, accent-teal), 5%);
          @include mixins.shadow('small', $theme);
        }
      }
    }
  }

  .publish-button {
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background: mixins.theme-gradient($theme, primary);
        color: white;
        
        &:hover:not(:disabled) {
          transform: translateY(-2px);
          @include mixins.shadow('small', $theme);
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

  // Vorschau-Modal
  .preview-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: map.get(vars.$spacing, l);

    .preview-modal-content {
      width: 100%;
      max-width: 1000px;
      max-height: 90vh;
      border-radius: map.get(map.get(vars.$layout, border-radius), large);
      display: flex;
      flex-direction: column;
      @include animations.fade-in(0.3s);
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, card-bg);
          @include mixins.shadow('large', $theme);
        }
      }

      .preview-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: map.get(vars.$spacing, l);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            border-bottom: 1px solid mixins.theme-color($theme, border-light);
          }
        }

        h3 {
          font-size: map.get(map.get(vars.$fonts, sizes), large);
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }

        .close-preview {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          cursor: pointer;
          border: none;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
              color: mixins.theme-color($theme, text-primary);
              
              &:hover {
                background-color: mixins.theme-color($theme, hover-color);
              }
            }
          }
        }
      }

      .preview-modal-body {
        padding: map.get(vars.$spacing, xl);
        overflow-y: auto;

        .article-preview-container {
          max-width: 800px;
          margin: 0 auto;

          .preview-image {
            width: 100%;
            height: 400px;
            border-radius: map.get(map.get(vars.$layout, border-radius), medium);
            overflow: hidden;
            margin-bottom: map.get(vars.$spacing, l);

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }

          .preview-metadata {
            display: flex;
            flex-wrap: wrap;
            gap: map.get(vars.$spacing, s);
            margin-bottom: map.get(vars.$spacing, m);

            .preview-category {
              padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, m);
              border-radius: map.get(map.get(vars.$layout, border-radius), pill);
              font-size: map.get(map.get(vars.$fonts, sizes), small);
              
              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background-color: mixins.theme-color($theme, accent-green);
                  color: white;
                }
              }
            }

            .preview-tags {
              display: flex;
              flex-wrap: wrap;
              gap: map.get(vars.$spacing, xs);

              .preview-tag {
                padding: map.get(vars.$spacing, xxs) map.get(vars.$spacing, s);
                border-radius: map.get(map.get(vars.$layout, border-radius), pill);
                font-size: map.get(map.get(vars.$fonts, sizes), small);
                
                @each $theme in ('light', 'dark') {
                  .theme-#{$theme} & {
                    background-color: mixins.theme-color($theme, secondary-bg);
                    color: mixins.theme-color($theme, text-secondary);
                  }
                }
              }
            }
          }

          .preview-title {
            font-size: 2.5rem;
            margin-bottom: map.get(vars.$spacing, m);
            line-height: 1.2;
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-primary);
              }
            }
          }

          .preview-author {
            font-size: map.get(map.get(vars.$fonts, sizes), medium);
            margin-bottom: map.get(vars.$spacing, l);
            font-style: italic;
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-secondary);
              }
            }
          }

          .preview-text {
            font-size: map.get(map.get(vars.$fonts, sizes), large);
            line-height: 1.6;
            margin-bottom: map.get(vars.$spacing, xl);
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-secondary);
              }
            }
          }

          .preview-chapters-nav {
            display: flex;
            flex-wrap: wrap;
            gap: map.get(vars.$spacing, s);
            margin-bottom: map.get(vars.$spacing, l);

            .preview-chapter-button {
              padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);
              border-radius: map.get(map.get(vars.$layout, border-radius), pill);
              font-size: map.get(map.get(vars.$fonts, sizes), small);
              cursor: pointer;
              border: none;
              
              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background-color: mixins.theme-color($theme, secondary-bg);
                  color: mixins.theme-color($theme, text-secondary);
                  
                  &:hover {
                    background-color: mixins.theme-color($theme, hover-color);
                  }
                  
                  &.active {
                    background-color: mixins.theme-color($theme, accent-green);
                    color: white;
                  }
                }
              }
            }
          }

          .preview-chapter {
            padding: map.get(vars.$spacing, xl);
            border-radius: map.get(map.get(vars.$layout, border-radius), medium);
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background-color: mixins.theme-color($theme, secondary-bg);
              }
            }

            .preview-chapter-title {
              font-size: map.get(map.get(vars.$fonts, sizes), xl);
              margin-bottom: map.get(vars.$spacing, l);
              
              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, text-primary);
                }
              }
            }

            .preview-chapter-content {
              font-size: map.get(map.get(vars.$fonts, sizes), medium);
              line-height: 1.8;
              white-space: pre-line;
              
              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, text-primary);
                }
              }
            }
          }
        }
      }
    }
  }

  // Bestätigungsdialog
  .confirm-dialog-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1100;

    .confirm-dialog {
      width: 90%;
      max-width: 500px;
      border-radius: map.get(map.get(vars.$layout, border-radius), large);
      overflow: hidden;
      @include animations.fade-in(0.3s);
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, card-bg);
          @include mixins.shadow('large', $theme);
        }
      }

      .confirm-dialog-header {
        padding: map.get(vars.$spacing, l);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            border-bottom: 1px solid mixins.theme-color($theme, border-light);
          }
        }

        h3 {
          margin: 0;
          font-size: map.get(map.get(vars.$fonts, sizes), large);
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }
      }

      .confirm-dialog-body {
        padding: map.get(vars.$spacing, l);

        p {
          margin: 0;
          line-height: 1.6;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }
      }

      .confirm-dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: map.get(vars.$spacing, m);
        padding: map.get(vars.$spacing, l);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            border-top: 1px solid mixins.theme-color($theme, border-light);
          }
        }

        button {
          padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
          border-radius: map.get(map.get(vars.$layout, border-radius), medium);
          cursor: pointer;
          border: none;
          font-weight: map.get(map.get(vars.$fonts, weights), medium);
        }

        .cancel-button {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
              color: mixins.theme-color($theme, text-primary);
              
              &:hover {
                background-color: mixins.theme-color($theme, hover-color);
              }
            }
          }
        }

        .confirm-button {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background: mixins.theme-gradient($theme, primary);
              color: white;
              
              &:hover {
                @include mixins.shadow('small', $theme);
              }
            }
          }
        }
      }
    }
  }
}

// Responsive Design
@media (max-width: map.get(map.get(vars.$layout, breakpoints), tablet)) {
  .create-article-dashboard {
    .article-editor {
      padding: map.get(vars.$spacing, l);
      
      .editor-header {
        flex-direction: column;
        gap: map.get(vars.$spacing, m);
        
        .action-buttons {
          width: 100%;
          justify-content: space-between;
        }
      }
      
      .article-metadata {
        grid-template-columns: 1fr;
      }
      
      .chapter-navigation-arrows {
        flex-direction: column;
        gap: map.get(vars.$spacing, m);
        
        .nav-arrow {
          width: 100%;
          text-align: center;
        }
      }
      
      .editor-footer {
        flex-direction: column;
        
        button {
          width: 100%;
        }
      }
    }
  }
}

@media (max-width: map.get(map.get(vars.$layout, breakpoints), mobile)) {
  .create-article-dashboard {
    .page-header {
      h2 {
        font-size: map.get(map.get(vars.$fonts, sizes), xl);
      }
      
      p {
        font-size: map.get(map.get(vars.$fonts, sizes), small);
      }
    }
    
    .preview-modal-backdrop {
      .preview-modal-content {
        .preview-modal-body {
          padding: map.get(vars.$spacing, l);
          
          .article-preview-container {
            .preview-title {
              font-size: 1.8rem;
            }
            
            .preview-image {
              height: 250px;
            }
          }
        }
      }
    }
  }
}
</style>