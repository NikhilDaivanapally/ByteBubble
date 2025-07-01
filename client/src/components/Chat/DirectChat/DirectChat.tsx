import { useRef, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import SortMessages from "../../../utils/sort-messages";
import MessageInputBar from "../Footer";
import CameraModule from "../../CameraModule";
import useLoadChatMessages from "../../../hooks/use-load-chat-messages";
import useAutoScroll from "../../../hooks/use-auto-scroll";
import PageLoader from "../../Loaders/PageLoader";
import DirectMessageList from "./DirectMessageList";
import DirectChatHeader from "../Header/DirectChatHeader";
import DirectProfileDetails from "../SidePanels/DirectProfilePanel/DirectProfileDetails";
import FileSendPreview from "../../FileSendPreview";
import DirectMessageInfo from "../../DirectMessageInfo";

const DirectChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const messagesListRef = useRef<HTMLUListElement | null>(null);

  const { direct_chat } = useSelector((state: RootState) => state.conversation);
  const { user } = useSelector((state: RootState) => state.auth);
  const { activeChatId, chatType, isCameraOpen, directMessageInfo } =
    useSelector((state: RootState) => state.app);
  const { mediaFiles } = useSelector((state: RootState) => state.app);

  useLoadChatMessages({
    activeChatId,
    chatType,
    user,
    directConversations: direct_chat.DirectConversations,
    groupConversations: [],
    setIsLoading,
  });

  useAutoScroll({
    ref: messagesListRef,
    deps: [direct_chat.current_direct_messages, activeChatId],
  });

  const { DatesArray, MessagesObject } = useMemo(
    () =>
      SortMessages({
        messages: direct_chat.current_direct_messages,
        sort: "Asc",
      }),
    [direct_chat.current_direct_messages]
  );

  const handleOpenShowDetails = () => setShowDetails(true);
  const handleCloseShowDetails = () => setShowDetails(false);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="w-full h-full relative flex gap-2 overflow-hidden">
      <div className="flex flex-col flex-1 h-full relative overflow-hidden">
        {isCameraOpen && <CameraModule />}
        {mediaFiles && <FileSendPreview />}
        <DirectChatHeader handleOpenShowDetails={handleOpenShowDetails} />
        <DirectMessageList
          ref={messagesListRef}
          sortedDates={DatesArray}
          groupedMessages={MessagesObject}
        />
        <MessageInputBar />
      </div>
      <DirectProfileDetails
        showDetails={showDetails}
        handleCloseShowDetails={handleCloseShowDetails}
      />
      {directMessageInfo && <DirectMessageInfo />}
    </div>
  );
};

export default DirectChat;
