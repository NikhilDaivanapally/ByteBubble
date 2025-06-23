import { useEffect } from "react";
import { socket } from "../socket";
import { useDispatch, useSelector } from "react-redux";
import {
  addDirectMessage,
  addGroupMessage,
} from "../store/slices/conversation";
import { RootState } from "../store/store";

export const useDirectSystemEvents = (enabled: boolean) => {
  const dispatch = useDispatch();

  const handleUserBlocked = (data: any) => {
    dispatch(
      addDirectMessage({
        ...data,
        isIncoming: false,
        isOutgoing: false,
        status: "sent",
        isRead: false,
        deletedFor: [],
        isDeletedForEveryone: false,
        reactions: [],
        isEdited: false,
      })
    );
  };
  const handleUserUnblocked = (data: any) => {
    dispatch(
      addDirectMessage({
        ...data,
        isIncoming: false,
        isOutgoing: false,
        status: "sent",
        isRead: false,
        deletedFor: [],
        isDeletedForEveryone: false,
        reactions: [],
        isEdited: false,
      })
    );
  };
  useEffect(() => {
    if (!enabled) return;

    socket.on("blocked", handleUserBlocked);
    socket.on("unblocked", handleUserUnblocked);

    return () => {
      socket.off("blocked", handleUserBlocked);
      socket.off("unblocked", handleUserUnblocked);
    };
  }, [enabled]);
};

export const useGroupSystemEvents = (enabled: boolean) => {
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
