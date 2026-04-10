export interface Review {
  id: string;
  tutorId: string;
  studentName: string;
  studentAvatar: string;
  rating: number;
  date: string;
  comment: string;
  courseId: string;
}

export const reviews: Review[] = [
  { id: "r1", tutorId: "t1", studentName: "Sara M.", studentAvatar: "https://i.pravatar.cc/100?img=1", rating: 5, date: "2025-12-15", comment: "Karim is amazing! He explained recursion in a way that finally clicked. Went from a C to an A- on my final.", courseId: "c1" },
  { id: "r2", tutorId: "t1", studentName: "Ali K.", studentAvatar: "https://i.pravatar.cc/100?img=3", rating: 5, date: "2025-11-28", comment: "Best tutor for CMPS. Very patient and always prepared with examples.", courseId: "c2" },
  { id: "r3", tutorId: "t1", studentName: "Mia R.", studentAvatar: "https://i.pravatar.cc/100?img=10", rating: 4, date: "2025-11-10", comment: "Great explanations, sometimes goes a bit fast but always willing to repeat.", courseId: "c1" },
  { id: "r4", tutorId: "t2", studentName: "Tarek B.", studentAvatar: "https://i.pravatar.cc/100?img=4", rating: 5, date: "2025-12-20", comment: "Lea's mnemonics saved my bio grade. She makes complex pathways simple.", courseId: "c6" },
  { id: "r5", tutorId: "t2", studentName: "Rana H.", studentAvatar: "https://i.pravatar.cc/100?img=20", rating: 5, date: "2025-12-01", comment: "Very organized sessions. Always brings diagrams and practice questions.", courseId: "c7" },
  { id: "r6", tutorId: "t3", studentName: "Fadi N.", studentAvatar: "https://i.pravatar.cc/100?img=7", rating: 5, date: "2025-11-15", comment: "Rami is incredibly knowledgeable. Made EECE 230 actually enjoyable.", courseId: "c3" },
  { id: "r7", tutorId: "t5", studentName: "Hana S.", studentAvatar: "https://i.pravatar.cc/100?img=21", rating: 5, date: "2025-12-18", comment: "Jad is a math genius who actually knows how to teach. Calculus III felt doable after his sessions.", courseId: "c4" },
  { id: "r8", tutorId: "t5", studentName: "George A.", studentAvatar: "https://i.pravatar.cc/100?img=8", rating: 5, date: "2025-11-30", comment: "Worth every dollar. Got an A in Linear Algebra thanks to Jad.", courseId: "c5" },
  { id: "r9", tutorId: "t6", studentName: "Lina D.", studentAvatar: "https://i.pravatar.cc/100?img=22", rating: 5, date: "2025-12-10", comment: "Nour makes algorithms fun. His real-world examples helped everything click.", courseId: "c11" },
  { id: "r10", tutorId: "t6", studentName: "Ziad F.", studentAvatar: "https://i.pravatar.cc/100?img=6", rating: 4, date: "2025-11-20", comment: "Great tutor, very approachable. Helped me debug my database project.", courseId: "c30" },
  { id: "r11", tutorId: "t9", studentName: "Nadia L.", studentAvatar: "https://i.pravatar.cc/100?img=24", rating: 5, date: "2025-12-22", comment: "Christy is so patient! She stayed an extra 30 min to make sure I understood integrals.", courseId: "c14" },
  { id: "r12", tutorId: "t9", studentName: "Marc T.", studentAvatar: "https://i.pravatar.cc/100?img=2", rating: 5, date: "2025-12-05", comment: "Best math tutor at LAU, hands down. Very structured approach.", courseId: "c14" },
  { id: "r13", tutorId: "t11", studentName: "Rita G.", studentAvatar: "https://i.pravatar.cc/100?img=30", rating: 5, date: "2025-12-12", comment: "Maya helped me go from failing CSC 207 to getting a B+. Life saver!", courseId: "c19" },
  { id: "r14", tutorId: "t11", studentName: "Joe B.", studentAvatar: "https://i.pravatar.cc/100?img=19", rating: 4, date: "2025-11-25", comment: "Very clear and organized. Great at explaining OOP concepts.", courseId: "c20" },
  { id: "r15", tutorId: "t12", studentName: "Carla K.", studentAvatar: "https://i.pravatar.cc/100?img=31", rating: 5, date: "2025-12-08", comment: "Sami made Calculus actually enjoyable. He's patient and explains everything clearly.", courseId: "c21" },
  { id: "r16", tutorId: "t15", studentName: "Roy M.", studentAvatar: "https://i.pravatar.cc/100?img=32", rating: 5, date: "2025-12-19", comment: "Nadine has an incredible eye for design. She helped me think about space differently.", courseId: "c28" },
  { id: "r17", tutorId: "t4", studentName: "Wael R.", studentAvatar: "https://i.pravatar.cc/100?img=34", rating: 4, date: "2025-11-18", comment: "Yara explains economic models intuitively. Good use of real-world examples.", courseId: "c8" },
  { id: "r18", tutorId: "t7", studentName: "Dina S.", studentAvatar: "https://i.pravatar.cc/100?img=35", rating: 5, date: "2025-12-14", comment: "Tala's study guides are incredible. She knows exactly what's going to be on the exam.", courseId: "c13" },
  { id: "r19", tutorId: "t14", studentName: "Paul H.", studentAvatar: "https://i.pravatar.cc/100?img=36", rating: 4, date: "2025-11-22", comment: "Anthony makes accounting understandable. Great case study approach.", courseId: "c24" },
  { id: "r20", tutorId: "t17", studentName: "Maya Z.", studentAvatar: "https://i.pravatar.cc/100?img=37", rating: 5, date: "2025-12-21", comment: "Dana is thorough and well-prepared. Her SQL exercises were incredibly helpful.", courseId: "c30" },
];

export const getReviewsByTutor = (tutorId: string) => reviews.filter(r => r.tutorId === tutorId);
