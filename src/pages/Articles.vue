<!-- src/pages/Articles.vue -->
<template>
  <div class="articles-page container">
    <h1>Unsere Artikel</h1>
    <p class="subtitle">Hier findest du hilfreiche Informationen und Tipps für den Familienalltag</p>
    
    <div class="articles-grid">
      <!-- Platzhalter für Artikel -->
      <div v-for="article in articles" :key="article.id" class="article-card">
        <div class="article-image-container">
          <div class="article-image-placeholder"></div>
        </div>
        <div class="article-content">
          <h2>{{ article.title }}</h2>
          <p class="article-meta">{{ article.date }} | {{ article.category }}</p>
          <p class="article-excerpt">{{ article.excerpt }}</p>
          <router-link :to="`/articles/${article.id}`" class="read-more">Weiterlesen</router-link>
        </div>
      </div>
    </div>
    
    <div class="coming-soon-message">
      <h2>Demnächst mehr Artikel!</h2>
      <p>Wir arbeiten fleißig daran, dir noch mehr hilfreiche Inhalte zur Verfügung zu stellen.</p>
      <p>Schau bald wieder vorbei oder abonniere unseren Newsletter, um keine neuen Artikel zu verpassen.</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'ArticlesPage',
  setup() {
    // Beispielhafte Artikeldaten
    const articles = ref([
      {
        id: 1,
        title: 'Umgang mit Trotzphasen bei Kleinkindern',
        date: '22. April 2025',
        category: 'Kleinkinder',
        excerpt: 'Erfahre, wie du mit Trotzphasen gelassen umgehen kannst und was in der kindlichen Entwicklung dahintersteckt.'
      },
      {
        id: 2,
        title: 'Gesunde Ernährung für die ganze Familie',
        date: '15. April 2025',
        category: 'Gesundheit',
        excerpt: 'Tipps und Tricks für eine ausgewogene Ernährung, die nicht nur gesund ist, sondern auch Kindern schmeckt.'
      },
      {
        id: 3,
        title: 'Wie du Grenzen setzen kannst, ohne zu schimpfen',
        date: '8. April 2025',
        category: 'Erziehung',
        excerpt: 'Positive Erziehungsstrategien, die Kindern helfen, Regeln zu verstehen und einzuhalten.'
      }
    ]);
    
    return {
      articles
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

.articles-page {
  padding: map.get(vars.$spacing, xxxl) 0;
  
  h1 {
    font-size: 2.5rem;
    font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
    margin-bottom: map.get(vars.$spacing, m);
    @include animations.fade-in(0.8s, 0.2s);
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
      }
    }
  }
  
  .subtitle {
    font-size: map.get(map.get(vars.$fonts, sizes), large);
    margin-bottom: map.get(vars.$spacing, xxl);
    @include animations.fade-in(0.8s, 0.3s);
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
      }
    }
  }
  
  .articles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: map.get(vars.$spacing, xl);
    margin-bottom: map.get(vars.$spacing, xxxl);
  }
  
  .article-card {
    @include animations.fade-in(0.8s);
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        border-radius: map.get(map.get(vars.$layout, border-radius), large);
        overflow: hidden;
        @include mixins.shadow('medium', $theme);
        transition: transform map.get(vars.$transitions, default), 
                   box-shadow map.get(vars.$transitions, default);
        
        &:hover {
          transform: translateY(-8px);
          @include mixins.glow('green', 'medium', $theme);
        }
      }
    }
    
    .article-image-container {
      height: 180px;
      overflow: hidden;
      
      .article-image-placeholder {
        width: 100%;
        height: 100%;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: linear-gradient(45deg, 
              mixins.theme-color($theme, secondary-bg),
              mixins.theme-color($theme, nav-item-bg));
          }
        }
      }
    }
    
    .article-content {
      padding: map.get(vars.$spacing, l);
      
      h2 {
        font-size: map.get(map.get(vars.$fonts, sizes), large);
        margin-bottom: map.get(vars.$spacing, s);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }
      
      .article-meta {
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        margin-bottom: map.get(vars.$spacing, m);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-tertiary);
          }
        }
      }
      
      .article-excerpt {
        font-size: map.get(map.get(vars.$fonts, sizes), medium);
        margin-bottom: map.get(vars.$spacing, m);
        line-height: 1.6;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }
      
      .read-more {
        display: inline-block;
        text-decoration: none;
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        position: relative;
        
        &::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -2px;
          left: 0;
          transition: width map.get(vars.$transitions, default);
        }
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, accent-green);
            
            &:hover {
              color: mixins.theme-color($theme, accent-teal);
            }
            
            &::after {
              background-color: mixins.theme-color($theme, accent-teal);
            }
            
            &:hover::after {
              width: 100%;
            }
          }
        }
      }
    }
  }
  
  .coming-soon-message {
    text-align: center;
    padding: map.get(vars.$spacing, xxl) map.get(vars.$spacing, xl);
    max-width: 800px;
    margin: 0 auto;
    @include animations.fade-in(0.8s, 0.5s);
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, secondary-bg);
        border-radius: map.get(map.get(vars.$layout, border-radius), large);
        border: 2px solid mixins.theme-color($theme, border-light);
      }
    }
    
    h2 {
      font-size: map.get(map.get(vars.$fonts, sizes), xl);
      margin-bottom: map.get(vars.$spacing, l);
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }
    
    p {
      font-size: map.get(map.get(vars.$fonts, sizes), medium);
      margin-bottom: map.get(vars.$spacing, m);
      line-height: 1.6;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }
}

@media (max-width: map.get(map.get(vars.$layout, breakpoints), tablet)) {
  .articles-page {
    .articles-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>