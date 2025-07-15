import { motion, AnimatePresence } from "motion/react";
import { Icons } from "../icons";
import React, { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { setGroupMessageInfo } from "../store/slices/appSlice";
import { formatTo12HourTime, formatToReadableDate } from "../utils/dateUtils";
import { Avatar } from "./ui/Avatar";
import { GroupImageMsg } from "./Chat/GroupChat/messages/ImageMsg";
import { GroupAudioMsg } from "./Chat/GroupChat/messages/AudioMsg";
import { GroupTextMsg } from "./Chat/GroupChat/messages/TextMsg";
import { GroupLinkMsg } from "./Chat/GroupChat/messages/LinkMsg";
import GroupDocumentMsg from "./Chat/GroupChat/messages/documentMsg";
import ReadIndicator from "./ui/ReadIndicator";

const GroupMessageInfo = () => {
  const dispatch = useDispatch();
  const { current_group_conversation } = useSelector(
    (state: RootState) => state.conversation.group_chat
  );
  const { groupMessageInfo } = useSelector((state: RootState) => state.app);
  const groupName = current_group_conversation?.name ?? "group";
  const message = useMemo(() => {
    switch (groupMessageInfo?.messageType) {
      case "image":
        return (
          <GroupImageMsg
            el={groupMessageInfo}
            usersLength={
              (current_group_conversation?.users.length as number) - 1
            }
            groupName={groupName}
            scrollToBottom={() => {}}
          />
        );
      case "audio":
        return (
          <GroupAudioMsg
            el={groupMessageInfo}
            usersLength={
              (current_group_conversation?.users.length as number) - 1
            }
            groupName={groupName}
          />
        );
      case "document":
        return (
          <GroupDocumentMsg
            el={groupMessageInfo}
            usersLength={
              (current_group_conversation?.users.length as number) - 1
            }
            scrollToBottom={() => {}}
            groupName={groupName}
          />
        );
      case "text":
        return (
          <GroupTextMsg
            el={groupMessageInfo}
            usersLength={
              (current_group_conversation?.users.length as number) - 1
            }
            groupName={groupName}
          />
        );
      case "link":
        return (
          <GroupLinkMsg
            el={groupMessageInfo}
            usersLength={
              (current_group_conversation?.users.length as number) - 1
            }
            groupName={groupName}
          />
        );
    }
  }, [groupMessageInfo, dispatch]);
  const handleClose = () => dispatch(setGroupMessageInfo(null));

  const currentGroupConversationRef = useRef(current_group_conversation);

  useEffect(() => {
    currentGroupConversationRef.current = current_group_conversation;
  }, [current_group_conversation]);

  const recipients = useMemo(() => {
    const users = currentGroupConversationRef.current?.users || [];
    if (!groupMessageInfo?.from?._id) return users;
    return users.filter(
      (user) =>
        user?._id?.toString() !== groupMessageInfo?.from?._id?.toString()
    );
  }, [groupMessageInfo?.from]);

  const { seenBy, deliveredTo } = useMemo(() => {
    return recipients.reduce(
      (acc: { seenBy: any[]; deliveredTo: any[] }, user) => {
        const seen = groupMessageInfo?.readBy?.find(
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
  }, [groupMessageInfo, recipients]);

  return (
    <AnimatePresence>
      {groupMessageInfo && (
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
          {message}
          {/* Seen By */}
          {seenBy.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <ReadIndicator read={true} />
                <p>Read by</p>
              </div>
              <ul>
                {seenBy.map((user, i) => (
                  <li key={i} className="flex gap-4 items-center">
                    <Avatar url={user.avatar} />
                    <div>
                      <p>{user.userName}</p>
                      <span className="text-black/60 text-sm">
                        {formatToReadableDate(user.seenAt)} at{" "}
                        {formatTo12HourTime(user.seenAt)}
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
                <ReadIndicator read={false} />
                <p>Delivered to</p>
              </div>
              <ul>
                {deliveredTo.map((user, i) => (
                  <li key={i} className="flex gap-4 items-center">
                    <Avatar url={user.avatar} />
                    <div>
                      <p>{user.userName}</p>
                      <span className="text-black/60 text-sm">
                        {formatToReadableDate(user.deliveredAt)} at{" "}
                        {formatTo12HourTime(user.deliveredAt)}
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
