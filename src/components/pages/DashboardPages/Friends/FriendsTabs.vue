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
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

interface Tab {
  id: string;
  name: string;
}

export default defineComponent({
  name: 'FriendsTabs',
  props: {
    tabs: {
      type: Array as PropType<Tab[]>,
      required: true
    },
    activeTab: {
      type: String,
      required: true
    }
  },
  emits: ['update:activeTab'],
  setup(_, { emit }) {
    const onTabChange = (tabId: string) => {
      emit('update:activeTab', tabId);
    };

    return {
      onTabChange
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;

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

    @each $theme in ('light', 'dark') {
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
  }
}
</style>