import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
import { RootState } from "../../store/store";
import { socket } from "../../socket";
import ImagePreview from "../../components/ImagePreview";
import {
  useFetchDirectConversationsQuery,
  useFetchFriendsQuery,
} from "../../store/slices/apiSlice";
import { setDirectConversations } from "../../store/slices/conversation";
import { updateChatType, updateFriends } from "../../store/slices/appSlice";
import LayoutNavbar from "../../components/layout-navbar/LayoutNavbar";
import { useSocketConnection } from "../../hooks/use-socket-connection";
import { useFriendRequestEvents } from "../../hooks/use-friendrequest-events";
import { useTypingEvents } from "../../hooks/use-typing-events";
import {
  useGroupMessageEvents,
  useMessageEvents,
} from "../../hooks/use-message-events";
import { useChatEvents } from "../../hooks/use-chat-events";
import { useUsersStatusEvents } from "../../hooks/use-users-status-events";

const useRegisterSocketEvents = (isConnected: boolean) => {
  useFriendRequestEvents(isConnected);
  useTypingEvents(isConnected);
  useMessageEvents(isConnected);
  useGroupMessageEvents(isConnected);
  useChatEvents(isConnected);
  useUsersStatusEvents(isConnected);
};

const ChatLayout = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const { friends } = useSelector((state: RootState) => state.app);
  const { data: directConversationData } = useFetchDirectConversationsQuery({});
  const { data: friendsData } = useFetchFriendsQuery({});
  const { pathname } = useLocation();

  // Handle conversations
  useEffect(() => {
    if (!directConversationData) return;
    dispatch(setDirectConversations(directConversationData?.data));
  }, [directConversationData]);

  // Handle friends
  useEffect(() => {
    if (!friendsData && !friendsData?.data) return;
    dispatch(updateFriends(friendsData?.data));
  }, [friendsData]);

  // Handle chat type routing
  useEffect(() => {
    if (pathname.startsWith("/chat")) {
      dispatch(updateChatType("individual"));
    } else if (pathname.startsWith("/group")) {
      dispatch(updateChatType("group"));
    }
  }, [pathname, dispatch]);

  // Manage socket connection and events
  const isSocketConnected = useSocketConnection(user);
  useRegisterSocketEvents(isSocketConnected);

  // Emit 'exit' on window close
  useEffect(() => {
    if (!user || !friends?.length) return;

    const handleChangeStatus = () => {
      socket.emit("exit", { user_id: user._id, friends });
    };

    window.addEventListener("beforeunload", handleChangeStatus);
    return () => window.removeEventListener("beforeunload", handleChangeStatus);
  }, [user?._id, JSON.stringify(friends)]);

  // Main layout
  return (
    <div className="h-full bg-light overflow-y-hidden dark:bg-dark flex flex-col-reverse lg:flex-row">
      <LayoutNavbar />
      <div className="flex-1 overflow-hidden bg-light border-b md:border-l border-gray-300 lg:py-3">
        <Outlet />
      </div>
      <ImagePreview />
    </div>
  );
};

export default ChatLayout;
