<script setup lang="ts">
import { periodTime, time_slots, Timetable, timetableStart, weekDays, x_serial, y_serial } from '@/service/Timetable';
import { TimetableDB } from '@/service/TimetableDB';
import { getDocument } from 'pdfjs-dist';
import type { FileUploadUploaderEvent } from 'primevue';
import { useToast } from 'primevue/usetoast';
import { ref, watch } from 'vue';
const db = new TimetableDB()
const reader = new FileReader()

const toast = useToast();
const fileupload = ref();
const deleteTimetableDialog = ref(false);
function upload() {
  fileupload.value.upload();
}
const deleteTimetables = () => {
  db.delete()
  deleteTimetableDialog.value = false
  toast.add({ severity: 'success', summary: 'Success', detail: 'Deleted All Timetables', life: 3000 });
}
function confirmDelete() {
  deleteTimetableDialog.value = true;
}

const onTimetableLoad = async (e: ProgressEvent<FileReader>) => {
  try {
    const task = getDocument(e.target!.result as ArrayBuffer)
    const res = await task.promise
    const timetables = await Timetable.fromPDF(res)
    db.addTimetables(timetables)
    db.rebuildData()
    db.save()
    toast.add({ severity: 'success', summary: 'Success', detail: 'Timetable Uploaded', life: 3000 });
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Timetable Could\'nt be added!', life: 3000 });
  }
}
reader.onload = onTimetableLoad
function onUpload(e: FileUploadUploaderEvent) {
  try {
    const file = e.files instanceof File ? e.files : e.files[0]
    reader.readAsArrayBuffer(file)
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Timetable Could\'nt be uploaded!', life: 3000 });
  }
}
</script>

<template>
  <Fluid>
    <div class="flex flex-col md:flex-row gap-8">

      <div class="md:w-full">
        <div class="flex justify-between items-center">
          <div class="font-semibold text-xl">Database</div>
          <Button label="Delete" icon="pi pi-trash" severity="secondary" class="max-w-32" @click="confirmDelete" />
        </div>
        <div class="card flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <div class="font-semibold text-lg mb-2">Add Timetable</div>
            <div class="flex items-start space-x-2 w-fit">
              <Toast />
              <FileUpload ref="fileupload" mode="basic" name="demo[]" accept="application/pdf" :maxFileSize="10000000"
                @uploader="onUpload" customUpload />
              <Button label="Upload Timetable" @click="upload" severity="secondary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </Fluid>
  <Dialog v-model:visible="deleteTimetableDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
    <div class="flex items-center gap-4">
      <i class="pi pi-exclamation-triangle !text-3xl" />
      <span>Are you sure you want to delete all timetables?</span>
    </div>
    <template #footer>
      <Button label="No" icon="pi pi-times" text @click="deleteTimetableDialog = false" />
      <Button label="Yes" icon="pi pi-check" text @click="deleteTimetables" />
    </template>
  </Dialog>
</template>
