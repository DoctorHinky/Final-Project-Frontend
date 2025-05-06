<template>
  <section class="section subscription-section" id="sub">
    <h2>Mehr dazu erfahren</h2>
    
    <div class="subscription">
      <div class="subscription-info">
        <p>Melde dich für den Newsletter an und erhalte regelmäßig neue Artikel und Informationen zu für dich relevanten Themen.</p>
        <p v-html="bulletPoints"></p>
      </div>
      
      <div class="form-container">
        <div class="form-group">
          <label for="name">Vorname</label>
          <input type="text" id="name" placeholder="Dein Name">
        </div>
        
        <div class="form-group">
          <label for="email">E-Mail</label>
          <input type="email" id="email" placeholder="Deine E-Mail">
        </div>
        
        <div class="form-group">
          <label for="age">Alter der Kinder</label>
          <select id="age">
            <option value="">Bitte wählen</option>
            <option value="0-3">0-3 Jahre</option>
            <option value="4-6">4-6 Jahre</option>
            <option value="7-12">7-12 Jahre</option>
            <option value="13+">13+ Jahre</option>
          </select>
        </div>
        
        <button class="btn">Anmelden</button>
      </div>
    </div>
    
    <p class="footnote">* Deine Daten werden vertraulich und ausschließlich für die Zusendung des Newsletters verwendet. Du kannst dich jederzeit mit einem Klick einfach abmelden, wenn diese gegen die Bedingungen verstoßen.</p>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SubscriptionSection',
  setup() {
    const bulletPoints = '• Zweimal im Monat neue Inhalte<br>• Kostenlos und jederzeit kündbar<br>• Du bleibst immer auf dem neuesten Stand';
    
    return {
      bulletPoints
    };
  }
});
</script>

<style lang="scss">
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

.subscription-section {
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
  
  .subscription {
    @include mixins.grid(1fr 1fr, auto, map-get(vars.$spacing, xxl));
    margin-top: map-get(vars.$spacing, xxl);
    
    @include mixins.responsive('tablet') {
      grid-template-columns: 1fr;
    }
    
    .subscription-info, .form-container {
      position: relative;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          padding: map-get(vars.$spacing, xl);
          border-radius: map-get(map-get(vars.$layout, border-radius), large);
          border: 2px solid mixins.theme-color($theme, border-light);
          @include mixins.shadow('medium', $theme);
          transition: all map-get(vars.$transitions, default);
        }
      }
      
      &:hover {
        transform: translateY(-5px);
      }
    }
    
    .subscription-info:hover {
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          @include mixins.glow('green', 'medium', $theme);
          border-color: mixins.theme-color($theme, accent-green);
        }
      }
    }
    
    .form-container:hover {
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          @include mixins.glow('teal', 'medium', $theme);
          border-color: mixins.theme-color($theme, accent-teal);
        }
      }
    }
    
    p {
      font-size: map-get(map-get(vars.$fonts, sizes), medium);
      margin-bottom: map-get(vars.$spacing, l);
      line-height: 1.8;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  // Formular-Elemente
  .form-group {
    margin-bottom: map-get(vars.$spacing, l);
    
    label {
      display: block;
      margin-bottom: map-get(vars.$spacing, s);
      font-weight: map-get(map-get(vars.$fonts, weights), bold);
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
    
    input, select {
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          @include mixins.form-element($theme);
        }
      }
    }
  }
  
  // Button
  .btn {
    display: inline-block;
    margin-top: map-get(vars.$spacing, m);
    @include animations.shine-effect;
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        @include mixins.button-style($theme, 'medium', true);
      }
    }
  }
  
  // Footnote
  .footnote {
    font-size: map-get(map-get(vars.$fonts, sizes), small);
    margin-top: map-get(vars.$spacing, xxl);
    text-align: center;
    line-height: 1.6;
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-tertiary);
      }
    }
  }
}
</style>