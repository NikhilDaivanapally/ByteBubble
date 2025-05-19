import { useSelector } from "react-redux";
import { RootState } from "../store/store";

type senderProps = { avatar: string; userName: string };

const SenderFromGroup = (el: any) => {
  const { GroupConversations } = useSelector(
    (state: RootState) => state.conversation.group_chat
  );
  const { chatType } = useSelector((state: RootState) => state.app);
  let sender: senderProps = { avatar: "", userName: "" };
  if (chatType !== "individual" && !el.outgoing) {
    GroupConversations &&
      GroupConversations?.map((conv) => {
        if (conv.id === el?.conversationId || conv.id === el?.id) {
          const foundUser = [...conv?.users, conv?.admin].find(
            (user) => el.from == user?._id
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
  return { ...sender };
};

export default SenderFromGroup;
