import React from "react";
import Button from "./ui/Button";
import { Icons } from "../icons";

const GoogleAuth: React.FC = () => {
  const handleGoogleLogin = () => {
    try {
      // Open Google OAuth in a new window
      window.open("http://localhost:8000/api/v1/auth/google/callback", "_self");
    } catch (error) {
      console.error("Error opening Google OAuth window:", error);
    }
  };
  return (
    <Button
      kind="secondary_outline"
      className="w-full"
      onClick={handleGoogleLogin}
    >
      <Icons.GoogleIcon width="30" height="30" role="img" />
      Continue with Google
    </Button>
  );
};

export default GoogleAuth;
