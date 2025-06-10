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
            <XMarkIcon class="remove-icon" />
          </button>
          
          <!-- Status-Badge -->
          <div class="status-badge" :class="article.status">
            {{ article.status === 'completed' ? 'Abgeschlossen' : 'Gelesen' }}
          </div>
          
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
          </div>

          <div class="card-content">
            <!-- Meta-Informationen direkt nach dem Bild -->
            <div class="article-meta">
              <span class="meta-category">{{ article.category }}</span>
              <span class="meta-separator">•</span>
              <span class="meta-author">{{ article.author || 'Unbekannt' }}</span>
              <span class="meta-separator">•</span>
              <span class="meta-date">{{ formatDate(article.createdAt) }}</span>
            </div>

            <!-- Titel -->
            <h3 class="card-title">{{ article.title }}</h3>
            
            <!-- Beschreibung -->
            <p class="card-preview">{{ article.quickDescription }}</p>

            <!-- Lesehistorie-Info -->
            <div class="read-info">
              <div class="last-read">
                <EyeIcon class="read-icon" />
                <span>{{ article.lastRead }}</span>
              </div>
              <div v-if="article.status === 'completed'" class="completion-info">
                <CheckCircleIcon class="completion-icon" />
                <span>Abgeschlossen</span>
              </div>
            </div>

            <!-- Tags -->
            <div class="card-tags" v-if="article.tags && article.tags.length > 0">
              <span 
                v-for="(tag, idx) in article.tags" 
                :key="idx" 
                class="card-tag"
                @click.stop="addFilterTag(tag)"
              >
                {{ tag }}
              </span>
            </div>

            <!-- Aktionsbuttons -->
            <div class="card-actions">
              <button class="action-button read" @click.stop="openArticleReader(article)">
                <BookOpenIcon class="action-icon" />
                <span>Weiterlesen</span>
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
            <XMarkIcon class="remove-icon" />
          </button>
          
          <!-- Status-Badge -->
          <div class="status-badge" :class="article.status">
            {{ article.status === 'completed' ? 'Abgeschlossen' : 'Gelesen' }}
          </div>
          
          <!-- Artikel-Bild in Listenansicht -->
          <div class="list-item-image">
            <!-- Loading-State oder kein Bild -->
            <div 
              v-if="loadingImages.has(article.id) || !getImageUrl(article)" 
              class="image-loading"
            >
              <div class="loading-spinner"></div>
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
          </div>
          
          <div class="list-item-main">
            <!-- Meta-Informationen -->
            <div class="article-meta">
              <span class="meta-category">{{ article.category }}</span>
              <span class="meta-separator">•</span>
              <span class="meta-author">{{ article.author || 'Unbekannt' }}</span>
              <span class="meta-separator">•</span>
              <span class="meta-date">{{ formatDate(article.createdAt) }}</span>
            </div>
            
            <h3 class="card-title">{{ article.title }}</h3>
            <p class="card-preview">{{ article.quickDescription }}</p>

            <!-- Lesehistorie-Info -->
            <div class="read-info">
              <div class="last-read">
                <EyeIcon class="read-icon" />
                <span>{{ article.lastRead }}</span>
              </div>
              <div v-if="article.status === 'completed'" class="completion-info">
                <CheckCircleIcon class="completion-icon" />
                <span>Abgeschlossen</span>
              </div>
            </div>
          </div>

          <div class="list-item-actions">
            <button class="action-button read" @click.stop="openArticleReader(article)">
              <BookOpenIcon class="action-icon" />
              <span>Weiterlesen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, ref, onMounted, watch } from 'vue';
import { 
  EyeIcon, 
  CheckCircleIcon, 
  BookOpenIcon, 
  XMarkIcon 
} from '@heroicons/vue/24/outline';
import ViewOptions from './ViewOptions.vue';
import type { MyArticleItem } from '@/types/MyArticles.types';
import { postService } from '@/services/post.service';

export default defineComponent({
  name: 'ArticlesList',
  components: {
    ViewOptions,
    EyeIcon,
    CheckCircleIcon,
    BookOpenIcon,
    XMarkIcon
  },
  props: {
    filteredArticles: {
      type: Array as PropType<MyArticleItem[]>,
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
    'remove-article',
    'add-filter-tag'
  ],
  setup(props, { emit }) {
    // State für Error-Tracking
    const imageErrors = ref(new Set<string>());
    
    // Cache für geladene Artikel-Bilder
    const articleImages = ref(new Map<string, string | null>());
    const loadingImages = ref(new Set<string>());
    
    const openArticleReader = (article: MyArticleItem) => {
      emit('open-article', article);
    };

    const removeArticle = (articleId: string) => {
      emit('remove-article', articleId);
    };

    const addFilterTag = (tag: string) => {
      emit('add-filter-tag', tag);
    };

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    // Artikel-Bilder von Post-API nachladen
    const loadArticleImage = async (postId: string): Promise<string | null> => {
      // Bereits geladen?
      if (articleImages.value.has(postId)) {
        return articleImages.value.get(postId) || null;
      }

      // Bereits am Laden?
      if (loadingImages.value.has(postId)) {
        return null;
      }

      try {
        loadingImages.value.add(postId);
        console.log(`🔄 Lade Bild für Post ${postId}...`);

        // Vollständigen Post laden (hat das Bild)
        const postResponse = await postService.getPostById(postId);
        const imageUrl = postResponse.data.image;

        // In Cache speichern
        articleImages.value.set(postId, imageUrl);
        
        console.log(`✅ Bild geladen für Post ${postId}:`, imageUrl);
        return imageUrl;
        
      } catch (error) {
        console.warn(`❌ Fehler beim Laden des Bildes für Post ${postId}:`, error);
        articleImages.value.set(postId, null); // Fehler cachen
        return null;
      } finally {
        loadingImages.value.delete(postId);
      }
    };

    // ÜBERARBEITET: Nur echte Bilder zurückgeben, keine Fallbacks
    const getImageUrl = (article: MyArticleItem) => {
      const postId = article.id;

      // 1. Prüfe ob echtes Bild vom Backend verfügbar
      if (article.image && article.image.trim() !== '') {
        console.log(`✅ Original-Bild gefunden für "${article.title}":`, article.image);
        return article.image;
      }

      // 2. Prüfe Cache für nachgeladene Bilder
      if (articleImages.value.has(postId)) {
        const cachedImage = articleImages.value.get(postId);
        if (cachedImage) {
          console.log(`📦 Cache-Bild für "${article.title}":`, cachedImage);
          return cachedImage;
        }
        // Wenn im Cache aber null → kein Bild verfügbar
        return null;
      }

      // 3. Starte asynchrones Nachladen (ohne await!)
      if (!loadingImages.value.has(postId)) {
        loadArticleImage(postId).then(() => {
          // Force re-render nach dem Laden
          // Vue's Reaktivität sorgt dafür, dass sich das Bild automatisch aktualisiert
        });
      }

      // 4. Während des Ladens: null zurückgeben (Loading-State wird angezeigt)
      return null;
    };

    // Beim Laden der Komponente alle Bilder vorladen
    const preloadArticleImages = async () => {
      if (!props.filteredArticles || props.filteredArticles.length === 0) return;

      console.log(`🚀 Starte Vorladung von ${props.filteredArticles.length} Artikel-Bildern...`);
      
      // Parallel alle Bilder laden (max 5 gleichzeitig)
      const batchSize = 5;
      for (let i = 0; i < props.filteredArticles.length; i += batchSize) {
        const batch = props.filteredArticles.slice(i, i + batchSize);
        await Promise.allSettled(
          batch.map(article => loadArticleImage(article.id))
        );
      }
      
      console.log(`✅ Vorladung abgeschlossen. ${articleImages.value.size} Bilder geladen.`);
    };

    // VERBESSERT: Einfacheres Error-Handling
    const handleImageError = (event: Event, articleId: string) => {
      const img = event.target as HTMLImageElement;
      
      console.warn(`Fehler beim Laden des Bildes für Artikel ${articleId}:`, {
        src: img.src,
        articleId: articleId
      });
      
      // Markiere diesen Artikel als fehlerhaft
      imageErrors.value.add(articleId);
      
      // Setze im Cache auf null um Loading-State zu zeigen
      articleImages.value.set(articleId, null);
    };

    // Bild erfolgreich geladen
    const handleImageLoad = (event: Event, articleId: string) => {
      const img = event.target as HTMLImageElement;
      
      console.log(`✅ Bild erfolgreich geladen für Artikel ${articleId}:`, {
        src: img.src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      });
      
      // Entferne Error-Status falls vorhanden
      imageErrors.value.delete(articleId);
    };

    // DEBUG: Artikel-Daten ausgeben
    const debugArticleImages = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('=== ARTIKEL BILD-DEBUG ===');
        props.filteredArticles.forEach((article, index) => {
          console.log(`Artikel ${index + 1}: "${article.title}"`, {
            id: article.id,
            image: article.image,
            hasValidImage: !!getImageUrl(article),
            finalImageUrl: getImageUrl(article),
            inCache: articleImages.value.has(article.id),
            cachedImage: articleImages.value.get(article.id),
            isLoading: loadingImages.value.has(article.id)
          });
        });
        console.log('=== END DEBUG ===');
      }
      return '';
    };

    // Beim Mount und bei Artikel-Änderungen vorladen
    onMounted(() => {
      debugArticleImages();
      preloadArticleImages();
    });

    watch(() => props.filteredArticles, () => {
      debugArticleImages();
      preloadArticleImages();
    }, { deep: true });

    return {
      openArticleReader,
      removeArticle,
      addFilterTag,
      formatDate,
      getImageUrl,
      handleImageError,
      handleImageLoad,
      debugArticleImages,
      imageErrors,
      articleImages, // Für Debugging
      loadingImages, // Für Loading-States
      loadArticleImage,
      preloadArticleImages
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
              opacity: 1;
            }
          }
        }
      }

      // Status-Badge
      .status-badge {
        position: absolute;
        top: map.get(vars.$spacing, s);
        left: map.get(vars.$spacing, s);
        padding: 4px 12px;
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        font-size: 12px;
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        z-index: 5;
        backdrop-filter: blur(10px);

        &.reading {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background: rgba(59, 130, 246, 0.9);
              color: white;
            }
          }
        }

        &.completed {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background: rgba(74, 210, 149, 0.9);
              color: white;
            }
          }
        }
      }

      // Lösch-Kreuz oben rechts
      .remove-article {
        position: absolute;
        top: map.get(vars.$spacing, s);
        right: map.get(vars.$spacing, s);
        width: 32px;
        height: 32px;
        border: none;
        cursor: pointer;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        transition: all 0.2s ease-in-out;
        backdrop-filter: blur(10px);
        
        // Standard-Zustand: unsichtbar
        opacity: 0;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: rgba(0, 0, 0, 0.3);
            color: white;

            &:hover {
              background-color: #dc3545;
              transform: scale(1.1);
            }
          }
        }
        
        // Focus für Accessibility
        &:focus {
          opacity: 1;
          outline: 2px solid #007bff;
          outline-offset: 2px;
        }

        .remove-icon {
          width: 16px;
          height: 16px;
        }

        @media (max-width: 768px) {
          opacity: 0.7; // Auf Mobile sichtbarer
        }
      }

      // Artikel-Bild (CLEAN - ohne Placeholder)
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
          display: block;
          opacity: 1;
        }

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

      // Lesehistorie-Info
      .read-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: map.get(vars.$spacing, m);
        font-size: map.get(map.get(vars.$fonts, sizes), small);

        @media (max-width: 768px) {
          font-size: 12px;
          margin-bottom: map.get(vars.$spacing, s);
        }

        .last-read {
          display: flex;
          align-items: center;
          gap: map.get(vars.$spacing, xs);

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }

          .read-icon {
            width: 16px;
            height: 16px;
            opacity: 0.7;
          }
        }

        .completion-info {
          display: flex;
          align-items: center;
          gap: map.get(vars.$spacing, xs);

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, accent-green);
            }
          }

          .completion-icon {
            width: 16px;
            height: 16px;
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
          cursor: pointer;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
              color: mixins.theme-color($theme, text-secondary);
              border: 1px solid transparent;

              &:hover {
                background-color: mixins.theme-color($theme, primary);
                color: white;
                transform: translateY(-2px);
              }
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
          gap: map.get(vars.$spacing, xs);

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

            .action-icon {
              width: 18px;
              height: 18px;
              z-index: 1;
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
              opacity: 1;
            }
          }
        }
      }

      // Status-Badge (Listenansicht)
      .status-badge {
        position: absolute;
        top: map.get(vars.$spacing, s);
        left: map.get(vars.$spacing, s);
        padding: 4px 12px;
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        font-size: 12px;
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        z-index: 5;

        &.reading {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background: rgba(59, 130, 246, 0.1);
              color: #3b82f6;
              border: 1px solid #3b82f6;
            }
          }
        }

        &.completed {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background: rgba(74, 210, 149, 0.1);
              color: #4ad295;
              border: 1px solid #4ad295;
            }
          }
        }
      }

      // Lösch-Kreuz (Listenansicht)
      .remove-article {
        position: absolute;
        top: map.get(vars.$spacing, s);
        right: map.get(vars.$spacing, s);
        width: 32px !important;
        height: 32px;
        border: none;
        cursor: pointer;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        transition: all 0.2s ease-in-out;
        
        opacity: 0;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: rgba(0, 0, 0, 0.3);
            color: white;

            &:hover {
              background-color: #dc3545;
              transform: scale(1.1);
            }
          }
        }
        
        &:focus {
          opacity: 1;
          outline: 2px solid #007bff;
          outline-offset: 2px;
        }

        .remove-icon {
          width: 16px;
          height: 16px;
        }

        @media (max-width: 768px) {
          opacity: 0.7;
        }
      }

      // Artikel-Bild in Listenansicht (CLEAN)
      .list-item-image {
        flex-shrink: 0;
        width: 160px;
        height: 120px;
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);
        overflow: hidden;
        position: relative;

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
          display: block;
          opacity: 1;
        }

        &:hover img {
          transform: scale(1.05);
        }

        .image-loading {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
            }
          }

          .loading-spinner {
            width: 30px;
            height: 30px;
            border: 2px solid transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                border-top-color: mixins.theme-color($theme, primary);
                border-right-color: mixins.theme-color($theme, primary);
              }
            }
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

        // Lesehistorie-Info (Listenansicht)
        .read-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: map.get(map.get(vars.$fonts, sizes), small);

          @media (max-width: 768px) {
            font-size: 12px;
          }

          .last-read {
            display: flex;
            align-items: center;
            gap: map.get(vars.$spacing, xs);

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-secondary);
              }
            }

            .read-icon {
              width: 16px;
              height: 16px;
              opacity: 0.7;
            }
          }

          .completion-info {
            display: flex;
            align-items: center;
            gap: map.get(vars.$spacing, xs);

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, accent-green);
              }
            }

            .completion-icon {
              width: 16px;
              height: 16px;
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
          gap: map.get(vars.$spacing, xs);

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

            .action-icon {
              width: 16px;
              height: 16px;
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
</style>