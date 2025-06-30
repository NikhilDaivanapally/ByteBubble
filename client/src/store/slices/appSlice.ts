import { createSlice } from "@reduxjs/toolkit";
import { appSliceProps } from "../../types";

const initialState: appSliceProps = {
  onlineStatus: true,
  friends: [],
  friendRequests: [],
  users: [],
  activeChatId: null,
  chatType: null,
  isCameraOpen: false,
  mediaFiles: null,
  mediaFilePreviews: [],
  isTyping: "",
  isTypingRoomId: null,
  directMessageInfo: null,
  groupMessageInfo: null,
  unreadCount: {
    directChats: 0,
    groupChats: 0,
    total: 0,
  },
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
      state.activeChatId = action.payload?.chatId ?? null;
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
    updateMediaFilePreviews(state, action) {
      state.mediaFilePreviews = action.payload;
    },
    setUsers(state, action) {
      state.users = action.payload;
    },
    setFriends(state, action) {
      state.friends = action.payload;
    },
    setFriendRequests(state, action) {
      state.friendRequests = action.payload;
    },
    addFriend(state, action) {
      state.friends = [...state?.friends, action.payload];
    },
    addFriendRequest(state, action) {
      state.friendRequests = [...state.friendRequests, action.payload];
    },
    removeUserFromUsers(state, action) {
      state.users = state.users?.filter(
        (el) => el?._id !== action?.payload?._id
      );
    },
    removeRequestFromFriendRequests(state, action) {
      state.friendRequests = state.friendRequests?.filter(
        (el) => el?._id !== action?.payload?._id
      );
    },
    setIsTyping(state, action) {
      const { roomId, userName } = action.payload;
      state.isTyping = userName;
      state.isTypingRoomId = roomId;
    },
    setDirectMessageInfo(state, action) {
      state.directMessageInfo = action.payload;
    },
    setGroupMessageInfo(state, action) {
      state.groupMessageInfo = action.payload;
    },
    setUnreadCount(state, action) {
      state.unreadCount = action.payload;
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
  updateMediaFilePreviews,
  setUsers,
  setFriends,
  setFriendRequests,
  addFriend,
  addFriendRequest,
  removeUserFromUsers,
  removeRequestFromFriendRequests,
  setIsTyping,
  setUnreadCount,
  setDirectMessageInfo,
  setGroupMessageInfo,
} = slice.actions;

export default slice.reducer;
