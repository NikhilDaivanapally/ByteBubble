// components/chat/MessageList.tsx
import { forwardRef } from "react";
import { DirectMessageProps, GroupMessageProps } from "../../types";
import { Timeline, MediaMsg, AudioMsg, TextMsg } from "../MessageTypes";

interface MessageListProps {
  sortedDates: string[];
  groupedMessages: {
    [key: string]: (DirectMessageProps | GroupMessageProps)[];
  };
}

const MessageList = forwardRef<HTMLUListElement, MessageListProps>(
  ({ sortedDates, groupedMessages }, ref) => {
    return (
      <ul
        ref={ref}
        className="flex-1 overflow-x-hidden mt-1 scrollbar-custom px-4 space-y-2"
      >
        {sortedDates.map((date) => (
          <div key={`${date}_Msgs`} className="datewise_msgs space-y-2">
            <Timeline date={date} />
            {groupedMessages[date].map((el, index) => {
              switch (el.messageType) {
                case "photo":
                  return <MediaMsg el={el} key={index} scrollToBottom={() => {}} />;
                case "audio":
                  return <AudioMsg el={el} key={index} />;
                default:
                  return <TextMsg el={el} key={index} />;
              }
            })}
          </div>
        ))}
      </ul>
    );
  }
);

MessageList.displayName = "MessageList";

export default MessageList;
