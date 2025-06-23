// src/main.ts
import { createApp } from "vue";
import router from "./router";
import "./style/base/main.scss";
import "./style/base/member-area.scss";
import App from "./App.vue";
import { resetScrollObserver } from "./utils/scrollObserver";
import { authService } from "./services/auth.service";

async function bootstrap() {
  // ✅ Token prüfen und ggf. automatisch refreshen
  await authService.checkAndRefreshToken();

  // ⏱️ Falls User eingeloggt ist, starte die Refresh-Logik
  if (authService.isLoggedIn()) {
    authService.scheduleTokenRefresh();
    authService.startTokenCountdown();
  }

  const app = createApp(App);
  app.use(router);
  app.mount("#app");

  // Scroll-Animationen nach jedem Routenwechsel initialisieren
  router.afterEach(() => {
    resetScrollObserver();
  });
}

bootstrap();

