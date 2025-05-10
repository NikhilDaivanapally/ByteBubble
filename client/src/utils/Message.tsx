import { IoMic } from "react-icons/io5";
import { MdOutlineCameraAlt } from "react-icons/md";

const Message = (msg: any) => {
  let message;
  switch (msg?.type) {
    case "photo":
      message = (
        <div className="flex-center gap-1">
          <MdOutlineCameraAlt />
          <>{msg?.message?.description ? msg?.message?.description : "Photo"}</>
        </div>
      );
      break;
    case "audio":
      message = (
        <div className="flex-center gap-1">
          <IoMic />
          <span>Audio</span>
        </div>
      );
      break;
    case "text":
      message = msg?.message?.text;
      break;
    case "link":
      message = msg?.message?.text;

    default:
      break;
  }
  return { message };
};

export default Message;
