<!-- src/components/pages/DashboardPages/CreateArticle/ArticleEditor.vue -->
<template>
  <div class="article-editor-layout">
    <!-- Haupteditorbereich -->
    <div class="article-editor">
      <div class="editor-header">
        <div class="header-text">
          <h2 class="editor-title">Neuen Artikel erstellen</h2>
          <p class="editor-description">Erstellen Sie Ihren Artikel in Kapiteln, um das Lesetracking zu erleichtern.</p>
        </div>
      </div>

      <!-- Titel-Bereich -->
      <div class="editor-section">
        <input type="text" v-model="articleTitle" class="title-input" placeholder="Titel des Artikels" />
      </div>

      <!-- Hauptbild und Beschreibung -->
      <div class="editor-section main-info">
        <ImageUploader
          v-model="coverImage"
          label="Bild einfügen"
          help-text="Max 1 Bild"
          alt="Artikelbild"
          :is-small="false"
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
            v-for="(_, index) in chapters"
            :key="index"
            v-model="chapters[index]"
            :chapter-number="index + 1"
            :is-saving="isSavingChapter(index)"
            @save="() => saveChapter(index)"
            @remove="() => removeChapter(index)"
          />

          <button @click="addNewChapter" class="add-chapter-btn secondary">
            <PlusIcon class="icon-size mr-2" />
            <span>Weiteres Kapitel</span>
          </button>
        </div>
      </div>

      <!-- Globales Quiz für den gesamten Artikel -->
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
        <button @click="saveAsDraft" class="action-button draft" :disabled="isSaving">
          <span v-if="isSaving && savingType === 'draft'">
            <ArrowPathIcon class="icon-size-sm spinning" />
            Speichern...
          </span>
          <span v-else>Entwurf speichern</span>
        </button>
        <button @click="publishArticle" class="action-button publish" :disabled="isSaving || !isFormValid">
          <span v-if="isSaving && savingType === 'publish'">
            <ArrowPathIcon class="icon-size-sm spinning" />
            Veröffentlichen...
          </span>
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

    <!-- Sidebar für Entwürfe und Veröffentlichte Artikel -->
    <div class="sidebar">
      <!-- Seitenleiste für Entwürfe -->
      <DraftsList
        :drafts="drafts"
        :is-loading="isLoadingDrafts"
        :selected-draft-id="currentDraftId"
        @refresh="refreshDrafts"
        @select="loadDraft"
        @edit="editDraft"
        @delete="deleteDraft"
      />

      <!-- Seitenleiste für veröffentlichte Artikel -->
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
import { PlusIcon, ArrowPathIcon } from "@heroicons/vue/24/outline";
import { authorService } from "@/services/author.service";
import ChapterEditor from "./ChapterEditor.vue";
import ImageUploader from "./ImageUploader.vue";
import DraftsList from "./DraftsList.vue";
import PublishedArticlesList from "./PublishedArticlesList.vue";
import QuizEditor from "./QuizEditor.vue";
import type { Chapter, Draft, PublishedArticle, QuizCreation as Quiz } from "./types";

interface Notification {
  show: boolean;
  message: string;
  type: "success" | "error" | "info";
}

export default defineComponent({
  name: "ArticleEditor",
  components: {
    PlusIcon,
    ArrowPathIcon,
    ChapterEditor,
    ImageUploader,
    DraftsList,
    PublishedArticlesList,
    QuizEditor,
  },
  setup() {
    const router = useRouter();
    const articleTitle = ref("");
    const articleDescription = ref("");
    const coverImage = ref("");
    const chapters = ref<Chapter[]>([]);
    const isSaving = ref(false);
    const savingType = ref<"draft" | "publish">("draft");

    // Globales Quiz für den Artikel statt pro Kapitel
    const articleQuiz = ref<Quiz>({
      questions: [],
    });
    const showQuiz = ref(false); // Steuert, ob das Quiz-Panel angezeigt wird

    // Für die Entwürfe-Seitenleiste
    const drafts = ref<Draft[]>([]);
    const isLoadingDrafts = ref(false);
    const currentDraftId = ref<string | undefined>(undefined);

    // Für die veröffentlichten Artikel
    const publishedArticles = ref<PublishedArticle[]>([]);
    const isLoadingPublished = ref(false);

    const notification = ref<Notification>({
      show: false,
      message: "",
      type: "info",
    });

    // Lokalspeicherung
    const LOCAL_STORAGE_KEY = "article_editor_draft";

    const normalizeChapters = (chapters: Chapter[]) =>
      chapters.map((chapter) => ({
        ...chapter,
        isDragging: false,
        isSaving: false,
      }));

    // Form-Validierung
    const isFormValid = computed(() => {
      return (
        articleTitle.value.trim() !== "" &&
        articleDescription.value.trim() !== "" &&
        chapters.value.length > 0 &&
        chapters.value.every((c) => c.title.trim() !== "" && c.content.trim() !== "")
      );
    });

    // Benachrichtigung anzeigen
    const showNotification = (message: string, type: "success" | "error" | "info" = "info") => {
      notification.value = {
        show: true,
        message,
        type,
      };

      // Benachrichtigung nach 3 Sekunden ausblenden
      setTimeout(() => {
        notification.value.show = false;
      }, 3000);
    };

    // Funktion zum Speichern im localStorage
    const saveToLocalStorage = () => {
      const dataToSave = {
        articleTitle: articleTitle.value,
        articleDescription: articleDescription.value,
        coverImage: coverImage.value,
        chapters: chapters.value,
        articleQuiz: articleQuiz.value,
        currentDraftId: currentDraftId.value,
        updated_at: new Date().toISOString(),
      };

      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
      } catch (e) {
        console.error("Fehler beim Speichern in localStorage:", e);
      }
    };

    // Funktion zum Laden aus localStorage
    const loadFromLocalStorage = () => {
      try {
        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedData) {
          const parsedData = JSON.parse(savedData);

          // Daten nur laden, wenn sie existieren
          if (parsedData.articleTitle) articleTitle.value = parsedData.articleTitle;
          if (parsedData.articleDescription) articleDescription.value = parsedData.articleDescription;
          if (parsedData.coverImage) coverImage.value = parsedData.coverImage;
          if (parsedData.chapters) chapters.value = parsedData.chapters;
          if (parsedData.articleQuiz) articleQuiz.value = parsedData.articleQuiz;
          if (parsedData.currentDraftId) currentDraftId.value = parsedData.currentDraftId;

          showNotification("Automatisch gespeicherter Entwurf wiederhergestellt", "info");
        }
      } catch (e) {
        console.error("Fehler beim Laden aus localStorage:", e);
      }
    };

    // Toggle-Funktion für das Quiz-Panel
    const toggleQuiz = () => {
      showQuiz.value = !showQuiz.value;
    };

    // Kapitel-Funktionen
    const addNewChapter = () => {
      chapters.value.push({
        title: "",
        content: "",
        chapterImage: "",
        isDragging: false,
        isSaving: false,
      });

      // Änderung im localStorage speichern
      saveToLocalStorage();
    };

    const removeChapter = (index: number) => {
      chapters.value.splice(index, 1);

      // Änderung im localStorage speichern
      saveToLocalStorage();
    };

    // Kapitel speichern
    const saveChapter = async (index: number) => {
      if (!chapters.value[index].title.trim() || !chapters.value[index].content.trim()) {
        showNotification("Bitte Titel und Inhalt des Kapitels ausfüllen.", "error");
        return;
      }

      try {
        chapters.value[index].isSaving = true;

        // Kapitel-Daten zusammenstellen
        const chapterData = {
          title: chapters.value[index].title,
          content: chapters.value[index].content,
          chapterImage: chapters.value[index].chapterImage,
          chapterNumber: index + 1,
          parentArticleId: currentDraftId.value || null,
        };

        // Simuliere API-Aufruf
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Änderung im localStorage speichern
        saveToLocalStorage();

        showNotification(`Kapitel ${index + 1} erfolgreich gespeichert`, "success");
      } catch (error) {
        console.error("Fehler beim Speichern des Kapitels:", error);
        showNotification("Ein Fehler ist beim Speichern des Kapitels aufgetreten", "error");
      } finally {
        chapters.value[index].isSaving = false;
      }
    };

    // Hilfsfunktion zum Prüfen des Speicherstatus eines Kapitels
    const isSavingChapter = (index: number) => {
      return chapters.value[index] && chapters.value[index].isSaving === true;
    };

    // Neuen Entwurf laden
    const loadDraft = (draft: Draft) => {
      try {
        // Aktuellen Inhalt zuerst speichern, wenn ein Artikeltitel vorhanden ist
        if (articleTitle.value.trim() !== "" && draft.id !== currentDraftId.value) {
          const shouldSave = confirm(
            "Möchten Sie Ihre aktuellen Änderungen speichern, bevor Sie einen anderen Entwurf laden?"
          );
          if (shouldSave) {
            saveAsDraft();
          }
        }

        // Entwurfsdaten in den Editor laden
        articleTitle.value = draft.title;
        articleDescription.value = draft.description;
        coverImage.value = draft.coverImage;

        // Kapitel laden (ohne Quiz)
        chapters.value = normalizeChapters(draft.chapters);

        // Globales Quiz laden, falls vorhanden
        if (draft.quiz) {
          articleQuiz.value = draft.quiz;
        } else {
          articleQuiz.value = { questions: [] };
        }

        currentDraftId.value = draft.id;

        // Auch im localStorage speichern
        saveToLocalStorage();

        showNotification("Entwurf wurde geladen", "success");
      } catch (error) {
        console.error("Fehler beim Laden des Entwurfs:", error);
        showNotification("Fehler beim Laden des Entwurfs", "error");
      }
    };

    // Entwurf bearbeiten (gleich wie loadDraft, aber mit expliziterem Namen für die UI)
    const editDraft = (draft: Draft) => {
      loadDraft(draft);
    };

    // Entwurf löschen
    const deleteDraft = async (draftId: string) => {
      try {
        const confirmed = confirm("Sind Sie sicher, dass Sie diesen Entwurf löschen möchten?");
        if (!confirmed) return;

        // Falls der aktuell geladene Entwurf gelöscht wird, Formular zurücksetzen
        if (draftId === currentDraftId.value) {
          resetForm();
          // Auch lokalen Speicher löschen
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }

        // Entwurf vom Service löschen
        await authorService.deleteDraft(draftId);

        // Entwurf aus der lokalen Liste entfernen
        drafts.value = drafts.value.filter((d) => d.id !== draftId);

        showNotification("Entwurf wurde gelöscht", "success");
      } catch (error) {
        console.error("Fehler beim Löschen des Entwurfs:", error);
        showNotification("Fehler beim Löschen des Entwurfs", "error");
      }
    };

    // Veröffentlichten Artikel anzeigen
    const viewArticle = (articleId: string) => {
      router.push(`/articles/${articleId}`);
    };

    // Veröffentlichten Artikel bearbeiten
    const editPublishedArticle = async (article: PublishedArticle) => {
      try {
        // Bestätigung einholen
        const confirmed = confirm(`Möchten Sie "${article.title}" bearbeiten?`);
        if (!confirmed) return;

        // Aktuellen Inhalt erst speichern, wenn vorhanden
        if (articleTitle.value.trim() !== "") {
          const shouldSave = confirm(
            "Möchten Sie Ihre aktuellen Änderungen speichern, bevor Sie einen Artikel bearbeiten?"
          );
          if (shouldSave) {
            saveAsDraft();
          }
        }

        // Artikel in den Editor laden
        articleTitle.value = article.title;
        articleDescription.value = article.description;
        coverImage.value = article.coverImage;

        // Kapitel laden
        chapters.value = normalizeChapters(article.chapters);

        // Globales Quiz laden, falls vorhanden
        if (article.quiz) {
          articleQuiz.value = article.quiz;
        } else {
          articleQuiz.value = { questions: [] };
        }

        // Temporäre ID erstellen, damit wir wissen, dass es sich um einen bearbeiteten veröffentlichten Artikel handelt
        currentDraftId.value = `edit_${article.id}`;

        // Auch im localStorage speichern
        saveToLocalStorage();

        showNotification("Artikel wurde zum Bearbeiten geladen", "success");
      } catch (error) {
        console.error("Fehler beim Laden des Artikels zum Bearbeiten:", error);
        showNotification("Fehler beim Laden des Artikels", "error");
      }
    };

    // Veröffentlichten Artikel löschen
    const deletePublishedArticle = async (articleId: string) => {
      try {
        const confirmed = confirm(
          "Sind Sie sicher, dass Sie diesen Artikel löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
        );
        if (!confirmed) return;

        // Artikel vom Service löschen
        await authorService.deletePublishedArticle(articleId);

        // Artikel aus der lokalen Liste entfernen
        publishedArticles.value = publishedArticles.value.filter((a) => a.id !== articleId);

        showNotification("Artikel wurde erfolgreich gelöscht", "success");
      } catch (error) {
        console.error("Fehler beim Löschen des Artikels:", error);
        showNotification("Fehler beim Löschen des Artikels", "error");
      }
    };

    // Entwürfe aktualisieren
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

    // Veröffentlichte Artikel aktualisieren
    const refreshPublishedArticles = async () => {
      try {
        isLoadingPublished.value = true;
        const result = await authorService.getAuthorPublishedArticles();
        publishedArticles.value = result.articles || [];
      } catch (error) {
        console.error("Fehler beim Laden der veröffentlichten Artikel:", error);
        showNotification("Artikel konnten nicht geladen werden", "error");
      } finally {
        isLoadingPublished.value = false;
      }
    };

    // Formular zurücksetzen
    const resetForm = () => {
      articleTitle.value = "";
      articleDescription.value = "";
      coverImage.value = "";
      chapters.value = [];
      articleQuiz.value = { questions: [] };
      showQuiz.value = false;
      currentDraftId.value = "";
    };

    // Auto-Save Intervalle starten
    const startAutoSaveInterval = () => {
      // Auto-Save alle 30 Sekunden im localStorage
      const autoSaveInterval = setInterval(() => {
        if (articleTitle.value.trim() !== "" || chapters.value.length > 0) {
          saveToLocalStorage();
        }
      }, 30000);

      // Reguläres API-Backup alle 5 Minuten, wenn Titel vorhanden ist
      const apiBackupInterval = setInterval(() => {
        if (articleTitle.value.trim() !== "") {
          saveAsDraft();
        }
      }, 300000);

      // Beide Intervalle zurückgeben, um sie später zu löschen
      return { autoSaveInterval, apiBackupInterval };
    };

    // erstellen der form:
    const createForm = () => {
      const formData = new FormData();
      console.log("debuggin for create form");
      formData.append("title", articleTitle.value);
      console.log("title", articleTitle.value);
      formData.append("quickDescription", articleDescription.value);
      console.log("description", articleDescription.value);

      // Prüfe, ob coverImage ein base64-String ist
      if (coverImage && typeof coverImage.value === "string" && coverImage.value.startsWith("data:image")) {
        const byteString = atob(coverImage.value.split(",")[1]);
        const mimeString = coverImage.value.split(",")[0].split(":")[1].split(";")[0];

        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }

        const blob = new Blob([ab], { type: mimeString });
        const filename = "cover-image." + mimeString.split("/")[1]; // z.B. "cover-image.webp"
        const file = new File([blob], filename, { type: mimeString });

        formData.append("image", file);
      }

      console.log("coverImage", coverImage.value);

      const chaptersData = chapters.value.map(({ title, content }, index) => ({
        title,
        content,
        index,
      }));
      formData.append("chapters", JSON.stringify(chaptersData));
      console.log("chapters", chaptersData);

      chapters.value.forEach((chapter, index) => {
        if (chapter.chapterImage) {
          formData.append(`chapterImage_${index}`, chapter.chapterImage);
        }
      });

      formData.append("quiz", JSON.stringify(articleQuiz.value));
      console.log("quiz", articleQuiz.value);
      console.log(formData.get("chapters"));
      return formData;
    };

    // Speicher- und Veröffentlichungsfunktionen
    const saveAsDraft = async () => {
      try {
        isSaving.value = true;
        savingType.value = "draft";

        // Lokale Speicherung durchführen
        saveToLocalStorage();

        // Prüfen, ob mindestens ein Kapitel existiert
        if (chapters.value.length === 0) {
          addNewChapter();
        }

        // Quiz-Status aus dem Kapitel-Model entfernen vor dem Speichern
        const chaptersToSave = chapters.value.map((chapter) => ({
          title: chapter.title,
          content: chapter.content,
          chapterImage: chapter.chapterImage,
        }));

        // Artikel-Daten zusammenstellen
        const articleData = {
          id: currentDraftId.value || undefined,
          title: articleTitle.value,
          description: articleDescription.value,
          coverImage: coverImage.value,
          chapters: chaptersToSave,
          quiz: articleQuiz.value, // Globales Quiz für den Artikel
          status: "draft",
          lastUpdated: new Date().toISOString(),
        };

        // Speichern mit dem AuthorService
        const result = await authorService.saveArticleDraft(articleData);

        if (result.success) {
          // ID des gespeicherten Entwurfs setzen
          if (result.draftId) {
            currentDraftId.value = result.draftId;
          }

          showNotification("Artikel erfolgreich als Entwurf gespeichert", "success");

          // Entwürfe aktualisieren
          refreshDrafts();
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

    const publishArticle = async () => {
      // Validierung vor Veröffentlichung
      if (!isFormValid.value) {
        showNotification("Bitte füllen Sie alle erforderlichen Felder aus.", "error");
        return;
      }

      try {
        isSaving.value = true;
        savingType.value = "publish";

        // Prüfen, ob es sich um einen bearbeiteten veröffentlichten Artikel handelt
        const isEditingPublishedArticle = currentDraftId.value?.startsWith("edit_");
        const originalArticleId = isEditingPublishedArticle ? currentDraftId.value.replace("edit_", "") : undefined;

        // Quiz-Status aus dem Kapitel-Model entfernen vor dem Speichern
        const chaptersToSave = chapters.value.map((chapter) => ({
          title: chapter.title,
          content: chapter.content,
          chapterImage: chapter.chapterImage,
        }));

        // Artikel-Daten zusammenstellen
        const articleData = {
          id: originalArticleId || currentDraftId.value || undefined,
          title: articleTitle.value,
          description: articleDescription.value,
          coverImage: coverImage.value,
          chapters: chaptersToSave,
          quiz: articleQuiz.value, // Globales Quiz für den Artikel
          status: "published",
          publishDate: new Date().toISOString(),
        };

        // Veröffentlichen mit dem AuthorService
        const result = await authorService.publishArticle(createForm());

        if (result.success) {
          showNotification("Artikel erfolgreich veröffentlicht", "success");

          // Den Entwurf aus der lokalen Liste entfernen (ohne ihn auf dem Server zu löschen)
          if (currentDraftId.value && !isEditingPublishedArticle) {
            drafts.value = drafts.value.filter((d) => d.id !== currentDraftId.value);
          }

          // Veröffentlichte Artikel aktualisieren
          refreshPublishedArticles();

          // Formular zurücksetzen
          resetForm();

          // Nach erfolgreicher Veröffentlichung auch localStorage leeren
          localStorage.removeItem(LOCAL_STORAGE_KEY);
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

    // Initialisieren
    onMounted(async () => {
      // Prüfen, ob Benutzer ein Autor ist
      if (!authorService.isAuthor()) {
        router.push("/member/dashboard");
        return;
      }

      // Zuerst versuchen, aus localStorage zu laden
      loadFromLocalStorage();

      // Entwürfe und veröffentlichte Artikel laden
      await Promise.all([refreshDrafts(), refreshPublishedArticles()]);

      // Prüfen, ob ein Entwurf in der URL angegeben ist
      const draftId = router.currentRoute.value.query.draftId as string;
      if (draftId) {
        const draftToLoad = drafts.value.find((d) => d.id === draftId);
        if (draftToLoad) {
          loadDraft(draftToLoad);
        }
      }

      // Auto-Save Intervalle starten
      const { autoSaveInterval, apiBackupInterval } = startAutoSaveInterval();

      // Event-Listener für "beforeunload" hinzufügen, um Änderungen zu speichern,
      // wenn der Benutzer die Seite verlässt
      window.addEventListener("beforeunload", saveToLocalStorage);

      // Intervalle und Event-Listener beim Verlassen der Komponente löschen
      onBeforeUnmount(() => {
        clearInterval(autoSaveInterval);
        clearInterval(apiBackupInterval);
        window.removeEventListener("beforeunload", saveToLocalStorage);
      });
    });

    return {
      articleTitle,
      articleDescription,
      coverImage,
      chapters,
      isSaving,
      savingType,
      notification,
      isFormValid,

      // Globales Quiz
      articleQuiz,
      showQuiz,
      toggleQuiz,
      saveToLocalStorage,

      // Kapitel-Verwaltung
      addNewChapter,
      removeChapter,
      saveChapter,
      isSavingChapter,

      // Artikel-Verwaltung
      saveAsDraft,
      publishArticle,

      // Entwürfe-Seitenleiste
      drafts,
      isLoadingDrafts,
      currentDraftId,
      loadDraft,
      editDraft,
      deleteDraft,
      refreshDrafts,

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

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        border: 1px solid mixins.theme-color($theme, border-medium);
        transition: all 0.4s ease-out;
        transition: all 0.4s ease-out;
      }
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

  .editor-actions {
    display: flex;
    justify-content: flex-end;
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

.sidebar {
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: map.get(vars.$spacing, l);
  position: sticky;
  top: 230px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  margin-bottom: 40px; // Zusätzlicher Abstand am unteren Rand

  @media (max-width: 1200px) {
    width: 100%;
    position: static;
    margin-bottom: map.get(vars.$spacing, xl);
    max-height: none;
  }
}

.icon-size {
  width: 20px;
  height: 20px;
}

.icon-size-sm {
  width: 16px;
  height: 16px;
}

.mr-1 {
  margin-right: map.get(vars.$spacing, xs);
}

.mr-2 {
  margin-right: map.get(vars.$spacing, s);
}

.spinning {
  animation: spin 1s linear infinite;
}

/* Neue Styles für das globale Quiz */
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
      background-color: rgba(76, 175, 80, 0.1); // green background
      color: #4caf50; // green text
      border: 1px solid rgba(76, 175, 80, 0.3); // green border
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
