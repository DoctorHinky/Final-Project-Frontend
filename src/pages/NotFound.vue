<!-- src/pages/NotFound.vue -->
<template>
  <div class="not-found-page">
    <div class="container">
      <div class="error-container">
        <div class="error-code">404</div>
        <h1>Seite nicht gefunden</h1>
        <p>
          Es tut uns leid, aber die gewünschte Seite konnte nicht gefunden werden. Vielleicht wurde die Seite
          verschoben, gelöscht oder existiert nicht.
        </p>

        <div class="error-illustration">
          <div class="illustration-element leaf1">🍃</div>
          <div class="illustration-element leaf2">🌿</div>
          <div class="illustration-element leaf3">🌱</div>
          <div class="main-illustration">🔍</div>
          <div class="illustration-element question1">❓</div>
          <div class="illustration-element question2">❔</div>
        </div>

        <div class="navigation-options">
          <h2>Was möchtest du tun?</h2>
          <div class="button-group">
            <router-link to="/" class="btn-primary">Zur Startseite</router-link>
            <router-link to="/contact" class="btn-secondary">Kontakt aufnehmen</router-link>
          </div>

          <div class="suggestions">
            <h3>Hier sind einige hilfreiche Links:</h3>
            <ul>
              <li><router-link to="/#content">Inhalte entdecken</router-link></li>
              <li><router-link to="/#quiz">Quiz ausprobieren</router-link></li>
              <li><router-link to="/#sub">Newsletter abonnieren</router-link></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "NotFoundPage",
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;
@use "@/style/base/animations" as animations;

.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: map.get(vars.$spacing, xxl) 0;

  .error-container {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
    animation: fadeIn 0.8s ease-in-out forwards;
    opacity: 0;
    padding: map.get(vars.$spacing, xxl);
    border-radius: map.get(map.get(vars.$layout, border-radius), large);

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        border: 2px solid mixins.theme-color($theme, border-medium);
        @include mixins.shadow("large", $theme);
      }
    }

    .error-code {
      font-size: 8rem;
      font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
      line-height: 1;
      margin-bottom: map.get(vars.$spacing, m);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, header);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
        }
      }
    }

    h1 {
      font-size: 2.5rem;
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      margin-bottom: map.get(vars.$spacing, l);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    p {
      font-size: map.get(map.get(vars.$fonts, sizes), large);
      margin-bottom: map.get(vars.$spacing, xl);
      line-height: 1.6;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }

    .error-illustration {
      position: relative;
      width: 200px;
      height: 200px;
      margin: map.get(vars.$spacing, xl) auto;

      .main-illustration {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 5rem;
        z-index: 2;
        animation: float 3s ease-in-out infinite;
      }

      .illustration-element {
        position: absolute;
        font-size: 1.8rem;
        z-index: 1;
        opacity: 0.8;

        &.leaf1 {
          top: 10%;
          left: 10%;
          animation: float 4s ease-in-out infinite, rotate 15s linear infinite;
        }

        &.leaf2 {
          bottom: 15%;
          left: 20%;
          animation: float 5s ease-in-out infinite, rotate 12s linear infinite;
        }

        &.leaf3 {
          top: 20%;
          right: 15%;
          animation: float 4.5s ease-in-out infinite, rotate 10s linear infinite reverse;
        }

        &.question1 {
          top: 30%;
          right: 25%;
          font-size: 2rem;
          animation: float 3.5s ease-in-out infinite;
          animation-delay: 0.5s;
        }

        &.question2 {
          bottom: 25%;
          right: 30%;
          font-size: 1.5rem;
          animation: float 4s ease-in-out infinite;
          animation-delay: 1s;
        }
      }

      &::before {
        content: "";
        position: absolute;
        width: 180px;
        height: 180px;
        border-radius: 50%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 0;

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background: radial-gradient(
              circle,
              rgba(mixins.theme-color($theme, accent-green), 0.15) 0%,
              rgba(mixins.theme-color($theme, accent-lime), 0.08) 60%,
              transparent 80%
            );
          }
        }
      }
    }

    .navigation-options {
      margin-top: map.get(vars.$spacing, xxl);

      h2 {
        font-size: map.get(map.get(vars.$fonts, sizes), xl);
        margin-bottom: map.get(vars.$spacing, l);

        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }

      .button-group {
        display: flex;
        justify-content: center;
        gap: map.get(vars.$spacing, l);
        margin-bottom: map.get(vars.$spacing, xl);

        @include mixins.responsive("mobile") {
          flex-direction: column;
          align-items: center;
        }

        .btn-primary,
        .btn-secondary {
          padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
          border-radius: map.get(map.get(vars.$layout, border-radius), pill);
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
          font-size: map.get(map.get(vars.$fonts, sizes), medium);
          text-decoration: none;
          display: inline-block;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .btn-primary {
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              @include mixins.button-style($theme, "medium", true);
            }
          }
        }

        .btn-secondary {
          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              background-color: transparent;
              color: mixins.theme-color($theme, text-primary);
              border: 2px solid mixins.theme-color($theme, border-medium);

              &:hover {
                transform: translateY(-4px);
                @include mixins.shadow("small", $theme);
                border-color: mixins.theme-color($theme, accent-teal);
              }
            }
          }
        }
      }

      .suggestions {
        h3 {
          font-size: map.get(map.get(vars.$fonts, sizes), medium);
          margin-bottom: map.get(vars.$spacing, m);

          @each $theme in ("light", "dark") {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }

        ul {
          list-style: none;
          padding: 0;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: map.get(vars.$spacing, l);

          @include mixins.responsive("mobile") {
            flex-direction: column;
          }

          li {
            padding: map.get(vars.$spacing, s) map.get(vars.$spacing, m);
            border-radius: map.get(map.get(vars.$layout, border-radius), pill);

            @each $theme in ("light", "dark") {
              .theme-#{$theme} & {
                background-color: mixins.theme-color($theme, secondary-bg);
                border: 1px solid mixins.theme-color($theme, border-light);
                transition: all map.get(vars.$transitions, default);

                &:hover {
                  background-color: mixins.theme-color($theme, hover-color);
                  transform: translateY(-3px);
                  @include mixins.shadow("small", $theme);
                }
              }
            }

            a {
              text-decoration: none;

              @each $theme in ("light", "dark") {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, accent-green);

                  &:hover {
                    color: mixins.theme-color($theme, accent-teal);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

// Spezielle Animationen für die 404-Seite
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
