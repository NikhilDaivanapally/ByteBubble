import { createSlice } from "@reduxjs/toolkit";
import { UserProps } from "../../types";

type AuthProps = {
  user: UserProps | null;
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
