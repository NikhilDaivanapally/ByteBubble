import { RootState } from "../store/store";
import { GroupMessageProps } from "../types";

type SenderProps = { _id: string; avatar: string; userName: string };

function getSenderFromGroup(
  el: GroupMessageProps,
  chatType: string,
  groupConversations: RootState["conversation"]["group_chat"]["GroupConversations"]
): SenderProps {
  let sender: SenderProps = { _id: "", avatar: "", userName: "" };

  if (chatType !== "individual" && !el.isOutgoing) {
    groupConversations?.forEach((conv) => {
      if (conv._id === el?.conversationId || conv._id === el?._id) {
        const foundUser = [...conv.users, conv.admin].find(
          (user) => el.from === user?._id
        );
        if (foundUser) {
          sender = {
            _id: foundUser?._id,
            avatar: foundUser.avatar,
            userName: foundUser.userName,
          };
        }
      }
    });
  }

  return sender;
}

export default getSenderFromGroup;
