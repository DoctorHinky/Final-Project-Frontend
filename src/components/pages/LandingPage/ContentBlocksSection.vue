<template>
  <section class="section content-blocks-section" id="content">
    <h2>Was ist das?</h2>
    
    <div class="content-blocks">
      <div class="content-block">
        <h3>Für Eltern</h3>
        <p>Eine Sammlung an Texten, die dir helfen, dein Kind besser zu verstehen</p>
        <p>Hilfestellungen, wie du deinem Kind bei verschiedenen Herausforderungen helfen kannst</p>
        <p>Eine Community für den Austausch mit anderen Eltern, die ähnliche Erfahrungen machen</p>
      </div>
      
      <div class="content-block">
        <h3>Kinder</h3>
        <p>Alles, was du über Gefühle, Freundschaften und die große Welt wissen möchtest</p>
        <p>Lustige Geschichten, die dir helfen, dich und andere besser zu verstehen</p>
        <p>Spannende Erklärungen zu den Dingen, die dich neugierig machen</p>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ContentBlocksSection'
});
</script>

<style lang="scss">
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

.content-blocks-section {
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
  
  .content-blocks {
    @include mixins.flex(row, space-between, stretch, wrap);
    gap: map-get(vars.$spacing, xxl);
    margin-top: map-get(vars.$spacing, xxl);
    
    @include mixins.responsive('tablet') {
      flex-direction: column;
    }
    
    .content-block {
      flex: 1;
      position: relative;
      overflow: hidden;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          padding: map-get(vars.$spacing, xl);
          border-radius: map-get(map-get(vars.$layout, border-radius), large);
          border: 2px solid mixins.theme-color($theme, border-light);
          @include mixins.shadow('medium', $theme);
        }
      }
      
      &:nth-child(1) {
        transform: rotate(-2deg);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            border-top: 4px solid mixins.theme-color($theme, accent-green);
          }
        }
      }
      
      &:nth-child(2) {
        transform: rotate(2deg);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            border-top: 4px solid mixins.theme-color($theme, accent-teal);
          }
        }
      }
      
      &:nth-child(1):hover {
        transform: rotate(0deg) translateY(-10px);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            @include mixins.glow('green', 'large', $theme);
            border-color: mixins.theme-color($theme, accent-green);
          }
        }
      }
      
      &:nth-child(2):hover {
        transform: rotate(0deg) translateY(-10px);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            @include mixins.glow('teal', 'large', $theme);
            border-color: mixins.theme-color($theme, accent-teal);
          }
        }
      }
      
      h3 {
        font-size: map-get(map-get(vars.$fonts, sizes), xl);
        margin-bottom: map-get(vars.$spacing, m);
        position: relative;
        display: inline-block;
        
        &::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 3px;
          bottom: -5px;
          left: 0;
          border-radius: 3px;
        }
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }
      
      &:nth-child(1) h3::after {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: mixins.theme-color($theme, accent-green);
          }
        }
      }
      
      &:nth-child(2) h3::after {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: mixins.theme-color($theme, accent-teal);
          }
        }
      }
      
      p {
        font-size: map-get(map-get(vars.$fonts, sizes), medium);
        margin-bottom: map-get(vars.$spacing, l);
        line-height: 1.8;
      }
    }
  }
}
</style>