<!-- src/pages/PrivacyPolicyPage.vue -->
<template>
  <div class="legal-page privacy-page">
    <div class="container">
      <div class="page-header">
        <h1>Datenschutzerklärung</h1>
        <div class="last-updated">Zuletzt aktualisiert: 10. Mai 2025</div>
      </div>

      <div class="content-wrapper">
        <!-- Seitennavigation -->
        <aside class="sidebar">
          <div class="sidebar-sticky">
            <h2>Inhalt</h2>
            <nav class="toc">
              <ul>
                <li v-for="(section, index) in sections" :key="index">
                  <a :href="`#section-${index}`" @click.prevent="scrollToSection(`section-${index}`)">
                    {{ section.title }}
                  </a>
                </li>
              </ul>
            </nav>

            <div class="sidebar-actions">
              <button @click="printPage" class="action-button"><span class="icon">🖨️</span> Drucken</button>
              <button @click="downloadPdf" class="action-button"><span class="icon">📥</span> Als PDF</button>
            </div>
          </div>
        </aside>

        <!-- Hauptinhalt -->
        <main class="main-content">
          <div v-for="(section, index) in sections" :key="index" :id="`section-${index}`" class="content-section">
            <h2>{{ section.title }}</h2>
            <div v-html="section.content"></div>
          </div>

          <div class="content-footer">
            <p>Bei Fragen zu unserer Datenschutzerklärung stehen wir Ihnen gerne zur Verfügung.</p>
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
  name: "PrivacyPolicyPage",
  data() {
    return {
      sections: [
        {
          title: "Übersicht",
          content: `
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.</p>
            <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          `,
        },
        {
          title: "Datenerhebung und -verwendung",
          content: `
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.</p>
            <h3>Welche Daten wir sammeln</h3>
            <ul>
              <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit</li>
              <li>Nullam auctor, nisl eget ultricies tincidunt</li>
              <li>Nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl</li>
              <li>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua</li>
            </ul>
            <h3>Wie wir Ihre Daten verwenden</h3>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          `,
        },
        {
          title: "Cookies und Tracking",
          content: `
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.</p>
            <h3>Cookie-Kategorien</h3>
            <div class="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Kategorie</th>
                    <th>Zweck</th>
                    <th>Speicherdauer</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Notwendig</td>
                    <td>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</td>
                    <td>Sitzung</td>
                  </tr>
                  <tr>
                    <td>Funktional</td>
                    <td>Nullam auctor, nisl eget ultricies tincidunt.</td>
                    <td>30 Tage</td>
                  </tr>
                  <tr>
                    <td>Analytisch</td>
                    <td>Sed do eiusmod tempor incididunt ut labore.</td>
                    <td>90 Tage</td>
                  </tr>
                  <tr>
                    <td>Marketing</td>
                    <td>Ut enim ad minim veniam, quis nostrud exercitation.</td>
                    <td>180 Tage</td>
                  </tr>
                </tbody>
              </table>
            </div>
          `,
        },
        {
          title: "Ihre Rechte",
          content: `
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.</p>
            <div class="info-box">
              <h4>Als Betroffener haben Sie folgende Rechte:</h4>
              <ul>
                <li><strong>Auskunftsrecht:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                <li><strong>Recht auf Berichtigung:</strong> Nullam auctor, nisl eget ultricies tincidunt.</li>
                <li><strong>Recht auf Löschung:</strong> Nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.</li>
                <li><strong>Recht auf Einschränkung:</strong> Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</li>
                <li><strong>Widerspruchsrecht:</strong> Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</li>
                <li><strong>Recht auf Datenübertragbarkeit:</strong> Duis aute irure dolor in reprehenderit in voluptate velit.</li>
              </ul>
            </div>
          `,
        },
        {
          title: "Datensicherheit",
          content: `
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.</p>
            <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          `,
        },
        {
          title: "Änderungen dieser Datenschutzerklärung",
          content: `
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.</p>
            <div class="version-history">
              <h3>Versionshistorie</h3>
              <ul>
                <li><strong>10. Mai 2025:</strong> Aktuelle Version</li>
                <li><strong>15. Januar 2025:</strong> Anpassung an neue gesetzliche Anforderungen</li>
                <li><strong>5. Oktober 2024:</strong> Erstveröffentlichung</li>
              </ul>
            </div>
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
              font-size: map.get(map.get(vars.$fonts, sizes), medium);
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

    .content-section {
      margin-bottom: map.get(vars.$spacing, xxl);

      h2 {
        font-size: 1.8rem;
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        margin-bottom: map.get(vars.$spacing, l);
        padding-bottom: map.get(vars.$spacing, s);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
            border-bottom: 2px solid mixins.theme-color($theme, accent-green);
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
      }

      ul,
      ol {
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

      .info-box {
        margin: map.get(vars.$spacing, l) 0;
        padding: map.get(vars.$spacing, l);
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            border-left: 4px solid mixins.theme-color($theme, accent-green);
          }
        }
      }

      .version-history {
        margin-top: map.get(vars.$spacing, l);

        ul {
          list-style: none;
          padding-left: 0;

          li {
            padding: map.get(vars.$spacing, s) 0;

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                border-bottom: 1px solid mixins.theme-color($theme, border-light);
              }
            }
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

// Styles für Tabellen
::v-deep(.table-responsive) {
  overflow-x: auto;
  margin: map.get(vars.$spacing, l) 0;

  table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);
      text-align: left;
    }

    th {
      font-weight: map.get(map.get(vars.$fonts, weights), semibold);
    }

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        th {
          background-color: mixins.theme-color($theme, secondary-bg);
          color: mixins.theme-color($theme, text-primary);
          border-bottom: 2px solid mixins.theme-color($theme, border-medium);
        }

        td {
          border-bottom: 1px solid mixins.theme-color($theme, border-light);
          color: mixins.theme-color($theme, text-secondary);
        }

        tr:last-child td {
          border-bottom: none;
        }

        tr:hover td {
          background-color: mixins.theme-color($theme, hover-color);
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
  .sidebar-actions {
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
    -webkit-text-fill-color: initial !important;
  }

  p,
  li {
    color: #333 !important;
  }
}
</style>
