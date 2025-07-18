import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
import { RootState } from "../../store/store";
import { socket } from "../../socket";
import ImagePreview from "../../components/ImagePreview";
import { setDirectConversations } from "../../store/slices/conversation";
import {
  setUnreadCount,
  updateChatType,
  updateFriends,
} from "../../store/slices/appSlice";
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
import { useGroupEvents } from "../../hooks/use-group-events";
import {
  useDirectSystemEvents,
  useGroupSystemEvents,
} from "../../hooks/use-system-events";
import PdfPreview from "../../components/PdfPreview";
import {
  useGetConnectionsQuery,
  useGetDirectConversationsQuery,
  useGetUnreadMessagesCountQuery,
} from "../../store/slices/api";

// register & listen for socket events
const useRegisterSocketEvents = (isConnected: boolean) => {
  useFriendRequestEvents(isConnected);
  useTypingEvents(isConnected);
  useMessageEvents(isConnected);
  useGroupMessageEvents(isConnected);
  useChatEvents(isConnected);
  useGroupEvents(isConnected);
  useUsersStatusEvents(isConnected);
  useDirectSystemEvents(isConnected);
  useGroupSystemEvents(isConnected);
};

const ChatLayout = () => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  // current Authenticated user
  const user = useSelector((state: RootState) => state.auth.user);
  // connections
  const { friends } = useSelector((state: RootState) => state.app);
  // get unread messages count
  const { data: unreadCountdata } = useGetUnreadMessagesCountQuery({});
  // get direct conversations
  const { data: directConversationData } = useGetDirectConversationsQuery({});
  // get connections
  const { data: friendsData } = useGetConnectionsQuery({});

  // update store with unread messages count
  useEffect(() => {
    if (!unreadCountdata?.data) return;
    dispatch(setUnreadCount(unreadCountdata?.data));
  }, [unreadCountdata?.data]);

  // update store with directConversations
  useEffect(() => {
    if (!directConversationData?.data) return;
    dispatch(setDirectConversations(directConversationData.data));
  }, [directConversationData?.data, dispatch]);

  // update store with connections
  useEffect(() => {
    if (!friendsData?.data) return;
    dispatch(updateFriends(friendsData.data));
  }, [friendsData?.data, dispatch]);

  // Handle chat type routing
  useEffect(() => {
    if (pathname.startsWith("/chat")) {
      dispatch(updateChatType("direct"));
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
  }, [user?._id, friends.length]);

  return (
    <div className="h-full bg-light overflow-y-hidden dark:bg-dark flex flex-col-reverse lg:flex-row">
      {/* App Navigation */}
      <LayoutNavbar />
      {/* Chat List & Active Chat Window */}
      <div className="flex-1 overflow-hidden bg-light border-b md:border-l border-gray-300 lg:py-2">
        <Outlet />
      </div>
      <ImagePreview />
      <PdfPreview />
    </div>
  );
};

export default ChatLayout;
