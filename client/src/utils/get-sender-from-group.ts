import { RootState } from "../store/store";

type SenderProps = { avatar: string; userName: string };

function getSenderFromGroup(
  el: any,
  chatType: string,
  groupConversations: RootState["conversation"]["group_chat"]["GroupConversations"]
): SenderProps {
  let sender: SenderProps = { avatar: "", userName: "" };

  if (chatType !== "individual" && !el.outgoing) {
    groupConversations?.forEach((conv) => {
      if (conv.id === el?.conversationId || conv.id === el?.id) {
        const foundUser = [...conv.users, conv.admin].find(
          (user) => el.from === user?._id
        );
        if (foundUser) {
          sender = {
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
