<template>
  <section class="section community-section">
    <h2>Community</h2>
    
    <div class="community-content">
      <p>Kein Projekt von dieser Größe kann allein stehen und die beste geteilte Weisheit ist die, die durch Erfahrung gewachsen ist. Darum laden wir alle ein, sich hier einzubringen!</p>
      <p>Gemeinsam mit Pädagogen und Familientherapeuten sorgen wir dafür, dass unsere Inhalte geprüft und hilfreich zu lesen sind. Deine Beiträge tragen dazu bei, dass auch andere von diesen Erfahrungen profitieren können.</p>
      <p>Wir stärken nur Inhalte und nicht institutionelle Bindungen. Freiheit und Selbstbestimmung stehen für uns an erster Stelle.</p>
    </div>
    
    <div class="community-profiles">
      <div class="profile">
        <div class="profile-icon">👨‍👩‍👧</div>
        <h3>Neu (Kleinkinder)</h3>
        <p>Erste Schritte in der Erziehung</p>
      </div>
      
      <div class="profile">
        <div class="profile-icon">👨‍👩‍👦</div>
        <h3>Erfahren</h3>
        <p>Ratschläge für die mittlere Kindheit</p>
      </div>
      
      <div class="profile">
        <div class="profile-icon">👨‍👩‍👧‍👦</div>
        <h3>Profi (Jugendliche)</h3>
        <p>Umgang mit heranwachsenden Kindern</p>
      </div>
      
      <div class="profile">
        <div class="profile-icon">👨‍👨‍👧‍👧</div>
        <h3>Experten</h3>
        <p>Pädagogen und Familientherapeuten</p>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'CommunitySection'
});
</script>

<style lang="scss">
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

.community-section {
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
  
  .community-content {
    margin-bottom: map-get(vars.$spacing, xxl);
    
    p {
      font-size: map-get(map-get(vars.$fonts, sizes), medium);
      margin-bottom: map-get(vars.$spacing, l);
      line-height: 1.8;
    }
  }
  
  .community-profiles {
    @include mixins.flex(row, space-between, stretch, wrap);
    gap: map-get(vars.$spacing, l);
    
    @include mixins.responsive('tablet') {
      flex-direction: column;
    }
    
    .profile {
      flex: 1;
      min-width: 200px;
      text-align: center;
      position: relative;
      overflow: hidden;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          padding: map-get(vars.$spacing, xl);
          border-radius: map-get(map-get(vars.$layout, border-radius), large);
          border: 2px solid mixins.theme-color($theme, border-light);
          @include mixins.shadow('medium', $theme);
          
          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            
            @if $theme == 'dark' {
              background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), transparent);
            } @else {
              background: linear-gradient(135deg, rgba(255, 255, 255, 0.5), transparent);
            }
          }
          
          &:hover {
            transform: translateY(-8px) scale(1.05);
            @include mixins.glow('green', 'medium', $theme);
            border-color: mixins.theme-color($theme, accent-green);
          }
        }
      }
      
      .profile-icon {
        position: relative;
        z-index: 1;
        margin: 0 auto map-get(vars.$spacing, l);
        @include animations.pulse;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            @include mixins.icon-container($theme, 'medium', 'primary');
          }
        }
      }
      
      @for $i from 1 through 4 {
        &:nth-child(#{$i}) .profile-icon {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              @if $i == 1 {
                background: linear-gradient(135deg, mixins.theme-color($theme, accent-green), mixins.theme-color($theme, accent-lime));
                box-shadow: 0 5px 15px mixins.theme-color($theme, glow-green);
              } @else if $i == 2 {
                background: linear-gradient(135deg, mixins.theme-color($theme, accent-teal), mixins.theme-color($theme, accent-lime));
                box-shadow: 0 5px 15px mixins.theme-color($theme, glow-teal);
                animation-delay: 0.5s;
              } @else if $i == 3 {
                background: linear-gradient(135deg, mixins.theme-color($theme, accent-green), mixins.theme-color($theme, accent-teal));
                box-shadow: 0 5px 15px mixins.theme-color($theme, glow-green);
                animation-delay: 1s;
              } @else if $i == 4 {
                background: linear-gradient(135deg, mixins.theme-color($theme, accent-yellow), mixins.theme-color($theme, accent-lime));
                box-shadow: 0 5px 15px rgba(mixins.theme-color($theme, accent-yellow), 0.4);
                animation-delay: 1.5s;
              }
            }
          }
        }
      }
      
      h3 {
        font-size: map-get(map-get(vars.$fonts, sizes), large);
        margin-bottom: map-get(vars.$spacing, s);
        position: relative;
        z-index: 1;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }
      
      p {
        font-size: map-get(map-get(vars.$fonts, sizes), small);
        position: relative;
        z-index: 1;
        margin-bottom: 0;
        
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