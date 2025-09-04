import { firebaseApp } from "@/firebase";
import { Timetable, x_serial, y_serial, type Days, type Periods, type WeeklySchedule } from "./Timetable";
import { useFirestore } from 'vuefire'
import { collection, doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
export enum TimetableType {
  Local,
  Firestore
}

interface FirestoreTimetableData {
  timetables: { [batch: string]: Timetable };
  professorTimetables: { [key: string]: WeeklySchedule<{ room: string, course: string, batch: string }> };
  availableRooms: WeeklySchedule<string[]>;
  lastUpdated: string;
}

export class TimetableDB {
  timetables: { [key: string]: Timetable } = {}
  professorTimetables: { [key: string]: WeeklySchedule<{ room: string, course: string, batch: string }> } = {}
  availableRooms: WeeklySchedule<string[]> = {}
  type: TimetableType
  lastUpdated: string = ""
  constructor(type: TimetableType) {
    this.type = type
  }
  async load() {
    if (this.type === TimetableType.Firestore)
      await this.loadFirestore()
    else this.loadLocal()
  }

  private loadLocal() {
    this.timetables = {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    JSON.parse(localStorage.getItem("timetables") ?? "[]").forEach((data: any) => {
      const table = Timetable.fromJSON(data)
      this.timetables[table.batch] = table
    })
    this.professorTimetables = JSON.parse(localStorage.getItem("professorTimetables") ?? "{}") as { [key: string]: WeeklySchedule<{ room: string, course: string, batch: string }> }
    this.availableRooms = JSON.parse(localStorage.getItem("availableRooms") ?? "{}") as WeeklySchedule<string[]>
    this.lastUpdated = localStorage.getItem("lastUpdated") ?? ""
  }

  private async loadFirestore() {
    const db = getFirestore();
    const schedulesDocRef = doc(db, "schedules", "timetables");
    const docSnap = await getDoc(schedulesDocRef);
    if (!docSnap.exists()) return
    const data = docSnap.data() as FirestoreTimetableData
    this.timetables = data.timetables
    this.professorTimetables = data.professorTimetables
    this.availableRooms = data.availableRooms
    this.lastUpdated = data.lastUpdated
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
    const profSchedule: { [key: string]: WeeklySchedule<{ room: string, course: string, batch: string }> } = {}
    for (const timetable of Object.values(this.timetables)) {
      for (const [day, periods] of Object.entries(timetable.schedule)) {
        for (const [period, cells] of Object.entries(periods)) {
          for (const cell of cells) {
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
            if (!cell.prof) continue
            const name = cell.prof;
            profSchedule[name] = profSchedule[name] ?? {}
            profSchedule[name][y] = profSchedule[name][y] ?? {}
            profSchedule[name][y][x] = { room: cell.room, course: cell.course, batch: timetable.batch }
          }
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


  async delete() {
    this.timetables = {}
    this.professorTimetables = {}
    this.availableRooms = {}
    await this.save()
  }
  async save() {
    const date = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD
    const [year, month, day] = date.split('-');
    this.lastUpdated= `${day}-${month}-${year}`
    if (this.type === TimetableType.Local) {
      localStorage.setItem("timetables", JSON.stringify(Object.values(this.timetables)))
      localStorage.setItem("professorTimetables", JSON.stringify(this.professorTimetables))
      localStorage.setItem("availableRooms", JSON.stringify(this.availableRooms))
      localStorage.setItem("lastUpdated", this.lastUpdated)
    }
    else {
      const db = getFirestore();
      const schedulesDocRef = doc(db, "schedules", "timetables");

      const data = {
        timetables: Object.fromEntries(
          Object.entries(this.timetables).map(([batch, table]) => [batch, JSON.parse(JSON.stringify(table))])
        ), professorTimetables: this.professorTimetables, availableRooms: this.availableRooms,
        lastUpdated: this.lastUpdated
      }
      await setDoc(schedulesDocRef, data);
    }
  }
}
