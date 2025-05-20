<!-- src/pages/member/dashboard/CreateArticle.vue -->
<template>
  <div class="create-article-page">
    <h1 class="page-title">Artikel erstellen und verwalten</h1>
    <p class="page-description">
      Erstellen Sie detaillierte Artikel mit mehrstufigem Inhalt, Bildern und interaktiven Quizfragen
    </p>
    
    <!-- Hier wird der Artikel-Editor eingebunden -->
    <ArticleEditor />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ArticleEditor } from '@/components/pages/DashboardPages/CreateArticle';
import { authorService } from '@/services/author.service';

export default defineComponent({
  name: 'CreateArticlePage',
  components: {
    ArticleEditor
  },
  setup() {
    // Diese Seite leitet direkt an die ArticleEditor-Komponente weiter
    // Die Autorisierungsprüfung findet innerhalb von ArticleEditor statt
    return {};
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;

.create-article-page {
  @include animations.fade-in(0.5s);
  padding: map.get(vars.$spacing, xl) map.get(vars.$spacing, m);
  margin: 0 auto;
  
  .page-title {
    font-size: map.get(map.get(vars.$fonts, sizes), xxl);
    font-weight: map.get(map.get(vars.$fonts, weights), bold);
    margin-bottom: map.get(vars.$spacing, xs);
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
      }
    }
  }
  
  .page-description {
    font-size: map.get(map.get(vars.$fonts, sizes), medium);
    margin-bottom: map.get(vars.$spacing, xl);
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
      }
    }
  }
}
</style>