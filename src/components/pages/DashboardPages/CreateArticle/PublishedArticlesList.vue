<!-- src/components/pages/DashboardPages/CreateArticle/PublishedArticlesList.vue -->
<template>
  <div class="sidebar-section published-sidebar">
    <div class="sidebar-header">
      <h3>Veröffentlichte Artikel</h3>
      <button @click="refreshArticles" class="refresh-btn" :disabled="isLoading" title="Aktualisieren">
        <ArrowPathIcon :class="['icon-size', { spinning: isLoading }]" />
      </button>
    </div>

    <div v-if="isLoading" class="articles-loading">
      <ArrowPathIcon class="icon-size spinning" />
      <span>Artikel werden geladen...</span>
    </div>

    <div v-else-if="articles.length === 0" class="no-articles">
      <DocumentIcon class="icon-size-lg" />
      <p>Keine Artikel veröffentlicht</p>
      <small>Veröffentlichte Artikel erscheinen hier</small>
    </div>

    <div v-else class="articles-list">
      <div v-for="article in articles" :key="article.id" class="article-item" @click="$emit('edit', article)">
        <!-- Vorschaubild hinzugefügt -->
        <div class="article-thumbnail" v-if="article.image">
          <img :src="article.image" alt="Artikelbild" />
        </div>
        <div class="article-thumbnail placeholder" v-else>
          <DocumentIcon class="placeholder-icon" />
        </div>

        <div class="article-info">
          <h4 class="article-title">{{ article.title || "Ohne Titel" }}</h4>
          <p class="article-date">Veröffentlicht: {{ formatDate(article.publishedAt || "") }}</p>
          <p class="article-chapters">{{ article.chapters.length }} Kapitel</p>
        </div>
        <div class="article-actions">
          <button @click.stop="$emit('view', article.id)" class="action-button-icon view" title="Artikel ansehen">
            <EyeIcon class="action-icon" />
          </button>
          <button @click.stop="$emit('delete', article.id)" class="action-button-icon delete" title="Artikel löschen">
            <TrashIcon class="action-icon" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { ArrowPathIcon, DocumentIcon, EyeIcon, TrashIcon } from "@heroicons/vue/24/outline";
import type { Article } from "@/types/dtos";

export default defineComponent({
  name: "PublishedArticlesList",
  components: {
    ArrowPathIcon,
    DocumentIcon,
    EyeIcon,
    TrashIcon,
  },
  props: {
    articles: {
      type: Array as PropType<Article[]>,
      default: () => [],
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["refresh", "view", "edit", "delete"],
  setup(_, { emit }) {
    const refreshArticles = () => {
      emit("refresh");
    };

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    };

    return {
      refreshArticles,
      formatDate,
    };
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

.articles-loading,
.no-articles {
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

.articles-list {
  display: flex;
  flex-direction: column;
  max-height: 400px;
  overflow-y: auto;

  .article-item {
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
      }
    }

    .article-thumbnail {
      width: 50px;
      height: 50px;
      border-radius: map.get(map.get(vars.$layout, border-radius), small);
      overflow: hidden;

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

    .article-info {
      flex: 1;
      min-width: 0;

      .article-title {
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

      .article-date,
      .article-chapters {
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

    .article-actions {
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
  transition: all 0.4s ease-out;

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

      &.view:hover {
        background-color: rgba(mixins.theme-color($theme, accent-teal), 0.2);
        color: mixins.theme-color($theme, accent-teal);
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
