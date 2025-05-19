import { useRef, useState } from "react";
import { DirectConversation } from "../../components/Conversation";
import {
  MagnifyingGlassIcon,
  SignalSlashIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import ShowOfflineStatus from "../../components/ShowOfflineStatus";
import Loader from "../../components/ui/Loader";
import Chat from "../../components/Chat";

const IndividualChat = () => {
  const { DirectConversations } = useSelector(
    (state: RootState) => state.conversation.direct_chat
  );
  const { activeChatId } = useSelector((state: RootState) => state.app);
  const [isChatActive, setIsChatActive] = useState(false);
  const [filter, setFilter] = useState("");
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };
  const inputRef = useRef<null | HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleWrapperFocus = () => {
    setIsFocused(true);
    inputRef.current?.focus();
  };

  const handleWrapperBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className="h-full flex">
      {DirectConversations ? (
        <>
          {/* Conversations Sidebar */}
          <div
            className={`flex flex-col gap-4 px-4 flex-1 md:flex-none min-w-[340px] md:w-[370px]
          ${activeChatId ? "hidden md:flex" : ""}
          md:h-full overflow-y-hidden
        `}
          >
            <h1 className="text-2xl font-semibold py-2 border-b border-gray-300">
              Chats
            </h1>
            <div
              tabIndex={0}
              onFocus={handleWrapperFocus}
              onBlur={handleWrapperBlur}
              className={`flex items-center gap-2 border rounded-md px-2 
        transition-shadow duration-200
        ${isFocused ? "ring-2 ring-btn-primary/70" : "ring-0"}`}
            >
              <MagnifyingGlassIcon className="w-5 text-gray-500" />
              <input
                ref={inputRef}
                placeholder="Search"
                tabIndex={-1} // prevent tab focusing the input before wrapper
                className="h-10 flex-1 border-none outline-none bg-transparent"
                value={filter}
                onChange={handleFilterChange}
              />
              {filter && (
                <XMarkIcon className="w-5 text-gray-500 cursor-pointer" />
              )}
            </div>

            <ShowOfflineStatus />

            <h3 className="">Last Chats</h3>

            <ul className="overflow-y-auto scrollbar-custom flex-1 flex flex-col gap-4">
              {DirectConversations?.map((conversation: any, i: number) => (
                <DirectConversation key={i} conversation={conversation} />
              ))}
            </ul>
          </div>

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

export default IndividualChat;
