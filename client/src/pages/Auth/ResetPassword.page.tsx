import { useCallback, useEffect, useState } from "react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useResetpassMutation } from "../../store/slices/apiSlice";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { CheckBadgeIcon, LockClosedIcon } from "@heroicons/react/16/solid";
type Error = {
  data: {
    message: string;
  };
};

const ResetPassword = () => {
  const [resetFormData, setResetFormData] = useState({
    newPassword: "",
    confirmNewPassword: "",
  });
  console.log(resetFormData);

  const [resetpass, { isLoading, error, data }] = useResetpassMutation();

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!Object.values(resetFormData).some((val) => val == "")) {
        await resetpass(resetFormData);
      } else {
        toast.error("All Fields are Required");
      }
    },
    [resetFormData]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setResetFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );
  useEffect(() => {
    if (data) {
      toast.success(data?.message);
    } else if (error) {
      toast.error((error as Error)?.data?.message);
    }
  }, [error, data]);

  return (
    <div className="w-full backdrop-blur flex-center flex-col  px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 gap-4 py-10">
      {/* Show app name only on smaller screens */}
      <h1 className="lg:hidden absolute top-4 left-4 text-xl font-semibold">
        Byte_Messenger
      </h1>

      {!data ? (
        <>
          <LockClosedIcon className="w-16 p-3 rounded-full fill-btn-primary/90 bg-btn-primary/20 shadow-md" />
          <h1 className="font-semibold text-2xl  text-center">
            Create New Password
          </h1>
          <p className="text-center text-sm text-gray-600">
            Enter your New Password below
          </p>

          <form onSubmit={handleFormSubmit} className="w-full space-y-4">
            <Input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={resetFormData["newPassword"]}
              onChange={handleInputChange}
              required={true}
            />
            <Input
              type="password"
              name="confirmNewPassword"
              placeholder="Re-enter New Password"
              value={resetFormData["confirmNewPassword"]}
              onChange={handleInputChange}
              required={true}
            />
            <Button
              kind="secondary"
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              Reset password
            </Button>
          </form>
        </>
      ) : (
        <>
          <CheckBadgeIcon className="w-14 fill-green-600" />
          <p className="font-semibold text-2xl  text-center">
            password reset successful <br />{" "}
          </p>
          <p className="text-black/60 text-center">
            Your password has been changed successfully. Please use your new
            credentials to sign in
          </p>
          <Link to={"/signin"} className="text-sm underline">
            Back to signin
          </Link>
        </>
      )}
    </div>
  );
};

export default ResetPassword;
