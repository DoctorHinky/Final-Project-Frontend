<!-- src/components/admin/posts/PostListHeader.vue -->
<template>
  <div class="list-header">
    <h2>Artikel verwalten</h2>
    <div class="header-actions">
      <div class="filter-container">
        <select
          :value="status"
          @change="$emit('update:status', ($event.target as HTMLSelectElement).value)"
          class="filter-select"
          :disabled="loading"
        >
          <option value="all">Alle Artikel</option>
          <option value="published">Veröffentlicht</option>
          <option value="draft">Entwürfe</option>
        </select>
      </div>
      <div class="search-container">
        <input
          type="text"
          :value="search"
          @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
          placeholder="Artikel suchen..."
          class="search-input"
          :disabled="loading"
        />
        <svg
          class="search-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "PostListHeader",
  props: {
    search: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "all",
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:search", "update:status"],
});
</script>

<style lang="scss" scoped>
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 16px;

  h2 {
    font-size: 1.5rem;
    margin: 0;
    color: #f0f0f0;
  }

  .header-actions {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;

    .filter-container {
      .filter-select {
        padding: 8px 12px;
        background-color: transparent;
        border: 1px solid #444;
        border-radius: 4px;
        color: #f0f0f0;
        font-size: 0.9rem;
        cursor: pointer;
        min-width: 150px;

        &:focus {
          outline: none;
          border-color: #666;
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        option {
          background-color: #2a2a2a;
        }
      }
    }

    .search-container {
      position: relative;

      .search-input {
        padding: 8px 36px 8px 12px;
        background-color: transparent;
        border: 1px solid #444;
        border-radius: 4px;
        color: #f0f0f0;
        font-size: 0.9rem;
        width: 250px;

        &:focus {
          outline: none;
          border-color: #666;
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        &::placeholder {
          color: #777;
        }
      }

      .search-icon {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        color: #777;
        pointer-events: none;
      }
    }
  }
}

@media (max-width: 768px) {
  .list-header {
    flex-direction: column;
    align-items: flex-start;

    .header-actions {
      width: 100%;
      justify-content: space-between;

      .search-container .search-input {
        width: 100%;
      }
    }
  }
}
</style>
