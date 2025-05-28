import { Toaster } from "react-hot-toast";
import { Icons } from "../icons";

const ToastConfig = () => {
  return (
    <Toaster
      gutter={-8}
      position="bottom-right"
      reverseOrder={false}
      toastOptions={{
        style: {
          fontSize: ".85rem",
          // fontfamily: "Poppins",
        },
        success: {
          duration: 2000,
          theme: {
            primary: "green",
            secondary: "black",
          },
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
