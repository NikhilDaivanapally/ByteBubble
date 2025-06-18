import React from "react";
import clsx from "clsx";
import { Icons } from "../../icons";
import { direct } from "../../utils/conversation-types";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
type FallBackType = string | null;

const sizeStyles = {
  xs: "w-6 h-6",
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};
const fallBackStyle = {
  xs: "w-4 h-4",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
};
type AvatarProps = {
  url: string | undefined | null;
  size?: AvatarSize;
  online?: boolean;
  className?: string;
  fallBackType?: FallBackType;
};

export const Avatar: React.FC<AvatarProps> = ({
  url,
  size = "md",
  online = false,
  className = "",
  fallBackType = { direct },
}) => {
  const FallbackIcon =
    fallBackType == direct ? Icons.UserIcon : Icons.UsersIcon;

  return (
    <div
      className={clsx(
        "relative flex-center shrink-0",
        {
          "border border-gray-300 rounded-full": !url, // Apply border only if url is falsy
        },
        sizeStyles[size],
        className
      )}
    >
      {url ? (
        <img
          src={url}
          alt="avatar"
          className="rounded-full object-cover w-full h-full border border-gray-300"
        />
      ) : (
        <FallbackIcon className={fallBackStyle[size]} />
      )}
      {fallBackType == direct && online && (
        <span
          className={clsx(
            "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-transparent",
            "bg-green-500"
          )}
        />
      )}
    </div>
  );
};
