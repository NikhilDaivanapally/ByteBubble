import { ReactNode } from "react";
import { Icons } from "../icons";
import { DirectMessage, GroupMessage, UserProps } from "../types";
import pdfIcon from "../assets/pdf.png";
import docIcon from "../assets/doc.png";
import csvIcon from "../assets/csv.png";
import xlsIcon from "../assets/xls.png";
import zipIcon from "../assets/zip-folder.png";
import fileIcon from "../assets/file.png";
import {
  DirectSystemEventType,
  GroupSystemEventType,
} from "../constants/system-event-types";

type FormattedMessage = {
  message: ReactNode;
};

export const getFormattedDirectMessage = (
  msg: DirectMessage,
  isOutgoing: boolean,
  name: string
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
      message = msg?.message?.text || "";
      break;

    case "link":
      message = (
        <p className="text-btn-primary underline">{msg?.message?.url}</p>
      );

      break;

    case "system":
      const fromName = isOutgoing ? "You" : name;
      const toName = !isOutgoing ? "you" : msg?.eventUserSnapshot?.userName;
      switch (msg.systemEventType) {
        case DirectSystemEventType.USER_BLOCKED:
          message = (
            <p>
              {fromName} Blocked {toName}
            </p>
          );
          break;
        case DirectSystemEventType.USER_UNBLOCKED:
          message = (
            <p>
              {fromName} Unblocked {toName}
            </p>
          );
          break;

        case DirectSystemEventType.MESSAGES_UNSENT:
          message = <p>Message unsent</p>;
          break;

        default:
          message = <p>System notification</p>;
          break;
      }
      break;
    default:
      message = null;
  }

  return { message };
};

export const getFormattedGroupMessage = (
  msg: GroupMessage,
  from: {
    _id: string;
    userName: string;
    avatar: string | undefined;
  },
  auth: UserProps | null,
  name: string
): FormattedMessage => {
  let message: ReactNode = null;
  let FileIcon = "";

  const fromName = from?._id === auth?._id ? "You" : from?.userName;

  const toName =
    msg.eventUserSnapshot?._id === auth?._id
      ? "You"
      : msg.eventUserSnapshot?.userName;

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
      message = msg?.message?.text || "";
      break;

    case "link":
      message = (
        <p className="text-btn-primary underline">{msg?.message?.url}</p>
      );

      break;

    case "system":
      switch (msg?.systemEventType) {
        case GroupSystemEventType.GROUP_CREATED:
          message = (
            <p>
              {from?._id == auth?._id
                ? `${fromName} created group ${name}`
                : `${fromName} added you`}
            </p>
          );
          break;
        case GroupSystemEventType.GROUP_RENAMED:
          message = (
            <p>
              {fromName} changed the group name to {name}
            </p>
          );
          break;
        case GroupSystemEventType.GROUP_ICON_CHANGED:
          message = <p>{fromName} changed the group's icon</p>;
          break;

        case GroupSystemEventType.GROUP_DESCRIPTION_UPDATED:
          message = <p>{fromName} changed the group description</p>;
          break;

        case GroupSystemEventType.ADMIN_ASSIGNED:
          message = (
            <p>
              {" "}
              {from?._id == auth?._id
                ? `${fromName} assigned ${toName} as admin`
                : `you're now an admin`}
            </p>
          );
          break;

        case GroupSystemEventType.ADMIN_REMOVED:
          message = (
            <p>
              {from?._id == auth?._id
                ? `${fromName} removed ${toName} from admin`
                : `you're no longer an admin`}
            </p>
          );
          break;

        case GroupSystemEventType.USER_ADDED:
          message = (
            <p>
              {fromName} added {toName}
            </p>
          );
          break;

        case GroupSystemEventType.USER_REMOVED:
          message = (
            <p>
              {fromName} removed {toName} from admin
            </p>
          );

          break;

        case GroupSystemEventType.USER_LEFT:
          message = <p>{fromName} left</p>;
          break;

        default:
          message = <p>System notification</p>;
          break;
      }
      break;
    default:
      message = null;
  }

  return { message };
};
