import { lazy } from "react";
import { ProtectedPage } from "./pages/chat/ProtectedRoute.page";
import EditProfile from "./components/Settings/EditProfile";
import Setting from "./components/Settings/Setting";
import AccountSettings from "./components/Settings/AccountSettings";
import Notifications from "./components/Settings/Notifications";
import Privacy from "./components/Settings/Privacy";
import Help from "./components/Settings/Help";
import About from "./components/Settings/About";

// Lazy-loaded pages
const Home = lazy(() => import("./pages/Home.page"));
const AuthLayout = lazy(() => import("./pages/Auth/AuthLayout.page"));
const SignIn = lazy(() => import("./pages/Auth/SignIn.page"));
const SignUp = lazy(() => import("./pages/Auth/SignUp.page"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword.page"));
const ResetPassword = lazy(() => import("./pages/Auth/ResetPassword.page"));
const ChatLayout = lazy(() => import("./pages/chat/ChatLayout.page"));
const IndividualChat = lazy(() => import("./pages/chat/IndividualChat.page"));
const GroupChat = lazy(() => import("./pages/chat/GroupChat.page"));
const Connect = lazy(() => import("./pages/chat/Connect.page"));
const Settings = lazy(() => import("./pages/settings/Settings.page"));
const NotFound = lazy(() => import("./pages/NotFound.page"));

const appRoutes = [
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
      { path: "/group", element: <GroupChat /> },
      { path: "/connect", element: <Connect /> },
      {
        path: "/settings",
        element: <Settings />,
        children: [
          { path: "", element: <Setting /> },
          { path: "edit-profile", element: <EditProfile /> },
          { path: "account-settings", element: <AccountSettings /> },
          { path: "notifications", element: <Notifications /> },
          { path: "privacy", element: <Privacy /> },
          { path: "help", element: <Help /> },
          { path: "about", element: <About /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
];

export default appRoutes;
