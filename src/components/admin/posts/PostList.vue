<!-- src/components/admin/posts/PostList.vue -->
<template>
  <div class="post-list-container">
    <PostListHeader v-model:search="searchQuery" v-model:status="statusFilter" :loading="isLoading" />

    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>Artikel werden geladen...</span>
    </div>

    <div v-else-if="error" class="error-state">
      <svg class="icon icon-lg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
      <p>{{ error }}</p>
      <button @click="loadPosts" class="retry-button">
        <svg class="icon icon-sm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
        Erneut versuchen
      </button>
    </div>

    <div v-else-if="filteredPosts.length === 0" class="no-results">
      <svg class="icon icon-lg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
      <p>Keine Artikel gefunden</p>
      <p class="subtitle">Versuchen Sie eine andere Suche oder ändern Sie die Filter</p>
    </div>

    <template v-else>
      <PostListTable :posts="paginatedPosts" @view="viewPost" @toggle-status="togglePostStatus" />

      <PostListPagination v-if="totalPages > 1" v-model:currentPage="currentPage" :totalPages="totalPages" />
    </template>

    <!-- Post Detail Modal -->
    <div class="modal-overlay" v-if="showPostDetail" @click="closePostDetail">
      <div class="modal-container glass-modal" @click.stop>
        <div class="modal-header">
          <h3>Artikeldetails</h3>
          <button class="close-button" @click="closePostDetail">
            <span>×</span>
          </button>
        </div>
        <div class="modal-content">
          <PostDetailModal :postId="selectedPostId ?? ''" @close="closePostDetail" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from "vue";
import adminPostService from "@/services/admin.post.service";
import PostListHeader from "./PostListHeader.vue";
import PostListTable from "./PostListTable.vue";
import PostListPagination from "./PostListPagination.vue";
import PostDetailModal from "./PostDetailModal.vue";
import type { BaseArticleItem as Post } from "@/types/BaseArticle.types";

export default defineComponent({
  name: "PostList",
  components: {
    PostListHeader,
    PostListTable,
    PostListPagination,
    PostDetailModal,
  },
  setup() {
    const posts = ref<Post[]>([]);
    const isLoading = ref(true);
    const error = ref("");
    const searchQuery = ref("");
    const statusFilter = ref("all");
    const currentPage = ref(1);
    const itemsPerPage = 10;
    const totalItems = ref(0);

    // Modal states
    const showPostDetail = ref(false);
    const selectedPostId = ref<string | null>(null);

    // Artikel vom Backend laden
    const loadPosts = async () => {
      isLoading.value = true;
      error.value = "";

      try {
        const params: any = {
          page: currentPage.value,
          limit: itemsPerPage,
        };

        if (searchQuery.value) {
          params.search = searchQuery.value;
        }

        if (statusFilter.value !== "all") {
          params.status = statusFilter.value;
        }

        const response = await adminPostService.getAllPosts(params);
        console.log("Geladene Posts:", response.data);
        posts.value = response.data;
        totalItems.value = response.meta.totalPosts;
      } catch (err: any) {
        console.error("Fehler beim Laden der Posts:", err);
        error.value = err.response?.data?.message || "Fehler beim Laden der Artikel";
      } finally {
        isLoading.value = false;
      }
    };

    // Gefilterte Posts (Frontend-Filter zusätzlich)
    const filteredPosts = computed(() => {
      let result = [...posts.value];

      // Zusätzlicher Frontend-Filter für schnelle Reaktion
      if (searchQuery.value.trim() !== "") {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(
          (post) =>
            post.title.toLowerCase().includes(query) ||
            post.quickDescription?.toLowerCase().includes(query) ||
            post.author?.username.toLowerCase().includes(query)
        );
      }

      return result;
    });

    // Paginierte Posts
    const paginatedPosts = computed(() => {
      return filteredPosts.value; // Backend macht bereits Pagination
    });

    // Gesamtzahl der Seiten
    const totalPages = computed(() => {
      return Math.ceil(totalItems.value / itemsPerPage);
    });

    // Post-Status umschalten
    const togglePostStatus = async (post: Post) => {
      try {
        if (post.published) {
          await adminPostService.unpublishPost(post.id);
          post.published = false;
        } else {
          await adminPostService.publishPost(post.id);
          post.published = true;
          post.publishedAt = new Date();
        }
      } catch (err: any) {
        console.error("Fehler beim Ändern des Status:", err);

        // Bei 403 Fehler spezifische Meldung
        if (err.response?.status === 403) {
          alert(
            "Sie haben keine Berechtigung, diesen Artikel zu veröffentlichen. Nur der Autor kann seine eigenen Artikel veröffentlichen."
          );
        } else {
          alert(err.response?.data?.message || "Fehler beim Ändern des Status");
        }
        // Reload um sicherzustellen dass Status korrekt ist
        loadPosts();
      }
    };

    // Post wiederherstellen
    /* const restorePost = async (post: Post) => {
      try {
        await adminPostService.restorePost(post.id);
        post.isDeleted = false;
      } catch (err: any) {
        console.error("Fehler beim Wiederherstellen:", err);
        alert(err.response?.data?.message || "Fehler beim Wiederherstellen");
        loadPosts();
      }
    }; */

    // Post anzeigen
    const viewPost = (postId: string) => {
      selectedPostId.value = postId;
      showPostDetail.value = true;
    };

    // Modal schließen
    const closePostDetail = () => {
      showPostDetail.value = false;
      selectedPostId.value = null;
      // Reload falls Änderungen gemacht wurden
      loadPosts();
    };

    // Bei Filteränderungen neu laden
    watch([statusFilter, currentPage], () => {
      loadPosts();
    });

    // Debounced search
    let searchTimeout: ReturnType<typeof setTimeout>;
    watch(searchQuery, () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentPage.value = 1;
        loadPosts();
      }, 500); // 500ms delay
    });

    // Initial load
    onMounted(() => {
      loadPosts();
    });

    return {
      posts,
      isLoading,
      error,
      searchQuery,
      statusFilter,
      filteredPosts,
      paginatedPosts,
      currentPage,
      totalPages,
      showPostDetail,
      selectedPostId,
      loadPosts,
      togglePostStatus,
      viewPost,
      closePostDetail,
    };
  },
});
</script>

<style lang="scss" scoped>
// Import der globalen Admin-Styles
@import '../../../style/base/admin-global.scss';

// Icon Styles
.icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;

  &.icon-sm {
    width: 16px;
    height: 16px;
  }

  &.icon-lg {
    width: 48px;
    height: 48px;
  }
}

.post-list-container {
  background: rgba(30, 30, 40, 0.6);
  backdrop-filter: blur(16px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  padding: 30px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  border: 1px solid rgba(93, 173, 226, 0.15);
  min-height: 100vh;
}

.loading-state,
.no-results,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  gap: 20px;
  color: #a0a0a0;
  text-align: center;

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 3px solid rgba(93, 173, 226, 0.2);
    border-top-color: #ff9800;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  p {
    font-size: 1.1rem;
    margin: 0;
    color: #e0e0e0;
    
    &.subtitle {
      font-size: 0.9rem;
      color: #888;
      margin-top: -10px;
    }
  }

  .retry-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: linear-gradient(135deg, rgba(255, 152, 0, 0.3), rgba(245, 124, 0, 0.3));
    color: white;
    border: 1px solid rgba(255, 152, 0, 0.4);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 600;
    backdrop-filter: blur(10px);

    &:hover {
      background: linear-gradient(135deg, rgba(245, 124, 0, 0.4), rgba(230, 81, 0, 0.4));
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(255, 152, 0, 0.3);
    }

    &:active {
      transform: translateY(0);
    }
  }
}

.no-results {
  svg {
    color: #666;
    opacity: 0.8;
  }
}

.error-state {
  svg {
    color: #e74c3c;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// Modal Styles (wie in Dashboard.vue)
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1900;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease-out;
  padding: 20px;

  @media (max-width: 767px) {
    padding: 16px;
  }
}

.modal-container {
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  background: rgba(30, 30, 40, 0.95);
  backdrop-filter: blur(24px) saturate(150%);
  -webkit-backdrop-filter: blur(24px) saturate(150%);
  border-radius: 20px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 100px rgba(93, 173, 226, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(93, 173, 226, 0.2);
  animation: modalSlideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  position: absolute;
  top: -50px;
  z-index: 2000;

  @media (max-width: 767px) {
    width: 100%;
    max-width: none;
    max-height: calc(100vh - 32px);
    border-radius: 16px;
  }

  &.glass-modal {
    background: rgba(30, 30, 40, 0.85);

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 20% 80%, rgba(93, 173, 226, 0.1) 0%, transparent 60%),
        radial-gradient(circle at 80% 20%, rgba(255, 107, 157, 0.08) 0%, transparent 60%);
      pointer-events: none;
    }
  }
}

.modal-header {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(93, 173, 226, 0.15);
  position: relative;
  z-index: 2100;

  @media (max-width: 767px) {
    padding: 16px 20px;
  }

  h3 {
    margin: 0;
    color: #ffffff;
    font-size: 1.3rem;
    font-weight: 600;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);

    @media (max-width: 767px) {
      font-size: 1.1rem;
    }
  }

  .close-button {
    background: linear-gradient(135deg, rgba(255, 107, 157, 0.2), rgba(255, 107, 157, 0.1));
    border: 1px solid rgba(255, 107, 157, 0.3);
    color: #ff6b9d;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
    position: relative;
    z-index: 2200;
    font-size: 1.5rem;
    font-weight: 300;

    @media (max-width: 767px) {
      width: 32px;
      height: 32px;
      font-size: 1.3rem;
    }

    &:hover {
      background: linear-gradient(135deg, rgba(255, 107, 157, 0.3), rgba(255, 107, 157, 0.2));
      border-color: rgba(255, 107, 157, 0.5);
      transform: scale(1.1) rotate(90deg);
      box-shadow:
        0 0 20px rgba(255, 107, 157, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }

    &:active {
      transform: scale(0.95) rotate(90deg);
    }
  }
}

.modal-content {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  position: relative;
  z-index: 2100;

  @media (max-width: 767px) {
    padding: 16px;
  }

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(93, 173, 226, 0.3), rgba(255, 107, 157, 0.2));
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    &:hover {
      background: linear-gradient(180deg, rgba(93, 173, 226, 0.5), rgba(255, 107, 157, 0.3));
    }
  }
}

// Animations
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

// Responsive Design
@media (max-width: 768px) {
  .post-list-container {
    padding: 20px;
    gap: 20px;
  }

  .loading-state,
  .no-results,
  .error-state {
    padding: 40px 20px;
  }
}
</style>