import { motion, AnimatePresence } from "motion/react";
import { Icons } from "../icons";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { setMessageInfo } from "../store/slices/appSlice";
import { formatTo12HourTime, formatToReadableDate } from "../utils/dateUtils";

const GroupMessageInfo = () => {
  const dispatch = useDispatch();
  const { current_group_conversation } = useSelector(
    (state: RootState) => state.conversation.group_chat
  );
  const { messageInfo } = useSelector((state: RootState) => state.app);
  const handleClose = () => {
    dispatch(setMessageInfo(null));
  };

  console.log(current_group_conversation);

  const recipients = [
    current_group_conversation?.users,
    current_group_conversation?.admin,
  ].filter((user) => user?._id !== messageInfo?.from);

  const seenBy = messageInfo?.isSeen.reduce(
    (acc: any[], { isSeen, seenAt, userId }) => {
      const user = recipients.find((user) => user?._id === userId);
      if (user) {
        acc.push({
          _id: user?._id,
          userName: user?.userName,
          avatar: user?.avatar,
          isSeen,
          seenAt,
        });
      }
      return acc;
    },
    []
  );

  return (
    <AnimatePresence>
      {messageInfo && (
        <motion.div
          key="profile-panel"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="bg-white origin-right rounded-lg w-full xl:w-100 absolute top-0 right-0 z-10 md:relative h-full overflow-hidden flex-shrink-0 p-3.5"
        >
          <button onClick={handleClose}>
            <Icons.XMarkIcon className="w-8 p-1 rounded-full cursor-pointer hover:bg-gray-200 transition" />
          </button>

          <p>Read by</p>
          {seenBy?.length && (
            <ul>
              {seenBy.map((user, i) => {
                return (
                  <li key={i}>
                    <div>
                      <p>{user?.userName}</p>
                      <span className="text-black/60 text-sm">
                        {formatToReadableDate(user?.seenAt) +
                          " at " +
                          formatTo12HourTime(user?.seenAt)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <p>delivered to</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(GroupMessageInfo);
