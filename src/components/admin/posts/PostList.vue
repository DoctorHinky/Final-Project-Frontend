<!-- src/components/admin/posts/PostList.vue -->
<template>
  <div class="post-list-container">
    <PostListHeader v-model:search="searchQuery" v-model:status="statusFilter" :loading="isLoading" />

    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <span>Artikel werden geladen...</span>
    </div>

    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="loadPosts" class="retry-button">Erneut versuchen</button>
    </div>

    <div v-else-if="filteredPosts.length === 0" class="no-results">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
      <p>Keine Artikel gefunden</p>
    </div>

    <template v-else>
      <PostListTable :posts="paginatedPosts" @view="viewPost" @toggle-status="togglePostStatus" />

      <PostListPagination v-if="totalPages > 1" v-model:currentPage="currentPage" :totalPages="totalPages" />
    </template>

    <!-- Post Detail Modal -->
    <PostDetailModal v-if="showPostDetail" :postId="selectedPostId ?? ''" @close="closePostDetail" />
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
.post-list-container {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  padding: 24px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  border: 1px solid #333;
}

.loading-container,
.no-results,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 16px;
  color: #a0a0a0;
  text-align: center;

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    border-top-color: #ff9800;
    animation: spin 1s linear infinite;
  }

  svg {
    opacity: 0.5;
  }

  p {
    font-size: 1.1rem;
    margin: 0;
  }

  .retry-button {
    padding: 8px 16px;
    background-color: #0078d7;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: #106ebe;
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
