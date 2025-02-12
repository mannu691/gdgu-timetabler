import { Timetable, x_serial, y_serial, type Days, type Periods, type WeeklySchedule } from "./timetable";

export class TimetableDB {
  timetables: { [key: string]: Timetable }
  professorTimetables: { [key: string]: WeeklySchedule<string> }
  availableRooms: WeeklySchedule<string[]>

  constructor() {
    this.timetables = {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    JSON.parse(localStorage.getItem("timetables") ?? "[]").forEach((data: any) => {
      const table = Timetable.fromJSON(data)
      this.timetables[table.batch] = table
    })
    this.professorTimetables = JSON.parse(localStorage.getItem("professorTimetables") ?? "{}") as { [key: string]: WeeklySchedule<string> }
    this.availableRooms = JSON.parse(localStorage.getItem("availableRooms") ?? "{}") as WeeklySchedule<string[]>
  }

  getTimetable(batch: string) {
    return this.timetables[batch]
  }
  getBatchList() {
    return Object.keys(this.timetables)
  }

  getProfessorList() {
    return Object.keys(this.professorTimetables)
  }

  addTimetable(timetable: Timetable) {
    this.timetables[timetable.batch] = timetable
  }

  addTimetables(timetables: Timetable[]) {
    for (const timetable of timetables) {
      this.addTimetable(timetable)
    }
  }

  rebuildData() {
    //TODO rebuild cache of free rooms and professor timetables
    const allRooms = new Set<string>()
    const busyRooms: WeeklySchedule<string[]> = {}
    const freeRooms: WeeklySchedule<string[]> = {}
    const profSchedule: { [key: string]: WeeklySchedule<string> } = {}
    for (const timetable of Object.values(this.timetables)) {
      for (const [day, periods] of Object.entries(timetable.schedule)) {
        for (const [period, cell] of Object.entries(periods)) {
          if (!cell.room) continue
          const y = day as Days
          const x = period as Periods
          busyRooms[y] = busyRooms[y] ?? {}
          busyRooms[y][x] = busyRooms[y][x] ?? []
          //shouldn't really hardcode a filter like this but fk it we ball
          if (cell.room.startsWith("B")) {
            busyRooms[y][x].push(cell.room)
            allRooms.add(cell.room)
          }
          if (!cell.prof || !timetable.professors[cell.prof]) continue
          const name = timetable.professors[cell.prof];
          profSchedule[name] = profSchedule[name] ?? {}
          profSchedule[name][y] = profSchedule[name][y] ?? {}
          profSchedule[name][y][x] = cell.room
        }
      }
    }

    // filter the busy rooms from all rooms per day
    for (const day of y_serial) {
      for (const period of x_serial) {
        const busy = (busyRooms[day] ?? {})[period] ?? []
        freeRooms[day] = freeRooms[day] ?? {}
        freeRooms[day][period] = Array.from(allRooms).filter(v => !busy.includes(v))
      }
    }
    this.availableRooms = freeRooms
    this.professorTimetables = profSchedule
  }


  delete() {
    this.timetables = {}
    this.professorTimetables = {}
    this.availableRooms = {}
    this.save()
  }
  save() {
    localStorage.setItem("timetables",JSON.stringify(Object.values(this.timetables)))
    localStorage.setItem("professorTimetables", JSON.stringify(this.professorTimetables))
    localStorage.setItem("availableRooms", JSON.stringify(this.availableRooms))
  }
}
