<!-- src/pages/admin/Dashboard.vue -->
<template>
  <div class="admin-dashboard">
    <!-- Volle Breite Hintergrund-Container -->
    <div class="full-width-background">
      <!-- Glass Background Effects -->
      <div class="glass-bg-effect"></div>
      <div class="glass-bg-effect-2"></div>
    </div>

    <!-- Content Container mit max-width -->
    <div class="dashboard-content">
      <!-- User Suche -->
      <UserSearch v-if="activeTab === 'user-search'" @user-selected="viewUserDetails" />

      <!-- Alle User -->
      <UserList v-if="activeTab === 'all-users'" @user-selected="viewUserDetails" />

      <!-- Gelöschte User -->
      <DeletedUsers v-if="activeTab === 'deleted-users'" />

      <!-- Bewerbungen Tab -->
      <div v-if="activeTab === 'applications'" class="applications-section">
        <!-- Subtabs für Bewerbungen -->
        <div class="applications-nav">
          <button v-for="subtab in applicationSubtabs" :key="subtab.id"
            :class="{ active: activeApplicationSubtab === subtab.id }" @click="activeApplicationSubtab = subtab.id"
            class="subtab-button">
            <component :is="subtab.icon" class="subtab-icon" />
            <span class="subtab-label">{{ subtab.label }}</span>
          </button>
        </div>

        <!-- Application Komponenten -->
        <ApplicationList v-if="activeApplicationSubtab === 'list'" @application-selected="viewApplicationDetails" />
        <ApplicationSearch v-if="activeApplicationSubtab === 'search'" @application-selected="viewApplicationDetails" />
      </div>

      <!-- Active Posts -->
      <PostList v-if="activeTab === 'active-posts'" />

      <!-- Tickets -->
      <div v-if="activeTab === 'tickets'" class="tickets">
        <Tickets />
      </div>

      <!-- Default/Overview -->
      <div v-if="activeTab === 'overview'" class="overview-content">
        <div class="overview-header">
          <h2 class="animated-title">
            <span class="title-word">Admin</span>
            <span class="title-word accent">Dashboard</span>
          </h2>
          <p class="subtitle">Übersicht über alle wichtigen Metriken und Aktivitäten</p>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-container">
          <div class="orbital-loader-mini">
            <div class="core"></div>
            <div class="orbit orbit-1"></div>
            <div class="orbit orbit-2"></div>
          </div>
          <p>Lade Dashboard-Daten...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="loadError" class="error-container glass-card">
          <div class="error-icon">⚠️</div>
          <p class="error-message">{{ loadError }}</p>
          <button @click="loadDashboardStats" class="retry-button">
            <span class="button-text">Erneut versuchen</span>
          </button>
        </div>

        <!-- Quick Stats Overview -->
        <div v-else class="quick-stats">
          <!-- Stat Cards hier bleiben gleich -->
          <!-- Aktive Benutzer -->
          <div class="stat-card users" @click="navigateToTab('all-users')">
            <div class="card-glow"></div>
            <div class="stat-icon">
              <div class="icon-glow"></div>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="5" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{{ stats.totalUsers }}</h3>
              <p class="stat-label">Aktive Benutzer</p>
            </div>
            <div class="stat-trend">
              <span class="trend-icon">↗</span>
            </div>
          </div>

          <!-- Weitere Stat Cards... -->
          <!-- Bewerbungen -->
          <div class="stat-card applications" @click="navigateToTab('applications')">
            <div class="card-glow"></div>
            <div class="stat-icon applications">
              <div class="icon-glow"></div>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{{ stats.totalApplications }}</h3>
              <p class="stat-label">Bewerbungen</p>
            </div>
            <div class="stat-trend">
              <span class="trend-icon">↗</span>
            </div>
          </div>

          <!-- Ausstehende Bewerbungen -->
          <div class="stat-card urgent" @click="navigateToApplications('pending')">
            <div class="card-glow"></div>
            <div class="stat-icon pending">
              <div class="icon-glow"></div>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{{ stats.pendingApplications }}</h3>
              <p class="stat-label">Ausstehende Bewerbungen</p>
            </div>
            <div class="stat-badge">Wichtig</div>
          </div>

          <!-- Gelöschte Benutzer -->
          <div class="stat-card deleted" @click="navigateToTab('deleted-users')">
            <div class="card-glow"></div>
            <div class="stat-icon deleted">
              <div class="icon-glow"></div>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{{ stats.deletedUsers }}</h3>
              <p class="stat-label">Gelöschte Benutzer</p>
            </div>
          </div>

          <!-- Aktive Beiträge -->
          <div class="stat-card posts" @click="navigateToTab('active-posts')">
            <div class="card-glow"></div>
            <div class="stat-icon posts">
              <div class="icon-glow"></div>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{{ stats.activePosts }}</h3>
              <p class="stat-label">Aktive Beiträge</p>
            </div>
            <div class="stat-trend positive">
              <span class="trend-icon">↗</span>
            </div>
          </div>

          <!-- Offene Tickets -->
          <div class="stat-card tickets" @click="navigateToTab('tickets')">
            <div class="card-glow"></div>
            <div class="stat-icon tickets">
              <div class="icon-glow"></div>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{{ stats.openTickets }}</h3>
              <p class="stat-label">Offene Tickets</p>
            </div>
          </div>

          <!-- Neue User heute -->
          <div class="stat-card new-users">
            <div class="card-glow"></div>
            <div class="stat-icon new-users">
              <div class="icon-glow"></div>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <line x1="19" y1="8" x2="19" y2="14"></line>
                <line x1="22" y1="11" x2="16" y2="11"></line>
              </svg>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{{ stats.newUsersToday }}</h3>
              <p class="stat-label">Neue User heute</p>
            </div>
            <div class="stat-sparkline">
              <svg viewBox="0 0 50 20" class="sparkline">
                <polyline points="0,15 10,10 20,12 30,8 40,10 50,5" fill="none" stroke="currentColor"
                  stroke-width="2" />
              </svg>
            </div>
          </div>

          <!-- Deaktivierte User -->
          <div class="stat-card deactivated">
            <div class="card-glow"></div>
            <div class="stat-icon deactivated">
              <div class="icon-glow"></div>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
              </svg>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{{ stats.deactivatedUsers }}</h3>
              <p class="stat-label">Deaktivierte User</p>
            </div>
          </div>
        </div>

        <!-- Last Update Info -->
        <div v-if="!isLoading && !loadError" class="last-update glass-card">
          <p class="update-text">
            <span class="update-icon">🔄</span>
            Letzte Aktualisierung: {{ lastUpdateFormatted }}
          </p>
          <button @click="loadDashboardStats" class="refresh-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="refresh-icon">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            <span>Aktualisieren</span>
          </button>
        </div>
      </div>
    </div>

    <!-- User Details Modal -->
    <div class="modal-overlay" v-if="showUserDetails" @click="closeUserDetails">
      <div class="modal-container glass-modal" @click.stop>
        <div class="modal-header">
          <h3>Benutzerdetails</h3>
          <button class="close-button" @click="closeUserDetails">
            <span>×</span>
          </button>
        </div>
        <div class="modal-content">
          <UserDetail :user-id="selectedUserId" />
        </div>
      </div>
    </div>

    <!-- Application Details Modal -->
    <div class="modal-overlay" v-if="showApplicationDetails" @click="closeApplicationDetails">
      <div class="modal-container glass-modal" @click.stop>
        <div class="modal-header">
          <h3>Bewerbungsdetails</h3>
          <button class="close-button" @click="closeApplicationDetails">
            <span>×</span>
          </button>
        </div>
        <div class="modal-content">
          <ApplicationDetail :application-id="selectedApplicationId" @application-updated="handleApplicationUpdated" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// Script bleibt unverändert
import { defineComponent, ref, computed, onMounted, watch, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/services/axiosInstance";
import userService from "@/services/user.service";
import applicationService from "@/services/application.service";
// User Komponenten
import UserSearch from "@/components/admin/users/UserSearch.vue";
import UserList from "@/components/admin/users/UserList.vue";
import DeletedUsers from "@/components/admin/DeletedUsers/DeletedUsers.vue";
import UserDetail from "@/components/admin/users/UserDetail.vue";
// Application Komponenten
import ApplicationList from "@/components/admin/application/ApplicationList.vue";
import ApplicationSearch from "@/components/admin/application/ApplicationSearch.vue";
import ApplicationDetail from "@/components/admin/application/ApplicationDetail.vue";
// Andere Komponenten
import PostList from "@/components/admin/posts/PostList.vue";
import Tickets from "@/components/admin/tickets/Tickets.vue";
// Icons
import { QueueListIcon as ListIcon, MagnifyingGlassIcon as SearchIcon } from "@heroicons/vue/24/outline";

export interface DashboardStats {
  totalUsers: number;
  deletedUsers: number;
  deactivatedUsers: number;
  activePosts: number;
  openTickets: number;
  newUsersToday: number;
  totalApplications: number;
  pendingApplications: number;
}

export default defineComponent({
  name: "AdminDashboard",
  components: {
    UserSearch,
    UserList,
    DeletedUsers,
    UserDetail,
    ApplicationList,
    ApplicationSearch,
    ApplicationDetail,
    PostList,
    Tickets,
  },
  props: {
    defaultTab: {
      type: String,
      default: "overview",
    },
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();

    // State
    const isLoading = ref(false);
    const loadError = ref("");
    const lastUpdate = ref(new Date());

    // Application Subtabs
    const activeApplicationSubtab = ref("list");
    const applicationSubtabs = [
      { id: "list", label: "Alle Bewerbungen", icon: ListIcon },
      { id: "search", label: "Suche", icon: SearchIcon },
    ];

    // Dashboard Stats
    const stats = reactive<DashboardStats>({
      totalUsers: 0,
      deletedUsers: 0,
      deactivatedUsers: 0,
      activePosts: 0,
      openTickets: 0,
      newUsersToday: 0,
      totalApplications: 0,
      pendingApplications: 0,
    });

    // Aktiver Tab
    const activeTab = computed(() => {
      if (route.query.tab) {
        return route.query.tab as string;
      }
      return props.defaultTab;
    });

    // Modal States
    const showUserDetails = ref(false);
    const selectedUserId = ref<string | null>(null);
    const showApplicationDetails = ref(false);
    const selectedApplicationId = ref<string | null>(null);

    // Formatierte letzte Aktualisierung
    const lastUpdateFormatted = computed(() => {
      return new Intl.DateTimeFormat("de-DE", {
        dateStyle: "short",
        timeStyle: "medium",
      }).format(lastUpdate.value);
    });

    // Dashboard Stats laden
    const loadDashboardStats = async () => {
      isLoading.value = true;
      loadError.value = "";

      try {
        // Parallele API-Aufrufe
        const [usersResponse, deletedUsersResponse, applicationsResponse] = await Promise.all([
          userService.getAllUsers(),
          userService.getDeletedUsers(),
          applicationService.getAllApplications("ALL"),
        ]);

        // Stats berechnen
        const activeUsers = usersResponse.filter((user) => !user.isDeleted && !user.deactivated);
        stats.totalUsers = activeUsers.length;
        stats.deletedUsers = deletedUsersResponse.length;

        const deactivatedUsers = usersResponse.filter((user) => user.deactivated && !user.isDeleted);
        stats.deactivatedUsers = deactivatedUsers.length;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const newUsersToday = usersResponse.filter((user) => {
          const createdAt = new Date(user.createdAt);
          return createdAt >= today && !user.isDeleted;
        });
        stats.newUsersToday = newUsersToday.length;

        stats.totalApplications = applicationsResponse.length;
        stats.pendingApplications = applicationsResponse.filter((app) => app.status === "PENDING").length;

        // Posts Stats
        try {
          const postsResponse = await api.get("/article/getPreviews", {
            params: { limit: 1000 },
          });

          if (postsResponse.data?.data) {
            stats.activePosts = postsResponse.data.meta.totalPosts || 0;
          } else {
            stats.activePosts = 0;
          }
        } catch (error) {
          console.error("Fehler beim Laden der Post-Statistiken:", error);
          stats.activePosts = 0;
        }

        // Ticket Stats
        try {
          const ticketsResponse = await api.get("/tickets/all", {
            params: {
              status: "OPEN",
              limit: 1,
            },
          });

          if (Array.isArray(ticketsResponse.data)) {
            stats.openTickets = ticketsResponse.data.length;
          } else if (typeof ticketsResponse.data === "string") {
            stats.openTickets = 0;
          } else {
            stats.openTickets = 0;
          }

          const allTicketsResponse = await api.get("/tickets/all", {
            params: { limit: 1000 },
          });

          if (Array.isArray(allTicketsResponse.data)) {
            const openTickets = allTicketsResponse.data.filter((ticket: any) => ticket.status === "OPEN");
            stats.openTickets = openTickets.length;
          }
        } catch (error) {
          console.error("Fehler beim Laden der Ticket-Statistiken:", error);
          stats.openTickets = 0;
        }

        lastUpdate.value = new Date();
      } catch (error: any) {
        console.error("Fehler beim Laden der Dashboard-Statistiken:", error);
        loadError.value = error.response?.data?.message || "Fehler beim Laden der Statistiken";
      } finally {
        isLoading.value = false;
      }
    };

    // Navigation zu Tab
    const navigateToTab = (tab: string) => {
      router.push({
        path: route.path,
        query: { ...route.query, tab },
      });
    };

    // Navigation zu Bewerbungen mit Filter
    const navigateToApplications = (_filter: string) => {
      router.push({
        path: route.path,
        query: { tab: "applications" },
      });
    };

    // User Details anzeigen
    const viewUserDetails = (userId: string) => {
      selectedUserId.value = userId;
      showUserDetails.value = true;
      document.body.style.overflow = "hidden";
    };

    // User Details schließen
    const closeUserDetails = () => {
      showUserDetails.value = false;
      selectedUserId.value = null;
      document.body.style.overflow = "";
    };

    // Application Details anzeigen
    const viewApplicationDetails = (applicationId: string) => {
      selectedApplicationId.value = applicationId;
      showApplicationDetails.value = true;
      document.body.style.overflow = "hidden";
    };

    // Application Details schließen
    const closeApplicationDetails = () => {
      showApplicationDetails.value = false;
      selectedApplicationId.value = null;
      document.body.style.overflow = "";
    };

    // Application Update Handler
    const handleApplicationUpdated = () => loadDashboardStats();

    // Beim Mounten Stats laden
    onMounted(() => {
      if (activeTab.value === "overview") loadDashboardStats();
    });

    // Stats neu laden wenn zu Overview gewechselt wird
    watch(activeTab, (newTab) => {
      if (newTab === "overview" && stats.totalUsers === 0) {
        loadDashboardStats();
      }
    });

    // Auto-Refresh alle 5 Minuten
    let refreshInterval: number | null = null;
    onMounted(() => {
      refreshInterval = window.setInterval(() => {
        if (activeTab.value === "overview") {
          loadDashboardStats();
        }
      }, 5 * 60 * 1000);
    });

    // Cleanup
    onMounted(() => {
      return () => {
        if (refreshInterval) clearInterval(refreshInterval);
      };
    });

    return {
      activeTab,
      activeApplicationSubtab,
      applicationSubtabs,
      showUserDetails,
      selectedUserId,
      showApplicationDetails,
      selectedApplicationId,
      stats,
      isLoading,
      loadError,
      lastUpdate,
      lastUpdateFormatted,
      viewUserDetails,
      closeUserDetails,
      viewApplicationDetails,
      closeApplicationDetails,
      handleApplicationUpdated,
      loadDashboardStats,
      navigateToTab,
      navigateToApplications,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;
@use "@/style/base/animations" as animations;

// Admin Dashboard Hauptcontainer
.admin-dashboard {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
}

// Volle Breite Hintergrund
.full-width-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #181c24 0%, #1e1e28 100%);
  z-index: -1;

  // Animierte Hintergrund-Effekte
  .glass-bg-effect {
    position: absolute;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(93, 173, 226, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    top: -300px;
    right: -300px;
    animation: floatBg 20s ease-in-out infinite;
    filter: blur(40px);

    @media (max-width: 768px) {
      width: 400px;
      height: 400px;
      top: -200px;
      right: -200px;
    }
  }

  .glass-bg-effect-2 {
    position: absolute;
    width: 800px;
    height: 800px;
    background: radial-gradient(circle, rgba(255, 107, 157, 0.08) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    bottom: -400px;
    left: -400px;
    animation: floatBg 25s ease-in-out infinite reverse;
    filter: blur(60px);

    @media (max-width: 768px) {
      width: 500px;
      height: 500px;
      bottom: -250px;
      left: -250px;
    }
  }
}

// Content Container mit optimalen Paddings
.dashboard-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 2000px;
  margin: 0 auto;
  padding-top: calc(150px + 02rem);

  // Desktop mit Sidebar
  @media (min-width: 1024px) {
    padding-left: calc(0px + 2rem); // Sidebar-Breite + Padding
    padding-right: 2rem;
  }

  // Tablet
  @media (max-width: 1023px) and (min-width: 768px) {
    max-width: 100vw;
  }

  // Mobile
  @media (max-width: 767px) {
    padding: 1rem;
    padding-top: calc(60px + 1rem);
  }
}

@keyframes floatBg {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  33% {
    transform: translate(30px, -30px) scale(1.1);
  }

  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

// Tickets Section
.tickets {
  background: rgba(30, 30, 40, 0.6);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid rgba(93, 173, 226, 0.15);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);

  @media (max-width: 767px) {
    padding: 16px;
    border-radius: 12px;
  }
}

// Applications Section
.applications-section {
  .applications-nav {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
    padding: 16px;
    background: rgba(30, 30, 40, 0.6);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-radius: 16px;
    border: 1px solid rgba(93, 173, 226, 0.15);
    box-shadow:
      0 4px 24px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
    flex-wrap: wrap;

    @media (max-width: 767px) {
      padding: 12px;
      gap: 8px;
      margin-bottom: 16px;
    }

    .subtab-button {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 24px;
      border: 1px solid rgba(93, 173, 226, 0.2);
      border-radius: 12px;
      background: rgba(42, 42, 42, 0.4);
      backdrop-filter: blur(10px);
      color: #a8d5e8;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
      position: relative;
      overflow: hidden;

      @media (max-width: 767px) {
        flex: 1 1 calc(50% - 4px);
        min-width: 140px;
        padding: 10px 16px;
        gap: 8px;
        font-size: 0.85rem;
        justify-content: center;
      }

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(93, 173, 226, 0.2), transparent);
        transition: left 0.5s ease;
      }

      .subtab-icon {
        width: 18px;
        height: 18px;
        transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);

        @media (max-width: 767px) {
          width: 16px;
          height: 16px;
        }
      }

      &:hover {
        background: rgba(93, 173, 226, 0.15);
        border-color: rgba(93, 173, 226, 0.3);
        color: #ffffff;
        transform: translateY(-1px);
        box-shadow:
          0 4px 16px rgba(93, 173, 226, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);

        &::before {
          left: 100%;
        }

        .subtab-icon {
          filter: drop-shadow(0 0 6px rgba(93, 173, 226, 0.6));
        }
      }

      &.active {
        background: linear-gradient(135deg, rgba(255, 152, 0, 0.25), rgba(255, 152, 0, 0.15));
        border-color: rgba(255, 152, 0, 0.4);
        color: #ffb74d;
        box-shadow:
          0 0 20px rgba(255, 152, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 20%;
          right: 20%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #ff9800, transparent);
          box-shadow: 0 0 10px rgba(255, 152, 0, 0.6);
        }
      }
    }
  }
}

// Overview Content
.overview-content {
  position: relative;
  z-index: 1;

  .overview-header {
    text-align: center;
    margin-bottom: 48px;
    position: relative;

    @media (max-width: 767px) {
      margin-bottom: 32px;
    }

    .animated-title {
      font-size: clamp(2rem, 5vw, 3rem);
      font-weight: 800;
      margin-bottom: 12px;
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;

      @media (max-width: 767px) {
        flex-direction: column;
        gap: 4px;
      }

      .title-word {
        font-size: clamp(1.5rem, 4vw, 2rem);
        background: linear-gradient(135deg, #ffffff 0%, #a8d5e8 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-shadow: 0 2px 20px rgba(93, 173, 226, 0.3);
        animation: titleGlow 3s ease-in-out infinite;

        &.accent {
          font-size: clamp(1.5rem, 4vw, 2rem);;
          background: linear-gradient(135deg, #5dade2 0%, #ff6b9d 50%, #ff8c42 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: titleGlowAccent 3s ease-in-out infinite;
        }
      }
    }

    .subtitle {
      color: rgba(168, 213, 232, 0.8);
      font-size: clamp(0.9rem, 2vw, 1.1rem);
      margin: 0;
      opacity: 0;
      animation: fadeInUp 0.8s ease-out 0.3s forwards;
      padding: 0 20px;
    }
  }

  // Loading State
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    gap: 24px;

    .orbital-loader-mini {
      width: 60px;
      height: 60px;
      position: relative;
      animation: rotate 3s linear infinite;

      .core {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 16px;
        height: 16px;
        background: radial-gradient(circle, #5dade2 0%, #ff6b9d 100%);
        border-radius: 50%;
        box-shadow:
          0 0 20px rgba(93, 173, 226, 0.8),
          0 0 40px rgba(255, 107, 157, 0.4);
        animation: pulse 2s ease-in-out infinite;
      }

      .orbit {
        position: absolute;
        top: 50%;
        left: 50%;
        border: 2px solid;
        border-radius: 50%;

        &.orbit-1 {
          width: 40px;
          height: 40px;
          transform: translate(-50%, -50%);
          border-color: rgba(93, 173, 226, 0.4);
          animation: orbit 2s linear infinite;
        }

        &.orbit-2 {
          width: 55px;
          height: 55px;
          transform: translate(-50%, -50%);
          border-color: rgba(255, 107, 157, 0.3);
          animation: orbit 3s linear infinite reverse;
        }
      }
    }

    p {
      color: #a8d5e8;
      font-size: 1rem;
      margin: 0;
      opacity: 0.8;
    }
  }

  // Error State
  .error-container {
    min-height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 40px;
    max-width: 500px;
    margin: 0 auto;

    @media (max-width: 767px) {
      padding: 24px;
    }

    .error-icon {
      font-size: 48px;
      filter: drop-shadow(0 0 20px rgba(255, 107, 157, 0.6));
      animation: errorPulse 2s ease-in-out infinite;
    }

    .error-message {
      color: #ff8fab;
      font-size: 1rem;
      margin: 0;
      text-align: center;
    }

    .retry-button {
      background: linear-gradient(135deg, rgba(93, 173, 226, 0.2), rgba(93, 173, 226, 0.1));
      border: 1px solid rgba(93, 173, 226, 0.3);
      color: #5dade2;
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
      backdrop-filter: blur(10px);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(93, 173, 226, 0.3), transparent);
        transition: left 0.5s ease;
      }

      &:hover {
        background: linear-gradient(135deg, rgba(93, 173, 226, 0.3), rgba(93, 173, 226, 0.2));
        border-color: rgba(93, 173, 226, 0.5);
        transform: translateY(-2px);
        box-shadow:
          0 4px 20px rgba(93, 173, 226, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);

        &::before {
          left: 100%;
        }
      }

      &:active {
        transform: translateY(0);
      }
    }
  }

  // Quick Stats Grid - Optimiert für alle Bildschirmgrößen
  .quick-stats {
    display: grid;
    gap: 20px;

    // Responsive Grid
    @media (min-width: 1400px) {
      grid-template-columns: repeat(4, 1fr);
    }

    @media (min-width: 1024px) and (max-width: 1399px) {
      grid-template-columns: repeat(3, 1fr);
    }

    @media (min-width: 768px) and (max-width: 1023px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 767px) {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .stat-card {
      background: rgba(30, 30, 40, 0.6);
      backdrop-filter: blur(16px) saturate(150%);
      -webkit-backdrop-filter: blur(16px) saturate(150%);
      border: 1px solid rgba(93, 173, 226, 0.15);
      border-radius: 20px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all 0.4s cubic-bezier(0.4, 0.2, 0.2, 1);
      cursor: pointer;
      position: relative;
      overflow: hidden;
      min-height: 120px;

      @media (max-width: 767px) {
        padding: 20px;
        gap: 16px;
        min-height: 100px;
        border-radius: 16px;
      }

      // Card Glow Overlay
      .card-glow {
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
        opacity: 0;
        transition: opacity 0.4s ease;
        pointer-events: none;
      }

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, transparent 40%, rgba(255, 255, 255, 0.02) 100%);
        pointer-events: none;
      }

      &:hover {
        transform: translateY(-4px) scale(1.02);
        border-color: rgba(93, 173, 226, 0.3);
        box-shadow:
          0 12px 40px rgba(0, 0, 0, 0.4),
          0 0 60px rgba(93, 173, 226, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);

        .card-glow {
          opacity: 1;
        }

        .stat-icon {
          transform: scale(1.1) rotate(5deg);

          .icon-glow {
            opacity: 1;
            transform: scale(1.5);
          }
        }

        .stat-number {
          transform: scale(1.05);
        }
      }

      // Card-spezifische Farben
      &.users {
        border-color: rgba(93, 173, 226, 0.2);

        &:hover {
          border-color: rgba(93, 173, 226, 0.5);
          box-shadow:
            0 12px 40px rgba(0, 0, 0, 0.4),
            0 0 40px rgba(93, 173, 226, 0.25);
        }

        .stat-icon {
          background: linear-gradient(135deg, rgba(93, 173, 226, 0.2), rgba(93, 173, 226, 0.1));
          color: #5dade2;
        }
      }

      &.deleted {
        border-color: rgba(255, 107, 157, 0.2);

        &:hover {
          border-color: rgba(255, 107, 157, 0.5);
          box-shadow:
            0 12px 40px rgba(0, 0, 0, 0.4),
            0 0 40px rgba(255, 107, 157, 0.25);
        }

        .stat-icon {
          background: linear-gradient(135deg, rgba(255, 107, 157, 0.2), rgba(255, 107, 157, 0.1));
          color: #ff6b9d;
        }
      }

      &.posts {
        border-color: rgba(46, 204, 113, 0.2);

        .stat-icon {
          background: linear-gradient(135deg, rgba(46, 204, 113, 0.2), rgba(46, 204, 113, 0.1));
          color: #2ecc71;
        }
      }

      &.tickets {
        border-color: rgba(255, 152, 0, 0.2);

        .stat-icon {
          background: linear-gradient(135deg, rgba(255, 152, 0, 0.2), rgba(255, 152, 0, 0.1));
          color: #ff9800;
        }
      }

      &.applications {
        border-color: rgba(255, 152, 0, 0.2);

        .stat-icon {
          background: linear-gradient(135deg, rgba(255, 152, 0, 0.2), rgba(255, 152, 0, 0.1));
          color: #ff9800;
        }
      }

      &.urgent {
        border-color: rgba(255, 193, 7, 0.2);
        background: linear-gradient(135deg, rgba(30, 30, 40, 0.6), rgba(255, 193, 7, 0.05));

        .stat-icon {
          background: linear-gradient(135deg, rgba(255, 193, 7, 0.3), rgba(255, 193, 7, 0.15));
          color: #ffc107;
          animation: urgentPulse 2s ease-in-out infinite;
        }
      }

      &.new-users {
        border-color: rgba(155, 89, 182, 0.2);

        .stat-icon {
          background: linear-gradient(135deg, rgba(155, 89, 182, 0.2), rgba(155, 89, 182, 0.1));
          color: #9b59b6;
        }
      }

      &.deactivated {
        border-color: rgba(149, 165, 166, 0.2);

        .stat-icon {
          background: linear-gradient(135deg, rgba(149, 165, 166, 0.2), rgba(149, 165, 166, 0.1));
          color: #95a5a6;
        }
      }

      // Stat Icon
      .stat-icon {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
        backdrop-filter: blur(10px);
        box-shadow:
          0 4px 16px rgba(0, 0, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
        flex-shrink: 0;

        @media (max-width: 767px) {
          width: 48px;
          height: 48px;
          border-radius: 14px;
        }

        .icon-glow {
          position: absolute;
          inset: -20px;
          background: radial-gradient(circle, currentColor 0%, transparent 70%);
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.4, 0.2, 0.2, 1);
          filter: blur(20px);
          pointer-events: none;
        }

        svg {
          width: 24px;
          height: 24px;
          position: relative;
          z-index: 1;

          @media (max-width: 767px) {
            width: 22px;
            height: 22px;
          }
        }
      }

      .stat-content {
        flex: 1;
        min-width: 0;

        .stat-number {
          margin: 0;
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          font-weight: 700;
          color: #ffffff;
          line-height: 1;
          transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .stat-label {
          margin: 6px 0 0 0;
          color: rgba(168, 213, 232, 0.8);
          font-size: clamp(0.85rem, 1.5vw, 0.95rem);
          font-weight: 500;
        }
      }

      // Trend Indicators
      .stat-trend {
        display: flex;
        align-items: center;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
        background: rgba(46, 204, 113, 0.15);
        color: #2ecc71;
        border: 1px solid rgba(46, 204, 113, 0.2);

        @media (max-width: 991px) {
          display: none;
        }

        &.positive {
          background: rgba(46, 204, 113, 0.15);
          color: #2ecc71;
          border-color: rgba(46, 204, 113, 0.2);
        }

        .trend-icon {
          animation: trendBounce 2s ease-in-out infinite;
        }
      }

      // Badge
      .stat-badge {
        position: absolute;
        top: 12px;
        right: 12px;
        padding: 4px 12px;
        background: linear-gradient(135deg, rgba(255, 193, 7, 0.3), rgba(255, 193, 7, 0.2));
        border: 1px solid rgba(255, 193, 7, 0.4);
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        color: #ffc107;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        animation: badgePulse 2s ease-in-out infinite;

        @media (max-width: 767px) {
          font-size: 0.65rem;
          padding: 3px 8px;
        }
      }

      // Sparkline
      .stat-sparkline {
        position: absolute;
        bottom: 16px;
        right: 16px;
        width: 50px;
        height: 20px;
        opacity: 0.3;

        @media (max-width: 991px) {
          display: none;
        }

        .sparkline {
          width: 100%;
          height: 100%;

          polyline {
            stroke: currentColor;
            stroke-width: 2;
            fill: none;
            opacity: 0.6;
          }
        }
      }
    }
  }

  // Last Update Info
  .last-update {
    margin-top: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
    padding: 20px 32px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;

    @media (max-width: 767px) {
      margin-top: 32px;
      flex-direction: column;
      gap: 16px;
      padding: 16px 20px;
    }

    .update-text {
      margin: 0;
      color: rgba(168, 213, 232, 0.8);
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 8px;

      @media (max-width: 767px) {
        font-size: 0.85rem;
      }

      .update-icon {
        font-size: 1.1rem;
        animation: rotate 4s linear infinite;
      }
    }

    .refresh-button {
      background: linear-gradient(135deg, rgba(93, 173, 226, 0.15), rgba(93, 173, 226, 0.08));
      border: 1px solid rgba(93, 173, 226, 0.25);
      color: #5dade2;
      padding: 10px 20px;
      border-radius: 12px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s cubic-bezier(0.4, 0.2, 0.2, 1);
      backdrop-filter: blur(10px);
      position: relative;
      overflow: hidden;

      @media (max-width: 767px) {
        width: 100%;
        justify-content: center;
        padding: 12px 20px;
      }

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(93, 173, 226, 0.2), transparent);
        transition: left 0.5s ease;
      }

      .refresh-icon {
        width: 16px;
        height: 16px;
        transition: transform 0.3s ease;
      }

      &:hover {
        background: linear-gradient(135deg, rgba(93, 173, 226, 0.25), rgba(93, 173, 226, 0.15));
        border-color: rgba(93, 173, 226, 0.4);
        color: #6dd5ff;
        transform: translateY(-2px);
        box-shadow:
          0 4px 20px rgba(93, 173, 226, 0.25),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);

        @media (max-width: 767px) {
          transform: translateY(-1px);
        }

        &::before {
          left: 100%;
        }

        .refresh-icon {
          transform: rotate(180deg);
        }
      }

      &:active {
        transform: translateY(0);
      }
    }
  }
}

// Glass Card Utility
.glass-card {
  background: rgba(30, 30, 40, 0.6);
  backdrop-filter: blur(16px) saturate(150%);
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  border: 1px solid rgba(93, 173, 226, 0.15);
  border-radius: 16px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);

  @media (max-width: 767px) {
    border-radius: 12px;
  }
}

// Modal Styles
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
  position: relative;
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
  background: rgba(40, 40, 50, 0.5);
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
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
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

@keyframes titleGlow {

  0%,
  100% {
    filter: brightness(1);
  }

  50% {
    filter: brightness(1.2) drop-shadow(0 0 20px rgba(93, 173, 226, 0.5));
  }
}

@keyframes titleGlowAccent {

  0%,
  100% {
    filter: brightness(1) drop-shadow(0 0 20px rgba(255, 107, 157, 0.3));
  }

  50% {
    filter: brightness(1.3) drop-shadow(0 0 30px rgba(255, 107, 157, 0.5));
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

@keyframes orbit {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }

  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes errorPulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }
}

@keyframes urgentPulse {

  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.4);
  }

  50% {
    box-shadow: 0 0 0 10px rgba(255, 193, 7, 0);
  }
}

@keyframes trendBounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-3px);
  }
}

@keyframes badgePulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.8;
  }
}

// Safe Area Support für iOS
@supports (padding: env(safe-area-inset-top)) {
  .dashboard-content {
    @media (max-width: 767px) {
      padding-left: calc(1rem + env(safe-area-inset-left));
      padding-right: calc(1rem + env(safe-area-inset-right));
      padding-bottom: env(safe-area-inset-bottom);
    }
  }

  .modal-overlay {
    @media (max-width: 767px) {
      padding: calc(16px + env(safe-area-inset-top)) calc(16px + env(safe-area-inset-right)) calc(16px + env(safe-area-inset-bottom)) calc(16px + env(safe-area-inset-left));
    }
  }
}

// Reduced Motion Support
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>