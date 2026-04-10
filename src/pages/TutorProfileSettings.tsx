import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUniversity } from "@/contexts/UniversityContext";
import { useUniversities } from "@/hooks/useSupabaseQuery";
import { supabase } from "@/lib/supabase";
import { BadgeCheck, Star, ArrowRightLeft, Settings, HelpCircle, LogOut, ChevronRight } from "lucide-react";

const TutorProfilePage = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { selectedUniversity } = useUniversity();
  const { data: universities = [] } = useUniversities();
  const uni = universities.find(u => u.id === (profile?.university_id || selectedUniversity));

  const switchToStudent = async () => {
    if (!user) return;
    await supabase.from("profiles").update({ role: "student" }).eq("id", user.id);
    await refreshProfile();
    navigate("/");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/welcome");
  };

  const rows = [
    { icon: Settings, label: "Edit profile" },
    { icon: ArrowRightLeft, label: "Switch to student mode", action: switchToStudent, highlight: true },
    { icon: HelpCircle, label: "Help & support" },
    { icon: LogOut, label: "Sign out", action: handleSignOut, destructive: true },
  ];

  return (
    <div className="px-5 pt-14 pb-4">
      <div className="flex flex-col items-center mb-6">
        <img src={profile?.avatar_url || "https://i.pravatar.cc/100?img=11"} alt="Profile" className="w-20 h-20 rounded-full mb-3" />
        <div className="flex items-center gap-1.5 mb-1">
          <h1 className="font-display text-xl font-medium">{profile?.full_name || "Tutor"}</h1>
          {profile?.verified && <BadgeCheck size={18} className="text-accent" />}
        </div>
        {uni && (
          <span className="text-xs px-2.5 py-0.5 rounded-pill font-medium mb-1" style={{ backgroundColor: uni.color + "15", color: uni.color }}>
            {uni.short_name}
          </span>
        )}
        <p className="text-sm text-muted-ink">{profile?.major}, {profile?.year}</p>
      </div>

      <div className="flex items-center justify-around bg-surface rounded-xl border border-hairline p-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Star size={14} className="text-accent fill-accent" />
            <span className="font-display font-medium text-lg">—</span>
          </div>
          <span className="text-xs text-muted-ink">rating</span>
        </div>
        <div className="w-px h-8 bg-hairline" />
        <div className="text-center">
          <div className="font-display font-medium text-lg mb-0.5">0</div>
          <span className="text-xs text-muted-ink">sessions</span>
        </div>
        <div className="w-px h-8 bg-hairline" />
        <div className="text-center">
          <div className="font-display font-medium text-lg mb-0.5">${profile?.hourly_rate ?? 0}</div>
          <span className="text-xs text-muted-ink">per hour</span>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-hairline divide-y divide-hairline">
        {rows.map(row => (
          <motion.button key={row.label} whileTap={{ scale: 0.98 }} onClick={row.action}
            className={`w-full flex items-center gap-3 px-4 h-14 text-left ${row.destructive ? "text-destructive" : ""}`}>
            <row.icon size={20} className={row.highlight ? "text-accent" : row.destructive ? "text-destructive" : "text-muted-ink"} />
            <span className={`flex-1 text-sm font-medium ${row.highlight ? "text-accent" : ""}`}>{row.label}</span>
            <ChevronRight size={16} className="text-muted-ink" />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default TutorProfilePage;
