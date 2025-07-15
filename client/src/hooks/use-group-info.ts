import { useEffect, useMemo, useState } from "react";

interface GroupInfo {
  avatar: File | null;
  name: string;
  about: string;
}

interface GroupConversation {
  _id?: string;
  name?: string;
  about?: string;
  avatar?: string;
}

const useGroupInfo = (currentConversation: GroupConversation | null) => {
  const [groupInfo, setGroupInfo] = useState<GroupInfo>({
    avatar: null,
    name: "",
    about: "",
  });

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Sync groupInfo when conversation changes (only on ID change)
  useEffect(() => {
    if (!currentConversation?._id) return;

    setGroupInfo((prev) => {
      // Only update if different
      if (
        prev.name === (currentConversation.name || "") &&
        prev.about === (currentConversation.about || "") &&
        prev.avatar === null
      ) {
        return prev;
      }

      return {
        avatar: null,
        name: currentConversation.name || "",
        about: currentConversation.about || "",
      };
    });
  }, [currentConversation?._id]); // Safer dependency

  // Handle local avatar preview URL
  useEffect(() => {
    if (groupInfo.avatar) {
      const blobUrl = URL.createObjectURL(groupInfo.avatar);
      setAvatarUrl(blobUrl);

      return () => {
        URL.revokeObjectURL(blobUrl);
      };
    } else {
      setAvatarUrl(null);
    }
  }, [groupInfo.avatar]);

  // Detect changes compared to currentConversation
  const hasChanges = useMemo(() => {
    if (!currentConversation) return false;

    return (
      groupInfo.avatar !== null ||
      groupInfo.name !== (currentConversation.name || "") ||
      groupInfo.about !== (currentConversation.about || "")
    );
  }, [groupInfo, currentConversation]);

  return {
    groupInfo,
    setGroupInfo,
    avatarUrl,
    setAvatarUrl,
    hasChanges,
  };
};

export default useGroupInfo;
