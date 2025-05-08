// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import LandingPage from '../pages/LandingPage.vue';
import LoginRegister from '../pages/LoginRegister.vue';
import Contact from '../pages/Contact.vue';
import AppLayout from '../components/layout/AppLayout.vue';
import Dashboard from '../pages/member/Dashboard.vue';
import { authService } from '@/services/auth.service';

// Platzhalter für die rechtlichen Seiten
const PlaceholderPage = {
  template: `
    <div class="placeholder-page container" style="padding: 150px 20px 50px;">
      <h1>{{ title }}</h1>
      <p>Diese Seite ist derzeit in Bearbeitung. Bitte schau später wieder vorbei.</p>
      <router-link to="/" style="display: inline-block; margin-top: 20px; text-decoration: none; color: #26BB77;">Zurück zur Startseite</router-link>
    </div>
  `,
  props: {
    title: {
      type: String,
      required: true
    }
  }
};

// Navigation Guard für geschützte Routen
const requireAuth = (to: any, from: any, next: any) => {
  if (authService.isLoggedIn()) {
    next(); // Benutzer ist eingeloggt, Navigation fortsetzen
  } else {
    // Benutzer ist nicht eingeloggt, Weiterleitung zur Anmeldeseite
    next({ 
      path: '/login-register', 
      query: { redirect: to.fullPath } 
    });
  }
};

// Routen definieren
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: LandingPage
      },
      {
        path: 'login-register',
        name: 'LoginRegister',
        component: LoginRegister
      },
      {
        path: 'contact',
        name: 'Contact',
        component: Contact
      },
      {
        path: 'datenschutz',
        name: 'Datenschutz',
        component: { 
          ...PlaceholderPage,
          props: { title: 'Datenschutz' }
        }
      },
      {
        path: 'impressum',
        name: 'Impressum',
        component: { 
          ...PlaceholderPage,
          props: { title: 'Impressum' }
        }
      },
      {
        path: 'agb',
        name: 'AGB',
        component: { 
          ...PlaceholderPage,
          props: { title: 'Allgemeine Geschäftsbedingungen' }
        }
      }
    ]
  },
  
  // Geschützte Routen für eingeloggte Benutzer
  {
    path: '/member',
    beforeEnter: requireAuth, // Navigation Guard für geschützte Routen
    children: [
      {
        path: 'dashboard',
        name: 'MemberDashboard',
        component: Dashboard,
        // Query-Parameter für das Tab (Menüpunkt)
        props: (route) => ({ 
          defaultTab: route.query.tab || 'overview' 
        })
      },
      // Diese Routen können später durch tatsächliche Komponenten ersetzt werden,
      // diese werden nun durch das Dashboard mit Tabs abgedeckt
      {
        path: 'profile',
        name: 'UserProfile',
        redirect: { name: 'MemberDashboard', query: { tab: 'settings' } }
      },
      {
        path: 'favorites',
        name: 'UserFavorites',
        redirect: { name: 'MemberDashboard', query: { tab: 'favorites' } }
      },
      {
        path: 'articles',
        name: 'UserArticles',
        redirect: { name: 'MemberDashboard', query: { tab: 'my-articles' } }
      },
      {
        path: 'library',
        name: 'UserLibrary',
        redirect: { name: 'MemberDashboard', query: { tab: 'library' } }
      },
      {
        path: 'friends',
        name: 'UserFriends',
        redirect: { name: 'MemberDashboard', query: { tab: 'friends' } }
      },
      {
        path: 'notifications',
        name: 'UserNotifications',
        redirect: { name: 'MemberDashboard', query: { tab: 'notifications' } }
      }
    ]
  },
  
  // Fallback-Route für nicht gefundene Seiten
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

// Router erstellen
const router = createRouter({
  history: createWebHistory(),
  routes,
  // Scroll-Verhalten anpassen: Bei jeder Navigation nach oben scrollen,
  // aber den Hash-Anker berücksichtigen
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      // Wenn es eine gespeicherte Position gibt (z.B. beim Zurück-Button), diese verwenden
      return savedPosition;
    } else if (to.hash) {
      // Wenn es einen Hash gibt, zu diesem Element scrollen
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 130 // Header-Höhe berücksichtigen
      };
    } else {
      // Ansonsten nach oben scrollen
      return { top: 0 };
    }
  }
});

// Globaler Navigation Guard
router.beforeEach((to, from, next) => {
  // Da wir kein echtes Backend haben, führen wir hier eine einfache Auth-Überprüfung durch
  const publicPages = ['/', '/login-register', '/contact', '/datenschutz', '/impressum', '/agb'];
  const authRequired = !publicPages.includes(to.path) && !to.path.startsWith('/public/');
  const loggedIn = authService.isLoggedIn();

  // Wenn der Benutzer bereits eingeloggt ist und versucht, die Login-Seite aufzurufen,
  // leiten wir ihn zur Member-Startseite weiter
  if (to.path === '/login-register' && loggedIn) {
    return next('/member/dashboard');
  }

  // Bei geschützten Routen prüfen, ob der Benutzer angemeldet ist
  if (authRequired && !loggedIn) {
    return next({
      path: '/login-register',
      query: { redirect: to.fullPath }
    });
  }

  next();
});

export default router;