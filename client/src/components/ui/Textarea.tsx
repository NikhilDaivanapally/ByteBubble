import clsx from "clsx";
import React from "react";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  className?: string;
};

const Textarea: React.FC<TextareaProps> = ({ label, className, ...props }) => {
  const baseStyles =
    "w-full p-2.5 border sm:text-sm border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-btn-primary transition resize-none";
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea className={clsx(baseStyles, className)} {...props} />
    </div>
  );
};

export default Textarea;
