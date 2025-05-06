<template>
  <section class="section hero-section">
    <h2>Die Idee</h2>
    <div class="hero-content">
      <p>Immer wieder stellen sich Eltern dieselbe Frage: "Mache ich alles richtig?" oder: "Warum verhält sich mein Kind so?"</p>
      <p>Der Alltag von Eltern ist oft geprägt von Stress, Unsicherheit und Überforderung.</p>
      <p>Wir von <span class="highlighted">Eltern und Kind</span> haben es uns zur Aufgabe gemacht, Eltern und Kindern zu guten Zeiten zu begleiten und ebenso bei den schwierigen und großen Fragen des Lebens.</p>
      <p>In enger Zusammenarbeit mit Pädagogen und Bildungseinrichtungen entwickeln wir eine stetig wachsende Bibliothek. Sie bietet:</p>
      
      <ul>
        <li>Wissenschaftlich fundierte Inhalte für Eltern zu Themen wie Entwicklung, Erziehung, Beziehung und Kommunikation</li>
        <li>Kindgerecht formulierte Artikel, Geschichten und Erklärungen, die Kindern helfen, ihre Welt besser zu verstehen</li>
      </ul>
      
      <p>Ob frühkindliche Trotz, Pubertät oder die ersten Erfahrungen mit Konflikten, unsere Plattform bietet Orientierung und stärkt die Verbindung zwischen Eltern und Kindern.</p>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'HeroSection'
});
</script>

<style lang="scss">
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

.hero-section {
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
  
  p {
    font-size: map-get(map-get(vars.$fonts, sizes), medium);
    margin-bottom: map-get(vars.$spacing, l);
    line-height: 1.8;
  }
  
  .highlighted {
    font-weight: map-get(map-get(vars.$fonts, weights), extra-bold);
    position: relative;
    display: inline-block;
    padding: 0 4px;
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, accent-green);
        
        &::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 30%;
          bottom: 0;
          left: 0;
          background-color: rgba(mixins.theme-color($theme, accent-green), 0.15);
          z-index: -1;
          border-radius: 4px;
        }
      }
    }
  }
  
  ul {
    margin-left: map-get(vars.$spacing, xxl);
    margin-bottom: map-get(vars.$spacing, l);
    
    li {
      margin-bottom: map-get(vars.$spacing, s);
      position: relative;
      
      &::before {
        content: '🌿';
        position: absolute;
        left: -1.8rem;
        top: 0.2rem;
      }
    }
  }
}
</style>