<template>
  <section class="section preview-section" id="sub">
    <!-- Animated Background Elements -->
    <div class="section-bg-effects">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <div class="section-header">
      <div class="header-badge">NEU</div>
      <h2 class="glitch-text" data-text="Entdecke unsere neuesten Artikel">Entdecke unsere neuesten Artikel</h2>
      <div class="header-decoration">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p class="section-subtitle">
        <span class="subtitle-line">Tauche ein in spannende Geschichten</span>
        <span class="subtitle-line">und lehrreiche Inhalte für die ganze Familie</span>
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-container">
        <div class="loading-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <p class="loading-text">Artikel werden geladen...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-content">
        <div class="error-icon">
          <svg viewBox="0 0 24 24" width="48" height="48">
            <path
              fill="currentColor"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
            />
          </svg>
        </div>
        <h3>Oops! Ein Fehler ist aufgetreten</h3>
        <p>{{ error }}</p>
        <button @click="loadPreviews" class="retry-button">
          <span>Erneut versuchen</span>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              fill="currentColor"
              d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Article Preview Cards -->
    <div v-else-if="articles.length > 0" class="preview-container">
      <div
        v-for="(article, index) in articles"
        :key="article.id"
        :class="['preview-card', `card-style-${(index % 3) + 1}`]"
        @click="handleCardClick($event)"
        :style="`--card-index: ${index}`"
      >
        <!-- Glow Effect -->
        <div class="card-glow"></div>

        <!-- Article Image -->
        <div class="card-image">
          <div class="image-wrapper">
            <div v-if="!article.image" class="image-placeholder">
              <div class="placeholder-pattern"></div>
              <div class="placeholder-content">
                <svg viewBox="0 0 24 24" width="48" height="48">
                  <path
                    fill="currentColor"
                    d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
                  />
                </svg>
                <span>Bild wird geladen</span>
              </div>
            </div>

            <img
              v-else
              :src="article.image"
              :alt="article.title"
              loading="lazy"
              decoding="async"
              @error="handleImageError($event, article.id)"
            />

            <!-- Overlay Gradient -->
            <div class="image-overlay"></div>
          </div>

          <!-- Category Badge -->
          <div class="category-badge">
            <span class="badge-icon">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path
                  fill="currentColor"
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                />
              </svg>
            </span>
            <span class="badge-text">{{ formatCategory(article.category) }}</span>
          </div>

          <!-- Hover Content -->
          <div class="hover-content">
            <div class="hover-icon">
              <svg viewBox="0 0 24 24" width="40" height="40">
                <path
                  fill="currentColor"
                  d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                />
              </svg>
            </div>
            <span class="hover-text">Artikel lesen</span>
          </div>
        </div>

        <!-- Card Content -->
        <div class="card-content">
          <!-- Meta Information -->
          <div class="article-meta">
            <div class="meta-author">
              <div class="author-avatar">
                {{ article.author.username?.charAt(0) || "?" }}
              </div>
              <span class="author-name">{{ article.author.username || "Unbekannt" }}</span>
            </div>
            <span class="meta-date">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path
                  fill="currentColor"
                  d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"
                />
              </svg>
              {{ formatDate(article.createdAt) }}
            </span>
          </div>

          <!-- Title with Animation -->
          <h3 class="card-title">
            <span class="title-text">{{ article.title }}</span>
            <span class="title-underline"></span>
          </h3>

          <!-- Description -->
          <p class="card-description">{{ article.quickDescription }}</p>

          <!-- Tags -->
          <div class="card-tags" v-if="article.tags && article.tags.length > 0">
            <span
              v-for="(tag, idx) in article.tags.slice(0, 3)"
              :key="idx"
              class="card-tag"
              :style="`--tag-index: ${idx}`"
            >
              #{{ tag }}
            </span>
            <span v-if="article.tags.length > 3" class="tag-more">
              <span class="more-icon">+</span>
              {{ article.tags.length - 3 }}
            </span>
          </div>

          <!-- Action Area -->
          <div class="card-actions">
            <button class="read-button" @click.stop="handleCardClick($event)">
              <span class="button-text">Artikel entdecken</span>
              <span class="button-icon">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" fill="none" />
                </svg>
              </span>
            </button>

            <div class="card-stats">
              <span class="stat-item">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path
                    fill="currentColor"
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  />
                </svg>
                <span>234</span>
              </span>
              <span class="stat-item">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path
                    fill="currentColor"
                    d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                  />
                </svg>
                <span>1.2k</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Animated Border -->
        <div class="card-border"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-illustration">
        <svg viewBox="0 0 200 200" width="200" height="200">
          <circle cx="100" cy="100" r="80" fill="currentColor" opacity="0.1" />
          <path d="M70 80 Q100 60 130 80 L130 120 Q100 140 70 120 Z" fill="currentColor" opacity="0.2" />
          <circle cx="85" cy="85" r="5" fill="currentColor" />
          <circle cx="115" cy="85" r="5" fill="currentColor" />
          <path d="M80 110 Q100 120 120 110" stroke="currentColor" stroke-width="3" fill="none" />
        </svg>
      </div>
      <h3>Keine Artikel verfügbar</h3>
      <p>Schau später nochmal vorbei für neue spannende Inhalte!</p>
    </div>

    <!-- Call to Action -->
    <div class="cta-section">
      <div class="cta-background">
        <div class="cta-pattern"></div>
      </div>
      <div class="cta-content">
        <div class="cta-badge">GRATIS</div>
        <h3>Bereit für mehr spannende Inhalte?</h3>
        <p>Werde Teil unserer Community und entdecke täglich neue Geschichten</p>
        <button class="cta-button" @click="redirectToLogin">
          <span class="button-bg"></span>
          <span class="button-content">
            <span>Jetzt kostenlos registrieren</span>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M16.01 11H4v2h12.01v3L20 12l-3.99-4z" />
            </svg>
          </span>
        </button>
        <div class="cta-features">
          <span class="feature-item">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
            </svg>
            Unbegrenzter Zugang
          </span>
          <span class="feature-item">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
            </svg>
            Personalisierte Empfehlungen
          </span>
          <span class="feature-item">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
            </svg>
            Keine Werbung
          </span>
        </div>
      </div>
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
        // MOCK-DATEN für Landingpage
        const mockArticles: PostPreviewItem[] = [
          {
            id: "mock-1",
            title: "Die Magie des gemeinsamen Lesens",
            quickDescription:
              "Entdecke, wie gemeinsames Lesen die Bindung stärkt und die Fantasie beflügelt. Ein Leitfaden für unvergessliche Lesemomente.",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
            author: { username: "Familie Müller" },
            category: "FAMILY",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            tags: ["Familie", "Lesen", "Bildung", "Zusammenhalt"],
            publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            isCertifiedAuthor: true,
          },
          {
            id: "mock-2",
            title: "Kreative Lernspiele für jedes Alter",
            quickDescription:
              "Von Kleinkindern bis Teenagern - diese innovativen Lernspiele machen Bildung zum Abenteuer und fördern spielerisch wichtige Fähigkeiten.",
            image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop",
            author: { username: "Dr. Anna Schmidt" },
            category: "EDUCATION",
            publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
            tags: ["Spiele", "Lernen", "Kreativität", "Entwicklung"],
            isCertifiedAuthor: true,
          },
          {
            id: "mock-3",
            title: "Naturerlebnisse: Abenteuer vor der Haustür",
            quickDescription:
              "Warum in die Ferne schweifen? Die schönsten Naturerlebnisse warten direkt vor deiner Haustür. Tipps für spannende Entdeckungstouren.",
            image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
            author: { username: "Naturfreunde e.V." },
            publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
            category: "NATURE",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
            tags: ["Natur", "Outdoor", "Familie", "Entdecken"],
            isCertifiedAuthor: false,
          },
        ];

        // Simuliere API-Delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        articles.value = mockArticles;
      } catch (err) {
        error.value = err instanceof Error ? err.message : "Ein unerwarteter Fehler ist aufgetreten";
        console.error("Error loading article previews:", err);
      } finally {
        loading.value = false;
      }
    };

    // Setup IntersectionObserver für Scroll-Animationen
    const setupScrollObserver = () => {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const target = entry.target;

              if (target.classList.contains("preview-section")) {
                // Animate header elements
                target.classList.add("in-view");

                // Stagger card animations
                const cards = target.querySelectorAll(".preview-card");
                cards.forEach((card, index) => {
                  if (prefersReducedMotion) {
                    card.classList.add("visible", "no-motion");
                  } else {
                    setTimeout(() => {
                      card.classList.add("visible");
                    }, index * 150);
                  }
                });
              }
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: "50px",
        }
      );

      const section = document.querySelector(".preview-section");
      if (section) observer.observe(section);
    };

    // Handle card click → redirect to login
    const handleCardClick = (event?: Event) => {
      // Add click animation
      const target = event?.currentTarget as HTMLElement | null;
      target?.classList.add("clicked");
      setTimeout(() => {
        redirectToLogin();
      }, 300);
    };

    // Redirect to login
    const redirectToLogin = () => router.push("/login-register");

    // Handle image error
    const handleImageError = (event: Event, articleId: string) => {
      const img = event.target as HTMLImageElement;
      console.warn(`Bild konnte nicht geladen werden für Artikel ${articleId}`);

      // Hide broken image
      img.style.display = "none";

      // Show placeholder
      const placeholder = img.parentElement?.querySelector(".image-placeholder");
      if (placeholder) {
        (placeholder as HTMLElement).style.display = "flex";
      }
    };

    // Format category
    const formatCategory = (category: string): string => {
      const categoryMap: Record<string, string> = {
        EDUCATION: "Bildung",
        ENTERTAINMENT: "Unterhaltung",
        FAMILY: "Familie",
        CULTURE: "Kultur",
        NATURE: "Natur",
        RAISING_CHILDREN: "Erziehung",
        TECHNOLOGY: "Technologie",
        HEALTH: "Gesundheit",
        LIFESTYLE: "Lifestyle",
        TRAVEL: "Reisen",
        FOOD: "Essen",
        FITNESS: "Fitness",
        OTHER: "Sonstiges",
      };
      return categoryMap[category] || "Artikel";
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
        day: "numeric",
        month: "short",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    };

    // Lifecycle
    onMounted(() => {
      loadPreviews();
      setupScrollObserver();
    });

    onBeforeUnmount(() => {
      if (observer) observer.disconnect();
    });

    return {
      // State
      loading,
      error,
      articles,

      // Methods
      loadPreviews,
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
  padding: map.get(vars.$spacing, xxxl) 0;
  position: relative;
  overflow: hidden;
  min-height: 100vh;

  // Background Effects
  .section-bg-effects {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;

    .gradient-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.3;
      animation: float-orb 20s ease-in-out infinite;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          &.orb-1 {
            width: 600px;
            height: 600px;
            top: 0px;
            left: -200px;
            background: mixins.theme-color($theme, accent-green);
            animation-delay: 0s;
          }

          &.orb-2 {
            width: 400px;
            height: 400px;
            bottom: -100px;
            right: -100px;
            background: mixins.theme-color($theme, accent-teal);
            animation-delay: 7s;
          }

          &.orb-3 {
            width: 300px;
            height: 300px;
            top: 50%;
            left: 50%;
            background: mixins.theme-color($theme, accent-lime);
            animation-delay: 14s;
          }
        }
      }
    }
  }

  // Section Header with enhanced animations
  .section-header {
    text-align: center;
    margin-bottom: map.get(vars.$spacing, xxxl);
    position: relative;
    z-index: 1;
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);

    .preview-section.in-view & {
      opacity: 1;
      transform: translateY(0);
    }

    .header-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-size: 12px;
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: map.get(vars.$spacing, m);
      animation: pulse-badge 2s ease-in-out infinite;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, primary);
          color: white;
          box-shadow: 0 4px 15px rgba(mixins.theme-color($theme, accent-green), 0.3);
        }
      }
    }

    h2 {
      font-size: clamp(2rem, 6vw, 3.5rem);
      font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
      margin-bottom: map.get(vars.$spacing, m);
      position: relative;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }

      // Glitch effect on hover
      &.glitch-text:hover {
        &::before,
        &::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        &::before {
          animation: glitch-1 0.3s infinite;
          color: #00ffcc;
          z-index: -1;
        }

        &::after {
          animation: glitch-2 0.3s infinite;
          color: #ff00cc;
          z-index: -2;
        }
      }
    }

    .header-decoration {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-bottom: map.get(vars.$spacing, l);

      span {
        display: block;
        height: 4px;
        border-radius: 2px;
        transition: all 0.3s ease;

        &:nth-child(1) {
          width: 40px;
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background: mixins.theme-color($theme, accent-green);
            }
          }
        }

        &:nth-child(2) {
          width: 60px;
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background: mixins.theme-color($theme, accent-teal);
            }
          }
        }

        &:nth-child(3) {
          width: 40px;
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background: mixins.theme-color($theme, accent-lime);
            }
          }
        }
      }

      .preview-section:hover & span {
        &:nth-child(1) {
          width: 60px;
        }
        &:nth-child(2) {
          width: 40px;
        }
        &:nth-child(3) {
          width: 60px;
        }
      }
    }

    .section-subtitle {
      font-size: clamp(1rem, 3vw, 1.25rem);
      max-width: 700px;
      margin: 0 auto;
      line-height: 1.8;

      .subtitle-line {
        display: block;

        @media (min-width: 768px) {
          display: inline;

          &:first-child::after {
            content: " ";
          }
        }
      }

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  // Loading State - Modern
  .loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;

    .loading-container {
      text-align: center;
    }

    .loading-ring {
      display: inline-block;
      position: relative;
      width: 80px;
      height: 80px;
      margin-bottom: map.get(vars.$spacing, m);

      div {
        box-sizing: border-box;
        display: block;
        position: absolute;
        width: 64px;
        height: 64px;
        margin: 8px;
        border: 8px solid;
        border-radius: 50%;
        animation: loading-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            border-color: mixins.theme-color($theme, accent-green) transparent transparent transparent;
          }
        }

        &:nth-child(1) {
          animation-delay: -0.45s;
        }
        &:nth-child(2) {
          animation-delay: -0.3s;
        }
        &:nth-child(3) {
          animation-delay: -0.15s;
        }
      }
    }

    .loading-text {
      font-size: map.get(map.get(vars.$fonts, sizes), medium);
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  // Error State - Enhanced
  .error-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: map.get(vars.$spacing, xl);

    .error-content {
      text-align: center;
      max-width: 400px;
    }

    .error-icon {
      margin-bottom: map.get(vars.$spacing, m);

      svg {
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, error);
          }
        }
      }
    }

    h3 {
      font-size: map.get(map.get(vars.$fonts, sizes), xl);
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
      display: inline-flex;
      align-items: center;
      gap: map.get(vars.$spacing, s);
      padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      border: none;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, primary);
          color: white;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(mixins.theme-color($theme, accent-green), 0.3);

            svg {
              animation: rotate-icon 0.6s ease-in-out;
            }
          }
        }
      }
    }
  }

  // Preview Container - Enhanced Grid
  .preview-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 400px), 1fr));
    gap: map.get(vars.$spacing, xl);
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 map.get(vars.$spacing, xl);
    position: relative;
    z-index: 1;

    @media (max-width: 1400px) {
      padding: 0 map.get(vars.$spacing, l);
    }

    @media (max-width: 768px) {
      gap: map.get(vars.$spacing, l);
      padding: 0 map.get(vars.$spacing, m);
    }

    @media (max-width: 480px) {
      padding: 0 map.get(vars.$spacing, s);
    }
  }

  // Preview Cards - Modern Glass Design
  .preview-card {
    position: relative;
    border-radius: 24px;
    overflow: hidden;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    min-height: 500px;
    opacity: 0;
    transform: translateY(50px) scale(0.95);
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    transition-delay: calc(var(--card-index, 0) * 0.1s);

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background: rgba(mixins.theme-color($theme, card-bg), 0.7);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(mixins.theme-color($theme, border-light), 0.5);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }
    }

    // Visible state
    &.visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    // No motion preference
    &.no-motion {
      transition: opacity 0.3s ease;
      transform: none !important;
    }

    // Card Styles
    &.card-style-1 {
      .card-glow {
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: radial-gradient(
              circle at 30% 30%,
              rgba(mixins.theme-color($theme, accent-green), 0.3),
              transparent 50%
            );
          }
        }
      }
    }

    &.card-style-2 {
      .card-glow {
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: radial-gradient(
              circle at 70% 70%,
              rgba(mixins.theme-color($theme, accent-teal), 0.3),
              transparent 50%
            );
          }
        }
      }
    }

    &.card-style-3 {
      .card-glow {
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: radial-gradient(
              circle at 50% 50%,
              rgba(mixins.theme-color($theme, accent-lime), 0.3),
              transparent 50%
            );
          }
        }
      }
    }

    // Card Glow
    .card-glow {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.6s ease;
    }

    // Hover Effects
    &:hover {
      transform: translateY(-10px) scale(1.02);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(mixins.theme-color($theme, accent-green), 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
      }

      .card-glow {
        opacity: 1;
      }

      .card-border {
        opacity: 1;
      }

      .card-image {
        .image-wrapper img {
          transform: scale(1.05);
        }

        .hover-content {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
      }

      .card-title .title-underline {
        transform: scaleX(1);
      }
    }

    // Click Animation
    &.clicked {
      animation: card-click 0.3s ease-out;
    }

    // Card Image
    .card-image {
      position: relative;
      height: 250px;
      overflow: hidden;

      @media (max-width: 480px) {
        height: 200px;
      }

      .image-wrapper {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .image-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 50%;
          pointer-events: none;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background: linear-gradient(to top, rgba(mixins.theme-color($theme, card-bg), 0.8) 0%, transparent 100%);
            }
          }
        }
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
            background: mixins.theme-color($theme, secondary-bg);
          }
        }

        .placeholder-pattern {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.1;
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 35px,
            currentColor 35px,
            currentColor 70px
          );
        }

        .placeholder-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: map.get(vars.$spacing, s);
          z-index: 1;

          svg {
            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-tertiary);
              }
            }
          }

          span {
            font-size: map.get(map.get(vars.$fonts, sizes), small);
            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-tertiary);
              }
            }
          }
        }
      }

      // Category Badge - Enhanced
      .category-badge {
        position: absolute;
        top: map.get(vars.$spacing, m);
        left: map.get(vars.$spacing, m);
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        font-size: 12px;
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        letter-spacing: 0.5px;
        backdrop-filter: blur(10px);
        z-index: 2;
        transition: all 0.3s ease;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: rgba(mixins.theme-color($theme, card-bg), 0.9);
            color: mixins.theme-color($theme, accent-green);
            border: 1px solid rgba(mixins.theme-color($theme, accent-green), 0.3);
          }
        }

        .badge-icon {
          display: flex;
          align-items: center;

          svg {
            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, accent-yellow);
              }
            }
          }
        }
      }

      // Hover Content
      .hover-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.8);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: map.get(vars.$spacing, s);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: none;

        .hover-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          border-radius: 50%;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background: rgba(mixins.theme-color($theme, card-bg), 0.9);
              backdrop-filter: blur(10px);
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

              svg {
                color: mixins.theme-color($theme, accent-green);
              }
            }
          }
        }

        .hover-text {
          font-weight: map.get(map.get(vars.$fonts, weights), medium);

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: white;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }
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

      @media (max-width: 480px) {
        padding: map.get(vars.$spacing, m);
      }
    }

    // Article Meta - Enhanced
    .article-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: map.get(vars.$spacing, m);
      font-size: map.get(map.get(vars.$fonts, sizes), small);

      .meta-author {
        display: flex;
        align-items: center;
        gap: map.get(vars.$spacing, xs);

        .author-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
          text-transform: uppercase;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background: mixins.theme-gradient($theme, primary);
              color: white;
            }
          }
        }

        .author-name {
          font-weight: map.get(map.get(vars.$fonts, weights), medium);
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }
      }

      .meta-date {
        display: flex;
        align-items: center;
        gap: 4px;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-tertiary);
          }
        }
      }
    }

    // Card Title - Enhanced
    .card-title {
      margin-bottom: map.get(vars.$spacing, m);
      font-size: clamp(1.25rem, 3vw, 1.5rem);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      line-height: 1.3;
      position: relative;

      .title-text {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }

      .title-underline {
        position: absolute;
        bottom: -4px;
        left: 0;
        width: 100%;
        height: 2px;
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: mixins.theme-gradient($theme, primary);
          }
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

      @media (max-width: 480px) {
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

    // Card Tags - Enhanced
    .card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: map.get(vars.$spacing, xs);
      margin-bottom: map.get(vars.$spacing, l);

      .card-tag {
        padding: 6px 12px;
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);
        font-size: 11px;
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        transition: all 0.3s ease;
        animation: tag-fade-in 0.6s ease-out forwards;
        animation-delay: calc(0.5s + var(--tag-index, 0) * 0.1s);
        opacity: 0;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: rgba(mixins.theme-color($theme, secondary-bg), 0.8);
            color: mixins.theme-color($theme, accent-teal);
            border: 1px solid rgba(mixins.theme-color($theme, accent-teal), 0.3);

            &:hover {
              background: mixins.theme-color($theme, accent-teal);
              color: white;
              transform: translateY(-2px);
            }
          }
        }
      }

      .tag-more {
        padding: 6px 12px;
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);
        font-size: 11px;
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        display: flex;
        align-items: center;
        gap: 4px;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: mixins.theme-gradient($theme, primary);
            color: white;
          }
        }

        .more-icon {
          font-size: 14px;
        }
      }
    }

    // Card Actions
    .card-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;

      .read-button {
        display: inline-flex;
        align-items: center;
        gap: map.get(vars.$spacing, s);
        padding: map.get(vars.$spacing, m) map.get(vars.$spacing, l);
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        cursor: pointer;
        border: none;
        position: relative;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

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
              background: rgba(255, 255, 255, 0.3);
              transform: translate(-50%, -50%);
              transition: width 0.6s, height 0.6s;
            }

            &:hover {
              transform: translateX(4px);
              box-shadow: 0 6px 20px rgba(mixins.theme-color($theme, accent-green), 0.3);

              &::before {
                width: 300px;
                height: 300px;
              }

              .button-icon {
                transform: translateX(4px);
              }
            }
          }
        }

        .button-text,
        .button-icon {
          position: relative;
          z-index: 1;
        }

        .button-icon {
          display: flex;
          align-items: center;
          transition: transform 0.3s ease;
        }
      }

      .card-stats {
        display: flex;
        gap: map.get(vars.$spacing, m);

        .stat-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-tertiary);

              svg {
                color: mixins.theme-color($theme, text-tertiary);
              }
            }
          }
        }
      }
    }

    // Animated Border
    .card-border {
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border-radius: 24px;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
      z-index: -1;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: linear-gradient(
            45deg,
            mixins.theme-color($theme, accent-green),
            mixins.theme-color($theme, accent-teal),
            mixins.theme-color($theme, accent-lime),
            mixins.theme-color($theme, accent-green)
          );
          background-size: 300% 300%;
          animation: gradient-rotate 3s ease infinite;
        }
      }
    }
  }

  // Empty State - Enhanced
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: map.get(vars.$spacing, xl);
    text-align: center;

    .empty-illustration {
      margin-bottom: map.get(vars.$spacing, l);

      svg {
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-tertiary);
          }
        }
      }
    }

    h3 {
      font-size: map.get(map.get(vars.$fonts, sizes), xl);
      margin-bottom: map.get(vars.$spacing, s);
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    p {
      font-size: map.get(map.get(vars.$fonts, sizes), medium);
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  // CTA Section - Completely Redesigned
  .cta-section {
    margin-top: map.get(vars.$spacing, xxxl);
    padding: map.get(vars.$spacing, xxxl) map.get(vars.$spacing, xl);
    position: relative;
    overflow: hidden;
    border-radius: 32px;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background: mixins.theme-color($theme, card-bg);
        border: 1px solid mixins.theme-color($theme, border-light);
      }
    }

    .cta-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      z-index: 0;

      .cta-pattern {
        position: absolute;
        width: 200%;
        height: 200%;
        top: -50%;
        left: -50%;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-image: radial-gradient(
                circle at 20% 30%,
                rgba(mixins.theme-color($theme, accent-green), 0.1) 0%,
                transparent 50%
              ),
              radial-gradient(circle at 80% 70%, rgba(mixins.theme-color($theme, accent-teal), 0.1) 0%, transparent 50%),
              radial-gradient(
                circle at 50% 50%,
                rgba(mixins.theme-color($theme, accent-lime), 0.05) 0%,
                transparent 70%
              );
            animation: pattern-shift 20s ease-in-out infinite;
          }
        }
      }
    }

    .cta-content {
      position: relative;
      z-index: 1;
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
    }

    .cta-badge {
      display: inline-block;
      padding: 6px 20px;
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-size: 11px;
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: map.get(vars.$spacing, m);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: rgba(mixins.theme-color($theme, accent-green), 0.1);
          color: mixins.theme-color($theme, accent-green);
          border: 1px solid mixins.theme-color($theme, accent-green);
        }
      }
    }

    h3 {
      font-size: clamp(1.75rem, 4vw, 2.5rem);
      font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
      margin-bottom: map.get(vars.$spacing, m);
      line-height: 1.2;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    p {
      font-size: clamp(1rem, 2vw, 1.125rem);
      margin-bottom: map.get(vars.$spacing, xl);
      line-height: 1.7;

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
      gap: map.get(vars.$spacing, m);
      padding: map.get(vars.$spacing, l) map.get(vars.$spacing, xxl);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-size: map.get(map.get(vars.$fonts, sizes), medium);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      cursor: pointer;
      border: none;
      position: relative;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      margin-bottom: map.get(vars.$spacing, l);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: mixins.theme-color($theme, text-primary);
          color: mixins.theme-color($theme, bg-primary);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);

          &:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);

            .button-bg {
              transform: scale(1);
              opacity: 1;
            }
          }
        }
      }

      .button-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: inherit;
        transform: scale(0);
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: mixins.theme-gradient($theme, primary);
          }
        }
      }

      .button-content {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        gap: map.get(vars.$spacing, s);
      }
    }

    .cta-features {
      display: flex;
      justify-content: center;
      gap: map.get(vars.$spacing, l);
      flex-wrap: wrap;

      @media (max-width: 768px) {
        flex-direction: column;
        gap: map.get(vars.$spacing, s);
      }

      .feature-item {
        display: flex;
        align-items: center;
        gap: map.get(vars.$spacing, xs);
        font-size: map.get(map.get(vars.$fonts, sizes), small);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);

            svg {
              color: mixins.theme-color($theme, accent-green);
            }
          }
        }
      }
    }
  }
}

// Animations
@keyframes float-orb {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

@keyframes pulse-badge {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
}

@keyframes glitch-1 {
  0%,
  100% {
    clip-path: inset(40% 0 60% 0);
    transform: translate(-2px, -2px);
  }
  20% {
    clip-path: inset(80% 0 10% 0);
    transform: translate(2px, 2px);
  }
  40% {
    clip-path: inset(10% 0 80% 0);
    transform: translate(-2px, 2px);
  }
  60% {
    clip-path: inset(50% 0 30% 0);
    transform: translate(2px, -2px);
  }
  80% {
    clip-path: inset(30% 0 50% 0);
    transform: translate(-2px, -2px);
  }
}

@keyframes glitch-2 {
  0%,
  100% {
    clip-path: inset(60% 0 40% 0);
    transform: translate(2px, 2px);
  }
  20% {
    clip-path: inset(20% 0 70% 0);
    transform: translate(-2px, -2px);
  }
  40% {
    clip-path: inset(70% 0 20% 0);
    transform: translate(2px, -2px);
  }
  60% {
    clip-path: inset(40% 0 40% 0);
    transform: translate(-2px, 2px);
  }
  80% {
    clip-path: inset(50% 0 50% 0);
    transform: translate(2px, 2px);
  }
}

@keyframes loading-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes rotate-icon {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes tag-fade-in {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes card-click {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes gradient-rotate {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes pattern-shift {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(-10%, -10%) rotate(90deg);
  }
  50% {
    transform: translate(10%, -10%) rotate(180deg);
  }
  75% {
    transform: translate(10%, 10%) rotate(270deg);
  }
}

// Media Query für reduced motion preference
@media (prefers-reduced-motion: reduce) {
  .preview-section {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }

    .preview-card {
      opacity: 1 !important;
      transform: none !important;
    }
  }
}

// Spezielle Optimierungen für iPhone 14 Pro Max (430px width)
@media (max-width: 430px) {
  .preview-section {
    padding: map.get(vars.$spacing, xl) 0;

    .section-header {
      margin-bottom: map.get(vars.$spacing, xl);

      h2 {
        font-size: 1.75rem;
      }

      .section-subtitle {
        font-size: 0.9rem;
        padding: 0 map.get(vars.$spacing, m);
      }
    }

    .preview-container {
      gap: map.get(vars.$spacing, m);
      padding: 0 map.get(vars.$spacing, s);
    }

    .preview-card {
      min-height: 450px;

      &:hover {
        transform: translateY(-5px) scale(1.01);
      }

      .card-image {
        height: 180px;
      }

      .card-content {
        padding: map.get(vars.$spacing, m);
      }

      .card-title {
        font-size: 1.125rem;
      }

      .card-description {
        font-size: 0.875rem;
        -webkit-line-clamp: 2;
        line-clamp: 2;
      }

      .card-actions {
        flex-direction: column;
        gap: map.get(vars.$spacing, m);
        align-items: stretch;

        .read-button {
          width: 100%;
          justify-content: center;
        }

        .card-stats {
          justify-content: center;
        }
      }
    }

    .cta-section {
      padding: map.get(vars.$spacing, xl) map.get(vars.$spacing, m);
      margin-top: map.get(vars.$spacing, xl);

      h3 {
        font-size: 1.5rem;
      }

      p {
        font-size: 0.9rem;
      }

      .cta-button {
        padding: map.get(vars.$spacing, m) map.get(vars.$spacing, l);
        font-size: 0.9rem;
      }

      .cta-features {
        font-size: 0.75rem;
      }
    }
  }
}
</style>
