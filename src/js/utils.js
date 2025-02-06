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
const y_serial = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const x_serial = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

const cell_size = { w: 76, h: 48 }
const cell_offsets = {
  sc: [-0.5, 0.5, -0.5, 0.5],
  dc: [-0.5, 1.5, -0.5, 0.5],
  dt: [-0.5, 1.5, -0.5, 0],
  db: [-0.5, 1.5, 0, 0.5],
}
const pos_map = {}
function itemXY(it) {
  return [it.transform[4] + it.width * 0.5, it.transform[5] + it.height * 0.5]
}
export function mapTextToTable(items) {
  for (let i of x_serial.concat(y_serial)) {
    const it = items.find((val) => val.str.trim() == i)
    pos_map[it.str] = itemXY(it)
  }
  const cells = {}
  for (let row of y_serial) {
    cells[row] = {}
    for (let col of x_serial) {
      if (cells[row][col] != undefined) continue
      let x = pos_map[col][0],
        y = pos_map[row][1]
      let cell_items = []
      let is_double = false
      for (let cf in cell_offsets) {
        let offset = cell_offsets[cf]
        if (
          items.find((v) => {
            const [ix, iy] = itemXY(v)
            return (
              Math.abs(ix - (x + cell_size.w * (offset[0] + offset[1]) * 0.5)) < 6 &&
              Math.abs(iy - (y + cell_size.h * (offset[2] + offset[3]) * 0.5)) < 6
            )
          }) == undefined
        )
          continue
        if (cf.includes('d')) is_double = true
        let its = items.filter((v) => {
          const [ix, iy] = itemXY(v)
          return (
            v.str.trim() != '' &&
            ix >= x + cell_size.w * offset[0] &&
            ix <= x + cell_size.w * offset[1] &&
            iy >= y + cell_size.h * offset[2] &&
            iy <= y + cell_size.h * offset[3]
          )
        })
        cell_items.push(its)
      }
      if (cell_items.length > 1) {
        console.log(col, row, cell_items)
      }
      cells[row][col] = cell_items
      if (is_double && parseInt(col) < x_serial.length) cells[row][parseInt(col) + 1] = cell_items
    }
  }
  console.log(cells)
}
