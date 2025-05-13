<!-- src/components/pages/DashboardPages/Library/Pagination.vue -->
<template>
  <div class="pagination">
    <button class="pagination-button prev" :disabled="currentPage === 1" @click="onPrevPage">
      « Zurück
    </button>

    <div class="page-numbers">
      <button v-for="page in totalPages" :key="page" class="page-number" :class="{ active: page === currentPage }"
        @click="onGoToPage(page)">
        {{ page }}
      </button>
    </div>

    <button class="pagination-button next" :disabled="currentPage === totalPages" @click="onNextPage">
      Weiter »
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Pagination',
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    }
  },
  emits: ['prev-page', 'next-page', 'go-to-page'],
  setup(_, { emit }) {
    const onPrevPage = () => {
      emit('prev-page');
    };

    const onNextPage = () => {
      emit('next-page');
    };

    const onGoToPage = (page: number) => {
      emit('go-to-page', page);
    };

    return {
      onPrevPage,
      onNextPage,
      onGoToPage
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;

// Paginierung
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: map.get(vars.$spacing, m);
  margin-bottom: map.get(vars.$spacing, xl);

  .pagination-button {
    padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);
    font-size: map.get(map.get(vars.$fonts, sizes), small);
    cursor: pointer;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, secondary-bg);
        color: mixins.theme-color($theme, text-primary);
        border: 1px solid mixins.theme-color($theme, border-light);
        transition: all 0.4s ease-out;

        &:hover:not(:disabled) {
          background-color: mixins.theme-color($theme, hover-color);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
  }

  .page-numbers {
    display: flex;
    gap: map.get(vars.$spacing, xs);

    .page-number {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: map.get(map.get(vars.$layout, border-radius), small);
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      cursor: pointer;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          color: mixins.theme-color($theme, text-primary);
          border: 1px solid mixins.theme-color($theme, border-light);
          transition: all 0.4s ease-out;

          &:hover {
            background-color: mixins.theme-color($theme, hover-color);
          }

          &.active {
            background-color: mixins.theme-color($theme, accent-green);
            color: white;
            border-color: transparent;
          }
        }
      }
    }
  }
}
</style>