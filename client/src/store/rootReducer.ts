import { combineReducers, Reducer } from "redux";
import themeReducer from "./slices/themeSlice";
import authReducer from "./slices/authSlice";
import appReducer from "./slices/appSlice";
import settingsReducer from "./slices/settingsSlice";
import { apiSlice } from "./slices/apiSlice";
import conversationReducer from "./slices/conversation";

// ✅ Combine reducers
const combinedReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  theme: themeReducer,
  auth: authReducer,
  app: appReducer,
  conversation: conversationReducer,
  settings: settingsReducer,
});

type RootState = ReturnType<typeof combinedReducer>;

// ✅ Typed RootReducer with reset logic
const rootReducer: Reducer<RootState> = (state, action) => {
  if (action.type === "RESET_STORE") {
    state = undefined;
  }
  return combinedReducer(state, action);
};

export { rootReducer };
