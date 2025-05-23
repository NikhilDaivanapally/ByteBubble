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
// import { motion, AnimatePresence } from "motion";
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
    socket.emit("start_conversation", {
      to: _id,
      from: authUser?._id,
    });
    Navigate("/");
  };

  const handleRemoveFriend = (_id: string) => {
    socket.emit("remove_friend", { to: _id, from: authUser?._id });
  };

  return (
    <div className="w-full h-full space-y-2 pt-5">
      {!isLoading ? (
        <>
          {friends.length ? (
            <ul className="space-y-2">
              <AnimatePresence>
                {friends.map((friend, index: number) => {
                  const online = friend.status === "Online";
                  return (
                    <motion.li
                      key={friend._id || index} // Prefer using a unique id if available
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      className="w-full max-w-md mx-auto border border-btn-primary flex items-center gap-x-4 py-2 rounded-full px-3 cursor-pointer"
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 relative shrink-0">
                        <img
                          src={friend.avatar}
                          className="w-full h-full rounded-full object-cover"
                          alt=""
                        />
                        {online && (
                          <span className="w-2 h-2 absolute bottom-0 right-0 bg-green-600 rounded-full"></span>
                        )}
                      </div>
                      <p>{friend.userName}</p>
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
          ) : (
            <div className="w-full h-full flex-center">
              <p>No Friend Requests Found</p>
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
