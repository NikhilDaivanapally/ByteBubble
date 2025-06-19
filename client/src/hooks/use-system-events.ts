import { useEffect } from "react";
import { socket } from "../socket";
import { useDispatch, useSelector } from "react-redux";
import { addGroupMessage } from "../store/slices/conversation";
import { RootState } from "../store/store";

export const useSystemEvents = (enabled: boolean) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const handleUserRemovedSuccess = (data: any) => {
    const {
      _id,
      senderId,
      recipientsIds,
      conversationId,
      message: msgContent,
      messageType,
      systemEventType,
      metadata,
      eventUserSnapshot,
      createdAt,
      updatedAt,
    } = data;
    const isIncoming = Array.isArray(recipientsIds)
      ? recipientsIds.includes(user?._id)
      : recipientsIds === user?._id;
    const isOutgoing = senderId === user?._id;
    dispatch(
      addGroupMessage({
        _id,
        message: msgContent,
        messageType,
        systemEventType,
        metadata,
        eventUserSnapshot,
        createdAt,
        updatedAt,
        isIncoming,
        isOutgoing,
        status: "sent",
        from: senderId,
        conversationId,
      })
    );
  };
  const handleUserRemovedBroadcast = (data: any) => {
    const {
      _id,
      senderId,
      recipientsIds,
      conversationId,
      message: msgContent,
      messageType,
      systemEventType,
      metadata,
      eventUserSnapshot,
      createdAt,
      updatedAt,
    } = data;
    const isIncoming = Array.isArray(recipientsIds)
      ? recipientsIds.includes(user?._id)
      : recipientsIds === user?._id;
    const isOutgoing = senderId === user?._id;
    dispatch(
      addGroupMessage({
        _id,
        message: msgContent,
        messageType,
        systemEventType,
        metadata,
        eventUserSnapshot,
        createdAt,
        updatedAt,
        isIncoming,
        isOutgoing,
        status: "sent",
        from: senderId,
        conversationId,
      })
    );
  };
  useEffect(() => {
    if (!enabled) return;

    // socket.on("system:user:added:broadcast", () => {});
    socket.on("system:user:removed:success", handleUserRemovedSuccess);
    socket.on("system:user:removed:boradcast", handleUserRemovedBroadcast);
    // socket.on("system:join:group:boradcase", () => {});
    // socket.on("system:leave:group:boradcase", () => {});

    return () => {
      socket.off("system:user:removed:success", handleUserRemovedSuccess);
      socket.off("system:user:removed:boradcaset", handleUserRemovedBroadcast);
    };
  }, [enabled]);
};
