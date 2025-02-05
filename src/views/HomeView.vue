<script setup>
import { extractTextFromPdf, mapTextToTable } from '@/js/utils'
import { getDocument } from 'pdfjs-dist'
const pageDivider = '16:30'
const tableTitle = 'School of Engineering and Sciences'

const reader = new FileReader()
const convertTimeTable = (text) => {
  const courseTitle = text.substring(0, text.indexOf(tableTitle))
  if (!courseTitle) return null
  return true
}

const onPdfFileLoad = async (e) => {
  // const res = PdfParse(e.target.result)
  // console.log(res)
  // const res = await extractTextFromPdf(e.target.result)
  // console.log(res)
  // for (let page of res.split(pageDivider)) {
  //   const timetable = convertTimeTable(page + pageDivider)
  //   if (!timetable) {
  //     console.log(page + pageDivider)
  //   }
  // }
  // console.log(res)
}
const onTimetableInput = async (event) => {
  reader.readAsArrayBuffer(event.target.files[0])
}
reader.onload = onPdfFileLoad
const test = async () => {
  const task = getDocument('http://localhost:5173/test.pdf')
  const res = await task.promise
  const page = await res.getPage(1)
  const content = await page.getTextContent()
  const rows = {}
  mapTextToTable(content.items)
  // console.log(content)
  // for (let item of content.items) {
  //   // if (!item.str.trim()) continue
  //   // rows[item.transform[5]] = rows[item.transform[5]] ?? []
  //   // rows[item.transform[5]].push(item)
  // }
  // console.log(rows)
}
test()
</script>

<template>
  <main>
    <input @input="onTimetableInput" type="file" name="timetable-pdf" id="timetable-pdf" />
  </main>
</template>
