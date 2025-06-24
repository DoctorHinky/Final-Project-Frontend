// src/router/index.ts
import {
  createRouter,
  createWebHistory,
  type NavigationGuardNext,
  type RouteLocationNormalized,
  type RouteRecordRaw,
} from "vue-router";
import LandingPage from "../pages/LandingPage.vue";
import LoginRegister from "../pages/LoginRegister.vue";
import Dashboard from "../pages/member/Dashboard.vue";
import TermsOfService from "../pages/TermsOfService.vue";
import AppLayout from "../components/layout/AppLayout.vue";
import { authService } from "../services/auth.service";
import { authorService } from "../services/author.service";
import Contact from "../pages/Contact.vue";
import PrivacyPolicy from "../pages/PrivacyPolicyPage.vue";
import Imprint from "../pages/Imprint.vue";
import NotFound from "../pages/NotFound.vue";

// Navigation Guard für geschützte Routen
const requireAuth = (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const isLoggedIn = authService.isLoggedIn();

  if (isLoggedIn) {
    next();
  } else {
    next({
      path: "/login-register",
      query: { redirect: to.fullPath },
    });
  }
};

// Navigation Guard für Admin-Berechtigung
const requireAdmin = (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const isAdminLoggedIn = authService.isAdminLoggedIn();

  if (isAdminLoggedIn) {
    next();
  } else {
    next({
      path: "/admin/login",
      query: { redirect: to.fullPath },
    });
  }
};

// Navigation Guard für Autor-Routen
const requireAuthorAuth = (_to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const isLoggedIn = authService.isLoggedIn();
  const isAuthor = isLoggedIn && authorService.isAuthor();

  if (isAuthor) {
    next();
  } else {
    next({
      path: "/member/dashboard",
    });
  }
};

// Routen definieren
const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: AppLayout,
    children: [
      { path: "", name: "Home", component: LandingPage },
      {
        path: "login-register",
        name: "LoginRegister",
        component: LoginRegister,
      },
      { path: "contact", name: "Contact", component: Contact },
      {
        path: "privacy-policy",
        name: "PrivacyPolicy",
        component: PrivacyPolicy,
      },
      { path: "imprint", name: "Imprint", component: Imprint },
      {
        path: "terms-of-service",
        name: "TermsOfService",
        component: TermsOfService,
      },
      { path: "404", name: "NotFound", component: NotFound },
    ],
  },
  {
    path: "/member",
    component: AppLayout,
    beforeEnter: requireAuth,
    children: [
      {
        path: "dashboard",
        name: "MemberDashboard",
        component: Dashboard,
        props: (route) => ({ defaultTab: route.query.tab || "overview" }),
      },
      {
        path: "profile",
        name: "UserProfile",
        redirect: { name: "MemberDashboard", query: { tab: "settings" } },
      },
      {
        path: "favorites",
        name: "UserFavorites",
        redirect: { name: "MemberDashboard", query: { tab: "favorites" } },
      },
      {
        path: "articles",
        name: "UserArticles",
        redirect: { name: "MemberDashboard", query: { tab: "my-articles" } },
      },
      {
        path: "create-article",
        name: "CreateArticle",
        beforeEnter: requireAuthorAuth,
        redirect: { name: "MemberDashboard", query: { tab: "create-article" } },
      },
      {
        path: "library",
        name: "UserLibrary",
        redirect: { name: "MemberDashboard", query: { tab: "library" } },
      },
      {
        path: "friends",
        name: "UserFriends",
        redirect: { name: "MemberDashboard", query: { tab: "friends" } },
      },
      {
        path: "notifications",
        name: "UserNotifications",
        redirect: { name: "MemberDashboard", query: { tab: "notifications" } },
      },
      {
        path: "settings",
        name: "MemberSettings",
        redirect: { name: "MemberDashboard", query: { tab: "settings" } },
      },
    ],
  },
  {
    path: "/admin",
    children: [
      {
        path: "",
        redirect: "/admin/login",
      },
      {
        path: "login",
        name: "AdminLogin",
        component: () => import("../pages/admin/Login.vue"),
        beforeEnter: (_to, _from, next) => {
          // Wenn Admin bereits eingeloggt, zum Dashboard
          if (authService.isAdminLoggedIn()) {
            next("/admin/dashboard");
          } else {
            next();
          }
        },
      },
      {
        path: "dashboard",
        component: () => import("../components/layout/AdminLayout.vue"),
        beforeEnter: requireAdmin,
        children: [
          {
            path: "",
            name: "AdminDashboard",
            component: () => import("../pages/admin/Dashboard.vue"),
            props: (route) => ({
              defaultTab: route.query.tab || "overview",
            }),
          },
        ],
      },
      {
        path: "tickets",
        beforeEnter: requireAdmin,
        redirect: {
          path: "/admin/dashboard",
          query: { tab: "tickets" },
        },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: { name: "NotFound" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash, behavior: "smooth", top: 130 };
    return { top: 0 };
  },
});

// Globaler Navigation Guard mit Anti-Loop-Mechanismus
let navigationInProgress = false;

router.beforeEach((to, from, next) => {
  // Verhindere mehrfache gleichzeitige Navigationen
  if (navigationInProgress && to.path === from.path) {
    return next(false);
  }

  navigationInProgress = true;

  try {
    // Öffentliche Seiten definieren
    const publicPages = [
      "/",
      "/login-register",
      "/contact",
      "/privacy-policy",
      "/imprint",
      "/terms-of-service",
      "/404",
      "/admin",
      "/admin/login",
    ];

    const authRequired = !publicPages.includes(to.path) && !to.path.startsWith("/public/");
    const authorRequired =
      to.path === "/member/create-article" || (to.path === "/member/dashboard" && to.query.tab === "create-article");

    const loggedIn = authService.isLoggedIn();
    const adminLoggedIn = authService.isAdminLoggedIn();
    const isAuthor = loggedIn && authorService.isAuthor();

    // Eingeloggter User auf Login-Seite? → redirect
    if (to.path === "/login-register" && loggedIn) {
      navigationInProgress = false;
      return next("/member/dashboard");
    }

    // Admin bereits eingeloggt auf Admin-Login? → redirect
    if (to.path === "/admin/login" && adminLoggedIn) {
      navigationInProgress = false;
      return next("/admin/dashboard");
    }

    // Bei geschützten Autor-Routen prüfen
    if (authorRequired && !isAuthor) {
      navigationInProgress = false;
      return next({
        path: "/member/dashboard",
      });
    }

    // Bei geschützten Routen prüfen
    if (authRequired && !loggedIn && !adminLoggedIn) {
      navigationInProgress = false;

      // Admin-Route?
      if (to.path.startsWith("/admin/") && to.path !== "/admin/login") {
        return next({
          path: "/admin/login",
          query: { redirect: to.fullPath },
        });
      }

      // Member-Route
      return next({
        path: "/login-register",
        query: { redirect: to.fullPath },
      });
    }

    navigationInProgress = false;
    next();
  } catch (error) {
    console.error("[Router] Navigation Guard Error:", error);
    navigationInProgress = false;
    next();
  }
});

// Reset navigation flag nach jedem erfolgreichen Navigationswechsel
router.afterEach(() => (navigationInProgress = false));

export default router;
