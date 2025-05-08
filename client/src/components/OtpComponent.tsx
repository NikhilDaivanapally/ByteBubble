import React, { useCallback, useEffect, useRef, useState } from "react";
import Button from "./ui/Button";
import { useOtpsubmitMutation } from "../store/slices/apiSlice";

type OtpComponentProps = {
  email?: string;
  length: number;
};

const OtpComponent: React.FC<OtpComponentProps> = ({ email, length }) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputRefs = useRef<HTMLInputElement[] | []>([]);
  const [
    otpsubmit,
    {
      isLoading: isOtpSubmitLoading,
      error: otpsubmitError,
      data: otpsubmitData,
    },
  ] = useOtpsubmitMutation();

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    if (otpsubmitData) {
      // dispatch(UpdateAuthState(otpsubmitData.user));
      localStorage.setItem("auth_id", JSON.stringify(otpsubmitData.user));
      // toast.success(otpsubmitData.message);
      // Navigate("/");
    } else if (otpsubmitError) {
      // toast.error(otpsubmitError.data.message);
    }
  }, [otpsubmitError, otpsubmitData, inputRefs.current]);

  // verifyOtp code
  const handleOtpChange = useCallback(
    (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (isNaN(value)) return;
      const newotp = [...otp];
      newotp[index] = value.substring(value.length - 1);
      setOtp(newotp);

      if (value && index < length - 1 && inputRefs.current[index + 1]) {
        if (otp[index + 1]) {
          inputRefs.current[otp.indexOf("")].focus();
        } else {
          inputRefs.current[index + 1].focus();
        }
      }
    },
    [otp]
  );

  // handle keydown
  const handleKeydown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (
        e.key === "Backspace" &&
        !otp[index] &&
        index > 0 &&
        inputRefs.current[index - 1]
      ) {
        inputRefs.current[index - 1].focus();
      }
    },
    [otp]
  );

  // otp verify
  const handleOtpsubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!otp.some((val) => val == "")) {
        await otpsubmit({
          email,
          otp: otp.join(""),
        });
      } else {
        // toast.error("fields should not be empty");
      }
    },
    [otp]
  );

  const handleclick = useCallback((index: number) => {
    inputRefs.current[index].setSelectionRange(1, 1);
    if (index > 0 && !otp[index - 1]) {
      inputRefs.current[otp.indexOf("")].focus();
    }
  }, []);

  return (
    <section className="w-full h-full flex-center flex-col gap-2">
      <h1 className="lg:hidden absolute top-4 left-4 text-xl font-semibold">
        Byte_Messenger
      </h1>
      <h1 className="font-semibold text-2xl  text-center">Verify OTP</h1>
      <p className="text-center text-sm text-gray-600">
        we have sent a verification code to{" "}
        <span className="font-semibold text-black underline">
          harry@gmail.com
          {/* {email} */}
        </span>
      </p>
      <form onSubmit={handleOtpsubmit} className="w-full space-y-2">
        <div className="flex gap-2 my-8 justify-center">
          {otp.map((value, index) => {
            return (
              <input
                className="w-full h-12 sm:w-14 sm:h-14 text-xl text-center border rounded-md focus:outline-none focus:ring-2 focus:ring-btn-primary transition"
                key={`inpt_${index}`}
                ref={(input) => {
                  inputRefs.current[index] = input;
                }}
                type="text"
                value={value}
                onClick={() => handleclick(index)}
                onChange={(e) => handleOtpChange(index, e)}
                onKeyDown={(e) => handleKeydown(index, e)}
              />
            );
          })}
        </div>

        <Button
          kind="secondary"
          className="w-full"
          type="submit"
          isLoading={isOtpSubmitLoading}
        >
          Verify Otp
        </Button>
      </form>
    </section>
  );
};

export default OtpComponent;
