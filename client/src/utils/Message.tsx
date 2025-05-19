import { Icons } from "../icons";

const Message = (msg: any) => {
  let message;
  switch (msg?.type) {
    case "photo":
      message = (
        <div className="flex-center gap-1">
          <Icons.CameraIconSecondary />
          <>{msg?.message?.description ? msg?.message?.description : "Photo"}</>
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
