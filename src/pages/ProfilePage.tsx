import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUniversity } from "@/contexts/UniversityContext";
import { useUniversities } from "@/hooks/useSupabaseQuery";
import { supabase } from "@/lib/supabase";
import { GraduationCap, Heart, CreditCard, Bell, ArrowRightLeft, HelpCircle, Info, LogOut, ChevronRight } from "lucide-react";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { selectedUniversity } = useUniversity();
  const { data: universities = [] } = useUniversities();
  const uni = universities.find(u => u.id === (profile?.university_id || selectedUniversity));

  const switchToTutor = async () => {
    if (!user) return;
    await supabase.from("profiles").update({ role: "tutor" }).eq("id", user.id);
    await refreshProfile();
    navigate("/tutor/requests");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/welcome");
  };

  const rows = [
    { icon: GraduationCap, label: "My university", sublabel: uni?.short_name },
    { icon: Heart, label: "Saved tutors" },
    { icon: CreditCard, label: "Payment methods" },
    { icon: Bell, label: "Notifications" },
    { icon: ArrowRightLeft, label: "Switch to tutor mode", action: switchToTutor, highlight: true },
    { icon: HelpCircle, label: "Help & support" },
    { icon: Info, label: "About" },
    { icon: LogOut, label: "Sign out", action: handleSignOut, destructive: true },
  ];

  return (
    <div className="px-5 pt-14 pb-4">
      <div className="flex flex-col items-center mb-8">
        <img src={profile?.avatar_url || "https://i.pravatar.cc/100?img=68"} alt="Profile" className="w-20 h-20 rounded-full mb-3" />
        <h1 className="font-display text-xl font-medium mb-1">{profile?.full_name || "User"}</h1>
        {uni && (
          <span className="text-xs px-2.5 py-0.5 rounded-pill font-medium mb-3" style={{ backgroundColor: uni.color + "15", color: uni.color }}>
            {uni.short_name}
          </span>
        )}
        <motion.button whileTap={{ scale: 0.96 }} className="px-4 py-2 rounded-lg border border-hairline text-sm font-medium">
          Edit profile
        </motion.button>
      </div>

      <div className="bg-surface rounded-xl border border-hairline divide-y divide-hairline">
        {rows.map(row => (
          <motion.button
            key={row.label}
            whileTap={{ scale: 0.98 }}
            onClick={row.action}
            className={`w-full flex items-center gap-3 px-4 h-14 text-left ${row.destructive ? "text-destructive" : ""}`}
          >
            <row.icon size={20} className={row.highlight ? "text-accent" : row.destructive ? "text-destructive" : "text-muted-ink"} />
            <span className={`flex-1 text-sm font-medium ${row.highlight ? "text-accent" : ""}`}>{row.label}</span>
            {row.sublabel && <span className="text-xs text-muted-ink">{row.sublabel}</span>}
            <ChevronRight size={16} className="text-muted-ink" />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;
