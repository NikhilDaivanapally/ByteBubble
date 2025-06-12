import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../store/store";
import React, { useMemo, useCallback, useState } from "react";
import { Icons } from "../../../icons";
import { Avatar } from "../../ui/Avatar";
import ShowMedia from "../../ShowMedia";
import { setfullImagePreview } from "../../../store/slices/conversation";

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

  const { direct_chat } = useSelector((state: RootState) => state.conversation);

  const currentConversation = direct_chat.current_direct_conversation;
  const messages = direct_chat.current_direct_messages;

  const imageSrc = currentConversation?.avatar ?? null;
  const name = currentConversation?.name ?? "";
  const about = currentConversation?.about ?? "";
  const isOnline = currentConversation?.isOnline ?? false;

  const allMedia = useMemo(() => {
    return (
      messages
        ?.filter((msg) => msg.messageType === "photo")
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
                fallBackType="individual"
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
                className="flex justify-between items-center text-sm text-black/60"
              >
                <p>Media, Audio , Links & Docs</p>
                <p className="flex gap-0.5 bg-gray-200 hover:bg-gray-300 transition duration-200 p-1 rounded-lg">
                  {allMedia.length}
                  <Icons.ArrowRightIcon className="w-4" />
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {mediaPreview.map((img, i) => (
                  <img
                    key={i}
                    src={img.message.photoUrl}
                    alt="media"
                    onClick={() => handleImageClick(img)}
                    className="cursor-pointer"
                  />
                ))}
              </div>
            </div>
          </div>
          <ShowMedia
            showAllMedia={showAllMedia}
            handleCloseAllMedia={handleCloseAllMedia}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(DirectProfileDetails);
