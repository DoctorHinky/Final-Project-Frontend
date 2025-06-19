<template>
  <div class="article-editor-layout">
    <!-- Haupteditorbereich -->
    <div class="article-editor">
      <!-- Header -->
      <div class="editor-header">
        <div class="header-text">
          <h2 class="editor-title">Neuen Artikel erstellen</h2>
          <p class="editor-description">Erstellen Sie Ihren Artikel in Kapiteln, um das Lesetracking zu erleichtern.</p>
        </div>
      </div>

      <!-- Artikeltitel -->
      <div class="editor-section">
        <input type="text" v-model="articleTitle" class="title-input" placeholder="Titel des Artikels" />
      </div>

      <!-- Artikel-Einstellungen -->
      <div class="editor-section options-menu">
        <div class="options-header">
          <h3>Artikel-Einstellungen</h3>
        </div>

        <div class="options-grid">
          <!-- Zielgruppe -->
          <div class="option-group">
            <label class="option-label">
              Zielgruppe
              <div class="info-tooltip">
                <InformationCircleIcon class="info-icon" />
                <div class="tooltip-content">
                  Wählen sie für Kinder, wenn der Artikel gedacht ist das Kinder ihn lesen, wenn der Artikel für Eltern
                  von Kindern in einem Bestimmten Alter gedacht ist, wählen sie <strong>NUR</strong> die
                  Altersbeschränkung.
                </div>
              </div>
            </label>
            <div class="checkbox-wrapper">
              <label class="checkbox-label">
                <input type="checkbox" v-model="forKids" @change="saveToLocalStorage" class="checkbox-input" />
                <span class="checkbox-custom">
                  <CheckIcon class="checkmark-icon" />
                </span>
                <span class="checkbox-text">Für Kinder gedacht</span>
              </label>
            </div>
          </div>

          <!-- Altersbeschränkung -->
          <div class="option-group">
            <label class="option-label">Altersbeschränkung</label>
            <select v-model="ageRestriction" class="age-select" @change="saveToLocalStorage">
              <option :value="0">Keine Beschränkung</option>
              <option :value="6">Ab 6 Jahren</option>
              <option :value="12">Ab 12 Jahren</option>
              <option :value="16">Ab 16 Jahren</option>
              <option :value="18">Ab 18 Jahren</option>
            </select>
          </div>

          <!-- Kategorie -->
          <div class="option-group">
            <label class="option-label">Kategorie</label>
            <select v-model="selectedCategory" class="category-select" @change="saveToLocalStorage">
              <option value="">Kategorie wählen...</option>
              <option v-for="category in availableCategories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>

          <!-- Tags -->
          <div class="option-group tags-group">
            <label class="option-label">Tags (max. 5)</label>

            <!-- Vorhandene Tags -->
            <div class="tags-container">
              <div v-for="(tag, index) in tags" :key="`tag-${index}`" class="tag-item">
                {{ tag }}
                <button @click="removeTag(index)" class="tag-remove" :aria-label="`Tag ${tag} entfernen`">
                  <XMarkIcon class="icon-size-xs" />
                </button>
              </div>

              <!-- Tag hinzufügen Button -->
              <button v-if="tags.length < 5 && !showTagInput" @click="showAddTagInput" class="add-tag-btn">
                <PlusIcon class="icon-size-xs" />
                <span>Tag hinzufügen</span>
              </button>

              <!-- Tag Input -->
              <div v-if="showTagInput" class="tag-input-container">
                <input
                  ref="tagInputRef"
                  type="text"
                  v-model="newTag"
                  @keyup.enter="addTag"
                  @keyup.escape="cancelAddTag"
                  class="tag-input"
                  placeholder="Tag eingeben..."
                  maxlength="20"
                />
                <button @click="addTag" class="tag-confirm" aria-label="Tag bestätigen">
                  <CheckIcon class="icon-size-xs" />
                </button>
                <button @click="cancelAddTag" class="tag-cancel" aria-label="Abbrechen">
                  <XMarkIcon class="icon-size-xs" />
                </button>
              </div>
            </div>

            <!-- Tag Vorschläge -->
            <div v-if="tags.length < 5" class="tag-suggestions">
              <p class="suggestions-label">Vorschläge:</p>
              <div class="suggested-tags">
                <button
                  v-for="tag in availableSuggestions"
                  :key="`suggest-${tag}`"
                  @click="selectSuggestedTag(tag)"
                  class="suggested-tag"
                >
                  {{ tag }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Hauptbild und Beschreibung -->
      <div class="editor-section main-info">
        <ImageUploader
          v-model="coverImage"
          label="Bild einfügen"
          help-text="Max 1 Bild"
          alt="Artikelbild"
          :is-small="false"
          :image-meta="{
            isEdit: editMode,
            isChapter: false,
            postId: currendId,
          }"
        />

        <textarea
          v-model="articleDescription"
          class="description-textarea"
          placeholder="Beschreibung des Inhalts"
        ></textarea>
      </div>

      <!-- Kapitel Bereich -->
      <div class="editor-section chapters-section">
        <div v-if="chapters.length === 0" class="empty-chapters">
          <button @click="addNewChapter" class="add-chapter-btn">
            <PlusIcon class="icon-size mr-1" />
            <span>Inhalt hinzufügen</span>
          </button>
        </div>

        <div v-else class="chapters-container">
          <ChapterEditor
            v-for="(chapter, index) in chapters"
            :key="`${chapter.id || index}`"
            v-model="chapters[index]"
            :chapter-number="index + 1"
            :is-saving="isSavingChapter(index)"
            @save="() => saveChapter(index)"
            @remove="() => removeChapter(index, chapter.id)"
          />

          <button @click="addNewChapter" class="add-chapter-btn secondary">
            <PlusIcon class="icon-size mr-2" />
            <span>Weiteres Kapitel</span>
          </button>
        </div>
      </div>

      <!-- Globales Quiz -->
      <div class="editor-section">
        <div class="quiz-header-container">
          <h3 class="quiz-section-title">Quiz für den gesamten Artikel</h3>
          <button @click="toggleQuiz" class="toggle-quiz-btn">
            {{ showQuiz ? "Quiz ausblenden" : "Quiz bearbeiten" }}
          </button>
        </div>

        <div v-if="showQuiz" class="article-quiz-container">
          <QuizEditor v-model="articleQuiz" @update:model-value="saveToLocalStorage" />
        </div>
      </div>

      <!-- Aktions-Buttons -->
      <div class="editor-actions">
        <button @click="resetForm" class="action-button reset" :disabled="isSaving">
          <ArrowPathIcon class="icon-size-sm" />
          <span v-if="editMode">Änderungen verwerfen</span>
          <span v-else>Entwürf verwerfen</span>
        </button>

        <button @click="handleDraftClick" class="action-button draft" :disabled="isSaving">
          <span v-if="isSaving && savingType === 'draft'">
            <ArrowPathIcon class="icon-size-sm spinning" />
            Speichern...
          </span>
          <span v-else-if="editMode">Entwurf aktualisieren</span>
          <span v-else>Entwurf speichern</span>
        </button>

        <!-- lade animation nicht wenn man updated !?!?!?!?!? -->
        <button @click="handlePublishClick" class="action-button publish" :disabled="isSaving || !isFormValid">
          <span v-if="isSaving && savingType === 'publish'">
            <ArrowPathIcon class="icon-size-sm spinning" />
            Veröffentlichen...
          </span>
          <span v-else-if="editMode">Updaten & veroffentlichen</span>
          <span v-else>Veröffentlichen</span>
        </button>
      </div>

      <!-- Benachrichtigungen -->
      <div v-if="notification.show" :class="['notification', notification.type]">
        {{ notification.message }}
      </div>

      <!-- Lokale Speicherinfo -->
      <div class="local-storage-info">
        <small>Änderungen werden automatisch alle 30 Sekunden lokal gespeichert</small>
      </div>
    </div>

    <!-- Sidebar -->
    <div class="sidebar">
      <!-- Entwürfe-Liste -->
      <DraftsList
        :drafts="drafts"
        :is-loading="isLoadingDrafts"
        :selected-draft-id="currentDraftId"
        @refresh="refreshDrafts"
        @select="loadDraft"
        @edit="editDraft"
        @delete="deleteDraft"
      />

      <!-- Veröffentlichte Artikel -->
      <PublishedArticlesList
        :articles="publishedArticles"
        :is-loading="isLoadingPublished"
        @refresh="refreshPublishedArticles"
        @view="viewArticle"
        @edit="editPublishedArticle"
        @delete="deletePublishedArticle"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { PlusIcon, ArrowPathIcon, XMarkIcon, CheckIcon, InformationCircleIcon } from "@heroicons/vue/24/outline";
import { authorService } from "@/services/author.service";
import ChapterEditor from "./ChapterEditor.vue";
import ImageUploader from "./ImageUploader.vue";
import DraftsList from "./DraftsList.vue";
import PublishedArticlesList from "./PublishedArticlesList.vue";
import QuizEditor from "./QuizEditor.vue";
import type { Chapter, Draft, PublishedArticle, QuizCreation as Quiz, Notification } from "./types";
import type { Article } from "@/types/dtos";

export default defineComponent({
  name: "ArticleEditor",
  components: {
    PlusIcon,
    ArrowPathIcon,
    XMarkIcon,
    CheckIcon,
    InformationCircleIcon,
    ChapterEditor,
    ImageUploader,
    DraftsList,
    PublishedArticlesList,
    QuizEditor,
  },
  setup() {
    const router = useRouter();

    // === Artikel-Daten ===
    const articleId = ref("");
    const articleTitle = ref("");
    const articleDescription = ref("");
    const coverImage = ref("");
    const chapters = ref<Chapter[]>([]);

    // === Artikel-Einstellungen ===
    const forKids = ref(false); // Checkbox: Artikel ist für Kinder gedacht
    const ageRestriction = ref(0); // 0 bedeutet keine Altersbeschränkung
    const selectedCategory = ref("");
    const tags = ref<string[]>([]);

    // === Kategorien und Tag-System ===
    const availableCategories = [
      "Freizeit",
      "Bildung",
      "Erziehung",
      "Familie",
      "Kultur",
      "Natur",
      "Technik",
      "Gesundheit",
      "Lifestyle",
      "Reisen",
      "Ernährung",
      "Fitness",
      "Andere",
    ];

    const categoryMap = {
      Freizeit: "ENTERTAINMENT",
      Bildung: "EDUCATION",
      Erziehung: "RAISING_CHILDREN",
      Familie: "FAMILY",
      Kultur: "CULTURE",
      Natur: "NATURE",
      Technik: "TECHNOLOGY",
      Gesundheit: "HEALTH",
      Lifestyle: "LIFESTYLE",
      Reisen: "TRAVEL",
      Ernährung: "FOOD",
      Fitness: "FITNESS",
      Andere: "OTHER",
    };

    // const categoryMapReverse = Object.fromEntries(Object.entries(categoryMap).map(([de, en]) => [en, de]));

    // Wenn gespeichert wird (z. B. an Backend):
    /* function saveToLocalStorage() {
      const englishValue = categoryMap[selectedCategory.value] || "OTHER";
      localStorage.setItem("postCategory", englishValue);
    } */

    // Wenn du vom Backend Daten bekommst und anzeigen willst:
    /* function setFromBackendValue(englishCategory = "OTHER") {
      selectedCategory.value = categoryMapReverse[englishCategory] || "Andere";
    } */

    const suggestedTags = ref<string[]>(["Erziehung", "Familienalltag", "Ernährung", "Freunde", "News"]);

    // Tag-UI-State
    const newTag = ref("");
    const showTagInput = ref(false);
    const tagInputRef = ref<HTMLInputElement | null>(null);

    // === Quiz ===
    const articleQuiz = ref<Quiz>({ questions: [] });
    const showQuiz = ref(false);

    // === Entwürfe und Artikel ===
    const drafts = ref<Draft[]>([]);
    const publishedArticles = ref<Article[]>([]);
    const currentDraftId = ref<string>("");
    const editMode = ref(false);

    // === UI-State ===
    const isSaving = ref(false);
    const savingType = ref<"draft" | "publish">("draft");
    const isLoadingDrafts = ref(false);
    const isLoadingPublished = ref(false);
    const notification = ref<Notification>({
      show: false,
      message: "",
      type: "info",
    });

    // === Tracking ===
    const deletedChapters = ref<string[]>([]); // hier werden die IDs der gelöschten Kapitel gespeichert (backend call)

    // === Konstanten ===
    const LOCAL_STORAGE_KEY = "article_editor_draft";

    const currendId = computed(() => {
      return articleId.value || currentDraftId.value;
    });

    // === Computed Properties ===
    const isFormValid = computed(() => {
      return (
        articleTitle.value.trim() !== "" &&
        articleDescription.value.trim() !== "" &&
        chapters.value.length > 0 &&
        chapters.value.every((c) => c.title.trim() !== "" && c.content.trim() !== "")
      );
    });

    const availableSuggestions = computed(() => {
      return suggestedTags.value.filter((t) => !tags.value.includes(t));
    });

    // === Hilfsfunktionen ===
    const normalizeChapters = (chapters: Chapter[]): Chapter[] => {
      console.log("Normalizing chapters:", chapters);
      return chapters.map((chapter) => ({
        ...chapter,
        isDragging: false,
        isSaving: false,
      }));
    };

    const showNotification = (message: string, type: "success" | "error" | "info" = "info") => {
      notification.value = {
        show: true,
        message,
        type,
      };

      setTimeout(() => (notification.value.show = false), 3000);
    };

    const isSavingChapter = (index: number): boolean => {
      return chapters.value[index]?.isSaving === true;
    };

    // === LocalStorage ===
    const saveToLocalStorage = () => {
      const dataToSave = {
        articleId: articleId.value,
        articleTitle: articleTitle.value,
        articleDescription: articleDescription.value,
        coverImage: coverImage.value,
        chapters: chapters.value,
        articleQuiz: articleQuiz.value,
        forKids: forKids.value,
        ageRestriction: ageRestriction.value,
        selectedCategory: selectedCategory.value,
        tags: tags.value,
        currentDraftId: articleId.value || currentDraftId.value,
        updated_at: new Date().toISOString(),
      };

      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
      } catch (e) {
        console.error("Fehler beim Speichern in localStorage:", e);
      }
    };

    const loadFromLocalStorage = () => {
      try {
        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!savedData) return;

        const parsedData = JSON.parse(savedData);

        if (parsedData.articleId) articleId.value = parsedData.articleId;

        if (parsedData.articleId && parsedData.articleId.length > 5) editMode.value = true;
        else editMode.value = false;
        // Artikel-Daten laden
        if (parsedData.articleTitle) articleTitle.value = parsedData.articleTitle;
        if (parsedData.articleDescription) articleDescription.value = parsedData.articleDescription;
        if (parsedData.coverImage) coverImage.value = parsedData.coverImage;
        if (parsedData.chapters) chapters.value = parsedData.chapters;
        if (parsedData.articleQuiz) articleQuiz.value = parsedData.articleQuiz;
        if (parsedData.currentDraftId) currentDraftId.value = parsedData.currentDraftId;

        // Einstellungen laden
        if (typeof parsedData.forKids === "boolean") forKids.value = parsedData.forKids;
        if (typeof parsedData.ageRestriction === "number") ageRestriction.value = parsedData.ageRestriction;
        if (parsedData.selectedCategory) selectedCategory.value = parsedData.selectedCategory;
        if (Array.isArray(parsedData.tags)) tags.value = parsedData.tags;

        showNotification("Automatisch gespeicherter Entwurf wiederhergestellt", "info");
      } catch (e) {
        console.error("Fehler beim Laden aus localStorage:", e);
      }
    };

    // === Tag-Funktionen ===
    const addTag = () => {
      const trimmedTag = newTag.value.trim();

      if (!trimmedTag) return;

      if (tags.value.length >= 5) {
        showNotification("Maximal 5 Tags erlaubt", "error");
        return;
      }

      if (tags.value.includes(trimmedTag)) {
        showNotification("Tag bereits vorhanden", "error");
        return;
      }

      tags.value.push(trimmedTag);
      newTag.value = "";
      showTagInput.value = false;
      saveToLocalStorage();
    };

    const removeTag = (index: number) => {
      tags.value.splice(index, 1);
      saveToLocalStorage();
    };

    const showAddTagInput = () => {
      showTagInput.value = true;
      setTimeout(() => {
        tagInputRef.value?.focus();
      }, 100);
    };

    const cancelAddTag = () => {
      newTag.value = "";
      showTagInput.value = false;
    };

    const selectSuggestedTag = (tag: string) => {
      if (tags.value.length < 5 && !tags.value.includes(tag)) {
        tags.value.push(tag);
        saveToLocalStorage();
      }
    };

    // === Quiz-Funktionen ===
    const toggleQuiz = () => {
      showQuiz.value = !showQuiz.value;
    };

    // === Kapitel-Funktionen ===
    const addNewChapter = () => {
      chapters.value.push({
        title: "",
        content: "",
        image: "",
        isDragging: false,
        isSaving: false,
      });
      saveToLocalStorage();
    };

    const removeChapter = (index: number, chapterId: string | undefined) => {
      chapters.value.splice(index, 1);
      saveToLocalStorage();

      if (chapterId) {
        if (!confirm("Sind Sie sicher, dass Sie dieses Kapitel löschen möchten?")) return;
        deletedChapters.value.push(chapterId);
      }
    };

    const saveChapter = async (index: number) => {
      const chapter = chapters.value[index];

      if (!chapter.title.trim() || !chapter.content.trim()) {
        showNotification("Bitte Titel und Inhalt des Kapitels ausfüllen.", "error");
        return;
      }

      try {
        chapter.isSaving = true;
        saveToLocalStorage();
        showNotification(`Kapitel ${index + 1} erfolgreich gespeichert`, "success");
      } catch (error) {
        console.error("Fehler beim Speichern des Kapitels:", error);
        showNotification("Ein Fehler ist beim Speichern des Kapitels aufgetreten", "error");
      } finally {
        chapter.isSaving = false;
      }
    };

    const handlePublishClick = () => {
      if (editMode.value == true) {
        console.log("handlePublishClick called, editMode:", editMode.value);
        saveUpdate(createUpdateForm(), true);
      } else {
        console.log("handlePublishClick called, editMode:", editMode.value);
        publishArticle();
      }
    };

    const handleDraftClick = () => {
      if (editMode.value === true) {
        saveUpdate(createUpdateForm(), false);
      } else {
        saveAsDraft();
      }
    };

    /* hier werden die daten für main post data geholt */
    const createUpdateForm = (): FormData => {
      const formData = new FormData();

      // Post-Hauptdaten für Update
      const postData = {
        title: articleTitle.value,
        description: articleDescription.value,
        tags: tags.value.join(","),
        category: categoryMap[selectedCategory.value as keyof typeof categoryMap] || "OTHER",
        ageRestriction: ageRestriction.value,
        forKids: forKids.value,
        chapters: chapters.value.map((chapter, index) => ({
          id: chapter.id || undefined, // Existing chapters have ID, new ones don't
          title: chapter.title,
          content: chapter.content,
          image: chapter.image || null,
          index: index,
          delete: false, // We handle deletions separately
        })),
        quiz: {
          id: articleQuiz.value.id || undefined,
          questions: (articleQuiz.value.questions || []).map((question) => ({
            id: question.id || undefined,
            question: question.question,
            answers:
              question.answers?.map((answer) => ({
                id: answer.id || undefined,
                answer: answer.answer,
                isCorrect: answer.isCorrect,
                delete: false,
              })) || [],
          })),
        },
      };

      // Deleted chapters hinzufügen
      if (deletedChapters.value.length > 0) {
        postData.chapters.push(
          ...deletedChapters.value.map((chapterId) => ({
            id: chapterId,
            delete: true,
            title: "",
            content: "",
            image: null,
            index: -1, // Index irrelevant für gelöschte Kapitel
          }))
        );
      }

      formData.append("postData", JSON.stringify(postData));

      // Cover-Bild verarbeiten (nur wenn neu/geändert)
      if (coverImage.value && coverImage.value.startsWith("data:image")) {
        const byteString = atob(coverImage.value.split(",")[1]);
        const mimeString = coverImage.value.split(",")[0].split(":")[1].split(";")[0];

        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }

        const blob = new Blob([ab], { type: mimeString });
        const filename = "cover-image." + mimeString.split("/")[1];
        const file = new File([blob], filename, { type: mimeString });

        formData.append("image", file);
      }

      // Kapitel-Bilder verarbeiten (nur neue/geänderte)
      chapters.value.forEach((chapter, index) => {
        if (chapter.image && chapter.image.startsWith("data:image")) {
          const byteString = atob(chapter.image.split(",")[1]);
          const mimeString = chapter.image.split(",")[0].split(":")[1].split(";")[0];

          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }

          const blob = new Blob([ab], { type: mimeString });
          const filename = `chapter-image-${index}.${mimeString.split("/")[1]}`;
          const file = new File([blob], filename, { type: mimeString });

          formData.append(`chapterImage_${index}`, file);
        }
      });

      return formData;
    };

    // === Entwurf-Funktionen ===
    const loadDraft = (draft: Draft) => {
      try {
        // Bestätigung bei ungespeicherten Änderungen
        if (articleTitle.value.trim() !== "" && draft.id !== currentDraftId.value) {
          confirm("Wenn sie einen neuen Post laden, gehen alle ungespeicherten Änderungen verloren. Sind sie sicher?");
        }
        editMode.value = true;

        // Entwurf laden
        currentDraftId.value = draft.id;
        articleId.value = draft.id;
        articleTitle.value = draft.title || "";
        articleDescription.value = draft.quickDescription || "";
        coverImage.value = draft.image || "";
        forKids.value = draft.forKids || false;
        ageRestriction.value = draft.ageRestriction || 0;
        selectedCategory.value = draft.category || "";
        tags.value = draft.tags || [];
        chapters.value = normalizeChapters(draft.chapters);
        articleQuiz.value = draft.quiz || { questions: [] };

        showNotification("Entwurf wurde geladen", "success");
      } catch (error) {
        console.error("Fehler beim Laden des Entwurfs:", error);
        showNotification("Fehler beim Laden des Entwurfs", "error");
      }
    };

    const editDraft = (draft: Draft) => loadDraft(draft);

    const saveUpdate = async (article: FormData | undefined, published: boolean = false) => {
      if (!article) {
        showNotification("Fehler beim Erstellen des Artikels", "error");
        return;
      }
      try {
        const postId = articleId.value;
        if (!postId || postId.length < 10) {
          console.error("no postId found");
          return;
        }

        await authorService.saveUpdate(postId, article, published);
        showNotification("Artikel erfolgreich aktualisiert", "success");

        resetForm();
        await refreshPublishedArticles();
        await refreshDrafts();

        return;
      } catch (error) {
        console.error("error beim updaten des posts", error);
      }
    };

    const deleteDraft = async (draftId: string) => {
      try {
        if (!confirm("Sind Sie sicher, dass Sie diesen Entwurf löschen möchten?")) return;

        // Bei aktuellem Entwurf: Formular zurücksetzen
        if (draftId === currentDraftId.value) resetForm();

        const message = await authorService.deleteArticle(draftId);
        drafts.value = drafts.value.filter((d) => d.id !== draftId);
        showNotification(message, "success");
      } catch (error) {
        console.error("Fehler beim Löschen des Entwurfs:", error);
        showNotification("Fehler beim Löschen des Entwurfs", "error");
      }
    };

    const refreshDrafts = async () => {
      try {
        isLoadingDrafts.value = true;
        const result = await authorService.getAuthorDrafts();
        drafts.value = result.drafts || [];
      } catch (error) {
        console.error("Fehler beim Laden der Entwürfe:", error);
        showNotification("Entwürfe konnten nicht geladen werden", "error");
      } finally {
        isLoadingDrafts.value = false;
      }
    };

    // === Veröffentlichte Artikel Funktionen ===
    const viewArticle = (articleId: string) => {
      router.push(`/articles/${articleId}`);
    };

    const editPublishedArticle = async (article: PublishedArticle) => {
      try {
        editMode.value = true;
        // Artikel laden
        articleId.value = article.id;
        articleTitle.value = article.title;
        articleDescription.value = article.quickDescription || "";
        coverImage.value = article.image || "";
        forKids.value = article.forKids || false;
        ageRestriction.value = article.ageRestriction || 0;
        selectedCategory.value = article.category || "";
        tags.value = article.tags || [];
        chapters.value = normalizeChapters(article.chapters);
        articleQuiz.value = article.quiz || { questions: [] };

        saveToLocalStorage();
        showNotification("Artikel wurde zum Bearbeiten geladen", "success");
      } catch (error) {
        console.error("Fehler beim Laden des Artikels:", error);
        showNotification("Fehler beim Laden des Artikels", "error");
      }
    };

    const deletePublishedArticle = async (articleId: string) => {
      try {
        if (
          !confirm(
            "Sind Sie sicher, dass Sie diesen Artikel löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
          )
        ) {
          return;
        }

        const message = await authorService.deleteArticle(articleId);
        publishedArticles.value = publishedArticles.value.filter((a) => a.id !== articleId);
        showNotification(message, "success");
      } catch (error) {
        console.error("Fehler beim Löschen des Artikels:", error);
        showNotification("Fehler beim Löschen des Artikels", "error");
      }
    };

    const refreshPublishedArticles = async () => {
      try {
        isLoadingPublished.value = true;
        const result = await authorService.getAuthorPublishedArticles();
        publishedArticles.value = result.posts || [];
      } catch (error) {
        console.error("Fehler beim Laden der veröffentlichten Artikel:", error);
        showNotification("Artikel konnten nicht geladen werden", "error");
      } finally {
        isLoadingPublished.value = false;
      }
    };

    // === Reset Funktion, damit dann das feld wieder sauber it ===
    const resetForm = () => {
      articleId.value = "";
      articleTitle.value = "";
      articleDescription.value = "";
      coverImage.value = "";
      chapters.value = [];
      articleQuiz.value = { questions: [] };
      showQuiz.value = false;
      currentDraftId.value = "";
      forKids.value = false;
      ageRestriction.value = 0;
      selectedCategory.value = "";
      tags.value = [];
      newTag.value = "";
      showTagInput.value = false;

      editMode.value = false;

      localStorage.removeItem(LOCAL_STORAGE_KEY);
      showNotification("Formular wurde zurückgesetzt", "info");
    };

    // === Macht aus JSON multi part data===
    const createForm = (): FormData => {
      const formData = new FormData();

      // Basis-Daten
      formData.append("title", articleTitle.value);
      formData.append("quickDescription", articleDescription.value);
      formData.append("tags", tags.value.join(","));
      formData.append("category", categoryMap[selectedCategory.value as keyof typeof categoryMap] || "OTHER");
      formData.append("ageRestriction", ageRestriction.value.toString());
      formData.append("forKids", forKids.value.toString());

      // Cover-Bild verarbeiten
      if (coverImage.value && coverImage.value.startsWith("data:image")) {
        const byteString = atob(coverImage.value.split(",")[1]);
        const mimeString = coverImage.value.split(",")[0].split(":")[1].split(";")[0];

        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }

        const blob = new Blob([ab], { type: mimeString });
        const filename = "cover-image." + mimeString.split("/")[1];
        const file = new File([blob], filename, { type: mimeString });

        formData.append("image", file);
      }

      // Kapitel-Daten
      const chaptersData = chapters.value.map(({ title, content }) => ({
        title,
        content,
      }));
      formData.append("chapters", JSON.stringify(chaptersData));

      // Kapitel-Bilder verarbeiten
      chapters.value.forEach((chapter, index) => {
        if (chapter.image && chapter.image.startsWith("data:image")) {
          const byteString = atob(chapter.image.split(",")[1]);
          const mimeString = chapter.image.split(",")[0].split(":")[1].split(";")[0];

          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }

          const blob = new Blob([ab], { type: mimeString });
          const filename = `chapter-image-${index}.${mimeString.split("/")[1]}`;
          const file = new File([blob], filename, { type: mimeString });

          formData.append(`chapterImage_${index}`, file);
        }
      });

      // Quiz-Daten
      formData.append("quiz", JSON.stringify(articleQuiz.value));

      return formData;
    };

    const saveAsDraft = async () => {
      try {
        isSaving.value = true;
        savingType.value = "draft";

        const data = createForm();
        const result = await authorService.saveArticleDraft(data);

        if (result.status === 200 || result.status === 201) {
          showNotification("Artikel erfolgreich als Entwurf gespeichert", "success");
          refreshDrafts();
          resetForm();
        } else {
          showNotification("Fehler beim Speichern des Entwurfs", "error");
        }
      } catch (error) {
        console.error("Fehler beim Speichern:", error);
        showNotification("Ein unerwarteter Fehler ist aufgetreten", "error");
      } finally {
        isSaving.value = false;
      }
    };

    // === Artikel veröffentlichen (in db speicher (isPublished)) ===
    const publishArticle = async () => {
      if (!isFormValid.value) {
        showNotification("Bitte füllen Sie alle erforderlichen Felder aus.", "error");
        return;
      }

      try {
        isSaving.value = true;
        savingType.value = "publish";

        const formData = createForm();
        const result = await authorService.publishArticle(formData);

        if (result.status === 201) {
          showNotification("Artikel erfolgreich veröffentlicht", "success");
          refreshPublishedArticles();
          resetForm();
        } else {
          showNotification("Fehler beim Veröffentlichen des Artikels", "error");
        }
      } catch (error) {
        console.error("Fehler beim Veröffentlichen:", error);
        showNotification("Ein unerwarteter Fehler ist aufgetreten", "error");
      } finally {
        isSaving.value = false;
      }
    };

    // === Auto-Save ===
    const startAutoSaveInterval = () => {
      // LocalStorage Auto-Save alle 30 Sekunden
      const autoSaveInterval = setInterval(() => {
        if (articleTitle.value.trim() !== "" || chapters.value.length > 0) {
          saveToLocalStorage();
        }
      }, 30000);
      return { autoSaveInterval, apiBackupInterval };
    };

    let autoSaveInterval: number;
    let apiBackupInterval: number;
    // === Lifecycle ===
    onMounted(async () => {
      // Autorisierung prüfen
      if (!authorService.isAuthor()) {
        router.push("/member/dashboard");
        return;
      }

      // LocalStorage laden
      loadFromLocalStorage();

      // Daten laden
      await Promise.all([refreshDrafts(), refreshPublishedArticles()]);

      // URL-Parameter prüfen
      const draftId = router.currentRoute.value.query.draftId as string;
      if (draftId) {
        const draftToLoad = drafts.value.find((d) => d.id === draftId);
        if (draftToLoad) {
          loadDraft(draftToLoad);
        }
      }

      // Auto-Save starten
      const intervals = startAutoSaveInterval();
      autoSaveInterval = intervals.autoSaveInterval;
      apiBackupInterval = intervals.apiBackupInterval;

      // Event-Listener
      window.addEventListener("beforeunload", saveToLocalStorage);
    });
    // Cleanup
    onBeforeUnmount(() => {
      clearInterval(autoSaveInterval);
      clearInterval(apiBackupInterval);
      window.removeEventListener("beforeunload", saveToLocalStorage);
    });

    return {
      // Artikel-Daten
      articleTitle,
      articleDescription,
      coverImage,
      chapters,
      editMode,

      // Einstellungen
      forKids,
      ageRestriction,
      selectedCategory,
      availableCategories,
      tags,

      // Tag-System
      newTag,
      showTagInput,
      tagInputRef,
      suggestedTags,
      availableSuggestions,
      addTag,
      removeTag,
      showAddTagInput,
      cancelAddTag,
      selectSuggestedTag,
      handlePublishClick,
      handleDraftClick,

      // Quiz
      articleQuiz,
      showQuiz,
      toggleQuiz,

      // UI-State
      isSaving,
      savingType,
      notification,
      isFormValid,

      // Funktionen
      saveToLocalStorage,
      addNewChapter,
      removeChapter,
      saveChapter,
      isSavingChapter,
      resetForm,

      // Entwürfe
      drafts,
      isLoadingDrafts,
      currentDraftId,
      loadDraft,
      editDraft,
      deleteDraft,
      refreshDrafts,

      currendId,

      // Veröffentlichte Artikel
      publishedArticles,
      isLoadingPublished,
      refreshPublishedArticles,
      viewArticle,
      editPublishedArticle,
      deletePublishedArticle,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/animations";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;

.article-editor-layout {
  @include animations.fade-in(0.5s);
  display: flex;
  gap: map.get(vars.$spacing, xl);
  margin: 0 auto;
  align-items: flex-start;
  border-radius: 50px;
  @media (max-width: 1200px) {
    flex-direction: column;
  }
}

.article-editor {
  display: flex;
  flex-direction: column;
  gap: map.get(vars.$spacing, l);
  flex: 1;
  max-width: 1600px;
  margin: 0 auto;
  position: relative;

  .editor-header {
    text-align: left;
    margin-bottom: map.get(vars.$spacing, l);

    .header-text {
      text-align: left;
    }

    .editor-title {
      font-size: map.get(map.get(vars.$fonts, sizes), xxl);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      margin-bottom: map.get(vars.$spacing, xs);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
          transition: all 0.4s ease-out;
        }
      }
    }

    .editor-description {
      font-size: map.get(map.get(vars.$fonts, sizes), medium);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
          transition: all 0.4s ease-out;
        }
      }
    }
  }

  .editor-section {
    background-color: transparent;
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        border: 1px solid mixins.theme-color($theme, border-medium);
        transition: all 0.4s ease-out;
      }
    }

    // Options-Menu braucht overflow visible für Tooltips
    &.options-menu {
      overflow: visible;
    }
  }

  .title-input {
    width: 100%;
    font-size: map.get(map.get(vars.$fonts, sizes), xl);
    font-weight: map.get(map.get(vars.$fonts, weights), bold);
    padding: map.get(vars.$spacing, l);
    border: none;
    outline: none;
    background: transparent;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
        transition: all 0.4s ease-out;
      }
    }
  }

  .main-info {
    width: 100%;
    height: 300px;
    display: flex;
    flex-direction: column;
    gap: map.get(vars.$spacing, m);
    padding: map.get(vars.$spacing, m);

    @media (min-width: 768px) {
      flex-direction: row;
    }
  }

  .description-textarea {
    min-height: 200px;
    padding: map.get(vars.$spacing, m);
    border: none;
    outline: none;
    resize: vertical;
    width: 100%;
    background: transparent;
    flex: 1;
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);
    resize: none;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
        border: 1px solid mixins.theme-color($theme, border-light);
        transition: all 0.4s ease-out;
      }
    }
  }

  .chapters-section {
    padding: map.get(vars.$spacing, m);
  }

  .empty-chapters {
    display: flex;
    justify-content: center;
    padding: map.get(vars.$spacing, xl) 0;
  }

  .add-chapter-btn {
    margin: 0 auto;
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: map.get(vars.$spacing, xs);
    padding: map.get(vars.$spacing, m) map.get(vars.$spacing, l);
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);
    cursor: pointer;
    font-weight: map.get(map.get(vars.$fonts, weights), medium);
    transition: all 0.3s ease;
    border: none;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background: mixins.theme-gradient($theme, primary);
        color: white;
        transition: all 0.4s ease-out;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        &.secondary {
          background: mixins.theme-color($theme, card-bg);
          color: mixins.theme-color($theme, text-secondary);
          border: 1px solid mixins.theme-color($theme, border-medium);

          &:hover {
            color: mixins.theme-color($theme, text-primary);
            border-color: mixins.theme-color($theme, primary);
          }
        }
      }
    }
  }

  .chapters-container {
    display: flex;
    flex-direction: column;
    gap: map.get(vars.$spacing, l);
  }

  // === Optionsmenü Styles ===
  .options-menu {
    padding: map.get(vars.$spacing, l);
    position: relative; // Für korrekte Tooltip-Positionierung

    .options-header {
      margin-bottom: map.get(vars.$spacing, m);

      h3 {
        font-size: map.get(map.get(vars.$fonts, sizes), large);
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        margin: 0;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }
    }

    .options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: map.get(vars.$spacing, l);

      @media (max-width: 1024px) {
        grid-template-columns: 1fr 1fr;

        // Zielgruppe nimmt volle Breite auf kleineren Bildschirmen
        .option-group:first-child {
          grid-column: 1 / -1;
        }
      }

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .option-group {
      display: flex;
      flex-direction: column;
      gap: map.get(vars.$spacing, s);

      &.tags-group {
        grid-column: 1 / -1;
      }
    }

    .option-label {
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      font-size: map.get(map.get(vars.$fonts, sizes), medium);
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, xs);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    // Info Tooltip
    .info-tooltip {
      position: relative;
      display: inline-flex;
      align-items: center;

      .info-icon {
        width: 16px;
        height: 16px;
        cursor: help;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
            transition: color 0.2s ease;
          }
        }
      }

      &:hover {
        .info-icon {
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, primary);
            }
          }
        }

        .tooltip-content {
          opacity: 1;
          visibility: visible;
          transform: translateY(0) translateX(-50%);
        }
      }

      .tooltip-content {
        position: absolute;
        top: calc(100% + 8px); // Position unterhalb des Icons
        left: 50%;
        transform: translateX(-50%) translateY(-4px);
        width: 250px;
        padding: map.get(vars.$spacing, s);
        border-radius: map.get(map.get(vars.$layout, border-radius), small);
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        font-weight: map.get(map.get(vars.$fonts, weights), regular);
        text-align: left;
        opacity: 0;
        visibility: hidden;
        transition: all 0.2s ease;
        pointer-events: none;
        z-index: 9999; // Sehr hoher z-index

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, card-bg);
            color: mixins.theme-color($theme, text-secondary);
            border: 1px solid mixins.theme-color($theme, border-medium);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
        }

        // Tooltip Arrow oben
        &::before {
          content: "";
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              border-bottom: 6px solid mixins.theme-color($theme, border-medium);
            }
          }
        }

        // Inner Arrow für Border-Effekt
        &::after {
          content: "";
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(1px);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              border-bottom: 6px solid mixins.theme-color($theme, card-bg);
            }
          }
        }
      }
    }

    // Checkbox Styles
    .checkbox-wrapper {
      display: flex;
      align-items: center;
      padding: map.get(vars.$spacing, s);
      border-radius: map.get(map.get(vars.$layout, border-radius), small);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, hover-color);
          border: 1px solid mixins.theme-color($theme, border-light);
          transition: all 0.2s ease;

          &:hover {
            border-color: mixins.theme-color($theme, border-medium);
          }
        }
      }
    }

    .checkbox-label {
      position: relative;
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, s);
      cursor: pointer;
      user-select: none;

      .checkbox-input {
        position: absolute;
        opacity: 0;
        cursor: pointer;

        &:checked ~ .checkbox-custom {
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, primary);
              border-color: mixins.theme-color($theme, primary);
            }
          }

          .checkmark-icon {
            opacity: 1;
            transform: scale(1);
          }
        }

        &:focus ~ .checkbox-custom {
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              box-shadow: 0 0 0 2px mixins.theme-color($theme, primary);
            }
          }
        }
      }

      .checkbox-custom {
        position: relative;
        width: 20px;
        height: 20px;
        border-radius: 4px;
        transition: all 0.2s ease;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, card-bg);
            border: 2px solid mixins.theme-color($theme, border-medium);
          }
        }

        .checkmark-icon {
          width: 14px;
          height: 14px;
          color: white;
          opacity: 0;
          transform: scale(0);
          transition: all 0.2s ease;
        }
      }

      .checkbox-text {
        font-size: map.get(map.get(vars.$fonts, sizes), medium);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }
    }

    .age-select,
    .category-select {
      padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), small);
      font-size: map.get(map.get(vars.$fonts, sizes), medium);
      cursor: pointer;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, card-bg);
          color: mixins.theme-color($theme, text-primary);
          border: 1px solid mixins.theme-color($theme, border-medium);

          &:focus {
            outline: none;
            border-color: mixins.theme-color($theme, primary);
          }
        }
      }
    }

    // === Tag System Styles ===
    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: map.get(vars.$spacing, s);
      margin-bottom: map.get(vars.$spacing, m);
    }

    .tag-item {
      display: inline-flex;
      align-items: center;
      gap: map.get(vars.$spacing, xs);
      padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, m);
      border-radius: 50px;
      font-size: map.get(map.get(vars.$fonts, sizes), small);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, primary);
          color: mixins.theme-color($theme, text-secondary);
          border: 1px solid mixins.theme-color($theme, border-light);
          cursor: pointer;
          transition: all 0.3s;
        }
      }
    }

    .tag-remove {
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      margin: 0;
      color: white;
      transition: opacity 0.2s;

      &:hover {
        opacity: 0.7;
      }
    }

    .add-tag-btn {
      display: inline-flex;
      align-items: center;
      gap: map.get(vars.$spacing, xs);
      padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, m);
      border-radius: 50px;
      cursor: pointer;
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      transition: all 0.2s ease;
      border: none;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: transparent;
          color: mixins.theme-color($theme, primary);
          border: 1px dashed mixins.theme-color($theme, primary);

          &:hover {
            background-color: mixins.theme-color($theme, hover-color);
          }
        }
      }
    }

    .tag-input-container {
      display: inline-flex;
      align-items: center;
      gap: map.get(vars.$spacing, xs);
    }

    .tag-input {
      padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, s);
      border-radius: 50px;
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      width: 150px;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, card-bg);
          color: mixins.theme-color($theme, text-primary);
          border: 1px solid mixins.theme-color($theme, primary);

          &:focus {
            outline: none;
            box-shadow: 0 0 0 2px mixins.theme-color($theme, border-medium);
          }
        }
      }
    }

    .tag-confirm,
    .tag-cancel {
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      transition: all 0.2s ease;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          &:hover {
            background-color: mixins.theme-color($theme, hover-color);
          }
        }
      }
    }

    .tag-confirm {
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: #4caf50;
        }
      }
    }

    .tag-cancel {
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: #f44336;
        }
      }
    }

    .tag-suggestions {
      margin-top: map.get(vars.$spacing, s);
    }

    .suggestions-label {
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      margin-bottom: map.get(vars.$spacing, xs);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }

    .suggested-tags {
      display: flex;
      flex-wrap: wrap;
      gap: map.get(vars.$spacing, xs);
    }

    .suggested-tag {
      display: inline-flex;
      padding: 4px map.get(vars.$spacing, s);
      border-radius: 50px;
      cursor: pointer;
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      transition: all 0.2s ease;
      border: none;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, hover-color);
          color: mixins.theme-color($theme, text-secondary);
          border: 1px solid mixins.theme-color($theme, border-light);

          &:hover {
            background-color: mixins.theme-color($theme, primary);
            color: white;
            border-color: mixins.theme-color($theme, primary);
          }
        }
      }
    }
  }

  // === Aktions-Buttons ===
  .editor-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: map.get(vars.$spacing, m);
    padding: map.get(vars.$spacing, m);
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        border: 1px solid mixins.theme-color($theme, border-light);
        transition: all 0.4s ease-out;
      }
    }
  }

  .action-button {
    display: flex;
    align-items: center;
    gap: map.get(vars.$spacing, xs);
    padding: map.get(vars.$spacing, m) map.get(vars.$spacing, l);
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);
    font-weight: map.get(map.get(vars.$fonts, weights), bold);
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: none !important;
    }

    &.reset {
      margin-right: auto;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: rgba(244, 67, 54, 0.1);
          color: #f44336;
          border: 1px solid rgba(244, 67, 54, 0.3);
          transition: all 0.4s ease-out;

          &:hover:not(:disabled) {
            background-color: rgba(244, 67, 54, 0.2);
            border-color: rgba(244, 67, 54, 0.5);
            transform: translateY(-1px);
          }
        }
      }
    }

    &.draft {
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, card-bg);
          color: mixins.theme-color($theme, text-secondary);
          border: 1px solid mixins.theme-color($theme, border-medium);
          transition: all 0.4s ease-out;

          &:hover:not(:disabled) {
            color: mixins.theme-color($theme, text-primary);
            border-color: mixins.theme-color($theme, primary);
          }
        }
      }
    }

    &.publish {
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, primary);
          color: white;
          transition: all 0.4s ease-out;

          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          }
        }
      }
    }
  }

  // === Benachrichtigungen ===
  .notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: map.get(vars.$spacing, m) map.get(vars.$spacing, l);
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);
    font-weight: map.get(map.get(vars.$fonts, weights), medium);
    z-index: 1000;
    animation: slideIn 0.3s ease-out forwards;

    &.success {
      background-color: #4caf50;
      color: white;
    }

    &.error {
      background-color: #f44336;
      color: white;
    }

    &.info {
      background-color: #2196f3;
      color: white;
    }
  }
}

// === Sidebar ===
.sidebar {
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: map.get(vars.$spacing, l);
  position: sticky;
  top: 230px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  margin-bottom: 40px;

  @media (max-width: 1200px) {
    width: 100%;
    position: static;
    margin-bottom: map.get(vars.$spacing, xl);
    max-height: none;
  }
}

// === Icons ===
.icon-size {
  width: 20px;
  height: 20px;
}

.icon-size-sm {
  width: 16px;
  height: 16px;
}

.icon-size-xs {
  width: 12px;
  height: 12px;
  color: mixins.theme-color("light", text-secondary);
}

.info-icon {
  width: 16px;
  height: 16px;
}

.checkmark-icon {
  width: 14px;
  height: 14px;
}

// === Utilities ===
.mr-1 {
  margin-right: map.get(vars.$spacing, xs);
}

.mr-2 {
  margin-right: map.get(vars.$spacing, s);
}

.spinning {
  animation: spin 1s linear infinite;
}

// === Quiz Styles ===
.quiz-header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: map.get(vars.$spacing, m);
  border-bottom: 1px solid;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      border-color: mixins.theme-color($theme, border-light);
      transition: all 0.4s ease-out;
    }
  }
}

.quiz-section-title {
  font-size: map.get(map.get(vars.$fonts, sizes), large);
  font-weight: map.get(map.get(vars.$fonts, weights), medium);
  margin: 0;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      color: mixins.theme-color($theme, text-primary);
      transition: all 0.4s ease-out;
    }
  }
}

.toggle-quiz-btn {
  display: flex;
  align-items: center;
  gap: map.get(vars.$spacing, xs);
  padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);
  border-radius: map.get(map.get(vars.$layout, border-radius), small);
  cursor: pointer;
  font-weight: map.get(map.get(vars.$fonts, weights), medium);
  transition: all 0.3s ease;
  border: none;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background-color: rgba(76, 175, 80, 0.1);
      color: #4caf50;
      border: 1px solid rgba(76, 175, 80, 0.3);
      transition: all 0.4s ease-out;

      &:hover {
        background-color: rgba(76, 175, 80, 0.2);
        border-color: rgba(76, 175, 80, 0.5);
      }
    }
  }
}

.article-quiz-container {
  padding: map.get(vars.$spacing, m);
}

.local-storage-info {
  text-align: center;
  margin-top: map.get(vars.$spacing, m);

  small {
    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
        transition: all 0.4s ease-out;
      }
    }
  }
}

.tags-span {
  display: inline-block;
  padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, s);
  border-radius: 50px;
  font-size: map.get(map.get(vars.$fonts, sizes), small);
  margin-right: map.get(vars.$spacing, xs);
  margin-bottom: map.get(vars.$spacing, xs);

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, primary);
      color: white;
    }
  }
}

// === Animationen ===
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
