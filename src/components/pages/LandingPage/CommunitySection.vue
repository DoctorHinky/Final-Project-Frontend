<template>
  <section class="section testimonial-carousel-section" id="community" ref="sectionRef">
    <!-- Background Effects -->
    <div class="section-bg">
      <div class="bg-gradient-1"></div>
      <div class="bg-gradient-2"></div>
      <div class="bg-pattern"></div>
    </div>

    <div class="carousel-container">
      <!-- Section Header -->
      <div class="section-header">
        <div class="header-badge">COMMUNITY</div>
        <h2 class="section-title">
          <span class="title-line">Was unsere</span>
          <span class="title-highlight">Community</span>
          <span class="title-line">sagt</span>
        </h2>
        <p class="section-subtitle">Echte Erfahrungen von echten Familien</p>
      </div>

      <!-- Carousel Wrapper -->
      <div class="carousel-wrapper">
        <!-- Cards Container -->
        <div class="cards-container">
          <div
            v-for="(testimonial, index) in testimonials"
            :key="testimonial.id"
            :class="['testimonial-card', getCardClass(index)]"
            :style="getCardStyle(index)"
            @click="handleCardClick(index)"
          >
            <!-- Card Background Effect -->
            <div class="card-bg-effect"></div>

            <!-- Card Content -->
            <div class="card-content">
              <!-- Header with Avatar and Rating -->
              <div class="card-header">
                <div class="author-info">
                  <div class="avatar-wrapper">
                    <img 
                      :src="testimonial.avatar" 
                      :alt="`${testimonial.author} Avatar`" 
                      class="author-avatar"
                      loading="lazy"
                    />
                    <div class="avatar-ring"></div>
                  </div>
                  <div class="author-details">
                    <h3 class="author-name">{{ testimonial.author }}</h3>
                    <p class="author-role">{{ testimonial.role }}</p>
                  </div>
                </div>
                
                <!-- Star Rating -->
                <div class="rating-wrapper">
                  <div class="stars">
                    <StarIcon
                      v-for="star in 5"
                      :key="star"
                      :class="['star', { filled: star <= testimonial.rating }]"
                    />
                  </div>
                  <span class="rating-text">{{ testimonial.rating }}.0</span>
                </div>
              </div>

              <!-- Testimonial Content -->
              <div class="testimonial-content">
                <h4 class="testimonial-title">{{ testimonial.title }}</h4>
                <p class="testimonial-text">{{ testimonial.text }}</p>
              </div>

              <!-- Card Footer -->
              <div class="card-footer">
                <div class="footer-meta">
                  <CalendarIcon class="meta-icon" />
                  <span>{{ formatDate(testimonial.date) }}</span>
                </div>
                <div class="footer-badge" v-if="testimonial.verified">
                  <CheckBadgeIcon class="badge-icon" />
                  <span>Verifiziert</span>
                </div>
              </div>
            </div>

            <!-- Click Hint (only for inactive cards) -->
            <div class="click-hint" v-if="getCardClass(index) !== 'active'">
              <span>Klicken zum Lesen</span>
            </div>
          </div>
        </div>

        <!-- Navigation Controls -->
        <div class="carousel-controls">
          <button 
            class="control-btn prev" 
            @click="navigate('prev')"
            :disabled="isAnimating"
            aria-label="Vorheriges Testimonial"
          >
            <ChevronLeftIcon />
          </button>
          
          <button 
            class="control-btn next" 
            @click="navigate('next')"
            :disabled="isAnimating"
            aria-label="Nächstes Testimonial"
          >
            <ChevronRightIcon />
          </button>
        </div>

        <!-- Progress Indicators -->
        <div class="progress-indicators">
          <button
            v-for="(_, index) in testimonials"
            :key="`indicator-${index}`"
            :class="['indicator', { active: index === currentIndex }]"
            @click="goToIndex(index)"
            :aria-label="`Gehe zu Testimonial ${index + 1}`"
          >
            <span class="indicator-fill"></span>
          </button>
        </div>
      </div>

      <!-- Mobile Swipe Hint -->
      <div class="swipe-hint" v-if="isMobile">
        <HandRaisedIcon class="swipe-icon" />
        <span>Wischen zum Navigieren</span>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, computed, nextTick } from "vue";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  StarIcon,
  CalendarIcon,
  CheckBadgeIcon,
  HandRaisedIcon
} from "@heroicons/vue/24/solid";

interface Testimonial {
  id: string;
  title: string;
  text: string;
  author: string;
  role: string;
  rating: number;
  avatar: string;
  date: string;
  verified: boolean;
}

export default defineComponent({
  name: "TestimonialCarousel",
  components: {
    ChevronLeftIcon,
    ChevronRightIcon,
    StarIcon,
    CalendarIcon,
    CheckBadgeIcon,
    HandRaisedIcon,
  },
  setup() {
    // Refs
    const sectionRef = ref<HTMLElement | null>(null);
    const currentIndex = ref(0);
    const isAnimating = ref(false);
    const autoplayInterval = ref<number | null>(null);
    const isMobile = ref(false);
    
    // Touch handling
    const touchStartX = ref(0);
    const touchEndX = ref(0);

    // Testimonial data
    const testimonials = ref<Testimonial[]>([
      {
        id: "1",
        title: "Lebensverändernde Tipps",
        text: "Die Artikel über positive Erziehung haben unseren Familienalltag komplett verändert. Statt ständiger Machtkämpfe haben wir jetzt eine liebevolle, respektvolle Beziehung zu unseren Kindern aufgebaut.",
        author: "Maria Schmidt",
        role: "Mutter von 3 Kindern",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
        date: "2024-01-15",
        verified: true,
      },
      {
        id: "2",
        title: "Endlich durchschlafen!",
        text: "Nach monatelangen schlaflosen Nächten waren wir verzweifelt. Die Schlaf-Tipps hier haben Wunder gewirkt. Unser Baby schläft jetzt 8 Stunden durch und wir sind alle viel ausgeglichener.",
        author: "Thomas Weber",
        role: "Vater eines Kleinkinds",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
        date: "2024-01-20",
        verified: true,
      },
      {
        id: "3",
        title: "Teenager verstehen lernen",
        text: "Die Pubertät unserer Tochter war eine echte Herausforderung. Dank der wertvollen Ratschläge konnten wir eine Brücke zu ihr bauen. Die Kommunikationstipps waren Gold wert!",
        author: "Sandra Müller",
        role: "Mutter einer Teenagerin",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
        date: "2024-01-25",
        verified: true,
      },
      {
        id: "4",
        title: "Spielerisch lernen",
        text: "Mein Sohn hatte große Probleme in der Schule. Die kreativen Lernmethoden haben alles verändert. Er geht jetzt gerne zur Schule und seine Noten haben sich deutlich verbessert.",
        author: "Michael Bauer",
        role: "Vater eines Grundschülers",
        rating: 4,
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
        date: "2024-02-01",
        verified: false,
      },
      {
        id: "5",
        title: "Gesunde Familie",
        text: "Die Ernährungstipps sind praktisch und alltagstauglich. Unsere Kinder essen jetzt freiwillig Gemüse und wir kochen viel öfter gemeinsam. Eine tolle Entwicklung für uns alle!",
        author: "Lisa Chen",
        role: "Mutter von Zwillingen",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face",
        date: "2024-02-05",
        verified: true,
      },
    ]);

    // Computed
    const totalCards = computed(() => testimonials.value.length);

    // Methods
    const getCardClass = (index: number): string => {
      const position = (index - currentIndex.value + totalCards.value) % totalCards.value;
      
      if (position === 0) return 'active';
      if (position === 1 || position === totalCards.value - 1) return 'adjacent';
      return 'hidden';
    };

    const getCardStyle = (index: number) => {
      const position = (index - currentIndex.value + totalCards.value) % totalCards.value;
      
      // Active card
      if (position === 0) {
        return {
          transform: 'translateX(-50%) translateZ(0) scale(1)',
          opacity: 1,
          zIndex: 30,
          filter: 'blur(0)',
        };
      }
      
      // Right adjacent
      if (position === 1) {
        return {
          transform: 'translateX(15%) translateZ(-100px) scale(0.85)',
          opacity: 0.7,
          zIndex: 20,
          filter: 'blur(1px)',
        };
      }
      
      // Left adjacent
      if (position === totalCards.value - 1) {
        return {
          transform: 'translateX(-115%) translateZ(-100px) scale(0.85)',
          opacity: 0.7,
          zIndex: 20,
          filter: 'blur(1px)',
        };
      }
      
      // Hidden cards
      return {
        transform: 'translateX(-50%) translateZ(-200px) scale(0.7)',
        opacity: 0,
        zIndex: 10,
        filter: 'blur(2px)',
      };
    };

    const navigate = async (direction: 'prev' | 'next') => {
      if (isAnimating.value) return;
      
      isAnimating.value = true;
      
      if (direction === 'next') {
        currentIndex.value = (currentIndex.value + 1) % totalCards.value;
      } else {
        currentIndex.value = (currentIndex.value - 1 + totalCards.value) % totalCards.value;
      }
      
      resetAutoplay();
      
      await nextTick();
      setTimeout(() => {
        isAnimating.value = false;
      }, 0);
    };

    const goToIndex = async (index: number) => {
      if (isAnimating.value || index === currentIndex.value) return;
      
      isAnimating.value = true;
      currentIndex.value = index;
      resetAutoplay();
      
      await nextTick();
      setTimeout(() => {
        isAnimating.value = false;
      }, 1000);
    };

    const handleCardClick = (index: number) => {
      const position = (index - currentIndex.value + totalCards.value) % totalCards.value;
      
      if (position === 1) {
        navigate('next');
      } else if (position === totalCards.value - 1) {
        navigate('prev');
      }
    };

    // Touch handling
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.value = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX.value = e.changedTouches[0].clientX;
      handleSwipe();
    };

    const handleSwipe = () => {
      const swipeThreshold = 50;
      const diff = touchStartX.value - touchEndX.value;
      
      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          navigate('next');
        } else {
          navigate('prev');
        }
      }
    };

    // Autoplay
    const startAutoplay = () => {
      autoplayInterval.value = window.setInterval(() => {
        navigate('next');
      }, 5000);
    };

    const stopAutoplay = () => {
      if (autoplayInterval.value) {
        clearInterval(autoplayInterval.value);
        autoplayInterval.value = null;
      }
    };

    const resetAutoplay = () => {
      stopAutoplay();
      startAutoplay();
    };

    // Format date
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleDateString('de-DE', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    };

    // Check if mobile
    const checkMobile = () => {
      isMobile.value = window.innerWidth <= 768;
    };

    // Lifecycle
    onMounted(() => {
      startAutoplay();
      checkMobile();
      window.addEventListener('resize', checkMobile);
      
      // Add touch listeners
      const container = document.querySelector('.cards-container');
      if (container) {
        container.addEventListener('touchstart', handleTouchStart as any);
        container.addEventListener('touchend', handleTouchEnd as any);
      }
      
      // Intersection Observer for fade-in animation
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
            }
          });
        },
        { threshold: 0.1 }
      );
      
      if (sectionRef.value) {
        observer.observe(sectionRef.value);
      }
    });

    onUnmounted(() => {
      stopAutoplay();
      window.removeEventListener('resize', checkMobile);
      
      const container = document.querySelector('.cards-container');
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart as any);
        container.removeEventListener('touchend', handleTouchEnd as any);
      }
    });

    return {
      sectionRef,
      currentIndex,
      isAnimating,
      isMobile,
      testimonials,
      getCardClass,
      getCardStyle,
      navigate,
      goToIndex,
      handleCardClick,
      formatDate,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;

.testimonial-carousel-section {
  position: relative;
  padding: map.get(vars.$spacing, xxxl) 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);

  &.visible {
    opacity: 1;
    transform: translateY(0);
  }

  // Background Effects
  .section-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;

    .bg-gradient-1,
    .bg-gradient-2 {
      position: absolute;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      filter: blur(100px);
      opacity: 0.3;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: mixins.theme-color($theme, accent-green);
        }
      }
    }

    .bg-gradient-1 {
      top: -200px;
      left: -200px;
      animation: float-1 20s ease-in-out infinite;
    }

    .bg-gradient-2 {
      bottom: -200px;
      right: -200px;
      animation: float-2 15s ease-in-out infinite;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: mixins.theme-color($theme, accent-teal);
        }
      }
    }

    .bg-pattern {
      position: absolute;
      width: 100%;
      height: 100%;
      opacity: 0.03;
      background-image: 
        radial-gradient(circle at 25% 25%, currentColor 1px, transparent 1px),
        radial-gradient(circle at 75% 75%, currentColor 1px, transparent 1px);
      background-size: 50px 50px;
    }
  }

  // Container
  .carousel-container {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 map.get(vars.$spacing, xl);
    position: relative;
    z-index: 1;

    @media (max-width: 768px) {
      padding: 0 map.get(vars.$spacing, m);
    }
  }

  // Section Header
  .section-header {
    text-align: center;
    margin-bottom: map.get(vars.$spacing, xxxl);
    opacity: 0;
    animation: fade-in-up 0.8s ease-out 0.2s forwards;

    .header-badge {
      display: inline-block;
      padding: 6px 20px;
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-size: 12px;
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

    .section-title {
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
      line-height: 1.2;
      margin-bottom: map.get(vars.$spacing, m);

      .title-line {
        font-size: 2rem;
        display: inline-block;
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }

      .title-highlight {
        font-size: 2.5rem;
        display: inline-block;
        position: relative;
        
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: linear-gradient(
              135deg,
              mixins.theme-color($theme, accent-green) 0%,
              mixins.theme-color($theme, accent-teal) 100%
            );
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        }

        &::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 100%;
          height: 3px;
          border-radius: 2px;
          
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
      }
    }

    .section-subtitle {
      font-size: clamp(1rem, 2.5vw, 1.25rem);
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  // Carousel Wrapper
  .carousel-wrapper {
    position: relative;
    height: 500px;
    perspective: 1200px;
    
    @media (max-width: 768px) {
      height: 600px;
    }
    
    @media (max-width: 480px) {
      height: 550px;
    }
  }

  // Cards Container
  .cards-container {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
  }

  // Testimonial Card
  .testimonial-card {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    width: min(600px, 90vw);
    max-width: 600px;
    border-radius: 24px;
    padding: map.get(vars.$spacing, xl);
    cursor: pointer;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    
    @media (max-width: 768px) {
      width: min(500px, 85vw);
      padding: map.get(vars.$spacing, l);
    }
    
    @media (max-width: 480px) {
      width: 90vw;
      padding: map.get(vars.$spacing, m);
    }

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background: rgba(mixins.theme-color($theme, card-bg), 0.9);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(mixins.theme-color($theme, border-light), 0.5);
        box-shadow: 
          0 10px 40px rgba(0, 0, 0, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }
    }

    &.adjacent {
      cursor: pointer;
      
      &:hover {
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            border-color: mixins.theme-color($theme, accent-green);
          }
        }

        .click-hint {
          opacity: 1;
          transform: translateY(0);
        }
      }
    }

    &.hidden {
      pointer-events: none;
    }

    // Card Background Effect
    .card-bg-effect {
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border-radius: 24px;
      opacity: 0;
      z-index: -1;
      transition: opacity 0.3s ease;
      
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: linear-gradient(
            45deg,
            mixins.theme-color($theme, accent-green),
            mixins.theme-color($theme, accent-teal),
            mixins.theme-color($theme, accent-lime)
          );
        }
      }
    }

    &.active:hover .card-bg-effect {
      opacity: 1;
    }

    // Card Content
    .card-content {
      position: relative;
      z-index: 1;
    }

    // Card Header
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: map.get(vars.$spacing, l);
      gap: map.get(vars.$spacing, m);

      @media (max-width: 480px) {
        flex-direction: column;
        gap: map.get(vars.$spacing, m);
      }
    }

    .author-info {
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, m);
    }

    .avatar-wrapper {
      position: relative;
      flex-shrink: 0;

      .author-avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        object-fit: cover;
        
        @media (max-width: 480px) {
          width: 50px;
          height: 50px;
        }
      }

      .avatar-ring {
        position: absolute;
        top: -3px;
        left: -3px;
        right: -3px;
        bottom: -3px;
        border-radius: 50%;
        z-index: -1;
        
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: linear-gradient(
              135deg,
              mixins.theme-color($theme, accent-green),
              mixins.theme-color($theme, accent-teal)
            );
          }
        }
      }
    }

    .author-details {
      .author-name {
        font-size: map.get(map.get(vars.$fonts, sizes), large);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        margin-bottom: 2px;
        
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }

      .author-role {
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }
    }

    // Rating
    .rating-wrapper {
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, s);

      .stars {
        display: flex;
        gap: 2px;

        .star {
          width: 20px;
          height: 20px;
          transition: all 0.3s ease;
          
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-tertiary);
            }
          }

          &.filled {
            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, accent-yellow);
                filter: drop-shadow(0 2px 4px rgba(mixins.theme-color($theme, accent-yellow), 0.3));
              }
            }
          }
        }
      }

      .rating-text {
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }
    }

    // Testimonial Content
    .testimonial-content {
      margin-bottom: map.get(vars.$spacing, l);

      .testimonial-title {
        font-size: map.get(map.get(vars.$fonts, sizes), xl);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        margin-bottom: map.get(vars.$spacing, m);
        line-height: 1.3;
        
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }

      .testimonial-text {
        font-size: map.get(map.get(vars.$fonts, sizes), medium);
        line-height: 1.7;
        
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }
    }

    // Card Footer
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: map.get(vars.$spacing, m);
      border-top: 1px solid;
      
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          border-color: mixins.theme-color($theme, border-light);
        }
      }

      .footer-meta {
        display: flex;
        align-items: center;
        gap: map.get(vars.$spacing, xs);
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-tertiary);
          }
        }

        .meta-icon {
          width: 16px;
          height: 16px;
        }
      }

      .footer-badge {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 12px;
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: rgba(mixins.theme-color($theme, accent-green), 0.1);
            color: mixins.theme-color($theme, accent-green);
          }
        }

        .badge-icon {
          width: 16px;
          height: 16px;
        }
      }
    }

    // Click Hint
    .click-hint {
      position: absolute;
      bottom: -40px;
      left: 50%;
      transform: translateX(-50%) translateY(10px);
      padding: 6px 16px;
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      opacity: 0;
      transition: all 0.3s ease;
      pointer-events: none;
      
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: mixins.theme-color($theme, text-primary);
          color: mixins.theme-color($theme, bg-primary);
        }
      }
    }
  }

  // Navigation Controls
  .carousel-controls {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 0 map.get(vars.$spacing, xl);
    pointer-events: none;
    z-index: 40;

    @media (max-width: 768px) {
      padding: 0 map.get(vars.$spacing, s);
    }

    .control-btn {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: auto;
      
      @media (max-width: 768px) {
        width: 48px;
        height: 48px;
      }

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: rgba(mixins.theme-color($theme, card-bg), 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid mixins.theme-color($theme, border-light);
          color: mixins.theme-color($theme, text-primary);
          
          &:hover:not(:disabled) {
            background: mixins.theme-color($theme, card-bg);
            border-color: mixins.theme-color($theme, accent-green);
            transform: scale(1.1);
            
            svg {
              color: mixins.theme-color($theme, accent-green);
            }
          }
        }
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      svg {
        width: 24px;
        height: 24px;
        transition: color 0.3s ease;
        
        @media (max-width: 768px) {
          width: 20px;
          height: 20px;
        }
      }
    }
  }

  // Progress Indicators
  .progress-indicators {
    position: absolute;
    bottom: -60px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: map.get(vars.$spacing, s);
    z-index: 40;

    .indicator {
      width: 40px;
      height: 4px;
      border: none;
      border-radius: 2px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: rgba(mixins.theme-color($theme, text-tertiary), 0.2);
        }
      }

      .indicator-fill {
        position: absolute;
        top: 0;
        left: 0;
        width: 0;
        height: 100%;
        transition: width 0.3s ease;
        
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

      &.active .indicator-fill {
        width: 100%;
        transition: width 5s linear;
      }

      &:hover:not(.active) {
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: rgba(mixins.theme-color($theme, text-tertiary), 0.4);
          }
        }
      }
    }
  }

  // Swipe Hint
  .swipe-hint {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: map.get(vars.$spacing, s);
    padding: 8px 16px;
    border-radius: map.get(map.get(vars.$layout, border-radius), pill);
    font-size: map.get(map.get(vars.$fonts, sizes), small);
    animation: bounce 2s ease-in-out infinite;
    
    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background: rgba(mixins.theme-color($theme, text-primary), 0.1);
        color: mixins.theme-color($theme, text-secondary);
      }
    }

    .swipe-icon {
      width: 20px;
      height: 20px;
    }
  }
}

// Animations
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float-1 {
  0%, 100% {
    transform: translate(0, 0);
  }
  33% {
    transform: translate(30px, -30px);
  }
  66% {
    transform: translate(-20px, 20px);
  }
}

@keyframes float-2 {
  0%, 100% {
    transform: translate(0, 0);
  }
  33% {
    transform: translate(-30px, 30px);
  }
  66% {
    transform: translate(20px, -20px);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-10px);
  }
}

// Responsive adjustments for very small screens
@media (max-width: 375px) {
  .testimonial-carousel-section {
    .section-header {
      .section-title {
        font-size: 1.75rem;
      }
    }

    .testimonial-card {
      width: 95vw;
      
      .card-header {
        .author-info {
          gap: map.get(vars.$spacing, s);
        }
      }

      .testimonial-content {
        .testimonial-title {
          font-size: map.get(map.get(vars.$fonts, sizes), large);
        }

        .testimonial-text {
          font-size: map.get(map.get(vars.$fonts, sizes), small);
        }
      }
    }
  }
}
</style>