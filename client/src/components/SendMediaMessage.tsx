import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import EmojiPicker from "emoji-picker-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import {
  addDirectMessage,
  addGroupMessage,
} from "../store/slices/conversation";
import { socket } from "../socket";
import {
  updateMediaFiles,
  updateMediaPreviewUrls,
} from "../store/slices/appSlice";
import { Icons } from "../icons";
import { direct, group } from "../utils/conversation-types";
import { ObjectId } from "bson";

const SendMediaMessage = () => {
  const dispatch = useDispatch();
  const [isEmojiPickerActive, setIsEmojiPickerActive] = useState(false);
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const auth = useSelector((state: RootState) => state.auth.user);

  const { activeChatId, chatType, mediaPreviewUrls } = useSelector(
    (state: RootState) => state.app
  );
  const { direct_chat, group_chat } = useSelector(
    (state: RootState) => state.conversation
  );
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(e.target.value);
      autoResize();
    },
    []
  );

  const handleToggleEmojiPicker = useCallback(
    () => setIsEmojiPickerActive((prev) => !prev),
    []
  );

  // handle the emoji select
  const handleEmojiClick = useCallback((emoji: any) => {
    console.log(typeof emoji);
    setMessage((prev) => prev + emoji.emoji);
    handleToggleEmojiPicker();
  }, []);

  const userList = useMemo(() => {
    const users = group_chat?.current_group_conversation?.users || [];
    return users.filter((u) => u?._id !== auth?._id).map((u) => u?._id);
  }, [group_chat]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [
    direct_chat?.current_direct_messages,
    group_chat?.current_group_messages,
    activeChatId,
  ]);

  // handle send message
  const handleSendMediaMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const messageId = new ObjectId().toHexString();
    const timestamp = new Date().toISOString();

    switch (chatType) {
      case direct:
        dispatch(
          addDirectMessage({
            _id: messageId,
            messageType: "image",
            message: {
              imageUrl: mediaPreviewUrls?.slice(-1)[0].url,
              description: message,
            },
            isIncoming: false,
            isOutgoing: true,
            status: "pending",
            isRead: false,
            conversationId: activeChatId,
            deletedFor: [],
            isDeletedForEveryone: false,
            reactions: [],
            isEdited: false,
            createdAt: timestamp,
            updatedAt: timestamp,
          })
        );

        socket.emit("message:send", {
          _id: messageId,
          messageType: "image",
          message: {
            file: mediaPreviewUrls,
            text: message,
          },
          conversationId: activeChatId,
          createdAt: timestamp,
          updatedAt: timestamp,
          senderId: auth?._id,
          recipientId: direct_chat?.current_direct_conversation?.userId,
        });

        break;
      case group:
        dispatch(
          addGroupMessage({
            _id: messageId,
            messageType: "image",
            message: {
              imageUrl: mediaPreviewUrls?.slice(-1)[0].url,
              description: message,
            },
            isIncoming: false,
            isOutgoing: true,
            status: "pending",
            readBy: [],
            conversationId: activeChatId,
            deletedFor: [],
            isDeletedForEveryone: [],
            reactions: [],
            isEdited: false,
            createdAt: timestamp,
            updatedAt: timestamp,
          })
        );
        socket.emit("group:message:send", {
          _id: messageId,
          messageType: "image",
          message: {
            file: mediaPreviewUrls,
            text: message,
          },
          conversationId: activeChatId,
          createdAt: timestamp,
          updatedAt: timestamp,
          senderId: auth?._id,
          recipientsIds: userList,
          from: {
            _id: auth?._id,
            userName: auth?.userName,
            avatar: auth?.avatar,
          },
        });
        break;
    }

    setMessage("");
    dispatch(updateMediaFiles(null));
    dispatch(updateMediaPreviewUrls(null));
  };

  // handle emit typing and stop typing events
  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 130) + "px"; // 150px = max height
    }
  };

  useEffect(() => {
    autoResize();
  }, []);

  return (
    <form
      onSubmit={handleSendMediaMessage}
      className="w-full flex items-center gap-1 md:gap-3 p-1 md:p-1 bg-light mt-4  max-w-3xl rounded-lg md:rounded-xl mx-auto"
    >
      <textarea
        value={message}
        rows={1}
        placeholder="write your message"
        className="resize-none flex-1 w-full pl-2 placeholder:tracking-normal outline-none"
        ref={textareaRef}
        onChange={handleInputChange}
      />

      <div className="p-1 relative cursor-pointer rounded-lg text-black/60">
        <Icons.SmileIcon
          className="text-xl select-none"
          onClick={handleToggleEmojiPicker}
        />

        {/* Emoji picker */}
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
            previewConfig={{
              showPreview: false,
            }}
            // theme="light"
            style={{ backgroundColor: "white" }}
          />
        </div>
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

export default SendMediaMessage;
