import { useDispatch, useSelector } from "react-redux";
import getFormattedMessage from "../utils/Message";
import { RootState } from "../store/store";
import React, { useCallback, useMemo } from "react";
import { selectConversation } from "../store/slices/appSlice";
import { socket } from "../socket";
import {
  setCurrentDirectMessages,
  setCurrentGroupMessages,
  updateDirectConversation,
  updateGroupConversation,
} from "../store/slices/conversation";
import { Icons } from "../icons";
import { motion } from "motion/react";
import { DirectConversationProps, GroupConversationProps } from "../types";
import { getConversationTime } from "../utils/dateUtils";
import { Avatar } from "./ui/Avatar";

export const DirectConversation = React.memo(
  ({
    conversation,
    index,
  }: {
    conversation: DirectConversationProps;
    index: number;
  }) => {
    const {
      _id,
      userId,
      name,
      avatar,
      isOnline,
      message: msg,
      isSeen,
      isOutgoing,
      time,
      unreadMessagesCount,
    } = conversation;
    const Time = useMemo(
      () => (time ? getConversationTime(time.toString()) : null),
      [time]
    );
    const message = useMemo(
      () => (msg ? getFormattedMessage(msg) : null),
      [msg]
    );
    const dispatch = useDispatch();
    const auth = useSelector((state: RootState) => state.auth.user);
    const { DirectConversations } = useSelector(
      (state: RootState) => state.conversation.direct_chat
    );
    const { activeChatId, isTypingRoomId } = useSelector(
      (state: RootState) => state.app
    );

    const handleSelectConversation = useCallback(() => {
      if (activeChatId !== _id) {
        dispatch(setCurrentDirectMessages([]));
        dispatch(selectConversation({ chatId: _id }));
        const updateConversation = DirectConversations?.find(
          (el) => el._id == _id
        );
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
    }, [DirectConversations, activeChatId, dispatch, _id]);
    const isActive = activeChatId === _id;
    const istyping = isTypingRoomId === _id;
    return (
      <motion.li
        role="button"
        tabIndex={0}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ delay: index * 0.1, duration: 0.3 }}
        className={`w-full flex gap-x-4 py-2 rounded-lg px-2 relative overflow-hidden ${
          isActive ? "bg-btn-primary/30" : ""
        } hover:bg-btn-primary/20 cursor-pointer`}
        onClick={handleSelectConversation}
        onKeyDown={(e) => e.key === "Enter" && handleSelectConversation()}
      >
        {/* Animated background highlight for active */}
        {isActive && (
          <motion.div
            layoutId="conversation-highlight"
            className="absolute inset-0 bg-btn-primary/20 rounded-lg z-0"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}

        {/* Avatar */}

        <Avatar size="md" url={avatar} online={isOnline} />

        {/* Name and message */}
        <div className="info flex-1 min-w-0 z-10">
          <p className="friend_name">{name}</p>
          {istyping ? (
            <p className="text-sm text-green-500">Typing ...</p>
          ) : (
            <div className="text-black/60 text-sm flex items-center gap-1 overflow-hidden whitespace-nowrap text-ellipsis">
              {isOutgoing ? "You - " : ""}
              <span className="overflow-hidden text-ellipsis whitespace-nowrap block">
                {message?.message}
              </span>
            </div>
          )}
        </div>

        {/* Time and unread */}
        <div className="ml-auto shrink-0 flex flex-col items-end justify-between z-10">
          <div className="seen_time text-sm text-black/60 flex gap-1">
            {isOutgoing && (
              <div className="flex-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isSeen ? "bg-green-600" : "bg-gray-300"
                  }`}
                ></div>
                <div
                  className={`w-2 h-2 rounded-full ${
                    isSeen ? "bg-green-600" : "bg-gray-300"
                  }`}
                ></div>
              </div>
            )}
            <span className="lasttime_msg text-nowrap">{Time}</span>
          </div>
          {unreadMessagesCount ? (
            <span className="text-xs inline-block px-2 py-1 rounded-full bg-btn-primary/20">
              {unreadMessagesCount > 99
                ? `${unreadMessagesCount}+`
                : unreadMessagesCount}
            </span>
          ) : null}
        </div>
      </motion.li>
    );
  }
);

export const GroupConversation = React.memo(
  ({
    conversation,
    index,
  }: {
    conversation: GroupConversationProps;
    index: number;
  }) => {
    const {
      _id,
      name,
      avatar,
      message: msg,
      from,
      isSeen,
      isOutgoing,
      time,
      unreadMessagesCount,
    } = conversation;
    const Time = useMemo(
      () => (time ? getConversationTime(time.toString()) : null),
      [time]
    );
    const message = useMemo(
      () => (msg ? getFormattedMessage(msg) : null),
      [msg]
    );
    const dispatch = useDispatch();
    const { GroupConversations } = useSelector(
      (state: RootState) => state.conversation.group_chat
    );
    const auth = useSelector((state: RootState) => state.auth.user);

    const { activeChatId, isTyping, isTypingRoomId } = useSelector(
      (state: RootState) => state.app
    );

    const handleSelectConversation = useCallback(() => {
      if (activeChatId !== _id) {
        dispatch(setCurrentGroupMessages([]));
        dispatch(selectConversation({ chatId: _id }));
        const updateConversation = GroupConversations?.find(
          (el) => el._id == _id
        );
        if (updateConversation?.unreadMessagesCount) {
          socket.emit("group:messages:unread:clear", {
            conversationId: _id,
            recipient: auth?._id,
            sender: from?._id,
            user: {
              userId: auth?._id,
              isSeen: true,
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
    }, [activeChatId, dispatch, GroupConversations, _id]);
    const isActive = activeChatId === _id;
    const istyping = isTypingRoomId === _id;

    return (
      <motion.li
        role="button"
        tabIndex={0}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ delay: index * 0.1, duration: 0.3 }}
        className={`w-full flex gap-x-4 py-2 rounded-lg px-2 relative overflow-hidden ${
          isActive ? "bg-btn-primary/30" : ""
        } hover:bg-btn-primary/20 cursor-pointer`}
        onClick={handleSelectConversation}
        onKeyDown={(e) => e.key === "Enter" && handleSelectConversation()}
      >
        {/* Animated background highlight for active */}
        {isActive && (
          <motion.div
            layoutId="conversation-highlight"
            className="absolute inset-0 bg-btn-primary/20 rounded-lg z-0"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        {/* Avatar */}
        <div className="w-10 h-10 relative flex-center shrink-0">
          {avatar ? (
            <img
              src={avatar}
              className="w-full h-full rounded-full object-cover"
              alt=""
            />
          ) : (
            <Icons.UsersIcon className="w-8" />
          )}
        </div>

        {/* Group Name and getFormattedMessage */}
        <div className="info flex-1 min-w-0">
          <p className="friend_name">{name}</p>
          {istyping ? (
            <p className="text-sm text-green-500 truncate">
              {isTyping} is typing ...
            </p>
          ) : (
            from &&
            message?.message && (
              <div className="text-black/60 text-sm flex items-center truncate">
                {isOutgoing ? "You - " : `${from?.userName} - `}
                <span className="block truncate">{message.message}</span>
              </div>
            )
          )}
        </div>

        {/* Time and Unread */}
        <div className="ml-auto shrink-0 flex flex-col items-end justify-between">
          <div className="seen_time text-sm text-black/60 flex gap-1">
            {isOutgoing ? (
              <div className="flex-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isSeen ? "bg-green-600" : "bg-gray-300"
                  }`}
                ></div>
                <div
                  className={`w-2 h-2 rounded-full ${
                    isSeen ? "bg-green-600" : "bg-gray-300"
                  }`}
                ></div>
              </div>
            ) : null}
            {time ? (
              <span className="lasttime_msg text-nowrap">{Time}</span>
            ) : null}
          </div>
          {unreadMessagesCount ? (
            <span className="text-xs inline-block px-2 py-1 rounded-full bg-btn-primary/20">
              {unreadMessagesCount > 99
                ? `${unreadMessagesCount}+`
                : unreadMessagesCount}
            </span>
          ) : null}
        </div>
      </motion.li>
    );
  }
);
