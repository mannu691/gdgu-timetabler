import { Timetable, type WeeklySchedule } from "./timetable";

export class TimetableDB {
  timetables: { [key: string]: Timetable }
  professorTimetables: { [key: string]: WeeklySchedule<string> }
  availableRooms: WeeklySchedule<string[]>

  constructor() {
    this.timetables = {}

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
    for (let timetable of timetables) {
      this.addTimetable(timetable)
    }
  }

  rebuildData() {
    //TODO rebuild cache of free rooms and professor timetables
    const allRooms = new Set<string>()
    for (const timetable of Object.values(this.timetables)) {
      for (const day of Object.values(timetable.schedule)) {
        for (const cell of Object.values(day)) {
          allRooms.add(cell.room)
        }
      }
    }
    console.log(allRooms)
  }


  delete() {
    this.timetables = {}
    this.professorTimetables = {}
    this.availableRooms = {}
    this.save()
  }
  save() {
    localStorage.setItem("timetables", JSON.stringify(Object.values(this.timetables)))
    localStorage.setItem("professorTimetables", JSON.stringify(Object.values(this.professorTimetables)))
    localStorage.setItem("availableRooms", JSON.stringify(this.availableRooms))
  }
}
