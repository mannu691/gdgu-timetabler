import { getDocument } from 'pdfjs-dist'
export function extractTextFromPdf(arrBuf) {
  const task = getDocument(arrBuf)
  return task.promise.then(function (pdf) {
    // get all pages text
    const maxPages = pdf.numPages
    const countPromises = [] // collecting all page promises
    for (let j = 1; j <= maxPages; j++) {
      const page = pdf.getPage(j)
      countPromises.push(
        page.then(function (page) {
          // add page promise
          const textContent = page.getTextContent()
          return textContent.then(function (text) {
            // return content promise
            return text.items
              .map(function (s) {
                return s.str
              })
              .join('#') // value page text
          })
        }),
      )
    }
    // Wait for all pages and join text
    return Promise.all(countPromises)
  })
}
const identifiers = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'Mo',
  'Tu',
  'We',
  'Th',
  'Fr',
  'Sa',
]
const pos_map = {}
const _offsets = {
  room_bottom: [46.08000224999998, -107.16000299999996],
  prof_bottom: [],
  room_top: [],
  prof_top: [],
  group_bottom: [],
  group_top: [],
}
export function mapTextToTable(items) {
  for (let i of identifiers) {
    const it = items.find((val) => val.str.trim() == i)
    pos_map[it.str] = [it.transform[4], it.transform[5]]
  }
  console.log(pos_map)
  let f = 'SK'
  let it = items
    .filter((val) => val.str.trim() == f)
    .sort((a, b) => a.transform[5] - b.transform[5] - (a.transform[4] - b.transform[4]))
  console.log(it)
  it = it[0]
  console.log(it.transform[4] - pos_map['1'][0], ',', it.transform[5] - pos_map['Mo'][1])
  console.log(it.transform[4], it.transform[5])
  console.log(pos_map['1'])
  console.log(pos_map['Mo'])
  // console.log(items.find((val) => val.str.trim() == f).transform[5])
  // for(let item of items){

  // }
}
