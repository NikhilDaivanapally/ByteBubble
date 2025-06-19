import { useDispatch, useSelector } from "react-redux";
import { AdaptiveDropdown } from "../AdaptiveDropdown";
import { UserProps } from "../../../../types";
import { RootState } from "../../../../store/store";
import { Icons } from "../../../../icons";
import {
  setCurrentGroupConversation,
  updateGroupConversation,
} from "../../../../store/slices/conversation";
import { socket } from "../../../../socket";

export const GroupActions = ({ member }: { member: UserProps | null }) => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth.user);
  const { current_group_conversation } = useSelector(
    (state: RootState) => state.conversation.group_chat
  );
  const { activeChatId } = useSelector((state: RootState) => state.app);

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

        let userList = [
          ...(current_group_conversation?.users || []),
          current_group_conversation?.admin,
        ]
          .filter((el: UserProps | undefined) => el?._id !== auth?._id)
          .map((el) => el?._id);
        const messageId = crypto.randomUUID();
        const messageCreatedAt = new Date().toISOString();
        socket.emit("system:user:removed", {
          _id: messageId,
          senderId: auth?._id,
          recipientsIds: userList,
          messageType: "system",
          systemEventType: "user_removed",
          metadata: member?._id,
          eventUserSnapshot: {
            _id: member?._id,
            userName: member?.userName,
            avatar: member?.avatar,
          },
          conversationId: activeChatId,
          createdAt: messageCreatedAt,
          updatedAt: messageCreatedAt,
        });
      },
    },
  ];

  return (
    <AdaptiveDropdown actions={actions} className="">
      <Icons.ChevronDownIcon className="w-5 hover:text-gray-600" />
    </AdaptiveDropdown>
  );
};
