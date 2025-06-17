<!-- src/components/admin/posts/PostListTable.vue -->
<template>
  <div class="posts-table-wrapper">
    <table class="posts-table">
      <thead>
        <tr>
          <th class="col-title">Titel</th>
          <th class="col-author">Autor</th>
          <th class="col-category">Kategorie</th>
          <th class="col-date">Veröffentlicht</th>
          <th class="col-status">Status</th>
          <th class="col-views">Aufrufe</th>
          <th class="col-actions">Aktionen</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="post in posts" :key="post.id" class="post-row" @click="$emit('view', post.id)">
          <td class="col-title">
            <div class="post-title-cell">
              <div class="post-thumbnail" v-if="post.image">
                <img :src="post.image" :alt="post.title" />
              </div>
              <div class="post-title-text">
                <span class="post-title">{{ post.title }}</span>
                <span class="post-excerpt">{{ truncateText(post.quickDescription, 80) }}</span>
              </div>
            </div>
          </td>
          <td class="col-author">
            <div class="author-cell">
              <div class="author-avatar">
                <span>{{ getAuthorInitials(post.author) }}</span>
              </div>
              <span>{{ post.author || "Unbekannt" }}</span>
            </div>
          </td>
          <td class="col-category">
            <span class="post-category">{{ formatCategory(post.category) }}</span>
          </td>
          <td class="col-date">{{ formatDate(post.publishedAt, "-") }}</td>
          <td class="col-status">
            <span class="status-badge" :class="getStatusClass(post)">
              {{ getStatusText(post) }}
            </span>
          </td>
          <td class="col-actions">
            <div class="actions-container">
              <button class="action-button view-button" @click.stop="$emit('view', post.id)" title="Artikel ansehen">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
              <button
                class="action-button status-button"
                @click.stop="$emit('toggle-status', post)"
                :title="post.published ? 'Artikel deaktivieren' : 'Artikel veröffentlichen'"
              >
                <svg
                  v-if="post.published"
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect>
                  <circle cx="16" cy="12" r="3"></circle>
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect>
                  <circle cx="8" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { BaseArticleItem as Post } from "@/types/BaseArticle.types";
import { formatDate } from "@/utils/helperFunctions";

export default defineComponent({
  name: "PostListTable",
  props: {
    posts: {
      type: Array as PropType<Post[]>,
      required: true,
    },
  },
  emits: ["view", "toggle-status"],
  methods: {
    formatDate, // Importing the formatDate function from the composable
    getAuthorInitials(author?: { username: string }): string {
      if (!author?.username) return "??";
      const parts = author.username.split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return author.username.substring(0, 2).toUpperCase();
    },

    truncateText(text: string, maxLength: number): string {
      if (!text || text.length <= maxLength) return text || "";
      return text.substring(0, maxLength) + "...";
    },

    formatCategory(category: string): string {
      if (!category) return "Keine Kategorie";
      return category.replace(/_/g, " ");
    },

    getStatusClass(post: Post): string {
      if (post.isDeleted) return "deleted";
      if (!post.published) return "draft";
      return "published";
    },

    getStatusText(post: Post): string {
      if (post.isDeleted) return "Gelöscht";
      if (!post.published) return "Entwurf";
      return "Veröffentlicht";
    },

    formatNumber(num: number | undefined): string {
      if (!num) return "0";
      return num.toLocaleString("de-DE");
    },
  },
});
</script>

<style lang="scss" scoped>
.posts-table-wrapper {
  overflow-x: auto;
  border-radius: 6px;
  border: 1px solid #333;

  .posts-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;

    th,
    td {
      padding: 12px 16px;
      border-bottom: 1px solid #333;
    }

    th {
      background-color: #262626;
      color: #a0a0a0;
      font-weight: 500;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .post-row {
      transition: all 0.3s ease;
      cursor: pointer;

      &:hover {
        background-color: #2a2a2a;
      }

      td {
        color: #f0f0f0;
      }
    }

    .col-title {
      min-width: 300px;

      .post-title-cell {
        display: flex;
        gap: 12px;

        .post-thumbnail {
          width: 60px;
          height: 40px;
          background-color: #333;
          border-radius: 4px;
          overflow: hidden;
          flex-shrink: 0;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .post-title-text {
          display: flex;
          flex-direction: column;

          .post-title {
            font-weight: 500;
            margin-bottom: 4px;
          }

          .post-excerpt {
            color: #a0a0a0;
            font-size: 0.85rem;
          }
        }
      }
    }

    .col-author {
      min-width: 150px;

      .author-cell {
        display: flex;
        align-items: center;
        gap: 8px;

        .author-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: #444;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          font-size: 0.8rem;
        }
      }
    }

    .col-category {
      .post-category {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        background-color: #333;
        color: #a0a0a0;
        font-size: 0.85rem;
      }
    }

    .col-date,
    .col-views {
      color: #a0a0a0;
      font-size: 0.9rem;
    }

    .col-status {
      .status-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        text-align: center;

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

    .col-actions {
      .actions-container {
        display: flex;
        gap: 8px;
        justify-content: flex-end;

        .action-button {
          width: 32px;
          height: 32px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background-color: #333;
          color: #a0a0a0;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            background-color: #444;
            color: #f0f0f0;
          }

          &.view-button {
            background-color: rgba(0, 120, 215, 0.2);
            color: #0078d7;

            &:hover {
              background-color: rgba(0, 120, 215, 0.3);
            }
          }

          &.status-button {
            background-color: rgba(46, 204, 113, 0.2);
            color: #2ecc71;

            &:hover {
              background-color: rgba(46, 204, 113, 0.3);
            }
          }

          &.restore-button {
            background-color: rgba(255, 152, 0, 0.2);
            color: #ff9800;

            &:hover {
              background-color: rgba(255, 152, 0, 0.3);
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .posts-table {
    .col-category,
    .col-date,
    .col-views {
      display: none;
    }
  }
}
</style>
