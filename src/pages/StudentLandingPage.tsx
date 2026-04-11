import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setSelectedRole } from "@/lib/rolePreference";

const StudentLandingPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    setSelectedRole("student");
    navigate("/signup", { replace: true });
  }, [navigate]);
  return null;
};

export default StudentLandingPage;
