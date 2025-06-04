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
      <div v-for="(item, index) in menuItems" :key="index" class="nav-item" :class="{ active: isActiveItem(item.id) }"
        @click="selectMenuItem(item.id)">
        <span class="nav-icon">
          <component :is="item.icon" class="h-6 w-6" />
        </span>
        <span class="nav-text">{{ item.text }}</span>
      </div>
    </nav>

    <!-- Sidebar-Footer mit Abmelde-Button -->
    <div class="sidebar-footer">
    </div>
  </aside>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { 
  MagnifyingGlassIcon, 
  UsersIcon, 
  UserMinusIcon,
  DocumentTextIcon, 
  TicketIcon,
  StarIcon,
  LockClosedIcon,
} from '@heroicons/vue/24/outline';

export default defineComponent({
  name: 'AdminSidebar',
  components: {
    MagnifyingGlassIcon,
    UsersIcon,
    UserMinusIcon,
    DocumentTextIcon,
    TicketIcon,
    StarIcon,
    LockClosedIcon,
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    activeMenu: {
      type: String,
      default: ''
    }
  },
  emits: ['select-menu', 'close', 'logout'],
  setup(props, { emit }) {
    const router = useRouter();
    const route = useRoute();
    
    // Menüelemente definieren mit HeroIcons
    const menuItems = ref([
      { 
        id: 'all-users', 
        text: 'Alle User', 
        icon: UsersIcon
      },
      { 
        id: 'active-posts', 
        text: 'Active Posts', 
        icon: DocumentTextIcon
      },
      { 
        id: 'tickets', 
        text: 'Tickets', 
        icon: TicketIcon
      },
      { 
        id: 'deleted-users', 
        text: 'Gelöschte User', 
        icon: UserMinusIcon // Besseres Icon für gelöschte User
      },
      { 
        id: 'staff-team', 
        text: 'Staff Team', 
        icon: StarIcon
      }
    ]);

    // Prüfen ob ein Item aktiv ist
    const isActiveItem = (itemId: string) => {
      // Für alle Items den activeMenu prop verwenden
      return props.activeMenu === itemId;
    };

    // Menüpunkt auswählen - Vereinfachte Version
    const selectMenuItem = (itemId: string) => {
      
      // IMMER das Event emittieren
      emit('select-menu', itemId);
      
      // Für alle Items zum Dashboard mit Tab navigieren
      router.push({
        path: '/admin/dashboard',
        query: { tab: itemId }
      });
    };

    return {
      menuItems,
      selectMenuItem,
      isActiveItem
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
      transition: color 0.3s ease;

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
      position: relative;

      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: #fff;
      }

      &.active {
        background: linear-gradient(135deg, #333, #222);
        color: #ff9800;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background-color: #ff9800;
          border-radius: 0 3px 3px 0;
        }
      }

      .nav-icon {
        margin-right: 16px;
        font-size: 1.2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;

        svg {
          width: 24px;
          height: 24px;
        }
      }

      .nav-text {
        font-weight: 500;
        font-size: 0.95rem;
      }
    }
  }

  // Sidebar-Footer
  .sidebar-footer {
    padding: 16px;
    border-top: 1px solid #333;
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

// Scrollbar Styling
.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: #1c1c1c;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 3px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>