// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import LandingPage from '../pages/LandingPage.vue';
import LoginRegister from '../pages/LoginRegister.vue';
import Articles from '../pages/Articles.vue';
import Contact from '../pages/Contact.vue';
import AppLayout from '../components/layout/AppLayout.vue';
import ProtectedRoute from '../components/route/ProtectedRoute.vue';
import MemberArticlesNew from '../pages/member/Articles.vue'; // Importiere die neue Komponente
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
        path: 'articles',
        name: 'Articles',
        component: Articles
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
  
  // Geschützte Routen für eingeloggte Benutzer als eigenständige Route ohne AppLayout
  {
    path: '/member',
    beforeEnter: requireAuth, // Navigation Guard für geschützte Routen
    children: [
      {
        path: 'articles',
        name: 'MemberArticles',
        component: MemberArticlesNew
      },
      {
        path: 'profile',
        name: 'UserProfile',
        component: { 
          ...PlaceholderPage,
          props: { title: 'Mein Profil' }
        }
      },
      {
        path: 'favorites',
        name: 'UserFavorites',
        component: { 
          ...PlaceholderPage,
          props: { title: 'Meine Favoriten' }
        }
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
  const publicPages = ['/', '/login-register', '/articles', '/contact', '/datenschutz', '/impressum', '/agb'];
  const authRequired = !publicPages.includes(to.path) && !to.path.startsWith('/public/');
  const loggedIn = authService.isLoggedIn();

  // Wenn der Benutzer bereits eingeloggt ist und versucht, die Login-Seite aufzurufen,
  // leiten wir ihn zur Member-Startseite weiter
  if (to.path === '/login-register' && loggedIn) {
    return next('/member/articles');
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