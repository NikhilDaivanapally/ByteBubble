import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserProps } from "../../types";

type AuthState = {
  user: UserProps | null;
  isAuthenticated: boolean;
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserProps>) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    blockUser(state, action) {
      if (state.user) {
        state?.user.blockedUsers.push(action.payload);
      }
    },
    removeFromBlockList(state, action) {
      if (state.user) {
        const newBlockedUser = state.user.blockedUsers.filter(
          (id) => id !== action.payload
        );
        state.user.blockedUsers = newBlockedUser;
      }
    },
  },
});

export const { setUser, blockUser, removeFromBlockList } = authSlice.actions;

export default authSlice.reducer;
