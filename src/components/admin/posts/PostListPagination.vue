<!-- src/components/admin/posts/PostListPagination.vue -->
<template>
  <div class="pagination-container">
    <button 
      class="pagination-button" 
      :disabled="currentPage === 1"
      @click="$emit('update:currentPage', currentPage - 1)"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>
    
    <span class="page-info">Seite {{ currentPage }} von {{ totalPages }}</span>
    
    <button 
      class="pagination-button" 
      :disabled="currentPage === totalPages"
      @click="$emit('update:currentPage', currentPage + 1)"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PostListPagination',
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
  emits: ['update:currentPage']
});
</script>

<style lang="scss" scoped>
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  
  .pagination-button {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #444;
    background-color: #2a2a2a;
    color: #f0f0f0;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover:not(:disabled) {
      background-color: #333;
      border-color: #666;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  
  .page-info {
    color: #a0a0a0;
    font-size: 0.9rem;
  }
}
</style>