export interface University {
  id: string;
  name: string;
  shortName: string;
  color: string;
  colorClass: string;
  tutorCount: number;
  studentCount: number;
}

export const universities: University[] = [
  { id: "aub", name: "American University of Beirut", shortName: "AUB", color: "#8B0000", colorClass: "uni-aub", tutorCount: 240, studentCount: 8500 },
  { id: "lau", name: "Lebanese American University", shortName: "LAU", color: "#003DA5", colorClass: "uni-lau", tutorCount: 185, studentCount: 7200 },
  { id: "ndu", name: "Notre Dame University", shortName: "NDU", color: "#0B6E4F", colorClass: "uni-ndu", tutorCount: 120, studentCount: 5800 },
];

export const getUniversity = (id: string) => universities.find(u => u.id === id);
