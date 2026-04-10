export interface Session {
  id: string;
  tutorId: string;
  studentId: string;
  courseId: string;
  date: string;
  time: string;
  duration: number;
  location: "online" | "in-person";
  status: "upcoming" | "completed" | "cancelled";
  price: number;
}

export const sessions: Session[] = [
  { id: "s1", tutorId: "t1", studentId: "student1", courseId: "c1", date: "2026-04-12", time: "14:00", duration: 60, location: "online", status: "upcoming", price: 15 },
  { id: "s2", tutorId: "t5", studentId: "student1", courseId: "c4", date: "2026-04-14", time: "10:00", duration: 60, location: "in-person", status: "upcoming", price: 20 },
  { id: "s3", tutorId: "t3", studentId: "student1", courseId: "c3", date: "2026-04-16", time: "16:00", duration: 60, location: "online", status: "upcoming", price: 18 },
  { id: "s4", tutorId: "t2", studentId: "student1", courseId: "c6", date: "2026-04-18", time: "11:00", duration: 60, location: "in-person", status: "upcoming", price: 12 },
  { id: "s5", tutorId: "t15", studentId: "student1", courseId: "c28", date: "2026-04-20", time: "09:00", duration: 90, location: "in-person", status: "upcoming", price: 33 },
  { id: "s6", tutorId: "t1", studentId: "student1", courseId: "c2", date: "2026-03-20", time: "15:00", duration: 60, location: "online", status: "completed", price: 15 },
  { id: "s7", tutorId: "t5", studentId: "student1", courseId: "c5", date: "2026-03-15", time: "10:00", duration: 60, location: "in-person", status: "completed", price: 20 },
  { id: "s8", tutorId: "t3", studentId: "student1", courseId: "c10", date: "2026-03-10", time: "14:00", duration: 60, location: "online", status: "completed", price: 18 },
  { id: "s9", tutorId: "t2", studentId: "student1", courseId: "c7", date: "2026-02-28", time: "11:00", duration: 60, location: "in-person", status: "completed", price: 12 },
  { id: "s10", tutorId: "t4", studentId: "student1", courseId: "c8", date: "2026-02-20", time: "16:00", duration: 60, location: "online", status: "completed", price: 14 },
];

export const getUpcomingSessions = () => sessions.filter(s => s.status === "upcoming");
export const getPastSessions = () => sessions.filter(s => s.status === "completed");
