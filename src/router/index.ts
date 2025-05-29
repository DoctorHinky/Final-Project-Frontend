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
import { jwtDecode } from "jwt-decode";
const requireAuth = (to, from, next) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    next();
  } else {
    next({ path: "/login-register" });
  }
};

const requireAdminRedirect = (to, from, next) => {
  const token = localStorage.getItem("access_token");

  if (!token) return next("/"); // Kein Token → Main Page

  try {
    const decoded = jwtDecode(token);
    if (decoded.role === "ADMIN" || decoded.role === "MODERATOR") {
      return next("/admin/dashboard"); // Automatisch weiterleiten
    } else {
      return next("/"); // Falsche Rolle → Main Page
    }
  } catch (err) {
    console.error("Fehler beim Token-Dekodieren:", err);
    return next("/");
  }
};

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: AppLayout,
    children: [
      { path: '', name: 'Home', component: LandingPage },
      { path: 'login-register', name: 'LoginRegister', component: LoginRegister },
      { path: '/admin/login', name: 'AdminLoginPage', component: LoginRegister },
      { path: 'contact', name: 'Contact', component: Contact },
      { path: 'privacy-policy', name: 'PrivacyPolicy', component: PrivacyPolicy },
      { path: 'imprint', name: 'Imprint', component: Imprint },
      { path: 'terms-of-service', name: 'TermsOfService', component: TermsOfService },
      { path: '404', name: 'NotFound', component: NotFound }
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
        props: (route) => ({ defaultTab: route.query.tab || 'overview' })
      },
      { path: 'profile', name: 'UserProfile', redirect: { name: 'MemberDashboard', query: { tab: 'settings' } } },
      { path: 'favorites', name: 'UserFavorites', redirect: { name: 'MemberDashboard', query: { tab: 'favorites' } } },
      { path: 'articles', name: 'UserArticles', redirect: { name: 'MemberDashboard', query: { tab: 'my-articles' } } },
      { path: 'library', name: 'UserLibrary', redirect: { name: 'MemberDashboard', query: { tab: 'library' } } },
      { path: 'friends', name: 'UserFriends', redirect: { name: 'MemberDashboard', query: { tab: 'friends' } } },
      { path: 'notifications', name: 'UserNotifications', redirect: { name: 'MemberDashboard', query: { tab: 'notifications' } } },
      { path: 'settings', name: 'MemberSettings', redirect: { name: 'MemberDashboard', query: { tab: 'settings' } } }
    ]
  },
 {
  path: '/admin',
  beforeEnter: requireAdminRedirect,
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../pages/admin/Dashboard.vue'),
        beforeEnter: requireAdminRedirect,
        meta: { requiresAdmin: true }
      },
      {
        path: 'tickets',
        name: 'AdminTickets',
        component: () => import('../pages/admin/Tickets.vue'),
        beforeEnter: requireAdminRedirect,
        meta: { requiresAdmin: true },
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

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 130 };
    return { top: 0 };
  }
});

router.beforeEach((to, from, next) => {
  const loggedIn = authService.isLoggedIn();
  const adminLoggedIn = authService.isAdminLoggedIn();

  const requiresAdmin = to.matched.some((record) => record.meta?.requiresAdmin === true);

  // Adminbereich geschützt → aber nicht eingeloggt
  if (requiresAdmin && !adminLoggedIn) {
    return next({ path: '/admin', query: { redirect: to.fullPath } });
  }

  // Eingeloggter User auf Login-Seite? → redirect
  if (to.path === '/login-register' && loggedIn) {
    return next('/member/dashboard');
  }

  next();
});

export default router;
