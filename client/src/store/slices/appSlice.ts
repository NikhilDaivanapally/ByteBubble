import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  onlineStatus: null,
  friends: [],
  activeChatId: null,
  chatType: null,
};

const slice = createSlice({
  name: "app",
  initialState,
  reducers: {
    updateOnlineStatus(state, action) {
      state.onlineStatus = action.payload.status;
    },
    updateFriends(state, action) {
      state.friends = action.payload;
    },
    selectConversation(state, action) {
      state.activeChatId = action.payload.chatId;
    },
    updateChatType(state, action) {
      state.chatType = action.payload;
    },
  },
});
export const {
  updateOnlineStatus,
  updateFriends,
  selectConversation,
  updateChatType,
} = slice.actions;

export default slice.reducer;
