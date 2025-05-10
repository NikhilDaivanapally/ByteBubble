import { combineReducers } from "redux";
import themeReducer from "./slices/themeSlice";
import authReducer from "./slices/authSlice";
import appReducer from "./slices/appSlice";
import { apiSlice } from "./slices/apiSlice";
import conversationReducer from "./slices/conversation";

const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  theme: themeReducer,
  auth: authReducer,
  app: appReducer,
  conversation: conversationReducer,
});

export { rootReducer };
