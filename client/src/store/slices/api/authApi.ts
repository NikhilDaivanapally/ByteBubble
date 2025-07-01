import { apiSlice } from "./apiSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sigin: builder.mutation({
      query: (data) => ({ url: "/v1/auth/login", method: "POST", body: data }),
    }),
    signup: builder.mutation({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
    }),
    otpsubmit: builder.mutation({
      query: (data) => ({
        url: "/auth/verifyotp",
        method: "POST",
        body: data,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: data,
      }),
    }),
    success: builder.query({
      query: () => "/auth/login/success",
      keepUnusedDataFor: 2,
    }),
    logout: builder.mutation({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useSignupMutation,
  useOtpsubmitMutation,
  useSiginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLazySuccessQuery,
  useLogoutMutation,
} = authApi;
