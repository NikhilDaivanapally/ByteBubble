import React from "react";
import { Button } from "./ui/Button";
import { Icons } from "../icons";

const GoogleAuth: React.FC = () => {
  const handleGoogleLogin = () => {
    try {
      // Open Google OAuth in a new window
      window.open("https://bytebubble.onrender.com/api/v1/auth/google/callback", "_self");
    } catch (error) {
      console.error("Error opening Google OAuth window:", error);
    }
  };
  return (
    <Button
      variant="outline"
      // shape="md"
      fullWidth
      onClick={handleGoogleLogin}
      icon={<Icons.GoogleIcon width="25" height="25" role="img" />}
      iconPosition="left"
    >
      Continue with Google
    </Button>
  );
};

export default GoogleAuth;
