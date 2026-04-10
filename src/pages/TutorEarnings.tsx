import { motion } from "framer-motion";
import { getTutor } from "@/data/tutors";
import { getCourse } from "@/data/courses";

const completedSessions = [
  { id: "e1", studentName: "Sara M.", courseId: "c1", date: "2026-04-08", amount: 15 },
  { id: "e2", studentName: "Ali K.", courseId: "c2", date: "2026-04-06", amount: 15 },
  { id: "e3", studentName: "Mia R.", courseId: "c1", date: "2026-04-04", amount: 15 },
  { id: "e4", studentName: "Fadi N.", courseId: "c9", date: "2026-04-02", amount: 15 },
  { id: "e5", studentName: "Hana S.", courseId: "c2", date: "2026-03-30", amount: 15 },
  { id: "e6", studentName: "George A.", courseId: "c1", date: "2026-03-28", amount: 15 },
  { id: "e7", studentName: "Tarek B.", courseId: "c26", date: "2026-03-25", amount: 15 },
];

const totalThisMonth = completedSessions.filter(s => s.date.startsWith("2026-04")).reduce((sum, s) => sum + s.amount, 0);

const TutorEarnings = () => {
  return (
    <div className="px-5 pt-14 pb-4">
      <h1 className="font-display text-[22px] font-medium mb-5">Earnings</h1>
      <div className="bg-surface rounded-xl border border-hairline p-6 text-center mb-6">
        <div className="text-sm text-muted-ink mb-1">This month</div>
        <div className="font-display text-4xl font-medium">${totalThisMonth}</div>
      </div>
      <h2 className="font-display text-base font-medium mb-3">Recent sessions</h2>
      <div className="bg-surface rounded-xl border border-hairline divide-y divide-hairline">
        {completedSessions.map(s => {
          const course = getCourse(s.courseId);
          return (
            <div key={s.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-sm font-medium">{s.studentName}</div>
                <div className="text-xs text-muted-ink">{course?.code} · {new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
              </div>
              <span className="font-display font-medium text-success">+${s.amount}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TutorEarnings;
