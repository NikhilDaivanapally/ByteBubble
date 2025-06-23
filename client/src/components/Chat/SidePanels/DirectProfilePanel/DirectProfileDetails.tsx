import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import React, { useMemo, useCallback, useState } from "react";
import { RootState } from "../../../../store/store";
import {
  addDirectMessage,
  setfullImagePreview,
} from "../../../../store/slices/conversation";
import { Icons } from "../../../../icons";
import { Avatar } from "../../../ui/Avatar";
import { direct } from "../../../../utils/conversation-types";
import DirectMediaPreviewSlider from "../MediaPreviewSlider/DirectMediaPreviewSlider";
import {
  blockUser,
  removeFromBlockList,
} from "../../../../store/slices/authSlice";
import { ObjectId } from "bson";
import { DirectSystemEventType } from "../../../../constants/system-event-types";
import { socket } from "../../../../socket";

type Props = {
  showDetails: boolean;
  handleCloseShowDetails: () => void;
};

const DirectProfileDetails = ({
  showDetails,
  handleCloseShowDetails,
}: Props) => {
  const dispatch = useDispatch();
  const [showAllMedia, setShowAllMedia] = useState(false);
  const { activeChatId } = useSelector((state: RootState) => state.app);
  const { direct_chat } = useSelector((state: RootState) => state.conversation);
  const auth = useSelector((state: RootState) => state.auth.user);
  const currentConversation = direct_chat.current_direct_conversation;
  const messages = direct_chat.current_direct_messages;
  const imageSrc = currentConversation?.avatar ?? null;
  const name = currentConversation?.name ?? "";
  const about = currentConversation?.about ?? "";
  const isOnline = currentConversation?.isOnline ?? false;

  const allMedia = useMemo(() => {
    return (
      messages
        ?.filter((msg) => msg.messageType === "image" && msg.message?.imageUrl)
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)) ?? []
    );
  }, [messages]);

  const mediaPreview = useMemo(() => allMedia.slice(0, 3), [allMedia]);

  const handleImageClick = useCallback(
    (img: (typeof allMedia)[number]) => {
      dispatch(setfullImagePreview({ fullviewImg: img }));
    },
    [dispatch]
  );

  const handleShowAllMedia = useCallback(() => setShowAllMedia(true), []);
  const handleCloseAllMedia = useCallback(() => setShowAllMedia(false), []);

  const isBlocked = useMemo(() => {
    return auth?.blockedUsers?.some(
      (id) => id?.toString?.() === currentConversation?.userId?.toString?.()
    );
  }, [auth?.blockedUsers, currentConversation?.userId]);

  const attachments = useMemo(
    () => [
      {
        icon: (
          <Icons.NoSymbolIcon
            className={`w-5 ${isBlocked ? "text-green-500" : "text-red-500"}`}
          />
        ),
        title: isBlocked ? "Unblock" : "Block",
        className: isBlocked ? "text-green-500" : "text-red-500",
        onClick: () => {
          const messageId = new ObjectId().toHexString();
          const timestamp = new Date().toISOString();
          if (!isBlocked && auth?.blockedUsers && currentConversation) {
            const messagePayload = {
              _id: messageId,
              messageType: "system",
              systemEventType: DirectSystemEventType.USER_BLOCKED, // user_blocked
              metadata: auth?._id,
              eventUserSnapshot: {
                _id: currentConversation?.userId,
                userName: currentConversation?.name,
                avatar: currentConversation?.avatar,
              },
              conversationId: activeChatId,
              createdAt: timestamp,
              updatedAt: timestamp,
            };
            dispatch(
              addDirectMessage({
                ...messagePayload,
                isIncoming: false,
                isOutgoing: false,
                status: "sent",
                isRead: false,
                deletedFor: [],
                isDeletedForEveryone: false,
                reactions: [],
                isEdited: false,
              })
            );
            socket.emit("system:user:block", {
              ...messagePayload,
              senderId: auth?._id,
              recipientId: currentConversation?.userId,
            });
            dispatch(blockUser(currentConversation.userId));
          } else if (isBlocked) {
            const messagePayload = {
              _id: messageId,
              messageType: "system",
              systemEventType: DirectSystemEventType.USER_UNBLOCKED, // user_unblocked
              metadata: auth?._id,
              eventUserSnapshot: {
                _id: currentConversation?.userId,
                userName: currentConversation?.name,
                avatar: currentConversation?.avatar,
              },
              conversationId: activeChatId,
              createdAt: timestamp,
              updatedAt: timestamp,
            };
            dispatch(
              addDirectMessage({
                ...messagePayload,
                isIncoming: false,
                isOutgoing: true,
                status: "sent",
                isRead: false,
                deletedFor: [],
                isDeletedForEveryone: false,
                reactions: [],
                isEdited: false,
              })
            );
            socket.emit("system:user:unblock", {
              ...messagePayload,
              senderId: auth?._id,
              recipientId: currentConversation?.userId,
            });
            dispatch(removeFromBlockList(currentConversation?.userId));
          }
        },
      },
      {
        icon: <Icons.DeleteIcon className="text-lg text-red-500" />,
        title: "Delete",
        className: "text-red-500",
        onClick: () => {
          // TODO: delete logic
        },
      },
    ],
    [isBlocked, currentConversation?.userId, dispatch]
  );

  return (
    <AnimatePresence>
      {showDetails && (
        <motion.div
          key="direct-profile"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="bg-white rounded-lg w-full xl:w-100 absolute top-0 right-0 z-10 md:relative h-full overflow-x-hidden scrollbar-custom flex-shrink-0 p-3.5"
        >
          <button onClick={handleCloseShowDetails}>
            <Icons.XMarkIcon className="w-8 p-1 rounded-full cursor-pointer hover:bg-gray-200 transition" />
          </button>

          <div className="space-y-4 divide-y divide-gray-300">
            <div className="flex flex-col items-center gap-4 py-2">
              <Avatar
                size="xl"
                url={imageSrc}
                online={isOnline}
                fallBackType={direct}
              />
              <div className="text-center">
                <p className="font-semibold">{name}</p>
                <p className="text-black/60 text-sm">example@gmail.com</p>
              </div>
            </div>
            <div className="py-2">
              <p className="text-sm text-black/60">About</p>
              <p>{about}</p>
            </div>
            <div className="space-y-4 py-2">
              <div
                onClick={handleShowAllMedia}
                className="flex justify-between items-center text-sm text-black/60 cursor-pointer"
              >
                <p>Media, Audio, Links & Docs</p>
                <p className="flex gap-0.5 bg-gray-200 hover:bg-gray-300 transition duration-200 p-1 rounded-lg">
                  {allMedia.length}
                  <Icons.ArrowRightIcon className="w-4" />
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {mediaPreview.map((img, i) => (
                  <img
                    key={i}
                    src={img.message.imageUrl}
                    alt="media"
                    onClick={() => handleImageClick(img)}
                    className="cursor-pointer object-cover rounded"
                  />
                ))}
              </div>
            </div>
            <ul>
              {attachments.map(({ icon, title, className, onClick }, i) => (
                <li
                  key={i}
                  onClick={onClick}
                  className={`list-none flex items-center font-semibold gap-2 p-2 text-sm rounded-md hover:bg-gray-100 cursor-pointer ${className}`}
                >
                  {icon}
                  <span>{title}</span>
                </li>
              ))}
            </ul>
          </div>
          <DirectMediaPreviewSlider
            showAllMedia={showAllMedia}
            handleCloseAllMedia={handleCloseAllMedia}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(DirectProfileDetails);
