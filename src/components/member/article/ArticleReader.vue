<!-- src/components/member/article/ArticleReader.vue -->
<template>
  <div class="article-reader">
    <!-- Navigationsleiste -->
    <div class="reader-navbar">
      <div class="navbar-left">
        <button class="back-button" @click="$emit('close')">
          ← Zurück
        </button>
      </div>
      <div class="navbar-right">
        <button 
          class="action-button bookmark" 
          :class="{ active: article.status === 'bookmarked' }" 
          @click="toggleBookmark"
          title="Als Favorit speichern"
        >
          {{ article.status === 'bookmarked' ? '★' : '☆' }}
        </button>
        <button 
          class="action-button share" 
          @click="shareArticle"
          title="Artikel teilen"
        >
          ↗
        </button>
      </div>
    </div>
    
    <!-- Artikel-Inhalt -->
    <div class="article-content">
      <div class="article-header">
        <div class="article-category">{{ article.category }}</div>
        <h1>{{ article.title }}</h1>
        <div class="article-meta">
          <span class="article-author">Von {{ article.author }}</span>
          <span class="article-date">{{ article.date }}</span>
        </div>
        
        <!-- Kapitelnavigation -->
        <div class="chapter-navigation" v-if="article.totalChapters && article.totalChapters > 1">
          <div class="chapter-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: (currentChapter / article.totalChapters * 100) + '%' }"
              ></div>
            </div>
          </div>
          <div class="chapter-controls">
            <button 
              class="chapter-button prev" 
              :disabled="currentChapter === 1"
              @click="prevChapter"
            >
              Zurück
            </button>
            <div class="chapter-info">Kapitel {{ currentChapter }} von {{ article.totalChapters }}</div>
            <button 
              class="chapter-button next" 
              :disabled="currentChapter === article.totalChapters"
              @click="nextChapter"
            >
              Weiter
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="!showQuiz" class="article-body">
        <p v-for="(paragraph, index) in currentContent" :key="index">
          {{ paragraph }}
        </p>
        
        <!-- Kapitelende-Anzeige -->
        <div class="chapter-end" v-if="isLastChapter">
          <div class="chapter-end-message">Du hast das Ende des Artikels erreicht!</div>
          <button 
            v-if="article.quiz && article.quiz.enabled" 
            class="start-quiz-button"
            @click="showQuiz = true"
          >
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
              :style="{ width: (currentQuestionIndex / article.quiz.questions.length * 100) + '%' }"
            ></div>
          </div>
          <div class="quiz-progress-text">
            Frage {{ currentQuestionIndex + 1 }} von {{ article.quiz.questions.length }}
          </div>
        </div>
        
        <div class="quiz-content">
          <!-- Aktuelle Frage -->
          <div class="quiz-question">
            <h3>{{ currentQuestion.question }}</h3>
            
            <div class="quiz-options">
              <div 
                v-for="(option, index) in currentQuestion.options" 
                :key="index"
                class="quiz-option"
                :class="{
                  'selected': selectedOption === index,
                  'correct': quizCompleted && index === currentQuestion.correctAnswer,
                  'incorrect': quizCompleted && selectedOption === index && index !== currentQuestion.correctAnswer
                }"
                @click="selectOption(index)"
              >
                <div class="option-marker">{{ ['A', 'B', 'C', 'D'][index] }}</div>
                <div class="option-text">{{ option }}</div>
              </div>
            </div>
          </div>
          
          <!-- Feedback nach Auswahl -->
          <div v-if="showFeedback" class="quiz-feedback" :class="isCorrect ? 'correct' : 'incorrect'">
            <div class="feedback-icon">{{ isCorrect ? '✓' : '✗' }}</div>
            <div class="feedback-text">
              <h4>{{ isCorrect ? 'Richtig!' : 'Leider falsch!' }}</h4>
              <p v-if="!isCorrect">
                Die richtige Antwort ist: {{ currentQuestion.options[currentQuestion.correctAnswer] }}
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
            
            <button 
              v-if="quizCompleted" 
              class="restart-button"
              @click="restartQuiz"
            >
              Quiz neu starten
            </button>
            
            <button 
              v-if="quizCompleted" 
              class="back-to-article-button"
              @click="backToArticle"
            >
              Zurück zum Artikel
            </button>
          </div>
          
          <!-- Quiz-Ergebnis -->
          <div v-if="quizCompleted" class="quiz-result">
            <h3>Dein Ergebnis</h3>
            <div class="result-score">{{ correctAnswers }} von {{ article.quiz.questions.length }} Fragen richtig</div>
            <div class="result-percentage">{{ Math.round(correctAnswers / article.quiz.questions.length * 100) }}%</div>
            
            <div class="result-message">
              <div v-if="correctAnswers === article.quiz.questions.length">
                Perfekt! Du hast alle Fragen richtig beantwortet.
              </div>
              <div v-else-if="correctAnswers / article.quiz.questions.length >= 0.7">
                Gut gemacht! Du hast die meisten Fragen richtig beantwortet.
              </div>
              <div v-else>
                Du kannst den Artikel noch einmal lesen, um dein Verständnis zu verbessern.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType, watch } from 'vue';

interface ArticleQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface ArticleQuiz {
  enabled: boolean;
  questions: ArticleQuizQuestion[];
}

interface Article {
  id: number;
  title: string;
  content: string;
  category?: string;
  author?: string;
  date?: string;
  currentChapter?: number;
  totalChapters?: number;
  status?: string;
  quiz?: ArticleQuiz;
}

export default defineComponent({
  name: 'ArticleReader',
  props: {
    article: {
      type: Object as PropType<Article>,
      required: true
    }
  },
  emits: ['close', 'toggle-bookmark'],
  setup(props, { emit }) {
    // Kapitel-Verwaltung
    const currentChapter = ref(props.article.currentChapter || 1);
    
    // Artikel-Inhalt in Absätze und dann in Kapitel aufteilen
    const chapterContent = computed(() => {
      if (!props.article.content) return [[]];
      
      // Inhalt in Absätze aufteilen
      const paragraphs = props.article.content.split('\n\n').filter(p => p.trim() !== '');
      
      // Wenn keine Kapitel definiert sind, gesamten Inhalt als ein Kapitel behandeln
      if (!props.article.totalChapters || props.article.totalChapters <= 1) {
        return [paragraphs];
      }
      
      // Inhalt gleichmäßig auf die Kapitel verteilen
      const chaptersArray = [];
      const paragraphsPerChapter = Math.ceil(paragraphs.length / props.article.totalChapters);
      
      for (let i = 0; i < props.article.totalChapters; i++) {
        const start = i * paragraphsPerChapter;
        const end = Math.min(start + paragraphsPerChapter, paragraphs.length);
        chaptersArray.push(paragraphs.slice(start, end));
      }
      
      return chaptersArray;
    });
    
    // Aktueller Kapitelinhalt
    const currentContent = computed(() => {
      const chapter = currentChapter.value - 1; // 0-basierter Index
      return chapterContent.value[chapter] || [];
    });
    
    // Ist das aktuelle Kapitel das letzte?
    const isLastChapter = computed(() => {
      return currentChapter.value === (props.article.totalChapters || 1);
    });
    
    // Zum nächsten Kapitel wechseln
    const nextChapter = () => {
      if (props.article.totalChapters && currentChapter.value < props.article.totalChapters) {
        currentChapter.value++;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    
    // Zum vorherigen Kapitel wechseln
    const prevChapter = () => {
      if (currentChapter.value > 1) {
        currentChapter.value--;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    
    // Favorit umschalten
    const toggleBookmark = () => {
      emit('toggle-bookmark', props.article);
    };
    
    // Artikel teilen
    const shareArticle = () => {
      alert(`Artikel "${props.article.title}" wird geteilt...`);
    };
    
    // Quiz-Verwaltung
    const showQuiz = ref(false);
    const currentQuestionIndex = ref(0);
    const selectedOption = ref<number | null>(null);
    const showFeedback = ref(false);
    const isCorrect = ref(false);
    const quizCompleted = ref(false);
    const correctAnswers = ref(0);
    
    // Aktuelle Quiz-Frage
    const currentQuestion = computed(() => {
      if (!props.article.quiz || !props.article.quiz.questions.length) {
        return { question: '', options: [], correctAnswer: 0 };
      }
      return props.article.quiz.questions[currentQuestionIndex.value];
    });
    
    // Gibt es eine nächste Frage?
    const hasNextQuestion = computed(() => {
      if (!props.article.quiz) return false;
      return currentQuestionIndex.value < props.article.quiz.questions.length - 1;
    });
    
    // Option auswählen
    const selectOption = (index: number) => {
      if (!showFeedback.value && !quizCompleted.value) {
        selectedOption.value = index;
      }
    };
    
    // Antwort prüfen
    const checkAnswer = () => {
      if (selectedOption.value === null) return;
      
      isCorrect.value = selectedOption.value === currentQuestion.value.correctAnswer;
      if (isCorrect.value) {
        correctAnswers.value++;
      }
      
      showFeedback.value = true;
    };
    
    // Zur nächsten Frage
    const nextQuestion = () => {
      if (!hasNextQuestion.value) return;
      
      currentQuestionIndex.value++;
      selectedOption.value = null;
      showFeedback.value = false;
    };
    
    // Quiz abschließen
    const finishQuiz = () => {
      quizCompleted.value = true;
    };
    
    // Quiz neu starten
    const restartQuiz = () => {
      currentQuestionIndex.value = 0;
      selectedOption.value = null;
      showFeedback.value = false;
      quizCompleted.value = false;
      correctAnswers.value = 0;
    };
    
    // Zurück zum Artikel
    const backToArticle = () => {
      showQuiz.value = false;
    };
    
    // Bei Komponenten-Entfernung aktuelle Kapitelposition speichern
    watch(() => props.article, (newArticle) => {
      if (newArticle && typeof newArticle.currentChapter !== 'undefined') {
        currentChapter.value = newArticle.currentChapter;
      }
    });
    
    return {
      currentChapter,
      currentContent,
      isLastChapter,
      nextChapter,
      prevChapter,
      toggleBookmark,
      shareArticle,
      showQuiz,
      currentQuestionIndex,
      currentQuestion,
      selectedOption,
      showFeedback,
      isCorrect,
      quizCompleted,
      correctAnswers,
      hasNextQuestion,
      selectOption,
      checkAnswer,
      nextQuestion,
      finishQuiz,
      restartQuiz,
      backToArticle
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

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
    padding: map.get(vars.$spacing, m) 0;
    z-index: 10;
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        border-bottom: 1px solid mixins.theme-color($theme, border-light);
      }
    }
    
    .navbar-left, .navbar-right {
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
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          color: mixins.theme-color($theme, text-secondary);
          
          &:hover {
            transform: translateY(-3px);
            @include mixins.shadow('small', $theme);
          }
          
          &.bookmark {
            &.active {
              background-color: mixins.theme-color($theme, accent-yellow);
              color: white;
            }
            
            &:not(.active):hover {
              color: mixins.theme-color($theme, accent-yellow);
            }
          }
          
          &.share:hover {
            color: mixins.theme-color($theme, accent-teal);
          }
        }
      }
    }
  }
  
  // Artikel-Inhalt
  .article-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 map.get(vars.$spacing, l);
    
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
        
        @each $theme in ('light', 'dark') {
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
        
        @each $theme in ('light', 'dark') {
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
        
        @each $theme in ('light', 'dark') {
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
          
          .chapter-info {
            font-size: map.get(map.get(vars.$fonts, sizes), small);
            font-weight: map.get(map.get(vars.$fonts, weights), medium);
            
            @each $theme in ('light', 'dark') {
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
      
      p {
        margin-bottom: map.get(vars.$spacing, l);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }
      
      // Kapitelende-Anzeige
      .chapter-end {
        margin-top: map.get(vars.$spacing, xxl);
        text-align: center;
        padding: map.get(vars.$spacing, xl);
        border-radius: map.get(map.get(vars.$layout, border-radius), large);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            border: 1px solid mixins.theme-color($theme, border-light);
          }
        }
        
        .chapter-end-message {
          font-size: map.get(map.get(vars.$fonts, sizes), large);
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
          margin-bottom: map.get(vars.$spacing, l);
          
          @each $theme in ('light', 'dark') {
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
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background: mixins.theme-gradient($theme, primary);
              color: white;
              
              &:hover {
                transform: translateY(-3px);
                @include mixins.shadow('medium', $theme);
              }
            }
          }
        }
      }
    }
    
    // Quiz-Bereich
    .quiz-section {
      @include animations.fade-in(0.5s);
      
      .quiz-header {
        text-align: center;
        margin-bottom: map.get(vars.$spacing, xl);
        
        h2 {
          font-size: map.get(map.get(vars.$fonts, sizes), xxl);
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
          margin-bottom: map.get(vars.$spacing, s);
          
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
      
      .quiz-progress {
        margin-bottom: map.get(vars.$spacing, xl);
        
        .quiz-progress-bar {
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: map.get(vars.$spacing, s);
          
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
        
        .quiz-progress-text {
          text-align: center;
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          
          @each $theme in ('light', 'dark') {
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
            
            @each $theme in ('light', 'dark') {
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
              
              @each $theme in ('light', 'dark') {
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
                
                @each $theme in ('light', 'dark') {
                  .theme-#{$theme} & {
                    background-color: mixins.theme-color($theme, card-bg);
                    color: mixins.theme-color($theme, text-secondary);
                  }
                }
              }
              
              .option-text {
                flex: 1;
                padding: 5px 0;
                
                @each $theme in ('light', 'dark') {
                  .theme-#{$theme} & {
                    color: mixins.theme-color($theme, text-primary);
                  }
                }
              }
            }
          }
        }
        
        // Feedback nach Antwort
        .quiz-feedback {
          display: flex;
          gap: map.get(vars.$spacing, m);
          padding: map.get(vars.$spacing, l);
          margin-bottom: map.get(vars.$spacing, xl);
          border-radius: map.get(map.get(vars.$layout, border-radius), medium);
          
          &.correct {
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background-color: rgba(74, 210, 149, 0.1);
                border: 1px solid mixins.theme-color($theme, accent-green);
              }
            }
            
            .feedback-icon {
              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, accent-green);
                }
              }
            }
          }
          
          &.incorrect {
            @each $theme in ('light', 'dark') {
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
              
              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, text-primary);
                }
              }
            }
            
            p {
              font-size: map.get(map.get(vars.$fonts, sizes), small);
              
              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, text-secondary);
                }
              }
            }
          }
        }
        
        // Quiz-Steuerung
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
            
            &.check-answer-button, &.next-question-button, &.finish-quiz-button {
              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background: mixins.theme-gradient($theme, primary);
                  color: white;
                  
                  &:hover:not(:disabled) {
                    transform: translateY(-3px);
                    @include mixins.shadow('medium', $theme);
                  }
                  
                  &:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                  }
                }
              }
            }
            
            &.restart-button, &.back-to-article-button {
              @each $theme in ('light', 'dark') {
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
        
        // Quiz-Ergebnis
        .quiz-result {
          text-align: center;
          margin-bottom: map.get(vars.$spacing, xxl);
          padding: map.get(vars.$spacing, xl);
          border-radius: map.get(map.get(vars.$layout, border-radius), large);
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
              border: 1px solid mixins.theme-color($theme, border-light);
            }
          }
          
          h3 {
            font-size: map.get(map.get(vars.$fonts, sizes), large);
            font-weight: map.get(map.get(vars.$fonts, weights), bold);
            margin-bottom: map.get(vars.$spacing, l);
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-primary);
              }
            }
          }
          
          .result-score {
            font-size: map.get(map.get(vars.$fonts, sizes), medium);
            margin-bottom: map.get(vars.$spacing, s);
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-primary);
              }
            }
          }
          
          .result-percentage {
            font-size: map.get(map.get(vars.$fonts, sizes), xxxl);
            font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
            margin-bottom: map.get(vars.$spacing, l);
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, accent-green);
              }
            }
          }
          
          .result-message {
            font-size: map.get(map.get(vars.$fonts, sizes), medium);
            
            @each $theme in ('light', 'dark') {
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
</style>