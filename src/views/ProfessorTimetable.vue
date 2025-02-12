<script setup lang="ts">
import { timetableDB } from '@/main';
import { periodTime, time_slots, timetableStart, weekDays, x_serial, y_serial } from '@/service/Timetable';
import Fuse from 'fuse.js';
import type { AutoCompleteCompleteEvent } from 'primevue';
import { onMounted, ref, watch } from 'vue';
const weekDayOpts = ref(weekDays.map((v, i) => { return { name: v, code: y_serial[i] } }));
const currentDay = new Date().getDay()
const weekDay = ref(weekDayOpts.value[currentDay == 0 ? 0 : currentDay - 1]);
const timeline = ref<{ room: string | undefined, period: number, time_slot: string }[]>([]);
const currentPeriod = ref("0");
const allProfessors = timetableDB.getProfessorList()
const filteredProfessors = ref(allProfessors);
const fuse = new Fuse(allProfessors,)
const professor = ref(allProfessors[0]);
const displayTimeline = ref(false);

const searchProfessor = (e: AutoCompleteCompleteEvent) => {
  filteredProfessors.value = fuse.search(e.query).map((v) => v.item)
}

const updateTimeline = () => {
  const timetable = timetableDB.professorTimetables[professor.value]
  if (timetable == undefined) {
    displayTimeline.value = false
    return
  }
  const day = timetable[weekDay.value.code] ?? []
  const schedule = []
  for (const period of x_serial) {
    const room = day[period]
    schedule.push({
      room: room,
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
watch(professor, updateTimeline);
watch(weekDay, updateTimeline);
onMounted(() => updateTimeline())
</script>

<template>
  <Fluid>
      <div class="w-full">
        <div class="card flex flex-col gap-4">

          <div class="font-semibold text-xl">Professor Timetable</div>
          <div class="flex flex-col gap-2 max-w-64">
            <label for="professor">Name</label>
            <AutoComplete v-model="professor" dropdown :suggestions="filteredProfessors" @complete="searchProfessor"
              forceSelection />
          </div>
          <Divider />
          <div v-if="displayTimeline">
            <div class="flex flex-col gap-2">
              <SelectButton  class="flex-col sm:flex-row" v-model="weekDay" :options="weekDayOpts" optionLabel="name" />
            </div>
            <Divider />
            <div class="font-semibold text-lg mb-4">Timetable</div>
            <div class="flex flex-col items-start">
              <Timeline :value="timeline" class="w-min" align="left">
                <template #opposite="slotProps">
                  <div class="flex gap-2 sm:flex-row flex-col items-center">
                    <Badge :value="slotProps.item.period"
                      :severity="currentPeriod == slotProps.item.period ? 'info' : ''"></Badge>
                    <span class="text-muted-color whitespace-nowrap text-sm">{{
                      slotProps.item.time_slot }}</span>
                  </div>
                </template>

                <template #content="slotProps">
                  <Tag v-if="slotProps.item.room" :value="slotProps.item.room"></Tag>
                </template>
              </Timeline>
            </div>
          </div>
        </div>
      </div>
  </Fluid>
</template>
