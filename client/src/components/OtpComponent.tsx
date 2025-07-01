import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  FormEvent,
  ChangeEvent,
  KeyboardEvent,
} from "react";
import { Button } from "./ui/Button";
import { setUser } from "../store/slices/authSlice";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import { useOtpsubmitMutation } from "../store/slices/api";

type OtpComponentProps = {
  email?: string;
  length: number;
};

const OtpComponent: React.FC<OtpComponentProps> = ({ email, length }) => {
  const dispatch = useDispatch();
  const Navigate = useNavigate();
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [
    otpsubmit,
    {
      isLoading: isOtpSubmitLoading,
      error: otpsubmitError,
      data: otpsubmitData,
    },
  ] = useOtpsubmitMutation();

  useEffect(() => {
    if (!inputRefs.current.length) return;
    inputRefs.current[0]?.focus();
  }, [inputRefs.current]);

  useEffect(() => {
    if (otpsubmitData) {
      dispatch(setUser(otpsubmitData.user));
      toast.success(otpsubmitData.message);
      Navigate("/chat");
    } else if (otpsubmitError) {
      let errorMessage = "Something went wrong";

      if ("status" in otpsubmitError) {
        // It's a FetchBaseQueryError
        const err = otpsubmitError as FetchBaseQueryError;
        if (err.data && typeof err.data === "object" && "message" in err.data) {
          errorMessage =
            (err.data as { message?: string }).message || errorMessage;
        }
      } else {
        // It's a SerializedError
        const err = otpsubmitError as SerializedError;
        errorMessage = err.message || errorMessage;
      }

      toast.error(errorMessage);
    }
  }, [otpsubmitData, otpsubmitError]);

  const handleOtpChange = useCallback(
    (index: number, e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      if (!/^\d*$/.test(value)) return; // allow only digits

      const newOtp = [...otp];
      newOtp[index] = value.slice(-1); // get only last char if pasted
      setOtp(newOtp);

      const nextIndex = newOtp.indexOf("");
      if (value && index < length - 1) {
        inputRefs.current[nextIndex >= 0 ? nextIndex : index + 1]?.focus();
      }
    },
    [otp, length, inputRefs.current]
  );

  const handleKeydown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otp]
  );

  const handleOtpsubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (otp.every((val) => val.trim() !== "")) {
        await otpsubmit({ email, otp: otp.join("") });
      } else {
        // toast.error("All fields must be filled");
      }
    },
    [otp, email, otpsubmit]
  );

  const handleClick = useCallback(
    (index: number) => {
      const input = inputRefs.current[index];
      if (input) {
        input.setSelectionRange(1, 1);
        if (index > 0 && !otp[index - 1]) {
          inputRefs.current[otp.indexOf("")]?.focus();
        }
      }
    },
    [otp]
  );

  return (
    <section className="w-full h-full flex-center flex-col gap-2">
      <h1 className="lg:hidden absolute top-4 left-4 text-xl font-semibold">
        Byte_Messenger
      </h1>
      <h1 className="font-semibold text-2xl text-center">Verify OTP</h1>
      <p className="text-center text-sm text-gray-600">
        We have sent a verification code to{" "}
        <span className="font-semibold text-black underline">{email}</span>
      </p>
      <form onSubmit={handleOtpsubmit} className="w-full space-y-2">
        <div className="flex gap-2 my-8 justify-center">
          {otp.map((value, index) => (
            <input
              key={`input_${index}`}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={value}
              onClick={() => handleClick(index)}
              onChange={(e) => handleOtpChange(index, e)}
              onKeyDown={(e) => handleKeydown(index, e)}
              className="w-full h-12 sm:w-14 sm:h-14 text-xl text-center border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-btn-primary transition"
            />
          ))}
        </div>
        <Button
          variant="primary"
          fullWidth
          type="submit"
          loading={isOtpSubmitLoading}
        >
          Verify Otp
        </Button>
      </form>
    </section>
  );
};

export default OtpComponent;
