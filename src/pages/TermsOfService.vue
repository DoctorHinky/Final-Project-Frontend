<!-- src/pages/TermsOfService.vue -->
<template>
  <div class="legal-page terms-page">
    <div class="container">
      <div class="page-header">
        <h1>Allgemeine Geschäftsbedingungen</h1>
        <div class="last-updated">Zuletzt aktualisiert: 07. Juni 2025</div>
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
              <div class="version-date">Gültig ab: 07.06.2025</div>
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
              Die nachfolgenden Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Geschäftsbeziehungen zwischen der [Ihr Unternehmensname] (nachfolgend "Anbieter" genannt) und dem Kunden (nachfolgend "Kunde" genannt). Mit der Nutzung unserer Dienste und/oder dem Abschluss eines Vertrages akzeptiert der Kunde diese AGB vollumfänglich.
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
              [Ihr Unternehmensname]<br />
              [Straße und Hausnummer]<br />
              [PLZ Ort]<br />
              Deutschland
            </p>

            <p>
              Geschäftsführer: [Name des Geschäftsführers]<br />
              Handelsregister: Amtsgericht [Stadt], HRB [Nummer]<br />
              USt-IdNr.: DE[Nummer]
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
            <p>(1) Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge, die zwischen dem Anbieter und dem Kunden über die Website [Ihre-Domain.de] oder andere Vertriebskanäle des Anbieters geschlossen werden.</p>
            <ol>
              <li>Die AGB gelten sowohl für Verbraucher als auch für Unternehmer, soweit nicht ausdrücklich differenziert wird.</li>
              <li>Abweichende, entgegenstehende oder ergänzende Allgemeine Geschäftsbedingungen des Kunden werden nur dann und insoweit Vertragsbestandteil, als der Anbieter ihrer Geltung ausdrücklich schriftlich zugestimmt hat.</li>
              <li>Diese AGB gelten auch für alle zukünftigen Geschäfte zwischen den Parteien, soweit es sich um Rechtsgeschäfte verwandter Art handelt.</li>
            </ol>
            <p>(2) Im Einzelfall getroffene, individuelle Vereinbarungen mit dem Kunden (einschließlich Nebenabreden, Ergänzungen und Änderungen) haben in jedem Fall Vorrang vor diesen AGB.</p>
          `,
        },
        {
          title: "Vertragsschluss",
          content: `
            <p>(1) Die Darstellung der Produkte und Dienstleistungen auf unserer Website stellt kein rechtlich bindendes Angebot, sondern eine unverbindliche Aufforderung an den Kunden dar, Waren oder Dienstleistungen zu bestellen (invitatio ad offerendum).</p>
            <p>(2) Der Kunde kann aus unserem Sortiment [Produkte/Dienstleistungen] auswählen und diese über den Button "In den Warenkorb" in einem so genannten Warenkorb sammeln. Über den Button "Zahlungspflichtig bestellen" gibt er einen verbindlichen Antrag zum Kauf der im Warenkorb befindlichen Waren ab.</p>
            <div class="term-example">
              <h4>Vertragsschluss bei Online-Bestellungen:</h4>
              <p>Vor Absenden der Bestellung kann der Kunde die Daten jederzeit ändern und einsehen sowie mithilfe der Browserfunktion "zurück" zum Warenkorb zurückgehen oder den Bestellvorgang insgesamt abbrechen. Notwendige Angaben sind mit einem Sternchen (*) gekennzeichnet.</p>
            </div>
            <p>(3) Der Anbieter schickt daraufhin dem Kunden eine automatische Empfangsbestätigung per E-Mail zu, in welcher die Bestellung des Kunden nochmals aufgeführt wird. Diese automatische Empfangsbestätigung stellt noch keine Annahme des Antrags dar, sondern dokumentiert lediglich, dass die Bestellung beim Anbieter eingegangen ist.</p>
            <p>(4) Die Annahme des Kaufantrags erfolgt durch Versand einer Auftragsbestätigung per E-Mail oder durch Auslieferung der Ware innerhalb von [Anzahl] Tagen.</p>
          `,
        },
        {
          title: "Lieferung und Versand",
          content: `
            <p>(1) Die Lieferung erfolgt an die vom Kunden angegebene Lieferadresse, sofern nichts anderes vereinbart wurde.</p>
            <div class="term-highlight">
              <p><strong>Lieferzeiten:</strong> Sofern nicht beim Angebot anders angegeben, erfolgt die Lieferung innerhalb von [Anzahl] Werktagen nach Vertragsschluss. Bei Vorkasse beginnt die Frist am Tag nach Zahlungseingang.</p>
            </div>
            <p>(2) Der Anbieter ist zu Teillieferungen berechtigt, soweit dies für den Kunden zumutbar ist. Dabei fallen nur einmalig Versandkosten an.</p>
            <p>(3) Versandkosten werden dem Kunden im Bestellprozess angezeigt und sind vom Kunden zusätzlich zu tragen, soweit nicht die versandkostenfreie Lieferung zugesagt ist.</p>
            <p>(4) Das Versandrisiko trägt der Anbieter, wenn der Kunde Verbraucher ist. Bei Unternehmern geht die Gefahr des zufälligen Untergangs und der zufälligen Verschlechterung der Ware mit der Übergabe an den Spediteur, den Frachtführer oder die sonst zur Ausführung der Versendung bestimmte Person oder Anstalt über.</p>
          `,
        },
        {
          title: "Preise und Zahlungsbedingungen",
          content: `
            <p>(1) Alle angegebenen Preise sind Endpreise in Euro und verstehen sich inklusive der jeweils gültigen gesetzlichen Umsatzsteuer.</p>
            <ol>
              <li>Zusätzlich zu den angegebenen Preisen können Liefer- und Versandkosten anfallen, die dem Kunden vor Abgabe der Bestellung deutlich mitgeteilt werden.</li>
              <li>Der Kunde hat die Möglichkeit der Zahlung per [Zahlungsmethoden einfügen, z.B. Vorkasse, Kreditkarte, PayPal, Rechnung, Lastschrift].</li>
              <li>Bei Auswahl der Zahlungsart Vorkasse nennen wir unsere Bankverbindung in der Auftragsbestätigung. Der Rechnungsbetrag ist innerhalb von [Anzahl] Tagen auf unser Konto zu überweisen.</li>
            </ol>
            <p>(2) Der Kunde verpflichtet sich, den Kaufpreis innerhalb von [Anzahl] Tagen nach Erhalt der Ware zu zahlen, sofern nicht anders vereinbart. Nach Ablauf dieser Frist kommt der Kunde in Zahlungsverzug.</p>
            <p>(3) Im Falle des Zahlungsverzugs ist der Anbieter berechtigt, Verzugszinsen in Höhe von 5 Prozentpunkten über dem jeweiligen Basiszinssatz bei Verbrauchern bzw. 9 Prozentpunkten über dem Basiszinssatz bei Unternehmern zu verlangen.</p>
          `,
        },
        {
          title: "Widerrufsrecht",
          content: `
            <p>(1) Verbrauchern steht ein gesetzliches Widerrufsrecht nach Maßgabe der folgenden Belehrung zu:</p>
            <div class="term-important">
              <h4>Widerrufsbelehrung</h4>
              <p><strong>Widerrufsrecht:</strong> Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen haben bzw. hat.</p>
            </div>
            <h3>Ausübung des Widerrufsrechts</h3>
            <p>Um Ihr Widerrufsrecht auszuüben, müssen Sie uns ([Unternehmensname], [Anschrift], Tel.: [Telefonnummer], E-Mail: [E-Mail-Adresse]) mittels einer eindeutigen Erklärung (z.B. ein mit der Post versandter Brief, Telefax oder E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.</p>
            <p>Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist. Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.</p>
            <h4>Folgen des Widerrufs</h4>
            <p>Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist.</p>
            <h4>Ausschluss des Widerrufsrechts</h4>
            <p>Das Widerrufsrecht besteht nicht bei Verträgen zur Lieferung von Waren, die nicht vorgefertigt sind und für deren Herstellung eine individuelle Auswahl oder Bestimmung durch den Verbraucher maßgeblich ist oder die eindeutig auf die persönlichen Bedürfnisse des Verbrauchers zugeschnitten sind.</p>
          `,
        },
        {
          title: "Gewährleistung",
          content: `
            <p>(1) Es gelten die gesetzlichen Gewährleistungsrechte. Für Verbraucher beträgt die Gewährleistungsfrist zwei Jahre ab Lieferung der Ware. Für Unternehmer beträgt die Gewährleistungsfrist ein Jahr ab Lieferung der Ware.</p>
            <p>(2) Bei gebrauchten Waren beträgt die Gewährleistungsfrist abweichend von vorstehender Regelung ein Jahr ab Ablieferung der Ware. Die Verkürzung der Gewährleistungsfrist auf ein Jahr gilt nicht für Schadensersatzansprüche des Kunden aufgrund einer Verletzung des Lebens, des Körpers, der Gesundheit oder aufgrund einer vorsätzlichen oder grob fahrlässigen Pflichtverletzung des Anbieters oder seiner Erfüllungsgehilfen.</p>
            <p>(3) Der Kunde ist verpflichtet, die gelieferte Ware unverzüglich auf Vollständigkeit, offensichtliche Mängel und Transportschäden zu überprüfen und dem Anbieter sowie dem Spediteur Beanstandungen unverzüglich mitzuteilen. Kommt der Kunde dieser Verpflichtung nicht nach, ist die Geltendmachung des Gewährleistungsanspruchs insoweit ausgeschlossen.</p>
            <p>(4) Bei Mängeln leistet der Anbieter nach eigener Wahl Gewähr durch Nachbesserung oder Ersatzlieferung (Nacherfüllung). Schlägt die Nacherfüllung fehl, kann der Kunde nach seiner Wahl Minderung verlangen oder vom Vertrag zurücktreten. Die Nacherfüllung gilt nach erfolglosem zweiten Versuch als fehlgeschlagen, wenn sich nicht insbesondere aus der Art der Sache oder des Mangels oder den sonstigen Umständen etwas anderes ergibt.</p>
          `,
        },
        {
          title: "Haftungsbeschränkung",
          content: `
            <p>(1) Der Anbieter haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie nach Maßgabe des Produkthaftungsgesetzes. Für leichte Fahrlässigkeit haftet der Anbieter nur bei Verletzung einer wesentlichen Vertragspflicht (Kardinalpflicht), deren Erfüllung die ordnungsgemäße Durchführung des Vertrags überhaupt erst ermöglicht und auf deren Einhaltung der Kunde regelmäßig vertrauen darf.</p>
            <ol>
              <li>Die Haftung für leichte Fahrlässigkeit ist der Höhe nach beschränkt auf die bei Vertragsschluss vorhersehbaren Schäden, mit deren Entstehung typischerweise gerechnet werden muss.</li>
              <li>Diese Haftungsbeschränkung gilt nicht für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit.</li>
              <li>Die vorstehenden Haftungsausschlüsse und -beschränkungen gelten in gleichem Umfang zugunsten der Organe, gesetzlichen Vertreter, Angestellten und sonstigen Erfüllungsgehilfen des Anbieters.</li>
              <li>Die gesetzlichen Bestimmungen zum Verbrauchsgüterkauf bleiben unberührt.</li>
            </ol>
            <p>(2) Der Kunde ist für die regelmäßige Sicherung seiner Daten verantwortlich. Bei einem vom Anbieter verschuldeten Datenverlust haftet der Anbieter daher nur für denjenigen Aufwand, der für die Wiederherstellung der Daten bei ordnungsgemäßer Datensicherung durch den Kunden erforderlich ist.</p>
          `,
        },
        {
          title: "Datenschutz",
          content: `
            <p>(1) Der Anbieter verarbeitet personenbezogene Daten des Kunden zweckgebunden und gemäß den gesetzlichen Bestimmungen.</p>
            <p>(2) Die zum Zwecke der Bestellung von Waren angegebenen persönlichen Daten (wie zum Beispiel Name, E-Mail-Adresse, Anschrift, Zahlungsdaten) werden vom Anbieter zur Erfüllung und Abwicklung des Vertrags verwendet. Diese Daten werden vertraulich behandelt und nicht an Dritte weitergegeben, die nicht am Bestell-, Auslieferungs- und Zahlungsvorgang beteiligt sind.</p>
            <p>(3) Der Kunde hat das Recht, auf Antrag unentgeltlich Auskunft über die von ihm gespeicherten personenbezogenen Daten zu erhalten. Zusätzlich hat er das Recht auf Berichtigung unrichtiger Daten, Sperrung und Löschung seiner personenbezogenen Daten, soweit keine gesetzliche Aufbewahrungspflicht entgegensteht.</p>
            <p>Weitere Informationen finden Sie in unserer <router-link to="/privacy-policy">Datenschutzerklärung</router-link>.</p>
          `,
        },
        {
          title: "Schlussbestimmungen",
          content: `
            <p>(1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Bei Verbrauchern gilt diese Rechtswahl nur insoweit, als nicht der gewährte Schutz durch zwingende Bestimmungen des Rechts des Staates, in dem der Verbraucher seinen gewöhnlichen Aufenthalt hat, entzogen wird.</p>
            <p>(2) Ist der Kunde Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen, ist ausschließlicher Gerichtsstand für alle Streitigkeiten aus diesem Vertrag [Ihr Geschäftssitz]. Dasselbe gilt, wenn der Kunde keinen allgemeinen Gerichtsstand in Deutschland hat oder Wohnsitz oder gewöhnlicher Aufenthalt im Zeitpunkt der Klageerhebung nicht bekannt sind.</p>
            <p>(3) Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit, die Sie unter https://ec.europa.eu/consumers/odr/ finden. Verbraucher haben die Möglichkeit, diese Plattform für die Beilegung ihrer Streitigkeiten zu nutzen. Wir sind nicht bereit und nicht verpflichtet, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
            <p>(4) Sollten einzelne Bestimmungen dieses Vertrages unwirksam sein oder werden, so wird hierdurch die Wirksamkeit der übrigen Bestimmungen nicht berührt.</p>
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