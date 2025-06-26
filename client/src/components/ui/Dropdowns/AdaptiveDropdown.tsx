import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, ReactNode } from "react";
import useClickOutside from "../../../hooks/use-clickoutside";

interface DropdownAction {
  name: string;
  icon?: ReactNode;
  className?: string;
  action: () => void;
}

interface AdaptiveDropdownProps {
  children: ReactNode;
  actions: DropdownAction[];
  className: string;
}

export const AdaptiveDropdown = ({
  className = "",
  children,
  actions,
}: AdaptiveDropdownProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [positionAbove, setPositionAbove] = useState(false);

  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setShowDropdown((prev) => !prev);
  const closeDropdown = () => setShowDropdown(false);

  // Smart positioning
  useEffect(() => {
    if (showDropdown && triggerRef.current && dropdownRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const dropdownHeight = dropdownRef.current.offsetHeight;
      const viewportHeight = window.innerHeight - 120;

      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;

      setPositionAbove(
        spaceBelow < dropdownHeight && spaceAbove > dropdownHeight
      );
    }
  }, [showDropdown]);

  useClickOutside(
    [triggerRef, dropdownRef],
    () => {
      closeDropdown();
    },
    { closeOnEscape: true }
  );

  return (
    <div className={`relative inline-block ${className}`} ref={triggerRef}>
      <div
        onClick={toggleDropdown}
        className="mr-2 opacity-0 group-hover:opacity-100 transition hover:bg-gray-100 rounded-full cursor-pointer"
      >
        {children}
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={dropdownRef}
            style={{
              transformOrigin: positionAbove ? "bottom right" : "top right",
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ ease: "easeInOut", duration: 0.1 }}
            className={`absolute z-50 min-w-32 p-1.5 bg-white shadow-md rounded-md ${
              positionAbove ? "bottom-full mb-2" : "top-full mt-2"
            } right-0 space-y-1`}
          >
            {actions.map(({ name, icon, className = "", action }, index) => (
              <button
                key={index}
                className={`w-full px-3 py-1 text-left cursor-pointer whitespace-nowrap hover:bg-gray-100 text-sm flex items-center gap-x-2 rounded-md ${className}`}
                onClick={() => {
                  action();
                  closeDropdown();
                }}
              >
                {icon}
                {name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
