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
const y_serial = [
  'Mo',
  'Tu',
  'We',
  'Th',
  'Fr',
  'Sa',]
const x_serial = ['1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',]
const offsets = {
  room_1: [-33.11999700000001, -14.400009000000011],
  prof_1: [32.880009, -14.400009000000011],
  room_2: [-29.159991750000017, -14.519989500000065],
  prof_2: [20.399985749999985, -14.519989500000065],
  room_2t: [-29.160003749999987, 7.559989499999972],
  prof_2t: [28.679993249999995, 7.559989499999972],
  group_b: [20.160003749999987, 0.7199940000000424],
  group_t: [20.160003749999987, 23.879996999999946],
}
const cell_size = { w: 68, h: 44 }
const pos_map = {}
function itemXY(it) { return [it.transform[4] + it.width * 0.5, it.transform[5] + it.height * 0.5] }
export function mapTextToTable(items) {
  for (let i of x_serial.concat(y_serial)) {
    const it = items.find((val) => val.str.trim() == i)
    pos_map[it.str] = itemXY(it)
  }
  console.log(pos_map)
  const tempMap = {}
  for (let item of items) {
    let [x, y] = itemXY(item)
    let sx = null, sy = null
    let minx = Infinity, miny = Infinity
    for (let col of x_serial) {
      let mx = Math.abs(x - pos_map[col][0])
      if (mx < minx) {
        minx = mx
        sx = col
      }
    }
    for (let row of y_serial) {
      let my = Math.abs(y - pos_map[row][1])
      if (my < miny) {
        miny = my
        sy = row
      }
    }
    tempMap[item.str] = tempMap[item.str] ?? []
    tempMap[item.str].push([sx, sy, x - pos_map[sx][0], y - pos_map[sy][1]])
  }

  const cells = {}
  for (let row of y_serial) {
    cells[row] = {}
    for (let col of x_serial) {
      let x = pos_map[col][0], y = pos_map[row][1]
      let cell_items = items.filter(v => {
        const [ix, iy] = itemXY(v)
        return v.str.trim() != '' && ix >= x - cell_size.w * 0.5 && ix <= x + cell_size.w * 0.5 && iy <= y + cell_size.h * 0.5 && iy >= y - cell_size.h * 0.5
      })
      cells[row][col] = cell_items
    }
    for (let i in cells[row]) {
      const rw = cells[row]

      if (rw[i].length == 1 && parseInt(i) + 1 in rw && rw[parseInt(i) + 1].length == 2) {
        let x = pos_map[i][0], y = pos_map[row][1]
        let cell_items = items.filter(v => {
          const [ix, iy] = itemXY(v)
          return v.str.trim() != '' && ix >= x - cell_size.w * 0.5 && ix <= x + cell_size.w * 1.6 && iy <= y + cell_size.h * 0.5 && iy >= y - cell_size.h * 0.5
        })
        rw[i] = cell_items
        rw[parseInt(i) + 1] = cell_items
      }
    }
  }

  console.log(cells)

  // console.log(tempMap)

  // let f = 'CSE1009'
  // let it = items
  //   .filter((val) => val.str.trim() == f)
  //   .map(val => [itemXY(val)[0] - pos_map['1'][0], itemXY(val)[1] - pos_map['Mo'][1]])
  //   .sort((a, b) => Math.abs(a[0]) - Math.abs(b[0]) + Math.abs(a[1]) - Math.abs(b[1]))
  // console.log(it)
  // it = it[0]
  // console.log(it.toString())
  // console.log(pos_map['1'])
  // console.log(pos_map['Mo'])





  // for (let row of y_serial) {
  //   for (let col of x_serial) {
  //     let x = pos_map[col][0], y = pos_map[row][1]
  //     // for (let key in offsets) {
  //     // let [ox, oy] = offsets[key]
  //     // let [ox, oy] = offsets.room_1
  //     let [ox, oy] = [0, 0]
  //     // console.log(x + ox, y + oy)
  //     console.log(items.find(val => val.str.trim() == "1"))
  //     console.log(items.find(val => val.str.trim() == "Mo"))
  //     console.log(items.find(val => val.str.trim() == "ELE1001L"))
  //     console.log(items.find(val => val.str.trim() == "ELE1001"))
  //     // const it = items.find((val) => Math.abs(val.transform[4] - (ox + x)) < 20 && Math.abs(val.transform[5] - (oy + y)) < 20)
  //     // console.log(it)
  //     // }
  //     break
  //   }
  //   break
  // }
}

// console.log(pos_map)
//   let f = 'Group 1'
//   let it = items
//     .filter((val) => val.str.trim() == f)
//     .map(val => [val.transform[4] - pos_map['4'][0], val.transform[5] - pos_map['We'][1]])
//     .sort((a, b) => Math.abs(a[0]) - Math.abs(b[0]) + Math.abs(a[1]) - Math.abs(b[1]))
//   console.log(it)
//   it = it[0]
//   console.log(it.toString())
//   console.log(pos_map['1'])
//   console.log(pos_map['Mo'])

// approach to extract cell data from table:
// check for subject code in these positions : [center_single, center_double, top_double, bottom_double]
// position offsets : [[-0.5, 0.5, -0.5, 0.5], [-0.5, 1.5, -0.5, 0.5], [-0.5, 1.5, -0.5, 0], [-0.5, 1.5, 0, 0.5]]
