import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { DirectMessageProps, GroupMessageProps } from "../types";
import { individual } from "../utils/conversation-types";
import { Icons } from "../icons";
import { setMessageInfo } from "../store/slices/appSlice";
import { useDispatch } from "react-redux";
// import { ChevronDownIcon } from "@heroicons/react/24/solid"; // Adjust as per your icon setup

interface MessageDropdownProps {
  el: DirectMessageProps | GroupMessageProps;
}

export const MessageDropdown = ({ el }: MessageDropdownProps) => {
  const dispatch = useDispatch();
  const [showDropdown, setShowDropdown] = useState(false);
  const [positionAbove, setPositionAbove] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleCloseDropdown = () => {
    setShowDropdown(false);
  };

  const handleViewMessageInfo = () => {
    dispatch(setMessageInfo(el));
    handleCloseDropdown();
  };
  const handleReply = () => {
    // handleCloseDropdown();
  };
  const handleCopy = () => {
    // handleCloseDropdown();
  };
  const handleReact = () => {
    // handleCloseDropdown();
  };
  const handleDelete = () => {};
  const actions = useMemo(
    () =>
      el.conversationType == individual
        ? [
            {
              name: "Reply",
              className: "",
              icon: <Icons.ArrowUturnLeftIcon className="w-4" />,
              action: handleReply,
            },
            {
              name: "Copy",
              className: "",
              icon: (
                <Icons.ClipboardIcon className="w-4 fill-transparent stroke-1 stroke-black" />
              ),
              action: handleCopy,
            },
            {
              name: "React",
              className: "",
              icon: <Icons.SmileIcon className="text-lg" />,
              action: handleReact,
            },
            {
              name: "Delete",
              className: "text-red-600",
              icon: <Icons.DeleteIcon className="text-lg text-red-600" />,
              action: handleDelete,
            },
          ]
        : [
            {
              name: "Message info",
              className: "",
              icon: <Icons.InformationCircleIcon className="w-4" />,
              action: handleViewMessageInfo,
            },
            {
              name: "Reply",
              className: "",
              icon: <Icons.ArrowUturnLeftIcon className="w-4" />,
              action: handleReply,
            },
            {
              name: "Copy",
              className: "",
              icon: (
                <Icons.ClipboardIcon className="w-4 fill-transparent stroke-1 stroke-black" />
              ),
              action: handleCopy,
            },
            {
              name: "React",
              className: "",
              icon: <Icons.SmileIcon className="text-lg" />,
              action: handleReact,
            },
            {
              name: "Delete",
              className: "text-red-600",
              icon: <Icons.DeleteIcon className="text-lg text-red-600" />,
              action: handleDelete,
            },
          ],
    [el]
  );

  // Calculate position
  useEffect(() => {
    if (showDropdown && containerRef.current && dropdownRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const dropdownHeight = dropdownRef.current.offsetHeight;
      const viewportHeight = window.innerHeight - 120;

      const spaceBelow = viewportHeight - containerRect.bottom;
      const spaceAbove = containerRect.top;

      setPositionAbove(
        spaceBelow < dropdownHeight && spaceAbove > dropdownHeight
      );
    }
  }, [showDropdown]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        handleCloseDropdown();
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        className="mr-2 opacity-0 group-hover:opacity-100 transition hover:bg-gray-100 rounded-full cursor-pointer"
        onClick={() => setShowDropdown((prev) => !prev)}
      >
        <Icons.ChevronDownIcon className="w-5" />
      </button>

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
            {/* <button
              className="w-full px-3 py-1 text-left hover:bg-gray-100 text-sm"
              onClick={() => {
                setShowDropdown(false);
                onReply();
              }}
            >
              Reply
            </button>
            <button
              className="w-full px-3 py-1 text-left hover:bg-gray-100 text-sm"
              onClick={() => {
                setShowDropdown(false);
                onDelete();
              }}
            >
              Delete
            </button> */}
            {actions.map(({ name, icon, className, action }, i: number) => {
              return (
                <button
                  key={i}
                  className={`w-full px-3 py-1 text-left whitespace-nowrap cursor-pointer hover:bg-gray-400/40 text-sm flex items-center gap-x-2 rounded-md ${className}`}
                  onClick={action}
                >
                  {icon}
                  {name}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
