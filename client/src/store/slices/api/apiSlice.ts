import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BACKEND_URL } from "../../../config";

export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: `${BACKEND_URL}/api/v1`,
    credentials: "include",
  }),
  endpoints: () => ({}),
});
