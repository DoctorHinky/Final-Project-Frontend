<!-- src/components/member/article/ArticleReader.vue -->
<template>
  <div class="article-reader">
    <!-- Custom Alert Modal -->
    <div v-if="showAlert" class="alert-overlay" @click="closeAlert">
      <div class="alert-modal" @click.stop>
        <div class="alert-header">
          <div class="alert-icon" :class="alertType">
            <ExclamationTriangleIcon v-if="alertType === 'error'" class="h-6 w-6 commentIcon" />
            <CheckCircleIcon v-else-if="alertType === 'success'" class="h-6 w-6" />
            <InformationCircleIcon v-else class="h-6 w-6" />
          </div>
          <h3>{{ alertTitle }}</h3>
        </div>
        <div class="alert-content">
          <p>{{ alertMessage }}</p>
        </div>
        <div class="alert-actions">
          <button @click="closeAlert" class="alert-button primary">OK</button>
        </div>
      </div>
    </div>

    <!-- Navigationsleiste -->
    <div class="reader-navbar">
      <div class="navbar-left">
        <button class="back-button" @click="$emit('close')">
          <ArrowLeftIcon class="h-5 w-5" />
          Zurück
        </button>
      </div>
      <div class="navbar-right">
        <button class="action-button share" @click="shareArticle" title="Artikel teilen">
          <ArrowTopRightOnSquareIcon class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Loading State für Artikel -->
    <div v-if="loadingArticle" class="loading-article">
      <div class="loading-spinner"></div>
      <p>Artikel wird geladen...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="articleError" class="error-state">
      <div class="error-icon">
        <ExclamationTriangleIcon class="h-16 w-16" />
      </div>
      <h3>Fehler beim Laden</h3>
      <p>{{ articleError }}</p>
      <button @click="loadFullArticle" class="retry-button">Erneut versuchen</button>
    </div>

    <!-- Artikel-Inhalt -->
    <div v-else-if="fullArticle" class="article-content">
      <!-- Artikel-Ansicht (ausgeblendet wenn Quiz aktiv) -->
      <div v-if="!showQuiz" class="article-view">
        <!-- Hero-Bild -->
        <div v-if="fullArticle.image" class="article-hero-image">
          <img :src="fullArticle.image" :alt="fullArticle.title" />
          <div class="image-overlay"></div>
        </div>

        <!-- Artikel-Header mit optimaler Breite -->
        <div class="article-header-container">
          <div class="article-header">
            <div class="article-category">{{ fullArticle.category }}</div>
            <h1>{{ fullArticle.title }}</h1>
            <div class="article-meta">
              <span class="article-author">
                <UserIcon class="h-4 w-4" />
                Von {{ fullArticle.author?.username || 'Unbekannt' }}
              </span>
              <span class="article-date">
                <CalendarDaysIcon class="h-4 w-4" />
                {{ formatDate(fullArticle.createdAt) }}
              </span>
            </div>

            <!-- Kapitelnavigation -->
            <div class="chapter-navigation" v-if="fullArticle.chapters && fullArticle.chapters.length > 1">
              <div class="chapter-progress">
                <div class="progress-bar">
                  <div class="progress-fill"
                    :style="{ width: (currentChapter / fullArticle.chapters.length) * 100 + '%' }"></div>
                </div>
              </div>
              <div class="chapter-controls">
                <button class="chapter-button prev" :disabled="currentChapter === 1" @click="prevChapter">
                  <ChevronLeftIcon class="h-4 w-4" />
                  Zurück
                </button>
                <div class="chapter-info">Kapitel {{ currentChapter }} von {{ fullArticle.chapters.length }}</div>
                <button class="chapter-button next" :disabled="currentChapter === fullArticle.chapters.length"
                  @click="nextChapter">
                  Weiter
                  <ChevronRightIcon class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Artikel-Body -->
        <div class="article-body-container">
          <div class="article-body">
            <!-- Aktueller Kapitelinhalt -->
            <div v-if="currentChapterContent" class="chapter-content" ref="chapterContentRef">
              <h2 v-if="currentChapterContent.title" class="chapter-title">
                {{ currentChapterContent.title }}
              </h2>
              <div class="chapter-text" v-html="formatContent(currentChapterContent.content)"></div>

              <!-- Kapitelbild -->
              <div v-if="currentChapterContent.image" class="chapter-image">
                <img :src="currentChapterContent.image" :alt="currentChapterContent.title" />
              </div>
            </div>

            <!-- Fallback wenn kein Kapitelinhalt -->
            <div v-else-if="fullArticle.quickDescription" class="article-description">
              <p>{{ fullArticle.quickDescription }}</p>
            </div>

            <!-- Kapitelende-Anzeige -->
            <div class="chapter-end" v-if="isLastChapter">
              <div class="chapter-end-message">Du hast das Ende des Artikels erreicht!</div>

              <!-- Rating-Sektion -->
              <div class="article-rating">
                <h3>Wie hat dir der Artikel gefallen?</h3>
                <div class="rating-buttons">
                  <button class="rating-button like" :class="{ active: userRating === 1 }" :disabled="loadingRating"
                    @click="likeArticle">
                    <HandThumbUpIcon class="h-5 w-5 iconDislikeLike" />
                    {{ likes }}
                  </button>
                  <button class="rating-button dislike" :class="{ active: userRating === -1 }" :disabled="loadingRating"
                    @click="dislikeArticle">
                    <HandThumbDownIcon class="h-5 w-5 iconDislikeLike" />
                    {{ dislikes }}
                  </button>
                </div>
              </div>

              <button v-if="fullArticle.quiz && fullArticle.quiz.questions && fullArticle.quiz.questions.length > 0"
                class="start-quiz-button" @click="showQuiz = true">
                <AcademicCapIcon class="h-5 w-5" />
                Quiz starten
              </button>
            </div>
          </div>

          <!-- Kommentar-Sektion (nur am Ende des letzten Kapitels) -->
          <div v-if="isLastChapter" class="comments-section">
            <div class="comments-header">
              <h3>
                <ChatBubbleLeftRightIcon class="h-6 w-6" />
                Kommentare
              </h3>
            </div>

            <!-- Neuen Kommentar schreiben -->
            <div class="new-comment">
              <textarea v-model="newComment" placeholder="Schreibe einen Kommentar..." rows="3"
                class="comment-input"></textarea>
              <div class="comment-actions">
                <button @click="submitComment" :disabled="!newComment.trim()" class="submit-comment-button">
                  <PaperAirplaneIcon class="h-4 w-4" />
                  Kommentar senden
                </button>
              </div>
            </div>

            <!-- Kommentare anzeigen -->
            <div v-if="loadingComments" class="loading-comments">
              <div class="loading-spinner"></div>
              <p>Kommentare werden geladen...</p>
            </div>

            <div v-else class="comments-list">
              <div v-for="comment in comments" :key="comment.id" class="comment">
                <div class="comment-header">
                  <span class="comment-author">
                    <UserCircleIcon class="h-5 w-5" />
                    {{ comment.user.username }}
                  </span>
                  <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
                </div>
                <div class="comment-content">{{ comment.content }}</div>
                <div class="comment-actions">
                  <button @click="startReply(comment.id)" class="reply-button" v-if="replyingTo !== comment.id">
                    <ArrowUturnLeftIcon class="h-4 w-4" />
                    Antworten
                  </button>
                </div>

                <!-- Antwort-Eingabe -->
                <div v-if="replyingTo === comment.id" class="reply-input">
                  <textarea v-model="replyContent" placeholder="Antwort schreiben..." rows="2"
                    class="comment-input small"></textarea>
                  <div class="reply-actions">
                    <button @click="submitReply(comment.id)" :disabled="!replyContent.trim()"
                      class="submit-reply-button">
                      <PaperAirplaneIcon class="h-4 w-4" />
                      Antworten
                    </button>
                    <button @click="cancelReply" class="cancel-reply-button">
                      <XMarkIcon class="h-4 w-4" />
                      Abbrechen
                    </button>
                  </div>
                </div>

                <!-- Verschachtelte Antworten -->
                <div v-if="comment.replies && comment.replies.length > 0" class="replies">
                  <div v-for="reply in comment.replies" :key="reply.id" class="reply">
                    <div class="comment-header">
                      <span class="comment-author">
                        <UserCircleIcon class="h-4 w-4" />
                        {{ reply.user.username }}
                      </span>
                      <span class="comment-date">{{ formatDate(reply.createdAt) }}</span>
                    </div>
                    <div class="comment-content">{{ reply.content }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quiz-Bereich (nur wenn Quiz aktiv) -->
      <div v-else class="quiz-section-container">
        <div class="quiz-section">
          <div class="quiz-header">
            <div class="quiz-icon">
              <AcademicCapIcon class="h-12 w-12" />
            </div>
            <h2>Quiz: Teste dein Wissen</h2>
            <p>Beantworte die Fragen zum Artikel, um dein Verständnis zu testen.</p>
          </div>

          <div class="quiz-progress">
            <div class="quiz-progress-bar">
              <div class="progress-fill"
                :style="{ width: (fullArticle && fullArticle.quiz ? ((currentQuestionIndex + 1) / fullArticle.quiz.questions.length) * 100 : 0) + '%' }">
              </div>
            </div>
            <div class="quiz-progress-text">
              Frage {{ currentQuestionIndex + 1 }} von {{ fullArticle && fullArticle.quiz ?
                fullArticle.quiz.questions.length : 0 }}
            </div>
          </div>

          <div class="quiz-content">
            <!-- Aktuelle Frage -->
            <div class="quiz-question" v-if="currentQuestion">
              <h3>{{ currentQuestion.question }}</h3>

              <!-- Hinweis für Multiple-Choice -->
              <div v-if="currentQuestion.answers.filter(a => a.isCorrect).length > 1" class="quiz-hint">
                <LightBulbIcon class="h-5 w-5" />
                Mehrere Antworten können richtig sein
              </div>

              <div class="quiz-options">
                <div v-for="(answer, index) in currentQuestion.answers" :key="answer.id" class="quiz-option"
                  :class="getOptionClasses(index, answer)" @click="selectOption(index)">
                  <div class="option-marker">
                    <CheckIcon v-if="showFeedback && answer.isCorrect" class="h-5 w-5" />
                    <XMarkIcon v-else-if="showFeedback && selectedOptions.has(index) && !answer.isCorrect"
                      class="h-5 w-5" />
                    <span v-else>{{ getOptionLetter(index) }}</span>
                  </div>
                  <div class="option-text">{{ answer.answer }}</div>
                </div>
              </div>
            </div>

            <!-- Feedback nach Auswahl -->
            <div v-if="showFeedback" class="quiz-feedback" :class="isCorrect ? 'correct' : 'incorrect'">
              <div class="feedback-icon">
                <CheckCircleIcon v-if="isCorrect" class="h-8 w-8" />
                <XCircleIcon v-else class="h-8 w-8" />
              </div>
              <div class="feedback-text">
                <h4>{{ isCorrect ? "Richtig!" : "Nicht ganz richtig!" }}</h4>
                <p v-if="!isCorrect">
                  <span v-if="currentQuestion">
                    Richtige Antwort(en):
                    {{currentQuestion.answers
                      .filter(answer => answer.isCorrect)
                      .map(answer => answer.answer)
                      .join(', ')
                    }}
                  </span>
                </p>
              </div>
            </div>

            <!-- Quiz-Steuerung -->
            <div class="quiz-controls">
              <button v-if="!quizCompleted && !showFeedback" class="check-answer-button" :disabled="!hasSelectedOptions"
                @click="checkAnswer">
                <MagnifyingGlassIcon class="h-4 w-4" />
                Antwort prüfen
              </button>

              <button v-if="showFeedback && !quizCompleted && hasNextQuestion" class="next-question-button"
                @click="nextQuestion">
                Nächste Frage
                <ChevronRightIcon class="h-4 w-4" />
              </button>

              <button v-if="showFeedback && !quizCompleted && !hasNextQuestion" class="finish-quiz-button"
                @click="finishQuiz">
                <FlagIcon class="h-4 w-4" />
                Quiz abschließen
              </button>

              <button v-if="quizCompleted" class="restart-button" @click="restartQuiz">
                <ArrowPathIcon class="h-4 w-4" />
                Quiz neu starten
              </button>

              <button v-if="quizCompleted" class="back-to-article-button" @click="backToArticle">
                <ArrowLeftIcon class="h-4 w-4" />
                Zurück zum Artikel
              </button>
            </div>

            <!-- Quiz-Ergebnis -->
            <div v-if="quizCompleted" class="quiz-result">
              <div class="result-icon">
                <TrophyIcon class="h-16 w-16" />
              </div>
              <h3>Dein Ergebnis</h3>
              <div class="result-score">
                {{ correctAnswers }} von {{ fullArticle && fullArticle.quiz ? fullArticle.quiz.questions.length : 0 }}
                Fragen richtig
              </div>
              <div class="result-percentage">
                {{
                  fullArticle && fullArticle.quiz
                    ? Math.round((correctAnswers / fullArticle.quiz.questions.length) * 100)
                    : 0
                }}%
              </div>

              <div class="result-message">
                <div v-if="fullArticle && fullArticle.quiz && correctAnswers === fullArticle.quiz.questions.length">
                  Perfekt! Du hast alle Fragen richtig beantwortet.
                </div>
                <div
                  v-else-if="fullArticle && fullArticle.quiz && (correctAnswers / fullArticle.quiz.questions.length) >= 0.7">
                  Gut gemacht! Du hast die meisten Fragen richtig beantwortet.
                </div>
                <div v-else>Du kannst den Artikel noch einmal lesen, um dein Verständnis zu verbessern.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch, type PropType } from "vue";
import { historyService } from "@/services/history.service";
import axiosInstance from "@/services/axiosInstance";
import type { MyArticleItem } from "@/types/MyArticles.types";

// Hero Icons imports
import {
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  UserIcon,
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  UserCircleIcon,
  ArrowUturnLeftIcon,
  XMarkIcon,
  LightBulbIcon,
  CheckIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FlagIcon,
  ArrowPathIcon,
  TrophyIcon
} from '@heroicons/vue/24/outline';

// Backend-Typen für vollständigen Artikel
interface Chapter {
  id: string;
  title: string;
  content: string;
  image?: string;
}

interface QuizAnswer {
  id: string;
  answer: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  answers: QuizAnswer[];
}

interface Quiz {
  id: string;
  questions: QuizQuestion[];
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  parentId: string | null;
  user: {
    username: string;
  };
  replies?: Comment[];
}

interface FullArticle {
  id: string;
  title: string;
  quickDescription: string;
  image?: string;
  category: string;
  createdAt: string;
  author?: {
    username: string;
  };
  chapters: Chapter[];
  quiz?: Quiz;
}

export default defineComponent({
  name: "ArticleReader",
  components: {
    ArrowLeftIcon,
    ArrowTopRightOnSquareIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    UserIcon,
    CalendarDaysIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    HandThumbUpIcon,
    HandThumbDownIcon,
    AcademicCapIcon,
    ChatBubbleLeftRightIcon,
    PaperAirplaneIcon,
    UserCircleIcon,
    ArrowUturnLeftIcon,
    XMarkIcon,
    LightBulbIcon,
    CheckIcon,
    XCircleIcon,
    MagnifyingGlassIcon,
    FlagIcon,
    ArrowPathIcon,
    TrophyIcon
  },
  props: {
    article: {
      type: Object as PropType<MyArticleItem>,
      required: true,
    },
  },
  emits: ["close"],
  setup(props, { emit }) {
    // Reactive State
    const loadingArticle = ref(false);
    const articleError = ref<string | null>(null);
    const fullArticle = ref<FullArticle | null>(null);

    // Alert System
    const showAlert = ref(false);
    const alertType = ref<'success' | 'error' | 'info'>('info');
    const alertTitle = ref('');
    const alertMessage = ref('');

    // Kapitel-Verwaltung
    const currentChapter = ref(1);
    const chapterContentRef = ref<HTMLElement | null>(null);

    // Quiz-Verwaltung
    const showQuiz = ref(false);
    const currentQuestionIndex = ref(0);
    const selectedOptions = ref<Set<number>>(new Set()); // Mehrere Auswahlmöglichkeiten
    const showFeedback = ref(false);
    const isCorrect = ref(false);
    const quizCompleted = ref(false);
    const correctAnswers = ref(0);

    // Kommentar-Verwaltung
    const comments = ref<Comment[]>([]);
    const loadingComments = ref(false);
    const newComment = ref('');
    const replyingTo = ref<string | null>(null);
    const replyContent = ref('');
    const commentsPage = ref(1);
    const totalComments = ref(0);

    // Rating-Verwaltung
    const userRating = ref<number | null>(null); // 1 für Like, -1 für Dislike, null für keine Bewertung
    const likes = ref(0);
    const dislikes = ref(0);
    const loadingRating = ref(false);

    // Alert Functions
    const showAlertMessage = (type: 'success' | 'error' | 'info', title: string, message: string) => {
      alertType.value = type;
      alertTitle.value = title;
      alertMessage.value = message;
      showAlert.value = true;
    };

    const closeAlert = () => {
      showAlert.value = false;
    };

    // Computed Properties
    const currentChapterContent = computed(() => {
      if (!fullArticle.value?.chapters || fullArticle.value.chapters.length === 0) {
        return null;
      }
      return fullArticle.value.chapters[currentChapter.value - 1] || null;
    });

    const isLastChapter = computed(() => {
      if (!fullArticle.value?.chapters) return true;
      return currentChapter.value === fullArticle.value.chapters.length;
    });

    const currentQuestion = computed(() => {
      if (!fullArticle.value?.quiz?.questions || fullArticle.value.quiz.questions.length === 0) {
        return null;
      }
      return fullArticle.value.quiz.questions[currentQuestionIndex.value] || null;
    });

    const hasNextQuestion = computed(() => {
      if (!fullArticle.value?.quiz?.questions) return false;
      return currentQuestionIndex.value < fullArticle.value.quiz.questions.length - 1;
    });

    // Helper für Quiz-Option-Klassen
    const getOptionClasses = (index: number, answer: any) => {
      return {
        selected: selectedOptions.value.has(index),
        correct: showFeedback.value && answer.isCorrect,
        incorrect: showFeedback.value && selectedOptions.value.has(index) && !answer.isCorrect,
        'not-selected-correct': showFeedback.value && !selectedOptions.value.has(index) && answer.isCorrect
      };
    };

    // Helper für Option-Letters
    const getOptionLetter = (index: number) => {
      return ["A", "B", "C", "D"][index];
    };

    // Helper für Quiz-Status
    const hasSelectedOptions = computed(() => selectedOptions.value.size > 0);

    // Helper: Vollständigen Artikel laden
    const loadFullArticle = async () => {
      if (!props.article?.id) return;

      loadingArticle.value = true;
      articleError.value = null;

      try {
        const response = await axiosInstance.get(`/article/getPostById/${props.article.id}`);
        fullArticle.value = response.data.data;

        // Artikel als gelesen markieren (falls noch nicht geschehen)
        await markAsRead();

      } catch (error) {
        console.error('Error loading full article:', error);
        articleError.value = 'Fehler beim Laden des vollständigen Artikels';
      } finally {
        loadingArticle.value = false;
      }
    };

    // Helper: Artikel als gelesen markieren
    const markAsRead = async () => {
      if (!props.article?.id) return;

      try {
        await historyService.markAsRead(props.article.id);
      } catch (error) {
        // Fehler beim Markieren als gelesen ignorieren (nicht kritisch)
        console.warn('Could not mark article as read:', error);
      }
    };

    // Helper: Inhalt formatieren
    const formatContent = (content: string): string => {
      if (!content) return '';

      // Einfache Formatierung für Absätze
      return content
        .split('\n\n')
        .map(paragraph => paragraph.trim())
        .filter(paragraph => paragraph.length > 0)
        .map(paragraph => `<p>${paragraph}</p>`)
        .join('');
    };

    // Helper: Datum formatieren
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    // Kapitel-Navigation
    const nextChapter = () => {
      if (fullArticle.value?.chapters && currentChapter.value < fullArticle.value.chapters.length) {
        currentChapter.value++;
        scrollToChapter();
      }
    };

    const prevChapter = () => {
      if (currentChapter.value > 1) {
        currentChapter.value--;
        scrollToChapter();
      }
    };

    const scrollToChapter = () => {
      setTimeout(() => {
        if (chapterContentRef.value) {
          chapterContentRef.value.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      }, 100);
    };

    // Quiz-Funktionen
    const selectOption = (index: number) => {
      if (!showFeedback.value && !quizCompleted.value) {
        const newSelectedOptions = new Set(selectedOptions.value);
        if (newSelectedOptions.has(index)) {
          newSelectedOptions.delete(index);
        } else {
          newSelectedOptions.add(index);
        }
        selectedOptions.value = newSelectedOptions;
      }
    };

    const checkAnswer = () => {
      if (selectedOptions.value.size === 0 || !currentQuestion.value) return;

      // Alle richtigen Antworten finden
      const correctAnswerIndices = currentQuestion.value.answers
        .map((answer, index) => answer.isCorrect ? index : -1)
        .filter(index => index !== -1);

      // Prüfen ob alle richtigen Antworten ausgewählt und keine falschen ausgewählt wurden
      const selectedArray = Array.from(selectedOptions.value);
      const allCorrectSelected = correctAnswerIndices.every(index => selectedOptions.value.has(index));
      const noIncorrectSelected = selectedArray.every(index =>
        currentQuestion.value?.answers[index]?.isCorrect || false
      );

      isCorrect.value = allCorrectSelected && noIncorrectSelected && selectedArray.length === correctAnswerIndices.length;

      if (isCorrect.value) {
        correctAnswers.value++;
      }

      showFeedback.value = true;
    };

    const nextQuestion = () => {
      if (!hasNextQuestion.value) return;

      currentQuestionIndex.value++;
      selectedOptions.value = new Set();
      showFeedback.value = false;
    };

    const finishQuiz = async () => {
      quizCompleted.value = true;

      // Quiz-Ergebnis an Backend senden (falls implementiert)
      try {
        const score = Math.round((correctAnswers.value / (fullArticle.value?.quiz?.questions.length || 1)) * 100);
        console.log('Quiz completed with score:', score);
      } catch (error) {
        console.warn('Could not save quiz result:', error);
      }
    };

    const restartQuiz = () => {
      currentQuestionIndex.value = 0;
      selectedOptions.value = new Set();
      showFeedback.value = false;
      quizCompleted.value = false;
      correctAnswers.value = 0;
    };

    const backToArticle = () => {
      showQuiz.value = false;
    };

    // Artikel teilen
    const shareArticle = () => {
      if (!fullArticle.value) return;

      if (navigator.share) {
        navigator.share({
          title: fullArticle.value.title,
          text: fullArticle.value.quickDescription,
          url: window.location.href,
        }).catch(console.error);
      } else {
        // Fallback: URL in Zwischenablage kopieren
        navigator.clipboard.writeText(window.location.href).then(() => {
          showAlertMessage('success', 'Erfolgreich', 'Link wurde in die Zwischenablage kopiert!');
        }).catch(() => {
          showAlertMessage('error', 'Fehler', 'Teilen wird von diesem Browser nicht unterstützt.');
        });
      }
    };

    // Kommentar-Funktionen
    const loadComments = async () => {
      if (!props.article?.id) return;

      loadingComments.value = true;
      try {
        const response = await axiosInstance.get(`/comment/getAllComments/${props.article.id}?page=${commentsPage.value}&limit=10`);
        comments.value = response.data.comments;
        totalComments.value = response.data.meta.total;
      } catch (error) {
        console.error('Error loading comments:', error);
      } finally {
        loadingComments.value = false;
      }
    };

    const submitComment = async () => {
      if (!newComment.value.trim() || !props.article?.id) return;

      try {
        await axiosInstance.post(`/comment/commentOnPost/${props.article.id}`, {
          content: newComment.value
        });
        newComment.value = '';
        await loadComments(); // Kommentare neu laden
        showAlertMessage('success', 'Erfolgreich', 'Kommentar wurde gesendet!');
      } catch (error) {
        console.error('Error submitting comment:', error);
        showAlertMessage('error', 'Fehler', 'Fehler beim Senden des Kommentars');
      }
    };

    const submitReply = async (commentId: string) => {
      if (!replyContent.value.trim()) return;

      try {
        await axiosInstance.post(`/comment/answerComment/${commentId}`, {
          content: replyContent.value
        });
        replyContent.value = '';
        replyingTo.value = null;
        await loadComments(); // Kommentare neu laden
        showAlertMessage('success', 'Erfolgreich', 'Antwort wurde gesendet!');
      } catch (error) {
        console.error('Error submitting reply:', error);
        showAlertMessage('error', 'Fehler', 'Fehler beim Senden der Antwort');
      }
    };

    const startReply = (commentId: string) => {
      replyingTo.value = commentId;
      replyContent.value = '';
    };

    const cancelReply = () => {
      replyingTo.value = null;
      replyContent.value = '';
    };

    // Rating-Funktionen
    const loadRating = async () => {
      if (!props.article?.id) return;

      try {
        const response = await axiosInstance.get(`/rating/getRating/${props.article.id}`);
        likes.value = response.data.likes;
        dislikes.value = response.data.dislikes;
      } catch (error) {
        console.error('Error loading rating:', error);
      }
    };

    const likeArticle = async () => {
      if (!props.article?.id || loadingRating.value) return;

      loadingRating.value = true;
      try {
        await axiosInstance.post(`/rating/like/${props.article.id}`);
        userRating.value = userRating.value === 1 ? null : 1; // Toggle like
        await loadRating(); // Rating neu laden
      } catch (error) {
        console.error('Error liking article:', error);
        showAlertMessage('error', 'Fehler', 'Fehler beim Bewerten des Artikels');
      } finally {
        loadingRating.value = false;
      }
    };

    const dislikeArticle = async () => {
      if (!props.article?.id || loadingRating.value) return;

      loadingRating.value = true;
      try {
        await axiosInstance.post(`/rating/dislike/${props.article.id}`);
        userRating.value = userRating.value === -1 ? null : -1; // Toggle dislike
        await loadRating(); // Rating neu laden
      } catch (error) {
        console.error('Error disliking article:', error);
        showAlertMessage('error', 'Fehler', 'Fehler beim Bewerten des Artikels');
      } finally {
        loadingRating.value = false;
      }
    };

    // Beim Mounten Artikel laden
    onMounted(() => {
      loadFullArticle();
      loadComments();
      loadRating();
    });

    // Bei Artikel-Wechsel neu laden
    watch(() => props.article?.id, (newId) => {
      if (newId) {
        // Quiz-State zurücksetzen
        showQuiz.value = false;
        currentChapter.value = 1;
        restartQuiz();
        // Kommentare und Rating zurücksetzen
        comments.value = [];
        commentsPage.value = 1;
        userRating.value = null;
        likes.value = 0;
        dislikes.value = 0;
        // Artikel neu laden
        loadFullArticle();
        loadComments();
        loadRating();
      }
    });

    return {
      // State
      loadingArticle,
      articleError,
      fullArticle,
      currentChapter,
      currentChapterContent,
      isLastChapter,
      chapterContentRef,

      // Alert System
      showAlert,
      alertType,
      alertTitle,
      alertMessage,
      showAlertMessage,
      closeAlert,

      // Quiz
      showQuiz,
      currentQuestionIndex,
      currentQuestion,
      selectedOptions,
      showFeedback,
      isCorrect,
      quizCompleted,
      correctAnswers,
      hasNextQuestion,
      hasSelectedOptions,
      getOptionClasses,
      getOptionLetter,

      // Kommentare
      comments,
      loadingComments,
      newComment,
      replyingTo,
       // Rating
      userRating,
      likes,
      dislikes,
      loadingRating,

      // Functions
      loadFullArticle,
      formatContent,
      formatDate,
      nextChapter,
      prevChapter,
      scrollToChapter,
      selectOption,
      checkAnswer,
      nextQuestion,
      finishQuiz,
      restartQuiz,
      backToArticle,
      shareArticle,

      // Kommentar-Funktionen
      loadComments,
      submitComment,
      submitReply,
      startReply,
      cancelReply,

      // Rating-Funktionen
      likeArticle,
      dislikeArticle,replyContent,
      totalComments,

     
    };
  },
});
</script>

<style lang="scss" scoped>
// Verbesserter ArticleReader Style - Optimiert für bessere UX
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;
@use "@/style/base/animations" as animations;

.article-reader {
  @include animations.fade-in(0.4s);
  min-height: 100vh;
  position: relative;
  overflow: hidden;


  // Sanfter Hintergrund-Gradient
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
    opacity: 0.03;
    background: radial-gradient(circle at 20% 30%, #4AD295 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, #35CCD0 0%, transparent 50%);
  }

  .iconDislikeLike {
    width: 20px;
  }

  // ===== CUSTOM ALERT MODAL =====
  .alert-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    animation: fadeIn 0.3s ease;

    .alert-modal {
      max-width: 400px;
      width: 100%;
      border-radius: 24px;
      overflow: hidden;
      animation: slideUp 0.3s ease;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      position: absolute;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: mixins.theme-color($theme, card-bg);
          border: 1px solid rgba(mixins.theme-color($theme, border-light), 0.6);
        }
      }

      .alert-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 2rem 2rem 1rem 2rem;

        .alert-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 50%;

          &.success {
            background: rgba(74, 210, 149, 0.2);
            color: #4AD295;
          }

          &.error {
            background: rgba(255, 107, 107, 0.2);
            color: #ff6b6b;
          }

          &.info {
            background: rgba(53, 204, 208, 0.2);
            color: #35CCD0;
          }
        }

        h3 {
          font-size: 1.3rem;
          font-weight: 700;
          margin: 0;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }
      }

      .alert-content {
        padding: 0 2rem 1.5rem 2rem;

        p {
          font-size: 1rem;
          line-height: 1.6;
          margin: 0;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }
      }

      .alert-actions {
        padding: 0 2rem 2rem 2rem;
        display: flex;
        justify-content: flex-end;

        .alert-button {
          padding: 0.8rem 2rem;
          border-radius: 50px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;

          &.primary {
            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                background: mixins.theme-gradient($theme, primary);
                color: white;
                box-shadow: 0 6px 20px rgba(mixins.theme-color($theme, accent-green), 0.3);

                &:hover {
                  transform: translateY(-2px) scale(1.02);
                  box-shadow: 0 10px 30px rgba(mixins.theme-color($theme, accent-green), 0.4);
                }
              }
            }
          }
        }
      }
    }
  }

  .comment-input.small {
    font-size: 0.8rem;
    color: map.get(vars.$colors, text-secondary);
    margin-top: 0.5rem;
    width: 100%;
    padding: 0.5rem 1rem;
    height: 100px;
    resize: none;
    border-radius: 20px;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background: mixins.theme-color($theme, card-bg);
        border: 1px solid rgba(mixins.theme-color($theme, border-light), 0.6);
        color: mixins.theme-color($theme, text-secondary);
      }
    }

    .comment-input.small {
      width: 100%;
      padding: 1.2rem 1.5rem;
      border-radius: 16px;
      border: none;
      resize: vertical;
      font-family: inherit;
      font-size: 1.05rem;
      line-height: 1.6;
      transition: all 0.3s ease;
      position: relative;
      z-index: 1;
    }
  }

  // ===== NAVIGATIONSLEISTE =====
  .reader-navbar {
    position: sticky;
    top: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.2rem 2.5rem;
    margin-bottom: 2rem;
    z-index: 100;
    max-width: 1400px;
    margin-left: auto;
    margin-right: auto;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 0 0 24px 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    margin-top: 2rem;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background: linear-gradient(135deg,
            rgba(mixins.theme-color($theme, card-bg), 0.95) 0%,
            rgba(mixins.theme-color($theme, secondary-bg), 0.9) 100%);
        border: 1px solid rgba(mixins.theme-color($theme, border-light), 0.6);
      }
    }

    @media (max-width: 768px) {
      padding: 1rem 1.5rem;
      margin-bottom: 1.5rem;
    }

    .navbar-left,
    .navbar-right {
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, m);
    }

    .back-button {
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, xs);
      padding: 0.75rem 1.5rem;
      border-radius: 50px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      border: none;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s ease;
      }

      &:hover::before {
        left: 100%;
      }

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: linear-gradient(135deg,
              mixins.theme-color($theme, secondary-bg) 0%,
              mixins.theme-color($theme, hover-color) 100%);
          color: mixins.theme-color($theme, text-primary);
          border: 1px solid rgba(mixins.theme-color($theme, border-medium), 0.4);

          &:hover {
            transform: translateX(-5px) scale(1.02);
            box-shadow: 0 6px 20px rgba(mixins.theme-color($theme, accent-green), 0.3);
            border-color: mixins.theme-color($theme, accent-green);
          }
        }
      }
    }

    .action-button {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;

      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
        transition: transform 0.3s ease;
      }

      &:hover::after {
        transform: translate(-50%, -50%) scale(1.5);
      }

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: linear-gradient(135deg,
              mixins.theme-color($theme, secondary-bg) 0%,
              mixins.theme-color($theme, hover-color) 100%);
          color: mixins.theme-color($theme, text-secondary);
          border: 1px solid rgba(mixins.theme-color($theme, border-light), 0.6);

          &:hover {
            transform: translateY(-3px) rotate(5deg);
            box-shadow: 0 8px 25px rgba(mixins.theme-color($theme, accent-teal), 0.4);
            color: mixins.theme-color($theme, accent-teal);
          }
        }
      }
    }
  }

  // ===== LOADING & ERROR STATES =====
  .loading-article,
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    text-align: center;
    padding: map.get(vars.$spacing, xxl);

    .loading-spinner {
      width: 60px;
      height: 60px;
      border: 4px solid transparent;
      border-radius: 50%;
      margin-bottom: map.get(vars.$spacing, l);
      position: relative;

      &::before {
        content: '';
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        border-radius: 50%;
        border: 4px solid transparent;
        animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
      }

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          border-top-color: mixins.theme-color($theme, accent-green);
          border-right-color: mixins.theme-color($theme, accent-teal);

          &::before {
            border-bottom-color: mixins.theme-color($theme, accent-lime);
            border-left-color: mixins.theme-color($theme, accent-yellow);
          }
        }
      }
    }

    p {
      font-size: 1.1rem;
      font-weight: 500;
      opacity: 0.8;
      animation: pulse 2s ease-in-out infinite;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  .error-state {
    .error-icon {
      margin-bottom: map.get(vars.$spacing, l);
      animation: bounce 2s ease-in-out infinite;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: #ff6b6b;
        }
      }
    }

    .retry-button {
      padding: 1rem 2rem;
      border-radius: 50px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: map.get(vars.$spacing, l);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, primary);
          color: white;
          box-shadow: 0 6px 20px rgba(mixins.theme-color($theme, accent-green), 0.3);

          &:hover {
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 12px 30px rgba(mixins.theme-color($theme, accent-green), 0.4);
          }
        }
      }
    }
  }

  // ===== ARTIKEL INHALT =====
  .article-content {
    margin-bottom: 300px;
    min-height: 100vh;

    // Hero-Bild mit verbessertem Overlay
    .article-hero-image {
      margin: 0 0 3rem 0;
      position: relative;
      height: 60vh;
      min-height: 400px;
      max-height: 600px;
      overflow: hidden;
      border-radius: 32px;
      max-width: 1400px;
      margin-left: auto;
      margin-right: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);

      @media (max-width: 768px) {
        height: 40vh;
        min-height: 250px;
        margin: 0 1rem 2rem 1rem;
        border-radius: 24px;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      .image-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to bottom,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.1) 50%,
            rgba(0, 0, 0, 0.7) 100%);
      }

      &:hover img {
        transform: scale(1.02);
      }
    }

    // Header Container mit verbesserter Typographie
    .article-header-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 2rem;

      @media (max-width: 768px) {
        padding: 0 1.5rem;
      }

      @media (max-width: 480px) {
        padding: 0 1rem;
      }
    }

    .article-header {
      margin-bottom: 3rem;

      .article-category {
        display: inline-flex;
        align-items: center;
        padding: 0.6rem 1.5rem;
        margin-bottom: 1.5rem;
        border-radius: 50px;
        font-size: 0.9rem;
        font-weight: 700;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        position: relative;
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s ease;
        }

        &:hover::before {
          left: 100%;
        }

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: mixins.theme-gradient($theme, primary);
            color: white;
            box-shadow: 0 6px 20px rgba(mixins.theme-color($theme, accent-green), 0.3);
          }
        }
      }

      h1 {
        font-size: clamp(2.5rem, 6vw, 4.5rem);
        font-weight: 800;
        margin-bottom: 1.5rem;
        line-height: 1.1;
        letter-spacing: -0.02em;
        background: linear-gradient(135deg, currentColor 0%, currentColor 100%);
        -webkit-background-clip: text;
        background-clip: text;
        position: relative;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }

        &::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 0;
          height: 4px;
          border-radius: 2px;
          transition: width 1s ease 0.5s;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background: mixins.theme-gradient($theme, primary);
            }
          }
        }

        .article-reader:not(.loading-article) & {
          &::after {
            width: 100%;
          }
        }
      }

      .article-meta {
        display: flex;
        gap: 2rem;
        margin-bottom: 2.5rem;
        font-size: 1.1rem;
        font-weight: 500;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-tertiary);
          }
        }

        @media (max-width: 576px) {
          flex-direction: column;
          gap: 0.5rem;
        }

        .article-author,
        .article-date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
      }

      // Verbesserte Kapitelnavigation
      .chapter-navigation {
        position: relative;
        width: 100%;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
        padding: 2rem;
        border-radius: 24px;
        margin-top: 3rem;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        position: absolute;
        bottom: 100px;
        left: 0;
        transform: translateY(50%);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: linear-gradient(135deg,
                rgba(mixins.theme-color($theme, secondary-bg), 0.8) 0%,
                rgba(mixins.theme-color($theme, card-bg), 0.6) 100%);
            border: 1px solid rgba(mixins.theme-color($theme, border-light), 0.6);
          }
        }

        .chapter-progress {
          margin-bottom: 1.5rem;

          .progress-bar {
            height: 12px;
            border-radius: 6px;
            overflow: hidden;
            position: relative;

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                background-color: rgba(mixins.theme-color($theme, border-light), 0.3);
              }
            }

            .progress-fill {
              height: 100%;
              border-radius: 6px;
              transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
              position: relative;
              overflow: hidden;

              @each $theme in ("light", "dark") {
                .theme-#{$theme} & {
                  background: mixins.theme-gradient($theme, primary);
                }
              }

              &::after {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                animation: shimmer 2s ease-in-out infinite;
              }
            }
          }
        }

        .chapter-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;

          @media (max-width: 576px) {
            flex-direction: column;
            gap: 1rem;
          }

          .chapter-button {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.8rem 1.5rem;
            border-radius: 50px;
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: all 0.3s ease;
            min-width: 100px;

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                background: linear-gradient(135deg,
                    mixins.theme-color($theme, secondary-bg) 0%,
                    mixins.theme-color($theme, hover-color) 100%);
                color: mixins.theme-color($theme, text-primary);
                border: 1px solid rgba(mixins.theme-color($theme, border-medium), 0.4);

                &:hover:not(:disabled) {
                  transform: translateY(-2px) scale(1.02);
                  box-shadow: 0 8px 25px rgba(mixins.theme-color($theme, accent-green), 0.3);
                  border-color: mixins.theme-color($theme, accent-green);
                }

                &:disabled {
                  opacity: 0.4;
                  cursor: not-allowed;
                  transform: none;
                }
              }
            }
          }

          .chapter-info {
            font-size: 1rem;
            font-weight: 600;
            padding: 0.8rem 1.5rem;
            border-radius: 50px;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                background: rgba(mixins.theme-color($theme, accent-green), 0.1);
                color: mixins.theme-color($theme, accent-green);
                border: 1px solid rgba(mixins.theme-color($theme, accent-green), 0.3);
              }
            }
          }
        }
      }
    }

    // Artikel Body mit optimierter Lesbarkeit
    .article-body-container {
      max-width: 750px;
      margin: 0 auto;
      padding: 0 2rem;

      @media (max-width: 768px) {
        padding: 0 1.5rem;
      }

      @media (max-width: 480px) {
        padding: 0 1rem;
      }
    }

    .article-body {
      font-size: clamp(1.1rem, 2.5vw, 1.2rem);
      line-height: 1.8;
      letter-spacing: 0.01em;

      .chapter-content {
        .chapter-title {
          font-size: clamp(1.8rem, 5vw, 2.5rem);
          font-weight: 700;
          margin-bottom: 2rem;
          line-height: 1.2;
          position: relative;
          padding-bottom: 1rem;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }

          &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 3px;
            border-radius: 2px;
            background: linear-gradient(90deg, transparent 0%, currentColor 50%, transparent 100%);
            opacity: 0.3;
          }
        }

        .chapter-text {
          :deep(p) {
            margin-bottom: 2rem;
            text-align: justify;
            hyphens: auto;
            word-wrap: break-word;

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-secondary);
              }
            }

            &:first-child {
              font-size: 1.15em;
              font-weight: 500;
              margin-bottom: 2.5rem;
              position: relative;
              padding-left: 1.5rem;

              &::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 4px;
                border-radius: 2px;

                @each $theme in ("light", "dark") {
                  .theme-#{$theme} & {
                    background: mixins.theme-gradient($theme, primary);
                  }
                }
              }
            }

            @media (max-width: 480px) {
              text-align: left;
            }
          }
        }

        .chapter-image {
          margin: 3rem 0;
          text-align: center;
          position: relative;

          img {
            max-width: 100%;
            height: auto;
            border-radius: 20px;
            box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
            transition: transform 0.3s ease;

            &:hover {
              transform: scale(1.02);
            }
          }
        }
      }

      // Verbesserte Kapitelende-Anzeige
      .chapter-end {
        margin-top: 4rem;
        text-align: center;
        padding: 3rem;
        border-radius: 32px;
        position: relative;
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(74, 210, 149, 0.05) 0%, rgba(53, 204, 208, 0.05) 100%);
          border-radius: 32px;
        }

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: linear-gradient(135deg,
                rgba(mixins.theme-color($theme, secondary-bg), 0.8) 0%,
                rgba(mixins.theme-color($theme, card-bg), 0.6) 100%);
            border: 1px solid rgba(mixins.theme-color($theme, border-light), 0.6);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
          }
        }

        .chapter-end-message {
          font-size: clamp(1.3rem, 4vw, 1.6rem);
          font-weight: 700;
          margin-bottom: 2rem;
          position: relative;
          z-index: 1;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }

        .start-quiz-button {
          width: 200px;
          height: 50px;
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 1.2rem 2.5rem;
          border-radius: 50px;
          font-weight: 600;
          font-size: 1.1rem;
          border: none;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          z-index: 1;
          overflow: hidden;
          margin: 0 auto;

          &::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            width: 100%;
            height: 100%;
            border-radius: 50px;
            background: rgba(255, 255, 255, 0.2);
            transition: transform 0.3s ease;
          }

          &:hover::before {
            transform: translate(-50%, -50%) scale(1.5);
          }

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background: mixins.theme-gradient($theme, primary);
              color: white;
              box-shadow: 0 8px 30px rgba(mixins.theme-color($theme, accent-green), 0.4);

              &:hover {
                transform: translateY(-4px) scale(1.05);
                box-shadow: 0 15px 40px rgba(mixins.theme-color($theme, accent-green), 0.5);
              }
            }
          }
        }

        // Verbessertes Rating System
        .article-rating {
          margin: 3rem 0;
          padding: 2.5rem;
          border-radius: 24px;
          position: relative;
          overflow: hidden;

          &::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(74, 210, 149, 0.08) 0%, rgba(53, 204, 208, 0.08) 100%);
          }

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background: rgba(mixins.theme-color($theme, secondary-bg), 0.6);
              border: 1px solid rgba(mixins.theme-color($theme, border-light), 0.8);
              backdrop-filter: blur(15px);
              -webkit-backdrop-filter: blur(15px);
            }
          }

          h3 {
            margin-bottom: 1.5rem;
            font-size: 1.3rem;
            font-weight: 600;
            position: relative;
            z-index: 1;

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-primary);
              }
            }
          }

          .rating-buttons {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            position: relative;
            z-index: 1;

            .rating-button {
              display: flex;
              justify-content: center;
              align-items: center;
              gap: 0.8rem;
              padding: 1rem 2rem;
              border-radius: 50px;
              font-weight: 600;
              font-size: 1.1rem;
              border: none;
              cursor: pointer;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              position: relative;
              overflow: hidden;

              &::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0);
                width: 100%;
                height: 100%;
                border-radius: 50px;
                transition: transform 0.3s ease;
              }

              &:hover::before {
                transform: translate(-50%, -50%) scale(1.2);
              }

              @each $theme in ("light", "dark") {
                .theme-#{$theme} & {
                  background: rgba(mixins.theme-color($theme, card-bg), 0.8);
                  color: mixins.theme-color($theme, text-secondary);
                  border: 2px solid rgba(mixins.theme-color($theme, border-light), 0.6);

                  &:hover:not(:disabled) {
                    transform: translateY(-3px) scale(1.05);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                  }

                  &:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                  }

                  &.active.like {
                    background: linear-gradient(135deg, rgba(74, 210, 149, 0.2) 0%, rgba(74, 210, 149, 0.3) 100%);
                    border-color: mixins.theme-color($theme, accent-green);
                    color: mixins.theme-color($theme, accent-green);
                    box-shadow: 0 8px 25px rgba(74, 210, 149, 0.3);

                    &::before {
                      background: rgba(74, 210, 149, 0.1);
                    }
                  }

                  &.active.dislike {
                    background: linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(255, 107, 107, 0.3) 100%);
                    border-color: #ff6b6b;
                    color: #ff6b6b;
                    box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);

                    &::before {
                      background: rgba(255, 107, 107, 0.1);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // Modernisierte Quiz-Sektion
    .quiz-section-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 2rem;

      @media (max-width: 768px) {
        padding: 0 1.5rem;
      }

      @media (max-width: 480px) {
        padding: 0 1rem;
      }
    }

    .quiz-section {
      @include animations.fade-in(0.6s);

      .quiz-header {
        text-align: center;
        margin-bottom: 3rem;
        position: relative;

        .quiz-icon {
          width: 100px;
          height: 100px;
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
          margin: 0 auto;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, accent-green);
            }
          }
        }

        h2 {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 700;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, currentColor 0%, currentColor 100%);
          -webkit-background-clip: text;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }

        p {
          font-size: 1.2rem;
          opacity: 0.8;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }
      }

      .quiz-progress {
        margin-bottom: 3rem;
        padding: 2rem;
        border-radius: 20px;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: rgba(mixins.theme-color($theme, secondary-bg), 0.6);
            border: 1px solid rgba(mixins.theme-color($theme, border-light), 0.6);
          }
        }

        .quiz-progress-bar {
          height: 12px;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 1rem;
          position: relative;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background: rgba(mixins.theme-color($theme, border-light), 0.3);
            }
          }

          .progress-fill {
            height: 100%;
            border-radius: 6px;
            transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                background: mixins.theme-gradient($theme, primary);
              }
            }

            &::after {
              content: '';
              position: absolute;
              top: 0;
              left: -100%;
              width: 100%;
              height: 100%;
              background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
              animation: shimmer 2s ease-in-out infinite;
            }
          }
        }

        .quiz-progress-text {
          text-align: center;
          font-weight: 600;
          font-size: 1rem;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }
      }

      // Verbesserte Quiz-Fragen
      .quiz-content {
        .quiz-question {
          margin-bottom: 3rem;
          padding: 2.5rem;
          border-radius: 24px;
          position: relative;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background: rgba(mixins.theme-color($theme, card-bg), 0.8);
              border: 1px solid rgba(mixins.theme-color($theme, border-light), 0.6);
              backdrop-filter: blur(10px);
              -webkit-backdrop-filter: blur(10px);
            }
          }

          h3 {
            font-size: clamp(1.3rem, 4vw, 1.8rem);
            font-weight: 600;
            margin-bottom: 2rem;
            line-height: 1.4;

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-primary);
              }
            }
          }

          .quiz-hint {
            display: flex;
            align-items: center;
            gap: 0.8rem;
            margin-bottom: 2rem;
            padding: 1rem 1.5rem;
            border-radius: 16px;
            font-size: 0.95rem;
            font-weight: 500;

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                background: rgba(mixins.theme-color($theme, accent-yellow), 0.1);
                color: mixins.theme-color($theme, accent-yellow);
                border: 1px solid rgba(mixins.theme-color($theme, accent-yellow), 0.3);
              }
            }
          }

          .quiz-options {
            display: flex;
            flex-direction: column;
            gap: 1.2rem;

            .quiz-option {
              display: flex;
              align-items: center;
              gap: 1.2rem;
              padding: 1.2rem 1.5rem;
              border-radius: 16px;
              cursor: pointer;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              position: relative;
              overflow: hidden;

              &::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                transition: left 0.5s ease;
              }

              &:hover::before {
                left: 100%;
              }

              @each $theme in ("light", "dark") {
                .theme-#{$theme} & {
                  background: rgba(mixins.theme-color($theme, secondary-bg), 0.6);
                  border: 2px solid rgba(mixins.theme-color($theme, border-light), 0.4);

                  &:hover:not(.correct):not(.incorrect):not(.not-selected-correct) {
                    border-color: mixins.theme-color($theme, accent-teal);
                    transform: translateX(8px) scale(1.01);
                    box-shadow: 0 6px 20px rgba(mixins.theme-color($theme, accent-teal), 0.2);
                  }

                  &.selected:not(.correct):not(.incorrect) {
                    border-color: mixins.theme-color($theme, accent-teal);
                    background: rgba(mixins.theme-color($theme, accent-teal), 0.1);
                    transform: scale(1.02);
                  }

                  &.correct {
                    background: linear-gradient(135deg, rgba(74, 210, 149, 0.15) 0%, rgba(74, 210, 149, 0.25) 100%);
                    border-color: mixins.theme-color($theme, accent-green);
                    box-shadow: 0 8px 25px rgba(74, 210, 149, 0.3);
                  }

                  &.incorrect {
                    background: linear-gradient(135deg, rgba(255, 107, 107, 0.15) 0%, rgba(255, 107, 107, 0.25) 100%);
                    border-color: #ff6b6b;
                    box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
                  }

                  &.not-selected-correct {
                    background: linear-gradient(135deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 193, 7, 0.25) 100%);
                    border-color: #ffc107;
                    box-shadow: 0 8px 25px rgba(255, 193, 7, 0.3);
                  }
                }
              }

              .option-marker {
                display: flex;
                align-items: center;
                justify-content: center;
                min-width: 40px;
                height: 40px;
                border-radius: 50%;
                font-weight: 700;
                font-size: 1rem;
                transition: all 0.3s ease;

                @each $theme in ("light", "dark") {
                  .theme-#{$theme} & {
                    background: rgba(mixins.theme-color($theme, card-bg), 0.8);
                    color: mixins.theme-color($theme, text-secondary);
                    border: 2px solid rgba(mixins.theme-color($theme, border-light), 0.6);
                  }
                }
              }

              .option-text {
                flex: 1;
                font-size: 1.1rem;
                line-height: 1.5;
                font-weight: 500;

                @each $theme in ("light", "dark") {
                  .theme-#{$theme} & {
                    color: mixins.theme-color($theme, text-primary);
                  }
                }
              }
            }
          }
        }

        // Verbessertes Quiz-Feedback
        .quiz-feedback {
          display: flex;
          align-items: flex-start;
          gap: 1.5rem;
          padding: 2rem;
          margin-bottom: 2.5rem;
          border-radius: 20px;
          position: relative;
          overflow: hidden;

          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            border-radius: 2px;
          }

          &.correct {
            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                background: linear-gradient(135deg, rgba(74, 210, 149, 0.1) 0%, rgba(74, 210, 149, 0.15) 100%);
                border: 1px solid rgba(mixins.theme-color($theme, accent-green), 0.4);
              }
            }

            &::before {
              background: linear-gradient(to bottom, #4AD295, #26bb77);
            }

            .feedback-icon {
              color: #4AD295;
            }
          }

          &.incorrect {
            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 107, 107, 0.15) 100%);
                border: 1px solid rgba(255, 107, 107, 0.4);
              }
            }

            &::before {
              background: linear-gradient(to bottom, #ff6b6b, #e74c3c);
            }

            .feedback-icon {
              color: #ff6b6b;
            }
          }

          .feedback-icon {
            font-weight: 700;
            line-height: 1;
          }

          .feedback-text {
            flex: 1;

            h4 {
              font-weight: 600;
              font-size: 1.2rem;
              margin-bottom: 0.5rem;

              @each $theme in ("light", "dark") {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, text-primary);
                }
              }
            }

            p {
              font-size: 1rem;
              line-height: 1.5;
              opacity: 0.9;

              @each $theme in ("light", "dark") {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, text-secondary);
                }
              }
            }
          }
        }

        // Verbesserte Quiz-Controls
        .quiz-controls {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;

          button {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 1.2rem 2.5rem;
            border-radius: 50px;
            font-weight: 600;
            font-size: 1.1rem;
            border: none;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;

            &::before {
              content: '';
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) scale(0);
              width: 100%;
              height: 100%;
              border-radius: 50px;
              background: rgba(255, 255, 255, 0.2);
              transition: transform 0.3s ease;
            }

            &:hover::before {
              transform: translate(-50%, -50%) scale(1.2);
            }

            &.check-answer-button,
            &.next-question-button,
            &.finish-quiz-button {
              width: 200px;
              height: 50px;


              @each $theme in ("light", "dark") {
                .theme-#{$theme} & {
                  background: mixins.theme-gradient($theme, primary);
                  color: white;
                  box-shadow: 0 8px 25px rgba(mixins.theme-color($theme, accent-green), 0.3);

                  &:hover:not(:disabled) {
                    transform: translateY(-4px) scale(1.05);
                    box-shadow: 0 15px 40px rgba(mixins.theme-color($theme, accent-green), 0.4);
                  }

                  &:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                  }
                }
              }
            }

            &.restart-button,
            &.back-to-article-button {
              @each $theme in ("light", "dark") {
                .theme-#{$theme} & {
                  background: rgba(mixins.theme-color($theme, secondary-bg), 0.8);
                  color: mixins.theme-color($theme, text-primary);
                  border: 2px solid rgba(mixins.theme-color($theme, border-light), 0.6);

                  &:hover {
                    background: rgba(mixins.theme-color($theme, hover-color), 0.9);
                    transform: translateY(-2px) scale(1.02);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                  }
                }
              }
            }
          }
        }

        // Verbessertes Quiz-Ergebnis
        .quiz-result {
          text-align: center;
          margin-bottom: 3rem;
          padding: 3rem;
          border-radius: 32px;
          position: relative;
          overflow: hidden;

          &::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at center, rgba(74, 210, 149, 0.1) 0%, transparent 70%);
          }

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background: linear-gradient(135deg,
                  rgba(mixins.theme-color($theme, secondary-bg), 0.8) 0%,
                  rgba(mixins.theme-color($theme, card-bg), 0.6) 100%);
              border: 1px solid rgba(mixins.theme-color($theme, border-light), 0.6);
              backdrop-filter: blur(15px);
              -webkit-backdrop-filter: blur(15px);
            }
          }

          .result-icon {
            display: flex;
            justify-content: center;
            margin-bottom: 1.5rem;

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: #FFD700;
              }
            }
          }

          h3 {
            font-size: clamp(1.5rem, 4vw, 2rem);
            font-weight: 700;
            margin-bottom: 2rem;
            position: relative;
            z-index: 1;

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-primary);
              }
            }
          }

          .result-score {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            font-weight: 500;
            position: relative;
            z-index: 1;

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-primary);
              }
            }
          }

          .result-percentage {
            font-size: clamp(3rem, 8vw, 5rem);
            font-weight: 800;
            margin-bottom: 2rem;
            background: linear-gradient(135deg, #4AD295 0%, #35CCD0 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            position: relative;
            z-index: 1;
            text-shadow: 0 4px 8px rgba(74, 210, 149, 0.3);
          }

          .result-message {
            font-size: 1.2rem;
            line-height: 1.6;
            position: relative;
            z-index: 1;

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-secondary);
              }
            }
          }
        }
      }
    }
  }

  // Modernere Kommentarsektion
  .comments-section {
    margin-top: 5rem;
    margin-bottom: 300px;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60%;
      height: 2px;
      background: linear-gradient(90deg, transparent 0%, currentColor 50%, transparent 100%);
      opacity: 0.3;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, border-light);
        }
      }
    }

    padding-top: 3rem;

    .comments-header {
      margin-bottom: 2.5rem;
      text-align: center;

      h3 {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.8rem;
        font-size: clamp(1.5rem, 4vw, 2rem);
        font-weight: 700;
        position: relative;
        display: inline-flex;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
        &::before {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%);
          width: 50px;
          height: 1px;
          border-radius: 1px;
          background: linear-gradient(90deg, transparent 0%, currentColor 50%, transparent 100%);
          opacity: 0.3;
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, accent-teal);
            }

          }
        }
      }
    }

    .new-comment {
      margin-bottom: 3rem;
      padding: 2rem;
      border-radius: 24px;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(74, 210, 149, 0.03) 0%, rgba(53, 204, 208, 0.03) 100%);
      }

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: rgba(mixins.theme-color($theme, secondary-bg), 0.6);
          border: 1px solid rgba(mixins.theme-color($theme, border-light), 0.6);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
      }

      .comment-input {
        width: 100%;
        padding: 1.2rem 1.5rem;
        border-radius: 16px;
        border: none;
        resize: vertical;
        font-family: inherit;
        font-size: 1.05rem;
        line-height: 1.6;
        transition: all 0.3s ease;
        position: relative;
        z-index: 1;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: rgba(mixins.theme-color($theme, card-bg), 0.8);
            color: mixins.theme-color($theme, text-primary);
            border: 2px solid rgba(mixins.theme-color($theme, border-light), 0.4);

            &:focus {
              outline: none;
              border-color: mixins.theme-color($theme, accent-teal);
              box-shadow: 0 0 0 4px rgba(mixins.theme-color($theme, accent-teal), 0.1);
              transform: translateY(-2px);
            }

            &::placeholder {
              color: mixins.theme-color($theme, text-tertiary);
              opacity: 0.7;
            }
          }
        }

        &.small {
          padding: 1rem;
          font-size: 1rem;
          line-height: 1.5;
        }
      }

      .comment-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 1.5rem;
        position: relative;
        z-index: 1;

        .submit-comment-button {
          display: flex;
          align-items: center;
          width: 200px;
          height: 40px;
          gap: 0.5rem;
          padding: 0.9rem 2rem;
          border-radius: 50px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background: mixins.theme-gradient($theme, primary);
              color: white;
              box-shadow: 0 6px 20px rgba(mixins.theme-color($theme, accent-green), 0.3);

              &:hover:not(:disabled) {
                transform: translateY(-3px) scale(1.02);
                box-shadow: 0 12px 30px rgba(mixins.theme-color($theme, accent-green), 0.4);
              }

              &:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none;
              }
            }
          }
        }
      }
    }

    // Verbesserte Kommentar-Cards
    .comments-list {
      .comment {
        margin-bottom: 2rem;
        padding: 2rem;
        border-radius: 20px;
        position: relative;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
        }

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: rgba(mixins.theme-color($theme, card-bg), 0.8);
            border: 1px solid rgba(mixins.theme-color($theme, border-light), 0.6);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);

            &:hover {
              box-shadow: 0 8px 30px rgba(mixins.theme-color($theme, accent-green), 0.1);
              border-color: rgba(mixins.theme-color($theme, accent-green), 0.3);
            }
          }
        }

        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;

          .comment-author {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 700;
            font-size: 1rem;

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-primary);
              }
            }
          }

          .comment-date {
            font-size: 0.9rem;
            opacity: 0.7;

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-tertiary);
              }
            }
          }
        }

        .comment-content {
          margin-bottom: 1.5rem;
          line-height: 1.6;
          font-size: 1.05rem;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }

        .comment-actions {
          display: flex;
          gap: 1rem;

          .reply-button {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.6rem 1.2rem;
            border-radius: 50px;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.9rem;

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                background: rgba(mixins.theme-color($theme, secondary-bg), 0.8);
                color: mixins.theme-color($theme, text-primary);
                border: 2px solid rgba(mixins.theme-color($theme, border-light), 0.6);

                &:hover {
                  background: rgba(mixins.theme-color($theme, hover-color), 0.9);
                  transform: translateY(-2px) scale(1.02);
                  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                }
              }
            }
          }
        }

        .reply-input {
          margin-top: 1.5rem;
          padding: 1.5rem;
          border-radius: 16px;
          position: relative;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background: rgba(mixins.theme-color($theme, secondary-bg), 0.4);
              border: 1px solid rgba(mixins.theme-color($theme, border-light), 0.4);
            }
          }

          .reply-actions {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
            justify-content: flex-end;

            .submit-reply-button {
              display: flex;
              align-items: center;
              gap: 0.4rem;
              padding: 0.8rem 1.5rem;
              border-radius: 50px;
              font-weight: 600;
              border: none;
              cursor: pointer;
              transition: all 0.3s ease;
              font-size: 0.9rem;

              @each $theme in ("light", "dark") {
                .theme-#{$theme} & {
                  background: mixins.theme-gradient($theme, primary);
                  color: white;
                  box-shadow: 0 6px 20px rgba(mixins.theme-color($theme, accent-green), 0.3);

                  &:hover:not(:disabled) {
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 12px 30px rgba(mixins.theme-color($theme, accent-green), 0.4);
                  }

                  &:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                  }
                }
              }
            }

            .cancel-reply-button {
              display: flex;
              align-items: center;
              gap: 0.4rem;
              padding: 0.8rem 1.5rem;
              border-radius: 50px;
              font-weight: 600;
              border: none;
              cursor: pointer;
              transition: all 0.3s ease;
              font-size: 0.9rem;

              @each $theme in ("light", "dark") {
                .theme-#{$theme} & {
                  background: rgba(mixins.theme-color($theme, secondary-bg), 0.8);
                  color: mixins.theme-color($theme, text-primary);
                  border: 2px solid rgba(mixins.theme-color($theme, border-light), 0.6);

                  &:hover {
                    background: rgba(mixins.theme-color($theme, hover-color), 0.9);
                    transform: translateY(-2px) scale(1.02);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                  }
                }
              }
            }
          }
        }

        .replies {
          margin-top: 2rem;
          padding-left: 2rem;
          border-left: 3px solid;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              border-color: rgba(mixins.theme-color($theme, border-light), 0.6);
            }
          }

          .reply {
            margin-bottom: 1.5rem;
            padding: 1.5rem;
            border-radius: 16px;
            position: relative;

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                background: rgba(mixins.theme-color($theme, secondary-bg), 0.4);
                border: 1px solid rgba(mixins.theme-color($theme, border-light), 0.4);
              }
            }

            .comment-header {
              margin-bottom: 0.8rem;
            }

            .comment-content {
              margin-bottom: 0;
              font-size: 1rem;
            }
          }
        }
      }
    }

    .loading-comments {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      text-align: center;

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid transparent;
        border-radius: 50%;
        margin-bottom: 1rem;
        position: relative;

        &::before {
          content: '';
          position: absolute;
          top: -3px;
          left: -3px;
          right: -3px;
          bottom: -3px;
          border-radius: 50%;
          border: 3px solid transparent;
          animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
        }

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            border-top-color: mixins.theme-color($theme, accent-green);
            border-right-color: mixins.theme-color($theme, accent-teal);

            &::before {
              border-bottom-color: mixins.theme-color($theme, accent-lime);
              border-left-color: mixins.theme-color($theme, accent-yellow);
            }
          }
        }
      }

      p {
        font-size: 1rem;
        font-weight: 500;
        opacity: 0.8;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }
    }
  }
}

// ===== ANIMATIONEN =====
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.6;
  }
}

@keyframes bounce {

  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }

  40% {
    transform: translateY(-10px);
  }

  60% {
    transform: translateY(-5px);
  }
}

@keyframes shimmer {
  0% {
    left: -100%;
  }

  100% {
    left: 100%;
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

@keyframes slideUp {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

// ===== RESPONSIVE OPTIMIERUNGEN =====
@media (max-width: 480px) {
  .article-reader {
    .reader-navbar {

      .navbar-left,
      .navbar-right {
        gap: 0.5rem;
      }

      .back-button {
        padding: 0.6rem 1rem;
        font-size: 0.9rem;
      }

      .action-button {
        width: 40px;
        height: 40px;
      }
    }

    .article-content {
      .chapter-navigation {
        padding: 1.5rem;

        .chapter-controls {
          .chapter-button {
            padding: 0.6rem 1rem;
            font-size: 0.9rem;
          }
        }
      }
    }

    .quiz-section {
      .quiz-content {
        .quiz-option {
          padding: 1rem;
          gap: 1rem;

          .option-marker {
            min-width: 35px;
            height: 35px;
            font-size: 0.9rem;
          }

          .option-text {
            font-size: 1rem;
          }
        }

        .quiz-controls {
          button {
            padding: 1rem 1.5rem;
            font-size: 1rem;
          }
        }
      }
    }

    .comments-section {
      .new-comment {
        padding: 1.5rem;
      }

      .comments-list .comment {
        padding: 1.5rem;

        .replies {
          padding-left: 1rem;

          .reply {
            padding: 1rem;
          }
        }
      }
    }

    .alert-overlay {
      padding: 1rem;

      .alert-modal {
        .alert-header {
          padding: 1.5rem 1.5rem 1rem 1.5rem;
        }

        .alert-content {
          padding: 0 1.5rem 1rem 1.5rem;
        }

        .alert-actions {
          padding: 0 1.5rem 1.5rem 1.5rem;
        }
      }
    }
  }
}

// ===== ACCESSIBILITY IMPROVEMENTS =====
@media (prefers-reduced-motion: reduce) {
  .article-reader {

    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}

// ===== PRINT STYLES =====
@media print {
  .article-reader {

    .reader-navbar,
    .quiz-section,
    .comments-section,
    .article-rating,
    .alert-overlay {
      display: none !important;
    }

    .article-content {
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }
  }
}

.article.view {
  min-height: 100vh;
}
</style>