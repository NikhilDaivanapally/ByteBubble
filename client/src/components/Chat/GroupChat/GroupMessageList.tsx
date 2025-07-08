import { forwardRef } from "react";
import { GroupMessageProps } from "../../../types";
import { GroupImageMsg } from "./messages/ImageMsg";
import { GroupAudioMsg } from "./messages/AudioMsg";
import { GroupTextMsg } from "./messages/TextMsg";
import { GroupTimelineMsg } from "./messages/TimelineMsg";
import { GroupSystemMsg } from "./messages/SystemMsg";
import GroupDocumentMsg from "./messages/documentMsg";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { GroupLinkMsg } from "./messages/LinkMsg";

interface GroupMessageListProps {
  sortedDates: string[];
  groupedMessages: {
    [key: string]: GroupMessageProps[];
  };
  usersLength: number;
}

const GroupMessageList = forwardRef<HTMLElement, GroupMessageListProps>(
  ({ sortedDates, groupedMessages, usersLength }, ref) => {
    const currentConversation = useSelector(
      (state: RootState) =>
        state.conversation.group_chat.current_group_conversation
    );
    const groupName = currentConversation?.name ?? "group";
    return (
      <article
        aria-live="polite"
        className="flex-1 overflow-x-hidden mt-1 scrollbar-custom px-2 sm:px-4"
        ref={ref}
      >
        <ul className="space-y-2">
          {sortedDates.map((date) => (
            <li key={`${date}_GroupMsgs`} className="space-y-2">
              <GroupTimelineMsg date={date} />
              <ul className="space-y-2">
                {groupedMessages[date].map((el, index) => {
                  switch (el.messageType) {
                    case "text":
                      return (
                        <li key={index}>
                          <GroupTextMsg
                            el={el}
                            groupName={groupName}
                            usersLength={usersLength - 1}
                          />
                        </li>
                      );
                    case "image":
                      return (
                        <li key={index}>
                          <GroupImageMsg
                            el={el}
                            groupName={groupName}
                            usersLength={usersLength - 1}
                            scrollToBottom={() => {}}
                          />
                        </li>
                      );
                    case "audio":
                      return (
                        <li key={index}>
                          <GroupAudioMsg
                            el={el}
                            groupName={groupName}
                            usersLength={usersLength - 1}
                          />
                        </li>
                      );
                    case "document":
                      return (
                        <li key={index}>
                          <GroupDocumentMsg
                            el={el}
                            groupName={groupName}
                            scrollToBottom={() => {}}
                            usersLength={usersLength - 1}
                          />
                        </li>
                      );
                    case "link":
                      return (
                        <li key={index}>
                          <GroupLinkMsg
                            el={el}
                            groupName={groupName}
                            usersLength={usersLength - 1}
                          />
                        </li>
                      );
                    case "system":
                      return <GroupSystemMsg key={index} el={el} />;
                    default:
                      return <li key={index}>Invalid Message</li>;
                  }
                })}
              </ul>
            </li>
          ))}
        </ul>
      </article>
    );
  }
);

GroupMessageList.displayName = "GroupMessageList";
export default GroupMessageList;
