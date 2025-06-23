import { createSlice } from "@reduxjs/toolkit";

const initialState: { activeSettingPage: null | string } = {
  activeSettingPage: null, // or "EditProfile", "Privacy", etc.
};
const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setActiveSettingPage: (state, action) => {
      state.activeSettingPage = action.payload;
    },
    clearActiveSettingPage: (state) => {
      state.activeSettingPage = null;
    },
  },
});

export const { setActiveSettingPage, clearActiveSettingPage } =
  settingsSlice.actions;
export default settingsSlice.reducer;
