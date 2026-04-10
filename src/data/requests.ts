export interface TutorRequest {
  id: string;
  studentName: string;
  studentAvatar: string;
  courseId: string;
  requestedDate: string;
  requestedTime: string;
  duration: number;
  location: "online" | "in-person";
  message: string;
  status: "pending" | "accepted" | "declined";
}

export const tutorRequests: TutorRequest[] = [
  { id: "req1", studentName: "Sara Mansour", studentAvatar: "https://i.pravatar.cc/100?img=1", courseId: "c1", requestedDate: "2026-04-13", requestedTime: "14:00", duration: 60, location: "online", message: "Hi! I need help understanding pointers and memory in C++. Exam is next week!", status: "pending" },
  { id: "req2", studentName: "Ali Karam", studentAvatar: "https://i.pravatar.cc/100?img=3", courseId: "c2", requestedDate: "2026-04-15", requestedTime: "10:00", duration: 60, location: "in-person", message: "Can we go over graph theory proofs? I'm struggling with the homework.", status: "pending" },
  { id: "req3", studentName: "Mia Rahal", studentAvatar: "https://i.pravatar.cc/100?img=10", courseId: "c1", requestedDate: "2026-04-14", requestedTime: "16:00", duration: 90, location: "online", message: "Need a crash course on OOP before the midterm. Can we do 90 min?", status: "pending" },
  { id: "req4", studentName: "Tarek Bazzi", studentAvatar: "https://i.pravatar.cc/100?img=4", courseId: "c9", requestedDate: "2026-04-17", requestedTime: "11:00", duration: 60, location: "online", message: "Struggling with process synchronization concepts. Would love your help!", status: "pending" },
];
