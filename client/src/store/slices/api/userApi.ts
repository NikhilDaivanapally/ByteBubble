import { apiSlice } from "./apiSlice";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => "/user/get_users",
      keepUnusedDataFor: 2,
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: "/user/profile",
        method: "PATCH",
        body: data,
      }),
    }),
    updatePassword: builder.mutation({
      query: (data) => ({
        url: "/user/update-password",
        method: "PATCH",
        body: data,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useUpdateUserMutation,
  useUpdatePasswordMutation,
} = userApi;
