<template>
  <section class="section authors-section" id="Authors">
    <h2>Unsere Autoren</h2>
    <div class="authors">
      <div v-for="author in authors" :key="author.id" class="author-card">
        <div class="author-image-container">
          <img :src="author.image" :alt="author.name" class="author-image" />
        </div>
        <h3>{{ author.name }}</h3>
        <p>{{ author.bio }}</p>
        <div class="author-specialties">
          <span v-for="(specialty, index) in author.specialties" :key="index" class="specialty-tag">
            {{ specialty }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
// Direkte Importe der Bilder
import authorIcon1 from '@/assets/images/AuthorIcon1.jpg';

export default defineComponent({
  name: 'AuthorsSection',
  setup() {
    const authors = [
      {
        id: 1,
        name: 'Max Mustermann',
        image: authorIcon1,
        bio: 'Max ist ein erfahrener Autor mit einem Fokus auf Bildung und Erziehung.',
        specialties: ['Erziehungsratgeber', 'Lernmethoden']
      },
      {
        id: 2,
        name: 'Anna Beispiel',
        image: authorIcon1,
        bio: 'Anna schreibt leidenschaftlich über kreative Lernmethoden für Kinder.',
        specialties: ['Kreative Pädagogik', 'Montessori']
      },
      {
        id: 3,
        name: 'John Doe',
        image: authorIcon1,
        bio: 'John ist Experte für digitale Bildung und innovative Technologien.',
        specialties: ['Digitale Bildung', 'Medienkompetenzen']
      }
    ];
    
    return {
      authors
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

.authors-section {
  @include animations.scroll-fade-in;
  
  h2 {
    font-size: map.get(map.get(vars.$fonts, sizes), xxxl);
    font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
    text-align: center;
    margin-bottom: map.get(vars.$spacing, xxl);
    position: relative;
    display: inline-block;
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        @include mixins.section-header($theme);
      }
    }
  }
  
  .authors {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: map.get(vars.$spacing, xl);
    
    .author-card {
      @include animations.fade-in(0.8s);
      text-align: center;
      position: relative;
      overflow: hidden;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          padding: map.get(vars.$spacing, xl);
          border-radius: map.get(map.get(vars.$layout, border-radius), large);
          border: 2px solid mixins.theme-color($theme, border-light);
          @include mixins.shadow('medium', $theme);
          transition: transform map.get(vars.$transitions, default), 
                     box-shadow map.get(vars.$transitions, default),
                     border-color map.get(vars.$transitions, default);
          
          &:hover {
            transform: translateY(-8px) scale(1.02);
            @include mixins.glow('green', 'medium', $theme);
            border-color: mixins.theme-color($theme, accent-green);
          }
        }
      }
      
      .author-image-container {
        width: 120px;
        height: 120px;
        margin: 0 auto map.get(vars.$spacing, l);
        border-radius: 50%;
        overflow: hidden;
        position: relative;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            border: 3px solid mixins.theme-color($theme, accent-green);
            @include mixins.glow('green', 'small', $theme);
          }
        }
        
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          opacity: 0;
          transition: opacity map.get(vars.$transitions, default);
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background: radial-gradient(circle, transparent 65%, mixins.theme-color($theme, accent-green) 100%);
            }
          }
        }
      }
      
      &:hover .author-image-container::before {
        opacity: 0.6;
      }
      
      .author-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
        transition: transform map.get(vars.$transitions, default);
        transform: scale(1.5);
      }
      
      &:hover .author-image {
        transform: scale(1.1);
      }
      
      h3 {
        font-size: map.get(map.get(vars.$fonts, sizes), large);
        margin-bottom: map.get(vars.$spacing, s);
        position: relative;
        display: inline-block;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
            
            &::after {
              content: '';
              position: absolute;
              width: 0;
              height: 2px;
              bottom: -4px;
              left: 50%;
              transform: translateX(-50%);
              background: mixins.theme-gradient($theme, primary);
              transition: width map.get(vars.$transitions, default);
              border-radius: 2px;
            }
          }
        }
      }
      
      &:hover h3::after {
        width: 80%;
      }
      
      p {
        font-size: map.get(map.get(vars.$fonts, sizes), medium);
        line-height: 1.6;
        margin-bottom: map.get(vars.$spacing, l);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }
      
      .author-specialties {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: map.get(vars.$spacing, xs);
        margin-top: map.get(vars.$spacing, m);
        
        .specialty-tag {
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          padding: map.get(vars.$spacing, xxs) map.get(vars.$spacing, s);
          border-radius: map.get(map.get(vars.$layout, border-radius), pill);
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: rgba(mixins.theme-color($theme, accent-teal), 0.15);
              color: mixins.theme-color($theme, accent-teal);
              border: 1px solid rgba(mixins.theme-color($theme, accent-teal), 0.3);
            }
          }
        }
      }
    }
  }
}

@media (max-width: map.get(map.get(vars.$layout, breakpoints), tablet)) {
  .authors-section {
    .authors {
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    }
  }
}

@media (max-width: map.get(map.get(vars.$layout, breakpoints), mobile)) {
  .authors-section {
    .authors {
      grid-template-columns: 1fr;
    }
  }
}
</style>