<!-- src/components/member/article/ArticleReader.vue -->
<template>
  <div class="article-reader">
    <!-- Navigationsleiste -->
    <div class="reader-navbar">
      <div class="navbar-left">
        <button class="back-button" @click="$emit('close')">← Zurück</button>
      </div>
      <div class="navbar-right">
        <button class="action-button share" @click="shareArticle" title="Artikel teilen">↗</button>
      </div>
    </div>

    <!-- Loading State für Artikel -->
    <div v-if="loadingArticle" class="loading-article">
      <div class="loading-spinner"></div>
      <p>Artikel wird geladen...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="articleError" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Fehler beim Laden</h3>
      <p>{{ articleError }}</p>
      <button @click="loadFullArticle" class="retry-button">Erneut versuchen</button>
    </div>

    <!-- Artikel-Inhalt -->
    <div v-else-if="fullArticle" class="article-content">
      <!-- Hero-Bild -->
      <div v-if="fullArticle.image" class="article-hero-image">
        <img :src="fullArticle.image" :alt="fullArticle.title" />
        <div class="image-overlay"></div>
      </div>

      <div class="article-header">
        <div class="article-category">{{ fullArticle.category }}</div>
        <h1>{{ fullArticle.title }}</h1>
        <div class="article-meta">
          <span class="article-author">Von {{ fullArticle.author?.username || 'Unbekannt' }}</span>
          <span class="article-date">{{ formatDate(fullArticle.createdAt) }}</span>
        </div>

        <!-- Kapitelnavigation -->
        <div class="chapter-navigation" v-if="fullArticle.chapters && fullArticle.chapters.length > 1">
          <div class="chapter-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: (currentChapter / fullArticle.chapters.length) * 100 + '%' }"></div>
            </div>
          </div>
          <div class="chapter-controls">
            <button class="chapter-button prev" :disabled="currentChapter === 1" @click="prevChapter">Zurück</button>
            <div class="chapter-info">Kapitel {{ currentChapter }} von {{ fullArticle.chapters.length }}</div>
            <button
              class="chapter-button next"
              :disabled="currentChapter === fullArticle.chapters.length"
              @click="nextChapter"
            >
              Weiter
            </button>
          </div>
        </div>
      </div>

      <div v-if="!showQuiz" class="article-body">
        <!-- Aktueller Kapitelinhalt -->
        <div v-if="currentChapterContent" class="chapter-content">
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
          <button v-if="fullArticle.quiz && fullArticle.quiz.questions && fullArticle.quiz.questions.length > 0" class="start-quiz-button" @click="showQuiz = true">
            Quiz starten
          </button>
        </div>
      </div>

      <!-- Quiz-Bereich -->
      <div v-else class="quiz-section">
        <div class="quiz-header">
          <h2>Quiz: Teste dein Wissen</h2>
          <p>Beantworte die Fragen zum Artikel, um dein Verständnis zu testen.</p>
        </div>

        <div class="quiz-progress">
          <div class="quiz-progress-bar">
            <div
              class="progress-fill"
              :style="{ width: ((currentQuestionIndex + 1) / fullArticle.quiz.questions.length) * 100 + '%' }"
            ></div>
          </div>
          <div class="quiz-progress-text">
            Frage {{ currentQuestionIndex + 1 }} von {{ fullArticle.quiz.questions.length }}
          </div>
        </div>

        <div class="quiz-content">
          <!-- Aktuelle Frage -->
          <div class="quiz-question" v-if="currentQuestion">
            <h3>{{ currentQuestion.question }}</h3>

            <div class="quiz-options">
              <div
                v-for="(answer, index) in currentQuestion.answers"
                :key="answer.id"
                class="quiz-option"
                :class="{
                  selected: selectedOption === index,
                  correct: quizCompleted && answer.isCorrect,
                  incorrect: quizCompleted && selectedOption === index && !answer.isCorrect,
                }"
                @click="selectOption(index)"
              >
                <div class="option-marker">{{ ["A", "B", "C", "D"][index] }}</div>
                <div class="option-text">{{ answer.answer }}</div>
              </div>
            </div>
          </div>

          <!-- Feedback nach Auswahl -->
          <div v-if="showFeedback" class="quiz-feedback" :class="isCorrect ? 'correct' : 'incorrect'">
            <div class="feedback-icon">{{ isCorrect ? "✓" : "✗" }}</div>
            <div class="feedback-text">
              <h4>{{ isCorrect ? "Richtig!" : "Leider falsch!" }}</h4>
              <p v-if="!isCorrect && correctAnswerText">
                Die richtige Antwort ist: {{ correctAnswerText }}
              </p>
            </div>
          </div>

          <!-- Quiz-Steuerung -->
          <div class="quiz-controls">
            <button
              v-if="!quizCompleted && !showFeedback"
              class="check-answer-button"
              :disabled="selectedOption === null"
              @click="checkAnswer"
            >
              Antwort prüfen
            </button>

            <button
              v-if="showFeedback && !quizCompleted && hasNextQuestion"
              class="next-question-button"
              @click="nextQuestion"
            >
              Nächste Frage
            </button>

            <button
              v-if="showFeedback && !quizCompleted && !hasNextQuestion"
              class="finish-quiz-button"
              @click="finishQuiz"
            >
              Quiz abschließen
            </button>

            <button v-if="quizCompleted" class="restart-button" @click="restartQuiz">Quiz neu starten</button>

            <button v-if="quizCompleted" class="back-to-article-button" @click="backToArticle">
              Zurück zum Artikel
            </button>
          </div>

          <!-- Quiz-Ergebnis -->
          <div v-if="quizCompleted" class="quiz-result">
            <h3>Dein Ergebnis</h3>
            <div class="result-score">{{ correctAnswers }} von {{ fullArticle.quiz.questions.length }} Fragen richtig</div>
            <div class="result-percentage">
              {{ Math.round((correctAnswers / fullArticle.quiz.questions.length) * 100) }}%
            </div>

            <div class="result-message">
              <div v-if="correctAnswers === fullArticle.quiz.questions.length">
                Perfekt! Du hast alle Fragen richtig beantwortet.
              </div>
              <div v-else-if="correctAnswers / fullArticle.quiz.questions.length >= 0.7">
                Gut gemacht! Du hast die meisten Fragen richtig beantwortet.
              </div>
              <div v-else>Du kannst den Artikel noch einmal lesen, um dein Verständnis zu verbessern.</div>
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
    
    // Kapitel-Verwaltung
    const currentChapter = ref(1);

    // Quiz-Verwaltung
    const showQuiz = ref(false);
    const currentQuestionIndex = ref(0);
    const selectedOption = ref<number | null>(null);
    const showFeedback = ref(false);
    const isCorrect = ref(false);
    const quizCompleted = ref(false);
    const correctAnswers = ref(0);

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

    const correctAnswerText = computed(() => {
      if (!currentQuestion.value) return '';
      const correctAnswer = currentQuestion.value.answers.find(answer => answer.isCorrect);
      return correctAnswer?.answer || '';
    });

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
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    const prevChapter = () => {
      if (currentChapter.value > 1) {
        currentChapter.value--;
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    // Quiz-Funktionen
    const selectOption = (index: number) => {
      if (!showFeedback.value && !quizCompleted.value) {
        selectedOption.value = index;
      }
    };

    const checkAnswer = () => {
      if (selectedOption.value === null || !currentQuestion.value) return;

      const selectedAnswer = currentQuestion.value.answers[selectedOption.value];
      isCorrect.value = selectedAnswer?.isCorrect || false;
      
      if (isCorrect.value) {
        correctAnswers.value++;
      }

      showFeedback.value = true;
    };

    const nextQuestion = () => {
      if (!hasNextQuestion.value) return;

      currentQuestionIndex.value++;
      selectedOption.value = null;
      showFeedback.value = false;
    };

    const finishQuiz = async () => {
      quizCompleted.value = true;
      
      // Quiz-Ergebnis an Backend senden (falls implementiert)
      try {
        const score = Math.round((correctAnswers.value / (fullArticle.value?.quiz?.questions.length || 1)) * 100);
        // Hier könnte später ein API-Call zum Speichern des Quiz-Ergebnisses erfolgen
        console.log('Quiz completed with score:', score);
      } catch (error) {
        console.warn('Could not save quiz result:', error);
      }
    };

    const restartQuiz = () => {
      currentQuestionIndex.value = 0;
      selectedOption.value = null;
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
          alert('Link wurde in die Zwischenablage kopiert!');
        }).catch(() => {
          alert('Teilen wird von diesem Browser nicht unterstützt.');
        });
      }
    };

    // Beim Mounten Artikel laden
    onMounted(() => {
      loadFullArticle();
    });

    // Bei Artikel-Wechsel neu laden
    watch(() => props.article?.id, (newId) => {
      if (newId) {
        // Quiz-State zurücksetzen
        showQuiz.value = false;
        currentChapter.value = 1;
        restartQuiz();
        // Artikel neu laden
        loadFullArticle();
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
      
      // Quiz
      showQuiz,
      currentQuestionIndex,
      currentQuestion,
      selectedOption,
      showFeedback,
      isCorrect,
      quizCompleted,
      correctAnswers,
      hasNextQuestion,
      correctAnswerText,
      
      // Functions
      loadFullArticle,
      formatContent,
      formatDate,
      nextChapter,
      prevChapter,
      selectOption,
      checkAnswer,
      nextQuestion,
      finishQuiz,
      restartQuiz,
      backToArticle,
      shareArticle,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;
@use "@/style/base/animations" as animations;

.article-reader {
  @include animations.fade-in(0.3s);
  padding-bottom: map.get(vars.$spacing, xxl);

  // Navigationsleiste
  .reader-navbar {
    position: sticky;
    top: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 50px;
    padding: 1rem;
    margin-bottom: 5rem;
    z-index: 10;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        border-bottom: 1px solid mixins.theme-color($theme, border-light);
      }
    }

    .navbar-left,
    .navbar-right {
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, s);
    }

    .back-button {
      padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      cursor: pointer;
      border: none;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          color: mixins.theme-color($theme, text-primary);

          &:hover {
            background-color: mixins.theme-color($theme, hover-color);
          }
        }
      }
    }

    .action-button {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      cursor: pointer;
      border: none;
      transition: all 0.2s;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          color: mixins.theme-color($theme, text-secondary);

          &:hover {
            transform: translateY(-3px);
            @include mixins.shadow("small", $theme);
          }

          &.share:hover {
            color: mixins.theme-color($theme, accent-teal);
          }
        }
      }
    }
  }

  // Loading State
  .loading-article {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: map.get(vars.$spacing, xxl);
    text-align: center;

    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 3px solid;
      border-radius: 50%;
      margin-bottom: map.get(vars.$spacing, m);
      animation: spin 1s linear infinite;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          border-color: mixins.theme-color($theme, border-light);
          border-top-color: mixins.theme-color($theme, primary);
        }
      }
    }

    p {
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  // Error State
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: map.get(vars.$spacing, xxl);
    text-align: center;

    .error-icon {
      font-size: 3rem;
      margin-bottom: map.get(vars.$spacing, m);
    }

    h3 {
      margin-bottom: map.get(vars.$spacing, s);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    p {
      margin-bottom: map.get(vars.$spacing, l);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }

    .retry-button {
      padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      border: none;
      cursor: pointer;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, primary);
          color: white;

          &:hover {
            transform: translateY(-2px);
            @include mixins.shadow("small", $theme);
          }
        }
      }
    }
  }

  // Artikel-Inhalt
  .article-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 map.get(vars.$spacing, l);

    // Hero-Bild
    .article-hero-image {
      margin: 0 calc(-1 * map.get(vars.$spacing, l));
      margin-bottom: map.get(vars.$spacing, xl);
      position: relative;
      height: 400px;
      overflow: hidden;
      border-radius: map.get(map.get(vars.$layout, border-radius), large);

      @media (max-width: 768px) {
        height: 250px;
        margin: 0;
        margin-bottom: map.get(vars.$spacing, l);
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .image-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 100px;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
      }
    }

    // Artikel-Header
    .article-header {
      margin-bottom: map.get(vars.$spacing, xl);

      .article-category {
        display: inline-block;
        padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, m);
        margin-bottom: map.get(vars.$spacing, m);
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: mixins.theme-gradient($theme, primary);
            color: white;
          }
        }
      }

      h1 {
        font-size: map.get(map.get(vars.$fonts, sizes), xxxl);
        font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
        margin-bottom: map.get(vars.$spacing, m);
        line-height: 1.2;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }

        @media (max-width: 768px) {
          font-size: map.get(map.get(vars.$fonts, sizes), xxl);
        }
      }

      .article-meta {
        display: flex;
        gap: map.get(vars.$spacing, l);
        margin-bottom: map.get(vars.$spacing, xl);
        font-size: map.get(map.get(vars.$fonts, sizes), medium);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-tertiary);
          }
        }

        @media (max-width: 576px) {
          flex-direction: column;
          align-items: flex-start;
          gap: map.get(vars.$spacing, xxs);
        }
      }

      // Kapitelnavigation
      .chapter-navigation {
        margin-bottom: map.get(vars.$spacing, xl);

        .chapter-progress {
          margin-bottom: map.get(vars.$spacing, s);

          .progress-bar {
            height: 6px;
            border-radius: 3px;
            overflow: hidden;

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                background-color: mixins.theme-color($theme, border-light);
              }
            }

            .progress-fill {
              height: 100%;
              transition: width 0.3s ease;

              @each $theme in ("light", "dark") {
                .theme-#{$theme} & {
                  background: mixins.theme-gradient($theme, primary);
                }
              }
            }
          }
        }

        .chapter-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .chapter-button {
            padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, m);
            border-radius: map.get(map.get(vars.$layout, border-radius), pill);
            font-size: map.get(map.get(vars.$fonts, sizes), small);
            font-weight: map.get(map.get(vars.$fonts, weights), medium);
            cursor: pointer;
            border: none;

            @each $theme in ("light", "dark") {
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

          .chapter-info {
            font-size: map.get(map.get(vars.$fonts, sizes), small);
            font-weight: map.get(map.get(vars.$fonts, weights), medium);

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-secondary);
              }
            }
          }
        }
      }
    }

    // Artikel-Haupttext
    .article-body {
      font-size: map.get(map.get(vars.$fonts, sizes), medium);
      line-height: 1.8;

      .chapter-content {
        .chapter-title {
          font-size: map.get(map.get(vars.$fonts, sizes), xl);
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
          margin-bottom: map.get(vars.$spacing, l);

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }

        .chapter-text {
          :deep(p) {
            margin-bottom: map.get(vars.$spacing, l);

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-secondary);
              }
            }
          }
        }

        .chapter-image {
          margin: map.get(vars.$spacing, xl) 0;
          text-align: center;

          img {
            max-width: 100%;
            height: auto;
            border-radius: map.get(map.get(vars.$layout, border-radius), medium);
          }
        }
      }

      .article-description {
        p {
          margin-bottom: map.get(vars.$spacing, l);

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }
      }

      // Kapitelende-Anzeige
      .chapter-end {
        margin-top: map.get(vars.$spacing, xxl);
        text-align: center;
        padding: map.get(vars.$spacing, xl);
        border-radius: map.get(map.get(vars.$layout, border-radius), large);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            border: 1px solid mixins.theme-color($theme, border-light);
          }
        }

        .chapter-end-message {
          font-size: map.get(map.get(vars.$fonts, sizes), large);
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
          margin-bottom: map.get(vars.$spacing, l);

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }

        .start-quiz-button {
          padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
          border-radius: map.get(map.get(vars.$layout, border-radius), pill);
          font-weight: map.get(map.get(vars.$fonts, weights), medium);
          border: none;
          cursor: pointer;
          transition: all 0.3s;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background: mixins.theme-gradient($theme, primary);
              color: white;

              &:hover {
                transform: translateY(-3px);
                @include mixins.shadow("medium", $theme);
              }
            }
          }
        }
      }
    }

    // Quiz-Bereich (gleiche Styles wie ursprünglich)
    .quiz-section {
      @include animations.fade-in(0.5s);

      .quiz-header {
        text-align: center;
        margin-bottom: map.get(vars.$spacing, xl);

        h2 {
          font-size: map.get(map.get(vars.$fonts, sizes), xxl);
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
          margin-bottom: map.get(vars.$spacing, s);

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }

        p {
          font-size: map.get(map.get(vars.$fonts, sizes), medium);

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }
      }

      .quiz-progress {
        margin-bottom: map.get(vars.$spacing, xl);

        .quiz-progress-bar {
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: map.get(vars.$spacing, s);

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, border-light);
            }
          }

          .progress-fill {
            height: 100%;
            transition: width 0.3s ease;

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                background: mixins.theme-gradient($theme, primary);
              }
            }
          }
        }

        .quiz-progress-text {
          text-align: center;
          font-size: map.get(map.get(vars.$fonts, sizes), small);

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }
      }

      .quiz-content {
        max-width: 700px;
        margin: 0 auto;

        .quiz-question {
          margin-bottom: map.get(vars.$spacing, xl);

          h3 {
            font-size: map.get(map.get(vars.$fonts, sizes), large);
            font-weight: map.get(map.get(vars.$fonts, weights), bold);
            margin-bottom: map.get(vars.$spacing, l);

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-primary);
              }
            }
          }

          .quiz-options {
            display: flex;
            flex-direction: column;
            gap: map.get(vars.$spacing, m);

            .quiz-option {
              display: flex;
              gap: map.get(vars.$spacing, m);
              padding: map.get(vars.$spacing, m);
              border-radius: map.get(map.get(vars.$layout, border-radius), medium);
              cursor: pointer;
              transition: all 0.3s;

              @each $theme in ("light", "dark") {
                .theme-#{$theme} & {
                  background-color: mixins.theme-color($theme, secondary-bg);
                  border: 1px solid mixins.theme-color($theme, border-light);

                  &:hover:not(.correct):not(.incorrect) {
                    border-color: mixins.theme-color($theme, accent-teal);
                    transform: translateX(5px);
                  }

                  &.selected:not(.correct):not(.incorrect) {
                    border-color: mixins.theme-color($theme, accent-teal);
                    border-width: 2px;
                  }

                  &.correct {
                    background-color: rgba(74, 210, 149, 0.2);
                    border-color: mixins.theme-color($theme, accent-green);
                  }

                  &.incorrect {
                    background-color: rgba(255, 107, 107, 0.1);
                    border-color: #ff6b6b;
                  }
                }
              }

              .option-marker {
                display: flex;
                align-items: center;
                justify-content: center;
                min-width: 30px;
                height: 30px;
                border-radius: 50%;
                font-weight: map.get(map.get(vars.$fonts, weights), bold);

                @each $theme in ("light", "dark") {
                  .theme-#{$theme} & {
                    background-color: mixins.theme-color($theme, card-bg);
                    color: mixins.theme-color($theme, text-secondary);
                  }
                }
              }

              .option-text {
                flex: 1;
                padding: 5px 0;

                @each $theme in ("light", "dark") {
                  .theme-#{$theme} & {
                    color: mixins.theme-color($theme, text-primary);
                  }
                }
              }
            }
          }
        }

        // Quiz-Feedback und Steuerung (gleiche Styles wie ursprünglich)
        .quiz-feedback {
          display: flex;
          gap: map.get(vars.$spacing, m);
          padding: map.get(vars.$spacing, l);
          margin-bottom: map.get(vars.$spacing, xl);
          border-radius: map.get(map.get(vars.$layout, border-radius), medium);

          &.correct {
            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                background-color: rgba(74, 210, 149, 0.1);
                border: 1px solid mixins.theme-color($theme, accent-green);
              }
            }

            .feedback-icon {
              @each $theme in ("light", "dark") {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, accent-green);
                }
              }
            }
          }

          &.incorrect {
            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                background-color: rgba(255, 107, 107, 0.1);
                border: 1px solid #ff6b6b;
              }
            }

            .feedback-icon {
              color: #ff6b6b;
            }
          }

          .feedback-icon {
            font-size: 1.5rem;
            font-weight: map.get(map.get(vars.$fonts, weights), bold);
          }

          .feedback-text {
            flex: 1;

            h4 {
              font-weight: map.get(map.get(vars.$fonts, weights), bold);
              margin-bottom: map.get(vars.$spacing, xxs);

              @each $theme in ("light", "dark") {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, text-primary);
                }
              }
            }

            p {
              font-size: map.get(map.get(vars.$fonts, sizes), small);

              @each $theme in ("light", "dark") {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, text-secondary);
                }
              }
            }
          }
        }

        .quiz-controls {
          display: flex;
          justify-content: center;
          gap: map.get(vars.$spacing, m);
          margin-bottom: map.get(vars.$spacing, xxl);

          button {
            padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
            border-radius: map.get(map.get(vars.$layout, border-radius), pill);
            font-weight: map.get(map.get(vars.$fonts, weights), medium);
            border: none;
            cursor: pointer;
            transition: all 0.3s;

            &.check-answer-button,
            &.next-question-button,
            &.finish-quiz-button {
              @each $theme in ("light", "dark") {
                .theme-#{$theme} & {
                  background: mixins.theme-gradient($theme, primary);
                  color: white;

                  &:hover:not(:disabled) {
                    transform: translateY(-3px);
                    @include mixins.shadow("medium", $theme);
                  }

                  &:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                  }
                }
              }
            }

            &.restart-button,
            &.back-to-article-button {
              @each $theme in ("light", "dark") {
                .theme-#{$theme} & {
                  background-color: mixins.theme-color($theme, secondary-bg);
                  color: mixins.theme-color($theme, text-primary);
                  border: 1px solid mixins.theme-color($theme, border-light);

                  &:hover {
                    background-color: mixins.theme-color($theme, hover-color);
                  }
                }
              }
            }
          }
        }

        .quiz-result {
          text-align: center;
          margin-bottom: map.get(vars.$spacing, xxl);
          padding: map.get(vars.$spacing, xl);
          border-radius: map.get(map.get(vars.$layout, border-radius), large);

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
              border: 1px solid mixins.theme-color($theme, border-light);
            }
          }

          h3 {
            font-size: map.get(map.get(vars.$fonts, sizes), large);
            font-weight: map.get(map.get(vars.$fonts, weights), bold);
            margin-bottom: map.get(vars.$spacing, l);

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-primary);
              }
            }
          }

          .result-score {
            font-size: map.get(map.get(vars.$fonts, sizes), medium);
            margin-bottom: map.get(vars.$spacing, s);

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-primary);
              }
            }
          }

          .result-percentage {
            font-size: map.get(map.get(vars.$fonts, sizes), xxxl);
            font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
            margin-bottom: map.get(vars.$spacing, l);

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, accent-green);
              }
            }
          }

          .result-message {
            font-size: map.get(map.get(vars.$fonts, sizes), medium);

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
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>