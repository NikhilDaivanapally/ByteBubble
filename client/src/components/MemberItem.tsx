import { UserProps } from "../types";
import { Avatar } from "./ui/Avatar";
import { GroupActions } from "./ui/Dropdowns/actions/GroupActions";

interface GroupMember extends UserProps {
  isOnline: boolean;
  isAdmin: boolean;
  isGroupCreatedBy: boolean;
}

export const MemberItem: React.FC<{
  member: GroupMember;
  isCurrentUser: boolean;
  showActions?: boolean;
}> = ({ member, isCurrentUser, showActions = false }) => (
  <div className="flex gap-4 p-1 cursor-pointer rounded-md hover:bg-gray-100 group">
    <div className="flex gap-4 items-center">
      <Avatar url={member?.avatar} size="md" online={member.isOnline} />
      <div>
        <p>{isCurrentUser ? "You" : member?.userName}</p>
        <p className="text-black/60 text-sm">{member?.about}</p>
      </div>
    </div>
    <div className="ml-auto h-full flex flex-col">
      <div className="space-x-1">
        {member.isGroupCreatedBy && (
          <span className="text-[10px] md:text-xs text-blue-600 p-1 ml-auto px-2 bg-blue-100 rounded-full">
            Created By
          </span>
        )}
        {member.isAdmin && (
          <span className="text-[10px] md:text-xs text-green-600 p-1 ml-auto px-2 bg-green-100 rounded-full">
            Group admin
          </span>
        )}
      </div>
      {showActions && !member.isGroupCreatedBy && (
        <div className="self-end">
          <GroupActions member={member || null} />
        </div>
      )}
    </div>
  </div>
);
