import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../../store/slices/apiSlice";
import GoogleAuth from "../../components/GoogleAuth";
import { UpdateAuthState } from "../../store/slices/authSlice";
import toast from "react-hot-toast";

type Error = {
  data?: {
    message: string;
  };
  error: any;
};

const SignIn = () => {
  const dispatch = useDispatch();
  const Navigate = useNavigate();
  type signinProps = {
    email: string;
    password: string;
  };
  const [signinFormData, setsigninFormData] = useState<signinProps>({
    email: "",
    password: "",
  });

  // local login
  const [login, { isLoading, error, data }] = useLoginMutation();

  // Hook for local login success
  useEffect(() => {
    if (data) {
      console.log(data);
      dispatch(UpdateAuthState(data.user));
      toast.success(data.message);
      Navigate("/chat");
    } else if (error) {
      toast.error((error as Error)?.data?.message || (error as Error)?.error);
    }
  }, [data, error, dispatch, Navigate]);

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!Object.values(signinFormData).some((val) => val === "")) {
        await login(signinFormData);
      } else {
        // toast.error("All Fields are Required");
      }
    },
    [signinFormData, login]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setsigninFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const arrayOfKeys = useMemo(
    () =>
      Object.keys(signinFormData).map((key: string) => {
        return {
          type: key,
          name: key,
          placeholder: key.slice(0, 1).toUpperCase() + key.slice(1),
          value: signinFormData[key as keyof signinProps],
          onChange: handleInputChange,
        };
      }),
    [signinFormData]
  );

  return (
    <div className="w-full backdrop-blur flex-center flex-col  px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 gap-4 py-10">
      {/* Show app name only on smaller screens */}
      <h1 className="lg:hidden absolute top-4 left-4 text-xl font-semibold">
        Byte_Messenger
      </h1>

      <h1 className="font-semibold text-2xl text-center">
        Sign In to Continue
      </h1>
      <p className="text-center text-sm text-gray-600">
        Enter your email & password below to sign in
      </p>

      <form onSubmit={handleFormSubmit} className="w-full space-y-4">
        {arrayOfKeys?.map((object: {}, i: number) => {
          return <Input key={i} {...object} />;
        })}

        <Link
          to={"/forgot-password"}
          className="inline-block ml-auto text-sm underline"
        >
          Forgot password
        </Link>
        <Button
          kind="secondary"
          type="submit"
          className="w-full"
          isLoading={isLoading}
        >
          Sign in
        </Button>
      </form>
      <div className="w-full flex-center relative before:absolute before:content-[] before:w-full before:h-[1px] before:top-1/2 before:left-0 before:bg-gray-200">
        {" "}
        <span className="bg-light dark:bg-dark z-5 px-2 text-xs">
          OR CONTINUE WITH
        </span>
      </div>
      <GoogleAuth />

      <p className="text-sm">
        Don't have an account?{" "}
        <Link to={"/signup"} className="underline">
          Create
        </Link>
      </p>
    </div>
  );
};

export default SignIn;
