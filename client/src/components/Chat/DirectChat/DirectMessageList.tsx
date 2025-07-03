import { forwardRef } from "react";
import { DirectMessageProps } from "../../../types";
import { DirectTimelineMsg } from "./messages/TimelineMsg";
import { DirectImageMsg } from "./messages/ImageMsg";
import { DirectAudioMsg } from "./messages/AudioMsg";
import { DirectTextMsg } from "./messages/TextMsg";
import { DirectSystemMsg } from "./messages/SystemMsg";
import DirectDocumentMsg from "./messages/documentMsg";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";

interface DirectMessageListProps {
  sortedDates: string[];
  groupedMessages: {
    [key: string]: DirectMessageProps[];
  };
}

const DirectMessageList = forwardRef<HTMLElement, DirectMessageListProps>(
  ({ sortedDates, groupedMessages }, ref) => {
    const currentConversation = useSelector(
      (state: RootState) =>
        state.conversation.direct_chat.current_direct_conversation
    );
    const from = currentConversation?.name ?? "user";
    return (
      <article
        aria-live="polite"
        className="flex-1 overflow-x-hidden mt-1 scrollbar-custom px-2 sm:px-4"
        ref={ref}
      >
        <ul className="space-y-2">
          {sortedDates.map((date) => (
            <li key={`${date}_DirectMsgs`} className="space-y-2">
              <DirectTimelineMsg date={date} />
              <ul className="space-y-2">
                {groupedMessages[date].map((el, index) => {
                  switch (el.messageType) {
                    case "text":
                      return (
                        <li key={index}>
                          <DirectTextMsg el={el} from={from} />
                        </li>
                      );
                    case "image":
                      return (
                        <li key={index}>
                          <DirectImageMsg
                            el={el}
                            from={from}
                            scrollToBottom={() => {}}
                          />
                        </li>
                      );
                    case "audio":
                      return (
                        <li key={index}>
                          <DirectAudioMsg from={from} el={el} />
                        </li>
                      );

                    case "document":
                      return (
                        <li key={index}>
                          <DirectDocumentMsg
                            el={el}
                            from={from}
                            scrollToBottom={() => {}}
                          />
                        </li>
                      );
                    case "system":
                      return (
                        <li key={index}>
                          <DirectSystemMsg el={el} />
                        </li>
                      );
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

DirectMessageList.displayName = "DirectMessageList";
export default DirectMessageList;
