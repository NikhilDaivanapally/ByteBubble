import { useRef, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import SortMessages from "../../../utils/sort-messages";
import MessageInputBar from "../Footer";
import CameraModule from "../../CameraModule";
import useLoadChatMessages from "../../../hooks/use-load-chat-messages";
import useAutoScroll from "../../../hooks/use-auto-scroll";
import PageLoader from "../../Loaders/PageLoader";
import GroupMessageInfo from "../../GroupMessageInfo";
import GroupMessageList from "./GroupMessageList";
import GroupChatHeader from "../Header/GroupChatHeader";
import GroupProfileDetails from "../SidePanels/GroupProfilePanel/GroupProfileDetails";
import FileSendPreview from "../../FileSendPreview";

const GroupChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const messagesListRef = useRef<HTMLUListElement | null>(null);

  const { group_chat } = useSelector((state: RootState) => state.conversation);
  const { user } = useSelector((state: RootState) => state.auth);
  const { activeChatId, chatType, isCameraOpen } = useSelector(
    (state: RootState) => state.app
  );

  const currentGroup = group_chat.GroupConversations?.find(
    (c) => c._id === activeChatId
  );

  useLoadChatMessages({
    activeChatId,
    chatType,
    user,
    directConversations: [],
    groupConversations: group_chat.GroupConversations,
    setIsLoading,
  });

  useAutoScroll({
    ref: messagesListRef,
    deps: [group_chat.current_group_messages, activeChatId],
  });

  const { DatesArray, MessagesObject } = useMemo(
    () =>
      SortMessages({
        messages: group_chat.current_group_messages,
        sort: "Asc",
      }),
    [group_chat.current_group_messages]
  );

  const handleOpenShowDetails = () => setShowDetails(true);
  const handleCloseShowDetails = () => setShowDetails(false);

  return !isLoading ? (
    <div className="w-full h-full relative flex gap-2 overflow-hidden">
      <div className="flex flex-col flex-1 h-full relative overflow-hidden">
        {isCameraOpen && <CameraModule />}
        <FileSendPreview />
        <GroupChatHeader handleOpenShowDetails={handleOpenShowDetails} />
        <GroupMessageList
          ref={messagesListRef}
          sortedDates={DatesArray}
          groupedMessages={MessagesObject}
          usersLength={currentGroup?.users?.length ?? 0}
        />
        <MessageInputBar />
      </div>
      <GroupProfileDetails
        showDetails={showDetails}
        handleCloseShowDetails={handleCloseShowDetails}
      />
      <GroupMessageInfo />
    </div>
  ) : (
    <PageLoader />
  );
};

export default GroupChat;
