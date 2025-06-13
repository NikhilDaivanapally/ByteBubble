import React, { useEffect, useMemo, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { AnimatePresence, motion } from "motion/react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Icons } from "../../icons";
import {
  addDirectMessage,
  addGroupMessage,
} from "../../store/slices/conversation";
import { socket } from "../../socket";
import { group, individual } from "../../utils/conversation-types";
import {
  updateMediaFiles,
  updateMediaPreviewUrls,
  updateOpenCamera,
} from "../../store/slices/appSlice";
import { parseFiles } from "../../utils/parse-files";
import useTypingStatus from "../../hooks/use-typing-status";

const TextInputForm = ({
  handleRecording,
}: {
  handleRecording: () => void;
}) => {
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const [isEmojiPickerActive, setIsEmojiPickerActive] = useState(false);
  const [isAttachementActive, setIsAttachementActive] = useState(false);

  const { activeChatId, chatType } = useSelector(
    (state: RootState) => state.app
  );
  const { direct_chat, group_chat } = useSelector(
    (state: RootState) => state.conversation
  );
  const auth = useSelector((state: RootState) => state.auth.user);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const currentConversation = useMemo(() => {
    if (chatType === "individual") {
      return direct_chat.current_direct_conversation?.userId;
    }
    const groupUsers = group_chat?.current_group_conversation?.users || [];
    const admin = group_chat?.current_group_conversation?.admin;
    return [...groupUsers, admin]
      .filter((u) => u?._id !== auth?._id)
      .map((u) => u?._id);
  }, [chatType, direct_chat, group_chat]);

  const userList = useMemo(() => {
    const users = group_chat?.current_group_conversation?.users || [];
    const admin = group_chat?.current_group_conversation?.admin;
    return [...users, admin]
      .filter((u) => u?._id !== auth?._id)
      .map((u) => u?._id);
  }, [group_chat]);

  const { handleTyping } = useTypingStatus(
    socket,
    activeChatId,
    { auth_id: auth?._id, userName: auth?.userName },
    chatType,
    currentConversation
  );

  const containsUrl = (text: string) => /(https?:\/\/[^\s]+)/gi.test(text);

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 130) + "px";
    }
  };

  useEffect(() => {
    autoResize();
  }, []);

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.focus();
  }, [
    direct_chat.current_direct_messages,
    group_chat.current_group_messages,
    activeChatId,
  ]);

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) return;
    const messageId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const messagePayload = {
      _id: messageId,
      messageType: containsUrl(message) ? "link" : "text",
      message: { text: message },
      conversationId: activeChatId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    if (chatType === "individual") {
      dispatch(
        addDirectMessage({
          ...messagePayload,
          conversationType: individual,
          isIncoming: false,
          isOutgoing: true,
          status: "pending",
          isSeen: false,
        })
      );
      socket.emit("message:send", {
        ...messagePayload,
        senderId: auth?._id,
        recipientId: direct_chat.current_direct_conversation?.userId,
        conversationType: individual,
      });
    } else {
      dispatch(
        addGroupMessage({
          ...messagePayload,
          conversationType: group,
          isIncoming: false,
          isOutgoing: true,
          status: "pending",
          isSeen: [],
        })
      );
      socket.emit("group:message:send", {
        ...messagePayload,
        senderId: auth?._id,
        recipientsIds: userList,
        conversationType: group,
      });
    }

    setMessage("");
  };

  const handleEmojiClick = (emoji: any) => {
    setMessage((prev) => prev + emoji.emoji);
    setIsEmojiPickerActive(false);
  };

  const attachementsArray = [
    {
      icon: <Icons.DocumentIcon className="w-5 text-violet-400" />,
      title: "Documents",
      accept: ".pdf, .doc, .docx, .xls, .xlsx",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateMediaFiles(e.target.files));
      },
    },
    {
      icon: <Icons.PhotoIcon className="w-5 text-blue-400" />,
      title: "Photos & Videos",
      accept: "image/*",
      onChange: async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        setIsAttachementActive(false);
        const filesArray = Object.values(files);
        dispatch(updateMediaFiles(filesArray));
        const parsed = await parseFiles(filesArray);
        dispatch(updateMediaPreviewUrls(parsed));
      },
    },
    {
      icon: <Icons.CameraIcon className="w-5 text-red-400" />,
      title: "Camera",
      onClick: () => {
        dispatch(updateOpenCamera(true));
        setIsAttachementActive(false);
      },
    },
  ];

  return (
    <form
      onSubmit={handleSendMessage}
      className="w-full flex items-center gap-1 md:gap-3 p-1 md:p-1 bg-light mt-4 max-w-3xl rounded-lg md:rounded-xl mx-auto"
    >
      <textarea
        value={message}
        rows={1}
        placeholder="write your message"
        className="resize-none flex-1 w-full pl-2 placeholder:tracking-normal outline-none"
        ref={textareaRef}
        onChange={(e) => {
          setMessage(e.target.value);
          autoResize();
          handleTyping();
        }}
      />

      <div className="p-1 relative cursor-pointer rounded-lg text-black/60">
        <Icons.SmileIcon
          className="text-xl select-none"
          onClick={() => setIsEmojiPickerActive((prev) => !prev)}
        />
        <div className="absolute bottom-[160%] right-0 translate-x-1/4 md:right-full z-60 bg-gray-300">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            autoFocusSearch={false}
            skinTonesDisabled={true}
            searchDisabled={false}
            lazyLoadEmojis={true}
            height={370}
            width={320}
            open={isEmojiPickerActive}
            previewConfig={{ showPreview: false }}
            style={{ backgroundColor: "white" }}
          />
        </div>
      </div>

      <div className="p-1 relative cursor-pointer rounded-lg text-black/60">
        <Icons.AttachmentIcons
          className="text-xl"
          onClick={() => setIsAttachementActive((prev) => !prev)}
        />
        <AnimatePresence>
          {isAttachementActive && (
            <motion.div
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              exit={{ scaleY: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-2 rounded-md space-y-1 origin-bottom absolute bottom-[160%] right-0 translate-x-1/4 md:right-full z-60 bg-gray-300"
            >
              <ul>
                {attachementsArray.map((el, i) => (
                  <li key={i} className="list-none">
                    {el.onChange ? (
                      <label className="flex gap-2 p-2 text-sm text-nowrap rounded-md transition-all hover:bg-gray-200 cursor-pointer">
                        {el.icon}
                        <span>{el.title}</span>
                        <input
                          type="file"
                          hidden
                          accept={el.accept}
                          multiple
                          onChange={el.onChange}
                        />
                      </label>
                    ) : (
                      <div
                        className="flex gap-2 p-2 text-sm text-nowrap rounded-md transition-all hover:bg-gray-200 cursor-pointer"
                        onClick={el.onClick}
                      >
                        {el.icon}
                        <span>{el.title}</span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        className="p-1 cursor-pointer rounded-lg text-black/60"
        onClick={handleRecording}
      >
        <Icons.MicPrimary className="text-xl" />
      </div>

      <button
        type="submit"
        className="p-3 cursor-pointer bg-btn-primary text-white rounded-lg"
      >
        <Icons.SendIcon className="text-xl" />
      </button>
    </form>
  );
};

export default TextInputForm;
