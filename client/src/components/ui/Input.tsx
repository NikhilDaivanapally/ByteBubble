import clsx from "clsx";
import { useState, ReactNode, useEffect } from "react";
import { Icons } from "../../icons";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
  label?: string;
  startIcon?: ReactNode;
};

const Input: React.FC<InputProps> = ({
  type = "text",
  className,
  label,
  startIcon,
  value,
  onChange,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");

  // Sync internal state with controlled value
  useEffect(() => {
    if (value !== undefined) setInputValue(String(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange?.(e);
  };

  const clearInput = () => {
    const syntheticEvent = {
      target: { value: "" },
    } as React.ChangeEvent<HTMLInputElement>;
    setInputValue("");
    onChange?.(syntheticEvent);
  };

  const baseStyles =
    "w-full p-2.5 border sm:text-sm border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-btn-primary transition";
  const inputClass = clsx(
    baseStyles,
    {
      "pl-10": startIcon,
      "pr-10": type === "password" || (startIcon && inputValue), // space for clear or eye
    },
    className
  );

  // PASSWORD
  if (type === "password") {
    return (
      <div className="relative w-full">
        {label && (
          <label className="block mb-1 text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          type={showPassword ? "text" : "password"}
          className={inputClass}
          value={value}
          onChange={onChange}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          tabIndex={-1}
          className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-500"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <Icons.EyeSlashIcon className="w-5 h-5" />
          ) : (
            <Icons.EyeIcon className="w-5 h-5" />
          )}
        </button>
      </div>
    );
  }

  // SEARCH-STYLE INPUT (icon + clear)
  if (startIcon) {
    return (
      <div className="relative w-full">
        {label && (
          <label className="block mb-1 text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="absolute top-1/2 left-2 -translate-y-1/2 text-gray-500">
          {startIcon}
        </div>
        <input
          type={type}
          className={inputClass}
          value={inputValue}
          onChange={handleChange}
          {...props}
        />
        {inputValue && (
          <button
            type="button"
            onClick={clearInput}
            className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            aria-label="Clear input"
          >
            <Icons.XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  }

  // DEFAULT
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        type={type}
        className={inputClass}
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
  );
};

export default Input;
