import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useCallback, useEffect, useRef, useState } from "react";
import { socket } from "../socket";
import {
  setCurrentDirectMessages,
  setCurrentGroupMessages,
  setCurrentDirectConversation,
  setCurrentGroupConversation,
} from "../store/slices/conversation";
import SortMessages from "../utils/sort-messages";
import { MediaMsg, TextMsg, Timeline, AudioMsg } from "./MessageTypes";
import SendText_AudioMessageInput from "./SendText_AudioMessageInput";
import CameraModule from "./CameraModule";
import {
  DirectConversationProps,
  DirectMessageProps,
  GroupConversationProps,
  GroupMessageProps,
} from "../types";
import UploadedFileModule from "./UploadedFileModule";
import NoChat from "./ui/NoChat";
import ChatHeader from "./chat-header/ChatHeader";
import ProfileDetails from "./ProfileDetails";
import GroupMessageInfo from "./GroupMessageInfo";
import PageLoader from "./Loaders/PageLoader";

const Chat = () => {
  const dispatch = useDispatch();
  const { direct_chat, group_chat } = useSelector(
    (state: RootState) => state.conversation
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const { activeChatId, chatType, isCameraOpen } = useSelector(
    (state: RootState) => state.app
  );
  const [isloading, setIsLoading] = useState(true);
  const messagesListRef = useRef<HTMLUListElement | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const {
    DatesArray: IndividualMessagesSortedDates,
    MessagesObject: IndividualMessagesObject,
  } = SortMessages({
    messages: direct_chat?.current_direct_messages,
    sort: "Asc",
  });

  const {
    DatesArray: GroupMessagesSortedDates,
    MessagesObject: GroupMessagesObject,
  } = SortMessages({
    messages: group_chat?.current_group_messages,
    sort: "Asc",
  });
  console.log(group_chat?.current_group_messages);
  // // Scroll to the bottom when messages change
  // const scrollToBottomSmooth = useCallback(() => {
  //   if (messagesListRef.current) {
  //     messagesListRef?.current?.scrollTo({
  //       top: messagesListRef.current.scrollHeight,
  //       behavior: "smooth",
  //     });
  //   }
  // }, [messagesListRef]);
  // Scroll to the bottom when messages change
  const scrollToBottomQuick = useCallback(() => {
    if (messagesListRef?.current) {
      messagesListRef.current.scrollTop = messagesListRef.current?.scrollHeight;
    }
  }, [messagesListRef]);

  const handleOpenShowDetails = useCallback(() => {
    setShowDetails(true);
  }, []);

  const handleCloseShowDetails = useCallback(() => {
    setShowDetails(false);
  }, []);

  useEffect(() => {
    setTimeout(scrollToBottomQuick, 100);
  }, [
    direct_chat.current_direct_messages,
    group_chat.current_group_messages,
    activeChatId,
  ]);

  useEffect(() => {
    if (!activeChatId) return;
    setIsLoading(true);
    switch (chatType) {
      case "individual":
        const currentDirectChat = direct_chat?.DirectConversations?.find(
          (el: DirectConversationProps) => el?._id === activeChatId
        );
        if (currentDirectChat) {
          socket.emit(
            "messages:get",
            {
              conversationId: currentDirectChat?._id,
              chatType,
              authUserId: user?._id,
            },
            (data: DirectMessageProps) => {
              dispatch(setCurrentDirectMessages(data));

              setIsLoading(false);
            }
          );
          dispatch(setCurrentDirectConversation(currentDirectChat));
        } else {
          setIsLoading(false);
        }
        break;
      case "group":
        setIsLoading(true);
        const currentGroupChat = group_chat.GroupConversations?.find(
          (el: GroupConversationProps) => el?._id === activeChatId
        );
        socket.emit(
          "group:messages:get",
          {
            conversationId: currentGroupChat?._id,
            chatType,
            authUserId: user?._id,
          },
          (data: GroupMessageProps) => {
            dispatch(setCurrentGroupMessages(data));
            setIsLoading(false);
          }
        );
        dispatch(setCurrentGroupConversation(currentGroupChat));
        break;
      default:
        console.log("Invalid Chat_type", chatType);
        break;
    }
  }, [activeChatId]);
  return (
    <div
      className={`
          flex-1 bg-gray-200 dark:bg-[#1E1E1E] rounded-2xl p-2
          ${activeChatId ? "block" : "hidden"}
          md:block overflow-hidden
        `}
    >
      {activeChatId ? (
        <>
          {!isloading ? (
            <div className="w-full h-full relative flex gap-2 overflow-hidden">
              {/* Left: Main Chat Panel */}
              <div className="flex flex-col flex-1 h-full relative overflow-hidden">
                {/* camera */}
                {isCameraOpen && <CameraModule />}
                {/* send image preview */}
                <UploadedFileModule />
                {/* Header */}
                <ChatHeader handleOpenShowDetails={handleOpenShowDetails} />
                <ul
                  ref={messagesListRef}
                  className="flex-1 overflow-x-hidden mt-1 scrollbar-custom px-4 space-y-2"
                >
                  {chatType === "individual" ? (
                    <>
                      {IndividualMessagesSortedDates.map((date) => (
                        <div
                          key={`${date}_Msgs`}
                          className="datewise_msgs space-y-2"
                        >
                          {/* Date */}
                          <Timeline date={date} />
                          {/* messages */}
                          {IndividualMessagesObject[date].map(
                            (el: DirectMessageProps, index: number) => {
                              switch (el.messageType) {
                                case "photo":
                                  return (
                                    <MediaMsg
                                      el={el}
                                      key={index}
                                      scrollToBottom={scrollToBottomQuick}
                                    />
                                  );
                                case "audio":
                                  return <AudioMsg el={el} key={index} />;
                                default:
                                  return <TextMsg el={el} key={index} />;
                              }
                            }
                          )}
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {GroupMessagesSortedDates.map((date) => (
                        <div
                          key={`${date}_Msgs`}
                          className="datewise_msgs space-y-2"
                        >
                          {/* Date */}
                          <Timeline date={date} />
                          {/* messages */}
                          {GroupMessagesObject[date].map(
                            (el: GroupMessageProps, index: number) => {
                              switch (el.messageType) {
                                case "photo":
                                  return (
                                    <MediaMsg
                                      el={el}
                                      key={index}
                                      scrollToBottom={scrollToBottomQuick}
                                    />
                                  );
                                case "audio":
                                  return <AudioMsg el={el} key={index} />;
                                default:
                                  return <TextMsg el={el} key={index} />;
                              }
                            }
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </ul>

                <SendText_AudioMessageInput />
              </div>

              {/* Right: Expandable Profile Panel */}
              <ProfileDetails
                showDetails={showDetails}
                handleCloseShowDetails={handleCloseShowDetails}
              />
              {/* Right: Expandable Message Info Panel */}
              {/* <ProfileDetails
                showDetails={messageInfo}
                handleCloseShowDetails={()  => set}
              /> */}
              <GroupMessageInfo />
            </div>
          ) : (
            <PageLoader />
          )}
        </>
      ) : (
        <NoChat />
      )}
    </div>
  );
};

export default Chat;
