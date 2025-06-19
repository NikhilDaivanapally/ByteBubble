import { forwardRef } from "react";
import { DirectMessageProps } from "../../../types";
import { DirectTimelineMsg } from "./messages/TimelineMsg";
import { DirectImageMsg } from "./messages/ImageMsg";
import { DirectAudioMsg } from "./messages/AudioMsg";
import { DirectTextMsg } from "./messages/TextMsg";
import { DirectSystemMsg } from "./messages/SystemMsg";

interface DirectMessageListProps {
  sortedDates: string[];
  groupedMessages: {
    [key: string]: DirectMessageProps[];
  };
}

const DirectMessageList = forwardRef<HTMLUListElement, DirectMessageListProps>(
  ({ sortedDates, groupedMessages }, ref) => {
    return (
      <ul
        ref={ref}
        className="flex-1 overflow-x-hidden mt-1 scrollbar-custom px-2 sm:px-4 space-y-2"
      >
        {sortedDates.map((date) => (
          <div key={`${date}_DirectMsgs`} className="datewise_msgs space-y-2">
            <DirectTimelineMsg date={date} />
            {groupedMessages[date].map((el, index) => {
              switch (el.messageType) {
                case "image":
                  return (
                    <DirectImageMsg
                      el={el}
                      key={index}
                      scrollToBottom={() => {}}
                    />
                  );
                case "audio":
                  return <DirectAudioMsg el={el} key={index} />;
                case "system":
                  return <DirectSystemMsg key={index} el={el} />;
                default:
                  return <DirectTextMsg el={el} key={index} />;
              }
            })}
          </div>
        ))}
      </ul>
    );
  }
);

DirectMessageList.displayName = "DirectMessageList";
export default DirectMessageList;
