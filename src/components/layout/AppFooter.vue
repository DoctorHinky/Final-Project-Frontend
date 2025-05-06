<!-- src/components/layout/AppFooter.vue -->
<template>
  <footer class="app-footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section about">
          <h3>Eltern & Kind</h3>
          <p>Eine Plattform für Eltern, die ihre Kinder besser verstehen und begleiten möchten, in guten wie in
            schwierigen Zeiten.</p>
          <div class="social-icons">
            <a href="https://www.instagram.com" target="_blank" class="social-icon" title="Instagram">
              <!-- Direktes SVG Instagram-Icon -->
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="instagram-icon">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
          </div>
        </div>

        <div class="footer-section links">
          <h3>Schnellzugriff</h3>
          <ul>
            <li><router-link to="/">Startseite</router-link></li>
            <li><a href="#" @click.prevent="scrollToSection('content')">Über uns</a></li>
            <li><router-link to="/articles">Artikel</router-link></li>
            <li><a href="#" @click.prevent="scrollToSection('community')">Community</a></li>
            <li><router-link to="/contact">Kontakt</router-link></li>
          </ul>
        </div>

        <div class="footer-section newsletter">
          <h3>Newsletter</h3>
          <p>Melde dich für unseren Newsletter an und verpasse keine neuen Artikel.</p>
          <div class="newsletter-form">
            <input type="email" placeholder="Deine E-Mail Adresse" />
            <button type="submit" @click="subscribeNewsletter">Anmelden</button>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="copyright">© {{ currentYear }} Eltern & Kind. Alle Rechte vorbehalten.</p>
        <div class="legal-links">
          <router-link to="/datenschutz">Datenschutz</router-link>
          <router-link to="/impressum">Impressum</router-link>
          <router-link to="/agb">AGB</router-link>
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

    // Newsletter-Anmeldung
    const subscribeNewsletter = () => {
      // Hier könntest du später eine Funktion implementieren, um die Newsletter-Anmeldung zu verarbeiten
      alert('Die Newsletter-Anmeldung ist aktuell nur ein Platzhalter.');
    };

    return {
      currentYear,
      scrollToSection,
      subscribeNewsletter
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
  padding-top: map.get(vars.$spacing, xxl);

  @each $theme in ('light', 'dark') {
    .theme-#{$theme} & {
      background-color: mixins.theme-color($theme, secondary-bg);
      border-top: 1px solid mixins.theme-color($theme, border-light);
    }
  }

  .container {
    max-width: map.get(vars.$layout, max-width);
    margin: 0 auto;
    padding: 0 map.get(vars.$spacing, xl);
  }

  .footer-content {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: map.get(vars.$spacing, xl);
    margin-bottom: map.get(vars.$spacing, xxl);

    @media (max-width: map.get(map.get(vars.$layout, breakpoints), tablet)) {
      grid-template-columns: 1fr;
    }

    .footer-section {
      h3 {
        font-size: map.get(map.get(vars.$fonts, sizes), large);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        margin-bottom: map.get(vars.$spacing, m);
        position: relative;
        display: inline-block;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);

            &::after {
              content: '';
              position: absolute;
              width: 50%;
              height: 2px;
              bottom: -5px;
              left: 0;
              background: mixins.theme-gradient($theme, primary);
              border-radius: 2px;
            }
          }
        }
      }

      p {
        font-size: map.get(map.get(vars.$fonts, sizes), medium);
        line-height: 1.6;
        margin-bottom: map.get(vars.$spacing, m);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }

      &.about {
        .social-icons {
          @include mixins.flex(row, flex-start, center);
          gap: map.get(vars.$spacing, s);

          .social-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            transition: all map.get(vars.$transitions, quick);

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background-color: mixins.theme-color($theme, card-bg);
                border: 1px solid mixins.theme-color($theme, border-medium);

                &:hover {
                  transform: scale(1.1);
                  @include mixins.glow('green', 'small', $theme);
                  border-color: mixins.theme-color($theme, accent-green);
                  
                  .instagram-icon {
                    color: mixins.theme-color($theme, accent-green);
                  }
                }
                
                .instagram-icon {
                  color: mixins.theme-color($theme, text-secondary);
                  transition: color map.get(vars.$transitions, quick);
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
            margin-bottom: map.get(vars.$spacing, s);

            a {
              text-decoration: none;
              position: relative;
              transition: all map.get(vars.$transitions, quick);
              padding-left: map.get(vars.$spacing, s);

              &::before {
                content: '»';
                position: absolute;
                left: 0;
                opacity: 0;
                transition: opacity map.get(vars.$transitions, quick),
                  transform map.get(vars.$transitions, quick);
                transform: translateX(-5px);
              }

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, text-secondary);

                  &:hover {
                    color: mixins.theme-color($theme, accent-green);

                    &::before {
                      opacity: 1;
                      transform: translateX(0);
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
          @include mixins.flex(column, flex-start, stretch);
          gap: map.get(vars.$spacing, s);

          input {
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                @include mixins.form-element($theme);
              }
            }
          }

          button {
            align-self: flex-start;
            @include animations.shine-effect;
            transform: none !important;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                @include mixins.button-style($theme, 'small', true);
              }
            }
          }
        }
      }
    }
  }

  .footer-bottom {
    padding: map.get(vars.$spacing, l) 0;
    @include mixins.flex(row, space-between, center, wrap);

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        border-top: 1px solid mixins.theme-color($theme, border-light);
      }
    }

    @media (max-width: map.get(map.get(vars.$layout, breakpoints), mobile)) {
      flex-direction: column;
      gap: map.get(vars.$spacing, m);
      text-align: center;
    }

    .copyright {
      font-size: map.get(map.get(vars.$fonts, sizes), small);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-tertiary);
        }
      }
    }

    .legal-links {
      @include mixins.flex(row, flex-end, center);
      gap: map.get(vars.$spacing, m);

      a {
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        text-decoration: none;
        position: relative;

        &::after {
          content: '';
          position: absolute;
          width: 0;
          height: 1px;
          bottom: -2px;
          left: 0;
          transition: width map.get(vars.$transitions, quick);
        }

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-tertiary);

            &:hover {
              color: mixins.theme-color($theme, accent-teal);

              &::after {
                width: 100%;
                background-color: mixins.theme-color($theme, accent-teal);
              }
            }
          }
        }
      }
    }
  }
}
</style>