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
    setFilteredConversations(DirectConversations);
  }, [DirectConversations]);

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
          conversations={DirectConversations || []}
          setFilteredConversations={setFilteredConversations}
        />
        <ShowOfflineStatus />
        <h3 className="">Last Chats</h3>
        <ul className="overflow-y-auto scrollbar-custom flex-1 flex flex-col gap-4">
          {filteredConversations
            ? filteredConversations?.map((conversation: any, i: number) => (
                <DirectConversation key={i} conversation={conversation} />
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

export default IndividualChat;
