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
    socket.on("friend:request:received", handleNewFriendRequest);
    socket.on("friend:request:accept", handleRequestAccepted);
    socket.on("friend:request:sent", handleRequestSent);
    return () => {
      socket?.off("friend:request:received");
      socket?.off("friendrequest_accepted");
      socket?.off("friendrequest_sent");
    };
  }, [enabled]);
};
