import { createSlice } from "@reduxjs/toolkit";
import { conversationSliceProps } from "../../types";

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
      const list = state.direct_chat?.DirectConversations?.map((el) => {
        if (el?._id !== action.payload?.id) {
          return el;
        } else {
          return action.payload;
        }
      });
      const filterList = list?.filter((val) => val);
      filterList?.sort((a, b) => Date.parse(b.time) - Date.parse(a.time));
      state.direct_chat.DirectConversations = filterList || [];
    },

    updateGroupConversation(state, action) {
      const list = state.group_chat.GroupConversations?.map((el) => {
        if (el?._id !== action.payload?.id) {
          return el;
        } else {
          return action.payload;
        }
      });
      const filterList = list?.filter((val) => val);
      filterList?.sort((a, b) => Date.parse(b.time) - Date.parse(a.time));
      state.group_chat.GroupConversations = filterList || [];
    },

    // adding a conversation
    addDirectConversation(state, action) {
      const this_conversation = action.payload.conversation;
      const unreadMssLength = this_conversation?.messages?.filter(
        (msg: any) =>
          msg.recipients == action?.payload?.auth?._id && msg.isRead == false
      );
      const user = this_conversation?.user;
      state.direct_chat.DirectConversations =
        state.direct_chat.DirectConversations?.filter(
          (el) => el?._id !== this_conversation._id
        ) || [];
      state.direct_chat.DirectConversations?.push({
        _id: this_conversation?._id,
        userId: user?._id,
        name: user?.userName,
        isOnline: user?.status === "Online",
        avatar: user?.avatar,
        message: {
          messageType: this_conversation?.messages?.slice(-1)[0]?.messageType,
          message: this_conversation?.messages?.slice(-1)[0]?.message,
          createdAt: this_conversation?.messages?.slice(-1)[0]?.createdAt,
        },
        unreadMessagesCount: unreadMssLength?.length,
        isSeen: this_conversation?.messages?.slice(-1)[0]?.isRead,
        isOutgoing:
          this_conversation?.messages?.slice(-1)[0]?.sender?.toString() ===
          action?.payload?.auth?._id?.toString(),
        time: this_conversation?.messages?.slice(-1)[0]?.createdAt || "",
        about: user?.about,
      });
    },
    addGroupConversation(state, action) {
      const this_conversation = action.payload.conversation;
      state.group_chat.GroupConversations =
        state.group_chat.GroupConversations?.filter(
          (el) => el?._id !== this_conversation._id
        ) || [];
      state.group_chat.GroupConversations.push({
        _id: this_conversation?._id,
        name: this_conversation?.name,
        avatar: this_conversation?.avatar,
        admin: this_conversation?.admin,
        users: this_conversation?.participants,
        message: {
          messageType: this_conversation?.messages?.slice(-1)[0]?.type,
          message: this_conversation?.messages?.slice(-1)[0]?.message,
          createdAt: this_conversation?.messages?.slice(-1)[0]?.createdAt,
        },

        from: this_conversation?.messages?.slice(-1)[0]?.sender,
        isOutgoing:
          this_conversation?.messages?.slice(-1)[0]?.sender.toString() ===
          action?.payload.auth?._id.toString(),
        time: this_conversation?.messages?.slice(-1)[0]?.createdAt || "",
        isSeen: this_conversation?.messages?.slice(-1)[0]?.isRead,
        unreadMessagesCount: 0,
      });
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

    // update Message seen
    updateDirectMessagesSeen(state, _) {
      let messages = state.direct_chat.current_direct_messages;
      let new_messages = messages.map((el) => {
        return { ...el, isSeen: true };
      });

      state.direct_chat.current_direct_messages = new_messages;
    },
    updateDirectMessageSeenStatus(state, action) {
      let messages = state.direct_chat.current_direct_messages;
      let new_messages = messages.map((el) => {
        if (el?._id == action.payload?.messageId) {
          return { ...el, isSeen: true };
        }
        return el;
      });
      state.direct_chat.current_direct_messages = new_messages;
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
  updateDirectMessageSeenStatus,
  updateExistingDirectMessage,
  updateExistingGroupMessage,
} = slice.actions;

export default slice.reducer;
