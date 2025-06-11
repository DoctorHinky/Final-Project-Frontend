<!-- src/components/pages/DashboardPages/Overview/RecommendedArticles.vue -->
<template>
  <div class="section-container recommendations">
    <div class="section-header">
      <h3>Empfohlen für dich</h3>
      <div class="header-subtitle">Basierend auf deinen Interessen</div>
    </div>

    <!-- Liste der empfohlenen Artikel -->
    <div class="recommended-list">
      <div v-for="(article, index) in articles" :key="index" class="recommended-item"
        @click="$emit('open-article', article)">
        <!-- Artikel-Bild -->
        <div class="article-image">
          <!-- Loading-State oder kein Bild -->
          <div 
            v-if="loadingImages.has(article.id) || !getImageUrl(article)" 
            class="image-loading"
          >
            <div class="loading-spinner"></div>
            <span class="loading-text">
              {{ loadingImages.has(article.id) ? 'Lade Bild...' : 'Kein Bild verfügbar' }}
            </span>
          </div>
          
          <!-- Hauptbild -->
          <img 
            v-else
            :src="getImageUrl(article)" 
            :alt="article.title"
            @error="handleImageError($event, article.id)"
            @load="handleImageLoad($event, article.id)"
            loading="lazy"
            decoding="async"
          />
          
          <!-- Kategorie-Badge -->
          <div class="category-badge" v-if="article.category">{{ article.category }}</div>
        </div>

        <div class="article-content">
          <h4>{{ article.title }}</h4>
          <p class="article-preview">{{ article.preview }}</p>
          
          <div class="article-meta">
            <span class="meta-author">{{ article.author || 'Unbekannt' }}</span>
            <span class="meta-separator">•</span>
            <span class="meta-date">{{ formatDate(article.date) }}</span>
            <span class="meta-separator">•</span>
            <span class="meta-readtime">{{ article.readTime || '10 min' }}</span>
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
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, ref, watch, onMounted } from 'vue';
import { postService } from '@/services/post.service';

interface Article {
  id: number;
  title: string;
  preview?: string;
  category?: string;
  author?: string;
  date?: string;
  coverImage?: string;
  image?: string; // Backend-Bild
  readTime?: string;
  tags?: string[];
}

export default defineComponent({
  name: 'RecommendedArticles',
  props: {
    articles: {
      type: Array as PropType<Article[]>,
      required: true
    }
  },
  emits: ['open-article'],
  setup(props) {
    // State für Bild-Management (identisch zu ArticlesList)
    const imageErrors = ref(new Set<string>());
    const articleImages = ref(new Map<string, string | null>());
    const loadingImages = ref(new Set<string>());

    // Datum formatieren (deutsche Lokalisierung)
    const formatDate = (dateString?: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    // Artikel-Bilder von Post-API nachladen (VERBESSERT mit robustem Error-Handling)
    const loadArticleImage = async (postId: string): Promise<string | null> => {
      // Bereits geladen?
      if (articleImages.value.has(postId)) {
        return articleImages.value.get(postId) || null;
      }

      // Bereits am Laden?
      if (loadingImages.value.has(postId)) {
        return null;
      }

      // VALIDIERUNG: Ungültige IDs abfangen
      if (!postId || postId.trim() === '' || postId === 'undefined' || postId === 'null') {
        console.warn(`⚠️ Ungültige Post-ID für empfohlenen Artikel: "${postId}"`);
        articleImages.value.set(postId, null);
        return null;
      }

      try {
        loadingImages.value.add(postId);

        // Vollständigen Post laden (hat das Bild)
        const postResponse = await postService.getPostById(postId);
        const imageUrl = postResponse.data.image;

        // In Cache speichern
        articleImages.value.set(postId, imageUrl);
        
        return imageUrl;
        
      } catch (error: any) {
        // SPEZIFISCHES ERROR-HANDLING für verschiedene Fehlertypen
        if (error.response?.status === 400 || error.response?.data?.message?.includes('not found')) {
          console.info(`ℹ️ Empfohlener Post ${postId} nicht in Datenbank gefunden (möglicherweise Mock-Daten)`);
        } else if (error.response?.status === 404) {
          console.info(`ℹ️ Post ${postId} existiert nicht mehr`);
        } else {
          console.warn(`❌ Unerwarteter Fehler beim Laden des Bildes für Post ${postId}:`, error.message);
        }
        
        // Fehler cachen um weitere Anfragen zu vermeiden
        articleImages.value.set(postId, null);
        return null;
      } finally {
        loadingImages.value.delete(postId);
      }
    };

    // Bild-URL ermitteln (VERBESSERT mit Mock-Daten Support)
    const getImageUrl = (article: Article) => {
      const postId = String(article.id);

      // 1. Prüfe ob echtes Bild vom Backend verfügbar
      if (article.image && article.image.trim() !== '') {
        return article.image;
      }

      // 2. Fallback: coverImage aus Props (für Mock-Daten)
      if (article.coverImage && article.coverImage.trim() !== '') {
        return article.coverImage;
      }

      // 3. Prüfe Cache für nachgeladene Bilder
      if (articleImages.value.has(postId)) {
        const cachedImage = articleImages.value.get(postId);
        if (cachedImage) {
          return cachedImage;
        }
        // Wenn im Cache aber null → Backend-Fehler aufgetreten, kein weiterer Versuch
        return null;
      }

      // 4. CONDITIONAL: Nur echte Backend-Anfrage für plausible IDs
      // Vermeidung von 400-Fehlern für offensichtliche Mock-IDs
      const isValidPostId = /^\d+$/.test(postId) && parseInt(postId) > 0 && parseInt(postId) < 1000000;
      
      if (isValidPostId && !loadingImages.value.has(postId)) {
        loadArticleImage(postId).then(() => {
          // Vue's Reaktivität sorgt für automatisches Re-Rendering
        });
      } else if (!isValidPostId) {
        // Für ungültige IDs direkt als "nicht verfügbar" markieren
        articleImages.value.set(postId, null);
        return null;
      }

      // 5. Während des Ladens: null zurückgeben (Loading-State wird angezeigt)
      return null;
    };

    // Error-Handling für Bilder (identisch zu ArticlesList)
    const handleImageError = (event: Event, articleId: string | number) => {
      const img = event.target as HTMLImageElement;
      const postId = String(articleId);
      
      console.warn(`Fehler beim Laden des empfohlenen Artikel-Bildes ${postId}:`, {
        src: img.src,
        articleId: postId
      });
      
      // Markiere diesen Artikel als fehlerhaft
      imageErrors.value.add(postId);
      
      // Setze im Cache auf null um Loading-State zu zeigen
      articleImages.value.set(postId, null);
    };

    // Bild erfolgreich geladen
    const handleImageLoad = (_: Event, articleId: string | number) => {
      const postId = String(articleId);
      // Entferne Error-Status falls vorhanden
      imageErrors.value.delete(postId);
    };

    // Optional: Bilder vorladen wenn Artikel-Liste sich ändert
    const preloadRecommendedImages = async () => {
      if (!props.articles || props.articles.length === 0) return;

      // Parallel alle Bilder laden (max 3 gleichzeitig für empfohlene Artikel)
      const batchSize = 3;
      for (let i = 0; i < props.articles.length; i += batchSize) {
        const batch = props.articles.slice(i, i + batchSize);
        await Promise.allSettled(
          batch.map(article => loadArticleImage(String(article.id)))
        );
      }
    };

    // Beim Ändern der Artikel-Liste Bilder nachladen
    watch(() => props.articles, () => {
      if (props.articles && props.articles.length > 0) {
        // Kurz warten, dann Bilder laden
        setTimeout(preloadRecommendedImages, 100);
      }
    }, { immediate: true });

    return {
      getImageUrl,
      handleImageError,
      handleImageLoad,
      formatDate,
      loadingImages,
      imageErrors,
      articleImages // Für Debugging
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;

// Container-Styles
.section-container {
  padding: map.get(vars.$spacing, xl);
  border-radius: map.get(map.get(vars.$layout, border-radius), large);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, card-bg);
      border: 1px solid mixins.theme-color($theme, border-light);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
                  0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
  }

  // Sektionsüberschrift
  .section-header {
    margin-bottom: map.get(vars.$spacing, xl);

    h3 {
      font-size: map.get(map.get(vars.$fonts, sizes), xl);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      margin: 0 0 map.get(vars.$spacing, xs) 0;
      position: relative;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);

          &::after {
            content: '';
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

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }
}

// Empfehlungen-Grid
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

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          border: 1px solid mixins.theme-color($theme, border-light);

          &:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 
                        0 10px 10px -5px rgba(0, 0, 0, 0.04);
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

      // Artikel-Bild (VERBESSERT - identisch zu ArticlesList)
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

        // Loading-State (NEU - identisch zu ArticlesList)
        .image-loading {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
              color: mixins.theme-color($theme, text-secondary);
            }
          }

          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 12px;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                border-top-color: mixins.theme-color($theme, primary);
                border-right-color: mixins.theme-color($theme, primary);
              }
            }
          }

          .loading-text {
            font-size: 14px;
            opacity: 0.7;
            text-align: center;
          }
        }

        // Fallback für alten Placeholder (falls kein Bild verfügbar)
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
            font-size: 3.5rem;
            opacity: 0.8;
            z-index: 1;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
          }
        }

        // Kategorie-Badge
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

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, accent-teal);
              color: white;
            }
          }
        }
      }

      // Artikel-Inhalt
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

          @each $theme in ('light', 'dark') {
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

          @each $theme in ('light', 'dark') {
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

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-secondary);
              }
            }
          }

          .meta-date, .meta-readtime {
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

              @each $theme in ('light', 'dark') {
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
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);

            .arrow-icon {
              font-size: 1.1rem;
              transition: transform 0.3s ease;
            }

            @media (max-width: 768px) {
              width: 100%;
              justify-content: center;
            }

            @each $theme in ('light', 'dark') {
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

// Animationen
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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