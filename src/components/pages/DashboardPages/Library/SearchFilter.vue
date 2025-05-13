<!-- src/components/pages/DashboardPages/Library/SearchFilter.vue -->
<template>
  <div class="filter-section">
    <div class="search-container">
      <input type="text" placeholder="Artikel durchsuchen..." v-model="searchQueryValue" @input="onSearchInput" />
      <button class="search-button">
        <span class="search-icon">🔍</span>
      </button>
    </div>

    <div class="filter-options">
      <div class="filter-group">
        <label>Kategorie:</label>
        <select v-model="filterCategoryValue" @change="onCategoryChange">
          <option value="">Alle Kategorien</option>
          <option v-for="category in uniqueCategories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>Sortieren nach:</label>
        <select v-model="sortOptionValue" @change="onSortChange">
          <option value="date-desc">Neuste zuerst</option>
          <option value="date-asc">Älteste zuerst</option>
          <option value="title-asc">Titel (A-Z)</option>
          <option value="title-desc">Titel (Z-A)</option>
          <option value="popular">Beliebteste</option>
        </select>
      </div>

      <div class="view-toggle">
        <button class="view-button" :class="{ active: viewMode === 'grid' }" @click="onViewModeChange('grid')"
          title="Rasteransicht">
          ■ ■
        </button>
        <button class="view-button" :class="{ active: viewMode === 'list' }" @click="onViewModeChange('list')"
          title="Listenansicht">
          ≡
        </button>
      </div>
    </div>

    <div class="active-filters" v-if="selectedTags.length > 0">
      <span class="filter-label">Aktive Tags:</span>
      <div class="tag-list">
        <span v-for="(tag, index) in selectedTags" :key="index" class="tag-item" @click="onRemoveTag(index)">
          {{ tag }} <span class="remove-tag">×</span>
        </span>
      </div>
      <button class="clear-tags" @click="onClearTags">Alle löschen</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, watch } from 'vue';

export default defineComponent({
  name: 'SearchFilter',
  props: {
    searchQuery: {
      type: String,
      required: true
    },
    filterCategory: {
      type: String,
      required: true
    },
    sortOption: {
      type: String,
      required: true
    },
    viewMode: {
      type: String,
      required: true
    },
    selectedTags: {
      type: Array as PropType<string[]>,
      required: true
    },
    uniqueCategories: {
      type: Array as PropType<string[]>,
      required: true
    }
  },
  emits: [
    'update:searchQuery', 
    'update:filterCategory', 
    'update:sortOption', 
    'update:viewMode',
    'filter-articles',
    'remove-tag',
    'clear-tags'
  ],
  setup(props, { emit }) {
    const searchQueryValue = ref(props.searchQuery);
    const filterCategoryValue = ref(props.filterCategory);
    const sortOptionValue = ref(props.sortOption);

    // Watch für prop-Änderungen
    watch(() => props.searchQuery, (newValue) => {
      searchQueryValue.value = newValue;
    });

    watch(() => props.filterCategory, (newValue) => {
      filterCategoryValue.value = newValue;
    });

    watch(() => props.sortOption, (newValue) => {
      sortOptionValue.value = newValue;
    });

    // Event-Handler
    const onSearchInput = () => {
      emit('update:searchQuery', searchQueryValue.value);
      emit('filter-articles');
    };

    const onCategoryChange = () => {
      emit('update:filterCategory', filterCategoryValue.value);
      emit('filter-articles');
    };

    const onSortChange = () => {
      emit('update:sortOption', sortOptionValue.value);
      emit('filter-articles');
    };

    const onViewModeChange = (mode: string) => {
      emit('update:viewMode', mode);
    };

    const onRemoveTag = (index: number) => {
      emit('remove-tag', index);
    };

    const onClearTags = () => {
      emit('clear-tags');
    };

    return {
      searchQueryValue,
      filterCategoryValue,
      sortOptionValue,
      onSearchInput,
      onCategoryChange,
      onSortChange,
      onViewModeChange,
      onRemoveTag,
      onClearTags
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;

// Filter-Sektion
.filter-section {
  margin-bottom: map.get(vars.$spacing, xl);

  .search-container {
    position: relative;
    width: 100%;
    margin-bottom: map.get(vars.$spacing, m);

    input {
      width: 100%;
      padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl) map.get(vars.$spacing, m) map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-size: map.get(map.get(vars.$fonts, sizes), medium);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          @include mixins.form-element($theme);
        }
      }
    }

    .search-button {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.2rem;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  .filter-options {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: map.get(vars.$spacing, m);
    margin-bottom: map.get(vars.$spacing, m);

    .filter-group {
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, s);

      label {
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        font-weight: map.get(map.get(vars.$fonts, weights), medium);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }

      select {
        padding: 8px 12px;
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);
        font-size: map.get(map.get(vars.$fonts, sizes), small);

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            color: mixins.theme-color($theme, text-primary);
            border: 1px solid mixins.theme-color($theme, border-light);

            &:focus {
              border-color: mixins.theme-color($theme, accent-teal);
              outline: none;
            }
          }
        }
      }
    }

    .view-toggle {
      display: flex;
      gap: 4px;

      .view-button {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: map.get(map.get(vars.$layout, border-radius), small);
        cursor: pointer;
        border: none;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            color: mixins.theme-color($theme, text-secondary);

            &:hover {
              background-color: mixins.theme-color($theme, hover-color);
            }

            &.active {
              background-color: mixins.theme-color($theme, accent-green);
              color: white;
            }
          }
        }
      }
    }
  }

  .active-filters {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: map.get(vars.$spacing, s);

    .filter-label {
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }

    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: map.get(vars.$spacing, xs);

      .tag-item {
        padding: 4px 10px;
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, accent-teal);
            color: white;

            &:hover {
              background-color: mixins.theme-color($theme, accent-green);
            }
          }
        }

        .remove-tag {
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
        }
      }
    }

    .clear-tags {
      background: none;
      border: none;
      cursor: pointer;
      font-size: map.get(map.get(vars.$fonts, sizes), small);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, accent-teal);

          &:hover {
            color: mixins.theme-color($theme, accent-green);
            text-decoration: underline;
          }
        }
      }
    }
  }
}
</style>