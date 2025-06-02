import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import {
  ResetDirectChat,
  updateDirectConversation,
} from "../../store/slices/conversation";
import { selectConversation } from "../../store/slices/appSlice";
import ShowOfflineStatus from "../../components/ShowOfflineStatus";
import SearchInput from "../../components/ui/SearchInput";
import Chat from "../../components/Chat";
import { motion } from "motion/react";
import { DirectConversationProps } from "../../types";
import { DirectConversation } from "../../components/Conversation";
import ConversationSkeleton from "../../components/Loaders/ConversationSkeleton";

const IndividualChat = () => {
  const dispatch = useDispatch();

  const { activeChatId } = useSelector((state: RootState) => state.app);
  const {
    DirectConversations,
    current_direct_conversation,
    current_direct_messages,
  } = useSelector((state: RootState) => state.conversation.direct_chat);

  const [filteredConversations, setFilteredConversations] = useState<
    DirectConversationProps[]
  >(DirectConversations || []);

  // Keep filtered conversations in sync
  useEffect(() => {
    if (!DirectConversations) return;
    setFilteredConversations(DirectConversations || []);
  }, [DirectConversations]);

  // Update conversation preview when new message arrives
  useEffect(() => {
    if (!current_direct_messages?.length || !current_direct_conversation)
      return;

    const lastMsg = current_direct_messages[current_direct_messages.length - 1];

    dispatch(
      updateDirectConversation({
        ...current_direct_conversation,
        outgoing: lastMsg.isOutgoing,
        message: {
          messageType: lastMsg.messageType,
          message: lastMsg.message,
          createdAt: lastMsg.createdAt,
        },
        time: lastMsg.createdAt,
        seen: lastMsg.isSeen,
      })
    );
  }, [current_direct_messages, dispatch]);

  useEffect(() => {
    return () => {
      if (activeChatId) {
        dispatch(selectConversation(null));
      }
      if (current_direct_conversation && current_direct_messages.length) {
        dispatch(ResetDirectChat());
      }
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
        <h1 className="text-2xl font-semibold py-2">Chats</h1>

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
                  key={conversation._id ?? i} // Prefer using a unique id if available
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.02, duration: 0.3 }}
                >
                  <DirectConversation conversation={conversation} index={i} />
                </motion.div>
              ))
            : [...Array(5)].map((_, i) => (
                <li key={i}>
                  <ConversationSkeleton />
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
