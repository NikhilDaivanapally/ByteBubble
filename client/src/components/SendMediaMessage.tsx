import { LuSend, LuSmile } from "react-icons/lu";
import React, { useCallback, useEffect, useRef, useState } from "react";
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

const SendMediaMessage = () => {
  const dispatch = useDispatch();
  const [isEmojiPickerActive, setIsEmojiPickerActive] = useState(false);
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { _id: auth_id }: any = useSelector(
    (state: RootState) => state.auth.user
  );

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

  let userList: {}[] = [];

  if (
    group_chat.current_group_conversation?.users?.length > 0 &&
    group_chat.current_group_conversation?.admin
  ) {
    userList = [
      ...group_chat.current_group_conversation?.users,
      group_chat.current_group_conversation?.admin,
    ]
      .filter((el) => el._id !== auth_id)
      .map((el) => el._id);
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [
    direct_chat?.current_direct_messages,
    group_chat?.current_group_messages,
    activeChatId,
  ]);
  console.log(mediaPreviewUrls);
  // handle send message
  const handleSendMediaMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const to =
      chatType === "individual"
        ? direct_chat?.current_direct_conversation?.userId
        : userList;

    const messageId = crypto.randomUUID();
    const messageCreatedAt = new Date().toISOString();

    chatType === "individual"
      ? dispatch(
          addDirectMessage({
            id: messageId,
            type: "photo",
            message: {
              photoUrl: mediaPreviewUrls?.slice(-1)[0].url,
              description: message,
            },
            createdAt: messageCreatedAt,
            updatedAt: messageCreatedAt,
            incoming: false,
            outgoing: true,
            status: "pending",
            seen: false,
          })
        )
      : dispatch(
          addGroupMessage({
            id: messageId,
            type: "photo",
            message: {
              photoUrl: mediaPreviewUrls?.slice(-1)[0].url,
              description: message,
            },
            conversationId: activeChatId,
            createdAt: messageCreatedAt,
            updatedAt: messageCreatedAt,
            incoming: false,
            outgoing: true,
            status: "pending",
            seen: false,
          })
        );
    console.log({
      _id: messageId,
      sender: auth_id,
      recipients: to,
      messageType: "photo",
      message: {
        file: mediaPreviewUrls,
        text: message,
      },
      conversationType:
        chatType == "individual" ? "OneToOneMessage" : "OneToManyMessage",
      conversationId: activeChatId,
      createdAt: messageCreatedAt,
      updatedAt: messageCreatedAt,
    });
    socket.emit("media_message", {
      _id: messageId,
      sender: auth_id,
      recipients: to,
      messageType: "photo",
      message: {
        file: mediaPreviewUrls,
        text: message,
      },
      conversationType:
        chatType == "individual" ? "OneToOneMessage" : "OneToManyMessage",
      conversationId: activeChatId,
      createdAt: messageCreatedAt,
      updatedAt: messageCreatedAt,
    });
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
        <LuSmile
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
            emojiStyle="native" // or "google", "apple", etc.
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
        <LuSend className="text-xl" />
      </button>
    </form>
  );
};

export default SendMediaMessage;
