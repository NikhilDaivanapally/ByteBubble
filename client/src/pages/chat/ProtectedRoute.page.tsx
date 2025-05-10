import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { UpdateAuthState } from "../../store/slices/authSlice";
import Loader from "../../components/ui/Loader";

export function ProtectedPage({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await fetch(
          "http://localhost:8000/api/v1/auth/login/success",
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Not authenticated");
        const data = await res.json();
        setIsAuthenticated(true);
        dispatch(UpdateAuthState(data.user));
      } catch (err) {
        navigate("/signin", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [navigate]);

  if (loading)
    return (
      <div className="w-full h-full flex-center">
        <Loader customColor={true} />
      </div>
    );
  if (!isAuthenticated) return null; // Or a fallback

  return <>{children}</>;
}
