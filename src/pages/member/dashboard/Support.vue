<!-- src/pages/member/dashboard/Support.vue -->
<template>
  <SupportHub />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SupportHub from '@/components/member/support/SupportHub.vue';

export default defineComponent({
  name: 'SupportPage',
  components: {
    SupportHub
  }
});
</script>