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
  updateMediaFilePreviews,
  updateMediaFiles,
} from "../store/slices/appSlice";
import { Icons } from "../icons";
import { direct, group } from "../utils/conversation-types";
import { ObjectId } from "bson";
import {
  ensurePdfJsLoaded,
  generatePdfThumbnail,
} from "../utils/generate-pdf-thumbnail";
import { useUploadMessageFileMutation } from "../store/slices/api";
import { getAudioMetadata } from "../utils/get-audio-metadata";

const SendMediaMessage: React.FC = () => {
  const dispatch = useDispatch();
  const [isEmojiPickerActive, setIsEmojiPickerActive] = useState(false);
  const [message, setMessage] = useState("");
  const [firstPagePreviewUrl, setFirstPagePreviewUrl] = useState<string | null>(
    null
  );
  const [isPdfJsLoading, setIsPdfJsLoading] = useState<boolean>(true);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const auth = useSelector((state: RootState) => state.auth.user);
  const { activeChatId, chatType, mediaFiles, mediaFilePreviews } = useSelector(
    (state: RootState) => state.app
  );
  const file = mediaFiles && Array.isArray(mediaFiles) && mediaFiles[0];

  // load PDF.js
  useEffect(() => {
    ensurePdfJsLoaded()
      .then(() => setIsPdfJsLoading(false))
      .catch((err) => {
        console.error("Failed to initialize PDF.js:", err);
        setIsPdfJsLoading(false);
      });
  }, []);
 
  // generate thumbanil for pdf
  const generatePdfThumbnailWrapper = useCallback(async () => {
    if (!file || file.type !== "application/pdf") return;
    try {
      const imageUrl = await generatePdfThumbnail(file);
      if (imageUrl) {
        setFirstPagePreviewUrl(imageUrl);
      } else {
        throw new Error(
          "Failed to generate thumbnail. Please ensure it is a valid PDF file."
        );
      }
    } catch (error) {
      console.error("Error in generating PDF thumbnail:", error);
    }
  }, [file]);

  useEffect(() => {
    if (!isPdfJsLoading && (file as File)?.type === "application/pdf") {
      generatePdfThumbnailWrapper();
    }
  }, [mediaFiles, isPdfJsLoading, generatePdfThumbnailWrapper]);

  const { direct_chat, group_chat } = useSelector(
    (state: RootState) => state.conversation
  );

  const [uploadMedia] = useUploadMessageFileMutation();

  const lastMedia = useMemo(
    () => mediaFilePreviews?.slice(-1)[0],
    [mediaFilePreviews]
  );
  const fileType = lastMedia?.file?.type || "";
  const fileName = lastMedia?.file?.name || "";
  const fileExt = fileName.split(".").pop()?.toLowerCase() || "";

  const userList = useMemo(() => {
    const users = group_chat?.current_group_conversation?.users || [];
    return users.filter((u) => u?._id !== auth?._id).map((u) => u?._id);
  }, [group_chat, auth?._id]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [
    direct_chat?.current_direct_messages,
    group_chat?.current_group_messages,
    activeChatId,
  ]);

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

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(e.target.value);
      autoResize();
    },
    []
  );

  const handleToggleEmojiPicker = useCallback(() => {
    setIsEmojiPickerActive((prev) => !prev);
  }, []);

  const handleEmojiClick = useCallback(
    (emoji: any) => {
      setMessage((prev) => prev + emoji.emoji);
      handleToggleEmojiPicker();
    },
    [handleToggleEmojiPicker]
  );

  const buildMediaMessage = async () => {
    if (!fileType || !lastMedia?.url) return null;

    if (fileType.startsWith("image/")) {
      return {
        messageType: "image",
        message: { imageUrl: lastMedia.url, description: message },
      };
    }

    if (fileType.startsWith("audio/")) {
      const audioMetadata = await getAudioMetadata(lastMedia.file, auth?._id);
      return {
        messageType: "audio",
        message: {
          fileId: lastMedia.url,
          fileName: lastMedia.file.name,
          fileType: lastMedia.file.type,
          size: lastMedia.file.size,
          duration: audioMetadata?.duration,
          source: "uploaded",
        },
      };
    }

    if (fileType.startsWith("video/")) {
      return {
        messageType: "video",
        message: { videoUrl: lastMedia.url, description: message },
      };
    }

    if (
      fileType.startsWith("application/pdf") ||
      ["doc", "docx", "txt", "rtf", "xlsx", "zip"].includes(fileExt)
    ) {
      return {
        messageType: "document",
        message: {
          previewUrl: firstPagePreviewUrl,
          pdfPreviewUrl: lastMedia.url,
          fileId: null,
          fileName: lastMedia.file.name,
          fileType: lastMedia.file.type,
          size: lastMedia.file.size,
        },
      };
    }

    return null;
  };

  const handleSendMediaMessage = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!activeChatId || !auth || !lastMedia) return;

    const messageId = new ObjectId().toHexString();
    const timestamp = new Date().toISOString();
    const msgData: any = await buildMediaMessage();

    if (!msgData) return;

    const formData = new FormData();
    formData.append("file", lastMedia.file);

    if (lastMedia.file.type.startsWith("audio")) {
      formData.append("duration", msgData?.message.duration);
      formData.append("source", "uploaded");
    }

    setMessage("");
    dispatch(updateMediaFiles(null));
    dispatch(updateMediaFilePreviews(null));

    const commonPayload = {
      _id: messageId,
      status: "pending",
      isOutgoing: true,
      isEdited: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    if (chatType === direct) {
      const payload = {
        ...commonPayload,
        isIncoming: false,
        isRead: false,
        deletedFor: [],
        isDeletedForEveryone: false,
        reactions: [],
        conversationId: activeChatId,
        ...msgData,
      };
      dispatch(addDirectMessage(payload));
      const data = await uploadMedia(formData).unwrap();
      if (!data) return;
      socket.emit("message:send", {
        _id: messageId,
        message: data?.message,
        messageType: msgData?.messageType,
        conversationId: activeChatId,
        createdAt: timestamp,
        updatedAt: timestamp,
        senderId: auth._id,
        recipientId: direct_chat?.current_direct_conversation?.userId,
      });
    } else if (chatType === group) {
      const payload = {
        ...commonPayload,
        isIncoming: false,
        readBy: [],
        deletedFor: [],
        isDeletedForEveryone: [],
        reactions: [],
        conversationId: activeChatId,
        ...msgData,
      };
      dispatch(addGroupMessage(payload));
      const data = await uploadMedia(formData).unwrap();
      if (!data) return;
      socket.emit("group:message:send", {
        _id: messageId,
        message: data?.message,
        messageType: msgData?.messageType,
        conversationId: activeChatId,
        createdAt: timestamp,
        updatedAt: timestamp,
        senderId: auth._id,
        recipientsIds: userList,
        from: {
          _id: auth._id,
          userName: auth.userName,
          avatar: auth.avatar,
        },
      });
    }
  };

  return (
    <form
      onSubmit={handleSendMediaMessage}
      className="w-full flex items-center gap-1 md:gap-3 p-1 md:p-1 bg-light mt-4 max-w-3xl rounded-lg md:rounded-xl mx-auto"
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

        <div className="absolute bottom-[160%] right-0 translate-x-1/4 md:right-full z-60 bg-gray-300">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            autoFocusSearch={false}
            skinTonesDisabled
            searchDisabled={false}
            lazyLoadEmojis
            height={370}
            width={320}
            open={isEmojiPickerActive}
            previewConfig={{ showPreview: false }}
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
