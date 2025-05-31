import { useEffect } from "react";
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
  useEffect(() => {
    if (!enabled) return;
    const handleNewFriendRequest = (data: any) => {
      toast.success(data.message);
      dispatch(addFriendRequest(data?.friendRequest));
      dispatch(removeUserFromUsers(data?.user));
    };
    const handleRequestAccepted = (data: any) => {
      toast.success(data.message);
      dispatch(removeRequestFromFriendRequests(data?.data));
      dispatch(addFriend(data?.friend));
    };
    const handleRequestSent = (data: any) => {
      toast.success(data.message);
      dispatch(addFriendRequest(data?.friendRequest));
      dispatch(removeUserFromUsers(data?.user));
    };
    socket.on("new_friendrequest", handleNewFriendRequest);
    socket.on("friendrequest_accepted", handleRequestAccepted);
    socket.on("friendrequest_sent", handleRequestSent);
    return () => {
      socket?.off("new_friendrequest");
      socket?.off("friendrequest_accepted");
      socket?.off("friendrequest_sent");
    };
  }, [enabled]);
};
