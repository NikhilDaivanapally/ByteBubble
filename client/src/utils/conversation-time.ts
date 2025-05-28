import formatTime from "./format-time";
import formatTime2 from "./format-time2";

const ConversationTime = (time: any) => {
  let Time;
  if (time) {
    let formattedTime = formatTime2(time);
    switch (formattedTime) {
      case "Today":
        const val = formatTime(time);
        Time = val.Time;
        break;
      case "Yesterday":
        Time = formattedTime;
        break;
      default:
        Time = new Date(formattedTime).toLocaleDateString();
        break;
    }
  }
  return Time ? Time : undefined;
};

export default ConversationTime;
