import { Icons } from "../icons";
import { group } from "../utils/conversation-types";
import { Avatar } from "./ui/Avatar";
import {motion} from 'motion/react'
export const GroupAvatar: React.FC<{
  avatarUrl: string | null;
  currentConversation: any;
  isAdmin: boolean;
  onRemoveImage: () => void;
  onTriggerFileInput: () => void;
}> = ({
  avatarUrl,
  currentConversation,
  isAdmin,
  onRemoveImage,
  onTriggerFileInput,
}) => (
  <div className="size-20 relative rounded-full">
    {!avatarUrl ? (
      <Avatar
        size="2xl"
        url={currentConversation?.avatar}
        fallBackType={group}
      />
    ) : (
      <motion.img
        src={avatarUrl}
        alt="Uploaded"
        className="w-full h-full rounded-full object-cover"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    )}
    {isAdmin && (
      <>
        {avatarUrl && (
          <motion.button
            type="button"
            onClick={onRemoveImage}
            className="absolute cursor-pointer -top-2 -right-4 bg-red-100 rounded-full p-1 shadow-sm border border-red-200 hover:bg-red-200 transition-colors"
            whileHover={{ scale: 1.1 }}
            aria-label="Remove image"
          >
            <Icons.XMarkIcon className="text-red-500 w-4" />
          </motion.button>
        )}
        <motion.button
          type="button"
          className="absolute -bottom-2 -right-4 bg-white rounded-full p-1 shadow-sm border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
          onClick={onTriggerFileInput}
          whileHover={{ scale: 1.1 }}
          aria-label="Upload image"
        >
          <Icons.CameraIcon className="text-gray-500 w-4" />
        </motion.button>
      </>
    )}
  </div>
);