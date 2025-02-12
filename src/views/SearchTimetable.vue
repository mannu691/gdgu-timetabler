<script setup lang="ts">
import { periodTime, time_slots, timetableStart, weekDays, x_serial, y_serial, type TableCell } from '@/js/timetable';
import { TimetableDB } from '@/js/timetable_db';
import Fuse from 'fuse.js';
import type { AutoCompleteCompleteEvent } from 'primevue';
import { ref, watch } from 'vue';
const db = new TimetableDB()
const weekDayOpts = ref(weekDays.map((v, i) => { return { name: v, code: y_serial[i] } }));
const currentDay = new Date().getDay()
const weekDay = ref(weekDayOpts.value[currentDay == 0 ? 0 : currentDay - 1]);
const timeline = ref<{ cell: TableCell | undefined, period: number, time_slot: string }[]>([]);
const currentPeriod = ref("0");
const allCourses = db.getBatchList()
const filteredCourses = ref(allCourses);
const fuse = new Fuse(allCourses)
const course = ref(allCourses[0]);
const displayTimeline = ref(false);

const searchCourse = (e: AutoCompleteCompleteEvent) => {
  filteredCourses.value = fuse.search(e.query).map((v) => v.item)
}

const updateTimeline = () => {
  const timetable = db.timetables[course.value].schedule
  console.log(db.timetables[course.value])
  if (timetable == undefined) {
    displayTimeline.value = false
    return
  }
  const day = timetable[weekDay.value.code] ?? []
  const schedule = []
  for (const period of x_serial) {
    const room = day[period]
    schedule.push({
      cell: room,
      prof_name: db.timetables[course.value].professors[room?.prof ?? ""] ?? '',
      period: parseInt(period),
      time_slot: time_slots[parseInt(period) - 1]
    })
  }
  timeline.value = schedule
  const currentTime = new Date();
  const diffTime = (currentTime.getHours() * 60 + currentTime.getMinutes()) - (timetableStart.getHours() * 60 + timetableStart.getMinutes());
  if (diffTime < 0) currentPeriod.value = "0"
  else {
    const slotIndex = Math.floor(diffTime / periodTime);
    currentPeriod.value = slotIndex >= time_slots.length ? "0" : (slotIndex + 1).toString();
  }
  displayTimeline.value = true
}
watch(course, updateTimeline);
watch(weekDay, updateTimeline);
updateTimeline()
</script>

<template>
  <Fluid>
    <div class="flex flex-col md:flex-row gap-8">
      <div class="md:w-full">
        <div class="card flex flex-col gap-4">

          <div class="font-semibold text-xl">Search Timetable</div>
          <div class="flex flex-col gap-2 max-w-64">
            <label for="professor">Course Name</label>
            <AutoComplete v-model="course" dropdown :suggestions="filteredCourses" @complete="searchCourse"
              forceSelection />
          </div>
          <Divider />
          <div v-if="displayTimeline">
            <div class="flex flex-col gap-2">
              <SelectButton v-model="weekDay" :options="weekDayOpts" optionLabel="name" />
            </div>
            <Divider />
            <div class="font-semibold text-lg mb-4">Timetable</div>
            <div class="flex flex-col items-start">
              <Timeline :value="timeline" class="w-fit" align="left">
                <template #opposite="slotProps">
                  <div class="flex space-x-2">
                    <Badge :value="slotProps.item.period"
                      :severity="currentPeriod == slotProps.item.period ? 'info' : ''"></Badge>
                    <span class="text-muted-color whitespace-nowrap text-sm">{{
                      slotProps.item.time_slot }}</span>
                  </div>
                </template>

                <template #content="slotProps">
                  <div v-if="slotProps.item.cell" class="flex gap-1 whitespace-nowrap items-start w-64">
                    <Tag v-if="slotProps.item.cell.course" :value="slotProps.item.cell.course"></Tag>
                    <Tag v-if="slotProps.item.cell.room" :value="slotProps.item.cell.room"></Tag>
                    <Tag v-if="slotProps.item.prof_name" :value="slotProps.item.prof_name"></Tag>
                  </div>
                  <div v-else class="w-64">

                  </div>
                </template>
              </Timeline>
            </div>

          </div>
        </div>
      </div>
    </div>
  </Fluid>
</template>
