import { useMemo, useEffect, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store/store";
import { updateOnlineStatus } from "./store/slices/appSlice";
import appRoutes from "./routes";
import ToastConfig from "./toast/ToastConfig";
import Loader from "./components/ui/Loader";
// import ErrorBoundary from "./components/ui/ErrorBoundary";

const App = () => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state: RootState) => state.theme);

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    if (theme === "dark" && currentTheme !== "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else if (theme !== "dark" && currentTheme === "dark") {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const updateStatus = () =>
      dispatch(updateOnlineStatus({ status: navigator.onLine }));
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    updateStatus();
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, [dispatch]);

  const router = useMemo(() => createBrowserRouter(appRoutes), []);

  return (
    <div className="w-full h-[100dvh] bg-light dark:bg-dark font-gilroy tracking-wide">
      {/* <ErrorBoundary fallback={<div className="text-center p-6">Something went wrong.</div>}> */}
      <Suspense
        fallback={
          <div className="w-full h-full flex-center">
            <Loader customColor />
          </div>
        }
      >
        <ToastConfig />
        <RouterProvider router={router} />
      </Suspense>
      {/* </ErrorBoundary> */}
    </div>
  );
};

export default App;
