export interface Course {
  id: string;
  code: string;
  name: string;
  universityId: string;
  subject: string;
  description: string;
  credits: number;
  prerequisites: string[];
  typicalSemester: string;
  tutorCount: number;
}

export const courses: Course[] = [
  { id: "c1", code: "CMPS 200", name: "Introduction to Programming", universityId: "aub", subject: "Computer Science", description: "Intro to programming with C++. Covers variables, loops, functions, arrays, and basic OOP.", credits: 3, prerequisites: [], typicalSemester: "Fall / Spring", tutorCount: 18 },
  { id: "c2", code: "CMPS 211", name: "Discrete Structures", universityId: "aub", subject: "Computer Science", description: "Logic, sets, relations, functions, graphs, and proof techniques.", credits: 3, prerequisites: ["CMPS 200"], typicalSemester: "Fall / Spring", tutorCount: 12 },
  { id: "c3", code: "EECE 230", name: "Introduction to Computing", universityId: "aub", subject: "Engineering", description: "Programming in Python for engineers. Data structures, algorithms, and applications.", credits: 3, prerequisites: [], typicalSemester: "Fall", tutorCount: 15 },
  { id: "c4", code: "MATH 201", name: "Calculus III", universityId: "aub", subject: "Mathematics", description: "Multivariable calculus: partial derivatives, multiple integrals, vector calculus.", credits: 3, prerequisites: ["MATH 102"], typicalSemester: "Fall / Spring", tutorCount: 22 },
  { id: "c5", code: "MATH 218", name: "Linear Algebra", universityId: "aub", subject: "Mathematics", description: "Matrices, vector spaces, eigenvalues, and linear transformations.", credits: 3, prerequisites: ["MATH 201"], typicalSemester: "Spring", tutorCount: 14 },
  { id: "c6", code: "BIOL 201", name: "General Biology I", universityId: "aub", subject: "Biology", description: "Cell biology, genetics, molecular biology, and evolution.", credits: 4, prerequisites: [], typicalSemester: "Fall", tutorCount: 10 },
  { id: "c7", code: "CHEM 201", name: "General Chemistry I", universityId: "aub", subject: "Chemistry", description: "Atomic structure, bonding, stoichiometry, and thermochemistry.", credits: 4, prerequisites: [], typicalSemester: "Fall", tutorCount: 9 },
  { id: "c8", code: "ECON 211", name: "Principles of Microeconomics", universityId: "aub", subject: "Economics", description: "Supply and demand, market structures, consumer theory, and welfare economics.", credits: 3, prerequisites: [], typicalSemester: "Fall / Spring", tutorCount: 11 },
  { id: "c9", code: "CMPS 274", name: "Operating Systems", universityId: "aub", subject: "Computer Science", description: "Processes, threads, memory management, file systems, and synchronization.", credits: 3, prerequisites: ["CMPS 211"], typicalSemester: "Spring", tutorCount: 8 },
  { id: "c10", code: "PHYS 210", name: "General Physics I", universityId: "aub", subject: "Physics", description: "Mechanics, waves, and thermodynamics with calculus.", credits: 4, prerequisites: ["MATH 201"], typicalSemester: "Fall", tutorCount: 13 },
  { id: "c11", code: "CSC 243", name: "Data Structures", universityId: "lau", subject: "Computer Science", description: "Arrays, linked lists, trees, graphs, sorting, and searching algorithms.", credits: 3, prerequisites: ["CSC 210"], typicalSemester: "Spring", tutorCount: 14 },
  { id: "c12", code: "CSC 210", name: "Programming I", universityId: "lau", subject: "Computer Science", description: "Introduction to programming using Java. OOP concepts and problem solving.", credits: 3, prerequisites: [], typicalSemester: "Fall", tutorCount: 16 },
  { id: "c13", code: "BIO 201", name: "General Biology I", universityId: "lau", subject: "Biology", description: "Fundamentals of cell biology, genetics, and ecology.", credits: 4, prerequisites: [], typicalSemester: "Fall", tutorCount: 8 },
  { id: "c14", code: "MTH 201", name: "Calculus I", universityId: "lau", subject: "Mathematics", description: "Limits, derivatives, and integrals of single-variable functions.", credits: 3, prerequisites: [], typicalSemester: "Fall / Spring", tutorCount: 19 },
  { id: "c15", code: "ECO 201", name: "Principles of Economics", universityId: "lau", subject: "Economics", description: "Micro and macroeconomic principles, market equilibrium, and policy.", credits: 3, prerequisites: [], typicalSemester: "Fall", tutorCount: 7 },
  { id: "c16", code: "BUS 201", name: "Principles of Management", universityId: "lau", subject: "Business", description: "Planning, organizing, leading, and controlling in organizations.", credits: 3, prerequisites: [], typicalSemester: "Fall / Spring", tutorCount: 6 },
  { id: "c17", code: "CSC 245", name: "Algorithms", universityId: "lau", subject: "Computer Science", description: "Design and analysis of algorithms: divide and conquer, dynamic programming, greedy.", credits: 3, prerequisites: ["CSC 243"], typicalSemester: "Fall", tutorCount: 10 },
  { id: "c18", code: "PHY 211", name: "Physics I", universityId: "lau", subject: "Physics", description: "Newtonian mechanics, energy, momentum, and rotational dynamics.", credits: 4, prerequisites: [], typicalSemester: "Fall", tutorCount: 11 },
  { id: "c19", code: "CSC 207", name: "Computer Programming", universityId: "ndu", subject: "Computer Science", description: "Fundamentals of programming in C. Problem solving and algorithmic thinking.", credits: 3, prerequisites: [], typicalSemester: "Fall", tutorCount: 12 },
  { id: "c20", code: "CSC 226", name: "Object-Oriented Programming", universityId: "ndu", subject: "Computer Science", description: "OOP in Java: classes, inheritance, polymorphism, interfaces.", credits: 3, prerequisites: ["CSC 207"], typicalSemester: "Spring", tutorCount: 9 },
  { id: "c21", code: "MAT 211", name: "Calculus I", universityId: "ndu", subject: "Mathematics", description: "Limits, continuity, differentiation, and integration.", credits: 3, prerequisites: [], typicalSemester: "Fall / Spring", tutorCount: 15 },
  { id: "c22", code: "BIO 211", name: "Biology I", universityId: "ndu", subject: "Biology", description: "Cell structure, metabolism, genetics, and molecular biology.", credits: 4, prerequisites: [], typicalSemester: "Fall", tutorCount: 6 },
  { id: "c23", code: "CHM 211", name: "Chemistry I", universityId: "ndu", subject: "Chemistry", description: "General chemistry: atoms, molecules, reactions, and solutions.", credits: 4, prerequisites: [], typicalSemester: "Fall", tutorCount: 5 },
  { id: "c24", code: "ACC 210", name: "Financial Accounting", universityId: "ndu", subject: "Business", description: "Accounting principles, financial statements, and analysis.", credits: 3, prerequisites: [], typicalSemester: "Fall / Spring", tutorCount: 7 },
  { id: "c25", code: "ENG 211", name: "English Composition", universityId: "ndu", subject: "Languages", description: "Academic writing, research, and argumentation.", credits: 3, prerequisites: [], typicalSemester: "Fall / Spring", tutorCount: 4 },
  { id: "c26", code: "CMPS 252", name: "Software Engineering", universityId: "aub", subject: "Computer Science", description: "Software development lifecycle, design patterns, and team projects.", credits: 3, prerequisites: ["CMPS 211"], typicalSemester: "Fall", tutorCount: 7 },
  { id: "c27", code: "ARAB 201", name: "Arabic Literature", universityId: "aub", subject: "Languages", description: "Survey of classical and modern Arabic literature.", credits: 3, prerequisites: [], typicalSemester: "Fall / Spring", tutorCount: 3 },
  { id: "c28", code: "ARCH 201", name: "Design Studio I", universityId: "aub", subject: "Architecture", description: "Introductory architectural design studio with emphasis on spatial thinking.", credits: 6, prerequisites: [], typicalSemester: "Fall", tutorCount: 4 },
  { id: "c29", code: "PSY 201", name: "Introduction to Psychology", universityId: "lau", subject: "Psychology", description: "Foundations of psychology: cognition, behavior, development, and disorders.", credits: 3, prerequisites: [], typicalSemester: "Fall / Spring", tutorCount: 8 },
  { id: "c30", code: "CSC 310", name: "Database Systems", universityId: "lau", subject: "Computer Science", description: "Relational databases, SQL, normalization, and database design.", credits: 3, prerequisites: ["CSC 243"], typicalSemester: "Fall", tutorCount: 9 },
  { id: "c31", code: "PHI 201", name: "Introduction to Philosophy", universityId: "ndu", subject: "Humanities", description: "Major philosophical traditions, ethics, epistemology, and metaphysics.", credits: 3, prerequisites: [], typicalSemester: "Fall / Spring", tutorCount: 3 },
];

export const getCoursesByUniversity = (uniId: string) => courses.filter(c => c.universityId === uniId);
export const getCourse = (id: string) => courses.find(c => c.id === id);
export const getSubjects = (uniId: string) => [...new Set(courses.filter(c => c.universityId === uniId).map(c => c.subject))];
