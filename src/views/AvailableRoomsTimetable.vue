<script setup lang="ts">
import { timetableDB } from '@/main';
import { periodTime, time_slots, timetableStart, weekDays, x_serial, y_serial } from '@/service/Timetable';
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const weekDayOpts = weekDays.map((v, i) => { return { name: v, code: y_serial[i] } });
const currentDay = new Date().getDay()
const timeline = ref<{ rooms: string[], period: number, time_slot: string }[]>([]);
const currentPeriod = ref("0");
const weekDay = ref(weekDayOpts[route.query.day ?? currentDay == 0 ? 0 : currentDay - 1]);
const updateTimeline = () => {

  const day = timetableDB.availableRooms[weekDay.value.code] ?? []
  const freeRooms = []
  for (const period of x_serial) {
    const rooms = day[period] ?? []
    rooms.sort((a, b) => {
      return parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, ''))
    })
    freeRooms.push({
      rooms: rooms,
      period: parseInt(period),
      time_slot: time_slots[parseInt(period) - 1]
    })
  }
  timeline.value = freeRooms
  const currentTime = new Date();
  const diffTime = (currentTime.getHours() * 60 + currentTime.getMinutes()) - (timetableStart.getHours() * 60 + timetableStart.getMinutes());
  if (diffTime < 0) currentPeriod.value = "0"
  else {
    const slotIndex = Math.floor(diffTime / periodTime);
    currentPeriod.value = slotIndex >= time_slots.length ? "0" : (slotIndex + 1).toString();
  }

}
watch(weekDay, (newState) => {
  if(!newState)return;
  router.replace({ query: { ...route.query, day: y_serial.indexOf(newState.code) } });
  updateTimeline()
});
onMounted(() => updateTimeline())
</script>

<template>
  <Fluid>
    <div class="flex flex-col md:flex-row gap-8">
      <div class="md:w-full">
        <div class="card flex flex-col gap-4">
          <div class="font-semibold text-xl">Find Available Classroom</div>
          <div class="flex flex-col gap-2">
            <SelectButton class="flex-col sm:flex-row " v-model="weekDay" :options="weekDayOpts" optionLabel="name" />
          </div>
          <Divider />
          <div v-if="timeline.length != 0">
            <div class="font-semibold text-xl mb-4">Available Rooms</div>
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
                  <div class="flex gap-1 flex-wrap my-2 sm:w-64 w-32">
                    <Tag v-for="room in slotProps.item.rooms" :key="room" :value="room"></Tag>
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
