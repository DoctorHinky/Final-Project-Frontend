<!-- src/components/admin/users/UserSearch.vue -->
<template>
  <div class="user-search-container">
    <div class="search-header">
      <h2>Benutzer Suche</h2>
      <p>Suche nach Benutzern mit Namen, E-Mail oder ID</p>
    </div>

    <div class="search-box">
      <div class="search-input-container">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Suchen..."
          class="search-input"
          @keyup.enter="performSearch"
        />
        <button class="search-button" @click="performSearch">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </div>
    </div>

    <div class="search-results" v-if="hasSearched">
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <span>Suche läuft...</span>
      </div>

      <div v-else-if="searchResults.length === 0" class="no-results">
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
        <p>Keine Benutzer gefunden</p>
      </div>

      <div v-else class="results-list">
        <div class="results-header">
          <h3>{{ searchResults.length }} Ergebnisse gefunden</h3>
        </div>

        <div class="user-card" v-for="user in searchResults" :key="user.id" @click="viewUserDetails(user.id)">
          <div class="user-avatar">
            <span v-if="!user.avatarUrl">{{ getUserInitials(user) }}</span>
            <img v-else :src="user.avatarUrl" :alt="`Avatar von ${user.name}`" />
          </div>
          <div class="user-info">
            <h4 class="user-name">{{ user.name }}</h4>
            <p class="user-email">{{ user.email }}</p>
            <div class="user-meta">
              <span class="user-id">ID: {{ user.id }}</span>
              <span class="user-type" :class="user.isAuthor ? 'author' : ''">
                {{ user.isAuthor ? "Autor" : "Benutzer" }}
              </span>
            </div>
          </div>
          <div class="user-actions">
            <button class="action-button view-button">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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
              <span class="tooltip">Details anzeigen</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="search-tips" v-if="!hasSearched">
      <div class="tips-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </div>
      <div class="tips-content">
        <h3>Suchtipps</h3>
        <ul>
          <li>Suche nach Name: z.B. <code>Max Mustermann</code></li>
          <li>Suche nach E-Mail: z.B. <code>max@example.com</code></li>
          <li>Suche nach ID: z.B. <code>ID:12345</code></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isAuthor: boolean;
}

export default defineComponent({
  name: "UserSearch",
  emits: ["user-selected"],
  setup(_props, { emit }) {
    const searchQuery = ref("");
    const isLoading = ref(false);
    const hasSearched = ref(false);
    const searchResults = ref<User[]>([]);

    // Dummy-Daten für die Demonstration
    const users: User[] = [
      { id: "usr_001", name: "Max Mustermann", email: "max@example.com", isAuthor: false },
      { id: "usr_002", name: "Anna Schmidt", email: "anna@example.com", isAuthor: true },
      { id: "usr_003", name: "Thomas Müller", email: "thomas@example.com", isAuthor: false },
      { id: "usr_004", name: "Lisa Wagner", email: "lisa@example.com", isAuthor: true },
      { id: "usr_005", name: "Michael Klein", email: "michael@example.com", isAuthor: false },
    ];

    // Suche durchführen
    const performSearch = () => {
      if (searchQuery.value.trim() === "") return;

      isLoading.value = true;
      hasSearched.value = true;

      // Simuliere Netzwerkverzögerung
      setTimeout(() => {
        const query = searchQuery.value.toLowerCase();

        // Prüfe, ob nach ID gesucht wird
        if (query.startsWith("id:")) {
          const idQuery = query.substring(3).trim();
          searchResults.value = users.filter((user) => user.id.toLowerCase().includes(idQuery));
        } else {
          // Suche nach Name oder E-Mail
          searchResults.value = users.filter(
            (user) => user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
          );
        }

        isLoading.value = false;
      }, 800);
    };

    // Benutzerdetails anzeigen
    const viewUserDetails = (userId: string) => {
      emit("user-selected", userId);
    };

    // Benutzer-Initialen generieren
    const getUserInitials = (user: User): string => {
      if (!user.name) return "??";

      const nameParts = user.name.split(" ");
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      }

      return nameParts[0].substring(0, 2).toUpperCase();
    };

    return {
      searchQuery,
      isLoading,
      hasSearched,
      searchResults,
      performSearch,
      viewUserDetails,
      getUserInitials,
    };
  },
});
</script>

<style lang="scss" scoped>
.user-search-container {
  background-color: #222;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  padding: 24px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  border: 1px solid #333;
}

.search-header {
  margin-bottom: 8px;

  h2 {
    font-size: 1.5rem;
    margin: 0 0 8px 0;
    color: #f0f0f0;
  }

  p {
    margin: 0;
    color: #a0a0a0;
    font-size: 0.9rem;
  }
}

.search-box {
  margin-bottom: 16px;

  .search-input-container {
    display: flex;
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid #444;
    transition: all 0.3s ease;

    &:focus-within {
      border-color: #666;
      box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.2);
    }

    .search-input {
      flex: 1;
      padding: 14px 16px;
      font-size: 1rem;
      border: none;
      background-color: #2a2a2a;
      color: #f0f0f0;

      &:focus {
        outline: none;
      }

      &::placeholder {
        color: #777;
      }
    }

    .search-button {
      background-color: #333;
      border: none;
      padding: 0 20px;
      cursor: pointer;
      color: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.3s ease;

      &:hover {
        background-color: #444;
      }
    }
  }
}

.search-results {
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    gap: 16px;
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

  .no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    gap: 16px;
    color: #a0a0a0;

    svg {
      opacity: 0.5;
    }

    p {
      font-size: 1.1rem;
      margin: 0;
    }
  }

  .results-list {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .results-header {
      padding-bottom: 12px;
      border-bottom: 1px solid #333;

      h3 {
        margin: 0;
        font-size: 1rem;
        color: #a0a0a0;
        font-weight: normal;
      }
    }

    .user-card {
      display: flex;
      align-items: center;
      padding: 16px;
      border-radius: 8px;
      background-color: #2a2a2a;
      border: 1px solid #333;
      gap: 16px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        background-color: #333;
      }

      .user-avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: #444;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 1.2rem;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .user-info {
        flex: 1;

        .user-name {
          margin: 0 0 4px 0;
          font-size: 1.1rem;
          color: #f0f0f0;
        }

        .user-email {
          margin: 0 0 6px 0;
          font-size: 0.9rem;
          color: #a0a0a0;
        }

        .user-meta {
          display: flex;
          gap: 12px;
          font-size: 0.8rem;

          .user-id {
            color: #777;
          }

          .user-type {
            color: #888;
            background-color: #333;
            padding: 2px 8px;
            border-radius: 12px;

            &.author {
              background-color: rgba(255, 152, 0, 0.2);
              color: #ff9800;
            }
          }
        }
      }

      .user-actions {
        display: flex;
        gap: 8px;

        .action-button {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background-color: #333;
          color: #a0a0a0;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;

          &:hover {
            background-color: #444;
            color: #f0f0f0;

            .tooltip {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .tooltip {
            position: absolute;
            top: -30px;
            right: 0;
            background-color: #333;
            color: #f0f0f0;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            white-space: nowrap;
            opacity: 0;
            transform: translateY(5px);
            transition: all 0.3s ease;
            pointer-events: none;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

            &:after {
              content: "";
              position: absolute;
              bottom: -5px;
              right: 10px;
              width: 0;
              height: 0;
              border-left: 5px solid transparent;
              border-right: 5px solid transparent;
              border-top: 5px solid #333;
            }
          }

          &.view-button {
            background-color: rgba(0, 120, 215, 0.2);
            color: #0078d7;

            &:hover {
              background-color: rgba(0, 120, 215, 0.3);
            }
          }
        }
      }
    }
  }
}

.search-tips {
  display: flex;
  background-color: #2a2a2a;
  border-radius: 8px;
  border: 1px solid #333;
  padding: 16px;
  gap: 16px;

  .tips-icon {
    color: #777;
  }

  .tips-content {
    h3 {
      margin: 0 0 8px 0;
      font-size: 1.1rem;
      color: #f0f0f0;
    }

    ul {
      margin: 0;
      padding-left: 20px;
      color: #a0a0a0;

      li {
        margin-bottom: 6px;

        code {
          background-color: #333;
          padding: 2px 6px;
          border-radius: 4px;
          color: #ff9800;
        }
      }
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .user-card {
    flex-direction: column;
    align-items: flex-start !important;

    .user-avatar {
      margin-bottom: 12px;
    }

    .user-actions {
      width: 100%;
      justify-content: flex-end;
      padding-top: 12px;
    }
  }

  .search-tips {
    flex-direction: column;

    .tips-icon {
      display: flex;
      justify-content: center;
    }
  }
}
</style>
