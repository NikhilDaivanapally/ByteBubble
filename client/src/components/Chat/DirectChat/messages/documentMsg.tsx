import { DirectMessageProps } from "../../../../types";
import { formatTo12HourTime } from "../../../../utils/dateUtils";
import { DirectMessageActions } from "../../../ui/Dropdowns/actions/DirectMessageActions";
import { Icons } from "../../../../icons";
import { useEffect, useMemo, useState } from "react";
import { setPdfPreview } from "../../../../store/slices/conversation";
import { useDispatch } from "react-redux";
import Loader from "../../../ui/Loader";
import { useFileIcon } from "../../../../hooks/use-fileicon";
import { formatBytes, truncateFilename } from "../../../../utils/fileUtils";
import { useGetFileQuery } from "../../../../store/slices/api";
import { MessageStatus } from "../../../MessageStatus";
const DirectDocumentMsg = ({
  el,
  from,
  scrollToBottom,
}: {
  el: DirectMessageProps;
  from: string;
  scrollToBottom: () => void;
}) => {
  const dispatch = useDispatch();
  const isPending = el.status === "pending";
  const fileId = el.message?.fileId;
  const fileName = el?.message?.fileName || "document";
  const time = formatTo12HourTime(el?.createdAt);
  const isOutgoing = !el?.isIncoming;
  const fileSizeReadable = formatBytes(el?.message?.size || 0);
  const shortName = truncateFilename(fileName, 50); // you can adjust 50 to your need
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  const { data: fileBlob } = useGetFileQuery(fileId!, {
    skip: isPending || !fileId,
  });

  // Get file extension
  const fileExt = useMemo(() => {
    const parts = fileName.split(".");
    return parts.length > 1 ? parts.pop()?.toLowerCase() : "";
  }, [fileName]);

  // Determine file icon
  const { FileIcon } = useFileIcon(fileExt);

  useEffect(() => {
    if (isPending) {
      setObjectUrl(el?.message?.pdfPreviewUrl || null); // temp pdf preview url (replaced when status === "sent")
    } else if (fileBlob instanceof Blob) {
      const url = URL.createObjectURL(fileBlob);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url); // Cleanup on unmount
    }
  }, [fileBlob, isPending]);

  const isPdf = fileExt === "pdf";
  if (isPdf) {
    return (
      <div
        className={`Media_msg relative w-fit max-w-[90%] sm:max-w-[80%] lg:max-w-[60%]  flex gap-1.5 group items-start ${
          isOutgoing ? "ml-auto" : ""
        }`}
      >
        {isOutgoing && <DirectMessageActions message={el} />}

        <section
          aria-label={`Message from ${from} at ${time}`}
          className="rounded-xl space-y-1"
        >
          {/* Message content */}
          <div
            className={`Media_Container p-1 relative border shadow rounded-lg ${
              isOutgoing
                ? "bg-gray-300 rounded-br-none border-transparent shadow-gray-400"
                : "bg-white rounded-bl-none border-gray-200"
            }`}
          >
            <div className="cursor-pointer relative h-36 md:h-40 lg:h-50 aspect-video">
              {/* Only preview for PDF */}
              {isPdf && el?.message?.previewUrl && (
                <div
                  className="h-full w-full overflow-hidden rounded-lg"
                  onClick={() => dispatch(setPdfPreview(el))}
                >
                  <img
                    className="h-full w-full object-contain origin-top scale-250 rounded-lg"
                    src={el?.message?.previewUrl}
                    alt={fileName}
                    onLoad={scrollToBottom}
                  />
                </div>
              )}

              {/* File Info Overlay */}
              <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-xs p-2 rounded-b-lg">
                <div className="flex gap-2 items-center w-full">
                  <img src={FileIcon} alt="icon" className="w-5 h-5 shrink-0" />
                  <div className="flex flex-col gap-0.5 w-full wrap-anywhere whitespace-normal">
                    <p className="text-sm font-medium leading-tight">
                      {shortName}
                    </p>
                    <div className="flex gap-3 text-xs opacity-80 flex-wrap">
                      <p>{fileExt?.toUpperCase()}</p>
                      <p>{fileSizeReadable}</p>
                    </div>
                  </div>
                  {!objectUrl ? (
                    <Loader />
                  ) : (
                    <a
                      href={objectUrl}
                      download={fileName}
                      className="download-btn inline-flex items-center"
                    >
                      <Icons.ArrowDownTrayIcon className="w-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* footer */}
          <MessageStatus
            isIncoming={el.isIncoming}
            status={el.status}
            isRead={el.isRead}
            time={time}
          />
        </section>
      </div>
    );
  }

  return (
    <div
      className={`Media_msg relative w-fit flex gap-1.5 group items-start ${
        isOutgoing ? "ml-auto" : ""
      }`}
    >
      {isOutgoing && <DirectMessageActions message={el} />}

      <section className="rounded-xl space-y-1">
        {/* Message content */}
        <div
          className={`Media_Container p-1 relative border shadow rounded-lg ${
            isOutgoing
              ? "bg-gray-300 rounded-br-none border-transparent shadow-gray-400"
              : "bg-white rounded-bl-none border-gray-200"
          }`}
        >
          <div className="cursor-pointer relative w-68 h-12">
            <div className="flex gap-2 items-center w-full h-full">
              <img src={FileIcon} alt="icon" className="size-10 shrink-0" />
              <div className="flex flex-col gap-0.5 w-full wrap-anywhere whitespace-normal">
                <p className="text-sm font-medium leading-tight">{shortName}</p>
                <div className="flex gap-3 text-xs opacity-80 flex-wrap">
                  <p>{fileExt?.toUpperCase()}</p>
                  <p>{fileSizeReadable}</p>
                </div>
              </div>
              {!objectUrl ? (
                <Loader />
              ) : (
                <a
                  href={objectUrl}
                  download={fileName}
                  className="download-btn inline-flex items-center"
                >
                  <Icons.ArrowDownTrayIcon className="w-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* footer */}
        <MessageStatus
          isIncoming={el.isIncoming}
          status={el.status}
          isRead={el.isRead}
          time={time}
        />
      </section>
    </div>
  );
};

export default DirectDocumentMsg;
