<!-- src/components/pages/DashboardPages/Friends/SearchSection.vue -->
<template>
  <div class="search-section">
    <div class="search-container">
      <input 
        type="text" 
        placeholder="Freunde suchen..." 
        v-model="searchQueryValue" 
        @input="onSearchInput" 
      />
      <button class="search-button">
        <span class="search-icon">🔍</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  name: 'SearchSection',
  props: {
    searchQuery: {
      type: String,
      required: true
    }
  },
  emits: ['update:searchQuery', 'filter-friends'],
  setup(props, { emit }) {
    const searchQueryValue = ref(props.searchQuery);

    watch(() => props.searchQuery, (newValue) => {
      searchQueryValue.value = newValue;
    });

    const onSearchInput = () => {
      emit('update:searchQuery', searchQueryValue.value);
      emit('filter-friends');
    };

    return {
      searchQueryValue,
      onSearchInput
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;

// Suchleiste
.search-section {
  margin-bottom: map.get(vars.$spacing, l);

  .search-container {
    position: relative;
    width: 100%;

    input {
      width: 100%;
      padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl) map.get(vars.$spacing, m) map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-size: map.get(map.get(vars.$fonts, sizes), medium);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          @include mixins.form-element($theme);
          transition: all 0.4s ease-out;
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
          transition: all 0.4s ease-out;
        }
      }
    }
  }
}
</style>