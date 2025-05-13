<!-- src/components/pages/DashboardPages/Overview/RecommendedArticles.vue -->
<template>
  <div class="section-container recommendations">
    <div class="section-header">
      <h3>Empfohlen für dich</h3>
    </div>

    <!-- Liste der empfohlenen Artikel -->
    <div class="recommended-list">
      <div v-for="(article, index) in articles" :key="index" class="recommended-item"
        @click="$emit('open-article', article)">
        <div class="recommendation-tag">{{ article.category }}</div>
        <h4>{{ article.title }}</h4>
        <p class="article-preview">{{ article.preview }}</p>
        <div class="article-meta">
          <span class="article-author">{{ article.author }}</span>
          <span class="article-date">{{ article.date }}</span>
        </div>
        <button class="read-now-button">Jetzt lesen</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

interface Article {
  id: number;
  title: string;
  preview?: string;
  category?: string;
  author?: string;
  date?: string;
}

export default defineComponent({
  name: 'RecommendedArticles',
  props: {
    articles: {
      type: Array as PropType<Article[]>,
      required: true
    }
  },
  emits: ['open-article']
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;

// Gemeinsame Stile für Sektionen
.section-container {
  padding: map.get(vars.$spacing, xl);
  border-radius: map.get(map.get(vars.$layout, border-radius), large);

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, card-bg);
      border: 1px solid mixins.theme-color($theme, border-light);
    }
  }

  // Sektionsüberschrift
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: map.get(vars.$spacing, l);

    h3 {
      font-size: map.get(map.get(vars.$fonts, sizes), large);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      margin: 0;
      position: relative;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);

          &::after {
            content: '';
            position: absolute;
            width: 40px;
            height: 3px;
            bottom: -8px;
            left: 0;
            background: mixins.theme-gradient($theme, primary);
            border-radius: 2px;
          }
        }
      }
    }
  }
}

// Empfehlungen-Sektion
.recommendations {
  .recommended-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: map.get(vars.$spacing, l);

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }

    .recommended-item {
      position: relative;
      padding: map.get(vars.$spacing, l);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      transition: all 0.3s;
      display: flex;
      flex-direction: column;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          border: 1px solid mixins.theme-color($theme, border-light);

          &:hover {
            transform: translateY(-5px);
            @include mixins.shadow('medium', $theme);
            border-color: mixins.theme-color($theme, accent-teal);
          }
        }
      }

      .recommendation-tag {
        position: absolute;
        top: 10px;
        right: 10px;
        padding: map.get(vars.$spacing, xxs) map.get(vars.$spacing, s);
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        font-weight: map.get(map.get(vars.$fonts, weights), medium);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: mixins.theme-gradient($theme, primary);
            color: white;
          }
        }
      }

      h4 {
        font-size: map.get(map.get(vars.$fonts, sizes), medium);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        margin: 0 0 map.get(vars.$spacing, s) 0;
        padding-right: 80px; // Platz für Tag

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }

      .article-preview {
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        margin-bottom: map.get(vars.$spacing, m);
        flex-grow: 1;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }

      .article-meta {
        display: flex;
        justify-content: space-between;
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        margin-bottom: map.get(vars.$spacing, m);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-tertiary);
          }
        }

        .article-author {
          font-weight: map.get(map.get(vars.$fonts, weights), medium);
        }
      }

      .read-now-button {
        padding: map.get(vars.$spacing, s) 0;
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);
        border: none;
        cursor: pointer;
        font-weight: map.get(map.get(vars.$fonts, weights), medium);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: mixins.theme-gradient($theme, primary);
            color: white;

            &:hover {
              transform: translateY(-2px);
              @include mixins.shadow('small', $theme);
            }
          }
        }
      }
    }
  }
}
</style>