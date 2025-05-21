import { Link, Outlet, useLocation } from "react-router-dom";
import {
  useFetchDirectConversationsQuery,
  useFetchFriendsQuery,
  useGetConversationMutation,
} from "../../store/slices/apiSlice";
import { ReactNode, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import {
  addDirectConversation,
  addDirectMessage,
  addGroupConversation,
  addGroupMessage,
  updateDirectConversation,
  setDirectConversations,
  updateDirectMessageSeenStatus,
  updateDirectMessagesSeen,
  updateExistingDirectMessage,
  updateExistingGroupMessage,
  updateGroupConversation,
} from "../../store/slices/conversation";
import { updateChatType, updateFriends } from "../../store/slices/appSlice";
import { connectSocket, socket } from "../../socket";
import Loader from "../../components/ui/Loader";
import ImagePreview from "../../components/ImagePreview";
import { DirectMessage, GroupMessage } from "../../types";
import { group, individual } from "../../utils/conversationTypes";
import { navListData } from "../../data/navigation.data";

const ChatLayout = () => {
  const dispatch = useDispatch();
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const { activeChatId } = useSelector((state: RootState) => state.app);
  const { direct_chat, group_chat, fullImagePreview } = useSelector(
    (state: RootState) => state.conversation
  );
  const [
    getConversation,
    { data: ConversationData, error: ConversationError },
  ] = useGetConversationMutation();

  const { data: DirectConversationData } = useFetchDirectConversationsQuery({});

  useEffect(() => {
    if (!DirectConversationData) return;
    dispatch(setDirectConversations(DirectConversationData?.data));
  }, [DirectConversationData]);

  const { data: friendsData } = useFetchFriendsQuery({});

  useEffect(() => {
    if (!friendsData && !friendsData?.data) return;
    dispatch(updateFriends(friendsData?.data));
  }, [friendsData]);

  useEffect(() => {
    if (!ConversationData) return;
    switch (ConversationData?.data.messages[0]?.conversationType) {
      case individual:
        dispatch(
          addDirectConversation({
            auth: user,
            conversation: ConversationData?.data,
          })
        );
        break;
      case group:
        dispatch(
          addGroupConversation({
            conversation: ConversationData?.data,
            auth: user,
          })
        );
        break;
      default:
        break;
    }
  }, [ConversationData, ConversationError]);

  // Hook for initiating a socket connection with server after user signin
  useEffect(() => {
    if (!user?._id) return;
    // Connect to the socket and set up event listeners
    connectSocket(user?._id)
      .then(() => {
        setIsSocketConnected(true);
      })
      .catch((error) => {
        console.error("Socket connection error:", error);
        setIsSocketConnected(false);
      });

    // // Set up socket event listeners
    // const handleNewFriendRequest = (data) => {
    //   toast.success(data.message);
    //   dispatch(addFriendRequest(data?.friendRequest));
    //   dispatch(removeUserFromUsers(data?.user));
    // };
    // const handleRequestAccepted = (data) => {
    //   toast.success(data.message);
    //   dispatch(removeRequestFromFriendRequests(data?.data));
    //   dispatch(addFriend(data?.friend));
    // };
    // const handleRequestSent = (data) => {
    //   toast.success(data.message);
    //   dispatch(addFriendRequest(data?.friendRequest));
    //   dispatch(removeUserFromUsers(data?.user));
    // };
    // socket.on("new_friendrequest", handleNewFriendRequest);
    // socket.on("friendrequest_accepted", handleRequestAccepted);
    // socket.on("friendrequest_sent", handleRequestSent);

    // // Clean up socket event listeners on component unmount
    // return () => {
    //   socket?.off("new_friendrequest");
    //   socket?.off("friendrequest_accepted");
    //   socket?.off("friendrequest_sent");
    // };
  }, [user?._id]);

  // update the chatType based on Path
  const { pathname } = useLocation();
  useEffect(() => {
    switch (pathname) {
      case "/chat":
        dispatch(updateChatType("individual"));
        break;
      case "/chat/group":
        dispatch(updateChatType("group"));
        break;
    }
  }, [pathname]);

  useEffect(() => {
    if (!isSocketConnected) return;

    const handleNewMsg = (
      message: DirectMessage & {
        conversationType: string;
        conversationId: string;
      }
    ) => {
      switch (message?.conversationType) {
        case individual:
          if (
            message?.conversationId.toString() ===
            direct_chat.current_direct_conversation?.id.toString()
          ) {
            socket.emit("msg_seen_byreciever", {
              messageId: message?._id,
              conversationType: message?.conversationType,
              conversationId: message?.conversationId,
              sender: message?.sender,
            });
            dispatch(
              addDirectMessage({
                id: message?._id,
                type: message?.messageType,
                message: message?.message,
                createdAt: message?.createdAt,
                updatedAt: message?.updatedAt,
                incoming: message?.recipients === user?._id,
                outgoing: message?.sender === user?._id,
                status: "sent",
                seen: true,
              })
            );
          } else {
            socket.emit("update_unreadMsgs", message);
          }
          break;

        case group:
          if (
            message?.conversationId.toString() ===
            group_chat.current_group_conversation?.id.toString()
          ) {
            dispatch(
              addGroupMessage({
                id: message?._id,
                type: message?.messageType,
                message: message?.message,
                conversationId: message?.conversationId,
                createdAt: message?.createdAt,
                updatedAt: message?.updatedAt,
                incoming: message?.recipients.includes(user?._id),
                outgoing: message?.sender === user?._id,
                from: message?.sender,
                status: "sent",
              })
            );
          } else {
            socket.emit("update_unreadMsgs", message);
          }
          break;

        default:
          console.log("Unknown chat type");
          break;
      }
    };

    const handleUpdateMsgStatus = (
      message: GroupMessage & { conversationType: string }
    ) => {
      switch (message?.conversationType) {
        case individual:
          if (
            message?.conversationId?.toString() ===
            direct_chat.current_direct_conversation?.id.toString()
          ) {
            dispatch(updateExistingDirectMessage(message));
          }
          break;

        case group:
          if (
            message?.conversationId?.toString() ===
            group_chat.current_group_conversation?.id.toString()
          ) {
            dispatch(updateExistingGroupMessage(message));
          }
          break;

        default:
          console.log("Unknown chat type");
          break;
      }
    };

    const handleUpdateMsgSeen = (data: { messageId: string }) => {
      dispatch(updateDirectMessageSeenStatus(data));
    };

    const handleUpdateAllMsgSeenTrue = (conversationId: string) => {
      const conversation = direct_chat?.DirectConversations?.find(
        (conv) => conv?.id === conversationId
      );
      if (!conversation) return;
      dispatch(updateDirectConversation({ ...conversation, seen: true }));
      dispatch(updateDirectMessagesSeen({}));
    };

    socket.on("new_message", handleNewMsg);
    socket.on("update_msg_status", handleUpdateMsgStatus);
    socket.on("update_msg_seen", handleUpdateMsgSeen);
    socket.on("all_msg_seen", handleUpdateAllMsgSeenTrue);

    return () => {
      socket.off("new_message", handleNewMsg);
      socket.off("update_msg_status", handleUpdateMsgStatus);
      socket.off("update_msg_seen", handleUpdateMsgSeen);
      socket.off("all_msg_seen", handleUpdateAllMsgSeenTrue);
    };
  }, [
    isSocketConnected,
    direct_chat.DirectConversations,
    group_chat.GroupConversations,
    direct_chat.current_direct_conversation,
    group_chat.current_group_conversation,
  ]);

  useEffect(() => {
    if (!isSocketConnected) return;
    const handleUnreadMsgs = async (message) => {
      switch (message?.conversationType) {
        case individual:
          const update_Direct_Conversation =
            direct_chat?.DirectConversations?.find(
              (el) => el.id == message?.conversationId
            );
          if (update_Direct_Conversation) {
            dispatch(
              updateDirectConversation({
                ...update_Direct_Conversation,
                message: {
                  type: message?.messageType,
                  message: message?.message,
                  createdAt: message?.createdAt,
                },
                outgoing: message?.sender === user?._id,
                time: message?.createdAt,
                unread: (update_Direct_Conversation?.unread || 0) + 1,
              })
            );
          } else {
            await getConversation({
              conversationId: message?.conversationId,
              conversationType: message?.conversationType,
            });
          }
          break;
        case group:
          const update_Group_Conversation =
            group_chat?.GroupConversations?.find(
              (el) => el.id == message?.conversationId
            );
          if (update_Group_Conversation) {
            dispatch(
              updateGroupConversation({
                ...update_Group_Conversation,
                outgoing: message?.sender === user?._id,
                message: {
                  type: message?.messageType,
                  message: message?.message,
                  createdAt: message?.createdAt,
                },
                from: message?.sender,
                time: message?.createdAt,
                unread: (update_Group_Conversation?.unread || 0) + 1,
              })
            );
          } else {
            await getConversation({
              conversationId: message?.conversationId,
              conversationType: message?.conversationType,
            });
          }
          break;
        default:
          break;
      }
    };
    socket?.on("on_update_unreadMsg", handleUnreadMsgs);
    return () => {
      socket?.off("on_update_unreadMsg", handleUnreadMsgs);
    };
  }, [
    isSocketConnected,
    direct_chat.DirectConversations,
    group_chat.GroupConversations,
  ]);

  return (
    <>
      {!isSocketConnected ? (
        <div className="w-full h-full flex-center">
          <Loader customColor={true} />
        </div>
      ) : (
        <div className="h-full bg-light overflow-y-hidden  dark:bg-dark flex flex-col-reverse lg:flex-row">
          <nav
            className={`w-full h-20 lg:h-full lg:w-20 flex ${
              activeChatId ? "hidden md:flex" : ""
            } lg:flex-col justify-between items-center px-4 py-2 lg:px-0 lg:py-4`}
          >
            <div>logo</div>
            <ul className="list-none flex gap-5 lg:flex-col relative h-full lg:h-fit lg:w-full justify-center items-center">
              {navListData?.map(
                (item: { path: string; icon: any }, i: number) => {
                  return (
                    <li
                      key={i}
                      className={`w-fit aspect-square p-2 ${
                        pathname == item.path ? "bg-btn-primary/20" : ""
                      } rounded-lg cursor-pointer`}
                    >
                      <Link to={item.path}>
                        <div className="">
                          <item.icon
                            className={`w-7 ${
                              pathname == item.path
                                ? "fill-btn-primary"
                                : "fill-light stroke-[0.7px] stroke-black"
                            }`}
                          />
                        </div>
                      </Link>
                    </li>
                  );
                }
              )}
            </ul>
            <img
              className="w-12 h-12 object-cover rounded-full"
              src={user?.avatar}
              alt=""
            />
          </nav>
          <div className="flex-1 overflow-hidden bg-light border-b md:border-l border-gray-300 lg:py-3">
            <Outlet />
          </div>
          {fullImagePreview && <ImagePreview />}
        </div>
      )}
    </>
  );
};

export default ChatLayout;
