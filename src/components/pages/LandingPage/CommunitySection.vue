<template>
  <section class="section kommentar-karussell-section" id="kommentare" ref="sectionRef">
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
        titel: "Fantastische Unterstützung für Eltern",
        text: "Die Artikel über Trotzphasen haben mir geholfen, die Entwicklung meines zweijährigen Sohnes besser zu verstehen. Ich reagiere jetzt viel gelassener auf schwierige Situationen und fühle mich als Mutter viel sicherer.",
        autor: "Familie Müller - Eltern eines 2-jährigen Kindes",
        sterne: 5,
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b647?w=150&h=150&fit=crop&crop=face"
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

    const naechste = async () => {
      if (isAnimating.value) return;
      
      isAnimating.value = true;
      aktuellerIndex.value = (aktuellerIndex.value + 1) % gesamtAnzahl.value;
      
      await nextTick();
      setTimeout(() => {
        isAnimating.value = false;
      }, 0);
    };

    const vorherige = async () => {
      if (isAnimating.value) return;
      
      isAnimating.value = true;
      aktuellerIndex.value = (aktuellerIndex.value - 1 + gesamtAnzahl.value) % gesamtAnzahl.value;
      
      await nextTick();
      setTimeout(() => {
        isAnimating.value = false;
      }, 0);
    };

    const geheZuIndex = async (index: number) => {
      if (isAnimating.value || index === aktuellerIndex.value) return;
      
      isAnimating.value = true;
      aktuellerIndex.value = index;
      
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
  min-height: 100vh;
  padding: map.get(vars.$spacing, xxxl) 0;
  position: relative;
  overflow: hidden;
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
    overflow: hidden;
    position: relative;
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

    .beschreibung {
      width: 20%;
      font-size: 2.1em;
      margin-bottom: 10px;
      font-weight: 700;
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
      .titel {
        font-size: 1.35em;
        margin-bottom: 8px;
        font-weight: 600;
        letter-spacing: 0.02em;

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
    bottom: 5%;
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
    bottom: 15%;
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

  // Responsive Design
  @media (max-width: map.get(map.get(vars.$layout, breakpoints), desktop)) {
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

  @media (max-width: map.get(map.get(vars.$layout, breakpoints), mobile)) {
    .container {
      height: 80vh;
    }

    .kommentar-karte {
      &.kommentar-karte-1 {
        top: 25% !important;
      }

      &.kommentar-karte-2 {
        top: 20% !important;
      }

      &.kommentar-karte-3 {
        top: 15% !important;
      }

      .avatar-logo {
        width: 60px;
        height: 60px;
      }

      .kommentar {
        .titel {
          font-size: 1.1em;
        }

        .kommentar-text {
          font-size: 0.95em;
        }
      }
    }

    .informationen {
      top: 10% !important;
      left: 50% !important;

      .beschreibung {
        font-size: 1.5em !important;
        width: 100% !important;
        text-align: center;
      }

      .info-text {
        font-size: 1em !important;
        width: 100% !important;
        text-align: center;
      }
    }
  }
}
</style>