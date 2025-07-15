import { useCallback, useEffect, useRef } from "react";
import { socket } from "../socket";
import { useDispatch, useSelector } from "react-redux";
import { selectConversation } from "../store/slices/appSlice";
import { GroupConversationProps, UserProps } from "../types";
import {
  addGroupConversation,
  setCurrentGroupConversation,
  updateGroupConversation,
} from "../store/slices/conversation";
import { RootState } from "../store/store";
import { group } from "../utils/conversation-types";
import { useGetGroupConversationMutation } from "../store/slices/api";

type NewMembersProps = {
  _id: string;
  senderId: string;
  members: UserProps[];
};

export const useGroupEvents = (enabled: boolean) => {
  const dispatch = useDispatch();

  const { GroupConversations, current_group_conversation } = useSelector(
    (state: RootState) => state.conversation.group_chat
  );

  const [getGroupConversation, { data: conversationData }] =
    useGetGroupConversationMutation();

  // Keep a ref of GroupConversations for latest access in callbacks
  const groupConversationsRef = useRef(GroupConversations);
  useEffect(() => {
    groupConversationsRef.current = GroupConversations;
  }, [GroupConversations]);

  // Keep a ref for getConversation since it's a function from RTK Query
  const getConversationRef = useRef(getGroupConversation);
  useEffect(() => {
    getConversationRef.current = getGroupConversation;
  }, [getGroupConversation]);

  // Update Redux when a new conversation is fetched
  useEffect(() => {
    if (!conversationData?.data?.conversation) return;
    const { conversation } = conversationData.data;
    dispatch(addGroupConversation(conversation));
  }, [conversationData, dispatch]);

  // Handle receiving a new group conversation
  const handleAddGroupConversation = useCallback(
    (conversation: GroupConversationProps) => {
      dispatch(addGroupConversation(conversation));
      dispatch(selectConversation(conversation._id));
    },
    [dispatch]
  );

  // Handle addition of new members to an existing group
  const handleNewGroupMembers = useCallback(
    async (data: NewMembersProps) => {
      const { _id, members } = data;
      const existingConversation = groupConversationsRef.current?.find(
        (conversation) => conversation._id === _id
      );

      if (existingConversation) {
        const updatedConversation = {
          ...existingConversation,
          users: [...existingConversation.users, ...members],
        };
        dispatch(addGroupConversation(updatedConversation));
      } else {
        await getConversationRef.current({
          conversationId: _id,
          conversationType: group,
        });
      }
    },
    [dispatch]
  );

  const handleAddAdmin = useCallback(
    ({
      memberId,
      conversationId,
    }: {
      memberId: string;
      conversationId: string;
    }) => {
      const conversation = GroupConversations?.find(
        (conv) => conv?._id === conversationId
      );
      if (!conversation) return;
      dispatch(
        updateGroupConversation({
          ...conversation,
          admins: [...conversation.admins, memberId],
        })
      );
      if (current_group_conversation?._id == conversation?._id) {
        dispatch(
          setCurrentGroupConversation({
            ...conversation,
            admins: [...conversation.admins, memberId],
          })
        );
      }
    },
    [GroupConversations, current_group_conversation]
  );

  const handleRemoveAdmin = useCallback(
    ({
      memberId,
      conversationId,
    }: {
      memberId: string;
      conversationId: string;
    }) => {
      const conversation = GroupConversations?.find(
        (conv) => conv?._id === conversationId
      );
      if (!conversation) return;
      dispatch(
        updateGroupConversation({
          ...conversation,
          admins: conversation.admins.filter((id) => id !== memberId),
        })
      );
      if (current_group_conversation?._id == conversation?._id) {
        dispatch(
          setCurrentGroupConversation({
            ...conversation,
            admins: conversation.admins.filter((id) => id !== memberId),
          })
        );
      }
    },
    [GroupConversations, current_group_conversation]
  );

  const handleRemoveUser = useCallback(
    ({
      memberId,
      conversationId,
    }: {
      memberId: string;
      conversationId: string;
    }) => {
      const conversation = GroupConversations?.find(
        (conv) => conv?._id === conversationId
      );
      if (!conversation) return;
      dispatch(
        updateGroupConversation({
          ...conversation,
          admins: conversation.admins.filter((id) => id !== memberId),
          users: conversation.users.filter((user) => user?._id !== memberId),
        })
      );
      if (current_group_conversation?._id == conversation?._id) {
        dispatch(
          setCurrentGroupConversation({
            ...conversation,
            admins: conversation.admins.filter((id) => id !== memberId),
            users: conversation.users.filter((user) => user?._id !== memberId),
          })
        );
      }
    },
    [GroupConversations, current_group_conversation]
  );

  const handleAddUsers = useCallback(
    ({
      members,
      conversationId,
    }: {
      members: UserProps[];
      conversationId: string;
    }) => {
      const conversation = GroupConversations?.find(
        (conv) => conv?._id === conversationId
      );
      if (!conversation) return;
      dispatch(
        updateGroupConversation({
          ...conversation,
          users: [...conversation?.users, ...members],
        })
      );
      if (current_group_conversation?._id == conversation?._id) {
        dispatch(
          setCurrentGroupConversation({
            ...conversation,
            users: [...conversation?.users, ...members],
          })
        );
      }
    },
    [GroupConversations, current_group_conversation]
  );
  // Attach/detach socket event listeners
  useEffect(() => {
    if (!enabled) return;

    socket.on("group:new", handleAddGroupConversation);
    socket.on("group:admin:assign:success", handleAddAdmin);
    socket.on("group:admin:dismiss:success", handleRemoveAdmin);
    socket.on("group:add:members:success", handleAddUsers);
    socket.on("group:remove:member:success", handleRemoveUser);
    socket.on("group:new:members", handleNewGroupMembers);

    return () => {
      socket.off("group:new", handleAddGroupConversation);
      socket.off("group:admin:assign:success", handleAddAdmin);
      socket.off("group:admin:dismiss:success", handleRemoveAdmin);
      socket.off("group:add:members:success", handleAddUsers);
      socket.off("group:remove:member:success", handleRemoveUser);
      socket.off("group:new:members", handleNewGroupMembers);
    };
  }, [
    enabled,
    handleAddGroupConversation,
    handleNewGroupMembers,
    handleAddAdmin,
    handleRemoveAdmin,
    handleAddUsers,
    handleRemoveUser,
  ]);
};
