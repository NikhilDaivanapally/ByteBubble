import { lazy } from "react";
import { ProtectedPage } from "./pages/chat/ProtectedRoute.page";

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
      { path: "/settings", element: <Settings /> },
    ],
  },
  { path: "*", element: <NotFound /> }, // 404 fallback
];

export default appRoutes;
