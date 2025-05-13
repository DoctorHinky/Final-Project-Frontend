<!-- src/components/admin/AdminSidebar.vue -->
<template>
  <aside class="admin-sidebar" :class="{ 'open': isOpen }">
    <!-- Sidebar-Header mit Logo und Schließen-Button -->
    <div class="sidebar-header">
      <h2 class="admin-title">ADMIN DASHBOARD</h2>
      <button class="close-sidebar" @click="$emit('close')">×</button>
    </div>

    <!-- Sidebar-Navigation -->
    <nav class="sidebar-nav">
      <div v-for="(item, index) in menuItems" :key="index" class="nav-item" :class="{ active: activeMenu === item.id }"
        @click="selectMenuItem(item.id)">
        <span class="nav-icon">
          <component :is="item.icon" class="h-6 w-6" />
        </span>
        <span class="nav-text">{{ item.text }}</span>
      </div>
    </nav>

    <!-- Admin-Hinweis -->
    <div class="admin-restricted">
      <span class="lock-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </span>
      <span>NUR FÜR ADMIN</span>
    </div>

    <!-- Sidebar-Footer mit Abmelde-Button -->
    <div class="sidebar-footer">
      <button class="logout-button" @click="$emit('logout')">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        <span>Abmelden</span>
      </button>
    </div>
  </aside>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'AdminSidebar',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    activeMenu: {
      type: String,
      default: 'users'
    }
  },
  emits: ['select-menu', 'close', 'logout'],
  setup(props, { emit }) {
    // Menüelemente definieren
    const menuItems = ref([
      { 
        id: 'user-search', 
        text: 'User Suche', 
        icon: {
          template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>'
        }
      },
      { 
        id: 'all-users', 
        text: 'Alle User', 
        icon: {
          template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>'
        }
      },
      { 
        id: 'all-authors', 
        text: 'Alle Autoren', 
        icon: {
          template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>'
        }
      },
      { 
        id: 'active-posts', 
        text: 'Active Posts', 
        icon: {
          template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>'
        }
      },
      { 
        id: 'staff-team', 
        text: 'Staff Team', 
        icon: {
          template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>'
        }
      }
    ]);

    // Menüpunkt auswählen
    const selectMenuItem = (itemId: string) => {
      emit('select-menu', itemId);
    };

    return {
      menuItems,
      selectMenuItem
    };
  }
});
</script>

<style lang="scss" scoped>
.admin-sidebar {
  position: fixed;
  top: 0;
  left: -280px;
  width: 280px;
  height: 100vh;
  z-index: 990;
  transition: left 0.3s ease;
  display: flex;
  flex-direction: column;
  padding-top: 70px; // Platz für den Header
  background-color: #1c1c1c;
  border-right: 1px solid #333;
  box-shadow: inset -5px 0 15px rgba(0, 0, 0, 0.2);
  color: #d0d0d0;

  &.open {
    left: 0;
    box-shadow: 5px 0 15px rgba(0, 0, 0, 0.3);
  }

  // Sidebar-Header
  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid #333;

    .admin-title {
      margin: 0;
      font-size: 0.9rem;
      font-weight: bold;
      letter-spacing: 1px;
      color: #888;
    }

    .close-sidebar {
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #888;

      &:hover {
        color: #fff;
      }
    }
  }

  // Sidebar-Navigation
  .sidebar-nav {
    flex: 1;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;

    .nav-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;
      color: #a0a0a0;

      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: #fff;
      }

      &.active {
        background: linear-gradient(135deg, #333, #222);
        color: #ff9800;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        border-left: 3px solid #ff9800;
      }

      .nav-icon {
        margin-right: 16px;
        font-size: 1.2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
      }

      .nav-text {
        font-weight: 500;
      }
    }
  }

  // Admin-Hinweis
  .admin-restricted {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    gap: 8px;
    font-size: 0.8rem;
    font-weight: bold;
    color: #ff9800;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-top: 1px dashed #333;
    background-color: rgba(255, 152, 0, 0.1);

    .lock-icon {
      color: #ff9800;
    }
  }

  // Sidebar-Footer
  .sidebar-footer {
    padding: 16px;
    border-top: 1px solid #333;

    .logout-button {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      padding: 12px;
      border-radius: 6px;
      background: linear-gradient(135deg, #600, #800);
      color: white;
      border: none;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 500;

      &:hover {
        background: linear-gradient(135deg, #700, #900);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      }
    }
  }
}

// Medienquery für große Bildschirme
@media (min-width: 1024px) {
  .admin-sidebar {
    left: 0;
    transform: translateX(-100%);

    &.open {
      transform: translateX(0);
    }
  }
}
</style>