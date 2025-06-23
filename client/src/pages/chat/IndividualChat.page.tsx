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
import { motion } from "motion/react";
import { DirectConversationProps } from "../../types";
import { DirectConversation } from "../../components/Conversation";
import ConversationSkeleton from "../../components/Loaders/SkeletonLoaders/ConversationSkeleton";
import NoChat from "../../components/ui/NoChat";
import DirectChat from "../../components/Chat/DirectChat/DirectChat";

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
    console.log(lastMsg,'lastmsg');
    dispatch(
      updateDirectConversation({
        ...current_direct_conversation,
        isOutgoing: lastMsg.isOutgoing,
        message: {
          messageType: lastMsg.messageType,
          message: lastMsg.message,
          createdAt: lastMsg.createdAt,
          systemEventType: lastMsg?.systemEventType,
          metadata: lastMsg?.metadata,
          eventUserSnapshot: lastMsg?.eventUserSnapshot,
        },
        time: lastMsg.createdAt,
        isRead: lastMsg.isRead,
      })
    );
  }, [current_direct_messages, dispatch]);

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
        className={`flex flex-col gap-2 sm:gap-3 px-4 flex-1 md:flex-none min-w-[340px] md:w-[370px]
        ${activeChatId ? "hidden md:flex" : ""}
        md:h-full overflow-y-hidden`}
      >
        <h1 className="text-2xl font-semibold pt-3">Chats</h1>

        <SearchInput
          conversations={DirectConversations || []}
          setFilteredConversations={setFilteredConversations}
        />
        <ShowOfflineStatus />
        <h3 className="">Last Chats</h3>
        <ul className="overflow-y-auto scrollbar-custom flex-1 flex flex-col gap-4">
          {DirectConversations === null ? (
            // Still loading
            [...Array(5)].map((_, i) => (
              <li key={i}>
                <ConversationSkeleton />
              </li>
            ))
          ) : filteredConversations.length > 0 ? (
            // Loaded and has results
            filteredConversations.map((conversation, i) => (
              <motion.div
                key={conversation._id ?? i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.02, duration: 0.3 }}
              >
                <DirectConversation conversation={conversation} index={i} />
              </motion.div>
            ))
          ) : (
            // Loaded but empty
            <div className="w-full h-1/2 flex justify-center items-end text-center text-sm text-gray-500 py-8">
              No conversations found.
            </div>
          )}
        </ul>
      </div>

      {/* Chat Window */}
      <div
        className={`flex-1 bg-gray-200 dark:bg-[#1E1E1E] rounded-2xl p-2 ${
          activeChatId ? "block" : "hidden"
        } md:block overflow-hidden`}
      >
        {activeChatId ? <DirectChat /> : <NoChat />}
      </div>
    </div>
  );
};

export default IndividualChat;
