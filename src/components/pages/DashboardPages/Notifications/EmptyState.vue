<!-- src/components/pages/DashboardPages/Notifications/EmptyState.vue -->
<template>
  <div class="empty-state">
    <div class="empty-icon">🔔</div>
    <h3>Keine Benachrichtigungen</h3>
    <p v-if="activeFilter !== 'all'">
      Es gibt keine Benachrichtigungen in dieser Kategorie.
      <button @click="$emit('update:activeFilter', 'all')" class="switch-filter">Alle anzeigen</button>
    </p>
    <p v-else>Du hast zurzeit keine Benachrichtigungen. Wir werden dich über wichtige Aktivitäten informieren.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'EmptyState',
  props: {
    activeFilter: {
      type: String,
      required: true
    }
  },
  emits: ['update:activeFilter']
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;

// Leerer Zustand
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: map.get(vars.$spacing, xxl) map.get(vars.$spacing, m);
  text-align: center;

  @media (max-width: 576px) {
    padding: map.get(vars.$spacing, xl) map.get(vars.$spacing, s);
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: map.get(vars.$spacing, l);
    opacity: 0.5;

    @media (max-width: 576px) {
      font-size: 3rem;
      margin-bottom: map.get(vars.$spacing, m);
    }
  }

  h3 {
    font-size: map.get(map.get(vars.$fonts, sizes), xl);
    margin-bottom: map.get(vars.$spacing, m);

    @media (max-width: 576px) {
      font-size: map.get(map.get(vars.$fonts, sizes), large);
    }

    @each $theme in ('light', 'dark') {
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

    @media (max-width: 576px) {
      font-size: map.get(map.get(vars.$fonts, sizes), small);
    }

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
        transition: all 0.4s ease-out;
      }
    }

    .switch-filter {
      background: none;
      border: none;
      cursor: pointer;
      font-size: inherit;
      padding: 0;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, accent-teal);
          text-decoration: underline;
          transition: all 0.4s ease-out;

          &:hover {
            color: mixins.theme-color($theme, accent-green);
          }
        }
      }
    }
  }
}
</style>