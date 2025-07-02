import { GroupMessageProps } from "../../../../types";
import { formatTo12HourTime } from "../../../../utils/dateUtils";
import { Icons } from "../../../../icons";
import { useEffect, useMemo, useState } from "react";
import { setPdfPreview } from "../../../../store/slices/conversation";
import { useDispatch } from "react-redux";
import { GroupMessageActions } from "../../../ui/Dropdowns/actions/GroupMessageActions";
import Loader from "../../../ui/Loader";
import { formatBytes, truncateFilename } from "../../../../utils/fileUtils";
import { useFileIcon } from "../../../../hooks/use-fileicon";
import { useGetFileQuery } from "../../../../store/slices/api";
import { MessageStatus } from "../../../MessageStatus";

const GroupDocumentMsg = ({
  el,
  groupName,
  scrollToBottom,
  usersLength,
}: {
  el: GroupMessageProps;
  groupName: string;
  scrollToBottom: () => void;
  usersLength: number;
}) => {
  const dispatch = useDispatch();
  const isPending = el.status === "pending";
  const fileId = el.message?.fileId;
  const fileName = el?.message?.fileName || "document";
  const time = formatTo12HourTime(el?.createdAt);
  const isOutgoing = !el?.isIncoming;
  const readUsers = el.readBy?.length ?? 0;
  const seen = usersLength > 0 && readUsers >= usersLength;
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

  // Create blob URL
  useEffect(() => {
    if (isPending) {
      setObjectUrl(el?.message?.pdfPreviewUrl || null);
    } else if (fileBlob instanceof Blob) {
      const url = URL.createObjectURL(fileBlob);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [fileBlob, isPending]);

  const isPdf = fileExt === "pdf";

  if (isPdf) {
    return (
      <div
        className={`Media_msg relative w-fit flex group items-start ${
          isOutgoing ? "ml-auto" : ""
        }`}
      >
        {isOutgoing && <GroupMessageActions message={el} />}
        {el.isIncoming && (
          <div className="user_profile mr-2 w-8 h-8 rounded-full bg-gray-400 overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src={el.from?.avatar}
              alt=""
            />
          </div>
        )}

        <section
          className="rounded-xl space-y-1"
          aria-label={`Message in ${groupName} from ${el.from?.userName} at ${time}`}
        >
          {/* Header & Message content */}
          <div
            className={`Media_Container p-1 relative border shadow rounded-lg ${
              isOutgoing
                ? "bg-gray-300 rounded-br-none border-transparent shadow-gray-400"
                : "bg-white rounded-bl-none border-gray-200"
            }`}
          >
            {/* header */}
            <header>
              {el.isIncoming && (
                <p className="userName text-black/60 text-sm px-1 py-0.5">
                  {el.from?.userName}
                </p>
              )}
            </header>

            {/* Message content */}
            <div className="cursor-pointer relative w-70 h-42">
              {/* Only preview for PDF */}
              {isPdf && el?.message?.previewUrl && (
                <div
                  className="h-full w-full overflow-hidden rounded-lg"
                  onClick={() => dispatch(setPdfPreview(el))}
                >
                  <img
                    className="h-full w-[150%] object-cover rounded-lg"
                    src={el?.message?.previewUrl}
                    alt={fileName}
                    onLoad={scrollToBottom}
                    style={{
                      userSelect: "none",
                      transform: "translateX(-47%) scale(1.5)",
                      transformOrigin: "top left",
                      transition: "transform 0.3s ease",
                    }}
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
            seen={seen}
            time={time}
          />
        </section>
      </div>
    );
  }

  return (
    <div
      className={`Media_msg relative w-fit flex group items-start ${
        isOutgoing ? "ml-auto" : ""
      }`}
    >
      {isOutgoing && <GroupMessageActions message={el} />}
      {el.isIncoming && (
        <div className="user_profile mr-2 w-8 h-8 rounded-full bg-gray-400 overflow-hidden">
          <img
            className="w-full h-full object-cover"
            src={el.from?.avatar}
            alt=""
          />
        </div>
      )}

      <div className="rounded-xl space-y-1">
        <div
          className={`Media_Container p-2 relative border shadow rounded-lg ${
            isOutgoing
              ? "bg-gray-300 rounded-br-none border-transparent shadow-gray-400"
              : "bg-white rounded-bl-none border-gray-200"
          }`}
        >
          {el.isIncoming && (
            <p className="userName text-black/60 text-sm py-0.5">
              {el.from?.userName}
            </p>
          )}
          <div className="cursor-pointer relative w-68 h-fit">
            <div className="flex gap-2 items-center w-full">
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
          seen={seen}
          time={time}
        />
      </div>
    </div>
  );
};

export default GroupDocumentMsg;
