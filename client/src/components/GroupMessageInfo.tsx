import { motion, AnimatePresence } from "motion/react";
import { Icons } from "../icons";
import React, { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { setMessageInfo } from "../store/slices/appSlice";
import { formatTo12HourTime, formatToReadableDate } from "../utils/dateUtils";
import { Avatar } from "./ui/Avatar";

const GroupMessageInfo = () => {
  const dispatch = useDispatch();
  const { current_group_conversation } = useSelector(
    (state: RootState) => state.conversation.group_chat
  );
  const { messageInfo } = useSelector((state: RootState) => state.app);

  const handleClose = () => dispatch(setMessageInfo(null));

  const currentGroupConversationRef = useRef(current_group_conversation);

  useEffect(() => {
    currentGroupConversationRef.current = current_group_conversation;
  }, [current_group_conversation]);

  const recipients = useMemo(() => {
    const users = currentGroupConversationRef.current?.users || [];
    if (!messageInfo?.from?._id) return users;
    return users.filter(
      (user) => user?._id?.toString() !== messageInfo?.from?._id?.toString()
    );
  }, [messageInfo?.from]);

  const { seenBy, deliveredTo } = useMemo(() => {
    return recipients.reduce(
      (acc: { seenBy: any[]; deliveredTo: any[] }, user) => {
        const seen = messageInfo?.readBy?.find(
          (seenUser) => seenUser?.userId?.toString() === user?._id?.toString()
        );

        if (seen?.isRead) {
          acc.seenBy.push({
            _id: user._id,
            userName: user.userName,
            avatar: user.avatar,
            seenAt: seen.seenAt,
          });
        } else {
          acc.deliveredTo.push({
            _id: user._id,
            userName: user.userName,
            avatar: user.avatar,
            deliveredAt: user.createdAt,
          });
        }

        return acc;
      },
      { seenBy: [], deliveredTo: [] }
    );
  }, [messageInfo, recipients]);

  return (
    <AnimatePresence>
      {messageInfo && (
        <motion.div
          key="profile-panel"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="bg-white origin-right rounded-lg w-full space-y-6 xl:w-100 absolute top-0 right-0 z-10 md:relative h-full overflow-hidden flex-shrink-0 p-3.5"
        >
          <button onClick={handleClose}>
            <Icons.XMarkIcon className="w-8 p-1 rounded-full cursor-pointer hover:bg-gray-200 transition" />
          </button>

          {/* Seen By */}
          {seenBy.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-600" />
                  <div className="w-2 h-2 rounded-full bg-green-600" />
                </div>
                <p>Read by</p>
              </div>
              <ul>
                {seenBy.map((user, i) => (
                  <li key={i} className="flex gap-4 items-center">
                    <Avatar url={user.avatar} />
                    <div>
                      <p>{user.userName}</p>
                      <span className="text-black/60 text-sm">
                        {formatToReadableDate(user.seenAt)} at {formatTo12HourTime(user.seenAt)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Delivered To */}
          {deliveredTo.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                </div>
                <p>Delivered to</p>
              </div>
              <ul>
                {deliveredTo.map((user, i) => (
                  <li key={i} className="flex gap-4 items-center">
                    <Avatar url={user.avatar} />
                    <div>
                      <p>{user.userName}</p>
                      <span className="text-black/60 text-sm">
                        {formatToReadableDate(user.deliveredAt)} at {formatTo12HourTime(user.deliveredAt)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(GroupMessageInfo);
