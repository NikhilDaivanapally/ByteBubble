import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || "https://bytebubble.onrender.com/api/v1",
    credentials: "include",
  }),
  endpoints: () => ({}),
});
