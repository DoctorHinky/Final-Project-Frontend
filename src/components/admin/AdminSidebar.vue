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

    <!-- Admin-Hinweis -->
    <div class="admin-restricted">
      <span class="lock-icon">
        <LockClosedIcon class="h-4 w-4" />
      </span>
      <span>NUR FÜR ADMIN</span>
    </div>

    <!-- Sidebar-Footer mit Abmelde-Button -->
    <div class="sidebar-footer">
      <button class="logout-button" @click="$emit('logout')">
        <LogoutIcon class="h-4 w-4 Icon" />
        <span>Abmelden</span>
      </button>
    </div>
  </aside>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { 
  MagnifyingGlassIcon, 
  UsersIcon, 
  PencilIcon, 
  DocumentTextIcon, 
  TicketIcon,
  StarIcon,
  LockClosedIcon,
  ArrowRightOnRectangleIcon as LogoutIcon
} from '@heroicons/vue/24/outline';

export default defineComponent({
  name: 'AdminSidebar',
  components: {
    MagnifyingGlassIcon,
    UsersIcon,
    PencilIcon,
    DocumentTextIcon,
    TicketIcon,
    StarIcon,
    LockClosedIcon,
    LogoutIcon
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    activeMenu: {
      type: String,
      default: 'user-search'
    }
  },
  emits: ['select-menu', 'close', 'logout'],
  setup(props, { emit }) {
    const router = useRouter();
    const route = useRoute();
    
    // Menüelemente definieren mit HeroIcons
    const menuItems = ref([
      { 
        id: 'user-search', 
        text: 'User Suche', 
        icon: MagnifyingGlassIcon
      },
      { 
        id: 'all-users', 
        text: 'Alle User', 
        icon: UsersIcon
      },
      { 
        id: 'all-authors', 
        text: 'Alle Autoren', 
        icon: PencilIcon
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
        id: 'staff-team', 
        text: 'Staff Team', 
        icon: StarIcon
      }
    ]);

    // Prüfen ob ein Item aktiv ist
    const isActiveItem = (itemId: string) => {
      // Spezialbehandlung für Tickets
      if (itemId === 'tickets' && route.path === '/admin/tickets') {
        return true;
      }
      // Für andere Items den activeMenu prop verwenden
      return props.activeMenu === itemId;
    };

    // Menüpunkt auswählen - Vereinfachte Version
    const selectMenuItem = (itemId: string) => {
      console.log('Sidebar: Selecting menu item:', itemId); // Debug-Log
      
      // IMMER das Event emittieren
      emit('select-menu', itemId);
      
      // Zusätzliche Navigation nur für spezielle Fälle
      if (itemId === 'tickets') {
        router.push('/admin/tickets');
      } else if (route.path === '/admin/tickets') {
        // Wenn wir auf der Tickets-Seite sind und einen anderen Tab wählen
        router.push({
          path: '/admin/dashboard',
          query: { tab: itemId }
        });
      }
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
.Icon{
  width: 20px;
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