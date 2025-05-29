import { useEffect, useState } from "react";
import { GroupConversation } from "../../components/Conversation";
import { useFetchGroupConversationsQuery } from "../../store/slices/apiSlice";
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

const GroupChat = () => {
  const dispatch = useDispatch();
  const { activeChatId } = useSelector((state: RootState) => state.app);
  const { data } = useFetchGroupConversationsQuery({});
  const { GroupConversations } = useSelector(
    (state: RootState) => state.conversation.group_chat
  );
  const [filteredConversations, setFilteredConversations] = useState(
    GroupConversations || []
  );

  useEffect(() => {
    if (!GroupConversations) return;
    setFilteredConversations(GroupConversations);
  }, [GroupConversations]);

  useEffect(() => {
    if (!data) return;
    dispatch(setGroupConversations(data.data));
  }, [data]);

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
            ? filteredConversations?.map((conversation: any, i: number) => (
                <motion.div
                  key={conversation.id ?? i} // Prefer using a unique id if available
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
                  <li
                    key={i}
                    className="w-full flex gap-x-4 py-2 rounded-lg px-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse"></div>
                    <div className="space-y-3">
                      <p className="w-20 h-3 rounded-lg bg-gray-300 animate-pulse"></p>
                      <p className=" w-40 h-3 rounded-lg bg-gray-300 animate-pulse"></p>
                    </div>
                    <div className="ml-auto w-16 h-3 rounded-lg bg-gray-300 animate-pulse"></div>
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
