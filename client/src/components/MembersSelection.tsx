import { useState } from "react";
import { UserProps } from "../types";
import { Icons } from "../icons";

type MembersSelectionProps = {
  availableMembers: UserProps[];
  selectedMembers: UserProps[];
  onChange: (members: UserProps[]) => void;
  error?: string;
};

const MembersSelection = ({
  availableMembers,
  selectedMembers,
  onChange,
  error,
}: MembersSelectionProps) => {
  console.log(error);
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleMember = (member: UserProps) => {
    const isSelected = selectedMembers.some((m) => m._id === member._id);

    if (isSelected) {
      onChange(selectedMembers.filter((m) => m._id !== member._id));
    } else {
      onChange([...selectedMembers, member]);
    }
  };

  const filteredMembers = availableMembers.filter((member) =>
    member.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <label className="block text-sm font-medium text-gray-700">
          Members
        </label>
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
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium mr-1">
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
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icons.MagnifyingGlassIcon className="text-gray-400 w-5" />
        </div>

        <input
          type="text"
          className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm
    border transition-all duration-200
    rounded-md focus:outline-none ring-1 ring-transparent
   focus:ring-btn-primary
    ${error ? "border-red-300" : "border-gray-300"}
    ${isExpanded ? "rounded-b-none" : ""}
  `}
          placeholder="Search members"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsExpanded(true)}
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600" id="members-error">
          {error}
        </p>
      )}

      {/* Member list */}
      {isExpanded && (
        <div className="relative -mt-2">
          <div className="max-h-46 overflow-auto z-10 bg-white border border-t-0 border-gray-300 rounded-b-md shadow-md">
            {filteredMembers.length > 0 ? (
              <ul className="py-1">
                {filteredMembers.map((member) => {
                  const isSelected = selectedMembers.some(
                    (m) => m._id === member._id
                  );

                  return (
                    <li
                      key={member._id}
                      className={`
                        "w-full flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer
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
          <div className="p-2 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {selectedMembers.length} member
              {selectedMembers.length !== 1 ? "s" : ""} selected
            </span>

            <button
              type="button"
              className="text-xs text-indigo-600 cursor-pointer hover:text-indigo-800"
              onClick={() => setIsExpanded(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersSelection;
