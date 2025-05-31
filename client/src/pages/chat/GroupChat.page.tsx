import { useEffect, useState } from "react";
import { GroupConversation } from "../../components/Conversation";
import { useLazyFetchGroupConversationsQuery } from "../../store/slices/apiSlice";
import {
  ResetGroupChat,
  setGroupConversations,
} from "../../store/slices/conversation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import ShowOfflineStatus from "../../components/ShowOfflineStatus";
import Chat from "../../components/Chat";
import SearchInput from "../../components/ui/SearchInput";
import { motion } from "motion/react";
import { selectConversation } from "../../store/slices/appSlice";
import { GroupConversationProps } from "../../types";
import ConversationSkeleton from "../../components/Loaders/ConversationSkeleton";

const GroupChat = () => {
  const dispatch = useDispatch();
  const { activeChatId } = useSelector((state: RootState) => state.app);
  const { GroupConversations } = useSelector(
    (state: RootState) => state.conversation.group_chat
  );
  const [filteredConversations, setFilteredConversations] = useState<
    GroupConversationProps[]
  >(GroupConversations || []);

  const [fetchGroupConversations, { data }] =
    useLazyFetchGroupConversationsQuery({});

  useEffect(() => {
    if (!GroupConversations) return;
    setFilteredConversations(GroupConversations);
  }, [GroupConversations]);

  useEffect(() => {
    if (!data) return;
    dispatch(setGroupConversations(data.data));
  }, [data]);

  useEffect(() => {
    if (GroupConversations) return;
    fetchGroupConversations({});
  }, [GroupConversations]);
  useEffect(() => {
    return () => {
      dispatch(selectConversation(null));
      dispatch(ResetGroupChat());
    };
  }, []);

  return (
    <div className="h-full flex">
      <div
        className={`flex flex-col gap-4 px-4 flex-1 md:flex-none min-w-[340px] md:w-[370px]
              ${activeChatId ? "hidden md:flex" : ""}
              md:h-full overflow-y-hidden
            `}
      >
        <h1 className="text-2xl font-semibold py-2 border-b border-gray-300">
          Chats
        </h1>
        <SearchInput
          conversations={GroupConversations || []}
          setFilteredConversations={setFilteredConversations}
        />
        <ShowOfflineStatus />
        <h3 className="">Last Chats</h3>
        <ul className="overflow-y-auto scrollbar-custom flex-1 flex flex-col gap-4">
          {filteredConversations?.length > 0
            ? filteredConversations?.map((conversation: GroupConversationProps, i: number) => (
                <motion.div
                  key={conversation._id ?? i} // Prefer using a unique id if available
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.02, duration: 0.3 }}
                >
                  <GroupConversation conversation={conversation} index={i} />
                </motion.div>
              ))
            : [...Array(5)].map((_, i: number) => {
                return (
                  <li key={i}>
                    <ConversationSkeleton />
                  </li>
                );
              })}
        </ul>
      </div>
      <Chat />
    </div>
  );
};

export default GroupChat;
