<!-- src/components/layout/AppFooter.vue -->
<template>
  <footer class="app-footer">
    <div class="footer-wave">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" preserveAspectRatio="none">
        <path d="M0,50 C240,110 480,0 720,50 C960,110 1200,0 1440,50 L1440,100 L0,100 Z"></path>
      </svg>
    </div>

    <div class="container">
      <div class="footer-logo">
        <span class="logo-text">Learn to Grow</span>
        <div class="logo-decoration"></div>
        <p class="logo-subtitle">Gemeinsam wachsen, gemeinsam stark werden</p>
      </div>

      <div class="footer-content">
        <div class="footer-section links">
          <h3>Schnellzugriff</h3>
          <ul>
            <li><a href="/" @click.prevent="scrollToTop">Startseite</a></li>
            <li><a href="#" @click.prevent="scrollToSection('content')">Über uns</a></li>
            <li><a href="#" @click.prevent="scrollToSection('community')">Community</a></li>
            <li><router-link to="/contact">Kontakt</router-link></li>
          </ul>
        </div>

        <div class="footer-section team">
          <h3>Unser Team</h3>
          <div class="team-members">
            <div class="team-member">
              <div class="member-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="m22 21-3-3m0 0a5 5 0 1 0-7-7 5 5 0 0 0 7 7z"/>
                </svg>
              </div>
              <div class="member-info">
                <span class="name">Normand Tetzlaff</span>
                <span class="role">Projektmanager & Backend</span>
              </div>
            </div>
            <div class="team-member">
              <div class="member-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                  <rect width="18" height="18" x="3" y="3" rx="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
              </div>
              <div class="member-info">
                <span class="name">Chris Schubert</span>
                <span class="role">Frontend & Design</span>
              </div>
            </div>
            <div class="team-member">
              <div class="member-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                  <polyline points="16 18 22 12 16 6"/>
                  <polyline points="8 6 2 12 8 18"/>
                </svg>
              </div>
              <div class="member-info">
                <span class="name">Mark Döring</span>
                <span class="role">Frontend & Backend</span>
              </div>
            </div>
          </div>
        </div>

        <div class="footer-section about">
          <h3>Über Learn to Grow</h3>
          <p>Eine liebevoll gestaltete Plattform für Eltern, die ihre Kinder besser verstehen und begleiten möchten. Wir unterstützen euch in guten wie in schwierigen Zeiten auf eurem gemeinsamen Weg.</p>
          <div class="contact-info">

            <div class="social-icons">
              <a href="https://www.instagram.com" target="_blank" class="social-icon" title="Instagram">
                <!-- Echtes Instagram Logo -->
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="m16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-divider"></div>

      <div class="footer-bottom">
        <div class="footer-bottom-left">
          <p class="copyright">© {{ currentYear }} Learn to Grow. Mit ❤️ entwickelt für Familien.</p>
          <p class="made-with">Gebaut mit Vue.js & TypeScript</p>
        </div>
        <div class="legal-links">
          <router-link to="/privacy-policy">Datenschutz</router-link>
          <span class="separator">•</span>
          <router-link to="/imprint">Impressum</router-link>
          <span class="separator">•</span>
          <router-link to="/terms-of-service">AGB</router-link>
        </div>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'AppFooter',
  setup() {
    const router = useRouter();

    // Aktuelles Jahr für das Copyright
    const currentYear = computed(() => new Date().getFullYear());

    // Funktion zum Scrollen zu einem bestimmten Abschnitt
    const scrollToSection = (sectionId: string) => {
      // Überprüfen, ob wir uns auf der Homepage befinden
      if (router.currentRoute.value.path !== '/') {
        // Wenn nicht, zuerst zur Homepage navigieren und dann zum Abschnitt scrollen
        router.push('/').then(() => {
          // Kleine Verzögerung, um sicherzustellen, dass die Komponente gemountet ist
          setTimeout(() => {
            scrollToElement(sectionId);
          }, 100);
        });
      } else {
        // Direkt zum Element scrollen, wenn wir bereits auf der Homepage sind
        scrollToElement(sectionId);
      }
    };

    const scrollToElement = (sectionId: string) => {
      const element = document.getElementById(sectionId);
      if (element) {
        // Den Header-Offset beim Scrollen berücksichtigen
        const headerOffset = 130; // Muss konsistent mit dem Layout-Padding-Top sein
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    };

    const scrollToTop = () => {
      if (window.scrollY > 0) {
        const start = window.scrollY;
        const duration = 1600; // 1 Sekunde für langsameres Scrollen
        const startTime = performance.now();

        function animateScroll(currentTime: number) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic

          window.scrollTo(0, start * (1 - ease));

          if (progress < 1) {
            requestAnimationFrame(animateScroll);
          }
        }

        requestAnimationFrame(animateScroll);
      }
    };

    return {
      currentYear,
      scrollToSection,
      scrollToTop
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

.app-footer {
  position: relative;
  padding-top: 6rem;
  margin-top: 3rem;
  overflow: hidden;
  z-index: 100 !important;

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, secondary-bg);
      transition: all 0.4s ease;
    }
  }

  .footer-wave {
    position: absolute;
    top: -2px;
    left: 0;
    width: 100%;
    height: 100px;
    overflow: hidden;
    line-height: 0;
    transform: rotate(180deg);
    
    svg {
      position: relative;
      display: block;
      width: 100%;
      height: 100px;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          fill: mixins.theme-color($theme, primary-bg);
          transition: all 0.4s ease;
        }
      }
    }
  }

  .container {
    max-width: map.get(vars.$layout, max-width);
    margin: 0 auto;
    padding: 0 2rem;
  }

  .footer-logo {
    text-align: center;
    margin-bottom: 4rem;

    .logo-text {
      font-size: 2.2rem;
      font-weight: 800;
      display: block;
      margin-bottom: 0.8rem;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: linear-gradient(135deg,
              mixins.theme-color($theme, accent-green) 0%,
              mixins.theme-color($theme, accent-teal) 50%,
              mixins.theme-color($theme, accent-green) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200% 200%;
          animation: gradientShift 8s ease-in-out infinite;
        }
      }
    }

    .logo-decoration {
      width: 80px;
      height: 4px;
      margin: 0 auto 1rem;
      border-radius: 4px;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: linear-gradient(90deg,
              mixins.theme-color($theme, accent-green) 0%,
              mixins.theme-color($theme, accent-teal) 100%);
          transition: all 0.4s ease;
        }
      }
    }

    .logo-subtitle {
      font-size: 1.1rem;
      font-weight: 500;
      margin: 0;
      font-style: italic;
      opacity: 0.8;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
          transition: all 0.4s ease;
        }
      }
    }
  }

  .footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 4rem;
    margin-bottom: 4rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 3rem;
    }

    .footer-section {
      h3 {
        font-size: 1.4rem;
        font-weight: 700;
        margin-bottom: 2rem;
        position: relative;
        display: inline-block;
        padding-bottom: 0.5rem;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
            transition: all 0.4s ease;

            &::after {
              content: '';
              position: absolute;
              width: 40px;
              height: 3px;
              bottom: 0;
              left: 0;
              border-radius: 3px;
              background: linear-gradient(90deg,
                  mixins.theme-color($theme, accent-green) 0%,
                  mixins.theme-color($theme, accent-teal) 100%);
            }
          }
        }
      }

      &.links {
        ul {
          list-style: none;
          padding: 0;
          margin: 0;

          li {
            margin-bottom: 1rem;

            a {
              text-decoration: none;
              position: relative;
              display: inline-flex;
              align-items: center;
              font-size: 1.05rem;
              font-weight: 500;
              transition: all 0.3s ease;
              padding: 0.5rem 0;

              &::before {
                content: '';
                width: 0;
                height: 2px;
                position: absolute;
                bottom: 0;
                left: 0;
                transition: width 0.3s ease;
              }

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, text-secondary);

                  &::before {
                    background: linear-gradient(90deg,
                        mixins.theme-color($theme, accent-green) 0%,
                        mixins.theme-color($theme, accent-teal) 100%);
                  }

                  &:hover {
                    color: mixins.theme-color($theme, accent-teal);
                    transform: translateX(8px);

                    &::before {
                      width: 100%;
                    }
                  }
                }
              }
            }
          }
        }
      }

      &.team {
        .team-members {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;

          .team-member {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            border-radius: 16px;
            transition: all 0.3s ease;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background: rgba(mixins.theme-color($theme, card-bg), 0.3);
                border: 1px solid rgba(mixins.theme-color($theme, border-light), 0.3);

                &:hover {
                  background: rgba(mixins.theme-color($theme, card-bg), 0.6);
                  transform: translateY(-2px);
                  box-shadow: 0 8px 25px rgba(mixins.theme-color($theme, accent-teal), 0.15);
                }
              }
            }

            .member-icon {
              width: 40px;
              height: 40px;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background: linear-gradient(135deg,
                      mixins.theme-color($theme, accent-green) 0%,
                      mixins.theme-color($theme, accent-teal) 100%);
                  color: white;
                }
              }
            }

            .member-info {
              display: flex;
              flex-direction: column;
              gap: 0.3rem;

              .name {
                font-weight: 600;
                font-size: 1.05rem;

                @each $theme in ('light', 'dark') {
                  .theme-#{$theme} & {
                    color: mixins.theme-color($theme, text-primary);
                  }
                }
              }

              .role {
                font-size: 0.9rem;
                opacity: 0.8;

                @each $theme in ('light', 'dark') {
                  .theme-#{$theme} & {
                    color: mixins.theme-color($theme, text-secondary);
                  }
                }
              }
            }
          }
        }
      }

      &.about {
        p {
          font-size: 1.05rem;
          line-height: 1.7;
          margin-bottom: 2rem;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
              transition: all 0.4s ease;
            }
          }
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;

          .contact-item {
            display: flex;
            align-items: center;
            gap: 0.8rem;
            font-size: 1rem;
            font-weight: 500;
          }

          .social-icons {
            display: flex;
            gap: 1rem;
              transition: all 0.3s ease;

            .social-icon {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 45px;
              height: 45px;
              border-radius: 14px;
              transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
              transform-style: preserve-3d;
              transform: translateZ(0);

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background: linear-gradient(135deg, 
                    rgba(mixins.theme-color($theme, accent-teal), 0.1) 0%,
                    rgba(mixins.theme-color($theme, accent-green), 0.1) 100%);
                  color: mixins.theme-color($theme, accent-teal);
                  border: 1px solid rgba(mixins.theme-color($theme, accent-teal), 0.2);
                  box-shadow: 0 4px 15px rgba(mixins.theme-color($theme, accent-teal), 0.15);

                  &:hover {
                    transform: translateY(-8px) translateZ(20px) scale(1.1) rotateX(5deg);
                    background: linear-gradient(135deg,
                        mixins.theme-color($theme, accent-teal) 0%,
                        mixins.theme-color($theme, accent-green) 100%);
                    color: white;
                    box-shadow: 
                      0 20px 40px rgba(mixins.theme-color($theme, accent-teal), 0.4),
                      0 8px 20px rgba(0, 0, 0, 0.1);
                  }

                  &:active {
                    transform: translateY(-4px) scale(1.05);
                    transition: all 0.1s ease;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  .footer-divider {
    height: 1px;
    margin-bottom: 2rem;
    opacity: 0.3;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background: linear-gradient(90deg,
          transparent 0%,
          mixins.theme-color($theme, border-medium) 50%,
          transparent 100%);
        transition: all 0.4s ease;
      }
    }
  }

  .footer-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2rem 0;
    flex-wrap: wrap;
    gap: 1.5rem;

    @media (max-width: 768px) {
      flex-direction: column;
      text-align: center;
    }

    .footer-bottom-left {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .copyright {
        font-size: 1rem;
        font-weight: 500;
        margin: 0;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
            transition: all 0.4s ease;
          }
        }
      }

      .made-with {
        font-size: 0.85rem;
        margin: 0;
        opacity: 0.7;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
            transition: all 0.4s ease;
          }
        }
      }
    }

    .legal-links {
      display: flex;
      align-items: center;
      gap: 0.8rem;

      a {
        font-size: 0.95rem;
        font-weight: 500;
        text-decoration: none;
        transition: all 0.3s ease;
        padding: 0.3rem 0;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);

            &:hover {
              color: mixins.theme-color($theme, accent-teal);
              transform: translateY(-1px);
            }
          }
        }
      }

      .separator {
        font-size: 0.9rem;
        opacity: 0.5;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-tertiary);
            transition: all 0.4s ease;
          }
        }
      }
    }
  }
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
</style>