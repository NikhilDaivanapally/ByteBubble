import { combineReducers } from "redux";
import themeReducer from "./slices/themeSlice";
import authReducer from "./slices/authSlice";
import { apiSlice } from "./slices/apiSlice";
const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  theme: themeReducer,
  auth: authReducer,
});

export { rootReducer };
