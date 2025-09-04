<script setup lang="ts">
import { timetableDB } from '@/main';
import { periodTime, time_slots, timetableStart, weekDays, x_serial, y_serial, type TableCell } from '@/service/Timetable';
import Fuse from 'fuse.js';
import type { AutoCompleteCompleteEvent } from 'primevue';
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();
const weekDayOpts = weekDays.map((v, i) => { return { name: v, code: y_serial[i] } });
const currentDay = new Date().getDay()
const weekDay = ref(weekDayOpts[route.query.day ?? currentDay == 0 ? 0 : currentDay - 1]);
const timeline = ref<{ cell: TableCell | undefined, period: number, time_slot: string, prof_name: string }[]>([]);
const currentPeriod = ref(0);
const allCourses = timetableDB.getBatchList()
const filteredCourses = ref(allCourses);
const fuse = new Fuse(allCourses)
const course = ref(route.query.course?.toString() || allCourses[0]);
const displayTimeline = ref(false);

const searchCourse = (e: AutoCompleteCompleteEvent) => {
  if(e.query == "") filteredCourses.value = allCourses.slice(0,30)
  else filteredCourses.value = fuse.search(e.query).map((v) => v.item)
}

const updateTimeline = () => {
  const timetable = timetableDB.timetables[course.value]?.schedule
  if (timetable == undefined) {
    displayTimeline.value = false
    return
  }
  const day = timetable[weekDay.value.code] ?? []
  const schedule = []
  for (const period of x_serial) {
    const cells = day[period] || [undefined]
    for (const cell of cells) {
      schedule.push({
        cell: cell,
        prof_name:cell?.prof ?? "",
        period: parseInt(period),
        time_slot: time_slots[parseInt(period) - 1]
      })
    }
  }
  timeline.value = schedule
  const currentTime = new Date();
  const diffTime = (currentTime.getHours() * 60 + currentTime.getMinutes()) - (timetableStart.getHours() * 60 + timetableStart.getMinutes());
  if (diffTime < 0) currentPeriod.value = 0
  else {
    const slotIndex = Math.floor(diffTime / periodTime);
    currentPeriod.value = slotIndex >= time_slots.length ? 0 : (slotIndex + 1)
  }
  displayTimeline.value = true
}
watch(course, (newState) => {
  if (!newState) return;
  router.replace({ query: { ...route.query, course: newState } });
  updateTimeline()
});
watch(weekDay, (newState) => {
  if (!newState) return;
  router.replace({ query: { ...route.query, day: y_serial.indexOf(newState.code) } });
  updateTimeline()
});
onMounted(() => updateTimeline())
</script>

<template>
  <Fluid>
    <div class="card flex flex-col gap-4">

      <div class="font-semibold text-xl">Search Timetable</div>
      <div class="flex flex-col gap-2 max-w-64">
        <label for="professor">Course Name</label>
        <AutoComplete v-model="course" dropdown placeholder="Search" :suggestions="filteredCourses"  :virtualScrollerOptions="{ itemSize: 30 }" @complete="searchCourse"
          forceSelection />
      </div>
      <Divider />
      <div v-if="displayTimeline">
        <div class="flex flex-col gap-2">
          <SelectButton class="flex-col sm:flex-row" v-model="weekDay" :options="weekDayOpts" optionLabel="name" />
        </div>
        <Divider />
        <div class="font-semibold text-lg mb-4">Timetable</div>
        <div class="max-w-96">
          <Chip v-for="slot in timeline"
            class="flex items-center justify-between w-full flex-row border dark:border-slate-700 border-slate-300 my-2 rounded-lg p-2">
            <Badge class="w-fit" :value="slot.period" :severity="currentPeriod == slot.period ? 'info' : ''"></Badge>
            <div class="flex flex-col gap-1 items-end">
              <div class="flex items-center gap-3 flex-wrap justify-end">
                <Tag v-if="slot.cell?.course" :value="slot.cell.course"></Tag>
                <Tag v-if="slot.cell?.room" :value="slot.cell.room"></Tag>
                <Tag v-if="slot.prof_name" :value="slot.prof_name"></Tag>
              </div>
              <span class="text-muted-color whitespace-nowrap  text-sm">{{
                slot.time_slot }}</span>
            </div>
          </Chip>
        </div>

      </div>
    </div>
  </Fluid>
</template>
