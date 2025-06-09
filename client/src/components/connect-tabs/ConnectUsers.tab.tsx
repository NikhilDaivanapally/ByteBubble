import { useDispatch, useSelector } from "react-redux";
import { useFetchUsersQuery } from "../../store/slices/apiSlice";
import { AppDispatch, RootState } from "../../store/store";
import { useCallback, useEffect } from "react";
import { setUsers } from "../../store/slices/appSlice";
import { Button } from "../ui/Button";
import { motion, AnimatePresence } from "motion/react";
import { socket } from "../../socket";
import PageLoader from "../Loaders/PageLoader";

const ConnectUsers = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const { users } = useSelector((state: RootState) => state.app);
  const { isLoading, data } = useFetchUsersQuery({});
  useEffect(() => {
    if (!data?.data) return;
    dispatch(setUsers(data?.data));
  }, [data]);
  const handleSendFriendRequest = useCallback(
    (_id: string) => {
      socket.emit("friend:request", {
        recipient: _id,
        sender: authUser?._id,
      });
    },
    [socket, authUser]
  );
  return (
    <div className="w-full h-full flex justify-center">
      {!isLoading ? (
        <>
          {users.length ? (
            <ul className="space-y-2 mt-2">
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
                      <div className="w-10 h-10 relative shrink-0">
                        <img
                          src={user.avatar}
                          className="w-full h-full rounded-full object-cover"
                          alt=""
                        />
                        {isOnline && (
                          <span className="w-2 h-2 absolute bottom-0 right-0 bg-green-600 rounded-full"></span>
                        )}
                      </div>
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
