<!-- <script setup lang="ts" lang="ts">
import { Timetable } from '@/js/timetable'
import { TimetableDB } from '@/js/timetable_db'
import { getDocument } from 'pdfjs-dist'
const reader = new FileReader()

const onPdfFileLoad = async (e) => {
  const task = getDocument(e.target.result)
  const res = await task.promise
  for (let i = 1; i <= res.numPages; i++) {
    const page = await res.getPage(i)
    const timetable = await Timetable.fromPDFPage(page)
    console.log(timetable)
  }
}
const onTimetableInput = async (event) => {
  reader.readAsArrayBuffer(event.target.files[0])
}

const test = async () => {
  const task = getDocument('http://localhost:5173/test.pdf')
  const res = await task.promise
  const db = new TimetableDB()
  db.delete()
  const timetables = await Timetable.fromPDF(res)
  db.addTimetables(timetables)
  db.rebuildData()
  db.save()
  console.log(db.availableRooms)
}
test()
</script>

<template>
  <main>
    <input @input="onTimetableInput" type="file" name="timetable-pdf" id="timetable-pdf" />
  </main>
</template> -->
