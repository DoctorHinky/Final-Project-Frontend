<!-- src/pages/PrivacyPolicyPage.vue -->
<template>
  <div class="legal-page privacy-page">
    <div class="container">
      <div class="page-header">
        <h1>Datenschutzerklärung</h1>
        <div class="last-updated">Zuletzt aktualisiert: 07. Juni 2025</div>
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
          title: "1. Übersicht",
          content: `
            <p>Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen. Diese Datenschutzerklärung informiert Sie umfassend darüber, welche Daten wir erheben, wie wir diese verwenden und welche Rechte Sie in Bezug auf Ihre personenbezogenen Daten haben.</p>
            <p>Wir verarbeiten Ihre Daten im Einklang mit der Datenschutz-Grundverordnung (DSGVO), dem Bundesdatenschutzgesetz (BDSG) sowie allen weiteren relevanten datenschutzrechtlichen Bestimmungen.</p>
            <h3>Verantwortlicher</h3>
            <p>[Ihr Unternehmensname]<br>
            [Straße und Hausnummer]<br>
            [PLZ Ort]<br>
            Deutschland<br>
            E-Mail: datenschutz@[ihre-domain].de<br>
            Telefon: +49 [Ihre Telefonnummer]</p>
            <h3>Datenschutzbeauftragter</h3>
            <p>Unseren Datenschutzbeauftragten erreichen Sie unter:<br>
            E-Mail: dsb@[ihre-domain].de<br>
            oder unserer Postadresse mit dem Zusatz „der Datenschutzbeauftragte"</p>
          `,
        },
        {
          title: "2. Datenerhebung und -verwendung",
          content: `
            <p>Wir erheben und verarbeiten personenbezogene Daten nur, soweit dies für die Bereitstellung unserer Website und Services erforderlich ist. Die Verarbeitung erfolgt ausschließlich auf Grundlage einer gesetzlichen Erlaubnis oder mit Ihrer ausdrücklichen Einwilligung.</p>
            <h3>2.1 Welche Daten wir sammeln</h3>
            <ul>
              <li><strong>Kontaktdaten:</strong> Name, E-Mail-Adresse, Telefonnummer, Anschrift (bei Kontaktaufnahme)</li>
              <li><strong>Nutzungsdaten:</strong> IP-Adresse, Browser-Typ/-Version, Betriebssystem, Referrer-URL, Hostname, Zeitstempel der Anfrage</li>
              <li><strong>Inhaltsdaten:</strong> Texteingaben, Fotografien, Videos (bei Nutzung unserer Services)</li>
              <li><strong>Meta-/Kommunikationsdaten:</strong> Geräte-IDs, IP-Adressen</li>
            </ul>
            <h3>2.2 Wie wir Ihre Daten verwenden</h3>
            <p>Die Verarbeitung Ihrer personenbezogenen Daten erfolgt zu folgenden Zwecken:</p>
            <ul>
              <li>Bereitstellung und Optimierung unserer Website und Services</li>
              <li>Kommunikation mit Ihnen (Beantwortung von Anfragen, Kundenservice)</li>
              <li>Erfüllung vertraglicher Pflichten</li>
              <li>Wahrung unserer berechtigten Interessen (z.B. IT-Sicherheit)</li>
              <li>Einhaltung gesetzlicher Verpflichtungen</li>
            </ul>
            <h3>2.3 Rechtsgrundlagen der Verarbeitung</h3>
            <p>Die Verarbeitung Ihrer Daten erfolgt auf Basis folgender Rechtsgrundlagen:</p>
            <ul>
              <li><strong>Art. 6 Abs. 1 lit. a DSGVO:</strong> Einwilligung</li>
              <li><strong>Art. 6 Abs. 1 lit. b DSGVO:</strong> Vertragserfüllung und vorvertragliche Maßnahmen</li>
              <li><strong>Art. 6 Abs. 1 lit. c DSGVO:</strong> Rechtliche Verpflichtung</li>
              <li><strong>Art. 6 Abs. 1 lit. f DSGVO:</strong> Berechtigte Interessen</li>
            </ul>
          `,
        },
        {
          title: "3. Cookies und Tracking",
          content: `
            <p>Unsere Website verwendet Cookies und ähnliche Tracking-Technologien. Cookies sind kleine Textdateien, die auf Ihrem Endgerät gespeichert werden und die eine Analyse der Benutzung der Website durch Sie ermöglichen.</p>
            <h3>3.1 Cookie-Kategorien</h3>
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
                    <td>Ermöglichen grundlegende Funktionen wie Seitennavigation und Zugriff auf sichere Bereiche. Die Website kann ohne diese Cookies nicht ordnungsgemäß funktionieren.</td>
                    <td>Sitzung</td>
                  </tr>
                  <tr>
                    <td>Funktional</td>
                    <td>Ermöglichen es der Website, bereits getätigte Angaben (wie Benutzername, Sprachauswahl) zu speichern und verbesserte, persönlichere Funktionen anzubieten.</td>
                    <td>30 Tage</td>
                  </tr>
                  <tr>
                    <td>Analytisch</td>
                    <td>Helfen uns zu verstehen, wie Besucher mit der Website interagieren, indem Informationen anonym gesammelt und gemeldet werden.</td>
                    <td>90 Tage</td>
                  </tr>
                  <tr>
                    <td>Marketing</td>
                    <td>Werden verwendet, um Besuchern relevante Werbung und Marketingkampagnen anzubieten und die Wirksamkeit von Werbekampagnen zu messen.</td>
                    <td>180 Tage</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h3>3.2 Cookie-Verwaltung</h3>
            <p>Sie können Ihre Cookie-Einstellungen jederzeit ändern, indem Sie auf den Link "Cookie-Einstellungen" in der Fußzeile unserer Website klicken. Sie können auch die Einstellungen Ihres Browsers anpassen, um Cookies zu blockieren oder zu löschen. Bitte beachten Sie, dass dies die Funktionalität unserer Website beeinträchtigen kann.</p>
            <h3>3.3 Analyse-Tools</h3>
            <p>Wir nutzen folgende Analyse-Tools auf Basis Ihrer Einwilligung:</p>
            <ul>
              <li><strong>Google Analytics:</strong> Zur Analyse des Nutzerverhaltens (Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO)</li>
              <li><strong>Matomo:</strong> Zur datenschutzkonformen Webanalyse (Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO)</li>
            </ul>
          `,
        },
        {
          title: "4. Ihre Rechte",
          content: `
            <p>Als betroffene Person haben Sie umfassende Rechte bezüglich der Verarbeitung Ihrer personenbezogenen Daten. Diese Rechte können Sie jederzeit durch Kontaktaufnahme mit uns geltend machen.</p>
            <div class="info-box">
              <h4>Als Betroffener haben Sie folgende Rechte:</h4>
              <ul>
                <li><strong>Auskunftsrecht (Art. 15 DSGVO):</strong> Sie haben das Recht, eine Bestätigung darüber zu verlangen, ob wir personenbezogene Daten von Ihnen verarbeiten und gegebenenfalls Auskunft über diese Daten zu erhalten.</li>
                <li><strong>Recht auf Berichtigung (Art. 16 DSGVO):</strong> Sie haben das Recht, die unverzügliche Berichtigung unrichtiger oder Vervollständigung unvollständiger personenbezogener Daten zu verlangen.</li>
                <li><strong>Recht auf Löschung (Art. 17 DSGVO):</strong> Sie haben das Recht, die unverzügliche Löschung Ihrer personenbezogenen Daten zu verlangen, sofern die gesetzlichen Voraussetzungen erfüllt sind.</li>
                <li><strong>Recht auf Einschränkung (Art. 18 DSGVO):</strong> Sie haben das Recht, die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen.</li>
                <li><strong>Widerspruchsrecht (Art. 21 DSGVO):</strong> Sie haben das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit gegen die Verarbeitung Ihrer personenbezogenen Daten Widerspruch einzulegen.</li>
                <li><strong>Recht auf Datenübertragbarkeit (Art. 20 DSGVO):</strong> Sie haben das Recht, Ihre personenbezogenen Daten in einem strukturierten, gängigen und maschinenlesbaren Format zu erhalten.</li>
                <li><strong>Widerrufsrecht bei Einwilligung:</strong> Haben Sie uns eine Einwilligung erteilt, können Sie diese jederzeit mit Wirkung für die Zukunft widerrufen.</li>
                <li><strong>Beschwerderecht:</strong> Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen Daten durch uns zu beschweren.</li>
              </ul>
            </div>
            <h3>4.1 Geltendmachung Ihrer Rechte</h3>
            <p>Zur Ausübung Ihrer Rechte wenden Sie sich bitte an:<br>
            E-Mail: datenschutz@[ihre-domain].de<br>
            Postalisch: [Ihre Adresse], z.Hd. Datenschutz</p>
          `,
        },
        {
          title: "5. Datensicherheit",
          content: `
            <p>Wir treffen angemessene technische und organisatorische Sicherheitsmaßnahmen, um Ihre personenbezogenen Daten gegen zufällige oder vorsätzliche Manipulationen, Verlust, Zerstörung oder den unbefugten Zugriff Dritter zu schützen.</p>
            <h3>5.1 Technische Maßnahmen</h3>
            <ul>
              <li>SSL/TLS-Verschlüsselung für alle Datenübertragungen</li>
              <li>Regelmäßige Sicherheitsupdates und Patches</li>
              <li>Firewall-Schutz und Intrusion Detection Systeme</li>
              <li>Verschlüsselte Datenspeicherung</li>
              <li>Regelmäßige Datensicherungen</li>
            </ul>
            <h3>5.2 Organisatorische Maßnahmen</h3>
            <ul>
              <li>Zugriffskontrolle und Berechtigungskonzepte</li>
              <li>Vertraulichkeitsverpflichtungen für Mitarbeiter</li>
              <li>Regelmäßige Datenschutzschulungen</li>
              <li>Dokumentierte Verfahren zur Datenverarbeitung</li>
              <li>Regelmäßige Überprüfung der Sicherheitsmaßnahmen</li>
            </ul>
            <h3>5.3 Datenweitergabe und Auftragsverarbeitung</h3>
            <p>Eine Übermittlung Ihrer persönlichen Daten an Dritte findet nur statt, wenn:</p>
            <ul>
              <li>Sie Ihre ausdrückliche Einwilligung erteilt haben (Art. 6 Abs. 1 lit. a DSGVO)</li>
              <li>die Weitergabe zur Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen erforderlich ist (Art. 6 Abs. 1 lit. f DSGVO)</li>
              <li>eine gesetzliche Verpflichtung besteht (Art. 6 Abs. 1 lit. c DSGVO)</li>
              <li>dies für die Abwicklung von Vertragsverhältnissen erforderlich ist (Art. 6 Abs. 1 lit. b DSGVO)</li>
            </ul>
            <p>Sofern wir Auftragsverarbeiter einsetzen, stellen wir durch entsprechende Verträge sicher, dass diese die datenschutzrechtlichen Bestimmungen einhalten.</p>
          `,
        },
        {
          title: "6. Änderungen dieser Datenschutzerklärung",
          content: `
            <p>Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an geänderte Rechtslagen oder bei Änderungen unserer Services sowie der Datenverarbeitung anzupassen. Dies gilt jedoch nur im Hinblick auf Erklärungen zur Datenverarbeitung. Sofern Einwilligungen der Nutzer erforderlich sind oder Bestandteile der Datenschutzerklärung Regelungen des Vertragsverhältnisses mit den Nutzern enthalten, erfolgen die Änderungen nur mit Zustimmung der Nutzer.</p>
            <p>Die Nutzer werden gebeten, sich regelmäßig über den Inhalt der Datenschutzerklärung zu informieren.</p>
            <div class="version-history">
              <h3>Versionshistorie</h3>
              <ul>
                <li><strong>10. Mai 2025:</strong> Aktuelle Version - Anpassung der Cookie-Richtlinien</li>
                <li><strong>15. Januar 2025:</strong> Anpassung an neue gesetzliche Anforderungen der ePrivacy-Verordnung</li>
                <li><strong>5. Oktober 2024:</strong> Erstveröffentlichung der Datenschutzerklärung</li>
              </ul>
            </div>
            <h3>6.1 Benachrichtigung über Änderungen</h3>
            <p>Bei wesentlichen Änderungen dieser Datenschutzerklärung werden wir Sie per E-Mail oder durch einen deutlichen Hinweis auf unserer Website informieren, bevor die Änderung wirksam wird.</p>
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