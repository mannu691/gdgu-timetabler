<script setup lang="ts">
import { useLayout } from '@/layout/composables/layout';
import { timetableDB } from '@/main';

const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();
const lastUpdated = timetableDB.lastUpdated
</script>

<template>
  <div class="layout-topbar">
    <div class="layout-topbar-logo-container">
      <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
        <i class="pi pi-bars"></i>
      </button>
      <router-link to="/" class="layout-topbar-logo">
        <span class="text-lg sm:text-xl font-bold">GDGU Timetable</span>
      </router-link>
    </div>
    <div class="layout-topbar-actions">
      <Tag>
        Last Updated : {{ lastUpdated }}
      </Tag>
      <div class="layout-config-menu">
        <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
          <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
        </button>
      </div>


    </div>
  </div>
</template>
