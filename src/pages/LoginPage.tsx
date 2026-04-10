// Redirect /login → /signup?mode=signin (unified auth page handles both)
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/signup?mode=signin", { replace: true });
  }, [navigate]);
  return null;
};

export default LoginPage;
