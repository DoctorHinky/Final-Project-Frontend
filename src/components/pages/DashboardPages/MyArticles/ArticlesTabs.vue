<!-- src/components/pages/DashboardPages/MyArticles/ArticlesTabs.vue -->
<template>
  <div class="articles-tabs">
    <button v-for="(tab, index) in tabs" :key="index" class="tab-button" :class="{ active: activeTab === tab.id }"
      @click="setActiveTab(tab.id)">
      {{ tab.name }}
      <span class="count">{{ getArticleCount(tab.id) }}</span>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

interface Tab {
  id: string;
  name: string;
}

interface Article {
  id: number;
  status?: string;
  [key: string]: any;
}

export default defineComponent({
  name: 'ArticlesTabs',
  props: {
    tabs: {
      type: Array as PropType<Tab[]>,
      required: true
    },
    activeTab: {
      type: String,
      required: true
    },
    articles: {
      type: Array as PropType<Article[]>,
      required: true
    }
  },
  emits: ['update:activeTab'],
  setup(props, { emit }) {
    const setActiveTab = (tabId: string) => {
      emit('update:activeTab', tabId);
    };

    const getArticleCount = (tabId: string) => {
      if (tabId === 'all') {
        return props.articles.length;
      }
      return props.articles.filter(article => article.status === tabId).length;
    };

    return {
      setActiveTab,
      getArticleCount
    };
  }
});
</script>

<style lang="scss" scoped>
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use 'sass:map';

// Tabs für Artikelgruppen
.articles-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: map.get(vars.$spacing, s);
  margin-bottom: map.get(vars.$spacing, l);

  @media (max-width: 576px) {
    gap: map.get(vars.$spacing, xs);
  }

  .tab-button {
    padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
    border-radius: map.get(map.get(vars.$layout, border-radius), pill);
    font-size: map.get(map.get(vars.$fonts, sizes), small);
    font-weight: map.get(map.get(vars.$fonts, weights), medium);
    cursor: pointer;
    transition: all 0.3s;
    border: none;

    @media (max-width: 576px) {
      padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, m);
      font-size: 12px;
    }

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, secondary-bg);
        color: mixins.theme-color($theme, text-secondary);

        &:hover {
          background-color: mixins.theme-color($theme, hover-color);
        }

        &.active {
          background: mixins.theme-gradient($theme, primary);
          color: white;
        }
      }
    }

    .count {
      display: inline-block;
      margin-left: 5px;
      padding: 2px 6px;
      border-radius: 50%;
      font-size: 0.8rem;

      @media (max-width: 576px) {
        font-size: 0.7rem;
        padding: 1px 4px;
      }

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: rgba(255, 255, 255, 0.2);
        }
      }
    }
  }
}
</style>