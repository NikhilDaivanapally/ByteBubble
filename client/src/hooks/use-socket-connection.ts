import { useEffect, useState } from "react";
import { connectSocket } from "../socket";

export const useSocketConnection = (user: { _id: string } | null) => {
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  // Initiate socket connection
  useEffect(() => {
    if (!user) return;
    connectSocket(user?._id)
      .then(() => {
        setIsSocketConnected(true);
      })
      .catch((error) => {
        console.error("Socket connection error:", error);
        setIsSocketConnected(false);
      });
    return () => {
      setIsSocketConnected(false);
    };
  }, [user]);
  return isSocketConnected;
};
