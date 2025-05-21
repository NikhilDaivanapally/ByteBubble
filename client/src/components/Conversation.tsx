import { useDispatch, useSelector } from "react-redux";
import ConversationTime from "../utils/ConversationTime";
import Message from "../utils/Message";
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

type ConversationProps = {
  conversation: any;
};
const DirectConversation: React.FC<ConversationProps> = ({ conversation }) => {
  const {
    id,
    userId,
    name,
    avatar,
    online,
    message: msg,
    seen,
    outgoing,
    time,
    unread,
  } = conversation;
  const Time = useMemo(() => ConversationTime(time), [time]);
  const { message } = useMemo(() => Message(msg), [msg]);
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth.user);
  const { DirectConversations } = useSelector(
    (state: RootState) => state.conversation.direct_chat
  );
  const { activeChatId } = useSelector((state: RootState) => state.app);

  const handleSelectConversation = useCallback(() => {
    if (activeChatId !== id) {
      dispatch(setCurrentDirectMessages([]));
      dispatch(selectConversation({ chatId: id }));
      const updateConversation = DirectConversations?.find((el) => el.id == id);
      if (updateConversation?.unread) {
        socket.emit("clear_unread", {
          conversationId: id,
          recipients: auth?._id,
          sender: userId,
        });
        dispatch(
          updateDirectConversation({
            ...updateConversation,
            unread: 0,
          })
        );
      }
    }
  }, [DirectConversations, activeChatId, dispatch, id]);

  return (
    <li
      role="button"
      tabIndex={0}
      className={`w-full flex gap-x-4 py-2 rounded-lg px-2 ${
        activeChatId == id ? "bg-btn-primary/30" : ""
      } hover:bg-btn-primary/20 cursor-pointer`}
      onClick={handleSelectConversation}
      onKeyDown={(e) => e.key === "Enter" && handleSelectConversation()}
    >
      {/* Avatar */}
      <div className="w-10 h-10 relative shrink-0">
        <img
          src={avatar}
          className="w-full h-full rounded-full object-cover"
          alt=""
        />
        {online && (
          <span className="w-2 h-2 absolute bottom-0 right-0 bg-green-600 rounded-full"></span>
        )}
      </div>

      {/* Name and Message */}
      <div className="info flex-1 min-w-0">
        <p className="friend_name">{name}</p>
        <div className="text-black/60 text-sm flex items-center gap-1 overflow-hidden whitespace-nowrap text-ellipsis">
          {outgoing ? "You - " : ""}
          <span className="overflow-hidden text-ellipsis whitespace-nowrap block">
            {message}
          </span>
        </div>
      </div>

      {/* Time and Unread */}
      <div className="ml-auto shrink-0 flex flex-col items-end justify-between">
        <div className="seen_time text-sm text-black/60 flex gap-1">
          {outgoing ? (
            <div className="flex-center gap-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  seen ? "bg-green-600" : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`w-2 h-2 rounded-full ${
                  seen ? "bg-green-600" : "bg-gray-300"
                }`}
              ></div>
            </div>
          ) : null}
          <span className="lasttime_msg text-nowrap">{Time}</span>
        </div>
        {unread ? (
          <span className="text-xs inline-block px-2 py-1 rounded-full bg-btn-primary/20">
            {unread > 99 ? `${unread}+` : unread}
          </span>
        ) : null}
      </div>
    </li>
  );
};

const GroupConversation: React.FC<ConversationProps> = React.memo(
  ({ conversation }) => {
    const {
      id,
      groupName,
      groupImage,
      message: msg,
      from,
      seen,
      outgoing,
      time,
      unread,
    } = conversation;
    const Time = useMemo(() => (time ? ConversationTime(time) : null), [time]);
    const message = useMemo(() => (msg ? Message(msg) : null), [msg]);
    const dispatch = useDispatch();
    const { GroupConversations } = useSelector(
      (state: RootState) => state.conversation.group_chat
    );
    const { activeChatId } = useSelector((state: RootState) => state.app);

    const handleSelectConversation = useCallback(() => {
      if (activeChatId !== id) {
        dispatch(setCurrentGroupMessages([]));
        dispatch(selectConversation({ chatId: id }));
        const updateConversation = GroupConversations?.find(
          (el) => el.id == id
        );
        if (updateConversation?.unread) {
          dispatch(
            updateGroupConversation({
              ...updateConversation,
              unread: 0,
            })
          );
        }
      }
    }, [activeChatId, dispatch, GroupConversations, id]);

    return (
      <li
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handleSelectConversation()}
        className={`w-full flex gap-x-4 py-2 rounded-lg px-2 ${
          activeChatId == id ? "bg-btn-primary/30" : ""
        } hover:bg-btn-primary/20 cursor-pointer`}
        onClick={handleSelectConversation}
      >
        {/* Avatar */}
        <div className="w-10 h-10 relative flex-center shrink-0">
          {groupImage ? (
            <img
              src={groupImage}
              className="w-full h-full rounded-full object-cover"
              alt=""
            />
          ) : (
            <Icons.UsersIcon className="w-8" />
          )}
        </div>

        {/* Group Name and Message */}
        <div className="info flex-1 min-w-0">
          <p className="friend_name">{groupName}</p>
          {from && message?.message && (
            <div className="text-black/60 text-sm flex items-center overflow-hidden whitespace-nowrap text-ellipsis">
              {outgoing ? "You - " : `${from?.userName} - `}
              <span className="overflow-hidden whitespace-nowrap text-ellipsis block">
                {message.message}
              </span>
            </div>
          )}
        </div>

        {/* Time and Unread */}
        <div className="ml-auto shrink-0 flex flex-col items-end justify-between">
          <div className="seen_time text-sm text-black/60 flex gap-1">
            {outgoing ? (
              <div className="flex-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    seen ? "bg-green-600" : "bg-gray-300"
                  }`}
                ></div>
                <div
                  className={`w-2 h-2 rounded-full ${
                    seen ? "bg-green-600" : "bg-gray-300"
                  }`}
                ></div>
              </div>
            ) : null}
            {time ? (
              <span className="lasttime_msg text-nowrap">{Time}</span>
            ) : null}
          </div>
          {unread ? (
            <span className="text-xs inline-block px-2 py-1 rounded-full bg-btn-primary/20">
              {unread > 99 ? `${unread}+` : unread}
            </span>
          ) : null}
        </div>
      </li>
    );
  }
);

export { DirectConversation, GroupConversation };
