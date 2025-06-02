import { useDispatch, useSelector } from "react-redux";
import { useFetchFriendsQuery } from "../../store/slices/apiSlice";
import { AppDispatch, RootState } from "../../store/store";
import { useEffect } from "react";
import { setFriends } from "../../store/slices/appSlice";
import Loader from "../ui/Loader";
import Button from "../ui/Button";
import { Icons } from "../../icons";
import { AnimatePresence, motion } from "motion/react";
import { socket } from "../../socket";
import { useNavigate } from "react-router-dom";
const Friends = () => {
  const Navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const { friends } = useSelector((state: RootState) => state.app);
  const { isLoading, data } = useFetchFriendsQuery({});
  useEffect(() => {
    if (!data?.data) return;
    dispatch(setFriends(data?.data));
  }, [data]);

  const handleStartConversation = (_id: string) => {
    socket.emit("start:conversation", {
      to: _id,
      from: authUser?._id,
    });
    Navigate("/chat");
  };

  const handleRemoveFriend = (_id: string) => {
    socket.emit("remove_friend", { to: _id, from: authUser?._id });
  };

  return (
    <div className="w-full h-full space-y-2 pt-5">
      {!isLoading ? (
        <>
          {friends.length ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            >
              <ul className="space-y-2">
                <AnimatePresence>
                  {friends.map((friend, index: number) => {
                    const isOnline = friend.status === "Online";
                    return (
                      <motion.li
                        key={friend._id || index} // Prefer using a unique id if available
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        className="w-full max-w-md mx-auto border border-purple-200 rounded-xl shadow-sm hover:shadow-md transition flex items-center gap-x-4 py-3 px-3 cursor-pointer"
                      >
                        {/* Avatar */}
                        <div className="w-10 h-10 relative shrink-0">
                          <img
                            src={friend.avatar}
                            className="w-full h-full rounded-full object-cover"
                            alt=""
                          />
                          {isOnline && (
                            <span className="w-2 h-2 absolute bottom-0 right-0 bg-green-600 rounded-full"></span>
                          )}
                        </div>
                        <div>
                          <p className="text-base font-medium text-gray-900">
                            {friend.userName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {isOnline ? "Online" : "Offline"}
                          </p>
                        </div>
                        <div className="ml-auto flex gap-1">
                          <Button
                            kind="primary"
                            onClick={() => handleStartConversation(friend._id)}
                          >
                            <Icons.ChatBubbleLeftRightIcon className="w-5" />
                          </Button>
                          <Button
                            kind="primary"
                            onClick={() => handleRemoveFriend(friend._id)}
                          >
                            <Icons.XMarkIcon className="w-5" />
                          </Button>
                        </div>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            </motion.div>
          ) : (
            <div className="w-full h-full flex-center">
              <p>No Friends Found</p>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex-center">
          <Loader customColor={true} />
        </div>
      )}
    </div>
  );
};

export default Friends;
