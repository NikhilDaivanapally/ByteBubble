import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Icons } from "../icons";
import { setDirectMessageInfo } from "../store/slices/appSlice";
import { RootState } from "../store/store";
import { formatTo12HourTime, formatToDayLabel } from "../utils/dateUtils";
import { DirectAudioMsg } from "./Chat/DirectChat/messages/AudioMsg";
import { DirectImageMsg } from "./Chat/DirectChat/messages/ImageMsg";
import { DirectSystemMsg } from "./Chat/DirectChat/messages/SystemMsg";
import { DirectTextMsg } from "./Chat/DirectChat/messages/TextMsg";

const DirectMessageInfo = () => {
  const dispatch = useDispatch();
  const directMessageInfo = useSelector(
    (state: RootState) => state.app.directMessageInfo
  );
  console.log(directMessageInfo);
  const message = useMemo(() => {
    switch (directMessageInfo?.messageType) {
      case "image":
        return (
          <DirectImageMsg el={directMessageInfo} scrollToBottom={() => {}} />
        );
      case "audio":
        return <DirectAudioMsg el={directMessageInfo} />;
      case "system":
        return <DirectSystemMsg el={directMessageInfo} />;
      case "text":
        return <DirectTextMsg el={directMessageInfo} />;
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
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-green-600" />
                <div className="w-2 h-2 rounded-full bg-green-600" />
              </div>
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
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-300" />
                <div className="w-2 h-2 rounded-full bg-gray-300" />
              </div>
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
