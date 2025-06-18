import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Icons } from "../../../icons";

type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const Dialog = ({ children, isOpen, onClose }: DialogProps) => {
  // Handle escape key to close dialog
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // if (!isOpen) return null;
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1], // smooth cubic-bezier ease
          }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-6 m-4"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ duration: 0.25, ease: [0.25, 0.8, 0.25, 1] }}
          >
            <div className="w-fit ml-auto">
              <button
                onClick={onClose}
                className="rounded-full cursor-pointer hover:bg-gray-100 p-1"
                aria-label="Close"
              >
                <Icons.XMarkIcon className="w-6" />
              </button>
            </div>

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Dialog;
