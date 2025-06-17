<!-- src/components/admin/posts/PostDetailModal.vue -->
<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>{{ post?.title || "Lade..." }}</h3>
        <button class="close-button" @click="$emit('close')">×</button>
      </div>

      <div v-if="loading" class="modal-loading">
        <div class="loading-spinner"></div>
      </div>

      <div v-else-if="error" class="modal-error">
        <p>{{ error }}</p>
      </div>

      <div v-else-if="post" class="modal-content">
        <div class="post-info">
          <div class="info-row">
            <span class="label">Autor:</span>
            <span>{{ post.author?.username || "Unbekannt" }}</span>
          </div>
          <div class="info-row">
            <span class="label">Kategorie:</span>
            <span>{{ formatCategory(post.category) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Status:</span>
            <span class="status-badge" :class="getStatusClass(post)">
              {{ getStatusText(post) }}
            </span>
          </div>
          <div class="info-row" v-if="post.publishedAt">
            <span class="label">Veröffentlicht:</span>
            <span>{{ formatDate(post.publishedAt, "-") }}</span>
          </div>
        </div>

        <div class="post-description" v-if="post.quickDescription">
          <h4>Beschreibung</h4>
          <p>{{ post.quickDescription }}</p>
        </div>

        <div class="post-image" v-if="post.image">
          <h4>Vorschaubild</h4>
          <img :src="post.image" :alt="post.title" />
        </div>

        <div class="post-chapters" v-if="post.chapters && post.chapters.length > 0">
          <h4>Kapitel ({{ post.chapters.length }})</h4>
          <ul>
            <li v-for="chapter in post.chapters" :key="chapter.id">
              {{ chapter.title }}
            </li>
          </ul>
        </div>

        <div class="post-actions">
          <button
            v-if="!post.isDeleted"
            @click="toggleStatus"
            class="action-button"
            :class="post.published ? 'unpublish' : 'publish'"
            :disabled="!canPublish"
          >
            {{ post.published ? "Depublizieren" : "Veröffentlichen" }}
          </button>

          <button v-if="!post.isDeleted" @click="deletePost" class="action-button delete">Löschen</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from "vue";
import adminPostService from "@/services/admin.post.service";
import { authService } from "@/services/auth.service";
import type { BaseArticleItem as Post } from "@/types/BaseArticle.types";
import { formatDate } from "@/utils/helperFunctions";

export default defineComponent({
  name: "PostDetailModal",
  props: {
    postId: {
      type: String,
      required: true,
    },
  },
  emits: ["close"],
  setup(props) {
    const post = ref<Post | null>(null);
    const loading = ref(true);
    const error = ref("");

    // Prüfen ob User der Autor ist
    const currentUser = authService.getUserData();
    const canPublish = computed(() => {
      if (!post.value || !currentUser) return false;
      // Admins/Mods können nur depublizieren, nicht publishen
      if (post.value.published) return true;
      // Nur der Autor kann publishen
      return post.value.author?.id === currentUser.sub || post.value.authorId === currentUser.sub;
    });
    const loadPost = async () => {
      loading.value = true;
      error.value = "";

      try {
        const response = await adminPostService.getPostById(props.postId);
        post.value = response;
      } catch (err: any) {
        error.value = err.response?.data?.message || "Fehler beim Laden des Artikels";
      } finally {
        loading.value = false;
      }
    };

    const toggleStatus = async () => {
      if (!post.value) return;

      try {
        if (post.value.published) {
          await adminPostService.unpublishPost(post.value.id);
          post.value.published = false;
        } else {
          if (!canPublish.value) {
            alert("Nur der Autor kann seinen Artikel veröffentlichen.");
            return;
          }
          await adminPostService.publishPost(post.value.id);
          post.value.published = true;
          post.value.publishedAt = new Date();
        }
      } catch (err: any) {
        if (err.response?.status === 403) {
          alert("Sie haben keine Berechtigung für diese Aktion.");
        } else {
          alert(err.response?.data?.message || "Fehler beim Ändern des Status");
        }
      }
    };

    /* const restore = async () => {
      if (!post.value) return;

      try {
        await adminPostService.restorePost(post.value.id);
        post.value.isDeleted = false;
      } catch (err: any) {
        alert(err.response?.data?.message || "Fehler beim Wiederherstellen");
      }
    }; */

    const deletePost = async () => {
      if (!post.value) return;

      const reason = prompt("Grund für die Löschung:");
      if (!reason) return;

      try {
        await adminPostService.deletePost(post.value.id, reason);
        post.value.isDeleted = true;
      } catch (err: any) {
        alert(err.response?.data?.message || "Fehler beim Löschen");
      }
    };

    const formatCategory = (category: string): string => {
      return category.replace(/_/g, " ");
    };

    const getStatusClass = (post: Post): string => {
      if (post.isDeleted) return "deleted";
      if (!post.published) return "draft";
      return "published";
    };

    const getStatusText = (post: Post): string => {
      if (post.isDeleted) return "Gelöscht";
      if (!post.published) return "Entwurf";
      return "Veröffentlicht";
    };

    onMounted(() => {
      loadPost();
    });

    return {
      post,
      loading,
      error,
      canPublish,
      toggleStatus,
      deletePost,
      formatDate,
      formatCategory,
      getStatusClass,
      getStatusText,
    };
  },
});
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  backdrop-filter: blur(3px);
}

.modal-container {
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  background-color: #222;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid #444;
  animation: modal-appear 0.3s ease-out;
}

.modal-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #333;
  background-color: #262626;

  h3 {
    margin: 0;
    color: #fff;
    font-size: 1.2rem;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #888;
    cursor: pointer;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
  }
}

.modal-loading,
.modal-error {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #a0a0a0;

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    border-top-color: #ff9800;
    animation: spin 1s linear infinite;
  }
}

.modal-content {
  padding: 20px;
  overflow-y: auto;
  flex: 1;

  .post-info {
    background-color: #1c1c1c;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #333;

      &:last-child {
        border-bottom: none;
      }

      .label {
        color: #a0a0a0;
        font-weight: 500;
      }

      .status-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8rem;

        &.published {
          background-color: rgba(46, 204, 113, 0.2);
          color: #2ecc71;
        }

        &.draft {
          background-color: rgba(149, 165, 166, 0.2);
          color: #95a5a6;
        }

        &.deleted {
          background-color: rgba(231, 76, 60, 0.2);
          color: #e74c3c;
        }
      }
    }
  }

  .post-description,
  .post-chapters {
    margin-bottom: 20px;

    h4 {
      color: #f0f0f0;
      margin-bottom: 12px;
    }

    p {
      color: #d0d0d0;
      line-height: 1.6;
    }

    ul {
      list-style: none;
      padding: 0;

      li {
        padding: 8px 12px;
        background-color: #1c1c1c;
        border-radius: 4px;
        margin-bottom: 8px;
        color: #d0d0d0;
      }
    }
  }

  .post-image {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;

    h4 {
      color: #f0f0f0;
      margin-bottom: 12px;
    }

    img {
      max-width: 300px;
      margin: 0 auto;
      border-radius: 8px;
      border: 1px solid #333;
    }
  }

  .post-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #333;

    .action-button {
      padding: 10px 20px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;

      &.publish {
        background-color: rgba(46, 204, 113, 0.2);
        color: #2ecc71;

        &:hover {
          background-color: rgba(46, 204, 113, 0.3);
        }
      }

      &.unpublish {
        background-color: rgba(149, 165, 166, 0.2);
        color: #95a5a6;

        &:hover {
          background-color: rgba(149, 165, 166, 0.3);
        }
      }

      &.restore {
        background-color: rgba(255, 152, 0, 0.2);
        color: #ff9800;

        &:hover {
          background-color: rgba(255, 152, 0, 0.3);
        }
      }

      &.delete {
        background-color: rgba(231, 76, 60, 0.2);
        color: #e74c3c;

        &:hover {
          background-color: rgba(231, 76, 60, 0.3);
        }
      }
    }
  }
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
