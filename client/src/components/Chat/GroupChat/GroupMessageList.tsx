import { forwardRef } from "react";
import { GroupMessageProps } from "../../../types";
import { GroupImageMsg } from "./messages/ImageMsg";
import { GroupAudioMsg } from "./messages/AudioMsg";
import { GroupTextMsg } from "./messages/TextMsg";
import { GroupTimelineMsg } from "./messages/TimelineMsg";
import { GroupSystemMsg } from "./messages/SystemMsg";

interface GroupMessageListProps {
  sortedDates: string[];
  groupedMessages: {
    [key: string]: GroupMessageProps[];
  };
  usersLength: number;
}

const GroupMessageList = forwardRef<HTMLUListElement, GroupMessageListProps>(
  ({ sortedDates, groupedMessages, usersLength }, ref) => {
    return (
      <ul
        ref={ref}
        className="flex-1 overflow-x-hidden mt-1 scrollbar-custom px-2 sm:px-4 space-y-2"
      >
        {sortedDates.map((date) => (
          <div key={`${date}_GroupMsgs`} className="datewise_msgs space-y-2">
            <GroupTimelineMsg date={date} />
            {groupedMessages[date].map((el, index) => {
              switch (el.messageType) {
                case "image":
                  return (
                    <GroupImageMsg
                      el={el}
                      key={index}
                      usersLength={usersLength - 1}
                      scrollToBottom={() => {}}
                    />
                  );
                case "audio":
                  return (
                    <GroupAudioMsg
                      el={el}
                      key={index}
                      usersLength={usersLength - 1}
                    />
                  );
                case "system":
                  return <GroupSystemMsg key={index} el={el} />;
                default:
                  return (
                    <GroupTextMsg
                      el={el}
                      key={index}
                      usersLength={usersLength - 1}
                    />
                  );
              }
            })}
          </div>
        ))}
      </ul>
    );
  }
);

GroupMessageList.displayName = "GroupMessageList";
export default GroupMessageList;
