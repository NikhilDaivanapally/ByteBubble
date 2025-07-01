import { apiSlice } from "./apiSlice";

export const fileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadMessageFile: builder.mutation({
      query: (data) => ({ url: "/upload", method: "POST", body: data }),
    }),
    getFile: builder.query<Blob, string>({
      query: (fileId) => ({
        url: `/upload/${fileId}`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useUploadMessageFileMutation, useGetFileQuery } = fileApi;
