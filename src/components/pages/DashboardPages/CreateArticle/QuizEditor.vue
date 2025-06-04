<!-- src/components/pages/DashboardPages/CreateArticle/QuizEditor.vue -->
<template>
  <div class="quiz-editor">
    <div class="quiz-header">
      <h4>Quiz zu diesem Kapitel</h4>
      <p>Erstellen Sie bis zu 10 Fragen zu diesem Kapitel</p>
    </div>

    <div v-if="!localQuiz.questions || localQuiz.questions.length === 0" class="no-questions">
      <button @click="addQuestion" class="add-question-btn">
        <PlusIcon class="icon-size mr-1" />
        <span>Erste Frage hinzufügen</span>
      </button>
    </div>

    <div v-else class="quiz-questions">
      <div v-for="(question, qIndex) in localQuiz.questions" :key="`q-${qIndex}`" class="quiz-question">
        <div class="question-header">
          <span class="question-number">Frage {{ qIndex + 1 }}</span>
          <button @click="() => removeQuestion(qIndex)" class="remove-question-btn">
            <XMarkIcon class="icon-size" />
          </button>
        </div>

        <input
          type="text"
          v-model="question.text"
          class="question-input"
          placeholder="Fragentext eingeben"
          @input="emitUpdate"
        />

        <div class="answers-container">
          <div class="answers-grid">
            <div
              v-for="(_, aIndex) in question.answers"
              :key="`a-${qIndex}-${aIndex}`"
              class="answer-item"
              :class="{ 'single-answer': question.answers.length % 2 !== 0 && aIndex === question.answers.length - 1 }"
            >
              <div class="answer-input-group">
                <input
                  type="checkbox"
                  :id="`correct-${qIndex}-${aIndex}`"
                  v-model="question.answers[aIndex].isCorrect"
                />
                <label :for="`correct-${qIndex}-${aIndex}`" class="correct-label">Richtig</label>
                <div class="answer-input-wrapper">
                  <input
                    type="text"
                    v-model="question.answers[aIndex].text"
                    class="answer-input"
                    :placeholder="`Antwort ${aIndex + 1}`"
                    @input="emitUpdate"
                  />
                  <button
                    class="remove-answer-btn"
                    @click="() => removeAnswer(qIndex, aIndex)"
                    :disabled="question.answers.length <= 2"
                    :aria-label="`Antwort ${aIndex + 1} löschen`"
                  >
                    <TrashIcon class="icon-size-sm" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="quiz-actions quiz-actions-centered">
            <button v-if="question.answers.length < 6" @click="() => addAnswer(qIndex)" class="add-answer-btn">
              <PlusIcon class="icon-size-sm mr-1" />
              <span>Weitere Antwort hinzufügen</span>
            </button>
          </div>
        </div>
      </div>

      <div class="quiz-actions">
        <button
          v-if="localQuiz.questions && localQuiz.questions.length < 10"
          @click="addQuestion"
          class="add-question-btn small"
        >
          <PlusIcon class="icon-size-sm mr-1" />
          <span>Weitere Frage hinzufügen</span>
        </button>
        <span v-else class="questions-limit-notice"> Maximale Anzahl von 10 Fragen erreicht </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, watch, toRefs, onMounted, reactive } from "vue";
import { PlusIcon, XMarkIcon, TrashIcon } from "@heroicons/vue/24/outline";
import type { QuizCreation as Quiz } from "./types";

export default defineComponent({
  name: "QuizEditor",
  components: {
    PlusIcon,
    XMarkIcon,
    TrashIcon,
  },
  props: {
    modelValue: {
      type: Object as PropType<Quiz>,
      default: () => ({ questions: [] }),
    },
  },
  emits: ["update:modelValue", "add-question"],
  setup(props, { emit }) {
    const { modelValue } = toRefs(props);

    // Lokale Kopie des Quiz erstellen
    const localQuiz = reactive<Quiz>({
      questions: [],
    });

    // Synchronisieren der modelValue-Prop mit dem lokalen Zustand
    const synchronizeWithModelValue = () => {
      if (modelValue.value && modelValue.value.questions) {
        // Deep clone to avoid reference issues
        localQuiz.questions = JSON.parse(JSON.stringify(modelValue.value.questions));
      } else {
        localQuiz.questions = [];
      }
    };

    // Initialisieren des lokalen Quiz-Zustands
    onMounted(() => {
      synchronizeWithModelValue();
    });

    // Reaktion auf Änderungen des modelValue von außen
    watch(
      modelValue,
      () => {
        synchronizeWithModelValue();
      },
      { deep: true }
    );

    // Änderungen an den Parent emittieren
    const emitUpdate = () => {
      emit("update:modelValue", {
        questions: localQuiz.questions,
      });
    };

    // Eine neue Frage hinzufügen
    const addQuestion = () => {
      // Sicherstellen, dass questions-Array existiert
      if (!localQuiz.questions) {
        localQuiz.questions = [];
      }

      // Maximal 10 Fragen erlauben
      if (localQuiz.questions.length < 10) {
        // Neue Frage mit Standard-Antworten hinzufügen
        localQuiz.questions.push({
          text: "",
          answers: [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ],
        });

        // Änderungen emittieren
        emitUpdate();

        // Event für Parent-Komponente, dass eine Frage hinzugefügt wurde
        emit("add-question");
      }
    };

    // Eine Frage entfernen
    const removeQuestion = (questionIndex: number) => {
      if (localQuiz.questions) {
        localQuiz.questions.splice(questionIndex, 1);
        emitUpdate();
      }
    };

    // Eine neue Antwort zu einer Frage hinzufügen
    const addAnswer = (questionIndex: number) => {
      if (localQuiz.questions && localQuiz.questions[questionIndex]) {
        const question = localQuiz.questions[questionIndex];
        if (question.answers.length < 6) {
          // Maximale Anzahl von Antworten begrenzen
          question.answers.push({ text: "", isCorrect: false });
          emitUpdate();
        }
      }
    };

    // Eine Antwort entfernen
    const removeAnswer = (questionIndex: number, answerIndex: number) => {
      if (localQuiz.questions && localQuiz.questions[questionIndex]) {
        const question = localQuiz.questions[questionIndex];

        // Mindestens 2 Antworten beibehalten
        if (question.answers.length > 2) {
          // Antwort entfernen
          question.answers.splice(answerIndex, 1);
          emitUpdate();
        }
      }
    };

    return {
      localQuiz,
      addQuestion,
      removeQuestion,
      addAnswer,
      removeAnswer,
      emitUpdate,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;

.quiz-editor {
  margin-top: map.get(vars.$spacing, m);

  .quiz-header {
    margin-bottom: map.get(vars.$spacing, m);

    h4 {
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      margin-bottom: map.get(vars.$spacing, xs);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: #2196f3;
          transition: all 0.4s ease-out;
        }
      }
    }

    p {
      font-size: map.get(map.get(vars.$fonts, sizes), small);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
          transition: all 0.4s ease-out;
        }
      }
    }
  }

  .no-questions {
    display: flex;
    justify-content: center;
    padding: map.get(vars.$spacing, l) 0;
  }

  .add-question-btn,
  .add-answer-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: map.get(vars.$spacing, xs);
    padding: map.get(vars.$spacing, m) map.get(vars.$spacing, l);
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: map.get(map.get(vars.$fonts, weights), medium);
    border: none;
    transition: all 0.4s ease-out;

    &.small {
      padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);
      font-size: map.get(map.get(vars.$fonts, sizes), small);
    }

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background-color: #2196f3;
        color: white;
        transition: all 0.4s ease-out;

        &:hover {
          background-color: color-mix(in srgb, #2196f3 90%, black 10%);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
      }
    }
  }

  .add-answer-btn {
    padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, m);
    font-size: map.get(map.get(vars.$fonts, sizes), small);
    margin-top: map.get(vars.$spacing, s);
    width: fit-content;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background-color: transparent;
        color: #2196f3;
        border: 1px dashed #2196f3;

        &:hover {
          background-color: rgba(33, 150, 243, 0.1);
          transform: translateY(-1px);
          box-shadow: none;
        }
      }
    }
  }

  .quiz-questions {
    display: flex;
    flex-direction: column;
    gap: map.get(vars.$spacing, l);
  }

  .quiz-question {
    padding: map.get(vars.$spacing, m);
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        border: 1px solid mixins.theme-color($theme, border-light);
        transition: all 0.4s ease-out;
      }
    }

    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: map.get(vars.$spacing, s);
    }

    .question-number {
      font-weight: map.get(map.get(vars.$fonts, weights), medium);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: #2196f3;
          transition: all 0.4s ease-out;
        }
      }
    }

    .remove-question-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      transition: all 0.4s ease-out;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: #ffffff;
          transition: all 0.4s ease-out;

          &:hover {
            background-color: rgba(185, 15, 2, 0.5);
            border-radius: 20px;
          }
        }
      }
    }

    .question-input {
      width: 100%;
      padding: map.get(vars.$spacing, s);
      margin-bottom: map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), small);
      transition: all 0.4s ease-out;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, card-bg);
          color: mixins.theme-color($theme, text-primary);
          border: 1px solid mixins.theme-color($theme, border-medium);
          transition: all 0.4s ease-out;

          &:focus {
            border-color: #2196f3;
            outline: none;
          }
        }
      }
    }

    .answers-container {
      display: flex;
      flex-direction: column;
      gap: map.get(vars.$spacing, s);

      .answers-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: map.get(vars.$spacing, m);

        .answer-item {
          &.single-answer {
            grid-column: 1 / -1;
            max-width: 50%;
            margin: 0 auto;
          }
        }

        @media (max-width: 768px) {
          grid-template-columns: 1fr;

          .answer-item {
            &.single-answer {
              max-width: 100%;
            }
          }
        }
      }
    }

    .answer-item {
      margin-bottom: map.get(vars.$spacing, xs);

      .answer-input-group {
        display: flex;
        align-items: center;
        gap: map.get(vars.$spacing, s);

        input[type="radio"] {
          margin: 0;
          cursor: pointer;
        }

        .correct-label {
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          white-space: nowrap;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }

        .answer-input-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          position: relative;
        }

        .answer-input {
          flex: 1;
          padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, s);
          padding-right: 35px; // Platz für den Löschen-Button
          border-radius: map.get(map.get(vars.$layout, border-radius), small);
          width: 100%;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, card-bg);
              color: mixins.theme-color($theme, text-primary);
              border: 1px solid mixins.theme-color($theme, border-light);
              transition: all 0.4s ease-out;

              &:focus {
                border-color: #2196f3;
                outline: none;
              }
            }
          }
        }

        .remove-answer-btn {
          position: absolute;
          border: none;
          right: 8px;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 30px;
          transition: all 0.2s ease-out;

          &:disabled {
            opacity: 0.3;
            cursor: not-allowed;
            display: none;
          }

          // Heroicon SVG färben
          .icon-size-sm {
            color: #f44336 !important; // Standard: Rot für Löschen
            transition: color 0.3s;

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: #f44336 !important;
              }
            }
          }

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: #f44336 !important;

              &:hover:not(:disabled) {
                background-color: rgba(185, 15, 2, 0.5);
              }
            }
          }
        }
      }
    }
  }

  .quiz-actions {
    display: flex;
    justify-content: center;
    margin-top: map.get(vars.$spacing, m);

    &.quiz-actions-centered {
      justify-content: center;
      margin-top: map.get(vars.$spacing, m);
    }
  }

  .questions-limit-notice {
    font-size: map.get(map.get(vars.$fonts, sizes), small);
    padding: map.get(vars.$spacing, s);
    border-radius: map.get(map.get(vars.$layout, border-radius), small);

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background-color: rgba(255, 152, 0, 0.1);
        color: #ff9800;
        transition: all 0.4s ease-out;
      }
    }
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
</style>
