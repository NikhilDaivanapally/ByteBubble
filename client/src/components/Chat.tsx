import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useEffect, useRef, useState } from "react";
import { socket } from "../socket";
import Loader from "./ui/Loader";
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
import { DirectMessage, GroupMessage } from "../types";
import UploadedFileModule from "./UploadedFileModule";
import NoChat from "./ui/NoChat";

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
  // Scroll to the bottom when messages change
  const scrollToBottomSmooth = () => {
    if (messagesListRef.current) {
      messagesListRef?.current?.scrollTo({
        top: messagesListRef.current.scrollHeight,
        behavior: "smooth",
      });
      // messagesListRef?.current?.scrollIntoView({ behavior: "smooth" });
      // messagesListRef.current.scrollTop = messagesListRef.current.scrollHeight;
    }
  };

  // Scroll to the bottom when messages change
  const scrollToBottomQuick = () => {
    if (messagesListRef?.current) {
      messagesListRef.current.scrollTop = messagesListRef.current.scrollHeight;
    }
  };

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
          (el: any) => el?.id === activeChatId
        );
        if (currentDirectChat) {
          socket.emit(
            "get_messages",
            {
              conversationId: currentDirectChat?.id,
              chatType,
              authUserId: user?._id,
            },
            (data: any) => {
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
          (el: any) => el?.id === activeChatId
        );
        socket.emit(
          "get_messages",
          {
            conversationId: currentGroupChat?.id,
            chatType,
            authUserId: user?._id,
          },
          (data: any) => {
            dispatch(setCurrentGroupMessages(data));
            setIsLoading(false);
          }
        );
        dispatch(setCurrentGroupConversation(currentGroupChat));
        break;
      default:
        console.log("Invalid Chat_type");
        break;
    }
  }, [activeChatId]);

  return (
    <div
      className={`
          flex-1 bg-gray-200 rounded-2xl p-4
          ${activeChatId ? "block" : "hidden"}
          md:block
        `}
    >
      {activeChatId ? (
        <>
          {!isloading ? (
            <div className="w-full relative h-full flex flex-col overflow-hidden">
              {/* camera overlay */}
              {isCameraOpen && <CameraModule />}

              {/* Image send overlary */}
              <UploadedFileModule />
              {/* messages */}
              <ul
                ref={messagesListRef}
                className="flex-1 overflow-x-hidden scrollbar-custom px-4 space-y-2"
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
                          (el: DirectMessage, index: number) => {
                            switch (el.type) {
                              case "photo":
                                return (
                                  <MediaMsg
                                    el={el}
                                    key={index}
                                    scrollToBottom={scrollToBottomSmooth}
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
                          (el: GroupMessage, index: number) => {
                            switch (el.type) {
                              case "photo":
                                return (
                                  <MediaMsg
                                    el={el}
                                    key={index}
                                    scrollToBottom={scrollToBottomSmooth}
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
              {/* send footer btn */}
              <SendText_AudioMessageInput />
            </div>
          ) : (
            <div className="w-full h-full flex-center">
              <Loader customColor={true} />
            </div>
          )}
        </>
      ) : (
        <NoChat />
      )}
    </div>
  );
};

export default Chat;
