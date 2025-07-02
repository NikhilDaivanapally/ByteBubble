import { useEffect, useState } from "react";
import { GroupConversation } from "../../components/Conversation";
import {
  ResetGroupChat,
  setGroupConversations,
  updateGroupConversation,
} from "../../store/slices/conversation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import ShowOfflineStatus from "../../components/ShowOfflineStatus";
import SearchInput from "../../components/ui/SearchInput";
import { motion } from "motion/react";
import { selectConversation } from "../../store/slices/appSlice";
import { GroupConversationProps } from "../../types";
import ConversationSkeleton from "../../components/Loaders/SkeletonLoaders/ConversationSkeleton";
import { Button } from "../../components/ui/Button";
import { Icons } from "../../icons";
import CreateGroup from "../../components/CreateGroup";
import NoChat from "../../components/ui/NoChat";
import Dialog from "../../components/ui/Dialog/Dialog";
import Chat from "../../components/Chat/GroupChat/GroupChat";
import { useLazyGetGroupConversationsQuery } from "../../store/slices/api";
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

  const [fetchGroupConversations, { data }] = useLazyGetGroupConversationsQuery(
    {}
  );

  useEffect(() => {
    if (!GroupConversations) return;
    setFilteredConversations(GroupConversations);
  }, [GroupConversations]);

  useEffect(() => {
    if (!data?.data) return;
    dispatch(setGroupConversations(data.data));
  }, [data?.data]);

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
    ].find((user) => user?._id === lastMsg.from?._id);

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
        readBy: lastMsg.readBy,
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
      {/* Chat List */}
      <aside
        className={`flex flex-col gap-2 sm:gap-3 px-4 flex-1 md:flex-none min-w-[340px] md:w-[370px]
              ${activeChatId ? "hidden md:flex" : ""}
              md:h-full overflow-y-hidden
            `}
      >
        <header className="space-y-2 sm:space-y-3">
          <div className="pt-3 flex justify-between items-start">
            <h1 className="text-2xl font-semibold">Groups</h1>
            {/* Create group */}
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
          {/* Search input */}
          <SearchInput
            conversations={GroupConversations || []}
            setFilteredConversations={setFilteredConversations}
          />
          {/* Offline status indicator */}
          <ShowOfflineStatus />
          <h3 className="">Last Chats</h3>
        </header>
        <ul
          role="list"
          aria-label="Recent Group Conversations"
          className="overflow-y-auto scrollbar-custom flex-1 flex flex-col gap-4"
        >
          {GroupConversations === null ? (
            // Still loading
            [...Array(5)].map((_, i) => (
              <li key={i}>
                <ConversationSkeleton />
              </li>
            ))
          ) : filteredConversations?.length > 0 ? (
            // Loaded and has results
            filteredConversations?.map((conversation, index) => {
              return (
                <motion.li
                  key={index}
                  role="listitem"
                  aria-label={`Open Chat with ${conversation?.name}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.02, duration: 0.3 }}
                >
                  <GroupConversation conversation={conversation} />
                </motion.li>
              );
            })
          ) : (
            // Loaded but empty
            <div className="w-full h-1/2 flex justify-center items-end text-center text-sm text-gray-500 py-8">
              No conversations found.
            </div>
          )}
        </ul>
      </aside>

      {/*Active Chat Window */}
      <div
        className={`flex-1 bg-gray-200 dark:bg-[#1E1E1E] rounded-2xl p-2 ${
          activeChatId ? "block" : "hidden"
        } md:block overflow-hidden`}
      >
        {activeChatId ? <Chat /> : <NoChat />}
      </div>

      {/* Create Group Dialog */}
      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <CreateGroup
          availableMembers={friends}
          onClose={() => setIsDialogOpen(false)}
        />
      </Dialog>
    </div>
  );
};

export default GroupChat;
