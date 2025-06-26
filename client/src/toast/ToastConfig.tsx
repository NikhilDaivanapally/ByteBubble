import { Toaster } from "react-hot-toast";
import { Icons } from "../icons";

const ToastConfig = () => {
  return (
    <Toaster
      gutter={-8}
      position="top-center"
      reverseOrder={false}
      toastOptions={{
        style: {
          fontSize: ".85rem",
        },
        success: {
          duration: 2000,
          icon: (
            <Icons.CheckIcon
              style={{ color: "lightgreen", fontSize: "1.3rem", width: "20px" }}
            />
          ),
        },
        error: {
          icon: (
            <Icons.XMarkIcon
              style={{
                color: "lightpink",
                fontSize: "1.3rem",
                fontWeight: "600",
                width: "20px",
              }}
            />
          ),
          duration: 2000,
        },
      }}
    />
  );
};

export default ToastConfig;
