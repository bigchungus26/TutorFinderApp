import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setSelectedRole } from "@/lib/rolePreference";

const TutorLandingPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    setSelectedRole("tutor");
    navigate("/signup", { replace: true });
  }, [navigate]);
  return null;
};

export default TutorLandingPage;
