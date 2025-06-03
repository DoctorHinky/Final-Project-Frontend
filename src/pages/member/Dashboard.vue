<!-- src/pages/member/Dashboard.vue -->
<template>
  <MemberLayout :page-title="getPageTitle()" :active-menu="activeMenu" @menu-change="changeMenu">
    <div class="dashboard-wrapper">
      <!-- Dynamische Komponente basierend auf aktivem Menü -->
      <component :is="currentComponent" />
    </div>
  </MemberLayout>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, markRaw, type PropType } from "vue";
import { useRouter, useRoute } from "vue-router";
import MemberLayout from "@/components/layout/MemberLayout.vue";

// Dashboard-Unterkomponenten
import Overview from "@/pages/member/dashboard/Overview.vue";
import MyArticles from "@/pages/member/dashboard/MyArticles.vue";
import Favorites from "@/pages/member/dashboard/Favorites.vue";
import Friends from "@/pages/member/dashboard/Friends.vue";
import Notifications from "@/pages/member/dashboard/Notifications.vue";
import Settings from "@/pages/member/dashboard/Settings.vue";
import Library from "@/pages/member/dashboard/Library.vue"; // Bibliothek-Komponente
import ArticleEditor from "@/components/pages/DashboardPages/CreateArticle"; // Neue Artikel-Editor Komponente

// Services
import { authService } from "@/services/auth.service";
import { authorService } from "@/services/author.service";

export default defineComponent({
  name: "MemberDashboard",
  components: {
    MemberLayout,
    Overview,
    MyArticles,
    Favorites,
    Friends,
    Notifications,
    Settings,
    Library,
    ArticleEditor, 
  },
  props: {
    // Standardtab aus der Routerkonfiguration
    defaultTab: {
      type: String as PropType<string>,
      default: "overview",
    },
  },
  setup(props) {
    const router = useRouter();
    const route = useRoute();

    // Aktiver Menüpunkt
    const activeMenu = ref(props.defaultTab || "overview");

    // Überprüfen, ob Benutzer ein Autor ist
    const isAuthor = computed(() => {
      return authorService.isAuthor();
    });

    // Komponenten-Mapping
    const componentMap = computed(() => {
      const map: Record<string, any> = {
        overview: Overview,
        "my-articles": MyArticles,
        favorites: Favorites,
        friends: Friends,
        notifications: Notifications,
        settings: Settings,
        library: Library,
      };

      // Nur für Autoren verfügbar
      if (isAuthor.value) {
        map["create-article"] = ArticleEditor;
      }

      return markRaw(map);
    });

    // Aktuelle Komponente basierend auf Menüauswahl
    const currentComponent = computed(() => {
      // Wenn der Tab 'create-article' ist, aber der Benutzer kein Autor ist,
      // zeigen wir die Übersicht an
      if (activeMenu.value === "create-article" && !isAuthor.value) {
        return componentMap.value["overview"];
      }

      return componentMap.value[activeMenu.value as keyof typeof componentMap.value] || componentMap.value["overview"];
    });

    // Seitentitel basierend auf aktivem Menü
    const getPageTitle = () => {
      switch (activeMenu.value) {
        case "overview":
          return "Dashboard";
        case "my-articles":
          return "Meine Artikel";
        case "create-article":
          return "Artikel erstellen";
        case "favorites":
          return "Favoriten";
        case "friends":
          return "Freunde";
        case "notifications":
          return "Benachrichtigungen";
        case "settings":
          return "Einstellungen";
        case "library":
          return "Bibliothek";
        default:
          return "Dashboard";
      }
    };

    // Menü ändern
    const changeMenu = (menuItem: string) => {
      // Wenn der Tab 'create-article' ist, aber der Benutzer kein Autor ist,
      // passiert nichts oder wir leiten um
      if (menuItem === "create-article" && !isAuthor.value) {
        console.warn("Nur Autoren können Artikel erstellen.");
        return;
      }

      activeMenu.value = menuItem;

      // URL aktualisieren ohne Neuladen
      const query = { ...route.query, tab: menuItem };
      router.replace({ query });
    };

    // Initialisierung
    onMounted(() => {
      // Authentifizierung überprüfen
      if (!authService.isLoggedIn()) {
        router.push("/login-register");
        return;
      }

      // Tab aus URL-Query-Parameter laden, falls vorhanden
      const tabParam = route.query.tab as string;
      if (tabParam) {
        // Validieren, ob der Tab existiert und für den Benutzer zugänglich ist
        if (tabParam === "create-article" && !isAuthor.value) {
          // Wenn der Benutzer kein Autor ist, aber den Artikel-Erstellungs-Tab aufruft,
          // leiten wir zur Übersicht um
          activeMenu.value = "overview";
          router.replace({ query: { ...route.query, tab: "overview" } });
        } else if (Object.keys(componentMap.value).includes(tabParam)) {
          activeMenu.value = tabParam;
        }
      } else if (props.defaultTab && Object.keys(componentMap.value).includes(props.defaultTab)) {
        // Ansonsten den defaultTab verwenden, falls gültig
        activeMenu.value = props.defaultTab;
      }
    });

    return {
      activeMenu,
      currentComponent,
      getPageTitle,
      changeMenu,
      isAuthor,
    };
  },
});
</script>

<style scoped>
.dashboard-wrapper {
  max-width: 2000px;
  margin: 0 auto; /* Zentriert den Inhalt horizontal */
  padding: 0 16px; /* Optional: Innenabstand für kleinere Bildschirme */
}
</style>
