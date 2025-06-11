import { useEffect, useCallback } from "react";
import { socket } from "../socket";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import {
  addFriend,
  addFriendRequest,
  removeRequestFromFriendRequests,
  removeUserFromUsers,
} from "../store/slices/appSlice";

export const useFriendRequestEvents = (enabled: boolean) => {
  const dispatch = useDispatch();

  const handleNewFriendRequest = useCallback(
    (data: any) => {
      toast.success(data.message);
      dispatch(addFriendRequest(data?.friendRequest));
      dispatch(removeUserFromUsers(data?.user));
    },
    [dispatch]
  );

  const handleRequestAccepted = useCallback(
    (data: any) => {
      toast.success(data.message);
      dispatch(removeRequestFromFriendRequests(data?.data));
      dispatch(addFriend(data?.friend));
    },
    [dispatch]
  );

  const handleRequestSent = useCallback(
    (data: any) => {
      toast.success(data.message);
      dispatch(addFriendRequest(data?.friendRequest));
      dispatch(removeUserFromUsers(data?.user));
    },
    [dispatch]
  );

  useEffect(() => {
    if (!enabled) return;

    socket.on("friend:request:received", handleNewFriendRequest);
    socket.on("friend:request:accept", handleRequestAccepted);
    socket.on("friend:request:sent", handleRequestSent);

    return () => {
      socket.off("friend:request:received", handleNewFriendRequest);
      socket.off("friend:request:accept", handleRequestAccepted);
      socket.off("friend:request:sent", handleRequestSent);
    };
  }, [
    enabled,
    handleNewFriendRequest,
    handleRequestAccepted,
    handleRequestSent,
  ]);
};
