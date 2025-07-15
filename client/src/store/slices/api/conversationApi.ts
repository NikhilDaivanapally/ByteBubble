import { apiSlice } from "./apiSlice";

export const conversationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDirectConversation: builder.mutation({
      query: (data) => ({
        url: "/user/get_direct_conversation",
        method: "POST",
        body: data,
      }),
    }),
    getGroupConversation: builder.mutation({
      query: (data) => ({
        url: "/user/get_group_conversation",
        method: "POST",
        body: data,
      }),
    }),
    getDirectConversations: builder.query({
      query: () => "/user/get_direct_conversations",
      keepUnusedDataFor: 2,
    }),
    getGroupConversations: builder.query({
      query: () => "/user/get_group_conversations",
      keepUnusedDataFor: 2,
    }),
    getUnreadMessagesCount: builder.query({
      query: () => "/user/unread_counts",
      keepUnusedDataFor: 2,
    }),
    createGroup: builder.mutation({
      query: (data) => ({
        url: "/user/create_group",
        method: "POST",
        body: data,
      }),
    }),
    updateGroupInfo: builder.mutation({
      query: (data) => ({
        url: `/user/group-details`,
        method: "PUT",
        body: data,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDirectConversationMutation,
  useGetGroupConversationMutation,
  useGetDirectConversationsQuery,
  useLazyGetGroupConversationsQuery,
  useGetUnreadMessagesCountQuery,
  useCreateGroupMutation,
  useUpdateGroupInfoMutation,
} = conversationApi;
