import { Link } from "react-router";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useSignupMutation } from "../../store/slices/apiSlice";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import OtpComponent from "../../components/OtpComponent";
import GoogleAuth from "../../components/GoogleAuth";
import toast from "react-hot-toast";
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

  const inputTypes: inputTypesProps = {
    userName: "text",
    email: "email",
    password: "password",
    confirmPassword: "password",
  };
  const [signup, { isLoading, error, data }] = useSignupMutation();

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value, files, type } = e.target as HTMLInputElement;

      setsignupFormData((prev: any) => ({
        ...prev,
        [name]:
          type === "file"
            ? files && files.length > 0
              ? files[0]
              : prev[name] // user canceled -> keep previous file
            : value,
      }));
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
  // to preview the avatar uploaded by user by Generating the url
  const avatarUrl = useMemo(() => {
    if (signupFormData?.avatar) {
      return URL.createObjectURL(signupFormData.avatar);
    }
    return null;
  }, [signupFormData?.avatar]);

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

      console.log(testCase, signupFormData);
      if (!testCase) {
        const data = new FormData();

        for (const key in signupFormData) {
          const typedKey = key as keyof typeof signupFormData;
          data.append(key, signupFormData[typedKey] as any); // You can cast as string or File depending on your data shape
        }

        await signup(data);
      } else {
        // toast.error("Star marked fields are required !");
      }
    },
    [signupFormData]
  );

  const arrayOfKeys = useMemo(
    () =>
      Object.keys(signupFormData)
        .map((key: string) => {
          // const showAsterisk = key !== "about" ? " *" : "";
          if (key == "avatar") {
            return {
              type: "file",
              className:
                "w-full relative px-3 flex justify-between items-center",
              name: key,
              onChange: handleInputChange,
              accept: "image/*",
              url: avatarUrl,
            };
          } else if (key == "about") {
            return null;
          } else {
            return {
              type: inputTypes[key as keyof inputTypesProps],
              name: key,
              placeholder:
                key !== "confirmPassword"
                  ? key.slice(0, 1).toUpperCase() + key.slice(1) + " *"
                  : "Re-enter Password *",
              value: signupFormData[key as keyof SignupProps],
              onChange: handleInputChange,
              require: true,
              // required: key !== "about" ? true : false,
            };
          }
        })
        .filter(Boolean),
    [avatarUrl, signupFormData]
  );

  return (
    <div className="w-full h-full px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 ">
      {!data ? (
        <section className="w-full h-full flex-center flex-col gap-2">
          {/* Show app name only on smaller screens */}
          <h1 className="lg:hidden absolute top-4 left-4 text-xl font-semibold">
            Byte_Messenger
          </h1>
          <h1 className="font-semibold text-2xl  text-center">
            Create an account
          </h1>
          <p className="text-center text-sm text-gray-600">
            Enter your email below to create your account
          </p>
          <form onSubmit={handleFormSubmit} className="w-full space-y-2">
            {/* Input fields */}
            {arrayOfKeys?.map((object: any, i: number) => {
              return <Input key={i} {...object} />;
            })}
            {/* about textearea field */}
            <textarea
              className="border w-full border-black rounded-md px-4 py-2 resize-none"
              rows={2}
              placeholder="About"
              name="about"
              id=""
              onChange={handleInputChange}
              value={signupFormData["about"]}
            ></textarea>
            <Button
              kind="secondary"
              className="w-full"
              type="submit"
              isLoading={isLoading}
            >
              Sign up
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
            Already have an account?{" "}
            <Link to={"/signin"} className="underline">
              Sign in
            </Link>
          </p>
        </section>
      ) : (
        <OtpComponent length={6} email={signupFormData.email} />
      )}
    </div>
  );
};

export default SignUp;
