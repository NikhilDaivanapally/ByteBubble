import { motion, AnimatePresence } from "motion/react";
import { Icons } from "../icons";
import React from "react";
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
  const handleClose = () => {
    dispatch(setMessageInfo(null));
  };

  const recipients = [
    ...current_group_conversation?.users,
    current_group_conversation?.admin,
  ].filter((user) => user?._id !== messageInfo?.from);

  // const seenBy = messageInfo?.isSeen.reduce(
  //   (acc: any[], { isSeen, seenAt, userId }) => {
  //     const user = recipients.find((user) => user?._id === userId);
  //     if (user) {
  //       acc.push({
  //         _id: user?._id,
  //         userName: user?.userName,
  //         avatar: user?.avatar,
  //         isSeen,
  //         seenAt,
  //       });
  //     }
  //     return acc;
  //   },
  //   []
  // );
  const { seenBy, deliveredTo } = recipients.reduce(
    (acc: { seenBy: any[]; deliveredTo: any[] }, user) => {
      const seen = messageInfo?.isSeen.find(
        (seenUser) => seenUser?.userId === user?._id
      );
      if (seen) {
        acc.seenBy.push({
          _id: user?._id,
          userName: user?.userName,
          avatar: user?.avatar,
          isSeen: seen.isSeen,
          seenAt: seen.seenAt,
        });
      } else {
        acc.deliveredTo.push({
          _id: user?._id,
          userName: user?.userName,
          avatar: user?.avatar,
          deliveredAt: user?.createdAt,
        });
      }
      return acc;
    },
    { seenBy: [], deliveredTo: [] }
  );

  console.log(seenBy);

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
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-green-600"></div>
                <div className="w-2 h-2 rounded-full bg-green-600"></div>
              </div>
              <p>Read by</p>
            </div>
            {seenBy?.length ? (
              <ul>
                {seenBy.map((user, i) => {
                  return (
                    <li key={i} className="flex gap-4 items-center">
                      <Avatar url={user?.avatar} />
                      <div className="">
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
            ) : (
              ""
            )}
          </div>
          {deliveredTo?.length ? (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                </div>
                <p>delivered to</p>
              </div>
              <ul>
                {deliveredTo.map((user, i) => {
                  return (
                    <li key={i} className="flex gap-4 items-center">
                      <Avatar url={user?.avatar} />
                      <div className="">
                        <p>{user?.userName}</p>
                        <span className="text-black/60 text-sm">
                          {formatToReadableDate(user?.deliveredAt) +
                            " at " +
                            formatTo12HourTime(user?.deliveredAt)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            ""
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(GroupMessageInfo);
