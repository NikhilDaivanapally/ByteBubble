import { useDispatch, useSelector } from "react-redux";
import ConversationTime from "../utils/ConversationTime";
import Message from "../utils/Message";
import { RootState } from "../store/store";
import { useCallback, useState } from "react";
import { selectConversation } from "../store/slices/appSlice";

type ConversationProps = {
  conversation: any;
};
const Conversation: React.FC<ConversationProps> = ({ conversation }) => {
  const {
    id,
    user_id,
    name,
    avatar,
    online,
    msg,
    seen,
    outgoing,
    time,
    unread,
    pinned,
    about,
  } = conversation;
  const Time = ConversationTime(time);
  const { message } = Message(msg);
  const dispatch = useDispatch();
  const { DirectConversations } = useSelector(
    (state: RootState) => state.conversation.direct_chat
  );
  const { activeChatId } = useSelector((state: RootState) => state.app);

  const handleSelectConversation = useCallback(() => {
    if (activeChatId !== id) {
      // dispatch(setCurrentDirectMessages([]));
      dispatch(selectConversation({ chatId: id }));
      // const [updateConversation] = DirectConversations.filter(
      //   (el) => el.id == id
      // );
      // if (updateConversation.unread) {
      //   socket.emit("clear_unread", {
      //     conversationId: id,
      //     recipients: auth._id,
      //     sender: user_id,
      //   });
      //   dispatch(
      //     updateDirectConversation({
      //       ...updateConversation,
      //       unread: 0,
      //     })
      //   );
      // }
    }
  }, [DirectConversations, activeChatId]);

  return (
    <li
      className={`w-full flex gap-x-4 py-2 rounded-lg px-2 ${
        activeChatId == id ? "bg-btn-primary/30" : ""
      } hover:bg-btn-primary/20 cursor-pointer`}
      onClick={handleSelectConversation}
    >
      <div className="w-10 h-10  relative">
        <img
          src={avatar}
          className="w-full h-full rounded-full object-cover"
          alt=""
        />
        {online && (
          <span className="w-2 h-2 absolute bottom-0 right-0 bg-green-600 rounded-full"></span>
        )}
      </div>
      <div className="info">
        <p className="friend_name">{name}</p>
        <span className="text-black/60 text-sm">
          {outgoing ? "You - " : ""}
          {message}
        </span>
      </div>
      <div className="ml-auto">
        <div className="seen_time text-sm text-black/60 flex gap-1">
          {outgoing ? (
            <div className="flex-center gap-1">
              <div
                className={`w-2 h-2  rounded-full ${
                  seen ? "bg-green-600" : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`w-2 h-2 rounded-full ${
                  seen ? "bg-green-600" : "bg-gray-300"
                }`}
              ></div>
            </div>
          ) : (
            ""
          )}
          <span className="lasttime_msg">{Time}</span>
        </div>
        {Boolean(2) && (
          <span className="text-xs inline-block px-2 py-1 rounded-full bg-btn-primary/20">
            {unread > 99 ? `${unread}+` : unread}
          </span>
        )}
      </div>
    </li>
  );
};

export default Conversation;
