import { useAuth } from "@/contexts/AuthContext";
import { useSessions } from "@/hooks/useSupabaseQuery";

const TutorEarnings = () => {
  const { user } = useAuth();
  const { data: allSessions = [], isLoading } = useSessions(user?.id ?? "", "tutor");

  const completed = allSessions.filter((s: any) => s.status === "completed");
  const now = new Date();
  const thisMonth = completed.filter((s: any) => {
    const d = new Date(s.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalThisMonth = thisMonth.reduce((sum: number, s: any) => sum + Number(s.price), 0);

  return (
    <div className="px-5 pt-14 pb-4">
      <h1 className="font-display text-[22px] font-medium mb-5">Earnings</h1>
      <div className="bg-surface rounded-xl border border-hairline p-6 text-center mb-6">
        <div className="text-sm text-muted-ink mb-1">This month</div>
        <div className="font-display text-4xl font-medium">${totalThisMonth}</div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : completed.length > 0 ? (
        <>
          <h2 className="font-display text-base font-medium mb-3">Recent sessions</h2>
          <div className="bg-surface rounded-xl border border-hairline divide-y divide-hairline">
            {completed.slice(0, 10).map((s: any) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-sm font-medium">{s.student?.full_name || "Student"}</div>
                  <div className="text-xs text-muted-ink">{s.course?.code} · {new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                </div>
                <span className="font-display font-medium text-success">+${Number(s.price)}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-muted-ink">No completed sessions yet. Your earnings will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default TutorEarnings;
