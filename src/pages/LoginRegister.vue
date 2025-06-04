<template>
  <div class="login-register-page">
    <div class="container">
      <div class="auth-container" :class="{ 'wide-container': activeTab === 'register' }">
        <div class="tabs">
          <button class="tab" :class="{ active: activeTab === 'login' }" @click="activeTab = 'login'">
            Anmelden
          </button>
          <button class="tab" :class="{ active: activeTab === 'register' }" @click="activeTab = 'register'">
            Registrieren
          </button>
        </div>

        <!-- Login Komponente -->
        <Login 
          v-if="activeTab === 'login'" 
          @login-success="handleLoginSuccess"
        />

        <!-- Register Komponente -->
        <Register 
          v-if="activeTab === 'register'" 
          @register-success="handleRegisterSuccess"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import Login from "@/components/pages/LoginRegister/Login.vue";
import Register from "@/components/pages/LoginRegister/Register.vue";

export default defineComponent({
  name: "LoginRegister",
  components: {
    Login,
    Register,
  },

  setup() {
    const route = useRoute();
    const activeTab = ref("login");

    // Event Handler
    const handleLoginSuccess = () => {
      console.log("Login erfolgreich!");
      // Weitere Aktionen nach erfolgreichem Login
    };

    const handleRegisterSuccess = () => {
      console.log("Registrierung erfolgreich!");
      // Weitere Aktionen nach erfolgreicher Registrierung
    };

    onMounted(() => {
      // Bei Redirect-Parameter den Login-Tab aktivieren
      if (route.query.redirect) {
        activeTab.value = "login";
      }
    });

    return {
      activeTab,
      handleLoginSuccess,
      handleRegisterSuccess,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;

.login-register-page {
  min-height: calc(100vh - 130px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: map.get(vars.$spacing, xl) 0;
  position: relative;
  z-index: 100;

  .auth-container {
    max-width: 500px;
    width: 100%;
    margin: 100px auto;
    transition: max-width 0.3s ease;
    
    // Größerer Container für Register-Formular
    &.wide-container {
      max-width: 800px;
    }

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        border-radius: map.get(map.get(vars.$layout, border-radius), large);
        border: 2px solid mixins.theme-color($theme, border-medium);
        @include mixins.shadow("medium", $theme);
        overflow: hidden;
      }
    }
  }

  .tabs {
    display: flex;
    width: 100%;

    .tab {
      flex: 1;
      padding: map.get(vars.$spacing, m) 0;
      text-align: center;
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      cursor: pointer;
      border: none;
      transition: all map.get(vars.$transitions, default);
      position: relative;
      overflow: hidden;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, nav-item-bg);
          color: mixins.theme-color($theme, text-primary);

          &.active {
            background: mixins.theme-gradient($theme, nav-active);
            color: white;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .container {
    margin-top: 200px;
  }
  
  .auth-container {
    &.wide-container {
      max-width: 100%;
      margin: 20px;
    }
  }
}
</style>