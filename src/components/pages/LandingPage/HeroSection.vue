<template>
  <section class="section hero-section" id="hero">
    <div class="hero-container">
      <div class="hero-text">
        <div class="title-wrapper">
          <h1 class="hero-title">
            <span class="title-line">Deine Familie.</span>
            <span class="title-line">Dein digitales <span class="flip-text-container">
                <span class="flip-text">Zuhause</span>
              </span></span>
          </h1>
        </div>

        <p class="hero-subtext">
          Die Plattform, die Generationen verbindet. Von ersten Schritten bis zu den großen Lebensfragen –
          wir begleiten euch mit Wissen, Geschichten und einer starken Community.
        </p>

        <div class="hero-features">
          <div class="feature-card">
            <div class="feature-icon">
              <HeroiconsBrainIcon />
            </div>
            <div class="feature-content">
              <h3>Wissen das weiterbringt</h3>
              <p>Expertenwissen für jeden Lebensabschnitt</p>
            </div>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <HeroiconsHeartIcon />
            </div>
            <div class="feature-content">
              <h3>Geschichten die verbinden</h3>
              <p>Autoren teilen ihre Erfahrungen</p>
            </div>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <HeroiconsUsersIcon />
            </div>
            <div class="feature-content">
              <h3>Community die unterstützt</h3>
              <p>Gemeinsam durch den Familienalltag</p>
            </div>
          </div>
        </div>

        <div class="hero-cta">
          <router-link to="/login-register" class="btn-primary">
            <span>Jetzt starten</span>
            <HeroiconsArrowRightIcon class="cta-icon" />
          </router-link>
          <button class="btn-secondary" @click="$router.push({ hash: '#content' })">
            <span>Entdecke mehr</span>
            <div class="btn-bg"></div>
          </button>
        </div>

        <!-- Floating Elements -->
        <div class="floating-elements">
          <div class="floating-el el-1"></div>
          <div class="floating-el el-2"></div>
          <div class="floating-el el-3"></div>
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div class="scroll-indicator">
        <div class="mouse">
          <div class="wheel"></div>
        </div>
        <span>Scroll</span>
      </div>

      <!-- Right Side Animation -->
      <div class="hero-visual">
        <div class="animation-container">
          <!-- 3D Rotating Cards -->
          <div class="cards-orbit">
            <div class="orbit-ring ring-1">
              <div class="orbit-card card-1">
                <HeroiconsBookOpenIcon />
                <span>Ratgeber</span>
              </div>
              <div class="orbit-card card-2">
                <HeroiconsPuzzlePieceIcon />
                <span>Spiele</span>
              </div>
            </div>

            <div class="orbit-ring ring-2">
              <div class="orbit-card card-3">
                <HeroiconsAcademicCapIcon />
                <span>Lernen</span>
              </div>
              <div class="orbit-card card-4">
                <HeroiconsChatBubbleBottomCenterTextIcon />
                <span>Austausch</span>
              </div>
            </div>

            <div class="orbit-ring ring-3">
              <div class="orbit-card card-5">
                <HeroiconsHandThumbUpIcon />
                <span>Tipps</span>
              </div>
              <div class="orbit-card card-6">
                <HeroiconsSparklesIcon />
                <span>Inspiration</span>
              </div>
            </div>
          </div>

          <!-- Central Logo with Glow -->
          <div class="central-element">
            <div class="glow-effect"></div>
            <img src="@/assets/images/Logo.webp" alt="LearnToGrow Logo" class="logo-3d" />
            <div class="pulse-ring"></div>
            <div class="pulse-ring delay"></div>
          </div>

          <!-- Particle Effects -->
          <div class="particles">
            <div v-for="i in 20" :key="i" :class="`particle particle-${i}`"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import {
  ChevronDownIcon as HeroiconsChevronDownIcon,
  ArrowRightIcon as HeroiconsArrowRightIcon,
  HeartIcon as HeroiconsHeartIcon,
  UsersIcon as HeroiconsUsersIcon,
  BookOpenIcon as HeroiconsBookOpenIcon,
  PuzzlePieceIcon as HeroiconsPuzzlePieceIcon,
  AcademicCapIcon as HeroiconsAcademicCapIcon,
  ChatBubbleBottomCenterTextIcon as HeroiconsChatBubbleBottomCenterTextIcon,
  HandThumbUpIcon as HeroiconsHandThumbUpIcon,
  SparklesIcon as HeroiconsSparklesIcon
} from '@heroicons/vue/24/solid';
import { LightBulbIcon as HeroiconsBrainIcon } from '@heroicons/vue/24/outline';

export default defineComponent({
  name: 'HeroSection',
  components: {
    HeroiconsChevronDownIcon,
    HeroiconsArrowRightIcon,
    HeroiconsBrainIcon,
    HeroiconsHeartIcon,
    HeroiconsUsersIcon,
    HeroiconsBookOpenIcon,
    HeroiconsPuzzlePieceIcon,
    HeroiconsAcademicCapIcon,
    HeroiconsChatBubbleBottomCenterTextIcon,
    HeroiconsHandThumbUpIcon,
    HeroiconsSparklesIcon
  },
  setup() {
    const flipTexts = ['Zuhause', 'Netzwerk', 'Erlebnis', 'Abenteuer', 'Wissensportal'];
    let currentIndex = 0;

    onMounted(() => {
      // Text flip animation
      setInterval(() => {
        const flipElement = document.querySelector('.flip-text');
        if (flipElement) {
          (flipElement as HTMLElement).style.transform = 'rotateX(90deg)';
          setTimeout(() => {
            currentIndex = (currentIndex + 1) % flipTexts.length;
            flipElement.textContent = flipTexts[currentIndex];
            (flipElement as HTMLElement).style.transform = 'rotateX(0deg)';
          }, 300);
        }
      }, 3000);
    });

    return {};
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use "sass:math";

@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;

// Modern animations
@keyframes float {

  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

@keyframes orbit-rotate {
  from {
    transform: rotateY(0deg) rotateX(15deg);
  }

  to {
    transform: rotateY(360deg) rotateX(15deg);
  }
}

@keyframes card-self-rotate {
  from {
    transform: rotateY(0deg);
  }

  to {
    transform: rotateY(-360deg);
  }
}

@keyframes pulse-expand {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }

  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

@keyframes particle-float {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }

  10% {
    opacity: 0.8;
  }

  90% {
    opacity: 0.8;
  }

  100% {
    transform: translateY(-100vh) rotate(720deg);
    opacity: 0;
  }
}

@keyframes glow-pulse {

  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

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

.hero-section {
  margin: 0 auto;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 map.get(vars.$spacing, xxxl);

  // Background gradient
  &::before {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    top: -50%;
    left: -50%;
    animation: float 20s ease-in-out infinite;
  }

  .hero-container {

    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: map.get(vars.$spacing, xxl);
    width: 100%;
    align-items: center;
    position: relative;

    @media (max-width: map.get(map.get(vars.$layout, breakpoints), desktop)) {
      grid-template-columns: 1fr;
    }
  }

  .hero-text {
    position: relative;
    z-index: 2;

    .title-wrapper {
      overflow: hidden;
      margin-bottom: map.get(vars.$spacing, xl);
    }

    .hero-title {
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
      line-height: 1.1;
      margin: 0;

      .title-line {
        display: block;
        animation: fade-in-up 0.8s ease-out backwards;

        &:nth-child(2) {
          animation-delay: 0.2s;
        }
      }

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }

      .flip-text-container {
        display: inline-block;
        position: relative;

        .flip-text {
          display: inline-block;
          transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          transform-style: preserve-3d;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background: mixins.theme-gradient($theme, primary);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
          }
        }
      }
    }

    .hero-subtext {
      font-size: clamp(1.1rem, 2vw, 1.3rem);
      line-height: 1.7;
      margin-bottom: map.get(vars.$spacing, xxl);
      max-width: 600px;
      animation: fade-in-up 0.8s ease-out 0.4s backwards;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  .hero-features {
    display: grid;
    gap: map.get(vars.$spacing, m);
    margin-bottom: map.get(vars.$spacing, xxl);
    animation: fade-in-up 0.8s ease-out 0.6s backwards;

    .feature-card {
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, m);
      padding: map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), large);
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: rgba(mixins.theme-color($theme, secondary-bg), 0.6);
          border: 1px solid rgba(mixins.theme-color($theme, border-light), 0.3);

          &:hover {
            transform: translateX(10px);
            background: rgba(mixins.theme-color($theme, secondary-bg), 0.8);
            border-color: mixins.theme-color($theme, accent-teal);
            box-shadow: 0 10px 30px rgba(mixins.theme-color($theme, shadow-color), 0.1);
          }
        }
      }

      .feature-icon {
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);
        flex-shrink: 0;

        svg {
          width: 24px;
          height: 24px;
        }

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: mixins.theme-gradient($theme, primary);
            color: white;
          }
        }
      }

      .feature-content {
        h3 {
          font-size: map.get(map.get(vars.$fonts, sizes), medium);
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
          margin: 0 0 4px 0;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }

        p {
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          margin: 0;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }
      }
    }
  }

  .hero-cta {
    display: flex;
    gap: map.get(vars.$spacing, m);
    margin-top: map.get(vars.$spacing, xl);
    animation: fade-in-up 0.8s ease-out 0.8s backwards;

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: map.get(vars.$spacing, s);
      padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      font-size: map.get(map.get(vars.$fonts, sizes), medium);
      text-decoration: none;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, primary);
          color: white;
          box-shadow: 0 4px 15px rgba(mixins.theme-color($theme, accent-teal), 0.3);

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(mixins.theme-color($theme, accent-teal), 0.4);
          }
        }
      }

      .cta-icon {
        width: 20px;
        height: 20px;
        transition: transform 0.3s ease;
      }

      &:hover .cta-icon {
        transform: translateX(5px);
      }
    }

    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: map.get(vars.$spacing, s);
      padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      font-size: map.get(map.get(vars.$fonts, sizes), medium);
      cursor: pointer;
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: rgba(mixins.theme-color($theme, secondary-bg), 0.5);
          color: mixins.theme-color($theme, text-primary);
          border: 2px solid rgba(mixins.theme-color($theme, border-medium), 0.5);

          &:hover {
            transform: translateY(-2px);
            background: rgba(mixins.theme-color($theme, secondary-bg), 0.8);
            border-color: mixins.theme-color($theme, accent-lime);
          }
        }
      }

      .btn-bg {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        transition: all 0.5s ease;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: rgba(mixins.theme-color($theme, accent-lime), 0.2);
          }
        }
      }

      &:hover .btn-bg {
        width: 300px;
        height: 300px;
      }
    }
  }

  // Floating background elements
  .floating-elements {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: -1;

    .floating-el {
      position: absolute;
      border-radius: 50%;
      filter: blur(40px);
      animation: float 15s ease-in-out infinite;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          &.el-1 {
            width: 200px;
            height: 200px;
            top: 10%;
            left: -100px;
            background: rgba(mixins.theme-color($theme, accent-teal), 0.3);
            animation-delay: 0s;
          }

          &.el-2 {
            width: 150px;
            height: 150px;
            top: 60%;
            left: 10%;
            background: rgba(mixins.theme-color($theme, accent-lime), 0.2);
            animation-delay: 5s;
          }

          &.el-3 {
            width: 100px;
            height: 100px;
            top: 30%;
            left: 40%;
            background: rgba(mixins.theme-color($theme, accent-green), 0.2);
            animation-delay: 10s;
          }
        }
      }
    }
  }

  // Scroll indicator
  .scroll-indicator {
    position: absolute;
    bottom: -150px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    animation: fade-in-up 1s ease-out 1s backwards;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
      }
    }

    .mouse {
      width: 25px;
      height: 40px;
      border: 2px solid currentColor;
      border-radius: 15px;
      position: relative;

      .wheel {
        width: 3px;
        height: 8px;
        background: currentColor;
        border-radius: 2px;
        position: absolute;
        top: 8px;
        left: 50%;
        transform: translateX(-50%);
        animation: scroll-wheel 1.5s ease-in-out infinite;
      }
    }

    span {
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      text-transform: uppercase;
      letter-spacing: 2px;
    }
  }

  @keyframes scroll-wheel {
    0% {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }

    100% {
      transform: translateX(-50%) translateY(15px);
      opacity: 0;
    }
  }

  // Right side 3D animation
  .hero-visual {
    position: relative;
    height: 600px;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (max-width: map.get(map.get(vars.$layout, breakpoints), desktop)) {
      display: none;
    }

    .animation-container {
      position: relative;
      width: 500px;
      height: 500px;
      transform-style: preserve-3d;
      perspective: 1000px;

      // Orbiting cards
      .cards-orbit {
        position: absolute;
        width: 100%;
        height: 100%;
        transform-style: preserve-3d;
        animation: orbit-rotate 30s linear infinite;

        .orbit-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;

          &.ring-1 {
            transform: rotateX(0deg);
          }

          &.ring-2 {
            transform: rotateX(60deg);
          }

          &.ring-3 {
            transform: rotateX(-60deg);
          }

          .orbit-card {
            position: absolute;
            width: 80px;
            height: 80px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 5px;
            border-radius: map.get(map.get(vars.$layout, border-radius), medium);
            backdrop-filter: blur(10px);
            animation: card-self-rotate 30s linear infinite;
            transform-style: preserve-3d;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background: rgba(mixins.theme-color($theme, secondary-bg), 0.8);
                border: 1px solid rgba(mixins.theme-color($theme, border-light), 0.5);
                box-shadow: 0 10px 30px rgba(mixins.theme-color($theme, shadow-color), 0.2);
              }
            }

            svg {
              width: 24px;
              height: 24px;

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, accent-teal);
                }
              }
            }

            span {
              font-size: 11px;
              font-weight: map.get(map.get(vars.$fonts, weights), medium);

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, text-primary);
                }
              }
            }

            // Card positions
            &.card-1 {
              top: 50%;
              left: 0;
              transform: translateY(-50%) translateX(-150px);
            }

            &.card-2 {
              top: 50%;
              right: 0;
              transform: translateY(-50%) translateX(150px);
            }

            &.card-3 {
              top: 0;
              left: 50%;
              transform: translateX(-50%) translateY(-150px);
            }

            &.card-4 {
              bottom: 0;
              left: 50%;
              transform: translateX(-50%) translateY(150px);
            }

            &.card-5 {
              top: 20%;
              left: 20%;
              transform: translate(-50%, -50%) translateZ(150px);
            }

            &.card-6 {
              bottom: 20%;
              right: 20%;
              transform: translate(50%, 50%) translateZ(-150px);
            }
          }
        }
      }

      // Central element
      .central-element {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);

        .glow-effect {
          position: absolute;
          width: 250px;
          height: 250px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          filter: blur(60px);
          animation: glow-pulse 3s ease-in-out infinite;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background: radial-gradient(circle,
                  rgba(mixins.theme-color($theme, accent-teal), 0.4) 0%,
                  rgba(mixins.theme-color($theme, accent-lime), 0.2) 50%,
                  transparent 70%);
            }
          }
        }

        .logo-3d {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          z-index: 10;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background: mixins.theme-color($theme, secondary-bg);
              box-shadow:
                0 20px 40px rgba(mixins.theme-color($theme, shadow-color), 0.3),
                inset 0 0 20px rgba(mixins.theme-color($theme, accent-teal), 0.1);
            }
          }
        }

        .pulse-ring {
          position: absolute;
          width: 150px;
          height: 150px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          animation: pulse-expand 3s ease-out infinite;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              border: 2px solid mixins.theme-color($theme, accent-teal);
            }
          }

          &.delay {
            animation-delay: 1.5s;
          }
        }
      }

      // Particles
      .particles {
        position: absolute;
        width: 100%;
        height: 100%;
        overflow: hidden;

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background: mixins.theme-color($theme, accent-lime);
              box-shadow: 0 0 10px rgba(mixins.theme-color($theme, accent-lime), 0.5);
            }
          }

          @for $i from 1 through 20 {
            &.particle-#{$i} {
              left: #{calc(($i - 1) * 5)};
              animation: particle-float #{10 + ($i % 10)}s linear infinite;
              opacity: #{0.5 + ($i % 5) * 0.1};
            }
          }
        }
      }
    }
  }
}
</style>