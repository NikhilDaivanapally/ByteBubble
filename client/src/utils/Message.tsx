import { ReactNode } from "react";
import { Icons } from "../icons";
import { DirectMessage, GroupMessage } from "../types";
import pdfIcon from "../assets/pdf.png";
import docIcon from "../assets/doc.png";
import csvIcon from "../assets/csv.png";
import xlsIcon from "../assets/xls.png";
import zipIcon from "../assets/zip-folder.png";
import fileIcon from "../assets/file.png";

type FormattedMessage = {
  message: ReactNode;
};

const getFormattedMessage = (
  msg: DirectMessage | GroupMessage
): FormattedMessage => {
  let message: ReactNode = null;
  let FileIcon = "";
  if (msg?.messageType === "document" && msg?.message?.fileName) {
    const parts = msg.message.fileName?.split(".");
    const fileExt = parts?.length > 1 ? parts.pop()?.toLowerCase() : "";
    switch (fileExt) {
      case "pdf":
        FileIcon = pdfIcon;
        break;
      case "doc":
      case "docx":
        FileIcon = docIcon;
        break;

      case "xls":
      case "xlsx":
        FileIcon = xlsIcon;
        break;

      case "csv":
        FileIcon = csvIcon;
        break;

      case "zip":
        FileIcon = zipIcon;
        break;

      default:
        FileIcon = fileIcon;
    }
  }

  switch (msg?.messageType) {
    case "image":
      message = (
        <div className="flex items-center gap-1 overflow-hidden whitespace-nowrap text-ellipsis">
          <Icons.CameraIconSecondary className="shrink-0 leading-0" />
          <span className="overflow-hidden whitespace-nowrap text-ellipsis block">
            {msg?.message?.description || "Photo"}
          </span>
        </div>
      );
      break;
    case "audio":
      message = (
        <div className="flex-center gap-1">
          <Icons.MicSecondary />
          <span>Audio</span>
        </div>
      );
      break;
    case "document":
      message = (
        <div className="flex items-center gap-1 overflow-hidden whitespace-nowrap text-ellipsis">
          <img src={FileIcon} alt="icon" className="w-5 h-5 shrink-0" />
          <span className="overflow-hidden whitespace-nowrap text-ellipsis block">
            {msg?.message?.fileName || "document"}
          </span>
        </div>
      );
      break;
    case "text":
    case "link":
      message = msg?.message?.text || "";
      break;

    case "system":
      message = msg?.systemEventType;
      break;
    default:
      message = null;
  }

  return { message };
};

export default getFormattedMessage;
