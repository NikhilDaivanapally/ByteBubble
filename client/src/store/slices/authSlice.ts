import { createSlice } from "@reduxjs/toolkit";
import { User } from "../../types/types";

type AuthProps = {
  user: User | null;
};

const initialState: AuthProps = {
  user: null,
};

const slice = createSlice({
  name: "authState",
  initialState,
  reducers: {
    UpdateAuthState(state, action) {
      state.user = action.payload;
    },
  },
});
export const { UpdateAuthState } = slice.actions;

export default slice.reducer;
