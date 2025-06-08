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

        <div class="footer-section newsletter">
          <h3>Newsletter</h3>
          <p>Melde dich für unseren Newsletter an und verpasse keine neuen Artikel.</p>
          <div class="newsletter-form">
            <div class="input-with-button">
              <input type="email" placeholder="Deine E-Mail Adresse" />
              <button type="submit" @click="subscribeNewsletter" aria-label="Newsletter anmelden">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
            <p class="newsletter-privacy">Mit der Anmeldung akzeptierst du unsere Datenschutzbestimmungen.</p>
          </div>
        </div>

        <div class="footer-section about">
          <h3>Über uns</h3>
          <p>Eine Plattform für Eltern, die ihre Kinder besser verstehen und begleiten möchten, in guten wie in
            schwierigen Zeiten.</p>
          <div class="social-icons">
            <a href="https://www.instagram.com" target="_blank" class="social-icon" title="Instagram">
              <!-- Heroicon: camera -->
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="20" height="20">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div class="footer-divider"></div>

      <div class="footer-bottom">
        <p class="copyright">© {{ currentYear }} Leant To Grow. Alle Rechte vorbehalten.</p>
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

    // Newsletter-Anmeldung
    const subscribeNewsletter = () => {
      // Hier könntest du später eine Funktion implementieren, um die Newsletter-Anmeldung zu verarbeiten
      alert('Die Newsletter-Anmeldung ist aktuell nur ein Platzhalter.');
    };

    return {
      currentYear,
      scrollToSection,
      subscribeNewsletter,
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
    margin-bottom: 3rem;

    .logo-text {
      font-size: 1.8rem;
      font-weight: 800;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: linear-gradient(90deg,
              mixins.theme-color($theme, accent-green) 0%,
              mixins.theme-color($theme, accent-teal) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      }
    }

    .logo-decoration {
      width: 60px;
      height: 3px;
      margin: 0.8rem auto 0;
      border-radius: 3px;

      @each $theme in ('light', 'dark') {
        transition: all 0.4s ease;

        .theme-#{$theme} & {
          background: linear-gradient(90deg,
              mixins.theme-color($theme, accent-green) 0%,
              mixins.theme-color($theme, accent-teal) 100%);
        }
      }
    }
  }

  .footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 3rem;
    margin-bottom: 4rem;

    .footer-section {
      h3 {
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 1.5rem;
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
              width: 30px;
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

      p {
        font-size: 1rem;
        line-height: 1.6;
        margin-bottom: 1.5rem;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
            transition: all 0.4s ease;
          }
        }
      }

      &.about {
        .social-icons {
          display: flex;
          gap: 1rem;

          .social-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 12px;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            transform-style: preserve-3d;
            transform: translateZ(0);

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background-color: rgba(mixins.theme-color($theme, accent-teal), 0.1);
                color: mixins.theme-color($theme, accent-teal);
                transition: all 0.4s ease;
                box-shadow: 0 2px 8px rgba(mixins.theme-color($theme, accent-teal), 0.15);

                &:hover {
                  transform: translateY(-8px) translateZ(20px) scale(1.1);
                  background-color: mixins.theme-color($theme, accent-teal);
                  color: white;
                  box-shadow: 
                    0 15px 35px rgba(mixins.theme-color($theme, accent-teal), 0.4),
                    0 5px 15px rgba(0, 0, 0, 0.08);
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

      &.links {
        ul {
          list-style: none;
          padding: 0;
          margin: 0;

          li {
            margin-bottom: 0.8rem;

            a {
              text-decoration: none;
              position: relative;
              display: inline-flex;
              align-items: center;
              transition: all 0.2s ease;

              &::before {
                content: '';
                width: 0;
                height: 1px;
                position: absolute;
                bottom: -2px;
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
                    transform: translateX(5px);

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

      &.newsletter {
        .newsletter-form {
          .input-with-button {
            position: relative;
            display: flex;
            margin-bottom: 1rem;

            input {
              flex: 1;
              padding: 0.9rem 1.2rem;
              padding-right: 3.5rem;
              font-size: 0.95rem;
              border-radius: 50px;
              border: none;

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background: rgba(mixins.theme-color($theme, card-bg), 0.5);
                  color: mixins.theme-color($theme, text-primary);
                  border: 1px solid rgba(mixins.theme-color($theme, border-light), 0.5);
                  transition: all 0.4s ease;

                  &:focus {
                    outline: none;
                    border-color: mixins.theme-color($theme, accent-teal);
                    box-shadow: 0 0 0 3px rgba(mixins.theme-color($theme, accent-teal), 0.1);
                  }

                  &::placeholder {
                    color: mixins.theme-color($theme, text-tertiary);
                  }
                }
              }
            }

            button {
              position: absolute;
              right: 4px;
              top: 4px;
              bottom: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 40px;
              height: calc(100% - 8px);
              border: none;
              border-radius: 50%;
              cursor: pointer;
              transition: all 0.3s ease;
              transition: all 0.4s ease;

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  transition: all 0.4s ease;
                  background: linear-gradient(90deg,
                      mixins.theme-color($theme, accent-teal) 0%,
                      mixins.theme-color($theme, accent-green) 100%);
                  color: white;

                  &:hover {
                    transform: scale(1.05);
                    box-shadow: 0 3px 10px rgba(mixins.theme-color($theme, accent-teal), 0.3);
                  }
                }
              }
            }
          }

          .newsletter-privacy {
            font-size: 0.8rem;
            margin-bottom: 0;

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
  }

  .footer-divider {
    height: 1px;
    margin-bottom: 2rem;
    opacity: 0.2;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background: mixins.theme-color($theme, border-medium);
        transition: all 0.4s ease;
      }
    }
  }

  .footer-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 0;
    flex-wrap: wrap;
    gap: 1rem;
    transition: all 0.4s ease;

    @media (max-width: 768px) {
      flex-direction: column;
      text-align: center;
    }

    .copyright {
      font-size: 0.9rem;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-tertiary);
          transition: all 0.4s ease;
        }
      }
    }

    .legal-links {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      a {
        font-size: 0.9rem;
        text-decoration: none;
        transition: color 0.2s ease;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-tertiary);
            transition: all 0.4s ease;

            &:hover {
              color: mixins.theme-color($theme, accent-teal);
            }
          }
        }
      }

      .separator {
        font-size: 0.9rem;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-tertiary);
            opacity: 0.5;
            transition: all 0.4s ease;
          }
        }
      }
    }
  }
}
</style>