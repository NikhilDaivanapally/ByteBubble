import { useSelector } from "react-redux";
import { AdaptiveDropdown } from "../AdaptiveDropdown";
import { UserProps } from "../../../../types";
import { RootState } from "../../../../store/store";
import { Icons } from "../../../../icons";
import useGroupActions from "../../../../hooks/use-group-actions";

export const GroupActions = ({ member }: { member: UserProps | null }) => {
  const { current_group_conversation } = useSelector(
    (state: RootState) => state.conversation.group_chat
  );
  const isAdmin = current_group_conversation?.admins.includes(
    member?._id as string
  );

  const { handleAdminAction, handleUserRemoveAction } = useGroupActions(member);

  const actions = [
    {
      name: isAdmin ? "Dismiss as admin" : "Make group admin",
      icon: <Icons.UserShield className="text-xl" />,
      action: handleAdminAction,
    },
    {
      name: "Remove",
      icon: <Icons.MinusCircleIcon className="w-4 text-red-600" />,
      className: "text-red-600",
      action: handleUserRemoveAction,
    },
  ];

  return (
    <AdaptiveDropdown actions={actions} className="">
      <Icons.ChevronDownIcon className="w-5 hover:text-gray-600" />
    </AdaptiveDropdown>
  );
};
