// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import AppLayout from '../components/layout/AppLayout.vue';
import LoginRegister from '../pages/LoginRegister.vue';

// Routen definieren
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: AppLayout
  },
  {
    path: '/login-register',
    name: 'LoginRegister',
    component: LoginRegister
  }
];

// Router erstellen
const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;