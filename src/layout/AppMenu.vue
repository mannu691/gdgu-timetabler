<script setup lang="js">
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
  {
    items: [
      { label: 'Find Available Room', icon: 'pi pi-fw pi-bolt', to: '/' },
      { label: 'Where is Professor?', icon: 'pi pi-fw pi-compass', to: '/professor-timetable' },
      { label: 'Search Timetable', icon: 'pi pi-fw pi-search', to: '/search-timetable' },
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
