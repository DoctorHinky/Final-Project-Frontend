<!-- src/components/pages/DashboardPages/MyArticles/SearchSection.vue -->
<template>
  <div class="search-section">
    <div class="search-container">
      <input type="text" placeholder="Artikel suchen..." v-model="searchQuery" @input="onSearchInput" />
      <button class="search-button">
        <span class="search-icon">🔍</span>
      </button>
    </div>
    <div class="active-filters" v-if="filterTags.length > 0">
      <span class="filter-label">Aktive Filter:</span>
      <div class="filter-tags">
        <span v-for="(tag, index) in filterTags" :key="index" class="filter-tag" @click="removeFilterTag(index)">
          {{ tag }} <span class="remove-tag">×</span>
        </span>
      </div>
      <button class="clear-filters" @click="clearFilters">Alle löschen</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  name: "SearchSection",
  props: {
    searchQuery: {
      type: String,
      required: true,
    },
    filterTags: {
      type: Array as PropType<string[]>,
      required: true,
    },
  },
  emits: ["update:searchQuery", "update:filterTags", "filter-articles", "remove-filter-tag", "clear-filters"],
  setup(_props, { emit }) {
    const onSearchInput = (event: Event) => {
      const target = event.target as HTMLInputElement;
      emit("update:searchQuery", target.value);
      emit("filter-articles");
    };

    const removeFilterTag = (index: number) => {
      emit("remove-filter-tag", index);
    };

    const clearFilters = () => {
      emit("clear-filters");
    };

    return {
      onSearchInput,
      removeFilterTag,
      clearFilters,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;
@use "sass:map";

// Suchleiste
.search-section {
  margin-bottom: map.get(vars.$spacing, l);

  .search-container {
    position: relative;
    width: 100%;
    margin-bottom: map.get(vars.$spacing, m);

    input {
      width: 100%;
      padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl) map.get(vars.$spacing, m) map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-size: map.get(map.get(vars.$fonts, sizes), medium);

      @each $theme in ("light", "dark") {
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

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  // Filter-Tags
  .active-filters {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: map.get(vars.$spacing, s);

    .filter-label {
      font-weight: map.get(map.get(vars.$fonts, weights), medium);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }

    .filter-tags {
      display: flex;
      flex-wrap: wrap;
      gap: map.get(vars.$spacing, xs);

      .filter-tag {
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        padding: 4px 12px;
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;

        @each $theme in ("light", "dark") {
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

    .clear-filters {
      background: none;
      border: none;
      cursor: pointer;
      font-size: map.get(map.get(vars.$fonts, sizes), small);

      @each $theme in ("light", "dark") {
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
