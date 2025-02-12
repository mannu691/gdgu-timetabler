<script setup lang="ts">
import { ref } from 'vue';

const weekDay = ref("Mo")
const weekDayOpts = ref([
    { name: 'Monday', code: 'Mo' },
    { name: 'Tuesday', code: 'Tu' },
    {}


]);

</script>

<template>
    <Fluid>
        <div class="flex flex-col md:flex-row gap-8">
            <div class="md:w-full">
                <div class="card flex flex-col gap-4">
                    <div class="font-semibold text-xl">Find Available Classroom</div>
                    <div class="flex flex-col gap-2">
                        <label for="name1">WeekDay</label>
                        <SelectButton v-model="weekDay" :options="weekDayOpts" optionLabel="name" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label for="email1">Email</label>
                        <InputText id="email1" type="text" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label for="age1">Age</label>
                        <InputText id="age1" type="text" />
                    </div>
                </div>
            </div>
        </div>
    </Fluid>
</template>
