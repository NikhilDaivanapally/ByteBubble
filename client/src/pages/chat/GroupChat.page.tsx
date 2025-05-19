import { useEffect, useState } from "react";
import { GroupConversation } from "../../components/Conversation";
import { useFetchGroupConversationsQuery } from "../../store/slices/apiSlice";
import { setGroupConversations } from "../../store/slices/conversation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import ShowOfflineStatus from "../../components/ShowOfflineStatus";
import Chat from "../../components/Chat";
import Loader from "../../components/ui/Loader";
import SearchInput from "../../components/ui/SearchInput";

const GroupChat = () => {
  const dispatch = useDispatch();
  const { activeChatId } = useSelector((state: RootState) => state.app);
  const { data, isLoading, isSuccess } = useFetchGroupConversationsQuery({});
  const { GroupConversations } = useSelector(
    (state: RootState) => state.conversation.group_chat
  );
  const [filteredConversations, setFilteredConversations] =
    useState(GroupConversations);

  useEffect(() => {
    if (!GroupConversations) return;
    setFilteredConversations(GroupConversations);
  }, [GroupConversations]);
  useEffect(() => {
    if (!data) return;
    dispatch(setGroupConversations(data.data));
  }, [data]);
  return (
    <div className="h-full flex">
      {filteredConversations ? (
        <>
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
              conversations={GroupConversations}
              setFilteredConversations={setFilteredConversations}
            />
            <ShowOfflineStatus />
            <h3 className="">Last Chats</h3>
            <ul className="overflow-y-auto scrollbar-custom flex-1 flex flex-col gap-4">
              {GroupConversations?.map((conversation: any, i: number) => (
                <GroupConversation key={i} conversation={conversation} />
              ))}
            </ul>
          </div>
          <Chat />
        </>
      ) : (
        <div className="w-full h-full flex-center">
          <Loader customColor={true} />
        </div>
      )}
    </div>
  );
};

export default GroupChat;
