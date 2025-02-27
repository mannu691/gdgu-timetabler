<script setup lang="js">
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
  {
    items: [
      { label: 'Home', icon: 'pi pi-fw pi-home', to: '/' },
      { label: 'Find Available Room', icon: 'pi pi-fw pi-bolt', to: '/available-rooms' },
      { label: 'Where is Professor?', icon: 'pi pi-fw pi-compass', to: '/professor' },
      { label: 'Search Timetable', icon: 'pi pi-fw pi-search', to: '/courses' },
      // { label: 'Database', icon: 'pi pi-fw pi-database', to: '/database' },
    ]
  }
]);
</script>

<template>
  <ul class="layout-menu">
    <template v-for="(item, i) in model" :key="item">
      <app-menu-item  :item="item" :index="i"></app-menu-item>
      <!-- <li v-if="item.separator" class="menu-separator"></li> -->
    </template>
  </ul>
</template>

<style lang="scss" scoped></style>
