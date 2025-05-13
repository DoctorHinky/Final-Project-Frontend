<!-- src/pages/admin/Dashboard.vue -->
<template>
  <AdminLayout :page-title="pageTitle" :active-menu="activeTab" @menu-change="handleMenuChange">
    <!-- User Suche -->
    <UserSearch v-if="activeTab === 'user-search'" @user-selected="viewUserDetails" />

    <!-- Alle User -->
    <UserList v-if="activeTab === 'all-users'" @user-selected="viewUserDetails" />

    <!-- Alle Autoren -->
    <AuthorList v-if="activeTab === 'all-authors'" @user-selected="viewUserDetails" />

    <!-- Active Posts -->
    <PostList v-if="activeTab === 'active-posts'" />

    <!-- Staff Team -->
    <StaffList v-if="activeTab === 'staff-team'" @user-selected="viewUserDetails" />

    <!-- User Details Modal -->
    <div class="modal-overlay" v-if="showUserDetails" @click="closeUserDetails">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>Benutzerdetails</h3>
          <button class="close-button" @click="closeUserDetails">×</button>
        </div>
        <div class="modal-content">
          <UserDetail :user-id="selectedUserId" />
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import UserSearch from '@/components/admin/users/UserSearch.vue';
import UserList from '@/components/admin/users/UserList.vue';
import AuthorList from '@/components/admin/authors/AuthorList.vue';
import PostList from '@/components/admin/posts/PostList.vue';
import StaffList from '@/components/admin/staff/StaffList.vue';
import UserDetail from '@/components/admin/users/UserDetail.vue';

export default defineComponent({
  name: 'AdminDashboard',
  components: {
    AdminLayout,
    UserSearch,
    UserList,
    AuthorList,
    PostList,
    StaffList,
    UserDetail
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    
    // Aktiver Tab
    const activeTab = ref((route.query.tab as string) || 'user-search');
    
    // Seitentitel basierend auf dem aktiven Tab
    const pageTitle = computed(() => {
      switch (activeTab.value) {
        case 'user-search': return 'User Suche';
        case 'all-users': return 'Alle User';
        case 'all-authors': return 'Alle Autoren';
        case 'active-posts': return 'Active Posts';
        case 'staff-team': return 'Staff Team';
        default: return 'Admin Dashboard';
      }
    });

    // User Details Modal
    const showUserDetails = ref(false);
    const selectedUserId = ref<string | null>(null);

    // Menü-Änderung Handler
    const handleMenuChange = (tabId: string) => {
      activeTab.value = tabId;
      
      // URL aktualisieren, ohne Neuladen der Seite
      router.push({
        query: { ...route.query, tab: tabId }
      });
    };

    // User Details anzeigen
    const viewUserDetails = (userId: string) => {
      selectedUserId.value = userId;
      showUserDetails.value = true;
      
      // Body-Scroll verhindern, wenn Modal geöffnet ist
      document.body.style.overflow = 'hidden';
    };

    // User Details schließen
    const closeUserDetails = () => {
      showUserDetails.value = false;
      selectedUserId.value = null;
      
      // Body-Scroll wiederherstellen
      document.body.style.overflow = '';
    };

    // Beim Mounten Tab aus Query-Parameter setzen
    onMounted(() => {
      if (route.query.tab) {
        activeTab.value = route.query.tab as string;
      }
    });

    return {
      activeTab,
      pageTitle,
      handleMenuChange,
      showUserDetails,
      selectedUserId,
      viewUserDetails,
      closeUserDetails
    };
  }
});
</script>

<style lang="scss" scoped>
// Modal Styles
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
  max-width: 800px;
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

.modal-content {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
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
</style>