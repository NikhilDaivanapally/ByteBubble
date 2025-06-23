import { ReactNode } from "react";
import { Icons } from "../icons";
import { DirectMessage, GroupMessage } from "../types";

type FormattedMessage = {
  message: ReactNode;
};

const getFormattedMessage = (
  msg: DirectMessage | GroupMessage
): FormattedMessage => {
  let message: ReactNode = null;

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
