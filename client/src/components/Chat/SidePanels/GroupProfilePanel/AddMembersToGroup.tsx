import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../store/store";
import { useCallback, useMemo, useState } from "react";
import { UserProps } from "../../../../types";
import { Icons } from "../../../../icons";
import Input from "../../../ui/Input";
import { Button } from "../../../ui/Button";
import { Avatar } from "../../../ui/Avatar";
import { socket } from "../../../../socket";
import {
  setCurrentGroupConversation,
  updateGroupConversation,
} from "../../../../store/slices/conversation";

type AddMembersToGroupProps = {
  onClose: () => void;
};
const AddMembersToGroup = ({ onClose }: AddMembersToGroupProps) => {
  const dispatch = useDispatch();
  const [selectedMembers, setSelectedMembers] = useState<UserProps[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [errors, setErrors] = useState<{ members?: string }>({});
  const { friends } = useSelector((state: RootState) => state.app);
  const user = useSelector((state: RootState) => state.auth.user);
  const { current_group_conversation } = useSelector(
    (state: RootState) => state.conversation.group_chat
  );
  const filteredMembers = useMemo(() => {
    return friends?.filter((member) =>
      member.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [friends, searchQuery]);

  const toggleMember = useCallback(
    (member: UserProps) => {
      const isSelected = selectedMembers?.some((m) => m._id === member._id);

      if (isSelected) {
        setSelectedMembers(
          selectedMembers?.filter((m) => m._id !== member._id)
        );
      } else {
        setSelectedMembers([...selectedMembers, member]);
      }
    },
    [selectedMembers]
  );

  const handleAddMembers = () => {
    // validate form
    const newErrors: { members?: string } = {};

    if (selectedMembers.length === 0) {
      newErrors.members = "Please select at least one member";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    socket.emit("group:add:members", {
      _id: current_group_conversation?._id,
      senderId: user?._id,
      members: selectedMembers,
    });
    
    const updatedConversation = {
      ...current_group_conversation,
      users: [...(current_group_conversation?.users as []), ...selectedMembers],
    };
    dispatch(updateGroupConversation(updatedConversation));
    dispatch(setCurrentGroupConversation(updatedConversation));
    onClose();
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <p className="font-semibold flex gap-2 items-center">
          <Icons.UsersIcon className="w-5" />
          Add Members
        </p>
        {selectedMembers?.length ? (
          <span className="text-xs bg-btn-primary/20 text-btn-primary p-1 px-1.5 rounded-full">
            {selectedMembers.length} selected
          </span>
        ) : (
          <></>
        )}
      </div>
      {/* Selected members pills */}
      {selectedMembers.length > 0 && (
        <div className="flex flex-wrap items-start gap-2 p-1.5 max-h-30 overflow-y-auto bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          {selectedMembers.map((member) => (
            <div
              key={member._id}
              className="flex items-center text-btn-primary gap-1 bg-btn-primary/20 p-1 pr-2 rounded-full shadow-sm max-h-10"
            >
              <Avatar size="xs" url={member?.avatar} />
              <span className="max-w-[100px] truncate text-sm">
                {member.userName}
              </span>
              <button
                type="button"
                onClick={() => toggleMember(member)}
                className="rounded-full hover:bg-btn-primary/20 cursor-pointer p-0.5"
              >
                <Icons.XMarkIcon className="w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search input */}

      <Input
        type="text"
        name="search members"
        className="border-gray-300"
        startIcon={<Icons.MagnifyingGlassIcon className="w-5 text-gray-500" />}
        placeholder="Search members"
        value={searchQuery}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearchQuery(e.target.value)
        }
      />

      {errors?.members && (
        <p className="mt-1 text-sm text-red-600" id="members-error">
          {errors?.members}
        </p>
      )}

      {/* Member list */}
      <div className="relative mt-2">
        <div className="max-h-120 overflow-auto z-10 bg-white border-gray-300 rounded-md">
          {filteredMembers?.length > 0 ? (
            <ul className="py-1">
              {filteredMembers.map((member) => {
                const isSelected = selectedMembers.some(
                  (m) => m._id === member._id
                );

                return (
                  <li
                    key={member._id}
                    className={`
                          "w-full flex items-center px-3 py-2 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer
                          ${isSelected ? "bg-indigo-50" : ""}
                        `}
                    onClick={() => toggleMember(member)}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium mr-3">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.userName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        member.userName.charAt(0).toUpperCase()
                      )}
                    </div>

                    <span className="flex-1">{member.userName}</span>

                    {/* {isSelected ? (
                          <Icons.CheckIcon className="text-indigo-600 w-5" />
                        ) : (
                          <Icons.UserPlusIcon className="text-gray-400 w-5" />
                        )} */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-btn-primary border-btn-primary"
                          : "border-gray-300 hover:border-btn-primary"
                      }`}
                    >
                      {isSelected && (
                        <Icons.CheckIcon className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-3 py-6 text-center text-gray-500">
              <p>No members found</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-3 w-fit ml-auto">
        <Button variant="ghost" size="sm" shape="md" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          shape="md"
          onClick={handleAddMembers}
        >
          Add Members
        </Button>
      </div>
    </div>
  );
};

export default AddMembersToGroup;
