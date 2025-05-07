import clsx from "clsx";
import { Link } from "react-router";

type ButtonProps = {
  kind?: "primary" | "primary_outline" | "secondary" | "secondary_outline";
  type?: "button" | "submit" | "reset"; // HTML button types
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
};

const Button: React.FC<ButtonProps> = ({
  kind = "primary",
  type = "button",
  className,
  children,
  onClick,
  href,
}) => {
  const baseStyles = "cursor-pointer";
  const kindStyles = {
    primary:
      "px-4 py-2 rounded-full flex-center gap-2 bg-btn-primary hover:bg-btn-primary/90 text-white text-sm font-semibold",
    primary_outline:
      "px-4 py-2 rounded-full flex-center gap-2 border border-btn-primary hover:bg-btn-primary/20 text-sm font-semibold",
    secondary:
      "p-3 rounded-md flex-center gap-2 bg-btn-primary hover:bg-btn-primary/90 text-white",
    secondary_outline:
      "p-3 rounded-md flex-center gap-2 border border-btn-primary hover:bg-btn-primary/20",
  };

  const buttonClass = clsx(baseStyles, kindStyles[kind], className);

  if (href) {
    return (
      <Link to={href}>
        <button type={type} className={buttonClass} onClick={onClick}>
          {children}
        </button>
      </Link>
    );
  }

  return (
    <button type={type} className={buttonClass} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
