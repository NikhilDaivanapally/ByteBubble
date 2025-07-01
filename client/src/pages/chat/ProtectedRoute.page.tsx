import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useEffect, useState } from "react";
import { setUser } from "../../store/slices/authSlice";
import { Navigate } from "react-router-dom";
import PageLoader from "../../components/Loaders/PageLoader";
import { useLazySuccessQuery } from "../../store/slices/api";

export function ProtectedPage({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [me, { isLoading, data, isError }] = useLazySuccessQuery();
  const [called, setCalled] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !called) {
      me({});
      setCalled(true);
    } else if (isAuthenticated) {
      setCalled(true);
    }
  }, [isAuthenticated, called, me]);

  useEffect(() => {
    if (data) {
      dispatch(setUser(data.user));
    }
  }, [data, dispatch]);

  if (!called || isLoading) return <PageLoader />;

  if (!isAuthenticated && isError) return <Navigate to="/signin" replace />;

  return <>{children}</>;
}
