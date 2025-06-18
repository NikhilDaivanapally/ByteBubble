import { formatTo12HourTime } from "../../../../utils/dateUtils";
import { MessageStatus } from "../../../MessageStatus";
import { GroupMessageProps } from "../../../../types";
import getSenderFromGroup from "../../../../utils/get-sender-from-group";
import { useSelector } from "react-redux";
import { group } from "../../../../utils/conversation-types";
import { RootState } from "../../../../store/store";
import { MessageActions } from "../../../ui/Dropdowns/actions/MessageActions";

export const GroupTextMsg = ({
  el,
  usersLength,
}: {
  el: GroupMessageProps;
  usersLength: number;
}) => {
  const sender = getSenderFromGroup(
    el,
    group,
    useSelector((s: RootState) => s.conversation.group_chat.GroupConversations)
  );
  const readUsers = el.readBy?.length ?? 0;
  const seen = usersLength > 0 && readUsers >= usersLength;
  const time = formatTo12HourTime(el.createdAt);

  return (
    <div
      className={`Text_msg relative w-fit flex group items-start ${
        !el.isIncoming ? "ml-auto" : ""
      }`}
    >
      {!el.isIncoming && <MessageActions message={el} />}
      {el.isIncoming && (
        <div className="user_profile mr-2 w-8 h-8 rounded-full bg-gray-400 overflow-hidden">
          <img
            className="w-full h-full object-cover"
            src={sender?.avatar}
            alt=""
          />
        </div>
      )}
      <div className="space-y-1">
        <div
          className={`px-2 py-1 rounded-xl ${
            !el.isIncoming
              ? "bg-gray-300 rounded-br-none"
              : "bg-white rounded-bl-none"
          }`}
        >
          <p className="userName text-sm text-black/60">
            {el.isIncoming ? sender?.userName : ""}
          </p>
          <p>{el.message?.text}</p>
        </div>
        <MessageStatus
          isIncoming={el.isIncoming}
          status={el.status}
          seen={seen}
          time={time}
        />
      </div>
    </div>
  );
};
