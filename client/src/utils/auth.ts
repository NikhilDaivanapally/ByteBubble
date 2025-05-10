import { useDispatch } from "react-redux";
import { useLazySuccessQuery } from "../store/slices/apiSlice";
import { useEffect } from "react";
import { UpdateAuthState } from "../store/slices/authSlice";
import { redirect } from "react-router-dom";

// utils/auth.ts
// export const checkAuth = async () => {
//   const dispatch = useDispatch();
//   const [success, { isLoading, data, error }] = useLazySuccessQuery();

//   success({});

//   useEffect(() => {
//     if (data) {
//       dispatch(UpdateAuthState(data.user));
//     }
//   }, [data, error]);

//   if (!data) {
//     throw new Response("Unauthorized", { status: 401 });
//   }
//   return true;
// };

export const checkAuth = async () => {
  const dispatch = useDispatch();

  try {
    // Redirect to login if user is not authenticated
    const response = await fetch(
      "http://localhost:8000/api/v1/auth/login/success",
      {
        method: "GET",
        credentials: "include",
      }
    );
    const data = await response.json();
    if (data.status !== "success") {
      return redirect("/signin");
    }
    dispatch(UpdateAuthState(data.user));
    return null; // No redirection
  } catch (error) {
    return redirect("/signin");
  }
};
