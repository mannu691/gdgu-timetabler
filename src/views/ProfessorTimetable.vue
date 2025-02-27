<script setup lang="ts">
import { timetableDB } from '@/main';
import { periodTime, time_slots, timetableStart, weekDays, x_serial, y_serial } from '@/service/Timetable';
import Fuse from 'fuse.js';
import type { AutoCompleteCompleteEvent } from 'primevue';
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();
const weekDayOpts = weekDays.map((v, i) => { return { name: v, code: y_serial[i] } });
const currentDay = new Date().getDay()
const weekDay = ref(weekDayOpts[route.query.day ?? currentDay == 0 ? 0 : currentDay - 1]);
const timeline = ref<{ room: string | undefined, period: number, time_slot: string, course: string, batch: string }[]>([]);
const currentPeriod = ref(0);
const allProfessors = timetableDB.getProfessorList()
const filteredProfessors = ref(allProfessors);
const fuse = new Fuse(allProfessors)
const professor = ref(route.query.prof?.toString() || "");
const displayTimeline = ref(false);

const searchProfessor = (e: AutoCompleteCompleteEvent) => {
  if(e.query == "") filteredProfessors.value = allProfessors.slice(0,30)
  else filteredProfessors.value = fuse.search(e.query).map((v) => v.item)

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
      room: room?.room ?? '',
      course: room?.course ?? '',
      batch: room?.batch ?? '',
      period: parseInt(period),
      time_slot: time_slots[parseInt(period) - 1]
    })
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
watch(professor, (newState) => {
  if (!newState) return;
  router.replace({ query: { ...route.query, prof: newState } });
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
    <div class="w-full">
      <div class="card flex flex-col gap-4">

        <div class="font-semibold text-xl">Professor Timetable</div>
        <div class="flex flex-col gap-2 max-w-64">
          <label for="professor">Name</label>
          <AutoComplete v-model="professor" dropdown placeholder="Search" :suggestions="filteredProfessors":virtualScrollerOptions="{ itemSize: 30 }"  @complete="searchProfessor"/>
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
                  <Tag v-if="slot.course" :value="slot.course"></Tag>
                  <Tag v-if="slot.batch" :value="slot.batch"></Tag>
                  <Tag v-if="slot.room" :value="slot.room"></Tag>
                </div>
                <span class="text-muted-color whitespace-nowrap  text-sm">{{
                  slot.time_slot }}</span>
              </div>
            </Chip>
          </div>
        </div>
      </div>
    </div>
  </Fluid>
</template>
