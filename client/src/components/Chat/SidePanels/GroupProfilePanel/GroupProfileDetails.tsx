import { motion, AnimatePresence } from "motion/react";
import { useDispatch, useSelector } from "react-redux";
import React, { useMemo, useState, useCallback, useEffect } from "react";
import { RootState } from "../../../../store/store";
import {
  setCurrentGroupConversation,
  setfullImagePreview,
  updateGroupConversation,
} from "../../../../store/slices/conversation";
import { UserProps } from "../../../../types";
import { Icons } from "../../../../icons";
import GroupMediaPreviewSlider from "../MediaPreviewSlider/GroupMediaPreviewSlider";
import {
  setIsAddMembersActive,
  setIsGroupInfoActive,
} from "../../../../store/slices/appSlice";
import { Button } from "../../../ui/Button";
import { useUpdateGroupInfoMutation } from "../../../../store/slices/api";
import useGroupInfo from "../../../../hooks/use-group-info";
import { useFileUpload } from "../../../../hooks/use-file-upload";
import { MemberItem } from "../../../MemberItem";
import { GroupAvatar } from "../../../GroupAvatar";
import { EditableField } from "../../../EditableField";
import { socket } from "../../../../socket";
import { ObjectId } from "bson";

// Constants
const MEDIA_PREVIEW_LIMIT = 3;

// Types
interface GroupMember extends UserProps {
  isOnline: boolean;
  isAdmin: boolean;
  isGroupCreatedBy: boolean;
}

const MediaPreview: React.FC<{
  allMedia: any[];
  onShowAllMedia: () => void;
  onImageClick: (img: any) => void;
}> = ({ allMedia, onShowAllMedia, onImageClick }) => {
  const mediaPreview = useMemo(
    () => allMedia?.slice(0, MEDIA_PREVIEW_LIMIT),
    [allMedia]
  );

  return (
    <div className="space-y-4 py-2">
      <button
        onClick={onShowAllMedia}
        className="flex justify-between items-center text-sm text-black/60 cursor-pointer w-full text-left"
      >
        <span>Media, Audio, Links & Docs</span>
        <span className="flex gap-0.5 bg-gray-200 hover:bg-gray-300 transition duration-200 p-1 rounded-lg">
          {allMedia.length}
          <Icons.ArrowRightIcon className="w-4" />
        </span>
      </button>
      <div className="grid grid-cols-3 gap-2">
        {mediaPreview?.map((el, i) => (
          <img
            key={`img_${i}`}
            src={el?.message?.imageUrl}
            alt="Media"
            className="cursor-pointer rounded-md hover:opacity-80 transition-opacity"
            onClick={() => onImageClick(el)}
          />
        ))}
      </div>
    </div>
  );
};

// Main component
const GroupProfileDetails: React.FC = () => {
  const dispatch = useDispatch();
  const {
    current_group_conversation: currentConversation,
    current_group_messages: messages,
  } = useSelector((state: RootState) => state.conversation.group_chat);
  const auth = useSelector((state: RootState) => state.auth.user);
  const { isGroupInfoActive, activeChatId } = useSelector(
    (state: RootState) => state.app
  );

  const [showAllMedia, setShowAllMedia] = useState(false);
  const { groupInfo, setGroupInfo, avatarUrl, setAvatarUrl, hasChanges } =
    useGroupInfo(currentConversation);

  const handleImageUpload = useCallback(
    (file: File | null, blobUrl: string | null) => {
      setGroupInfo((prev) => ({ ...prev, avatar: file }));
      setAvatarUrl(blobUrl);
    },
    []
  );

  const {
    fileInputRef,
    handleFileChange,
    handleRemoveImage,
    triggerFileInput,
  } = useFileUpload(handleImageUpload);

  const [updateGroupInfo, { data, isLoading }] = useUpdateGroupInfoMutation();

  const isAdmin = useMemo(() => {
    return currentConversation?.admins?.includes(auth?._id as string);
  }, [currentConversation, auth]);

  const allMedia = useMemo(() => {
    return (
      messages
        ?.filter((msg) => msg?.messageType === "image")
        .sort((a, b) => Date.parse(b?.createdAt) - Date.parse(a?.createdAt)) ??
      []
    );
  }, [messages]);

  const groupMembers = useMemo(() => {
    return [...(currentConversation?.users || [])]
      .filter((user) => user?._id !== auth?._id)
      .map(
        (member): GroupMember => ({
          ...member,
          isOnline: member?.status === "Online",
          isAdmin: currentConversation?.admins?.includes(member._id) || false,
          isGroupCreatedBy: currentConversation?.createdBy?._id === member._id,
        })
      );
  }, [currentConversation, auth]);

  const currentUser = useMemo((): GroupMember | null => {
    if (!auth) return null;
    return {
      ...auth,
      isOnline: auth.status === "Online",
      isAdmin: currentConversation?.admins?.includes(auth._id) || false,
      isGroupCreatedBy: currentConversation?.createdBy?._id === auth._id,
    };
  }, [auth, currentConversation]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setGroupInfo((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleImageClick = useCallback(
    (img: (typeof allMedia)[number]) => {
      dispatch(setfullImagePreview({ fullviewImg: img }));
    },
    [dispatch]
  );

  const handleShowAllMedia = useCallback(() => setShowAllMedia(true), []);
  const handleCloseAllMedia = useCallback(() => setShowAllMedia(false), []);
  const handleOpen = useCallback(
    () => dispatch(setIsAddMembersActive(true)),
    [dispatch]
  );
  const handleCloseProfile = useCallback(
    () => dispatch(setIsGroupInfoActive(false)),
    [dispatch]
  );

  const handleSaveChanges = useCallback(() => {
    if (!hasChanges || !currentConversation) return;

    const formData = new FormData();
    if (groupInfo.avatar) formData.append("avatar", groupInfo.avatar);
    if (groupInfo.name !== currentConversation.name)
      formData.append("name", groupInfo.name);
    if (groupInfo.about !== currentConversation.about)
      formData.append("about", groupInfo.about);
    formData.append("conversationId", currentConversation._id || "");
    updateGroupInfo(formData);
  }, [hasChanges, groupInfo, currentConversation, updateGroupInfo]);

  useEffect(() => {
    if (!data?.data || !currentConversation || !auth) return;

    const { name, avatar, about } = data.data;

    const hasUpdate =
      name !== currentConversation.name ||
      avatar !== currentConversation.avatar ||
      about !== currentConversation.about;

    if (!hasUpdate) return;

    const updatedConversation = {
      ...currentConversation,
      name,
      avatar,
      about,
    };

    const recipients = (currentConversation?.users || [])
      .filter((el) => el?._id !== auth._id)
      .map((el) => el._id);

    const commonPayload = {
      sender: auth._id,
      recipients,
      messageType: "system",
      metadata: auth._id,
      eventUserSnapshot: {
        _id: auth._id,
        userName: auth.userName,
        avatar: auth.avatar,
      },
      conversationId: activeChatId,
    };

    const now = new Date().toISOString();
    const emitSystemEvent = (type: string) => {
      socket.emit(type, {
        ...commonPayload,
        _id: new ObjectId().toHexString(),
        systemEventType: type.split(":").slice(1).join("_"),
        createdAt: now,
        updatedAt: now,
      });
    };

    if (avatar && avatar !== currentConversation.avatar) {
      emitSystemEvent("system:group:icon:changed");
    }
    if (name !== currentConversation.name) {
      emitSystemEvent("system:group:renamed");
    }
    if (about !== currentConversation.about) {
      emitSystemEvent("system:group:description:updated");
    }

    dispatch(updateGroupConversation(updatedConversation));
    dispatch(setCurrentGroupConversation(updatedConversation));
    setGroupInfo({ avatar: null, name, about });
  }, [data?.data]);

  if (!currentConversation) return null;

  return (
    <AnimatePresence>
      {isGroupInfoActive && (
        <motion.div
          key="profile-panel"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="bg-white origin-right rounded-lg w-full xl:w-100 absolute top-0 right-0 z-10 md:relative h-full overflow-x-hidden scrollbar-custom flex-shrink-0 p-3.5"
        >
          {/* Header */}
          <div className="flex justify-between items-center">
            <button onClick={handleCloseProfile} aria-label="Close profile">
              <Icons.XMarkIcon className="w-8 p-1 rounded-full cursor-pointer hover:bg-gray-200 transition" />
            </button>
            {hasChanges && (
              <Button
                size="sm"
                onClick={handleSaveChanges}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save"}
              </Button>
            )}
          </div>

          <div className="space-y-4 divide-y divide-gray-300">
            {/* Group Avatar and Name */}
            <div className="flex flex-col items-center gap-4 py-2">
              <GroupAvatar
                avatarUrl={avatarUrl}
                currentConversation={currentConversation}
                isAdmin={!!isAdmin}
                onRemoveImage={handleRemoveImage}
                onTriggerFileInput={triggerFileInput}
              />
              <EditableField
                value={groupInfo.name}
                name="name"
                isAdmin={!!isAdmin}
                onChange={handleInputChange}
                className="text-center font-semibold"
                placeholder="Group name"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Upload image"
              />
            </div>

            {/* About */}
            <div className="py-2">
              <p className="text-sm text-black/60">About</p>
              <EditableField
                value={groupInfo.about}
                name="about"
                isAdmin={!!isAdmin}
                onChange={handleInputChange}
                className="text-center w-full justify-between"
                placeholder="Group description"
              />
            </div>

            {/* Media Preview */}
            <MediaPreview
              allMedia={allMedia}
              onShowAllMedia={handleShowAllMedia}
              onImageClick={handleImageClick}
            />

            {/* Members */}
            <div className="space-y-3 py-2">
              {/* Add Members */}
              {isAdmin && (
                <button
                  onClick={handleOpen}
                  className="w-full rounded-md flex gap-4 p-1 items-center cursor-pointer text-green-500 bg-green-50 hover:bg-green-100 transition-colors"
                >
                  <Icons.UserPlusIcon className="w-10 h-10 p-1.5" />
                  <div>
                    <p>Add members</p>
                  </div>
                </button>
              )}
              {/*  */}
              <p className="text-green-500 text-sm">
                {groupMembers.length + 1} members
              </p>
              {currentUser && (
                <MemberItem
                  member={currentUser}
                  isCurrentUser={true}
                  showActions={false}
                />
              )}
              {groupMembers.map((member) => (
                <MemberItem
                  key={member._id}
                  member={member}
                  isCurrentUser={false}
                  showActions={true}
                />
              ))}
            </div>

            {/* Exit Group */}
            <div className="py-2">
              <button className="text-red-400 hover:text-red-500 transition-colors">
                Exit from group
              </button>
            </div>
          </div>

          <GroupMediaPreviewSlider
            showAllMedia={showAllMedia}
            handleCloseAllMedia={handleCloseAllMedia}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(GroupProfileDetails);
