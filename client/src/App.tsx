import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home.page";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store/store";
import { toggleTheme } from "./store/slices/themeSlice";
import AuthLayout from "./pages/Auth/AuthLayout.page";
import SignIn from "./pages/Auth/SignIn.page";
import SignUp from "./pages/Auth/SignUp.page";
import ForgotPassword from "./pages/Auth/ForgotPassword.page";
import ResetPassword from "./pages/Auth/ResetPassword.page";
import ToastConfig from "./toast/ToastConfig";
import ChatLayout from "./pages/chat/ChatLayout.page";
import IndividualChat from "./pages/chat/IndividualChat.page";
import GroupChat from "./pages/chat/GroupChat.page";
import { updateOnlineStatus } from "./store/slices/appSlice";
import React, { useEffect } from "react";
import { checkAuth } from "./utils/auth";
import { ProtectedPage } from "./pages/chat/ProtectedRoute.page";
const App = () => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state: RootState) => state.theme);
  // theme update
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", theme); // custom class dark-mode
    } else {
      document.documentElement.removeAttribute("data-theme"); // custom class dark-mode
    }
    localStorage.setItem("data-theme", theme);
  }, [theme]);

  // device status update
  useEffect(() => {
    function handleUpdateOnlineStatus() {
      dispatch(updateOnlineStatus({ status: navigator.onLine }));
    }
    window.addEventListener("online", handleUpdateOnlineStatus);
    window.addEventListener("offline", handleUpdateOnlineStatus);

    // Initial check when the component mounts
    handleUpdateOnlineStatus();

    return () => {
      window.removeEventListener("online", handleUpdateOnlineStatus);
      window.removeEventListener("offline", handleUpdateOnlineStatus);
    };
  }, [dispatch]);

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
    
    {
      element: (
        <ProtectedPage>
          <ChatLayout />
        </ProtectedPage>
      ),
      children: [
        { path: "/chat", element: <IndividualChat /> },
        { path: "/chat/group", element: <GroupChat /> },
      ],
    },
  ]);
  return (
    <div className="w-full h-[100dvh] bg-light dark:bg-dark font-gilroy tracking-wider">
      {/* <button
        onClick={() => dispatch(toggleTheme())}
        className="p-2 rounded bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      >
        {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
      </button> */}
      <ToastConfig />
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
