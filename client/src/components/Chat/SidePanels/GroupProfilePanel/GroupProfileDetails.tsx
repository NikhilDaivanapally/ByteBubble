import { motion, AnimatePresence } from "motion/react";
import { useDispatch, useSelector } from "react-redux";
import React, { useMemo, useState, useCallback, useEffect } from "react";
import { RootState } from "../../../../store/store";
import { setfullImagePreview } from "../../../../store/slices/conversation";
import { UserProps } from "../../../../types";
import { Icons } from "../../../../icons";
import { group } from "../../../../utils/conversation-types";
import { Avatar } from "../../../ui/Avatar";
import { GroupActions } from "../../../ui/Dropdowns/actions/GroupActions";
import Dialog from "../../../ui/Dialog/Dialog";
import AddMembersToGroup from "./AddMembersToGroup";
import GroupMediaPreviewSlider from "../MediaPreviewSlider/GroupMediaPreviewSlider";

type Props = {
  showDetails: boolean;
  handleCloseShowDetails: () => void;
};

const GroupProfileDetails = ({
  showDetails,
  handleCloseShowDetails,
}: Props) => {
  const dispatch = useDispatch();

  const [isGroupAdmin, setIsGroupAdmin] = useState(false);
  const [showAllMedia, setShowAllMedia] = useState(false);
  const [isAddMember, setIsAddMember] = useState(false);

  const { group_chat } = useSelector((state: RootState) => state.conversation);
  const auth = useSelector((state: RootState) => state.auth.user);

  const currentConversation = group_chat.current_group_conversation;
  const messages = group_chat.current_group_messages;
  const imageSrc = currentConversation?.avatar ?? null;
  const name = currentConversation?.name ?? "";
  const about = currentConversation?.about ?? "";

  useEffect(() => {
    if (currentConversation?.admin?._id == auth?._id) {
      setIsGroupAdmin(true);
    }
  }, [currentConversation]);

  const allMedia = useMemo(() => {
    return (
      messages
        ?.filter((msg) => msg?.messageType === "image")
        .sort((a, b) => Date.parse(b?.createdAt) - Date.parse(a?.createdAt)) ??
      []
    );
  }, [messages]);

  const mediaPreview = useMemo(() => allMedia?.slice(0, 3), [allMedia]);

  const handleImageClick = useCallback(
    (img: (typeof allMedia)[number]) => {
      dispatch(setfullImagePreview({ fullviewImg: img }));
    },
    [dispatch]
  );

  const handleShowAllMedia = useCallback(() => setShowAllMedia(true), []);
  const handleCloseAllMedia = useCallback(() => setShowAllMedia(false), []);

  const groupMembers = [
    ...(currentConversation?.users || ([] as UserProps[])),
  ].filter((user) => user?._id !== auth?._id);

  const handleClose = useCallback(() => {
    setIsAddMember(false);
  }, []);

  return (
    <AnimatePresence>
      {showDetails && (
        <motion.div
          key="profile-panel"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="bg-white origin-right rounded-lg w-full xl:w-100 absolute top-0 right-0 z-10 md:relative h-full overflow-x-hidden scrollbar-custom flex-shrink-0 p-3.5"
        >
          <button onClick={handleCloseShowDetails}>
            <Icons.XMarkIcon className="w-8 p-1 rounded-full cursor-pointer hover:bg-gray-200 transition" />
          </button>

          <div className="space-y-4 divide-y divide-gray-300">
            <div className="flex flex-col items-center gap-4 py-2">
              <Avatar size="xl" url={imageSrc} fallBackType={group} />
              <div className="text-center">
                <p className="font-semibold">{name}</p>
                <p className="text-black/60 text-sm">Example@gmail.com</p>
              </div>
            </div>

            <div className="py-2">
              <p className="text-sm text-black/60">About</p>
              <p>{about}</p>
            </div>

            <div className="space-y-4 py-2">
              <div
                onClick={handleShowAllMedia}
                className="flex justify-between items-center text-sm text-black/60 cursor-pointer"
              >
                <p>Media, Audio , Links & Docs</p>
                <p className="flex gap-0.5 bg-gray-200 hover:bg-gray-300 transition duration-200 p-1 rounded-lg">
                  {allMedia.length}
                  <Icons.ArrowRightIcon className="w-4" />
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {mediaPreview?.map((el, i) => (
                  <img
                    key={`img_${i}`}
                    src={el?.message?.imageUrl}
                    alt="Media"
                    className="cursor-pointer"
                    onClick={() => handleImageClick(el)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3 py-2">
              <button
                onClick={() => setIsAddMember(true)}
                className="w-full rounded-md flex gap-4 p-1 items-center cursor-pointer text-green-500 bg-green-50 hover:bg-green-100"
              >
                <Icons.UserPlusIcon className="w-10 h-10 p-1.5" />
                <div className="">
                  <p>Add members</p>
                </div>
              </button>

              {/* you */}
              <div className="flex gap-4 items-center p-1 cursor-pointer rounded-md hover:bg-gray-100 group">
                <Avatar
                  url={auth?.avatar}
                  size="md"
                  online={auth?.status == "Online"}
                />
                <div className="">
                  <p>You</p>
                  <p className="text-black/60 text-sm">{auth?.about}</p>
                </div>
                {auth?._id == currentConversation?.admin?._id && (
                  <span className="text-xs text-green-600 p-1 ml-auto px-2 bg-green-100 rounded-full">
                    Group admin
                  </span>
                )}
                {auth?._id !== currentConversation?.admin?._id &&
                  isGroupAdmin && (
                    <div className="ml-auto">
                      <GroupActions member={auth} />
                    </div>
                  )}
              </div>

              {/*admin &&  group members */}
              {groupMembers?.map((member, i) => {
                const isOnline = member?.status === "Online";
                const isAdmin = member?._id == currentConversation?.admin?._id;
                return (
                  <div
                    key={i}
                    className="flex gap-4 items-center p-1 cursor-pointer rounded-md hover:bg-gray-100 group"
                  >
                    <Avatar url={member?.avatar} size="md" online={isOnline} />
                    <div className="">
                      <p>{member?.userName}</p>
                      <p className="text-black/60 text-sm">{member?.about}</p>
                    </div>
                    {isAdmin && (
                      <span className="text-xs text-green-600 p-1 ml-auto px-2 bg-green-100 rounded-full">
                        Group admin
                      </span>
                    )}
                    {!isAdmin && isGroupAdmin && (
                      <div className="ml-auto">
                        <GroupActions member={member || null} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="py-2">
              <button className="text-red-400">Exit from group</button>
            </div>
          </div>

          <GroupMediaPreviewSlider
            showAllMedia={showAllMedia}
            handleCloseAllMedia={handleCloseAllMedia}
          />
          <Dialog isOpen={isAddMember} onClose={handleClose}>
            <AddMembersToGroup onClose={handleClose} />
          </Dialog>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(GroupProfileDetails);
