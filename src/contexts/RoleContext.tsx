import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Role = "student" | "tutor" | null;

type RoleContextType = {
  role: Role;
  setRole: (role: Role) => void;
  hasOnboarded: boolean;
  setHasOnboarded: (v: boolean) => void;
};

const RoleContext = createContext<RoleContextType>({
  role: null,
  setRole: () => {},
  hasOnboarded: false,
  setHasOnboarded: () => {},
});

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRoleState] = useState<Role>(() => {
    return (localStorage.getItem("teachme_role") as Role) || null;
  });
  const [hasOnboarded, setHasOnboarded] = useState(() => {
    return localStorage.getItem("teachme_onboarded") === "true";
  });

  const setRole = (r: Role) => {
    setRoleState(r);
    if (r) localStorage.setItem("teachme_role", r);
    else localStorage.removeItem("teachme_role");
  };

  useEffect(() => {
    localStorage.setItem("teachme_onboarded", String(hasOnboarded));
  }, [hasOnboarded]);

  return (
    <RoleContext.Provider value={{ role, setRole, hasOnboarded, setHasOnboarded }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
