import {
  ChatBubbleLeftRightIcon,
  UserPlusIcon,
  UsersIcon,
} from "@heroicons/react/16/solid";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  useFetchDirectConversationsQuery,
  useFetchFriendsQuery,
  useGetConversationMutation,
} from "../../store/slices/apiSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import {
  addDirectConversation,
  addGroupConversation,
  updateDirectConversations,
} from "../../store/slices/conversation";
import { updateChatType, updateFriends } from "../../store/slices/appSlice";
import { connectSocket, socket } from "../../socket";
import toast from "react-hot-toast";
import Loader from "../../components/ui/Loader";

const ChatLayout = () => {
  const dispatch = useDispatch();
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const { chatType } = useSelector((state: RootState) => state.app);
  console.log(chatType);
  const [getConversation, { data: getConversationData }] =
    useGetConversationMutation();

  // fetch DirectConversations data
  const { data: DirectConversationData, error: DirectConversationError } =
    useFetchDirectConversationsQuery({});

  // update DirectConversations to store
  useEffect(() => {
    if (DirectConversationData) {
      dispatch(
        updateDirectConversations({
          conversations: DirectConversationData.data,
          auth: user,
        })
      );
    } else if (DirectConversationError) {
      console.log(DirectConversationError);
    }
  }, [DirectConversationData, DirectConversationError]);

  // fetch friends data
  const { data: friendsData, error: friendsError } = useFetchFriendsQuery({});

  // update friends data to store
  useEffect(() => {
    if (friendsData && friendsData.data) {
      dispatch(updateFriends(friendsData.data));
    } else if (friendsError) {
      console.log("failed to fetch friends");
    }
  }, [friendsData, friendsError]);

  useEffect(() => {
    if (getConversationData) {
      switch (getConversationData.data.messages[0]?.conversationType) {
        case "OneToOneMessage":
          dispatch(
            addDirectConversation({
              auth: user,
              conversation: getConversationData.data,
            })
          );
          break;
        case "OneToManyMessage":
          dispatch(
            addGroupConversation({
              conversation: getConversationData.data,
              auth: user,
            })
          );
          break;
        default:
          console.log("getConversationData is null", getConversationData);
          break;
      }
    }
  }, [getConversationData]);

  // Hook for initiating a socket connection with server after user login
  useEffect(() => {
    if (user?._id) {
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
    }
  }, [user?._id]);
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

  return (
    <>
      {!isSocketConnected ? (
        <Loader customColor={true} />
      ) : (
        <div className="h-full bg-light overflow-y-hidden  dark:bg-dark flex flex-col-reverse lg:flex-row">
          {/* nav bar */}
          <nav className="w-full h-20 lg:h-full lg:w-20 flex lg:flex-col justify-between items-center px-4 py-2 lg:px-0 lg:py-4">
            {/* logo */}
            <div>logo</div>
            {/* list */}
            <ul className="flex gap-5 lg:flex-col relative h-full lg:h-fit lg:w-full justify-center items-center">
              {/* bar */}
              {/* <div className="absolute top-0 left-0 origin-top -rotate-90 lg:right-0 w-1 rounded-full h-11 bg-btn-primary"></div> */}
              <Link to={"/chat"}>
                <div className="w-fit aspect-square p-2 bg-btn-primary/20 rounded-lg cursor-pointer">
                  <ChatBubbleLeftRightIcon className="w-7 fill-btn-primary" />
                </div>
              </Link>
              <Link to="/chat/group">
                <div className="w-fit aspect-square p-2 hover:bg-btn-primary/20  rounded-lg cursor-pointer">
                  <UsersIcon className="w-7 fill-light stroke-[0.7px] stroke-black" />
                </div>
              </Link>
              <div className="w-fit aspect-square p-2 hover:bg-btn-primary/20  rounded-lg cursor-pointer">
                <UserPlusIcon className="w-7 fill-light stroke-[0.7px] stroke-black" />
              </div>
            </ul>
            {/* profile */}
            <img src="" className="w-10 h-10 bg-gray-200 rounded-full" alt="" />
          </nav>

          <div className="flex-1 overflow-hidden bg-light border-b md:border-l border-gray-300 lg:py-3">
            <Outlet />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatLayout;
