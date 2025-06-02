import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
import { RootState } from "../../store/store";
import { socket } from "../../socket";
import Loader from "../../components/ui/Loader";
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
import { useMessageEvents } from "../../hooks/use-message-events";
import { useChatEvents } from "../../hooks/use-chat-events";
import { useUsersStatusEvents } from "../../hooks/use-users-status-events";

const ChatLayout = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const { friends } = useSelector((state: RootState) => state.app);
  const { data: directConversationData } = useFetchDirectConversationsQuery({});
  const { data: friendsData } = useFetchFriendsQuery({});

  useEffect(() => {
    if (!directConversationData) return;
    dispatch(setDirectConversations(directConversationData?.data));
  }, [directConversationData]);

  useEffect(() => {
    if (!friendsData && !friendsData?.data) return;
    dispatch(updateFriends(friendsData?.data));
  }, [friendsData]);

  const { pathname } = useLocation();
  useEffect(() => {
    switch (pathname) {
      case "/chat":
        dispatch(updateChatType("individual"));
        break;
      case "/group":
        dispatch(updateChatType("group"));
        break;
    }
  }, [pathname]);

  const isSocketConnected = useSocketConnection(user);
  useFriendRequestEvents(isSocketConnected);
  useTypingEvents(isSocketConnected);
  useMessageEvents(isSocketConnected);
  useChatEvents(isSocketConnected);
  useUsersStatusEvents(isSocketConnected);

  useEffect(() => {
    if (!friends.length) return;
    const handleChangeStatus = () => {
      socket.emit("exit", { user_id: user?._id, friends });
    };
    window.addEventListener("beforeunload", handleChangeStatus);

    return () => {
      window.removeEventListener("beforeunload", handleChangeStatus);
    };
  }, [friends]);

  return (
    <>
      {!isSocketConnected ? (
        <div className="w-full h-full flex-center">
          <Loader customColor={true} />
        </div>
      ) : (
        <div className="h-full bg-light overflow-y-hidden  dark:bg-dark flex flex-col-reverse lg:flex-row">
          <LayoutNavbar />
          <div className="flex-1 overflow-hidden bg-light border-b md:border-l border-gray-300 lg:py-3">
            <Outlet />
          </div>
          <ImagePreview />
        </div>
      )}
    </>
  );
};

export default ChatLayout;
