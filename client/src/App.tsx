import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "./pages/Home.page";
import Signin from "./pages/Auth/SignIn.page";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store/store";
import { toggleTheme } from "./store/slices/themeSlice";
import AuthLayout from "./pages/Auth/AuthLayout.page";
import SignIn from "./pages/Auth/SignIn.page";
import SignUp from "./pages/Auth/SignUp.page";
import ForgotPassword from "./pages/Auth/ForgotPassword.page";
import ResetPassword from "./pages/Auth/ResetPassword.page";
import ToastConfig from "./toast/ToastConfig";
const App = () => {
  const { theme } = useSelector((state: RootState) => state.theme);

  useEffect(() => {
    if (theme === "dark") {
      // document.documentElement.classList.add("dark"); // for simple dark class
      document.documentElement.setAttribute("data-theme", theme); // custom class dark-mode
    } else {
      // document.documentElement.classList.remove("dark");
      document.documentElement.removeAttribute("data-theme"); // custom class dark-mode
    }
    // localStorage.setItem("theme", theme);
    localStorage.setItem("data-theme", theme);
  }, [theme]);

  const router = createBrowserRouter([
    { path: "/", element: <Home /> },
    {
      element: <AuthLayout />,
      children: [
        { path: "/signin", element: <SignIn /> },
        { path: "/signup", element: <SignUp /> },
        { path: "/forgot-password", element: <ForgotPassword /> },
        { path: "/reset-password", element: <ResetPassword /> },
      ],
    },
  ]);
  return (
    <div className="w-full font-gilroy tracking-wide bg-white  dark:bg-black h-[100dvh]">
      {/* <button
        onClick={() => dispatch(toggleTheme())}
        className="p-2 rounded bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      >
        {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
      </button> */}
      <ToastConfig/>
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
