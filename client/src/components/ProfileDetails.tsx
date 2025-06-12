import { motion, AnimatePresence } from "motion/react";
import { Icons } from "../icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { setfullImagePreview } from "../store/slices/conversation";
import React, { useMemo, useState, useCallback, useEffect } from "react";
import ShowMedia from "./ShowMedia";
import { Avatar } from "./ui/Avatar";
import { DirectConversationProps, GroupConversationProps, UserProps } from "../types";
import Dialog from "./Dialog/Dialog";
import AddMembersToGroup from "./AddMembersToGroup";
import { GroupActions } from "./Dropdowns/actions/GroupActions";

type ProfileDetailsProps = {
  showDetails: boolean;
  handleCloseShowDetails: () => void;
};

const ProfileDetails = ({
  showDetails,
  handleCloseShowDetails,
}: ProfileDetailsProps) => {
  const dispatch = useDispatch();

  const [isGroupAdmin, setIsGroupAdmin] = useState(false);
  const [showAllMedia, setShowAllMedia] = useState(false);
  const [isAddMember, setIsAddMember] = useState(false);

  const { chatType } = useSelector((state: RootState) => state.app);
  const { direct_chat, group_chat } = useSelector(
    (state: RootState) => state.conversation
  );
  const auth = useSelector((state: RootState) => state.auth.user);

  const currentConversation =
    chatType === "individual"
      ? direct_chat?.current_direct_conversation as DirectConversationProps
      : group_chat?.current_group_conversation as GroupConversationProps;

  useEffect(() => {
    if (currentConversation?.admin?._id == auth?._id) {
      setIsGroupAdmin(true);
    }
  }, [currentConversation]);

  const messages =
    chatType === "individual"
      ? direct_chat?.current_direct_messages
      : group_chat?.current_group_messages;

  const imageSrc = currentConversation?.avatar ?? null;
  const name = currentConversation?.name ?? "";
  const about = currentConversation?.about ?? "";

  // Inline narrowing for `isOnline`:
  const isOnline =
    chatType === "individual" &&
    currentConversation &&
    "isOnline" in currentConversation
      ? currentConversation.isOnline ?? false
      : false;

  const AllMediaImgs = useMemo(() => {
    return (
      messages
        ?.filter((el) => el?.messageType === "photo")
        .sort((a, b) => Date.parse(b?.createdAt) - Date.parse(a?.createdAt)) ?? []
    );
  }, [messages]);

  const MediaImgs = useMemo(() => AllMediaImgs?.slice(0, 3), [AllMediaImgs]);

  const handleShowAllMedia = useCallback(() => setShowAllMedia(true), []);
  const handleCloseAllMedia = useCallback(() => setShowAllMedia(false), []);

  const handleImageClick = useCallback(
    (img: (typeof AllMediaImgs)[number]) => {
      dispatch(setfullImagePreview({ fullviewImg: img }));
    },
    [dispatch]
  );

  const groupMembers = [
    currentConversation?.admin,
    ...(currentConversation?.users as UserProps[]),
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
            {/* Profile Image and Detail section */}
            <div className="flex flex-col items-center gap-4 py-2">
              <Avatar
                size="xl"
                url={imageSrc}
                online={isOnline}
                fallBackType={chatType}
              />
              <div className="text-center">
                <p className="font-semibold">{name}</p>
                <p className="text-black/60 text-sm">Example@gmail.com</p>
              </div>
            </div>

            {/* About section */}
            <div className="py-2">
              <p className="text-sm text-black/60">About</p>
              <p>{about}</p>
            </div>

            {/* Media, audio, docs */}
            <div className="space-y-4 py-2">
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
                {MediaImgs?.map((el, i) => (
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

            <div className="space-y-3 py-2">
              <button
                onClick={() => setIsAddMember(true)}
                className="w-full rounded-md flex gap-4 p-1 items-center cursor-pointer text-green-500 bg-green-50 hover:bg-green-100"
              >
                {/* <Avatar url={""} size="md" online={auth?.status == "Online"} /> */}
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
                      <GroupActions member={auth}  />
                    </div>
                  )}
              </div>

              {/*admin &&  group members */}
              {groupMembers?.map((member) => {
                const isOnline = member?.status === "Online";
                const isAdmin = member?._id == currentConversation?.admin?._id;
                return (
                  <div className="flex gap-4 items-center p-1 cursor-pointer rounded-md hover:bg-gray-100 group">
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
                        <GroupActions member={member} />
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

          <ShowMedia
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

export default React.memo(ProfileDetails);
