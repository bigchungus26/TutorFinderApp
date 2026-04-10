import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type UniversityContextType = {
  selectedUniversity: string;
  setSelectedUniversity: (id: string) => void;
};

const UniversityContext = createContext<UniversityContextType>({
  selectedUniversity: "aub",
  setSelectedUniversity: () => {},
});

export const UniversityProvider = ({ children }: { children: ReactNode }) => {
  const [selectedUniversity, setSelectedUniversity] = useState(() => {
    return localStorage.getItem("tutr_university") || "aub";
  });

  useEffect(() => {
    localStorage.setItem("tutr_university", selectedUniversity);
  }, [selectedUniversity]);

  return (
    <UniversityContext.Provider value={{ selectedUniversity, setSelectedUniversity }}>
      {children}
    </UniversityContext.Provider>
  );
};

export const useUniversity = () => useContext(UniversityContext);
