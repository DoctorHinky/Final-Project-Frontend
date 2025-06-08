<!-- src/components/pages/DashboardPages/MyArticles/ArticlesList.vue -->
<template>
  <div class="article-list">
    <view-options
      :sort-option="sortOption"
      :view-mode="viewMode"
      @update:sort-option="$emit('update:sortOption', $event)"
      @update:view-mode="$emit('update:viewMode', $event)"
    />

    <!-- Anzeigebereich für Artikel -->
    <div :class="['articles-container', viewMode]">
      <!-- Grid-Ansicht -->
      <div v-if="viewMode === 'grid'" class="grid-view">
        <div v-for="article in filteredArticles" :key="article.id" class="article-card"
          @click="openArticleReader(article)">
          
          <!-- Lösch-Kreuz oben rechts -->
          <button 
            class="remove-article" 
            @click.stop="removeArticle(article.id)"
            title="Artikel aus Historie entfernen"
            aria-label="Artikel entfernen"
          >
          </button>
          
          <!-- Artikel-Bild -->
          <div class="article-image">
            <img v-if="article.coverImage" :src="article.coverImage" :alt="article.title" />
            <div v-else class="image-placeholder">
              <span class="placeholder-icon">📚</span>
            </div>

            <!-- Tags -->
            <div class="card-tags">
              <span v-for="(tag, idx) in article.tags" :key="idx" class="card-tag">
                {{ tag }}
              </span>
            </div>
          </div>
          
          <div class="card-content">
            <!-- Meta-Informationen direkt nach dem Bild -->
            <div class="article-meta">
              <span class="meta-category">{{ article.category }}</span>
              <span class="meta-separator">•</span>
              <span class="meta-author">{{ article.author || 'Unbekannt' }}</span>
              <span class="meta-separator">•</span>
              <span class="meta-date">{{ article.date }}</span>
            </div>

            <!-- Titel -->
            <h3 class="card-title">{{ article.title }}</h3>
            
            <!-- Beschreibung -->
            <p class="card-preview">{{ article.preview }}</p>

            <!-- Fortschrittsbalken anzeigen, falls vorhanden -->
            <div v-if="article.currentChapter && article.totalChapters" class="chapter-progress">
              <div class="progress-bar">
                <div class="progress-fill"
                  :style="{ width: (article.currentChapter / article.totalChapters * 100) + '%' }"></div>
              </div>
              <div class="progress-text">
                <span class="chapter-info">{{ article.currentChapter }}/{{ article.totalChapters }} Kapitel</span>
                <span class="last-read">{{ article.lastRead }}</span>
              </div>
            </div>

            <!-- Tags -->
            <div class="card-tags">
              <span v-for="(tag, idx) in article.tags" :key="idx" class="card-tag">
                {{ tag }}
              </span>
            </div>

            <!-- Aktionsbuttons -->
            <div class="card-actions">
              <button class="action-button read" @click.stop="openArticleReader(article)">
                <span v-if="article.currentChapter">Weiterlesen</span>
                <span v-else>Jetzt lesen</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Listen-Ansicht -->
      <div v-else-if="viewMode === 'list'" class="list-view">
        <div v-for="article in filteredArticles" :key="article.id" class="article-list-item"
          @click="openArticleReader(article)">
          
          <!-- Lösch-Kreuz oben rechts -->
          <button 
            class="remove-article" 
            @click.stop="removeArticle(article.id)"
            title="Artikel aus Historie entfernen"
            aria-label="Artikel entfernen"
          >
          </button>
          
          <!-- Artikel-Bild in Listenansicht -->
          <div class="list-item-image">
            <img v-if="article.coverImage" :src="article.coverImage" :alt="article.title" />
            <div v-else class="image-placeholder">
              <span class="placeholder-icon">📚</span>
            </div>
          </div>
          
          <div class="list-item-main">
            <!-- Meta-Informationen -->
            <div class="article-meta">
              <span class="meta-category">{{ article.category }}</span>
              <span class="meta-separator">•</span>
              <span class="meta-author">{{ article.author || 'Unbekannt' }}</span>
              <span class="meta-separator">•</span>
              <span class="meta-date">{{ article.date }}</span>
            </div>
            
            <h3 class="card-title">{{ article.title }}</h3>
            <p class="card-preview">{{ article.preview }}</p>

            <!-- Fortschrittsbalken anzeigen, falls vorhanden -->
            <div v-if="article.currentChapter && article.totalChapters" class="chapter-progress">
              <div class="progress-bar">
                <div class="progress-fill"
                  :style="{ width: (article.currentChapter / article.totalChapters * 100) + '%' }"></div>
              </div>
              <div class="progress-text">
                <span class="chapter-info">{{ article.currentChapter }}/{{ article.totalChapters }} Kapitel</span>
                <span class="last-read">{{ article.lastRead }}</span>
              </div>
            </div>
          </div>

          <div class="list-item-actions">
            <button class="action-button read" @click.stop="openArticleReader(article)">
              <span v-if="article.currentChapter">Weiterlesen</span>
              <span v-else>Jetzt lesen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import ViewOptions from './ViewOptions.vue';

interface Article {
  id: number;
  title: string;
  content: string;
  preview: string;
  featured: boolean;
  date?: string;
  category?: string;
  author?: string;
  tags?: string[];
  currentChapter?: number;
  totalChapters?: number;
  lastRead?: string;
  status?: string;
  coverImage?: string;
  quiz?: {
    enabled: boolean;
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
    }>;
  };
}

export default defineComponent({
  name: 'ArticlesList',
  components: {
    ViewOptions
  },
  props: {
    filteredArticles: {
      type: Array as PropType<Article[]>,
      required: true
    },
    sortOption: {
      type: String,
      required: true
    },
    viewMode: {
      type: String,
      required: true
    }
  },
  emits: [
    'update:sortOption', 
    'update:viewMode', 
    'open-article', 
    'remove-article'
    // 'add-filter-tag' // Später anbinden
  ],
  setup(props, { emit }) {
    const openArticleReader = (article: Article) => {
      emit('open-article', article);
    };

    const removeArticle = (articleId: number) => {
      emit('remove-article', articleId);
    };

    // const addFilterTag = (tag: string) => {
    //   emit('add-filter-tag', tag);
    // };

    return {
      openArticleReader,
      removeArticle
      // addFilterTag // Später anbinden
    };
  }
});
</script>

<style lang="scss" scoped>
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use 'sass:map';

// Artikelliste
.article-list {
  margin-bottom: map.get(vars.$spacing, xl);

  // Container für die Artikel
  .articles-container {
    position: relative;

    // Rasteransicht
    &.grid {
      .grid-view {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
        gap: map.get(vars.$spacing, xl);

        @media (max-width: 992px) {
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: map.get(vars.$spacing, l);
        }

        @media (max-width: 768px) {
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        }

        @media (max-width: 576px) {
          grid-template-columns: 1fr;
        }
      }
    }

    // Listenansicht
    &.list {
      .list-view {
        display: flex;
        flex-direction: column;
        gap: map.get(vars.$spacing, m);
      }
    }

    // Moderne Artikelkarte für Grid
    .article-card {
      position: relative;
      border-radius: map.get(map.get(vars.$layout, border-radius), large);
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      overflow: hidden;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, card-bg);
          border: 1px solid mixins.theme-color($theme, border-light);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
                      0 2px 4px -1px rgba(0, 0, 0, 0.06);

          &:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 
                        0 10px 10px -5px rgba(0, 0, 0, 0.04);
            border-color: transparent;

            .article-image img {
              transform: scale(1.08);
            }

            .remove-article {
              opacity: 0.7;
            }
          }
        }

        .card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: map.get(vars.$spacing, xs);

          .card-tag {
            padding: 4px 10px;
            border-radius: map.get(map.get(vars.$layout, border-radius), small);
            font-size: 12px;
            font-weight: map.get(map.get(vars.$fonts, weights), medium);
            transition: all 0.2s;
            cursor: default; // Keine Klick-Funktionalität erstmal

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background-color: mixins.theme-color($theme, secondary-bg);
                color: mixins.theme-color($theme, text-secondary);
                border: 1px solid transparent;

                // &:hover {
                //   background-color: mixins.theme-color($theme, primary);
                //   color: white;
                //   transform: translateY(-2px);
                // }
              }
            }
          }
        }
      }

      // Lösch-Kreuz oben rechts
      .remove-article {
        position: absolute;
        top: map.get(vars.$spacing, s);
        right: map.get(vars.$spacing, s);
        width: 28px;
        height: 28px;
        border: none;
        background: transparent;
        cursor: pointer;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        transition: all 0.2s ease-in-out;
        
        // Standard-Zustand: unsichtbar
        opacity: 0;
        
        // Hover-Zustand: deutlich sichtbar
        &:hover {
          opacity: 1 !important;
          transform: scale(1.1);
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: #dc3545;
              color: white;
            }
          }
        }
        
        // Focus für Accessibility
        &:focus {
          opacity: 1;
          outline: 2px solid #007bff;
          outline-offset: 2px;
        }
        
        // Das X-Icon
        &::before,
        &::after {
          content: '';
          position: absolute;
          width: 12px;
          height: 2px;
          background-color: currentColor;
          transition: background-color 0.2s ease-in-out;
        }
        
        &::before {
          transform: rotate(45deg);
        }
        
        &::after {
          transform: rotate(-45deg);
        }
        
        // Theme-spezifische Farben für Standard-Zustand
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
            
            &:hover {
              color: white;
            }
          }
        }

        @media (max-width: 768px) {
          width: 32px;
          height: 32px;
          opacity: 0.4; // Auf Mobile etwas sichtbarer
          
          &::before,
          &::after {
            width: 14px;
          }
        }
      }

      // Artikel-Bild
      .article-image {
        position: relative;
        width: 100%;
        height: 240px;
        overflow: hidden;

        @media (max-width: 768px) {
          height: 200px;
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background: linear-gradient(135deg, 
                mixins.theme-color($theme, primary) 0%, 
                mixins.theme-color($theme, accent-teal) 100%);
            }
          }

          &::before {
            content: '';
            position: absolute;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: shimmer 3s infinite;
          }

          .placeholder-icon {
            font-size: 4rem;
            opacity: 0.8;
            z-index: 1;

            @media (max-width: 768px) {
              font-size: 3rem;
            }
          }
        }
      }

      // Karten-Inhalt
      .card-content {
        padding: map.get(vars.$spacing, l);
        display: flex;
        flex-direction: column;
        flex-grow: 1;

        @media (max-width: 768px) {
          padding: map.get(vars.$spacing, m);
        }
      }

      // Meta-Informationen
      .article-meta {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: map.get(vars.$spacing, xs);
        margin-bottom: map.get(vars.$spacing, m);
        font-size: map.get(map.get(vars.$fonts, sizes), small);

        @media (max-width: 768px) {
          font-size: 12px;
          margin-bottom: map.get(vars.$spacing, s);
        }

        .meta-category {
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
          text-transform: uppercase;
          letter-spacing: 0.05em;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, primary);
            }
          }
        }

        .meta-author {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }

        .meta-date {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-tertiary);
            }
          }
        }

        .meta-separator {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-tertiary);
              opacity: 0.5;
            }
          }
        }
      }

      .card-title {
        margin-bottom: map.get(vars.$spacing, m);
        font-size: map.get(map.get(vars.$fonts, sizes), xl);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        line-height: 1.3;

        @media (max-width: 768px) {
          font-size: map.get(map.get(vars.$fonts, sizes), large);
          margin-bottom: map.get(vars.$spacing, s);
        }

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }

      .card-preview {
        font-size: map.get(map.get(vars.$fonts, sizes), medium);
        margin-bottom: map.get(vars.$spacing, m);
        display: -webkit-box;
        -webkit-line-clamp: 3;
        line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        flex-grow: 1;
        line-height: 1.6;

        @media (max-width: 768px) {
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          -webkit-line-clamp: 2;
          line-clamp: 2;
        }

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }

      // Kapitel-Fortschritt
      .chapter-progress {
        margin-bottom: map.get(vars.$spacing, m);

        @media (max-width: 768px) {
          margin-bottom: map.get(vars.$spacing, s);
        }

        .progress-bar {
          height: 6px;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: map.get(vars.$spacing, xs);

          @media (max-width: 768px) {
            height: 4px;
          }

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, border-light);
            }
          }

          .progress-fill {
            height: 100%;
            transition: width 0.3s ease;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background: mixins.theme-gradient($theme, primary);
              }
            }
          }
        }

        .progress-text {
          display: flex;
          justify-content: space-between;
          font-size: map.get(map.get(vars.$fonts, sizes), small);

          @media (max-width: 768px) {
            font-size: 11px;
          }

          .chapter-info {
            font-weight: map.get(map.get(vars.$fonts, weights), medium);

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, accent-green);
              }
            }
          }

          .last-read {
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-tertiary);
              }
            }
          }
        }
      }

      // Tags
      .card-tags {
        display: flex;
        flex-wrap: wrap;
        gap: map.get(vars.$spacing, xs);
        margin-bottom: map.get(vars.$spacing, m);

        .card-tag {
          padding: 4px 10px;
          border-radius: map.get(map.get(vars.$layout, border-radius), small);
          font-size: 12px;
          font-weight: map.get(map.get(vars.$fonts, weights), medium);
          transition: all 0.2s;
          cursor: default; // Keine Klick-Funktionalität erstmal

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
              color: mixins.theme-color($theme, text-secondary);
              border: 1px solid transparent;

              // &:hover {
              //   background-color: mixins.theme-color($theme, primary);
              //   color: white;
              //   transform: translateY(-2px);
              // }
            }
          }
        }
      }

      // Aktionsbuttons
      .card-actions {
        display: flex;
        gap: map.get(vars.$spacing, s);
        margin-top: auto;

        .action-button {
          height: 45px;
          padding: 0 map.get(vars.$spacing, l);
          border-radius: map.get(map.get(vars.$layout, border-radius), pill);
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          font-weight: map.get(map.get(vars.$fonts, weights), medium);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;

          @media (max-width: 768px) {
            height: 40px;
            padding: 0 map.get(vars.$spacing, m);
            font-size: 12px;
          }

          &.read {
            flex: 1;
            position: relative;
            overflow: hidden;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background: mixins.theme-gradient($theme, primary);
                color: white;

                &::before {
                  content: '';
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  width: 0;
                  height: 0;
                  border-radius: 50%;
                  background: rgba(255, 255, 255, 0.2);
                  transform: translate(-50%, -50%);
                  transition: width 0.6s, height 0.6s;
                }

                &:hover {
                  transform: translateY(-2px);

                  &::before {
                    width: 300px;
                    height: 300px;
                  }
                }
              }
            }
          }
        }
      }
    }

    // Moderne Listenansicht
    .article-list-item {
      position: relative;
      display: flex;
      justify-content: space-between;
      padding: map.get(vars.$spacing, l);
      border-radius: map.get(map.get(vars.$layout, border-radius), large);
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      gap: map.get(vars.$spacing, l);

      @media (max-width: 768px) {
        padding: map.get(vars.$spacing, m);
        gap: map.get(vars.$spacing, m);
      }

      @media (max-width: 576px) {
        flex-direction: column;
      }

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, card-bg);
          border: 1px solid mixins.theme-color($theme, border-light);
          box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.06);

          &:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
                        0 4px 6px -2px rgba(0, 0, 0, 0.05);
            border-color: transparent;

            .remove-article {
              opacity: 0.7;
            }
          }
        }
      }

      // Lösch-Kreuz oben rechts (Listenansicht)
      .remove-article {
        position: absolute;
        top: map.get(vars.$spacing, s);
        right: map.get(vars.$spacing, s);
        width: 28px;
        height: 28px;
        border: none;
        background: transparent;
        cursor: pointer;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        transition: all 0.2s ease-in-out;
        
        // Standard-Zustand: unsichtbar
        opacity: 0;
        
        // Hover-Zustand: deutlich sichtbar
        &:hover {
          opacity: 1 !important;
          transform: scale(1.1);
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: #dc3545;
              color: white;
            }
          }
        }
        
        // Focus für Accessibility
        &:focus {
          opacity: 1;
          outline: 2px solid #007bff;
          outline-offset: 2px;
        }
        
        // Das X-Icon
        &::before,
        &::after {
          content: '';
          position: absolute;
          width: 12px;
          height: 2px;
          background-color: currentColor;
          transition: background-color 0.2s ease-in-out;
        }
        
        &::before {
          transform: rotate(45deg);
        }
        
        &::after {
          transform: rotate(-45deg);
        }
        
        // Theme-spezifische Farben für Standard-Zustand
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
            
            &:hover {
              color: white;
            }
          }
        }

        @media (max-width: 768px) {
          width: 32px;
          height: 32px;
          opacity: 0.4; // Auf Mobile etwas sichtbarer
          
          &::before,
          &::after {
            width: 14px;
          }
        }
      }

      // Artikel-Bild in Listenansicht
      .list-item-image {
        flex-shrink: 0;
        width: 160px;
        height: 120px;
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);
        overflow: hidden;

        @media (max-width: 768px) {
          width: 140px;
          height: 100px;
        }

        @media (max-width: 576px) {
          width: 100%;
          height: 200px;
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        &:hover img {
          transform: scale(1.05);
        }

        .image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background: linear-gradient(135deg, 
                mixins.theme-color($theme, primary) 0%, 
                mixins.theme-color($theme, accent-teal) 100%);
            }
          }

          .placeholder-icon {
            font-size: 2.5rem;
            opacity: 0.8;
          }
        }
      }

      .list-item-main {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;

        .article-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: map.get(vars.$spacing, xs);
          margin-bottom: map.get(vars.$spacing, s);
          font-size: map.get(map.get(vars.$fonts, sizes), small);

          @media (max-width: 768px) {
            font-size: 12px;
          }

          .meta-category {
            font-weight: map.get(map.get(vars.$fonts, weights), bold);
            text-transform: uppercase;
            letter-spacing: 0.05em;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, primary);
              }
            }
          }

          .meta-author {
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-secondary);
              }
            }
          }

          .meta-date {
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-tertiary);
              }
            }
          }

          .meta-separator {
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-tertiary);
                opacity: 0.5;
              }
            }
          }
        }

        .card-title {
          margin-bottom: map.get(vars.$spacing, s);
          font-size: map.get(map.get(vars.$fonts, sizes), large);
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
          line-height: 1.3;

          @media (max-width: 768px) {
            font-size: map.get(map.get(vars.$fonts, sizes), medium);
          }

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }

        .card-preview {
          font-size: map.get(map.get(vars.$fonts, sizes), medium);
          margin-bottom: map.get(vars.$spacing, m);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.5;

          @media (max-width: 768px) {
            font-size: map.get(map.get(vars.$fonts, sizes), small);
            margin-bottom: map.get(vars.$spacing, s);
          }

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }

        // Kapitel-Fortschritt
        .chapter-progress {
          margin-bottom: map.get(vars.$spacing, m);

          @media (max-width: 768px) {
            margin-bottom: map.get(vars.$spacing, s);
          }

          .progress-bar {
            height: 6px;
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: map.get(vars.$spacing, xs);

            @media (max-width: 768px) {
              height: 4px;
            }

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background-color: mixins.theme-color($theme, border-light);
              }
            }

            .progress-fill {
              height: 100%;
              transition: width 0.3s ease;

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background: mixins.theme-gradient($theme, primary);
                }
              }
            }
          }

          .progress-text {
            display: flex;
            justify-content: space-between;
            font-size: map.get(map.get(vars.$fonts, sizes), small);

            @media (max-width: 768px) {
              font-size: 11px;
            }

            .chapter-info {
              font-weight: map.get(map.get(vars.$fonts, weights), medium);

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, accent-green);
                }
              }
            }

            .last-read {
              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, text-tertiary);
                }
              }
            }
          }
        }
      }

      // Aktionsschaltflächen für Listenansicht
      .list-item-actions {
        display: flex;
        flex-direction: column;
        gap: map.get(vars.$spacing, s);
        align-self: center;

        @media (max-width: 576px) {
          flex-direction: row;
          width: 100%;
          margin-top: map.get(vars.$spacing, m);
        }

        .action-button {
          height: 40px;
          padding: 0 map.get(vars.$spacing, l);
          border-radius: map.get(map.get(vars.$layout, border-radius), pill);
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          font-weight: map.get(map.get(vars.$fonts, weights), medium);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
          white-space: nowrap;
          display: flex;
          align-items: center;
          justify-content: center;

          @media (max-width: 768px) {
            padding: 0 map.get(vars.$spacing, m);
            font-size: 12px;
            height: 36px;
          }

          @media (max-width: 576px) {
            flex: 1;
          }

          &.read {
            min-width: 120px;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background: mixins.theme-gradient($theme, primary);
                color: white;

                &:hover {
                  transform: translateY(-2px);
                }
              }
            }
          }
        }
      }
    }
  }
}

// Animation für Shimmer-Effekt
@keyframes shimmer {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}
</style>