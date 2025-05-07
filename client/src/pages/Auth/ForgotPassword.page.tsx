import { Link } from "react-router";
import Button from "../../components/ui/Button";
import { useCallback } from "react";
import Input from "../../components/ui/Input";

const ForgotPassword = () => {
  const handleFormSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
    },
    []
  );
  return (
    <div className="w-full backdrop-blur flex-center flex-col  px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 gap-4 py-10">
      {/* Show app name only on smaller screens */}
      <h1 className="lg:hidden absolute top-4 left-4 text-xl font-semibold">
        Byte_Messenger
      </h1>

      <h1 className="font-semibold text-2xl text-center">
        Forgot your password ?
      </h1>
      <p className="text-center text-sm text-gray-600">
        Enter your email address and we'll send you the link to reset password
      </p>

      <form onSubmit={handleFormSubmit} className="w-full space-y-4">
        <Input type={"email"} placeholder="Email@example.com" />
        <Button kind="secondary" className="w-full">
          Reset password
        </Button>
      </form>

      <Link to={"/signin"} className="text-sm underline">
        Back to signin
      </Link>
    </div>
  );
};

export default ForgotPassword;
