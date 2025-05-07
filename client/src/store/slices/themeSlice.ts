import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  theme: localStorage.getItem("data-theme") || "light",
};
const slice = createSlice({
  name: "themeState",
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
  },
});

export const { toggleTheme } = slice.actions;

export default slice.reducer;
