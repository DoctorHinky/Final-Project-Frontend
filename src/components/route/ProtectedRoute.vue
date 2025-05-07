<template>
  <div>
    <slot v-if="isAuthenticated"></slot>
    <div v-else class="unauthorized-view">
      <div class="auth-message-container">
        <h2>Zugriff eingeschränkt</h2>
        <p>Diese Seite ist nur für eingeloggte Benutzer verfügbar. Bitte melde dich an, um Zugang zu erhalten.</p>
        <div class="auth-buttons">
          <router-link to="/login-register" class="auth-button login-btn">Anmelden</router-link>
          <router-link to="/" class="auth-button home-btn">Zurück zur Startseite</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { authService } from '@/services/auth.service';

export default defineComponent({
  name: 'ProtectedRoute',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const isAuthenticated = ref(authService.isLoggedIn());

    // Diese Funktion prüft den Auth-Status und leitet bei Bedarf weiter
    const checkAuth = () => {
      isAuthenticated.value = authService.isLoggedIn();
      
      // Bei Bedarf weiterleiten (optional - derzeit deaktiviert, da wir stattdessen
      // eine Nachricht anzeigen)
      /*
      if (!isAuthenticated.value) {
        router.push({
          path: '/login-register',
          query: { redirect: route.fullPath }
        });
      }
      */
    };

    // Beim Mounten Auth-Status prüfen
    onMounted(() => {
      checkAuth();
    });

    // Bei Routenwechsel erneut prüfen
    watch(() => route.path, () => {
      checkAuth();
    });

    return {
      isAuthenticated
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

.unauthorized-view {
  width: 100%;
  min-height: 50vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: map.get(vars.$spacing, xxl) map.get(vars.$spacing, xl);
  
  .auth-message-container {
    max-width: 600px;
    width: 100%;
    text-align: center;
    padding: map.get(vars.$spacing, xl);
    border-radius: map.get(map.get(vars.$layout, border-radius), large);
    @include animations.fade-in(0.8s);
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        border: 2px solid mixins.theme-color($theme, border-medium);
        @include mixins.shadow('medium', $theme);
      }
    }
    
    h2 {
      font-size: map.get(map.get(vars.$fonts, sizes), xxl);
      margin-bottom: map.get(vars.$spacing, l);
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }
    
    p {
      font-size: map.get(map.get(vars.$fonts, sizes), medium);
      margin-bottom: map.get(vars.$spacing, xl);
      line-height: 1.6;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
    
    .auth-buttons {
      display: flex;
      gap: map.get(vars.$spacing, m);
      justify-content: center;
      
      @media (max-width: map.get(map.get(vars.$layout, breakpoints), mobile)) {
        flex-direction: column;
      }
      
      .auth-button {
        padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
        text-decoration: none;
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        transition: all map.get(vars.$transitions, default);
        
        &.login-btn {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              @include mixins.button-style($theme, 'medium', true);
            }
          }
        }
        
        &.home-btn {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: transparent;
              color: mixins.theme-color($theme, text-primary);
              border: 2px solid mixins.theme-color($theme, border-medium);
              
              &:hover {
                transform: translateY(-4px);
                @include mixins.shadow('small', $theme);
                border-color: mixins.theme-color($theme, accent-teal);
              }
            }
          }
        }
      }
    }
  }
}
</style>