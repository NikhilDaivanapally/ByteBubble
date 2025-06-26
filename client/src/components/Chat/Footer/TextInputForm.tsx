import {
  useEffect,
  useMemo,
  useRef,
  useState,
  FormEvent,
  ChangeEvent,
} from "react";
import EmojiPicker from "emoji-picker-react";
import { AnimatePresence, motion } from "motion/react";
import { useDispatch, useSelector } from "react-redux";
import { ObjectId } from "bson";

import { RootState } from "../../../store/store";
import { direct } from "../../../utils/conversation-types";
import useTypingStatus from "../../../hooks/use-typing-status";
import { socket } from "../../../socket";
import {
  addDirectMessage,
  addGroupMessage,
} from "../../../store/slices/conversation";
import {
  updateMediaFiles,
  updateMediaPreviewUrls,
  updateOpenCamera,
} from "../../../store/slices/appSlice";
import { parseFiles } from "../../../utils/parse-files";
import { Icons } from "../../../icons";
import useClickOutside from "../../../hooks/use-clickoutside";
import { Button } from "../../ui/Button";
import { removeFromBlockList } from "../../../store/slices/authSlice";
import { DirectSystemEventType } from "../../../constants/system-event-types";
import { playSound } from "../../../utils/soundPlayer";

const MAX_TEXTAREA_HEIGHT = 130;

const TextInputForm = ({
  handleRecording,
}: {
  handleRecording: () => void;
}) => {
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const [isEmojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [isAttachmentVisible, setAttachmentVisible] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const attachmentRef = useRef<HTMLDivElement>(null);

  const { activeChatId, chatType } = useSelector(
    (state: RootState) => state.app
  );
  const { direct_chat, group_chat } = useSelector(
    (state: RootState) => state.conversation
  );
  const auth = useSelector((state: RootState) => state.auth.user);
  const isDirect = chatType === direct;
  const userList = useMemo(() => {
    const users = group_chat?.current_group_conversation?.users || [];
    return users.filter((u) => u?._id !== auth?._id).map((u) => u?._id);
  }, [group_chat, auth?._id]);

  const currentConversation = useMemo(() => {
    return isDirect
      ? direct_chat.current_direct_conversation?.userId
      : userList;
  }, [isDirect, direct_chat, userList]);

  const { handleTyping } = useTypingStatus(
    socket,
    activeChatId,
    {
      auth_id: auth?._id,
      userName: auth?.userName,
    },
    chatType,
    currentConversation
  );

  const containsUrl = (text: string) => /(https?:\/\/[^\s]+)/gi.test(text);

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        MAX_TEXTAREA_HEIGHT
      )}px`;
    }
  };
  useEffect(autoResize, []);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [
    direct_chat.current_direct_messages,
    group_chat.current_group_messages,
    activeChatId,
  ]);

  const handleSendMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) return;

    const messageId = new ObjectId().toHexString();
    const timestamp = new Date().toISOString();
    const messageType = containsUrl(message) ? "link" : "text";
    const messagePayload = {
      _id: messageId,
      messageType,
      message: { text: message },
      conversationId: activeChatId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    if (isDirect) {
      dispatch(
        addDirectMessage({
          ...messagePayload,
          isIncoming: false,
          isOutgoing: true,
          status: "pending",
          isRead: false,
          deletedFor: [],
          isDeletedForEveryone: false,
          reactions: [],
          isEdited: false,
        })
      );
      
      socket.emit("message:send", {
        ...messagePayload,
        senderId: auth?._id,
        recipientId: currentConversation,
      });
      playSound("messageSend");
    } else {
      dispatch(
        addGroupMessage({
          ...messagePayload,
          isIncoming: false,
          isOutgoing: true,
          status: "pending",
          readBy: [],
          deletedFor: [],
          isDeletedForEveryone: [],
          reactions: [],
          isEdited: false,
        })
      );

      socket.emit("group:message:send", {
        ...messagePayload,
        senderId: auth?._id,
        recipientsIds: userList,
        from: {
          _id: auth?._id,
          userName: auth?.userName,
          avatar: auth?.avatar,
        },
      });
    }

    setMessage("");
  };

  const handleEmojiClick = (emoji: any) => {
    setMessage((prev) => prev + emoji.emoji);
    setEmojiPickerVisible(false);
  };

  const attachments = [
    {
      icon: <Icons.DocumentIcon className="w-5 text-violet-400" />,
      title: "Documents",
      accept: ".pdf, .doc, .docx, .xls, .xlsx",
      onChange: (e: ChangeEvent<HTMLInputElement>) => {
        dispatch(updateMediaFiles(e.target.files));
      },
    },
    {
      icon: <Icons.PhotoIcon className="w-5 text-blue-400" />,
      title: "Photos & Videos",
      accept: "image/*",
      onChange: async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        setAttachmentVisible(false);
        const fileArray = Array.from(files);
        dispatch(updateMediaFiles(fileArray));
        const previewUrls = await parseFiles(fileArray);
        dispatch(updateMediaPreviewUrls(previewUrls));
      },
    },
    {
      icon: <Icons.CameraIcon className="w-5 text-red-400" />,
      title: "Camera",
      onClick: () => {
        dispatch(updateOpenCamera(true));
        setAttachmentVisible(false);
      },
    },
  ];

  useClickOutside(
    [emojiRef, attachmentRef],
    () => {
      setEmojiPickerVisible(false);
      setAttachmentVisible(false);
    },
    { closeOnEscape: true }
  );
  const isConversationBlocked = useMemo(() => {
    if (auth && direct_chat.current_direct_conversation) {
      return auth?.blockedUsers.includes(
        direct_chat?.current_direct_conversation?.userId
      );
    }
    return false;
  }, [auth, direct_chat.current_direct_conversation]);

  if (isConversationBlocked) {
    return (
      <div className="w-full flex items-center justify-center gap-10 p-1 mt-4">
        <Button
          variant="danger-outline"
          shape="full"
          size="sm"
          icon={<Icons.DeleteIcon className="w-4 text-gree-500" />}
          className="shadow-2xl"
        >
          Delete Chat
        </Button>
        <Button
          variant="success-outline"
          shape="full"
          size="sm"
          icon={<Icons.NoSymbolIcon className="w-4 text-gree-500" />}
          onClick={() => {
            dispatch(
              removeFromBlockList(
                direct_chat.current_direct_conversation?.userId
              )
            );
          }}
        >
          Unblock
        </Button>
      </div>
    );
  }
  if (
    direct_chat.current_direct_messages.at(-1)?.systemEventType ==
    DirectSystemEventType.USER_BLOCKED
  ) {
    return (
      <div className="w-full flex items-center justify-center gap-10 p-1 mt-4">
        <div className="flex items-center gap-2">
          <Icons.NoSymbolIcon className="w-4" />
          you have been blocked by this user
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSendMessage}
      className="w-full flex items-center gap-1 md:gap-3 p-1 md:p-1 bg-light mt-4 max-w-3xl rounded-lg md:rounded-xl mx-auto"
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          autoResize();
          handleTyping();
        }}
        placeholder="Write your message"
        className="resize-none flex-1 w-full pl-2 placeholder:tracking-normal outline-none"
      />

      {/* Emoji Picker */}
      <div
        ref={emojiRef}
        className="p-1 relative cursor-pointer rounded-lg text-black/60"
      >
        <Icons.SmileIcon
          onClick={() => setEmojiPickerVisible(!isEmojiPickerVisible)}
          className="text-xl select-none"
        />
        {isEmojiPickerVisible && (
          <div className="absolute bottom-[160%] right-0 translate-x-1/4 md:right-full z-60 bg-gray-300">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              autoFocusSearch={false}
              skinTonesDisabled
              searchDisabled={false}
              lazyLoadEmojis
              height={370}
              width={320}
              open={isEmojiPickerVisible}
              previewConfig={{ showPreview: false }}
              style={{ backgroundColor: "white" }}
            />
          </div>
        )}
      </div>

      {/* Attachments */}
      <div
        ref={attachmentRef}
        className="p-1 relative cursor-pointer rounded-lg text-black/60"
      >
        <Icons.AttachmentIcons
          className="text-xl"
          onClick={() => setAttachmentVisible(true)}
        />
        <AnimatePresence>
          {isAttachmentVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="p-2 rounded-md space-y-1 origin-bottom absolute bottom-[160%] right-0 translate-x-1/4 md:right-full z-60 bg-gray-300 shadow-lg"
            >
              <ul className="whitespace-nowrap">
                {attachments.map(
                  ({ icon, title, accept, onChange, onClick }, i) => (
                    <li key={i} className="list-none">
                      {onChange ? (
                        <label className="flex gap-2 p-2 text-sm rounded-md hover:bg-gray-200 cursor-pointer">
                          {icon}
                          <span>{title}</span>
                          <input
                            type="file"
                            hidden
                            accept={accept}
                            multiple
                            onChange={onChange}
                          />
                        </label>
                      ) : (
                        <div
                          className="flex gap-2 p-2 text-sm rounded-md hover:bg-gray-200 cursor-pointer"
                          onClick={onClick}
                        >
                          {icon}
                          <span>{title}</span>
                        </div>
                      )}
                    </li>
                  )
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mic Button */}
      <div
        className="p-1 cursor-pointer rounded-lg text-black/60"
        onClick={handleRecording}
      >
        <Icons.MicPrimary className="text-xl" />
      </div>

      {/* Send Button */}
      <button
        type="submit"
        className="p-3 bg-btn-primary text-white rounded-lg"
      >
        <Icons.SendIcon className="text-xl" />
      </button>
    </form>
  );
};

export default TextInputForm;
