import { useDispatch, useSelector } from "react-redux";
import { useFriendrequestsQuery } from "../../store/slices/apiSlice";
import { AppDispatch, RootState } from "../../store/store";
import { useCallback, useEffect } from "react";
import { setFriendRequests } from "../../store/slices/appSlice";
import Loader from "../ui/Loader";
import Button from "../ui/Button";
import { motion, AnimatePresence } from "motion/react";
import { socket } from "../../socket";
import { Icons } from "../../icons";

const Requests = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const { friendRequests } = useSelector((state: RootState) => state.app);
  const { isLoading, data } = useFriendrequestsQuery({});
  useEffect(() => {
    if (!data?.data) return;
    dispatch(setFriendRequests(data?.data));
  }, [data]);
  const handleAcceptFriendRequest = useCallback(
    (_id: string) => {
      socket.emit("accept_friendrequest", { request_id: _id });
    },
    [socket]
  );

  const handleRejectFriendRequest = useCallback(
    (_id: string) => {
      socket.emit("reject_friendrequest", { request_id: _id });
    },
    [socket]
  );
  return (
    <div className="w-full h-full space-y-2 pt-5">
      {!isLoading ? (
        <>
          {friendRequests.length ? (
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
                  {friendRequests.map((request, index: number) => {
                    const isOnline = request.sender.status == "Online";
                    return (
                      <motion.li
                        key={request._id || index} // Prefer using a unique id if available
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        className="w-full max-w-md mx-auto border border-purple-200 rounded-xl shadow-sm hover:shadow-md transition flex items-center gap-x-4 py-3 px-3 cursor-pointer"
                      >
                        {/* Avatar */}
                        <div className="w-10 h-10 relative shrink-0">
                          <img
                            src={request.sender.avatar}
                            className="w-full h-full rounded-full object-cover"
                            alt=""
                          />
                          {isOnline && (
                            <span className="w-2 h-2 absolute bottom-0 right-0 bg-green-600 rounded-full"></span>
                          )}
                        </div>
                        <div>
                          <p className="text-base font-medium text-gray-900">
                            {request.sender.userName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {isOnline ? "Online" : "Offline"}
                          </p>
                        </div>
                        <div className="ml-auto flex gap-1">
                          {request.sender?._id !== authUser?._id ? (
                            <>
                              <Button
                                kind="primary"
                                onClick={() =>
                                  handleAcceptFriendRequest(request._id)
                                }
                              >
                                <Icons.CheckIcon className="w-4" />
                                Accept
                              </Button>
                              <Button
                                kind="primary"
                                onClick={() =>
                                  handleRejectFriendRequest(request._id)
                                }
                              >
                                <Icons.XMarkIcon className="w-4" />
                                Decline
                              </Button>
                            </>
                          ) : (
                            <Button kind="primary" onClick={() => {}}>
                              <Icons.CheckIcon className="w-4" />
                              Request Sent
                            </Button>
                          )}
                        </div>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            </motion.div>
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

export default Requests;
