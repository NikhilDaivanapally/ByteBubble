import { Link } from "react-router";
import Button from "../../components/ui/Button";
import { useCallback, useEffect, useState } from "react";
import Input from "../../components/ui/Input";
import { EnvelopeIcon, KeyIcon } from "@heroicons/react/16/solid";
import { useForgotpassMutation } from "../../store/slices/apiSlice";
import toast from "react-hot-toast";

type Error = {
  data: {
    message: string;
  };
};

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [forgotpass, { isLoading, error, data }] = useForgotpassMutation();
  useEffect(() => {
    data && toast.success(data.message);
    error && toast.error((error as Error)?.data.message);
  }, [error, data]);
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
    []
  );

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (email) {
        await forgotpass({ email });
      } else {
        toast("Enter your email to Reset password");
      }
    },
    [email]
  );
  return (
    <div className="w-full backdrop-blur flex-center flex-col  px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 gap-4 py-10">
      {/* Show app name only on smaller screens */}
      <h1 className="lg:hidden absolute top-4 left-4 text-xl font-semibold">
        Byte_Messenger
      </h1>

      {!data ? (
        <>
          {/* <KeyIcon className="w-12"/> */}
          <KeyIcon className="w-16 p-3 rounded-full fill-btn-primary/90 bg-btn-primary/20 shadow-md" />
          <h1 className="font-semibold text-2xl text-center">
            Forgot your password ?
          </h1>
          <p className="text-center text-sm text-gray-600">
            Enter your email address and we'll send you the link to reset
            password
          </p>

          <form onSubmit={handleFormSubmit} className="w-full space-y-4">
            <Input
              type="email"
              name="email"
              placeholder="Email@example.com"
              value={email}
              onChange={handleInputChange}
              required={true}
            />
            <Button
              kind="secondary"
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              <EnvelopeIcon className="w-5" /> Send Email
            </Button>
          </form>
        </>
      ) : (
        <>
          <EnvelopeIcon className="w-16 p-3 rounded-full fill-btn-primary/90 bg-btn-primary/20 shadow-md" />
          <p className="font-semibold text-2xl  text-center">
            password reset link successful
          </p>
          <p className="text-black/60 text-center">
            We have sent you an email at{" "}
            <span className="text-black">{email}</span>
            Check your inbox and follow the instructions to reset your account
            password
          </p>
        </>
      )}

      <Link to={"/signin"} className="text-sm underline">
        Back to signin
      </Link>
    </div>
  );
};

export default ForgotPassword;
