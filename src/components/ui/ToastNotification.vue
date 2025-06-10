<!-- src/components/ui/ToastNotification.vue -->
<template>
  <Transition name="toast" appear>
    <div class="toast-notification" :class="[type]">
      <div class="toast-content">
        <div class="toast-icon">
          <CheckCircleIcon v-if="type === 'success'" class="w-6 h-6" />
          <ExclamationTriangleIcon v-else-if="type === 'error'" class="w-6 h-6" />
          <InformationCircleIcon v-else class="w-6 h-6" />
        </div>
        <div class="toast-message">
          {{ message }}
        </div>
        <button class="toast-close" @click="$emit('close')">
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from "@heroicons/vue/24/outline";

export default defineComponent({
  name: "ToastNotification",
  components: {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XMarkIcon
  },
  props: {
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String as () => 'success' | 'error' | 'info',
      default: 'info',
    },
  },
  emits: ["close"],
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;

.toast-notification {
  position: fixed;
  top: map.get(vars.$spacing, xl);
  right: map.get(vars.$spacing, xl);
  z-index: 1000;
  max-width: 400px;
  min-width: 300px;

  @media (max-width: 480px) {
    top: map.get(vars.$spacing, l);
    right: map.get(vars.$spacing, l);
    left: map.get(vars.$spacing, l);
    max-width: none;
    min-width: auto;
  }

  .toast-content {
    display: flex;
    align-items: center;
    gap: map.get(vars.$spacing, m);
    padding: map.get(vars.$spacing, m);
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);
    @include mixins.shadow("medium", "light");

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        border: 1px solid mixins.theme-color($theme, border-light);
      }
    }

    .toast-icon {
      flex-shrink: 0;
    }

    .toast-message {
      flex: 1;
      font-size: map.get(map.get(vars.$fonts, sizes), medium);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }

    .toast-close {
      flex-shrink: 0;
      background: none;
      border: none;
      cursor: pointer;
      padding: map.get(vars.$spacing, xs);
      border-radius: 50%;
      transition: all 0.2s;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-tertiary);

          &:hover {
            background-color: mixins.theme-color($theme, hover-color);
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }
    }
  }

  // Toast-Typen
  &.success {
    .toast-content {
      border-left: 4px solid;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          border-left-color: mixins.theme-color($theme, accent-green);
        }
      }

      .toast-icon {
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, accent-green);
          }
        }
      }
    }
  }

  &.error {
    .toast-content {
      border-left: 4px solid #ff6b6b;

      .toast-icon {
        color: #ff6b6b;
      }
    }
  }

  &.info {
    .toast-content {
      border-left: 4px solid;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          border-left-color: mixins.theme-color($theme, accent-teal);
        }
      }

      .toast-icon {
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, accent-teal);
          }
        }
      }
    }
  }
}

// Toast-Animationen
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>