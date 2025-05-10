import { useEffect, useState } from "react";
import Conversation from "../../components/Conversation";
import Input from "../../components/ui/Input";
import { useFetchGroupConversationsQuery } from "../../store/slices/apiSlice";
import { updateGroupConversations } from "../../store/slices/conversation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import ShowOfflineStatus from "../../components/ShowOfflineStatus";
import Chat from "../../components/Chat";
import Loader from "../../components/ui/Loader";
import SearchInput from "../../components/ui/SearchInput";

const GroupChat = () => {
  const { data, isLoading, isSuccess } = useFetchGroupConversationsQuery({});
  const dispatch = useDispatch();
  const { GroupConversations } = useSelector(
    (state: RootState) => state.conversation.group_chat
  );
  const [filteredConversations, setFilteredConversations] =
    useState(GroupConversations);

  const user = useSelector((state: RootState) => state.auth.user);

  const { activeChatId } = useSelector((state: RootState) => state.app);

  useEffect(() => {
    if (GroupConversations) {
      setFilteredConversations(GroupConversations);
    }
  }, [GroupConversations]);
  useEffect(() => {
    if (data) {
      dispatch(
        updateGroupConversations({ conversations: data.data, auth: user })
      );
    }
  }, [data]);
  console.log(GroupConversations);
  return (
    <div className="h-full flex">
      {filteredConversations ? (
        <>
          {/* Conversations Sidebar */}
          {filteredConversations?.length ? (
            <div
              className={`flex flex-col gap-4 px-4 flex-1 md:flex-none min-w-[340px] md:w-[370px]
          ${activeChatId ? "hidden" : ""}
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
                  <Conversation key={i} conversation={conversation} />
                ))}
              </ul>
            </div>
          ) : (
            <p>No Chats</p>
          )}

          {/* Chat Window */}
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
