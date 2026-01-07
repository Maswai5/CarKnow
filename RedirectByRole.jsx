import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const RedirectByRole = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    if (user.role === "user") navigate("/dashboard");
    if (user.role === "admin") navigate("/admin");
    if (user.role === "superadmin") navigate("/superadmin");
  }, [user, navigate]);

  return null;
};

export default RedirectByRole;