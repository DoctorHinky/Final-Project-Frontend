<template>
  <section class="section quiz-section" id="quiz">
    <h2>Quiz</h2>
    
    <div class="quiz-container">
      <div class="quiz-question">
        <p>Kennst du dich auch nicht immer gut mit deinem Kind aus? Du bist nicht allein! Hier findest du hilfreiche Tipps und Ideen, was du tun kannst, wenn du mal nicht weiter weißt.<br>Probier doch mal unser Quiz aus und finde heraus, welcher Erziehungstyp du bist!</p>
      </div>
      
      <div class="quiz-question">
        <p>Weißt du, in welchen Phasen dein Kind natürlich schwieriger wird? Die berühmten Trotzphasen kommen mit:</p>
        <p class="options">
          a) ungefähr mit 2-3 Jahren<br>
          b) nur bei schlecht erzogenen Kindern<br>
          c) etwa mit 13-14 Jahren
        </p>
      </div>
      
      <div class="quiz-question">
        <p>Was war für dich die spannendste Artikelreihe? Lass uns wissen, was dir gefallen hat und wir erweitern unser Angebot für euch!</p>
      </div>
      
      <div class="quiz-question">
        <p>Du bist auf der Suche nach konkreten und positiven Hilfen für deinen Alltag mit Kind?</p>
        <p class="options">
          a) Ja, ich bin oft überfordert<br>
          b) Nur manchmal bei schwierigen Situationen<br>
          c) Nein, mir fällt immer eine gute Lösung ein
        </p>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'QuizSection'
});
</script>

<style lang="scss">
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

.quiz-section {
  @include animations.scroll-fade-in;
  
  h2 {
    font-size: map-get(map-get(vars.$fonts, sizes), xxxl);
    font-weight: map-get(map-get(vars.$fonts, weights), extra-bold);
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        @include mixins.section-header($theme);
      }
    }
  }
  
  .quiz-container {
    @include mixins.grid(1fr 1fr, auto, map-get(vars.$spacing, xl));
    margin-top: map-get(vars.$spacing, xxl);
    
    @include mixins.responsive('tablet') {
      grid-template-columns: 1fr;
    }
    
    .quiz-question {
      position: relative;
      /* Pseudo-Element für bessere Hover-Fläche */
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
      }
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          padding: map-get(vars.$spacing, xl);
          border-radius: map-get(map-get(vars.$layout, border-radius), large);
          border: 2px solid mixins.theme-color($theme, border-light);
          @include mixins.shadow('medium', $theme);
          transition: all 0.4s ease-out;
        }
      }
      
      /* Verzögerung beim Verlassen des Hover-Zustands */
      &:not(:hover) {
        transition-delay: 0.1s;
      }
      
      /* Direktionale Hover-Effekte für jede Karte */
      &:nth-child(1):hover {
        /* Oben links - nach oben links verschieben */
        transform: translate(-5px, -5px);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            @include mixins.glow('green', 'medium', $theme);
            border-color: mixins.theme-color($theme, accent-green);
          }
        }
      }
      
      &:nth-child(2):hover {
        /* Oben rechts - nach oben rechts verschieben */
        transform: translate(5px, -5px);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            @include mixins.glow('teal', 'medium', $theme);
            border-color: mixins.theme-color($theme, accent-teal);
          }
        }
      }
      
      &:nth-child(3):hover {
        /* Unten links - nach unten links verschieben */
        transform: translate(-5px, 5px);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            @include mixins.glow('lime', 'medium', $theme);
            border-color: mixins.theme-color($theme, accent-lime);
          }
        }
      }
      
      &:nth-child(4):hover {
        /* Unten rechts - nach unten rechts verschieben */
        transform: translate(5px, 5px);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            @include mixins.glow('yellow', 'medium', $theme);
            border-color: mixins.theme-color($theme, accent-yellow);
          }
        }
      }
      
      @for $i from 1 through 4 {
        &:nth-child(#{$i}) {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              @if $i == 1 {
                border-left: 4px solid mixins.theme-color($theme, accent-green);
              } @else if $i == 2 {
                border-left: 4px solid mixins.theme-color($theme, accent-teal);
              } @else if $i == 3 {
                border-left: 4px solid mixins.theme-color($theme, accent-lime);
              } @else if $i == 4 {
                border-left: 4px solid mixins.theme-color($theme, accent-yellow);
              }
            }
          }
        }
      }
      
      p {
        font-size: map-get(map-get(vars.$fonts, sizes), medium);
        margin-bottom: map-get(vars.$spacing, l);
        line-height: 1.8;
        position: relative;
        z-index: 2; /* Über dem Pseudo-Element */
        
        &:last-child {
          margin-bottom: 0;
        }
      }
      
      .options {
        font-size: map-get(map-get(vars.$fonts, sizes), base);
        position: relative;
        z-index: 2; /* Über dem Pseudo-Element */
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }
    }
  }
}
</style>