<template>
  <section class="section epic-authors-section" id="Authors">
    <div class="floating-particles"></div>

    <!-- Animated Section Header -->
    <div class="section-header" ref="headerRef">
      <h2 class="main-title">Unsere Autoren</h2>
      <div class="header-subtitle">
        <span class="typewriter-text" ref="subtitleRef">Die Köpfe hinter den Geschichten</span>
      </div>
    </div>

    <!-- Authors Grid with Different Card Types -->
    <div class="authors-grid" ref="authorsGrid">
      <!-- Card Type 1: Hexagon Hero -->
      <div
        v-for="(author, index) in authors"
        :key="author.id"
        :class="['author-card', `card-type-${(index % 4) + 1}`, 'animation-pending']"
        :data-index="index"
        :ref="`authorCard${index}`"
      >
        <!-- Background Pattern -->
        <div class="card-bg-pattern"></div>

        <!-- Rating Badge (Top Right) -->
        <div class="rating-badge">
          <div class="stars-container">
            <StarIcon
              v-for="star in 5"
              :key="star"
              :class="[
                'star-icon',
                star <= Math.floor(author.rating)
                  ? 'filled'
                  : star === Math.ceil(author.rating) && author.rating % 1 >= 0.5
                  ? 'half-filled'
                  : 'empty',
              ]"
            />
          </div>
          <span class="rating-number">{{ author.rating }}</span>
        </div>

        <!-- Main Content -->
        <div class="card-content">
          <!-- Author Image with Unique Shape -->
          <div :class="['author-image-container', `shape-${(index % 3) + 1}`]">
            <div class="image-glow"></div>
            <img :src="author.image" :alt="author.name" class="author-image" />
            <div class="floating-icons">
              <!-- Hero Icons instead of Emojis -->
              <component
                v-for="(icon, iconIndex) in author.iconComponents"
                :key="iconIndex"
                :is="icon"
                :class="['floating-icon', `icon-${iconIndex + 1}`]"
              />
            </div>
          </div>

          <!-- Author Info with Staggered Text Animation -->
          <div class="author-info">
            <h3 class="author-name" :data-text="author.name">
              <span
                v-for="(char, charIndex) in author.name.split('')"
                :key="charIndex"
                :class="['char', char === ' ' ? 'space' : '']"
                :style="`--char-delay: ${charIndex * 0.05}s`"
              >
                {{ char === " " ? "\u00A0" : char }}
              </span>
            </h3>

            <div class="author-role">
              <BriefcaseIcon class="role-icon" />
              {{ author.role }}
            </div>

            <p class="author-bio">{{ author.bio }}</p>

            <!-- Specialties with Morphing Tags -->
            <div class="author-specialties">
              <div
                v-for="(specialty, specIndex) in author.specialties"
                :key="specIndex"
                class="specialty-tag"
                :style="`--tag-delay: ${specIndex * 0.1}s`"
              >
                <component :is="specialty.icon" class="specialty-icon" />
                {{ specialty.name }}
              </div>
            </div>

            <!-- Stats/Achievements -->
            <div class="author-stats">
              <div class="stat-item">
                <DocumentTextIcon class="stat-icon" />
                <span class="stat-number">{{ author.articlesCount }}</span>
                <span class="stat-label">Artikel</span>
              </div>
              <div class="stat-item">
                <CalendarIcon class="stat-icon" />
                <span class="stat-number">{{ author.yearsExperience }}</span>
                <span class="stat-label">Jahre</span>
              </div>
              <div class="stat-item">
                <UsersIcon class="stat-icon" />
                <span class="stat-number">{{ author.followersCount }}</span>
                <span class="stat-label">Follower</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Interactive Particles -->
        <div class="card-particles">
          <div v-for="i in 6" :key="i" class="particle" :style="`--delay: ${i * 0.2}s`"></div>
        </div>

        <!-- Hover Reveal Layer -->
        <div class="hover-reveal">
          <div class="reveal-content">
            <h4>Mehr über {{ author.name }}</h4>
            <p>{{ author.extendedBio }}</p>
            <div class="social-links">
              <div
                v-for="social in author.socialLinks"
                :key="social.platform"
                :class="['social-link', social.platform]"
              >
                <component :is="social.iconComponent" class="social-icon" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, nextTick } from "vue";
import {
  StarIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  CalendarIcon,
  UsersIcon,
  AcademicCapIcon,
  BeakerIcon,
  GlobeAltIcon,
  LanguageIcon,
  HandRaisedIcon,
  PaintBrushIcon,
  SparklesIcon,
  ComputerDesktopIcon,
  CpuChipIcon,
  BoltIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  FaceSmileIcon,
} from "@heroicons/vue/24/outline";

// Custom LinkedIn and Twitter icons (simplified)
const LinkedInIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  `,
};

const TwitterIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
    </svg>
  `,
};

// Realistic dummy authors with CORRECT Hero Icons
const authors = [
  {
    id: 4,
    name: "Dr. Thomas Müller",
    role: "Technologie & Bildung",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    bio: "Pionier für KI-gestützte Lernsysteme und digitale Kompetenzentwicklung.",
    extendedBio:
      "Dr. Müller forscht an der Schnittstelle von Künstlicher Intelligenz und Pädagogik und entwickelt die Lernplattformen von morgen.",
    specialties: [
      { name: "KI in Bildung", icon: CpuChipIcon },
      { name: "EdTech", icon: ComputerDesktopIcon },
      { name: "Algorithmic Learning", icon: BoltIcon },
    ],
    iconComponents: [CpuChipIcon, ComputerDesktopIcon, BoltIcon],
    articlesCount: 73,
    rating: 4.7,
    yearsExperience: 10,
    followersCount: "9.2K",
    socialLinks: [
      { platform: "github", iconComponent: ComputerDesktopIcon },
      { platform: "medium", iconComponent: DocumentTextIcon },
      { platform: "conferences", iconComponent: AcademicCapIcon },
    ],
  },
  {
    id: 5,
    name: "Sarah Johnson",
    role: "Montessori-Expertin",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    bio: "Zertifizierte Montessori-Pädagogin mit Fokus auf selbstbestimmtes Lernen.",
    extendedBio:
      "Sarah bringt über ein Jahrzehnt Erfahrung in der Montessori-Pädagogik mit und entwickelt innovative Materialien für das eigenständige Lernen.",
    specialties: [
      { name: "Montessori-Methode", icon: HomeIcon },
      { name: "Selbstständigkeit", icon: HandRaisedIcon },
      { name: "Materialentwicklung", icon: MagnifyingGlassIcon },
    ],
    iconComponents: [HomeIcon, HandRaisedIcon, MagnifyingGlassIcon],
    articlesCount: 94,
    rating: 4.8,
    yearsExperience: 11,
    followersCount: "7.8K",
    socialLinks: [
      { platform: "workshops", iconComponent: UsersIcon },
      { platform: "books", iconComponent: DocumentTextIcon },
      { platform: "consulting", iconComponent: BriefcaseIcon },
    ],
  },
  {
    id: 6,
    name: "Dr. Roberto Silva",
    role: "Bewegung & Gesundheit",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
    bio: "Sportwissenschaftler, der Bewegung als Schlüssel zum Lernerfolg erforscht.",
    extendedBio:
      "Dr. Silva zeigt auf, wie körperliche Aktivität die kognitive Entwicklung fördert und entwickelt bewegungsbasierte Lernkonzepte.",
    specialties: [
      { name: "Bewegungslernen", icon: BoltIcon },
      { name: "Neuromotorische Entwicklung", icon: AcademicCapIcon },
      { name: "Gesundheitspädagogik", icon: HeartIcon },
    ],
    iconComponents: [BoltIcon, AcademicCapIcon, HeartIcon],
    articlesCount: 112,
    rating: 4.9,
    yearsExperience: 14,
    followersCount: "11K",
    socialLinks: [
      { platform: "fitness", iconComponent: BoltIcon },
      { platform: "nutrition", iconComponent: HeartIcon },
      { platform: "health", iconComponent: BeakerIcon },
    ],
  },
];

export default defineComponent({
  name: "EpicAuthorsSection",
  components: {
    StarIcon,
    BriefcaseIcon,
    DocumentTextIcon,
    CalendarIcon,
    UsersIcon,
    AcademicCapIcon,
    BeakerIcon,
    GlobeAltIcon,
    LanguageIcon,
    HandRaisedIcon,
    PaintBrushIcon,
    SparklesIcon,
    ComputerDesktopIcon,
    CpuChipIcon,
    BoltIcon,
    HomeIcon,
    MagnifyingGlassIcon,
    HeartIcon,
    FaceSmileIcon,
    LinkedInIcon,
    TwitterIcon,
  },
  setup() {
    const headerRef = ref<HTMLElement>();
    const subtitleRef = ref<HTMLElement>();
    const authorsGrid = ref<HTMLElement>();

    const createFloatingParticles = () => {
      const container = document.querySelector(".floating-particles");
      if (!container) return;

      for (let i = 0; i < 20; i++) {
        const particle = document.createElement("div");
        particle.className = "floating-particle";
        particle.style.left = Math.random() * 100 + "%";
        particle.style.animationDelay = Math.random() * 10 + "s";
        particle.style.animationDuration = Math.random() * 10 + 10 + "s";
        container.appendChild(particle);
      }
    };

    const animateCards = () => {
      const cards = document.querySelectorAll(".author-card.animation-pending");

      cards.forEach((card, index) => {
        // Die Animation richtet sich nach dem Kartentyp (1-4)

        setTimeout(() => {
          card.classList.remove("animation-pending");
          card.classList.add("animate-in");

          // Animate text after card is visible
          setTimeout(() => {
            animateCardText(card as HTMLElement);
          }, 300);
        }, index * 200);
      });
    };

    const animateCardText = (card: HTMLElement) => {
      const chars = card.querySelectorAll(".author-name .char");
      const tags = card.querySelectorAll(".specialty-tag");
      const stats = card.querySelectorAll(".stat-number");

      chars.forEach((char, index) => {
        setTimeout(() => {
          char.classList.add("animate-char");
        }, index * 50);
      });

      tags.forEach((tag, index) => {
        setTimeout(() => {
          tag.classList.add("animate-tag");
        }, 500 + index * 100);
      });

      stats.forEach((stat, index) => {
        setTimeout(() => {
          animateCountUp(stat as HTMLElement);
        }, 800 + index * 100);
      });
    };

    const animateCountUp = (element: HTMLElement) => {
      const finalValue = element.textContent || "0";

      // Handle follower counts with 'K' suffix
      if (finalValue.includes("K")) {
        const numValue = parseFloat(finalValue.replace("K", ""));
        let currentValue = 0;
        const increment = numValue / 30;

        const timer = setInterval(() => {
          currentValue += increment;
          if (currentValue >= numValue) {
            currentValue = numValue;
            clearInterval(timer);
          }

          element.textContent = currentValue.toFixed(1) + "K";
        }, 50);
        return;
      }

      // Handle ratings with decimal points
      const isRating = finalValue.includes(".");
      const targetNumber = parseFloat(finalValue);

      let currentValue = 0;
      const increment = targetNumber / 30;

      const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetNumber) {
          currentValue = targetNumber;
          clearInterval(timer);
        }

        element.textContent = isRating ? currentValue.toFixed(1) : Math.floor(currentValue).toString();
      }, 50);
    };

    const setupIntersectionObserver = () => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (entry.target.classList.contains("section-header")) {
                entry.target.classList.add("animate-header");

                // Start typewriter effect
                setTimeout(() => {
                  startTypewriter();
                }, 800);
              } else if (entry.target.classList.contains("authors-grid")) {
                setTimeout(() => {
                  animateCards();
                }, 500);
              }
            }
          });
        },
        { threshold: 0.3 }
      );

      if (headerRef.value) observer.observe(headerRef.value);
      if (authorsGrid.value) observer.observe(authorsGrid.value);
    };

    const startTypewriter = () => {
      const element = subtitleRef.value;
      if (!element) return;

      const text = element.textContent || "";
      element.textContent = "";
      element.style.visibility = "visible";

      let i = 0;
      const timer = setInterval(() => {
        element.textContent += text.charAt(i);
        i++;
        if (i >= text.length) {
          clearInterval(timer);
          element.classList.add("typewriter-complete");
        }
      }, 100);
    };

    onMounted(async () => {
      await nextTick();
      createFloatingParticles();
      setupIntersectionObserver();
    });

    return {
      authors,
      headerRef,
      subtitleRef,
      authorsGrid,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;
@use "@/style/base/animations" as animations;

.epic-authors-section {
  position: relative;
  padding: map.get(vars.$spacing, xxxl) 0;
  overflow: hidden;
  min-height: 100vh;

  // Floating Background Particles
  .floating-particles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;

    .floating-particle {
      position: absolute;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      animation: float-particle 15s infinite linear;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: mixins.theme-color($theme, accent-teal);
          box-shadow: 0 0 6px mixins.theme-color($theme, glow-teal);
        }
      }
    }
  }

  // Section Header with Glitch Effect
  .section-header {
    text-align: center;
    margin-bottom: map.get(vars.$spacing, xxxl);
    position: relative;
    z-index: 1;
    opacity: 0;
    transform: translateY(50px);
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);

    &.animate-header {
      opacity: 1;
      transform: translateY(0);
    }

    .main-title {
      font-size: 2rem !important;
      font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
      margin-bottom: map.get(vars.$spacing, l);
      position: relative;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);

          &::after {
            content: "";
            position: absolute;
            width: 70%;
            height: 4px;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            background: mixins.theme-gradient($theme, primary);
            border-radius: 4px;
          }
        }
      }
    }

    .header-subtitle {
      font-size: map.get(map.get(vars.$fonts, sizes), xl);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      visibility: hidden;
      position: relative;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }

      .typewriter-text {
        &::after {
          content: "|";
          animation: blink 1s infinite;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, accent-green);
            }
          }
        }

        &.typewriter-complete::after {
          display: none;
        }
      }
    }
  }

  // Authors Grid
  .authors-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
    gap: map.get(vars.$spacing, xxl);
    padding: 0 map.get(vars.$spacing, xl);
    max-width: 1400px;
    margin: 0 auto;
    position: relative;
    z-index: 1;

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
      gap: map.get(vars.$spacing, xl);
      padding: 0 map.get(vars.$spacing, m);
    }
  }

  // Author Cards - Different Types
  .author-card {
    position: relative;
    min-height: 550px; // Erhöht von 500px
    height: auto; // Flexibel statt fest
    border-radius: map.get(map.get(vars.$layout, border-radius), xlarge);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);

    @media (max-width: 768px) {
      min-height: 500px; // Reduziert für Mobile
    }

    @media (max-width: 480px) {
      min-height: 450px; // Noch kompakter für sehr kleine Screens
    }

    // Initial state for animations
    &.animation-pending {
      opacity: 0;
      transform: translateY(100px) scale(0.8);
    }

    // Card Type Variations mit angepassten Animationen
    &.card-type-1 {
      clip-path: polygon(15% 0, 100% 0, 100% 100%, 0 100%);

      &.animate-in {
        animation: slideInDiagonal 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }

      // Subtile Morphing-Animation nach dem Einblenden
      &.animate-in::after {
        content: "";
        animation: morphingSubtle 8s ease-in-out 1s infinite;
      }
    }

    &.card-type-2 {
      clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
      transform-style: preserve-3d;

      &.animate-in {
        animation: hexagonReveal 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }
    }

    &.card-type-3 {
      clip-path: polygon(0 0, 100% 0, 85% 100%, 0 100%);

      &.animate-in {
        animation: slideInSkewed 0.9s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }
    }

    &.card-type-4 {
      clip-path: polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%);

      &.animate-in {
        animation: trapezoidMorph 1.1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }
    }

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background: linear-gradient(
          135deg,
          rgba(mixins.theme-color($theme, card-bg), 0.9) 0%,
          rgba(mixins.theme-color($theme, secondary-bg), 0.8) 100%
        );
        border: 2px solid rgba(mixins.theme-color($theme, accent-green), 0.3);
        backdrop-filter: blur(20px);
        @include mixins.shadow("large", $theme);

        &:hover {
          border-color: mixins.theme-color($theme, accent-green);
          @include mixins.glow("green", "large", $theme);
        }
      }
    }

    // Rating Badge (Top Right)
    .rating-badge {
      position: absolute;
      top: map.get(vars.$spacing, m);
      right: map.get(vars.$spacing, m);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: map.get(vars.$spacing, s);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      z-index: 10;
      transition: all 0.3s ease;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: rgba(mixins.theme-color($theme, card-bg), 0.95);
          border: 2px solid mixins.theme-color($theme, accent-yellow);
          backdrop-filter: blur(10px);
        }
      }

      .stars-container {
        display: flex;
        gap: 2px;
        margin-bottom: 4px;

        .star-icon {
          width: 16px;
          height: 16px;
          transition: all 0.3s ease;

          &.filled {
            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, accent-yellow);
                fill: mixins.theme-color($theme, accent-yellow);
              }
            }
          }

          &.half-filled {
            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, accent-yellow);
                fill: url(#half-star-gradient);
              }
            }
          }

          &.empty {
            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: rgba(mixins.theme-color($theme, text-tertiary), 0.3);
                fill: none;
              }
            }
          }
        }
      }

      .rating-number {
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }
    }

    // Background Pattern
    .card-bg-pattern {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0.1;
      background-image: radial-gradient(circle at 25% 25%, #fff 2px, transparent 2px),
        radial-gradient(circle at 75% 75%, #fff 1px, transparent 1px);
      background-size: 30px 30px, 20px 20px;
      animation: patternMove 20s linear infinite;
    }

    // Main Content
    .card-content {
      position: relative;
      padding: map.get(vars.$spacing, l); // Reduziert von xl
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      z-index: 2;
      gap: map.get(vars.$spacing, s); // Kompaktere Abstände

      @media (max-width: 768px) {
        padding: map.get(vars.$spacing, m); // Noch kompakter auf Mobile
        gap: map.get(vars.$spacing, xs);
      }
    }

    // Author Image Container
    .author-image-container {
      position: relative;
      margin-bottom: map.get(vars.$spacing, s); // Reduziert von l
      transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);

      &.shape-1 {
        width: 100px; // Reduziert von 120px
        height: 100px;
        border-radius: 50%;
      }

      &.shape-2 {
        width: 100px; // Reduziert von 120px
        height: 100px;
        clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
      }

      &.shape-3 {
        width: 100px; // Reduziert von 120px
        height: 100px;
        border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
      }

      .image-glow {
        position: absolute;
        top: -10px;
        left: -10px;
        right: -10px;
        bottom: -10px;
        border-radius: inherit;
        z-index: -1;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: linear-gradient(
              45deg,
              mixins.theme-color($theme, accent-green),
              mixins.theme-color($theme, accent-teal),
              mixins.theme-color($theme, accent-lime)
            );
            filter: blur(15px);
            opacity: 0.6;
          }
        }
      }

      .author-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: inherit;
        transition: transform 0.6s ease;
      }

      .floating-icons {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;

        .floating-icon {
          position: absolute;
          width: 20px; // Reduziert von 24px
          height: 20px;
          animation: floatIcon 3s ease-in-out infinite;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, accent-green);
              filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
            }
          }

          &.icon-1 {
            top: -50px; // Reduziert von -60px
            left: -15px; // Reduziert von -20px
            animation-delay: 0s;
          }

          &.icon-2 {
            top: -35px; // Reduziert von -40px
            right: -25px; // Reduziert von -30px
            animation-delay: 1s;
          }

          &.icon-3 {
            bottom: -40px; // Reduziert von -50px
            left: 5px; // Reduziert von 10px
            animation-delay: 2s;
          }
        }
      }
    }

    // Author Info
    .author-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      width: 100%;
      gap: map.get(vars.$spacing, xs); // Kompakte Abstände zwischen Elementen
    }

    .author-name {
      font-size: map.get(map.get(vars.$fonts, sizes), large); // Reduziert von xl
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      margin-bottom: map.get(vars.$spacing, xxs); // Sehr kleiner Abstand
      overflow: hidden;

      @media (max-width: 768px) {
        font-size: map.get(map.get(vars.$fonts, sizes), medium);
      }

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }

      .char {
        display: inline-block;
        opacity: 0;
        transform: translateY(30px) rotateX(-90deg);
        transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);

        &.animate-char {
          opacity: 1;
          transform: translateY(0) rotateX(0deg);
        }

        &.space {
          width: 0.3em;
        }
      }
    }

    .author-role {
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      margin-bottom: map.get(vars.$spacing, xs); // Reduziert von m
      text-transform: uppercase;
      letter-spacing: 1px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: map.get(vars.$spacing, xxs); // Kleinerer Gap

      @media (max-width: 768px) {
        font-size: 11px; // Noch kleiner auf Mobile
      }

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, accent-teal);
        }
      }

      .role-icon {
        width: 14px; // Reduziert von 16px
        height: 14px;
      }
    }

    .author-bio {
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      line-height: 1.4; // Reduziert von 1.5
      margin-bottom: map.get(vars.$spacing, s); // Reduziert von m
      opacity: 0.9;

      @media (max-width: 768px) {
        font-size: 12px;
        line-height: 1.3;
      }

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }

    // Specialties
    .author-specialties {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: map.get(vars.$spacing, xxs); // Reduziert von xs
      margin-bottom: map.get(vars.$spacing, s); // Reduziert von l

      .specialty-tag {
        padding: 3px map.get(vars.$spacing, xs); // Reduziert padding
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        font-size: 11px; // Reduziert von small
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        opacity: 0;
        transform: scale(0) rotate(180deg);
        transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        gap: 3px; // Reduziert gap

        @media (max-width: 768px) {
          font-size: 10px;
          padding: 2px 6px;
        }

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: linear-gradient(
              45deg,
              mixins.theme-color($theme, accent-teal),
              mixins.theme-color($theme, accent-green)
            );
            color: white;
          }
        }

        .specialty-icon {
          width: 12px; // Reduziert von 14px
          height: 12px;
        }

        &.animate-tag {
          opacity: 1;
          transform: scale(1) rotate(0deg);
        }
      }
    }

    // Stats
    .author-stats {
      display: flex;
      justify-content: space-around;
      width: 100%;

      .stat-item {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px; // Reduziert von 4px

        .stat-icon {
          width: 18px; // Reduziert von 20px
          height: 18px;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, accent-teal);
            }
          }
        }

        .stat-number {
          display: block;
          font-size: map.get(map.get(vars.$fonts, sizes), medium); // Reduziert von large
          font-weight: map.get(map.get(vars.$fonts, weights), bold);

          @media (max-width: 768px) {
            font-size: map.get(map.get(vars.$fonts, sizes), small);
          }

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, accent-green);
            }
          }
        }

        .stat-label {
          font-size: 11px; // Reduziert von small
          opacity: 0.8;

          @media (max-width: 768px) {
            font-size: 10px;
          }

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }
      }
    }

    // Interactive Particles
    .card-particles {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;

      .particle {
        position: absolute;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        opacity: 0;
        animation: particleFloat 4s ease-in-out infinite;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: mixins.theme-color($theme, accent-lime);
          }
        }
      }
    }

    // Hover Reveal
    .hover-reveal {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      padding: map.get(vars.$spacing, xl);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: rotateY(180deg);
      transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 3;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: linear-gradient(
            135deg,
            rgba(mixins.theme-color($theme, accent-green), 0.95) 0%,
            rgba(mixins.theme-color($theme, accent-teal), 0.95) 100%
          );
          color: white;
        }
      }

      .reveal-content {
        text-align: center;
        transform: translateY(20px);
        transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s;

        h4 {
          font-size: map.get(map.get(vars.$fonts, sizes), large);
          margin-bottom: map.get(vars.$spacing, m);
        }

        p {
          font-size: map.get(map.get(vars.$fonts, sizes), medium);
          line-height: 1.6;
          margin-bottom: map.get(vars.$spacing, l);
          opacity: 0.9;
        }

        .social-links {
          display: flex;
          justify-content: center;
          gap: map.get(vars.$spacing, m);

          .social-link {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.2);
            cursor: pointer;
            transition: all 0.3s ease;

            .social-icon {
              width: 20px;
              height: 20px;
              color: white;
            }

            &:hover {
              background: rgba(255, 255, 255, 0.3);
              transform: scale(1.1);
            }
          }
        }
      }
    }

    // Hover Effect
    &:hover {
      transform: translateY(-10px) scale(1.02);

      .author-image-container {
        transform: scale(1.1);
      }

      .hover-reveal {
        opacity: 1;
        transform: rotateY(0deg);

        .reveal-content {
          transform: translateY(0);
        }
      }

      .card-particles .particle {
        opacity: 1;
      }
    }
  }
}

// Keyframe Animations
@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

@keyframes float-particle {
  0% {
    transform: translateY(100vh) translateX(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) translateX(100px) rotate(360deg);
    opacity: 0;
  }
}

// Animation für card-type-1 (schräger Schnitt links)
@keyframes slideInDiagonal {
  0% {
    opacity: 0;
    transform: translateX(-100px) translateY(100px) rotate(-5deg);
    clip-path: polygon(0% 0, 0% 0, 0% 100%, 0% 100%);
  }
  50% {
    opacity: 0.7;
    clip-path: polygon(0% 0, 50% 0, 50% 100%, 0% 100%);
  }
  100% {
    opacity: 1;
    transform: translateX(0) translateY(0) rotate(0deg);
    clip-path: polygon(15% 0, 100% 0, 100% 100%, 0 100%);
  }
}

// Animation für card-type-2 (Hexagon)
@keyframes hexagonReveal {
  0% {
    opacity: 0;
    transform: scale(0) rotateZ(180deg);
    clip-path: polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%);
  }
  50% {
    opacity: 0.8;
    transform: scale(0.5) rotateZ(90deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotateZ(0deg);
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  }
}

// Animation für card-type-3 (schräger Schnitt rechts)
@keyframes slideInSkewed {
  0% {
    opacity: 0;
    transform: translateX(100px) translateY(100px) rotate(5deg);
    clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%);
  }
  50% {
    opacity: 0.7;
    clip-path: polygon(50% 0, 100% 0, 100% 100%, 50% 100%);
  }
  100% {
    opacity: 1;
    transform: translateX(0) translateY(0) rotate(0deg);
    clip-path: polygon(0 0, 100% 0, 85% 100%, 0 100%);
  }
}

// Animation für card-type-4 (Trapez)
@keyframes trapezoidMorph {
  0% {
    opacity: 0;
    transform: translateY(100px) scale(0.3);
    clip-path: polygon(50% 100%, 50% 100%, 50% 100%, 50% 100%);
  }
  30% {
    opacity: 0.5;
    transform: translateY(50px) scale(0.6);
    clip-path: polygon(40% 50%, 60% 50%, 60% 100%, 40% 100%);
  }
  60% {
    opacity: 0.8;
    transform: translateY(20px) scale(0.8);
    clip-path: polygon(30% 25%, 70% 25%, 65% 100%, 35% 100%);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    clip-path: polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%);
  }
}

// Subtile Morphing-Animation für card-type-1
@keyframes morphingSubtle {
  0%,
  100% {
    clip-path: polygon(15% 0, 100% 0, 100% 100%, 0 100%);
  }
  25% {
    clip-path: polygon(12% 0, 100% 0, 100% 100%, 0 100%);
  }
  50% {
    clip-path: polygon(18% 0, 100% 0, 100% 100%, 0 100%);
  }
  75% {
    clip-path: polygon(14% 0, 100% 0, 100% 100%, 0 100%);
  }
}

@keyframes floatIcon {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-10px) rotate(180deg);
    opacity: 1;
  }
}

@keyframes particleFloat {
  0%,
  100% {
    opacity: 0;
    transform: translateY(0) scale(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-20px) scale(1);
  }
}

@keyframes patternMove {
  0% {
    background-position: 0 0, 0 0;
  }
  100% {
    background-position: 30px 30px, 20px 20px;
  }
}

// Responsive Design
@media (max-width: 768px) {
  .epic-authors-section {
    .authors-grid {
      grid-template-columns: 1fr;
      gap: map.get(vars.$spacing, l); // Reduziert gap auf Mobile
    }

    .author-card {
      min-height: 480px; // Kompakter aber nicht zu klein

      .card-content {
        padding: map.get(vars.$spacing, m);
        gap: map.get(vars.$spacing, xs);
      }

      .rating-badge {
        top: map.get(vars.$spacing, s);
        right: map.get(vars.$spacing, s);
        padding: map.get(vars.$spacing, xs);

        .stars-container .star-icon {
          width: 14px;
          height: 14px;
        }

        .rating-number {
          font-size: 11px;
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .epic-authors-section {
    .authors-grid {
      padding: 0 map.get(vars.$spacing, s);
    }

    .author-card {
      min-height: 420px; // Noch kompakter für sehr kleine Screens

      .author-image-container {
        &.shape-1,
        &.shape-2,
        &.shape-3 {
          width: 80px; // Noch kleineres Bild
          height: 80px;
        }
      }

      .author-specialties .specialty-tag {
        font-size: 9px;
        padding: 2px 5px;
      }
    }
  }
}

// Global Hero Icon Styling
:deep(.hero-icon) {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
