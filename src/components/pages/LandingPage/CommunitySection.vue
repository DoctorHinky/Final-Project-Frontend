<template>
  <section class="section kommentar-karussell-section" id="community" ref="sectionRef">
    <div class="container">
      <div class="karussell">
        <!-- Informationsbereich -->
        <div class="informationen">
          <h1 class="beschreibung">So denkt unsere Community</h1>
          <p class="info-text">
            Hier sind einige authentische Gedanken und Meinungen unserer geschätzten Nutzer.
          </p>
        </div>

        <!-- Kommentarkarten -->
        <div 
          v-for="(kommentar, index) in kommentare" 
          :key="kommentar.id"
          :class="getKartenKlasse(index)"
          class="kommentar-karte"
          :style="getKartenStyle(index)"
          @click="aktiviereKarte(index)"
        >
          <img
            :src="kommentar.avatar"
            :alt="`Avatar von ${kommentar.autor}`"
            class="avatar-logo"
            loading="lazy"
          />
          <div class="kommentar-inhalt">
            <!-- Bewertung -->
            <div class="bewertung" :aria-label="`Bewertung: ${kommentar.sterne} von 5 Sternen`">
              <StarIcon 
                v-for="stern in 5" 
                :key="stern"
                class="stern-icon" 
                :class="{ 'aktiv': stern <= kommentar.sterne, 'inaktiv': stern > kommentar.sterne }"
              />
            </div>
            
            <!-- Kommentar-Artikel -->
            <article class="kommentar">
              <h2 class="titel">{{ kommentar.titel }}</h2>
              <p class="kommentar-text">{{ kommentar.text }}</p>
              <p class="kommentar-autor">{{ kommentar.autor }}</p>
            </article>
          </div>
        </div>

        <!-- Karussell-Steuerung -->
        <div class="karussell-steuerung">
          <button 
            class="vorherige"
            @click="vorherige"
            :aria-label="'Vorheriger Kommentar'"
            :disabled="isAnimating"
          >
            <ChevronLeftIcon class="chevron-icon" />
          </button>
          <button 
            class="naechste"
            @click="naechste"
            :aria-label="'Nächster Kommentar'"
            :disabled="isAnimating"
          >
            <ChevronRightIcon class="chevron-icon" />
          </button>
        </div>

        <!-- Indikatoren -->
        <div class="karussell-indikatoren">
          <button
            v-for="(kommentar, index) in kommentare"
            :key="`indikator-${kommentar.id}`"
            :class="{ 'aktiv': index === aktuellerIndex }"
            @click="geheZuIndex(index)"
            :aria-label="`Gehe zu Kommentar ${index + 1}`"
          ></button>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from '@heroicons/vue/24/solid';

interface Kommentar {
  id: number;
  titel: string;
  text: string;
  autor: string;
  sterne: number;
  avatar: string;
}

export default defineComponent({
  name: 'KommentarKarussell',
  components: {
    ChevronLeftIcon,
    ChevronRightIcon,
    StarIcon
  },
  setup() {
    // Reaktive Daten
    const sectionRef = ref<HTMLElement | null>(null);
    const aktuellerIndex = ref(0);
    const isAnimating = ref(false);
    const autoplayInterval = ref<number | null>(null);

    // Kommentar-Daten
    const kommentare = ref<Kommentar[]>([
      {
        id: 1,
        titel: "Inspirierende Community",
        text: "Ich finde es großartig, wie offen hier über Erziehung gesprochen wird. Die Erfahrungen anderer Eltern helfen mir, neue Perspektiven zu gewinnen und eigene Lösungen zu finden.",
        autor: "Julia S. - Mutter eines Grundschülers",
        sterne: 4,
        avatar: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=150&h=150&fit=crop&crop=face"
      },
      {
        id: 2,
        titel: "Medienerziehung leicht gemacht",
        text: "Die Tipps zur Medienerziehung waren für uns ein echter Durchbruch. Wir haben klare, faire Regeln etabliert und die endlosen Diskussionen über Bildschirmzeit gehören der Vergangenheit an. Unsere Kinder akzeptieren die Grenzen viel besser.",
        autor: "Sandra K. - Mutter von zwei Schulkindern",
        sterne: 5,
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
      },
      {
        id: 3,
        titel: "Verbesserte Kommunikation mit Teenagern",
        text: "Als Vater eines Teenagers hatte ich oft das Gefühl, gegen Wände zu reden. Die Kommunikationstipps haben unsere Beziehung komplett verändert. Wir verstehen uns jetzt viel besser und meine Tochter öffnet sich wieder mehr.",
        autor: "Thomas Weber - Vater einer 15-jährigen Tochter",
        sterne: 5,
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
      },
      {
        id: 4,
        titel: "Wertvolle Erziehungstipps",
        text: "Die praktischen Ratschläge haben uns als junge Eltern enorm geholfen. Besonders die Artikel über Schlafgewohnheiten und Routine-Entwicklung waren Gold wert. Unser Baby schläft jetzt endlich durch!",
        autor: "Lisa & Marc - Erstlingseltern",
        sterne: 5,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
      },
      {
        id: 5,
        titel: "Umgang mit Schulstress",
        text: "Die Strategien zum Umgang mit Schulstress haben unserem Sohn sehr geholfen. Er geht jetzt entspannter an die Hausaufgaben heran und wir als Familie sind viel ausgeglichener geworden.",
        autor: "Familie Schmidt - Eltern eines Grundschülers",
        sterne: 4,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
      }
    ]);

    // Computed Properties
    const gesamtAnzahl = computed(() => kommentare.value.length);

    // Methoden
    const getKartenKlasse = (index: number) => {
      const position = (index - aktuellerIndex.value + gesamtAnzahl.value) % gesamtAnzahl.value;
      
      if (position === 0) return 'kommentar-karte-1'; // Vorderste Karte
      if (position === 1) return 'kommentar-karte-2'; // Mittlere Karte
      return 'kommentar-karte-3'; // Hinterste Karte
    };

    const getKartenStyle = (index: number) => {
      const position = (index - aktuellerIndex.value + gesamtAnzahl.value) % gesamtAnzahl.value;
      
      // Verstecke Karten, die nicht in den ersten 3 Positionen sind
      if (position > 2) {
        return { display: 'none' };
      }
      
      return {};
    };

    // Reset Autoplay Timer
    const resetAutoplay = () => {
      stopAutoplay();
      startAutoplay();
    };

    const naechste = async () => {
      if (isAnimating.value) return;
      
      isAnimating.value = true;
      aktuellerIndex.value = (aktuellerIndex.value + 1) % gesamtAnzahl.value;
      
      // Reset Timer bei manueller Navigation
      resetAutoplay();
      
      await nextTick();
      setTimeout(() => {
        isAnimating.value = false;
      }, 0);
    };

    const vorherige = async () => {
      if (isAnimating.value) return;
      
      isAnimating.value = true;
      aktuellerIndex.value = (aktuellerIndex.value - 1 + gesamtAnzahl.value) % gesamtAnzahl.value;
      
      // Reset Timer bei manueller Navigation
      resetAutoplay();
      
      await nextTick();
      setTimeout(() => {
        isAnimating.value = false;
      }, 0);
    };

    const geheZuIndex = async (index: number) => {
      if (isAnimating.value || index === aktuellerIndex.value) return;
      
      isAnimating.value = true;
      aktuellerIndex.value = index;
      
      // Reset Timer bei manueller Navigation
      resetAutoplay();
      
      await nextTick();
      setTimeout(() => {
        isAnimating.value = false;
      }, 0);
    };

    const aktiviereKarte = (index: number) => {
      const kartenKlasse = getKartenKlasse(index);
      if (kartenKlasse !== 'kommentar-karte-1') {
        geheZuIndex(index);
      }
    };

    // Autoplay-Funktionalität
    const startAutoplay = () => {
      autoplayInterval.value = window.setInterval(() => {
        naechste();
      }, 7000);
    };

    const stopAutoplay = () => {
      if (autoplayInterval.value) {
        clearInterval(autoplayInterval.value);
        autoplayInterval.value = null;
      }
    };

    // Lifecycle Hooks
    onMounted(() => {
      startAutoplay();
    });

    onUnmounted(() => {
      stopAutoplay();
    });

    return {
      sectionRef,
      aktuellerIndex,
      isAnimating,
      kommentare,
      getKartenKlasse,
      getKartenStyle,
      naechste,
      vorherige,
      geheZuIndex,
      aktiviereKarte
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

.kommentar-karussell-section {
  min-height: 50vh;
  padding: map.get(vars.$spacing, xxxl) 0;
  position: relative;
  overflow: visible; // Wichtig: Karten sollen nicht abgeschnitten werden
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;

  &.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    max-width: 1400px;
    height: 100vh;
    border-radius: 20px;
    overflow: visible; // Änderung: Karten sollen nicht abgeschnitten werden
    position: relative;
    padding: 0 20px; // Extra Padding für Desktop
  }

  .karussell {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .informationen {
    position: absolute;
    width: 100%;
    top: 37%;
    left: 55%;
    transform: translateX(-50%);
    text-align: left;
    font-size: 1.2em;
    z-index: 10;
    pointer-events: none;
    user-select: none;
    font-family: comic sans ms, sans-serif;

    .beschreibung {
      width: 20%;
      margin-bottom: 10px;
      font-weight: bold;
      letter-spacing: 0.03em;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, accent-yellow);
        }
      }
    }

    .info-text {
      width: 30%;
      font-size: 1.18em;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  .kommentar-karte {
    position: absolute;
    width: 700px;
    border-radius: 20px;
    padding: 24px 32px 24px 24px;
    overflow: hidden;
    display: flex;
    align-items: flex-start;
    gap: 18px;
    cursor: pointer;
    transition: transform 0.5s cubic-bezier(0.4, 2, 0.6, 1), 
                box-shadow 0.5s ease,
                filter 0.5s ease;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background: linear-gradient(120deg, 
          mixins.theme-color($theme, primary-bg) 0%, 
          mixins.theme-color($theme, card-bg) 100%);
        border: 1px solid rgba(mixins.theme-color($theme, border-medium), 0.18);
        @include mixins.shadow('medium', $theme);
      }
    }

    &.kommentar-karte-1 {
      top: 35%;
      right: 50px;
      z-index: 3;
      transform: scale(1.05);
      filter: blur(0px);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          @include mixins.shadow('large', $theme);
        }
      }

      &:hover {
        transform: scale(1.1);
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            @include mixins.glow('green', 'large', $theme);
          }
        }
      }
    }

    &.kommentar-karte-2 {
      top: 28%;
      right: 180px;
      height: 170px;
      z-index: 2;
      transform: scale(0.95);
      filter: blur(2px);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          @include mixins.shadow('medium', $theme);
        }
      }
    }

    &.kommentar-karte-3 {
      top: 22%;
      right: 300px;
      height: 145px;
      z-index: 1;
      transform: scale(0.85);
      filter: blur(4px);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          @include mixins.shadow('small', $theme);
        }
      }
    }

    .avatar-logo {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      margin-right: 18px;
      object-fit: cover;
      flex-shrink: 0;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          border: 2px solid mixins.theme-color($theme, border-medium);
          @include mixins.shadow('small', $theme);
        }
      }
    }

    .kommentar-inhalt {
      flex: 1;
      min-width: 0;
      overflow: hidden; // Verhindert Text-Overflow
    }

    .bewertung {
      display: flex;
      margin-bottom: 10px;
      margin-top: 6px;

      .stern-icon {
        width: 20px;
        height: 20px;
        margin-right: 5px;
        transition: color 0.3s ease;

        &.aktiv {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, accent-yellow);
              filter: drop-shadow(0 0 2px mixins.theme-color($theme, accent-yellow));
            }
          }
        }

        &.inaktiv {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-tertiary);
            }
          }
        }
      }
    }

    .kommentar {
      overflow: hidden;

      .titel {
        font-size: 1.35em;
        margin-bottom: 8px;
        font-weight: 600;
        letter-spacing: 0.02em;
        // Text-Overflow verhindern
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        word-wrap: break-word;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
            text-shadow: 0 1px 2px rgba(mixins.theme-color($theme, text-primary), 0.5);
          }
        }
      }

      .kommentar-text {
        font-size: 1.08em;
        margin-bottom: 10px;
        line-height: 1.5;
        // Text-Overflow verhindern
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        overflow: hidden;
        word-wrap: break-word;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
            text-shadow: 0 1px 2px rgba(mixins.theme-color($theme, text-secondary), 0.4);
          }
        }
      }

      .kommentar-autor {
        font-size: 0.98em;
        font-style: italic;
        margin-top: 6px;
        // Text-Overflow verhindern
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-tertiary);
          }
        }
      }
    }
  }

  .karussell-steuerung {
    position: absolute;
    bottom: 25%;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-around;
    width: 100%;
    pointer-events: none;
    z-index: 15;

    button {
      border: none;
      cursor: pointer;
      border-radius: 50%;
      width: 54px;
      height: 54px;
      transition: all 0.3s ease;
      pointer-events: auto;
      outline: none;
      display: flex;
      align-items: center;
      justify-content: center;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: rgba(mixins.theme-color($theme, primary-bg), 0.8);
          color: mixins.theme-color($theme, text-primary);
          @include mixins.shadow('medium', $theme);
        }
      }

      .chevron-icon {
        width: 24px;
        height: 24px;
        transition: color 0.3s ease;
      }

      &:hover:not(:disabled) {
        transform: scale(1.1);
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: mixins.theme-color($theme, secondary-bg);
            @include mixins.glow('yellow', 'medium', $theme);
            
            .chevron-icon {
              color: mixins.theme-color($theme, accent-yellow);
            }
          }
        }
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }

  .karussell-indikatoren {
    position: absolute;
    bottom: 32%;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: map.get(vars.$spacing, m);
    z-index: 15;

    button {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: rgba(mixins.theme-color($theme, text-tertiary), 0.5);
        }
      }

      &.aktiv {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: mixins.theme-color($theme, accent-green);
            transform: scale(1.3);
            @include mixins.glow('green', 'small', $theme);
          }
        }
      }

      &:hover:not(.aktiv) {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: rgba(mixins.theme-color($theme, text-secondary), 0.8);
            transform: scale(1.1);
          }
        }
      }
    }
  }

  // Responsive Design - Erweiterte Breakpoints
  @media (max-width: map.get(map.get(vars.$layout, breakpoints), desktop)) {
    .container {
      padding: 0 20px;
    }

    .kommentar-karte {
      width: 90vw !important;
      min-width: 0;
      padding: 16px 10px 16px 10px;

      &.kommentar-karte-1 {
        right: 5% !important;
      }

      &.kommentar-karte-2 {
        right: 15% !important;
      }

      &.kommentar-karte-3 {
        right: 25% !important;
      }
    }

    .informationen {
      .beschreibung, .info-text {
        width: 90vw !important;
        font-size: 1.1em !important;
      }
    }
  }

  // Große Smartphones (größer als 600px)
  @media (max-width: 600px) and (min-width: 481px) {
    .container {
      height: 80vh;
      padding: 0 15px;
    }

    .informationen {
      top: 5% !important;
      left: 50% !important;

      .beschreibung {
        font-size: 1.3em !important;
        width: 100% !important;
        text-align: center;
      }

      .info-text {
        font-size: 0.9em !important;
        width: 100% !important;
        text-align: center;
      }
    }

    .kommentar-karte {
      &.kommentar-karte-1 {
        top: 30% !important;
      }

      &.kommentar-karte-2 {
        top: 25% !important;
      }

      &.kommentar-karte-3 {
        top: 20% !important;
      }
    }
  }

  // Tablet und große Smartphones
  @media (max-width: map.get(map.get(vars.$layout, breakpoints), mobile)) {
    .container {
      height: 80vh;
      padding: 0 15px; // Extra Padding für Tablets
    }

    .kommentar-karte {
      width: 85vw !important;
      padding: 14px 8px 14px 8px;
      gap: 12px;

      &.kommentar-karte-1 {
        top: 35% !important; // Mehr Platz nach unten
      }

      &.kommentar-karte-2 {
        top: 30% !important;
      }

      &.kommentar-karte-3 {
        top: 25% !important;
      }

      .avatar-logo {
        width: 60px;
        height: 60px;
        margin-right: 12px;
      }

      .kommentar {
        .titel {
          font-size: 1.1em;
          -webkit-line-clamp: 2;
        }

        .kommentar-text {
          font-size: 0.95em;
          -webkit-line-clamp: 3;
        }

        .kommentar-autor {
          font-size: 0.9em;
        }
      }
    }

    .informationen {
      top: 5% !important; // Weiter nach oben
      left: 50% !important;

      .beschreibung {
        font-size: 1.4em !important;
        width: 100% !important;
        text-align: center;
      }

      .info-text {
        font-size: 0.95em !important;
        width: 100% !important;
        text-align: center;
      }
    }
  }

  // Kleine Smartphones (480px und kleiner)
  @media (max-width: 480px) {
    padding: map.get(vars.$spacing, xl) 0;

    .container {
      height: 80vh; // Mehr Höhe für bessere Sichtbarkeit
      padding: 0 10px; // Seitliches Padding
    }

    .kommentar-karte {
      width: 88vw !important;
      padding: 12px 8px 12px 8px;
      gap: 10px;
      border-radius: 12px;

      &.kommentar-karte-1 {
        top: 40% !important; // Viel mehr Platz nach unten
        right: 6% !important;
        transform: scale(1.0) !important;
      }

      &.kommentar-karte-2 {
        top: 35% !important;
        right: 10% !important;
        transform: scale(0.9) !important;
      }

      &.kommentar-karte-3 {
        top: 30% !important;
        right: 14% !important;
        transform: scale(0.8) !important;
      }

      .avatar-logo {
        width: 50px;
        height: 50px;
        margin-right: 8px;
      }

      .bewertung {
        margin-bottom: 6px;

        .stern-icon {
          width: 16px;
          height: 16px;
          margin-right: 3px;
        }
      }

      .kommentar {
        .titel {
          font-size: 1.0em;
          margin-bottom: 6px;
          -webkit-line-clamp: 2;
        }

        .kommentar-text {
          font-size: 0.9em;
          margin-bottom: 8px;
          line-height: 1.4;
          -webkit-line-clamp: 3;
        }

        .kommentar-autor {
          font-size: 0.85em;
        }
      }
    }

    .informationen {
      display: none; // Infotext auf kleinen Smartphones verstecken um Platz für Karten zu schaffen
      /*
       * Alternative: Falls Infotext doch gezeigt werden soll, verwende:
       * position: absolute;
       * top: 2% !important;
       * left: 50% !important;
       * transform: translateX(-50%);
       * z-index: 20;
       * font-size: 0.8em !important;
       */
    }

    .karussell-steuerung {
      bottom: 15%;

      button {
        width: 44px;
        height: 44px;

        .chevron-icon {
          width: 20px;
          height: 20px;
        }
      }
    }

    .karussell-indikatoren {
      bottom: 23%;
      gap: map.get(vars.$spacing, s);

      button {
        width: 10px;
        height: 10px;
      }
    }
  }

  // Sehr kleine Smartphones (370px und kleiner)
  @media (max-width: 370px) {
    padding: map.get(vars.$spacing, l) 0;

    .container {
      height: 85vh; // Noch mehr Höhe für sehr kleine Screens
      padding: 0 5px; // Minimales Seitliches Padding
    }

    .kommentar-karte {
      width: 92vw !important;
      padding: 10px 6px 10px 6px;
      gap: 8px;
      border-radius: 10px;

      &.kommentar-karte-1 {
        top: 45% !important; // Noch mehr Platz nach unten
        right: 4% !important;
        transform: scale(0.95) !important;

        &:hover {
          transform: scale(1.0) !important;
        }
      }

      &.kommentar-karte-2 {
        top: 40% !important;
        right: 7% !important;
        transform: scale(0.85) !important;
      }

      &.kommentar-karte-3 {
        top: 35% !important;
        right: 10% !important;
        transform: scale(0.75) !important;
      }

      .avatar-logo {
        width: 40px;
        height: 40px;
        margin-right: 6px;
      }

      .bewertung {
        margin-bottom: 4px;
        margin-top: 4px;

        .stern-icon {
          width: 14px;
          height: 14px;
          margin-right: 2px;
        }
      }

      .kommentar {
        .titel {
          font-size: 0.9em;
          margin-bottom: 4px;
          -webkit-line-clamp: 1;
          line-height: 1.2;
        }

        .kommentar-text {
          font-size: 0.8em;
          margin-bottom: 6px;
          line-height: 1.3;
          -webkit-line-clamp: 2;
        }

        .kommentar-autor {
          font-size: 0.75em;
          margin-top: 4px;
        }
      }
    }

    .informationen {
      display: none; // Infotext auch auf sehr kleinen Smartphones verstecken um maximalen Platz zu schaffen
    }

    .karussell-steuerung {
      bottom: 10%; // Weiter nach unten

      button {
        width: 38px;
        height: 38px;

        .chevron-icon {
          width: 18px;
          height: 18px;
        }
      }
    }

    .karussell-indikatoren {
      bottom: 18%; // Angepasst an neue Button-Position
      gap: 8px;

      button {
        width: 8px;
        height: 8px;
      }
    }
  }
}

@media (max-width: 1300px) {
  .info-text, .beschreibung {
    display: none;
  }

}
</style>