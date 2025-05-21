import { Icons } from "../icons";

const Message = (msg: any) => {
  let message;
  switch (msg?.type) {
    case "photo":
      message = (
        <div className="flex items-center gap-1 overflow-hidden whitespace-nowrap text-ellipsis">
          <Icons.CameraIconSecondary className="shrink-0 leading-0" />
          <span className="overflow-hidden whitespace-nowrap text-ellipsis block">
            {msg?.message?.description ? msg?.message?.description : "Photo"}
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
      message = msg?.message?.text;
      break;
    case "link":
      message = msg?.message?.text;
      break;
    default:
      break;
  }
  return { message };
};

export default Message;
