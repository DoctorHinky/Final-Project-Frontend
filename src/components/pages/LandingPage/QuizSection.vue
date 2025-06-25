<template>
  <section class="section quiz-section" id="quiz" ref="sectionRef">
    <!-- Background Effects -->
    <div class="section-bg-effects">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
      <div class="grid-pattern"></div>
    </div>

    <!-- Section Header -->
    <div class="section-header">
      <div class="header-badge">INTERAKTIV</div>
      <h2 class="section-title">
        <span class="title-line">Finde deinen</span>
        <span class="title-highlight">Erziehungsstil</span>
      </h2>
      <p class="section-subtitle">
        Entdecke in unserem interaktiven Quiz, welcher Erziehungstyp du bist und erhalte personalisierte Tipps
      </p>
    </div>

    <!-- Quiz Container -->
    <div class="quiz-container" v-if="!showResults">
      <!-- Progress Bar -->
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="`width: ${progressPercentage}%`"></div>
        </div>
        <div class="progress-text">
          <span>Frage {{ currentQuestion + 1 }} von {{ questions.length }}</span>
          <span>{{ progressPercentage }}% abgeschlossen</span>
        </div>
      </div>

      <!-- Question Card -->
      <div class="question-card" :key="currentQuestion">
        <div class="card-glow"></div>

        <!-- Question Header -->
        <div class="question-header">
          <div class="question-number">
            <span>{{ String(currentQuestion + 1).padStart(2, "0") }}</span>
          </div>
          <div class="question-category">
            <component :is="questions[currentQuestion].icon" class="category-icon" />
            <span>{{ questions[currentQuestion].category }}</span>
          </div>
        </div>

        <!-- Question Content -->
        <div class="question-content">
          <h3 class="question-text">{{ questions[currentQuestion].text }}</h3>

          <!-- Options -->
          <div class="options-grid">
            <button
              v-for="(option, index) in questions[currentQuestion].options"
              :key="index"
              :class="['option-card', { selected: selectedAnswers[currentQuestion] === index }]"
              @click="selectAnswer(index)"
            >
              <div class="option-letter">{{ String.fromCharCode(65 + index) }}</div>
              <div class="option-content">
                <p>{{ option.text }}</p>
              </div>
              <div class="option-check">
                <CheckIcon v-if="selectedAnswers[currentQuestion] === index" />
              </div>
            </button>
          </div>
        </div>

        <!-- Navigation -->
        <div class="question-navigation">
          <button class="nav-btn prev" @click="previousQuestion" :disabled="currentQuestion === 0">
            <ChevronLeftIcon />
            <span>Zurück</span>
          </button>

          <div class="question-dots">
            <button
              v-for="(_, index) in questions"
              :key="index"
              :class="['dot', { active: index === currentQuestion, answered: selectedAnswers[index] !== null }]"
              @click="goToQuestion(index)"
            ></button>
          </div>

          <button class="nav-btn next" @click="nextQuestion" :disabled="selectedAnswers[currentQuestion] === null">
            <span>{{ isLastQuestion ? "Auswerten" : "Weiter" }}</span>
            <ChevronRightIcon />
          </button>
        </div>
      </div>
    </div>

    <!-- Results Section -->
    <div class="results-container" v-else>
      <div class="results-card">
        <div class="card-glow"></div>

        <!-- Results Header -->
        <div class="results-header">
          <div class="results-icon">
            <TrophyIcon />
          </div>
          <h3>Dein Erziehungsstil</h3>
        </div>

        <!-- Result Type -->
        <div class="result-type">
          <div class="type-badge">
            <component :is="resultData.icon" class="type-icon" />
          </div>
          <h2 class="type-name">{{ resultData.type }}</h2>
          <p class="type-description">{{ resultData.description }}</p>
        </div>

        <!-- Characteristics -->
        <div class="characteristics">
          <h4>Deine Stärken</h4>
          <div class="characteristic-list">
            <div v-for="(strength, index) in resultData.strengths" :key="index" class="characteristic-item">
              <StarIcon class="item-icon" />
              <span>{{ strength }}</span>
            </div>
          </div>
        </div>

        <!-- Tips -->
        <div class="tips-section">
          <h4>Personalisierte Tipps</h4>
          <div class="tips-grid">
            <div v-for="(tip, index) in resultData.tips" :key="index" class="tip-card">
              <div class="tip-number">{{ index + 1 }}</div>
              <p>{{ tip }}</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="results-actions">
          <button class="action-btn primary" @click="shareResults">
            <ShareIcon />
            <span>Ergebnis teilen</span>
          </button>
          <button class="action-btn secondary" @click="restartQuiz">
            <ArrowPathIcon />
            <span>Nochmal versuchen</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Floating Elements -->
    <div class="floating-elements">
      <div v-for="i in 10" :key="i" :class="`floating-shape shape-${i}`"></div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from "vue";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  TrophyIcon,
  StarIcon,
  ShareIcon,
  ArrowPathIcon,
  HeartIcon,
  AcademicCapIcon,
  ChatBubbleBottomCenterTextIcon,
  HandRaisedIcon,
  LightBulbIcon,
  SparklesIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from "@heroicons/vue/24/solid";

export interface Question {
  text: string;
  category: string;
  icon: any;
  options: { text: string; type: string }[];
}

export interface ResultData {
  type: string;
  icon: any;
  description: string;
  strengths: string[];
  tips: string[];
}

export default defineComponent({
  name: "QuizSection",
  components: {
    ChevronLeftIcon,
    ChevronRightIcon,
    CheckIcon,
    TrophyIcon,
    StarIcon,
    ShareIcon,
    ArrowPathIcon,
    HeartIcon,
    AcademicCapIcon,
    ChatBubbleBottomCenterTextIcon,
    HandRaisedIcon,
    LightBulbIcon,
    SparklesIcon,
    ShieldCheckIcon,
    UserGroupIcon,
  },
  setup() {
    const sectionRef = ref<HTMLElement | null>(null);
    const currentQuestion = ref(0);
    const selectedAnswers = ref<(number | null)[]>([]);
    const showResults = ref(false);
    const observer = ref<IntersectionObserver | null>(null);

    const questions = ref<Question[]>([
      {
        text: "Wie gehst du mit den Gefühlsausbrüchen deines Kindes um?",
        category: "Emotionale Intelligenz",
        icon: HeartIcon,
        options: [
          { text: "Ich bleibe ruhig und helfe meinem Kind, seine Gefühle zu benennen", type: "empathisch" },
          { text: "Ich setze klare Grenzen und bleibe konsequent", type: "autoritativ" },
          { text: "Ich lasse mein Kind erstmal zur Ruhe kommen", type: "gelassen" },
          { text: "Ich versuche, die Situation gemeinsam zu lösen", type: "kooperativ" },
        ],
      },
      {
        text: "Wie förderst du die Selbstständigkeit deines Kindes?",
        category: "Entwicklung",
        icon: AcademicCapIcon,
        options: [
          { text: "Ich lasse es eigene Erfahrungen machen und bin da, wenn es mich braucht", type: "gelassen" },
          { text: "Ich gebe klare Aufgaben und erwarte deren Erfüllung", type: "autoritativ" },
          { text: "Wir besprechen gemeinsam, was es schon alleine kann", type: "kooperativ" },
          { text: "Ich ermutige und lobe jeden kleinen Fortschritt", type: "empathisch" },
        ],
      },
      {
        text: "Wie wichtig ist dir der Austausch mit anderen Eltern?",
        category: "Community",
        icon: ChatBubbleBottomCenterTextIcon,
        options: [
          { text: "Sehr wichtig - ich tausche mich regelmäßig aus", type: "kooperativ" },
          { text: "Ich hole mir Rat, wenn ich ihn brauche", type: "gelassen" },
          { text: "Ich verlasse mich hauptsächlich auf meine Intuition", type: "empathisch" },
          { text: "Ich orientiere mich an bewährten Erziehungsmethoden", type: "autoritativ" },
        ],
      },
      {
        text: "Wie gehst du mit schwierigen Entwicklungsphasen um?",
        category: "Herausforderungen",
        icon: ShieldCheckIcon,
        options: [
          { text: "Ich informiere mich und wende bewährte Strategien an", type: "autoritativ" },
          { text: "Ich vertraue darauf, dass es eine normale Phase ist", type: "gelassen" },
          { text: "Ich passe mich flexibel an die Bedürfnisse an", type: "empathisch" },
          { text: "Ich suche gemeinsam mit meinem Kind nach Lösungen", type: "kooperativ" },
        ],
      },
    ]);

    const resultTypes: Record<string, ResultData> = {
      empathisch: {
        type: "Der Empathische Begleiter",
        icon: HeartIcon,
        description:
          "Du gehst feinfühlig auf die Bedürfnisse deines Kindes ein und schaffst eine liebevolle, verständnisvolle Atmosphäre.",
        strengths: [
          "Hohe emotionale Intelligenz",
          "Starke Bindung zum Kind",
          "Verständnisvolle Kommunikation",
          "Förderung des Selbstvertrauens",
        ],
        tips: [
          "Vergiss nicht, auch klare Grenzen zu setzen",
          "Achte auf deine eigenen Bedürfnisse",
          "Strukturierte Routinen können helfen",
        ],
      },
      autoritativ: {
        type: "Der Strukturierte Wegweiser",
        icon: ShieldCheckIcon,
        description:
          "Du gibst deinem Kind klare Orientierung und Sicherheit durch verlässliche Regeln und liebevolle Konsequenz.",
        strengths: [
          "Klare Strukturen und Regeln",
          "Verlässlichkeit und Beständigkeit",
          "Förderung von Selbstdisziplin",
          "Sicherheit durch Grenzen",
        ],
        tips: [
          "Flexibilität in besonderen Situationen zeigen",
          "Emotionale Bedürfnisse nicht vernachlässigen",
          "Gemeinsame Entscheidungen ermöglichen",
        ],
      },
      gelassen: {
        type: "Der Gelassene Optimist",
        icon: SparklesIcon,
        description:
          "Du strahlst Ruhe aus und vertraust auf die natürliche Entwicklung deines Kindes, ohne Druck auszuüben.",
        strengths: [
          "Stressresistenz und Geduld",
          "Vertrauen in die Entwicklung",
          "Entspannte Atmosphäre",
          "Raum für Eigeninitiative",
        ],
        tips: ["Aktive Förderung nicht vergessen", "Bei Bedarf auch mal eingreifen", "Klare Erwartungen kommunizieren"],
      },
      kooperativ: {
        type: "Der Demokratische Partner",
        icon: UserGroupIcon,
        description:
          "Du siehst dein Kind als gleichwertigen Partner und ihr findet gemeinsam Lösungen für alle Herausforderungen.",
        strengths: [
          "Förderung der Selbstständigkeit",
          "Gemeinsame Problemlösung",
          "Respektvolle Kommunikation",
          "Stärkung der Entscheidungsfähigkeit",
        ],
        tips: [
          "Elternrolle nicht aus den Augen verlieren",
          "Altersgerechte Entscheidungen treffen",
          "Manchmal braucht es klare Ansagen",
        ],
      },
    };

    // Initialize selected answers
    selectedAnswers.value = new Array(questions.value.length).fill(null);

    // Computed properties
    const progressPercentage = computed(() => {
      const answered = selectedAnswers.value.filter((a) => a !== null).length;
      return Math.round((answered / questions.value.length) * 100);
    });

    const isLastQuestion = computed(() => currentQuestion.value === questions.value.length - 1);

    const resultData = computed(() => {
      const typeCounts: Record<string, number> = {};

      selectedAnswers.value.forEach((answerIndex, questionIndex) => {
        if (answerIndex !== null) {
          const selectedType = questions.value[questionIndex].options[answerIndex].type;
          typeCounts[selectedType] = (typeCounts[selectedType] || 0) + 1;
        }
      });

      const dominantType = Object.entries(typeCounts).reduce((a, b) =>
        typeCounts[a[0]] > typeCounts[b[0]] ? a : b
      )[0];

      return resultTypes[dominantType] || resultTypes.empathisch;
    });

    // Methods
    const selectAnswer = (index: number) => {
      selectedAnswers.value[currentQuestion.value] = index;
    };

    const nextQuestion = () => {
      if (isLastQuestion.value) {
        if (selectedAnswers.value.every((a) => a !== null)) {
          showResults.value = true;
        }
      } else if (selectedAnswers.value[currentQuestion.value] !== null) {
        currentQuestion.value++;
      }
    };

    const previousQuestion = () => {
      if (currentQuestion.value > 0) {
        currentQuestion.value--;
      }
    };

    const goToQuestion = (index: number) => {
      currentQuestion.value = index;
    };

    const restartQuiz = () => {
      currentQuestion.value = 0;
      selectedAnswers.value = new Array(questions.value.length).fill(null);
      showResults.value = false;
    };

    const shareResults = () => {
      // Implement share functionality
      alert("Teilen-Funktion wird implementiert!");
    };

    // Lifecycle
    onMounted(() => {
      observer.value = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
            }
          });
        },
        { threshold: 0.1 }
      );

      if (sectionRef.value) {
        observer.value.observe(sectionRef.value);
      }
    });

    onUnmounted(() => {
      if (observer.value) {
        observer.value.disconnect();
      }
    });

    return {
      sectionRef,
      currentQuestion,
      selectedAnswers,
      showResults,
      questions,
      progressPercentage,
      isLastQuestion,
      resultData,
      selectAnswer,
      nextQuestion,
      previousQuestion,
      goToQuestion,
      restartQuiz,
      shareResults,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;
@use "sass:map";

.quiz-section {
  position: relative;
  padding: map.get(vars.$spacing, xxxl) 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);

  &.visible {
    opacity: 1;
    transform: translateY(0);
  }

  // Background Effects
  .section-bg-effects {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;

    .gradient-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
      opacity: 0.3;

      &.orb-1 {
        width: 500px;
        height: 500px;
        top: -200px;
        right: -200px;
        animation: float-1 25s ease-in-out infinite;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: mixins.theme-color($theme, accent-teal);
          }
        }
      }

      &.orb-2 {
        width: 600px;
        height: 600px;
        bottom: -300px;
        left: -300px;
        animation: float-2 20s ease-in-out infinite;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: mixins.theme-color($theme, accent-lime);
          }
        }
      }

      &.orb-3 {
        width: 400px;
        height: 400px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        animation: float-3 30s ease-in-out infinite;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: mixins.theme-color($theme, accent-green);
          }
        }
      }
    }

    .grid-pattern {
      position: absolute;
      width: 100%;
      height: 100%;
      opacity: 0.03;
      background-image: linear-gradient(currentColor 1px, transparent 1px),
        linear-gradient(90deg, currentColor 1px, transparent 1px);
      background-size: 50px 50px;
    }
  }

  // Section Header
  .section-header {
    text-align: center;
    margin-bottom: map.get(vars.$spacing, xxl);
    position: relative;
    z-index: 1;
    max-width: 800px;
    opacity: 0;
    animation: fade-in-up 0.8s ease-out 0.2s forwards;

    .header-badge {
      display: inline-block;
      padding: 6px 20px;
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-size: 12px;
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: map.get(vars.$spacing, m);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: rgba(mixins.theme-color($theme, accent-teal), 0.1);
          color: mixins.theme-color($theme, accent-teal);
          border: 1px solid mixins.theme-color($theme, accent-teal);
        }
      }
    }

    .section-title {
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
      line-height: 1.2;
      margin-bottom: map.get(vars.$spacing, m);

      .title-line {
        font-size: 2rem;
        display: block;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }

      .title-highlight {
        font-size: 2rem;
        display: block;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: linear-gradient(
              135deg,
              mixins.theme-color($theme, accent-teal) 0%,
              mixins.theme-color($theme, accent-lime) 100%
            );
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        }
      }
    }

    .section-subtitle {
      font-size: clamp(1rem, 2.5vw, 1.25rem);
      line-height: 1.6;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  // Quiz Container
  .quiz-container {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 0 map.get(vars.$spacing, xl);
    position: relative;
    z-index: 1;

    @media (max-width: 768px) {
      padding: 0 map.get(vars.$spacing, m);
    }
  }

  // Progress Container
  .progress-container {
    margin-bottom: map.get(vars.$spacing, xl);
    opacity: 0;
    animation: fade-in-up 0.8s ease-out 0.4s forwards;

    .progress-bar {
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: map.get(vars.$spacing, s);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: rgba(mixins.theme-color($theme, border-light), 0.5);
        }
      }

      .progress-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: linear-gradient(
              90deg,
              mixins.theme-color($theme, accent-teal),
              mixins.theme-color($theme, accent-lime)
            );
          }
        }
      }
    }

    .progress-text {
      display: flex;
      justify-content: space-between;
      font-size: map.get(map.get(vars.$fonts, sizes), small);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  // Question Card
  .question-card {
    border-radius: 24px;
    overflow: hidden;
    position: relative;
    opacity: 0;
    animation: scale-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.6s forwards;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background: rgba(mixins.theme-color($theme, card-bg), 0.8);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(mixins.theme-color($theme, border-light), 0.5);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }
    }

    .card-glow {
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      opacity: 0.5;
      pointer-events: none;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: radial-gradient(
            circle at 50% 50%,
            rgba(mixins.theme-color($theme, accent-teal), 0.1),
            transparent 60%
          );
        }
      }
    }
  }

  // Question Header
  .question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: map.get(vars.$spacing, l);

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        border-bottom: 1px solid rgba(mixins.theme-color($theme, border-light), 0.5);
      }
    }

    .question-number {
      font-size: map.get(map.get(vars.$fonts, sizes), xxxl);
      font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: linear-gradient(
            135deg,
            mixins.theme-color($theme, accent-teal),
            mixins.theme-color($theme, accent-lime)
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      }
    }

    .question-category {
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, s);
      padding: 8px 16px;
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-size: map.get(map.get(vars.$fonts, sizes), small);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: rgba(mixins.theme-color($theme, secondary-bg), 0.5);
          color: mixins.theme-color($theme, text-secondary);
        }
      }

      .category-icon {
        width: 16px;
        height: 16px;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, accent-teal);
          }
        }
      }
    }
  }

  // Question Content
  .question-content {
    padding: map.get(vars.$spacing, xl);

    .question-text {
      font-size: map.get(map.get(vars.$fonts, sizes), xl);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      line-height: 1.4;
      margin-bottom: map.get(vars.$spacing, xl);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }
  }

  // Options Grid
  .options-grid {
    display: grid;
    gap: map.get(vars.$spacing, m);

    .option-card {
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, m);
      padding: map.get(vars.$spacing, l);
      border-radius: 16px;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: rgba(mixins.theme-color($theme, secondary-bg), 0.5);
          border-color: rgba(mixins.theme-color($theme, border-light), 0.5);

          &:hover {
            background: rgba(mixins.theme-color($theme, secondary-bg), 0.8);
            border-color: mixins.theme-color($theme, accent-teal);
            transform: translateX(5px);
          }

          &.selected {
            background: rgba(mixins.theme-color($theme, accent-teal), 0.1);
            border-color: mixins.theme-color($theme, accent-teal);

            .option-letter {
              background: mixins.theme-color($theme, accent-teal);
              color: white;
            }
          }
        }
      }

      .option-letter {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        flex-shrink: 0;
        transition: all 0.3s ease;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: rgba(mixins.theme-color($theme, border-light), 0.5);
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }

      .option-content {
        flex: 1;

        p {
          margin: 0;
          font-size: map.get(map.get(vars.$fonts, sizes), medium);

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }
      }

      .option-check {
        width: 24px;
        height: 24px;

        svg {
          width: 100%;
          height: 100%;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, accent-teal);
            }
          }
        }
      }
    }
  }

  // Question Navigation
  .question-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: map.get(vars.$spacing, l);

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        border-top: 1px solid rgba(mixins.theme-color($theme, border-light), 0.5);
      }
    }

    .nav-btn {
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, s);
      padding: map.get(vars.$spacing, m) map.get(vars.$spacing, l);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      border: none;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      svg {
        width: 20px;
        height: 20px;
      }

      &.prev {
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: rgba(mixins.theme-color($theme, secondary-bg), 0.8);
            color: mixins.theme-color($theme, text-primary);

            &:not(:disabled):hover {
              background: mixins.theme-color($theme, secondary-bg);
              transform: translateX(-3px);
            }
          }
        }
      }

      &.next {
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: linear-gradient(
              135deg,
              mixins.theme-color($theme, accent-teal),
              mixins.theme-color($theme, accent-lime)
            );
            color: white;

            &:not(:disabled):hover {
              transform: translateX(3px);
              box-shadow: 0 6px 20px rgba(mixins.theme-color($theme, accent-teal), 0.3);
            }
          }
        }
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .question-dots {
      display: flex;
      gap: map.get(vars.$spacing, xs);

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: rgba(mixins.theme-color($theme, text-tertiary), 0.3);

            &.active {
              width: 24px;
              border-radius: 4px;
              background: mixins.theme-color($theme, accent-teal);
            }

            &.answered:not(.active) {
              background: mixins.theme-color($theme, accent-lime);
            }
          }
        }
      }
    }
  }

  // Results Container
  .results-container {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 0 map.get(vars.$spacing, xl);
    position: relative;
    z-index: 1;

    @media (max-width: 768px) {
      padding: 0 map.get(vars.$spacing, m);
    }
  }

  // Results Card
  .results-card {
    border-radius: 24px;
    overflow: hidden;
    position: relative;
    padding: map.get(vars.$spacing, xxl);
    opacity: 0;
    animation: scale-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;

    @media (max-width: 768px) {
      padding: map.get(vars.$spacing, xl);
    }

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background: rgba(mixins.theme-color($theme, card-bg), 0.9);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(mixins.theme-color($theme, border-light), 0.5);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }
    }

    .card-glow {
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      opacity: 0.3;
      pointer-events: none;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: radial-gradient(
            circle at 50% 0%,
            rgba(mixins.theme-color($theme, accent-lime), 0.2),
            transparent 60%
          );
        }
      }
    }
  }

  // Results Header
  .results-header {
    text-align: center;
    margin-bottom: map.get(vars.$spacing, xl);

    .results-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto map.get(vars.$spacing, m);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: linear-gradient(
            135deg,
            mixins.theme-color($theme, accent-yellow),
            mixins.theme-color($theme, accent-lime)
          );
        }
      }

      svg {
        width: 40px;
        height: 40px;
        color: white;
      }
    }

    h3 {
      font-size: map.get(map.get(vars.$fonts, sizes), xl);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  // Result Type
  .result-type {
    text-align: center;
    margin-bottom: map.get(vars.$spacing, xxl);

    .type-badge {
      width: 120px;
      height: 120px;
      margin: 0 auto map.get(vars.$spacing, l);
      border-radius: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: linear-gradient(
            135deg,
            mixins.theme-color($theme, accent-teal),
            mixins.theme-color($theme, accent-lime)
          );
          box-shadow: 0 20px 40px rgba(mixins.theme-color($theme, accent-teal), 0.3);
        }
      }

      .type-icon {
        width: 60px;
        height: 60px;
        color: white;
      }
    }

    .type-name {
      font-size: map.get(map.get(vars.$fonts, sizes), xxl);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      margin-bottom: map.get(vars.$spacing, m);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    .type-description {
      font-size: map.get(map.get(vars.$fonts, sizes), large);
      line-height: 1.6;
      max-width: 600px;
      margin: 0 auto;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  // Characteristics
  .characteristics {
    margin-bottom: map.get(vars.$spacing, xl);

    h4 {
      font-size: map.get(map.get(vars.$fonts, sizes), large);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      margin-bottom: map.get(vars.$spacing, l);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    .characteristic-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: map.get(vars.$spacing, m);

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }

      .characteristic-item {
        display: flex;
        align-items: center;
        gap: map.get(vars.$spacing, s);
        padding: map.get(vars.$spacing, m);
        border-radius: 12px;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: rgba(mixins.theme-color($theme, secondary-bg), 0.5);
          }
        }

        .item-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, accent-yellow);
            }
          }
        }

        span {
          font-size: map.get(map.get(vars.$fonts, sizes), medium);

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }
      }
    }
  }

  // Tips Section
  .tips-section {
    margin-bottom: map.get(vars.$spacing, xl);

    h4 {
      font-size: map.get(map.get(vars.$fonts, sizes), large);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      margin-bottom: map.get(vars.$spacing, l);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    .tips-grid {
      display: grid;
      gap: map.get(vars.$spacing, m);

      .tip-card {
        display: flex;
        align-items: flex-start;
        gap: map.get(vars.$spacing, m);
        padding: map.get(vars.$spacing, m);
        border-radius: 12px;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: rgba(mixins.theme-color($theme, accent-teal), 0.05);
            border: 1px solid rgba(mixins.theme-color($theme, accent-teal), 0.2);
          }
        }

        .tip-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-weight: map.get(map.get(vars.$fonts, weights), bold);

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background: mixins.theme-color($theme, accent-teal);
              color: white;
            }
          }
        }

        p {
          margin: 0;
          font-size: map.get(map.get(vars.$fonts, sizes), medium);
          line-height: 1.6;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }
      }
    }
  }

  // Results Actions
  .results-actions {
    display: flex;
    justify-content: center;
    gap: map.get(vars.$spacing, m);
    flex-wrap: wrap;

    .action-btn {
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, s);
      padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      border: none;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      svg {
        width: 20px;
        height: 20px;
      }

      &.primary {
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: linear-gradient(
              135deg,
              mixins.theme-color($theme, accent-teal),
              mixins.theme-color($theme, accent-lime)
            );
            color: white;

            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 10px 30px rgba(mixins.theme-color($theme, accent-teal), 0.3);
            }
          }
        }
      }

      &.secondary {
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: rgba(mixins.theme-color($theme, secondary-bg), 0.8);
            color: mixins.theme-color($theme, text-primary);
            border: 1px solid mixins.theme-color($theme, border-light);

            &:hover {
              background: mixins.theme-color($theme, secondary-bg);
              transform: translateY(-2px);
            }
          }
        }
      }
    }
  }

  // Floating Elements
  .floating-elements {
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;

    .floating-shape {
      position: absolute;
      opacity: 0.1;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: mixins.theme-color($theme, accent-lime);
        }
      }

      @for $i from 1 through 10 {
        &.shape-#{$i} {
          $size: random(60) + 20;
          width: #{$size}px;
          height: #{$size}px;
          top: random(100) * 1%;
          left: random(100) * 1%;

          @if $i % 3 == 0 {
            border-radius: 50%;
          } @else if $i % 3 == 1 {
            clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
          } @else {
            clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
          }

          animation: float-shape-#{$i} #{15 + random(10)}s ease-in-out infinite;
        }
      }
    }
  }
}

// Animations
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes float-1 {
  0%,
  100% {
    transform: translate(0, 0);
  }
  33% {
    transform: translate(50px, -50px);
  }
  66% {
    transform: translate(-30px, 30px);
  }
}

@keyframes float-2 {
  0%,
  100% {
    transform: translate(0, 0);
  }
  33% {
    transform: translate(-40px, 40px);
  }
  66% {
    transform: translate(60px, -20px);
  }
}

@keyframes float-3 {
  0%,
  100% {
    transform: translate(-50%, -50%);
  }
  33% {
    transform: translate(-40%, -60%);
  }
  66% {
    transform: translate(-60%, -40%);
  }
}

@for $i from 1 through 10 {
  @keyframes float-shape-#{$i} {
    0%,
    100% {
      transform: translate(0, 0) rotate(0deg);
    }
    50% {
      transform: translate(#{random(40) - 20}px, #{random(40) - 20}px) rotate(#{random(180)}deg);
    }
  }
}

// Responsive
@media (max-width: 480px) {
  .quiz-section {
    padding: map.get(vars.$spacing, xxl) 0;

    .section-header {
      .section-title {
        font-size: 1.75rem;
      }
    }

    .question-content {
      padding: map.get(vars.$spacing, l);

      .question-text {
        font-size: map.get(map.get(vars.$fonts, sizes), large);
      }
    }

    .options-grid {
      .option-card {
        padding: map.get(vars.$spacing, m);

        .option-letter {
          width: 36px;
          height: 36px;
          font-size: map.get(map.get(vars.$fonts, sizes), small);
        }

        .option-content p {
          font-size: map.get(map.get(vars.$fonts, sizes), small);
        }
      }
    }

    .question-navigation {
      flex-wrap: wrap;
      gap: map.get(vars.$spacing, m);

      .question-dots {
        order: -1;
        width: 100%;
        justify-content: center;
      }
    }
  }
}
</style>
