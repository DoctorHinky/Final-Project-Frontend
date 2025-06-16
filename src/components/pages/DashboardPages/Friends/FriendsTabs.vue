<!-- src/components/pages/DashboardPages/Friends/FriendsTabs.vue -->
<template>
  <div class="friends-tabs">
    <button
      v-for="(tab, index) in tabs"
      :key="index"
      class="tab-button"
      :class="{ active: activeTab === tab.id }"
      @click="onTabChange(tab.id)"
    >
      {{ tab.name }}
      <!-- Status Badge für Anfragen -->
      <span v-if="tab.id === 'requests' && pendingRequestsCount > 0" class="badge requests-badge">
        {{ pendingRequestsCount }}
      </span>
      <!-- Status Badge für ungelesene Nachrichten -->
      <span
        v-if="tab.id === 'friends' && unreadMessagesCount > 0"
        class="badge messages-badge"
        :title="`${unreadMessagesCount} ungelesene Nachricht${unreadMessagesCount === 1 ? '' : 'en'}`"
      >
        {{ unreadMessagesCount > 99 ? "99+" : unreadMessagesCount }}
      </span>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { Tab } from "@/types/Tab";

export default defineComponent({
  name: "FriendsTabs",
  props: {
    tabs: {
      type: Array as PropType<Tab[]>,
      required: true,
    },
    activeTab: {
      type: String,
      required: true,
    },
    pendingRequestsCount: {
      type: Number,
      required: true,
    },
    unreadMessagesCount: {
      type: Number,
      default: 0,
    },
  },
  emits: ["update:activeTab"],
  setup(_, { emit }) {
    const onTabChange = (tabId: string) => {
      emit("update:activeTab", tabId);
    };

    return {
      onTabChange,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@/style/base/variables" as vars;
@use "@/style/base/mixins" as mixins;
@use "@/style/base/animations" as animations;

// Tabs
.friends-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: map.get(vars.$spacing, s);
  margin-bottom: map.get(vars.$spacing, l);

  .tab-button {
    padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
    border-radius: map.get(map.get(vars.$layout, border-radius), pill);
    font-size: map.get(map.get(vars.$fonts, sizes), small);
    font-weight: map.get(map.get(vars.$fonts, weights), medium);
    cursor: pointer;
    transition: all 0.3s;
    border: none;
    position: relative;
    display: flex;
    align-items: center;
    gap: map.get(vars.$spacing, xs);

    @each $theme in ("light", "dark") {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, secondary-bg);
        color: mixins.theme-color($theme, text-secondary);
        transition: all 0.4s ease-out;

        &:hover {
          background-color: mixins.theme-color($theme, hover-color);
        }

        &.active {
          background: mixins.theme-gradient($theme, primary);
          color: white;
        }
      }
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      border-radius: 50%;
      font-size: map.get(map.get(vars.$fonts, sizes), xs);
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      line-height: 1;
      @include animations.fade-in(0.3s);
      transition: all 0.25s ease;

      // Badge Animation
      animation: badge-pulse 2s infinite;
      position: absolute;
      top: 6px;
      right: 6px;
      z-index: 1;

      &.requests-badge {
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: #ff4757; // Rot für Aufmerksamkeit
            color: white;
            transition: all 0.4s ease-out;
          }
        }
      }

      &.messages-badge {
        @each $theme in ("light", "dark") {
          .theme-#{$theme} & {
            background-color: #2ed573; // Grün für Nachrichten
            color: white;
            transition: all 0.4s ease-out;
          }
        }

        // Spezielle Animation für Nachrichten-Badge
        animation: message-pulse 3s infinite;
      }
    }
  }
}

@keyframes badge-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes message-pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  25% {
    transform: scale(1.05);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  75% {
    transform: scale(1.05);
    opacity: 0.9;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

// Responsive Design
@media (max-width: 640px) {
  .friends-tabs {
    .tab-button {
      padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, m);
      font-size: map.get(map.get(vars.$fonts, sizes), xs);

      .badge {
        min-width: 18px;
        height: 18px;
        font-size: map.get(map.get(vars.$fonts, sizes), xxs);
        top: 4px;
        right: 4px;
      }
    }
  }
}
</style>
