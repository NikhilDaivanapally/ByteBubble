import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { UserProps } from "../types";
import { ObjectId } from "bson";
import { socket } from "../socket";

const useGroupActions = (member: UserProps | null) => {
  const auth = useSelector((state: RootState) => state.auth.user);
  const { current_group_conversation } = useSelector(
    (state: RootState) => state.conversation.group_chat
  );
  const { activeChatId } = useSelector((state: RootState) => state.app);
  const isAdmin = current_group_conversation?.admins.includes(
    member?._id as string
  );

  //  handle admin assign & dismiss
  const handleAdminAction = () => {
    const messageId = new ObjectId().toHexString();
    const messageCreatedAt = new Date().toISOString();
    let userList = [...(current_group_conversation?.users || [])]
      .filter((el: UserProps | undefined) => el?._id !== auth?._id)
      .map((el) => el?._id);
    if (isAdmin) {
      socket.emit("group:admin:dismiss", {
        memberId: member?._id,
        conversationId: current_group_conversation?._id,
        broadCastTo: current_group_conversation?.users?.map(
          (user) => user?._id
        ),
      });
      socket.emit("system:group:admin:dismiss", {
        _id: messageId,
        sender: auth?._id,
        recipients: userList,
        messageType: "system",
        systemEventType: "admin_removed",
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
    } else {
      socket.emit("group:admin:assign", {
        memberId: member?._id,
        conversationId: current_group_conversation?._id,
        broadCastTo: current_group_conversation?.users?.map(
          (user) => user?._id
        ),
      });

      //  add group system message
      socket.emit("system:group:admin:assign", {
        _id: messageId,
        sender: auth?._id,
        recipients: userList,
        messageType: "system",
        systemEventType: "admin_assigned",
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
    }
  };

  // handle user remove
  const handleUserRemoveAction = () => {
    const messageId = new ObjectId().toHexString();
    const messageCreatedAt = new Date().toISOString();
    let userList = [...(current_group_conversation?.users || [])]
      .filter((el: UserProps | undefined) => el?._id !== auth?._id)
      .map((el) => el?._id);
      
    socket.emit("group:remove:member", {
      memberId: member?._id,
      conversationId: current_group_conversation?._id,
      broadCastTo: current_group_conversation?.users?.map((user) => user?._id),
    });

    //  add group system message
    socket.emit("system:group:user:removed", {
      _id: messageId,
      sender: auth?._id,
      recipients: userList,
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
  };

  return { handleAdminAction, handleUserRemoveAction };
};

export default useGroupActions;
