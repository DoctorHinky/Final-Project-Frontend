<template>
  <section class="section preview-section" id="sub">
    <div class="section-header">
      <h2>Entdecke unsere neuesten Artikel</h2>
      <div class="header-decoration"></div>
      <p class="section-subtitle">Tauche ein in spannende Geschichten und lehrreiche Inhalte für die ganze Familie</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Artikel werden geladen...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Fehler beim Laden</h3>
      <p>{{ error }}</p>
      <button @click="loadPreviews" class="retry-button">Erneut versuchen</button>
    </div>

    <!-- Article Preview Cards -->
    <div v-else-if="articles.length > 0" class="preview-container">
      <div
        v-for="(article, index) in articles"
        :key="article.id"
        :class="['preview-card', `flip-${getFlipDirection(index)}`]"
        @click="handleCardClick(article)"
      >
        <!-- Article Image -->
        <div class="card-image">
          <div v-if="!article.image" class="image-placeholder">
            <div class="placeholder-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="48"
                height="48"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21,15 16,10 5,21"></polyline>
              </svg>
            </div>
            <span class="placeholder-text">Kein Bild verfügbar</span>
          </div>

          <img
            v-else
            :src="article.image"
            :alt="article.title"
            loading="lazy"
            decoding="async"
            @error="handleImageError($event, article.id)"
          />

          <!-- Category Badge -->
          <div class="category-badge">
            {{ formatCategory(article.category) }}
          </div>

          <!-- Certified Author Badge -->
          <div v-if="article.isCertifiedAuthor" class="certified-badge">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M9 12l2 2 4-4"></path>
              <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
              <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
            </svg>
            <span>Zertifiziert</span>
          </div>

          <!-- Click-to-Read Overlay -->
          <div class="click-overlay">
            <div class="click-content">
              <div class="click-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="32"
                  height="32"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </div>
              <span>Jetzt lesen</span>
            </div>
          </div>
        </div>

        <!-- Card Content -->
        <div class="card-content">
          <!-- Meta Information -->
          <div class="article-meta">
            <span class="meta-author">{{ article.author || "Unbekannt" }}</span>
            <span class="meta-separator">•</span>
            <span class="meta-date">{{ formatDate(article.createdAt) }}</span>
          </div>

          <!-- Title -->
          <h3 class="card-title">{{ article.title }}</h3>

          <!-- Description -->
          <p class="card-description">{{ article.quickDescription }}</p>

          <!-- Tags -->
          <div class="card-tags" v-if="article.tags && article.tags.length > 0">
            <span v-for="(tag, idx) in article.tags.slice(0, 3)" :key="idx" class="card-tag">
              {{ tag }}
            </span>
            <span v-if="article.tags.length > 3" class="tag-more"> +{{ article.tags.length - 3 }} </span>
          </div>

          <!-- Read Button -->
          <button class="read-button" @click.stop="handleCardClick(article)">
            <span>Artikel lesen</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">📚</div>
      <h3>Keine Artikel verfügbar</h3>
      <p>Derzeit sind keine Artikel zum Anzeigen verfügbar.</p>
    </div>

    <!-- Call to Action -->
    <div class="cta-section">
      <h3>Bereit für mehr spannende Inhalte?</h3>
      <p>Melde dich an und entdecke unsere komplette Artikel-Bibliothek</p>
      <button class="cta-button" @click="redirectToLogin">
        <span>Jetzt kostenlos anmelden</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
          <polyline points="10 17 15 12 10 7"></polyline>
          <line x1="15" y1="12" x2="3" y2="12"></line>
        </svg>
      </button>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { type PostPreviewItem } from "@/services/post.service";

export default defineComponent({
  name: "PreviewSection",
  setup() {
    const router = useRouter();

    // Reactive State
    const loading = ref(false);
    const error = ref<string | null>(null);
    const articles = ref<PostPreviewItem[]>([]);

    // ScrollObserver
    let observer: IntersectionObserver | null = null;

    // Load artikel previews
    const loadPreviews = async () => {
      loading.value = true;
      error.value = null;

      try {
        // TODO: Sobald Public-Endpunkt verfügbar ist, diesen verwenden:
        // const response = await postService.getPublicPostPreviews(1, 3);

        // MOCK-DATEN für Landingpage (bis Public-Endpunkt verfügbar)
        const mockArticles: PostPreviewItem[] = [
          {
            id: "mock-1",
            title: "Spannende Abenteuer für die ganze Familie",
            quickDescription:
              "Entdecke aufregende Geschichten und lehrreiche Inhalte, die Kinder und Erwachsene gleichermaßen begeistern. Von magischen Welten bis hin zu wissenschaftlichen Wundern.",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop",
            author: "Familie Müller",
            category: "FAMILY",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Gestern
            tags: ["Familie", "Abenteuer", "Lernen"],
            isCertifiedAuthor: true,
          },
          {
            id: "mock-2",
            title: "Kreative Bastelprojekte für Regentage",
            quickDescription:
              "Verwandle langweilige Nachmittage in kreative Workshops. Mit einfachen Materialien entstehen wunderbare Kunstwerke und unvergessliche Erinnerungen.",
            image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=300&fit=crop",
            author: "Anna Schmidt",
            category: "EDUCATION",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // Vor 2 Tagen
            tags: ["Basteln", "Kreativität", "DIY"],
            isCertifiedAuthor: false,
          },
          {
            id: "mock-3",
            title: "Gesunde Ernährung spielerisch vermitteln",
            quickDescription:
              "Wie du deinen Kindern gesunde Ernährung schmackhaft machst. Praktische Tipps, leckere Rezepte und spielerische Ansätze für mehr Freude am Essen.",
            image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&h=300&fit=crop",
            author: "Dr. Sarah Weber",
            category: "HEALTH",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // Vor 3 Tagen
            tags: ["Gesundheit", "Ernährung", "Kinder"],
            isCertifiedAuthor: true,
          },
        ];

        // Simuliere API-Response-Format
        articles.value = mockArticles;
      } catch (err) {
        error.value = err instanceof Error ? err.message : "Unbekannter Fehler beim Laden der Artikel";
        console.error("Error loading article previews:", err);
      } finally {
        loading.value = false;
      }
    };

    // Setup IntersectionObserver für Scroll-Animationen
    const setupScrollObserver = () => {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Wenn Section sichtbar wird, alle Cards animieren
              const cards = entry.target.querySelectorAll(".preview-card");
              cards.forEach((card, index) => {
                setTimeout(() => {
                  card.classList.add("visible");
                }, index * 200); // Staggered animation
              });
            }
          });
        },
        { threshold: 0.1 }
      );

      // Section beobachten
      const section = document.querySelector(".preview-section");
      if (section) {
        observer.observe(section);
      }
    };

    // Get flip direction für unterschiedliche Animationen
    const getFlipDirection = (index: number): string => {
      const directions = ["left", "bottom", "right"];
      return directions[index % directions.length];
    };

    // Handle card click → redirect to login
    const handleCardClick = (article: PostPreviewItem) => {
      console.log("Card clicked:", article.title);
      redirectToLogin();
    };

    // Redirect to login
    const redirectToLogin = () => {
      router.push("/login-register");
    };

    // Handle image error
    const handleImageError = (event: Event, articleId: string) => {
      const img = event.target as HTMLImageElement;
      console.warn(`Fehler beim Laden des Bildes für Artikel ${articleId}:`, img.src);
      // Bild wird durch CSS-Fallback ersetzt
    };

    // Format category
    const formatCategory = (category: string): string => {
      const categoryMap: Record<string, string> = {
        EDUCATION: "Bildung",
        ENTERTAINMENT: "Unterhaltung",
        FAMILY: "Familie",
        CULTURE: "Kultur",
        NATURE: "Natur",
        RAISING_CHILDREN: "Kindererziehung",
        TECHNOLOGY: "Technologie",
        HEALTH: "Gesundheit",
        LIFESTYLE: "Lifestyle",
        TRAVEL: "Reisen",
        FOOD: "Essen",
        FITNESS: "Fitness",
        OTHER: "Sonstiges",
      };
      return categoryMap[category] || "Sonstiges";
    };

    // Format date
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Heute";
      if (diffDays === 1) return "Gestern";
      if (diffDays < 7) return `vor ${diffDays} Tagen`;

      return date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    // Lifecycle
    onMounted(() => {
      loadPreviews();
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        setupScrollObserver();

        // Fallback: Wenn Cards bereits im Viewport sind, sofort anzeigen
        const cards = document.querySelectorAll(".preview-card");
        if (cards.length > 0) {
          const rect = cards[0].getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            cards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add("visible");
              }, index * 200);
            });
          }
        }
      }, 100);
    });

    onBeforeUnmount(() => {
      if (observer) {
        observer.disconnect();
      }
    });

    return {
      // State
      loading,
      error,
      articles,

      // Methods
      loadPreviews,
      getFlipDirection,
      handleCardClick,
      redirectToLogin,
      handleImageError,
      formatCategory,
      formatDate,
    };
  },
});
</script>

<style lang="scss">
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;
@use "@/style/base/animations" as animations;

.preview-section {
  @include animations.scroll-fade-in;
  padding: 5rem 0;
  position: relative;
  overflow: hidden;

  .section-header {
    text-align: center;
    margin-bottom: 4rem;
    position: relative;

    h2 {
      font-size: map.get(map.get(vars.$fonts, sizes), xxxl);
      font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
      position: relative;
      display: inline-block;
      margin-bottom: 1rem;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: linear-gradient(
            90deg,
            mixins.theme-color($theme, accent-green) 0%,
            mixins.theme-color($theme, accent-teal) 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      }

      @media (max-width: 768px) {
        font-size: map.get(map.get(vars.$fonts, sizes), xxl);
      }
    }

    .header-decoration {
      width: 80px;
      height: 4px;
      border-radius: 2px;
      margin: 0 auto 1.5rem;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: linear-gradient(
            90deg,
            mixins.theme-color($theme, accent-green) 0%,
            mixins.theme-color($theme, accent-teal) 100%
          );
        }
      }
    }

    .section-subtitle {
      font-size: map.get(map.get(vars.$fonts, sizes), large);
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;

      @media (max-width: 768px) {
        font-size: map.get(map.get(vars.$fonts, sizes), medium);
        padding: 0 map.get(vars.$spacing, m);
      }

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  // Loading State
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: map.get(vars.$spacing, xxl);
    text-align: center;

    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 3px solid;
      border-radius: 50%;
      margin-bottom: map.get(vars.$spacing, m);
      animation: spin 1s linear infinite;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          border-color: mixins.theme-color($theme, border-light);
          border-top-color: mixins.theme-color($theme, accent-green);
        }
      }
    }

    p {
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  // Error State
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: map.get(vars.$spacing, xxl);
    text-align: center;

    .error-icon {
      font-size: 3rem;
      margin-bottom: map.get(vars.$spacing, m);
    }

    h3 {
      margin-bottom: map.get(vars.$spacing, s);
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    p {
      margin-bottom: map.get(vars.$spacing, l);
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }

    .retry-button {
      padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      border: none;
      cursor: pointer;
      transition: all 0.3s;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, primary);
          color: white;

          &:hover {
            transform: translateY(-2px);
            @include mixins.shadow("small", $theme);
          }
        }
      }
    }
  }

  // Empty State
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: map.get(vars.$spacing, xxl);
    text-align: center;

    .empty-icon {
      font-size: 4rem;
      margin-bottom: map.get(vars.$spacing, m);
    }

    h3 {
      margin-bottom: map.get(vars.$spacing, s);
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    p {
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  // Preview Cards Container
  .preview-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: map.get(vars.$spacing, xl);
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 map.get(vars.$spacing, m);

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: map.get(vars.$spacing, l);
      padding: 0 map.get(vars.$spacing, s);
    }
  }

  // Preview Cards mit unterschiedlichen Flip-Animationen
  .preview-card {
    position: relative;
    border-radius: map.get(map.get(vars.$layout, border-radius), large);
    cursor: pointer;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    opacity: 0;
    transform: translateY(50px);

    // CSS-only Fallback Animation
    animation: fadeInUp 0.6s ease-out forwards;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        border: 1px solid mixins.theme-color($theme, border-light);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
    }

    // Staggered CSS animation delays
    &:nth-child(1) {
      animation-delay: 0.2s;
    }

    &:nth-child(2) {
      animation-delay: 0.4s;
    }

    &:nth-child(3) {
      animation-delay: 0.6s;
    }

    // Flip Animationen (nur für JavaScript-Enhanced)
    &.flip-left:not(.visible) {
      transform: translateX(-100px) rotateY(-30deg);
      opacity: 0;
      animation: none; // Disable CSS animation when JS takes over
    }

    &.flip-bottom:not(.visible) {
      transform: translateY(100px) scale(0.8);
      opacity: 0;
      animation: none;
    }

    &.flip-right:not(.visible) {
      transform: translateX(100px) rotateY(30deg);
      opacity: 0;
      animation: none;
    }

    // Visible state (JavaScript-Enhanced)
    &.visible {
      opacity: 1;
      transform: translateX(0) translateY(0) rotateY(0) scale(1);
      animation: none; // Remove CSS animation when JS animation is applied
    }

    // Staggered JS animation delays (overrides CSS when visible)
    &:nth-child(1).visible {
      transition-delay: 0.1s;
    }

    &:nth-child(2).visible {
      transition-delay: 0.3s;
    }

    &:nth-child(3).visible {
      transition-delay: 0.5s;
    }

    &:hover {
      transform: translateY(-12px) scale(1.02);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border-color: transparent;
        }
      }

      .card-image img {
        transform: scale(1.1);
      }

      .click-overlay {
        opacity: 1;
      }
    }

    // Card Image
    .card-image {
      position: relative;
      width: 100%;
      height: 250px;
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
      }

      .image-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: map.get(vars.$spacing, s);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            color: mixins.theme-color($theme, text-tertiary);
          }
        }

        .placeholder-icon {
          opacity: 0.5;
        }

        .placeholder-text {
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          opacity: 0.7;
        }
      }

      // Category Badge
      .category-badge {
        position: absolute;
        top: map.get(vars.$spacing, s);
        left: map.get(vars.$spacing, s);
        padding: 6px 12px;
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        font-size: 12px;
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        backdrop-filter: blur(10px);
        z-index: 2;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: rgba(mixins.theme-color($theme, accent-green), 0.9);
            color: white;
          }
        }
      }

      // Certified Badge
      .certified-badge {
        position: absolute;
        top: map.get(vars.$spacing, s);
        right: map.get(vars.$spacing, s);
        padding: 6px 10px;
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        font-size: 11px;
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        gap: 4px;
        z-index: 2;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: rgba(255, 215, 0, 0.9);
            color: #333;
          }
        }

        svg {
          width: 12px;
          height: 12px;
        }
      }

      // Click Overlay
      .click-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 3;

        .click-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: map.get(vars.$spacing, s);
          color: white;
          text-align: center;

          .click-icon {
            padding: map.get(vars.$spacing, m);
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
          }

          span {
            font-weight: map.get(map.get(vars.$fonts, weights), medium);
            font-size: map.get(map.get(vars.$fonts, sizes), medium);
          }
        }
      }
    }

    // Card Content
    .card-content {
      padding: map.get(vars.$spacing, l);
      display: flex;
      flex-direction: column;
      flex-grow: 1;

      @media (max-width: 768px) {
        padding: map.get(vars.$spacing, m);
      }
    }

    // Article Meta
    .article-meta {
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, xs);
      margin-bottom: map.get(vars.$spacing, m);
      font-size: map.get(map.get(vars.$fonts, sizes), small);

      .meta-author {
        font-weight: map.get(map.get(vars.$fonts, weights), medium);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, accent-green);
          }
        }
      }

      .meta-date {
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

    // Card Title
    .card-title {
      margin-bottom: map.get(vars.$spacing, m);
      font-size: map.get(map.get(vars.$fonts, sizes), xl);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;

      @media (max-width: 768px) {
        font-size: map.get(map.get(vars.$fonts, sizes), large);
      }

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    // Card Description
    .card-description {
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

    // Card Tags
    .card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: map.get(vars.$spacing, xs);
      margin-bottom: map.get(vars.$spacing, l);

      .card-tag {
        padding: 4px 10px;
        border-radius: map.get(map.get(vars.$layout, border-radius), small);
        font-size: 12px;
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        transition: all 0.2s;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            color: mixins.theme-color($theme, text-secondary);
            border: 1px solid mixins.theme-color($theme, border-light);
          }
        }
      }

      .tag-more {
        padding: 4px 10px;
        border-radius: map.get(map.get(vars.$layout, border-radius), small);
        font-size: 12px;
        font-weight: map.get(map.get(vars.$fonts, weights), medium);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, accent-teal);
            color: white;
          }
        }
      }
    }

    // Read Button
    .read-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: map.get(vars.$spacing, s);
      padding: map.get(vars.$spacing, m) map.get(vars.$spacing, l);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-size: map.get(map.get(vars.$fonts, sizes), medium);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      cursor: pointer;
      border: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      margin-top: auto;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, primary);
          color: white;

          &::before {
            content: "";
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
            transform: translateY(-3px);

            &::before {
              width: 300px;
              height: 300px;
            }
          }
        }
      }

      span,
      svg {
        z-index: 1;
        position: relative;
      }
    }
  }

  // Call to Action Section
  .cta-section {
    text-align: center;
    margin-top: map.get(vars.$spacing, xxl);
    padding: map.get(vars.$spacing, xxl) map.get(vars.$spacing, m);
    border-radius: map.get(map.get(vars.$layout, border-radius), large);
    position: relative;
    overflow: hidden;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background: mixins.theme-gradient($theme, secondary);
        border: 1px solid mixins.theme-color($theme, border-light);
      }
    }

    &::before {
      content: "";
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      opacity: 0.1;
      background: radial-gradient(circle, transparent 0%, rgba(255, 255, 255, 0.1) 100%);
      animation: rotate 20s linear infinite;
    }

    h3 {
      margin-bottom: map.get(vars.$spacing, m);
      font-size: map.get(map.get(vars.$fonts, sizes), xxl);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);

      @media (max-width: 768px) {
        font-size: map.get(map.get(vars.$fonts, sizes), xl);
      }

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    p {
      margin-bottom: map.get(vars.$spacing, xl);
      font-size: map.get(map.get(vars.$fonts, sizes), large);
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;

      @media (max-width: 768px) {
        font-size: map.get(map.get(vars.$fonts, sizes), medium);
      }

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }

    .cta-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: map.get(vars.$spacing, s);
      padding: map.get(vars.$spacing, l) map.get(vars.$spacing, xxl);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-size: map.get(map.get(vars.$fonts, sizes), large);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      cursor: pointer;
      border: none;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      z-index: 2;

      @media (max-width: 768px) {
        padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
        font-size: map.get(map.get(vars.$fonts, sizes), medium);
      }

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, primary);
          color: white;
          box-shadow: 0 10px 20px rgba(mixins.theme-color($theme, accent-teal), 0.3);

          &:hover {
            transform: translateY(-5px) scale(1.05);
            box-shadow: 0 15px 30px rgba(mixins.theme-color($theme, accent-teal), 0.4);
          }
        }
      }
    }
  }
}

// Animationen
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

// Responsive-Verbesserungen für die Section
@media (max-width: 768px) {
  .preview-section {
    padding: 3rem 0;

    .section-header {
      margin-bottom: 3rem;
    }

    .preview-container {
      .preview-card {
        // Auf Mobile weniger starke Transformationen
        &.flip-left {
          transform: translateX(-50px) rotateY(-15deg);
        }

        &.flip-right {
          transform: translateX(50px) rotateY(15deg);
        }

        &.flip-bottom {
          transform: translateY(50px) scale(0.9);
        }

        &:hover {
          transform: translateY(-6px) scale(1.01);
        }
      }
    }

    .cta-section {
      margin-top: map.get(vars.$spacing, xl);
      padding: map.get(vars.$spacing, xl) map.get(vars.$spacing, m);
    }
  }
}
</style>
