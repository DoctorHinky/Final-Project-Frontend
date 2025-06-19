<!-- src/components/pages/DashboardPages/Friends/EmptyState.vue -->
<template>
  <div class="empty-state">
    <div class="empty-icon">
      <component :is="iconComponent" class="empty-icon-svg" />
    </div>
    <h3>{{ title }}</h3>
    <p>{{ message }}</p>
    <button @click="onButtonClick" class="reset-button">
      <component :is="buttonIconComponent" class="button-icon" />
      {{ buttonText }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import {
  UserGroupIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  ArrowPathIcon,
  PlusIcon,
} from "@heroicons/vue/24/outline";

export default defineComponent({
  name: "EmptyState",
  components: {
    UserGroupIcon,
    InboxIcon,
    MagnifyingGlassIcon,
    EnvelopeIcon,
    ArrowPathIcon,
    PlusIcon,
  },
  props: {
    iconType: {
      type: String,
      required: true,
      validator: (value: string) => ["friends", "requests", "search", "general"].includes(value),
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    buttonText: {
      type: String,
      required: true,
    },
    buttonAction: {
      type: String,
      required: true,
    },
  },
  emits: ["button-click"],
  setup(props, { emit }) {
    const iconComponent = computed(() => {
      switch (props.iconType) {
        case "friends":
          return UserGroupIcon;
        case "requests":
          return InboxIcon;
        case "search":
          return MagnifyingGlassIcon;
        default:
          return UserGroupIcon;
      }
    });

    const buttonIconComponent = computed(() => {
      switch (props.buttonAction) {
        case "show-invite-modal":
          return EnvelopeIcon;
        case "clear-search":
          return ArrowPathIcon;
        case "add-friends":
          return PlusIcon;
        default:
          return EnvelopeIcon;
      }
    });

    const onButtonClick = () => emit("button-click", props.buttonAction);

    return {
      iconComponent,
      buttonIconComponent,
      onButtonClick,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;

// Leerer Zustand
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: map.get(vars.$spacing, xxl);
  text-align: center;

  .empty-icon {
    margin-bottom: map.get(vars.$spacing, l);

    .empty-icon-svg {
      width: 64px;
      height: 64px;
      opacity: 0.5;

      @each $theme in ("light", "dark") {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
          transition: all 0.4s ease-out;
        }
      }
    }
  }

  h3 {
    font-size: map.get(map.get(vars.$fonts, sizes), xl);
    margin-bottom: map.get(vars.$spacing, m);

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
        transition: all 0.4s ease-out;
      }
    }
  }

  p {
    font-size: map.get(map.get(vars.$fonts, sizes), medium);
    margin-bottom: map.get(vars.$spacing, l);
    max-width: 500px;

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
        transition: all 0.4s ease-out;
      }
    }
  }

  .reset-button {
    padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
    border-radius: map.get(map.get(vars.$layout, border-radius), pill);
    font-weight: map.get(map.get(vars.$fonts, weights), medium);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: map.get(vars.$spacing, s);

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background: mixins.theme-gradient($theme, primary);
        color: white;
        transition: all 0.4s ease-out;

        &:hover {
          transform: translateY(-3px);
          @include mixins.shadow("medium", $theme);
        }
      }
    }

    .button-icon {
      width: 20px;
      height: 20px;
    }
  }
}
</style>
