import clsx from "clsx";

type InputProps = {
  type?: "text" | "password" | "email"; // HTML Input types
  name?: string;
  className?: string;
  children: React.ReactNode;
};
const Input: React.FC<InputProps> = ({
  type = "text",
  name,
  className,
  children,
}) => {
  const baseStyles = "";
  const InputClass = clsx(baseStyles, className);
  return (
    <input type={type} name={name} className={InputClass}>
      {children}
    </input>
  );
};

export default Input;
