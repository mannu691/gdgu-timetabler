<script setup lang="ts">
import { timetableDB } from '@/main';
import { periodTime, time_slots, timetableStart, weekDays, x_serial, y_serial, type TableCell } from '@/service/Timetable';
import Fuse from 'fuse.js';
import type { AutoCompleteCompleteEvent } from 'primevue';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const weekDayOpts = weekDays.map((v, i) => { return { name: v, code: y_serial[i] } });
const currentDay = new Date().getDay()
const weekDay = ref(weekDayOpts[currentDay == 0 ? 0 : currentDay - 1]);
const timeline = ref<{ cell: TableCell | undefined, period: number, time_slot: string, prof_name: string }[]>([]);
const currentPeriod = ref(0);
const allCourses = timetableDB.getBatchList()
const filteredCourses = ref(allCourses);
const fuse = new Fuse(allCourses)
const displayTimeline = ref(false);
const course = ref(localStorage.getItem("myCourse") || allCourses[0]);
const searchCourse = (e: AutoCompleteCompleteEvent) => {
  if (e.query == "") filteredCourses.value = allCourses.slice(0, 30)
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
        prof_name: timetableDB.timetables[course.value].professors[cell?.prof ?? ""] ?? '',
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
  localStorage.setItem("myCourse", course.value)
  updateTimeline()
}
);
watch(weekDay, updateTimeline);
onMounted(() => updateTimeline())
</script>

<template>
  <Fluid>
    <div class="card flex flex-col gap-4">

      <div class="flex items-center gap-2 justify-between flex-wrap">
        <div class="font-semibold text-xl">Home</div>
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-muted-color whitespace-nowrap">
            Your Course :
          </span>
          <AutoComplete v-model="course" dropdown :suggestions="filteredCourses" placeholder="Search"
            :virtualScrollerOptions="{ itemSize: 30 }" @complete="searchCourse" forceSelection />
        </div>
      </div>
      <Divider />
      <div v-if="displayTimeline">
        <div class="font-semibold text-lg mb-6">{{ weekDay.name }}'s Timetable</div>
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
