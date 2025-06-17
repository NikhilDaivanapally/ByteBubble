import { useCallback, useEffect, useRef } from "react";
import { socket } from "../socket";
import { useDispatch, useSelector } from "react-redux";
import { selectConversation } from "../store/slices/appSlice";
import { GroupConversationProps, UserProps } from "../types";
import { addGroupConversation } from "../store/slices/conversation";
import { RootState } from "../store/store";
import { useGetGroupConversationMutation } from "../store/slices/apiSlice";
import { group } from "../utils/conversation-types";

type NewMembersProps = {
  _id: string;
  senderId: string;
  members: UserProps[];
};

export const useGroupEvents = (enabled: boolean) => {
  const dispatch = useDispatch();

  const { GroupConversations } = useSelector(
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
    console.log(conversation);
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

  // Attach/detach socket event listeners
  useEffect(() => {
    if (!enabled) return;

    socket.on("group:new", handleAddGroupConversation);
    socket.on("group:new:admin", handleAddGroupConversation);
    socket.on("group:new:members", handleNewGroupMembers);

    return () => {
      socket.off("group:new", handleAddGroupConversation);
      socket.off("group:new:admin", handleAddGroupConversation);
      socket.off("group:new:members", handleNewGroupMembers);
    };
  }, [enabled, handleAddGroupConversation, handleNewGroupMembers]);
};
