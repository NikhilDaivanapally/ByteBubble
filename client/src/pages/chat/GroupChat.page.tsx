import { useEffect, useState } from "react";
import { GroupConversation } from "../../components/Conversation";
import { useLazyFetchGroupConversationsQuery } from "../../store/slices/apiSlice";
import {
  ResetGroupChat,
  setGroupConversations,
  updateGroupConversation,
} from "../../store/slices/conversation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import ShowOfflineStatus from "../../components/ShowOfflineStatus";
import Chat from "../../components/Chat";
import SearchInput from "../../components/ui/SearchInput";
import { motion } from "motion/react";
import { selectConversation } from "../../store/slices/appSlice";
import { GroupConversationProps } from "../../types";
import ConversationSkeleton from "../../components/Loaders/SkeletonLoaders/ConversationSkeleton";
import { Button } from "../../components/ui/Button";
import { Icons } from "../../icons";
import Dialog from "../../components/Dialog/Dialog";
import CreateGroup from "../../components/CreateGroup";

const GroupChat = () => {
  const dispatch = useDispatch();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { activeChatId, friends } = useSelector(
    (state: RootState) => state.app
  );
  const {
    GroupConversations,
    current_group_messages,
    current_group_conversation,
  } = useSelector((state: RootState) => state.conversation.group_chat);
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

  // Update conversation preview when new message arrives
  useEffect(() => {
    if (!current_group_messages?.length || !current_group_conversation) return;

    const lastMsg = current_group_messages[current_group_messages.length - 1];
    const foundUser = [
      ...current_group_conversation?.users,
      current_group_conversation?.admin,
    ].find((user) => user?._id === lastMsg.from);
    dispatch(
      updateGroupConversation({
        ...current_group_conversation,
        from: {
          _id: foundUser?._id,
          avatar: foundUser?.avatar,
          userName: foundUser?.userName,
        },
        isOutgoing: lastMsg.isOutgoing,
        message: {
          messageType: lastMsg.messageType,
          message: lastMsg.message,
          createdAt: lastMsg.createdAt,
        },
        time: lastMsg.createdAt,
        isSeen: lastMsg.isSeen,
      })
    );
  }, [current_group_messages, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(selectConversation(null));
      dispatch(ResetGroupChat());
    };
  }, []);

  return (
    <div className="h-full flex">
      <div
        className={`flex flex-col gap-3 px-4 flex-1 md:flex-none min-w-[340px] md:w-[370px]
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

        <div className="pt-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Groups</h1>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsDialogOpen(true)}
            icon={<Icons.PlusIcon className="w-5" />}
            iconPosition="left"
          >
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
          {GroupConversations === null ? (
            // Still loading
            [...Array(5)].map((_, i) => (
              <li key={i}>
                <ConversationSkeleton />
              </li>
            ))
          ) : filteredConversations?.length > 0 ? (
            // Loaded and has results
            filteredConversations?.map((conversation, i) => (
              <motion.div
                key={conversation._id ?? i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.02, duration: 0.3 }}
              >
                <GroupConversation conversation={conversation} index={i} />
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
      <Chat />
    </div>
  );
};

export default GroupChat;
