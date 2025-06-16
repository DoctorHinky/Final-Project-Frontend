<!-- src/components/layout/AdminSidebar.vue -->
<template>
  <aside class="admin-sidebar" :class="{ 'open': isOpen }">
    <!-- Logo wie in Member-Sidebar -->
    <a href="/" class="logo-link">
      <img src="../../assets/images/Logo.png" alt="Logo" class="logo-Sidebar" />
    </a>
    
    <!-- Sidebar-Header mit Benutzerinfo -->
    <div class="sidebar-header">
      <img src="../../assets/images/AvatarIcon1.webp" alt="Account Logo" class="account-logo" />
      <div class="header-content">
        <h3 v-if="userName">{{ userName }}</h3>
        <p v-if="userRole" class="user-role">{{ userRole }}</p>
      </div>
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

    <!-- Sidebar-Footer mit Zurück-Button -->
    <div class="sidebar-footer">
      <button class="back-button" @click="navigateToMemberDashboard">
        <span class="back-icon">
          <ArrowLeftIcon class="h-5 w-5" />
        </span>
        <span class="back-text">MemberDashboard</span>
      </button>
    </div>
  </aside>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { 
  HomeIcon,
  UsersIcon, 
  UserMinusIcon,
  DocumentTextIcon, 
  TicketIcon,
  DocumentIcon, // Neues Icon für Bewerbungen
  ArrowLeftIcon,
} from '@heroicons/vue/24/outline';

// TypeScript Interface für Token-Payload
interface TokenPayload {
  userId?: string;
  username?: string;
  name?: string;
  email?: string;
  role?: string;
  roles?: string[];
  isAdmin?: boolean;
  isAuthor?: boolean;
}

export default defineComponent({
  name: 'AdminSidebar',
  components: {
    HomeIcon,
    UsersIcon,
    UserMinusIcon,
    DocumentTextIcon,
    DocumentIcon, // Bewerbungen Icon
    TicketIcon,
    ArrowLeftIcon,
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
    
    // Benutzerinformationen
    const userName = ref('');
    const userRole = ref('');
    
    // Menüelemente definieren mit HeroIcons - ERWEITERT um Bewerbungen
    const menuItems = ref([
      { 
        id: 'overview',
        text: 'Überblick', 
        icon: HomeIcon
      },
      { 
        id: 'all-users', 
        text: 'Alle User', 
        icon: UsersIcon
      },
      { 
        id: 'applications', // NEU: Bewerbungen Menüpunkt
        text: 'Bewerbungen', 
        icon: DocumentIcon
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
        icon: UserMinusIcon
      },
    ]);

    // Bei Montage der Komponente die Benutzerinformationen laden
    onMounted(() => {
      try {
        // Token dekodieren für Benutzerinformationen
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        if (token) {
          try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const decoded = JSON.parse(window.atob(base64)) as TokenPayload;
            
            // Username direkt aus dem Token
            userName.value = decoded.username || 'Administrator';
            
            // Rolle anzeigen (auf Deutsch)
            const roleMap: Record<string, string> = {
              'admin': 'Administrator',
              'author': 'Autor',
              'user': 'Benutzer',
              'moderator': 'Moderator'
            };
            
            // Rolle für Anzeige setzen
            const displayRole = decoded.role || '';
            userRole.value = roleMap[displayRole.toLowerCase()] || displayRole;
            
          } catch (e) {
            console.error('Token konnte nicht dekodiert werden:', e);
            userName.value = 'Administrator';
            userRole.value = 'Admin';
          }
        } else {
          // Kein Token
          userName.value = 'Administrator';
          userRole.value = 'Admin';
        }
        
      } catch (error) {
        console.error('Fehler beim Laden der Benutzerinformationen:', error);
        userName.value = 'Administrator';
        userRole.value = 'Admin';
      }
    });

    // Prüfen ob ein Item aktiv ist
    const isActiveItem = (itemId: string) => {
      // Wenn kein activeMenu gesetzt ist und wir auf der Dashboard-Route ohne tab sind,
      // dann ist 'overview' aktiv
      if (!props.activeMenu && route.path === '/admin/dashboard' && !route.query.tab) {
        return itemId === 'overview';
      }
      
      // Ansonsten normaler Check
      return props.activeMenu === itemId;
    };

    // Menüpunkt auswählen
    const selectMenuItem = (itemId: string) => {
      // Event emittieren
      emit('select-menu', itemId);
      
      // Navigation anpassen
      if (itemId === 'overview') {
        // Für Dashboard/Übersicht keine Query-Parameter
        router.push({
          path: '/admin/dashboard'
        });
      } else {
        // Für alle anderen Items mit Tab-Query navigieren
        router.push({
          path: '/admin/dashboard',
          query: { tab: itemId }
        });
      }
    };

    // Navigation zum Member Dashboard
    const navigateToMemberDashboard = () => {
      router.push('/member/dashboard');
    };

    return {
      menuItems,
      selectMenuItem,
      isActiveItem,
      navigateToMemberDashboard,
      userName,
      userRole
    };
  }
});
</script>

<style lang="scss" scoped>
.admin-sidebar {
  position: fixed;
  top: 70px;
  left: -280px;
  width: 280px;
  height: 100vh;
  z-index: 11990;
  transition: left 0.3s ease;
  display: flex;
  flex-direction: column;
  padding-top: 20px;
  background-color: #1c1c1c;
  border-right: 1px solid #333;
  box-shadow: inset -5px 0 15px rgba(0, 0, 0, 0.2);
  color: #d0d0d0;
  z-index: 1000;

  &.open {
    left: 0;
    box-shadow: 5px 0 15px rgba(0, 0, 0, 0.3);
    z-index: 11990;
  }

  // Logo Styling
  .logo-link {
    display: block;
    margin: 0 auto 20px;
    width: 80px;
    height: 80px;
    
    .logo-Sidebar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      opacity: 0.9;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(93, 173, 226, 0.3);

      &:hover {
        opacity: 1;
        transform: scale(1.05);
        box-shadow: 
          0 6px 20px rgba(93, 173, 226, 0.4),
          0 4px 12px rgba(255, 107, 157, 0.3);
      }
    }
  }

  // Sidebar-Header mit Benutzerinfo
  .sidebar-header {
    display: flex;
    align-items: center;
    padding: 16px;
    margin-bottom: 0;
    border-bottom: 1px solid #333;
    background: linear-gradient(135deg, rgba(93, 173, 226, 0.05), rgba(255, 107, 157, 0.05));

    .account-logo {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      object-fit: cover;
      margin-right: 12px;
      border: 2px solid rgba(93, 173, 226, 0.3);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .header-content {
      flex: 1;

      h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: bold;
        color: #fff;
        margin-bottom: 2px;
      }

      .user-role {
        margin: 0;
        font-size: 0.85rem;
        color: #5DADE2;
        font-weight: 500;
      }
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
      transition: all 0.3s ease;
      border-radius: 6px;

      &:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.1);
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
        background: linear-gradient(135deg, #5DADE2, #FF6B9D);
        color: #fff;
        box-shadow: 0 2px 8px rgba(93, 173, 226, 0.3);
        
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(to bottom, #FF8C42, #FF6B9D);
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

    .back-button {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 14px 20px;
      background: linear-gradient(135deg, #2a2a2a, #1e1e1e);
      border: 1px solid #444;
      border-radius: 8px;
      color: #b0b0b0;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      gap: 10px;

      &:hover {
        background: linear-gradient(135deg, #333, #252525);
        color: #fff;
        border-color: #5DADE2;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(93, 173, 226, 0.2);

        .back-icon {
          transform: translateX(-3px);
        }
      }

      &:active {
        transform: translateY(0);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      }

      .back-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.3s ease;

        svg {
          width: 20px;
          height: 20px;
        }
      }

      .back-text {
        font-size: 0.95rem;
        letter-spacing: 0.5px;
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