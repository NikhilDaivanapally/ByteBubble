import { Link } from "react-router";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useSignupMutation } from "../../store/slices/apiSlice";
import React, { useCallback, useMemo, useState } from "react";
import OtpComponent from "../../components/OtpComponent";

type SignupProps = {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  about: string;
  avatar: File | null;
};

const SignUp = () => {
  const [signupFormData, setsignupFormData] = useState<SignupProps>({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    about: "",
    avatar: null,
  });

  const [
    signup,
    { isLoading: isSignupLoading, error: signupError, data: signupData },
  ] = useSignupMutation();

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
      // if (!testCase) {
      //   const data = new FormData();

      //   for (const key in signupFormData) {
      //     const typedKey = key as keyof typeof signupFormData;
      //     data.append(key, signupFormData[typedKey] as any); // You can cast as string or File depending on your data shape
      //   }

      //   await signup(data);
      // } else {
      //   // toast.error("Star marked fields are required !");
      // }
    },
    [signupFormData]
  );

  return (
    <div className="w-full h-full px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 ">
      {!signupData ? (
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
            <Input
              type="file"
              className="w-full relative px-3 flex justify-between items-center"
              name="avatar"
              onChange={handleInputChange}
              accept="image/*"
              url={avatarUrl}
            />
            <Input
              name="userName"
              type="text"
              placeholder="userName *"
              value={signupFormData["userName"]}
              onChange={handleInputChange}
              required={true}
            />
            <Input
              name="email"
              type="email"
              placeholder="Email@example.com *"
              value={signupFormData["email"]}
              onChange={handleInputChange}
              required={true}
            />
            <Input
              name="password"
              type="password"
              placeholder="Password *"
              value={signupFormData["password"]}
              onChange={handleInputChange}
              required={true}
            />
            <Input
              name="confirmPassword"
              type="password"
              placeholder="Re-enter Password *"
              value={signupFormData["confirmPassword"]}
              onChange={handleInputChange}
              required={true}
            />

            <textarea
              className="border w-full border-black rounded-md px-4 py-2 resize-none"
              rows={2}
              placeholder="About"
              name="about"
              id=""
              onChange={handleInputChange}
              value={signupFormData["about"]}
            ></textarea>
            <Button kind="secondary" className="w-full" type="submit">
              Sign up
            </Button>
          </form>

          <div className="w-full flex-center relative before:absolute before:content-[] before:w-full before:h-[1px] before:top-1/2 before:left-0 before:bg-gray-200">
            {" "}
            <span className="bg-light dark:bg-dark z-5 px-2 text-xs">
              OR CONTINUE WITH
            </span>
          </div>
          <Button kind="secondary_outline" className="w-full">
            <svg width="30" height="30" role="img">
              <g id="Google-Button" stroke="none" fill="none">
                <rect x="0" y="0" width="30" height="30" rx="1"></rect>
                <g id="logo_googleg_48dp" transform="translate(5,5) scale(1.2)">
                  <path
                    d="M17.64,9.20454545 C17.64,8.56636364 17.5827273,7.95272727 17.4763636,7.36363636 L9,7.36363636 L9,10.845 L13.8436364,10.845 C13.635,11.97 13.0009091,12.9231818 12.0477273,13.5613636 L12.0477273,15.8195455 L14.9563636,15.8195455 C16.6581818,14.2527273 17.64,11.9454545 17.64,9.20454545 L17.64,9.20454545 Z"
                    id="Shape"
                    fill="#4285F4"
                  ></path>
                  <path
                    d="M9,18 C11.43,18 13.4672727,17.1940909 14.9563636,15.8195455 L12.0477273,13.5613636 C11.2418182,14.1013636 10.2109091,14.4204545 9,14.4204545 C6.65590909,14.4204545 4.67181818,12.8372727 3.96409091,10.71 L0.957272727,10.71 L0.957272727,13.0418182 C2.43818182,15.9831818 5.48181818,18 9,18 L9,18 Z"
                    id="Shape"
                    fill="#34A853"
                  ></path>
                  <path
                    d="M3.96409091,10.71 C3.78409091,10.17 3.68181818,9.59318182 3.68181818,9 C3.68181818,8.40681818 3.78409091,7.83 3.96409091,7.29 L3.96409091,4.95818182 L0.957272727,4.95818182 C0.347727273,6.17318182 0,7.54772727 0,9 C0,10.4522727 0.347727273,11.8268182 0.957272727,13.0418182 L3.96409091,10.71 L3.96409091,10.71 Z"
                    id="Shape"
                    fill="#FBBC05"
                  ></path>
                  <path
                    d="M9,3.57954545 C10.3213636,3.57954545 11.5077273,4.03363636 12.4404545,4.92545455 L15.0218182,2.34409091 C13.4631818,0.891818182 11.4259091,0 9,0 C5.48181818,0 2.43818182,2.01681818 0.957272727,4.95818182 L3.96409091,7.29 C4.67181818,5.16272727 6.65590909,3.57954545 9,3.57954545 L9,3.57954545 Z"
                    id="Shape"
                    fill="#EA4335"
                  ></path>
                </g>
              </g>
            </svg>
            Continue with Google
          </Button>
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
