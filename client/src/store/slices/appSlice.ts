import { createSlice } from "@reduxjs/toolkit";
import { appSliceProps } from "../../types";

const initialState: appSliceProps = {
  onlineStatus: true,
  friends: [],
  activeChatId: null,
  chatType: null,
  isCameraOpen: false,
  mediaFiles: null,
  mediaPreviewUrls: null,
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
    updateOpenCamera(state, action) {
      state.isCameraOpen = action.payload;
    },
    updateMediaFiles(state, action) {
      const files = action.payload
        ? (Object.values(action.payload) as File[])
        : null;
      state.mediaFiles = files;
    },
    updateMediaPreviewUrls(state, action) {
      state.mediaPreviewUrls = action.payload;
    },
  },
});
export const {
  updateOnlineStatus,
  updateFriends,
  updateOpenCamera,
  selectConversation,
  updateChatType,
  updateMediaFiles,
  updateMediaPreviewUrls,
} = slice.actions;

export default slice.reducer;
