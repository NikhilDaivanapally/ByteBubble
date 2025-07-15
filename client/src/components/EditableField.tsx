import { Icons } from "../icons";
import { useState } from "react";

export const EditableField: React.FC<{
  value: string;
  name: string;
  isAdmin: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  placeholder?: string;
}> = ({ value, name, isAdmin, onChange, className = "", placeholder }) => {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <div
      className={`flex gap-3 ${className} border-b transition-colors duration-300 ${
        isEditing ? "border-gray-500" : "border-transparent"
      }`}
    >
      {!isEditing ? (
        <p>{value || placeholder}</p>
      ) : (
        <input
          type="text"
          name={name}
          value={value}
          autoFocus
          onChange={onChange}
          onBlur={() => setIsEditing(false)}
          className="outline-none w-full  caret-gray-500"
          placeholder={placeholder}
        />
      )}
      {isAdmin && (
        <button
          type="button"
          className="rounded-full p-1 cursor-pointer"
          onClick={() => setIsEditing(true)}
          aria-label={`Edit ${name}`}
        >
          <Icons.PencilIcon className="text-gray-500 w-4" />
        </button>
      )}
    </div>
  );
};
