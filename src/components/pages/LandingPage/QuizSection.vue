<template>
  <section class="section quiz-section" id="quiz" :class="{'animate': isVisible}" ref="sectionRef">
    <h2>Quiz</h2>
    
    <div class="quiz-container">
      <div class="quiz-question">
        <div class="question-content intro">
          <p>Kennst du dich auch nicht immer gut mit deinem Kind aus? Du bist nicht allein! Hier findest du hilfreiche Tipps und Ideen, was du tun kannst, wenn du mal nicht weiter weißt.<br>Probier doch mal unser Quiz aus und finde heraus, welcher Erziehungstyp du bist!</p>
          <div class="decoration-element"></div>
        </div>
      </div>
      
      <div class="quiz-question">
        <div class="question-content">
          <p>Weißt du, in welchen Phasen dein Kind natürlich schwieriger wird? Die berühmten Trotzphasen kommen mit:</p>
          <div class="options-container">
            <p class="options">
              <span class="option-item"><span class="option-marker">a</span>ungefähr mit 2-3 Jahren</span>
              <span class="option-item"><span class="option-marker">b</span>nur bei schlecht erzogenen Kindern</span>
              <span class="option-item"><span class="option-marker">c</span>etwa mit 13-14 Jahren</span>
              <span class="option-item"><span class="option-marker">d</span>in regelmäßigen Abständen während der Entwicklung</span>
            </p>
          </div>
        </div>
      </div>
      
      <div class="quiz-question">
        <div class="question-content">
          <p>Was war für dich die spannendste Artikelreihe? Lass uns wissen, was dir gefallen hat und wir erweitern unser Angebot für euch!</p>
          <div class="options-container">
            <p class="options">
              <span class="option-item"><span class="option-marker">a</span>Kommunikation mit Kindern</span>
              <span class="option-item"><span class="option-marker">b</span>Umgang mit schwierigen Phasen</span>
              <span class="option-item"><span class="option-marker">c</span>Förderung von Selbstständigkeit</span>
              <span class="option-item"><span class="option-marker">d</span>Gesunde Entwicklung unterstützen</span>
            </p>
          </div>
        </div>
      </div>
      
      <div class="quiz-question">
        <div class="question-content">
          <p>Du bist auf der Suche nach konkreten und positiven Hilfen für deinen Alltag mit Kind?</p>
          <div class="options-container">
            <p class="options">
              <span class="option-item"><span class="option-marker">a</span>Ja, ich bin oft überfordert</span>
              <span class="option-item"><span class="option-marker">b</span>Nur manchmal bei schwierigen Situationen</span>
              <span class="option-item"><span class="option-marker">c</span>Nein, mir fällt immer eine gute Lösung ein</span>
              <span class="option-item"><span class="option-marker">d</span>Ich suche eher nach Austausch mit anderen Eltern</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';

export default defineComponent({
  name: 'QuizSection',
  setup() {
    const isVisible = ref(false);
    const sectionRef = ref<HTMLElement | null>(null);

    onMounted(() => {
      if (sectionRef.value) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            isVisible.value = entry.isIntersecting;
          },
          { threshold: 0.1 }
        );
        observer.observe(sectionRef.value);
      }
    });

    return {
      isVisible,
      sectionRef
    };
  }
});
</script>

<style lang="scss">
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use 'sass:map';
@use '@/style/base/animations' as animations;

.quiz-section {
  @include animations.scroll-fade-in;
  
  h2 {
    font-size: map.get(map.get(vars.$fonts, sizes), xxxl);
    font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        @include mixins.section-header($theme);
      }
    }
  }
  
  .quiz-container {
    @include mixins.grid(1fr 1fr, auto, map.get(vars.$spacing, xl));
    margin-top: map.get(vars.$spacing, xxl);
    
    @include mixins.responsive('tablet') {
      grid-template-columns: 1fr;
    }
    
    .quiz-question {
      position: relative;
      overflow: hidden;
      
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
          border-radius: map.get(map.get(vars.$layout, border-radius), large);
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
      
      /* Hier beginnt das neue, modernere Styling für den inneren Bereich */
      .question-content {
        position: relative;
        padding: map.get(vars.$spacing, xl);
        z-index: 2;
        height: 100%;
        display: flex;
        flex-direction: column;
        
        &.intro {
          text-align: center;
          justify-content: center;
          
          .decoration-element {
            position: absolute;
            bottom: -10px;
            right: -10px;
            width: 100px;
            height: 100px;
            border-radius: 50%;
            opacity: 0.1;
            z-index: 0;
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background: linear-gradient(
                  135deg,
                  mixins.theme-color($theme, accent-green) 0%,
                  mixins.theme-color($theme, accent-teal) 100%
                );
              }
            }
          }
        }
        
        p {
          font-size: map.get(map.get(vars.$fonts, sizes), medium);
          margin-bottom: map.get(vars.$spacing, l);
          line-height: 1.8;
          position: relative;
          
          &:last-child {
            margin-bottom: 0;
          }
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }
        
        .options-container {
          margin-top: auto;
          position: relative;
          border-radius: 12px;
          padding: 1.2rem;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background: rgba(mixins.theme-color($theme, border-light), 0.3);
            }
          }
          
          .options {
            font-size: map.get(map.get(vars.$fonts, sizes), base);
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 0.85rem;
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-secondary);
              }
            }
            
            .option-item {
              display: flex;
              align-items: flex-start;
              line-height: 1.4;
              transition: transform 0.2s ease;
              
              &:hover {
                transform: translateX(5px);
              }
              
              .option-marker {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                margin-right: 10px;
                flex-shrink: 0;
                font-weight: 600;
                font-size: 0.85rem;
                
                @each $theme in ('light', 'dark') {
                  .theme-#{$theme} & {
                    background: rgba(mixins.theme-color($theme, accent-teal), 0.15);
                    color: mixins.theme-color($theme, accent-teal);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>