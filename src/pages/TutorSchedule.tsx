import { motion } from "framer-motion";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = ["9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

const bookedSlots: Record<string, string[]> = {
  Mon: ["10:00", "14:00"],
  Tue: ["09:00", "11:00"],
  Wed: ["14:00", "15:00"],
  Thu: ["10:00"],
  Fri: ["09:00", "14:00", "16:00"],
  Sat: ["10:00"],
  Sun: [],
};

const TutorSchedule = () => {
  return (
    <div className="px-5 pt-14 pb-4">
      <h1 className="font-display text-[22px] font-medium mb-5">Schedule</h1>
      <p className="text-sm text-muted-ink mb-4">This week's booked sessions</p>
      <div className="overflow-x-auto -mx-5 px-5 pb-4">
        <div className="flex gap-2 min-w-[500px]">
          {days.map(day => (
            <div key={day} className="flex-1">
              <div className="text-xs font-medium text-muted-ink text-center mb-2">{day}</div>
              <div className="space-y-1">
                {hours.map(hour => {
                  const isBooked = bookedSlots[day]?.includes(hour);
                  return (
                    <div key={hour} className={`text-xs text-center py-2 rounded-lg font-medium ${isBooked ? "bg-accent text-accent-foreground" : "bg-muted text-muted-ink"}`}>
                      {isBooked ? hour : ""}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TutorSchedule;
