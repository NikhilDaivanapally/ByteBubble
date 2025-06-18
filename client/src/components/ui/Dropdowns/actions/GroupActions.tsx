import { useDispatch, useSelector } from "react-redux";
import { AdaptiveDropdown } from "../AdaptiveDropdown";
import { UserProps } from "../../../../types";
import { RootState } from "../../../../store/store";
import { Icons } from "../../../../icons";
import {
  setCurrentGroupConversation,
  updateGroupConversation,
} from "../../../../store/slices/conversation";

export const GroupActions = ({ member }: { member: UserProps | null }) => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth.user);
  const { current_group_conversation } = useSelector(
    (state: RootState) => state.conversation.group_chat
  );

  const actions = [
    {
      name: "Make group admin",
      icon: <Icons.UserShield className="text-xl" />,
      action: () => {},
    },
    {
      name: "Remove",
      icon: <Icons.MinusCircleIcon className="w-4 text-red-600" />,
      className: "text-red-600",
      action: () => {
        // Remove user & update current Conversation
        // update GroupConversation
        const updatedConversation = {
          ...current_group_conversation,
          users: current_group_conversation?.users?.filter(
            (u) => u._id !== member?._id
          ),
        };
        dispatch(setCurrentGroupConversation(updatedConversation));
        dispatch(updateGroupConversation(updatedConversation));
        // make a socket event to remove user from database
      },
    },
  ];

  return (
    <AdaptiveDropdown actions={actions} className="">
      <Icons.ChevronDownIcon className="w-5 hover:text-gray-600" />
    </AdaptiveDropdown>
  );
};
