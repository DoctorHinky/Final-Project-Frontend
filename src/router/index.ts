// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import LandingPage from '../pages/LandingPage.vue';
import LoginRegister from '../pages/LoginRegister.vue';
import AppLayout from '../components/layout/AppLayout.vue';

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
      }
      // Hier kannst du weitere Routen hinzufügen, die innerhalb des Layouts angezeigt werden sollen
    ]
  }
];

// Router erstellen
const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;