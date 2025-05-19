import clsx from "clsx";
import { useState } from "react";
import { Icons } from "../../icons";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
  url?: string | null;
};
const Input: React.FC<InputProps> = ({
  type = "text",
  className,
  url,
  ...props
}) => {
  // show hide password
  const [showpassword, setShowpassword] = useState(false);

  const baseStyles =
    "w-full p-3 border rounded-md outline-none focus:ring-1 focus:ring-btn-primary transition";

  const InputClass = clsx(baseStyles, className);

  if (type == "file") {
    return (
      <div className={className}>
        <label>Avatar</label>
        {!url ? (
          <label
            htmlFor="avatar"
            className="p-1 px-2 cursor-pointer bg-gray-100 ring-1 ring-gray-200 rounded-md"
          >
            Choose File
          </label>
        ) : (
          <>
            <img
              src={url}
              className="w-14 aspect-square object-cover rounded-full z-5"
            />
            <label htmlFor="avatar" className="absolute top-2/3 right-0 z-1">
              <Icons.PencilIcon className="w-6 h-6 cursor-pointer p-1 rounded-full" />
            </label>
          </>
        )}
        <input id="avatar" type={type} {...props} hidden />
      </div>
    );
  } else if (type == "password") {
    return (
      <div className="relative">
        {!showpassword ? (
          <input
            type={type}
            className={InputClass + " " + "pr-12"}
            {...props}
          />
        ) : (
          <input
            type={"text"}
            className={InputClass + " " + "pr-12"}
            {...props}
          />
        )}
        <div onClick={() => setShowpassword((prev) => !prev)}>
          {!showpassword ? (
            <Icons.EyeIcon className="w-5 absolute top-1/2 right-2 -translate-1/2 cursor-pointer select-none" />
          ) : (
            <Icons.EyeSlashIcon className="w-5 absolute top-1/2 right-2 -translate-1/2 cursor-pointer select-none" />
          )}
        </div>
      </div>
    );
  }
  return <input type={type} className={InputClass} {...props} />;
};

export default Input;
