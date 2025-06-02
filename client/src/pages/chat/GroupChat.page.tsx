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
import { GroupConversationProps, UserProps } from "../../types";
import ConversationSkeleton from "../../components/Loaders/ConversationSkeleton";
import Button from "../../components/ui/Button";
import { Icons } from "../../icons";
import Dialog from "../../components/Dialog/Dialog";
import CreateGroup from "../../components/CreateGroup";

const GroupChat = () => {
  const dispatch = useDispatch();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { activeChatId, friends } = useSelector(
    (state: RootState) => state.app
  );
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
        <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
          <CreateGroup
            availableMembers={friends}
            onClose={() => setIsDialogOpen(false)}
          />
        </Dialog>

        <div className="py-2 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Groups</h1>
          <Button
            className=""
            kind="primary"
            onClick={() => setIsDialogOpen(true)}
          >
            <Icons.PlusIcon className="w-5" />
            Create Group
          </Button>
        </div>
        <SearchInput
          conversations={GroupConversations || []}
          setFilteredConversations={setFilteredConversations}
        />
        <ShowOfflineStatus />
        <h3 className="">Last Chats</h3>
        <ul className="overflow-y-auto scrollbar-custom flex-1 flex flex-col gap-4">
          {filteredConversations?.length > 0
            ? filteredConversations?.map(
                (conversation: GroupConversationProps, i: number) => (
                  <motion.div
                    key={conversation._id ?? i} // Prefer using a unique id if available
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.3 }}
                  >
                    <GroupConversation conversation={conversation} index={i} />
                  </motion.div>
                )
              )
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
