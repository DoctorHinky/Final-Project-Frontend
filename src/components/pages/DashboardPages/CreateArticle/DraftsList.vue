<!-- src/components/pages/DashboardPages/CreateArticle/DraftsList.vue -->
<template>
  <div class="sidebar-section drafts-sidebar">
    <div class="sidebar-header">
      <h3>Meine Entwürfe</h3>
      <button @click="refreshDrafts" class="refresh-btn" :disabled="isLoading" title="Aktualisieren">
        <ArrowPathIcon :class="['icon-size', { spinning: isLoading }]" />
      </button>
    </div>

    <div v-if="isLoading" class="drafts-loading">
      <ArrowPathIcon class="icon-size spinning" />
      <span>Entwürfe werden geladen...</span>
    </div>

    <div v-else-if="drafts.length === 0" class="no-drafts">
      <DocumentIcon class="icon-size-lg" />
      <p>Keine Entwürfe vorhanden</p>
      <small>Gespeicherte Entwürfe erscheinen hier</small>
    </div>

    <div v-else class="drafts-list">
      <div
        v-for="draft in drafts"
        :key="draft.id"
        class="draft-item"
        :class="{ active: selectedDraftId === draft.id }"
        @click="$emit('select', draft)"
      >
        <!-- Vorschaubild hinzugefügt -->
        <div class="draft-thumbnail" v-if="draft.image">
          <img :src="draft.image" alt="Artikelbild" />
        </div>
        <div class="draft-thumbnail placeholder" v-else>
          <DocumentIcon class="placeholder-icon" />
        </div>

        <div class="draft-info">
          <h4 class="draft-title">{{ draft.title || "Ohne Titel" }}</h4>
          <p class="draft-date">Bearbeitet: {{ draft.updated_at }}</p>
          <p class="draft-chapters">{{ draft.chapters.length }} Kapitel</p>
        </div>
        <div class="draft-actions">
          <button @click.stop="$emit('edit', draft)" class="action-button-icon edit" title="Entwurf bearbeiten">
            <PencilIcon class="action-icon" />
          </button>
          <button @click.stop="$emit('delete', draft.id)" class="action-button-icon delete" title="Entwurf löschen">
            <TrashIcon class="action-icon" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { ArrowPathIcon, DocumentIcon, PencilIcon, TrashIcon } from "@heroicons/vue/24/outline";
import type { Draft } from "./types";

export default defineComponent({
  name: "DraftsList",
  components: {
    ArrowPathIcon,
    DocumentIcon,
    PencilIcon,
    TrashIcon,
  },
  props: {
    drafts: {
      type: Array as PropType<Draft[]>,
      default: () => [],
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    selectedDraftId: {
      type: String,
      default: null,
    },
  },
  emits: ["refresh", "select", "edit", "delete"],
  setup(_, { emit }) {
    const refreshDrafts = () => {
      emit("refresh");
    };

    return { refreshDrafts };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;

.sidebar-section {
  border-radius: map.get(map.get(vars.$layout, border-radius), medium);
  display: flex;
  flex-direction: column;
  height: fit-content;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, card-bg);
      border: 1px solid mixins.theme-color($theme, border-light);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
  }

  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: map.get(vars.$spacing, m);
    border-bottom: 1px solid;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        border-color: mixins.theme-color($theme, border-light);
      }
    }

    h3 {
      font-size: map.get(map.get(vars.$fonts, sizes), large);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      margin: 0;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    .refresh-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);

          &:hover:not(:disabled) {
            background-color: mixins.theme-color($theme, hover-color);
            color: mixins.theme-color($theme, primary);
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }
      }
    }
  }
}

.drafts-loading,
.no-drafts {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: map.get(vars.$spacing, xl) 0;
  gap: map.get(vars.$spacing, s);
  text-align: center;

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      color: mixins.theme-color($theme, text-secondary);
      transition: all 0.4s ease-out;
    }
  }

  .icon-size-lg {
    width: 40px;
    height: 40px;
    opacity: 0.6;
  }

  p {
    margin: map.get(vars.$spacing, xs) 0 0;
    font-weight: map.get(map.get(vars.$fonts, weights), medium);
  }

  small {
    font-size: map.get(map.get(vars.$fonts, sizes), small);
    opacity: 0.8;
  }
}

.drafts-list {
  display: flex;
  flex-direction: column;
  max-height: 400px;
  overflow-y: auto;

  .draft-item {
    display: grid;
    grid-template-columns: 50px 1fr auto;
    gap: map.get(vars.$spacing, s);
    align-items: center;
    padding: map.get(vars.$spacing, m);
    border-bottom: 1px solid;
    cursor: pointer;
    transition: background-color 0.2s ease;
    transition: all 0.4s ease-out;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        border-color: mixins.theme-color($theme, border-light);
        transition: all 0.4s ease-out;

        &:hover {
          background-color: mixins.theme-color($theme, hover-color);
        }

        &.active {
          background-color: rgba(0, 100, 255, 0.1);
          border-left: 3px solid mixins.theme-color($theme, primary);
        }
      }
    }

    .draft-thumbnail {
      width: 50px;
      height: 50px;
      border-radius: map.get(map.get(vars.$layout, border-radius), small);
      overflow: hidden;
      transition: all 0.4s ease-out;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      &.placeholder {
        display: flex;
        align-items: center;
        justify-content: center;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, hover-color);
            transition: all 0.4s ease-out;
          }
        }

        .placeholder-icon {
          width: 24px;
          height: 24px;
          opacity: 0.5;
        }
      }
    }

    .draft-info {
      flex: 1;
      min-width: 0;

      .draft-title {
        font-size: map.get(map.get(vars.$fonts, sizes), medium);
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        margin: 0 0 map.get(vars.$spacing, xs);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: all 0.4s ease-out;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
            transition: all 0.4s ease-out;
          }
        }
      }

      .draft-date,
      .draft-chapters {
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        margin: 0;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
            transition: all 0.4s ease-out;
          }
        }
      }
    }

    .draft-actions {
      display: flex;
      gap: 0;
    }
  }
}

.action-button-icon {
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px; // Größere Klickfläche
  height: 40px; // Größere Klickfläche
  border-radius: 50%;
  position: relative;
  transition: all 0.2s ease;
  margin: 0 2px;

  .action-icon {
    width: 18px;
    height: 18px;
  }

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background-color: rgba(mixins.theme-color($theme, hover-color), 0.9);
      color: mixins.theme-color($theme, text-secondary);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: all 0.4s ease-out;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
      }

      &.edit:hover {
        color: mixins.theme-color($theme, primary);
      }

      &.delete:hover {
        background-color: rgba(#f44336, 0.2);
        color: #f44336;
      }
    }
  }
}

.icon-size {
  width: 20px;
  height: 20px;
}

.icon-size-lg {
  width: 40px;
  height: 40px;
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
