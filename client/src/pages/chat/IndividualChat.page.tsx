import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import {
  addDirectConversation,
  ResetDirectChat,
  updateDirectConversation,
} from "../../store/slices/conversation";
import { selectConversation } from "../../store/slices/appSlice";
import { socket } from "../../socket";

// import DirectConversation from "../../components/Conversation";
import ShowOfflineStatus from "../../components/ShowOfflineStatus";
import SearchInput from "../../components/ui/SearchInput";
import Chat from "../../components/Chat";
import { motion } from "motion/react";
import { DirectConversation as DirectConversationProps } from "../../types";
import { DirectConversation } from "../../components/Conversation";

const IndividualChat = () => {
  const dispatch = useDispatch();
  const {
    DirectConversations,
    current_direct_conversation,
    current_direct_messages,
  } = useSelector((state: RootState) => state.conversation.direct_chat);
  const { activeChatId } = useSelector((state: RootState) => state.app);

  const [filteredConversations, setFilteredConversations] = useState<
    DirectConversationProps[]
  >([]);

  // Keep filtered conversations in sync
  useEffect(() => {
    if (!DirectConversations) return;
    setFilteredConversations(DirectConversations || []);
  }, [DirectConversations]);

  // Handle incoming chat starts
  const handleStartChat = useCallback(
    (data: DirectConversationProps) => {
      console.log(data);
      const existing = DirectConversations?.find((el) => el.id === data.id);
      if (existing) {
        dispatch(updateDirectConversation(data));
      } else {
        dispatch(addDirectConversation(data));
      }
      dispatch(selectConversation({ chatId: data.id }));
    },
    [DirectConversations, dispatch]
  );

  useEffect(() => {
    socket.on("start_chat", handleStartChat);
    return () => {
      socket.off("start_chat", handleStartChat);
    };
  }, [handleStartChat]);

  // console.log(activeChatId)

  // Update conversation preview when new message arrives
  useEffect(() => {
    if (!current_direct_messages?.length || !current_direct_conversation)
      return;

    const lastMsg = current_direct_messages[current_direct_messages.length - 1];

    dispatch(
      updateDirectConversation({
        ...current_direct_conversation,
        outgoing: lastMsg.outgoing,
        message: {
          type: lastMsg.type,
          message: lastMsg.message,
          createdAt: lastMsg.createdAt,
        },
        time: lastMsg.createdAt,
        seen: lastMsg.seen,
      })
    );
  }, [current_direct_messages, current_direct_conversation, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(selectConversation(null));
      dispatch(ResetDirectChat());
    };
  }, []);

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div
        className={`flex flex-col gap-4 px-4 flex-1 md:flex-none min-w-[340px] md:w-[370px]
        ${activeChatId ? "hidden md:flex" : ""}
        md:h-full overflow-y-hidden`}
      >
        <h1 className="text-2xl font-semibold py-2 border-b border-gray-300">
          Chats
        </h1>
        <SearchInput
          conversations={DirectConversations || []}
          setFilteredConversations={setFilteredConversations}
        />
        <ShowOfflineStatus />
        <h3 className="">Last Chats</h3>
        <ul className="overflow-y-auto scrollbar-custom flex-1 flex flex-col gap-4">
          {filteredConversations?.length > 0
            ? filteredConversations.map((conversation, i) => (
                <motion.div
                  key={conversation.id ?? i} // Prefer using a unique id if available
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.02, duration: 0.3 }}
                >
                  <DirectConversation conversation={conversation} index={i} />
                </motion.div>
              ))
            : [...Array(5)].map((_, i) => (
                <li
                  key={i}
                  className="w-full flex gap-x-4 py-2 rounded-lg px-2"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse"></div>
                  <div className="space-y-3">
                    <p className="w-20 h-3 rounded-lg bg-gray-300 animate-pulse"></p>
                    <p className="w-40 h-3 rounded-lg bg-gray-300 animate-pulse"></p>
                  </div>
                  <div className="ml-auto w-16 h-3 rounded-lg bg-gray-300 animate-pulse"></div>
                </li>
              ))}
        </ul>
      </div>

      {/* Chat Window */}
      <Chat />
    </div>
  );
};

export default IndividualChat;
