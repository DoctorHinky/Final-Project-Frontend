<!-- src/components/pages/DashboardPages/MyArticles/ViewOptions.vue -->
<template>
  <div class="view-options">
    <div class="sort-by">
      <label for="sort-select">Sortieren nach:</label>
      <select id="sort-select" v-model="sortOptionValue" @change="onSortChange">
        <option value="date-desc">Datum (neueste zuerst)</option>
        <option value="date-asc">Datum (älteste zuerst)</option>
        <option value="title-asc">Titel (A-Z)</option>
        <option value="title-desc">Titel (Z-A)</option>
      </select>
    </div>
    <div class="view-mode-toggle">
      <button class="view-button" :class="{ active: viewMode === 'grid' }" @click="switchViewMode('grid')"
        title="Rasteransicht">
        ■ ■
      </button>
      <button class="view-button" :class="{ active: viewMode === 'list' }" @click="switchViewMode('list')"
        title="Listenansicht">
        ≡
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  name: 'ViewOptions',
  props: {
    sortOption: {
      type: String,
      required: true
    },
    viewMode: {
      type: String,
      required: true
    }
  },
  emits: ['update:sortOption', 'update:viewMode'],
  setup(props, { emit }) {
    const sortOptionValue = ref(props.sortOption);
    const viewModeValue = ref(props.viewMode);

    watch(() => props.sortOption, (newValue) => {
      sortOptionValue.value = newValue;
    });

    watch(() => props.viewMode, (newValue) => {
      viewModeValue.value = newValue;
    });

    const onSortChange = () => {
      emit('update:sortOption', sortOptionValue.value);
    };

    const switchViewMode = (mode: string) => {
      emit('update:viewMode', mode);
      // Speichere Benutzereinstellung lokal
      localStorage.setItem('articleViewMode', mode);
    };

    return {
      sortOptionValue,
      onSortChange,
      switchViewMode
    };
  }
});
</script>

<style lang="scss" scoped>
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use 'sass:map';

.view-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: map.get(vars.$spacing, m);

  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: map.get(vars.$spacing, s);
  }

  .sort-by {
    display: flex;
    align-items: center;
    gap: map.get(vars.$spacing, s);

    @media (max-width: 576px) {
      width: 100%;
    }

    label {
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      white-space: nowrap;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }

    select {
      padding: 6px 12px;
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      font-size: map.get(map.get(vars.$fonts, sizes), small);

      @media (max-width: 576px) {
        flex: 1;
      }

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

  .view-mode-toggle {
    display: flex;
    gap: map.get(vars.$spacing, xxs);

    @media (max-width: 576px) {
      align-self: flex-end;
    }

    .view-button {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: map.get(map.get(vars.$layout, border-radius), small);
      cursor: pointer;
      border: none;

      @media (max-width: 576px) {
        width: 32px;
        height: 32px;
      }

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
</style>