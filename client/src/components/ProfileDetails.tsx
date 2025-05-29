import { motion, AnimatePresence } from "motion/react";
import { Icons } from "../icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { setfullImagePreview } from "../store/slices/conversation";
import { useState } from "react";
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
  const isGroup = chatType === "group";
  const imageSrc = isIndividual
    ? direct_chat?.current_direct_conversation?.avatar
    : isGroup
    ? group_chat?.current_group_conversation?.groupImage
    : null;

  const FallbackIcon = isIndividual ? Icons.UserIcon : Icons.UsersIcon;
  const about = isIndividual
    ? direct_chat?.current_direct_conversation?.about
    : isGroup
    ? group_chat?.current_group_conversation?.about
    : null;
  const messages = isIndividual
    ? direct_chat?.current_direct_messages
    : group_chat.current_group_messages;
  const AllMediaImgs = messages
    ?.filter((el) => el.type == "photo")
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const MediaImgs = AllMediaImgs.slice(0, 3);
  const handleShowAllMedia = () => {
    setShowAllMedia(true);
  };
  const handleCloseAllMedia = () => {
    setShowAllMedia(false);
  };
  return (
    <>
      <AnimatePresence>
        {showDetails && (
          <motion.div
            key="profile-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              duration: 0.25,
              ease: "easeInOut",
            }}
            className="bg-white origin-right rounded-lg w-full xl:w-100 absolute top-0 right-0 z-10 md:relative h-full overflow-hidden flex-shrink-0 p-3.5"
          >
            <button onClick={handleCloseShowDetails}>
              <Icons.XMarkIcon className="w-8 p-1 rounded-full cursor-pointer hover:bg-gray-200 transition" />
            </button>
            <div className="space-y-4">
              {/* Profile Image and Detail section */}
              <div className="flex flex-col items-center gap-4">
                {/* Image */}
                <div className="w-24 h-24 relative">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      className="w-full h-full rounded-full object-cover"
                      alt=""
                    />
                  ) : (
                    <FallbackIcon className="w-8" />
                  )}
                  {direct_chat?.current_direct_conversation?.online && (
                    <span className="w-2 h-2 absolute bottom-0 right-0 bg-green-600 rounded-full" />
                  )}
                </div>
                <div className="text-center">
                  <p className="font-semibold">
                    {direct_chat.current_direct_conversation?.name}
                  </p>
                  <p className="text-black/60 text-sm">Example@gmail.com</p>
                </div>
              </div>
              {/* About section */}
              <div className="">
                <p className="text-sm text-black/60">About</p>
                <p>{about}</p>
              </div>

              {/* Media , audio , Docs  */}
              <div className="space-y-4">
                <div
                  onClick={handleShowAllMedia}
                  className="flex justify-between items-center text-sm text-black/60"
                >
                  <p>Media, Audio , Links & Docs</p>
                  <p className="flex gap-0.5 bg-gray-200 hover:bg-gray-300 transition duration-200 cursor-pointer p-1 rounded-lg">
                    10
                    <Icons.ArrowRightIcon className="w-4" />
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {MediaImgs.map((el, i) => (
                    <img
                      key={`img_${i}`}
                      src={el?.message?.photoUrl}
                      alt=""
                      className="cursor-pointer"
                      onClick={() =>
                        dispatch(setfullImagePreview({ fullviewImg: el }))
                      }
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
    </>
  );
};

export default ProfileDetails;
