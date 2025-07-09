import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useCallback, useEffect, useState } from "react";
import Input from "../../components/ui/Input";
import { EnvelopeIcon, KeyIcon } from "@heroicons/react/16/solid";
import toast from "react-hot-toast";
import { useForgotPasswordMutation } from "../../store/slices/api";
import { Icons } from "../../icons";

type Error = {
  data: {
    message: string;
  };
};

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [forgotPassword, { isLoading, error, data }] =
    useForgotPasswordMutation();

  useEffect(() => {
    if (data) {
      toast.success(data.message);
      setEmail("");
    } else if (error) {
      toast.error((error as Error)?.data.message);
    }
  }, [error, data]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
    []
  );

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (email) {
        await forgotPassword({ email });
      } else {
        toast("Enter your email to Reset password");
      }
    },
    [email]
  );
  return (
    <section className="w-full backdrop-blur flex-center flex-col  px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 gap-4 py-10">
      {/* Header */}
      <header>
        {/* App name for mobile */}
        <h1 className="lg:hidden absolute top-4 left-4 text-xl font-semibold">
          ByteBubble
        </h1>
        <div className="w-full flex-center flex-col gap-4">
          {!data ? (
            <>
              <KeyIcon className="w-16 p-3 rounded-full fill-btn-primary/90 bg-btn-primary/20 shadow-md" />
              <h1 className="font-semibold text-2xl text-center">
                Forgot your password ?
              </h1>
              <p className="text-center text-sm text-gray-600">
                Enter your email address and we'll send you the link to reset
                password
              </p>
            </>
          ) : (
            <>
              <EnvelopeIcon className="w-16 p-3 rounded-full fill-btn-primary/90 bg-btn-primary/20 shadow-md" />
              <p className="font-semibold text-2xl  text-center">
                Password reset link sent successfully
              </p>
            </>
          )}
        </div>
      </header>
      {/* forgot password Form & success status */}
      <section className="w-full">
        {!data ? (
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
              variant="primary"
              type="submit"
              fullWidth
              loading={isLoading}
              icon={<EnvelopeIcon className="w-5" />}
              iconPosition="left"
            >
              Send Email
            </Button>
          </form>
        ) : (
          <p className="text-black/60 text-center">
            We have sent you an email at{" "}
            <span className="text-black">{email}</span> Check your inbox and
            follow the instructions to reset your account password
          </p>
        )}
      </section>
      {/* footer */}
      <footer className="border-b group">
        <Link to={"/signin"} className="text-sm flex-center gap-x-1">
          Back to signin
          <Icons.ArrowRightIcon className="w-4 group-hover:translate-x-1 transition duration-300" />
        </Link>
      </footer>
    </section>
  );
};

export default ForgotPassword;
