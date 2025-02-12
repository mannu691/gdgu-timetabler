<script setup lang="ts">
import { timetableDB } from './main';
import { ref, onMounted, watch } from "vue";

const loading = ref(true);

onMounted(async () => {
  timetableDB.load().finally(() => {
    loading.value = false
  })
})
</script>
<template>
  <div v-if="loading">
    <div class="w-screen h-screen flex justify-center items-center">
      <Spinner />
    </div>
  </div>
  <div v-else>
    <router-view />
  </div>
</template>

<style scoped></style>
