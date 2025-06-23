import React from "react";
import { clsx } from "clsx";

type ButtonSize = "sm" | "md" | "lg";
type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "danger-outline"
  | "success"
  | "success-outline"
  | "warning"
  | "info"
  | "link";
type ButtonShape = "md" | "full" | "square" | "pill";

interface BaseButtonProps {
  size?: ButtonSize;
  variant?: ButtonVariant;
  shape?: ButtonShape;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  className?: string;
  children?: React.ReactNode;
}

type ButtonAsButton = BaseButtonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLink = BaseButtonProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-5 py-3 text-lg",
};

const shapeStyles: Record<ButtonShape, string> = {
  md: "rounded-md",
  full: "rounded-full",
  square: "rounded-none",
  pill: "rounded-3xl",
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-btn-primary text-white hover:bg-btn-primary/90 focus-visible:ring-btn-primary",
  secondary: "bg-gray-600 text-white hover:bg-gray-700",
  outline:
    "border border-btn-primary  hover:bg-btn-primary/20 focus-visible:ring-btn-primary",
  ghost: "text-gray-700 bg-gray-100 hover:bg-gray-200",
  danger: "bg-red-600 text-white hover:bg-red-700",
  "danger-outline": "border border-red-600 text-red-600 hover:bg-red-50",
  success: "bg-green-600 text-white hover:bg-green-700",
  "success-outline": "border border-green-600 text-green-600 hover:bg-green-50",
  warning: "bg-yellow-500 text-black hover:bg-yellow-600",
  info: "bg-sky-500 text-white hover:bg-sky-600",
  link: "text-blue-600 underline hover:text-blue-800 p-0 h-auto",
};

export const Button: React.FC<ButtonProps> = ({
  size = "md",
  variant = "primary",
  shape = "md",
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = "left",
  className,
  children,
  ...props
}) => {
  const isIconOnly = !children && !!icon;

  const baseClass = clsx(
    "inline-flex cursor-pointer items-center justify-center font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
    sizeStyles[size],
    shapeStyles[shape],
    variantStyles[variant],
    fullWidth && "w-full",
    isIconOnly && "p-2 aspect-square",
    className
  );

  const loadingSpinner = (
    <svg
      className={clsx(
        "animate-spin h-4 w-4",
        children && iconPosition === "left" && "mr-2",
        children && iconPosition === "right" && "ml-2"
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  );

  const renderContent = () => (
    <>
      {loading && loadingSpinner}

      {!loading && icon && iconPosition === "left" && children && (
        <span className="mr-2">{icon}</span>
      )}

      {children}

      {!loading && icon && iconPosition === "right" && children && (
        <span className="ml-2">{icon}</span>
      )}

      {!children && icon && !loading && <>{icon}</>}
    </>
  );

  if ("href" in props && props.href) {
    const { href, ...rest } = props;
    return (
      <a href={href} className={baseClass} {...rest}>
        {renderContent()}
      </a>
    );
  }
  const { disabled, ...buttonProps } =
    props as React.ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button
      className={baseClass}
      disabled={disabled || loading}
      {...buttonProps}
    >
      {renderContent()}
    </button>
  );
};
