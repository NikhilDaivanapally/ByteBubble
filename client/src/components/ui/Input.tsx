import clsx from "clsx";
import { useState } from "react";
import { Icons } from "../../icons";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
  url?: string | null; // For avatar preview
  label?: string;
};

const Input: React.FC<InputProps> = ({
  type = "text",
  className,
  url,
  label,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const baseStyles =
    "w-full p-2.5 border sm:text-sm border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-btn-primary transition";
  const inputClass = clsx(baseStyles, className);

  // FILE INPUT
  if (type === "file") {
    return (
      <div className={clsx("space-y-1", className)}>
        {label && <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">{label}</label>}

        <div className="relative flex items-center gap-3">
          {!url ? (
            <label
              htmlFor="avatar"
              className="p-1 px-3 cursor-pointer bg-gray-100 ring-1 ring-gray-200 rounded-md text-sm"
            >
              Choose File
            </label>
          ) : (
            <>
              <img
                src={url}
                alt="Avatar"
                className="w-14 aspect-square object-cover rounded-full z-10"
              />
              <label
                htmlFor="avatar"
                className="absolute top-2/3 right-0 z-20"
              >
                <Icons.PencilIcon className="w-6 h-6 p-1 bg-white rounded-full shadow cursor-pointer" />
              </label>
            </>
          )}
        </div>

        <input id="avatar" type="file" {...props} hidden />
      </div>
    );
  }

  // PASSWORD INPUT
  if (type === "password") {
    return (
      <div className="relative">
        {label && <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>}
        <input
          type={showPassword ? "text" : "password"}
          className={clsx(inputClass, "pr-10")}
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

  // DEFAULT INPUT
  return (
    <div className="w-full">
      {label && <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>}
      <input type={type} className={inputClass} {...props} />
    </div>
  );
};

export default Input;
