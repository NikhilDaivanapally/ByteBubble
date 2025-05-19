import { useEffect, useState } from "react";
import { DirectConversation } from "../../components/Conversation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import ShowOfflineStatus from "../../components/ShowOfflineStatus";
import Loader from "../../components/ui/Loader";
import Chat from "../../components/Chat";
import { updateDirectConversation } from "../../store/slices/conversation";
import SearchInput from "../../components/ui/SearchInput";

const IndividualChat = () => {
  const dispatch = useDispatch();
  const {
    DirectConversations,
    current_direct_conversation,
    current_direct_messages,
  } = useSelector((state: RootState) => state.conversation.direct_chat);
  const { activeChatId } = useSelector((state: RootState) => state.app);
  const [filteredConversations, setFilteredConversations] =
    useState(DirectConversations);

  useEffect(() => {
    if (!current_direct_messages?.length) return;
    dispatch(
      updateDirectConversation({
        ...current_direct_conversation,
        outgoing: current_direct_messages?.slice(-1)[0]?.outgoing,
        message: {
          type: current_direct_messages?.slice(-1)[0]?.type,
          message: current_direct_messages?.slice(-1)[0]?.message,
          createdAt: current_direct_messages?.slice(-1)[0]?.createdAt,
        },
        time: current_direct_messages?.slice(-1)[0]?.createdAt,
        seen: current_direct_messages?.slice(-1)[0]?.seen,
      })
    );
  }, [current_direct_messages]);

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
              conversations={DirectConversations}
              setFilteredConversations={setFilteredConversations}
            />
            <ShowOfflineStatus />
            <h3 className="">Last Chats</h3>
            <ul className="overflow-y-auto scrollbar-custom flex-1 flex flex-col gap-4">
              {DirectConversations?.map((conversation: any, i: number) => (
                <DirectConversation key={i} conversation={conversation} />
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

export default IndividualChat;
