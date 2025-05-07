import { PencilIcon } from "@heroicons/react/16/solid";
import clsx from "clsx";

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
              <PencilIcon className="w-6 h-6 cursor-pointer p-1 rounded-full" />
            </label>
          </>
        )}
        <input id="avatar" type={type} {...props} hidden />
      </div>
    );
  }
  return <input type={type} className={InputClass} {...props} />;
};

export default Input;
