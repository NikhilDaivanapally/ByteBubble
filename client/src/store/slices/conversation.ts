import { createSlice } from "@reduxjs/toolkit";
import { conversationSliceProps, GroupMessageProps } from "../../types";

const initialState: conversationSliceProps = {
  direct_chat: {
    DirectConversations: null,
    current_direct_conversation: null,
    current_direct_messages: [],
  },
  group_chat: {
    GroupConversations: null,
    current_group_conversation: null,
    current_group_messages: [],
  },
  fullImagePreview: null,
};
const slice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    // initial conversations adding to the store
    setDirectConversations(state, action) {
      state.direct_chat.DirectConversations = action.payload;
    },
    setGroupConversations(state, action) {
      state.group_chat.GroupConversations = action.payload;
    },

    // initial messages adding to the store
    setCurrentDirectMessages(state, action) {
      const messages = action.payload;
      if (messages?.length > 0) {
        state.direct_chat.current_direct_messages = messages;
      }
    },
    setCurrentGroupMessages(state, action) {
      const messages = action.payload;
      if (messages?.length > 0) {
        state.group_chat.current_group_messages = messages;
      }
    },

    // updating a conversation
    updateDirectConversation(state, action) {
      const updatedList = (state.direct_chat?.DirectConversations || []).map(
        (el) => (el?._id !== action.payload?._id ? el : action.payload)
      );
      updatedList.sort((a, b) => Date.parse(b.time) - Date.parse(a.time));
      state.direct_chat.DirectConversations = updatedList;
    },
    updateGroupConversation(state, action) {
      const updatedList = (state.group_chat.GroupConversations || []).map(
        (el) => (el?._id !== action.payload?._id ? el : action.payload)
      );
      updatedList.sort((a, b) => Date.parse(b.time) - Date.parse(a.time));
      state.group_chat.GroupConversations = updatedList;
    },

    // adding a conversation
    addDirectConversation(state, action) {
      const this_conversation = action.payload;
      state.direct_chat.DirectConversations =
        state.direct_chat.DirectConversations?.filter(
          (el) => el?._id !== this_conversation._id
        ) || [];
      state.direct_chat.DirectConversations?.push(this_conversation);
    },
    addGroupConversation(state, action) {
      const this_conversation = action.payload.conversation;
      state.group_chat.GroupConversations =
        state.group_chat.GroupConversations?.filter(
          (el) => el?._id !== this_conversation?._id
        ) || [];
      state.group_chat.GroupConversations.push(this_conversation);
    },

    // make conversation empty
    setCurrentDirectConversation(state, action) {
      state.direct_chat.current_direct_conversation = action.payload;
    },
    setCurrentGroupConversation(state, action) {
      state.group_chat.current_group_conversation = action.payload;
    },

    // add a message
    addDirectMessage(state, action) {
      const message = action.payload;
      const current_messages = state.direct_chat.current_direct_messages;
      if (current_messages?.slice(-1)[0]?.status == "pending") {
        current_messages.pop();
      }
      state.direct_chat.current_direct_messages = [
        ...current_messages,
        message,
      ];
    },
    addGroupMessage(state, action) {
      const message = action.payload;
      const current_messages = state.group_chat.current_group_messages;

      if (current_messages?.slice(-1)[0]?.status == "pending") {
        current_messages.pop();
      }
      state.group_chat.current_group_messages = [...current_messages, message];
    },

    // update All Messages seen
    updateDirectMessagesSeen(state, _) {
      let messages = state.direct_chat.current_direct_messages;
      let new_messages = messages.map((el) => {
        return { ...el, isSeen: true };
      });

      state.direct_chat.current_direct_messages = new_messages;
    },

    // update All Group Messages seen
    updateGroupMessagesSeen(state, action) {
      const user = action.payload?.user;
      const userId = user?.userId;
      const messages = state.group_chat.current_group_messages || [];
      state.group_chat.current_group_messages = messages.map((el) => {
        const seenList = el.isSeen || [];

        const alreadySeen = seenList.some((u) => u.userId === userId);

        if (!alreadySeen) {
          return { ...el, isSeen: [...seenList, user] };
        }

        return el;
      });
    },

    updateDirectMessageSeenStatus(state, action) {
      let messages = state.direct_chat.current_direct_messages;
      let new_messages = messages.map((el) => {
        if (el?._id == action.payload?._id) {
          return { ...el, isSeen: true };
        }
        return el;
      });
      state.direct_chat.current_direct_messages = new_messages;
    },

    updateGroupMessageSeenStatus(state, action) {
      state.group_chat.current_group_messages =
        state.group_chat.current_group_messages.map((msg) => {
          if (msg._id !== action.payload.messageId) return msg;

          const updated: GroupMessageProps = {
            ...msg,
            isSeen: [...(msg.isSeen || []), action.payload.user],
          };

          return updated;
        });
    },

    // update Message
    updateExistingDirectMessage(state, action) {
      let messages = state.direct_chat.current_direct_messages;
      let new_messages = messages.map((el) => {
        if (el?._id == action.payload?._id) {
          return { ...el, message: action.payload.message, status: "sent" };
        }
        return el;
      });

      state.direct_chat.current_direct_messages = new_messages;
    },
    updateExistingGroupMessage(state, action) {
      let messages = state.group_chat.current_group_messages;
      let new_messages = messages.map((el) => {
        if (el?._id == action.payload?._id) {
          return { ...el, message: action.payload.message, status: "sent" };
        }
        return el;
      });

      state.group_chat.current_group_messages = new_messages;
    },

    ResetDirectChat(state) {
      state.direct_chat.current_direct_conversation = null;
      state.direct_chat.current_direct_messages = [];
    },
    ResetGroupChat(state) {
      state.group_chat.current_group_conversation = null;
      state.group_chat.current_group_messages = [];
    },
    setfullImagePreview(state, action) {
      state.fullImagePreview = action.payload.fullviewImg;
    },
  },
});

export const {
  setDirectConversations,
  setGroupConversations,
  updateDirectConversation,
  updateGroupConversation,
  addDirectConversation,
  addGroupConversation,
  setCurrentDirectMessages,
  setCurrentGroupMessages,
  setCurrentDirectConversation,
  setCurrentGroupConversation,
  addDirectMessage,
  addGroupMessage,
  ResetDirectChat,
  ResetGroupChat,
  setfullImagePreview,
  updateDirectMessagesSeen,
  updateGroupMessagesSeen,
  updateDirectMessageSeenStatus,
  updateExistingDirectMessage,
  updateExistingGroupMessage,
  updateGroupMessageSeenStatus,
} = slice.actions;

export default slice.reducer;
