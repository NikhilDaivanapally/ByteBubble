import { RootState } from "../store/store";
import { GroupMessageProps } from "../types";
import { direct } from "./conversation-types";

type SenderProps = {
  _id: string;
  avatar: string | undefined;
  userName: string;
};

function getSenderFromGroup(
  el: GroupMessageProps,
  chatType: string,
  groupConversations: RootState["conversation"]["group_chat"]["GroupConversations"]
): SenderProps {
  let sender: SenderProps = { _id: "", avatar: "", userName: "" };

  if (chatType !== direct && !el.isOutgoing) {
    groupConversations?.forEach((conv) => {
      if (conv._id === el?.conversationId || conv._id === el?._id) {
        const foundUser = [...conv.users].find(
          (user) => el.from?._id === user?._id
        );
        if (foundUser) {
          sender = {
            _id: foundUser?._id,
            avatar: foundUser?.avatar,
            userName: foundUser.userName,
          };
        }
      }
    });
  }

  return sender;
}

export default getSenderFromGroup;
