<template>
  <section class="section content-blocks-section" id="content" ref="sectionRef">
    <!-- Background Effects -->
    <div class="section-bg-effects">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
    </div>

    <!-- Section Header -->
    <div class="section-header">
      <div class="header-badge">FEATURES</div>
      <h2 class="section-title">
        <span class="title-text">Was ist</span>
        <span class="title-highlight">LearnToGrow</span>
        <span class="title-text">?</span>
      </h2>
      <p class="section-subtitle">Eine Plattform, die Generationen verbindet und gemeinsam wachsen lässt</p>
    </div>

    <!-- Content Blocks Container -->
    <div class="content-blocks-container">
      <!-- Parents Block -->
      <div class="content-card parents-card">
        <div class="card-glow"></div>
        <div class="card-inner">
          <!-- Card Header -->
          <div class="card-header">
            <div class="icon-container">
              <div class="icon-bg"></div>
              <UsersIcon class="card-icon" />
              <div class="icon-ring"></div>
            </div>
            <h3 class="card-title">Für Eltern</h3>
            <div class="title-underline"></div>
          </div>

          <!-- Features List -->
          <div class="features-container">
            <div class="feature-item" v-for="(feature, index) in parentFeatures" :key="index">
              <div class="feature-icon">
                <component :is="feature.icon" />
              </div>
              <div class="feature-content">
                <h4>{{ feature.title }}</h4>
                <p>{{ feature.description }}</p>
              </div>
            </div>
          </div>

          <!-- Card Footer -->
          <div class="card-footer">
            <button class="explore-btn" @click="redirectToLogin">
              <span>Jetzt starten</span>
              <ArrowRightIcon class="btn-icon" />
            </button>
          </div>

          <!-- Decorative Elements -->
          <div class="card-decoration">
            <div class="deco-circle deco-1"></div>
            <div class="deco-circle deco-2"></div>
          </div>
        </div>
      </div>

      <!-- Children Block -->
      <div class="content-card children-card">
        <div class="card-glow"></div>
        <div class="card-inner">
          <!-- Card Header -->
          <div class="card-header">
            <div class="icon-container">
              <div class="icon-bg"></div>
              <SparklesIcon class="card-icon" />
              <div class="icon-ring"></div>
            </div>
            <h3 class="card-title">Für Kinder</h3>
            <div class="title-underline"></div>
          </div>

          <!-- Features List -->
          <div class="features-container">
            <div class="feature-item" v-for="(feature, index) in childrenFeatures" :key="index">
              <div class="feature-icon">
                <component :is="feature.icon" />
              </div>
              <div class="feature-content">
                <h4>{{ feature.title }}</h4>
                <p>{{ feature.description }}</p>
              </div>
            </div>
          </div>

          <!-- Card Footer -->
          <div class="card-footer">
            <button class="explore-btn" @click="redirectToLogin">
              <span>Geschichten entdecken</span>
              <ArrowRightIcon class="btn-icon" />
            </button>
          </div>

          <!-- Decorative Elements -->
          <div class="card-decoration">
            <div class="deco-circle deco-1"></div>
            <div class="deco-circle deco-2"></div>
          </div>
        </div>
      </div>

      <!-- Center Connection Element -->
      <div class="connection-element">
        <div class="connection-line"></div>
        <div class="connection-center">
          <HeartIcon class="connection-icon" />
        </div>
      </div>
    </div>

    <!-- Floating Particles -->
    <div class="particles-container">
      <div v-for="i in 15" :key="i" :class="`particle particle-${i}`"></div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import {
  UsersIcon,
  SparklesIcon,
  HeartIcon,
  ArrowRightIcon,
  BookOpenIcon,
  ChatBubbleBottomCenterTextIcon,
  LightBulbIcon,
  PuzzlePieceIcon,
  AcademicCapIcon,
  FaceSmileIcon,
  HandRaisedIcon,
  StarIcon,
} from "@heroicons/vue/24/solid";

export default defineComponent({
  name: "ContentBlocksSection",
  components: {
    UsersIcon,
    SparklesIcon,
    HeartIcon,
    ArrowRightIcon,
    BookOpenIcon,
    ChatBubbleBottomCenterTextIcon,
    LightBulbIcon,
    PuzzlePieceIcon,
    AcademicCapIcon,
    FaceSmileIcon,
    HandRaisedIcon,
    StarIcon,
  },
  setup() {
    const router = useRouter();
    const sectionRef = ref<HTMLElement | null>(null);
    const observer = ref<IntersectionObserver | null>(null);

    const parentFeatures = [
      {
        icon: BookOpenIcon,
        title: "Expertenwissen",
        description: "Fundierte Artikel und Ratgeber, die dir helfen, dein Kind besser zu verstehen",
      },
      {
        icon: HandRaisedIcon,
        title: "Praktische Hilfe",
        description: "Konkrete Lösungsansätze für alltägliche Herausforderungen in der Erziehung",
      },
      {
        icon: ChatBubbleBottomCenterTextIcon,
        title: "Starke Community",
        description: "Austausch mit anderen Eltern, die ähnliche Erfahrungen machen",
      },
    ];

    const childrenFeatures = [
      {
        icon: LightBulbIcon,
        title: "Spannende Entdeckungen",
        description: "Alles über Gefühle, Freundschaften und die große weite Welt",
      },
      {
        icon: PuzzlePieceIcon,
        title: "Spielerisch Lernen",
        description: "Lustige Geschichten und Spiele, die beim Verstehen helfen",
      },
      {
        icon: StarIcon,
        title: "Neugier wecken",
        description: "Antworten auf all die Fragen, die dich beschäftigen",
      },
    ];

    // Redirect to login/register page
    const redirectToLogin = () => {
      // Add click animation effect
      const button = event?.currentTarget as HTMLElement;
      if (button) {
        button.classList.add("clicked");
        setTimeout(() => {
          button.classList.remove("clicked");
        }, 600);
      }

      // Navigate after short delay for animation
      setTimeout(() => {
        router.push("/login-register");
      }, 300);
    };

    onMounted(() => {
      // Intersection Observer for animations
      observer.value = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");

              // Animate cards
              const cards = entry.target.querySelectorAll(".content-card");
              cards.forEach((card, index) => {
                setTimeout(() => {
                  card.classList.add("animate-in");
                }, index * 200);
              });

              // Animate features
              const features = entry.target.querySelectorAll(".feature-item");
              features.forEach((feature, index) => {
                setTimeout(() => {
                  feature.classList.add("animate-in");
                }, 400 + index * 100);
              });
            }
          });
        },
        { threshold: 0.1 }
      );

      if (sectionRef.value) {
        observer.value.observe(sectionRef.value);
      }
    });

    onUnmounted(() => {
      if (observer.value) {
        observer.value.disconnect();
      }
    });

    return {
      sectionRef,
      parentFeatures,
      childrenFeatures,
      redirectToLogin,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;
@use "sass:map";

.content-blocks-section {
  position: relative;
  padding: map.get(vars.$spacing, xxxl) 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);

  &.visible {
    opacity: 1;
    transform: translateY(0);
  }

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
      filter: blur(100px);
      opacity: 0.3;

      &.orb-1 {
        width: 600px;
        height: 600px;
        top: -200px;
        left: -200px;
        animation: float-1 20s ease-in-out infinite;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: mixins.theme-color($theme, accent-green);
          }
        }
      }

      &.orb-2 {
        width: 500px;
        height: 500px;
        bottom: -200px;
        right: -200px;
        animation: float-2 25s ease-in-out infinite;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: mixins.theme-color($theme, accent-teal);
          }
        }
      }
    }

    .floating-shapes {
      position: absolute;
      width: 100%;
      height: 100%;

      .shape {
        position: absolute;
        opacity: 0.1;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: mixins.theme-color($theme, accent-lime);
          }
        }

        &.shape-1 {
          width: 100px;
          height: 100px;
          top: 20%;
          left: 10%;
          clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
          animation: rotate-shape 15s linear infinite;
        }

        &.shape-2 {
          width: 80px;
          height: 80px;
          top: 60%;
          right: 15%;
          clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
          animation: rotate-shape 20s linear infinite reverse;
        }

        &.shape-3 {
          width: 60px;
          height: 60px;
          bottom: 30%;
          left: 50%;
          border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          animation: morph-shape 10s ease-in-out infinite;
        }
      }
    }
  }

  // Section Header
  .section-header {
    text-align: center;
    margin-bottom: map.get(vars.$spacing, xxxl);
    position: relative;
    z-index: 1;
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
          background: rgba(mixins.theme-color($theme, accent-lime), 0.1);
          color: mixins.theme-color($theme, accent-lime);
          border: 1px solid mixins.theme-color($theme, accent-lime);
        }
      }
    }

    .section-title {
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
      line-height: 1.2;
      margin-bottom: map.get(vars.$spacing, m);

      .title-text {
        font-size: 2rem;
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }

      .title-highlight {
        font-size: 2rem;
        position: relative;
        display: inline-block;

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
      }
    }

    .section-subtitle {
      font-size: clamp(1rem, 2.5vw, 1.25rem);
      max-width: 600px;
      margin: 0 auto;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  // Content Blocks Container
  .content-blocks-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: map.get(vars.$spacing, xxl);
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 0 map.get(vars.$spacing, xl);
    position: relative;
    z-index: 1;

    @media (max-width: 968px) {
      grid-template-columns: 1fr;
      gap: map.get(vars.$spacing, xl);
    }

    @media (max-width: 480px) {
      padding: 0 map.get(vars.$spacing, m);
    }
  }

  // Content Cards
  .content-card {
    position: relative;
    border-radius: 24px;
    overflow: hidden;
    opacity: 0;
    transform: translateY(50px) scale(0.95);
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background: rgba(mixins.theme-color($theme, card-bg), 0.7);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(mixins.theme-color($theme, border-light), 0.5);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }
    }

    &.animate-in {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    &:hover {
      transform: translateY(-10px) scale(1.02);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
      }

      .card-glow {
        opacity: 1;
      }

      .icon-container {
        transform: scale(1.1) rotate(5deg);
      }

      .explore-btn {
        transform: translateX(5px);

        .btn-icon {
          transform: translateX(3px);
        }
      }
    }

    // Card Glow
    .card-glow {
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      opacity: 0;
      transition: opacity 0.6s ease;
      pointer-events: none;
      z-index: 0;
    }

    &.parents-card .card-glow {
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: radial-gradient(
            circle at 30% 30%,
            rgba(mixins.theme-color($theme, accent-green), 0.2),
            transparent 60%
          );
        }
      }
    }

    &.children-card .card-glow {
      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: radial-gradient(
            circle at 70% 70%,
            rgba(mixins.theme-color($theme, accent-teal), 0.2),
            transparent 60%
          );
        }
      }
    }

    // Card Inner
    .card-inner {
      position: relative;
      padding: map.get(vars.$spacing, xl);
      z-index: 1;

      @media (max-width: 480px) {
        padding: map.get(vars.$spacing, l);
      }
    }

    // Card Header
    .card-header {
      text-align: center;
      margin-bottom: map.get(vars.$spacing, xl);

      .icon-container {
        position: relative;
        width: 80px;
        height: 80px;
        margin: 0 auto map.get(vars.$spacing, l);
        transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);

        .icon-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 24px;

          .parents-card & {
            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                background: linear-gradient(
                  135deg,
                  mixins.theme-color($theme, accent-green),
                  mixins.theme-color($theme, accent-lime)
                );
              }
            }
          }

          .children-card & {
            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                background: linear-gradient(
                  135deg,
                  mixins.theme-color($theme, accent-teal),
                  mixins.theme-color($theme, accent-lime)
                );
              }
            }
          }
        }

        .card-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          color: white;
          z-index: 1;
        }

        .icon-ring {
          position: absolute;
          top: -10px;
          left: -10px;
          right: -10px;
          bottom: -10px;
          border-radius: 30px;
          opacity: 0.3;

          .parents-card & {
            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                border: 2px solid mixins.theme-color($theme, accent-green);
              }
            }
          }

          .children-card & {
            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                border: 2px solid mixins.theme-color($theme, accent-teal);
              }
            }
          }
        }
      }

      .card-title {
        font-size: map.get(map.get(vars.$fonts, sizes), xxl);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        margin-bottom: map.get(vars.$spacing, s);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }

      .title-underline {
        width: 60px;
        height: 3px;
        margin: 0 auto;
        border-radius: 2px;

        .parents-card & {
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background: linear-gradient(
                90deg,
                mixins.theme-color($theme, accent-green),
                mixins.theme-color($theme, accent-lime)
              );
            }
          }
        }

        .children-card & {
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background: linear-gradient(
                90deg,
                mixins.theme-color($theme, accent-teal),
                mixins.theme-color($theme, accent-lime)
              );
            }
          }
        }
      }
    }

    // Features Container
    .features-container {
      display: flex;
      flex-direction: column;
      gap: map.get(vars.$spacing, l);
      margin-bottom: map.get(vars.$spacing, xl);
    }

    // Feature Item
    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: map.get(vars.$spacing, m);
      opacity: 0;
      transform: translateX(-20px);
      transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);

      &.animate-in {
        opacity: 1;
        transform: translateX(0);
      }

      .feature-icon {
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: rgba(mixins.theme-color($theme, secondary-bg), 0.8);
            border: 1px solid rgba(mixins.theme-color($theme, border-light), 0.5);
          }
        }

        svg {
          width: 24px;
          height: 24px;

          .parents-card & {
            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, accent-green);
              }
            }
          }

          .children-card & {
            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, accent-teal);
              }
            }
          }
        }
      }

      .feature-content {
        flex: 1;

        h4 {
          font-size: map.get(map.get(vars.$fonts, sizes), medium);
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
          margin-bottom: 4px;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }

        p {
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          line-height: 1.6;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }
      }
    }

    // Card Footer
    .card-footer {
      text-align: center;

      .explore-btn {
        display: inline-flex;
        align-items: center;
        gap: map.get(vars.$spacing, s);
        padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        font-size: map.get(map.get(vars.$fonts, sizes), medium);
        border: none;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;

        .parents-card & {
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background: linear-gradient(
                135deg,
                mixins.theme-color($theme, accent-green),
                mixins.theme-color($theme, accent-lime)
              );
              color: white;
              box-shadow: 0 4px 15px rgba(mixins.theme-color($theme, accent-green), 0.3);
            }
          }
        }

        .children-card & {
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background: linear-gradient(
                135deg,
                mixins.theme-color($theme, accent-teal),
                mixins.theme-color($theme, accent-lime)
              );
              color: white;
              box-shadow: 0 4px 15px rgba(mixins.theme-color($theme, accent-teal), 0.3);
            }
          }
        }

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
          &::before {
            width: 300px;
            height: 300px;
          }
        }

        &.clicked {
          animation: button-click 0.6s ease-out;
        }

        .btn-icon {
          width: 20px;
          height: 20px;
          transition: transform 0.3s ease;
        }
      }
    }

    // Card Decoration
    .card-decoration {
      position: absolute;
      top: 0;
      right: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: hidden;

      .deco-circle {
        position: absolute;
        border-radius: 50%;
        opacity: 0.05;

        &.deco-1 {
          width: 200px;
          height: 200px;
          top: -100px;
          right: -100px;

          .parents-card & {
            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                background: mixins.theme-color($theme, accent-green);
              }
            }
          }

          .children-card & {
            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                background: mixins.theme-color($theme, accent-teal);
              }
            }
          }
        }

        &.deco-2 {
          width: 150px;
          height: 150px;
          bottom: -75px;
          left: -75px;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background: mixins.theme-color($theme, accent-lime);
            }
          }
        }
      }
    }
  }

  // Connection Element
  .connection-element {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
    pointer-events: none;

    @media (max-width: 968px) {
      display: none;
    }

    .connection-line {
      position: absolute;
      width: 200px;
      height: 2px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: linear-gradient(
            90deg,
            mixins.theme-color($theme, accent-green),
            mixins.theme-color($theme, accent-lime),
            mixins.theme-color($theme, accent-teal)
          );
        }
      }

      &::before,
      &::after {
        content: "";
        position: absolute;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        top: 50%;
        transform: translateY(-50%);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: mixins.theme-color($theme, accent-lime);
          }
        }
      }

      &::before {
        left: -5px;
      }

      &::after {
        right: -5px;
      }
    }

    .connection-center {
      position: absolute;
      width: 60px;
      height: 60px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 2s ease-in-out infinite;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: linear-gradient(
            135deg,
            mixins.theme-color($theme, accent-green),
            mixins.theme-color($theme, accent-teal)
          );
          box-shadow: 0 8px 32px rgba(mixins.theme-color($theme, accent-lime), 0.4);
        }
      }

      .connection-icon {
        width: 30px;
        height: 30px;
        color: white;
      }
    }
  }

  // Particles
  .particles-container {
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;

    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      border-radius: 50%;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: mixins.theme-color($theme, accent-lime);
          box-shadow: 0 0 6px rgba(mixins.theme-color($theme, accent-lime), 0.6);
        }
      }

      @for $i from 1 through 15 {
        &.particle-#{$i} {
          left: #{random(100)}%;
          top: 100%;
          animation: particle-rise #{10 + random(10)}s linear infinite;
          animation-delay: #{random(5)}s;
          opacity: #{0.3 + random(7) * 0.1};
        }
      }
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
  0%,
  100% {
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
  0%,
  100% {
    transform: translate(0, 0);
  }
  33% {
    transform: translate(-30px, 30px);
  }
  66% {
    transform: translate(20px, -20px);
  }
}

@keyframes rotate-shape {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes morph-shape {
  0%,
  100% {
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  }
  25% {
    border-radius: 58% 42% 75% 25% / 76% 46% 54% 24%;
  }
  50% {
    border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%;
  }
  75% {
    border-radius: 33% 67% 58% 42% / 63% 68% 32% 37%;
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.8;
  }
}

@keyframes particle-rise {
  0% {
    transform: translateY(0) translateX(0);
  }
  100% {
    transform: translateY(-100vh) translateX(#{random(200) - 100}px);
  }
}

@keyframes button-click {
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

// Responsive adjustments
@media (max-width: 768px) {
  .content-blocks-section {
    .section-header {
      .section-title {
        font-size: 2rem;
      }

      .section-subtitle {
        font-size: 1rem;
      }
    }

    .content-card {
      .card-header {
        .card-title {
          font-size: map.get(map.get(vars.$fonts, sizes), xl);
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .content-blocks-section {
    padding: map.get(vars.$spacing, xxl) 0;

    .content-blocks-container {
      grid-template-columns: 1fr;
    }
  }
}

// Reduced motion preference
@media (prefers-reduced-motion: reduce) {
  .content-blocks-section {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}
</style>
