import { motion, AnimatePresence } from "motion/react";
import { Icons } from "../icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { setfullImagePreview } from "../store/slices/conversation";
import React, { useMemo, useState, useCallback } from "react";
import ShowMedia from "./ShowMedia";

type ProfileDetailsProps = {
  showDetails: boolean;
  handleCloseShowDetails: () => void;
};

const ProfileDetails = ({
  showDetails,
  handleCloseShowDetails,
}: ProfileDetailsProps) => {
  const [showAllMedia, setShowAllMedia] = useState(false);
  const dispatch = useDispatch();

  const { chatType } = useSelector((state: RootState) => state.app);
  const { direct_chat, group_chat } = useSelector(
    (state: RootState) => state.conversation
  );

  const isIndividual = chatType === "individual";

  const currentConversation = isIndividual
    ? direct_chat?.current_direct_conversation
    : group_chat?.current_group_conversation;

  const messages = isIndividual
    ? direct_chat?.current_direct_messages
    : group_chat?.current_group_messages;

  const imageSrc = currentConversation?.avatar ?? null;
  const name = currentConversation?.name ?? "";
  const about = currentConversation?.about ?? "";

  // Inline narrowing for `isOnline`:
  const isOnline =
    isIndividual && currentConversation && "isOnline" in currentConversation
      ? currentConversation.isOnline ?? false
      : false;

  const FallbackIcon = isIndividual ? Icons.UserIcon : Icons.UsersIcon;

  const AllMediaImgs = useMemo(() => {
    return (
      messages
        ?.filter((el) => el.messageType === "photo")
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)) ?? []
    );
  }, [messages]);

  const MediaImgs = useMemo(() => AllMediaImgs.slice(0, 3), [AllMediaImgs]);

  const handleShowAllMedia = useCallback(() => setShowAllMedia(true), []);
  const handleCloseAllMedia = useCallback(() => setShowAllMedia(false), []);

  const handleImageClick = useCallback(
    (img: (typeof AllMediaImgs)[number]) => {
      dispatch(setfullImagePreview({ fullviewImg: img }));
    },
    [dispatch]
  );

  return (
    <AnimatePresence>
      {showDetails && (
        <motion.div
          key="profile-panel"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="bg-white origin-right rounded-lg w-full xl:w-100 absolute top-0 right-0 z-10 md:relative h-full overflow-hidden flex-shrink-0 p-3.5"
        >
          <button onClick={handleCloseShowDetails}>
            <Icons.XMarkIcon className="w-8 p-1 rounded-full cursor-pointer hover:bg-gray-200 transition" />
          </button>

          <div className="space-y-4">
            {/* Profile Image and Detail section */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 relative">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    className="w-full h-full rounded-full object-cover"
                    alt="Profile"
                  />
                ) : (
                  <FallbackIcon className="w-8" />
                )}
                {isOnline && (
                  <span className="w-2 h-2 absolute bottom-0 right-0 bg-green-600 rounded-full" />
                )}
              </div>
              <div className="text-center">
                <p className="font-semibold">{name}</p>
                <p className="text-black/60 text-sm">Example@gmail.com</p>
              </div>
            </div>

            {/* About section */}
            <div>
              <p className="text-sm text-black/60">About</p>
              <p>{about}</p>
            </div>

            {/* Media, audio, docs */}
            <div className="space-y-4">
              <div
                onClick={handleShowAllMedia}
                className="flex justify-between items-center text-sm text-black/60 cursor-pointer"
              >
                <p>Media, Audio , Links & Docs</p>
                <p className="flex gap-0.5 bg-gray-200 hover:bg-gray-300 transition duration-200 p-1 rounded-lg">
                  {AllMediaImgs.length}
                  <Icons.ArrowRightIcon className="w-4" />
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {MediaImgs.map((el, i) => (
                  <img
                    key={`img_${i}`}
                    src={el?.message?.photoUrl}
                    alt="Media"
                    className="cursor-pointer"
                    onClick={() => handleImageClick(el)}
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

export default React.memo(ProfileDetails);
