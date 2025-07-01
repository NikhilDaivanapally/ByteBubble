import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { useCallback, useEffect } from "react";
import { setUsers } from "../../store/slices/appSlice";
import { Button } from "../ui/Button";
import { motion, AnimatePresence } from "motion/react";
import { socket } from "../../socket";
import PageLoader from "../Loaders/PageLoader";
import { Avatar } from "../ui/Avatar";
import { useGetUsersQuery } from "../../store/slices/api";

const ConnectUsers = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const { users } = useSelector((state: RootState) => state.app);
  const { isLoading, data } = useGetUsersQuery({});
  useEffect(() => {
    if (!data?.data) return;
    dispatch(setUsers(data?.data));
  }, [data]);
  const handleSendFriendRequest = useCallback(
    (_id: string) => {
      socket.emit("friend:request", {
        recipient: _id,
        sender: authUser?._id,
        actionUser: authUser?._id,
      });
    },
    [socket, authUser]
  );
  return (
    <div className="w-full h-full space-y-2 pt-5">
      {!isLoading ? (
        <>
          {users.length ? (
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
                  {users.map((user, index: number) => {
                    const isOnline = user.status == "Online";
                    return (
                      <motion.li
                        key={user._id || index} // Prefer using a unique id if available
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        className="w-full max-w-md mx-auto border border-purple-200 rounded-xl shadow-sm hover:shadow-md transition flex items-center gap-x-4 py-3 px-3 cursor-pointer"
                      >
                        {/* Avatar */}
                        <Avatar size="md" url={user.avatar} online={isOnline} />
                        <div>
                          <p className="text-base font-medium text-gray-900">
                            {user.userName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {isOnline ? "Online" : "Offline"}
                          </p>
                        </div>
                        <Button
                          variant="primary"
                          className="ml-auto"
                          shape="md"
                          onClick={() => handleSendFriendRequest(user._id)}
                        >
                          Send Request
                        </Button>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            </motion.div>
          ) : (
            <div className="w-full h-full flex-center">
              <p>No Users Found</p>
            </div>
          )}
        </>
      ) : (
        <PageLoader />
      )}
    </div>
  );
};

export default ConnectUsers;
