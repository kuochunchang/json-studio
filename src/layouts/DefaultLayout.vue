<template>
  <div class="layout">
    <AppSidebar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from '../core/components/AppSidebar.vue';
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-app);
}

.main-content {
  flex: 1;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
