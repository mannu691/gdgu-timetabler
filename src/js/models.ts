import type { PDFPageProxy } from "pdfjs-dist"
import type { TextItem } from "pdfjs-dist/types/src/display/api"

const master_serial = { key: "Short", val: "Name" }
const y_serial = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const
const x_serial = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const
type TableCell = { prof: string, course: string, room: string, group: string | undefined, is_double: boolean }
type Days = (typeof y_serial)[number]
type Periods = (typeof x_serial)[number]
type WeeklySchedule = Partial<{ [K in Days]: Partial<{ [P in Periods]: TableCell }> }>;

const cell_size = { w: 76, h: 48 }
const cell_offsets = {
  sc: [-0.5, 0.5, -0.5, 0.5],
  dc: [-0.5, 1.5, -0.5, 0.5],
  dt: [-0.5, 1.5, -0.5, 0],
  db: [-0.5, 1.5, 0, 0.5],
}

function itemXY(it: TextItem): [number, number] {
  return [it.transform[4] + it.width * 0.5, it.transform[5] + it.height * 0.5]
}

export class Timetable {
  batch: string
  data: WeeklySchedule
  courses: { [key: string]: string }
  professors: { [key: string]: string }
  constructor(batch: string, data: WeeklySchedule, courses: { [key: string]: string }, professors: { [key: string]: string }) {
    this.batch = batch
    this.data = data
    this.professors = professors
    this.courses = courses
  }
  static async fromPDF(page: PDFPageProxy): Promise<Timetable | undefined> {
    const items = (await page.getTextContent()).items as TextItem[]
    // skip timetable with different structure
    if (items[0].str.includes("G D Goenka University")) return undefined
    const anchor_map: { [key: string]: [number, number] } = {}

    // map all positions of serial anchors
    for (let i of [...x_serial, ...y_serial]) {
      const it = items.find((val) => val.str.trim() == i)!
      anchor_map[it.str] = itemXY(it)
    }
    const cells: WeeklySchedule = {}
    // extract the actual schedule table
    for (let row of y_serial) {
      cells[row] = {}
      for (let col of x_serial) {
        if (cells[row][col] != undefined) continue
        let x = anchor_map[col][0],
          y = anchor_map[row][1]
        let is_double = false
        for (const [cf, offset] of Object.entries(cell_offsets)) {
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
          //there maybe more than 1 match of cell type but idk , we'll see
          let vals = its.map(v => v.str).sort((v1, v2) => v1.length - v2.length)
          let gi = vals.findIndex(v => v.includes('Group'))
          let group = gi != -1 ? vals[gi] : undefined
          if (gi != -1) vals.splice(gi, 1)
          let cell = {
            prof: vals[0],
            room: vals[1],
            course: vals[2],
            group: group,
            is_double: is_double
          }
          cells[row][col] = cell
          break
        }
      }
    }

    // get pair of Short and Name anchors
    let key_anchors = items.filter(v => v.str.trim() == master_serial.key)
    let master_anchors = []
    for (let i of key_anchors) {
      let x = i.transform[4], y = i.transform[5]
      let closestVal = items.filter(v => v.str.trim() == master_serial.val)
        .reduce((prev, cur) => (Math.abs(prev.transform[4] - x) + Math.abs(prev.transform[5] - y)) < Math.abs(cur.transform[4] - x) + Math.abs(cur.transform[5] - y) ? prev : cur)
      master_anchors.push([i, closestVal])
    }
    //extract course and professor details
    let masters = []
    for (let i = 0; i < 2; i++) {
      const anchor = master_anchors[i]
      const sx = anchor[0].transform[4], sy = anchor[0].transform[5]
      const nx = anchor[1].transform[4], ny = anchor[1].transform[5]
      const keys = items.filter(v => v.str.trim() != "" && v.transform[5] < sy && Math.abs(v.transform[4] - sx) < 5)
      const vals = items.filter(v => v.str.trim() != "" && v.transform[5] < ny && Math.abs(v.transform[4] - nx) < 5)
      masters[i] = Object.fromEntries(
        keys.map((key, index) => [key.str, vals[index].str])
      );
    }
    return new Timetable(items[0].str, cells, masters[0], masters[1])
  }
}






