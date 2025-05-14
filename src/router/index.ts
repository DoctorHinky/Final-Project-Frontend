// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import LandingPage from '../pages/LandingPage.vue';
import LoginRegister from '../pages/LoginRegister.vue';
import Contact from '../pages/Contact.vue';
import NotFound from '../pages/NotFound.vue';
import PrivacyPolicy from '../pages/PrivacyPolicyPage.vue';
import Imprint from '../pages/Imprint.vue';
import TermsOfService from '../pages/TermsOfService.vue';
import AppLayout from '../components/layout/AppLayout.vue';
import Dashboard from '../pages/member/Dashboard.vue';
import { authService } from '../services/auth.service';

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

// Navigation Guard für Admin-Routen
const requireAdminAuth = (to: any, from: any, next: any) => {
  if (authService.isAdminLoggedIn()) {
    next(); // Admin ist eingeloggt, Navigation fortsetzen
  } else {
    // Admin ist nicht eingeloggt, Weiterleitung zur Admin-Anmeldeseite
    next({ 
      path: '/admin', 
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
        path: 'privacy-policy',
        name: 'PrivacyPolicy',
        component: PrivacyPolicy
      },
      {
        path: 'imprint',
        name: 'Imprint',
        component: Imprint
      },
      {
        path: 'terms-of-service',
        name: 'TermsOfService',
        component: TermsOfService
      },
      {
        path: '404',
        name: 'NotFound',
        component: NotFound
      }
    ]
  },
  
  {
    path: '/member',
    beforeEnter: requireAuth,
    children: [
      {
        path: 'dashboard',
        name: 'MemberDashboard',
        component: Dashboard,
        props: (route) => ({ 
          defaultTab: route.query.tab || 'overview' 
        })
      },
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
      },
      {
        path: 'settings',
        name: 'MemberSettings',
        redirect: { name: 'MemberDashboard', query: { tab: 'settings' } }
      }
    ]
  },
  
  {
    path: '/admin',
    children: [
      {
        path: '',
        name: 'AdminLogin',
        component: () => import('../pages/admin/Login.vue')
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../pages/admin/Dashboard.vue'),
        beforeEnter: requireAdminAuth
      },
      {
        path: 'tickets',
        name: 'AdminTickets',
        component: () => import('../pages/admin/Tickets.vue'),
        beforeEnter: requireAdminAuth,
        props: (route) => ({
          ticketId: route.query.id || null
        })
      }
    ]
  },
  
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'NotFound' }
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
  const publicPages = ['/', '/login-register', '/contact', '/privacy-policy', '/imprint', '/terms-of-service', '/404', '/admin'];
  const authRequired = !publicPages.includes(to.path) && !to.path.startsWith('/public/');
  const adminRequired = to.path.startsWith('/admin/');
  const loggedIn = authService.isLoggedIn();
  const adminLoggedIn = authService.isAdminLoggedIn();

  // Wenn der Benutzer bereits eingeloggt ist und versucht, die Login-Seite aufzurufen,
  // leiten wir ihn zur Member-Startseite weiter
  if (to.path === '/login-register' && loggedIn) {
    return next('/member/dashboard');
  }

  // Wenn der Admin bereits eingeloggt ist und versucht, die Admin-Login-Seite aufzurufen,
  // leiten wir ihn zum Admin-Dashboard weiter
  if (to.path === '/admin' && adminLoggedIn) {
    return next('/admin/dashboard');
  }

  // Bei geschützten Admin-Routen prüfen, ob der Admin angemeldet ist
  if (adminRequired && !adminLoggedIn) {
    return next({
      path: '/admin',
      query: { redirect: to.fullPath }
    });
  }

  // Bei geschützten Routen prüfen, ob der Benutzer angemeldet ist
  if (authRequired && !loggedIn && !adminLoggedIn) {
    return next({
      path: '/login-register',
      query: { redirect: to.fullPath }
    });
  }

  next();
});

export default router;