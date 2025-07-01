import { apiSlice } from "./apiSlice";

export const connectionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConnections: builder.query({
      query: () => "/user/get_friends",
      keepUnusedDataFor: 2,
    }),
    getConnectionRequests: builder.query({
      query: () => "/user/get_friend_request",
      keepUnusedDataFor: 2,
    }),
  }),
  overrideExisting: false,
});

export const { useGetConnectionsQuery, useGetConnectionRequestsQuery } =
  connectionApi;
