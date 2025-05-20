<template>
  <section class="section content-blocks-section" id="content" :class="{'animate': isVisible}">
    <h2 class="title">Was ist das?</h2>

    <div class="content-blocks">
      <div class="content-block parents" :class="{'animate': isVisible}">
        <div class="content-block-inner">
          <div class="icon-wrapper">
            <span class="icon">👪</span>
          </div>
          <h3>Für Eltern</h3>
          <div class="divider"></div>
          <ul class="feature-list">
            <li>
              <span class="bullet"></span>
              <span>Eine Sammlung an Texten, die dir helfen, dein Kind besser zu verstehen</span>
            </li>
            <li>
              <span class="bullet"></span>
              <span>Hilfestellungen, wie du deinem Kind bei verschiedenen Herausforderungen helfen kannst</span>
            </li>
            <li>
              <span class="bullet"></span>
              <span>Eine Community für den Austausch mit anderen Eltern, die ähnliche Erfahrungen machen</span>
            </li>
          </ul>
          <div class="corner-decoration"></div>
        </div>
      </div>

      <div class="content-block children" :class="{'animate': isVisible}">
        <div class="content-block-inner">
          <div class="icon-wrapper">
            <span class="icon">🧒</span>
          </div>
          <h3>Kinder</h3>
          <div class="divider"></div>
          <ul class="feature-list">
            <li>
              <span class="bullet"></span>
              <span>Alles, was du über Gefühle, Freundschaften und die große Welt wissen möchtest</span>
            </li>
            <li>
              <span class="bullet"></span>
              <span>Lustige Geschichten, die dir helfen, dich und andere besser zu verstehen</span>
            </li>
            <li>
              <span class="bullet"></span>
              <span>Spannende Erklärungen zu den Dingen, die dich neugierig machen</span>
            </li>
          </ul>
          <div class="corner-decoration"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'ContentBlocksSection',
  data() {
    return {
      isVisible: false,
      observer: null
    }
  },
  mounted() {
    // Intersection Observer für das "Einblenden beim Scrollen"-Effekt
    this.observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        this.isVisible = true;
        this.observer.disconnect();
      }
    }, {
      threshold: 0.2
    });
    
    this.observer.observe(this.$el);
  },
  beforeUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
</script>

<style lang="scss">
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use 'sass:map';

.content-blocks-section {
  padding: 4rem 0;
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s ease, transform 0.8s ease;
  
  &.animate {
    opacity: 1;
    transform: translateY(0);
  }

  .title {
    font-size: map.get(map.get(vars.$fonts, sizes), xxxl);
    font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
    text-align: center;
    margin-bottom: 2rem;
    position: relative;
    display: inline-block;
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background: linear-gradient(
          90deg, 
          mixins.theme-color($theme, accent-green) 0%, 
          mixins.theme-color($theme, accent-teal) 100%
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-fill-color: transparent;
      }
    }
    
    &::after {
      content: '';
      position: absolute;
      width: 60px;
      height: 4px;
      bottom: -15px;
      left: 50%;
      transform: translateX(-50%);
      border-radius: 4px;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: linear-gradient(
            90deg, 
            mixins.theme-color($theme, accent-green) 0%, 
            mixins.theme-color($theme, accent-teal) 100%
          );
        }
      }
    }
  }

  .content-blocks {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2.5rem;
    margin-top: 4rem;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .content-block {
    border-radius: 16px;
    overflow: hidden;
    position: relative;
    transform: translateY(60px);
    opacity: 0;
    transition: transform 0.6s ease, opacity 0.6s ease, box-shadow 0.3s ease;
    
    &.animate {
      transform: translateY(0);
      opacity: 1;
    }
    
    &.parents {
      transition-delay: 0.2s;
    }
    
    &.children {
      transition-delay: 0.4s;
    }
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background: mixins.theme-color($theme, secondary-bg);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
      }
    }
    
    &:hover {
      transform: translateY(-10px) !important;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
        }
      }
      
      .icon-wrapper {
        transform: scale(1.1) rotate(5deg);
      }
      
      .corner-decoration {
        transform: scale(1.2);
      }
    }
    
    .content-block-inner {
      padding: 2.5rem;
      position: relative;
      z-index: 1;
      overflow: hidden;
    }
    
    .icon-wrapper {
      width: 70px;
      height: 70px;
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
      transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      
      .icon {
        font-size: 2rem;
      }
    }
    
    &.parents .icon-wrapper {
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: linear-gradient(135deg, 
            mixins.theme-color($theme, accent-green) 0%, 
          );
          box-shadow: 0 10px 20px rgba(mixins.theme-color($theme, accent-green), 0.3);
        }
      }
    }
    
    &.children .icon-wrapper {
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: linear-gradient(135deg, 
            mixins.theme-color($theme, accent-teal) 0%, 
          );
          box-shadow: 0 10px 20px rgba(mixins.theme-color($theme, accent-teal), 0.3);
        }
      }
    }
    
    h3 {
      font-size: 1.6rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      position: relative;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }
    
    .divider {
      width: 40px;
      height: 3px;
      border-radius: 3px;
      margin-bottom: 1.5rem;
      
      &.parents {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: mixins.theme-color($theme, accent-green);
          }
        }
      }
      
      &.children {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: mixins.theme-color($theme, accent-teal);
          }
        }
      }
    }
    
    &.parents .divider {
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: mixins.theme-color($theme, accent-green);
        }
      }
    }
    
    &.children .divider {
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: mixins.theme-color($theme, accent-teal);
        }
      }
    }
    
    .feature-list {
      list-style: none;
      padding: 0;
      margin: 0;
      
      li {
        display: flex;
        align-items: flex-start;
        margin-bottom: 1.2rem;
        line-height: 1.6;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .bullet {
          flex-shrink: 0;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 8px;
          margin-right: 15px;
        }
      }
    }
    
    &.parents .feature-list .bullet {
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: mixins.theme-color($theme, accent-green);
        }
      }
    }
    
    &.children .feature-list .bullet {
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: mixins.theme-color($theme, accent-teal);
        }
      }
    }
    
    .corner-decoration {
      position: absolute;
      bottom: -30px;
      right: -30px;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      opacity: 0.1;
      z-index: 0;
      transition: transform 0.5s ease;
    }
    
    &.parents .corner-decoration {
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: mixins.theme-color($theme, accent-green);
        }
      }
    }
    
    &.children .corner-decoration {
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: mixins.theme-color($theme, accent-teal);
        }
      }
    }
  }
}
</style>