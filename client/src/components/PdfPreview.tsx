import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { setPdfPreview } from "../store/slices/conversation";
import { useEffect, useState } from "react";
import { Icons } from "../icons";
import { motion, AnimatePresence } from "motion/react";
import { direct } from "../utils/conversation-types";
import { useGetFileQuery } from "../store/slices/apiSlice";

const PdfPreview = () => {
  const dispatch = useDispatch();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const { direct_chat, group_chat, pdfPreview } = useSelector(
    (state: RootState) => state.conversation
  );

  const { chatType } = useSelector((state: RootState) => state.app);

  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  const current_direct_conversation = direct_chat?.current_direct_conversation;
  const current_group_conversation = group_chat?.current_group_conversation;
  const handleClose = () => {
    dispatch(setPdfPreview(null));
  };

  const { data: fileBlob } = useGetFileQuery(pdfPreview?.message.fileId!, {
    skip: !pdfPreview,
  });

  useEffect(() => {
    if (fileBlob) {
      const url = URL.createObjectURL(fileBlob);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url); // Cleanup on unmount
    }
  }, [fileBlob, pdfPreview]);

  return (
    <>
      <AnimatePresence>
        {pdfPreview && (
          <motion.div
            layout
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed z-60 flex flex-col gap-4 w-full h-full px-4 md:px-12 py-4 bg-light"
          >
            {/* header */}
            <div className="flex items-center justify-between">
              <div className="flex-center  gap-4">
                {/* profile Image */}
                <div className="w-10 h-10  relative">
                  <img
                    className="w-full h-full rounded-full object-cover"
                    src={
                      chatType === direct
                        ? pdfPreview?.isOutgoing
                          ? authUser?.avatar
                          : current_direct_conversation?.avatar
                        : current_group_conversation?.avatar
                    }
                    alt=""
                  />
                  {true && (
                    <span className="w-2 h-2 absolute bottom-0 right-0 bg-green-600 rounded-full"></span>
                  )}
                </div>
                {/* profile Info */}
                <div className="">
                  <p className="font-semibold">
                    {chatType === direct
                      ? pdfPreview?.isOutgoing
                        ? "you"
                        : current_direct_conversation?.name
                      : pdfPreview?.isOutgoing
                      ? "you"
                      : current_group_conversation?.name}
                  </p>
                  <p className="text-sm text-black/60">
                    {new Date(pdfPreview?.createdAt!).toLocaleDateString()} at{" "}
                    {new Date(pdfPreview?.createdAt!).toLocaleString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true, // Use 12-hour clock and show AM/PM
                    })}
                  </p>
                </div>
                <div></div>
              </div>

              <Icons.XMarkIcon
                className="w-6 md:w-8 cursor-pointer"
                onClick={handleClose}
              />
            </div>
            {/* Image carousel */}
            <div
              className="flex-1 overflow-hidden flex-center relative"
              onClick={() => {}}
            >
              <iframe
                src={objectUrl || ""}
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PdfPreview;
