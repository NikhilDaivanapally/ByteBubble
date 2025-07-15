import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Icons } from "../icons";
import { setDirectMessageInfo } from "../store/slices/appSlice";
import { RootState } from "../store/store";
import { formatTo12HourTime, formatToDayLabel } from "../utils/dateUtils";
import { DirectAudioMsg } from "./Chat/DirectChat/messages/AudioMsg";
import { DirectImageMsg } from "./Chat/DirectChat/messages/ImageMsg";
import { DirectTextMsg } from "./Chat/DirectChat/messages/TextMsg";
import DirectDocumentMsg from "./Chat/DirectChat/messages/documentMsg";
import { DirectLinkMsg } from "./Chat/DirectChat/messages/LinkMsg";
import ReadIndicator from "./ui/ReadIndicator";

const DirectMessageInfo = () => {
  const dispatch = useDispatch();
  const { current_direct_conversation } = useSelector(
    (state: RootState) => state.conversation.direct_chat
  );
  const directMessageInfo = useSelector(
    (state: RootState) => state.app.directMessageInfo
  );
  const from = current_direct_conversation?.name ?? "user";
  const message = useMemo(() => {
    switch (directMessageInfo?.messageType) {
      case "text":
        return <DirectTextMsg el={directMessageInfo} from={from} />;
      case "image":
        return (
          <DirectImageMsg
            el={directMessageInfo}
            scrollToBottom={() => {}}
            from={from}
          />
        );
      case "audio":
        return <DirectAudioMsg el={directMessageInfo} from={from} />;
      case "document":
        return (
          <DirectDocumentMsg
            el={directMessageInfo}
            from={from}
            scrollToBottom={() => {}}
          />
        );
      case "link":
        return <DirectLinkMsg el={directMessageInfo} from={from} />;
    }
  }, [directMessageInfo]);
  const handleClose = () => dispatch(setDirectMessageInfo(null));

  return (
    <AnimatePresence>
      {directMessageInfo && (
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

          <div>
            <div className="mb-2 flex items-center gap-2">
              <ReadIndicator read={true} />
              <p>Read</p>
            </div>
            {directMessageInfo?.readAt && (
              <span className="text-black/60 text-sm">
                {formatToDayLabel(directMessageInfo?.readAt)} at{" "}
                {formatTo12HourTime(directMessageInfo?.readAt)}
              </span>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <ReadIndicator read={false} />
              <p>Delivered</p>
            </div>
            <span className="text-black/60 text-sm">
              {formatToDayLabel(directMessageInfo?.createdAt)} at{" "}
              {formatTo12HourTime(directMessageInfo?.createdAt)}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DirectMessageInfo;
