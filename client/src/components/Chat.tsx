import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useEffect, useState } from "react";
import { socket } from "../socket";
import Loader from "./ui/Loader";
import {
  fetchCurrentDirectMessages,
  fetchCurrentGroupMessages,
  setCurrentDirectConversation,
  setCurrentGroupConversation,
} from "../store/slices/conversation";
import SortMessages from "../utils/sortMessage";
import { TextMsg, Timeline } from "./MessageTypes";

const Chat = () => {
  const [isloading, setIsloading] = useState(false);
  const { direct_chat, group_chat } = useSelector(
    (state: RootState) => state.conversation
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const { activeChatId, chatType } = useSelector(
    (state: RootState) => state.app
  );
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

  useEffect(() => {
    if (!activeChatId) return;
    switch (chatType) {
      case "individual":
        // setIsloading(true);
        const currentDirectChat = direct_chat?.DirectConversations?.find(
          (el: any) => el?.id === activeChatId
        );
        if (currentDirectChat) {
          socket.emit(
            "get_messages",
            { conversation_id: currentDirectChat?.id },
            (data: any) => {
              dispatch(
                fetchCurrentDirectMessages({ auth: user, messages: data })
              );
              setIsloading(false);
            }
          );
          dispatch(setCurrentDirectConversation(currentDirectChat));
        } else {
          setIsloading(false);
        }
        break;
      case "group":
        setIsloading(true);
        const currentGroupChat = group_chat.GroupConversations.find(
          (el: any) => el?.id === activeChatId
        );
        socket.emit(
          "get_messages",
          { conversation_id: currentGroupChat?.id },
          (data: any) => {
            dispatch(fetchCurrentGroupMessages({ auth: user, messages: data }));
            setIsloading(false);
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
          ${true || activeChatId ? "block" : "hidden"}
          md:block
        `}
    >
      {activeChatId ? (
        <>
          {!isloading ? (
            <div className="w-full h-full flex flex-col overflow-hidden">
              {/* messages */}
              <ul className="flex-1 overflow-x-hidden">
                {chatType === "individual" ? (
                  <>
                    {IndividualMessagesSortedDates.map((date, i) => (
                      <div key={`${date}_Msgs`} className="datewise_msgs">
                        {/* Date */}
                        <Timeline date={date} />
                        {/* messages */}
                        {IndividualMessagesObject[date].map((el, index) => {
                          switch (el.type) {
                            // case "photo":
                            //   return (
                            //     <MediaMsg
                            //       el={el}
                            //       key={index}
                            //       scrollToBottom={scrollToBottomSmooth}
                            //     />
                            //   );
                            // case "doc":
                            //   return <DocMsg el={el} key={index} />;
                            // case "link":
                            //   return <LinkMsg el={el} key={index} />;
                            // case "reply":
                            //   return <ReplyMsg el={el} key={index} />;
                            // case "audio":
                            //   return <AudioMsg el={el} key={index} />;
                            default:
                              return <TextMsg el={el} key={index} />;
                          }
                        })}
                      </div>
                    ))}
                  </>
                ) : (
                  <></>
                )}
              </ul>

              {/* send footer btn */}
              <div className="w-full h-30 bg-green-300"></div>
            </div>
          ) : (
            // <ul className="space-y-2">
            //   <li className="bg-red-200 w-fit ml-auto rounded-2xl rounded-br-none p-2">
            //     Hi John
            //   </li>
            //   <li className="bg-red-200 w-fit rounded-2xl rounded-bl-none p-2">
            //     Hi John
            //   </li>
            //   <li className="bg-red-200 w-fit ml-auto rounded-2xl rounded-br-none p-2">
            //     Hi John
            //   </li>
            // </ul>
            <Loader customColor={true} />
          )}
        </>
      ) : (
        <span>select a conversation to start chat</span>
      )}
    </div>
  );
};

export default Chat;
