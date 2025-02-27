import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist"
import type { TextItem } from "pdfjs-dist/types/src/display/api"

//Predefined constants for timetable extraction
const master_serial = { key: "Short", val: "Name" }
export const y_serial = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const
export const x_serial = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const
export const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
export const timetableStart = new Date(0, 0, 0, 9, 10);
export const periodTime = 50
export const time_slots = [
  "09:10 - 10:00",
  "10:00 - 10:50",
  "10:50 - 11:40",
  "11:40 - 12:30",
  "12:30 - 13:20",
  "13:20 - 14:10",
  "14:10 - 15:00",
  "15:00 - 15:50",
  "15:50 - 16:30"
] as const;
const cell_size = { w: 76, h: 46 }
const cell_offsets = {
  sc: [-0.5, 0.5, -0.5, 0.5],
  st: [-0.5, 0.5, -0.5, 0],
  sb: [-0.5, 0.5, 0, 0.5],
  dc: [-0.5, 1.5, -0.5, 0.5],
  dt: [-0.5, 1.5, -0.5, 0],
  db: [-0.5, 1.5, 0, 0.5],
}

export type TableCell = { prof: string | undefined, course: string, room: string | undefined, group: string | undefined }
export type Days = (typeof y_serial)[number]
export type Periods = (typeof x_serial)[number]
export type WeeklySchedule<T> = Partial<{ [K in Days]: Partial<{ [P in Periods]: T }> }>;

function itemXY(it: TextItem): [number, number] {
  return [it.transform[4] + it.width * 0.5, it.transform[5] + it.height * 0.5]
}

export class Timetable {
  batch: string
  schedule: WeeklySchedule<TableCell[]>
  courses: { [key: string]: string }
  professors: { [key: string]: string }
  constructor(batch: string, schedule: WeeklySchedule<TableCell[]>, courses: { [key: string]: string }, professors: { [key: string]: string }) {
    this.batch = batch
    this.schedule = schedule
    this.professors = professors
    this.courses = courses
  }
  static async fromPDFPage(page: PDFPageProxy): Promise<Timetable | undefined> {
    const items = (await page.getTextContent()).items as TextItem[]
    // skip timetable with different structure
    if (items[0].str.includes("G D Goenka University")) return undefined
    const anchor_map: { [key: string]: [number, number] } = {}

    // map all positions of serial anchors
    for (const i of [...x_serial, ...y_serial]) {
      const it = items.find((val) => val.str.trim() == i)!
      anchor_map[it.str] = itemXY(it)
    }

    // extract the actual schedule table
    const cells: WeeklySchedule<TableCell[]> = {}
    for (const row of y_serial) {
      cells[row] = {}
      for (const col of x_serial) {
        if ((cells[row][col]?.length ?? 0) != 0) continue
        const x = anchor_map[col][0],
          y = anchor_map[row][1]
        let is_double = false
        for (const [cf, offset] of Object.entries(cell_offsets)) {
          const course = items.find((v) => {
            const [ix, iy] = itemXY(v)
            return (
              Math.abs(ix - (x + cell_size.w * (offset[0] + offset[1]) * 0.5)) < 2 &&
              Math.abs(iy - (y + cell_size.h * (offset[2] + offset[3]) * 0.5)) < 2
            )
          })
          if (course == undefined) continue
          if (cf.includes('d')) is_double = true
          const its = items.filter((v) => {
            const [ix, iy] = itemXY(v)
            return (
              v.str.trim() != '' &&
              ix >= x + cell_size.w * offset[0] &&
              ix <= x + cell_size.w * offset[1] &&
              iy >= y + cell_size.h * offset[2] &&
              iy <= y + cell_size.h * offset[3]
            )
          })

          //TODO extract cell data based on positioning instead of only relying on string format
          const vals = its.sort((v1, v2) => v1.transform[4] - v2.transform[4])
          const used: number[] = [vals.findIndex(v => v.str == course.str)]
          const gi = vals.findIndex((v, i) => !used.includes(i) && v.str.includes('Group'))
          used.push(gi)
          const ri = vals.findIndex((v, i) => !used.includes(i) && /\d/.test(v.str))
          used.push(ri)
          const pi = vals.findIndex((v, i) => !used.includes(i))
          used.push(pi)
          const prof = pi == -1 ? undefined : vals[pi].str
          const room = ri == -1 ? undefined : vals[ri].str
          const group = gi == -1 ? undefined : vals[gi].str
          const cell = {
            prof: prof,
            room: room,
            course: course.str,
            group: group,
          }
          cells[row][col] = cells[row][col] || []
          cells[row][col].push(cell)
          if (is_double && parseInt(col) < 9) {
            let nextSlot = (parseInt(col) + 1).toString() as Periods
            cells[row][nextSlot] = cells[row][nextSlot] || []
            cells[row][nextSlot].push(cell)
          }
        }
      }
    }

    // get pair of Short and Name anchors
    const key_anchors = items.filter(v => v.str.trim() == master_serial.key)
    const master_anchors = []
    for (const i of key_anchors) {
      const x = i.transform[4], y = i.transform[5]
      const closestVal = items.filter(v => v.str.trim() == master_serial.val)
        .reduce((prev, cur) => (Math.abs(prev.transform[4] - x) + Math.abs(prev.transform[5] - y)) < Math.abs(cur.transform[4] - x) + Math.abs(cur.transform[5] - y) ? prev : cur)
      master_anchors.push([i, closestVal])
    }
    //extract course and professor details
    const masters = []
    for (let i = 0; i < 2; i++) {
      const anchor = master_anchors[i]
      const sx = anchor[0].transform[4], sy = anchor[0].transform[5]
      const nx = anchor[1].transform[4], ny = anchor[1].transform[5]
      const keys = items.filter(v => v.str.trim() != "" && v.transform[5] < sy && Math.abs(v.transform[4] - sx) < 5)
      const vals = items.filter(v => v.str.trim() != "" && v.transform[5] < ny && Math.abs(v.transform[4] - nx) < 5)

      let valIndex = 0
      masters[i] = Object.fromEntries(
        keys.map((key) => {
          let keyStr = key.str
          let valStr = vals[valIndex].str
          if (keyStr.includes(" ") && key.transform[5] != vals[valIndex].transform[5]) {
            keyStr = keyStr.split(" ")[0]
            valStr = keyStr.split(" ").slice(1).join(" ")
          } else {
            valIndex++
          }
          return [keyStr, valStr]
        })
      );
    }
    return new Timetable(items[0].str, cells, masters[0], masters[1])
  }

  static async fromPDF(pdf: PDFDocumentProxy): Promise<Timetable[]> {
    const list: Timetable[] = []
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i)
        const timetable = await Timetable.fromPDFPage(page)
        if (timetable) list.push(timetable)
      } catch (_) {
      }
    }
    return list
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromJSON(json: any): Timetable {
    return new Timetable(json.batch, json.schedule, json.courses, json.professors)
  }
}






