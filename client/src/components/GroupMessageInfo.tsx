import { motion, AnimatePresence } from "motion/react";
import { Icons } from "../icons";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { setMessageInfo } from "../store/slices/appSlice";

const GroupMessageInfo = () => {
  const dispatch = useDispatch();
  const { messageInfo } = useSelector((state: RootState) => state.app);
  console.log(messageInfo);
  const handleClose = () => {
    dispatch(setMessageInfo(null));
  };
  return (
    <AnimatePresence>
      {messageInfo && (
        <motion.div
          key="profile-panel"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="bg-white origin-right rounded-lg w-full xl:w-100 absolute top-0 right-0 z-10 md:relative h-full overflow-hidden flex-shrink-0 p-3.5"
        >
          <button onClick={handleClose}>
            <Icons.XMarkIcon className="w-8 p-1 rounded-full cursor-pointer hover:bg-gray-200 transition" />
          </button>

          <p>Read by</p>
          <ul></ul>
          <p>delivered to</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(GroupMessageInfo);
