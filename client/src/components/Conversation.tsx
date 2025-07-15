import React, { useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentDirectMessages,
  setCurrentGroupMessages,
  updateDirectConversation,
  updateGroupConversation,
} from "../store/slices/conversation";
import { selectConversation } from "../store/slices/appSlice";
import {
  getFormattedDirectMessage,
  getFormattedGroupMessage,
} from "../utils/Message";
import { getConversationTime } from "../utils/dateUtils";
import { Avatar } from "./ui/Avatar";
import { socket } from "../socket";
import { RootState } from "../store/store";
import { DirectConversationProps, GroupConversationProps } from "../types";
import { group } from "../utils/conversation-types";
import ReadIndicator from "./ui/ReadIndicator";

//  Direct Conversation
export const DirectConversation = React.memo(
  ({ conversation }: { conversation: DirectConversationProps }) => {
    const {
      _id,
      userId,
      name,
      avatar,
      isOnline,
      message: msg,
      isRead,
      isOutgoing,
      time,
      unreadMessagesCount,
    } = conversation;
    const { activeChatId, isTypingRoomId } = useSelector(
      (state: RootState) => state.app
    );
    const auth = useSelector((state: RootState) => state.auth.user);
    const { DirectConversations } = useSelector(
      (state: RootState) => state.conversation.direct_chat
    );

    const dispatch = useDispatch();
    const isActive = activeChatId === _id;
    const isTyping = isTypingRoomId === _id;

    const updateConversation = useMemo(
      () => DirectConversations?.find((c) => c._id === _id),
      [DirectConversations, _id]
    );

    const Time = useMemo(
      () => (time ? getConversationTime(time.toString()) : null),
      [time]
    );
    const message = useMemo(
      () => (msg ? getFormattedDirectMessage(msg,isOutgoing,name) : null),
      [msg]
    );

    const handleSelectConversation = useCallback(() => {
      if (!isActive) {
        dispatch(setCurrentDirectMessages([]));
        dispatch(selectConversation({ chatId: _id }));

        if (updateConversation?.unreadMessagesCount) {
          socket.emit("messages:unread:clear", {
            conversationId: _id,
            recipient: auth?._id,
            sender: userId,
          });

          dispatch(
            updateDirectConversation({
              ...updateConversation,
              unreadMessagesCount: 0,
            })
          );
        }
      }
    }, [isActive, dispatch, _id, auth?._id, userId, updateConversation]);

    return (
      <div
        role="button"
        tabIndex={0}
        className={`w-full flex gap-x-4 py-2 px-2 rounded-lg relative overflow-hidden ${
          isActive ? "bg-btn-primary/30" : "hover:bg-btn-primary/20 "
        } cursor-pointer`}
        onClick={handleSelectConversation}
        onKeyDown={(e) => e.key === "Enter" && handleSelectConversation()}
      >
        <Avatar size="md" url={avatar} online={isOnline} />

        <div className="info flex-1 min-w-0 z-10">
          <p className="friend_name">{name}</p>
          {isTyping ? (
            <p className="text-sm text-green-500">Typing ...</p>
          ) : (
            <div className="text-black/60 text-sm flex items-center gap-1 truncate">
              {msg.messageType !== "system" && (isOutgoing ? "You - " : "")}
              <span className="block truncate">{message?.message}</span>
            </div>
          )}
        </div>

        <div className="ml-auto shrink-0 flex flex-col items-end justify-between z-10">
          <div className="seen_time text-sm text-black/60 flex gap-1">
            {msg.messageType !== "system" && isOutgoing && (
              <ReadIndicator read={isRead} />
            )}
            {Time && <span className="lasttime_msg text-nowrap">{Time}</span>}
          </div>
          {unreadMessagesCount ? (
            <span className="text-xs inline-block px-2 py-1 rounded-full bg-btn-primary/20">
              {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
            </span>
          ) : null}
        </div>
      </div>
    );
  }
);

//  Group Conversation
export const GroupConversation = React.memo(
  ({ conversation }: { conversation: GroupConversationProps }) => {
    const {
      _id,
      name,
      avatar,
      message: msg,
      from,
      users,
      readBy,
      isOutgoing,
      time,
      unreadMessagesCount,
    } = conversation;

    const { activeChatId, isTyping, isTypingRoomId } = useSelector(
      (state: RootState) => state.app
    );
    const auth = useSelector((state: RootState) => state.auth.user);
    const { GroupConversations } = useSelector(
      (state: RootState) => state.conversation.group_chat
    );

    const dispatch = useDispatch();
    const isActive = activeChatId === _id;
    const isTypingHere = isTypingRoomId === _id;
    const allRead = readBy?.length === users?.length - 1;

    const updateConversation = useMemo(
      () => GroupConversations?.find((c) => c._id === _id),
      [GroupConversations, _id]
    );

    const Time = useMemo(
      () => (time ? getConversationTime(time.toString()) : null),
      [time]
    );
    const message = useMemo(
      () => (msg ? getFormattedGroupMessage(msg, from, auth, name) : null),
      [msg]
    );

    const handleSelectConversation = useCallback(() => {
      if (!isActive) {
        dispatch(setCurrentGroupMessages([]));
        dispatch(selectConversation({ chatId: _id }));

        if (updateConversation?.unreadMessagesCount) {
          socket.emit("group:messages:unread:clear", {
            conversationId: _id,
            recipient: auth?._id,
            sender: from?._id,
            user: {
              userId: auth?._id,
              isRead: true,
              seenAt: new Date().toISOString(),
            },
          });

          dispatch(
            updateGroupConversation({
              ...updateConversation,
              unreadMessagesCount: 0,
            })
          );
        }
      }
    }, [isActive, dispatch, _id, auth?._id, from?._id, updateConversation]);

    return (
      <div
        role="button"
        tabIndex={0}
        className={`w-full flex gap-x-4 py-2 px-2 rounded-lg relative transition-colors duration-200 overflow-hidden ${
          isActive ? "bg-btn-primary/40" : "hover:bg-btn-primary/20 "
        } cursor-pointer`}
        onClick={handleSelectConversation}
        onKeyDown={(e) => e.key === "Enter" && handleSelectConversation()}
      >
        <Avatar url={avatar} size="md" fallBackType={group} />
        <div className="info flex-1 min-w-0">
          <p className="friend_name">{name}</p>
          {isTypingHere ? (
            <p className="text-sm text-green-500 truncate">
              {isTyping} is typing ...
            </p>
          ) : (
            from &&
            message?.message && (
              <div className="text-black/60 text-sm flex items-center gap-1 truncate">
                {msg.messageType !== "system" &&
                  (isOutgoing ? "You" : from?.userName)}
                {msg.messageType !== "system" && <span>-</span>}
                <span className="block truncate">{message.message}</span>
              </div>
            )
          )}
        </div>

        <div className="ml-auto shrink-0 flex flex-col items-end justify-between">
          <div className="seen_time text-sm text-black/60 flex gap-1">
            {msg.messageType !== "system" && isOutgoing && (
              <ReadIndicator read={allRead} />
            )}
            {Time && <span className="lasttime_msg text-nowrap">{Time}</span>}
          </div>
          {!isOutgoing && unreadMessagesCount ? (
            <span className="text-xs inline-block px-2 py-1 rounded-full bg-btn-primary/20">
              {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
            </span>
          ) : null}
        </div>
      </div>
    );
  }
);
