import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import OtpComponent from "../../components/OtpComponent";
import GoogleAuth from "../../components/GoogleAuth";
import toast from "react-hot-toast";
import Textarea from "../../components/ui/Textarea";
import ImageUpload from "../../components/ui/ImageUpload";
import { useSignupMutation } from "../../store/slices/api";
type SignupProps = {
  avatar: File | null;
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  about: string;
};

type inputTypesProps = {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const SignUp = () => {
  const [signupFormData, setsignupFormData] = useState<SignupProps>({
    avatar: null,
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    about: "",
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const inputTypes: inputTypesProps = {
    userName: "text",
    email: "email",
    password: "password",
    confirmPassword: "password",
  };
  const [signup, { isLoading, error, data }] = useSignupMutation();

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target as HTMLInputElement;

      setsignupFormData((prev: any) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const handleImageUpload = useCallback(
    (file: File | null, blobUrl: string | null) => {
      setsignupFormData((prev) => ({
        ...prev,
        avatar: file,
      }));
      setAvatarUrl(blobUrl);
    },
    []
  );

  useEffect(() => {
    if (data) {
      toast.success(data.message);
    } else if (error) {
      toast.error((error as any)?.data?.message);
    }
  }, [data, error]);

  // handling form submit
  const handleFormSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      let testCase = [
        signupFormData.userName,
        signupFormData.email,
        signupFormData.password,
        signupFormData.confirmPassword,
      ].some((val) => val == "");

      if (!testCase) {
        const data = new FormData();
        for (const key in signupFormData) {
          const typedKey = key as keyof typeof signupFormData;
          if (signupFormData[typedKey]) {
            data.append(key, signupFormData[typedKey]);
          }
        }

        await signup(data);
      } else {
        toast.error("Star marked fields are required !");
      }
    },
    [signupFormData]
  );

  const arrayOfKeys = useMemo(
    () =>
      Object.keys(signupFormData)
        .filter((key) => key !== "avatar" && key !== "about")
        .map((key: string) => {
          return {
            type: inputTypes[key as keyof inputTypesProps],
            name: key,
            placeholder:
              key !== "confirmPassword"
                ? key.slice(0, 1).toUpperCase() + key.slice(1) + " *"
                : "Re-enter Password *",
            value: signupFormData[key as keyof SignupProps],
            onChange: handleInputChange,
            required: true,
          };
        })
        .filter(Boolean),
    [avatarUrl, signupFormData]
  );

  if (data) {
    return (
      <section className="w-full h-full px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 select-none">
        <OtpComponent length={6} email={signupFormData.email} />
      </section>
    );
  }

  return (
    <section className="w-full h-full px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 select-none flex-center flex-col gap-2">
      {/* Header */}
      <header>
        {/* App name for mobile */}
        <h1 className="lg:hidden absolute top-4 left-4 text-xl font-semibold">
          ByteBubble
        </h1>
        <h2 className="font-semibold text-xl md:text-2xl  text-center">
          Create an account
        </h2>
        <p className="text-center text-sm text-gray-600">
          Enter your details below to create your account
        </p>
      </header>
      {/* signup Form section */}
      <section className="w-full">
        <form onSubmit={handleFormSubmit} className="w-full space-y-2">
          {/* Input fields */}

          <ImageUpload
            onChange={handleImageUpload}
            value={avatarUrl}
            name={"Upload Image"}
          />

          {arrayOfKeys?.map((object: any, i: number) => {
            return <Input key={i} {...object} />;
          })}

          <Textarea
            rows={2}
            placeholder="About"
            name="about"
            id=""
            onChange={handleInputChange}
            value={signupFormData["about"]}
          />
          <Button variant="primary" fullWidth type="submit" loading={isLoading}>
            Sign up
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
          Already have an account?{" "}
          <Link to={"/signin"} className="underline">
            Sign in
          </Link>
        </p>
      </footer>
    </section>
  );
};

export default SignUp;
