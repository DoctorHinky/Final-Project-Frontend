<!-- src/pages/TermsOfService.vue -->
<template>
  <div class="legal-page terms-page">
    <div class="container">
      <div class="page-header">
        <h1>Allgemeine Geschäftsbedingungen</h1>
        <div class="last-updated">Zuletzt aktualisiert: 10. Mai 2025</div>
      </div>

      <div class="content-wrapper">
        <!-- Seitennavigation -->
        <aside class="sidebar">
          <div class="sidebar-sticky">
            <h2>Inhaltsverzeichnis</h2>
            <nav class="toc">
              <ul>
                <li v-for="(section, index) in sections" :key="index">
                  <a :href="`#section-${index}`" @click.prevent="scrollToSection(`section-${index}`)">
                    § {{ index + 1 }} - {{ section.title }}
                  </a>
                </li>
              </ul>
            </nav>

            <div class="version-info">
              <div class="version-label">Version:</div>
              <div class="version-number">2.1</div>
              <div class="version-date">Gültig ab: 01.06.2025</div>
            </div>

            <div class="sidebar-actions">
              <button @click="printPage" class="action-button"><span class="icon">🖨️</span> Drucken</button>
              <button @click="downloadPdf" class="action-button"><span class="icon">📥</span> Als PDF</button>
            </div>
          </div>
        </aside>

        <!-- Hauptinhalt -->
        <main class="main-content">
          <div class="terms-preamble">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt,
              nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt,
              nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.
            </p>
          </div>

          <div class="term-progress-indicator">
            <div class="progress-line"></div>
          </div>

          <div
            v-for="(section, index) in sections"
            :key="index"
            :id="`section-${index}`"
            class="content-section term-section"
          >
            <h2>§ {{ index + 1 }} - {{ section.title }}</h2>
            <div v-html="section.content"></div>
          </div>

          <div class="terms-signature">
            <p>
              Muster GmbH<br />
              Musterstraße 123<br />
              12345 Musterstadt
            </p>

            <p>
              Geschäftsführer: Max Mustermann<br />
              Handelsregister: Amtsgericht Musterstadt, HRB 12345
            </p>
          </div>

          <div class="content-footer">
            <p>Bei Fragen zu unseren AGB stehen wir Ihnen gerne zur Verfügung.</p>
            <router-link to="/contact" class="contact-link">Kontakt aufnehmen</router-link>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "TermsOfServicePage",
  data() {
    return {
      sections: [
        {
          title: "Geltungsbereich",
          content: `
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.</p>
            <ol>
              <li>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</li>
              <li>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</li>
              <li>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</li>
            </ol>
          `,
        },
        {
          title: "Vertragsschluss",
          content: `
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.</p>
            <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <div class="term-example">
              <h4>Beispiel:</h4>
              <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            </div>
          `,
        },
        {
          title: "Lieferung und Versand",
          content: `
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.</p>
            <div class="term-highlight">
              <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            </div>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          `,
        },
        {
          title: "Preise und Zahlungsbedingungen",
          content: `
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.</p>
            <ol>
              <li>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</li>
              <li>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</li>
              <li>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</li>
            </ol>
            <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          `,
        },
        {
          title: "Widerrufsrecht",
          content: `
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.</p>
            <div class="term-important">
              <h4>Wichtiger Hinweis:</h4>
              <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            </div>
            <h3>Widerrufsbelehrung</h3>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <h4>Widerrufsformular</h4>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.</p>
          `,
        },
        {
          title: "Gewährleistung",
          content: `
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.</p>
            <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          `,
        },
        {
          title: "Haftungsbeschränkung",
          content: `
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.</p>
            <ol>
              <li>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</li>
              <li>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</li>
              <li>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</li>
              <li>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</li>
            </ol>
          `,
        },
        {
          title: "Datenschutz",
          content: `
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.</p>
            <p>Weitere Informationen finden Sie in unserer <router-link to="/privacy-policy">Datenschutzerklärung</router-link>.</p>
          `,
        },
        {
          title: "Schlussbestimmungen",
          content: `
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.</p>
            <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          `,
        },
      ],
    };
  },
  methods: {
    scrollToSection(sectionId: string) {
      const element = document.getElementById(sectionId);
      if (element) {
        const headerOffset = 100; // Anpassung für den festen Header
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    },
    printPage() {
      window.print();
    },
    downloadPdf() {
      // In einer echten Implementierung würde hier PDF-Generierung stattfinden
      alert("PDF-Download-Funktion wird implementiert.");
    },
    updateProgressIndicator() {
      const progressLine = document.querySelector(".progress-line") as HTMLElement;
      if (!progressLine) return;

      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;

      progressLine.style.width = scrolled + "%";
    },
  },
  mounted() {
    window.addEventListener("scroll", this.updateProgressIndicator);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.updateProgressIndicator);
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;

.legal-page {
  padding: 120px 0 60px;

  .page-header {
    text-align: center;
    margin-bottom: map.get(vars.$spacing, xxl);

    h1 {
      font-size: 2.5rem;
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      margin-bottom: map.get(vars.$spacing, s);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, header);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
        }
      }
    }

    .last-updated {
      font-size: map.get(map.get(vars.$fonts, sizes), small);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  .content-wrapper {
    display: flex;
    gap: map.get(vars.$spacing, xxl);

    @include mixins.responsive("tablet") {
      flex-direction: column;
    }
  }

  .sidebar {
    width: 280px;
    flex-shrink: 0;

    @include mixins.responsive("tablet") {
      width: 100%;
      margin-bottom: map.get(vars.$spacing, l);
    }

    .sidebar-sticky {
      position: sticky;
      top: 100px;

      @include mixins.responsive("tablet") {
        position: static;
      }

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, card-bg);
          border-radius: map.get(map.get(vars.$layout, border-radius), medium);
          border: 1px solid mixins.theme-color($theme, border-light);
          padding: map.get(vars.$spacing, l);
        }
      }

      h2 {
        font-size: map.get(map.get(vars.$fonts, sizes), large);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        margin-bottom: map.get(vars.$spacing, m);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }

      .toc {
        margin-bottom: map.get(vars.$spacing, xl);

        ul {
          list-style: none;
          padding: 0;
          margin: 0;

          li {
            margin-bottom: map.get(vars.$spacing, s);

            a {
              display: block;
              text-decoration: none;
              padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, s);
              border-radius: map.get(map.get(vars.$layout, border-radius), small);
              font-size: map.get(map.get(vars.$fonts, sizes), small);
              transition: all map.get(vars.$transitions, default);

              @each $theme in ("light", "dark") {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, text-primary);

                  &:hover {
                    background-color: mixins.theme-color($theme, hover-color);
                    color: mixins.theme-color($theme, accent-green);
                  }
                }
              }
            }
          }
        }
      }

      .version-info {
        margin-bottom: map.get(vars.$spacing, xl);
        padding: map.get(vars.$spacing, m);
        border-radius: map.get(map.get(vars.$layout, border-radius), small);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
          }
        }

        .version-label {
          font-size: map.get(map.get(vars.$fonts, sizes), small);

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }

        .version-number {
          font-size: 1.5rem;
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
          margin: map.get(vars.$spacing, xs) 0;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, accent-green);
            }
          }
        }

        .version-date {
          font-size: map.get(map.get(vars.$fonts, sizes), small);

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }
      }

      .sidebar-actions {
        display: flex;
        flex-direction: column;
        gap: map.get(vars.$spacing, s);

        .action-button {
          display: flex;
          align-items: center;
          gap: map.get(vars.$spacing, s);
          padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);
          border-radius: map.get(map.get(vars.$layout, border-radius), small);
          cursor: pointer;
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          transition: all map.get(vars.$transitions, default);

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
              color: mixins.theme-color($theme, text-primary);
              border: 1px solid mixins.theme-color($theme, border-light);

              &:hover {
                background-color: mixins.theme-color($theme, hover-color);
                border-color: mixins.theme-color($theme, accent-teal);
              }
            }
          }

          .icon {
            font-size: 1.2em;
          }
        }
      }
    }
  }

  .main-content {
    flex: 1;

    .terms-preamble {
      margin-bottom: map.get(vars.$spacing, xxl);

      p {
        font-size: map.get(map.get(vars.$fonts, sizes), large);
        line-height: 1.8;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }
    }

    .term-progress-indicator {
      position: sticky;
      top: 80px;
      z-index: 10;
      width: 100%;
      height: 4px;
      margin-bottom: map.get(vars.$spacing, xxl);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, border-light);
        }
      }

      .progress-line {
        height: 100%;
        width: 0%;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: mixins.theme-gradient($theme, header);
          }
        }
      }
    }

    .content-section {
      margin-bottom: map.get(vars.$spacing, xxl);

      h2 {
        font-size: 1.8rem;
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        margin-bottom: map.get(vars.$spacing, l);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
            background-color: mixins.theme-color($theme, secondary-bg);
            padding: map.get(vars.$spacing, m);
            border-radius: map.get(map.get(vars.$layout, border-radius), medium);
            border-left: 4px solid mixins.theme-color($theme, accent-green);
          }
        }
      }

      h3 {
        font-size: 1.3rem;
        font-weight: map.get(map.get(vars.$fonts, weights), semibold);
        margin: map.get(vars.$spacing, l) 0 map.get(vars.$spacing, m);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }

      h4 {
        font-size: 1.1rem;
        font-weight: map.get(map.get(vars.$fonts, weights), semibold);
        margin: map.get(vars.$spacing, m) 0;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }

      p {
        margin-bottom: map.get(vars.$spacing, m);
        line-height: 1.7;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }

        a {
          text-decoration: none;
          font-weight: map.get(map.get(vars.$fonts, weights), medium);
          transition: color map.get(vars.$transitions, default);

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, accent-green);

              &:hover {
                color: mixins.theme-color($theme, accent-teal);
                text-decoration: underline;
              }
            }
          }
        }
      }

      ol,
      ul {
        margin-bottom: map.get(vars.$spacing, l);
        padding-left: map.get(vars.$spacing, xl);

        li {
          margin-bottom: map.get(vars.$spacing, s);
          line-height: 1.6;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }
      }

      .term-example {
        margin: map.get(vars.$spacing, l) 0;
        padding: map.get(vars.$spacing, l);
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            border-left: 4px solid mixins.theme-color($theme, accent-green);
          }
        }

        h4 {
          margin-top: 0;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, accent-green);
            }
          }
        }

        p:last-child {
          margin-bottom: 0;
        }
      }

      .term-highlight {
        margin: map.get(vars.$spacing, l) 0;
        padding: map.get(vars.$spacing, l);
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            border: 1px solid mixins.theme-color($theme, border-medium);
          }
        }

        p:last-child {
          margin-bottom: 0;
        }
      }

      .term-important {
        margin: map.get(vars.$spacing, l) 0;
        padding: map.get(vars.$spacing, l);
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            border-left: 4px solid mixins.theme-color($theme, error);
          }
        }

        h4 {
          margin-top: 0;

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, error);
            }
          }
        }

        p:last-child {
          margin-bottom: 0;
        }
      }
    }

    .terms-signature {
      margin: map.get(vars.$spacing, xxl) 0;
      padding: map.get(vars.$spacing, xl);
      text-align: center;
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          border: 1px dashed mixins.theme-color($theme, border-medium);
        }
      }

      p {
        margin-bottom: map.get(vars.$spacing, m);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }
    }

    .content-footer {
      margin-top: map.get(vars.$spacing, xxl);
      padding-top: map.get(vars.$spacing, l);
      text-align: center;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          border-top: 1px solid mixins.theme-color($theme, border-light);
        }
      }

      p {
        margin-bottom: map.get(vars.$spacing, m);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }

      .contact-link {
        display: inline-block;
        padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        text-decoration: none;
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        transition: all map.get(vars.$transitions, default);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            color: mixins.theme-color($theme, accent-green);

            &:hover {
              background-color: mixins.theme-color($theme, accent-green);
              color: #ffffff;
              transform: translateY(-3px);
              @include mixins.shadow("small", $theme);
            }
          }
        }
      }
    }
  }
}

// Druckstil
@media print {
  .sidebar,
  .navigation,
  .header,
  .footer,
  .sidebar-actions,
  .term-progress-indicator {
    display: none !important;
  }

  .legal-page {
    padding: 0;
  }

  .content-wrapper {
    display: block;
  }

  .main-content {
    width: 100% !important;
  }

  .page-header {
    text-align: left;
    border-bottom: 1px solid #000;
    padding-bottom: 1rem;
    margin-bottom: 2rem;
  }

  h1,
  h2,
  h3,
  h4 {
    color: #000 !important;
    background: none !important;
    -webkit-text-fill-color: initial !important;
    border: none !important;
    padding: 0 !important;
  }

  p,
  li {
    color: #333 !important;
  }

  .term-example,
  .term-highlight,
  .term-important {
    border: 1px solid #ccc !important;
    background-color: #f9f9f9 !important;
  }

  .terms-signature {
    border: 1px dashed #ccc !important;
    background-color: #f9f9f9 !important;
  }
}
</style>
