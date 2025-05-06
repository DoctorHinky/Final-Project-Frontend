// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import LandingPage from '../pages/LandingPage.vue';
import LoginRegister from '../pages/LoginRegister.vue';
import Articles from '../pages/Articles.vue';
import Contact from '../pages/Contact.vue';
import AppLayout from '../components/layout/AppLayout.vue';

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
      // Hier kannst du weitere Routen hinzufügen, die innerhalb des Layouts angezeigt werden sollen
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

export default router;