<!-- src/components/pages/DashboardPages/Overview/RecommendedArticles.vue -->
<template>
  <div class="section-container recommendations">
    <div class="section-header">
      <h3>Empfohlen für dich</h3>
      <div class="header-subtitle">Basierend auf deinen Interessen</div>
    </div>

    <!-- Liste der empfohlenen Artikel -->
    <div class="recommended-list" v-if="articles.length > 0">
      <div
        v-for="(article, index) in articles"
        :key="index"
        class="recommended-item"
        @click="$emit('open-article', article)"
      >
        <!-- Artikel-Bild -->
        <div class="article-image">
          <!-- Loading-State oder kein Bild -->
          <div v-if="!getImageUrl(article)" class="image-placeholder">
            <div class="placeholder-icon">📄</div>
          </div>

          <!-- Hauptbild -->
          <img
            v-else
            :src="getImageUrl(article)"
            :alt="article.title"
            @error="handleImageError"
            loading="lazy"
            decoding="async"
          />

          <!-- Kategorie-Badge -->
          <div class="category-badge" v-if="article.category">{{ article.category }}</div>
        </div>

        <div class="article-content">
          <h4>{{ article.title }}</h4>
          <p class="article-preview">{{ article.quickDescription }}</p>

          <div class="article-meta">
            <span class="meta-author">{{ article.author?.username || "Unbekannt" }}</span>
            <span class="meta-separator">•</span>
            <span class="meta-date">{{ formatDateOnly(article.publishedAt, "") }}</span>
          </div>

          <div class="article-footer">
            <div class="article-tags" v-if="article.tags && article.tags.length">
              <span v-for="(tag, idx) in article.tags.slice(0, 3)" :key="idx" class="article-tag">
                {{ tag }}
              </span>
            </div>

            <button class="read-now-button" @click.stop="$emit('open-article', article)">
              <span>Lesen</span>
              <span class="arrow-icon">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Nichts gefunden Anzeige -->
    <div v-else class="no-articles-found">
      <div class="no-articles-icon">📚</div>
      <h4>Keine Empfehlungen verfügbar</h4>
      <p>Zurzeit können wir dir keine Artikel empfehlen. Schau später wieder vorbei!</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { formatDateOnly } from "@/utils/helperFunctions";
import type { RecommendedArticle } from "@/types/Overview.types";

export default defineComponent({
  name: "RecommendedArticles",
  props: {
    articles: {
      type: Array as PropType<RecommendedArticle[]>,
      required: true,
    },
  },
  emits: ["open-article"],
  setup() {
    // Bildquelle ermitteln
    const getImageUrl = (article: RecommendedArticle): string | undefined => {
      if (article.image && article.image.trim() !== "") {
        return article.image;
      }

      // Fallback: coverImage
      if (article.image && article.image.trim() !== "") {
        return article.image;
      }

      return undefined;
    };

    // Error-Handling für Bilder
    const handleImageError = (event: Event) => {
      const img = event.target as HTMLImageElement;
      // Verstecke das Bild bei Fehlern
      img.style.display = "none";
    };

    return {
      getImageUrl,
      handleImageError,
      formatDateOnly,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;

.section-container {
  padding: map.get(vars.$spacing, xl);
  border-radius: map.get(map.get(vars.$layout, border-radius), large);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  @each $theme in ("light", "dark") {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, card-bg);
      border: 1px solid mixins.theme-color($theme, border-light);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
  }

  .section-header {
    margin-bottom: map.get(vars.$spacing, xl);

    h3 {
      font-size: map.get(map.get(vars.$fonts, sizes), xl);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      margin: 0 0 map.get(vars.$spacing, xs) 0;
      position: relative;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);

          &::after {
            content: "";
            position: absolute;
            width: 50px;
            height: 4px;
            bottom: -10px;
            left: 0;
            background: mixins.theme-gradient($theme, primary);
            border-radius: 2px;
          }
        }
      }
    }

    .header-subtitle {
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      margin-top: map.get(vars.$spacing, s);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }
}

.recommendations {
  .recommended-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: map.get(vars.$spacing, xl);

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: map.get(vars.$spacing, l);
    }

    .recommended-item {
      position: relative;
      border-radius: map.get(map.get(vars.$layout, border-radius), large);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      cursor: pointer;
      display: flex;
      flex-direction: column;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          border: 1px solid mixins.theme-color($theme, border-light);

          &:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            border-color: transparent;

            .article-image img {
              transform: scale(1.1);
            }

            .read-now-button {
              background-color: mixins.theme-color($theme, primary);

              .arrow-icon {
                transform: translateX(3px);
              }
            }
          }
        }
      }

      .article-image {
        position: relative;
        width: 100%;
        height: 200px;
        overflow: hidden;

        @media (max-width: 768px) {
          height: 180px;
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          display: block;
          opacity: 1;
        }

        .image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background: linear-gradient(
                135deg,
                mixins.theme-color($theme, primary) 0%,
                mixins.theme-color($theme, accent-teal) 100%
              );
            }
          }

          &::before {
            content: "";
            position: absolute;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
            animation: shimmer 3s infinite;
          }

          .placeholder-icon {
            font-size: 3.5rem;
            opacity: 0.8;
            z-index: 1;
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
          }
        }

        .category-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          padding: 6px 14px;
          border-radius: map.get(map.get(vars.$layout, border-radius), pill);
          font-size: 11px;
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
          backdrop-filter: blur(10px);
          text-transform: uppercase;
          letter-spacing: 0.05em;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, accent-teal);
              color: white;
            }
          }
        }
      }

      .article-content {
        padding: map.get(vars.$spacing, l);
        display: flex;
        flex-direction: column;
        flex-grow: 1;

        @media (max-width: 768px) {
          padding: map.get(vars.$spacing, m);
        }

        h4 {
          font-size: map.get(map.get(vars.$fonts, sizes), large);
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
          margin: 0 0 map.get(vars.$spacing, m) 0;
          line-height: 1.3;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }

        .article-preview {
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

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }

        .article-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: map.get(vars.$spacing, xs);
          margin-bottom: map.get(vars.$spacing, m);
          font-size: map.get(map.get(vars.$fonts, sizes), small);

          @media (max-width: 768px) {
            font-size: 12px;
          }

          .meta-author {
            font-weight: map.get(map.get(vars.$fonts, weights), medium);

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-secondary);
              }
            }
          }

          .meta-date,
          .meta-readtime {
            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-tertiary);
              }
            }
          }

          .meta-separator {
            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-tertiary);
                opacity: 0.5;
              }
            }
          }
        }

        .article-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          gap: map.get(vars.$spacing, m);

          @media (max-width: 768px) {
            flex-direction: column;
            align-items: stretch;
            gap: map.get(vars.$spacing, s);
          }

          .article-tags {
            display: flex;
            flex-wrap: wrap;
            gap: map.get(vars.$spacing, xs);

            .article-tag {
              padding: 4px 12px;
              border-radius: map.get(map.get(vars.$layout, border-radius), pill);
              font-size: 12px;
              font-weight: map.get(map.get(vars.$fonts, weights), medium);
              letter-spacing: 0.03em;

              @each $theme in ("light", "dark") {
                .theme-#{$theme} & {
                  background-color: mixins.theme-color($theme, accent-teal);
                  color: white;
                  border: none;
                }
              }
            }
          }

          .read-now-button {
            display: flex;
            align-items: center;
            gap: map.get(vars.$spacing, xs);
            padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
            border-radius: map.get(map.get(vars.$layout, border-radius), pill);
            border: none;
            cursor: pointer;
            font-weight: map.get(map.get(vars.$fonts, weights), bold);
            font-size: map.get(map.get(vars.$fonts, sizes), small);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: linear-gradient(90deg, #1ebea5 0%, #0e9aa7 100%);
            color: white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

            .arrow-icon {
              font-size: 1.1rem;
              transition: transform 0.3s ease;
            }

            @media (max-width: 768px) {
              width: 100%;
              justify-content: center;
            }

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                background: mixins.theme-gradient($theme, sidebar-active);
                color: white;

                &:hover {
                  filter: brightness(1.08);
                  transform: translateY(-2px) scale(1.03);

                  .arrow-icon {
                    transform: translateX(4px);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

// Nichts gefunden Anzeige
.no-articles-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: map.get(vars.$spacing, xxl) map.get(vars.$spacing, xl);
  text-align: center;
  min-height: 300px;

  .no-articles-icon {
    font-size: 4rem;
    margin-bottom: map.get(vars.$spacing, l);
    opacity: 0.6;
  }

  h4 {
    font-size: map.get(map.get(vars.$fonts, sizes), xl);
    font-weight: map.get(map.get(vars.$fonts, weights), bold);
    margin: 0 0 map.get(vars.$spacing, m) 0;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
      }
    }
  }

  p {
    font-size: map.get(map.get(vars.$fonts, sizes), medium);
    margin: 0;
    max-width: 400px;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
      }
    }
  }

  @media (max-width: 768px) {
    padding: map.get(vars.$spacing, xl) map.get(vars.$spacing, m);
    min-height: 250px;

    .no-articles-icon {
      font-size: 3rem;
    }

    h4 {
      font-size: map.get(map.get(vars.$fonts, sizes), large);
    }

    p {
      font-size: map.get(map.get(vars.$fonts, sizes), small);
    }
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}
</style>
