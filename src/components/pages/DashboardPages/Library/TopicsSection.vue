<!-- src/components/pages/DashboardPages/Library/TopicsSection.vue -->
<template>
  <div class="topics-section">
    <h3>Beliebte Themen</h3>
    <div class="topic-tags">
      <button v-for="(topic, index) in popularTopics" :key="index" class="topic-tag"
        :class="{ active: selectedTags.includes(topic) }" @click="onToggleTag(topic)">
        {{ topic }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'TopicsSection',
  props: {
    popularTopics: {
      type: Array as PropType<string[]>,
      required: true
    },
    selectedTags: {
      type: Array as PropType<string[]>,
      required: true
    }
  },
  emits: ['toggle-tag'],
  setup(_, { emit }) {
    const onToggleTag = (tag: string) => {
      emit('toggle-tag', tag);
    };

    return {
      onToggleTag
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;

// Themen-Sektion
.topics-section {
  margin-bottom: map.get(vars.$spacing, xl);

  h3 {
    font-size: map.get(map.get(vars.$fonts, sizes), large);
    margin-bottom: map.get(vars.$spacing, m);

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
      }
    }
  }

  .topic-tags {
    display: flex;
    flex-wrap: wrap;
    gap: map.get(vars.$spacing, s);

    .topic-tag {
      padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      cursor: pointer;
      border: none;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          color: mixins.theme-color($theme, text-primary);
          border: 1px solid mixins.theme-color($theme, border-light);

          &:hover {
            background-color: mixins.theme-color($theme, hover-color);
          }

          &.active {
            background-color: mixins.theme-color($theme, accent-green);
            color: white;
            border-color: transparent;
          }
        }
      }
    }
  }
}
</style>