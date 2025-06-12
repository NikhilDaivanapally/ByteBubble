// components/chat/Chat.tsx
import { useState, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import SortMessages from "../utils/sort-messages";
import SendText_AudioMessageInput from "./SendText_AudioMessageInput";
import CameraModule from "./CameraModule";
import UploadedFileModule from "./UploadedFileModule";
import NoChat from "./ui/NoChat";
import ChatHeader from "./chat-header/ChatHeader";
import ProfileDetails from "./ProfileDetails";
import GroupMessageInfo from "./GroupMessageInfo";
import PageLoader from "./Loaders/PageLoader";
import MessageList from "./chat/MessageList";
import useLoadChatMessages from "../hooks/use-load-chat-messages";
import useAutoScroll from "../hooks/use-auto-scroll";

const Chat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const messagesListRef = useRef<HTMLUListElement | null>(null);

  const { direct_chat, group_chat } = useSelector(
    (state: RootState) => state.conversation
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const { activeChatId, chatType, isCameraOpen } = useSelector(
    (state: RootState) => state.app
  );
  useLoadChatMessages({
    activeChatId,
    chatType,
    user,
    directConversations: direct_chat.DirectConversations,
    groupConversations: group_chat.GroupConversations,
    setIsLoading,
  });

  useAutoScroll({
    ref: messagesListRef,
    deps: [
      direct_chat.current_direct_messages,
      group_chat.current_group_messages,
      activeChatId,
    ],
  });

  const { DatesArray: IndividualDates, MessagesObject: IndividualMsgs } =
    useMemo(
      () =>
        SortMessages({
          messages: direct_chat?.current_direct_messages,
          sort: "Asc",
        }),
      [direct_chat?.current_direct_messages]
    );

  const { DatesArray: GroupDates, MessagesObject: GroupMsgs } = useMemo(
    () =>
      SortMessages({
        messages: group_chat?.current_group_messages,
        sort: "Asc",
      }),
    [group_chat?.current_group_messages]
  );

  const handleOpenShowDetails = () => setShowDetails(true);
  const handleCloseShowDetails = () => setShowDetails(false);

  const MessagesByType = useMemo(
    () =>
      chatType === "individual"
        ? { sortedDates: IndividualDates, groupedMessages: IndividualMsgs }
        : { sortedDates: GroupDates, groupedMessages: GroupMsgs },
    [chatType, IndividualDates, IndividualMsgs, GroupDates, GroupMsgs]
  );

  return !isLoading ? (
    <div className="w-full h-full relative flex gap-2 overflow-hidden">
      <div className="flex flex-col flex-1 h-full relative overflow-hidden">
        {isCameraOpen && <CameraModule />}
        <UploadedFileModule />
        <ChatHeader handleOpenShowDetails={handleOpenShowDetails} />
        <MessageList
          ref={messagesListRef}
          sortedDates={MessagesByType.sortedDates}
          groupedMessages={MessagesByType.groupedMessages}
        />
        <SendText_AudioMessageInput />
      </div>
      {/* <ProfileDetails
              showDetails={showDetails}
              handleCloseShowDetails={handleCloseShowDetails}
            /> */}
      {/* <GroupMessageInfo /> */}
    </div>
  ) : (
    <PageLoader />
  );
};

export default Chat;
