<!-- src/components/pages/DashboardPages/CreateArticle/ChapterEditor.vue -->
<template>
  <div class="chapter-item">
    <div class="chapter-header">
      <span class="chapter-number">Kapitel {{ chapterNumber }}</span>
      <div class="chapter-actions">
        <!-- Quiz-Button entfernt -->
        <button @click="$emit('remove')" class="action-btn delete-btn">
          <TrashIcon class="icon-size" />
          <span>Löschen</span>
        </button>
      </div>
    </div>

    <input
      type="text"
      v-model="chapterLocal.title"
      class="chapter-title-input"
      placeholder="Kapitel Titel"
      @input="updateChapter"
    />

    <!-- Kapitel-Bild -->
    <div class="chapter-image-container">
      <ImageUploader
        v-model="chapterLocal.chapterImage"
        label="Kapitelbild"
        :show-help="false"
        :is-small="true"
        alt="Kapitelbild"
        @update:model-value="updateChapter"
      />
    </div>

    <textarea
      v-model="chapterLocal.content"
      class="chapter-content-textarea"
      placeholder="Inhalt hier einfügen"
      @input="updateChapter"
    ></textarea>

    <!-- Quiz-Bereich entfernt -->

    <!-- Button zum Speichern des Kapitels -->
    <div class="chapter-save-action">
      <button @click="saveChapter" class="chapter-save-btn" :disabled="isSaving">
        <span v-if="isSaving">
          <ArrowPathIcon class="icon-size-sm spinning" />
          Speichern...
        </span>
        <span v-else>
          <SaveIcon class="icon-size-sm" />
          Kapitel speichern
        </span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, type PropType, toRefs, watch } from "vue";
import { TrashIcon, ArrowDownOnSquareIcon as SaveIcon, ArrowPathIcon } from "@heroicons/vue/24/outline";
import ImageUploader from "./ImageUploader.vue";
import type { Chapter } from "./types";

export default defineComponent({
  name: "ChapterEditor",
  components: {
    TrashIcon,
    SaveIcon,
    ArrowPathIcon,
    ImageUploader,
  },
  props: {
    modelValue: {
      type: Object as PropType<Chapter>,
      required: true,
    },
    chapterNumber: {
      type: Number,
      required: true,
    },
    isSaving: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "save", "remove"],
  setup(props, { emit }) {
    const { modelValue } = toRefs(props);

    // Lokale Kopie des Kapitels erstellen
    const chapterLocal = ref<Chapter>({ ...modelValue.value });

    // Kapitel aktualisieren, wenn sich modelValue ändert
    watch(modelValue, (newValue) => {
      chapterLocal.value = { ...newValue };
    });

    // Aktualisiere die Parent-Komponente über Änderungen
    const updateChapter = () => {
      emit("update:modelValue", chapterLocal.value);
    };

    // Speichern des Kapitels
    const saveChapter = () => {
      if (!chapterLocal.value.title.trim() || !chapterLocal.value.content.trim()) {
        alert("Bitte Titel und Inhalt des Kapitels ausfüllen.");
        return;
      }

      emit("save");
    };

    return {
      chapterLocal,
      updateChapter,
      saveChapter,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;

.chapter-item {
  display: flex;
  flex-direction: column;
  gap: map.get(vars.$spacing, m);
  padding: map.get(vars.$spacing, m);
  border-radius: map.get(map.get(vars.$layout, border-radius), medium);
  transition: all 0.4s ease-out;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, card-bg);
      border: 1px solid mixins.theme-color($theme, border-light);
      transition: all 0.4s ease-out;
    }
  }
}

.chapter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chapter-number {
  font-weight: map.get(map.get(vars.$fonts, weights), bold);
  font-size: map.get(map.get(vars.$fonts, sizes), medium);

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      color: mixins.theme-color($theme, text-secondary);
      transition: all 0.4s ease-out;
    }
  }
}

.chapter-actions {
  display: flex;
  gap: map.get(vars.$spacing, xs);
}

.action-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: map.get(vars.$spacing, xs);
  padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, s);
  border-radius: map.get(map.get(vars.$layout, border-radius), small);
  transition: all 0.4s ease-out;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      color: mixins.theme-color($theme, text-secondary);
      transition: all 0.4s ease-out;

      &:hover {
        background-color: mixins.theme-color($theme, hover-color);
      }

      &.delete-btn {
        background-color: rgba(244, 67, 54, 0.1);
        color: #f44336;
        border: 1px solid rgba(244, 67, 54, 0.3);

        &:hover {
          background-color: rgba(244, 67, 54, 0.2);
          border-color: rgba(244, 67, 54, 0.5);
        }
      }
    }
  }
}

.chapter-title-input {
  width: 100%;
  font-size: map.get(map.get(vars.$fonts, sizes), large);
  font-weight: map.get(map.get(vars.$fonts, weights), medium);
  padding: map.get(vars.$spacing, m);
  border: none;
  outline: none;
  background: transparent;
  border-radius: map.get(map.get(vars.$layout, border-radius), medium);

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      color: mixins.theme-color($theme, text-primary);
      border: 1px solid mixins.theme-color($theme, border-light);
      transition: all 0.4s ease-out;
    }
  }
}

.chapter-image-container {
  max-width: 300px;
  margin-bottom: map.get(vars.$spacing, m);
}

.chapter-content-textarea {
  min-height: 250px;
  padding: map.get(vars.$spacing, m);
  border: none;
  outline: none;
  resize: vertical;
  width: 100%;
  background: transparent;
  border-radius: map.get(map.get(vars.$layout, border-radius), medium);

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      color: mixins.theme-color($theme, text-primary);
      border: 1px solid mixins.theme-color($theme, border-light);
      transition: all 0.4s ease-out;
    }
  }
}

.chapter-save-action {
  display: flex;
  justify-content: flex-end;
  margin-top: map.get(vars.$spacing, s);
}

.chapter-save-btn {
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
      background-color: mixins.theme-color($theme, card-bg);
      color: mixins.theme-color($theme, text-secondary);
      border: 1px solid mixins.theme-color($theme, border-medium);
      transition: all 0.4s ease-out;

      &:hover:not(:disabled) {
        color: mixins.theme-color($theme, text-primary);
        border-color: mixins.theme-color($theme, primary);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
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

.spinning {
  animation: spin 1s linear infinite;
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
