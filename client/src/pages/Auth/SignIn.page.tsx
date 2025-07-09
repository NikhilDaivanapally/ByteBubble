import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import GoogleAuth from "../../components/GoogleAuth";
import { setUser } from "../../store/slices/authSlice";
import toast from "react-hot-toast";
import { useSiginMutation } from "../../store/slices/api";

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

  // local sigin
  const [sigin, { isLoading, error, data }] = useSiginMutation();

  // Hook for local sigin success
  useEffect(() => {
    if (data) {
      dispatch(setUser(data.user));
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
        await sigin(signinFormData);
      } else {
        toast.error("All Fields are Required");
      }
    },
    [signinFormData, sigin]
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
    <section className="w-full backdrop-blur flex-center flex-col  px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 gap-3 py-10">
      {/* Header */}
      <header className="mb-4">
        {/* App name for mobile */}
        <h1 className="lg:hidden absolute top-4 left-4 text-xl font-semibold">
          ByteBubble
        </h1>
        <h2 className="font-semibold text-2xl text-center">
          Sign In to Continue
        </h2>
        <p className="text-center text-sm text-gray-600">
          Enter your email & password below to sign in
        </p>
      </header>
      {/* signin Form section */}
      <section className="w-full">
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
          <Button variant="primary" type="submit" fullWidth loading={isLoading}>
            Sign in
          </Button>
        </form>
      </section>
      {/* OR Divider */}
      <section className="w-full">
        <div className="w-full flex-center relative before:absolute before:content-[] before:w-full before:h-[1px] before:top-1/2 before:left-0 before:bg-gray-200">
          <span className="bg-light dark:bg-dark z-5 px-2 text-xs">
            OR CONTINUE WITH
          </span>
        </div>
      </section>
      {/* Google Auth */}
      <section
        aria-label="singup with google"
        className="w-full
      "
      >
        <GoogleAuth />
      </section>
      {/* footer */}
      <footer className="text-sm text-center">
        <p>
          Don't have an account?{" "}
          <Link to={"/signup"} className="underline">
            Create
          </Link>
        </p>
      </footer>
    </section>
  );
};

export default SignIn;
